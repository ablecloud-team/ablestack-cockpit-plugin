#스토리지 센터 가상머신 상태를 조회 및 상태 변경 기능입니다.

##사용법(가상머신 상태를 조회)
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





##사용법(가상머신 상태변경- 시작, 정지, 삭제, 자원변경)
```shell
(시작)
# python3 /usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py start

(정지)
# python3 /usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py stop

(삭제)
# python3 /usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py delete

(자원변경)
# python3 /usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py resource -c 2 -m 2


```



```
예시 : python3 /usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py resource -c 2 -m 2

json 형태의 return값 확인
{
    "code": 200,
    "val": "......"
    "name": "......",
    "type": "dict"
}
```


