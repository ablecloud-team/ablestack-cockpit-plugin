#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import {
  Presentation,
  PresentationFile,
  SpreadsheetFile,
  Workbook,
} from "@oai/artifact-tool";

const COLORS = {
  cyan: "#29B8E6",
  orange: "#E56A00",
  ink: "#111827",
  muted: "#64748B",
  line: "#D7E2EA",
  paper: "#FFFFFF",
  terminal: "#080C10",
  terminalBar: "#17212B",
  terminalText: "#E6EDF3",
  terminalMuted: "#9FB1C1",
  terminalGreen: "#77D28C",
};

function parseArgs(argv) {
  const result = {
    input: "",
    outputDir: "",
    baseName: "",
    formats: new Set(["pptx", "xlsx"]),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") result.input = argv[++index] || "";
    else if (arg === "--output-dir") result.outputDir = argv[++index] || "";
    else if (arg === "--base-name") result.baseName = argv[++index] || "";
    else if (arg === "--format") {
      const value = (argv[++index] || "both").toLowerCase();
      result.formats =
        value === "both" ? new Set(["pptx", "xlsx"]) : new Set([value]);
    } else if (arg === "-h" || arg === "--help") {
      console.log(
        "Usage: generate_reports.mjs --input evidence.txt --output-dir DIR " +
          "[--base-name NAME] [--format both|pptx|xlsx]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!result.input) throw new Error("--input is required");
  if (!result.outputDir) throw new Error("--output-dir is required");
  for (const format of result.formats) {
    if (!["pptx", "xlsx"].includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }
  }
  return result;
}

function safeName(value) {
  return String(value || "unknown")
    .normalize("NFKC")
    .replace(/[^0-9A-Za-z가-힣._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function fieldFrom(block, name) {
  const match = block.match(new RegExp(`^${name}:\\s*(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

function parseEvidence(text) {
  const headerEnd = text.indexOf("ABLESTACK HOST BEGIN");
  const reportHeader = headerEnd >= 0 ? text.slice(0, headerEnd) : text;
  const metadata = {};
  for (const line of reportHeader.split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index > 0) {
      metadata[line.slice(0, index).trim()] = line.slice(index + 1).trim();
    }
  }

  const items = [];
  const pattern = /ABLESTACK ITEM BEGIN\r?\n([\s\S]*?)\r?\nABLESTACK ITEM END/g;
  for (const match of text.matchAll(pattern)) {
    const block = `ABLESTACK ITEM BEGIN\n${match[1]}\nABLESTACK ITEM END`;
    const exitCodes = [...block.matchAll(/^EXIT_CODE:\s*(-?\d+)/gm)].map(
      (entry) => Number(entry[1]),
    );
    items.push({
      code: fieldFrom(block, "ITEM_CODE"),
      title: fieldFrom(block, "ITEM_TITLE"),
      importance: fieldFrom(block, "IMPORTANCE"),
      guideStatus: fieldFrom(block, "GUIDE_STATUS"),
      guideNote: fieldFrom(block, "GUIDE_NOTE"),
      exceptionReason:
        fieldFrom(block, "EXCEPTION_REASON") || fieldFrom(block, "예외처리"),
      host: fieldFrom(block, "HOST"),
      target: fieldFrom(block, "TARGET"),
      collectedAt: fieldFrom(block, "COLLECTED_AT"),
      itemStatus: fieldFrom(block, "ITEM_STATUS"),
      commandCount: (block.match(/^COMMAND_INDEX:/gm) || []).length,
      nonzeroCount: exitCodes.filter((value) => value !== 0).length,
      raw: block,
    });
  }
  if (!items.length) {
    throw new Error("No ABLESTACK ITEM blocks were found in the evidence file");
  }
  return { metadata, items };
}

function visualWidth(character) {
  const code = character.codePointAt(0) || 0;
  return code >= 0x1100 ? 2 : 1;
}

function wrapLine(line, maxWidth = 118) {
  if (!line) return [""];
  const output = [];
  let current = "";
  let width = 0;
  for (const character of Array.from(line.replace(/\t/g, "    "))) {
    const nextWidth = visualWidth(character);
    if (width + nextWidth > maxWidth && current) {
      output.push(current);
      current = character;
      width = nextWidth;
    } else {
      current += character;
      width += nextWidth;
    }
  }
  output.push(current);
  return output;
}

function screenshotLines(item) {
  const rawLines = item.raw.split(/\r?\n/);
  const lines = [];
  for (const line of rawLines) {
    if (
      line === "ABLESTACK ITEM BEGIN" ||
      line === "ABLESTACK ITEM END" ||
      line === "OUTPUT_BEGIN" ||
      line === "OUTPUT_END"
    ) {
      continue;
    }
    lines.push(...wrapLine(line));
  }
  return lines;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lineColor(line) {
  if (line.startsWith("ITEM_CODE:") || line.startsWith("ITEM_TITLE:")) {
    return COLORS.terminalGreen;
  }
  if (/^\[[^\]]+@[^\]]+ ~\]#/.test(line)) return "#FFAE57";
  if (
    line.startsWith("COMMAND_") ||
    line.startsWith("EXIT_CODE:") ||
    line.startsWith("ITEM_STATUS:")
  ) {
    return "#8CC8FF";
  }
  if (
    line.startsWith("GUIDE_") ||
    line.startsWith("IMPORTANCE:") ||
    line.startsWith("COLLECTED_AT:")
  ) {
    return COLORS.terminalMuted;
  }
  return COLORS.terminalText;
}

async function renderTerminalPages(item, outputDir) {
  const allLines = screenshotLines(item);
  const linesPerPage = 29;
  const pages = [];
  const pageCount = Math.max(1, Math.ceil(allLines.length / linesPerPage));
  const width = 1440;
  const height = 810;
  const fontSize = 18;
  const lineHeight = 23;

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const pageLines = allLines.slice(
      pageIndex * linesPerPage,
      (pageIndex + 1) * linesPerPage,
    );
    const title = `${item.code} ${item.title} · ${item.host || item.target} · ${
      pageIndex + 1
    }/${pageCount}`;
    const textNodes = pageLines
      .map((line, index) => {
        const y = 105 + index * lineHeight;
        return `<text x="34" y="${y}" fill="${lineColor(
          line,
        )}" font-size="${fontSize}" font-family="DejaVu Sans Mono, Noto Sans Mono CJK KR, Apple SD Gothic Neo, monospace">${escapeXml(
          line,
        )}</text>`;
      })
      .join("");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="${width}" height="${height}" rx="18" fill="${COLORS.terminal}"/>
        <path d="M18 0 H1422 A18 18 0 0 1 1440 18 V68 H0 V18 A18 18 0 0 1 18 0" fill="${COLORS.terminalBar}"/>
        <circle cx="30" cy="34" r="8" fill="#FF5F57"/>
        <circle cx="56" cy="34" r="8" fill="#FEBC2E"/>
        <circle cx="82" cy="34" r="8" fill="#28C840"/>
        <text x="110" y="42" fill="#D7E2EA" font-size="19" font-weight="700" font-family="DejaVu Sans, Noto Sans CJK KR, Apple SD Gothic Neo, sans-serif">${escapeXml(
          title,
        )}</text>
        ${textNodes}
      </svg>`;
    const filename = `${safeName(item.host || item.target)}__${safeName(
      item.code,
    )}__p${String(pageIndex + 1).padStart(2, "0")}.png`;
    const outputPath = path.join(outputDir, filename);
    await sharp(Buffer.from(svg)).png().toFile(outputPath);
    pages.push(outputPath);
  }
  return pages;
}

async function readImageArrayBuffer(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function saveBlob(filename, blob) {
  await fs.writeFile(filename, new Uint8Array(await blob.arrayBuffer()));
}

function addText(slide, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = style;
  return shape;
}

async function buildPresentation(report, rendered, outputPath, qaDir) {
  const presentation = Presentation.create({
    slideSize: { width: 1280, height: 720 },
  });

  const titleSlide = presentation.slides.add();
  titleSlide.background.fill = COLORS.paper;
  titleSlide.shapes.add({
    geometry: "line",
    position: { left: 72, top: 72, width: 1136, height: 0 },
    line: { style: "solid", fill: COLORS.cyan, width: 3 },
    fill: "none",
  });
  addText(
    titleSlide,
    "ABLESTACK 보안 취약점 증적",
    { left: 72, top: 158, width: 920, height: 80 },
    { fontSize: 48, bold: true, color: COLORS.ink },
  );
  addText(
    titleSlide,
    "호스트·항목 코드·실행 명령·원문 출력을 하나의 보고서로 자동 생성",
    { left: 72, top: 258, width: 970, height: 64 },
    { fontSize: 24, color: COLORS.muted },
  );
  const hostCount = new Set(report.items.map((item) => item.host || item.target))
    .size;
  addText(
    titleSlide,
    `호스트 ${hostCount}대 · 증적 항목 ${report.items.length}건`,
    { left: 72, top: 438, width: 600, height: 42 },
    { fontSize: 24, bold: true, color: COLORS.orange },
  );
  addText(
    titleSlide,
    report.metadata.GENERATED_AT || report.items[0].collectedAt || "",
    { left: 72, top: 496, width: 600, height: 34 },
    { fontSize: 18, color: COLORS.muted },
  );
  addText(
    titleSlide,
    "근거: ABLESTACK 보안취약점 가이드 v1.3 / KISA 2026",
    { left: 72, top: 620, width: 900, height: 28 },
    { fontSize: 16, color: COLORS.muted },
  );

  for (const entry of rendered) {
    for (let pageIndex = 0; pageIndex < entry.pages.length; pageIndex += 1) {
      const slide = presentation.slides.add();
      slide.background.fill = COLORS.paper;
      slide.shapes.add({
        geometry: "line",
        position: { left: 64, top: 64, width: 1152, height: 0 },
        line: { style: "solid", fill: COLORS.cyan, width: 2 },
        fill: "none",
      });
      addText(
        slide,
        `${entry.item.code} ${entry.item.title}`,
        { left: 64, top: 78, width: 960, height: 42 },
        { fontSize: 30, bold: true, color: COLORS.ink },
      );
      addText(
        slide,
        `${entry.item.host || entry.item.target} · ${
          entry.item.collectedAt
        } · ${pageIndex + 1}/${entry.pages.length}`,
        { left: 64, top: 122, width: 930, height: 28 },
        { fontSize: 16, color: COLORS.muted },
      );
      addText(
        slide,
        entry.item.guideStatus || "",
        { left: 1050, top: 84, width: 150, height: 32 },
        {
          fontSize: 20,
          bold: true,
          color:
            entry.item.guideStatus === "양호"
              ? "#15803D"
              : COLORS.orange,
          alignment: "right",
        },
      );
      slide.images.add({
        blob: await readImageArrayBuffer(entry.pages[pageIndex]),
        contentType: "image/png",
        alt: `${entry.item.code} terminal evidence`,
        fit: "contain",
        position: { left: 64, top: 164, width: 1152, height: 510 },
      });
    }
  }

  await fs.mkdir(qaDir, { recursive: true });
  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(3, "0")}`;
    await saveBlob(
      path.join(qaDir, `${stem}.png`),
      await presentation.export({ slide, format: "png", scale: 1 }),
    );
    await fs.writeFile(
      path.join(qaDir, `${stem}.layout.json`),
      await (await slide.export({ format: "layout" })).text(),
    );
  }
  await saveBlob(
    path.join(qaDir, "montage.webp"),
    await presentation.export({ format: "webp", montage: true, scale: 0.35 }),
  );
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(outputPath);
}

function columnName(index) {
  let value = index + 1;
  let output = "";
  while (value > 0) {
    value -= 1;
    output = String.fromCharCode(65 + (value % 26)) + output;
    value = Math.floor(value / 26);
  }
  return output;
}

async function buildWorkbook(report, rendered, outputPath, qaDir) {
  const workbook = Workbook.create();
  const summary = workbook.worksheets.add("요약");
  summary.showGridLines = false;
  summary.freezePanes.freezeRows(5);
  summary.getRange("A1:J1").merge();
  summary.getRange("A1").values = [["ABLESTACK 보안 취약점 증적 요약"]];
  summary.getRange("A1:J1").format = {
    fill: COLORS.cyan,
    font: { bold: true, color: "#FFFFFF", size: 18 },
    verticalAlignment: "center",
  };
  summary.getRange("A1:J1").format.rowHeight = 34;
  summary.getRange("A2:B4").values = [
    ["생성 시각", report.metadata.GENERATED_AT || ""],
    ["근거 자료", report.metadata.CATALOG_SOURCE || "ABLESTACK 보안취약점 가이드 v1.3"],
    ["원본 증적", report.metadata.OUTPUT_FILE || ""],
  ];
  summary.getRange("A2:A4").format = {
    font: { bold: true, color: COLORS.ink },
    fill: "#EDF7FB",
  };
  summary.getRange("A5:J5").values = [
    [
      "호스트",
      "항목 코드",
      "점검 항목",
      "중요도",
      "가이드 결과",
      "수집 상태",
      "명령 수",
      "비정상 종료 수",
      "증적 이미지 수",
      "예외처리",
    ],
  ];
  summary.getRange("A5:J5").format = {
    fill: "#0F4C5C",
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  const rows = rendered.map((entry) => [
    entry.item.host || entry.item.target,
    entry.item.code,
    entry.item.title,
    entry.item.importance,
    entry.item.guideStatus,
    entry.item.itemStatus,
    entry.item.commandCount,
    entry.item.nonzeroCount,
    entry.pages.length,
    entry.item.exceptionReason,
  ]);
  if (rows.length) {
    const endRow = 5 + rows.length;
    summary.getRange(`A6:J${endRow}`).values = rows;
    summary.getRange(`A6:J${endRow}`).format = {
      verticalAlignment: "center",
      borders: {
        insideHorizontal: { style: "thin", color: "#D7E2EA" },
        bottom: { style: "thin", color: "#D7E2EA" },
      },
    };
    summary.getRange(`G6:I${endRow}`).format.horizontalAlignment = "right";
    summary.getRange(`F6:F${endRow}`).conditionalFormats.addCustom(
      `=$F6="COLLECTED"`,
      { fill: "#DCFCE7", font: { color: "#166534" } },
    );
    summary.getRange(`F6:F${endRow}`).conditionalFormats.addCustom(
      `=$F6="COLLECTED_WITH_NONZERO_EXIT"`,
      { fill: "#FEF3C7", font: { color: "#92400E" } },
    );
    summary.getRange(`E6:E${endRow}`).conditionalFormats.addCustom(
      `=$E6="예외처리"`,
      { fill: "#FFEDD5", font: { color: "#9A3412" } },
    );
  }
  const widths = [18, 12, 40, 10, 14, 30, 10, 14, 14, 80];
  widths.forEach((width, index) => {
    summary.getRange(`${columnName(index)}:${columnName(index)}`).format.columnWidth =
      width;
  });
  summary.getRange("A:J").format.wrapText = true;

  const grouped = new Map();
  for (const entry of rendered) {
    const host = entry.item.host || entry.item.target || "unknown";
    if (!grouped.has(host)) grouped.set(host, []);
    grouped.get(host).push(entry);
  }
  const usedSheetNames = new Set(["요약"]);
  for (const [host, entries] of grouped.entries()) {
    let sheetName = safeName(host).slice(0, 25) || "host";
    let suffix = 1;
    while (usedSheetNames.has(sheetName)) {
      suffix += 1;
      sheetName = `${safeName(host).slice(0, 21)}_${suffix}`;
    }
    usedSheetNames.add(sheetName);
    const sheet = workbook.worksheets.add(sheetName);
    sheet.showGridLines = false;
    sheet.freezePanes.freezeRows(2);
    sheet.getRange("A1:J1").merge();
    sheet.getRange("A1").values = [[`호스트 증적: ${host}`]];
    sheet.getRange("A1:J1").format = {
      fill: COLORS.cyan,
      font: { bold: true, color: "#FFFFFF", size: 16 },
      verticalAlignment: "center",
    };
    sheet.getRange("A1:J1").format.rowHeight = 30;
    for (let col = 0; col < 10; col += 1) {
      sheet.getRange(`${columnName(col)}:${columnName(col)}`).format.columnWidth = 14;
    }

    let row = 3;
    for (const entry of entries) {
      for (let pageIndex = 0; pageIndex < entry.pages.length; pageIndex += 1) {
        sheet.getRange(`A${row}:J${row}`).merge();
        sheet.getRange(`A${row}`).values = [
          [
            `${entry.item.code} ${entry.item.title} · ${pageIndex + 1}/${
              entry.pages.length
            } · ${entry.item.collectedAt}`,
          ],
        ];
        sheet.getRange(`A${row}:J${row}`).format = {
          fill: "#EDF7FB",
          font: { bold: true, color: COLORS.ink },
          borders: { preset: "outside", style: "thin", color: "#B7D8E5" },
        };
        sheet.getRange(`A${row}:J${row}`).format.rowHeight = 24;
        const imageData = await fs.readFile(entry.pages[pageIndex], "base64");
        sheet.images.add({
          dataUrl: `data:image/png;base64,${imageData}`,
          anchor: {
            from: { row, col: 0 },
            extent: { widthPx: 980, heightPx: 551 },
          },
        });
        for (let imageRow = row + 1; imageRow <= row + 27; imageRow += 1) {
          sheet.getRange(`A${imageRow}:J${imageRow}`).format.rowHeight = 15;
        }
        row += 30;
      }
    }
  }

  await fs.mkdir(qaDir, { recursive: true });
  for (const sheet of workbook.worksheets.items) {
    const preview = await workbook.render({
      sheetName: sheet.name,
      autoCrop: "all",
      scale: 0.8,
      format: "png",
    });
    await saveBlob(path.join(qaDir, `${safeName(sheet.name)}.png`), preview);
  }
  const inspect = await workbook.inspect({
    kind: "workbook,sheet,table",
    maxChars: 5000,
    tableMaxRows: 8,
    tableMaxCols: 10,
  });
  await fs.writeFile(path.join(qaDir, "inspect.ndjson"), inspect.ndjson);
  const errors = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 200 },
    summary: "final formula error scan",
  });
  await fs.writeFile(path.join(qaDir, "formula-errors.ndjson"), errors.ndjson);
  const xlsx = await SpreadsheetFile.exportXlsx(workbook);
  await xlsx.save(outputPath);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input);
  const outputDir = path.resolve(args.outputDir);
  const screenshotDir = path.join(outputDir, "screenshots");
  const qaDir = path.join(outputDir, "qa");
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.mkdir(qaDir, { recursive: true });

  const report = parseEvidence(await fs.readFile(inputPath, "utf8"));
  const rendered = [];
  for (const item of report.items) {
    rendered.push({
      item,
      pages: await renderTerminalPages(item, screenshotDir),
    });
  }

  const defaultBase = path.basename(inputPath, path.extname(inputPath));
  const baseName = safeName(args.baseName || defaultBase);
  const result = {
    input: inputPath,
    screenshots: rendered.reduce((sum, entry) => sum + entry.pages.length, 0),
  };
  if (args.formats.has("pptx")) {
    const pptxPath = path.join(outputDir, `${baseName}.pptx`);
    await buildPresentation(
      report,
      rendered,
      pptxPath,
      path.join(qaDir, "pptx"),
    );
    result.pptx = pptxPath;
  }
  if (args.formats.has("xlsx")) {
    const xlsxPath = path.join(outputDir, `${baseName}.xlsx`);
    await buildWorkbook(
      report,
      rendered,
      xlsxPath,
      path.join(qaDir, "xlsx"),
    );
    result.xlsx = xlsxPath;
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
