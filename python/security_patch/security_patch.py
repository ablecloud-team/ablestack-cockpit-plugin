#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
cluster.json을 읽어 ccvm / ablecube / scvm 대상에 보안 패치를 적용합니다.
ablecube는 Cockpit 플러그인에 포함된 최신 스크립트를 사용하고,
scvm/ccvm은 cloud-init으로 배포된 /usr/local/sbin 스크립트를 사용합니다.

- 입력 파라미터는 argparse로 받되, 모든 진행 로그는 표준출력에 찍지 않습니다.
- 마지막에만 createReturn(...)을 통해 JSON으로 결과를 반환합니다.
- 원격 스크립트 stdout에 'Permissions have been updated.'가 나올 때까지
  각 대상별로 최대 3회까지 자동 재시도합니다(추가 입력 불필요).
- -C 플래그는 clusterConfig.type 이 'ablestack-hci'일 때에만 로컬 대상에서 true, 그 외에는 모두 false입니다.
- --add-host일 때:
  - 일반 클러스터: 로컬 호스트만 security_patch.sh 실행
  - ablestack-hci: 로컬 + scvm 호스트에 대해 security_patch.sh 실행
- --port-change일 때:
  - security_patch.sh 호출 시 마지막에 --port-change 플래그를 함께 전달합니다.
- --update-json-file일 때:
  - security_patch.status=true 업데이트만 수행하고, security_patch.sh는 실행하지 않습니다.
- --ceph-ssh-change일 때:
  - security_patch.sh --ceph-ssh-change 를 로컬에서 한 번만 실행합니다(ssh 사용 안 함).
