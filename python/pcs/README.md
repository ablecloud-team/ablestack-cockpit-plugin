### 개발환경 및 사전준비
#### 개발환경
| OS |CentOS 8.3 |
|:--|:--|
| Python  | 3.6.8  |
| pcs  | 0.10.6 |
#### 사전준비
##### 1. pcs resource로 virtual domain(cloudcenter vm)을 사용하기 위해 xml 파일 및 qcow2 파일 필요
##### 2. virtual domain(cloudcenter vm)의 네트워크를 bridge 방식으로 연결하기 위해 호스트 네트워크 bridge 설정 필요
##### 3. /etc/hosts 파일, ssh key 교환 필요, 방화벽 설정, selinux 설정 등

![qcow2_image](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-1.png?raw=true)

![network_image](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-2.png?raw=true)

#### 설치 및 설정

```
dnf install --enablerepo=ha pcs
dnf install libvirt
systemctl enable --now libvirtd
systemctl enable --now pcsd
passwd hacluster (password : password)

pip3 install ablestack_common-0.1.post20210315.dev23-py3-none-any.whl
pip3 install sh
pip3 install bs4
```

#### pcs cluster create
```
python3 main.py config --cluster cloudcenter_cluster --hosts ablecube1 ablecube2 ablecube3
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-3.png?raw=true)


#### pcs resource create
```
python3 main.py create --resource cloudcenter_res --xml /opt/cloudcenter.xml
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-4.png?raw=true)


#### pcs resource disable
```
python3 main.py disable --resource cloudcenter_res
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-5.png?raw=true)


#### pcs resource enable
```
python3 main.py enable --resource cloudcenter_res
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-6.png?raw=true)


#### pcs resource move
```
python3 main.py move --resource cloudcenter_res --target ablecube1
```
##### 같은 호스트로 이동
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-7.png?raw=true)

##### 정지 상태에서 이동
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-15.png?raw=true)

##### 정상 이동
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-8.png?raw=true)


#### pcs resource cleanup
```
python3 main.py cleanup --resource cloudcenter_res
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-9.png?raw=true)


#### pcs resource remove
```
python3 main.py remove --resource cloudcenter_res
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-10.png?raw=true)


#### pcs cluster destroy
```
python3 main.py destroy
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-16.png?raw=true)


#### pcs resource status
```
python3 main.py status --resource cloudcenter_res
```
##### 실행 상태
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-11.png?raw=true)

##### 정지 상태
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-12.png?raw=true)

##### 클러스터가 구성되지 않은 경우
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-17.png?raw=true)

##### 리소스가 생성되지 않은 경우
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-18.png?raw=true)

### resource 2개 이상
#### pcs resource 추가 생성
```
python3 main.py create --resource ablecloud_res --xml /opt/ablecloud.xml
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-13.png?raw=true)


#### pcs resource status
```
python3 main.py status --resource cloudcenter_res
python3 main.py status --resource ablecloud_res
```
![pcs_cluster](https://github.com/ablecloud-team/ablecloud-homepage/blob/master/wiki-img/pcs-readme-14.png?raw=true)

#### resource 시작, 정지, 이동 삭제, 클린업 등의 기능도 resource 별로 실행할 수 있음
