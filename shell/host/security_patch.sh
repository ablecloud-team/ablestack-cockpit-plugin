#!/bin/bash
# 사용법 예) sh security_update.sh -P 10022 -C true

set -euo pipefail

#====================[ 옵션/기본값 ]====================#
SSH_PORT=""                 # -P 로 숫자 주면 적용
CEPH_SSH_CHECK="false"      # -C true|false
SSHD_CONFIG="/etc/ssh/sshd_config"
PERMITROOTLOGIN_CONF="/etc/ssh/sshd_config.d/01-permitrootlogin.conf"
CONFIG_PATH="/usr/share/ablestack/ceph_ssh_config"
SSH_SCAN_SCRIPT="/usr/share/cockpit/ablestack/shell/host/ssh-scan.sh"
TARGET_HOST="scvm"
SSH_USER="root"
PORT_CHANGE_ONLY="false"        # --port-change 사용 시 true 로 설정
CEPH_SSH_CHANGE_ONLY="false"    # --ceph-ssh-change 사용 시 true 로 설정

print_usage() {
  echo "Usage: $0 [-P <port>] [-C <true|false>] [--port-change] [--ceph-ssh-change]"
  echo "  -P : SSH 포트(1~65535). 지정 시에만 SSH 설정/재시작 수행"
  echo "  --port-change      : SSH 포트 변경만 수행하고 다른 보안 설정은 건너뜁니다"
  echo "  --ceph-ssh-change  : ceph cephadm SSH 설정만 갱신하고 다른 보안 설정은 건너뜁니다"
}

#====================[ 롱옵션 선파싱 ]====================#
# getopts 는 롱옵션을 지원하지 않으므로, 먼저 --port-change / --ceph-ssh-change 를 골라낸 뒤
# 나머지 인자들만으로 getopts 를 돌립니다.
RAW_ARGS=("$@")
CLEAN_ARGS=()
for arg in "${RAW_ARGS[@]}"; do
  case "$arg" in
    --port-change)
      PORT_CHANGE_ONLY="true"
      ;;
    --ceph-ssh-change)
      CEPH_SSH_CHANGE_ONLY="true"
      ;;
    *)
      CLEAN_ARGS+=("$arg")
      ;;
  esac
done
set -- "${CLEAN_ARGS[@]}"

#====================[ 단축 옵션 파싱(getopts) ]====================#
while getopts ":P:h" opt; do
  case "$opt" in
    P) SSH_PORT="$OPTARG" ;;
    C) CEPH_SSH_CHECK="$OPTARG" ;;
    h) print_usage; exit 0 ;;
    \?) echo "잘못된 옵션: -$OPTARG"; print_usage; exit 2 ;;
    :)  echo "옵션 -$OPTARG 에 값이 필요합니다"; print_usage; exit 2 ;;
  esac
done

is_valid_port() {
  [[ "$1" =~ ^[0-9]+$ ]] && (( 1 <= $1 && $1 <= 65535 ))
}

ensure_permit_root_login() {
  local target="$1"

  if grep -qE '^[[:space:]#]*PermitRootLogin[[:space:]]+' "$target" 2>/dev/null; then
    sed -i 's/^[[:space:]#]*PermitRootLogin[[:space:]].*/PermitRootLogin prohibit-password/' "$target"
  else
    echo 'PermitRootLogin prohibit-password' >> "$target"
  fi
}

update_ssh_scan_port() {
  local target="$1"
  local port="$2"

  if [[ ! -f "$target" ]]; then
    echo "[WARN] ssh-scan 스크립트를 찾을 수 없습니다: $target"
    return 0
  fi

  if grep -qE '^[[:space:]]*/usr/bin/ssh-keyscan[[:space:]]+-4[[:space:]]+-T[[:space:]]+1' "$target"; then
    sed -i -E "s#(^[[:space:]]*/usr/bin/ssh-keyscan[[:space:]]+-4[[:space:]]+-T[[:space:]]+1)([[:space:]]+-p[[:space:]]+[0-9]+)?#\\1 -p ${port}#" "$target"
    echo "[INFO] ssh_scan.sh 변경 완료"
  else
    echo "[WARN] ssh-scan 포트 변경 대상 줄을 찾을 수 없습니다: $target"
  fi
}

#====================[ firewalld 서비스 보장 ]====================#
ensure_firewalld() {
    # firewall-cmd가 없으면 firewalld 미사용 환경으로 판단
    if ! command -v firewall-cmd >/dev/null 2>&1; then
        return 0
    fi

    # firewalld가 꺼져 있을 때만 시작
    if ! systemctl is-active --quiet firewalld; then
        echo "[INFO] firewalld 서비스를 시작합니다."
        systemctl start firewalld
    else
        echo "[INFO] firewalld 서비스가 이미 실행 중입니다."
    fi

    # 부팅 시 자동 시작 보장
    if ! systemctl is-enabled --quiet firewalld; then
        systemctl enable firewalld
        echo "[INFO] firewalld enable 완료"
    fi
}

ensure_firewalld

