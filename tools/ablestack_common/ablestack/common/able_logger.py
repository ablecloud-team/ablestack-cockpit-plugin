#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import logging.handlers
import os
import sys


def createLogger(loggername: str = f"{os.path.basename(sys.argv[0])}",
                 log_file: str = f"/var/log/{os.path.basename(sys.argv[0])}.log",
                 verbosity: int = logging.CRITICAL,
                 file_log_level: int = logging.DEBUG) -> logging.Logger:
    """
    로깅을 위한 Logger를 생성하는 함수, 웬만하면 default 그대로 써도 된다.

    :param loggername: 로그의 이름(default: f"{os.path.basename(sys.argv[0])}")
    :param log_file: 로그 파일 경로(default: f"/var/log/{os.path.basename(sys.argv[0])}.log")
    :param verbosity: 화면 출력 로그의 레벨(default: logging.CRITICAL)
    :param file_log_level: 파일 출력 로그의 레벨(default: logging.DEBUG)
    :return: logging.Logger

    """
    # 참조: https://greeksharifa.github.io/파이썬/2019/12/13/logging/
    # 로그레벨
    # 수준       숫자 값     의
    # CRITICAL   50         작동이 불가능한 수준의 심각한 에러가 발생함을 알림
    # ERROR      40         중대한 문제로 인해 소프트웨어가 몇몇 기능들을 수행하지 못함을 알림
    # WARNING    30         소프트웨어가 작동은 하고 있지만, 예상치 못한 일이 발생했거나 할 것으로 예측된다는 것을 알림
    # INFO       20         계획대로 작동하고 있음을 알리는 확인 메시지
    # DEBUG      10         간단히 문제를 진단하고 싶을 때 필요한 자세한 정보를 기록함
    # NOTSET     0          미설정(DEBUG)
    logger = logging.getLogger(loggername)
    logger.setLevel(logging.DEBUG)
    stream_handler = logging.StreamHandler()
    file_handler = logging.handlers.WatchedFileHandler(filename=log_file)

    # formatter 객체 생성
    formatter = logging.Formatter(fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # handler에 level 설정
    stream_handler.setLevel(verbosity)      # 화면 출력 레벨
    file_handler.setLevel(file_log_level)   # 파일 출력 레벨

    # handler에 format 설정
    stream_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    logger.addHandler(stream_handler)
    logger.addHandler(file_handler)
    return logger
