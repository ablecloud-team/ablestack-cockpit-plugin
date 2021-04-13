#!/usr/bin/env python3
#########################################
#Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
#ssk host key를 스캔하는 스크립트
#
#최초작성자 : 윤여천 책임(ycyun@ablecloud.io)
#최초작성일 : 2021-04-13
#########################################
import os

from ablestack import *
import sh
scanscript=f'{pluginpath}/shell/host/ssh-scan.sh'
bash = sh.Command('/usr/bin/bash')
env = os.environ.copy()

knownhostsfile=f"{env['HOME']}/.ssh/known_hosts"
knownhostsfile="known"


output = bash(scanscript).stdout.decode().splitlines()
try:
    with open(knownhostsfile, 'rt') as knownfile:
        knownhosts = knownfile.read().split('\n')
    with open(knownhostsfile, 'at') as knownfile:
        for line in output:
            if line not in knownhosts:
                knownfile.write(f'{line}\n')
except FileNotFoundError as e:
    with open(knownhostsfile, 'wt') as knownfile:
        for line in output:
            knownfile.write(f'{line}\n')

