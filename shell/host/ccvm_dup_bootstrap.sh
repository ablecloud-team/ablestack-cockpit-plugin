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
DATABASE_SERVER_IP="DBSERVERIP"
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
cloudstack-setup-databases cloud:$DATABASE_PASSWD@$DATABASE_SERVER_IP
setenforce 0

cloudstack-setup-management  2>&1 | tee -a $LOGFILE

systemctl enable --now cloudstack-management

# Delete bootstrap script file
rm -rf /root/bootstrap.sh
