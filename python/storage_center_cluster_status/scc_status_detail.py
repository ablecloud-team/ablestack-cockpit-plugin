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
        #res_output = check_output(['ceph', '-s'], universal_newlines=True)
    

        
        ################################################임시데이터
        cluster_status = "HEALTH_WARN"
        osd =16
        osd_up = 12
        mgr = "SCVM1"
        mgr_cnt= "3"
        pools = 12
        available = "4.4TB"
        used = "150GB"
        usage_percentage = 12
        ################################################
        
        # 실제 데이터 세팅
        ret_val = {
            'cluster_status': cluster_status, 
            'osd': osd, 
            'osd_up': osd_up, 
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
    

