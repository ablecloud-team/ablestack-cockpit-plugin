#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import sys
import os
import shutil
import uuid
from datetime import datetime
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.backends import default_backend
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import Crypto

def get_license_status():
    """현재 등록된 라이선스 상태 확인"""
    try:
        # 호스트 UUID 가져오기
        host_uuid = None
        try:
            with open('/etc/machine-id', 'r') as f:
                host_uuid = f.read().strip()
        except:
            return {'code': '500', 'val': '호스트 UUID를 읽을 수 없습니다.'}

        # 라이선스 디렉토리 경로
        license_dir = f"/usr/share/{host_uuid}"

        # 디렉토리가 없거나 비어있는 경우
        if not os.path.exists(license_dir) or not os.listdir(license_dir):
            return {'code': '404', 'val': '등록된 라이선스가 없습니다.'}

        # 가장 최근 라이선스 파일 찾기
        license_files = [f for f in os.listdir(license_dir) if os.path.isfile(os.path.join(license_dir, f))]
        if not license_files:
            return {'code': '404', 'val': '등록된 라이선스가 없습니다.'}

        latest_license = sorted(license_files)[-1]
        license_file = os.path.join(license_dir, latest_license)

        # 라이선스 파일에서 만료일 추출
        try:
            with open(license_file, 'r') as f:
                license_content = f.read()

            # 복호화 로직
            password = b"password"
            salt = b"salt"

            # 32바이트 길이의 키 생성
            scrypt_kdf = Scrypt(
                salt=salt,
                length=32,
                n=16384,
                r=8,
                p=1,
                backend=default_backend()
            )
            key = scrypt_kdf.derive(password)

            # IV 생성
            iv_scrypt_kdf = Scrypt(
                salt=salt,
                length=16,
                n=16384,
                r=8,
                p=1,
                backend=default_backend()
            )
            iv = iv_scrypt_kdf.derive(password)

            # base64로 인코딩된 데이터를 디코딩
            encrypted_content_bytes = base64.b64decode(license_content)

            # AES 복호화
            cipher = AES.new(key, AES.MODE_CBC, iv)
            decrypted_content = unpad(cipher.decrypt(encrypted_content_bytes), AES.block_size)

            # 복호화된 내용에서 만료일 파싱
            license_info = json.loads(decrypted_content.decode('utf-8'))
            expired = license_info.get('expired')
            issued = license_info.get('issued')
            oem = license_info.get('oem')

            expired_date = datetime.strptime(expired, "%Y-%m-%d").date()
            today = datetime.today().date()

            if today > expired_date:
                status = "inactive"
            else:
                status = "active"

            if not expired or not issued:
                raise ValueError("만료일 또는 시작일을 찾을 수 없습니다")

            return {
                'code': '200',
                'val': {
                    'status': status,
                    'expired': expired,
                    'oem': oem,
                    'issued': issued,
                    'file_path': license_file
                }
            }
        except Exception as e:
            return {'code': '500', 'val': f'라이선스 정보를 읽을 수 없습니다: {str(e)}'}

    except Exception as e:
        return {'code': '500', 'val': f'라이선스 상태 확인 중 오류가 발생했습니다: {str(e)}'}

def process_license_content(content=None, original_filename=None):
    """라이선스 내용 처리"""
    try:
        if content is None:
            return get_license_status()

        # base64 디코딩
        try:
            license_content = base64.b64decode(content).decode('utf-8')
        except:
            return {'code': '400', 'val': '유효하지 않은 라이선스 내용입니다.'}

        # 호스트 UUID 가져오기
        host_uuid = None
        try:
            with open('/etc/machine-id', 'r') as f:
                host_uuid = f.read().strip()
        except:
            return {'code': '500', 'val': '호스트 UUID를 읽을 수 없습니다.'}

        # 라이선스 디렉토리 경로
        license_dir = f"/usr/share/{host_uuid}"

        # 디렉토리가 없으면 생성
        if not os.path.exists(license_dir):
            os.makedirs(license_dir, mode=0o700)

        try:
            # 파일내용 복호화
            password = b"password"
            salt = b"salt"

            # 32바이트 길이의 키 생성
            scrypt_kdf = Scrypt(
                salt=salt,
                length=32,
                n=16384,
                r=8,
                p=1,
                backend=default_backend()
            )
            key = scrypt_kdf.derive(password)

            # IV 생성
            iv_scrypt_kdf = Scrypt(
                salt=salt,
                length=16,
                n=16384,
                r=8,
                p=1,
                backend=default_backend()
            )
            iv = iv_scrypt_kdf.derive(password)

            # base64로 인코딩된 데이터를 디코딩
            encrypted_content_bytes = base64.b64decode(license_content)

            # AES 복호화
            cipher = AES.new(key, AES.MODE_CBC, iv)
            decrypted_content = unpad(cipher.decrypt(encrypted_content_bytes), AES.block_size)

            # 복호화된 내용에서 만료일 파싱
            license_info = json.loads(decrypted_content.decode('utf-8'))
            expired = license_info.get('expired')
            issued = license_info.get('issued')

            if not expired or not issued:
                raise ValueError("만료일 또는 시작일을 찾을 수 없습니다")

        except Exception as e:
            return {'code': '500', 'val': f'라이선스 내용을 처리할 수 없습니다: {str(e)}'}

        # 기존 라이선스 파일 삭제
        for file in os.listdir(license_dir):
            try:
                os.remove(os.path.join(license_dir, file))
            except:
                pass

        # 원본 파일명에서 확장자 제거
        if original_filename:
            filename_without_ext = os.path.splitext(original_filename)[0]
            new_filename = f"{filename_without_ext}"
        else:
            new_filename = f"license_{expired}"

        new_filepath = os.path.join(license_dir, new_filename)

        # 라이선스 내용 저장
        with open(new_filepath, 'w') as f:
            f.write(license_content)

        # 파일 권한 설정 (600)
        os.chmod(new_filepath, 0o600)

        return {'code': '200', 'val': '라이선스가 성공적으로 등록되었습니다.'}

    except Exception as e:
        return {'code': '500', 'val': f'라이선스 등록 중 오류가 발생했습니다: {str(e)}'}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='ABLESTACK 라이선스 등록')
    parser.add_argument('--license-content', help='라이선스 파일 내용(base64)', required=False)
    parser.add_argument('--original-filename', help='원본 파일명', required=False)
    parser.add_argument('--status', help='라이선스 상태 확인', action='store_true')

    args = parser.parse_args()

    if args.status:
        result = get_license_status()
    else:
        result = process_license_content(args.license_content, args.original_filename)

    print(json.dumps(result))
    sys.exit(0)

print(Crypto.__version__)