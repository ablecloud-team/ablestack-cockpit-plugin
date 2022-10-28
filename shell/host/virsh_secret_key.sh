#!/usr/bin/env bash
#########################################
# Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
# 호스트 secret key 생성 및 등록하는 스크립트
#
# 최초작성자 : 배태주
# 최초작성일 : 2022-10-25
#########################################

# secret.xml 생성
cat > /usr/share/cockpit/ablestack/tools/vmconfig/ccvm/secret.xml <<EOF
<secret ephemeral='no' private='no'>
    <uuid>11111111-1111-1111-1111-111111111111</uuid>
    <usage type='ceph'>
        <name>client.admin secret</name>
    </usage>
</secret>
EOF

# virsh secret-list 11111111-1111-1111-1111-111111111111 값이 존재하는지 확인
secret_val=$(virsh secret-list | grep  11111111-1111-1111-1111-111111111111)
ceph_admin_key=$(ceph auth get-key client.admin)

if [ "$secret_val" == "" ]; then
	virsh secret-define /usr/share/cockpit/ablestack/tools/vmconfig/ccvm/secret.xml > /dev/null
    virsh secret-set-value --secret 11111111-1111-1111-1111-111111111111 --base64 $ceph_admin_key > /dev/null
else
    virsh secret-undefine 11111111-1111-1111-1111-111111111111 > /dev/null
    virsh secret-define /usr/share/cockpit/ablestack/tools/vmconfig/ccvm/secret.xml > /dev/null
    virsh secret-set-value --secret 11111111-1111-1111-1111-111111111111 --base64 $ceph_admin_key > /dev/null
fi