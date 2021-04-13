# cloudinit-status 사용법

## cloud-init 결과 조회
```shell
python3 cloudinit_status.py status --target ccvm
```

##출력
```json
{
  "code": 200,
  "val": [
    "status: done"
  ],
  "name": "cloudinitStatus",
  "type": "list"
}
```

## ping 결과 조회
```shell
python3 cloudinit_status.py ping --target ccvm
```

##출력
```json
{
  "code": 200,
  "val": {
    "host": "ccvm",
    "ping": "OK"
  },
  "name": "guestvmPing",
  "type": "dict"
}
```