# 전체 업데이트와 ABLESTACK Tools 업데이트

업데이트 ISO의 `update/` 디렉터리에 다음 파일을 함께 넣습니다.

- `update-all.sh`
- `update-qemu-exec-tools.sh`
- `update-mold.sh` (Mold 업데이트를 제공하는 ISO)

## 전체 업데이트

```bash
bash /마운트경로/update/update-all.sh --include-cockpit
tail -f /var/log/ablestack-update.log
```

`update-all.sh`는 nohup과 setsid로 백그라운드 작업을 시작하고 PID를 출력한 뒤 반환합니다.
표준 입력은 분리하고 출력은 기존 로그에 기록합니다. SSH 연결이 끊겨도 작업이 계속됩니다.
네트워크 단절 자체를 방지하는 기능은 아닙니다.
ISO에서 직접 실행한 경우 작업이 완료될 때까지 마운트를 유지합니다.

Cockpit의 **전체 업데이트**도 같은 스크립트를 실행합니다. 시작 응답은 업데이트 완료를 의미하지 않습니다.
영어 원본 로그의 `Full update finished: completed.`를 확인한 후 사용자가 직접 재부팅합니다.
실패 시에는 `Full update finished: failed (exit=...)`와 종료 코드를 기록합니다.

전체 업데이트에서는 호스트·SCVM·CCVM 모두 `ablestack-qemu-exec-tools*` 패키지를 제외합니다.
Tools ISO의 `install-linux.sh`도 실행하지 않습니다.
기존 `--nobest`, 종속성 보류 기록, 커널 부팅 준비 처리는 유지합니다.

## 재부팅 후 Tools 업데이트

```bash
uname -r
bash /마운트경로/update/update-qemu-exec-tools.sh --check
bash /마운트경로/update/update-qemu-exec-tools.sh
```

실행 커널, 최신 설치된 `kernel-core`, ISO의 현재 아키텍처용 최신 `kernel-core`를 비교합니다.
세 버전이 일치하고 커널 모듈·부팅 이미지가 있어야 설치합니다.
불일치하면 현재 커널과 대상 커널을 화면 및 `/var/log/ablestack-update.log`에 기록하고 중단합니다.
설치 프로그램 실패는 오류로 처리하며, 설치 후 Tools 패키지 존재도 확인합니다.

Cockpit에서 **ABLESTACK Tools 업데이트**를 선택하면 버전 확인 단계에서 커널을 검사하고,
실행 시 `update/update-qemu-exec-tools.sh`를 실행합니다.
전체 업데이트가 복사한 파일을 보존한 경우 마운트 경로에 `/opt/ABLESTACK_UPDATE`를 입력해
ISO를 다시 복사하지 않고 실행할 수 있습니다.

전체 업데이트와 Tools 설치는 같은 호스트 잠금을 사용합니다. Cockpit의 Mold 업데이트도 이 잠금을 사용합니다.
실행 중인 작업이 있으면 복사 대상 삭제나 새 업데이트 실행 전에 중단합니다.

## 로그 표시 언어

호스트·SCVM·CCVM의 스크립트 진행·오류 메시지와 수동 실행 출력은 영어로 기록합니다.
`LC_ALL=C`를 사용하여 시스템 명령의 출력 언어도 영어로 맞춥니다.
전체/Tools 원본 로그는 `/var/log/ablestack-update.log`, Mold 원본 로그는
`/var/log/ablestack-mold-update.log`이며 IPMI 콘솔에서 그대로 조회할 수 있습니다.

Cockpit 업데이트 창의 **업데이트 로그**는 최근 300줄(최대 64 KiB)을 5초마다 조회하고,
알려진 스크립트 메시지만 한국어로 표시합니다. 타임스탬프, 대상 VM, 종료 코드,
커널 버전, 패키지 이름, 경로와 DNF/RPM의 원문 진단 내용은 보존합니다.
Tools의 버전 확인 및 설치 실패 메시지도 한국어로 표시합니다.
표시를 위한 변환은 원본 로그 파일을 수정하지 않습니다.

진행 로그는 `ablestack_update.py log --update-type all|mold|tools`로 조회합니다.
이 조회는 업데이트나 서비스 재시작을 실행하지 않으며 임의 파일 경로를 받지 않습니다.
이전 한국어 로그는 기존 내용대로 표시합니다.

## OS 패키지 업데이트 중 firewalld 처리

`update-all.sh`는 호스트·SCVM·CCVM 각각의 RPM 업데이트 구간에 같은 처리를 적용합니다.
실행 중인 firewalld의 런타임 zone, 정책, IP set 항목 및 direct 규칙을 백업하고,
`systemctl mask --runtime --now firewalld.service`로 데몬을 정지하고 자동 활성화를 막습니다.
정지 시 삭제될 수 있는 기존 커널 규칙은 백업 후 즉시 재적용하여 업데이트 중 유지합니다.
iptables/ip6tables/ebtables, IP set 및 firewalld의 nftables 테이블을 처리합니다.
전체 nftables ruleset을 비우는 명령은 사용하지 않습니다.

