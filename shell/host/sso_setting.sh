#!/usr/bin/env bash
#########################################
#Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
#saml 로그인을 위한 ccvm에 keycloak 및 클라이언트 구성 스크립트
#
#최초작성자 : 유수정 책임
#최초작성일 : 2025-10-20
#########################################
set -x

# ---------------------------------------------
# Keycloak 설치 경로 및 관리자 계정 설정
# ---------------------------------------------
INSTALL_DIR="/usr/share/ablestack/keycloak"
DATA_DIR="$INSTALL_DIR/data"

ADMIN_USER="admin"                  # Keycloak 관리자 계정
ADMIN_PASS="admin"                  # Keycloak 관리자 비밀번호

mkdir -p "$DATA_DIR"
chmod -R 777 "$DATA_DIR"

cd "$INSTALL_DIR"

# ---------------------------------------------
# Podman 및 필수 패키지 설치
# ---------------------------------------------
# if ! command -v podman &> /dev/null; then
#   echo "[INFO] Podman이 설치되어 있지 않습니다. 설치 중..."
#   sudo dnf install -y podman
# fi

# podman-compose 설치 (pip 기반)
if ! command -v podman-compose &> /dev/null; then
  echo "[INFO] podman-compose 설치 중..."
  # if ! command -v pip3 &> /dev/null; then
  #   sudo dnf install -y python3-pip
  # fi
  # pip3 install --user podman-compose
  # export PATH=$PATH:$HOME/.local/bin
  pip3 install --no-index --find-links=${INSTALL_DIR}/podman-compose podman-compose
fi

# ---------------------------------------------
# docker-compose.yml (Podman용) 생성
# ---------------------------------------------
cat > docker-compose.yml <<EOF
version: '3.9'
services:
  keycloak:
    image: localhost:15000/keycloak/keycloak:26.0
    container_name: keycloak
    environment:
      - KEYCLOAK_ADMIN=${ADMIN_USER}
      - KEYCLOAK_ADMIN_PASSWORD=${ADMIN_PASS}
    command: start-dev
    ports:
      - "7070:8080"
    volumes:
      - ${INSTALL_DIR}/theme:/opt/keycloak/themes/ablestack:Z

EOF

# ---------------------------------------------
# Keycloak 실행
# ---------------------------------------------
echo "[INFO] Keycloak 컨테이너 실행 중..."
podman-compose up -d

# ---------------------------------------------
# 방화벽 포트 개방 (firewalld 사용 시)
# ---------------------------------------------
if systemctl is-active firewalld &> /dev/null; then
  echo "[INFO] firewalld에서 7070 포트 설정 중..."
  sudo firewall-cmd --add-port=7070/tcp
  sudo firewall-cmd --permanent --add-port=7070/tcp
  echo "[INFO] 7070 포트 설정 완료"
else
  echo "[WARN] firewalld가 실행 중이 아닙니다. 수동으로 포트를 열어야 할 수 있습니다."
fi

# ---------------------------------------------
# 컨테이너 상태 확인
# ---------------------------------------------
echo "[INFO] 컨테이너 상태 확인..."
podman ps | grep keycloak && echo "✅ Keycloak이 실행 중입니다: http://$(hostname -I | awk '{print $1}'):7070"

until curl -s http://$(hostname -I | awk '{print $1}'):7070/realms/master; do
    echo "Keycloak 준비 중..."
    sleep 2
done
echo "Keycloak 준비 완료"

echo "==============================="
echo "✅ Keycloak 설치 완료"
echo "접속 URL: http://$(hostname -I | awk '{print $1}'):7070"
echo "관리자 계정: admin / admin"
echo "==============================="

# ---------------------------------------------
# Keycloak 환경 설정
# ---------------------------------------------
HOST_IP=$(grep -E "ccvm" /etc/hosts | awk '{print $1}')

KC_URL="http://$HOST_IP:7070"       # Keycloak 접속 URL

THEME="ablestack"                   # Keycloak 테마
REALM_NAME="saml"                   # 생성할 Realm 이름
TIMEOUT_SECONDS=3600                # Access Token Timeout (1시간)
CLIENT_SCOPE_NAME="username"

