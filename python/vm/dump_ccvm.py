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
                        'instantBackup', 'regularBackup', 'deleteOldBackup', 'checkBackup'], help='choose one of the actions')
    parser.add_argument('--path', metavar='name', type=str,
                        nargs='*', help='backup path')
    parser.add_argument('--repeat', metavar='name', type=str,
                        nargs='*', help='repeat')
    parser.add_argument('--timeone', metavar='name', type=str,
                        nargs='*', help='timeone')
    parser.add_argument('--timetwo', metavar='name', type=str,
                        nargs='*', help='timetwo')
    parser.add_argument('--delete', metavar='name', type=str,
                        nargs='*', help='delete old backup')
    parser.add_argument('--checkOption', metavar='name', type=str,
                        nargs='*', help='check-option')
    return parser.parse_args()


# 함수명 : checkBackup
# 주요 기능 : ccvm의 "cloud" databased의 backup 크론잡을 체크하는 함수
def checkBackup(repeat, checkOption):
    try:
        repeat = str(repeat[0])
        checkOption = str(checkOption[0])

        resultDate = ""

        #  한 번만 실행하는 경우, 백업 또는 삭제 'at' 예약작업을 체크
        if repeat == 'no':
            result = subprocess.check_output("at -l | awk '{if ($7==\""+checkOption+"\") print ($2,$3,$4,$5,$6)}'", universal_newlines=True, shell=True, env=env)
            str_datetime = result.rstrip()
            format = '%a %b %d %H:%M:%S %Y'
            resultDate = datetime.datetime.strptime(str_datetime,format)

        #  여러번 실행하는 경우, 백업 또는 삭제 크론잡을 체크
        elif repeat != 'no':
            result = subprocess.check_output("at -l | awk '{if ($7==\""+checkOption+"\") print ($2,$3,$4,$5,$6)}'", universal_newlines=True, shell=True, env=env)
            str_datetime = result.rstrip()
            format = '%a %b %d %H:%M:%S %Y'
            resultDate = datetime.datetime.strptime(str_datetime,format)

        resultDate = resultDate.strftime('%Y-%m-%d %H:%M:%S')
        return resultDate
        
    except Exception as e:
        resultDate = ""
        return resultDate


# 함수명 : instantBackup
# 주요 기능 : ccvm의 "cloud" database를 dump하는 함수
def instantBackup(path):
    path = str(path[0])
    now = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
    mysqldumpFilePath = path+"/ccvm_dump_"+now+".sql"
    os.system("mkdir -p "+path)

    result = subprocess.check_output("mysqldump -u"+user_id+ " -p"+passwd+" --databases "+database+ " > "+path+"/ccvm_dump_"+now+".sql", universal_newlines=True, shell=True, env=env)

    return mysqldumpFilePath


# 함수명 : regularBackup
# 주요 기능 : ccvm의 "cloud" database를 정기적으로 dump하는 함수 (crontab 수정)
def regularBackup(path, repeat, timeone, timetwo):
    path = str(path[0])
    repeat = str(repeat[0])
    timeone = str(timeone[0])
    timetwo = str(timetwo[0])
    
    os.system("mkdir -p "+path)
    # 크론잡 초기화 ("instantBackup"이 포함되어있는 크론잡 삭제)
    subprocess.check_output("grep -lrZ 'instantBackup' /var/spool/at/ | xargs -0 rm -f", universal_newlines=True, shell=True, env=env)
    subprocess.check_output("crontab -u root -l | grep -v 'instantBackup' | crontab -u root -", universal_newlines=True, shell=True, env=env)

    if (repeat) == 'no':
        result = subprocess.check_output("echo /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+" | at "+timeone+" -q r", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'hourly':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" */1 * * * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'daily':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'weekly':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * "+timetwo+" /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'monthly':
        timeone_arr = timeone.split(':')
        timetwo_arr = timetwo.split('-')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" "+str(timetwo_arr[1])+" */"+str(timetwo_arr[0])+" * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    # else:
    #     timeone_arr = timeone.split(':')
    #     result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" "+timetwo+" * * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)

# 함수명 : deleteOldBackup
# 주요 기능 : ccvm의 "cloud" database를 dump한 파일 중, 정해진 기간보다 오래된 파일을 삭제하는 함수
def deleteOldBackup(path, repeat, timeone, timetwo, delete):
    path = str(path[0])
    repeat = str(repeat[0])
    timeone = str(timeone[0])
    timetwo = str(timetwo[0])
    delete = str(delete[0])

    # 크론잡 초기화 ("delete"와 "sql"이 포함되어있는 크론잡 삭제)
    subprocess.check_output("grep -lrEZ 'ccvm_dump.*delete' /var/spool/at/ | xargs -0 rm -f", universal_newlines=True, shell=True, env=env)
    subprocess.check_output("crontab -u root -l | grep -Ev 'delete.*sql|sql.*delete' | crontab -u root -", universal_newlines=True, shell=True, env=env)

    if (repeat) == 'no':
            result = subprocess.check_output("echo find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+delete+" delete | at "+timeone+" -q d", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'hourly':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" */1 * * * find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+ delete+"'"+" -delete) | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'daily':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * * find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+ delete+"'"+" -delete) | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'weekly':
        timeone_arr = timeone.split(':')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * "+timetwo+" find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+ delete+"'"+" -delete) | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'monthly':
        timeone_arr = timeone.split(':')
        timetwo_arr = timetwo.split('-')
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" "+str(timetwo_arr[1])+" */"+str(timetwo_arr[0])+" * find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+ delete+"'"+" -delete) | crontab -", universal_newlines=True, shell=True, env=env)

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

    if (args.action) == 'deleteOldBackup':
        try:
            deleteOldBackup(args.path, args.repeat, args.timeone, args.timetwo, args.delete)
            ret = createReturn(code=200, val="Creation of mysqldump of ccvm is completed")
            print(json.dumps(json.loads(ret), indent=4))

        except Exception as e:
            ret = createReturn(code=500, val="Creation of mysqldump of ccvm is failed")
            print(json.dumps(json.loads(ret), indent=4))
            print(e)
        return ret

    if (args.action) == 'checkBackup':
        try:
            dump_check = checkBackup(args.repeat, args.checkOption)
            if (dump_check) == "":
                ret = createReturn(code=500, val="Backup Check ERROR")
                print(json.dumps(json.loads(ret), indent=4))
            else:
                ret = createReturn(code=200, val=dump_check)
                print(json.dumps(json.loads(ret), indent=4))

        except Exception as e:
            ret = createReturn(code=500, val="Creation of mysqldump of ccvm is failed")
            print(json.dumps(json.loads(ret), indent=4))
            print(e)
        return ret
    
if __name__ == "__main__":
    main()