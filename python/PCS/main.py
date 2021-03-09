from pacemaker import *

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
            pcs.statusResource(args.resource)
        except Exception as e:
            print(e)
    else:
        print('??????')



if __name__ == "__main__":
    main()