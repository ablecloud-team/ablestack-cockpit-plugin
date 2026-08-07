#!/usr/bin/python3
import argparse
import re
import sys
import time
import paramiko
import subprocess
import os
import json
import concurrent.futures

from sh import python3
from ablestack import *

json_file_path = pluginpath + "/tools/properties/cluster.json"
def openClusterJson():
    try:
        with open(json_file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='cluster.json read error')


    return ret

json_data = openClusterJson()

def parse_size(size_str):
    # 단위 변환 로직 (t → TB, g → GB, m → MB)
    import re
    match = re.match(r"[<>]?([\d.]+)([a-zA-Z]*)", size_str)
    if match:
        number, unit = match.groups()
        unit_mapping = {"t": "TB", "g": "GB", "m": "MB"}
        unit = unit_mapping.get(unit.lower(), unit)
        return f"{float(number):.2f}{unit}"
    return size_str

def run_command(command, ssh_client=None, ignore_errors=False, suppress_errors=True):
    """Run a shell command and return its output. Suppress or handle errors as specified."""
    try:
        if ssh_client:
            stdin, stdout, stderr = ssh_client.exec_command(command)
            stdout_str = stdout.read().decode()
            stderr_str = stderr.read().decode()

            # Suppress errors if specified
            if stderr_str and not suppress_errors:
                print(f"Error running command: {command}")
                print(stderr_str)
                if not ignore_errors:
                    raise Exception(f"Command failed: {command}")
            return stdout_str

        else:
            process = subprocess.Popen(
                command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
            stdout, stderr = process.communicate()
            stdout_str = stdout.decode()
            stderr_str = stderr.decode()

            # Suppress errors if specified
            if process.returncode and not suppress_errors:
                print(f"Error running command: {command}")
                print(stderr_str)
                if not ignore_errors:
                    raise Exception(f"Command failed: {command}")

            # Return only stdout
            return stdout_str

    except Exception as e:
        if not ignore_errors:
            print(f"Error running command: {command}: {e}")
            raise

def connect_to_host(ip):
    """Establish an SSH connection to the host."""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    private_key_path = os.getenv('SSH_PRIVATE_KEY_PATH', '/root/.ssh/id_rsa')
    ssh.connect(ip, username='root', key_filename=private_key_path, timeout=10, banner_timeout=30, auth_timeout=30)
    return ssh


def create_local_disk(disks):
    try:
        # 디스크마다 물리 볼륨 및 볼륨 그룹 생성
        for disk in disks:
            partition = f"{disk}1"
            vg = "vg_glue"
            lv_glue = "lv_glue"
            fstab_line = f"/dev/{vg}/{lv_glue} /mnt/glue xfs defaults 0 0"

            run_command(f"parted -s {disk} mklabel gpt mkpart primary 0% 100% set 1 lvm on")
            run_command(f"pvcreate {partition} -y")
            run_command(f"vgcreate {vg} {partition}")
            run_command(f"lvcreate -n {lv_glue} {vg} -l +100%FREE -y")
            run_command("mkdir -p /mnt/glue")
            run_command(f"mkfs.xfs -K /dev/{vg}/{lv_glue}")
            run_command(f"printf '\\n{fstab_line}\\n' >> /etc/fstab")
            run_command("systemctl daemon-reload")
            run_command("mount -a")

        # 성공 응답 반환
        ret = createReturn(code=200, val="Create Local Disk Success")
        return print(json.dumps(json.loads(ret), indent=4))

    except Exception as e:
        # 에러 발생 시 실패 응답 반환
        ret = createReturn(code=500, val=f"Create Local Disk Failure: {str(e)}")
        return print(json.dumps(json.loads(ret), indent=4))

def local_disk_status():
    try:
        output = run_command("mount | grep -w '/mnt/glue'")
        if output:
            mount_path = output.strip().split()[2]
            status = "Health OK"
            code = 200
            pv = run_command("pvs | grep -w vg_glue | awk '{print $1}'").strip()
            vg = run_command("ls -al /dev/mapper/*vg_glue* | awk '{print $9}'").strip()
            size = run_command("lsblk | grep -w glue | awk '{print $4}'").strip()
        else:
            mount_path = "N/A"
            status = "Health Err"
            pv = "N/A"
            vg = "N/A"
            size = "N/A"
            code = 500  # 마운트 안 되어 있으면 실패 처리

        result = {
            "status" : status,
            "mount_path": mount_path,
            "pv" : pv,
            "vg" : vg,
            "size" : size
        }

        ret = createReturn(code=code, val=result)
        return print(json.dumps(json.loads(ret), indent=4))  # indent=4 적용

    except Exception as e:
        ret = createReturn(code=500, val=f"Failed Local Disk Check: {str(e)}")
        return print(json.dumps(json.loads(ret), indent=4))

def reset():
    try:
        vg_name_check = os.popen("pvs --noheadings -o vg_name 2>/dev/null | grep 'vg_glue' | uniq").read().strip().splitlines()
        if vg_name_check:
            disk_list = os.popen("pvs --noheadings -o pv_name,vg_name 2>/dev/null | grep 'vg_glue' | awk '{print $1}' | sed 's/[0-9]*$//'").read().strip().split("\n")
            disk = ",".join(disk_list)
            partition = f"{disk}1"
            run_command(f"umount -fl /mnt/glue",ignore_errors=True)
            run_command(f"lvremove -f /dev/vg_glue/lv_glue",ignore_errors=True)
            run_command(f"vgremove vg_glue",ignore_errors=True)
            run_command(f"pvremove -f {partition}",ignore_errors=True)
            run_command(f"echo -e 'd\nw\n' | fdisk {disk} >/dev/null 2>&1", ignore_errors=True)
            run_command(r"sed -i '/\/dev\/vg_glue/d; /^\s*$/d' /etc/fstab")

            subprocess.run(
            [
                'python3',
                f'{pluginpath}/python/ablestack_json/ablestackJson.py',
                'update',
                '--depth1', 'bootstrap',
                '--depth2', 'local_configure',
                '--value', 'false'
            ],
            check=True,
            stdout=subprocess.DEVNULL,  # 표준 출력 숨기기
            stderr=subprocess.DEVNULL   # 표준 오류 숨기기
            )

        ret = createReturn(code=200, val="Success Reset Local Disk")
        return print(json.dumps(json.loads(ret), indent=4))  # indent=4 적용

    except Exception as e:
        ret = createReturn(code=500, val=f"Failed Local Disk Check: {str(e)}")
        return print(json.dumps(json.loads(ret), indent=4))

def main():
    parser = argparse.ArgumentParser(description="Cluster configuration script")

    parser.add_argument('--create-local-disk', action='store_true', help='Flag to create Local Disk.')
    parser.add_argument('--disks', type=str, help='Comma-separated list of disk devices (e.g., /dev/sdb,/dev/sdc)')
    parser.add_argument('--local-disk-status', action='store_true', help='Check Local Disk status')
    parser.add_argument('--reset', action='store_true', help='Reset Local Disk')

    args = parser.parse_args()

    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)

    if args.create_local_disk:
        if not all([args.disks]):
            print("Please provide both '--disks' when using '--create-local-disk'.")
            parser.print_help()
        else:
            disks = args.disks.split(',')
            create_local_disk(disks)

    if args.local_disk_status:
        local_disk_status()

    if args.reset:
        reset()

if __name__ == "__main__":
    main()
