#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Copyright (c) 2021 ABLECLOUD Co. Ltd.

cloudinit iso를 생성하는 스크립트입니다.

* Writer  : 윤여천
ex)
/usr/bin/python3 /root/cockpit-plugin-ablestack/tools/cloudinit/gencloudinit.py --hostname scvm1 \
    --pubkey /root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa.pub \
    --privkey /root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa \
    --hosts /root/cockpit-plugin-ablestack/tools/cloudinit/hosts \
    --mgmt-nic=ens12 --mgmt-ip 10.10.14.150 --mgmt-prefix 16 --mgmt-gw 10.10.0.1 --dns 8.8.8.8 \
    --pn-nic ens13 --pn-ip 10.10.14.151 --pn-prefix 24\
    --cn-nic ens14 --cn-ip 10.10.14.152 --cn-prefix 24 --iso-path scvm.iso scvm

/usr/bin/python3 /root/cockpit-plugin-ablestack/tools/cloudinit/gencloudinit.py --hostname ccvm \
    --pubkey /root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa.pub \
    --privkey /root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa \
    --hosts /root/cockpit-plugin-ablestack/tools/cloudinit/hosts \
    --mgmt-nic=ens12 --mgmt-ip 10.10.14.150 --mgmt-prefix 16 --mgmt-gw 10.10.0.1 --dns 8.8.8.8 \
    [--sn-nic=ens12 --sn-ip 10.10.14.150 --sn-prefix 16 --sn-gw 10.10.0.1] \
    --iso-path ccvm.iso ccvm

최초작성일 : 2021-03-25
"""

import argparse
import base64
import datetime
import json
import logging
import pprint
import sys
import tempfile

import yaml
from ablestack import *
import sh
import os

nmcli_cmd = sh.Command('/usr/bin/nmcli')
ethtool = sh.Command('/usr/sbin/ethtool')

env = os.environ.copy()
env['LANG'] = "en_US.utf-8"
env['LANGUAGE'] = "en"

tmpdir = ''
"""
입력된 argument를 파싱하여 dictionary를 생성하는 함수

