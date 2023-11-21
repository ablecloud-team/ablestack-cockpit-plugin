#!/usr/bin/env bash
#########################################
#Copyright (c) 2023 ABLECLOUD Co. Ltd.
#
#설치되어 있는 smb를 구성하여 서비스 시작하는 스크립트
#
#최초작성자 : 정민철 주임(mcjeong@ablecloud.io)
#최초작성일 : 2023-05-11
#########################################
after_host=$(cat /etc/hosts | grep 'gwvm-mngt' | awk '{print $1}')
before_host=$(grep 'hosts' /usr/local/samba/etc/smb.conf | awk '{print $4}')
host_ip="${after_host:0:6}"
user_id=$2
user_pw=$4

sed -i "s/$before_host/$host_ip/g" /usr/local/samba/etc/smb.conf

echo -e "\n[ablecloud]" >> /usr/local/samba/etc/smb.conf
echo -e "\tpath = /fs/smb" >> /usr/local/samba/etc/smb.conf
echo -e "\twritable = yes" >> /usr/local/samba/etc/smb.conf
echo -e "\tpublic = yes" >> /usr/local/samba/etc/smb.conf
echo -e "\tcreate mask = 0755" >> /usr/local/samba/etc/smb.conf
echo -e "\tdirectory mask = 0755" >> /usr/local/samba/etc/smb.conf

# 사용자 추가를 위한 expect 스크립트
useradd $user_id > /dev/null

expect -c "
spawn /usr/local/samba/bin/smbpasswd -a $user_id
expect "password:"
        send \"$user_pw\\r\"
        expect "password"
                send \"$user_pw\\r\"
expect eof
" > /dev/null

firewall-cmd --permanent --add-service=samba > /dev/null
firewall-cmd --reload > /dev/null

systemctl enable smb > /dev/null 2>&1
systemctl start smb > /dev/null