#====================[ Ceph SSH 설정만 수행하는 모드 ]====================#
#  - 용도: 이미 호스트 SSH 포트는 바꾼 뒤, ceph cephadm ssh-config만 따로 맞추고 싶을 때
#  - 호출 예: security_update.sh -P 10022 --ceph-ssh-change
if [[ "$CEPH_SSH_CHANGE_ONLY" == "true" ]]; then
  if [[ -z "${SSH_PORT}" ]] || ! is_valid_port "${SSH_PORT}"; then
    echo "[ERROR] --ceph-ssh-change 옵션을 사용할 때는 -P <포트(1~65535)> 를 함께 지정해야 합니다."
    exit 1
  fi

  shopt -s nocasematch
  if ! command -v ceph >/dev/null 2>&1; then
    echo "[WARN] ceph 명령 부재: cephadm SSH 설정을 수행할 수 없습니다."
  else
    echo "[INFO] (ceph-ssh-change) cephadm SSH 설정을 포트 ${SSH_PORT} 로 업데이트합니다."

    # ceph cephadm get-ssh-config 실패해도 스크립트 전체는 계속 진행합니다.
    if ceph cephadm get-ssh-config > "${CONFIG_PATH}"; then
      sed -i '/^\s*Port\s\+[0-9]\+/d' "${CONFIG_PATH}"
      echo "  Port ${SSH_PORT}" >> "${CONFIG_PATH}"

      # set-ssh-config 실패도 전체 실패로 보지 않고 경고만 남깁니다.
      if ceph cephadm set-ssh-config -i "${CONFIG_PATH}"; then
        echo "[INFO] (ceph-ssh-change) cephadm SSH 설정 반영 완료: ${CONFIG_PATH}"
      else
        echo "[WARN] (ceph-ssh-change) cephadm set-ssh-config 실패: 세부 내용은 ceph 로그를 확인하세요."
      fi
    else
      echo "[WARN] (ceph-ssh-change) cephadm get-ssh-config 실패: SSH 설정을 갱신하지 못했습니다."
    fi
  fi
  shopt -u nocasematch

  # 파이썬 쪽 SUCCESS_PATTERN 매칭용
  echo "Permissions have been updated."
  exit 0
fi

#====================[ 1) SSH 포트 설정(조건부) ]====================#
if [[ -n "$SSH_PORT" ]]; then
  if ! is_valid_port "$SSH_PORT"; then
    echo "[ERROR] 잘못된 포트: $SSH_PORT (1~65535)"
    exit 1
  fi
  echo "[INFO] SSH 포트를 ${SSH_PORT}로 설정합니다"

  # sshd_config 수정
  sed -i "s/^[#]*Port[[:space:]]\+[0-9]\+/Port ${SSH_PORT}/" "$SSHD_CONFIG" || true
  grep -qE '^[#]*Port[[:space:]]+[0-9]+' "$SSHD_CONFIG" || echo "Port ${SSH_PORT}" >> "$SSHD_CONFIG"

  # ClientAlive 설정은 SSH 포트 변경 시에도 유지합니다.
  grep -q '^ClientAliveInterval' "$SSHD_CONFIG" \
    && sed -i 's/^ClientAliveInterval .*/ClientAliveInterval 0/' "$SSHD_CONFIG" \
    || echo 'ClientAliveInterval 0' >> "$SSHD_CONFIG"

  grep -q '^ClientAliveCountMax' "$SSHD_CONFIG" \
    && sed -i 's/^ClientAliveCountMax .*/ClientAliveCountMax 3/' "$SSHD_CONFIG" \
    || echo 'ClientAliveCountMax 3' >> "$SSHD_CONFIG"

  # --port-change는 포트 변경 전용이므로 PermitRootLogin은 건드리지 않습니다.
  # 일반 보안 패치에서는 기존 정책(prohibit-password)을 그대로 적용합니다.
  if [[ "$PORT_CHANGE_ONLY" != "true" ]]; then
    ensure_permit_root_login "$SSHD_CONFIG"
    ensure_permit_root_login "$PERMITROOTLOGIN_CONF"
  fi

  # /root/.ssh/config 갱신
  cat > /root/.ssh/config <<EOF
Host *
    User root
    Port ${SSH_PORT}
EOF
  chmod 600 /root/.ssh/config

  # 방화벽/SELinux
  command -v firewall-cmd >/dev/null 2>&1 && {
    firewall-cmd --add-port=${SSH_PORT}/tcp --permanent >/dev/null 2>&1 || true
    firewall-cmd --reload >/dev/null 2>&1 || true
  }
  command -v semanage >/dev/null 2>&1 && {
    semanage port -a -t ssh_port_t -p tcp ${SSH_PORT} 2>/dev/null || \
    semanage port -m -t ssh_port_t -p tcp ${SSH_PORT} 2>/dev/null || true
  }

  # 설정 검증 후 재시작
  if sshd -t 2>/dev/null; then
    systemctl restart sshd
    echo "[INFO] sshd 재시작 완료(포트=${SSH_PORT})"
    update_ssh_scan_port "$SSH_SCAN_SCRIPT" "$SSH_PORT"
  else
    echo "[ERROR] sshd 설정 문법 오류로 재시작 중단"
    exit 1
  fi

  #====================[ 2) cephadm SSH 설정(조건부) ]====================#
  shopt -s nocasematch
  if [[ "$CEPH_SSH_CHECK" == "true" ]]; then
    if ! command -v ceph >/dev/null 2>&1; then
      echo "[WARN] ceph 명령 부재: cephadm 설정 생략합니다."
    else
      echo "[INFO] cephadm SSH 설정을 업데이트합니다"

      # ceph cephadm get-ssh-config 실패해도 스크립트 전체는 계속 진행합니다.
      if ceph cephadm get-ssh-config > "$CONFIG_PATH"; then
        sed -i '/^\s*Port\s\+[0-9]\+/d' "$CONFIG_PATH"
        echo "  Port ${SSH_PORT}" >> "$CONFIG_PATH"

        # set-ssh-config 실패도 경고만 남기고 계속 진행합니다.
        if ceph cephadm set-ssh-config -i "$CONFIG_PATH"; then
          echo "[INFO] cephadm SSH 설정 반영 완료: ${CONFIG_PATH}"
        else
          echo "[WARN] cephadm set-ssh-config 실패: 계속 진행합니다."
        fi
      else
        echo "[WARN] cephadm get-ssh-config 실패: cephadm SSH 설정을 생략하고 계속 진행합니다."
      fi
    fi
  else
    echo "[INFO] -C=false: cephadm SSH 설정을 건너뜁니다."
  fi
  shopt -u nocasematch

  # ---- 여기서 포트 변경만 하고 끝낼지 여부 결정 ---- #
  if [[ "$PORT_CHANGE_ONLY" == "true" ]]; then
    echo "[INFO] --port-change 옵션 사용: SSH 포트(및 cephadm 설정)만 변경하고 종료합니다."
    echo "Permissions have been updated."
    exit 0
  fi

