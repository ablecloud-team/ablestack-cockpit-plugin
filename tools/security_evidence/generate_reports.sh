#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="${ABLESTACK_REPORT_NODE:-node}"
REPORT_NODE_MODULES="${ABLESTACK_REPORT_NODE_MODULES:-}"

if [[ -z "$REPORT_NODE_MODULES" ]]; then
    echo "ABLESTACK_REPORT_NODE_MODULES 환경변수에 @oai/artifact-tool과 sharp가 설치된 node_modules 경로를 지정하십시오." >&2
    exit 2
fi
if [[ ! -d "$REPORT_NODE_MODULES/@oai/artifact-tool" ]]; then
    echo "@oai/artifact-tool을 찾을 수 없습니다: $REPORT_NODE_MODULES" >&2
    exit 2
fi
if [[ ! -d "$REPORT_NODE_MODULES/sharp" ]]; then
    echo "sharp를 찾을 수 없습니다: $REPORT_NODE_MODULES" >&2
    exit 2
fi

REPORT_WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ablestack-security-report.XXXXXX")"
cleanup() {
    rm -rf "$REPORT_WORK_DIR"
}
trap cleanup EXIT

ln -s "$REPORT_NODE_MODULES" "$REPORT_WORK_DIR/node_modules"
cp "$SCRIPT_DIR/generate_reports.mjs" "$REPORT_WORK_DIR/generate_reports.mjs"

"$NODE_BIN" "$REPORT_WORK_DIR/generate_reports.mjs" "$@"
