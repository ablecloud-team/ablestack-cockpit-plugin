#!/usr/bin/env python3
#########################################
# Copyright (c) 2021 ABLECLOUD Co. Ltd.
#
# ssh host key를 스캔하는 스크립트
#
# 최초작성자 : 윤여천 책임(ycyun@ablecloud.io)
# 최초작성일 : 2021-04-13
#########################################
import os
import pprint
from typing import List

from ablestack import *
import sh

scanscript = f'{pluginpath}/shell/host/ssh-scan.sh'
bash = sh.Command('/usr/bin/bash')
env = os.environ.copy()

knownhostsfile = f"{env['HOME']}/.ssh/known_hosts"


output = bash(scanscript).splitlines()

knownhostlists = []
try:
    with open(knownhostsfile, 'rt') as knownfile:
        knownhosts = knownfile.read().split('\n')
        for line in knownhosts:
            hosts: List[str] = line.split(' ')
            if len(hosts) >= 3:
                knownhostlists.append(dict(name=hosts[0], type=hosts[1], key=hosts[2]))
    with open(knownhostsfile, 'wt') as knownfile:
        for line in output:
            hosts: List[str] = line.split(' ')
            exists = False
            for known in knownhostlists:
                if known['name'] == hosts[0] and known['type'] == hosts[1]:
                    if known['key'] == hosts[2]:
                        exists = True
                        break
                    else:
                        known['key'] = hosts[2]
                        exists = True
                        break
            if not exists:
                knownhostlists.append(dict(name=hosts[0], type=hosts[1], key=hosts[2]))
        for known in knownhostlists:
            knownfile.write(f"{known['name']} {known['type']} {known['key']}\n")
except FileNotFoundError as e:
    with open(knownhostsfile, 'wt') as knownfile:
        for line in output:
            knownfile.write(f'{line}\n')