else
  # 포트 변경만 요청했는데 -P 가 없으면 에러
  if [[ "$PORT_CHANGE_ONLY" == "true" ]]; then
    echo "[ERROR] --port-change 옵션을 사용하려면 -P <포트>를 함께 지정해야 합니다."
    exit 1
  fi
  ensure_permit_root_login "$SSHD_CONFIG"
  ensure_permit_root_login "$PERMITROOTLOGIN_CONF"
  echo "[INFO] -P 미지정: SSH/cephadm 포트 관련 변경을 모두 생략합니다."
fi

### 비밀번호 복잡성 설정

# 파일 경로 설정
SYSTEM_AUTH="/etc/pam.d/system-auth"
PASSWORD_AUTH="/etc/pam.d/password-auth"
PWQUALITY_CONF="/etc/security/pwquality.conf"

# 백업 파일 생성
cp $SYSTEM_AUTH "${SYSTEM_AUTH}.bak"
cp $PASSWORD_AUTH "${PASSWORD_AUTH}.bak"
cp $PWQUALITY_CONF "${PWQUALITY_CONF}.bak"

# system-auth와 password-auth 파일에서 pam_pwquality.so 줄에 enforce_for_root 추가
for FILE in $SYSTEM_AUTH $PASSWORD_AUTH; do
    if grep -q 'password.*requisite.*pam_pwquality.so.*local_users_only' $FILE; then
        sed -i '/password.*requisite.*pam_pwquality.so.*local_users_only/ s/$/ enforce_for_root/' $FILE
        echo "$FILE 파일의 pam_pwquality.so 모듈에 enforce_for_root 옵션이 성공적으로 추가되었습니다."
    else
        echo "$FILE 파일에서 password requisite pam_pwquality.so local_users_only 줄을 찾을 수 없습니다."
    fi
done

grep -qxF 'auth required /usr/lib64/security/pam_faillock.so preauth silent audit deny=5 unlock_time=120' /etc/pam.d/system-auth || echo 'auth required /usr/lib64/security/pam_faillock.so preauth silent audit deny=5 unlock_time=120' >> $SYSTEM_AUTH
grep -qxF 'auth [default=die] /usr/lib64/security/pam_faillock.so authfail deny=5 unlock_time=120' /etc/pam.d/system-auth || echo 'auth [default=die] /usr/lib64/security/pam_faillock.so authfail deny=5 unlock_time=120' >> $SYSTEM_AUTH

# pwquality.conf 파일의 설정 변경
sed -i 's/^#*\s*lcredit\s*=.*/lcredit = -1/' $PWQUALITY_CONF
sed -i 's/^#*\s*ucredit\s*=.*/ucredit = -1/' $PWQUALITY_CONF
sed -i 's/^#*\s*dcredit\s*=.*/dcredit = -1/' $PWQUALITY_CONF
sed -i 's/^#*\s*ocredit\s*=.*/ocredit = -1/' $PWQUALITY_CONF
sed -i 's/^#*\s*minlen\s*=.*/minlen = 9/' $PWQUALITY_CONF
sed -i 's/^#*\s*difok\s*=.*/difok = 4/' $PWQUALITY_CONF

# 설정이 없는 경우 파일 끝에 추가
grep -q '^\s*lcredit\s*=' $PWQUALITY_CONF || echo 'lcredit = -1' >> $PWQUALITY_CONF
grep -q '^\s*ucredit\s*=' $PWQUALITY_CONF || echo 'ucredit = -1' >> $PWQUALITY_CONF
grep -q '^\s*dcredit\s*=' $PWQUALITY_CONF || echo 'dcredit = -1' >> $PWQUALITY_CONF
grep -q '^\s*ocredit\s*=' $PWQUALITY_CONF || echo 'ocredit = -1' >> $PWQUALITY_CONF
grep -q '^\s*minlen\s*=' $PWQUALITY_CONF || echo 'minlen = 9' >> $PWQUALITY_CONF
grep -q '^\s*difok\s*=' $PWQUALITY_CONF || echo 'difok = 4' >> $PWQUALITY_CONF

systemctl restart systemd-logind

echo "pwquality.conf 파일이 성공적으로 업데이트되었습니다."

###root 계정 su 제한
# wheel 그룹이 없으면 생성
if ! grep -q '^wheel:' /etc/group; then
    groupadd wheel
    echo "wheel 그룹이 생성되었습니다."
else
    echo "wheel 그룹이 이미 존재합니다."
fi

# /usr/bin/su 파일의 소유 그룹을 wheel로 변경하고 권한 설정
chgrp wheel /usr/bin/su
chmod 4750 /usr/bin/su
echo "/usr/bin/su 파일의 소유 그룹이 wheel로 변경되었고 권한이 설정되었습니다."

# ablecloud 계정 보장(존재하면 속성만 보정)
if id -u ablecloud >/dev/null 2>&1; then
  # 쉘을 보정하고(필요 시), 홈 옮길 땐 -d/-m 조합 사용
  usermod -s /bin/bash ablecloud
else
  # 최초 생성: 홈 만들고 기본 쉘 지정
  useradd -m -s /bin/bash ablecloud
fi

# wheel 그룹 편성 보장(이미 포함이면 아무 것도 안 함)
if id -nG ablecloud | tr ' ' '\n' | grep -qx wheel; then
  :  # no-op
else
  usermod -aG wheel ablecloud
fi

