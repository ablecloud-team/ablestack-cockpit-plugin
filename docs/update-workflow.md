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
로그의 `전체 업데이트 종료: 완료`를 확인한 후 사용자가 직접 재부팅합니다.
실패 시에는 `전체 업데이트 종료: 실패`와 종료 코드를 기록합니다.

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