:return: args
"""
def argumentParser():
    tmp_parser = argparse.ArgumentParser(description='cloudinit iso를 생성하는 스크립트',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    subparsers = tmp_parser.add_subparsers(help='select vm type action', dest='type')
    ccvm_parser = subparsers.add_parser('ccvm', help='Cloud Center Virtual Machine을 위한 cloudinit')
    scvm_parser = subparsers.add_parser('scvm', help='Storage Center Virtual Machine을 위한 cloudinit')
    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('--iso-path', metavar='ISO file', help="저장할 ISO파일 이름")
    tmp_parser.add_argument('--hostname', metavar='hostname', help="VM의 이름")
    tmp_parser.add_argument('--hosts', metavar='hosts file', help="hosts파일의 이름")
    tmp_parser.add_argument('--pubkey', metavar='Public Key File', help="Public Key File")
    tmp_parser.add_argument('--privkey', metavar='Private Key File', help="Private Key File")
    tmp_parser.add_argument('--mgmt-nic', metavar='Management NIC', help="관리 네트워크 nic의 이름")
    tmp_parser.add_argument('--mgmt-ip', metavar='Management IP', help="관리 네트워크 IP")
    tmp_parser.add_argument('--mgmt-prefix', metavar='Management prefix', help="관리 네트워크 prefix")
    tmp_parser.add_argument('--mgmt-gw', metavar='Management gw', help="관리 네트워크 gw")
    tmp_parser.add_argument('--dns', metavar='dns', help="dns")
    tmp_parser.add_argument('--sn-nic', metavar='Service NIC', help="서비스 네트워크 nic의 이름      (ccvm만)")
    tmp_parser.add_argument('--sn-ip', metavar='Service IP', help="서비스 네트워크 IP               (ccvm만)")
    tmp_parser.add_argument('--sn-prefix', metavar='Service prefix', help="서비스 네트워크 prefix   (ccvm만)")
    tmp_parser.add_argument('--sn-gw', metavar='Service gw', help="서비스 네트워크 gw               (ccvm만)")
    tmp_parser.add_argument('--pn-nic', metavar='Storage NIC',  help="스토리지 네트워크 NIC         (scvm만)")
    tmp_parser.add_argument('--pn-ip', metavar='Storage IP',    help="스토리지 네트워크 IP          (scvm만)")
    tmp_parser.add_argument('--pn-prefix', metavar='Service prefix', help="스토리지 네트워크 prefix (scvm만)", default=24)
    tmp_parser.add_argument('--cn-nic', metavar='Cluster NIC',  help="클러스터 네트워크 NIC         (scvm만)")
    tmp_parser.add_argument('--cn-ip', metavar='Cluster IP',    help="클러스터 네트워크 IP          (scvm만)")
    tmp_parser.add_argument('--cn-prefix', metavar='Service prefix', help="클러스터 네트워크 prefix (scvm만)", default=24)
    tmp_parser.add_argument('--master', action='store_const', dest='master', const=True, metavar='SCVM Master', help="SCVM의 마스터로 지정 (scvm만)", default=False)

    # ccvm_parser.add_argument('--hostname', metavar='hostname', help="VM의 이름")
    # ccvm_parser.add_argument('--mgmt-nic', metavar='Management NIC', help="관리 네트워크 nic의 이름")
    # ccvm_parser.add_argument('--pubkey', metavar='Public Key File', help="Public Key File")
    # ccvm_parser.add_argument('--privkey', metavar='Private Key File', help="Private Key File")
    # ccvm_parser.add_argument('--mgmt-ip', metavar='Management IP', help="관리 네트워크 IP")
    # ccvm_parser.add_argument('--mgmt-prefix', metavar='Management prefix', help="관리 네트워크 prefix")
    # ccvm_parser.add_argument('--mgmt-gw', metavar='Management gw', help="관리 네트워크 gw")
    # ccvm_parser.add_argument('--dns', metavar='dns', help="dns")
    #
    # scvm_parser.add_argument('--hostname', metavar='hostname', help="VM의 이름")
    # scvm_parser.add_argument('--mgmt-nic', metavar='Management NIC', help="관리 네트워크 nic의 이름")
    # scvm_parser.add_argument('--pubkey', metavar='Public Key File', help="Public Key File")
    # scvm_parser.add_argument('--privkey', metavar='Private Key File', help="Private Key File")
    # scvm_parser.add_argument('--mgmt-ip', metavar='Management IP', help="관리 네트워크 IP")
    # scvm_parser.add_argument('--mgmt-prefix', metavar='Management prefix', help="관리 네트워크 prefix")
    # scvm_parser.add_argument('--mgmt-gw', metavar='Management gw', help="관리 네트워크 gw")
    # scvm_parser.add_argument('--dns', metavar='dns', help="dns")
    # scvm_parser.add_argument('--pn-nic', metavar='Storage NIC', help="스토리지 네트워크 NIC")
    # scvm_parser.add_argument('--pn-ip', metavar='Storage IP', help="스토리지 네트워크 IP")
    # scvm_parser.add_argument('--cn-nic', metavar='Cluster NIC', help="클러스터 네트워크 NIC")
    # scvm_parser.add_argument('--cn-ip', metavar='Cluster IP', help="클러스터 네트워크 IP")

    # Version 추가
    tmp_parser.add_argument("-V", "--Version", action='version',
                            version="%(prog)s 1.0")
    return tmp_parser.parse_args()


"""
ISO를 생성하는 함수

:param :filename :str 출력할 iso 파일명
:return iso 파일의 정보
"""
def genCloudInit(filename: str):
    genisoimage = sh.Command("/usr/bin/genisoimage")
    output = genisoimage("-output", filename, "-volid", "cidata", "-joliet", "-input-charset", "utf-8", "-rock",
                         f'{tmpdir}/user-data', f'{tmpdir}/meta-data''', f'{tmpdir}/network-config')
    item = {
        "ctime": str(datetime.datetime.fromtimestamp(os.path.getctime(filename))),
        # 수정시간을 타임 스탬프로 출력
        "mtime": str(datetime.datetime.fromtimestamp(os.path.getmtime(filename))),
        # 마지막 엑세스시간을 타임 스탬프로 출력
        "atime": str(datetime.datetime.fromtimestamp(os.path.getatime(filename))),
        # 파일크기
        "size": os.path.getsize(filename),
        "filepath": os.path.abspath(filename)
    }
    return json.dumps(json.loads(createReturn(val=item, code=200)), indent=2)


"""
meta-data파일을 생성하는 함수

