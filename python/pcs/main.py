'''
Copyright (c) 2021 ABLECLOUD Co. Ltd

이 파일은 pacemaker.py를 실행하는 main 함수가 정의된 파일입니다.
최초 작성일 : 2021. 03. 19
'''

#!/usr/bin/python3
# -*- coding: utf-8 -*-

from pacemaker import *
from ablestack import *
import sys

# 함수명 : main
'''
main 함수는 실행될 때 필수 파라미터 config, create, enable, disable, move, cleanup, remove, status 중 하나를 입력받아
pacemaker.py에 정의되어 있는 함수를 호출합니다.
'''
def main():
    pcs = Pacemaker()
    args = parseArgs()

    if (args.action) == 'config':
        pcs.configCluster(args.cluster, args.hosts)
    elif (args.action) == 'create':
        pcs.createResource(args.resource, args.xml)
    elif (args.action) == 'enable':
        pcs.enableResource(args.resource)
    elif (args.action) == 'disable':
        pcs.disableResource(args.resource)
    elif (args.action) == 'move':
        pcs.moveResource(args.resource, args.target)
    elif (args.action) == 'cleanup':
        pcs.cleanupResource(args.resource)
    elif (args.action) == 'remove':
        pcs.removeResource(args.resource)       
    elif (args.action) == 'status':
        pcs.statusResource(args.resource)


if __name__ == "__main__":
    main()