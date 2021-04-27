#!/usr/bin/env python3
# -*- coding: utf-8 -*-
'''
Copyright (c) 2021 ABLECLOUD Co. Ltd.

SCVM, CCVM의 cloud-init 실행 및 완료 여부 확인하는 스크립트

최초작성일 : 2021-03-15
'''
import json
import argparse

from ablestack import *

file_path = '/usr/share/cockpit/ablestack/tools/properties/ablestack.json'
def parseArgs():

    parser = argparse.ArgumentParser(description='Cloud-Init status check',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    parser.add_argument('action', choices=['status','create','update','delete'], help='choose one of the actions')
    parser.add_argument('--depth1', metavar='name', type=str, help='ablestack.json 1 depth key')
    parser.add_argument('--depth2', metavar='name', type=str, help='ablestack.json 2 depth key')
    parser.add_argument('--value', metavar='name', type=str, help='ablestack.json value')

    return parser.parse_args()

def openAblestackJson():
    try:
        with open(file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)

    return ret

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
        print ('EXCEPTION : ',e)

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
            print(json_data)
            json_data[args.depth1][args.depth2] = args.value
            print(json_data)
            with open(file_path, 'w') as outfile:
                json.dump(json_data, outfile, indent=4)
            ret = createReturn(code=200, val=ret_val)

    except Exception as e:
        ret = createReturn(code=600, val='ERROR')
        print ('EXCEPTION : ',e)

    return ret

if __name__ == '__main__':
    # parser 생성
    args = parseArgs()
    if (args.action) == 'status':
        ret = jsonStatus()
        print(ret)
    elif (args.action) == 'update':
        ret = jsonUpdate()
        print(ret)