# 새 사용자 정보
NEW_USER_USERNAME="admin"           # SSO 로그인 계정
NEW_USER_EMAIL="admin@localhost"    # SSO 로그인 계정 이메일
NEW_USER_PASSWORD="admin"           # SSO 로그인 계정 비밀번호

# 클라이언트 설정(MOLD)
CLIENT_ID_MOLD="http://$HOST_IP:8080"
ROOT_URL_MOLD="http://$HOST_IP:8080/"
REDIRECT_URLS_MOLD="http://$HOST_IP:8080/*"

# 클라이언트 설정(GLUE)
SCVM_HOSTS=$(grep -E "scvm[0-9]+-mngt" /etc/hosts)  # 전체 scvm
CERT_TARGET_PATH="/etc/ceph"                        # 인증서 경로
CERT_DAYS=3650                                      # 인증서 기간
CERT_CRT="$INSTALL_DIR/sp.crt"                                 # 인증서 공개키
CERT_KEY="$INSTALL_DIR/sp.key"                                 # 인증서 개인키
KEYSTORE_FILE="$INSTALL_DIR/sp-keystore.p12"                     # Keycloak에 등록할 암호화용 인증서
KEYSTORE_ALIAS="saml-encryption"
KEYSTORE_PASS="changeit"

# 클라이언트 설정(WALL)
CLIENT_ID_WALL="http://$HOST_IP:3000"
ROOT_URL_WALL="http://$HOST_IP:3000"
REDIRECT_URIS_WALL="[\"http://$HOST_IP:3000/login*\", \"http://$HOST_IP:3000/login/generic_oauth\"]"
# CLIENT_ROLE_WALL="grafana-admin"

# WALL 설정
GRAFANA_CONFIG_PATH="/usr/share/ablestack/ablestack-wall/grafana/conf/defaults.ini" # grafana 설정파일
GRAFANA_DB="/usr/share/ablestack/ablestack-wall/grafana/data/grafana.db"            # grafana db 경로

# ---------------------------------------------
# jq 설치 확인(JSON 파서를 위한 명령줄도구)
# ---------------------------------------------
# JQ_BIN=$(command -v jq || true)
# if [ -z "$JQ_BIN" ]; then
#   echo "[INFO] jq가 설치되어 있지 않습니다. 설치 중..."
#   dnf install -y jq >/dev/null
# fi

# ---------------------------------------------
# Access Token 발급
# ---------------------------------------------
echo "[INFO] 관리자 Access Token 요청 중..."
TOKEN=$(curl -s \
  -d "client_id=admin-cli" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASS}" \
  -d "grant_type=password" \
  "${KC_URL}/realms/master/protocol/openid-connect/token" | jq -r .access_token)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "[ERROR] Access Token 발급 실패"
  exit 1
fi
echo "[OK] Access Token 발급 성공"

# ---------------------------------------------
# 초기 비밀번호 변경
# ---------------------------------------------
USER_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KC_URL}/admin/realms/master/users?username=${ADMIN_USER}" | jq -r '.[0].id')

curl -s -X PUT "${KC_URL}/admin/realms/master/users/${USER_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"requiredActions":["UPDATE_PASSWORD"]}'

# ---------------------------------------------
# Realm 생성 or 확인
# ---------------------------------------------
echo "[INFO] '${REALM_NAME}' Realm 확인 중..."
EXISTING_REALM=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${KC_URL}/admin/realms/${REALM_NAME}" | jq -r .realm || true)

if [ "$EXISTING_REALM" == "$REALM_NAME" ]; then
  echo "[WARN] '${REALM_NAME}' Realm 이미 존재. 기존 Realm 업데이트"
else
  echo "[INFO] '${REALM_NAME}' Realm 생성 중..."
  curl -s -X POST "${KC_URL}/admin/realms" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "{\"realm\":\"${REALM_NAME}\",\"enabled\":true}" >/dev/null
  echo "✅ Realm '${REALM_NAME}' 생성 완료"
fi

# ---------------------------------------------
# Realm 설정 변경 (Timeout)
# ---------------------------------------------
REALM_CONFIG=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${KC_URL}/admin/realms/${REALM_NAME}")

if [ -z "$REALM_CONFIG" ]; then
  echo "[ERROR] Realm 정보를 가져오지 못했습니다."
  exit 1
fi

