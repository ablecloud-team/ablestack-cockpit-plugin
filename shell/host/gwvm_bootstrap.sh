#!/usr/bin/env bash
#########################################
#Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
#ccvm 초기화(bootstrap)하는 스크립트
#
#최초작성자 : 배태주
#최초작성일 : 2023-05-19
#########################################
set -x
LOGFILE="/var/log/gwvm_install.log"

# hosts=$(grep -v mngt /etc/hosts | grep -v scvm | grep -v pn | grep -v localhost | awk {'print $1'})

################# firewall setting
# firewall-cmd --permanent --zone=public --add-port=3000/tcp 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-port=3001/tcp 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-port=3002/tcp 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-port=3003/tcp 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-port=3004/tcp 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-port=3005/tcp 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-port=8082/tcp 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-port=9283/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=9100/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=9095/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=5050/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-port=3260/tcp 2>&1 | tee -a $LOGFILE

firewall-cmd --permanent --zone=public --add-service=ceph 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-service=ceph-mon 2>&1 | tee -a $LOGFILE
firewall-cmd --permanent --zone=public --add-service=iscsi-target 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-service=cockpit 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-service=dhcpv6-client 2>&1 | tee -a $LOGFILE
# firewall-cmd --permanent --zone=public --add-service=ssh 2>&1 | tee -a $LOGFILE

################# GlusterFS NFS
#firewall-cmd --permanent --zone=public --add-port=49151-49159/tcp 2>&1 | tee -a $LOGFILE
#firewall-cmd --permanent --zone=public --add-port=38465-38480/tcp 2>&1 | tee -a $LOGFILE
#firewall-cmd --permanent --zone=public --add-port=24007-24015/tcp 2>&1 | tee -a $LOGFILE
#firewall-cmd --permanent --zone=public --add-port=111/tcp 2>&1 | tee -a $LOGFILE
firewall-cmd --reload
firewall-cmd --list-all 2>&1 | tee -a $LOGFILE

# for host in $hosts
# do
#   ssh -o StrictHostKeyChecking=no $host /usr/bin/systemctl enable --now pacemaker
#   ssh -o StrictHostKeyChecking=no $host /usr/bin/systemctl enable --now corosync
# done

#ceph 키 복사
scp -q -o StrictHostKeyChecking=no root@scvm-mngt:/etc/ceph/* /etc/ceph/

# Delete bootstrap script file
rm -rf /root/bootstrap.sh
