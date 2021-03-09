import sys
import datetime as dt

x=dt.datetime.now()

xm = str(x.minute)
xs = str(x.microsecond)
type = sys.argv[1]

xx = '/usr/share/cockpit/ablecloud/python/'+xm + xs + type

def pcsStatus():
    f = open(xx,'w')
    f.close

def pcsCallStart():
    f = open(xx,'w')
    f.close

def pcsCallStop():
    f = open(xx,'w')
    f.close

def pcsCallCleanup():
    f = open(xx,'w')
    f.close

def pcsCallMigration():
    f = open(xx,'w')
    f.close

def cloudCenterConnection():
    f = open(xx,'w')
    f.close

if type == 'pcsStart':
    pcsCallStart()
elif type == 'pcsStop':
    pcsCallStop()
elif type == 'pcsCleanup':
    pcsCallCleanup()
elif type == 'pcsMigration':
    pcsCallMigration()
elif type == 'CCConnection':
    cloudCenterConnection()


