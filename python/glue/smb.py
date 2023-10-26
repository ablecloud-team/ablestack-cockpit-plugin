'''
Copyright (c) 2021 ABLECLOUD Co. Ltd

이 파일은 클라우드센터 가상머신의 서비스를 제어하는 기능을 수행합니다.
최초 작성일 : 2023. 05. 11
'''
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import logging
import os
import argparse
import subprocess
from subprocess import check_output
from subprocess import call
from sh import ssh

from ablestack import *


env = os.environ.copy()
env['LANG'] = "en_US.utf-8"
env['LANGUAGE'] = "en"

smb_construction = '/usr/local/samba/sbin/smb_construction.sh'
# 함수명 : createArgumentParser
# 주요 기능 : 입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser 생성


def createArgumentParser():

    parser = argparse.ArgumentParser(description='게이트웨이 SAMBA의 서비스를 제어하는 프로그램',
                                     epilog='copyrightⓒ 2023 All rights reserved by ABLECLOUD™')

    parser.add_argument("action", choices=['create', 'delete', 'update', 'start', 'stop', 'restart', 'status', 'detail','smb-quota'], help="")
    parser.add_argument("-sn", "--service-name", metavar="service name", type=str, help='The name of the SMB Service')
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    parser.add_argument("-u", "--user_name", type=str, help='The name of the User Name')
    parser.add_argument("-p", "--user_pw", type=str, help="The name of the User Password")

    return parser


