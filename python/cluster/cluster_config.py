'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 클러스터 설정 파일 cluster.json의 hosts정보를 편집하는 프로그램
최초 작성일 : 2022. 08. 25
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import sys
import os
import json
import socket

from ablestack import *
from sh import python3
from sh import ssh
from python_hosts import Hosts, HostsEntry
from pyfstab import Fstab, Entry

json_file_path = pluginpath+"/tools/properties/cluster.json"
hosts_file_path = "/etc/hosts"
def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='클러스터 설정 파일 cluster.json의 hosts정보를 편집하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method
    parser.add_argument('action', choices=['insert','insertScvmHost','insertAllHost','remove'], help='choose one of the actions')
    parser.add_argument('-cmi', '--ccvm-mngt-ip', metavar='[coludcenter vm IP information]', type=str, help='input Value to coludcenter vm IP information')
    parser.add_argument('-mnc', '--mngt-nic-cidr', metavar='[management Nic cidr]', type=str, help='input Value to management Nic cidr')
    parser.add_argument('-mng', '--mngt-nic-gw', metavar='[management Nic gateway]', type=str, help='input Value to management Nic gateway')
    parser.add_argument('-mnd', '--mngt-nic-dns', metavar='[management Nic DNS]', type=str, help='management Nic DNS')
    parser.add_argument('-pcl', '--pcs-cluster-list', metavar=('[hostname1]','[hostname2]','[hostname3]'), type=str, nargs=3, help='input Value to three host names')
    parser.add_argument('-js', '--json-string', metavar='[json string text]', type=str, help='input Value to json string text')
    parser.add_argument('-co', '--copy-option', choices=['hostOnly','withScvm','withCcvm'], metavar='[hosts file copy option]', default="hostOnly", type=str, help='choose one of the actions')
    parser.add_argument('-eh', '--exclude-hostname', metavar='[Hostnames to exclude from copying the hosts file to scvm and checking the network]', type=str, help='input Value to exclude hostname')
    parser.add_argument('-rh', '--remove-hostname', metavar='[Hostnames to remove configuration in cluster]', type=str, help='input Value to remove hostname')

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def openClusterJson():
    try:
        with open(json_file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='cluster.json read error')
        print ('EXCEPTION : ',e)

    return ret

