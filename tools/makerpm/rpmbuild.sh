# Copyright (c) 2021 ABLECLOUD Co. Ltd
# 이 파일은 rpmbuild를 이용하여 ablestack-cockpit-plugin을 빌드하는 스크립트입니다.
# 최초 작성일 : 2021. 04. 02

#!/bin/bash
PATH=/bin:/usr/bin:/sbin:/usr/sbin:/usr/local/bin:/usr/local/sbin
export PATH

VER="1.0"

BUILD_PATH="/root/ablestack-cockpit-plugin/tools/makerpm"
mkdir -p $BUILD_PATH/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
cd $BUILD_PATH/rpmbuild/SOURCES
mkdir -p ablestack-$VER
if [ -d ablestack-$VER ]; then
tar -cvf ablestack-$VER.tar.gz ablestack-$VER
fi
rm -rf ablestack-$VER

cp -f $BUILD_PATH/ablestack.spec $BUILD_PATH/rpmbuild/SPECS/

cd $BUILD_PATH
rpmbuild -ba $BUILD_PATH/rpmbuild/SPECS/ablestack.spec