"""

import argparse
import socket
import json
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Set, Optional
from ipaddress import ip_address

# ===================[ 고정 파라미터 ]=================== #
MAX_RETRIES = 3
RETRY_DELAY_SEC = 2.0
SUCCESS_PATTERN = "Permissions have been updated."
DEFAULT_JSON = "/usr/share/cockpit/ablestack/tools/properties/cluster.json"
ABLECUBE_SECURITY_PATCH = (
    "/usr/share/cockpit/ablestack/shell/host/security_patch.sh"
)
VM_SECURITY_PATCH = "/usr/local/sbin/security_patch.sh"

# ===================[ 공용 유틸(더미) ]================== #
# 실제 환경의 createReturn을 임포트하여 사용하세요.
def createReturn(code, val, retname=None):
    obj = {"code": code, "val": val}
    if retname is not None:
        obj["retname"] = retname
    return json.dumps(obj, ensure_ascii=False)

# ===================[ 인자 파서 ]======================= #
def parse_args() -> argparse.Namespace:

    parser = argparse.ArgumentParser(description="Run security_patch.sh over SSH by reading cluster.json")

    parser.add_argument("-j", "--json", default=DEFAULT_JSON, help="cluster.json 경로입니다")
    parser.add_argument("-P", "--new-port", type=int, help="변경할 SSH 포트(1~65535), 미지정 시 -P 없이 실행합니다")
    parser.add_argument("-t", "--targets", nargs="+", choices=["ccvm", "ablecube", "scvm", "all"], default=["all"], help="대상 종류(ccvm, ablecube, scvm, all)")
    parser.add_argument("--ssh-user", default="root", help="SSH 접속 계정(기본: root)")
    parser.add_argument("--ssh-port", type=int, default=22, help="현재 접속에 사용할 SSH 포트(기본: 22)")
    parser.add_argument("--dry-run", action="store_true", help="실행하지 않고 전송 명령만 결과에 담습니다")
    parser.add_argument("--retname", default="Security Update", help="createReturn에 사용할 retname 값")
    parser.add_argument("--add-host", action="store_true", help="추가 호스트용: 로컬(ablestack-hci일 경우 scvm 포함)에만 security_patch.sh를 실행합니다")
    parser.add_argument("--port-change", action="store_true", help="security_patch.sh 호출 시 --port-change 플래그를 함께 전달합니다")
    parser.add_argument("--update-json-file", action="store_true", help="security_patch.status 를 true 로 업데이트만 수행합니다(security_patch.sh 실행 안 함)")
    parser.add_argument("--local", action="store_true", help="--update-json-file 사용 시, ssh 대신 현재 호스트에서만 JSON 업데이트를 수행합니다")
    parser.add_argument("--ceph-ssh-change", action="store_true", help="security_patch.sh --ceph-ssh-change 를 로컬에서 한 번만 실행합니다")

    return parser.parse_args()


# ===================[ JSON 로드/타겟 수집 ]============= #
def load_cluster(json_path: str) -> Dict:
    p = Path(json_path)
    if not p.exists():
        raise FileNotFoundError(f"JSON not found: {json_path}")
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON parse error: {e}")

def gather_targets(conf: Dict, kinds: List[str]) -> List[str]:
    """요청된 종류에 따라 ccvm / ablecube / scvm IP를 수집한 뒤 중복 제거 및 IP 정렬을 수행합니다."""
    want_all = "all" in kinds
    out: Set[str] = set()
    root = conf.get("clusterConfig", {})

    hosts = root.get("hosts") or []
    if want_all or "ablecube" in kinds:
        for h in hosts:
            ip = (h.get("ablecube") or "").strip()
            if ip:
                out.add(ip)

    if want_all or "scvm" in kinds:
        for h in hosts:
            ip = (h.get("scvm") or "").strip()
            if ip:
                out.add(ip)

    if want_all or "ccvm" in kinds:
        ip = ((root.get("ccvm") or {}).get("ip") or "").strip()
        if ip:
            out.add(ip)

    return sorted(out, key=ip_address)

def gather_ablecube_targets(conf: Dict) -> Set[str]:
    """clusterConfig.hosts[].ablecube 대상 주소를 반환합니다."""
    hosts = (conf.get("clusterConfig") or {}).get("hosts") or []
    return {
        str(host.get("ablecube") or "").strip()
        for host in hosts
        if str(host.get("ablecube") or "").strip()
    }

def extract_cluster_type(conf: Dict) -> str:
    """clusterConfig.type 값을 소문자로 정규화하여 반환합니다(없으면 빈 문자열)."""
    return ((conf.get("clusterConfig") or {}).get("type") or "").strip().lower()

def host_list(conf: Dict) -> str:
    """cluster.json의 hosts 목록을 문자열로 반환합니다."""
    hosts = conf.get("clusterConfig", {}).get("hosts") or []
    return ", ".join([str(h) for h in hosts])

# ===================[ pluginpath 계산 및 상태 업데이트 ]============= #
def compute_plugin_path(json_path: str) -> str:
    """
    cluster.json 위치를 기준으로 기본 plugin 경로를 추정합니다.
    예) /usr/share/cockpit/ablestack/tools/properties/cluster.json
        -> /usr/share/cockpit/ablestack
    """
    p = Path(json_path).resolve()
    try:
        return str(p.parents[2])
    except IndexError:
        return str(p.parent)

def update_security_patch_status(conf: Dict, plugin_path: str, host_stat: str) -> None:
    """
    cluster.json의 hosts[].ablecube 모두에 대해
    security_patch.status = true 로 업데이트하는 원격 명령을 수행합니다.

    - 표준출력에는 아무것도 남기지 않기 위해 stdout/stderr 를 DEVNULL로 버립니다.
    - 실패 시 subprocess.CalledProcessError 예외가 발생하며, 상위에서 처리합니다.
    """
    if host_stat == "local":
        subprocess.run(
            [
                "python3",
                f"{plugin_path}/python/ablestack_json/ablestackJson.py",
                "update",
                "--depth1", "security_patch",
                "--depth2", "status",
                "--value", "true"
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    else:
        hosts = (conf.get("clusterConfig") or {}).get("hosts") or []
        for host_conf in hosts:
            host = (host_conf.get("ablecube") or "").strip()
            if not host:
                continue

            subprocess.run(
                [
                    "ssh",
                    "-o", "StrictHostKeyChecking=no",
                    host,
                    "python3",
                    f"{plugin_path}/python/ablestack_json/ablestackJson.py",
                    "update",
                    "--depth1", "security_patch",
                    "--depth2", "status",
                    "--value", "true"
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

# ===================[ 유효성/로컬 IP 수집 ]============= #
def check_port_range(port: Optional[int]) -> None:
    """포트가 지정된 경우에만 유효성 검사를 수행합니다."""
    if port is None:
        return
    if not (1 <= port <= 65535):
        raise ValueError(f"invalid port: {port}")

def get_local_ipv4s() -> Set[str]:
    """
    로컬 호스트의 IPv4 주소 집합을 최대한 정확히 수집합니다.
    - 우선 'ip -o -4 addr show'를 시도하고, 실패 시 gethostbyname(hostname)으로 폴백합니다.
    - 루프백 127.0.0.1은 항상 포함합니다.
    """
    addrs: Set[str] = set()
    try:
        proc = subprocess.run(
            ["/usr/sbin/ip", "-o", "-4", "addr", "show"],
            capture_output=True,
            text=True,
            check=False
        )
        if proc.returncode == 0 and proc.stdout:
            for line in proc.stdout.splitlines():
                parts = line.split()
                # 형식: <idx>: <ifname> ... inet <IP/CIDR> ...
                if "inet" in parts:
                    i = parts.index("inet")
                    if i + 1 < len(parts):
                        ip_cidr = parts[i + 1]
                        ip_only = ip_cidr.split("/")[0]
                        addrs.add(ip_only)
    except Exception:
        pass

    try:
        hn = socket.gethostname()
        addrs.add(socket.gethostbyname(hn))
    except Exception:
        pass

    addrs.add("127.0.0.1")
    return addrs

# ===================[ 원격/로컬 명령 구성/실행 ]============= #
def build_remote_cmd(
    is_local: bool,
    new_port: Optional[int],
    cluster_type: str,
    port_change: bool = False,
    script_path: str = VM_SECURITY_PATCH,
) -> str:
    """
    security_patch.sh 호출 문자열을 생성합니다.
    - cluster_type이 'ablestack-hci'일 때에만 로컬 대상에 한해 -C true, 그 외에는 모두 -C false 입니다.
    - new_port가 None이면 -P 없이 실행합니다.
    - port_change=True이면 마지막에 '--port-change'를 추가합니다.
    """
    base = script_path

    if new_port is None:
        cmd = f"{base}"
    else:
        cmd = f"{base} -P {new_port}"

    if port_change:
        cmd = f"{cmd} --port-change"

    return cmd

def run_remote(
    ip: str,
    user: str,
    connect_port: int,
    new_port: Optional[int],
    dry_run: bool,
    cluster_type: str,
    port_change: bool,
    script_path: str = VM_SECURITY_PATCH,
) -> Dict:
    """
    원격에서 security_patch.sh를 수행하고 결과를 사전으로 반환합니다.
    - stdout에 SUCCESS_PATTERN이 나타날 때까지 최대 MAX_RETRIES회 재시도합니다.
    - dry_run=True이면 실제 실행 없이 명령어만 반환합니다.
    """
    remote = f"{user}@{ip}"

    local_ips = get_local_ipv4s()
    is_local = ip in local_ips

    remote_cmd = build_remote_cmd(
        is_local=is_local,
        new_port=new_port,
        cluster_type=cluster_type,
        port_change=port_change,
        script_path=script_path,
    )

    ssh_cmd = [
        "/usr/bin/ssh",
        "-o", "StrictHostKeyChecking=no",
        "-o", "BatchMode=yes",
        "-o", "ConnectTimeout=10",
        "-p", str(connect_port),
        remote,
        remote_cmd,
    ]

    if dry_run:
        return {
            "ip": ip,
            "connectPort": connect_port,
            "changeTo": new_port,
            "ok": True,
            "rc": 0,
            "stdout": "",
            "stderr": "",
            "dryRunCmd": " ".join(ssh_cmd),
            "retriesPlanned": MAX_RETRIES,
            "retryDelaySec": RETRY_DELAY_SEC,
            "successPattern": SUCCESS_PATTERN,
            "scriptPath": script_path,
            "clusterType": cluster_type
        }

    last_rc = 1
    last_stdout = ""
    last_stderr = ""
    attempts = 0
    success_attempt: Optional[int] = None

    while attempts < MAX_RETRIES:
        attempts += 1
        try:
            proc = subprocess.run(
                ssh_cmd,
                capture_output=True,
                text=True,
                check=False
            )
            last_rc = proc.returncode
            last_stdout = (proc.stdout or "").strip()
            last_stderr = (proc.stderr or "").strip()

            # 성공 기준: 종료코드 0 또는 stdout에 SUCCESS_PATTERN 포함
            if last_rc == 0 or (SUCCESS_PATTERN in last_stdout):
                success_attempt = attempts
                break

            if attempts < MAX_RETRIES:
                time.sleep(RETRY_DELAY_SEC)

        except FileNotFoundError:
            last_rc = 127
            last_stdout = ""
            last_stderr = "ssh binary not found"
            break
        except Exception as e:
            last_rc = 1
            last_stdout = ""
            last_stderr = f"unexpected error: {e}"
            break

    return {
        "ip": ip,
        "connectPort": connect_port,
        "changeTo": new_port,
        "ok": success_attempt is not None,
        "rc": last_rc,
        "stderr": last_stderr,
        "attempts": attempts,
        "successAttempt": success_attempt,
        "successPattern": SUCCESS_PATTERN,
        "scriptPath": script_path,
        "clusterType": cluster_type
    }

def run_local_patch(
    new_port: Optional[int],
    dry_run: bool,
    cluster_type: str,
    port_change: bool,
    ceph_ssh_change: bool = False,
    script_path: str = ABLECUBE_SECURITY_PATCH,
) -> Dict:
    """
    로컬 호스트에서 security_patch.sh를 수행합니다.
    - SSH 사용 없이 지정된 ablecube 스크립트를 직접 호출합니다.
    - stdout에 SUCCESS_PATTERN이 나타날 때까지 최대 MAX_RETRIES회 재시도합니다.
    - dry_run=True이면 실제 실행 없이 명령어만 반환합니다.
    - ceph_ssh_change=True 이면 명령에 '--ceph-ssh-change' 를 추가합니다.
    """

    cmd: List[str] = [script_path]
    if new_port is not None:
        cmd.extend(["-P", str(new_port)])
    if port_change:
        cmd.append("--port-change")
    if ceph_ssh_change:
        cmd.append("--ceph-ssh-change")

    if dry_run:
        return {
            "ip": "127.0.0.1",
            "connectPort": None,
            "changeTo": new_port,
            "ok": True,
            "rc": 0,
            "stdout": "",
            "stderr": "",
            "dryRunCmd": " ".join(cmd),
            "retriesPlanned": MAX_RETRIES,
            "retryDelaySec": RETRY_DELAY_SEC,
            "successPattern": SUCCESS_PATTERN,
            "scriptPath": script_path,
            "clusterType": cluster_type
        }

    last_rc = 1
    last_stdout = ""
    last_stderr = ""
    attempts = 0
    success_attempt: Optional[int] = None

    while attempts < MAX_RETRIES:
        attempts += 1
        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )
            last_rc = proc.returncode
            last_stdout = (proc.stdout or "").strip()
            last_stderr = (proc.stderr or "").strip()

            # 성공 기준: 종료코드 0 + stdout에 SUCCESS_PATTERN 포함
            if last_rc == 0 and (SUCCESS_PATTERN in last_stdout):
                success_attempt = attempts
                break

            if attempts < MAX_RETRIES:
                time.sleep(RETRY_DELAY_SEC)

        except FileNotFoundError:
            last_rc = 127
            last_stdout = ""
            last_stderr = "security_patch.sh not found"
            break
        except Exception as e:
            last_rc = 1
            last_stdout = ""
            last_stderr = f"unexpected error: {e}"
            break

    return {
        "ip": "127.0.0.1",
        "connectPort": None,
        "changeTo": new_port,
        "ok": success_attempt is not None,
        "rc": last_rc,
        "stderr": last_stderr,
        "attempts": attempts,
        "successAttempt": success_attempt,
        "successPattern": SUCCESS_PATTERN,
        "scriptPath": script_path,
        "clusterType": cluster_type
    }

# ===================[ 메인 ]=========================== #
def main():
    args = parse_args()
    try:
        # --port-change 를 쓰면 포트는 반드시 지정하도록 강제합니다.
        if args.port_change and args.new_port is None:
            raise ValueError("--port-change 옵션을 사용하려면 -P/--new-port 를 함께 지정해야 합니다.")

        check_port_range(args.new_port)
        check_port_range(args.ssh_port)

        conf = load_cluster(args.json)
        cluster_type = extract_cluster_type(conf)  # 예: 'ablestack-vm', 'ablestack-hci'

        # --------- JSON 업데이트 전용 모드 (--update-json-file) --------- #
        if args.update_json_file:
            plugin_path = compute_plugin_path(args.json)
            if args.local:
                update_security_patch_status(conf, plugin_path, "local")
            else:
                update_security_patch_status(conf, plugin_path, "many")
            retVal = {
                "summary": {
                    "message": "security_patch.status updated to true for all ablecube hosts",
                    "json": "/usr/share/cockpit/ablestack/tools/properties/ablestack.json",
                    "val": "security_patch.status = true",
                    "clusterType": cluster_type
                }
            }
            ret = createReturn(code=200, val=retVal, retname=args.retname)
            print(json.dumps(json.loads(ret), indent=4))
            return

        # --------- Ceph SSH 설정 변경 전용 모드 (--ceph-ssh-change) --------- #
        if args.ceph_ssh_change:
            # 로컬에서 security_patch.sh --ceph-ssh-change 만 한 번 실행
            result = run_local_patch(
                new_port=args.new_port,
                dry_run=args.dry_run,
                cluster_type=cluster_type,
                port_change=args.port_change,
                ceph_ssh_change=True,
                script_path=ABLECUBE_SECURITY_PATCH,
            )
            # 보기 좋게 ip / isLocal 정리
            result["ip"] = "127.0.0.1"
            result["isLocal"] = True

            retCode = 200 if result.get("ok") else 207
            retVal = {
                "summary": {
                    "requestedNewPort": args.new_port,
                    "connectPort": None,
                    "sshUser": args.ssh_user,
                    "total": 1,
                    "success": 1 if result.get("ok") else 0,
                    "failed": 0 if result.get("ok") else 1,
                    "dryRun": bool(args.dry_run),
                    "maxRetries": MAX_RETRIES,
                    "retryDelaySec": RETRY_DELAY_SEC,
                    "successPattern": SUCCESS_PATTERN,
                    "clusterType": cluster_type,
                    "cephSshChange": True
                },
                "targets": [result]
            }
            ret = createReturn(code=retCode, val=retVal, retname=args.retname)
            print(json.dumps(json.loads(ret), indent=4))
            return

        # --------- --add-host 모드 --------- #
        if args.add_host:
            results: List[Dict] = []

            # 1) 항상 로컬 먼저 실행
            local_result = run_local_patch(
                new_port=args.new_port,
                dry_run=args.dry_run,
                cluster_type=cluster_type,
                port_change=args.port_change,
                script_path=ABLECUBE_SECURITY_PATCH,
            )
            results.append(local_result)
            success = 1 if local_result.get("ok") else 0

            # 2) ablestack-hci 인 경우 scvm에도 ssh로 security_patch.sh 실행
            #    hosts 파일에 scvm 정의가 있다고 가정하고, 단순히 "scvm" 으로 접속합니다.
            if cluster_type == "ablestack-hci":
                scvm_result = run_remote(
                    ip="scvm",
                    user=args.ssh_user,
                    connect_port=args.ssh_port,
                    new_port=args.new_port,
                    dry_run=args.dry_run,
                    cluster_type=cluster_type,
                    port_change=args.port_change,
                    script_path=VM_SECURITY_PATCH,
                )
                results.append(scvm_result)
                if scvm_result.get("ok"):
                    success += 1

            retCode = 200 if success == len(results) else 207

            retVal = {
                "summary": {
                    "requestedNewPort": args.new_port,
                    "connectPort": args.ssh_port,
                    "sshUser": args.ssh_user,
                    "total": len(results),
                    "success": success,
                    "failed": len(results) - success,
                    "dryRun": bool(args.dry_run),
                    "maxRetries": MAX_RETRIES,
                    "retryDelaySec": RETRY_DELAY_SEC,
                    "successPattern": SUCCESS_PATTERN,
                    "clusterType": cluster_type,
                    "alone": True,
                    "scvmIncluded": (cluster_type == "ablestack-hci")
                },
                "targets": results
            }
            ret = createReturn(code=retCode, val=retVal, retname=args.retname)
            print(json.dumps(json.loads(ret), indent=4))
            return

        # --------- 기본 모드: cluster.json 기반 실행 --------- #
        targets = gather_targets(conf, args.targets)
        if not targets:
            retCode = 200
            retVal = {
                "summary": {
                    "message": "no targets",
                    "json": args.json
                },
                "targets": []
            }
            ret = createReturn(code=retCode, val=retVal, retname=args.retname)
            print(json.dumps(json.loads(ret), indent=4))
            return

        # 로컬 IP 목록(자기 자신) 미리 수집
        local_ips = get_local_ipv4s()
        ablecube_targets = gather_ablecube_targets(conf)

        results: List[Dict] = []
        success = 0
        for ip in targets:
            script_path = (
                ABLECUBE_SECURITY_PATCH
                if ip in ablecube_targets
                else VM_SECURITY_PATCH
            )
            # 1) 타깃 IP가 로컬이면 ssh 없이 직접 실행
            if ip in local_ips:
                r = run_local_patch(
                    new_port=args.new_port,
                    dry_run=args.dry_run,
                    cluster_type=cluster_type,
                    port_change=args.port_change,
                    script_path=script_path,
                )
                r["ip"] = ip
                r["isLocal"] = True
            else:
                # 2) 나머지는 기존대로 ssh 사용
                r = run_remote(
                    ip=ip,
                    user=args.ssh_user,
                    connect_port=args.ssh_port,
                    new_port=args.new_port,
                    dry_run=args.dry_run,
                    cluster_type=cluster_type,
                    port_change=args.port_change,
                    script_path=script_path,
                )

            results.append(r)
            if r.get("ok"):
                success += 1

        retCode = 200 if success == len(results) else 207

        retVal = {
            "summary": {
                "requestedNewPort": args.new_port,
                "connectPort": args.ssh_port,
                "sshUser": args.ssh_user,
                "total": len(results),
                "success": success,
                "failed": len(results) - success,
                "dryRun": bool(args.dry_run),
                "maxRetries": MAX_RETRIES,
                "retryDelaySec": RETRY_DELAY_SEC,
                "successPattern": SUCCESS_PATTERN,
                "clusterType": cluster_type
            },
            "targets": results
        }
        ret = createReturn(code=retCode, val=retVal, retname=args.retname)
        print(json.dumps(json.loads(ret), indent=4))

    except Exception:
        ret = createReturn(
            code=500,
            val="security patch error",
            retname=f"{args.retname} Error"
        )
        print(json.dumps(json.loads(ret), indent=4))

if __name__ == "__main__":
    main()