# /etc/pam.d/su 파일에서 auth required pam_wheel.so use_uid 줄의 주석 해제
if grep -q '^#.*auth\s\+required\s\+pam_wheel.so\s\+use_uid' /etc/pam.d/su; then
    sed -i 's/^#\s*\(auth\s\+required\s\+pam_wheel.so\s\+use_uid\)/\1/' /etc/pam.d/su
    echo "/etc/pam.d/su 파일에서 auth required pam_wheel.so use_uid 줄의 주석이 해제되었습니다."
else
    echo "/etc/pam.d/su 파일에 auth required pam_wheel.so use_uid 줄이 이미 활성화되어 있거나 존재하지 않습니다."
fi

###비밀번호 설정
# /etc/login.defs 파일 경로
LOGIN_DEFS="/etc/login.defs"

# 백업 파일 생성
cp $LOGIN_DEFS "${LOGIN_DEFS}.bak"

# PASS_MAX_DAYS, PASS_MIN_DAYS, PASS_MIN_LEN, PASS_WARN_AGE 값 설정
# 이미 설정되어 있는 값을 변경하거나 주석이 되어 있는 경우 값을 업데이트

# PASS_MAX_DAYS 설정
if grep -q '^PASS_MAX_DAYS' $LOGIN_DEFS; then
    sed -i 's/^PASS_MAX_DAYS .*/PASS_MAX_DAYS 31/' $LOGIN_DEFS
else
    echo 'PASS_MAX_DAYS 31' >> $LOGIN_DEFS
fi

# PASS_MIN_DAYS 설정
if grep -q '^PASS_MIN_DAYS' $LOGIN_DEFS; then
    sed -i 's/^PASS_MIN_DAYS .*/PASS_MIN_DAYS 1/' $LOGIN_DEFS
else
    echo 'PASS_MIN_DAYS 1' >> $LOGIN_DEFS
fi

# PASS_MIN_LEN 설정
if grep -q '^PASS_MIN_LEN' $LOGIN_DEFS; then
    sed -i 's/^PASS_MIN_LEN .*/PASS_MIN_LEN 9/' $LOGIN_DEFS
else
    echo 'PASS_MIN_LEN 9' >> $LOGIN_DEFS
fi

# PASS_WARN_AGE 설정
if grep -q '^PASS_WARN_AGE' $LOGIN_DEFS; then
    sed -i 's/^PASS_WARN_AGE .*/PASS_WARN_AGE 7/' $LOGIN_DEFS
else
    echo 'PASS_WARN_AGE 7' >> $LOGIN_DEFS
fi

echo "/etc/login.defs 파일이 성공적으로 업데이트되었습니다."

### 비밀번호 최소 길이 설정
# /etc/login.defs 파일 경로
LOGIN_DEFS="/etc/login.defs"

# 백업 파일 생성
cp $LOGIN_DEFS "${LOGIN_DEFS}.bak"

# PASS_MAX_DAYS, PASS_MIN_DAYS, PASS_MIN_LEN, PASS_WARN_AGE 값 설정
# 주석이 되어 있는 경우 주석을 제거하고 설정 값을 적용

# PASS_MAX_DAYS 설정
if grep -q '^#*\s*PASS_MAX_DAYS' $LOGIN_DEFS; then
    sed -i 's/^#*\s*PASS_MAX_DAYS\t.*/PASS_MAX_DAYS\t31/' $LOGIN_DEFS
else
    echo -e 'PASS_MAX_DAYS\t31' >> $LOGIN_DEFS
fi

# PASS_MIN_DAYS 설정
if grep -q '^#*\s*PASS_MIN_DAYS' $LOGIN_DEFS; then
    sed -i 's/^#*\s*PASS_MIN_DAYS\t.*/PASS_MIN_DAYS\t1/' $LOGIN_DEFS
else
    echo -e 'PASS_MIN_DAYS\t1' >> $LOGIN_DEFS
fi

# PASS_MIN_LEN 설정
if grep -q '^#*\s*PASS_MIN_LEN' $LOGIN_DEFS; then
    sed -i 's/^#*\s*PASS_MIN_LEN\t.*/PASS_MIN_LEN\t9/' $LOGIN_DEFS
else
    echo -e 'PASS_MIN_LEN\t9' >> $LOGIN_DEFS
fi

# PASS_WARN_AGE 설정
if grep -q '^#*\s*PASS_WARN_AGE' $LOGIN_DEFS; then
    sed -i 's/^#*\s*PASS_WARN_AGE\t.*/PASS_WARN_AGE\t7/' $LOGIN_DEFS
else
    echo -e 'PASS_WARN_AGE\t7' >> $LOGIN_DEFS
fi

# 중복된 설정 제거
# 중복된 항목이 있는 경우, 첫 번째 항목만 남기고 나머지 항목 삭제
awk '!/^PASS_/ || !x[$0]++' $LOGIN_DEFS > /tmp/login.defs

# /etc/login.defs 파일을 덮어쓸 때 출력 억제
mv -f /tmp/login.defs $LOGIN_DEFS > /dev/null 2>&1

echo "/etc/login.defs 파일이 성공적으로 업데이트되었습니다."

###Session Timeout 설정
# /etc/profile 파일 경로
PROFILE_FILE="/etc/profile"

# 백업 파일 생성
cp $PROFILE_FILE "${PROFILE_FILE}.bak"

# TMOUT 설정 추가
# 파일의 최하단에 TMOUT 설정을 추가합니다.
# 기존에 TMOUT 설정이 있는 경우 주석을 제거하고 설정 값을 적용합니다.
if grep -q '^TMOUT=' $PROFILE_FILE; then
    sed -i '/^TMOUT=/d' $PROFILE_FILE
fi

# TMOUT과 export TMOUT을 최하단에 추가
echo -e 'TMOUT=300\nexport TMOUT' >> $PROFILE_FILE