UPDATED_REALM=$(echo "$REALM_CONFIG" | jq \
  --argjson val $TIMEOUT_SECONDS \
  '.accessTokenLifespan = $val | .ssoSessionIdleTimeout = $val')

curl -s -X PUT "${KC_URL}/admin/realms/${REALM_NAME}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "$UPDATED_REALM" >/dev/null

echo "✅ Realm '${REALM_NAME}' 타임아웃 설정 완료 (1시간)"

# ---------------------------------------------
# Realm 다국어적용(Internationalization)
# ---------------------------------------------
# master Realm
curl -s -X PUT "${KC_URL}/admin/realms/master" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
        "internationalizationEnabled": true,
        "supportedLocales": ["en", "ko"],
        "defaultLocale": "ko"
      }' >/dev/null

if [ $? -eq 0 ]; then
  echo "[OK] Realm master 다국어 활성화 완료"
else
  echo "[ERROR] Realm master 다국어 활성화 실패"
  exit 1
fi

# 생성한 Realm
curl -s -X PUT "${KC_URL}/admin/realms/${REALM_NAME}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
        "internationalizationEnabled": true,
        "supportedLocales": ["en", "ko"],
        "defaultLocale": "ko"
      }' >/dev/null

if [ $? -eq 0 ]; then
  echo "[OK] Realm ${REALM_NAME} 다국어 활성화 완료"
else
  echo "[ERROR] Realm ${REALM_NAME} 다국어 활성화 실패"
  exit 1
fi

# ---------------------------------------------
# Realm 테마적용
# ---------------------------------------------
echo "[INFO] Realm 테마 적용 중..."

# master Realm
curl -s -X PUT "${KC_URL}/admin/realms/master" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{\"loginTheme\":\"${THEME}\"}"

# 생성한 Realm
curl -s -X PUT "${KC_URL}/admin/realms/${REALM_NAME}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{\"loginTheme\":\"${THEME}\"}"

echo "✅ Realm 테마 적용 완료"

# ---------------------------------------------
# Client Scope 생성 (SAML용 username)
# ---------------------------------------------
echo "[INFO] Client Scope '${CLIENT_SCOPE_NAME}' 생성 중..."

# 1. Client Scope 존재 여부 확인
EXISTING_SCOPE_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KC_URL}/admin/realms/${REALM_NAME}/client-scopes" | jq -r ".[] | select(.name==\"${CLIENT_SCOPE_NAME}\") | .id")

if [ -n "$EXISTING_SCOPE_ID" ]; then
  echo "[WARN] Client Scope '${CLIENT_SCOPE_NAME}' 이미 존재"
else
  # 2. Client Scope 생성
  curl -s -X POST "${KC_URL}/admin/realms/${REALM_NAME}/client-scopes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{
      "name": "'"${CLIENT_SCOPE_NAME}"'",
      "protocol": "saml",
      "attributes": {
        "display.on.consent.screen": "true"
      }
    }' >/dev/null

  echo "✅ Client Scope '${CLIENT_SCOPE_NAME}' 생성 완료"

  EXISTING_SCOPE_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${REALM_NAME}/client-scopes" | jq -r ".[] | select(.name==\"${CLIENT_SCOPE_NAME}\") | .id")

  # 3. Mapper 추가
  echo "[INFO] Mapper (Client scopes -> username) 추가 중..."

  curl -s -X POST "${KC_URL}/admin/realms/${REALM_NAME}/client-scopes/${EXISTING_SCOPE_ID}/protocol-mappers/models" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{
      "name": "username-mapper",
      "protocol": "saml",
      "protocolMapper": "saml-user-property-mapper",
      "config": {
        "user.attribute": "username",
        "friendly.name": "username",
        "attribute.name": "username",
        "attribute.nameformat": "Basic"
      }
    }' >/dev/null

  echo "✅ Mapper 추가 완료 (Client scopes -> username)"
fi

# ---------------------------------------------
# SSO 로그인 사용자생성(admin)
# ---------------------------------------------
echo "[INFO] SSO 로그인 사용자 admin 생성 중..."
curl -s -X POST "${KC_URL}/admin/realms/${REALM_NAME}/users" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
        \"username\": \"${NEW_USER_USERNAME}\",
        \"email\": \"${NEW_USER_EMAIL}\",
        \"firstName\": \"${NEW_USER_USERNAME}\",
        \"lastName\": \"${NEW_USER_USERNAME}\",
        \"enabled\": true,
        \"credentials\": [
            {
                \"type\": \"password\",
                \"value\": \"${NEW_USER_PASSWORD}\",
                \"temporary\": false
            }
        ]
      }" \
  --max-time ${TIMEOUT_SECONDS}

