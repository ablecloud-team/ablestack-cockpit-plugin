#!/usr/bin/python3
# -*- coding: utf-8 -*-

from pacemaker import *
from ablestack import *
import sys

def main():
    pcs = Pacemaker()
    args = parseArgs()

    if (args.action) == 'config':
        pcs.configCluster(args.cluster, args.hosts)
    elif (args.action) == 'create':
        pcs.createResource(args.resource, args.xml)
    elif (args.action) == 'enable':
        pcs.enableResource(args.resource)
    elif (args.action) == 'disable':
        pcs.disableResource(args.resource)
    elif (args.action) == 'move':
        pcs.moveResource(args.resource, args.target)
    elif (args.action) == 'cleanup':
        pcs.cleanupResource(args.resource)
    elif (args.action) == 'remove':
        pcs.removeResource(args.resource)       
    elif (args.action) == 'status':
        pcs.statusResource(args.resource)


if __name__ == "__main__":
    main()