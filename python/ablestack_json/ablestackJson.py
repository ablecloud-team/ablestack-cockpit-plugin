#!/usr/bin/env python3
# -*- coding: utf-8 -*-
'''
Copyright (c) 2021 ABLECLOUD Co. Ltd.

SCVM, CCVM의 cloud-init 실행 및 완료 여부 확인하는 스크립트

최초작성일 : 2021-03-15
'''
import json
import argparse
import shlex
import socket
import subprocess

from ablestack import *

file_path = '/usr/share/cockpit/ablestack/tools/properties/ablestack.json'
cluster_json_file_path = pluginpath + "/tools/properties/cluster.json"
def parseArgs():

    parser = argparse.ArgumentParser(description='Cloud-Init status check',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    parser.add_argument('action', choices=['status','create','update','delete','allUpdate','reset'], help='choose one of the actions')
    parser.add_argument('--depth1', metavar='name', type=str, help='ablestack.json 1 depth key')
    parser.add_argument('--depth2', metavar='name', type=str, help='ablestack.json 2 depth key')
    parser.add_argument('--value', metavar='name', type=str, help='ablestack.json value')
    parser.add_argument('--all-hosts', action='store_true',
                        help='apply the update to every ablecube host in cluster.json')

    return parser.parse_args()

def openAblestackJson():
    try:
        with open(file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')

    return ret

def openClusterJson():
    try:
        with open(cluster_json_file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='cluster.json read error')

    return ret

cluster_json_data = openClusterJson()
os_type = cluster_json_data["clusterConfig"]["type"]
def jsonStatus():
    try:
        res = {}
        json_data = openAblestackJson()
        ret_val = json_data
        if (args.depth1 == None):
            ret_val = json_data

        elif (args.depth1 != None and args.depth2 == None):
            res[args.depth1] = json_data[args.depth1]
            ret_val = res

        elif (args.depth1 != None and args.depth2 != None):
            res[args.depth2] = json_data[args.depth1][args.depth2]
            ret_val = res

        ret = createReturn(code=200, val=ret_val)
    except Exception as e:
        ret = createReturn(code=600, val='ERROR')

    return ret

def jsonUpdate():
    try:
        res = {}
        json_data = openAblestackJson()
        ret_val = json_data
        if (args.depth1 == None):
            res['message'] = 'There is no level 1 value.'
            ret_val = res
            ret = createReturn(code=200, val=ret_val)

        elif (args.depth2 == None):
            res['message'] = 'There is no level 2 value.'
            ret_val = res
            ret = createReturn(code=200, val=ret_val)
            ret_val = res
        elif (args.value == None):
            res['message'] = 'There is no value.'
            ret_val = res
            ret = createReturn(code=200, val=ret_val)
            ret_val = res

        else:
            json_data[args.depth1][args.depth2] = args.value
            with open(file_path, 'w') as outfile:
                json.dump(json_data, outfile, indent=4)
            ret = createReturn(code=200, val=ret_val)

    except Exception as e:
        ret = createReturn(code=500, val='ERROR')

    return ret

def jsonUpdateAllHosts():
    if args.depth1 is None or args.depth2 is None or args.value is None:
        return createReturn(
            code=400,
            val='--depth1, --depth2 and --value are required with --all-hosts'
        )

    local_update = jsonUpdate()
    try:
        local_result = json.loads(local_update)
    except Exception:
        return createReturn(code=500, val='local ablestack.json update result parse error')

    if local_result.get('code') != 200:
        return local_update

    try:
        hosts = cluster_json_data["clusterConfig"]["hosts"]
        local_hostname = socket.gethostname()
        local_names = {local_hostname, local_hostname.split('.')[0]}
        updated_hosts = [local_hostname]
        failed_hosts = []
        processed_targets = set()

        remote_args = [
            '/usr/bin/python3',
            pluginpath + '/python/ablestack_json/ablestackJson.py',
            'update',
            '--depth1', args.depth1,
            '--depth2', args.depth2,
            '--value', args.value
        ]
        remote_command = ' '.join(shlex.quote(value) for value in remote_args)

        for host in hosts:
            hostname = str(host.get('hostname', '')).strip()
            target = str(host.get('ablecube', '')).strip()

            if hostname in local_names:
                continue
            if not target:
                failed_hosts.append({
                    'host': hostname or 'unknown',
                    'target': target,
                    'error': 'ablecube management address is empty'
                })
                continue
            if target in processed_targets:
                continue

            processed_targets.add(target)
            try:
                result = subprocess.run(
                    [
                        '/usr/bin/ssh',
                        '-o', 'BatchMode=yes',
                        '-o', 'StrictHostKeyChecking=no',
                        '-o', 'ConnectTimeout=5',
                        target,
                        remote_command
                    ],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=20,
                    check=False
                )

                output_lines = [
                    line.strip() for line in result.stdout.splitlines()
                    if line.strip()
                ]
                remote_result = json.loads(output_lines[-1]) if output_lines else {}

                if result.returncode == 0 and remote_result.get('code') == 200:
                    updated_hosts.append(hostname or target)
                else:
                    error_message = result.stderr.strip()
                    if not error_message:
                        error_message = str(remote_result.get('val', 'remote update failed'))
                    failed_hosts.append({
                        'host': hostname or target,
                        'target': target,
                        'error': error_message
                    })
            except Exception as e:
                failed_hosts.append({
                    'host': hostname or target,
                    'target': target,
                    'error': str(e)
                })

        result_value = {
            'depth1': args.depth1,
            'depth2': args.depth2,
            'value': args.value,
            'updatedHosts': updated_hosts,
            'failedHosts': failed_hosts
        }
        if failed_hosts:
            return createReturn(code=207, val=result_value)
        return createReturn(code=200, val=result_value)
    except Exception as e:
        return createReturn(code=500, val='cluster ablestack.json update error: ' + str(e))

def jsonAllUpdate():
    try:
        json_data = openAblestackJson()
        if os_type == "ablestack-hci" or os_type == "ablestack-hci-filesystem":
            json_data["bootstrap"]["scvm"] = "true"
        elif os_type == "powerflex":
            json_data["bootstrap"]["pfmp"] = "true"
        elif os_type == "ablestack-vm":
            json_data["bootstrap"]["gfs_configure"] = "true"

        json_data["bootstrap"]["ccvm"] = "true"
        json_data["monitoring"]["wall"] = "true"

        with open(file_path, 'w') as outfile:
            json.dump(json_data, outfile, indent=4)
            ret = createReturn(code=200, val="ablestack.json all option change true")

    except Exception as e:
        ret = createReturn(code=500, val='ablestack.json all option change ERROR')

    return ret

def jsonAllReset():
    try:
        json_data = openAblestackJson()

        json_data["bootstrap"]["scvm"] = "false"
        json_data["bootstrap"]["ccvm"] = "false"
        json_data["bootstrap"]["pfmp"] = "false"
        json_data["monitoring"]["wall"] = "false"
        json_data["bootstrap"]["gfs_configure"] = "false"

        with open(file_path, 'w') as outfile:
            json.dump(json_data, outfile, indent=4)
            ret = createReturn(code=200, val="ablestack.json all option change false")

    except Exception as e:
        ret = createReturn(code=500, val='ablestack.json all option change ERROR')

    return ret

if __name__ == '__main__':
    # parser 생성
    args = parseArgs()
    if (args.action) == 'status':
        ret = jsonStatus()
        print(ret)
    elif (args.action) == 'update':
        if args.all_hosts:
            ret = jsonUpdateAllHosts()
        else:
            ret = jsonUpdate()
        print(ret)
    elif (args.action) == 'allUpdate':
        ret = jsonAllUpdate()
        print(ret)
    elif (args.acrtion) == 'reset':
        ret = jsonAllReset()
        print(ret)