echo "✅ SSO 로그인 사용자 admin 생성 완료"

# ---------------------------------------------
# 클라이언트 설정 (1) MOLD (SAML)
# ---------------------------------------------
echo "[INFO] MOLD 클라이언트 '${CLIENT_ID_MOLD}' 생성 중..."

# 클라이언트 생성 JSON 구성
CLIENT_DATA_MOLD=$(cat <<EOF
{
  "clientId": "${CLIENT_ID_MOLD}",
  "protocol": "saml",
  "rootUrl": "${ROOT_URL_MOLD}",
  "adminUrl": "${ROOT_URL_MOLD}",
  "redirectUris": ["${REDIRECT_URLS_MOLD}"],
  "attributes": {
    "saml_name_id_format": "username",
    "saml_force_name_id_format": "true",
    "saml_name_id_attribute": "username",
    "saml.assertion.signature": "true",
    "saml.authnstatement": "true",
    "saml.document.signature": "true",
    "saml.server.signature": "true",
    "saml.client.signature": "false",
    "saml.assertion.encryption": "true"
  },
  "enabled": true,
  "publicClient": true,
  "frontchannelLogout": false
}
EOF
)

# 1. 클라이언트 생성 요청
curl -s -X POST "${KC_URL}/admin/realms/${REALM_NAME}/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "${CLIENT_DATA_MOLD}" >/dev/null

# 2. 클라이언트에 스코프 연결
echo "[INFO] MOLD 클라이언트에 '${CLIENT_SCOPE_NAME}' 클라이언트 스코프 연결 중..."
CLIENT_MOLD_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KC_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_ID_MOLD}" | jq -r '.[0].id')

curl -s -X PUT "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_MOLD_ID}/default-client-scopes/${EXISTING_SCOPE_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  >/dev/null

# 기존 role_list 스코프 타입 변경(default->optional)
EXISTING_SCOPE_ROLE_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KC_URL}/admin/realms/${REALM_NAME}/client-scopes" | jq -r ".[] | select(.name==\"role_list\") | .id")

curl -s -X DELETE "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_MOLD_ID}/default-client-scopes/${EXISTING_SCOPE_ROLE_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  >/dev/null

curl -s -X PUT "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_MOLD_ID}/optional-client-scopes/${EXISTING_SCOPE_ROLE_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  >/dev/null

echo "✅ MOLD 클라이언트 '${CLIENT_ID_MOLD}' 설정 완료"

# ---------------------------------------------
# 클라이언트 설정 (2) GLUE (SAML)
# ---------------------------------------------
# 1. GLUE 클라이언트 SSL 인증서 생성
openssl req -newkey rsa:2048 -nodes -keyout sp.key -x509 -days "$CERT_DAYS" -out sp.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=MyOrg/OU=Ceph/CN=ceph.local"

if [ $? -ne 0 ]; then
  echo "[ERROR] 인증서 생성 실패"
fi
echo "✅ 인증서 생성 완료: sp.crt, sp.key"

# 2. KC 메타데이터 파일 복사(뒤에서 컨테이너에 복사)
curl -s -o ${INSTALL_DIR}/idp_metadata.xml http://"$HOST_IP":7070/realms/saml/protocol/saml/descriptor

