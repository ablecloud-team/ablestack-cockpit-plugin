#스토리지 클러스터 상태를 조회 및 상태 변경 기능입니다.

##사용법(스토리지클러스터 상태를 조회)
```shell
# python3 /usr/share/cockpit/ablestack/python/storage_center_cluster_status/scc_status_detail.py detail

```

```
python3 /usr/share/cockpit/ablestack/python/storage_center_cluster_status/scc_status_detail.py detail

json 형태의 return값 확인
{
    "code": 200,
    "val": {
        "cluster_status": "HEALTH_OK",
        "osd": 12,
        "osd_up": 12,
        "mon_gw1": 2,
        "mon_gw2": [
            "scvm1",
            "scvm2"
        ],
        "mgr": "scvm2.hclztm",
        "mgr_cnt": 2,
        "pools": 3,
        "avail": "10 TiB",
        "used": "43 GiB",
        "usage_percentage": "0.40",
        "maintenance_status": false,
        "json_raw": {
            "fsid": "6b146870-8ac1-11eb-9cd5-5254006d9c1a",
            "health": {
                "status": "HEALTH_OK",
                "checks": {},
                "mutes": []
            },
            "election_epoch": 66,
            "quorum": [
                0,
                1
            ],
            "quorum_names": [
                "scvm1",
                "scvm2"
            ],
            "quorum_age": 305977,
            "monmap": {
                "epoch": 4,
                "min_mon_release_name": "pacific",
                "num_mons": 2
            },
            "osdmap": {
                "epoch": 439,
                "num_osds": 12,
                "num_up_osds": 12,
                "osd_up_since": 1616674365,
                "num_in_osds": 12,
                "osd_in_since": 1616386097,
                "num_remapped_pgs": 0
            },
            "pgmap": {
                "pgs_by_state": [
                    {
                        "state_name": "active+clean",
                        "count": 65
                    }
                ],
                "num_pgs": 65,
                "num_pools": 3,
                "num_objects": 5581,
                "data_bytes": 23271459448,
                "bytes_used": 46488731648,
                "bytes_avail": 11475834781696,
                "bytes_total": 11522323513344
            },
            "fsmap": {
                "epoch": 1,
                "by_rank": [],
                "up:standby": 0
            },
            "mgrmap": {
                "available": true,
                "num_standbys": 1,
                "modules": [
                    "cephadm",
                    "dashboard",
                    "diskprediction_local",
                    "insights",
                    "iostat",
                    "prometheus",
                    "restful"
                ],
                "services": {
                    "dashboard": "https://scvm2:8443/",
                    "prometheus": "http://scvm2:9283/"
                }
            },
            "servicemap": {
                "epoch": 2255,
                "modified": "2021-03-29T00:58:43.831536+0000",
                "services": {}
            },
            "progress_events": {}
        }
    },
    "name": "Storage Cluster Status Detail",
    "type": "dict"
}

```







##사용법(스토리지 클러스터 유지보수모드 상태 변경)
```shell
(유지보수모드 세팅)
# python3 /usr/share/cockpit/ablestack/python/storage_center_cluster_status/scc_status_update.py set

(유지보수모드 해제)
# python3 /usr/share/cockpit/ablestack/python/storage_center_cluster_status/scc_status_update.py unset


```




