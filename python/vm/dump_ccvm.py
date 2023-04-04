'''
Copyright (c) 2023 ABLECLOUD Co. Ltd
설명 : 클라우드센터 가상머신의 데이터베이스를 백업하는 프로그램
최초 작성일 : 2023. 03. 21
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import argparse
import datetime
import subprocess
from subprocess import check_output
from dateutil.relativedelta import relativedelta

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
                        'instantBackup', 'regularBackup', 'deleteOldBackup', 'checkBackup', 'deactiveBackup'], help='choose one of the actions')
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


# 함수명 : deactiveBackup
# 주요 기능 : ccvm의 "cloud" databased의 backup 및 삭제 예약작업을 비활성화하는 함수
def deactiveBackup(checkOption):
    try:
        checkOption = str(checkOption[0])
        if checkOption == 'r':
            subprocess.check_output("grep -lrZ 'instantBackup' /var/spool/at/ | xargs -0 rm -f", universal_newlines=True, shell=True, env=env)
            subprocess.check_output("sed -i '/RegularBackup/d' /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
            subprocess.check_output("crontab -u root -l | grep -v 'instantBackup' | crontab -u root -", universal_newlines=True, shell=True, env=env)
        elif checkOption == 'd':
            subprocess.check_output("grep -lrEZ 'ccvm_dump.*delete' /var/spool/at/ | xargs -0 rm -f", universal_newlines=True, shell=True, env=env)
            subprocess.check_output("sed -i '/DeleteOldBackup/d' /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
            subprocess.check_output("crontab -u root -l | grep -Ev 'delete.*sql|sql.*delete' | crontab -u root -", universal_newlines=True, shell=True, env=env)

    except Exception as e:
        print(e)
        resultDate = ""
        return resultDate

# 함수명 : checkBackup
# 주요 기능 : ccvm의 "cloud" databased의 backup 및 삭제 예약작업을 체크하는 함수
def checkBackup(checkOption):
    try:
        checkOption = str(checkOption[0])
        if checkOption == 'r':
            noRepeatOption = subprocess.check_output("at -l | awk '{if ($7==\""+checkOption+"\") print ($2,$3,$4,$5,$6)}'", universal_newlines=True, shell=True, env=env)
            repeatOptionOne = (subprocess.check_output("crontab -u root -l | grep 'RegularBackup' | awk '{print $2}'", universal_newlines=True, shell=True, env=env)).rstrip()
            repeatOptionTwo = subprocess.check_output("crontab -u root -l | grep 'RegularBackup' | awk '{print $5}'", universal_newlines=True, shell=True, env=env)
        elif checkOption == 'd':
            noRepeatOption = subprocess.check_output("at -l | awk '{if ($7==\""+checkOption+"\") print ($2,$3,$4,$5,$6)}'", universal_newlines=True, shell=True, env=env)
            repeatOptionOne = (subprocess.check_output("crontab -u root -l | grep 'DeleteOldBackup' | awk '{print $2}'", universal_newlines=True, shell=True, env=env)).rstrip()
            repeatOptionTwo = subprocess.check_output("crontab -u root -l | grep 'DeleteOldBackup' | awk '{print $5}'", universal_newlines=True, shell=True, env=env)
            deleteOption = subprocess.check_output("crontab -u root -l | grep 'DeleteOldBackup' | awk '{print $6}'", universal_newlines=True, shell=True, env=env)

        if noRepeatOption or repeatOptionOne and repeatOptionTwo != '':
            # resultDate = ""
            format = '%Y-%m-%d %H:%M'
            if noRepeatOption != '':
                jobId = subprocess.check_output("at -l | awk '{if ($7==\""+checkOption+"\") print ($1)}'", universal_newlines=True, shell=True, env=env)
                deleteOption = subprocess.check_output("at -c "+jobId.rstrip()+" | grep 'ccvm_dump_*' | awk '{print $6}' | cut -c 2- ", universal_newlines=True, shell=True, env=env)
            elif repeatOptionOne == 'hourly':
                repeatOptionOne = '한 시간 마다'
                repeatOptionTwo = ''
                deleteOption = subprocess.check_output("crontab -u root -l | grep 'DeleteOldBackup' | awk '{print $5}'", universal_newlines=True, shell=True, env=env)
            elif repeatOptionOne == 'daily':
                repeatOptionOne = '매일'
                repeatOptionTwo = ''
                deleteOption = subprocess.check_output("crontab -u root -l | grep 'DeleteOldBackup' | awk '{print $5}'", universal_newlines=True, shell=True, env=env)
            elif repeatOptionOne == 'weekly':
                repeatOptionOne = '매주'
            elif repeatOptionOne == 'monthly':
                repeatOptionOne = '매월'

            if repeatOptionOne == '매주':
                repeatOptionTwo = repeatOptionTwo.rstrip()
                if repeatOptionTwo == '0':
                    repeatOptionTwo = '일요일'
                elif repeatOptionTwo == '1':
                    repeatOptionTwo = '월요일'
                elif repeatOptionTwo == '2':
                    repeatOptionTwo = '화요일'
                elif repeatOptionTwo == '3':
                    repeatOptionTwo = '수요일'
                elif repeatOptionTwo == '4':
                    repeatOptionTwo = '목요일'
                elif repeatOptionTwo == '5':
                    repeatOptionTwo = '금요일'
                elif repeatOptionTwo == '6':
                    repeatOptionTwo = '토요일'
                repeatOptionTwo = " "+repeatOptionTwo
            elif repeatOptionOne == '매월':
                if checkOption == 'r':
                    repeatOptionTwo = subprocess.check_output("crontab -u root -l | grep 'RegularBackup' | awk '{print $5}'", universal_newlines=True, shell=True, env=env)
                elif checkOption == 'd':
                    repeatOptionTwo = subprocess.check_output("crontab -u root -l | grep 'DeleteOldBackup' | awk '{print $5}'", universal_newlines=True, shell=True, env=env)
                repeatOptionTwo = repeatOptionTwo.rstrip()
                repeatOptionTwo_arr = repeatOptionTwo.split('-')
                repeatOptionTwo = repeatOptionTwo_arr[0]+"개월 "+repeatOptionTwo_arr[1]+"일 마다"
                repeatOptionTwo += " "

            # 백업일 경우, 한 번만 실행하는 경우와 반복하는 경우 체크
            if checkOption == 'r':
                result = subprocess.check_output("at -l | awk '{if ($7==\""+checkOption+"\") print ($2,$3,$4,$5,$6)}'", universal_newlines=True, shell=True, env=env)
                # 한 번만 실행
                if result != '':
                    str_datetime = result.rstrip()
                    format = '%a %b %d %H:%M:%S %Y'
                    resultDate = datetime.datetime.strptime(str_datetime, format)
                    resultDate = resultDate.strftime('%Y-%m-%d %H:%M:%S')
                    resultDate += " (반복 없음)"
                # 반복
                else:
                    result = subprocess.check_output("crontab -u root -l | grep 'RegularBackup' | awk '{print $3, $4}'", universal_newlines=True, shell=True, env=env)
                    str_datetime = result.rstrip()
                    resultDate = datetime.datetime.strptime(str_datetime, format)
                    resultDate = resultDate.strftime('%Y-%m-%d %H:%M')
                    resultDate += " ("+repeatOptionOne+repeatOptionTwo.rstrip()+")"

            # 백업 삭제일 경우, 한 번만 실행하는 경우와 반복하는 경우 체크
            elif checkOption == 'd':
                result = subprocess.check_output("at -l | awk '{if ($7==\""+checkOption+"\") print ($2,$3,$4,$5,$6)}'", universal_newlines=True, shell=True, env=env)
                # 한 번만 실행
                if result != '':
                    str_datetime = result.rstrip()
                    format = '%a %b %d %H:%M:%S %Y'
                    resultDate = datetime.datetime.strptime(str_datetime,format)
                    resultDate = resultDate.strftime('%Y-%m-%d %H:%M:%S')
                    resultDate += " (반복 없음, "+deleteOption.rstrip()+"일 지난 파일 삭제)"
                # 반복
                else:
                    result = subprocess.check_output("crontab -u root -l | grep 'DeleteOldBackup' | awk '{print $3, $4}'", universal_newlines=True, shell=True, env=env)
                    str_datetime = result.rstrip()
                    resultDate = datetime.datetime.strptime(str_datetime,format)
                    resultDate = resultDate.strftime('%Y-%m-%d %H:%M')
                    resultDate += " ("+repeatOptionOne+repeatOptionTwo.rstrip()+", "+deleteOption.rstrip()+"일 지난 파일 삭제)"
        else:
            resultDate = "None"

        return resultDate
        
    except Exception as e:
        print(e)
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
# 주요 기능 : ccvm의 "cloud" database를 정기적으로 dump하는 함수
def regularBackup(path, repeat, timeone, timetwo):
    path = str(path[0])
    repeat = str(repeat[0])
    timeone = str(timeone[0])
    timetwo = str(timetwo[0])
    now = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
    now_no_sec_obj = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    today = datetime.date.today()
    now_hourly = datetime.datetime.now().strftime('%Y-%m-%d %H')
    now_daily = datetime.datetime.now().strftime('%Y-%m-%d')
    
    os.system("mkdir -p "+path)
    # 크론잡 초기화 ("instantBackup"이 포함되어있는 크론잡 삭제)
    subprocess.check_output("grep -lrZ 'instantBackup' /var/spool/at/ | xargs -0 rm -f", universal_newlines=True, shell=True, env=env)
    subprocess.check_output("sed -i '/RegularBackup/d' /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
    subprocess.check_output("crontab -u root -l | grep -v 'instantBackup' | crontab -u root -", universal_newlines=True, shell=True, env=env)

    if (repeat) == 'no':
        result = subprocess.check_output("echo /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+" | at "+timeone+" -q r", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'hourly':
        timeone_arr = timeone.split(':')

        # date_obj: cockpit에서 입력받은 값
        date_obj = now_hourly+":"+str(timeone_arr[1])
        date_obj = date_obj.rstrip()

        # now_no_sec_obj : 현재 날짜, 요일을 나타내는 변수를 생성하기 위한 코드 

        # 백업 예정 날짜가 현재보다 과거일 경우 1일 경과된 날짜를 첫 백업 일정으로 지정
        if now_no_sec_obj >= date_obj:
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d %H:%M')
            new_date_obj = date_obj + datetime.timedelta(hours=1)
            new_date_string = new_date_obj.strftime("%Y-%m-%d %H:%M")
        else:
            new_date_string = date_obj

        result = subprocess.check_output("echo -e '#RegularBackup hourly '"+new_date_string+" >> /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" */1 * * * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'daily':
        timeone_arr = timeone.split(':')

        # date_obj: cockpit에서 입력받은 값
        date_obj = now_daily+" "+str(timeone_arr[0])+":"+str(timeone_arr[1])
        date_obj = date_obj.rstrip()
  
        # now_no_sec_obj : 현재 날짜, 요일을 나타내는 변수를 생성하기 위한 코드 
        
        # 백업 예정 날짜가 현재보다 과거일 경우 1일 경과된 날짜를 첫 백업 일정으로 지정
        if now_no_sec_obj >= date_obj:
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d %H:%M')
            new_date_obj = date_obj + datetime.timedelta(days=1)
            new_date_string = new_date_obj.strftime("%Y-%m-%d %H:%M")
        else:
            new_date_string = date_obj

        result = subprocess.check_output("echo -e '#RegularBackup daily '"+new_date_string+" >> /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'weekly':
        timeone_arr = timeone.split(':')
        weekday = today.weekday()

        # 입력받은 요일 계산
        days_until_day = (int(timetwo) - weekday) % 7
        the_day = datetime.datetime.now() + datetime.timedelta(days=days_until_day)
        the_day_obj = the_day.date().strftime("%Y-%m-%d")
        date_string = the_day_obj+" "+str(timeone_arr[0])+":"+str(timeone_arr[1])

        # date_obj: cockpit에서 입력받은 값
        str_datetime = date_string.rstrip()
        date_obj = datetime.datetime.strptime(str_datetime, "%Y-%m-%d %H:%M")
        date_obj = date_obj.replace(day=date_obj.day-1)
        date_obj = date_obj.strftime("%Y-%m-%d %H:%M")

        # now_with_weekday_obj : 현재 날짜, 요일을 나타내는 변수를 생성하기 위한 코드 
        now = datetime.datetime.now()
        now_with_weekday_obj = now.strftime("%Y-%m-%d %H:%M")

        # new_date_string : 최종적으로 크론잡에 입력되는 날짜
        new_date_string = str_datetime

        if now_with_weekday_obj >= date_obj:
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d %H:%M')
            date_obj = date_obj.strftime('%Y-%m-%d')
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d')
            new_date_obj = date_obj + datetime.timedelta(days=7)
            new_date_string = new_date_obj.strftime("%Y-%m-%d")
        else:
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d %H:%M')
            # date_obj = date_obj.replace(day=date_obj.year-1)
            date_obj = date_obj.strftime('%Y-%m-%d')
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d')
            new_date_obj = date_obj
            new_date_string = new_date_obj.strftime("%Y-%m-%d")

        result = subprocess.check_output("echo -e '#RegularBackup weekly '"+new_date_string+" "+timeone+" "+timetwo+" >> /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * "+timetwo+" /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'monthly':
        timeone_arr = timeone.split(':')
        timetwo_arr = timetwo.split('-')

        # 백업 예정 날짜가 현재보다 과거일 경우 지정된 개월 수 이후, 지정된 날을 첫 백업 일정으로 지정
        # date_obj: cockpit에서 입력받은 값
        date_obj = datetime.datetime.strptime(now_daily, "%Y-%m-%d")
        date_obj = date_obj.replace(day=int(timetwo_arr[1]))
        date_obj = date_obj.strftime("%Y-%m-%d")
        date_obj = date_obj+" "+str(timeone_arr[0])+":"+str(timeone_arr[1])
        date_obj = date_obj.rstrip()

        # now_no_sec_obj : 현재 날짜, 요일을 나타내는 변수를 생성하기 위한 코드 

        if now_no_sec_obj >= date_obj:
            date_obj = datetime.datetime.strptime(now_daily, "%Y-%m-%d")
            date_obj = date_obj.replace(day=int(timetwo_arr[1]))
            if int(timetwo_arr[0]) == 1:
                date_obj = date_obj.replace(month=date_obj.month+1)
            elif int(timetwo_arr[0]) == 2:
                date_obj = date_obj + relativedelta(months=int(1))
            elif int(timetwo_arr[0]) == 3:
                date_obj = date_obj + relativedelta(months=int(timetwo_arr[0]))
            elif int(timetwo_arr[0]) == 12:
                date_obj = date_obj.replace(year=date_obj.year+1, month=int(1))
            else:
                date_obj = date_obj.replace(month=int(timetwo_arr[0]) + 1)
            date_obj = date_obj.strftime("%Y-%m-%d")
            new_date_string = date_obj
        else:
            date_obj = datetime.datetime.strptime(now_daily, "%Y-%m-%d")
            date_obj = date_obj.replace(day=int(timetwo_arr[1]))
            if int(timetwo_arr[0]) == 1 or int(timetwo_arr[0]) == 3:
                date_obj = date_obj.replace(month=date_obj.month)
            elif int(timetwo_arr[0]) == 2:
                date_obj = date_obj + relativedelta(months=int(1))
            elif int(timetwo_arr[0]) == 12:
                date_obj = date_obj.replace(year=date_obj.year+1, month=int(1))
            else:
                date_obj = date_obj.replace(month=int(timetwo_arr[0]) + 1)
            date_obj = date_obj.strftime("%Y-%m-%d")
            new_date_string = date_obj

        result = subprocess.check_output("echo -e '#RegularBackup monthly '"+new_date_string+" "+timeone+" "+timetwo+" >> /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" "+str(timetwo_arr[1])+" */"+str(timetwo_arr[0])+" * /usr/bin/python3 /usr/share/cockpit/ablestack/python/vm/dump_ccvm.py instantBackup --path "+path+"'"+") | crontab -", universal_newlines=True, shell=True, env=env)

# 함수명 : deleteOldBackup
# 주요 기능 : ccvm의 "cloud" database를 dump한 파일 중, 정해진 기간보다 오래된 파일을 삭제하는 함수
def deleteOldBackup(path, repeat, timeone, timetwo, delete):
    path = str(path[0])
    repeat = str(repeat[0])
    timeone = str(timeone[0])
    timetwo = str(timetwo[0])
    delete = str(delete[0])

    # now = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
    now_no_sec_obj = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    today = datetime.date.today()
    now_hourly = datetime.datetime.now().strftime('%Y-%m-%d %H')
    now_daily = datetime.datetime.now().strftime('%Y-%m-%d')

    # 크론잡 초기화 ("delete"와 "sql"이 포함되어있는 크론잡 삭제)
    subprocess.check_output("grep -lrEZ 'ccvm_dump.*delete' /var/spool/at/ | xargs -0 rm -f", universal_newlines=True, shell=True, env=env)
    subprocess.check_output("sed -i '/DeleteOldBackup/d' /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
    subprocess.check_output("crontab -u root -l | grep -Ev 'delete.*sql|sql.*delete' | crontab -u root -", universal_newlines=True, shell=True, env=env)

    if (repeat) == 'no':
            result = subprocess.check_output("echo find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+delete+" delete | at "+timeone+" -q d", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'hourly':
        timeone_arr = timeone.split(':')

        # date_obj: cockpit에서 입력받은 값
        date_obj = now_hourly+":"+str(timeone_arr[1])
        date_obj = date_obj.rstrip()

        # now_no_sec_obj : 현재 날짜, 요일을 나타내는 변수를 생성하기 위한 코드 

        # 백업 예정 날짜가 현재보다 과거일 경우 1일 경과된 날짜를 첫 백업 일정으로 지정
        if now_no_sec_obj >= date_obj:
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d %H:%M')
            new_date_obj = date_obj + datetime.timedelta(hours=1)
            new_date_string = new_date_obj.strftime("%Y-%m-%d %H:%M")
        else:
            new_date_string = date_obj

        result = subprocess.check_output("echo -e '#DeleteOldBackup hourly '"+new_date_string+" "+delete+" >> /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" */1 * * * find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+ delete+"'"+" -delete) | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'daily':
        timeone_arr = timeone.split(':')
                # date_obj: cockpit에서 입력받은 값
        date_obj = now_daily+" "+str(timeone_arr[0])+":"+str(timeone_arr[1])
        date_obj = date_obj.rstrip()
  
        # now_no_sec_obj : 현재 날짜, 요일을 나타내는 변수를 생성하기 위한 코드 
        
        # 백업 예정 날짜가 현재보다 과거일 경우 1일 경과된 날짜를 첫 백업 일정으로 지정
        if now_no_sec_obj >= date_obj:
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d %H:%M')
            new_date_obj = date_obj + datetime.timedelta(days=1)
            new_date_string = new_date_obj.strftime("%Y-%m-%d %H:%M")
        else:
            new_date_string = date_obj

        result = subprocess.check_output("echo -e '#DeleteOldBackup daily '"+new_date_string+" "+delete+" >> /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * * find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+ delete+"'"+" -delete) | crontab -", universal_newlines=True, shell=True, env=env)
    elif(repeat) == 'weekly':
        timeone_arr = timeone.split(':')
                # 백업 예정 날짜가 현재보다 과거일 경우 7일 경과된 날짜를 첫 백업 일정으로 지정
        weekday = today.weekday()
        # 입력받은 요일 계산
        days_until_day = (int(timetwo) - weekday) % 7
        the_day = datetime.datetime.now() + datetime.timedelta(days=days_until_day)
        the_day_obj = the_day.date().strftime("%Y-%m-%d")
        date_string = the_day_obj+" "+str(timeone_arr[0])+":"+str(timeone_arr[1])

        # date_obj: cockpit에서 입력받은 값
        str_datetime = date_string.rstrip()
        date_obj = datetime.datetime.strptime(str_datetime, "%Y-%m-%d %H:%M")
        date_obj = date_obj.replace(day=date_obj.day-1)
        date_obj = date_obj.strftime("%Y-%m-%d %H:%M")

        # now_with_weekday_obj : 현재 날짜, 요일을 나타내는 변수를 생성하기 위한 코드 
        now = datetime.datetime.now()
        now_with_weekday_obj = now.strftime("%Y-%m-%d %H:%M")

        # new_date_string : 최종적으로 크론잡에 입력되는 날짜
        new_date_string = str_datetime
        
        if now_with_weekday_obj >= date_obj:
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d %H:%M')
            date_obj = date_obj.strftime('%Y-%m-%d')
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d')
            new_date_obj = date_obj + datetime.timedelta(days=7)
            new_date_string = new_date_obj.strftime("%Y-%m-%d")
        else:
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d %H:%M')
            # date_obj = date_obj.replace(day=date_obj.year-1)
            date_obj = date_obj.strftime('%Y-%m-%d')
            date_obj = datetime.datetime.strptime(date_obj, '%Y-%m-%d')
            new_date_obj = date_obj
            new_date_string = new_date_obj.strftime("%Y-%m-%d")

        result = subprocess.check_output("echo -e '#DeleteOldBackup weekly '"+new_date_string+" "+timeone+" "+timetwo+" "+delete+" >> /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
        result = subprocess.check_output("cat <(crontab -l) <(echo "+"'"+str(timeone_arr[1])+" "+str(timeone_arr[0])+" * * "+timetwo+" find "+path+" -name "'"ccvm_dump_*.sql"'" -ctime -"+ delete+"'"+" -delete) | crontab -", universal_newlines=True, shell=True, env=env)

    elif(repeat) == 'monthly':
        timeone_arr = timeone.split(':')
        timetwo_arr = timetwo.split('-')
        # 백업 예정 날짜가 현재보다 과거일 경우 지정된 개월 수 이후, 지정된 날을 첫 백업 일정으로 지정
        # date_obj: cockpit에서 입력받은 값
        date_obj = datetime.datetime.strptime(now_daily, "%Y-%m-%d")
        date_obj = date_obj.replace(day=int(timetwo_arr[1]))
        date_obj = date_obj.strftime("%Y-%m-%d")
        date_obj = date_obj+" "+str(timeone_arr[0])+":"+str(timeone_arr[1])
        date_obj = date_obj.rstrip()

        # now_no_sec_obj : 현재 날짜, 요일을 나타내는 변수를 생성하기 위한 코드 

        if now_no_sec_obj >= date_obj:
            date_obj = datetime.datetime.strptime(now_daily, "%Y-%m-%d")
            date_obj = date_obj.replace(day=int(timetwo_arr[1]))
            if int(timetwo_arr[0]) == 1:
                date_obj = date_obj.replace(month=date_obj.month + 1)
            elif int(timetwo_arr[0]) == 2:
                date_obj = date_obj + relativedelta(months=int(1))
            elif int(timetwo_arr[0]) == 3:
                date_obj = date_obj + relativedelta(months=int(timetwo_arr[0]))
            elif int(timetwo_arr[0]) == 12:
                date_obj = date_obj.replace(year=date_obj.year+1, month=int(1))
            else:
                date_obj = date_obj.replace(month=int(timetwo_arr[0]) + 1)
            date_obj = date_obj.strftime("%Y-%m-%d")
            new_date_string = date_obj
        else:
            date_obj = datetime.datetime.strptime(now_daily, "%Y-%m-%d")
            date_obj = date_obj.replace(day=int(timetwo_arr[1]))
            if int(timetwo_arr[0]) == 1 or int(timetwo_arr[0]) == 3:
                date_obj = date_obj.replace(month=date_obj.month)
            elif int(timetwo_arr[0]) == 2:
                date_obj = date_obj + relativedelta(months=int(1))
            elif int(timetwo_arr[0]) == 12:
                date_obj = date_obj.replace(year=date_obj.year+1, month=int(1))
            else:
                date_obj = date_obj.replace(month=int(timetwo_arr[0]) + 1)
            date_obj = date_obj.strftime("%Y-%m-%d")
            new_date_string = date_obj

        result = subprocess.check_output("echo -e '#DeleteOldBackup monthly '"+new_date_string+" "+timeone+" "+timetwo+" "+delete+" >> /var/spool/cron/root", universal_newlines=True, shell=True, env=env)
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
            dump_check = checkBackup(args.checkOption)
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

    if (args.action) == 'deactiveBackup':
        try:
            dump_check = deactiveBackup(args.checkOption)
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