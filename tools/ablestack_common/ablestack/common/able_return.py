#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json


def createReturn(retname: str = "",
                 val: object = "",
                 code: int = 500,
                 type_str: str = "") -> str:
    """
    return생성기. 입력된 값을 json형태로 변환해준다.

    :param type_str:
    :param retname: return을 할 함수의 이름
    :param val: return 할 값
    :param code: 상태 코드
    :return: json string
    """
    if type_str == "":
        type_str = str(type(val)).replace('<class \'', '').replace('\'>', '')
    retdic = {
        'code': code,
        'val': val,
        'name': retname,
        'type':type_str
    }
    ret = json.dumps(retdic)
    return ret
