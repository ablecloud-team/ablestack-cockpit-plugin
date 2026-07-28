# ABLESTACK 보안 취약점 증적 자동화

`security_patch.sh`로 보안 업데이트를 완료한 뒤 Cockpit 화면에서
**보안 점검 증적** 버튼을 누르면 클러스터 전체 호스트의 U-01~U-67
점검 명령을 읽기 전용으로 실행합니다.

별도 timer나 service는 사용하지 않습니다.

점검 범위는 `2026 주요정보통신기반시설 기술적 취약점 분석·평가 방법
상세가이드`의 **Unix 서버 U-01~U-67 중 Linux 기준**으로 한정합니다.
Solaris, AIX, HP-UX, Windows 및 네트워크·보안 장비 항목은 수집 대상에
포함하지 않습니다.

## 화면 동작

1. 보안 업데이트가 완료되면 상단 리본에 `보안 점검 증적` 버튼이 표시됩니다.
2. `생성 및 다운로드`를 누르면 호스트별 보안 점검 결과를 수집합니다.
3. 완료되면 `ABLESTACK 보안 취약점 증적 자료.zip` 다운로드 URL이 표시됩니다.
4. 같은 파일은 이후 `설정파일 다운로드` 창에서 다시 받을 수 있습니다.

ZIP에는 다음 파일이 들어 있습니다.

- `ABLESTACK 보안 취약점 증적 자료.pptx`
- `ABLESTACK 보안 취약점 증적 자료.xlsx`
- `ABLESTACK 보안 취약점 증적 자료.txt`

PPTX는 점검 명령 하나를 기본 단위로 배치하고, 결과가 길면 이어지는
슬라이드로 나눕니다. 각 장에는 항목 코드·항목명·판정·점검 대상
호스트/IP·점검 내용·점검 일시·Linux 기준 조치 방법과
`[root@호스트 ~]# 명령어` 형식의 명령 및 결과만 표시합니다.
점검 대상 IP는 `hostname -I`의 첫 번째 주소가 아니라 실제 SSH 접속
대상 주소를 사용하므로 관리망·브리지 주소가 여러 개여도 호스트명과
IP가 올바르게 짝지어집니다.
실행 제어용 `|| true`, 중요도, 안내 문구, 명령 순번, 출력 시작/종료,
종료 코드는 PPT 화면에서 숨기며 원본 TXT에는 그대로 보관합니다.
한 장의 표시 범위를 넘는 결과는 여러 슬라이드로 나누며, 예상 분량이
10장 이하이면 수집된 범위를 모두 표시합니다. 10장을 초과하는 긴 결과는
PPT에서 명령당 2장까지만 표시하고 마지막 장에
`[결과 일부 생략 전체 행=... 표시 행=...]`과 TXT 확인 안내를 넣습니다.
명령당 최대 400행을 수집하며 전체 수집 결과와 생략 안내는 TXT에서
확인할 수 있습니다.

TXT의 보고서·호스트·항목·명령 메타데이터 컬럼은 모두 한글로
기록합니다. U-14의 PATH 값은 로그인 셸에서 수집하므로 root 로그인
환경에 설정된 전체 경로가 TXT에 보존되고 PPT에도 표시됩니다.

## 저장 위치

완료된 실행본은 아래에 시간별로 보관됩니다.

```text
/var/lib/ablestack/security-evidence/YYYYMMDD-HHMMSS/
```

설정파일 다운로드에서 사용하는 최신 ZIP과 메타데이터는 다음 경로입니다.

```text
/var/lib/ablestack/security-evidence/ABLESTACK 보안 취약점 증적 자료.zip
/var/lib/ablestack/security-evidence/latest.json
```

## 명령줄에서 직접 실행

화면과 동일한 패키지를 수동으로 생성할 수도 있습니다.

```bash
python3 /usr/share/cockpit/ablestack/python/security_evidence/security_evidence_package.py generate
```