# 3. 각 scvm에 대해 클라이언트 생성
echo "$SCVM_HOSTS" | while read -r LINE; do
  SCVM_HOST_IP=$(echo "$LINE" | awk '{print $1}')
  SCVM_HOST_NAME=$(echo "$LINE" | awk '{print $2}')

  CLIENT_ID_GLUE="https://$SCVM_HOST_IP:8443/auth/saml2/metadata"
  CLIENT_ID_GLUE_2="glue"
  ROOT_URL_GLUE="https://$SCVM_HOST_IP:8443"
  REDIRECT_URLS_GLUE="https://$SCVM_HOST_IP:8443/*"

  echo "[INFO] GLUE 클라이언트 '${SCVM_HOST_IP}, ${SCVM_HOST_NAME}' 생성 중..."

  # 클라이언트 생성 JSON 구성
  CLIENT_DATA_GLUE=$(cat <<GLUE_EOF
{
  "clientId": "${CLIENT_ID_GLUE}",
  "protocol": "saml",
  "rootUrl": "${ROOT_URL_GLUE}",
  "redirectUris": ["${REDIRECT_URLS_GLUE}"],
  "attributes": {
    "saml_name_id_format": "persistent",
    "saml.assertion.signature": "true",
    "saml.authnstatement": "true",
    "saml.document.signature": "true",
    "saml.server.signature": "true",
    "saml.client.signature": "false",
    "saml.assertion.encryption": "true",
    "saml.encrypt": "true"
  },
  "enabled": true,
  "publicClient": true,
  "frontchannelLogout": false
}
GLUE_EOF
)

  # 클라이언트 생성 요청
  curl -X POST "${KC_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$CLIENT_DATA_GLUE"

  # 4. 클라이언트에 스코프 연결
  echo "[INFO] GLUE 클라이언트에 '${CLIENT_SCOPE_NAME}' 클라이언트 스코프 연결 중..."
  CLIENT_GLUE_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_ID_GLUE}" | jq -r '.[0].id')

  curl -s -X PUT "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_GLUE_ID}/default-client-scopes/${EXISTING_SCOPE_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    >/dev/null

  # 기존 role_list 스코프 타입 변경(default->optional)
  curl -s -X DELETE "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_GLUE_ID}/default-client-scopes/${EXISTING_SCOPE_ROLE_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    >/dev/null

  curl -s -X PUT "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_GLUE_ID}/optional-client-scopes/${EXISTING_SCOPE_ROLE_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    >/dev/null

  # 5. KC 메타데이터 파일 및 인증서파일 원격 서버($SCVM_HOST_NAME)에 전송
  scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${INSTALL_DIR}/idp_metadata.xml "$SCVM_HOST_NAME:$CERT_TARGET_PATH/"
  scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${INSTALL_DIR}/sp.crt ${INSTALL_DIR}/sp.key "$SCVM_HOST_NAME:$CERT_TARGET_PATH/"
  if [ $? -ne 0 ]; then
    echo "[ERROR] 원격 서버로 파일 전송 실패"
  fi
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $SCVM_HOST_NAME "echo 'ablestack1!' > ${INSTALL_DIR}/user.txt" # 계정생성시 사용할 임시 비밀번호 파일(sso 계정생성시 필요)

  echo "✅ 원격 서버에 파일 전송 완료 ($CERT_TARGET_PATH/)"

  # 6. 원격 서버($SCVM_HOST_NAME)에서 MGR 컨테이너에 인증서 복사 및 saml관련 패키지 설치
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$SCVM_HOST_NAME" \
  CERT_TARGET_PATH="$CERT_TARGET_PATH" \
  KC_URL="$KC_URL" \
  ROOT_URL_GLUE="$ROOT_URL_GLUE" \
  bash <<'SSH_EOF'
echo "[INFO] Ceph MGR 컨테이너 검색 중..."
MGR_CONTAINER=$(podman ps --format '{{.Names}}' | grep -E 'mgr' | head -n 1)

if [ -z "$MGR_CONTAINER" ]; then
  echo "[ERROR] MGR 컨테이너를 찾을 수 없습니다"
  podman ps --format '{{.Names}}'
fi

echo "✅ MGR 컨테이너 발견: $MGR_CONTAINER"

# 7. saml관련 패키지 설치(MGR 컨테이너)
# podman exec "$MGR_CONTAINER" dnf install -y python3-pip
# if [ $? -ne 0 ]; then
#   echo "[ERROR] python3-pip 설치 실패"
# fi

# podman exec "$MGR_CONTAINER" dnf install -y python3-saml
# if [ $? -ne 0 ]; then
#   echo "[ERROR] python3-saml 설치 실패"
# fi

# echo "[INFO] 컨테이너에 python3-pip, python3-saml 설치 완료 및 Ceph MGR 모듈 재시작 중..."

# 8. Ceph MGR에 SSL 인증서 전송
echo "[INFO] admin keyring 파일 존재 여부 확인..."
if [ ! -f /etc/ceph/ceph.client.admin.keyring ]; then
  echo "[ERROR] /etc/ceph/ceph.client.admin.keyring 파일이 없습니다."