def createSamba():

    rc = call(["ssh gwvm ls -al /usr/local/samba/sbin/ | grep -w 'smb_construction.sh'"],universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
    if rc != 0:
        copy = os.system("scp /usr/share/cockpit/ablestack/shell/host/smb_construction.sh gwvm:/usr/local/samba/sbin/")
        if copy == 0:
            result = os.system('ssh gwvm sh ' + smb_construction + " -u " + args.user_name +  " -p " + args.user_pw)

            if result == 0:  # 서비스 제어가 성공일 경우
                ret = createReturn(code=200,val='smb service construction success')
                return print(json.dumps(json.loads(ret), indent=4))
            else:  # 서비스 제어가 실패할 경우
                ret = createReturn(code=500,val='smb service construction fail')
                return print(json.dumps(json.loads(ret), indent=4))
    else:
        result = os.system('ssh gwvm sh ' + smb_construction + " -u " + args.user_name +  " -p " + args.user_pw)

        if result == 0:  # 서비스 제어가 성공일 경우
            ret = createReturn(code=200,val='smb service construction success')
            return print(json.dumps(json.loads(ret), indent=4))
        else:  # 서비스 제어가 실패할 경우
            ret = createReturn(code=500,val='smb service construction fail')
            return print(json.dumps(json.loads(ret), indent=4))

# 삭제할 경로가 고정이 되면 그 경로로 삭제만 해주면 됨.
def deleteSamba():

    output_smb_user = subprocess.check_output("ssh gwvm /usr/local/samba/bin/pdbedit -L | cut -d ':' -f1", shell=True)
    data_smb_user_list = output_smb_user.decode('utf8')
    smb_users = data_smb_user_list.splitlines()

    output_home_user = subprocess.check_output("ssh gwvm grep /home /etc/passwd | cut -f1 -d: | grep -v cloud-user", shell=True)
    data_home_user_list = output_home_user.decode('utf8')
    home_users = data_home_user_list.splitlines()

    for i in range(len(smb_users)):

        smb_result = os.system('ssh gwvm /usr/local/samba/bin/smbpasswd -x ' + smb_users[i] + ' > /dev/null')

        if i == len(smb_users)-1:
            if smb_result == 0:
                for j in range(len(home_users)):

                    home_result = os.system('ssh gwvm userdel -r '+ home_users[j] + ' > /dev/null')

                    if j == len(home_users)-1:
                        if home_result == 0:
                            ssh('-o', 'StrictHostKeyChecking=no', 'gwvm', "sed -i '/ablecloud/,/directory/d'  /usr/local/samba/etc/smb.conf").splitlines()
                            ssh('-o', 'StrictHostKeyChecking=no', 'gwvm', "sed -i '$d' /usr/local/samba/etc/smb.conf").splitlines()
                            ssh('-o', 'StrictHostKeyChecking=no', 'gwvm', "systemctl stop smb").splitlines()
                            ssh('-o', 'StrictHostKeyChecking=no', 'gwvm', "systemctl disable smb").splitlines()
                            ssh('-o', 'StrictHostKeyChecking=no', 'gwvm', "firewall-cmd --permanent --remove-service=samba").splitlines()
                            ssh('-o', 'StrictHostKeyChecking=no', 'gwvm', "firewall-cmd --reload").splitlines()

                            ret = createReturn(code=200,val='smb service smb_user && home_user delete success && service delete success')
                            return print(json.dumps(json.loads(ret), indent=4))

                        else :
                            ret = createReturn(code=500,val='smb service home_user delete fail && service delete fail')
                            return print(json.dumps(json.loads(ret), indent=4))

            else:
                ret = createReturn(code=500,val='smb service smb_user fail && home_user delete fail')
                return print(json.dumps(json.loads(ret), indent=4))

def serviceControl():

    # 서비스 제어 명령
    result = os.system("ssh gwvm systemctl "+args.action+" "+args.service_name + " > /dev/null")

    if result == 0: #서비스 제어가 성공일 경우
        ret = createReturn(code=200, val=args.service_name+" service "+args.action+" control success")
        return print(json.dumps(json.loads(ret), indent=4))
    else: # 서비스 제어가 실패할 경우
        ret = createReturn(code=500, val=args.service_name+" service "+args.action+" control error")
        return print(json.dumps(json.loads(ret), indent=4))

def sambaDetail():
    service = 'N/A'
    path = 'N/A'
    full_capacity = 'N/A'
    usage = 'N/A'
    ip_address = 'N/A'
    user_count = 'N/A'

    try:
        rc = call(["ssh gwvm cat /usr/local/samba/etc/smb.conf | grep path | awk '{print $3}' | tail -1"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            output = check_output(["ssh gwvm cat /usr/local/samba/etc/smb.conf | grep path | awk '{print $3}' | tail -1"], universal_newlines=True, shell=True, env=env)
            path = output.strip()
        else :
            path = "/"
        rc = call(["ssh gwvm df -h | grep  /fs | awk '{ print $2 }'"],universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            output = check_output(["ssh gwvm df -h | grep -w /fs | awk '{ print $2 }'"], universal_newlines=True, shell=True, env=env)
            full_capacity = output.strip()
        else :
            full_capacity = "N/A"
        # rc = call(["ssh gwvm du -sh /fs/smb | awk '{print $1}'"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        # if rc == 0 :
        #    output = check_output(["ssh gwvm du -sh /fs/smb | awk '{print $1}'"], universal_newlines=True, shell=True, env=env)
        #    usage = output.strip()
        #else :
        #    usage = "N/A"
        # 몇명이나 있는지 카운트
        # rc = call(["pdbedit -L | grep -v root | wc -l"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        # if rc == 0 :
        #     output = check_output(["pdbedit -L | grep -v root | wc -l"], universal_newlines=True, shell=True, env=env)
        #     user_count = output.strip()
        # else :
        #     user_count = "N/A"
        rc = call(["ssh gwvm cat /etc/hosts | grep 'gwvm-mngt' | awk '{print $1}'"],universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            output = check_output(["ssh gwvm cat /etc/hosts | grep 'gwvm-mngt'| awk '{print $1}'"],universal_newlines=True, shell=True,env=env)
            ip_address = output.strip()
        else :
            ip_address = "N/A"

        ret_val = {
            'service' : 'Samba Service',
            'path' : path,
            'full_capacity' : full_capacity,
            'ip_address' : ip_address
        }
        ret = createReturn(code=200, val=ret_val, retname='Gateway VM Samba Service Status Detail')

    except Exception as e:

        ret_val = {
            'service' : service,
            'path' : path,
            'full_capacity' : full_capacity,
            'ip_address' : ip_address
        }
        ret = createReturn(code=500, val=ret_val, retname='Gateway VM Samba Service Status Detail')

    return print(json.dumps(json.loads(ret), indent=4))

def smbquota():
    # 서비스 제어 명령
    try:
        quota = ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'getfattr', '-n', 'ceph.quota.max_bytes', '--absolute-names', "/fs/smb | grep -w max_bytes | awk -F '\"' '{print $2}' ").splitlines()
        usage = ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'du', '-sh', '/fs/smb', '|', "awk '{print $1}'").splitlines()
        result = {
            "quota": quota,
            "usage": usage
        }
        ret = createReturn(code=200, val=result)

    except Exception as e:
        ret = createReturn(code=500, val="smb quota check fail")

    return print(json.dumps(json.loads(ret), indent=4))



if __name__ == '__main__':

    parser = createArgumentParser()
    args = parser.parse_args()
    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL,
                          file_log_level=logging.ERROR, log_file='test.log')

    if args.action == 'create':
        createSamba()
    elif args.action == 'delete':
        deleteSamba()
    elif args.action == 'status' or args.action == 'start' or args.action == 'stop' or args.action == 'restart':
        serviceControl()
    elif args.action == 'detail':
        sambaDetail()
    elif args.action == 'smb-quota':
        smbquota()
