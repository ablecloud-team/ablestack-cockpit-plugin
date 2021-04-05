#!/usr/bin/env bash

#scvm의 PN-ip를 갖는 host목록 생성
conffile=/root/ceph.conf
hosts=$(grep scvm /etc/hosts| grep -v mngt | cut -d " " -f 1)
echo "[global]" > "$conffile"
echo -n -e "\tmon_host = " >> "$conffile"
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
	--initial-dashboard-user ablestack \
	--initial-dashboard-password Ablecloud1! \
	--ssh-private-key /root/.ssh/id_rsa \
	--ssh-public-key /root/.ssh/id_rsa.pub \
	--no-minimize-config \
	--skip-pull \
	--allow-overwrite \
	--mon-ip "$(grep -w scvm /etc/hosts | cut -f 1)" \
	--cluster-network "$(ip a | grep 200 | tr -s " " | cut -d " " -f 3)" \
	--config "$conffile" \
	--with-exporter #for simple api https://docs.ceph.com/en/latest/dev/cephadm/cephadm-exporter/

ceph config set global container_image docker-archive:/usr/share/ablestack/ablestack.tar:localhost/ceph/daemon:ablestack
ceph config set global mgr/cephadm/container_image_base localhost/ceph/daemon:ablestack
ceph config set client rbd_cache_policy writeback
ceph config set client rbd_cache_size 1073741824
ceph config set client rbd_cache_max_dirty 805306368
ceph config set client rbd_cache_target_dirty 536870912
ceph config set client rbd_cache_max_dirty_age 5.0

crontab<<EOF
* * * * * /usr/local/bin/ipcorrector
EOF



hosts=$(cat /etc/hosts|grep scvm | grep -v mngt | cut -d " " -f 1)
echo "[global]" > $conffile
echo -n -e "\tmon_host = " >> $conffile
for host in $hosts
do
  echo -n "[v2:$host:3300/0,v1:$host:6789/0], " >> $conffile
done
echo  >> $conffile
echo -e "\tcontainer_image = docker-archive:/usr/share/ablestack/ablestack.tar:localhost/ceph/daemon:ablestack" >> $conffile
echo -e "\tmgr/cephadm/container_image_base = localhost/ceph/daemon:ablestack" >> $conffile
echo >> $conffile
echo "[client]" >> $conffile
echo -e "\trbd_cache_policy = writeback" >> $conffile
echo -e "\trbd_cache_size = 1073741824" >> $conffile
echo -e "\trbd_cache_max_dirty = 805306368" >> $conffile
echo -e "\trbd_cache_target_dirty = 536870912" >> $conffile
echo -e "\trbd_cache_max_dirty_age = 5.0" >> $conffile
echo >> $conffile
echo "[mgr]" >> $conffile
echo -e "\tcontainer_image = docker-archive:/usr/share/ablestack/ablestack.tar:localhost/ceph/daemon:ablestack" >> $conffile
echo -e "\tmgr/cephadm/container_image_base = localhost/ceph/daemon:ablestack" >> $conffile
sed -i 's/, $//' $conffile
cat $conffile