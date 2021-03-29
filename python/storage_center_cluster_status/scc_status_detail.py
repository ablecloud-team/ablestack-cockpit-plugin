import sys
import argparse
import json
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
    parser = argparse.ArgumentParser(description='Storage Cluster Status Details',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['detail'])
    
    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")

    # Version 추가
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    return parser.parse_args()

# 함수명 : statusDeteil
# 주요 기능 : 스토리지 클러스트 상태 상세조회
def statusDeteil():     

    ret_val = ''
    cluster_status = ''
    osd = ''
    osd_up = ''
    mon_gw1 = ''
    mon_gw2 = ''
    mgr = ''
    mgr_cnt = ''
    pools = ''
    available = ''
    used = ''
    usage_percentage = ''
    maintenance_status = ''
    output_json = ''

    try:

        rc = call(['ceph -s | grep noout'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
        
        if rc == 0: # found
            maintenance_status = True
        elif rc == 1: # not found
            maintenance_status = False


        rc = call(['ceph -s -f json-pretty'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        
        if rc == 0: # found
            output = check_output(['ceph -s -f json-pretty'], universal_newlines=True, shell=True, env=env)
            output_json = json.loads(output)
            cluster_status= output_json['health']['status']
        else : # not found
            cluster_status= "no signal"

        mon_gw1= output_json['monmap']['num_mons']
        mon_gw2= output_json['quorum_names']

     


        osd= output_json['osdmap']['num_osds']
        osd_up= output_json['osdmap']['num_up_osds']   

        pools= output_json['pgmap']['num_pools']        


        rc = call(['ceph mgr stat'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        
        if rc == 0: # found
            output_mgr = check_output(['ceph mgr stat'], universal_newlines=True, shell=True, env=env)        
            output_mgr = json.loads(output_mgr)
            mgr = output_mgr['active_name'];
            mgr_cnt= int(output_json['mgrmap']['num_standbys']) + 1
        else : # not found
            mgr= "undefine"
            mgr_cnt = "undefine"




        rc = call(['ceph df | grep TOTAL'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        
        if rc == 0: # found
            output = check_output(['ceph df | grep TOTAL'], universal_newlines=True, shell=True, env=env)        
            output = ' '.join(output.split()).split()        
            available = output[3] + " "+ output[4]
            used = output[7] + " "+ output[8]
            usage_percentage = output[9]
        else : # not found
            available= "undefine"
            used = "undefine"
            usage_percentage = "undefine"

        
        
        # 실제 데이터 세팅
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
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))


if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    ##print(args);
    if args.action == 'detail':        
        ret = statusDeteil()
    
    #print(ret)
    

