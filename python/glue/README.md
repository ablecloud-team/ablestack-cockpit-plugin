#### 설치해야할 모듈
```
pip3 install cryptocode
```

#### gluefs config
```
python3 gluefs.py config --type {type} --mount-path {mount path} --quota {quota} 

-MDS 서비스 생성, fs 이름의 cephfs 생성, gluefs/smb/nfs 구성에 따라 host/gwvm 마운트

옵션 (필수는 *표시)
*{type} : gluefs, smb, nfs 중 하나 입력
{mount path} : type이 gluefs 인 경우 입력
{quota} : 선택
```
#### gluefs destroy
```
python3 gluefs.py destroy 

-MDS 서비스, 파일 시스템, Pool 삭제
```

#### gluefs status
```
python3 gluefs.py status 

-MDS 서비스 상태 출력
```

#### gluefs list
```
python3 gluefs.py list 

-cephFS 조회
```

#### gluefs detail
```
python3 gluefs.py detail 

-파일 시스템 이름이 fs인 cephFS 상세 조회
```

#### gluefs quota
```
python3 gluefs.py quota --path {path} --quota {quota}

-quota 목록 조회 및 quota 편집

-옵션 (필수는 *표시)
*{path} : quota 편집시 /gluefs, /nfs, /smb 중 하나 입력
*{quota} : quota 편집시 bytes 단위로 입력하며, quota 삭제시 0으로 입력
```

#### gluefs mount
```
python3 gluefs.py mount 

-/fs/gluefs 경로의 파일시스템을 마운트한 호스트의 마운트 경로
```

#### gluefs edit
```
python3 gluefs.py edit --mount-path {mount path} --quota {quota}

-/fs/gluefs 경로의 파일시스템을 호스트에 마운트할 경로나 quota 변경

-옵션 (필수는 *표시)
{mount path} : 호스트에 glueFS를 마운트할 경로
{quota} : quota 편집시 bytes 단위로 입력하며, quota 삭제시 0으로 입력
```

#### gluefs delete
```
python3 gluefs.py delete 

-/fs/gluefs 경로의 파일시스템을 마운트한 호스트의 마운트 해제 및 디렉토리 비우는 작업 
```

#### nfs config
```
python3 nfs.py config

-nfs.nfs 이름의 클러스터 서비스 생성
```

#### nfs destroy
```
python3 nfs.py destroy

-nfs.nfs 이름의 클러스터 서비스 삭제 및 export 삭제 
```

#### nfs status
```
python3 nfs.py status

-nfs 서비스 상태 출력
```

#### nfs list
```
python3 nfs.py list

-nfs export 목록 조회
```

#### nfs detail
```
python3 nfs.py detail

-cephfs의 /nfs 경로로 설정된 nfs export 상세 조회
```

#### nfs create
```
python3 nfs.py create --access-type {access_type} --squash {squash} --quota {quota}

-cephfs의 /nfs 경로로 설정된 nfs export 생성

-옵션 (필수는 *표시)
*{access_type} : RW, RO, NONE 중 선택
*{squash} : no_root_squash, root_id_squash, root_squash, all_squash 중 선택
{quota} : bytes 단위로 입력, 디폴트 0
```

#### nfs delete
```
python3 nfs.py delete

-cephfs의 /nfs 경로로 설정된 nfs export 삭제
```

#### nfs edit
```
python3 nfs.py edit --access-type {access_type} --squash {squash} --quota {quota}

-cephfs의 /nfs 경로로 설정된 nfs export 편집 및 quota 편집

-옵션 (필수는 *표시)
*{access_type} : RW, RO, NONE 중 선택
*{squash} : no_root_squash, root_id_squash, root_squash, all_squash 중 선택
{quota} : bytes 단위로 입력, 디폴트 0
```

#### iscsi config
```
python3 iscsi.py config

-iscsi.iscsi 이름의 iscsi 클러스터 서비스 생성
```

#### iscsi destory
```
python3 iscsi.py destory

-iscsi.iscsi 이름의 iscsi 클러스터 서비스 삭제
```

#### iscsi status
```
python3 iscsi.py status

-iscsi 서비스 상태 조회
```

#### iscsi list
```
python3 iscsi.py list

-iscsi target 목록 조회
```

#### iscsi detail
```
python3 iscsi.py detail --iqn {iqn}

-iscsi target iqn의 상세 조회

-옵션 (필수는 *표시)
*{iqn} : iscsi target iqn
```

#### iscsi create
```
python3 iscsi.py create --iqn {iqn} --name {image name} --size {image size}

-rbd 이미지를 연결한 iscsi target 생성

-옵션 (필수는 *표시)
*{iqn} : iscsi target iqn
*{image name} : 기존 rbd image 명이거나 새로 생성할 image 명
{image size} : 새로 생성할 image 크기 (입력 형식: 10g, 5m 등)
```

#### iscsi delete
```
python3 iscsi.py delete --iqn {iqn} --name {image name}

-iscsi target 삭제 및 연결된 rbd image 삭제

-옵션 (필수는 *표시)
*{iqn} : iscsi target iqn
{image name} : 삭제할 rbd image 이름
```

#### iscsi edit
```
python3 iscsi.py edit --name {image name} --size {new image size}

-iscsi target 에 연결된 rbd image 크기 변경

-옵션 (필수는 *표시)
*{image name} : 연결된 rbd image 이름 
*{new image size} : 연결된 rbd image 크기 (입력 형식: 10g, 5m 등)
```

#### rbd image
```
python3 iscsi.py image --name {image name} 

-rbd image 목록 조회 및 상세조회

-옵션 (필수는 *표시)
{image name} : rbd image 이름
```