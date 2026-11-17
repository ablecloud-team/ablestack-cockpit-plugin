"""UI localization must not change the English logs used from an IPMI console."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


MODULE = Path(__file__).resolve().parents[1] / "python/host/ablestack_update.py"
SPEC = importlib.util.spec_from_file_location("update_log_display", MODULE)
update = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(update)


class UpdateLogDisplayTests(unittest.TestCase):
    def test_firmware_formats_and_nvram_preservation_are_localized(self):
        raw = ("Host UEFI firmware ready: qcow2; converted=2; descriptors=3\n"
               "VM firmware formats synchronized: scvm loader=qcow2 nvram=raw; backup: /var/log/firmware/scvm-abc\n"
               "ERROR: VM firmware check failed: scvm; Firmware image is missing: /usr/share/edk2/ovmf/OVMF_CODE.fd\n"
               "[2026-11-17 13:00:00] Legacy NVRAM reset cancelled; existing variables preserved: scvm backup=/var/log/nvram/scvm-abc")
        text = update.localize_update_output(raw)
        self.assertIn("QCOW2 형식 준비 완료: 변환 파일 2개, 정의 파일 3개", text)
        self.assertIn("scvm 로더=qcow2, NVRAM=raw", text)
        self.assertIn("VM 펌웨어 검사 실패: scvm; 펌웨어 파일이 없습니다:", text)
        self.assertIn("/usr/share/edk2/ovmf/OVMF_CODE.fd", text)
        self.assertIn("기존 NVRAM을 보존하도록 이전 초기화 예약을 취소", text)
        self.assertIn("/var/log/nvram/scvm-abc", text)

    def test_firewall_pause_restore_and_fatal_recovery_are_localized_with_role_and_paths(self):
        raw = ("[2026-11-17 10:00:00] [scvm] Pausing firewalld for package update; backup: /var/log/ablestack-update-packages/run/scvm-firewalld.abc\n"
               "[2026-11-17 10:01:00] [scvm] Original firewalld state restored and verified\n"
               "[2026-11-17 10:01:00] [ccvm] ERROR: firewalld recovery failed; backup: /var/log/ablestack-update-packages/run/ccvm-firewalld.xyz")
        text = update.localize_update_output(raw)
        self.assertIn("[scvm] 패키지 업데이트를 위해 firewalld를 일시 정지", text)
        self.assertIn("[scvm] firewalld의 기존 실행 상태와 설정 복원", text)
        self.assertIn("[ccvm] ERROR: firewalld 복구에 실패", text)
        self.assertIn("/var/log/ablestack-update-packages/run/ccvm-firewalld.xyz", text)

    def test_new_storage_window_and_recent_error_rejection_are_localized(self):
        raw = ("[2026-11-17 10:00:00] Storage log checkpoint captured; older messages saved to /var/log/ablestack-update-packages/run/host-kernel-before.log\n"
               "[2026-11-17 10:00:00] ERROR: Storage errors occurred within the last 5 minutes; update not started")
        text = update.localize_update_output(raw)
        self.assertIn("스토리지 로그 검사 시작 지점을 기록", text)
        self.assertIn("최근 5분 이내에 스토리지 오류가 발생", text)

    def test_recovered_host_failure_is_readable_without_rewriting_original(self):
        raw = (
            "[2026-11-17 09:45:33] Host package update completed\n"
            "[2026-11-17 09:46:04] ERROR: Storage errors detected in the kernel log after the host update.\n"
            "[2026-11-17 09:46:04] ERROR: Full update finished: failed (exit=1). Check the log.\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            log = Path(directory) / "update.log"
            log.write_text(raw)
            with patch.dict(update.UPDATE_LOG_PATHS, {"all": log}), \
                    patch.object(update.subprocess, "run") as command:
                result = update.read_update_log("all")
            self.assertEqual(log.read_text(), raw)
            command.assert_not_called()
        self.assertIn("호스트 업데이트 완료", result["text"])
        self.assertIn("호스트 업데이트 후 커널 로그에 스토리지 오류", result["text"])
        self.assertIn("[2026-11-17 09:46:04] ERROR:", result["text"])
        self.assertIn("실패(exit=1)", result["text"])

    def test_host_scvm_ccvm_preserve_versions_paths_and_solver_details(self):
        detail = " Problem: nothing provides python3-rados = 4:Glue-v4.2.9.el9\n"
        for role in ("host", "scvm", "ccvm"):
            with self.subTest(role=role):
                raw = (f"[2026-11-17 09:45:33] [{role}] "
                       "Kernel log free of storage errors check passed\n" + detail)
                result = update.localize_update_output(raw)
                self.assertIn(f"[{role}]", result)
                self.assertIn("확인 완료", result)
                self.assertTrue(result.endswith(detail))
        raw = "[2026-11-17 09:45:33] initramfs validated: /boot/initramfs-5.14.0-687.66.1.el9_8.x86_64.img"
        self.assertIn("/boot/initramfs-5.14.0-687.66.1.el9_8.x86_64.img", update.localize_update_output(raw))

    def test_tools_mismatch_keeps_all_three_kernel_values(self):
        raw = ("[2026-11-17 09:45:33] [tools] ERROR: Cannot install ABLESTACK Tools: "
               "running kernel (5.14.0-old) does not match the installation target. "
               "Latest installed kernel: 5.14.0-installed, ISO target kernel: 5.14.0-target. "
               "Complete the full update and reboot into the target kernel.")
        result = update.localize_update_output(raw)
        self.assertIn("맞지 않아 ABLESTACK Tools를 설치할 수 없습니다", result)
        for version in ("5.14.0-old", "5.14.0-installed", "5.14.0-target"):
            self.assertIn(version, result)

    def test_unknown_package_output_and_old_korean_logs_are_preserved(self):
        raw = "update failed\nRunning scriptlet: NetworkManager\nComplete!\n이전 업데이트 기록\n"
        self.assertEqual(update.localize_update_output(raw), raw)

    def test_mold_uses_its_own_file_and_missing_log_is_empty(self):
        with tempfile.TemporaryDirectory() as directory:
            mold = Path(directory) / "mold.log"
            with patch.dict(update.UPDATE_LOG_PATHS, {"mold": mold}):
                self.assertEqual(update.read_update_log("mold")["text"], "")
                mold.write_text("[2026-11-17 09:45:33] [ccvm] Local RPMs and services verified")
                result = update.read_update_log("mold")
                self.assertEqual(result["log_file"], str(mold))
                self.assertIn("로컬 RPM 및 서비스 확인 완료", result["text"])

    def test_log_tail_is_bounded_and_arbitrary_paths_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            log = Path(directory) / "update.log"
            log.write_text("x" * 70000 + "\n" + "\n".join(f"package-{i}" for i in range(400)))
            with patch.dict(update.UPDATE_LOG_PATHS, {"all": log}):
                text = update.read_update_log("all")["text"]
            self.assertEqual(len(text.splitlines()), 300)
            self.assertTrue(text.startswith("package-100\n"))
            self.assertTrue(text.endswith("package-399"))
        with self.assertRaises(ValueError):
            update.read_update_log("../../etc/shadow")


if __name__ == "__main__":
    unittest.main()
