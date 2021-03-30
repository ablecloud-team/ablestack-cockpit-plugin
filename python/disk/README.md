#디스크 장치 정보 조회 기능 개발
디스크장치의 정보를 조회하기 위한 기능입니다.

##사용법
```shell
# python3 python/disk/disk_action.py list [-H]
-H 옵션: 줄바꿈이 된 사람이 읽기 편한 json으로 출력
```

##출력
```json
{
  "code": 200,
  "val": {
    "blockdevices": [
      "block device(disk) 정보"
    ],
    "raidcontrollers": [
      "raid contoller 정보" 
    ]
  },
  "name": "listDiskInterface",
  "type": "dict"
}
```

##출력 예시
```json
{
  "code": 200,
  "val": {
    "blockdevices": [
      {
        "name": "sda",
        "path": "/dev/sda",
        "rota": false,
        "model": "Seagate_BarraCuda_SSD_ZA2000CM10002",
        "size": "1.8T",
        "state": "running",
        "group": "disk",
        "type": "disk",
        "tran": "sata",
        "subsystems": "block:scsi:pci",
        "children": [
          {
            "name": "sda1",
            "path": "/dev/sda1",
            "rota": false,
            "model": null,
            "size": "16M",
            "state": null,
            "group": "disk",
            "type": "part",
            "tran": null,
            "subsystems": "block:scsi:pci"
          },
          {
            "name": "sda2",
            "path": "/dev/sda2",
            "rota": false,
            "model": null,
            "size": "930.5G",
            "state": null,
            "group": "disk",
            "type": "part",
            "tran": null,
            "subsystems": "block:scsi:pci"
          },
          {
            "name": "sda3",
            "path": "/dev/sda3",
            "rota": false,
            "model": null,
            "size": "513M",
            "state": null,
            "group": "disk",
            "type": "part",
            "tran": null,
            "subsystems": "block:scsi:pci"
          },
          {
            "name": "sda4",
            "path": "/dev/sda4",
            "rota": false,
            "model": null,
            "size": "932G",
            "state": null,
            "group": "disk",
            "type": "part",
            "tran": null,
            "subsystems": "block:scsi:pci"
          }
        ]
      },
      {
        "name": "nvme0n1",
        "path": "/dev/nvme0n1",
        "rota": false,
        "model": "SAMSUNG MZVLB512HBJQ-00000",
        "size": "477G",
        "state": "live",
        "group": "disk",
        "type": "disk",
        "tran": "nvme",
        "subsystems": "block:nvme:pci",
        "children": [
          {
            "name": "nvme0n1p1",
            "path": "/dev/nvme0n1p1",
            "rota": false,
            "model": null,
            "size": "100M",
            "state": null,
            "group": "disk",
            "type": "part",
            "tran": "nvme",
            "subsystems": "block:nvme:pci"
          },
          {
            "name": "nvme0n1p2",
            "path": "/dev/nvme0n1p2",
            "rota": false,
            "model": null,
            "size": "16M",
            "state": null,
            "group": "disk",
            "type": "part",
            "tran": "nvme",
            "subsystems": "block:nvme:pci"
          },
          {
            "name": "nvme0n1p3",
            "path": "/dev/nvme0n1p3",
            "rota": false,
            "model": null,
            "size": "476.3G",
            "state": null,
            "group": "disk",
            "type": "part",
            "tran": "nvme",
            "subsystems": "block:nvme:pci"
          },
          {
            "name": "nvme0n1p4",
            "path": "/dev/nvme0n1p4",
            "rota": false,
            "model": null,
            "size": "526M",
            "state": null,
            "group": "disk",
            "type": "part",
            "tran": "nvme",
            "subsystems": "block:nvme:pci"
          }
        ]
      }
    ],
    "raidcontrollers": [
      {
        "Slot": "00:00.0",
        "Class": "Raid",
        "Vendor": "Advanced Micro Devices, Inc. [AMD]",
        "Device": "Raid",
        "SVendor": "Advanced Micro Devices, Inc. [AMD]",
        "SDevice": "testRaid"
      }
    ]
  },
  "name": "listDiskInterface",
  "type": "dict"
}
```
