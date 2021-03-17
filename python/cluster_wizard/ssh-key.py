import os
import sys

type = sys.argv[1]


def generateSshkey():
    os.system("ssh-keygen -m PEM -t rsa -b 2048 -f $HOME/.ssh/ablecloud -N '' <<<y 2>&1 >/dev/null")
    print("end")


if type == 'geneSsh':
    generateSshkey()
