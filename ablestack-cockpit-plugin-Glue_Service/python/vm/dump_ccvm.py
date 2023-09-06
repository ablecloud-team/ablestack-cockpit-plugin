'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 클라우드센터 가상머신의 데이터베이스를 백업하는 프로그램
최초 작성일 : 2021. 10. 21
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json

from ablestack import *

user_id = "cloud"
passwd = "Ablecloud1!"
database = "cloud"
enc = "utf8"

# 함수명 : dumpdb
# 주요 기능 : ccvm의 "cloud" database를 dump하는 함수
def dumpdb():

    os.system("mkdir -p /root/db_dump/")
    # os.system("ssh root@ccvm mkdir -p /root/db_dump")

    command = []
    command.append("mysqldump")
    command.append("-u%s" % user_id)
    command.append("-p%s" % passwd)
    command.append("%s > /root/db_dump/ccvm_dump_%s.sql" % (database, database))
    command = " ".join(command)
    os.system("ssh root@ccvm " + command)

    # sh.scp("root@ccvm:/root/db_dump/ccvm_dump_cloud.sql", "/root/db_dump/ccvm_dump_cloud.sql")
    
def main():
    try:
        dumpdb()
        ret = createReturn(code=200, val="Creation of mysqldump of ccvm is completed")
        print(json.dumps(json.loads(ret), indent=4))

    except Exception as e:
        ret = createReturn(code=500, val="Creation of mysqldump of ccvm is failed")
        print(json.dumps(json.loads(ret), indent=4))
    return ret

if __name__ == "__main__":
    main()