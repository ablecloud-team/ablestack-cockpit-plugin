#!/usr/bin/python3
# -*- coding: utf-8 -*-
'''
Copyright (c) 2021 ABLECLOUD Co. Ltd.

libvirt domain 들의 정보를 수집하는 스크립트입니다.
현재 인자가 없습니다.
출력은 json형태로 화면에 나타나게 됩니다.

최초작성일 : 2021-03-22
'''
import os
import sh
import pprint
import json

from ablestack import *

env = os.environ.copy()
env['LANG'] = "en_US.utf-8"
env['LANGUAGE'] = "en"

virsh_cmd = sh.Command('/usr/bin/virsh')
ret = virsh_cmd('list', '--all', _env=env).stdout.decode().splitlines()
vms = []
for line in ret[2:-1]:
    items = line.split(maxsplit=2)
    vm = {
        'Id': items[0],
        'Name': items[1],
        'State': items[2]
    }
    vms.append(vm)
for vm in vms:
    vm['ip'] = "Unknown"
    vm['mac'] = "Unknown"
    vm['nictype'] = "Unknown"
    vm['nicbridge'] = "Unknown"
    ret = virsh_cmd('dominfo', domain=vm['Name'], _env=env).stdout.decode().splitlines()
    for line in ret[:-1]:
        items = line.split(":", maxsplit=1)
        k = items[0].strip()
        v = items[1].strip()
        vm[k] = v
    ret = virsh_cmd("domblkinfo", domain=vm['Name'], all=True, _env=env).stdout.decode().splitlines()
    for line in ret[:-1]:
        if 'vda' in line:
            items = line.split(maxsplit=4)
            vm['DISK_CAP'] = items[1]
            vm['DISK_ALLOC'] = items[2]
            vm['DISK_PHY'] = items[3]
    if vm['State'] == "running":
        ret = virsh_cmd('domifaddr', domain=vm['Name'], source='agent', interface='enp1s0',
                        full=True).stdout.decode().splitlines()
        for line in ret[:-1]:
            if 'ipv4' in line and 'enp1s0' in line:
                items = line.split(maxsplit=4)
                vm['ip'] = items[3]
                vm['mac'] = items[1]
        ret = virsh_cmd('domiflist', domain=vm['Name']).stdout.decode().splitlines()
        for line in ret[:-1]:
            if vm['mac'] in line:
                items = line.split()
                vm['nictype'] = items[1]
                vm['nicbridge'] = items[2]


print(json.dumps(vms, indent=2))