fi

echo "[INFO] keyring 및 인증서 컨테이너로 복사 중..."
podman cp "$CERT_TARGET_PATH/idp_metadata.xml" "$MGR_CONTAINER:$CERT_TARGET_PATH/idp_metadata.xml"
podman cp "$CERT_TARGET_PATH/ceph.client.admin.keyring" "$MGR_CONTAINER:$CERT_TARGET_PATH/ceph.client.admin.keyring"
podman cp "$CERT_TARGET_PATH/sp.crt" "$MGR_CONTAINER:$CERT_TARGET_PATH/sp.crt"
podman cp "$CERT_TARGET_PATH/sp.key" "$MGR_CONTAINER:$CERT_TARGET_PATH/sp.key"

if [ $? -ne 0 ]; then
  echo "[ERROR] 컨테이너로 파일 복사 실패"
fi

echo "[INFO] 컨테이너 내부 파일 확인:"
podman exec "$MGR_CONTAINER" ls -l "$CERT_TARGET_PATH/sp.crt" "$CERT_TARGET_PATH/sp.key"
podman exec "$MGR_CONTAINER" chmod 644 "$CERT_TARGET_PATH/sp.key"

if [ $? -ne 0 ]; then
  echo "[ERROR] 원격 작업 실패"
fi

echo "✅ GLUE MGR 컨테이너 SSL 인증서 전송 완료"

# 9. Ceph MGR 모듈 재시작(MGR 컨테이너)
podman exec "$MGR_CONTAINER" ceph mgr module disable dashboard
podman exec "$MGR_CONTAINER" ceph mgr module enable dashboard

if [ $? -ne 0 ]; then
  echo "[ERROR] Ceph MGR 모듈 재시작 실패"
fi

echo "✅ Ceph MGR 모듈 재시작 완료"

# 10. Ceph Dashboard SSO (SAML2) 자동 설정 — Active MGR 에서만 실행
echo "[INFO] Ceph Dashboard SSO 설정 적용 대상 확인 중..."
ACTIVE_MGR=$(podman exec "$MGR_CONTAINER" ceph mgr dump | jq -r '.active_name' | cut -d'.' -f1)

# echo "[INFO] Ceph Dashboard에 SAML2 SSO 설정 적용 중..."
if [[ "$ACTIVE_MGR" == "$(hostname)" ]]; then
  echo "[INFO] 현재 노드($(hostname))는 Active MGR 입니다. Ceph Dashboard에 SAML2 설정을 적용합니다."
  podman exec -e ROOT_URL_GLUE="$ROOT_URL_GLUE" \
              -e KC_URL="$KC_URL" \
              -e CERT_TARGET_PATH="$CERT_TARGET_PATH" \
              "$MGR_CONTAINER" \
              bash -c 'ceph dashboard sso setup saml2 \
                "$ROOT_URL_GLUE" \
                "$CERT_TARGET_PATH/idp_metadata.xml" \
                "username" \
                "$KC_URL/realms/saml" \
                "$CERT_TARGET_PATH/sp.crt" \
                "$CERT_TARGET_PATH/sp.key"'

  if [ $? -ne 0 ]; then
    echo "[ERROR] SSO 설정 실패"
  else
    echo "✅ Active MGR에서 SSO 설정 완료"
  fi
else
  echo "[INFO] 현재 노드($(hostname))는 Standby MGR 입니다. SSO 설정을 건너뜁니다."
fi

