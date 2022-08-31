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
from tkinter import E
import sh
import pprint
import json
import socket
import subprocess
from subprocess import check_output
from subprocess import call

from ablestack import *
from sh import ssh

env = os.environ.copy()
env['LANG'] = "en_US.utf-8"
env['LANGUAGE'] = "en"

virsh_cmd = sh.Command('/usr/bin/virsh')
ssh_cmd = sh.Command('/usr/bin/ssh')
ret = virsh_cmd('list', '--all', _env=env).stdout.decode().splitlines()
vms = []
for line in ret[2:-1]:
    items = line.split(maxsplit=2)
    if(items[1] == 'ccvm'):
        vm = {
            'Id': items[0],
            'Name': items[1],
            'State': items[2]
        }
        vms.append(vm)

for vm in vms:
    if (vm['Name'] == 'ccvm'):
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
        # ret = virsh_cmd("domblkinfo", domain=vm['Name'], all=True, _env=env).stdout.decode().splitlines()
        ret = ssh('-o', 'StrictHostKeyChecking=no', 'ccvm-mngt', '/usr/bin/df', '-h').stdout.decode().splitlines()
        ret.reverse()
        vm['blk'] = ret
        for line in ret[:]:
            if 'root' in line:
                items = line.split(maxsplit=5)
                vm['DISK_CAP'] = items[1]
                vm['DISK_ALLOC'] = items[2]
                vm['DISK_PHY'] = items[3]
                vm['DISK_USAGE_RATE'] = items[4]
        if vm['State'] == "running":
            ret = virsh_cmd('domifaddr', domain=vm['Name'], source='agent', interface='enp0s20',
                            full=True).stdout.decode().splitlines()
            for line in ret[:-1]:
                if 'ipv4' in line and 'enp0s20' in line:
                    items = line.split(maxsplit=4)
                    ipPrefix = items[3]
                    ipSplit = ipPrefix.split('/')
                    vm['ip'] = ipSplit[0]
                    vm['prefix'] = ipSplit[1]
                    vm['mac'] = items[1]
            ret = virsh_cmd('domiflist', domain=vm['Name']).stdout.decode().splitlines()
            for line in ret[:-1]:
                if vm['mac'] in line:
                    items = line.split()
                    vm['nictype'] = items[1]
                    vm['nicbridge'] = items[2]
        try:
            ret = ssh('-o', 'StrictHostKeyChecking=no', 'ccvm-mngt', '/usr/sbin/route', '-n', '|', 'grep', '-P', '"^0.0.0.0|UG"').stdout.decode().splitlines()
            for line in ret[:]:
                items = line.split()
                vm['GW'] = items[1]
        except Exception as e:
            pass
        
        try :
            vm['MOLD_SERVICE_STATUE'] = ssh('-o', 'StrictHostKeyChecking=no', 'ccvm-mngt', 'systemctl is-active cloudstack-management.service').stdout.decode().splitlines()
        except Exception as e:
            vm['MOLD_SERVICE_STATUE'] = 'inactive'.splitlines()
        try :
            vm['MOLD_DB_STATUE'] = ssh('-o', 'StrictHostKeyChecking=no', 'ccvm-mngt', 'systemctl is-active mysqld').stdout.decode().splitlines()
        except Exception as e:
            vm['MOLD_DB_STATUE'] = 'inactive'.splitlines()

print(json.dumps(vms, indent=2))