import sys
import argparse
import json
import logging

from subprocess import check_output
from ablestack import *


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


def statusDeteil():        
    try:
        
        output = check_output(['cat /usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/ceph_status_sample | grep health'], universal_newlines=True, shell=True)
        cluster_status = output.split(':')[1].strip()
        #print(output)
        
        output = check_output(['cat /usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/ceph_status_sample | grep mon'], universal_newlines=True, shell=True)
        output = output.split(':')[1].strip().split(' daemons, ')
        mon_gw1 = output[0]
        mon_gw2 = output[1]
        #print(mon_gw1)
        #print(mon_gw2)

        output = check_output(['cat /usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/ceph_status_sample | grep mgr'], universal_newlines=True, shell=True)
        mgr = output.split('mgr: ')[1].strip()        
        mgr_cnt = mgr.count('scvm')      
        #print(mgr)

        output = check_output(['cat /usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/ceph_status_sample | grep osd'], universal_newlines=True, shell=True)
        osd = output.split(' ')[3].strip()
        osd_up = output.split(' ')[5].strip()
        #print(osd)
        #print(osd_up)

        output = check_output(['cat /usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/ceph_status_sample | grep pools'], universal_newlines=True, shell=True)
        pools = output.split('pools:  ')[1].strip()   
        #print(pools)

        output = check_output(['cat /usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/ceph_status_sample | grep usage'], universal_newlines=True, shell=True)
        output = output.split('usage:  ')[1].strip().split(' ')
        
        used = output[0] +' '+ output[1]
        available = output[-3] + ' ' + output[-2]
        usage_percentage = round(float(output[0]) / float(output[-3]) * 100.0 , 2)
        usage_percentage = str(usage_percentage) + '%'
        #print(used)
        #print(available)
        #print(usage_percentage)
        







        #output = check_output(['ceph -s'], universal_newlines=True, shell=True)
        



        ################################################임시데이터
        #cluster_status = "HEALTH_WARN"
        #osd =16
        #osd_up = 12
        #mon_gw = 11
        #mgr = "SCVM1"
        #mgr_cnt= "3"
        #pools = 12
        #available = "4.4TB"
        #used = "150GB"
        #usage_percentage = 12
        ################################################
        
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
            'usage_per': usage_percentage }
        ret = createReturn(code=200, val=ret_val, retname='Storage Cluster Status Detail' )

    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Storage Cluster Status Detail')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))
    




if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    ##print(args);
    if args.action == 'detail':        
        ret = statusDeteil()
    
    #print(ret)
    

