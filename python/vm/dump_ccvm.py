'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 클라우드센터 가상머신의 데이터베이스를 백업하는 프로그램
최초 작성일 : 2021. 10. 21
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import argparse
import datetime
import subprocess
from subprocess import check_output

from ablestack import *

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"

user_id = "root"
passwd = "Ablecloud1!"
database = "test"
enc = "utf8"

'''
함수명 : parseArgs
이 함수는 python library argparse를 시용하여 함수를 실행될 때 필요한 파라미터를 입력받고 파싱하는 역할을 수행합니다.
예를들어 action을 요청하면 해당 action일 때 요구되는 파라미터를 입력받고 해당 코드를 수행합니다.
'''


def parseArgs():
    parser = argparse.ArgumentParser(description='Prometheus Yaml file parsing and replace targets',
                                     epilog='copyrightⓒ 2023 All rights reserved by ABLECLOUD™')

    parser.add_argument('action', choices=[
                        'instantBackup', 'regularBackup'], help='choose one of the actions')
    parser.add_argument('--path', metavar='name', type=str,
                        nargs='*', help='backup path')
    parser.add_argument('--repeat', metavar='name', type=str,
                        nargs='*', help='repeat')
    parser.add_argument('--timeone', metavar='name', type=str,
                        nargs='*', help='timeone')
    parser.add_argument('--timetwo', metavar='name', type=str,
                        nargs='*', help='timetwo')

    return parser.parse_args()


# 함수명 : instantBackup
# 주요 기능 : ccvm의 "cloud" database를 dump하는 함수
def instantBackup(path):
    path = str(path[0])
    now = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
    mysqldumpFilePath = path+"/ccvm_dump_"+now+".sql"

    os.system("mkdir -p "+path)

    result = subprocess.check_output("mysqldump -u"+user_id+ " -p"+passwd+" --databases "+database+ " > "+path+"/ccvm_dump_"+now+".sql", universal_newlines=True, shell=True, env=env)
    
    # os.system("echo "+mysqldumpFileName)

    return mysqldumpFilePath


# 함수명 : regularBackup
# 주요 기능 : ccvm의 "cloud" database를 정기적으로 dump하는 함수 (crontab 수정)
def regularBackup(path, repeat, timeone, timetwo):
    path = str(path[0])
    repeat = str(repeat[0])
    timeone = str(timeone[0])
    timetwo = str(timetwo[0])
    now = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
    mysqldumpFilePath = path+"/ccvm_dump_"+now+".sql"
    
    # os.system("mkdir -p "+path)

    # result = subprocess.check_output("crontab -e "+ "dd", universal_newlines=True, shell=True, env=env)
    # result = subprocess.check_output("mysqldump -u"+user_id+ " -p"+passwd+" --databases "+database+ " > "+path+"/ccvm_dump_"+now+".sql", universal_newlines=True, shell=True, env=env)

    if (repeat) == 'no':
        result = subprocess.check_output("echo /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+" | at "+timeone, universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'hourly':
        result = subprocess.check_output("cat <(crontab -l) <(echo */"+timeone+" */1 * * * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'daily':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'weekly':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * "+timetwo+" /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'monthly':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" "+timetwo+" * * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    return path, repeat, timeone, timetwo

def main():
    args = parseArgs()
    if (args.action) == 'instantBackup':
        try:
            dump_path = instantBackup(args.path)
            ret = createReturn(code=200, val=dump_path)
            print(json.dumps(json.loads(ret), indent=4))

        except Exception as e:
            ret = createReturn(code=500, val="Creation of mysqldump of ccvm is failed")
            print(json.dumps(json.loads(ret), indent=4))
            print(e)
        return ret

    if (args.action) == 'regularBackup':
        try:
            regularBackup(args.path, args.repeat, args.timeone, args.timetwo)
            ret = createReturn(code=200, val="Creation of mysqldump of ccvm is completed")
            print(json.dumps(json.loads(ret), indent=4))

        except Exception as e:
            ret = createReturn(code=500, val="Creation of mysqldump of ccvm is failed")
            print(json.dumps(json.loads(ret), indent=4))
            print(e)
        return ret

if __name__ == "__main__":
    main()