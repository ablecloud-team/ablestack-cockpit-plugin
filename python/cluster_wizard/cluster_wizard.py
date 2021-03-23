##!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * File Name : create-address.py
 * Date Created : 2021.03.12
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 사용되는 기능 스크립트
"""

import sys
import os

type = sys.argv[1]


def generateSshkey():
    os.system("ssh-keygen -t rsa -b 2048 -f $HOME/.ssh/ablecloud -N '' <<<y 2>&1 >/dev/null")
    print("end")


def makePri():
    os.system("touch $HOME/.ssh/ablecloud")
    print("end")


def makePub():
    os.system("touch $HOME/.ssh/ablecloud.pub")
    print("end")


def makeHosts():
    os.system("touch /etc/hosts")
    print("end")


if type == 'geneSsh':
    generateSshkey()
elif type == 'makePri':
    makePri()
elif type == 'makePub':
    makePub()
elif type == 'makeHosts':
    makeHosts()
