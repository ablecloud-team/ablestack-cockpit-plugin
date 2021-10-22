'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 클라우드센터 가상머신의 데이터베이스를 백업하는 프로그램
최초 작성일 : 2021. 10. 21
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

user_id = "cloud"
passwd = "Ablecloud1!"
database = "cloud"
# enc = "utf8"

def dumpdb():
    
    command = []
    command.append("mysqldump")
    command.append("-u%s" % user_id)
    command.append("-p%s" % passwd)
    # command.append("--default-character-set=%s" % enc)
    # command.append("--extended-insert=FALSE")
    command.append("%s > /root/dump_%s.sql" % (database, database))
    command = " ".join(command)
    
    os.system(command)

if __name__=="__main__":
    dumpdb()
