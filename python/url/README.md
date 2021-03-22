#스토리지 및 클라우드 센터 관련 연결 주소를 생성 기능 개발
스토리지 및 클라우드 센터 관련 연결 주소를 생성하기 위한 기능입니다.

##사용법
```shell
# python3 python/url/create_address.py {cloudCenterVm, cloudCenter, storageCenter, storageCenterVm} [-H]
-H 옵션: 줄바꿈이 된 사람이 읽기 편한 json으로 출력
```

##출력 예시
```json
{
  "code": 200,
  "val": "https://10.10.0.102:9090",
  "name": "storageCenterVm",
  "type": "str"
}
```