RPM 처리가 반환되면 전용 EXIT 트랩이 임시 마스킹을 해제하고 기존 상태를 복원합니다.
원래 실행 중이었던 경우에만 서비스를 시작하고, 런타임 설정과 실행 상태를 검증합니다.
원래 정지·마스킹 상태였거나 설치되어 있지 않은 경우에는 새로 활성화하지 않습니다.
부팅 시 활성화 설정도 보존하며 런타임 규칙을 영구 설정으로 저장하지 않습니다.
복원 실패는 업데이트 실패로 반환하므로 커널 후처리나 완료 보고로 넘어가지 않습니다.
백업 실패나 안전하게 보존할 수 없는 timeout IP set은 정지·업데이트 전에 오류로 처리합니다.

백업은 해당 실행의 `/var/log/ablestack-update-packages/` 아래
`host-firewalld.*`, `scvm-firewalld.*`, `ccvm-firewalld.*` 디렉터리에 보존합니다.
VM 백업은 해당 VM에 남습니다. 정상 종료·패키지 실패·처리 가능한 종료 시그널에서 복원을 시도합니다.
SIGKILL이나 전원 차단에서는 트랩 실행을 보장할 수 없으며, 임시 마스크는 다음 부팅 때 사라집니다.

스토리지 검사는 시작 시 최근 5분의 오류를 확인한 뒤 커널 저널의 시작 지점을 기록합니다.
이번 실행 이후의 새 I/O 오류·hung task 등은 계속 실패로 처리합니다.
더 오래된 기록은 `host-kernel-before.log`에 보존하고 새 오류는 `host-kernel-errors.log`에 기록합니다.
커널 저널을 읽을 수 없는 경우에도 검사를 통과시키지 않습니다.

서비스·포트·rich rule의 `--timeout` 남은 시간은 firewalld 런타임 조회 API에 포함되지 않습니다.
런타임 규칙의 내용은 복원하지만 이 만료 시간은 재현하지 못하므로 시간제한 규칙을 사용하는 운영 정책은
별도로 확인해야 합니다. timeout IP set은 이 제약을 사전에 식별할 수 있어 정지 전에 오류로 처리합니다.

## 호스트 UEFI 펌웨어 형식 보존

신규 설치의 kickstart는 OVMF `.fd` 파일을 QCOW2로 변환하고 펌웨어 JSON 정의도 QCOW2로 맞춥니다.
`edk2-ovmf` RPM 업데이트가 같은 경로에 RAW 파일과 RAW JSON 정의를 설치하면,
기존 VM의 QCOW2 지정과 달라져 다음 시작 때 호환되는 EFI 펌웨어를 찾지 못할 수 있습니다.

전체 업데이트는 VM 업데이트 전과 호스트 RPM 처리 후 실제 이미지 형식을 검사합니다.
RAW인 `/usr/share/edk2/ovmf/*.fd`만 QCOW2로 변환하며 이미 QCOW2인 파일과 심볼릭 링크는 보존합니다.
변환 결과의 형식·가상 크기·원본과의 내용 일치를 검사한 뒤 파일을 교체하고,
해당 파일을 참조하는 펌웨어 JSON의 형식 필드만 맞춥니다. 커널 RPM 업데이트가 실패해 반환된 경우에도
펌웨어 복구를 시도하며, 복구 성공을 전체 업데이트 성공으로 보고하지 않습니다.
백업과 원래 경로 목록은 해당 실행의 `host-uefi-*` 디렉터리에 남깁니다.

로컬에 영구 정의된 SCVM·CCVM은 비활성 XML의 펌웨어 형식을 실제 파일과 대조하고,
필요한 경우 XML을 백업한 뒤 형식 속성만 수정합니다. machine type, Secure Boot 정책과 VM 디스크는
변경하지 않습니다. 관리 주체가 별도의 XML로 생성하는 일시적 VM을 영구 VM으로 재정의하지 않습니다.
VM 시작과 재부팅은 자동으로 실행하지 않습니다.

커널 업데이트 시 VM NVRAM을 삭제하는 동작은 기본적으로 비활성화합니다.
이전 스크립트가 남긴 SCVM·CCVM 초기화 예약 파일도 백업으로 이동하며, 기존 NVRAM 내용은 보존합니다.
NVRAM이 없는 경우에는 실제 템플릿 형식으로 XML을 맞추고 다음 VM 시작 때 libvirt가 생성하도록 합니다.
기존 NVRAM의 가상 크기가 템플릿과 다르면 삭제하거나 변환하지 않고 오류로 중단합니다.

이미 EFI 형식 불일치로 SCVM 시작이 실패한 호스트는 수정된 스크립트의 복구 전용 옵션을 사용합니다.
이 옵션은 ISO 데이터, 실행 중인 SCVM 또는 패키지 업데이트를 요구하지 않으며,
전체 업데이트와 같은 호스트 잠금을 획득한 뒤 포그라운드로 실행합니다.

```bash
bash /마운트경로/update/update-all.sh --repair-vm-firmware
# 복구 완료를 확인한 뒤 실행
virsh start scvm
virsh domstate scvm
```

복구 로그도 `/var/log/ablestack-update.log`에 기록합니다. 복구 완료는 OS 전체 업데이트 완료를 의미하지 않습니다.