# 파라미터로 받은 json 값으로 cluster_config.py 무조건 바꾸는 함수 (동일한 값이 있으면 변경, 없으면 추가)
def insert(args):
    try:
        # 수정할 cluster.json 파일 읽어오기
        json_data = openClusterJson()

        # 기존 file json 데이터를 param 데이터로 교체
        if args.ccvm_mngt_ip is not None:
            json_data["clusterConfig"]["ccvm"]["ip"] = args.ccvm_mngt_ip
        
        if args.pcs_cluster_list is not None:
            if args.pcs_cluster_list[0] is not None:
                json_data["clusterConfig"]["pcsCluster"]["hostname1"] = args.pcs_cluster_list[0]
            if args.pcs_cluster_list[1] is not None:
                json_data["clusterConfig"]["pcsCluster"]["hostname2"] = args.pcs_cluster_list[1]
            if args.pcs_cluster_list[2] is not None:
                json_data["clusterConfig"]["pcsCluster"]["hostname3"] = args.pcs_cluster_list[2]
        
        if args.mngt_nic_cidr is not None:
            json_data["clusterConfig"]["mngtNic"]["cidr"] = args.mngt_nic_cidr

        if args.mngt_nic_gw is not None:
            json_data["clusterConfig"]["mngtNic"]["gw"] = args.mngt_nic_gw

        if args.mngt_nic_dns is not None:
            json_data["clusterConfig"]["mngtNic"]["dns"] = args.mngt_nic_dns
        
        if args.json_string is not None:
            # 파라미터로 받아온 json으로 변환
            param_json = json.loads(args.json_string)

            # hosts 정보가 존재하면 기존 file json 데이터를 param json 데이터로 교체
            for p_val in param_json:
                not_matching = True
                for f_val in json_data["clusterConfig"]["hosts"]:
                    if f_val["hostname"] == p_val["hostname"]:
                        f_val["index"] = p_val["index"]
                        f_val["hostname"] = p_val["hostname"]
                        f_val["ablecube"] = p_val["ablecube"]
                        f_val["scvmMngt"] = p_val["scvmMngt"]
                        f_val["ablecubePn"] = p_val["ablecubePn"]
                        f_val["scvm"] = p_val["scvm"]
                        f_val["scvmCn"] = p_val["scvmCn"]
                        not_matching = False
                
                # 한번도 매칭되지 않은 param_json을 file json데이터에 appen
                if not_matching:
                    json_data["clusterConfig"]["hosts"].append({
                        "index": p_val["index"],
                        "hostname": p_val["hostname"],
                        "ablecube": p_val["ablecube"],
                        "scvmMngt": p_val["scvmMngt"],
                        "ablecubePn": p_val["ablecubePn"],
                        "scvm": p_val["scvm"],
                        "scvmCn": p_val["scvmCn"]
                    })

        # json 변환 정보 cluster.json 파일 수정
        with open(json_file_path, "w") as cluster_json:
            cluster_json.write(json.dumps(json_data, indent=4))

        # hosts 파일 복사 실패시 3번 시도까지 하도록 개선
        result = {}
        for i in [1,2,3]:
            result = json.loads(python3(pluginpath + '/python/cluster/cluster_hosts_setting.py', args.copy_option))
            if result["code"] == 200:
                break

        if result["code"] != 200:
            return createReturn(code=500, val=return_val + " : " + p_val3["ablecube"])
        else:
            return createReturn(code=200, val="Cluster Config insert Success")

    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val="Please check the \"cluster.json\" file. : "+e)

# ccvm 배포할 때 사용됨
# 모든 호스트 및 scvm에 적용
def insertScvmHost(args):
    return_val = "The ping test failed. Check ablecube hosts and scvms network IPs."
    try:
        if args.json_string is not None:
            # 파라미터로 받아온 json으로 변환
            param_json = json.loads(args.json_string)

            # ping test로 네트워크가 연결되어 있는지 상태 체크하는 부분
            ping_check_list = []
            for p_val1 in param_json:
                ping_check_list.append(p_val1["ablecube"])
                ping_check_list.append(p_val1["scvmMngt"])

            ping_result = json.loads(python3(pluginpath+'/python/vm/host_ping_test.py', '-hns',ping_check_list))

            if ping_result["code"] == 200:
                # 명령 수행이 가능한 상태인지 체크하는 부분
                return_val = "Command execution test failed. Check the ablecube hosts and scvms status."
                
                for p_val2 in param_json:
                    ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', p_val2["ablecube"], "echo ok").strip()
                    if ret != "ok":
                        return createReturn(code=500, val=return_val + " : " + p_val2["ablecube"])

                    ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', p_val2["scvmMngt"], "echo ok").strip()
                    if ret != "ok":
                        return createReturn(code=500, val=return_val + " : " + p_val2["scvmMngt"])
                
                # 원격 ablecube 호스트 및 scvm의 hosts 정보를 수정하는 명령 수행
                return_val = "insertScvmHost Failed to modify cluster_config.py and hosts file."
                for p_val3 in param_json:
                    cmd_str = "python3 /usr/share/cockpit/ablestack/python/cluster/cluster_config.py insert"
                    cmd_str += " -js '" + args.json_string + "'"
                    cmd_str += " -co withScvm"

                    ret = ssh('-o', 'StrictHostKeyChecking=no', p_val3["ablecube"], cmd_str, " -cmi "+args.ccvm_mngt_ip, " -pcl "+args.pcs_cluster_list[0] +" "+ args.pcs_cluster_list[1] +" "+ args.pcs_cluster_list[2])
                    if json.loads(ret)["code"] != 200:
                        return createReturn(code=500, val=return_val + " : " + p_val3["ablecube"])

                #모든 작업이 수행 완료되면 성공결과 return
                return createReturn(code=200, val="Cluster Config insertScvmHost Success")
            else:
                return createReturn(code=500, val=ping_result["val"])
    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val=return_val)

