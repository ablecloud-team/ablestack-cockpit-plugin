#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Create a downloadable ABLESTACK security evidence package.

The command is intentionally service-free.  Cockpit invokes ``generate`` on
demand, and ``latest`` resolves the most recently completed ZIP so the same
package can be downloaded again from the configuration download dialog.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import textwrap
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


PLUGIN_ROOT = Path(__file__).resolve().parents[2]
COLLECTOR = Path(__file__).with_name("security_evidence.py")
DEFAULT_CLUSTER_JSON = PLUGIN_ROOT / "tools" / "properties" / "cluster.json"
DEFAULT_STORAGE_ROOT = Path("/var/lib/ablestack/security-evidence")
PACKAGE_TITLE = "ABLESTACK 보안 취약점 증적 자료"
PACKAGE_FILENAME = f"{PACKAGE_TITLE}.zip"
PPTX_FILENAME = f"{PACKAGE_TITLE}.pptx"
XLSX_FILENAME = f"{PACKAGE_TITLE}.xlsx"
LOG_FILENAME = f"{PACKAGE_TITLE}.txt"
LATEST_FILENAME = "latest.json"

ITEM_BEGIN_MARKERS = {"ABLESTACK ITEM BEGIN", "ABLESTACK 점검 항목 시작"}
ITEM_END_MARKERS = {"ABLESTACK ITEM END", "ABLESTACK 점검 항목 종료"}
HOST_BEGIN_MARKERS = {"ABLESTACK HOST BEGIN", "ABLESTACK 호스트 시작"}
HOST_END_MARKERS = {"ABLESTACK HOST END", "ABLESTACK 호스트 종료"}
OUTPUT_BEGIN_MARKERS = {"OUTPUT_BEGIN", "명령 결과 시작"}
OUTPUT_END_MARKERS = {"OUTPUT_END", "명령 결과 종료"}
OUTPUT_TRUNCATION_RE = re.compile(
    r"^\[결과 일부 생략 전체 행=\d+ 표시 행=\d+\]$"
)
PPT_MAX_FULL_OUTPUT_PAGES = 10
PPT_TXT_GUIDANCE = "전체 결과는 TXT 파일을 확인하세요."
FIELD_ALIASES = {
    "보고서 버전": "REPORT_VERSION",
    "생성 일시": "GENERATED_AT",
    "출력 파일": "OUTPUT_FILE",
    "카탈로그 버전": "CATALOG_VERSION",
    "카탈로그 출처": "CATALOG_SOURCE",
    "클러스터 유형": "CLUSTER_TYPE",
    "대상 그룹": "TARGET_GROUPS",
    "대상 수": "TARGET_COUNT",
    "점검 대상 목록": "TARGETS",
    "항목 수": "ITEM_COUNT",
    "점검 항목": "ITEMS",
    "접속 대상": "TARGET",
    "호스트명": "HOSTNAME",
    "IP 주소": "IP_ADDRESSES",
    "접속 대상 IPv4": "TARGET_IPV4",
    "운영체제": "OS",
    "커널": "KERNEL",
    "점검 일시": "COLLECTED_AT",
    "점검 사용자": "COLLECTED_BY",
    "수집기 버전": "COLLECTOR_VERSION",
    "항목 코드": "ITEM_CODE",
    "항목명": "ITEM_TITLE",
    "중요도": "IMPORTANCE",
    "판정": "GUIDE_STATUS",
    "안내": "GUIDE_NOTE",
    "예외처리": "EXCEPTION_REASON",
    "점검 내용": "CHECK_CONTENT",
    "조치 방법": "REMEDIATION",
    "수집 상태": "ITEM_STATUS",
    "명령 순번": "COMMAND_INDEX",
    "명령 설명": "COMMAND_LABEL",
    "종료 코드": "EXIT_CODE",
}


def canonical_field(key: str) -> str:
    return FIELD_ALIASES.get(key.strip(), key.strip())


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate = subparsers.add_parser("generate", help="collect and build ZIP")
    generate.add_argument("--storage-root", default=str(DEFAULT_STORAGE_ROOT))
    generate.add_argument("--cluster-json", default=str(DEFAULT_CLUSTER_JSON))
    generate.add_argument("--targets", nargs="+", default=["all"])
    generate.add_argument(
        "--host",
        action="append",
        default=[],
        help="explicit comma/space separated host list; may be repeated",
    )
    generate.add_argument("--items", default="all")
    generate.add_argument("--ssh-user", default="root")
    generate.add_argument(
        "--ssh-port",
        type=int,
        default=0,
        help="SSH port; 0 detects the current local sshd port",
    )
    generate.add_argument("--timeout", type=int, default=120)
    generate.add_argument("--max-output-lines", type=int, default=400)
    generate.add_argument(
        "--from-log",
        help="skip collection and generate reports from an existing evidence log",
    )

    latest = subparsers.add_parser("latest", help="return latest ZIP metadata")
    latest.add_argument("--storage-root", default=str(DEFAULT_STORAGE_ROOT))
    return parser.parse_args(argv)


def json_result(code: int, value: object) -> None:
    print(json.dumps({"code": code, "val": value}, ensure_ascii=False))


def parse_collector_summary(details: str) -> Dict[str, object]:
    try:
        parsed = json.loads(details)
        return parsed if isinstance(parsed, dict) else {}
    except (json.JSONDecodeError, TypeError):
        return {}