SSH_EOF

  # 11. Keycloak 클라이언트 암호화 인증서 업로드
  CLIENT_UUID_GLUE=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${REALM_NAME}/clients" | \
    jq -r --arg cid "${CLIENT_ID_GLUE}" '.[] | select(.clientId == $cid) | .id')

  echo "[INFO] PKCS12 키스토어(${KEYSTORE_FILE}) 생성 중..."
  openssl pkcs12 -export \
    -in "$CERT_CRT" \
    -inkey "$CERT_KEY" \
    -out "$KEYSTORE_FILE" \
    -name "$KEYSTORE_ALIAS" \
    -password pass:$KEYSTORE_PASS

  if [ $? -ne 0 ]; then
    echo "[ERROR] PKCS12 파일 생성 실패"
  fi
  echo "✅ PKCS12 키스토어 생성 완료"

  echo "[INFO] Keycloak 클라이언트 암호화 인증서 업로드 중..."
  response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer ${TOKEN}" \
    -F "file=@${KEYSTORE_FILE}" \
    -F "keystoreFormat=PKCS12" \
    -F "storePassword=${KEYSTORE_PASS}" \
    -F "keyAlias=saml-encryption" \
    -F "keyPassword=changeit" \
    "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_UUID_GLUE}/certificates/saml.encryption/upload")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" == "204" || "$http_code" == "200" ]]; then
    echo "✅ 인증서 업로드 성공"
  else
    echo "[ERROR] 인증서 업로드 실패 (HTTP $http_code)"
    # echo "--- 서버 응답 ---"
    echo "$body"
  fi

  echo "✅ GLUE 클라이언트 '${CLIENT_ID_GLUE}' 설정 완료"

done

# ---------------------------------------------
# 클라이언트 설정 (3) WALL (OIDC)
# ---------------------------------------------
echo "[INFO] WALL 클라이언트 '${CLIENT_ID_WALL}' 생성 중..."

# 클라이언트 생성 JSON 구성
CLIENT_DATA_WALL='{
  "clientId": "'"${CLIENT_ID_WALL}"'",
  "protocol": "openid-connect",
  "rootUrl": "'"${ROOT_URL_WALL}"'",
  "redirectUris": '"${REDIRECT_URIS_WALL}"',
  "webOrigins": ["+"],
  "publicClient": false,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true,
  "serviceAccountsEnabled": true,
  "authorizationServicesEnabled": true,
  "enabled": true,
  "fullScopeAllowed": true
}'

# 1. 클라이언트 생성 요청
curl -s -X POST "${KC_URL}/admin/realms/${REALM_NAME}/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "${CLIENT_DATA_WALL}" >/dev/null

CLIENT_WALL_ID=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KC_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_ID_WALL}" | jq -r '.[0].id')

if [ -z "$CLIENT_WALL_ID" ] || [ "$CLIENT_WALL_ID" == "null" ]; then
  echo "[ERROR] WALL 클라이언트 ID 조회 실패"
  exit 1
fi

# role 생성(grafana-admin role)
# curl -s -X POST "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_WALL_ID}/roles" \
#   -H "Authorization: Bearer ${TOKEN}" \
#   -H "Content-Type: application/json" \
#   -d "{
#       \"name\": \"${CLIENT_ROLE_WALL}\",
#       \"description\": \"Grafana Admin Role\"
#     }"

# echo "✅ 클라이언트 Role 생성 완료: ${CLIENT_ROLE_WALL}"


# 2. wall config 등록(설정정보 변경 및 client secret 등록)
CLIENT_SECRET_WALL=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KC_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_WALL_ID}/client-secret" | jq -r .value)

if [ -z "$CLIENT_SECRET_WALL" ] || [ "$CLIENT_SECRET_WALL" == "null" ]; then
  echo "[ERROR] WALL 클라이언트의 secret 조회 실패"
fi

echo "✅ WALL 클라이언트 secret: $CLIENT_SECRET_WALL"

# defaults.ini 파일 업데이트
# [user] 섹션에 auto_assign_org_role 권한 변경(Viewer->Admin)
sed -i 's/^\(auto_assign_org_role *= *\)Viewer/\1Admin/' "$GRAFANA_CONFIG_PATH"

# [auth] 섹션에 signout_redirect_url, signout_url 항목 추가(saml 로그아웃시 세션삭제)
awk \
  -v HOST_IP="$HOST_IP" \
  -v KC_URL="$KC_URL" \
  -v REALM_NAME="$REALM_NAME" '
BEGIN {
  in_auth=0
  printed_signout_url=0
}

/^\[auth\]/ {
  in_auth=1
  printed_signout_url=0
  print
  next
}