echo "/etc/profile 파일의 최하단에 TMOUT 설정이 성공적으로 추가되었습니다."

###/etc/passwd 파일 소유자 및 권한 설정
PASSWD_FILE="/etc/passwd"

# 현재 소유자 및 권한 확인
current_owner=$(stat -c "%U" $PASSWD_FILE)
current_permissions=$(stat -c "%a" $PASSWD_FILE)

# 소유자와 권한을 root 및 644로 설정
chown root:root $PASSWD_FILE
chmod 644 $PASSWD_FILE

# 변경 후 소유자 및 권한 확인
new_owner=$(stat -c "%U" $PASSWD_FILE)
new_permissions=$(stat -c "%a" $PASSWD_FILE)

# 변경 사항 출력
if [ "$current_owner" != "root" ] || [ "$current_permissions" -ne 644 ]; then
    echo "/etc/passwd 파일의 소유자와 권한이 변경되었습니다."
    echo "현재 소유자: $current_owner, 현재 권한: $current_permissions"
    echo "변경된 소유자: $new_owner, 변경된 권한: $new_permissions"
else
    echo "/etc/passwd 파일의 소유자와 권한이 이미 올바릅니다."
fi

###/etc/shadow 파일 소유자 및 권한 설정
# /etc/shadow 파일 경로
SHADOW_FILE="/etc/shadow"

# 현재 소유자 및 권한 확인
current_owner=$(stat -c "%U" $SHADOW_FILE)
current_permissions=$(stat -c "%a" $SHADOW_FILE)

# 소유자와 권한을 root 및 400으로 설정
chown root:root $SHADOW_FILE
chmod 400 $SHADOW_FILE

# 변경 후 소유자 및 권한 확인
new_owner=$(stat -c "%U" $SHADOW_FILE)
new_permissions=$(stat -c "%a" $SHADOW_FILE)

# 변경 사항 출력
if [ "$current_owner" != "root" ] || [ "$current_permissions" -ne 400 ]; then
    echo "/etc/shadow 파일의 소유자와 권한이 변경되었습니다."
    echo "현재 소유자: $current_owner, 현재 권한: $current_permissions"
    echo "변경된 소유자: $new_owner, 변경된 권한: $new_permissions"
else
    echo "/etc/shadow 파일의 소유자와 권한이 이미 올바릅니다."
fi

###/etc/hosts 파일 소유자 및 권한 설정
# /etc/hosts 파일 경로
HOSTS_FILE="/etc/hosts"

# 현재 소유자 및 권한 확인
current_owner=$(stat -c "%U" $HOSTS_FILE)
current_permissions=$(stat -c "%a" $HOSTS_FILE)

# 소유자와 권한을 root 및 644로 설정
chown root:root $HOSTS_FILE
chmod 644 $HOSTS_FILE

# 변경 후 소유자 및 권한 확인
new_owner=$(stat -c "%U" $HOSTS_FILE)
new_permissions=$(stat -c "%a" $HOSTS_FILE)

# 변경 사항 출력
if [ "$current_owner" != "root" ] || [ "$current_permissions" -ne 644 ]; then
    echo "/etc/hosts 파일의 소유자와 권한이 변경되었습니다."
    echo "현재 소유자: $current_owner, 현재 권한: $current_permissions"
    echo "변경된 소유자: $new_owner, 변경된 권한: $new_permissions"
else
    echo "/etc/hosts 파일의 소유자와 권한이 이미 올바릅니다."
fi

###/etc/rsyslog.conf 파일 소유자 및 권한 설정

# /etc/rsyslog.conf 파일 경로
RSYSLOG_CONF="/etc/rsyslog.conf"

# 현재 소유자 및 권한 확인
current_owner=$(stat -c "%U" $RSYSLOG_CONF)
current_permissions=$(stat -c "%a" $RSYSLOG_CONF)

# 소유자와 권한을 root 및 640으로 설정
chown root:root $RSYSLOG_CONF
chmod 640 $RSYSLOG_CONF

# 변경 후 소유자 및 권한 확인
new_owner=$(stat -c "%U" $RSYSLOG_CONF)
new_permissions=$(stat -c "%a" $RSYSLOG_CONF)

# 변경 사항 출력
if [ "$current_owner" != "root" ] || [ "$current_permissions" -ne 640 ]; then
    echo "/etc/rsyslog.conf 파일의 소유자와 권한이 변경되었습니다."
    echo "현재 소유자: $current_owner, 현재 권한: $current_permissions"
    echo "변경된 소유자: $new_owner, 변경된 권한: $new_permissions"
else
    echo "/etc/rsyslog.conf 파일의 소유자와 권한이 이미 올바릅니다."
fi

### U-66 로그정책 수립
# /etc/rsyslog.conf 에서 kern.* /dev/console 규칙을 *.alert /dev/console 로 변경/보장
if [ -f "$RSYSLOG_CONF" ]; then
    if grep -qE '^[[:space:]]*#?[[:space:]]*kern\.\*[[:space:]]+/dev/console' "$RSYSLOG_CONF"; then
        sed -i 's|^[[:space:]]*#\?[[:space:]]*kern\.\*[[:space:]]\+/dev/console|*.alert /dev/console|' "$RSYSLOG_CONF"
        echo "/etc/rsyslog.conf 파일의 kern.* /dev/console 규칙을 *.alert /dev/console 로 변경했습니다."
    fi

    if grep -qE '^[[:space:]]*\*\.alert[[:space:]]+/dev/console' "$RSYSLOG_CONF"; then
        echo "/etc/rsyslog.conf 파일에 *.alert /dev/console 규칙이 이미 존재합니다."
    else
        echo "*.alert /dev/console" >> "$RSYSLOG_CONF"
        echo "/etc/rsyslog.conf 파일에 *.alert /dev/console 규칙을 추가했습니다."
    fi

    if command -v systemctl >/dev/null 2>&1; then
        if systemctl restart rsyslog >/dev/null 2>&1; then
            echo "rsyslog 서비스가 재시작되었습니다."
        else
            echo "[WARN] rsyslog 재시작 실패 또는 서비스 없음. 계속 진행합니다."
        fi
    else
        echo "[WARN] systemctl 미존재: rsyslog 재시작을 건너뜁니다."
    fi
