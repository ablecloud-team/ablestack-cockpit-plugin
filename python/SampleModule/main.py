#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import logging

from Ablestack import *


def createArgumentParser():
    """
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수

    :return: argparse.ArgumentParser
    """
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    tmp_parser = argparse.ArgumentParser(description='OSD를 제어하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('action', choices=['start', 'stop', 'status'], help="osd action")

    # 대상 추가(동작의 타겟이 되는 객체 목록전달)
    tmp_parser.add_argument("list_osd", metavar='osds', type=str, nargs='+', help="select osds to control")

    # key: value 추가(단일값)
    tmp_parser.add_argument("-k", "--key", metavar='Value', help="input Value to key", required=True)

    # key: value 추가(배열)
    tmp_parser.add_argument("-kl", "--key-list", metavar='Value', action='append', help="input Value to key")

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    tmp_parser.add_argument("-v", "--verbose", action='count', default=0,
                            help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    tmp_parser.add_argument("-H", "--Human", action='store_const',
                            dest='flag_readerble', const=True,
                            help="Human readable")

    # Version 추가
    tmp_parser.add_argument("-V", "--Version", action='version',
                            version="%(prog)s 1.0")
    return tmp_parser


# Sample
def doSampleAction(action, H=False):

    if action == 'start':
        value = 'start'
    elif action == 'stop':
        value = 'stop'
    elif action == 'restart':
        value = 'restart'
    else:
        value = 'status'
    action_ret = createReturn('testaction', value, 200)
    if H:
        return json.dumps(json.loads(action_ret), indent=4)    # 단순히 indent만 새로함.
    else:
        return action_ret


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # parser 생성
    parser = createArgumentParser()
    # input 파싱
    args = parser.parse_args()
    # 파싱된 argument 출력
    # print(args)

    verbose = (5 - args.verbose) * 10
    # verbose 레벨은 -v의 숫자에 따라 달라진다.
    # vvvv verbose = logging.DEBUG       1
    # vvv  verbose = logging.INFO        2
    # vv   verbose = logging.WARNING     3
    # v    verbose = logging.ERROR       4
    #      verbose = logging.CRITICAL    5

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(loggername="SampleModule", verbosity=verbose, log_file="log.txt",
                          file_log_level=logging.ERROR)
    # logger.debug("debug")  # 디버깅 레벨에서만 출력
    # logger.info("info")  # info 레벨에서만 출력
    # logger.warning("warning")  # 경로 레벨에서만 출력
    # logger.error("error")  # 에러 레벨에서만 출력
    # logger.critical("critical")  # 치명 레벨에서만 출력

    # 실제 로직 부분 호출 및 결과 출
    ret = doSampleAction(args.action, H=args.flag_readerble)
    # logger.critical(ret)
    print(ret)