:param :hostname :str VM의 hostname
:return 없음
"""
def genMeta(hostname: str):
    # with open('meta-data.tmpl', 'rt') as f:
    #     tmp_meta = f.read()
    # meta = tmp_meta.format(hostname=hostname)
    meta = {'instance-id': f'{hostname}', 'local-hostname': f'{hostname}'}
    with open(f'{tmpdir}/meta-data', 'wt') as f:
        f.write(yaml.dump(meta))


"""
network-config파일의 관리 네트워크 부분을 생성하는 함수

:param :mgmt_nic :str 가상머신의 관리 네트워크 NIC(bridge 이름이 아님)
:param :mgmt_ip :ip   가상머신의 관리 네트워크 IP
:param mgmt_prefix :int 가상머신의 관리네트워크 prefix( ex: 192.168.0.10/24 인경우 24 )
:param mgmt_gw :ip  가상머신 관리네트워크의 Gateway
:param dns :ip 가상머신의 dns
:return 없음
"""
def genManagement(mgmt_nic: str, mgmt_ip: str, mgmt_prefix: int, mgmt_gw: str, dns: str):
    yam = {'network': {'version': 1, 'config': []}}

    yam['network']['config'] = [{'name': mgmt_nic,
                                 'subnets': [{'address': f'{mgmt_ip}/{mgmt_prefix}',
                                              'dns_nameservers': [dns],
                                              'gateway': mgmt_gw,
                                              'type': 'static'}],
                                 'type': 'physical'}]
    """
    network:
      version: 1
      config:
        # Simple network adapter
        - type: physical
          name: <mgmt-nic>
          subnets:
            - type: static
              address: <mgmt-ip>/<mgmt-prefix>
              gateway: <mgmt-gw>
              dns_nameservers:
                - <dns>
        # 10G pair
        - type: physical
          name: <pn-nic>
          mtu: 9000
          subnets:
              - type: static
                address: <pn-ip>/24
        - type: physical
          name: <cn-nic>
          mtu: 9000
          subnets:
              - type: static
                address: <cn-ip>/24
    """
    # meta = tmp_meta.format(mgmt_nic=mgmt_nic, mgmt_ip=mgmt_ip, mgmt_prefix=mgmt_prefix, mgmt_gw=mgmt_gw, dns=dns)
    with open(f'{tmpdir}/network-config.mgmt', 'wt') as f:
        f.write(yaml.dump(yam))


"""
user-data파일을 사용하여 publickey와 privatekey, authorized_key, /etc/hosts를 생성하는 부분

:param :pubkeyfile :str    가상머신에 넣을 publickey 파일의 이름
:param :privkeyfile :str   가상머신에 넣을 privkey 파일의 이름
:param :hostsfile :str     가상머신에 넣을 hosts 파일의 이름
:return 없음
"""
def genUserFromFile(pubkeyfile: str, privkeyfile: str, hostsfile: str):
    # with open('user-data.tmpl', 'rt') as f:
    #     yam = yaml.load(f)
    #     tmp_meta = f.read()
    # pprint.pprint(yam)
    with open(pubkeyfile, 'rt') as f:
        pubkey = f.read().strip()
    with open(privkeyfile, 'rt') as f:
        # privkey = '\\n'.join(f.read().splitlines())
        # lines = f.read().splitlines()
        # privkey = ''
        # for line in lines:
        #     privkey += line.strip() + "\n"
        privkey = f.read()
    # privkey = privkey.replace("\n", "")

    with open(hostsfile, 'rt') as f:
        hosts = f.read()
    yam = {
        'disable_root': 0,
        'ssh_pwauth': True,
        'users': [
            {
                'homedir': '/var/lib/ceph',
                'groups': 'sudo',
                'lock_passwd': False,
                'name': 'ceph',
                'plain_text_passwd': 'Ablecloud1!',
                'ssh-authorized-keys': [pubkey],
                'sudo': ['ALL=(ALL) NOPASSWD:ALL']
            },
            {
                'groups': 'sudo',
                'lock_passwd': False,
                'name': 'ablecloud',
                'plain_text_passwd': 'Ablecloud1!',
                'ssh-authorized-keys': [pubkey],
                'sudo': ['ALL=(ALL) NOPASSWD:ALL']
            },
            {
                'disable_root': 0,
                'ssh_pwauth': True,
                'name': 'root',
                'plain_text_passwd': 'Ablecloud1!',
                'ssh-authorized-keys': [pubkey],
            }
        ],
        'write_files':
            [
                {
                    'encoding': 'base64',
                    'content': base64.encodebytes(pubkey.encode()),
                    'owner': 'root:root',
                    'path': '/root/.ssh/id_rsa.pub',
                    'permissions': '0644'
                },
                {
                    'encoding': 'base64',
                    'content': base64.encodebytes(privkey.encode()),
                    'owner': 'root:root',
                    'path': '/root/.ssh/id_rsa',
                    'permissions': '0600'
                },
                {
                    'encoding': 'base64',
                    'content': base64.encodebytes(pubkey.encode()),
                    'owner': 'ceph:ceph',
                    'path': '/var/lib/ceph/.ssh/id_rsa.pub',
                    'permissions': '0644'
                },
                {
                    'encoding': 'base64',
                    'content': base64.encodebytes(privkey.encode()),
                    'owner': 'ceph:ceph',
                    'path': '/var/lib/ceph/.ssh/id_rsa',
                    'permissions': '0600'
                },
                {
                    'encoding': 'base64',
                    'content': base64.encodebytes(pubkey.encode()),
                    'owner': 'ablecloud:ablecloud',
                    'path': '/home/ablecloud/.ssh/id_rsa.pub',
                    'permissions': '0644'
                },
                {
                    'encoding': 'base64',
                    'content': base64.encodebytes(privkey.encode()),
                    'owner': 'ablecloud:ablecloud',
                    'path': '/home/ablecloud/.ssh/id_rsa.pub',
                    'permissions': '0600'
                },
                {
                    'encoding': 'base64',
                    'content': base64.encodebytes(hosts.encode()),
                    'owner': 'root:root',
                    'path': '/etc/hosts',
                    'permissions': '0644'
                }
            ]
    }
    # base64.decodebytes(base64.encodebytes(pubkey.encode())).decode()
    # with open('user-data', 'wt') as f:
    with open(f'{tmpdir}/user-data', 'wt') as f:
        f.write('#cloud-config\n')
        f.write(yaml.dump(yam).replace("\n\n", "\n"))


"""
ccvm용 네트워크설정(스토리지 네트워크 추가 없음)하는 부분

