#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import os
import shutil
import shlex
import subprocess
from pathlib import Path

try:
    from ablestack import createReturn
except Exception:
    def createReturn(code, val, retname=None):
        ret = {"code": code, "val": val}
        if retname is not None:
            ret["retname"] = retname
        return json.dumps(ret, ensure_ascii=False)


OS_RELEASE_PATH = Path("/etc/os-release")
TARGET_KS_PATH = Path("ks/ablestack-ks.cfg")
UPDATE_WORK_DIR = Path("/opt/ABLESTACK_UPDATE")
UPDATE_SCRIPT_MAP = {
    "all": {
        "label": "전체 업데이트",
        "script": Path("update-all.sh"),
    },
    "mold": {
        "label": "Mold 업데이트",
        "script": Path("update-mold.sh"),
    },
}


def parse_args():
    parser = argparse.ArgumentParser(description="ABLESTACK ISO update helper")
    parser.add_argument("action", choices=["info", "run"], help="Action to execute")
    parser.add_argument("--mount-path", required=True, help="Mounted ABLESTACK ISO path")
    parser.add_argument(
        "--update-type",
        choices=sorted(UPDATE_SCRIPT_MAP.keys()),
        default="all",
        help="Update type to execute",
    )
    return parser.parse_args()


def normalize_value(value):
    value = value.strip()
    if value == "":
        return ""
    try:
        parsed = shlex.split(value, posix=True)
        if len(parsed) == 1:
            return parsed[0]
    except ValueError:
        pass
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
        return value[1:-1]
    return value


def parse_key_values(path):
    values = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = normalize_value(value)
    return values


def validate_mount_path(mount_path):
    if not mount_path:
        raise ValueError("ISO 마운트 경로를 입력해야 합니다.")

    path = Path(mount_path).expanduser()
    if not path.is_absolute():
        raise ValueError("ISO 마운트 경로는 절대 경로로 입력해야 합니다.")
    if not path.exists():
        raise FileNotFoundError("입력한 ISO 마운트 경로가 존재하지 않습니다.")
    if not path.is_dir():
        raise NotADirectoryError("입력한 ISO 마운트 경로가 디렉터리가 아닙니다.")
    return path.resolve()


def get_update_script_info(update_type):
    script_info = UPDATE_SCRIPT_MAP.get(update_type)
    if script_info is None:
        raise ValueError("지원하지 않는 업데이트 방식입니다.")
    return script_info


def is_path_relative_to(path, parent):
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def read_update_info(mount_path, update_type="all"):
    mount = validate_mount_path(mount_path)
    script_info = get_update_script_info(update_type)
    script_relative_path = script_info["script"]
    ks_path = mount / TARGET_KS_PATH
    update_script_path = mount / script_relative_path

    if not ks_path.exists():
        raise FileNotFoundError(f"{TARGET_KS_PATH} 파일을 찾을 수 없습니다.")
    if not update_script_path.exists():
        raise FileNotFoundError(f"{script_relative_path} 파일을 찾을 수 없습니다.")

    current_info = parse_key_values(OS_RELEASE_PATH)
    target_ks_info = parse_key_values(ks_path)

    target_ablestack_version = target_ks_info.get("ABLESTACK_VERSION", "")

    if target_ablestack_version == "":
        raise ValueError(f"{TARGET_KS_PATH} 파일에서 ABLESTACK_VERSION 값을 찾을 수 없습니다.")

    return {
        "mount_path": str(mount),
        "copy_path": str(UPDATE_WORK_DIR),
        "current_ablestack_version": current_info.get("PRETTY_NAME", "N/A"),
        "target_ablestack_version": target_ablestack_version,
        "update_type": update_type,
        "update_label": script_info["label"],
        "update_script": str(update_script_path),
        "work_update_script": str(UPDATE_WORK_DIR / script_relative_path),
    }


def prepare_update_work_dir(mount_path):
    target_path = UPDATE_WORK_DIR

    if (
        mount_path == target_path
        or is_path_relative_to(target_path, mount_path)
        or is_path_relative_to(mount_path, target_path)
    ):
        raise ValueError("ISO 마운트 경로와 복사 대상 경로를 분리해야 합니다.")
    if target_path.is_symlink():
        raise ValueError(f"{target_path} 경로가 심볼릭 링크입니다.")
    if os.path.ismount(str(target_path)):
        raise ValueError(f"{target_path} 경로가 마운트 지점입니다.")
    if target_path.exists():
        if not target_path.is_dir():
            raise NotADirectoryError(f"{target_path} 경로가 디렉터리가 아닙니다.")
        shutil.rmtree(target_path)

    target_path.mkdir(parents=True, exist_ok=False)
    proc = copy_update_files(mount_path, target_path)
    if proc.returncode != 0:
        message = proc.stderr.strip() or proc.stdout.strip() or "ISO 파일 복사 중 오류가 발생했습니다."
        raise RuntimeError(message)

    return target_path


def copy_update_files(source_path, target_path):
    copy_args = [f"{source_path}/.", f"{target_path}/"]
    proc = subprocess.run(
        ["cp", "-rRp"] + copy_args,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode == 0 or "R and -r options may not be specified together" not in proc.stderr:
        return proc
    return subprocess.run(
        ["cp", "-Rp"] + copy_args,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def run_update(mount_path, update_type="all"):
    info = read_update_info(mount_path, update_type)
    script_info = get_update_script_info(update_type)
    mount = Path(info["mount_path"])
    work_dir = prepare_update_work_dir(mount)
    work_update_script = work_dir / script_info["script"]

    if not work_update_script.exists():
        raise FileNotFoundError(f"{work_update_script} 파일을 찾을 수 없습니다.")

    env = os.environ.copy()
    env["ABLESTACK_UPDATE_MOUNT_PATH"] = info["mount_path"]
    env["ABLESTACK_UPDATE_WORK_PATH"] = str(work_dir)
    env["ABLESTACK_UPDATE_COPY_PATH"] = str(work_dir)
    env["ABLESTACK_UPDATE_TYPE"] = update_type

    proc = subprocess.run(
        ["/bin/bash", f"./{script_info['script'].as_posix()}"],
        cwd=str(work_dir),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        check=False,
    )
    if proc.returncode != 0:
        message = proc.stderr.strip() or proc.stdout.strip() or "ABLESTACK Version 업데이트 실행 중 오류가 발생했습니다."
        raise RuntimeError(message)

    return {
        "message": f"ABLESTACK {script_info['label']} 실행이 완료되었습니다.",
        "mount_path": info["mount_path"],
        "copy_path": str(work_dir),
        "update_type": update_type,
        "update_label": script_info["label"],
        "update_script": str(work_update_script),
        "stdout": proc.stdout.strip(),
        "stderr": proc.stderr.strip(),
    }


def main():
    args = parse_args()
    try:
        if args.action == "info":
            ret = createReturn(code=200, val=read_update_info(args.mount_path, args.update_type))
        else:
            ret = createReturn(code=200, val=run_update(args.mount_path, args.update_type))
    except Exception as e:
        ret = createReturn(code=500, val=str(e))
    print(ret)


if __name__ == "__main__":
    main()