/^\[/ && in_auth {
  in_auth=0
}

in_auth {
  if ($0 ~ /^signout_url[[:space:]]*=/) {
    next
  }

  if ($0 ~ /^signout_redirect_url[[:space:]]*=/) {
    print "signout_redirect_url = " HOST_IP ":3000/login?disableAutoLogin=true"

    if (!printed_signout_url) {
      print "signout_url = " KC_URL "/realms/" REALM_NAME "/protocol/openid-connect/logout"
      printed_signout_url=1
    }
    next
  }
}

{ print }
' "$GRAFANA_CONFIG_PATH" > "${GRAFANA_CONFIG_PATH}.tmp" \
&& mv "${GRAFANA_CONFIG_PATH}.tmp" "$GRAFANA_CONFIG_PATH"

sed -i 's/^\[auth\.generic_oauth\]/[auth.generic_oauth_2]/' "$GRAFANA_CONFIG_PATH"

# [auth.generic_oauth] 섹션 추가
echo "[INFO] 새로운 [auth.generic_oauth] 섹션 추가 중..."

NEW_SECTION=$(cat <<EOF
[auth.generic_oauth]
name = OAuth
enabled = true
allow_sign_up = false
client_id = ${CLIENT_ID_WALL}
client_secret = ${CLIENT_SECRET_WALL}
auth_url = ${KC_URL}/realms/${REALM_NAME}/protocol/openid-connect/auth
token_url = ${KC_URL}/realms/${REALM_NAME}/protocol/openid-connect/token
api_url = ${KC_URL}/realms/${REALM_NAME}/protocol/openid-connect/userinfo
scopes = openid profile email
login_attribute_path = preferred_username
email_attribute_path = email
role_attribute_path = contains(roles[*], 'grafana-admin') && 'Admin' || 'Viewer'
auto_login = true
EOF
)

awk -v new_section="$NEW_SECTION" '
  BEGIN { inserted = 0 }
  /^\[auth\.generic_oauth_2\]/ {
    if (!inserted) {
      print new_section
      print ""
      inserted = 1
    }
  }
  { print }
' "$GRAFANA_CONFIG_PATH" > "${GRAFANA_CONFIG_PATH}.tmp"

mv "${GRAFANA_CONFIG_PATH}.tmp" "$GRAFANA_CONFIG_PATH"

echo "✅ WALL 클라이언트 '${CLIENT_ID_WALL}' 설정 완료"

# ---------------------------------------------
# Grafana admin 계정과 Keycloak OAuth 계정 연결
# ---------------------------------------------
# 1. SQLite3 설치확인 및 설치
# if ! command -v sqlite3 &> /dev/null
# then
#   echo "[INFO] SQLite3가 설치되어 있지 않습니다. 설치 중..."
#   sudo dnf install sqlite -y
# else
#   echo "[INFO] SQLite3가 이미 설치됨"
# fi

# 2. Grafana Admin 계정 OAuth 권한부여
# Grafana admin user_id 조회
GRAFANA_ADMIN_USER_ID=$(sqlite3 "$GRAFANA_DB" "SELECT id FROM user WHERE login='${ADMIN_USER}';")
if [ -z "$GRAFANA_ADMIN_USER_ID" ]; then
  echo "[ERROR] Grafana admin 계정을 찾을 수 없습니다."
fi
echo "[INFO] Grafana admin user_id: $GRAFANA_ADMIN_USER_ID"

# Keycloak admin 사용자 ID(auth_id) 조회
KC_USER_ID=$(curl -s -X GET "$KC_URL/admin/realms/$REALM_NAME/users?username=$ADMIN_USER" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq -r '.[0].id')

if [ -z "$KC_USER_ID" ] || [ "$KC_USER_ID" == "null" ]; then
  echo "[ERROR] 사용자 '$ADMIN_USER' UUID를 찾을 수 없습니다."
fi
echo "[INFO] Keycloak admin auth_id: $KC_USER_ID"

# Grafana user_auth 테이블에 INSERT
sqlite3 "$GRAFANA_DB" <<EOF
INSERT INTO user_auth (user_id, auth_module, auth_id, created)
VALUES ($GRAFANA_ADMIN_USER_ID, 'oauth_generic_oauth', '$KC_USER_ID', datetime('now'));
EOF

echo "✅ Grafana admin 계정과 Keycloak OAuth 계정 연결 완료"

systemctl restart grafana-server.service

# ---------------------------------------------
# 불필요파일 삭제
# ---------------------------------------------
rm -rf $CERT_CRT $CERT_KEY $KEYSTORE_FILE ${INSTALL_DIR}/idp_metadata.xml

echo "==============================="
echo "✅ Keycloak Client 등록 완료"
echo "==============================="