ANSI_ESCAPE_RE = re.compile(r"\x1B(?:\[[0-?]*[ -/]*[@-~]|[@-_])")


def xml_text(value: object) -> str:
    """Escape text and remove bytes that are illegal in XML 1.0/PPTX."""
    text = ANSI_ESCAPE_RE.sub("", str(value))
    text = "".join(
        character
        for character in text
        if character in "\t\n\r"
        or 0x20 <= ord(character) <= 0xD7FF
        or 0xE000 <= ord(character) <= 0xFFFD
        or 0x10000 <= ord(character) <= 0x10FFFF
    )
    return escape(text, quote=False)


def parse_evidence(path: Path) -> Tuple[Dict[str, str], List[Dict[str, object]]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    report: Dict[str, str] = {}
    items: List[Dict[str, object]] = []
    host_metadata: Dict[str, Dict[str, str]] = {}

    for line in lines:
        if line in ITEM_BEGIN_MARKERS:
            break
        if ": " in line:
            key, value = line.split(": ", 1)
            report[canonical_field(key)] = value.strip()

    index = 0
    while index < len(lines):
        if lines[index] not in HOST_BEGIN_MARKERS:
            index += 1
            continue
        host_fields: Dict[str, str] = {}
        index += 1
        while index < len(lines) and lines[index] not in HOST_END_MARKERS:
            if ": " in lines[index]:
                key, value = lines[index].split(": ", 1)
                host_fields[canonical_field(key)] = value.strip()
            index += 1
        for host_key in (host_fields.get("HOSTNAME"), host_fields.get("TARGET")):
            if host_key:
                host_metadata[host_key] = host_fields
        index += 1

    index = 0
    while index < len(lines):
        if lines[index] not in ITEM_BEGIN_MARKERS:
            index += 1
            continue
        block = [lines[index]]
        index += 1
        while index < len(lines):
            block.append(lines[index])
            if lines[index] in ITEM_END_MARKERS:
                break
            index += 1
        fields: Dict[str, str] = {}
        for line in block:
            if ": " in line:
                key, value = line.split(": ", 1)
                key = canonical_field(key)
                if key in {
                    "ITEM_CODE",
                    "ITEM_TITLE",
                    "IMPORTANCE",
                    "GUIDE_STATUS",
                    "GUIDE_NOTE",
                    "EXCEPTION_REASON",
                    "CHECK_CONTENT",
                    "REMEDIATION",
                    "HOST",
                    "TARGET",
                    "COLLECTED_AT",
                    "ITEM_STATUS",
                }:
                    fields[key] = value
                elif key == "HOSTNAME":
                    fields["HOST"] = value
        commands: List[Dict[str, object]] = []
        block_index = 0
        while block_index < len(block):
            if ": " not in block[block_index]:
                block_index += 1
                continue
            command_key, command_value = block[block_index].split(": ", 1)
            if canonical_field(command_key) != "COMMAND_INDEX":
                block_index += 1
                continue
            command: Dict[str, object] = {
                "index": command_value,
                "label": "",
                "prompt": "",
                "command": "",
                "output": [],
                "exitCode": "",
            }
            block_index += 1
            while block_index < len(block) and block[block_index] not in OUTPUT_BEGIN_MARKERS:
                line = block[block_index]
                if ": " in line and canonical_field(line.split(": ", 1)[0]) == "COMMAND_LABEL":
                    command["label"] = line.split(": ", 1)[1]
                elif re.match(r"^\[[^]]+@[^]]+ ~\]#", line):
                    command["prompt"] = line
                    command["command"] = line.split("# ", 1)[1] if "# " in line else line
                block_index += 1
            if block_index < len(block) and block[block_index] in OUTPUT_BEGIN_MARKERS:
                block_index += 1
            output_lines: List[str] = []
            while block_index < len(block) and block[block_index] not in OUTPUT_END_MARKERS:
                output_lines.append(block[block_index])
                block_index += 1
            command["output"] = output_lines
            if block_index < len(block) and block[block_index] in OUTPUT_END_MARKERS:
                block_index += 1
            if block_index < len(block) and ": " in block[block_index]:
                exit_key, exit_value = block[block_index].split(": ", 1)
                if canonical_field(exit_key) == "EXIT_CODE":
                    command["exitCode"] = exit_value
            commands.append(command)
        command_count = len(commands)
        nonzero_count = sum(
            1
            for line in block
            if ": " in line
            and canonical_field(line.split(": ", 1)[0]) == "EXIT_CODE"
            and line.split(": ", 1)[1].strip() != "0"
        )
        host = fields.get("HOST", fields.get("TARGET", "unknown"))
        metadata = host_metadata.get(host) or host_metadata.get(fields.get("TARGET", ""), {})
        items.append(
            {
                "code": fields.get("ITEM_CODE", ""),
                "title": fields.get("ITEM_TITLE", ""),
                "importance": fields.get("IMPORTANCE", ""),
                "guideStatus": fields.get("GUIDE_STATUS", ""),
                "guideNote": fields.get("GUIDE_NOTE", ""),
                "exceptionReason": fields.get("EXCEPTION_REASON", ""),
                "checkContent": fields.get("CHECK_CONTENT", ""),
                "remediation": fields.get("REMEDIATION", ""),
                "host": host,
                "target": fields.get("TARGET", ""),
                "ipAddresses": metadata.get("IP_ADDRESSES", ""),
                "targetIpv4": metadata.get("TARGET_IPV4", ""),
                "collectedAt": fields.get("COLLECTED_AT", ""),
                "itemStatus": fields.get("ITEM_STATUS", ""),
                "commandCount": command_count,
                "nonzeroCount": nonzero_count,
                "commands": commands,
                "lines": block,
            }
        )
        index += 1
    if not items:
        raise ValueError(f"증적 항목을 찾을 수 없습니다: {path}")
    return report, items


def unique_sheet_names(hosts: Iterable[str]) -> Dict[str, str]:
    used: set[str] = {"요약"}
    result: Dict[str, str] = {}
    for host in hosts:
        base = re.sub(r"[\[\]:*?/\\]", "_", host).strip() or "unknown"
        base = base[:31]
        candidate = base
        suffix = 2
        while candidate in used:
            tail = f"-{suffix}"
            candidate = f"{base[:31-len(tail)]}{tail}"
            suffix += 1
        used.add(candidate)
        result[host] = candidate
    return result


def xlsx_cell(ref: str, value: object, style: int = 0) -> str:
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return f'<c r="{ref}" s="{style}"><v>{value}</v></c>'
    text = xml_text(value)
    preserve = ' xml:space="preserve"' if str(value).startswith(" ") else ""
    return (
        f'<c r="{ref}" s="{style}" t="inlineStr"><is>'
        f"<t{preserve}>{text}</t></is></c>"
    )


def column_name(number: int) -> str:
    value = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        value = chr(65 + remainder) + value
    return value


def build_summary_sheet(
    report: Dict[str, str],
    items: Sequence[Dict[str, object]],
) -> str:
    headers = [
        "점검 대상",
        "항목 코드",
        "항목명",
        "점검 내용",
        "조치 방법",
        "점검 일시",
        "판정",
        "예외처리",
    ]
    hosts = sorted({str(item["host"]) for item in items})
    rows: List[str] = []
    rows.append(
        '<row r="1" ht="30" customHeight="1">'
        + xlsx_cell("A1", PACKAGE_TITLE, 1)
        + "</row>"
    )
    rows.append(
        '<row r="2" ht="21" customHeight="1">'
        + xlsx_cell(
            "A2",
            f"생성 시각: {report.get('GENERATED_AT', '')}  |  "
            f"호스트: {len(hosts)}대  |  항목: {len(items)}건",
            2,
        )
        + "</row>"
    )
    rows.append(
        '<row r="4" ht="24" customHeight="1">'
        + "".join(
            xlsx_cell(f"{column_name(index)}4", header, 3)
            for index, header in enumerate(headers, 1)
        )
        + "</row>"
    )
    for row_number, item in enumerate(items, 5):
        values = [
            item["host"],
            item["code"],
            item["title"],
            item["checkContent"],
            item["remediation"],
            item["collectedAt"],
            item["guideStatus"],
            item["exceptionReason"],
        ]
        rows.append(
            f'<row r="{row_number}" ht="72" customHeight="1">'
            + "".join(
                xlsx_cell(
                    f"{column_name(index)}{row_number}",
                    value,
                    5 if index == 7 and str(item["guideStatus"]) == "취약" else 4,
                )
                for index, value in enumerate(values, 1)
            )
            + "</row>"
        )
    last_row = max(4, len(items) + 4)
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
    <dimension ref="A1:H{last_row}"/>
  <sheetViews><sheetView showGridLines="0" workbookViewId="0">
    <pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/>
  </sheetView></sheetViews>
  <cols>
    <col min="1" max="1" width="22" customWidth="1"/>
    <col min="2" max="2" width="11" customWidth="1"/>
    <col min="3" max="3" width="32" customWidth="1"/>
    <col min="4" max="4" width="46" customWidth="1"/>
    <col min="5" max="5" width="52" customWidth="1"/>
    <col min="6" max="6" width="25" customWidth="1"/>
    <col min="7" max="7" width="14" customWidth="1"/>
    <col min="8" max="8" width="85" customWidth="1"/>
  </cols>
  <sheetData>{''.join(rows)}</sheetData>
  <autoFilter ref="A4:H{last_row}"/>
  <mergeCells count="2"><mergeCell ref="A1:H1"/><mergeCell ref="A2:H2"/></mergeCells>
  <pageMargins left="0.25" right="0.25" top="0.4" bottom="0.4" header="0.2" footer="0.2"/>
  <pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>"""


def evidence_line_style(line: str) -> int:
    if line.startswith(("ITEM_CODE:", "ITEM_TITLE:", "항목 코드:", "항목명:")):
        return 7
    if re.match(r"^\[[^]]+@[^]]+ ~\]#", line):
        return 8
    if line.startswith(("EXIT_CODE:", "종료 코드:")) and not line.strip().endswith(": 0"):
        return 9
    if line.startswith(("ITEM_STATUS:", "수집 상태:")):
        return 10
    if set(line) in ({"="}, {"-"}, {"#"}):
        return 11
    return 6


def build_evidence_sheet(host: str, items: Sequence[Dict[str, object]]) -> str:
    rows: List[str] = [
        '<row r="1" ht="30" customHeight="1">'
        + xlsx_cell("A1", f"{PACKAGE_TITLE} · {host}", 1)
        + "</row>",
        '<row r="2" ht="20" customHeight="1">'
        + xlsx_cell("A2", "항목 코드 · 호스트 · 실행 명령 · 출력 · 종료코드", 2)
        + "</row>",
        '<row r="3" ht="8" customHeight="1">' + xlsx_cell("A3", "", 6) + "</row>",
    ]
    row_number = 4
    for item in items:
        for line in item["lines"]:
            wrapped = textwrap.wrap(
                str(line),
                width=150,
                replace_whitespace=False,
                drop_whitespace=False,
                break_long_words=True,
                break_on_hyphens=False,
            ) or [""]
            for visual_line in wrapped:
                rows.append(
                    f'<row r="{row_number}" ht="17" customHeight="1">'
                    + xlsx_cell(
                        f"A{row_number}",
                        visual_line,
                        evidence_line_style(str(line)),
                    )
                    + "</row>"
                )
                row_number += 1
        rows.append(
            f'<row r="{row_number}" ht="8" customHeight="1">'
            + xlsx_cell(f"A{row_number}", "", 6)
            + "</row>"
        )
        row_number += 1
    last_row = max(3, row_number - 1)
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
  <dimension ref="A1:A{last_row}"/>
  <sheetViews><sheetView showGridLines="0" workbookViewId="0">
    <pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/>
  </sheetView></sheetViews>
  <cols><col min="1" max="1" width="150" customWidth="1"/></cols>
  <sheetData>{''.join(rows)}</sheetData>
  <pageMargins left="0.25" right="0.25" top="0.4" bottom="0.4" header="0.2" footer="0.2"/>
  <pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>"""


def write_xlsx(
    output: Path,
    report: Dict[str, str],
    items: Sequence[Dict[str, object]],
) -> None:
    grouped: Dict[str, List[Dict[str, object]]] = defaultdict(list)
    for item in items:
        grouped[str(item["host"])].append(item)
    hosts = sorted(grouped)
    sheet_names = unique_sheet_names(hosts)
    sheets = [("요약", build_summary_sheet(report, items))]
    sheets.extend(
        (sheet_names[host], build_evidence_sheet(host, grouped[host]))
        for host in hosts
    )

    content_overrides = "".join(
        f'<Override PartName="/xl/worksheets/sheet{index}.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for index in range(1, len(sheets) + 1)
    )
    content_types = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  {content_overrides}
</Types>"""
    workbook_sheets = "".join(
        f'<sheet name="{xml_text(name)}" sheetId="{index}" r:id="rId{index}"/>'
        for index, (name, _) in enumerate(sheets, 1)
    )
    workbook = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView activeTab="0"/></bookViews>
  <sheets>{workbook_sheets}</sheets>
  <calcPr calcId="191029" fullCalcOnLoad="1"/>
</workbook>"""
    sheet_relationships = "".join(
        f'<Relationship Id="rId{index}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
        f'Target="worksheets/sheet{index}.xml"/>'
        for index in range(1, len(sheets) + 1)
    )
    workbook_rels = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {sheet_relationships}
  <Relationship Id="rId{len(sheets)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""
    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="8">
    <font><sz val="10"/><name val="Arial Unicode MS"/><family val="2"/><charset val="129"/></font>
    <font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Arial Unicode MS"/><family val="2"/><charset val="129"/></font>
    <font><sz val="10"/><color rgb="FF425563"/><name val="Arial Unicode MS"/><family val="2"/><charset val="129"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial Unicode MS"/><family val="2"/><charset val="129"/></font>
    <font><sz val="9"/><color rgb="FFF3F4F4"/><name val="Arial Unicode MS"/><family val="2"/><charset val="129"/></font>
    <font><b/><sz val="9"/><color rgb="FF73C5FF"/><name val="Arial Unicode MS"/><family val="2"/><charset val="129"/></font>
    <font><b/><sz val="9"/><color rgb="FFFFB649"/><name val="Arial Unicode MS"/><family val="2"/><charset val="129"/></font>
    <font><b/><sz val="9"/><color rgb="FF8BC1A3"/><name val="Arial Unicode MS"/><family val="2"/><charset val="129"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF004B76"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF0F4F8"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF111827"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF7D1007"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left/><right/><top/><bottom style="thin"><color rgb="FFD2D7DC"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="12">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="4" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="5" fillId="4" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="6" fillId="4" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="6" fillId="5" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="7" fillId="4" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="2" fillId="4" borderId="0" xfId="0"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>"""
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    root_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""
    core = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>{xml_text(PACKAGE_TITLE)}</dc:title><dc:creator>ABLESTACK</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>ABLESTACK Security Evidence</Application>
</Properties>"""

    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", root_rels)
        archive.writestr("docProps/core.xml", core)
        archive.writestr("docProps/app.xml", app)
        archive.writestr("xl/workbook.xml", workbook)
        archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        archive.writestr("xl/styles.xml", styles)
        for index, (_, sheet_xml) in enumerate(sheets, 1):
            archive.writestr(f"xl/worksheets/sheet{index}.xml", sheet_xml)


def wrap_terminal_lines(lines: Sequence[str], width: int = 115) -> List[str]:
    result: List[str] = []
    for line in lines:
        result.extend(
            textwrap.wrap(
                str(line),
                width=width,
                replace_whitespace=False,
                drop_whitespace=False,
                break_long_words=True,
                break_on_hyphens=False,
            )
            or [""]
        )
    return result


def display_command(command: object) -> str:
    """Hide shell-only error suppression without changing the executed command."""
    value = re.sub(r"\s*\|\|\s*true\b", "", str(command))
    return re.sub(r"\s+;", ";", value).strip()


def display_collected_at(value: object) -> str:
    text = str(value).strip()
    if not text:
        return "-"
    try:
        return datetime.fromisoformat(text).strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        return text.replace("T", " ")[:19]


def display_target(item: Dict[str, object]) -> str:
    host = str(item.get("host") or item.get("target") or "unknown")
    target = str(item.get("target") or "").strip()
    resolved = str(item.get("targetIpv4") or "").strip()
    addresses = str(item.get("ipAddresses") or "").split()
    address = ""
    for candidate in (target, resolved):
        if re.fullmatch(r"(?:\d{1,3}\.){3}\d{1,3}", candidate):
            address = candidate
            break
    if not address:
        address = next(
            (
                value
                for value in addresses
                if re.fullmatch(r"(?:\d{1,3}\.){3}\d{1,3}", value)
                and value not in {"127.0.0.1"}
            ),
            "",
        )
    if address and address != host:
        return f"{host} ({address})"
    return host


def judgement_style(value: object) -> Tuple[str, str]:
    judgement = str(value).strip() or "확인 필요"
    if judgement == "양호":
        return judgement, "2E7D32"
    if judgement == "취약":
        return judgement, "C62828"
    if judgement == "예외처리":
        return judgement, "9A6700"
    if judgement == "해당없음":
        return judgement, "607D8B"
    return judgement, "607D8B"


def ppt_run(text: str, color: str = "E5E7EB", size: int = 1300, bold: bool = False) -> str:
    bold_attr = ' b="1"' if bold else ""
    return (
        f'<a:r><a:rPr lang="ko-KR" sz="{size}"{bold_attr}>'
        f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
        '<a:latin typeface="DejaVu Sans Mono"/><a:ea typeface="Arial Unicode MS"/>'
        f"</a:rPr><a:t>{xml_text(text)}</a:t></a:r>"
    )


def ppt_text_shape(
    shape_id: int,
    name: str,
    x: int,
    y: int,
    cx: int,
    cy: int,
    paragraphs: Sequence[Tuple[str, str, int, bool]],
    fill: Optional[str] = None,
    margin: int = 90000,
) -> str:
    fill_xml = (
        f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>'
        if fill
        else "<a:noFill/>"
    )
    paragraph_xml = "".join(
        "<a:p>"
        + ppt_run(text, color, size, bold)
        + f'<a:endParaRPr lang="ko-KR" sz="{size}"/>'
        + "</a:p>"
        for text, color, size, bold in paragraphs
    )
    return f"""<p:sp>
  <p:nvSpPr><p:cNvPr id="{shape_id}" name="{xml_text(name)}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
  <p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>{fill_xml}<a:ln><a:noFill/></a:ln>
  </p:spPr>
  <p:txBody><a:bodyPr wrap="square" lIns="{margin}" tIns="{margin}" rIns="{margin}" bIns="{margin}"/>
    <a:lstStyle/>{paragraph_xml}
  </p:txBody>
</p:sp>"""


def ppt_output_capacity(
    item: Dict[str, object],
    command: Dict[str, object],
) -> int:
    detail_count = len(ppt_detail_paragraphs(item))
    details_height = 160000 + (200000 * detail_count)
    command_text = display_command(command.get("command", ""))
    prompt = f"[root@{item.get('host') or 'unknown'} ~]# {command_text}"
    prompt_lines = wrap_terminal_lines([prompt], 105)
    command_height = 590000 + (190000 * len(prompt_lines))
    command_y = 1828800 + details_height + 80000
    output_y = command_y + command_height + 60000
    output_height = max(900000, 6258240 - output_y)
    return max(2, min(12, (output_height - 500000) // 200000))


def ppt_detail_paragraphs(
    item: Dict[str, object],
) -> List[Tuple[str, str, int, bool]]:
    content_lines = wrap_terminal_lines(
        [str(item.get("checkContent") or item.get("title") or "-")],
        95,
    )
    remediation_lines = wrap_terminal_lines(
        [str(item.get("remediation") or "-")],
        95,
    )
    paragraphs: List[Tuple[str, str, int, bool]] = (
        [("점검 내용", "005A8C", 1200, True)]
        + [(line, "263746", 1150, False) for line in content_lines]
        + [("조치 방법", "005A8C", 1200, True)]
        + [(line, "263746", 1150, False) for line in remediation_lines]
    )
    exception_reason = str(item.get("exceptionReason") or "").strip()
    if exception_reason:
        exception_lines = wrap_terminal_lines([exception_reason], 95)
        paragraphs.extend(
            [("예외처리사유", "8A5A00", 1200, True)]
            + [(line, "694A00", 1100, False) for line in exception_lines]
        )
    return paragraphs


def ppt_output_pages(
    item: Dict[str, object],
    command: Dict[str, object],
) -> List[List[str]]:
    raw_output = [
        str(line)
        for line in (command.get("output", []) or ["(출력 없음)"])
    ]
    output_lines = wrap_terminal_lines(raw_output, 105)
    page_size = ppt_output_capacity(item, command)
    full_pages = [
        output_lines[index : index + page_size]
        for index in range(0, len(output_lines), page_size)
    ] or [["(출력 없음)"]]
    if len(full_pages) <= PPT_MAX_FULL_OUTPUT_PAGES:
        return full_pages

    collector_marker = next(
        (line for line in reversed(raw_output) if OUTPUT_TRUNCATION_RE.fullmatch(line)),
        "",
    )
    content_lines = [
        line for line in output_lines if not OUTPUT_TRUNCATION_RE.fullmatch(line)
    ]
    first_page = content_lines[:page_size]
    second_content_limit = max(0, page_size - 2)
    second_page = content_lines[
        page_size : page_size + second_content_limit
    ]
    displayed_lines = len(first_page) + len(second_page)
    marker = collector_marker or (
        f"[결과 일부 생략 전체 행={len(content_lines)} "
        f"표시 행={displayed_lines}]"
    )
    second_page.extend([marker, PPT_TXT_GUIDANCE])
    return [first_page, second_page]


def slide_xml(
    item: Dict[str, object],
    command: Dict[str, object],
    slide_number: int,
    output_lines: Sequence[str],
    output_page: int,
    output_page_count: int,
) -> str:
    title = f"[{item['code']}] {item['title']}"
    title_size = 1900 if len(title) >= 26 else 2300
    judgement, judgement_color = judgement_style(item.get("guideStatus"))
    title_shape = ppt_text_shape(
        2,
        "Title",
        457200,
        365760,
        9250000,
        640080,
        [(title, "005A8C", title_size, True)],
        margin=60000,
    )
    judgement_shape = ppt_text_shape(
        3,
        "Judgement",
        10241280,
        365760,
        1371600,
        640080,
        [(judgement, "FFFFFF", 1500, True)],
        fill=judgement_color,
        margin=120000,
    )
    separator_shape = ppt_text_shape(
        4,
        "Separator",
        457200,
        1082040,
        11277600,
        18000,
        [("", "D5DCE2", 100, False)],
        fill="D5DCE2",
        margin=0,
    )
    metadata_shape = ppt_text_shape(
        5,
        "Metadata",
        548640,
        1196340,
        11094720,
        640080,
        [
            (f"점검 대상 : {display_target(item)}", "263746", 1350, True),
            (f"점검 일시 : {display_collected_at(item.get('collectedAt'))}", "52616B", 1250, False),
        ],
        margin=60000,
    )
    detail_paragraphs = ppt_detail_paragraphs(item)
    details_height = 160000 + (200000 * len(detail_paragraphs))
    details_shape = ppt_text_shape(
        6,
        "Check details",
        548640,
        1828800,
        11094720,
        details_height,
        detail_paragraphs,
        margin=60000,
    )
    command_text = display_command(command.get("command", ""))
    prompt = f"[root@{item.get('host') or 'unknown'} ~]# {command_text}"
    prompt_lines = wrap_terminal_lines([prompt], 105)
    command_height = 590000 + (190000 * len(prompt_lines))
    command_y = 1828800 + details_height + 80000
    command_shape = ppt_text_shape(
        7,
        "Command",
        548640,
        command_y,
        11094720,
        command_height,
        [("실행 명령", "9CA3AF", 1100, True)]
        + [(line, "FFCB65", 1200, True) for line in prompt_lines],
        fill="111827",
        margin=120000,
    )
    output_y = command_y + command_height + 60000
    output_height = max(900000, 6258240 - output_y)
    maximum_output_lines = max(2, min(12, (output_height - 500000) // 200000))
    output_lines = list(output_lines[:maximum_output_lines])
    output_heading = "명령 결과"
    if output_page_count > 1:
        output_heading += f" ({output_page}/{output_page_count})"
    output_shape = ppt_text_shape(
        8,
        "Command output",
        548640,
        output_y,
        11094720,
        output_height,
        [(output_heading, "9CA3AF", 1100, True)]
        + [(line, "F3F4F6", 1250, False) for line in output_lines],
        fill="111827",
        margin=120000,
    )
    page_shape = ppt_text_shape(
        9,
        "Page number",
        10820400,
        6400800,
        900000,
        228600,
        [(str(slide_number), "6B7280", 900, False)],
        margin=0,
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="F7F9FB"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      {title_shape}{judgement_shape}{separator_shape}{metadata_shape}{details_shape}{command_shape}{output_shape}{page_shape}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>"""


def title_slide_xml(
    report: Dict[str, str],
    host_count: int,
    item_count: int,
) -> str:
    title = ppt_text_shape(
        2,
        "Title",
        914400,
        1828800,
        10363200,
        1000000,
        [(PACKAGE_TITLE, "FFFFFF", 3600, True)],
        fill="004B76",
        margin=180000,
    )
    subtitle = ppt_text_shape(
        3,
        "Subtitle",
        1371600,
        3200400,
        9144000,
        1100000,
        [
            (f"호스트 {host_count}대 · 항목 {item_count}건", "004B76", 2200, True),
            (f"생성 시각  {report.get('GENERATED_AT', '')}", "425563", 1500, False),
            ("KISA 주요정보통신기반시설 가이드를 바탕으로 수집한 명령 실행 증적", "425563", 1500, False),
        ],
        margin=0,
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="F7F9FB"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      {title}{subtitle}
    </p:spTree>
  </p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>"""


def write_pptx(
    output: Path,
    report: Dict[str, str],
    items: Sequence[Dict[str, object]],
) -> int:
    slides: List[str] = [
        title_slide_xml(report, len({str(item["host"]) for item in items}), len(items))
    ]
    for item in items:
        commands = item.get("commands") or [
            {
                "index": "",
                "label": "수집된 명령 없음",
                "command": "",
                "output": ["(출력 없음)"],
                "exitCode": "",
            }
        ]
        for command in commands:
            output_pages = ppt_output_pages(item, command)
            for page_index, output_page in enumerate(output_pages, 1):
                slides.append(
                    slide_xml(
                        item,
                        command,
                        len(slides) + 1,
                        output_page,
                        page_index,
                        len(output_pages),
                    )
                )

    slide_overrides = "".join(
        f'<Override PartName="/ppt/slides/slide{index}.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for index in range(1, len(slides) + 1)
    )
    content_types = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>
  <Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>
  <Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  {slide_overrides}
</Types>"""
    slide_ids = "".join(
        f'<p:sldId id="{255 + index}" r:id="rId{index + 1}"/>'
        for index in range(1, len(slides) + 1)
    )
    presentation = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>{slide_ids}</p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle><a:defPPr><a:defRPr lang="ko-KR"/></a:defPPr></p:defaultTextStyle>
</p:presentation>"""
    presentation_rels = [
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
    ]
    presentation_rels.extend(
        f'<Relationship Id="rId{index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{index}.xml"/>'
        for index in range(1, len(slides) + 1)
    )
    next_id = len(slides) + 2
    presentation_rels.extend(
        [
            f'<Relationship Id="rId{next_id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>',
            f'<Relationship Id="rId{next_id+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>',
            f'<Relationship Id="rId{next_id+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>',
        ]
    )
    presentation_rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + "".join(presentation_rels)
        + "</Relationships>"
    )
    root_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""
    slide_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>"""
    slide_master = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld name="ABLESTACK Master"><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
  </p:spTree></p:cSld>
  <p:clrMap accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" bg1="lt1" bg2="lt2" folHlink="folHlink" hlink="hlink" tx1="dk1" tx2="dk2"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>"""
    slide_master_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>"""
    slide_layout = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
  </p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>"""
    slide_layout_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>"""
    theme = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="ABLESTACK">
  <a:themeElements>
    <a:clrScheme name="ABLESTACK"><a:dk1><a:srgbClr val="111827"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="425563"/></a:dk2><a:lt2><a:srgbClr val="F7F9FB"/></a:lt2>
      <a:accent1><a:srgbClr val="004B76"/></a:accent1><a:accent2><a:srgbClr val="73C5FF"/></a:accent2>
      <a:accent3><a:srgbClr val="8BC1A3"/></a:accent3><a:accent4><a:srgbClr val="FFB649"/></a:accent4>
      <a:accent5><a:srgbClr val="425563"/></a:accent5><a:accent6><a:srgbClr val="6B7280"/></a:accent6>
      <a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="ABLESTACK"><a:majorFont><a:latin typeface="Aptos Display"/><a:ea typeface="Arial Unicode MS"/><a:cs typeface=""/></a:majorFont>
      <a:minorFont><a:latin typeface="Aptos"/><a:ea typeface="Arial Unicode MS"/><a:cs typeface=""/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="ABLESTACK">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="60000"/></a:schemeClr></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:shade val="80000"/></a:schemeClr></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="25400"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="38100"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/></a:schemeClr></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:shade val="90000"/></a:schemeClr></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>"""
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    core = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>{xml_text(PACKAGE_TITLE)}</dc:title><dc:creator>ABLESTACK</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>"""
    app = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>ABLESTACK Security Evidence</Application><Slides>{len(slides)}</Slides>
</Properties>"""
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", root_rels)
        archive.writestr("docProps/core.xml", core)
        archive.writestr("docProps/app.xml", app)
        archive.writestr("ppt/presentation.xml", presentation)
        archive.writestr("ppt/_rels/presentation.xml.rels", presentation_rels_xml)
        archive.writestr("ppt/slideMasters/slideMaster1.xml", slide_master)
        archive.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", slide_master_rels)
        archive.writestr("ppt/slideLayouts/slideLayout1.xml", slide_layout)
        archive.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", slide_layout_rels)
        archive.writestr("ppt/theme/theme1.xml", theme)
        archive.writestr("ppt/presProps.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>')
        archive.writestr("ppt/viewProps.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:viewPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>')
        archive.writestr("ppt/tableStyles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>')
        for index, slide in enumerate(slides, 1):
            archive.writestr(f"ppt/slides/slide{index}.xml", slide)
            archive.writestr(f"ppt/slides/_rels/slide{index}.xml.rels", slide_rels)
    return len(slides)


def collect_evidence(args: argparse.Namespace, output: Path) -> Tuple[int, str]:
    ssh_port = args.ssh_port or detect_ssh_port()
    command = [
        sys.executable,
        str(COLLECTOR),
        "--json",
        args.cluster_json,
        "--items",
        args.items,
        "--ssh-user",
        args.ssh_user,
        "--ssh-port",
        str(ssh_port),
        "--timeout",
        str(args.timeout),
        "--max-output-lines",
        str(args.max_output_lines),
        "--output",
        str(output),
    ]
    if args.host:
        for host_value in args.host:
            command.extend(["--host", host_value])
    else:
        command.extend(["--targets", *args.targets])
    proc = subprocess.run(command, capture_output=True, text=True, check=False)
    details = "\n".join(part for part in (proc.stdout.strip(), proc.stderr.strip()) if part)
    return proc.returncode, details


def detect_ssh_port() -> int:
    sshd = shutil.which("sshd") or "/usr/sbin/sshd"
    try:
        proc = subprocess.run(
            [sshd, "-T"],
            capture_output=True,
            text=True,
            check=False,
            timeout=10,
        )
        if proc.returncode == 0:
            for line in proc.stdout.splitlines():
                match = re.match(r"^port\s+(\d+)$", line.strip(), re.IGNORECASE)
                if match:
                    port = int(match.group(1))
                    if 1 <= port <= 65535:
                        return port
    except (OSError, subprocess.SubprocessError):
        pass
    return 22


def generate_package(args: argparse.Namespace) -> int:
    storage_root = Path(args.storage_root).expanduser().resolve()
    storage_root.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().astimezone().strftime("%Y%m%d-%H%M%S")
    run_dir = storage_root / stamp
    suffix = 2
    while run_dir.exists():
        run_dir = storage_root / f"{stamp}-{suffix}"
        suffix += 1
    run_dir.mkdir(parents=True)

    log_path = run_dir / LOG_FILENAME
    collector_status = 0
    collector_details = ""
    if args.from_log:
        shutil.copy2(Path(args.from_log).expanduser(), log_path)
    else:
        collector_status, collector_details = collect_evidence(args, log_path)
        if not log_path.exists() or log_path.stat().st_size == 0:
            raise RuntimeError(
                "증적 수집 파일이 생성되지 않았습니다."
                + (f" {collector_details}" if collector_details else "")
            )

    report, items = parse_evidence(log_path)
    pptx_path = run_dir / PPTX_FILENAME
    xlsx_path = run_dir / XLSX_FILENAME
    package_in_run = run_dir / PACKAGE_FILENAME
    ppt_slide_count = write_pptx(pptx_path, report, items)
    write_xlsx(xlsx_path, report, items)

    with zipfile.ZipFile(package_in_run, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.write(pptx_path, PPTX_FILENAME)
        archive.write(xlsx_path, XLSX_FILENAME)
        archive.write(log_path, LOG_FILENAME)

    latest_package = storage_root / PACKAGE_FILENAME
    package_temp = storage_root / f".{PACKAGE_FILENAME}.{os.getpid()}.tmp"
    shutil.copy2(package_in_run, package_temp)
    os.replace(package_temp, latest_package)
    hosts = sorted({str(item["host"]) for item in items})
    collector_summary = parse_collector_summary(collector_details)
    requested_targets = collector_summary.get("targetList")
    if not isinstance(requested_targets, list):
        requested_targets = [
            target.strip()
            for target in str(report.get("TARGETS", "")).split(",")
            if target.strip()
        ]
    resolved_cluster_type = str(
        collector_summary.get("clusterType") or report.get("CLUSTER_TYPE", "")
    )
    resolved_target_groups = collector_summary.get("targetGroups")
    if not isinstance(resolved_target_groups, list):
        resolved_target_groups = [
            group.strip()
            for group in str(report.get("TARGET_GROUPS", "")).split(",")
            if group.strip()
        ]
    metadata = {
        "path": str(latest_package),
        "filename": PACKAGE_FILENAME,
        "size": latest_package.stat().st_size,
        "generatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        "hosts": len(hosts),
        "collectedHosts": hosts,
        "requestedHosts": len(requested_targets),
        "requestedTargets": requested_targets,
        "clusterType": resolved_cluster_type,
        "targetGroups": resolved_target_groups,
        "items": len(items),
        "slides": ppt_slide_count,
        "collectorStatus": collector_status,
        "collectorWarning": collector_details if collector_status else "",
        "runDirectory": str(run_dir),
    }
    latest_temp = storage_root / f".{LATEST_FILENAME}.{os.getpid()}.tmp"
    latest_temp.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    os.replace(latest_temp, storage_root / LATEST_FILENAME)
    json_result(200, metadata)
    return 0


def latest_package(args: argparse.Namespace) -> int:
    storage_root = Path(args.storage_root).expanduser().resolve()
    metadata_path = storage_root / LATEST_FILENAME
    if not metadata_path.exists():
        json_result(404, "생성된 보안 취약점 증적 자료가 없습니다.")
        return 0
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    package = Path(str(metadata.get("path", "")))
    if not package.is_file():
        json_result(404, "최신 보안 취약점 증적 ZIP 파일이 존재하지 않습니다.")
        return 0
    metadata["size"] = package.stat().st_size
    json_result(200, metadata)
    return 0


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    if args.command == "generate":
        return generate_package(args)
    return latest_package(args)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # Cockpit needs a JSON error even for unexpected failures.
        json_result(500, str(exc))
        raise SystemExit(1)