else
    echo "/etc/rsyslog.conf 파일이 존재하지 않습니다."
fi

### U-67 로그파일 권한 644 이하
# wtmp/lastlog 은 644, btmp 및 btmp-* 는 640 으로 보수적으로 설정
for file in /var/log/wtmp /var/log/lastlog; do
    if [ -e "$file" ]; then
        chmod 644 "$file"
        echo "$file 파일의 권한을 644로 설정했습니다."
    else
        echo "$file 파일이 존재하지 않습니다."
    fi
done

shopt -s nullglob
for file in /var/log/btmp /var/log/btmp-*; do
    if [ -e "$file" ]; then
        chmod 640 "$file"
        echo "$file 파일의 권한을 640으로 설정했습니다."
    else
        echo "$file 파일이 존재하지 않습니다."
    fi
done
shopt -u nullglob

###/etc/services 파일 소유자 및 권한 설정
# /etc/services 파일 경로
SERVICES_FILE="/etc/services"

# 현재 소유자 및 권한 확인
current_owner=$(stat -c "%U" $SERVICES_FILE)
current_permissions=$(stat -c "%a" $SERVICES_FILE)

# 소유자와 권한을 root 및 644로 설정
chown root:root $SERVICES_FILE
chmod 644 $SERVICES_FILE

# 변경 후 소유자 및 권한 확인
new_owner=$(stat -c "%U" $SERVICES_FILE)
new_permissions=$(stat -c "%a" $SERVICES_FILE)

# 변경 사항 출력
if [ "$current_owner" != "root" ] || [ "$current_permissions" -ne 644 ]; then
    echo "/etc/services 파일의 소유자와 권한이 변경되었습니다."
    echo "현재 소유자: $current_owner, 현재 권한: $current_permissions"
    echo "변경된 소유자: $new_owner, 변경된 권한: $new_permissions"
else
    echo "/etc/services 파일의 소유자와 권한이 이미 올바릅니다."
fi

###umask 설정 관리
declare -A files_permissions=(
    ["$HOME/.profile"]=600
    ["$HOME/.kshrc"]=600
    ["$HOME/.bashrc"]=600
    ["$HOME/.cshrc"]=600
    ["$HOME/.login"]=600
    ["$HOME/.bash_profile"]=600
    ["$HOME/.tcshrc"]=600
    ["$HOME/.sh_history"]=600
    ["$HOME/.bash_history"]=600
    ["/tcb/file/auth"]=400
    ["/etc/profile"]=755
    ["/etc/inittab"]=644
    ["/etc/snmp/snmpd.conf"]=644
    ["/etc/systemd/system.conf"]=600
)

# 파일과 권한을 순회하면서 설정
for file in "${!files_permissions[@]}"; do
    if [ -f "$file" ]; then
        # 현재 권한 확인
        current_permissions=$(stat -c "%a" "$file")

        # 권한 설정
        chmod "${files_permissions[$file]}" "$file"

        # 변경 후 권한 확인
        new_permissions=$(stat -c "%a" "$file")

        # 권한이 변경되었는지 확인
        if [ "$current_permissions" -ne "${files_permissions[$file]}" ]; then
            echo "$file 파일의 권한이 $current_permissions에서 $new_permissions로 변경되었습니다."
        else
            echo "$file 파일의 권한이 이미 ${files_permissions[$file]}입니다."
        fi
    else
        echo "$file 파일이 존재하지 않습니다."
    fi
done

# /etc/profile 파일 경로
PROFILE_FILE="/etc/profile"

# 추가할 내용
UMASK_SETTING="umask=022"

# /etc/profile 파일의 최하단에 추가할 내용
add_umask_settings() {
    # 파일이 존재하는지 확인
    if [ -f "$PROFILE_FILE" ]; then
        # 현재 설정 확인
        if grep -q "^$UMASK_SETTING" "$PROFILE_FILE"; then
            echo "$PROFILE_FILE 파일에 $UMASK_SETTING  설정이 이미 존재합니다."
        else
            # 파일의 끝에 추가
            echo -e "\n$UMASK_SETTING" >> "$PROFILE_FILE"
            echo "$PROFILE_FILE 파일의 끝에 $UMASK_SETTING 설정이 추가되었습니다."
        fi
        grep -qxF "export umask" "$PROFILE_FILE" || echo "export umask" >> "$PROFILE_FILE"
    else
        echo "$PROFILE_FILE 파일이 존재하지 않습니다."
    fi
}

# umask 설정 함수 호출
add_umask_settings

# nounset-safe source 블록
if [ -f "$PROFILE_FILE" ]; then
  # 현재 옵션 상태 저장
  had_u=0; had_e=0; had_pf=0
  case $- in *u*) had_u=1; set +u ;; esac
  case $- in *e*) had_e=1; set +e ;; esac
  # pipefail 상태 확인
  if set -o | grep -qE '^pipefail[[:space:]]+on$'; then
    had_pf=1
    set +o pipefail
  fi

  # shellcheck disable=SC1090
  . "$PROFILE_FILE"

  # 옵션 원복
  [ "$had_pf" -eq 1 ] && set -o pipefail
  [ "$had_e"  -eq 1 ] && set -e
  [ "$had_u"  -eq 1 ] && set -u
  unset had_u had_e had_pf

  echo "변경 사항이 현재 세션에 적용되었습니다."
fi

