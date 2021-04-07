#!/usr/bin/env bash
#########################################
#Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
#ceph 스토리지를 초기화(bootstrap)하는 스크립트
#
#최초작성자 : 윤여천 책임(ycyun@ablecloud.io)
#최초작성일 : 2021-04-05
#########################################
set -x
#scvm의 PN-ip를 갖는 host목록 생성
conffile=/root/ceph.conf
hosts=$(grep scvm /etc/hosts| grep -v mngt | grep -v cn | awk {'print $1'})
allhosts=$(grep -v mngt /etc/hosts | grep -v cn | grep -v localhost | awk {'print $1'})
echo "[global]" > "$conffile"
echo -n -e "\tmon_host = " >> "$conffile"
for host in $hosts
do
  echo -n "[v2:$host:3300/0,v1:$host:6789/0], " >> "$conffile"
done
echo >> "$conffile"
echo -n -e "\tmon host = " >> "$conffile"
for host in $hosts
do
  echo -n "[v2:$host:3300/0,v1:$host:6789/0], " >> "$conffile"
done
echo  >> "$conffile"
echo -e "\tcontainer_image = docker-archive:/usr/share/ablestack/ablestack.tar:localhost/ceph/daemon:ablestack" >> "$conffile"
echo -e "\tmgr/cephadm/container_image_base = localhost/ceph/daemon:ablestack" >> "$conffile"
echo >> "$conffile"
sed -i 's/, $//' "$conffile"

#container image id추출
image=$(/bin/podman inspect --format {{.ID}},{{.RepoDigests}} docker-archive:/usr/share/ablestack/ablestack.tar:localhost/ceph/daemon:ablestack | cut -d "," -f 2 | sed 's/\[//' | sed 's/]//' )
cephadm --image "$image" bootstrap \
        --initial-dashboard-user ablecloud \
        --initial-dashboard-password Ablecloud1! \
        --ssh-private-key /root/.ssh/id_rsa \
        --ssh-public-key /root/.ssh/id_rsa.pub \
        --no-minimize-config \
        --skip-pull \
        --allow-overwrite \
        --mon-ip "$(grep -w scvm$ /etc/hosts | awk {'print $1'})" \
        --cluster-network $(grep scvm-cn /etc/hosts| awk {'print $1'}| cut -d '.' -f 1-3).0/24 \
        --config "$conffile" \
        --with-exporter && \
        ceph config set global container_image docker-archive:/usr/share/ablestack/ablestack.tar:localhost/ceph/daemon:ablestack && \
        ceph config set global mgr/cephadm/container_image_base $image && \
        ceph config set client rbd_cache_policy writeback && \
        ceph config set client rbd_cache_size 1073741824 && \
        ceph config set client rbd_cache_max_dirty 805306368 && \
        ceph config set client rbd_cache_target_dirty 536870912 && \
        ceph config set client rbd_cache_max_dirty_age 5.0

crontab<<EOF
* * * * * /usr/local/bin/ipcorrector
EOF

for host in $allhosts
do
  scp -o StrictHostKeyChecking=no /etc/ceph/* $host:/etc/ceph/
done
for host in $hosts
do
  ssh -o StrictHostKeyChecking=no $host rm -rf /root/bootstrap.sh
done