# cluster 구성 준비 메뉴에서 추가 호스트인 경우에 실행됨
# 모든 호스트, ccvm, scvm (클러스터 구성 준비 호스트에서는 제외 : 클러스터 구성 준비 단계에서는 해당 호스트에 scvm이 없는 상태이기 때문에 작업할 수 없음)
def insertAllHost(args):
    return_val = "The ping test failed. Check ablecube hosts and ccvm and scvms network IPs. Please check the config.json file."

    try:
        if args.json_string is not None:
            #hostname = socket.gethostname()

            # 파라미터로 받아온 json으로 변환
            param_json = json.loads(args.json_string)

            # ping test로 네트워크가 연결되어 있는지 상태 체크하는 부분
            ping_check_list = []
            for p_val1 in param_json:
                ping_check_list.append(p_val1["ablecube"])
                if args.exclude_hostname != p_val1["hostname"]:
                    ping_check_list.append(p_val1["scvmMngt"])

            ping_check_list.append(args.ccvm_mngt_ip)
            ping_result = json.loads(python3(pluginpath+'/python/vm/host_ping_test.py', '-hns', ping_check_list))

            if ping_result["code"] == 200:
                # 명령 수행이 가능한 상태인지 체크하는 부분
                return_val = "Command execution test failed. Check the ablecube hosts and ccvm and scvms status. Please check the config.json file or ip"

                for p_val2 in param_json:
                    ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', p_val2["ablecube"], "echo ok").strip()
                    if ret != "ok":
                        return createReturn(code=500, val=return_val + " : " + p_val2["ablecube"])

                    # 호스트 추가시 클러스터 구성단계에서는 scvm이 배포되기 전이므로 해당 scvm에 echo 테스트 명령을 수행할 수 없음
                    if args.exclude_hostname != p_val2["hostname"]:
                        ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', p_val2["scvmMngt"], "echo ok").strip()
                        if ret != "ok":
                            return createReturn(code=500, val=return_val + " : " + p_val2["scvmMngt"])

                ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', args.ccvm_mngt_ip, "echo ok").strip()
                if ret != "ok":
                    return createReturn(code=500, val=return_val + " : " + args.ccvm_mngt_ip)
                
                # 원격 ablecube 호스트 및 scvm의 hosts 정보를 수정하는 명령 수행
                return_val = "insertAllHost Failed to modify cluster_config.py and hosts file."
                for p_val3 in param_json:
                    cmd_str = "python3 /usr/share/cockpit/ablestack/python/cluster/cluster_config.py insert"
                    cmd_str += " -js '" + args.json_string + "'"

                    if args.mngt_nic_cidr is not None:
                        cmd_str += " -mnc "+args.mngt_nic_cidr

                    if args.mngt_nic_gw is not None:
                        cmd_str += " -mng "+args.mngt_nic_gw

                    if args.mngt_nic_dns is not None:
                        cmd_str += " -mnd "+args.mngt_nic_dns
                    
                    if args.exclude_hostname != p_val3["hostname"]:
                        cmd_str += " -co withScvm"
                    else:
                        cmd_str += " -co withCcvm"

                    ret = ssh('-o', 'StrictHostKeyChecking=no', p_val3["ablecube"], cmd_str, " -cmi "+args.ccvm_mngt_ip, " -pcl "+args.pcs_cluster_list[0] +" "+ args.pcs_cluster_list[1] +" "+ args.pcs_cluster_list[2])
                    if json.loads(ret)["code"] != 200:
                        return createReturn(code=500, val=return_val + " : " + p_val3["ablecube"])

                #모든 작업이 수행 완료되면 성공결과 return
                return createReturn(code=200, val="Cluster Config insertAllHost Success")
            else:
                return createReturn(code=500, val=ping_result["val"])
    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val=return_val)

