#!/usr/bin/python3
#-*- coding: utf-8 -*-

from python.PCS.pacemaker import *
from python.PCS.able_return import *

def main():
    pcs = Pacemaker()
    args = parseArgs()

    if (args.action) == 'config':
        try:
            pcs.configCluster(args.cluster, args.hosts)
        except Exception as e:
            print(e)
    elif (args.action) == 'create':
        try:
            pcs.createResource(args.resource, args.xml)
        except Exception as e:
            print(e)
    elif (args.action) == 'enable':
        try:
            pcs.enableResource(args.resource)
        except Exception as e:
            print(e)
    elif (args.action) == 'disable':
        try:
            pcs.disableResource(args.resource)
        except Exception as e:
            print(e)
    elif (args.action) == 'move':
        try:
            pcs.moveResource(args.resource, args.target)
        except Exception as e:
            print(e)
    elif (args.action) == 'cleanup':
        try:
            pcs.cleanupResource(args.resource)
        except Exception as e:
            print(e)
    elif (args.action) == 'status':
        try:
            pcs.statusResource()
        except Exception as e:
            print(e)
    else:
        print('no match actions')
        sys.exit(0)



if __name__ == "__main__":
    main()