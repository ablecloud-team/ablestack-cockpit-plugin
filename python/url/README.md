#스토리지 및 클라우드 센터 관련 연결 주소를 생성 기능 개발
스토리지 및 클라우드 센터 관련 연결 주소를 생성하기 위한 기능입니다.

##사용법
```shell
# python3 python/url/create_address.py {cloudCenterVm, cloudCenter, storageCenter, storageCenterVm} [-H]
-H 옵션: 줄바꿈이 된 사람이 읽기 편한 json으로 출력
```

##예시
python3 python/url/create_address.py storageCenterVm

```json
{
  "code": 200,
  "val": "https://10.10.0.102:9090",
  "name": "storageCenterVm",
  "type": "str"
}
```

python3 python/url/create_address.py storageCenter

```json
{
  "code": 500,
  "val": "ceph mgr module is not activated.",
  "name": "storageCenter",
  "type": "str"
}
```


##기타
CCVM 의 cloudstack 포트는 8080으로 고정하며, https 로 구성한 경우에는 web.xml 파일에 automatic redirect 설정해야 함