# 호스트명을 파라미터로 받고 해당 호스트 정보를 cluster_config.py에서 삭제하는 함수
def remove(args):
    try:
        # 수정할 cluster.json 파일 읽어오기
        json_data = openClusterJson()
        json_index = 0
        match_yn = False
        for f_val in json_data["clusterConfig"]["hosts"]:
            if f_val["hostname"] == args.remove_hostname:
                match_yn = True
                break
            elif len(json_data["clusterConfig"]["hosts"])-1 > json_index:
                json_index = json_index+1
        
        if match_yn:
            my_hosts = Hosts(path=hosts_file_path)
            # hosts 파일 내용 ip로 제거
            my_hosts.remove_all_matching(address=json_data["clusterConfig"]["hosts"][json_index]["ablecube"])
            my_hosts.remove_all_matching(address=json_data["clusterConfig"]["hosts"][json_index]["scvmMngt"])
            my_hosts.remove_all_matching(address=json_data["clusterConfig"]["hosts"][json_index]["ablecubePn"])
            my_hosts.remove_all_matching(address=json_data["clusterConfig"]["hosts"][json_index]["scvm"])
            my_hosts.remove_all_matching(address=json_data["clusterConfig"]["hosts"][json_index]["scvmCn"])
            # hosts 파일 내용 도메인으로 제거
            my_hosts.remove_all_matching(name=json_data["clusterConfig"]["hosts"][json_index]["hostname"])
            my_hosts.remove_all_matching(name="scvm"+ str(json_index) +"-mngt")
            my_hosts.remove_all_matching(name="ablecube"+ str(json_index) +"-pn")
            my_hosts.remove_all_matching(name="scvm"+ str(json_index))
            my_hosts.remove_all_matching(name="scvm"+ str(json_index) +"-cn")
            my_hosts.write()

            #json_data 삭제
            del(json_data["clusterConfig"]["hosts"][json_index])

        # json 변환 정보 cluster.json 파일 수정
        with open(json_file_path, "w") as outfile:
            outfile.write(json.dumps(json_data, indent=4))

        # hosts 파일 복사 실패시 3번 시도까지 하도록 개선
        result = {}
        for i in [1,2,3]:
            result = json.loads(python3(pluginpath + '/python/cluster/cluster_hosts_setting.py', args.copy_option))
            if result["code"] == 200:
                break

        if result["code"] != 200:
            return createReturn(code=500, val=return_val + " : " + p_val3["ablecube"])
        else:
            return createReturn(code=200, val="Cluster Config remove Success")

    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val="Please check the \"cluster.json\" file. : "+e)

def createHugePageFS():
    if not os.path.exists("/hugepages"):
        os.mkdir("/hugepages")
    with open("/etc/fstab", "r") as f:
        fstab = Fstab().read_file(f)
    flag = False
    for entry in fstab.entries:
        if entry.dir == "/hugepages":
            flag = True
    if flag == False:
        fstab.entries.append(
            Entry(
                "hugetlbfs",
                "/hugepages",
                "hugetlbfs",
                "defaults",
                0,
                0
            )
        )
        formatted = str(fstab)
        with open("/etc/fstab", "w") as f:
            f.write(formatted)
    os.system("mount -a")


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # parser 생성
    parser = createArgumentParser()
    # input 파싱
    args = parser.parse_args()

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')

    createHugePageFS()

    # 실제 로직 부분 호출 및 결과 출력
    if args.action == 'insert':
        ret = insert(args)
        print(ret)
    elif args.action == 'insertScvmHost':
        ret = insertScvmHost(args)
        print(ret)
    elif args.action == 'insertAllHost':
        ret = insertAllHost(args)
        print(ret)
    elif args.action == 'remove':
        ret = remove(args)
        print(ret)
