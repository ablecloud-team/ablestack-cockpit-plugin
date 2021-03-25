#스토리지 및 클라우드 센터 관련 연결 주소를 생성 기능 개발
스토리지 및 클라우드 센터 관련 연결 주소를 생성하기 위한 기능입니다.

##사용법
```shell
# python/storage_center_vm_status/scvm_status_detail.py detail

```



```

python3 /usr/share/cockpit/ablestack/python/storage_center_cluster_status/scvm_status_detail.py detail

json 형태의 return값 확인
{
    "code": 200,
    "val": {
        "scvm_status": "running",
        "vcpu": 16,
        "socket": "XXX",
        "core": "XXX",
        "memory": "32.0 GiB",
        "rdisk": "70.00 GiB",
        "manageNicType": "virtio",
        "manageNicParent": "bridge0",
        "manageNicIp": "10.10.1.11/16",
        "manageNicGw": "XXX",
        "storageServerNicType": "virtio",
        "storageServerNicParent": "br-PN",
        "storageServerNicIp": "100.100.1.11/24",
        "storageReplicationNicType": "virtio",
        "storageReplicationNicParent": "br-CN",
        "storageReplicationNicIp": "100.200.1.11/24",
        "dataDiskType": "XXX"
    },
    "name": "Storage Center VM Status Detail",
    "type": "dict"
}
```



##기타
socket, core, manageNicGw, dataDiskType데이터는 현재 확인 불가