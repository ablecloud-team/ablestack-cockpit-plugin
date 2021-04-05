# Copyright (c) 2021 ABLECLOUD Co. Ltd
# 이 파일은 rpmbuild 이후 실행되는 스크립트 파일입니다.
# 최초 작성일 : 2021. 04. 02


#!/bin/sh

# 함수명 : conf
# PATH 정의
conf(){
COCKPIT_PATH="/usr/share/cockpit"
RPM_PATH="$COCKPIT_PATH/ablestack/tools/makerpm/rpmbuild"
return
}

# 함수명 : settingFile
# 파일 삭제 및 권한 설정 함수
settingFile() {
echo "====================Start of All process"
echo "1. setting Files"
rm -rf $RPM_PATH
chmod 644 $COCKPIT_PATH/ablestack/*
return
}

# 함수명 : startCockpit
# cockpit 서비스 재시작
startCockpit() {
echo "2. cockpit service start"
systemctl enable --now cockpit.socket
systemctl restart cockpit
return
}

# 함수명 : default
# 프로세스 종료
default(){
settingFile
startCockpit
echo "====================End of All process"
pkill -9 -f /usr/share/cockpit/ablestack/tools/makerpm/ablestack.sh
}

# 스크립트 실행
productName=$1
echo $productName
if [ $productName="default" ]; then
 conf
 default
fi