###crond 서비스 권한 설정
# /usr/bin/crontab 파일의 권한을 750으로 변경
CRONTAB_FILE="/usr/bin/crontab"
if [ -f "$CRONTAB_FILE" ]; then
    chmod 750 "$CRONTAB_FILE"
    echo "$CRONTAB_FILE 파일의 권한을 750으로 변경했습니다."
else
    echo "$CRONTAB_FILE 파일이 존재하지 않습니다."
fi

# cron 관련 파일들의 소유자를 root, 권한을 640으로 변경
declare -a cron_files=(
    "/etc/crontab"
    "/etc/cron.d"
    "/etc/cron.daily"
    "/etc/cron.hourly"
    "/etc/cron.monthly"
    "/etc/cron.weekly"
    "/etc/cron.deny"
    "/etc/cron.allow"
    "/var/spool/cron"
    "/var/spool/cron/crontabs"
)

for file in "${cron_files[@]}"; do
    if [ -e "$file" ]; then
        chown root:root "$file"
        chmod 640 "$file"
        echo "$file 파일의 소유자를 root로, 권한을 640으로 변경했습니다."
    else
        echo "$file 파일이 존재하지 않거나 접근할 수 없습니다."
    fi
done

# /var/spool/cron/crontabs 디렉토리의 권한을 700으로 변경
if [ -d "/var/spool/cron/crontabs" ]; then
    chmod 700 "/var/spool/cron/crontabs"
    echo "/var/spool/cron/crontabs 디렉토리의 권한을 700으로 변경했습니다."
else
    echo "/var/spool/cron/crontabs 디렉토리가 존재하지 않습니다."
fi

### at 서비스 권한 설정
# /usr/bin/at 파일의 권한을 4750으로 변경
AT_FILE="/usr/bin/at"
if [ -f "$AT_FILE" ]; then
    chmod 4750 "$AT_FILE"
    echo "$AT_FILE 파일의 권한을 4750으로 변경했습니다."
else
    echo "$AT_FILE 파일이 존재하지 않습니다."
fi

# at 관련 파일 및 디렉토리
declare -a at_files=(
    "/etc/at.allow"
    "/etc/at.deny"
    "/var/spool/at"
    "/var/spool/at/jobs"
    "/var/spool/at/atd"  # /var/spool/at/atd 디렉토리 또는 파일
)

for file in "${at_files[@]}"; do
    if [ -e "$file" ]; then
        chown root:root "$file"
        chmod 640 "$file"
        echo "$file 파일의 소유자를 root로, 권한을 640으로 변경했습니다."
    else
        echo "$file 파일이 존재하지 않거나 접근할 수 없습니다."
    fi
done

# /var/spool/at 디렉토리의 권한을 700으로 변경
if [ -d "/var/spool/at" ]; then
    chmod 700 "/var/spool/at"
    echo "/var/spool/at 디렉토리의 권한을 700으로 변경했습니다."
else
    echo "/var/spool/at 디렉토리가 존재하지 않습니다."
fi

# /var/spool/at/jobs 디렉토리의 권한을 700으로 변경
if [ -d "/var/spool/at/jobs" ]; then
    chmod 700 "/var/spool/at/jobs"
    echo "/var/spool/at/jobs 디렉토리의 권한을 700으로 변경했습니다."
else
    echo "/var/spool/at/jobs 디렉토리가 존재하지 않습니다."
fi

# atd 서비스가 활성화되어 있는지 확인하고 재시작
if systemctl is-active --quiet atd; then
    systemctl restart atd
    echo "atd 서비스가 재시작되었습니다."
else
    echo "atd 서비스가 활성화되어 있지 않습니다."
fi

### NFS 설정파일 접근 권한
EXPORT_FILE="/etc/exports"
if [ -f "$EXPORT_FILE" ]; then
    chown root:root "$EXPORT_FILE" || true
    chmod 644 "$EXPORT_FILE" || true
    echo "$EXPORT_FILE 파일의 소유자가 root로 설정되고 권한이 644로 변경되었습니다."
else
    echo "$EXPORT_FILE 파일이 존재하지 않습니다."
fi

### U-34 Finger 서비스 비활성화
if command -v systemctl >/dev/null 2>&1; then
  systemctl disable --now finger.service finger.socket >/dev/null 2>&1 || true
fi

