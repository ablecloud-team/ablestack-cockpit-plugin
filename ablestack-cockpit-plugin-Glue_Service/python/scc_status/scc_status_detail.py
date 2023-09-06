# Copyright (c) 2021 ABLECLOUD Co. Ltd

# 스토리지 클러스터상태 상세조회를 위한 파일입니다.
# 최초 작성일 : 2021. 03. 19

import sys
import argparse
import logging
import os
import json
import subprocess
from subprocess import check_output
from subprocess import call
from ablestack import *

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"

'''
함수명 : parseArgs
이 함수는 python library argparse를 시용하여 함수를 실행될 때 필요한 파라미터를 입력받고 파싱하는 역할을 수행합니다.
예를들어 action을 요청하면 해당 action일 때 요구되는 파라미터를 입력받고 해당 코드를 수행합니다.
'''
def parseArgs():
    parser = argparse.ArgumentParser(description='Storage Cluster Status Details', epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    ''' action값 확인'''
    parser.add_argument('action', choices=['detail'])    
    ''' output 민감도 추가(v갯수에 따라 output및 log가 많아짐) '''
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    ''' flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할) '''
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    ''' Version 추가 '''
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    return parser.parse_args()

'''
함수명 : statusDetail
주요 기능 : 스토리지 클러스트 상태 상세조회
'''
def statusDetail(): 
    ret_val = 'N/A'
    cluster_status = 'HEALTH_ERR'
    osd = 'N/A'
    osd_up = 'N/A'
    mon_gw1 = 'N/A'
    mon_gw2 = 'N/A'
    mgr = 'N/A'
    mgr_cnt = 'N/A'
    pools = 'N/A'
    available = 'N/A'
    used = 'N/A'
    usage_percentage = 'N/A'
    maintenance_status = False
    output_json = 'N/A'

    try:
        ''' 클러스터 유지보수모드인지 체크 리턴값이 0 이면 true, 1이면 false값 세팅 '''
        rc = call(['ceph -s | grep noout'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
        if rc == 0:
            maintenance_status = True
        elif rc == 1:
            maintenance_status = False

        ''' 클러스터 상태 체크 리턴값이 0 이면 정상, 아니면 클러스터 세팅이 안된것으로 확인(HEALTH_ERR) '''
        rc = call(['ceph -s -f json-pretty'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0:
            ''' ceph -s시 출력값을 json으로 리턴 '''
            output = check_output(['ceph -s -f json-pretty'], universal_newlines=True, shell=True, env=env)
            output_json = json.loads(output)
            '''스토리지 클러스터 상태'''
            cluster_status= output_json['health']['status']
            '''mon 갯수'''
            mon_gw1= output_json['monmap']['num_mons']
            '''mon quorum list'''
            mon_gw2= output_json['quorum_names']
            '''디스크 갯수'''
            osd= output_json['osdmap']['num_osds']
            '''작동중 디스크 갯수'''
            osd_up= output_json['osdmap']['num_up_osds']
            '''풀 갯수'''
            pools= output_json['pgmap']['num_pools']
        else :
            cluster_status= "HEALTH_ERR"
            mon_gw1 = "N/A"
            mon_gw2 = "N/A"
            osd=  "N/A"
            osd_up = "N/A"
            pools = "N/A"

        ''' 클러스터 MGR Daemon값 체크 0 이면 정상, 아니면 N/A '''
        rc = call(['ceph mgr stat'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0:
            '''MGR deamon 상태값 조회'''
            output_mgr = check_output(['ceph mgr stat'], universal_newlines=True, shell=True, env=env)        
            output_mgr = json.loads(output_mgr)
            '''관리 데몬 호스트'''
            mgr = output_mgr['active_name'];
            if mgr == "" :
                active_mgr_cnt = 0;
                mgr= "N/A"
            else :
                active_mgr_cnt = 1;

            '''관리 데몬 전체 갯수'''
            mgr_cnt= active_mgr_cnt + int(output_json['mgrmap']['num_standbys'])
        else : 
            mgr= "N/A"
            mgr_cnt = "N/A"

        '''클러스터 디스크용량 체크 0 이면 정상, 아니면 N/A '''
        rc = call(['ceph df | grep TOTAL'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0:
            '''클러스터 디스크 사용가능 용량, 사용량, 사용량 % 확인'''
            output = check_output(['ceph df | grep TOTAL'], universal_newlines=True, shell=True, env=env)        
            output = ' '.join(output.split()).split()        
            available = output[3] + " "+ output[4]
            used = output[7] + " "+ output[8]
            usage_percentage = output[9]
        else :
            available= "N/A"
            used = "N/A"
            usage_percentage = "N/A"
        ret_val = {
            'cluster_status': cluster_status, 
            'osd': osd, 
            'osd_up': osd_up, 
            'mon_gw1' : mon_gw1,
            'mon_gw2' : mon_gw2,
            'mgr': mgr,            
            'mgr_cnt': mgr_cnt,
            'pools': pools,
            'avail': available,
            'used': used,
            'usage_percentage': usage_percentage, 
            'maintenance_status': maintenance_status,
            'json_raw' : output_json}
        ret = createReturn(code=200, val=ret_val, retname='Storage Cluster Status Detail')
    except Exception as e:
        ret_val = {
            'cluster_status': cluster_status, 
            'osd': osd, 
            'osd_up': osd_up, 
            'mon_gw1' : mon_gw1,
            'mon_gw2' : mon_gw2,
            'mgr': mgr,            
            'mgr_cnt': mgr_cnt,
            'pools': pools,
            'avail': available,
            'used': used,
            'usage_percentage': usage_percentage, 
            'maintenance_status': maintenance_status,
            'json_raw' : output_json}
        ret = createReturn(code=500, val=ret_val, retname='Storage Cluster Status Detail')        
    return print(json.dumps(json.loads(ret), indent=4))

if __name__ == '__main__':
    '''parser 생성'''
    args = parseArgs()    
    if args.action == 'detail':        
        statusDetail()    
    '''print(ret)'''