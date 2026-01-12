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

os_type=$(cat /etc/cluster.json | grep '"type"' | awk -F'"' '{print $4}')
hosts=$(grep -v mngt /etc/hosts | grep -v scvm | grep -v pn | grep -v localhost | awk {'print $1'})
ccvm=$(grep ccvm /etc/hosts | awk {'print $1'})

systemctl enable --now mysqld
DATABASE_PASSWD="Ablecloud1!"
################# firewall setting

firewall-cmd --permanent --zone=public --add-service=mysql 2>&1 | tee -a $LOGFILE
firewall-cmd --reload
firewall-cmd --list-all 2>&1 | tee -a $LOGFILE

# 라이선스 종류에 따라 설정 $1="hv" or "ablestack" or "clostack"
sh /usr/share/cloudstack-common/scripts/util/update-mold-theme-from-license.sh "$1"

if [ "${os_type}" = "ablestack-hci" ]; then
  # Crushmap 설정 추가 (ceph autoscale)
  scvm=$(grep scvm-mngt /etc/hosts | awk {'print $1'})
  ssh -o StrictHostKeyChecking=no $scvm /usr/local/sbin/setCrushmap.sh
fi

# resize partition
sgdisk -e /dev/vda
parted --script /dev/vda resizepart 3 100%
pvresize /dev/vda3
lvcreate rl -n nfs --extents 100%FREE
mkfs.xfs /dev/rl/nfs
mkdir /nfs
echo  '/dev/mapper/rl-nfs /nfs                    xfs    defaults        0 0' >> /etc/fstab
echo '/nfs *(rw,no_root_squash,async)' >> /etc/exports
systemctl enable --now nfs-server.service

mkdir /nfs/primary
mkdir /nfs/secondary


################# Setting Database
mysqladmin -uroot password $DATABASE_PASSWD
systemctl enable --now mold-usage.service
cloudstack-setup-databases cloud:$DATABASE_PASSWD --deploy-as=root:$DATABASE_PASSWD  2>&1 | tee -a $LOGFILE

# 글로벌설정 DB 업데이트(네트워크필터, saml)
global_settings=(
  "enable.vm.network.filter.allow.all.traffic=true"
  "saml2.enabled=true"
  "saml2.idp.metadata.url=http://$ccvm:19000/realms/saml/protocol/saml/descriptor"
  "saml2.redirect.url=http://$ccvm:19300/client"
  "saml2.sp.id=http://$ccvm:19300"
  "saml2.sp.slo.url=http://$ccvm:19300"
  "saml2.sp.sso.url=http://$ccvm:19300/client/api?command=samlSso"
  "saml2.user.attribute=username"
  "saml2.failed.login.redirect.url=http://$ccvm:19300/client/#/user/login?ssoLogin=false"
  "saml2.check.signature=false"
)

for i in "${global_settings[@]}"; do
  IFS='=' read -r key value <<< "$i"

  if [[ -n "$key" && -n "$value" ]]; then
    mysql --user=root --password="$DATABASE_PASSWD" -e \
      "USE cloud; UPDATE configuration SET value='$value' WHERE name='$key';" \
      2>/dev/null | tee -a "$LOGFILE"
  else
    echo "잘못된 설정 항목: $i" | tee -a "$LOGFILE"
  fi
done

cloudstack-setup-management  2>&1 | tee -a $LOGFILE

#admin 계정 로그인타입 변경(SAML)
mysql --user=root --password="$DATABASE_PASSWD" -e \
"USE cloud; UPDATE user SET source='SAML2', external_entity='http://$ccvm:19000/realms/saml' WHERE username='admin';"

systemctl enable --now mold.service

#UEFI 설정 파일 생성
#echo -e "guest.nvram.template.secure=/usr/share/edk2/ovmf/OVMF_VARS.secboot.fd
#guest.nvram.template.legacy=/usr/share/edk2/ovmf/OVMF_VARS.fd
#guest.loader.secure=/usr/share/edk2/ovmf/OVMF_CODE.secboot.fd
#guest.loader.legacy=/usr/share/edk2/ovmf/OVMF_CODE.secboot.fd
#guest.nvram.path=/var/lib/libvirt/qemu/nvram/" > /root/uefi.properties

#for host in $hosts
#do
#  scp -o StrictHostKeyChecking=no /root/uefi.properties $host:/etc/cloudstack/agent/
#done

#rm -rf /root/uefi.properties


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

if [ "${os_type}" != "ablestack-standalone" ]
then
  for host in $hosts
  do
    ssh -o StrictHostKeyChecking=no $host /usr/bin/systemctl enable --now pacemaker
    ssh -o StrictHostKeyChecking=no $host /usr/bin/systemctl enable --now corosync
  done
fi

# 06시 Mold 서비스 재시작 스크립트 등록
(crontab -l 2>/dev/null; echo "0 6 * * * /usr/bin/systemctl restart mold.service") | crontab -

# ccvm 로그 정리 스크립트 등록
(crontab -l 2>/dev/null; echo "0 0 * * 7 /usr/local/sbin/ccvm_log_maintainer.sh") | crontab -

# sso 로그인을 위한 스크립트 실행
sh /usr/local/sbin/sso_setting.sh
rm -rf /usr/local/sbin/sso_setting.sh

# Delete bootstrap script file
rm -rf /root/bootstrap.sh