기본 `generate` 명령은 `cluster.json`의 `clusterConfig.type`을 읽고
다음 대상들을 자동으로 하나의 TXT·PPTX·XLSX에 합칩니다.

| clusterConfig.type | 자동 수집 대상 |
| --- | --- |
| `ablestack-hci` | 모든 ablecube + 모든 scvm + ccvm |
| `ablestack-hci-filesystem` | 모든 ablecube + 모든 scvm + ccvm |
| `ablestack-vm` | 모든 ablecube + ccvm |
| `ablestack-standalone` | ablecube + ccvm |

예를 들어 호스트 항목이 3개인 HCI 구성은 3 ablecube + 3 scvm + 1 ccvm,
총 7대를 수집합니다. VM 구성은 3 ablecube + 1 ccvm, 총 4대를 수집합니다.

## 호스트를 직접 지정해 한 파일로 수집

쉼표 또는 공백으로 구분한 호스트명/IP를 `--host`에 전달할 수 있습니다.

```bash
cd /usr/share/cockpit/ablestack/python/security_evidence

python3 security_evidence.py \
  --host "ablecube1,ablecube2,ablecube3,scvm1,scvm2,scvm3,ccvm" \
  --items all \
  --output "/root/ABLESTACK 보안 취약점 증적 자료.txt"
```

`--host`를 여러 번 사용해도 됩니다.

```bash
python3 security_evidence.py \
  --host "ablecube1,ablecube2,ablecube3" \
  --host "scvm1 scvm2 scvm3" \
  --host "ccvm" \
  --output "/root/ABLESTACK 보안 취약점 증적 자료.txt"
```

직접 지정한 호스트들로 PPTX·XLSX·ZIP까지 만들려면 다음과 같이 실행합니다.

```bash
python3 security_evidence_package.py generate \
  --host "ablecube1,ablecube2,ablecube3,scvm1,scvm2,scvm3,ccvm"
```

수집기는 각 원격 호스트에 SSH로 접속해 점검용 Bash 코드를 표준입력으로
전송합니다. 따라서 CCVM이나 SCVM에 `ablestack-cockpit-plugin`,
`security_evidence.py`, `checks.json`을 별도로 복사할 필요가 없습니다.
명령을 실행하는 ablecube에서 대상 호스트로 root SSH 키 인증이 가능하고,
`ablecube1`, `scvm1`, `ccvm` 같은 이름이 `/etc/hosts` 또는 DNS로
해석되기만 하면 됩니다.

대상과 타입 해석 결과만 먼저 확인하려면 실제 명령을 실행하지 않는
`--dry-run`을 사용합니다.

```bash
python3 security_evidence.py \
  --json /usr/share/cockpit/ablestack/tools/properties/cluster.json \
  --targets all \
  --dry-run
```

패키지 생성기는 현재 sshd 포트를 자동 감지합니다. 포트를 명시하려면
다음처럼 실행합니다. 원본 TXT 수집기를 직접 실행할 때는
`security_evidence.py --ssh-port 10022`처럼 지정합니다.

```bash
python3 /usr/share/cockpit/ablestack/python/security_evidence/security_evidence_package.py \
  generate --ssh-port 10022
```

최신 파일 정보 확인:

```bash
python3 /usr/share/cockpit/ablestack/python/security_evidence/security_evidence_package.py latest
```

## 사람이 Linux 화면을 캡처해야 할 때

PPTX와 XLSX가 자동 생성되므로 일반적으로 별도 캡처는 필요하지 않습니다.
직접 확인해야 하는 경우 원본 TXT에서 항목 코드를 검색한 다음 영역 캡처를
사용할 수 있습니다.

```bash
less -R 'ABLESTACK 보안 취약점 증적 자료.txt'
# less 내부에서 /U-64 입력

gnome-screenshot -a
# 또는
flameshot gui
```

`ITEM_STATUS`는 명령 수집 성공 여부이며 최종 보안 판정은 아닙니다.
최종 양호/취약 판정은 조직 정책과 예외 승인 내용을 함께 검토해야 합니다.