shopt -s nullglob
xinetd_files=(/etc/xinetd.d/*)
if [ "${#xinetd_files[@]}" -eq 0 ]; then
  echo "NOT_FOUND /etc/xinetd.d/*"
else
  for file in "${xinetd_files[@]}"; do
    if [ -f "$file" ] && { [[ "$(basename "$file")" == finger* ]] || grep -qE '^[[:space:]]*service[[:space:]]+finger([[:space:]]|$)' "$file"; }; then
      if grep -qE '^[[:space:]]*disable[[:space:]]*=' "$file"; then
        sed -i 's/^[[:space:]]*disable[[:space:]]*=.*/        disable = yes/' "$file"
      else
        sed -i '/^[[:space:]]*}/i\\        disable = yes' "$file"
      fi
      echo "$file 파일의 Finger 서비스를 비활성화했습니다."
    else
      echo "$file 파일을 확인했습니다."
    fi
  done
fi
shopt -u nullglob

### U-36 r 계열 서비스 설정 파일 존재 여부 확인
for file in /etc/xinetd/ /etc/inetd.conf; do
  if [ -e "$file" ]; then
    ls -ld "$file"
  else
    echo "NOT_FOUND $file"
  fi
done

shopt -s nullglob
xinetd_files=(/etc/xinetd.d/*)
if [ "${#xinetd_files[@]}" -eq 0 ]; then
  echo "NOT_FOUND /etc/xinetd.d/*"
else
  for file in "${xinetd_files[@]}"; do
    ls -ld "$file"
  done
fi
shopt -u nullglob

### SUID, SGID 설정 및 권한 설정
# U-23 불필요한 SGID/SUID 제거
if [ -e "/usr/bin/newgrp" ]; then
  chmod -s /usr/bin/newgrp || true
  echo "/usr/bin/newgrp 파일의 SGID/SUID 비트를 제거했습니다."
else
  echo "/usr/bin/newgrp 파일이 존재하지 않습니다."
fi

files=(
  "/sbin/dump"
  "/sbin/restore"
  "/sbin/unix_chkpwd"
  "/usr/bin/at"
  "/usr/bin/lpq"
  "/usr/bin/lpq-lqd"
  "/usr/bin/lpr"
  "/usr/bin/lpr-lpd"
  "/usr/bin/lprm"
  "/usr/bin/lprm-lpd"
  "/usr/sbin/lpc"
  "/usr/sbin/lpc-lpd"
  "/usr/sbin/traceroute"
)
for file in "${files[@]}"; do
  if [ -e "$file" ]; then
    chmod -s "$file" || true
    chmod 4750 "$file" || true
  else
    echo "$file does not exist."
  fi
done

### U-46 일반 사용자의 Postfix 큐 관리 명령 실행 방지
POSTSUPER_FILE="/usr/sbin/postsuper"
if [ -e "$POSTSUPER_FILE" ]; then
  chmod a-x "$POSTSUPER_FILE"
  echo "$POSTSUPER_FILE 파일의 모든 실행 권한을 제거했습니다."
else
  echo "NOT_FOUND $POSTSUPER_FILE"
fi

### U-48 Postfix VRFY 명령 제한
if command -v postconf >/dev/null 2>&1; then
  postconf -e 'disable_vrfy_command = yes'
  echo "Postfix disable_vrfy_command 설정을 yes로 변경했습니다."
  if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet postfix 2>/dev/null; then
    systemctl reload postfix
    echo "postfix 서비스 설정을 다시 불러왔습니다."
  fi
else
  echo "postconf NOT_FOUND"
fi

### 로그온 시 경고 메시지 출력
# 통일된 경고 문구를 /etc/motd, /etc/issue, /etc/issue.net 에 기록
write_login_banner() {
  local target="$1"
  cat <<'EOF' > "$target"
=================================================================

** WARNING ** Unauthorized access to this system is prohibited. ** WARNING **

Please ensure you have proper authorization to access this system.
=================================================================
EOF
}

write_login_banner /etc/motd
write_login_banner /etc/issue
write_login_banner /etc/issue.net
echo "MOTD/issue/issue.net 파일에 경고 메시지를 추가했습니다."

# sshd Banner 설정 반영 및 재시작
BANNER_LINE="Banner /etc/issue.net"

# U-62 증적에서 /etc/ssh/sshd_config 안의 Banner 경로를 직접 확인할 수 있도록 반영
if grep -qE '^[[:space:]]*Match[[:space:]]+' "$SSHD_CONFIG"; then
  tmp_file="$(mktemp /tmp/sshd_config.XXXXXX)"
  awk -v bl="$BANNER_LINE" '
    BEGIN { done=0 }
    {
      if ($0 ~ /^[[:space:]]*#?[[:space:]]*Banner[[:space:]]+/) next
      if (!done && $0 ~ /^[[:space:]]*Match[[:space:]]+/) {
        print bl
        done=1
      }
      print
    }
    END { if (!done) print bl }
  ' "$SSHD_CONFIG" > "$tmp_file"
  cat "$tmp_file" > "$SSHD_CONFIG"
  rm -f "$tmp_file"
  echo "$SSHD_CONFIG 파일에 배너 설정을 반영했습니다."
else
  sed -i '/^[[:space:]]*#\?[[:space:]]*Banner[[:space:]]\+/d' "$SSHD_CONFIG"
  echo "$BANNER_LINE" >> "$SSHD_CONFIG"
  echo "$SSHD_CONFIG 파일에 배너 설정을 추가했습니다."
fi

if sshd -t 2>/dev/null; then
  systemctl restart sshd
  echo "[INFO] sshd 재시작 완료(Banner=/etc/issue.net)"
else
  echo "[ERROR] sshd 설정 문법 오류로 재시작 중단"
  exit 1
fi

### 불필요한 사용자 삭제 (멱등/내결함성)
USERS_TO_REMOVE=("ftp" "lp")

for ACC in "${USERS_TO_REMOVE[@]}"; do
  if id "$ACC" &>/dev/null; then
    # 1) 삭제 전에 경로 확보 (userdel 성공 시 getent가 빈 값이 되므로 먼저 잡아둡니다)
    HOME_DIR="$(getent passwd "$ACC" | cut -d: -f6)"
    MAIL_SPOOL="/var/spool/mail/$ACC"

    # 2) 실행 중 프로세스가 있으면 userdel이 실패할 수 있으므로 선제 종료(선택)
    pkill -KILL -u "$ACC" >/dev/null 2>&1 || true

    # 3) 계정/홈/메일 한 번에 제거 시도
    #    -r : 홈디렉터리/메일 스풀 삭제, -f : 강제
    userdel -r -f "$ACC" >/dev/null 2>&1 || true

    # 4) userdel이 일부 실패했을 가능성에 대비한 수동 정리
    if [ -n "${HOME_DIR:-}" ] && [ -d "$HOME_DIR" ]; then
      rm -rf "$HOME_DIR" || true
      echo "$HOME_DIR 디렉토리를 삭제했습니다."
    fi
    [ -f "$MAIL_SPOOL" ] && rm -f "$MAIL_SPOOL" || true

    echo "$ACC 사용자를 삭제했습니다."
  else
    echo "$ACC 사용자가 존재하지 않습니다."
  fi
done

# ✅ 성공 신호는 마지막 줄에서 출력
echo "Permissions have been updated."
