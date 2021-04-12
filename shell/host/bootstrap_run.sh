#!/usr/bin/env bash
#########################################
#Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
#scvm의 /root/bootstrap.sh을 실행하기 전 중복 실행을 방지 하기위해 
#각 host에 /usr/share/cockpit/bootstrap_run_check파일을 생성하여 실행 여부를 확인함.
# 이후 /root/bootstrap.sh파일 실행
#최초작성자 : 최진성 책임
#최초작성일 : 2021-04-05
#########################################
hosts=$(grep able /etc/hosts | awk {'print $1'})
for host in $hosts
do
  /usr/bin/ssh -o StrictHostKeyChecking=no $host touch /usr/share/cockpit/bootstrap_run_check
done

/usr/bin/ssh -o StrictHostKeyChecking=no scvm sh /root/bootstrap.sh