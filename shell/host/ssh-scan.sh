#!/usr/bin/env bash
#########################################
#Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
#ssk host key를 스캔하는 스크립트
#
#최초작성자 : 윤여천 책임(ycyun@ablecloud.io)
#최초작성일 : 2021-04-13
#########################################
hostsfile=/etc/hosts

/usr/bin/ssh-keyscan -4 -T 1 $(grep -E "scvm*|ccvm*|able*" $hostsfile) 2> /dev/null