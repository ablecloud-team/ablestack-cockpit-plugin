#!/usr/bin/env bash
#
# mold-alias-links.sh
#
# CCVM/호스트 공용 "심볼릭 링크만" 설정 스크립트입니다.
# - 디렉터리 생성(mkdir) 하지 않습니다.
# - 타겟(원본) 디렉터리가 존재할 때만 링크를 만듭니다.
# - 링크 위치에 이미 파일/디렉터리/링크가 있으면 건드리지 않습니다.
# - 링크의 부모 디렉터리가 없으면 스킵합니다.
# - 출력은 시작 메시지 1줄만 찍습니다.
#

set -e

link_if_possible() {
  local target="$1"
  local link="$2"
  local parent

  parent="$(dirname "$link")"

  # 원본 디렉터리가 없으면 스킵합니다.
  [ -d "$target" ] || return 0

  # 부모 디렉터리가 없으면(mkdir 금지) 스킵합니다.
  [ -d "$parent" ] || return 0

  # 이미 존재하면 스킵합니다.
  ([ -e "$link" ] || [ -L "$link" ]) && return 0

  ln -s "$target" "$link"
}

# 공통(관리서버/호스트)
link_if_possible "/var/log/cloudstack" "/var/log/mold"
link_if_possible "/var/lib/cloudstack" "/var/lib/mold"
link_if_possible "/etc/cloudstack" "/etc/mold"

link_if_possible "/usr/share/cloudstack-common" "/usr/share/mold-common"
link_if_possible "/usr/share/cloudstack-agent" "/usr/share/mold-agent"

# 관리서버에만 보통 존재(있으면 생성됨)
link_if_possible "/usr/share/cloudstack-management" "/usr/share/mold-management"
link_if_possible "/usr/share/cloudstack-usage" "/usr/share/mold-usage"
link_if_possible "/usr/share/cloudstack-ui" "/usr/share/mold-ui"

# (선택) 아카이브 로그 (있을 때만)
link_if_possible "/var/log/archive/var/log/cloudstack" "/var/log/archive/var/log/mold"

# /usr/share/doc 버전별 문서 별칭(있을 때만)
if [ -d "/usr/share/doc" ]; then
  for d in /usr/share/doc/cloudstack-*; do
    [ -d "$d" ] || continue
    base="$(basename "$d")"
    mold_base="mold${base#cloudstack}"
    link_if_possible "$d" "/usr/share/doc/${mold_base}"
  done
fi