#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#참조: https://packaging.python.org/guides/distributing-packages-using-setuptools/

from setuptools import setup, find_packages
import datetime
now = datetime.datetime.now()
setup(
    name                = 'ablestack-common',
    version             = f'0.1.{now.strftime("post%Y%m%d.dev%H")}',
    description         = 'Ablestack common library',
    author              = 'ycyun<ycyun@ycyun.xyz>',
    author_email        = 'ycyun@ycyun.xyz',
    url                 = 'https://github.com/ablecloud-team/cockpit-plugin-ablestack',
    download_url        = 'https://github.com/ablecloud-team/cockpit-plugin-ablestack',
    project_urls={
        'Documentation': 'https://github.com/ablecloud-team/cockpit-plugin-ablestack/wiki',
        'Source': 'https://github.com/ablecloud-team/cockpit-plugin-ablestack',
        'Tracker': 'https://github.com/ablecloud-team/cockpit-plugin-ablestack/issues',
    },
    install_requires    =  [],
    packages            = find_packages(exclude = []),
    long_description    = open('README.md').read(),
    long_description_content_type="text/markdown",
    keywords            = ['ablestack'],
    python_requires     = '>=3.6',
    package_data        = {},
    zip_safe            = False,
    classifiers         = [
        'Development Status :: 3 - Alpha',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Topic :: Utilities',
        'Natural Language :: Korean',
        'Operating System :: POSIX',
    ],
    entry_points={
        'console_scripts': [
            #'sample=sample:main',  sample이라는 이름으로 sample.py의 main 함수를 호출하는 시스템 명령어 생성하
        ],
    },
)