:param 없음
:return yaml 파일
"""
def ccvmGen( sn_nic: str, sn_ip: str, sn_prefix: int, sn_gw: str ):
    with open(f'{tmpdir}/network-config.mgmt', 'rt') as f:
        yam = yaml.load(f)

    if sn_nic is not None or sn_ip is not None or sn_prefix is not None or sn_gw is not None :
        yam['network']['config'].append({'name': sn_nic,
                                         'subnets': [{'address': f'{sn_ip}/{sn_prefix}',
                                                      'gateway': sn_gw,
                                                      'type': 'static'}],
                                         'type': 'physical'})
    with open(f'{tmpdir}/network-config', 'wt') as f:
        f.write(yaml.dump(yam))
    return json.dumps(indent=4, obj=json.loads(createReturn(code=200, val=yam)))


"""
scvm용 네트워크설정(스토리지 네트워크 추가)하는 부분

:param :pn_nic :str  PN의 NIC 이름
:param :pn_ip  :str  PN의 IP
:param :cn_nic :str  CN의 NIC 이름
:param :cn_ip  :str  CN의 IP
:return yaml 파일
"""
def scvmGen(pn_nic=None, pn_ip=None, pn_prefix=24, cn_nic=None, cn_ip=None, cn_prefix=24, master=False):
    with open(f'{tmpdir}/network-config.mgmt', 'rt') as f:
        yam = yaml.load(f)
    yam['network']['config'].append({'mtu': 9000, 'name': pn_nic,
                                     'subnets': [{'address': f'{pn_ip}/{pn_prefix}',
                                                  'type': 'static'}],
                                     'type': 'physical'})
    yam['network']['config'].append({'mtu': 9000, 'name': cn_nic,
                                     'subnets': [{'address': f'{cn_ip}/{cn_prefix}',
                                                  'type': 'static'}],
                                     'type': 'physical'})
    with open(f'{tmpdir}/network-config', 'wt') as f:
        f.write(yaml.dump(yam))
    with open(f'{tmpdir}/user-data', 'rt') as f:
        yam2 = yaml.load(f)
    yam2['bootcmd'] = [
        ['/usr/bin/systemctl', 'enable', '--now', 'cockpit.socket'],
        ['/usr/bin/systemctl', 'enable', '--now', 'cockpit.service']
    ]
    if master:
        yam2['bootcmd'].append(
            [f'{pluginpath}/shell/host/bootstrap.sh']
        )
    with open(f'{tmpdir}/user-data', 'wt') as f:
        f.write('#cloud-config\n')
        f.write(yaml.dump(yam2).replace("\n\n", "\n"))
    return json.dumps(indent=4, obj=json.loads(createReturn(code=200, val=yam)))


"""
cloudinit iso를 생성하는 스크립트입니다.

