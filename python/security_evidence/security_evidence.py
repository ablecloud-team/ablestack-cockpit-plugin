#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Collect screenshot-friendly, read-only KISA evidence from ABLESTACK hosts.

The collector intentionally does not call security_patch.sh.  It sends one
read-only Bash payload to each selected host and appends every host/item result
to a single text file that can be archived or converted to PPTX/XLSX.
"""

from __future__ import annotations

import argparse
import json
import re
import shlex
import socket
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Set


DEFAULT_CLUSTER_JSON = "/usr/share/cockpit/ablestack/tools/properties/cluster.json"
DEFAULT_CATALOG = (
    Path(__file__).resolve().parents[2]
    / "tools"
    / "security_evidence"
    / "checks.json"
)


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Collect ABLESTACK host security evidence into one text file."
    )
    parser.add_argument("-j", "--json", default=DEFAULT_CLUSTER_JSON)
    parser.add_argument("--catalog", default=str(DEFAULT_CATALOG))
    parser.add_argument(
        "-t",
        "--targets",
        nargs="+",
        choices=["ccvm", "ablecube", "scvm", "all"],
        default=["all"],
        help="cluster.json target groups",
    )
    parser.add_argument(
        "--host",
        action="append",
        default=[],
        help=(
            "explicit host/IP list; accepts comma/space separated values and may "
            "be repeated, e.g. --host 'ablecube1,scvm1,ccvm'"
        ),
    )
    parser.add_argument(
        "--local",
        action="store_true",
        help="collect from the current host only",
    )
    parser.add_argument("--ssh-user", default="root")
    parser.add_argument("--ssh-port", type=int, default=22)
    parser.add_argument(
        "--items",
        default="all",
        help="comma separated item codes or ranges, e.g. U-01,U-64 or U-01:U-13",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=120,
        help="per-command timeout in seconds",
    )
    parser.add_argument(
        "--max-output-lines",
        type=int,
        default=400,
        help="maximum lines retained from each command output",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="combined evidence text path",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="print resolved targets/items without executing commands",
    )
    return parser.parse_args(argv)


def load_json(path: str) -> Dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def get_local_ipv4s() -> Set[str]:
    addrs: Set[str] = {"127.0.0.1"}
    try:
        proc = subprocess.run(
            ["/usr/sbin/ip", "-o", "-4", "addr", "show"],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode == 0:
            for line in proc.stdout.splitlines():
                parts = line.split()
                if "inet" in parts:
                    idx = parts.index("inet")
                    if idx + 1 < len(parts):
                        addrs.add(parts[idx + 1].split("/", 1)[0])
    except (FileNotFoundError, OSError):
        pass

    try:
        hostname = socket.gethostname()
        addrs.update(
            addr[4][0]
            for addr in socket.getaddrinfo(hostname, None, socket.AF_INET)
        )
    except OSError:
        pass
    return addrs


CLUSTER_TYPE_TARGET_GROUPS = {
    "ablestack-hci": ("ablecube", "scvm", "ccvm"),
    "ablestack-hci-filesystem": ("ablecube", "scvm", "ccvm"),
    "ablestack-vm": ("ablecube", "ccvm"),
    "ablestack-standalone": ("ablecube", "ccvm"),
}


def cluster_type(conf: Dict) -> str:
    return str((conf.get("clusterConfig") or {}).get("type") or "").strip().lower()


def resolve_target_groups(conf: Dict, groups: Sequence[str]) -> List[str]:
    normalized = [str(group).strip().lower() for group in groups if str(group).strip()]
    if "all" not in normalized:
        return list(dict.fromkeys(normalized))
    return list(
        CLUSTER_TYPE_TARGET_GROUPS.get(
            cluster_type(conf),
            ("ablecube", "scvm", "ccvm"),
        )
    )


def gather_targets(conf: Dict, groups: Sequence[str]) -> List[str]:
    root = conf.get("clusterConfig") or {}
    hosts = root.get("hosts") or []
    selected_groups = resolve_target_groups(conf, groups)
    found: List[str] = []

    if "ablecube" in selected_groups:
        found.extend(
            value
            for item in hosts
            if (value := str(item.get("ablecube") or "").strip())
        )
    if "scvm" in selected_groups:
        found.extend(
            value
            for item in hosts
            if (value := str(item.get("scvm") or "").strip())
        )
    if "ccvm" in selected_groups:
        ccvm = str((root.get("ccvm") or {}).get("ip") or "").strip()
        if ccvm:
            found.append(ccvm)

    return list(dict.fromkeys(found))


def parse_explicit_hosts(values: Sequence[str]) -> List[str]:
    hosts: List[str] = []
    for value in values:
        hosts.extend(part for part in re.split(r"[\s,]+", value.strip()) if part)
    return list(dict.fromkeys(hosts))


def parse_item_selection(spec: str, all_codes: Sequence[str]) -> List[str]:
    if spec.strip().lower() == "all":
        return list(all_codes)

    available = set(all_codes)
    selected: List[str] = []
    for token in (part.strip().upper() for part in spec.split(",")):
        if not token:
            continue
        if ":" in token:
            start, end = token.split(":", 1)
            try:
                start_num = int(start.replace("U-", ""))
                end_num = int(end.replace("U-", ""))
            except ValueError as exc:
                raise ValueError(f"invalid item range: {token}") from exc
            if start_num > end_num:
                start_num, end_num = end_num, start_num
            expanded = [f"U-{number:02d}" for number in range(start_num, end_num + 1)]
        else:
            number = token.replace("U-", "")
            if not number.isdigit():
                raise ValueError(f"invalid item code: {token}")
            expanded = [f"U-{int(number):02d}"]

        for code in expanded:
            if code not in available:
                raise ValueError(f"item not found in catalog: {code}")
            if code not in selected:
                selected.append(code)
    return selected


def _q(value: object) -> str:
    return shlex.quote(str(value))


def build_payload(
    checks: Iterable[Dict],
    target: str,
    timeout_seconds: int,
    collector_version: str,
    catalog_source: str,
    max_output_lines: int = 400,
) -> str:
    lines = [
        "#!/usr/bin/env bash",
        "set +e",
        f"TARGET_LABEL={_q(target)}",
        f"COMMAND_TIMEOUT={int(timeout_seconds)}",
        f"MAX_OUTPUT_LINES={int(max_output_lines)}",
        f"COLLECTOR_VERSION={_q(collector_version)}",
        f"CATALOG_SOURCE={_q(catalog_source)}",
        'EVIDENCE_HOSTNAME="$(hostname -s 2>/dev/null || hostname)"',
        'EVIDENCE_FQDN="$(hostname -f 2>/dev/null || hostname)"',
        'EVIDENCE_IPS="$(hostname -I 2>/dev/null | xargs || true)"',
        'if printf "%s" "$TARGET_LABEL" | grep -Eq "^([0-9]{1,3}\\.){3}[0-9]{1,3}$"; then',
        '  EVIDENCE_TARGET_IPV4="$TARGET_LABEL"',
        'else',
        '  EVIDENCE_TARGET_IPV4="$(getent ahostsv4 "$TARGET_LABEL" 2>/dev/null | awk \'NR == 1 {print $1}\' || true)"',
        "fi",
        'EVIDENCE_OS="$(. /etc/os-release 2>/dev/null; printf "%s" "${PRETTY_NAME:-unknown}")"',
        'EVIDENCE_KERNEL="$(uname -r 2>/dev/null || true)"',
        'EVIDENCE_TIME="$(date --iso-8601=seconds 2>/dev/null || date "+%Y-%m-%dT%H:%M:%S%z")"',
        'EVIDENCE_USER="$(id -un 2>/dev/null || printf unknown)"',
        'printf "%s\\n" "####################################################################################################"',
        'printf "%s\\n" "ABLESTACK 호스트 시작"',
        'printf "접속 대상: %s\\n" "$TARGET_LABEL"',
        'printf "호스트명: %s\\n" "$EVIDENCE_HOSTNAME"',
        'printf "FQDN: %s\\n" "$EVIDENCE_FQDN"',
        'printf "IP 주소: %s\\n" "${EVIDENCE_IPS:-unknown}"',
        'printf "접속 대상 IPv4: %s\\n" "${EVIDENCE_TARGET_IPV4:-unknown}"',
        'printf "운영체제: %s\\n" "$EVIDENCE_OS"',
        'printf "커널: %s\\n" "$EVIDENCE_KERNEL"',
        'printf "점검 일시: %s\\n" "$EVIDENCE_TIME"',
        'printf "점검 사용자: %s\\n" "$EVIDENCE_USER"',
        'printf "수집기 버전: %s\\n" "$COLLECTOR_VERSION"',
        'printf "카탈로그 출처: %s\\n" "$CATALOG_SOURCE"',
        'printf "%s\\n" "####################################################################################################"',
        "",
        "run_evidence_command() {",
        "  local command_index=\"$1\"",
        "  local command_label=\"$2\"",
        "  local command_text=\"$3\"",
        "  local tmp_output command_rc output_lines",
        "  tmp_output=\"$(mktemp)\"",
        "  printf '%s\\n' '----------------------------------------------------------------------------------------------------'",
        "  printf '명령 순번: %s\\n' \"$command_index\"",
        "  printf '명령 설명: %s\\n' \"$command_label\"",
        "  printf '[%s@%s ~]# %s\\n' \"$EVIDENCE_USER\" \"$EVIDENCE_HOSTNAME\" \"$command_text\"",
        "  printf '%s\\n' '명령 결과 시작'",
        "  if command -v timeout >/dev/null 2>&1; then",
        "    timeout --signal=TERM \"${COMMAND_TIMEOUT}s\" bash -o pipefail -c \"$command_text\" >\"$tmp_output\" 2>&1",
        "    command_rc=$?",
        "  else",
        "    bash -o pipefail -c \"$command_text\" >\"$tmp_output\" 2>&1",
        "    command_rc=$?",
        "  fi",
        "  if [ -s \"$tmp_output\" ]; then",
        "    output_lines=\"$(wc -l < \"$tmp_output\" | tr -d ' ')\"",
        "    sed -n \"1,${MAX_OUTPUT_LINES}p\" \"$tmp_output\" | sed -e 's/\\r$//'",
        "    if [ \"${output_lines:-0}\" -gt \"$MAX_OUTPUT_LINES\" ]; then",
        "      printf '[결과 일부 생략 전체 행=%s 표시 행=%s]\\n' \"$output_lines\" \"$MAX_OUTPUT_LINES\"",
        "    fi",
        "  else",
        "    printf '%s\\n' '(출력 없음)'",
        "  fi",
        "  rm -f \"$tmp_output\"",
        "  printf '%s\\n' '명령 결과 종료'",
        "  printf '종료 코드: %s\\n' \"$command_rc\"",
        "  return \"$command_rc\"",
        "}",
        "",
    ]

    for check in checks:
        lines.extend(
            [
                "printf '%s\\n' '===================================================================================================='",
                "printf '%s\\n' 'ABLESTACK 점검 항목 시작'",
                f"printf '항목 코드: %s\\n' {_q(check['code'])}",
                f"printf '항목명: %s\\n' {_q(check['title'])}",
                f"printf '중요도: %s\\n' {_q(check.get('importance', ''))}",
                f"printf '판정: %s\\n' {_q(check.get('guideStatus', ''))}",
                f"printf '안내: %s\\n' {_q(check.get('guideNote', ''))}",
                f"printf '예외처리: %s\\n' {_q(check.get('exceptionReason', ''))}",
                f"printf '점검 내용: %s\\n' {_q(check.get('checkContent', ''))}",
                f"printf '조치 방법: %s\\n' {_q(check.get('remediation', ''))}",
                'printf "호스트명: %s\\n" "$EVIDENCE_HOSTNAME"',
                'printf "접속 대상: %s\\n" "$TARGET_LABEL"',
                'printf "점검 일시: %s\\n" "$EVIDENCE_TIME"',
                "item_nonzero=0",
            ]
        )
        for index, command in enumerate(check.get("commands", []), start=1):
            lines.append(
                "run_evidence_command "
                f"{index} {_q(command.get('label', ''))} {_q(command.get('command', ''))} "
                "|| item_nonzero=1"
            )
        lines.extend(
            [
                "if [ \"$item_nonzero\" -eq 0 ]; then",
                "  printf '%s\\n' '수집 상태: 완료'",
                "else",
                "  printf '%s\\n' '수집 상태: 완료(종료 코드 확인 필요)'",
                "fi",
                "printf '%s\\n' 'ABLESTACK 점검 항목 종료'",
                "printf '%s\\n' '===================================================================================================='",
                "",
            ]
        )

    lines.extend(
        [
            'printf "%s\\n" "####################################################################################################"',
            'printf "%s\\n" "ABLESTACK 호스트 종료"',
            'printf "접속 대상: %s\\n" "$TARGET_LABEL"',
            'printf "호스트명: %s\\n" "$EVIDENCE_HOSTNAME"',
            'printf "%s\\n" "####################################################################################################"',
        ]
    )
    return "\n".join(lines) + "\n"


def write_report_header(
    handle,
    output_path: Path,
    targets: Sequence[str],
    codes: Sequence[str],
    catalog: Dict,
    resolved_cluster_type: str,
    target_groups: Sequence[str],
) -> None:
    now = datetime.now().astimezone().isoformat(timespec="seconds")
    handle.write("ABLESTACK 보안 취약점 증적 자료\n")
    handle.write("보고서 버전: 1.1\n")
    handle.write(f"생성 일시: {now}\n")
    handle.write(f"출력 파일: {output_path}\n")
    handle.write(f"카탈로그 버전: {catalog.get('catalogVersion', '')}\n")
    handle.write(f"카탈로그 출처: {catalog.get('source', '')}\n")
    handle.write(f"클러스터 유형: {resolved_cluster_type}\n")
    handle.write(f"대상 그룹: {', '.join(target_groups)}\n")
    handle.write(f"대상 수: {len(targets)}\n")
    handle.write(f"점검 대상 목록: {', '.join(targets)}\n")
    handle.write(f"항목 수: {len(codes)}\n")
    handle.write(f"점검 항목: {', '.join(codes)}\n")
    handle.write("=" * 100 + "\n\n")
    handle.flush()


def run_payload(
    target: str,
    payload: str,
    handle,
    ssh_user: str,
    ssh_port: int,
    local_ipv4s: Set[str],
) -> int:
    is_local = target in {"local", "localhost", socket.gethostname()} or target in local_ipv4s
    if is_local:
        cmd = ["/bin/bash", "-s"]
    else:
        cmd = [
            "/usr/bin/ssh",
            "-o",
            "BatchMode=yes",
            "-o",
            "StrictHostKeyChecking=no",
            "-o",
            "ConnectTimeout=10",
            "-p",
            str(ssh_port),
            f"{ssh_user}@{target}",
            "/bin/bash",
            "-s",
        ]

    handle.write(
        f"전송 방식: {'로컬' if is_local else 'SSH'} 대상={target} 포트={ssh_port if not is_local else '-'}\n"
    )
    handle.flush()
    try:
        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=handle,
            stderr=subprocess.STDOUT,
            text=True,
        )
        proc.communicate(payload)
        rc = int(proc.returncode or 0)
    except FileNotFoundError as exc:
        handle.write(f"전송 오류: {exc}\n")
        rc = 127
    except OSError as exc:
        handle.write(f"전송 오류: {exc}\n")
        rc = 1

    handle.write(f"전송 종료 코드: {rc}\n")
    handle.write("=" * 100 + "\n\n")
    handle.flush()
    return rc


def default_output_path() -> Path:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return Path.cwd() / f"security-evidence-{stamp}.txt"


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    if not 1 <= args.ssh_port <= 65535:
        raise ValueError(f"invalid SSH port: {args.ssh_port}")
    if args.timeout < 1:
        raise ValueError("--timeout must be at least 1 second")
    if args.max_output_lines < 1:
        raise ValueError("--max-output-lines must be at least 1")

    catalog = load_json(args.catalog)
    all_checks = catalog.get("checks") or []
    if not all_checks:
        raise ValueError(f"no checks in catalog: {args.catalog}")
    all_codes = [str(check["code"]) for check in all_checks]
    selected_codes = parse_item_selection(args.items, all_codes)
    selected_set = set(selected_codes)
    checks = [check for check in all_checks if check["code"] in selected_set]

    resolved_cluster_type = ""
    target_groups: List[str] = []
    if args.local:
        targets = ["local"]
        resolved_cluster_type = "local"
        target_groups = ["local"]
    elif args.host:
        targets = parse_explicit_hosts(args.host)
        resolved_cluster_type = "manual"
        target_groups = ["explicit-hosts"]
    else:
        conf = load_json(args.json)
        resolved_cluster_type = cluster_type(conf)
        target_groups = resolve_target_groups(conf, args.targets)
        targets = gather_targets(conf, args.targets)
    if not targets:
        raise ValueError("no collection targets resolved")

    output_path = Path(args.output).expanduser() if args.output else default_output_path()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if args.dry_run:
        print(
            json.dumps(
                {
                    "output": str(output_path),
                    "clusterType": resolved_cluster_type,
                    "targetGroups": target_groups,
                    "targetCount": len(targets),
                    "targets": targets,
                    "items": selected_codes,
                    "catalog": args.catalog,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    local_ipv4s = get_local_ipv4s()
    failures = 0
    with output_path.open("w", encoding="utf-8", newline="\n") as handle:
        write_report_header(
            handle,
            output_path,
            targets,
            selected_codes,
            catalog,
            resolved_cluster_type,
            target_groups,
        )
        for target in targets:
            payload = build_payload(
                checks=checks,
                target=target,
                timeout_seconds=args.timeout,
                collector_version="1.0",
                catalog_source=str(catalog.get("source", "")),
                max_output_lines=args.max_output_lines,
            )
            rc = run_payload(
                target=target,
                payload=payload,
                handle=handle,
                ssh_user=args.ssh_user,
                ssh_port=args.ssh_port,
                local_ipv4s=local_ipv4s,
            )
            if rc != 0:
                failures += 1

    print(
        json.dumps(
            {
                "output": str(output_path.resolve()),
                "targets": len(targets),
                "targetList": targets,
                "clusterType": resolved_cluster_type,
                "targetGroups": target_groups,
                "items": len(selected_codes),
                "transportFailures": failures,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if failures == 0 else 2


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, FileNotFoundError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
