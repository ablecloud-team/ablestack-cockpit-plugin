#!/usr/bin/python3

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
    ret = virsh_cmd('dominfo', domain=vm['Name'], _env=env).stdout.decode().splitlines()
    for line in ret[:-1]:
        items = line.split(":", maxsplit=1)
        k = items[0].strip()
        v = items[1].strip()
        vm[k] = v
    ret = virsh_cmd("domblkinfo", domain="djpark-dev-2", all=True, _env=env).stdout.decode().splitlines()
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
            if 'ipv4' in line:
                items = line.split(maxsplit=4)
                vm['ip'] = items[3]
    else:
        vm['ip'] = "Unknown"

# virsh dominfo --domain djpark-dev-1
# Id:             -
# Name:           djpark-dev-1
# UUID:           3e2b2d33-4b8f-48df-9cfd-71741d6ba1a6
# OS Type:        hvm
# State:          shut off
# CPU(s):         4
# Max memory:     4194304 KiB
# Used memory:    4194304 KiB
# Persistent:     yes
# Autostart:      disable
# Managed save:   no
# Security model: selinux
# Security DOI:   0
print(json.dumps(vms, indent=2))
