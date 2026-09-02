'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
이 파일은 스토리지 및 클라우드 센터 관련 연결 주소를 생성하는 기능을 수행합니다.
최초 작성일 : 2021. 03. 30
'''
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import argparse
import json
import logging
import sh
import subprocess
import xml.etree.ElementTree as ET

from subprocess import check_output
from ablestack import *

# 함수명 : parseArgs
# 주요기능 : 입련된 argument를 파싱하여 dictionary처럼 사용하게 만들어 주는 parser 생성
def parseArgs():

    parser = argparse.ArgumentParser(description='Card Cloud Cluster Status',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    parser.add_argument('action', choices=['pcsDetail', 'infrastructureDetail', 'pcsStart', 'pcsStop', 'pcsCleanup', 'pcsMigration', 'pcsDestroy'])
    parser.add_argument('--purge', type=str,  help='Purge Cloud Center VM')
    parser.add_argument('--target', metavar='name', type=str, help='Target hostname to migrate Cloud Center VM')

    return parser.parse_args()

# 함수명 : pcsDetail
# 주요기능 : pcs 클러스터의 상세정보를 조회
def pcsDetail():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res")
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')


    return ret


def infrastructureDetail():
    """Return Pacemaker infrastructure health from ``pcs status xml``."""
    try:
        status_result = subprocess.run(
            ['pcs', 'status', 'xml'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=15,
            check=False,
        )
        status_xml = status_result.stdout
        if status_result.returncode != 0 or not status_xml.strip():
            return createReturn(code=400, val='cluster is not configured.')

        root = ET.fromstring(status_xml)
        node_elements = root.findall('./nodes/node')
        if not node_elements:
            return createReturn(code=400, val='cluster is not configured.')

        stack = root.find('./summary/stack')
        current_dc = root.find('./summary/current_dc')
        pacemaker_running = stack is not None and stack.get('pacemakerd-state') == 'running'
        corosync_running = stack is not None and stack.get('type') == 'corosync'
        resource = root.find(".//resource[@id='cloudcenter_res']")
        resource_started = resource is not None and resource.get('role') == 'Started'
        resource_node = resource.find('./node') if resource is not None else None
        ccvm_running_node = resource_node.get('name', '') if resource_node is not None else ''

        nodes = []
        online_nodes = []
        offline_nodes = []
        for node_element in node_elements:
            node = node_element.get('name', '')
            if not node:
                continue
            # XML에서 명시적으로 offline인 노드만 오프라인으로 표시한다.
            is_online = node_element.get('online') != 'false'
            if is_online:
                online_nodes.append(node)
            else:
                offline_nodes.append(node)
            nodes.append({'name': node, 'online': is_online})

        if not pacemaker_running or not corosync_running:
            health = 'err'
            message = 'Pacemaker 또는 Corosync 서비스가 비정상입니다.'
        elif offline_nodes:
            health = 'warn'
            message = f"오프라인 노드가 있습니다: {', '.join(offline_nodes)}"
        elif not resource_started:
            health = 'warn'
            message = 'cloudcenter_res가 Started 상태가 아닙니다.'
        else:
            health = 'ok'
            message = '인프라 클러스터가 정상입니다.'

        ret_val = {
            'health': health,
            'message': message,
            'nodes': nodes,
            'online_nodes': online_nodes,
            'offline_nodes': offline_nodes,
            'resource_started': resource_started,
            'ccvm_running_node': ccvm_running_node,
            'current_dc': current_dc.get('name', '') if current_dc is not None else '',
        }
        return createReturn(code=200, val=ret_val)
    except (OSError, ValueError, TypeError, json.JSONDecodeError, ET.ParseError, subprocess.TimeoutExpired):
        return createReturn(code=500, val='infrastructure cluster status check failed.')

def pcsStart():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","enable", "--resource", "cloudcenter_res")
        while True:
            retPcsStatusJson = json.loads(sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res"))
            if retPcsStatusJson['val']['role'] == 'Started':
                break
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')

    return ret

# 함수명 : pcsStop
# 주요기능 : pcs 클러스터를 정지
def pcsStop():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","disable", "--resource", "cloudcenter_res")
        while True:
            retPcsStatusJson = json.loads(sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res"))
            if retPcsStatusJson['val']['role'] == 'Stopped':
                break
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')

    return ret

# 함수명 : pcsCleanup
# 주요기능 : pcs 클러스터를 클린업
def pcsCleanup():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","cleanup", "--resource", "cloudcenter_res")
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')


    return ret

# 함수명 : pcsCleanup
# 주요기능 : pcs 클러스터에서 운영중인 CloudCenter VM을 입력반은 호스트로 마이그레이션
def pcsMigration():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","move", "--resource", "cloudcenter_res", "--target",  args.target)
        while True:
            retPcsStatusJson = json.loads(sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res"))
            if retPcsStatusJson['val']['role'] == 'Started':
                break
        sh.python3(pluginpath + "/python/pcs/main.py","cleanup", "--resource", "cloudcenter_res")
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')

    return ret

def pcsDestroy(purge):
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","remove", "--resource", "cloudcenter_res")
        if purge == "true":
            os.system("rm -rf /mnt/glue-gfs/ccvm*")

    except Exception as e:
        ret = createReturn(code=500, val='ERROR')

    return ret


if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    # 파라미터에 따른 함수 호출
    if args.action == 'pcsDetail':
        ret = pcsDetail()
        print(ret)
    elif args.action == 'infrastructureDetail':
        ret = infrastructureDetail()
        print(ret)
    elif args.action == 'pcsStart':
        ret = pcsStart()
        print(ret)
    elif args.action == 'pcsStop':
        ret = pcsStop()
        print(ret)
    elif args.action == 'pcsCleanup':
        ret = pcsCleanup()
        print(ret)
    elif args.action == 'pcsMigration':
        ret = pcsMigration()
        print(ret)
    elif args.action == 'pcsDestroy':
        ret = pcsDestroy(args.purge)
        print(ret)
