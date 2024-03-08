#!/usr/bin/env bash
#########################################
#Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
#ccvm 초기화(bootstrap)하는 스크립트
#
#최초작성자 : 윤여천 책임(ycyun@ablecloud.io)
#최초작성일 : 2021-04-12
#########################################
set -x
LOGFILE="/var/log/cloud_install.log"

hosts=$(grep -v mngt /etc/hosts | grep -v scvm | grep -v pn | grep -v localhost | awk {'print $1'})

systemctl enable --now mysqld
DATABASE_PASSWD="Ablecloud1!"
################# firewall setting
firewall-cmd --permanent --zone=public --add-port=8080/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=3306/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=4444/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=4567/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=4568/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=4569/tcp 2>&1 | tee -a $LOGFILE

firewall-cmd --permanent --zone=public --add-port=20048/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=20048/udp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=21064/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=2049/tcp 2>&1 | tee -a $LOGFILE

firewall-cmd --permanent --zone=public --add-port=875/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=32803/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=32769/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=892/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=600/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=662/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=8250/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-service=mysql 2>&1 | tee -a $LOGFILE

################# GlusterFS NFS
#firewall-cmd --permanent --zone=public --add-port=49151-49159/tcp 2>&1 | tee -a $LOGFILE
#firewall-cmd --permanent --zone=public --add-port=38465-38480/tcp 2>&1 | tee -a $LOGFILE
#firewall-cmd --permanent --zone=public --add-port=24007-24015/tcp 2>&1 | tee -a $LOGFILE
#firewall-cmd --permanent --zone=public --add-port=111/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --reload
firewall-cmd --list-all 2>&1 | tee -a $LOGFILE


# resize partition
sgdisk -e /dev/vda
parted --script /dev/vda resizepart 3 100%
pvresize /dev/vda3
lvcreate cs_ablestack-cerato -n nfs --extents 100%FREE
mkfs.xfs /dev/cs_ablestack-cerato/nfs
mkdir /nfs
echo  '/dev/mapper/cs_ablestack--cerato-nfs /nfs                    xfs    defaults        0 0' >> /etc/fstab
echo '/nfs *(rw,no_root_squash,async)' >> /etc/exports
systemctl enable --now nfs-server.service

mkdir /nfs/primary
mkdir /nfs/secondary

################# Setting Database
mysqladmin -uroot password $DATABASE_PASSWD
setenforce 0
systemctl enable --now cloudstack-usage
sed -i 's/SELINUX=enforcing/SELINUX=permissive/g' /etc/selinux/config
cloudstack-setup-databases cloud:$DATABASE_PASSWD --deploy-as=root:$DATABASE_PASSWD  2>&1 | tee -a $LOGFILE

# Cloudstack Global Setting
global_settings=("user.password.encoders.order=SHA256SALT,MD5,LDAP,PLAINTEXT" \
"user.password.encoders.exclude=" "usage.execution.timezone=Asia/Seoul" \
"network.loadbalancer.haproxy.stats.visibility=all" \
"storage.overprovisioning.factor=1" "enable.dynamic.scale.vm=true" \
"kvm.ha.activity.check.interval=60" "kvm.ha.activity.check.max.attempts=10" \
"kvm.ha.activity.check.timeout=60" "kvm.snapshot.enabled=true" )
for i in "${global_settings[@]}"
do
  key=$(echo $i | cut -d "=" -f 1)
  value=$(echo $i | cut -d "=" -f 2)
  mysql --user=root --password=$DATABASE_PASSWD -e "use cloud; UPDATE configuration SET value='$value' where name='$key';"  2>&1 | tee -a $LOGFILE
done

cloudstack-setup-management  2>&1 | tee -a $LOGFILE

systemctl enable --now cloudstack-management

#UEFI 설정 파일 생성
echo -e "guest.nvram.template.secure=/usr/share/edk2/ovmf/OVMF_VARS.secboot.fd
guest.nvram.template.legacy=/usr/share/edk2/ovmf/OVMF_VARS.fd
guest.loader.secure=/usr/share/edk2/ovmf/OVMF_CODE.secboot.fd
guest.loader.legacy=/usr/share/edk2/ovmf/OVMF_CODE.secboot.fd
guest.nvram.path=/var/lib/libvirt/qemu/nvram/" > /root/uefi.properties

for host in $hosts
do
  scp -o StrictHostKeyChecking=no /root/uefi.properties $host:/etc/cloudstack/agent/
done
rm -rf /root/uefi.properties

#tpm 설정 파일 생성
echo -e "host.tpm.enable=true" > /root/tpm.properties
for host in $hosts
do
  scp -o StrictHostKeyChecking=no /root/tpm.properties $host:/etc/cloudstack/agent/
done
rm -rf /root/tpm.properties

#systemvm template 등록
/usr/share/cloudstack-common/scripts/storage/secondary/cloud-install-sys-tmplt \
-m /nfs/secondary \
-f /usr/share/ablestack/systemvmtemplate-* \
-h kvm -F

for host in $hosts
do
  ssh -o StrictHostKeyChecking=no $host /usr/bin/systemctl enable --now pacemaker
  ssh -o StrictHostKeyChecking=no $host /usr/bin/systemctl enable --now corosync
done

# Crushmap 설정 추가 (ceph osd pool autoscale)
sleep 3m
scvm=$(grep scvm-mngt /etc/hosts | awk {'print $1'})
ssh -o StrictHostKeyChecking=no $scvm /usr/local/sbin/setCrushmap.sh

# Delete bootstrap script file
rm -rf /root/bootstrap.sh