:param :iso-path    :str    출력할 iso 파일명
:param :hostname    :str    VM의 hostname
:param :mgmt-nic    :str    가상머신의 관리 네트워크 NIC(bridge 이름이 아님)
:param :mgmt-ip     :ip     가상머신의 관리 네트워크 IP
:param :mgmt-prefix :int    가상머신의 관리네트워크 prefix( ex: 192.168.0.10/24 인경우 24 )
:param :mgmt-gw     :ip     가상머신 관리네트워크의 Gateway
:param :dns         :ip     가상머신의 dns
:param :pubkey      :str    가상머신에 넣을 publickey 파일의 이름
:param :privkey     :str    가상머신의 넣을 privkey 파일의 이름
:param :hosts       :str    가상머신에 적용할 hosts 파일의 이름
:param :pn-nic      :str    PN의 NIC 이름      (scvm만)
:param :pn-ip       :ip     PN의 IP            (scvm만)
:param :cn-nic      :str    CN의 NIC 이름      (scvm만)
:param :cn-ip       :ip     CN의 IP            (scvm만)
ex)
/usr/bin/python3 /root/cockpit-plugin-ablestack/tools/cloudinit/gencloudinit.py --hostname scvm1 \
    --pubkey /root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa.pub \
    --privkey /root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa \
    --hosts /root/cockpit-plugin-ablestack/tools/cloudinit/hosts \
    --mgmt-nic=ens12 --mgmt-ip 10.10.14.150 --mgmt-prefix 16 --mgmt-gw 10.10.0.1 --dns 8.8.8.8 \
    --pn-nic ens13 --pn-ip 10.10.14.151 \
    --cn-nic ens14 --cn-ip 10.10.14.152 --iso-path scvm.iso scvm

/usr/bin/python3 /root/cockpit-plugin-ablestack/tools/cloudinit/gencloudinit.py --hostname ccvm \
    --pubkey /root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa.pub \
    --privkey /root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa \
    --hosts /root/cockpit-plugin-ablestack/tools/cloudinit/hosts \
    --mgmt-nic=ens12 --mgmt-ip 10.10.14.150 --mgmt-prefix 16 --mgmt-gw 10.10.0.1 --dns 8.8.8.8 \
    [--sn-nic ens13 --sn-ip 10.10.14.151 --sn-prefix 16 --sn-gw 10.10.0.1] \
    --iso-path ccvm.iso ccvm
    
:return yaml 파일
"""
def main(args):
    genMeta(hostname=args.hostname)
    genUserFromFile(pubkeyfile=args.pubkey, privkeyfile=args.privkey, hostsfile=args.hosts)

    genManagement(mgmt_nic=args.mgmt_nic, mgmt_ip=args.mgmt_ip, mgmt_prefix=args.mgmt_prefix, mgmt_gw=args.mgmt_gw,
                  dns=args.dns)
    """
    privkey='/root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa', hostname='test', 
    pubkey='/root/cockpit-plugin-ablestack/tools/cloudinit/id_rsa.pub', type='ccvm'
    mgmt_nic=None, mgmt_ip=None, mgmt_prefix=None, mgmt_gw=None, dns=None,     
    pn_nic=None, pn_ip=None, cn_nic=None, cn_ip=None, 
    """
    if args.type == 'ccvm':
        ret = ccvmGen(sn_nic=args.sn_nic, sn_ip=args.sn_ip, sn_prefix=args.sn_prefix, sn_gw=args.sn_gw)
    elif args.type == 'scvm':
        ret = scvmGen(pn_nic=args.pn_nic, pn_ip=args.pn_ip, pn_prefix=args.pn_prefix, cn_nic=args.cn_nic, cn_ip=args.cn_ip, cn_prefix=args.cn_prefix, master=args.master)
    ret = genCloudInit(filename=args.iso_path)
    return ret


if __name__ == '__main__':
    args = argumentParser()
    tmpdir=tempfile.mkdtemp()
    ret = main(args)
    ret_t = json.loads(ret)
    ret_t['tmpdir']=tmpdir
    ret = json.dumps(ret_t)
    print(ret)
