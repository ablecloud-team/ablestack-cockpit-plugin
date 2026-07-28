/**
 * File Name : main.js
 * Date Created : 2020.02.18
 * Writer : 박동혁
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
 **/

// document.ready 영역 시작

this.ccvm_instance = new CloudCenterVirtualMachine();
ccvm_instance = this.ccvm_instance;
$(document).ccvm_instance = ccvm_instance;
pluginpath = '/usr/share/cockpit/ablestack';
let pcs_exe_host = "";
var os_type = sessionStorage.getItem("os_type");
//PFMP 설치 시 퍼센트 값 설정 초가화
let interval;
var gfs_file_system_arr = [];

function setStatusTone($target, tone) {
  if (!$target || !$target.length) {
    return;
  }
  $target.removeClass("ablestack-status-ok ablestack-status-warn ablestack-status-danger");
  $target.addClass("ablestack-status-text");
  if (tone) {
    $target.addClass(`ablestack-status-${tone}`);
  }
  $target.removeAttr("style");
}

$(document).ready(function () {
  // 타입별 클라우드센터 가상머신 상태 변경
  insertCloudVmCard(os_type);

  // 라이센스 관리 버튼 초기 표시
  $('#button-open-modal-license-register').show();

  $('#dropdown-menu-storage-cluster-status').hide();
  $('#dropdown-menu-cloud-cluster-status').hide();
  $('#dropdown-menu-storage-vm-status').hide();
  $('#dropdown-menu-cloud-vm-status').hide();
  $('#dropdown-menu-gfs-cluster-status').hide();
  $('#dropdown-menu-gfs-disk-status').hide();
  $('#dropdown-menu-gfs-integration-status').hide();

  $('#button-open-modal-wizard-storage-cluster').hide();
  $('#button-open-modal-wizard-storage-vm').hide();
  $('#button-open-modal-wizard-pfmp-vm').hide();
  $('#button-open-modal-wizard-cloud-vm').hide();
  $('#button-link-storage-center-dashboard').hide();
  $('#button-link-cloud-center').hide();
  $('#button-open-modal-wizard-monitoring-center').hide();
  $('#button-link-monitoring-center').hide();
  $('#button-config-file-download').hide();
  $('#button-open-modal-security-evidence').hide();
  refreshSystemUpdateButton();

  $('#div-modal-wizard-storage-vm').load("./src/features/storage-vm-wizard.html");
  $('#div-modal-wizard-storage-vm').hide();

  $('#div-modal-wizard-pfmp-vm').load("./src/features/pfmp-vm-wizard.html");
  $('#div-modal-wizard-pfmp-vm').hide();

  $('#div-modal-wizard-cluster-config-prepare').load("./src/features/cluster-config-prepare.html");
  $('#div-modal-wizard-cluster-config-prepare').hide();

  $('#div-modal-wizard-cloud-vm').load("./src/features/cloud-vm-wizard.html");
  $('#div-modal-wizard-cloud-vm').hide();

  $('#div-modal-wizard-wall-monitoring').load("./src/features/wall-monitoring-wizard.html");
  $('#div-modal-wizard-wall-monitoring').hide();

  $('#dev-modal-migration-cloud-vm').hide();
  $('#dev-modal-stop-cloud-vm').hide();

  $('#div-change-modal-cloud-vm').load("./src/features/cloud-vm-change.html");
  $('#div-change-modal-cloud-vm').hide();
  $('#div-change-alert-cloud-vm').load("./src/features/cloud-vm-change-alert.html");
  $('#div-change-alert-cloud-vm').hide();

  $('#div-cloud-vm-snap').load("./src/features/cloud-vm-snap.html");
  $('#div-cloud-vm-snap').hide();

  $('#div-modal-wizard-gfs-storage-configure').load("./src/features/gfs-storage-configure-wizard.html");
  $('#div-modal-wizard-gfs-storage-configure').hide();

  $('#div-modal-wizard-local-storage-configure').load("./src/features/local-storage-configure-wizard.html");
  $('#div-modal-wizard-local-storage-configure').hide();

  $('#div-modal-wizard-hci-shared-file-configure').load("./src/features/hci-shared-file-configure-wizard.html");
  $('#div-modal-wizard-hci-shared-file-configure').hide();

  // 스토리지 센터 가상머신 자원변경 페이지 로드
  $('#div-modal-storage-vm-resource-update').load("./src/features/storage-vm-resource-update.html");
  $('#div-modal-storage-vm-resource-update').hide();
  // 스토리지 센터 가상머신 상태변경 페이지 로드
  $('#div-modal-storage-vm-status-update').load("./src/features/storage-vm-status-update.html");
  $('#div-modal-storage-vm-status-update').hide();
  // 스토리지 클러스터 유지보수 모드 변경 페이지 로드
  $('#div-modal-storage-cluster-maintenance-update').load("./src/features/storage-cluster-maintenance-update.html");
  $('#div-modal-storage-cluster-maintenance-update').hide();
  // 전체 시스템 종료 페이지 로드
  $('#div-modal-auto-shutdown').load("./src/features/auto-shutdown.html");
  $('#div-modal-auto-shutdown').hide();
  // ccvm db 백업 페이지 로드
  $('#div-modal-db-backup-cloud-vm-first').load("./src/features/cloud-vm-dbbackup.html");
  $('#div-modal-db-backup-cloud-vm-first').hide();

  $('#div-modal-ccvm-backup').load("./src/features/ccvm-backup.html");
  $('#div-modal-ccvm-backup').hide();
  $('#div-modal-ccvm-restore').load("./src/features/ccvm-restore.html");
  $('#div-modal-ccvm-restore').hide();
  $('#div-modal-ccvm-backup-status').load("./src/features/ccvm-backup-status.html");
  $('#div-modal-ccvm-backup-status').hide();
  // 서버 가상화일 경우 화면 변환
  screenConversion();

  ribbonWorker();
  //30초마다 화면 정보 갱신
  setInterval(() => {
    createLoggerInfo("Start collecting ablestack status information : setInterval()");
    // 배포상태 조회(비동기)완료 후 배포상태에 따른 요약리본 UI 설정
    ribbonWorker();
  }, 30000);

  // 라이센스 관련 이벤트 핸들러
  initializeLicenseHandlers();
  checkLicenseStatusConfirm();
  // 초기 버튼 비활성화
  $('#button-execution-modal-license-register').prop('disabled', true);

  // 상태 알림 모달 닫기
  $('#modal-status-alert-button-close1, #modal-status-alert-button-close2').on('click', function () {
    $('#div-modal-status-alert').hide();
  });

  // 라이센스 키 입력 필드 유효성 검사
  $('#input-license-key').on('input', function () {
    validateLicenseInputs();
  });

  // 라이센스 파일 선택 필드 유효성 검사
  $('#input-license-file').on('change', function () {
    validateLicenseInputs();
  });

  // 입력값 유효성 검사 함수 수정
  function validateLicenseInputs() {
    const licenseFile = $('#input-license-file')[0].files[0];
    $('#button-execution-modal-license-register').prop('disabled', !licenseFile);
  }

  // 추가 입력 필드에 대한 유효성 검사 이벤트 리스너
  $('#input-license-type').on('change', function () {
    validateLicenseInputs();
  });

  $('#input-product-id').on('input', function () {
    validateLicenseInputs();
  });

  $('#input-license-start-date').on('change', function () {
    validateLicenseInputs();
  });

  $('#input-license-end-date').on('change', function () {
    validateLicenseInputs();
  });

  // 라이센스 상태 확인 함수
  function checkLicenseStatusConfirm() {
    cockpit.spawn(['python3', pluginpath + '/python/license/register_license.py', '--status'])
      .then(function (data) {
        var result = JSON.parse(data);
        if (result.code == 200) {
          updateLicenseUI(result);

          // 라이센스 버튼은 항상 표시되도록 수정
          $('#button-open-modal-license-register').show();
        } else {
          // 에러 시에도 버튼은 표시
          $('#button-open-modal-license-register').show();
          updateLicenseUI(result);
          // 에러 UI 업데이트
          // $('#div-license-description').html(`
          //   <div class="license-info error">
          //     <p><i class="fas fa-exclamation-triangle" style="color: red;"></i> 라이센스 상태를 확인할 수 없습니다.</p>
          //     <p>시스템 오류가 발생했습니다.</p>
          //   </div>
          // `);
        }
      })
      .catch(function () {
        // 에러 시에도 버튼은 표시
        $('#button-open-modal-license-register').show();

        // 에러 UI 업데이트
        $('#div-license-description').html(`
          <div class="license-info error">
            <p><i class="fas fa-exclamation-triangle" style="color: red;"></i> 라이센스 상태를 확인할 수 없습니다.</p>
            <p>시스템 오류가 발생했습니다.</p>
          </div>
        `);
      });
  }

  // 라이센스 상태에 따른 UI 업데이트 함수
  function updateLicenseUI(result) {
    let licenseDescription = '';

    if (result.code == "200" && result.val && result.val.status === 'active') {
      // 유효한 라이센스가 있는 경우
      licenseDescription = `
        <div class="license-info">
          <p><i class="fas fa-check-circle" style="color: green;"></i> 라이센스가 등록되어 있습니다.</p>
          <p><strong>시작일:</strong> ${result.val.issued}</p>
          <p><strong>만료일:</strong> ${result.val.expired}</p>
          <hr>
          <p class="text-muted">새로운 라이센스를 등록하면 기존 라이센스가 교체됩니다.</p>
        </div>
      `;
    } else if (result.code == "404") {
      // 라이센스가 없는 경우
      licenseDescription = `
        <div class="license-info">
          <p><i class="fas fa-exclamation-circle" style="orange;"></i> 등록된 라이센스가 없습니다.</p>
          <p>라이센스 파일을 선택하여 등록해주세요.</p>
        </div>
      `;
    } else if (result.code == "200" && result.val.status === 'inactive') {
      licenseDescription = `
        <div class="license-info">
        <p style="font-size: 15.7px; color: crimson;"><i class="fas fa-exclamation-triangle" style="color: red;"></i> 등록된 라이선스의 유효기간이 만료되었습니다.새로운 라이센스를 등록해 주세요.</p>
          <p><strong>시작일:</strong> ${result.val.issued}</p>
          <p><strong>만료일:</strong> ${result.val.expired}</p>
          <hr>
          <p class="text-muted">새로운 라이센스를 등록하면 기존 라이센스가 교체됩니다.</p>
        </div>
      `;
    }
    else {
      // 오류가 발생한 경우
      licenseDescription = `
        <div class="license-info error">
          <p><i class="fas fa-exclamation-triangle" style="color: red;"></i> 라이센스 상태 확인 중 오류가 발생했습니다.</p>
          <p>${result.val}</p>
        </div>
      `;
    }

    $('#div-license-description').html(licenseDescription);
  }

  // 라이센스 관련 이벤트 핸들러
  function initializeLicenseHandlers() {
    // 라이센스 등록 모달 열기
    $('#button-open-modal-license-register').on('click', function () {
      $('#div-modal-license-register').show();
      checkLicenseStatusConfirm();
    });

    // 모달 닫기
    $('#button-close-modal-license-register, #button-cancel-modal-license-register').on('click', function () {
      $('#div-modal-license-register').hide();
      $('#input-license-file').val("");
    });

    // 파일 선택 시 버튼 활성화
    $('#input-license-file').on('change', function () {
      $('#button-execution-modal-license-register').prop('disabled', !this.files.length);
    });

    // 라이센스 등록 실행
    $('#button-execution-modal-license-register').on('click', function () {
      const licenseFile = $('#input-license-file')[0].files[0];
      if (!licenseFile) {
        alert("라이센스 파일을 선택해주세요.");
        return;
      }

      // 로딩 스피너 표시
      $('#div-modal-spinner-header-txt').text('라이센스 등록중입니다...');
      $('#div-modal-spinner-body-txt').text('라이센스를 등록하는 중입니다. 잠시만 기다려주세요.');
      $('#div-modal-spinner').show();

      const reader = new FileReader();
      reader.onload = function (e) {
        const fileContent = e.target.result;
        const base64Content = btoa(fileContent);

        // 라이센스 등록 API 호출
        cockpit.spawn([
          'python3',
          '/usr/share/cockpit/ablestack/python/license/register_license.py',
          '--license-content',
          base64Content,
          '--original-filename',
          licenseFile.name
        ], { superuser: true })
          .then(function (data) {
            $('#div-modal-spinner').hide();
            const result = JSON.parse(data);
            if (result.code == "200") {
              $('#div-modal-license-register').hide();
              alert("라이센스가 성공적으로 등록되었습니다.");
              location.reload();
            } else {
              alert("라이센스 등록 실패: " + result.val);
              location.reload();
            }
          })
          .catch(function (error) {
            $('#div-modal-spinner').hide();
            $('#div-modal-license-register').hide();
            console.error("Error:", error);
            alert("라이센스 등록 중 오류가 발생했습니다: " + error);
            location.reload();
          });
      };
      reader.readAsBinaryString(licenseFile);
    });
  }

  // 페이지 로드 시 라이센스 상태 확인
  checkLicenseStatusConfirm();
});
// document.ready 영역 끝

// 이벤트 처리 함수

$('#card-action-cloud-cluster-status').on('click', function () {
  $('#dropdown-menu-cloud-cluster-status').toggle();
});
$('#card-action-gfs-cluster-status').on('click', function () {
  $('#dropdown-menu-gfs-cluster-status').toggle();
});
$('#card-action-storage-vm-status').on('click', function () {
  $('#dropdown-menu-storage-vm-status').toggle();
});
$('#card-action-gfs-integration-status').on('click', function () {
  $('#dropdown-menu-gfs-integration-status').toggle();
});
$(document).on('click', '#card-action-cloud-vm-status', function () {
  $('#dropdown-menu-cloud-vm-status').toggle();
});
var cpu = 0;
var memory = 0;
$(document).on('click', '#card-action-cloud-vm-change', function () {
  ccvm_instance.createChangeModal();
});

$('#card-action-cloud-vm-connect').on('click', function () {
  // 클라우드센터VM 연결
  window.open('http://' + ccvm_instance.ip + ":9090");
});

$('#button-open-modal-wizard-storage-vm').on('click', function () {
  $('#div-modal-wizard-storage-vm').show();
});

$('#button-open-modal-wizard-pfmp-vm').on('click', function () {
  $('#div-modal-wizard-pfmp-vm').show();
});

$('#button-open-modal-wizard-storage-cluster').on('click', function () {
  readSshKeyFile();
  $('#div-modal-wizard-cluster-config-prepare').show();
});

$('#button-link-gfs-storage-configure').on('click', function () {
  $('#div-modal-wizard-gfs-storage-configure').show();
});
$('#button-open-modal-wizard-cloud-vm').on('click', function () {
  $('#div-modal-wizard-cloud-vm').show();
});

$('#button-link-hci-shared-file-configure').on('click', function () {
  $('#div-modal-wizard-hci-shared-file-configure').show();
});
$('#button-open-modal-wizard-monitoring-center').on('click', function () {
  $('#div-modal-wizard-wall-monitoring').show();
  autoConfigWallIP();
});

$('#button-link-storage-center-dashboard').on('click', function () {
  // storageCenter url 링크 주소 가져오기
  createLoggerInfo("button-link-storage-center-dashboard click");
  cockpit.spawn(["python3", pluginpath + "/python/url/create_address.py", "storageCenter"])
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        // 스토리지센터 연결
        window.open(retVal.val);
      } else {
        $("#modal-status-alert-title").html("스토리지센터 연결");
        $("#modal-status-alert-body").html(retVal.val);
        $('#div-modal-status-alert').show();
      }
    })
    .catch(function (err) {
      createLoggerInfo(":::create_address.py storageCenter Error:::");
      console.log(":::create_address.py storageCenter Error:::" + err);
    });
});
$('#button-link-local-storage-configure').on('click', function () {
  $('#div-modal-wizard-local-storage-configure').show();
});
$('#button-link-cloud-center').on('click', function () {
  // 클라우드센터 연결
  createLoggerInfo("button-link-cloud-center click");
  cockpit.spawn(["python3", pluginpath + "/python/url/create_address.py", "cloudCenter"])
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        window.open(retVal.val);
      } else {
        $("#modal-status-alert-title").html("클라우드센터 연결");
        $("#modal-status-alert-body").html(retVal.val);
        $('#div-modal-status-alert').show();
      }
    })
    .catch(function (err) {
      createLoggerInfo(":::create_address.py cloudCenter Error:::");
      console.log(":::create_address.py cloudCenter Error:::" + err);
    });
});

$('#button-link-monitoring-center').on('click', function () {
  // 모니터링센터 대시보드 연결
  cockpit.spawn(["python3", pluginpath + "/python/url/create_address.py", "wallCenter"])
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        window.open(retVal.val);
      } else {
        $("#modal-status-alert-title").html("모니터링센터 대시보드 연결");
        $("#modal-status-alert-body").html(retVal.val);
        $('#div-modal-status-alert').show();
      }
    })
    .catch(function (err) {
      console.log(":::create_address.py wallCenter Error:::" + err);
    });
});

// 스토리지센터 클러스터 유지보수모드 설정 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-maintenance-mode').on('click', function () {
  $('#modal-description-maintenance-status').html("<p>스토리지 클러스터를 유지보수 모드를 '설정' 하시겠습니까?</p>");
  $('#scc-maintenance-update-cmd').val("set");
  $('#div-modal-storage-cluster-maintenance-update').show();
});

// 스토리지센터 클러스터 유지보수모드 해제 버튼 클릭시 modal의 설명 세팅
$('#menu-item-unset-maintenance-mode').on('click', function () {
  $('#modal-description-maintenance-status').html("<p>스토리지 클러스터를 유지보수 모드를 '해제' 하시겠습니까?</p>");
  $('#scc-maintenance-update-cmd').val("unset");
  $('#div-modal-storage-cluster-maintenance-update').show();
});

// 스토리지센터 VM 시작 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-storage-center-vm-start').on('click', function () {
  $('#modal-title-scvm-status').text("스토리지 센터 가상머신 상태 변경");
  $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '시작' 하시겠습니까?</p>");
  $('#button-storage-vm-status-update').html("시작");
  $('#scvm-status-update-cmd').val("start");
  $('#div-modal-storage-vm-status-update').show();
});

// 스토리지센터 VM 정지 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-storage-center-vm-stop').on('click', function () {
  $('#modal-title-scvm-status').text("스토리지 센터 가상머신 상태 변경");
  $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '정지' 하시겠습니까?</p>");
  $('#button-storage-vm-status-update').html("정지");
  $('#scvm-status-update-cmd').val("stop");
  $('#div-modal-storage-vm-status-update').show();
});

// 스토리지센터 VM 삭제 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-storage-center-vm-delete').on('click', function () {
  $('#modal-title-scvm-status').text("스토리지 센터 가상머신 상태 변경");
  $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '삭제' 하시겠습니까?</p>");
  $('#button-storage-vm-status-update').html("삭제");
  $('#scvm-status-update-cmd').val("delete");
  $('#div-modal-storage-vm-status-update').show();
});

// 스토리지센터 VM 자원변경 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-storage-center-vm-resource-update').on('click', function () {
  //현재 cpu, memory 값은 선택이 되지 않도록 disabled
  $("#form-select-storage-vm-cpu-update option[value=" + sessionStorage.getItem("scvm_cpu") + "]").prop('disabled', true);
  $("#form-select-storage-vm-memory-update option[value=" + sessionStorage.getItem("scvm_momory").split(' ')[0] + "]").prop('disabled', true);
  $('#div-modal-storage-vm-resource-update').show();
});
// 전체 시스템 종료 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-auto-shutdown-step-two').on('click', function () {
  $('#modal-description-auto-shutdown').html("전체 시스템을 '종료' 하시겠습니까?<br><br> 사전에 각 호스트에 Mount된 볼륨을 작업 수행자가 직접 해제해야 합니다. 해제 후, 아래 볼륨 마운트 해제 확인 스위치를 클릭하여 계속 진행합니다.");
  $('#auto-shutdown-cmd').val("start");
  $('#div-modal-auto-shutdown').show();
  $('#button-auto-shutdown').show();
  $('#button-close-auto-shutdown').show();
  $('#modal-div-auto-shutdown-mount').show();
});

// 클라우드센터 VM DB 백업 드롭다운 버튼 클릭시
$(document).on('click', '#card-action-cloud-vm-db-dump', function () {
  $('#div-modal-db-backup-cloud-vm-first').show();
  $('#div-modal-wizard-cluster-config-finish-db-dump-file-download-empty-state').hide();
  $('#dbdump-prepare-status').hide();
});

function closeAblestackMenus() {
  $('.pf-v6-c-menu.ablestack-menu').each(function () {
    $(this).attr('hidden', true).hide();
  });
  $('.pf-v6-c-menu-toggle[aria-expanded="true"]').attr('aria-expanded', 'false');
  $('.ablestack-menu-dropdown.pf-m-expanded, .ablestack-menu-select.pf-m-expanded').removeClass('pf-m-expanded');
}

function openAblestackMenu($toggle, $menu) {
  if (!$menu || !$menu.length) {
    return;
  }
  $menu.removeAttr('hidden').show();
  if ($toggle && $toggle.length) {
    $toggle.attr('aria-expanded', 'true');
    $toggle.closest('.ablestack-menu-dropdown, .ablestack-menu-select').addClass('pf-m-expanded');
  }
}

function toggleAblestackMenu($toggle) {
  var $container = $toggle.closest('.ablestack-menu-dropdown, .ablestack-menu-select');
  var $menu = $container.find('.pf-v6-c-menu.ablestack-menu').first();
  var isOpen = $menu.length && $menu.is(':visible') && !$menu.attr('hidden');
  closeAblestackMenus();
  if (!isOpen) {
    openAblestackMenu($toggle, $menu);
  }
}

// 메뉴 외부 클릭 시 닫기
$(document).on('click', function (e) {
  if ($(e.target).closest('.ablestack-menu-dropdown, .ablestack-menu-select, .pf-v6-c-menu.ablestack-menu').length === 0) {
    closeAblestackMenus();
  }
});

// 상위 문서 영역 클릭 시 닫기 (iframe 외부 클릭)
$(top.document).on('click', function () {
  closeAblestackMenus();
});

// 메뉴 토글 클릭
$(document).on('click', '.ablestack-menu-dropdown .pf-v6-c-menu-toggle, .ablestack-menu-select .pf-v6-c-menu-toggle', function (e) {
  e.preventDefault();
  e.stopPropagation();
  toggleAblestackMenu($(this));
});

// 드롭다운 메뉴 항목 클릭 시 닫기
$(document).on('click', '.ablestack-menu-dropdown .pf-v6-c-menu__item', function () {
  closeAblestackMenus();
});

/**
 * Meathod Name : scvm_bootstrap_run
 * Date Created : 2021.04.10
 * Writer : 최진성
 * Description : scvm /root/bootstrap.sh 파일 실행
 * Parameter : 없음
 * Return : 없음
 * History : 2021.04.10 최초 작성
 */
function scvm_bootstrap_run() {
  $("#modal-status-alert-title").html("스토리지센터 가상머신 상태 체크");
  $("#modal-status-alert-body").html("스토리지센터 가상머신이 구성되지 않아<br>스토리지센터를 구성할 수 없습니다.<br><br>잠시 후 다시 실행해 주세요.");
  createLoggerInfo("scvm_bootstrap_run() start");
  //scvm ping 체크
  cockpit.spawn(["python3", pluginpath + "/python/cloudinit_status/cloudinit_status.py", "ping", "--target", "scvm"])
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        //scvm 의 cloudinit 실행이 완료되었는지 확인하기 위한 명렁
        cockpit.spawn(["python3", pluginpath + "/python/cloudinit_status/cloudinit_status.py", "status", "--target", "scvm"])
          .then(function (data) {
            var retVal = JSON.parse(data);
            //cloudinit status: done 일때
            if (retVal.code == 200 && retVal.val == "status: done") {
              $('#modal-title-scvm-status').text("스토리지센터 구성하기");
              $('#modal-description-scvm-status').html("<p>스토리지센터를 구성하시겠습니까?</p>");
              $('#button-storage-vm-status-update').html("실행");
              $('#scvm-status-update-cmd').val("bootstrap");
              $('#div-modal-storage-vm-status-update').show();
            } else {
              $('#div-modal-status-alert').show();
            }
          })
          .catch(function (data) {
            $('#div-modal-status-alert').show();
            createLoggerInfo(":::scvm_bootstrap_run() Error :::");
            console.log(":::scvm_bootstrap_run() Error :::" + data);
          });
      } else {
        $('#div-modal-status-alert').show();
      }
    })
    .catch(function (data) {
      $('#div-modal-status-alert').show();
      createLoggerInfo(":::scvm_bootstrap_run() Error :::");
      console.log(":::scvm_bootstrap_run() Error :::" + data);
    });
}

/**
 * Meathod Name : scc_link_go
 * Date Created : 2021.04.10
 * Writer : 최진성
 * Description : 스토리지센터 연결 버튼 클릭시 URL 세팅
 * Parameter : 없음
 * Return : 없음
 * History : 2021.04.10 최초 작성
 */
function scc_link_go() {
  // storageCenter url 링크 주소 가져오기
  createLoggerInfo("scc_link_go() start");
  cockpit.spawn(["python3", pluginpath + "/python/url/create_address.py", "storageCenter"])
    .then(function (data) {
      createLoggerInfo("scc_link_go start");
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        // 스토리지센터 연결
        window.open(retVal.val);
      } else {
        $("#modal-status-alert-title").html("스토리지센터 연결");
        $("#modal-status-alert-body").html(retVal.val);
        $('#div-modal-status-alert').show();
      }
    })
    .catch(function (data) {
      createLoggerInfo(":::scc_link_go() Error :::");
      console.log(":::scc_link_go() Error :::" + data);
    });
}

// 스토리지센터VM 연결 버튼 클릭시 URL 세팅
$('#menu-item-linkto-storage-center-vm').on('click', function () {
  // storageCenterVm url 링크 주소 가져오기
  createLoggerInfo("menu-item-linkto-storage-center-vm click");
  cockpit.spawn(["python3", pluginpath + "/python/url/create_address.py", "storageCenterVm"])
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        // 스토리지 센터 VM 연결
        window.open(retVal.val);
      }
    })
    .catch(function (data) {
      console.log(":::menu-item-linkto-storage-center-vm click Error ::: " + data);
    });
});

/**
 * Meathod Name : checkConfigStatus
 * Date Created : 2021.03.23
 * Writer : 박다정
 * Description : 클러스터 구성준비 상태 조회
 * Parameter : 없음
 * Return : 없음
 * History : 2021.03.23 최초 작성
 */
function checkConfigStatus() {
  //createLoggerInfo("checkConfigStatus() start");
  return new Promise((resolve) => {
    cockpit.spawn(['grep', '-c', 'ablecube', '/etc/hosts'])
      .then(data => {
        if (data >= 1) {
          cockpit.spawn(['cat', '/root/.ssh/id_rsa.pub'])
            .then(data => {
              sessionStorage.setItem("ccfg_status", "true");
              saveHostInfo();
              resolve();
            })
            .catch(err => {
              // ssh-key 파일 없음
              createLoggerInfo("no ssh-key file error");
              sessionStorage.setItem("ccfg_status", "false");
              resetBootstrap();
              resolve();
            })
          cockpit.spawn(["cat", pluginpath + "/tools/properties/cluster.json"])
            .then(function (data) {
              var clusterJsonConf = JSON.parse(data);
              sessionStorage.setItem("iscsi_check", clusterJsonConf.clusterConfig.iscsi_storage);
              cockpit.spawn(["cat", pluginpath + "/tools/properties/ablestack.json"]).then(function (data) {
                var ablestackJsonConf = JSON.parse(data);
                sessionStorage.setItem("security_patch", ablestackJsonConf.security_patch.status);
              }).catch(function (data) {
                createLoggerInfo("ablestack.json 파일 읽기 실패");
                console.log("ablestack.json 파일 읽기 실패" + data);
              })
            })
            .catch(function (data) {
              createLoggerInfo("cluster.json 파일 읽기 실패");
              console.log("cluster.json 파일 읽기 실패" + data);
            });
        }
      })
      .catch(err => {
        // hosts 파일 구성 되지않음
        createLoggerInfo("hosts file not configured error");
        sessionStorage.setItem("ccfg_status", "false");
        resetBootstrap();
        resolve();
      })
  });
}

function checkLicenseStatus() {
  return new Promise((resolve) => {
    cockpit.spawn(['python3', pluginpath + '/python/license/register_license.py', '--status'])
      .then(function (data) {
        var result = JSON.parse(data);
        if (result.code == 200) {
          // 라이센스 상태가 active인 경우
          if (result.val && result.val.status === 'active') {
            sessionStorage.setItem("license_status", "active");
            resolve();
          } else {
            sessionStorage.setItem("license_status", "inactive");
            resolve();
          }
        } else {
          sessionStorage.setItem("license_status", "error");
          resolve();
        }
      })
      .catch(function () {
        sessionStorage.setItem("license_status", "error");
        resolve();
      });
  })
}
/** all hosts update glue config modal 관련 action start */
function all_host_glue_config_update_modal() {
  $('#div-modal-update-glue-config').show();
}
function pfmp_install() {
  $('#div-modal-pfmp-install').show();
}
$('#button-close-modal-update-glue-config').on('click', function () {
  $('#div-modal-update-glue-config').hide();
});
$('#button-close-modal-pfmp-install').on('click', function () {
  $('#div-modal-pfmp-install').hide();
});
$('#button-execution-modal-pfmp-install').on('click', function () {
  $('#div-modal-pfmp-install').hide();
  $('#div-modal-spinner-pfmp-header-txt').text('PFMP 컨테이너 설치 중입니다.');
  $('#div-modal-spinner-pfmp').show();

  $("#modal-status-alert-title").html("PFMP 설치");
  $("#modal-status-alert-body").html("PFMP 설치를 실패하였습니다.<br/>PFMP 상태를 확인해주세요.");
  createLoggerInfo("pfmp_install() start");

  updatePfmpInstall(35, "second");
  cockpit.spawn(["python3", pluginpath + "/python/pfmp/pfmp_install.py", "pre_install"])
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        $("#div-modal-spinner-pfmp-header-txt").text("PFMP 클러스터 및 앱을 설치 중입니다. ");
        createLoggerInfo("pfmp containers install success");
        updatePfmpInstall(105, "minute");
        cockpit.spawn(["python3", pluginpath + "/python/pfmp/pfmp_install.py", "install"])
          .then(function (data) {
            var retVal = JSON.parse(data);
            console.log(retVal);
            if (retVal.code == 200) {
              console.log(retVal);
              $("#div-modal-spinner-pfmp-header-txt").text("PFMP 가상머신을 삭제 중입니다.");
              updatePfmpInstall(2, "second");
              cockpit.spawn(["python3", pluginpath + "/python/pfmp/pfmp_install.py", "remove"])
                .then(function (data) {
                  var retVal = JSON.parse(data);
                  console.log(retVal);
                  if (retVal.code == 200) {
                    console.log(retVal);
                    $('#div-modal-spinner-pfmp').hide();
                    $("#modal-status-alert-body").html("PFMP 설치를 성공했습니다.<br/> 성공 후 자동으로 PFMP 가상머신은 삭제됩니다.");
                    $('#div-modal-status-alert').show();
                  } else {
                    console.log(retVal);
                    $("#modal-status-alert-title").html("PFMP 설치");
                    $("#modal-status-alert-body").html("PFMP 삭제를 실패하셨습니다.<br/>PFMP 상태를 확인해주세요.");
                    $('#div-modal-spinner-pfmp').hide();
                    $('#div-modal-status-alert').show();
                    createLoggerInfo(":::pfmp_install() Error ::: error");
                    console.log(":::pfmp_install() Error :::" + data);
                  }
                })
                .catch(function (data) {
                  $('#div-modal-spinner-pfmp').hide();
                  $('#div-modal-status-alert').show();
                  createLoggerInfo(":::pfmp_install() Error ::: error");
                  console.log(":::pfmp_install() Error :::" + data);
                });
              createLoggerInfo("pfmp cluster and application install success");
            } else {
              $("#modal-status-alert-title").html("PFMP 설치");
              $("#modal-status-alert-body").html("PFMP 클러스터 및 앱 설치를 실패하셨습니다.<br/>PFMP 및 pfmp_config.json 파일 상태를 확인해주세요.");
              $('#div-modal-spinner-pfmp').hide();
              $('#div-modal-status-alert').show();
              createLoggerInfo(":::pfmp_install() Error ::: error");
              console.log(":::pfmp_install() Error :::" + data);
            }
          })
          .catch(function (data) {
            $('#div-modal-spinner-pfmp').hide();
            $('#div-modal-status-alert').show();
            createLoggerInfo(":::pfmp_install() Error ::: error");
            console.log(":::pfmp_install() Error :::" + data);
          });
      } else {
        $("#modal-status-alert-title").html("PFMP 설치");
        $("#modal-status-alert-body").html("PFMP 컨테이너 설치를 실패하셨습니다.<br/>PFMP 상태를 확인해주세요.");
        $('#div-modal-spinner-pfmp').hide();
        $('#div-modal-status-alert').show();
        createLoggerInfo(":::pfmp_install() Error ::: error");
        console.log(":::pfmp_install() Error :::" + data);
      }
    })
    .catch(function (data) {
      $('#div-modal-spinner-pfmp').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo(":::pfmp_install() Error ::: error");
      console.log(":::pfmp_install() Error :::" + data);
    });
});

$('#button-execution-modal-update-glue-config').on('click', function () {
  var console_log = true;
  $('#div-modal-update-glue-config').hide();
  $('#div-modal-spinner-header-txt').text('전체 호스트 Glue 설정 업데이트하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("전체 호스트 Glue 설정 업데이트");
  $("#modal-status-alert-body").html("전체 호스트 Glue 설정 업데이트를 실패하였습니다.<br/>CUBE 호스트, SCVM 상태를 확인해주세요.");
  createLoggerInfo("all_host_glue_config_update_modal() start");

  cockpit.spawn(["python3", pluginpath + "/python/glue/update_glue_config.py", "update"])
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-body").html("전체 호스트 Glue 설정 업데이트를 성공하였습니다");
        $('#div-modal-status-alert').show();
        createLoggerInfo("all cube hosts, scvms update keyring and ceph.confg spawn success");
      } else {
        $('#div-modal-spinner').hide();
        $('#div-modal-status-alert').show();
        createLoggerInfo(":::all_host_glue_config_update_modal() Error ::: error");
        console.log(":::all_host_glue_config_update_modal() Error :::" + data);
      }
    })
    .catch(function (data) {
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo(":::all_host_glue_config_update_modal() Error ::: error");
      console.log(":::all_host_glue_config_update_modal() Error :::" + data);
    });
});

$('#button-cancel-modal-update-glue-config').on('click', function () {
  $('#div-modal-update-glue-config').hide();
});
$('#button-cancel-modal-pfmp-install').on('click', function () {
  $('#div-modal-pfmp-install').hide();
});
/** all hosts update glue config modal 관련 action end */

/** remove cube host config modal 관련 action start */
// 전체 시스템 종료 버튼 클릭시 modal의 설명 세팅
$('#menu-item-remove-cube-host').on('click', function () {
  $('#div-modal-remove-cube-host').show();
});

$('#button-close-modal-remove-cube-host').on('click', function () {
  $('#div-modal-remove-cube-host').hide();
});

$('#button-execution-modal-remove-cube-host').on('click', function () {
  var console_log = true;
  $('#div-modal-remove-cube-host').hide();
  $('#div-modal-spinner-header-txt').text('Cube 호스트를 초기화하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("Cube 호스트 제거");
  $("#modal-status-alert-body").html("Cube 호스트 제거를 실패하였습니다.");
  createLoggerInfo("remove_cube_host_modal() start");

  /*
  todo list
  1) hosts 파일 초기화
  2) ablestack.json 초기화
  3) cluster.json 초기화
  4) vmconfig 초기화
  */
  cockpit.spawn(["python3", pluginpath + "/python/cluster/remove_cube_host.py", "remove"])
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-body").html("Cube 호스트를 초기화를 성공하였습니다");
        $('#div-modal-status-alert').show();
        createLoggerInfo("remove cube host success");
      } else {
        $('#div-modal-spinner').hide();
        $('#div-modal-status-alert').show();
        createLoggerInfo(":::remove_cube_host_modal() Error ::: error");
        console.log(":::remove_cube_host_modal() Error :::" + data);
      }
    })
    .catch(function (data) {
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo(":::remove_cube_host_modal() Error ::: error");
      console.log(":::remove_cube_host_modal() Error :::" + data);
    });
});

$('#button-cancel-modal-remove-cube-host').on('click', function () {
  $('#div-modal-remove-cube-host').hide();
});

/** move cube host config modal 관련 action end */


/**
 * Meathod Name : checkStorageClusterStatus
 * Date Created : 2021.03.31
 * Writer : 최진성
 * Description : 스토리지센터 클러스터 상태 조회
 * Parameter : 없음
 * Return : 없음
 * History : 2021.03.31 최초 작성
 */
function checkStorageClusterStatus() {
  //createLoggerInfo("checkStorageClusterStatus() start");
  return new Promise((resolve) => {
    //초기 상태 체크 중 표시
    $('#scc-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $("#scc-css").attr('class', 'pf-v6-c-label pf-m-orange');
    $("#scc-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');

    cockpit.spawn(["cat", pluginpath + "/tools/properties/cluster.json"])
      .then(function (data) {
        var retVal = JSON.parse(data);
        if (retVal.clusterConfig.type == "powerflex") {
          setPfmpStatus();
          //bootstrap.sh을 실행했는지 여부 확인
          cockpit.spawn(["python3", pluginpath + "/python/ablestack_json/ablestackJson.py", "status"])
            .then(function (data) {
              var retVal = JSON.parse(data);
              if (retVal.val.bootstrap.scvm == "false") { //bootstrap.sh 실행 전
                sessionStorage.setItem("scvm_bootstrap_status", "false");
                $("#scvm-after-bootstrap-run").html("");
                $("#scvm-before-bootstrap-run").html("<a class='pf-v6-c-menu__item' href='#' id='menu-item-bootstrap-run' onclick='scvm_bootstrap_run()'>Bootstrap 실행</a>");
              } else { //bootstrap.sh 실행 후
                sessionStorage.setItem("scvm_bootstrap_status", "true");
                $("#scvm-after-bootstrap-run").html("<a class='pf-v6-c-menu__item' href='#' id='menu-item-linkto-storage-center' onclick='scc_link_go()'>스토리지센터 연결</a>");
                $("#scvm-before-bootstrap-run").html("");
              }
              //powerflex PFMP의 bootstrap 실행전
              if (retVal.val.bootstrap.pfmp == "false") {
                sessionStorage.setItem("pfmp_bootstrap_status", "false");
                $("#pfmp-bootstrap-run").html("");
                $("#pfmp-bootstrap-run").html("<a class='pf-v6-c-menu__item pf-m-disabled' href='#' id='menu-item-pfmp-install' onclick='pfmp_install()'>PFMP 설치</a>");
              } else { //bootstrap.sh 실행 후
                sessionStorage.setItem("pfmp_bootstrap_status", "true");
                $("#pfmp-bootstrap-run").hide();
                $("#pfmp-bootstrap-run").html("");
              }
            })
            .catch(function (data) {
              createLoggerInfo("Check whether bootstrap.sh is executed Error");
              console.log(" bootstrap.sh을 실행했는지 여부 확인 Error ::: " + data);
              $("#scvm-after-bootstrap-run").html("");
              $("#scvm-before-bootstrap-run").html("");
            });
          cockpit.spawn(["python3", pluginpath + "/python/powerflex_status/powerflex_status.py", "status"])
            .then(function (data) {
              var retVal = JSON.parse(data);
              var pfmp_bootstrap_status = sessionStorage.getItem("pfmp_bootstrap_status");
              if (retVal.code == 200) {
                //파워플렉스 상태 상세 조회(API => json 형식)
                cockpit.spawn(["python3", pluginpath + "/python/powerflex_status/powerflex_status.py", "detail"])
                  .then(function (data) {
                    var retVal = JSON.parse(data);
                    var sc_status = "Health Err";
                    //Cluster 상태에 대한 값
                    if (retVal.code == 200) {
                      if (retVal.val.clusterState == "ClusteredNormal") {
                        sc_status = "Health Ok";
                        sessionStorage.setItem("sc_status", "HEALTH_OK");
                        $('#scc-status-check').text("스토리지센터 클러스터가 구성되었습니다.");
                        setStatusTone($('#scc-status-check'), "ok");
                        $("#menu-item-linkto-storage-center").removeClass('pf-m-disabled');
                        $("#menu-item-update-glue-config").removeClass('pf-m-disabled');
                        $("#scc-css").attr('class', 'pf-v6-c-label pf-m-green');
                        $("#scc-icon").attr('class', 'fas fa-fw fa-check-circle');
                      } else if (retVal.val.clusterState == "ClusteredDegraded") {
                        sc_status = "Health Warn";
                        sessionStorage.setItem("sc_status", "HEALTH_WARN");
                        $('#scc-status-check').text("스토리지센터 클러스터가 구성되었습니다.");
                        setStatusTone($('#scc-status-check'), "ok");
                        $("#menu-item-linkto-storage-center").removeClass('pf-m-disabled');
                        $("#menu-item-update-glue-config").removeClass('pf-m-disabled');
                        $("#scc-css").attr('class', 'pf-v6-c-label pf-m-orange');
                        $("#scc-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');
                      } else {
                        sc_status = "Health Err";
                        sessionStorage.setItem("sc_status", "HEALTH_ERR");
                        $("#scc-css").attr('class', 'pf-v6-c-label pf-m-red');
                        $("#scc-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');
                        $("#menu-item-set-maintenance-mode").addClass('pf-m-disabled');
                        $("#menu-item-unset-maintenance-mode").addClass('pf-m-disabled');
                        $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");
                        setStatusTone($('#scc-status-check'), "danger");
                        $("#menu-item-linkto-storage-center").addClass('pf-m-disabled');
                        $("#menu-item-update-glue-config").addClass('pf-m-disabled');
                      }
                      $('#protect-domain').show();
                      $('#manage-daemon').hide();
                      $('#scc-status').html(sc_status);

                      if (retVal.val.devices[0].total_disks != "N/A" && retVal.val.devices[0].disk_state != "N/A") {
                        $('#scc-osd').text("전체 " + retVal.val.devices[0].total_disks + "개의 디스크 중 " + retVal.val.devices[0].disk_state + "개 작동 중");
                      }
                      if (retVal.val.tieBreakers != "N/A" && retVal.val.slave != "N/A" && retVal.val.master != "N/A") {
                        $('#scc-gw').text("PowerFlex GW " + retVal.val.goodNodesNum + "개 실행 중 / " + retVal.val.goodNodesNum + "개 제공 중(quorum : " + retVal.val.master.hostname + "," + retVal.val.slaves[0].hostname + "," + retVal.val.tieBreakers[0].hostname + ")");
                      }
                      if (retVal.val.protection_domains != "N/A") {
                        $('#scc-protect-domain').text(retVal.val.protection_domains.length + " 개의 보호도메인")
                        var len = 0;
                        for (var i = 0; i < retVal.val.protection_domains.length; i++) {
                          for (var j = 0; j < retVal.val.protection_domains[i].storage_pools.length; j++) {
                            len += 1;
                          }
                        }
                        $('#scc-pools').text(len + " 개의 풀");
                      }
                      if (retVal.val.protection_domains[0].capactiy != "N/A") {
                        $('#scc-usage').text("전체 " + retVal.val.protection_domains[0].capacity[0].limit_capacity + " 중 " + retVal.val.protection_domains[0].capacity[0].used_capacity + " 사용 중 (사용가능 " + retVal.val.protection_domains[0].capacity[0].unused_capacity + ")");
                      }
                      resolve();
                    } else {
                      sc_status = "Health Err";
                      sessionStorage.setItem("sc_status", sc_status);
                      $("#scc-css").attr('class', 'pf-v6-c-label pf-m-red');
                      $("#scc-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');
                      $("#menu-item-set-maintenance-mode").addClass('pf-m-disabled');
                      $("#menu-item-unset-maintenance-mode").addClass('pf-m-disabled');
                      $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");
                      setStatusTone($('#scc-status-check'), "danger");
                      $("#menu-item-linkto-storage-center").addClass('pf-m-disabled');
                      $("#menu-item-update-glue-config").addClass('pf-m-disabled');
                      $('#protect-domain').show();
                      $('#manage-daemon').hide();
                      $('#scc-status').html(sc_status);
                      resolve();
                    }

                  })
                  .catch(function (data) {
                    createLoggerInfo(":::checkStorageClusterStatus() Error:::");
                    console.log(":::checkStorageClusterStatus() Error::: " + data);
                    $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");
                    setStatusTone($('#scc-status-check'), "danger");
                    $("#menu-item-set-maintenance-mode").addClass('pf-m-disabled');
                    $("#menu-item-unset-maintenance-mode").addClass('pf-m-disabled');
                    $("#menu-item-linkto-storage-center").addClass('pf-m-disabled');
                    $("#menu-item-update-glue-config").addClass('pf-m-disabled');
                    $("#menu-item-bootstrap-run").addClass('pf-m-disabled');
                    resolve();
                  });
              } else {
                sc_status = "Health Err";
                sessionStorage.setItem("sc_status", sc_status);
                $("#scc-css").attr('class', 'pf-v6-c-label pf-m-red');
                $("#scc-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');
                $("#menu-item-set-maintenance-mode").addClass('pf-m-disabled');
                $("#menu-item-unset-maintenance-mode").addClass('pf-m-disabled');
                $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");
                setStatusTone($('#scc-status-check'), "danger");
                $("#menu-item-linkto-storage-center").addClass('pf-m-disabled');
                $("#menu-item-update-glue-config").addClass('pf-m-disabled');
                $('#protect-domain').show();
                $('#manage-daemon').hide();
                $('#scc-status').html(sc_status);
                resolve();
              }
            })
            .catch(function (data) {
              createLoggerInfo(":::checkStorageClusterStatus() Error:::");
              console.log(":::checkStorageClusterStatus() Error::: " + data);
              $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");
              setStatusTone($('#scc-status-check'), "danger");
              $("#menu-item-set-maintenance-mode").addClass('pf-m-disabled');
              $("#menu-item-unset-maintenance-mode").addClass('pf-m-disabled');
              $("#menu-item-linkto-storage-center").addClass('pf-m-disabled');
              $("#menu-item-update-glue-config").addClass('pf-m-disabled');
              $("#menu-item-bootstrap-run").addClass('pf-m-disabled');
              resolve();
            });
        } else {
          //bootstrap.sh을 실행했는지 여부 확인
          cockpit.spawn(["python3", pluginpath + "/python/ablestack_json/ablestackJson.py", "status"])
            .then(function (data) {
              var retVal = JSON.parse(data);
              if (retVal.val.bootstrap.scvm == "false") { //bootstrap.sh 실행 전
                sessionStorage.setItem("scvm_bootstrap_status", "false");
                $("#scvm-after-bootstrap-run").html("");
                $("#scvm-before-bootstrap-run").html("<a class='pf-v6-c-menu__item' href='#' id='menu-item-bootstrap-run' onclick='scvm_bootstrap_run()'>스토리지센터 구성하기</a>");
              } else { //bootstrap.sh 실행 후
                sessionStorage.setItem("scvm_bootstrap_status", "true");
                $("#scvm-after-bootstrap-run").html("<a class='pf-v6-c-menu__item' href='#' id='menu-item-linkto-storage-center' onclick='scc_link_go()'>스토리지센터 연결</a>");
                $("#scvm-after-update-glue-config").html("<a class='pf-v6-c-menu__item' href='#' id='menu-item-update-glue-config' onclick='all_host_glue_config_update_modal()'>전체 호스트 Glue 설정 업데이트</a>");
                $("#scvm-before-bootstrap-run").html("");
              }
            })
            .catch(function (data) {
              createLoggerInfo("Check whether bootstrap.sh is executed Error");
              console.log(" bootstrap.sh을 실행했는지 여부 확인 Error ::: " + data);
              $("#scvm-after-bootstrap-run").html("");
              $("#scvm-before-bootstrap-run").html("");
            });
          //스토리지 클러스터 상태 상세조회(ceph -s => json형식)
          cockpit.spawn(["python3", pluginpath + "/python/scc_status/scc_status_detail.py", "detail"])
            .then(function (data) {
              var retVal = JSON.parse(data);
              var sc_status = "Health Err";
              var inMessHtml = "";
              sessionStorage.setItem("sc_status", retVal.val.cluster_status); //스토리지 클러스터 상태값 세션스토리지에 저장
              sessionStorage.setItem("storage_cluster_maintenance_status", retVal.val.maintenance_status); //스토리지 클러스터 유지보수 상태값 세션스토리지에 저장
              //스토리지 클러스터 유지보수 상태 확인 후 버튼 disabled 여부 세팅
              if (retVal.val.maintenance_status) {
                $("#menu-item-set-maintenance-mode").addClass('pf-m-disabled');
                $("#menu-item-unset-maintenance-mode").removeClass('pf-m-disabled');
              } else {
                $("#menu-item-set-maintenance-mode").removeClass('pf-m-disabled');
                $("#menu-item-unset-maintenance-mode").addClass('pf-m-disabled');
              }
              //스토리지 클러스터 상태값에 따라 icon 및 색상 변경을 위한 css 설정 값 세팅
              if (retVal.val.cluster_status == "HEALTH_OK") {
                sc_status = "Health Ok";
                $('#scc-status-check').text("스토리지센터 클러스터가 구성되었습니다.");
                setStatusTone($('#scc-status-check'), "ok");
                $("#menu-item-linkto-storage-center").removeClass('pf-m-disabled');
                $("#menu-item-update-glue-config").removeClass('pf-m-disabled');
                $('#menu-item-set-disk-image-add').removeClass('pf-m-disabled');
                $('#menu-item-set-disk-image-delete').removeClass('pf-m-disabled');

                $("#scc-css").attr('class', 'pf-v6-c-label pf-m-green');
                $("#scc-icon").attr('class', 'fas fa-fw fa-check-circle');
              } else if (retVal.val.cluster_status == "HEALTH_WARN") {
                sc_status = "Health Warn";
                $('#scc-status-check').text("스토리지센터 클러스터가 구성되었습니다.");
                setStatusTone($('#scc-status-check'), "ok");
                $("#menu-item-linkto-storage-center").removeClass('pf-m-disabled');
                $("#menu-item-update-glue-config").removeClass('pf-m-disabled');
                $("#scc-css").attr('class', 'pf-v6-c-label pf-m-orange');
                $("#scc-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');
              } else if (retVal.val.cluster_status == "HEALTH_ERR") {
                sc_status = "Health Err";
                $("#scc-css").attr('class', 'pf-v6-c-label pf-m-red');
                $("#scc-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');
                $("#menu-item-set-maintenance-mode").addClass('pf-m-disabled');
                $("#menu-item-unset-maintenance-mode").addClass('pf-m-disabled');
                $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");
                setStatusTone($('#scc-status-check'), "danger");
                $("#menu-item-linkto-storage-center").addClass('pf-m-disabled');
                $("#menu-item-update-glue-config").addClass('pf-m-disabled');
                $('#menu-item-set-disk-image-add').addClass('pf-m-disabled');
                $('#menu-item-set-disk-image-delete').addClass('pf-m-disabled');
              }
              $('#manage-daemon').show();
              //json으로 넘겨 받은 값들 세팅
              if (retVal.val.cluster_status != "HEALTH_OK") {
                //json key중 'message'이라는 key의 value값 가져옴
                const recurse = (obj, arr = []) => {
                  Object.entries(obj).forEach(([key, val]) => {
                    if (key === 'message') {
                      arr.push(val);
                    }
                    if (typeof val === 'object') {
                      recurse(val, arr);
                    }
                  });
                  return arr;
                };
                //health상태가 warn, error일경우 message 정보 확인하기 위함.
                var messArr = recurse(retVal);
                for (var i in messArr) {
                  inMessHtml = inMessHtml + "<br> - " + messArr[i];
                }
                $('#scc-status').html(sc_status + inMessHtml);
              } else {
                $('#scc-status').html(sc_status);
              }
              if (retVal.val.osd != "N/A" && retVal.val.osd_up != "N/A") {
                $('#scc-osd').text("전체 " + retVal.val.osd + "개의 디스크 중 " + retVal.val.osd_up + "개 작동 중");
              }
              if (retVal.val.mon_gw1 != "N/A" && retVal.val.mon_gw2 != "N/A") {
                if (retVal.val.json_raw.health.checks.hasOwnProperty('MON_DOWN')) {//health 상태값 중 MON_DOWN 값이 있을때
                  activeGwCnt = parseInt(retVal.val.mon_gw1) - parseInt(retVal.val.json_raw.health.checks.MON_DOWN.summary.count);//다운된 mon count 확인해 실행중인(activeGwCnt) mon count 값세팅
                } else {
                  activeGwCnt = retVal.val.mon_gw1;
                }
                $('#scc-gw').text("RBD GW " + activeGwCnt + "개 실행 중 / " + retVal.val.mon_gw1 + "개 제공 중(quorum : " + retVal.val.mon_gw2 + ")");
              }
              if (retVal.val.mgr != "N/A" && retVal.val.mgr_cnt != "N/A") {
                $('#scc-mgr').text(retVal.val.mgr + "(전체 " + retVal.val.mgr_cnt + "개 실행중)");
              }
              if (retVal.val.pools != "N/A") {
                $('#scc-pools').text(retVal.val.pools + " pools");
              }
              if (retVal.val.avail != "N/A" && retVal.val.used != "N/A" && retVal.val.usage_percentage != "N/A") {
                $('#scc-usage').text("전체 " + retVal.val.avail + " 중 " + retVal.val.used + " 사용 중 (사용률 " + retVal.val.usage_percentage + " %)");
              }
              resolve();
            })
            .catch(function (data) {
              createLoggerInfo(":::checkStorageClusterStatus() Error:::");
              console.log(":::checkStorageClusterStatus() Error::: " + data);
              $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");
              setStatusTone($('#scc-status-check'), "danger");
              $("#menu-item-set-maintenance-mode").addClass('pf-m-disabled');
              $("#menu-item-unset-maintenance-mode").addClass('pf-m-disabled');
              $("#menu-item-linkto-storage-center").addClass('pf-m-disabled');
              $("#menu-item-update-glue-config").addClass('pf-m-disabled');
              $("#menu-item-bootstrap-run").addClass('pf-m-disabled');
              $('#menu-item-set-disk-image-add').addClass('pf-m-disabled');
              $('#menu-item-set-disk-image-delete').addClass('pf-m-disabled');
              resolve();
            });
        }//else문
      });

  });
}


/**
 * Meathod Name : checkStorageVmStatus
 * Date Created : 2021.03.31
 * Writer : 최진성
 * Description : 스토리지센터 가상머신 상태 조회
 * Parameter : 없음
 * Return : 없음
 * History : 2021.03.31 최초 작성
 */
function checkStorageVmStatus() {
  //createLoggerInfo("checkStorageVmStatus() start");
  return new Promise((resolve) => {
    //초기 상태 체크 중 표시
    $('#scvm-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $("#scvm-css").attr('class', 'pf-v6-c-label pf-m-orange');
    $("#scvm-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');

    //scvm 상태 조회
    cockpit.spawn(["python3", pluginpath + "/python/scvm_status/scvm_status_detail.py", "detail"])
      .then(function (data) {
        var retVal = JSON.parse(data);
        sessionStorage.setItem("scvm_status", retVal.val.scvm_status.toUpperCase());//스트리지센터 가상머신 상태값 세션스토리지에 저장
        sessionStorage.setItem("scvm_cpu", retVal.val.vcpu);//스트리지센터 가상머신 상태값 세션스토리지에 저장
        sessionStorage.setItem("scvm_momory", retVal.val.memory);//스트리지센터 가상머신 상태값 세션스토리지에 저장

        //json으로 넘겨 받은 값들 세팅
        var scvm_status = retVal.val.scvm_status;
        if (scvm_status == "running") {
          scvm_status = "Running";
        } else if (scvm_status == "shut off") {
          scvm_status = "Stopped";
        } else {
          scvm_status = "Health Err";
        }
        $('#scvm-status').text(scvm_status);
        if (retVal.val.vcpu != "N/A") {
          $('#scvm-cpu').text(retVal.val.vcpu + " vCore");
        }
        //$('#scvm-cpu').text(retVal.val.vcpu + "vCore(" + retVal.val.socket + " Socket, "+retVal.val.core+" Core)");
        if (retVal.val.memory != "N/A") {
          $('#scvm-memory').text(retVal.val.memory);
        }
        if (retVal.val.rootDiskSize != "N/A" && retVal.val.rootDiskAvail != "N/A" && retVal.val.rootDiskUsePer != "N/A") {
          $('#scvm-rdisk').text(retVal.val.rootDiskSize + "(사용가능 " + retVal.val.rootDiskAvail + " / 사용률 " + retVal.val.rootDiskUsePer + ")");
        }
        if (retVal.val.manageNicType != "N/A" && retVal.val.manageNicParent != "N/A") {
          $('#scvm-manage-nic-type').text("NIC Type : " + retVal.val.manageNicType + " (Parent : " + retVal.val.manageNicParent + ")");
        }
        if (retVal.val.manageNicIp != "N/A") {
          $('#scvm-manage-nic-ip').text("IP : " + retVal.val.manageNicIp.split("/")[0]);
          $('#scvm-manage-nic-ip-prefix').text("PREFIX : " + retVal.val.manageNicIp.split("/")[1]);
        }
        if (retVal.val.manageNicGw != "N/A") {
          $('#scvm-manage-nic-gw').text("GW : " + retVal.val.manageNicGw);
        }
        if (retVal.val.manageNicDns != "N/A") {
          $('#scvm-manage-nic-dns').text("DNS : " + retVal.val.manageNicDns);
        }
        if (retVal.val.storageServerNicType != "N/A") {
          $('#scvm-storage-server-nic-type').text("서버용 NIC Type : " + retVal.val.storageServerNicType);
          if (retVal.val.storageServerNicParent != "N/A") {
            $('#scvm-storage-server-nic-type').text("서버용 NIC Type : " + retVal.val.storageServerNicType + " (Parent : " + retVal.val.storageServerNicParent + ")");
          }
        }
        if (retVal.val.storageServerNicIp != "N/A") {
          $('#scvm-storage-server-nic-ip').text("서버용 IP : " + retVal.val.storageServerNicIp);
        }
        if (retVal.val.storageReplicationNicType != "N/A") {
          $('#scvm-storage-replication-nic-type').text("복제용 NIC Type : " + retVal.val.storageReplicationNicType);
          if (retVal.val.storageReplicationNicParent != "N/A") {
            $('#scvm-storage-replication-nic-type').text("복제용 NIC Type : " + retVal.val.storageReplicationNicType + " (Parent : " + retVal.val.storageReplicationNicParent + ")");
          }
        }
        if (retVal.val.storageReplicationNicIp != "N/A") {
          $('#scvm-storage-replication-nic-ip').text("복제용 IP : " + retVal.val.storageReplicationNicIp);
        }
        if (retVal.val.dataDiskType != "N/A") {
          $('#scvm-storage-datadisk-type').text("Disk Type : " + retVal.val.dataDiskType);
        }

        //스토리지 센터 가상머신 toggle세팅
        if (retVal.val.scvm_status == "running") { //가상머신 상태가 running일 경우
          $("#scvm-css").attr('class', 'pf-v6-c-label pf-m-green');
          $("#scvm-icon").attr('class', 'fas fa-fw fa-check-circle');
          $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되었습니다.");
          setStatusTone($('#scvm-deploy-status-check'), "ok");
          $("#menu-item-set-storage-center-vm-start").addClass('pf-m-disabled');
          $("#menu-item-set-storage-center-vm-resource-update").addClass('pf-m-disabled');
          // $("#menu-item-linkto-storage-center-vm").removeClass('pf-m-disabled');
          if (sessionStorage.getItem("sc_status") == "HEALTH_ERR") { //가상머신 상태 running && sc상태 Error 일때
            $("#menu-item-set-storage-center-vm-delete").removeClass('pf-m-disabled');
          } else { //가상머신 상태 running && sc상태 ok, warn 일때
            $("#menu-item-set-storage-center-vm-delete").addClass('pf-m-disabled');
          }
          if (os_type == "ablestack-hci" || os_type == "ablestack-hci-filesystem") {
            if (sessionStorage.getItem("storage_cluster_maintenance_status") == "true") { //가상머신 상태 running && sc 유지보수모드일때
              $("#menu-item-set-storage-center-vm-stop").removeClass('pf-m-disabled');
            } else {//가상머신 상태 running && sc 유지보수모드 아닐때
              $("#menu-item-set-storage-center-vm-stop").addClass('pf-m-disabled');
            }
          } else {
            $("#menu-item-set-storage-center-vm-stop").removeClass('pf-m-disabled');
          }
        } else if (retVal.val.scvm_status == "shut off") { //가상머신 상태가 shut off일 경우
          $("#scvm-css").attr('class', 'pf-v6-c-label pf-m-red');
          $("#scvm-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');
          $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되었습니다.");
          setStatusTone($('#scvm-deploy-status-check'), "ok");
          $("#menu-item-set-storage-center-vm-start").removeClass('pf-m-disabled');
          $("#menu-item-set-storage-center-vm-stop").addClass('pf-m-disabled');
          $("#menu-item-set-storage-center-vm-delete").removeClass('pf-m-disabled');
          $("#menu-item-set-storage-center-vm-resource-update").attr('class', 'pf-v6-c-menu__item');
          $("#menu-item-linkto-storage-center-vm").addClass('pf-m-disabled');
        } else {//가상머신 상태가 health_err일 경우
          $("#scvm-css").attr('class', 'pf-v6-c-label pf-m-red');
          $("#scvm-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');
          $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되지 않았습니다.");
          setStatusTone($('#scvm-deploy-status-check'), "danger");
          $("#menu-item-set-storage-center-vm-start").addClass('pf-m-disabled');
          $("#menu-item-set-storage-center-vm-stop").addClass('pf-m-disabled');
          $("#menu-item-set-storage-center-vm-delete").addClass('pf-m-disabled');
          $("#menu-item-set-storage-center-vm-resource-update").addClass('pf-m-disabled');
          $("#menu-item-linkto-storage-center-vm").addClass('pf-m-disabled');
          $("#menu-item-bootstrap-run").addClass('pf-m-disabled');
        }
        resolve();
      })
      .catch(function (data) {
        createLoggerInfo(":::checkStorageVmStatus Error:::");
        console.log(":::checkStorageVmStatus Error:::" + data);
        $("#menu-item-set-storage-center-vm-start").addClass('pf-m-disabled');
        $("#menu-item-set-storage-center-vm-stop").addClass('pf-m-disabled');
        $("#menu-item-set-storage-center-vm-delete").addClass('pf-m-disabled');
        $("#menu-item-set-storage-center-vm-resource-update").addClass('pf-m-disabled');
        $("#menu-item-linkto-storage-center-vm").addClass('pf-m-disabled');
        $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되지 않았습니다.");
        setStatusTone($('#scvm-deploy-status-check'), "danger");
        resolve();
      });
    //스토리지 클러스터 배포 여부 확인 후 스토리지센터 가상머신 삭제 버튼 disabled 여부 세팅
    if (sessionStorage.getItem("sc_status") == "HEALTH_ERR") {
      $("#menu-item-set-storage-center-vm-delete").removeClass('class', 'pf-m-disabled');
    } else {
      $("#menu-item-set-storage-center-vm-delete").addClass('class', 'pf-m-disabled');
    }
  });
}

function sleep(sec) {
  let start = Date.now(), now = start;
  while (now - start < sec * 1000) {
    now = Date.now();
  }
}

/**
 * Meathod Name : checkDeployStatus
 * Date Created : 2021.03.30
 * Writer : 박다정
 * Description : 요약리본 UI 배포상태에 따른 이벤트 처리
 * Parameter : 없음
 * Return : 없음
 * History : 2021.03.30 최초 작성
 */
function checkDeployStatus() {
  setTimeout(function () {
    // 배포 상태 조회 전 버튼 hide 처리
    $('#button-open-modal-wizard-storage-cluster').hide();
    $('#button-open-modal-wizard-storage-vm').hide();
    $('#button-open-modal-wizard-pfmp-vm').hide();
    $('#button-open-modal-wizard-cloud-vm').hide();
    $('#button-link-storage-center-dashboard').hide();
    $('#button-link-gfs-storage-configure').hide();
    $('#button-link-hci-shared-file-configure').hide();
    $('#button-link-cloud-center').hide();
    $('#button-open-modal-wizard-monitoring-center').hide();
    $('#button-link-monitoring-center').hide();
    $('#button-config-file-download').hide();
    $('#button-open-modal-security-evidence').hide();
    /*
    가상머신 배포 및 클러스터 구성 상태를 세션 스토리지에서 조회
    - 클러스터 구성준비 상태 = false, true
    - 스토리지센터 가상머신 상태 = HEALTH_ERR(배포x), RUNNING, SHUT OFF 등
    - 스토리지센터 가상머신 부트스트랩 실행 상태 = false, true
    - 스토리지센터 클러스터 상태 = HEALTH_ERR(구성x), HEALTH_OK, HEALTH_WARN 등
    - 클라우드센터 클러스터 상태 = HEALTH_ERR1(구성x), HEALTH_ERR2(리소스 구성x), HEALTH_OK
    - 클라우드센터 가상머신 상태 = HEALTH_ERR(배포x), RUNNING, SHUT OFF 등
    - 클라우드센터 가상머신 부트스트랩 실행 상태 = false, true
    */
    const os_type = sessionStorage.getItem("os_type");

    const step0 = sessionStorage.getItem("license_status");
    const step1 = sessionStorage.getItem("ccfg_status");
    const step2 = sessionStorage.getItem("scvm_status");
    const step3 = sessionStorage.getItem("scvm_bootstrap_status");
    const step4 = sessionStorage.getItem("sc_status");
    const step5 = sessionStorage.getItem("cc_status");
    const step6 = sessionStorage.getItem("ccvm_status");
    const step7 = sessionStorage.getItem("ccvm_bootstrap_status");
    const step8 = sessionStorage.getItem("wall_monitoring_status");

    // powerflex용 sessionStorage
    const step9 = sessionStorage.getItem("pfmp_status");
    const step10 = sessionStorage.getItem("pfmp_bootstrap_status");

    const step11 = sessionStorage.getItem("gfs_configure");
    const step12 = sessionStorage.getItem("local_configure");
    const step13 = sessionStorage.getItem("security_patch");
    $('#button-open-modal-security-evidence').toggle(step13 == "true");

    // 배포 상태조회
    if (os_type == "ablestack-hci") {
      console.log("step0 :: " + step0 + ", step1 :: " + step1 + ", step2 :: " + step2 + " , step3 :: " + step3 + ", step4 :: " + step4 + ", step5 :: " + step5 + ", step6 :: " + step6 + ", step7 :: " + step7 + ", step8 :: " + step8);
      if (step1 != "true") {
        // 클러스터 구성준비 버튼 show
        $('#button-open-modal-wizard-storage-cluster').show();
        showRibbon('warning', '스토리지센터 및 클라우드센터 VM이 배포되지 않았습니다. 클러스터 구성준비를 진행하십시오.');
      } else {
        $('#button-config-file-download').show();
        if (step2 == "HEALTH_ERR" || step2 == null) {
          // 외부 스토리지 버튼 활성화
          $('#button-hci-multipath-sync').prop('disabled', false);
          $('#button-hci-storage-rescan').prop('disabled', false);
          // 클러스터 구성준비 버튼, 스토리지센터 VM 배포 버튼 show
          $('#button-open-modal-wizard-storage-cluster').show();
          $('#button-open-modal-wizard-storage-vm').show();
          showRibbon('warning', '스토리지센터 및 클라우드센터 VM이 배포되지 않았습니다. 스토리지센터 VM 배포를 진행하십시오.');
        } else {
          $('#button-hci-multipath-sync').prop('disabled', false);
          $('#button-hci-storage-rescan').prop('disabled', false);
          if (step3 != "true") {
            showRibbon('warning', '스토리지센터 대시보드에 연결할 수 있도록 스토리지센터 구성하기 작업을 진행하십시오.');
          } else {
            if (step8 != "true" && step4 == "Health Err" || step4 == null) {
              // 스토리지센터 연결 버튼 show
              $('#button-open-modal-wizard-cloud-vm').show();
              $('#button-link-storage-center-dashboard').show();
              showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 스토리지센터에 연결하여 스토리지 클러스터 구성한 후 클라우드센터 VM 배포를 진행하십시오.');
            } else {
              if (step8 != "true" && step5 == "HEALTH_ERR1" || step5 == "HEALTH_ERR2" || step5 == null) {
                //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                $('#button-open-modal-wizard-cloud-vm').show();
                $('#button-link-storage-center-dashboard').show();
                if (step8 != "true" && step5 == "HEALTH_ERR1" || step5 == null) {
                  showRibbon('warning', '클라우드센터 클러스터가 구성되지 않았습니다. 클라우드센터 클러스터 구성을 진행하십시오.');
                } else {
                  showRibbon('warning', '클라우드센터 클러스터는 구성되었으나 리소스 구성이 되지 않았습니다. 리소스 구성을 진행하십시오.');
                }
              } else {
                if (step8 != "true" && step6 == "HEALTH_ERR" || step6 == null) {
                  //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                  $('#button-open-modal-wizard-cloud-vm').show();
                  $('#button-link-storage-center-dashboard').show();
                  showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 클라우드센터 VM 배포를 진행하십시오.');
                } else {
                  if (step8 != "true" && step7 != "true") {
                    showRibbon('warning', '클라우드센터에 연결할 수 있도록 클라우드센터 구성하기 작업을 진행하십시오.');
                  } else {
                    // 스토리지센터 연결 버튼, 클라우드센터 연결 버튼 show, 모니터링센터 구성 버튼 show
                    $('#button-link-storage-center-dashboard').show();
                    $('#button-link-cloud-center').show();

                    if (step8 != "true") {
                      $('#button-open-modal-wizard-monitoring-center').show();
                      showRibbon('warning', '모니터링센터에 연결할 수 있도록 모니터링센터 구성 작업을 진행하십시오.');
                    } else {
                      // 모니터링센터 구성 연결 버튼 show
                      $('#button-link-monitoring-center').show();
                      $('#button-cloud-cluster-ssh-port').removeClass('pf-m-disabled');

                      showRibbon('success', 'ABLESTACK 스토리지센터 및 클라우드센터 VM 배포되었으며 모니터링센터 구성이 완료되었습니다. 가상어플라이언스 상태가 정상입니다.');
                      // 운영 상태조회
                      let msg = "";
                      if (step2 != "RUNNING") {
                        msg += '스토리지센터 가상머신이 ' + step2 + ' 상태 입니다.\n';
                        msg += '스토리지센터 가상머신이 shut off 상태일 경우 스토리지센터 가상머신 카드에서 스토리지센터 VM을 시작해주세요.\n';
                        showRibbon('warning', msg);
                      }
                      if (step4 != "HEALTH_OK") {
                        msg += '스토리지센터 클러스터가 ' + step4 + ' 상태 입니다.\n';
                        msg += 'oout, nobackfill, norecover flag인 경우 의도하지 않은 유지보수 모드일 경우 스토리지센터 클러스터 상태 카드에서 유지보수 모드 해제해주세요.\n';
                        msg += '스토리지센터 클러스터 상태가 Monitor clock detected 인 경우 cube host, scvm, ccvm의 ntp 시간 동기화 작업을 해야합니다.';
                        showRibbon('warning', msg);
                      }
                      if (step6 != "RUNNING") {
                        msg += '클라우드센터 가상머신이 ' + step6 + ' 상태 입니다.\n';
                        msg += '클라우드센터 가상머신 Mold 서비스 , DB 상태를 확인하여 정지상태일 경우 서비스 재시작\n';
                        msg += '또는 클라우드센터 클러스터 상태 카드에서 가상머신 시작하여 문제를 해결할 수 있습니다.';
                        showRibbon('warning', msg);
                      }
                      if (step13 == "false") {
                        $('#button-open-modal-security-update').show();
                      } else {
                        $('#button-open-modal-security-update').hide();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else if (os_type == "powerflex") {
      console.log("step0 :: " + step0 + ", step1 :: " + step1 + ", step2 :: " + step2 + " , step3 :: " + step3 + ", step4 :: " + step4 + ", step5 :: " + step5 + ", step6 :: " + step6 + ", step7 :: " + step7 + ", step8 :: " + step8 + ", stpe9 :: " + step9 + ", step10 :: " + step10);
      if (step1 != "true") {
        // 클러스터 구성준비 버튼 show
        $('#button-open-modal-wizard-storage-cluster').show();
        showRibbon('warning', '스토리지센터 및 파워플렉스 관리 플랫폼 및 클라우드센터 VM이 배포되지 않았습니다. 클러스터 구성준비를 진행하십시오.');
      } else {
        $('#button-config-file-download').show();
        if (step2 == "HEALTH_ERR" || step2 == null) {
          // 외부 스토리지 버튼 활성화
          $('#button-gfs-multipath-sync').prop('disabled', false);
          $('#button-gfs-storage-rescan').prop('disabled', false);
          // 클러스터 구성준비 버튼, 스토리지센터 VM 배포 버튼 show
          $('#button-open-modal-wizard-storage-cluster').show();
          $('#button-open-modal-wizard-storage-vm').show();
          showRibbon('warning', '스토리지센터 및 파워 플렉스 관리 플랫폼 및 클라우드센터 VM이 배포되지 않았습니다. 스토리지센터 VM 배포를 진행하십시오.');
        } else {
          $('#button-gfs-multipath-sync').prop('disabled', false);
          $('#button-gfs-storage-rescan').prop('disabled', false);
          if (step3 != "true") {
            showRibbon('warning', '스토리지센터의 설정을 위해 스토리지센터 구성하기 작업을 진행하십시오.');
          } else {
            //여기서 들어가야지 pfmp에 대한
            if (step8 != "true" && ((step9 == "HEALTH_ERR" || step9 == "null") && step10 == "false")) {
              $('#button-open-modal-wizard-pfmp-vm').show();
              showRibbon('warning', '파워플렉스 관리 플랫폼 VM이 배포되지 않았습니다. 파워플렉스 관리 플랫폼 VM 배포를 진행하십시오.');
              if (step10 == "true") {
                if (step8 != "true" && (step5 == "HEALTH_ERR1" || step5 == "HEALTH_ERR2" || step5 == null)) {
                  //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                  $('#button-open-modal-wizard-cloud-vm').show();
                  $('#button-link-storage-center-dashboard').show();
                  if (step8 != "true" && step5 == "HEALTH_ERR1" || step5 == null) {
                    showRibbon('warning', '클라우드센터 클러스터가 구성되지 않았습니다. 클라우드센터 클러스터 구성을 진행하십시오.');
                  } else {
                    showRibbon('warning', '클라우드센터 클러스터는 구성되었으나 리소스 구성이 되지 않았습니다. 리소스 구성을 진행하십시오.');
                  }
                } else {
                  if (step8 != "true" && (step6 == "HEALTH_ERR" || step6 == null)) {
                    //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                    $('#button-open-modal-wizard-cloud-vm').show();
                    $('#button-link-storage-center-dashboard').show();
                    showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 클라우드센터 VM 배포를 진행하십시오.');
                  } else {
                    if (step8 != "true" && step7 != "true") {
                      showRibbon('warning', '클라우드센터에 연결할 수 있도록 클라우드센터 구성하기 작업을 진행하십시오.');
                    } else {
                      // 스토리지센터 연결 버튼, 클라우드센터 연결 버튼 show, 모니터링센터 구성 버튼 show
                      $('#button-link-storage-center-dashboard').show();
                      $('#button-link-cloud-center').show();

                      if (step8 != "true") {
                        $('#button-open-modal-wizard-monitoring-center').show();
                        showRibbon('warning', '모니터링센터에 연결할 수 있도록 모니터링센터 구성 작업을 진행하십시오.');
                      } else {
                        // 모니터링센터 구성 연결 버튼 show
                        $('#button-link-monitoring-center').show();
                        $('#button-cloud-cluster-ssh-port').removeClass('pf-m-disabled');

                        showRibbon('success', 'ABLESTACK 스토리지센터 및 클라우드센터 VM 배포되었으며 모니터링센터 구성이 완료되었습니다. 가상어플라이언스 상태가 정상입니다.');
                        // 운영 상태조회
                        let msg = "";
                        if (step2 != "RUNNING") {
                          msg += '스토리지센터 가상머신이 ' + step2 + ' 상태 입니다.\n';
                          msg += '스토리지센터 가상머신이 shut off 상태일 경우 스토리지센터 가상머신 카드에서 스토리지센터 VM을 시작해주세요.\n';
                          showRibbon('warning', msg);
                        }
                        if (step4 != "HEALTH_OK") {
                          msg += '스토리지센터 클러스터가 ' + step4 + ' 상태 입니다.\n';
                          msg += 'oout, nobackfill, norecover flag인 경우 의도하지 않은 유지보수 모드일 경우 스토리지센터 클러스터 상태 카드에서 유지보수 모드 해제해주세요.\n';
                          msg += '스토리지센터 클러스터 상태가 Monitor clock detected 인 경우 cube host, scvm, ccvm의 ntp 시간 동기화 작업을 해야합니다.';
                          showRibbon('warning', msg);
                        }
                        if (step6 != "RUNNING") {
                          msg += '클라우드센터 가상머신이 ' + step6 + ' 상태 입니다.\n';
                          msg += '클라우드센터 가상머신 Mold 서비스 , DB 상태를 확인하여 정지상태일 경우 서비스 재시작\n';
                          msg += '또는 클라우드센터 클러스터 상태 카드에서 가상머신 시작하여 문제를 해결할 수 있습니다.';
                          showRibbon('warning', msg);
                        }
                        if (step13 == "false") {
                          $('#button-open-modal-security-update').show();
                        } else {
                          $('#button-open-modal-security-update').hide();
                        }
                      }
                    }
                  }
                }
              }
            } else {
              if (step10 != "true") {
                $('#menu-item-pfmp-install').removeClass('pf-m-disabled');
                showRibbon('warning', '파워플렉스 관리 플랫폼의 쿠버네티스 설정을 위해 파워플렉스 관리 플랫폼 VM 구성하기 작업을 진행하십시오.');
              } else {
                if (step8 != "true" && (step5 == "HEALTH_ERR1" || step5 == "HEALTH_ERR2" || step5 == null)) {
                  //클라우드센터 VM 배포 버튼
                  $('#button-open-modal-wizard-cloud-vm').show();
                  $('#button-link-storage-center-dashboard').show();
                  if (step8 != "true" && (step5 == "HEALTH_ERR1" || step5 == null)) {
                    showRibbon('warning', '클라우드센터 클러스터가 구성되지 않았습니다. 클라우드센터 클러스터 구성을 진행하십시오.');
                  } else {
                    showRibbon('warning', '클라우드센터 클러스터는 구성되었으나 리소스 구성이 되지 않았습니다. 리소스 구성을 진행하십시오.');
                  }
                } else {
                  if (step8 != "true" && (step6 == "HEALTH_ERR" || step6 == null)) {
                    //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                    $('#button-open-modal-wizard-cloud-vm').show();
                    $('#button-link-storage-center-dashboard').show();
                    showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 클라우드센터 VM 배포를 진행하십시오.');
                  } else {
                    if (step8 != "true" && step7 != "true") {
                      showRibbon('warning', '클라우드센터에 연결할 수 있도록 클라우드센터 구성하기 작업을 진행하십시오.');
                    } else {
                      // 스토리지센터 연결 버튼, 클라우드센터 연결 버튼 show, 모니터링센터 구성 버튼 show
                      $('#button-link-storage-center-dashboard').show();
                      $('#button-link-cloud-center').show();

                      if (step8 != "true") {
                        $('#button-open-modal-wizard-monitoring-center').show();
                        showRibbon('warning', '모니터링센터에 연결할 수 있도록 모니터링센터 구성 작업을 진행하십시오.');
                      } else {
                        // 모니터링센터 구성 연결 버튼 show
                        $('#button-link-monitoring-center').show();
                        $('#button-cloud-cluster-ssh-port').removeClass('pf-m-disabled');

                        showRibbon('success', 'ABLESTACK 스토리지센터 및 클라우드센터 VM 배포되었으며 모니터링센터 구성이 완료되었습니다. 가상어플라이언스 상태가 정상입니다.');
                        // 운영 상태조회
                        let msg = "";
                        if (step2 != "RUNNING") {
                          msg += '스토리지센터 가상머신이 ' + step2 + ' 상태 입니다.\n';
                          msg += '스토리지센터 가상머신이 shut off 상태일 경우 스토리지센터 가상머신 카드에서 스토리지센터 VM을 시작해주세요.\n';
                          showRibbon('warning', msg);
                        }
                        if (step4 != "HEALTH_OK") {
                          msg += '스토리지센터 클러스터가 ' + step4 + ' 상태 입니다.\n';
                          msg += 'oout, nobackfill, norecover flag인 경우 의도하지 않은 유지보수 모드일 경우 스토리지센터 클러스터 상태 카드에서 유지보수 모드 해제해주세요.\n';
                          msg += '스토리지센터 클러스터 상태가 Monitor clock detected 인 경우 cube host, scvm, ccvm의 ntp 시간 동기화 작업을 해야합니다.';
                          showRibbon('warning', msg);
                        }
                        if (step6 != "RUNNING") {
                          msg += '클라우드센터 가상머신이 ' + step6 + ' 상태 입니다.\n';
                          msg += '클라우드센터 가상머신 Mold 서비스 , DB 상태를 확인하여 정지상태일 경우 서비스 재시작\n';
                          msg += '또는 클라우드센터 클러스터 상태 카드에서 가상머신 시작하여 문제를 해결할 수 있습니다.';
                          showRibbon('warning', msg);
                        }
                        if (step13 == "false") {
                          $('#button-open-modal-security-update').show();
                        } else {
                          $('#button-open-modal-security-update').hide();
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else if (os_type == "ablestack-vm") {
      console.log("step0 :: " + step0 + ", step1 :: " + step1 + ", step5 :: " + step5 + ", step6 :: " + step6 + ", step7 :: " + step7 + ", step8 :: " + step8 + ", step11 :: " + step11);

      if (step1 != "true") {
        $('#button-open-modal-wizard-storage-cluster').show();
        showRibbon('warning', 'GFS 스토리지 구성 및 클라우드센터 VM이 배포되지 않았습니다. 클러스터 구성준비를 진행하십시오.');
      } else {
        // 외부 스토리지 버튼 활성화
        $('#button-config-file-download').show();
        $('#button-gfs-multipath-sync').prop('disabled', false);
        $('#button-gfs-storage-rescan').prop('disabled', false);
        if (step11 != "true") {
          // 클러스터 구성 준비 버튼, GFS 구성 준비 버튼
          $('#button-open-modal-wizard-storage-cluster').show();
          $("#button-link-gfs-storage-configure").show();
          showRibbon('warning', 'GFS 스토리지가 구성되지 않았습니다. GFS 스토리지 구성을 진행하십시오.')
        } else {
          if (step8 != "true" && step5 == "HEALTH_ERR1" || step5 == "HEALTH_ERR2" || step5 == null) {
            //클라우드센터 VM 배포 버튼
            $('#button-open-modal-wizard-cloud-vm').show();
            if (step8 != "true" && step5 == "HEALTH_ERR1" || step5 == null) {
              showRibbon('warning', '클라우드센터 클러스터가 구성되지 않았습니다. 클라우드센터 클러스터 구성을 진행하십시오.');
            } else {
              showRibbon('warning', '클라우드센터 클러스터는 구성되었으나 리소스 구성이 되지 않았습니다. 리소스 구성을 진행하십시오.');
            }
          } else {
            $('#button-gfs-multipath-sync').prop('disabled', false);
            $('#button-gfs-storage-rescan').prop('disabled', false);
            if (step8 != "true" && (step7 != "true" && (step6 == "HEALTH_ERR" || step6 == null))) {
              //클라우드센터 VM 배포 버튼
              $('#button-open-modal-wizard-cloud-vm').show();
              showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 클라우드센터 VM 배포를 진행하십시오.');
            } else {
              if (step8 != "true" && step7 != "true") {
                showRibbon('warning', '클라우드센터에 연결할 수 있도록 클라우드센터 구성하기 작업을 진행하십시오.');
              } else {
                // 스토리지센터 연결 버튼, 클라우드센터 연결 버튼 show, 모니터링센터 구성 버튼 show
                $('#button-link-cloud-center').show();

                if (step8 != "true") {
                  $('#button-open-modal-wizard-monitoring-center').show();
                  showRibbon('warning', '모니터링센터에 연결할 수 있도록 모니터링센터 구성 작업을 진행하십시오.');
                } else {
                  // 모니터링센터 구성 연결 버튼 show
                  $('#button-link-monitoring-center').show();
                  $('#button-cloud-vm-backup').removeClass('pf-m-disabled');
                  $('#button-cloud-vm-restore').removeClass('pf-m-disabled');
                  $('#button-cloud-cluster-ssh-port').removeClass('pf-m-disabled');

                  showRibbon('success', 'ABLESTACK 클라우드센터 VM 배포되었으며 모니터링센터 구성이 완료되었습니다. 가상어플라이언스 상태가 정상입니다.');
                  // 운영 상태조회
                  let msg = "";
                  if (step6 != null) {
                    if (step6 != "RUNNING") {
                      msg += '클라우드센터 가상머신이 ' + step6 + ' 상태 입니다.\n';
                      msg += '클라우드센터 가상머신 Mold 서비스 , DB 상태를 확인하여 정지상태일 경우 서비스 재시작\n';
                      msg += '또는 클라우드센터 클러스터 상태 카드에서 가상머신 시작하여 문제를 해결할 수 있습니다.';
                      showRibbon('warning', msg);
                    }
                  }
                  if (step13 == "false") {
                    $('#button-open-modal-security-update').show();
                  } else {
                    $('#button-open-modal-security-update').hide();
                  }
                }
              }
            }
          }
        }
      }
    } else if (os_type == "ablestack-standalone") {
      console.log("step0 :: " + step0 + ", step1 :: " + step1 + ", step6 :: " + step6 + ", step7 :: " + step7 + ", step8 :: " + step8 + ", step12 :: " + step12);

      if (step1 != "true") {
        $('#button-open-modal-wizard-storage-cluster').show();
        showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 클러스터 구성준비를 진행하십시오.');
      } else {
        // 외부 스토리지 버튼 활성화
        $('#button-config-file-download').show();
        if (step11 != "true" && step12 != "true") {
          // 클러스터 구성 준비 버튼, 로컬 스토리지 구성 준비 버튼
          $('#button-open-modal-wizard-storage-cluster').show();
          $("#button-link-local-storage-configure").show();
          showRibbon('warning', '로컬 스토리지가 구성되지 않았습니다. 로컬 스토리지 구성을 진행하십시오.')
        } else {
          if (step8 != "true" && (step7 != "true" && (step6 == "HEALTH_ERR" || step6 == null))) {
            //클라우드센터 VM 배포 버튼 , 로컬 스토리지 구성 버튼 숨김
            $("#button-link-local-storage-configure").hide();
            $('#button-open-modal-wizard-cloud-vm').show();
            $('#cloud-center-before-bootstrap-run').hide();
            $('#cloud-center-after-bootstrap-run').hide();
            showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 클라우드센터 VM 배포를 진행하십시오.');
          } else {
            $('#cloud-center-before-bootstrap-run').show();
            $('#cloud-center-after-bootstrap-run').show();
            if (step8 != "true" && step7 != "true") {
              showRibbon('warning', '클라우드센터에 연결할 수 있도록 클라우드센터 구성하기 작업을 진행하십시오.');
            } else {
              // 스토리지센터 연결 버튼, 클라우드센터 연결 버튼 show, 모니터링센터 구성 버튼 show
              $('#button-link-cloud-center').show();
              $('#button-cloud-vm-backup').removeClass('pf-m-disabled');
              $('#button-cloud-vm-restore').removeClass('pf-m-disabled');

              if (step8 != "true") {
                $('#button-open-modal-wizard-monitoring-center').show();
                showRibbon('warning', '모니터링센터에 연결할 수 있도록 모니터링센터 구성 작업을 진행하십시오.');
              } else {
                // 모니터링센터 구성 연결 버튼 show
                $('#button-link-monitoring-center').show();
                $('#button-cloud-cluster-ssh-port').removeClass('pf-m-disabled');

                showRibbon('success', 'ABLESTACK 클라우드센터 VM 배포되었으며 모니터링센터 구성이 완료되었습니다. 가상어플라이언스 상태가 정상입니다.');
                // 운영 상태조회
                let msg = "";
                if (step6 != null) {
                  if (step6 != "RUNNING") {
                    msg += '클라우드센터 가상머신이 ' + step6 + ' 상태 입니다.\n';
                    msg += '클라우드센터 가상머신 Mold 서비스 , DB 상태를 확인하여 정지상태일 경우 서비스 재시작\n';
                    msg += '또는 클라우드센터 클러스터 상태 카드에서 가상머신 시작하여 문제를 해결할 수 있습니다.';
                    showRibbon('warning', msg);
                  }
                }
                if (step13 == "false") {
                  $('#button-open-modal-security-update').show();
                } else {
                  $('#button-open-modal-security-update').hide();
                }
              }
            }
          }

        }
      }
    } else if (os_type == "ablestack-hci-filesystem") {
      console.log("step0 :: " + step0 + ", step1 :: " + step1 + ", step2 :: " + step2 + " , step3 :: " + step3 + ", step4 :: " + step4 + ", step5 :: " + step5 + ", step6 :: " + step6 + ", step7 :: " + step7 + ", step8 :: " + step8 + ", step11 :: " + step11);
      if (step1 != "true") {
        // 클러스터 구성준비 버튼 show
        $('#button-open-modal-wizard-storage-cluster').show();
        showRibbon('warning', '스토리지센터, HCI 공유 파일, 클라우드센터 VM이 배포되지 않았습니다. 클러스터 구성 준비를 진행하십시오.');
      } else {
        $('#button-config-file-download').show();
        if (step2 == "HEALTH_ERR" || step2 == null) {
          // 외부 스토리지 버튼 활성화
          $('#button-hci-multipath-sync').prop('disabled', false);
          $('#button-hci-storage-rescan').prop('disabled', false);
          // 클러스터 구성준비 버튼, 스토리지센터 VM 배포 버튼 show
          $('#button-open-modal-wizard-storage-cluster').show();
          $('#button-open-modal-wizard-storage-vm').show();
          showRibbon('warning', '스토리지센터 및 클라우드센터 VM이 배포되지 않았습니다. 스토리지센터 VM 배포를 진행하십시오.');
        } else {
          $('#button-hci-multipath-sync').prop('disabled', false);
          $('#button-hci-storage-rescan').prop('disabled', false);
          if (step3 != "true") {
            showRibbon('warning', '스토리지센터 대시보드에 연결할 수 있도록 스토리지센터 구성하기 작업을 진행하십시오.');
          } else {
            if (step11 != "true") {
              // 스토리지센터 연결 버튼 show, HCI 공유 파일 구성 버튼 show
              $('#button-link-storage-center-dashboard').show();
              $("#button-link-hci-shared-file-configure").show();
              showRibbon('warning', 'HCI 공유 파일이 구성되지 않았습니다. 스토리지센터에 연결하여 스토리지 클러스터를 구성한 후 HCI 공유 파일 구성을 진행하십시오.')
            } else {
              if (step8 != "true" && step4 == "Health Err" || step4 == null) {
                // 스토리지센터 연결 버튼 show
                $('#button-open-modal-wizard-cloud-vm').show();
                $('#button-link-storage-center-dashboard').show();
                showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 클라우드센터 VM 배포를 진행하십시오.');
              } else {
                if (step8 != "true" && step5 == "HEALTH_ERR1" || step5 == "HEALTH_ERR2" || step5 == null) {
                  //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                  $('#button-open-modal-wizard-cloud-vm').show();
                  $('#button-link-storage-center-dashboard').show();
                  if (step8 != "true" && step5 == "HEALTH_ERR1" || step5 == null) {
                    showRibbon('warning', '클라우드센터 클러스터가 구성되지 않았습니다. 클라우드센터 클러스터 구성을 진행하십시오.');
                  } else {
                    showRibbon('warning', '클라우드센터 클러스터는 구성되었으나 리소스 구성이 되지 않았습니다. 리소스 구성을 진행하십시오.');
                  }
                } else {
                  if (step8 != "true" && step6 == "HEALTH_ERR" || step6 == null) {
                    //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                    $('#button-open-modal-wizard-cloud-vm').show();
                    $('#button-link-storage-center-dashboard').show();
                    showRibbon('warning', '클라우드센터 VM이 배포되지 않았습니다. 클라우드센터 VM 배포를 진행하십시오.');
                  } else {
                    if (step8 != "true" && step7 != "true") {
                      showRibbon('warning', '클라우드센터에 연결할 수 있도록 클라우드센터 구성하기 작업을 진행하십시오.');
                    } else {
                      // 스토리지센터 연결 버튼, 클라우드센터 연결 버튼 show, 모니터링센터 구성 버튼 show
                      $('#button-link-storage-center-dashboard').show();
                      $('#button-link-cloud-center').show();

                      if (step8 != "true") {
                        $('#button-open-modal-wizard-monitoring-center').show();
                        showRibbon('warning', '모니터링센터에 연결할 수 있도록 모니터링센터 구성 작업을 진행하십시오.');
                      } else {
                        // 모니터링센터 구성 연결 버튼 show
                        $('#button-link-monitoring-center').show();
                        $('#button-cloud-cluster-ssh-port').removeClass('pf-m-disabled');

                        showRibbon('success', 'ABLESTACK 스토리지센터 및 클라우드센터 VM 배포되었으며 모니터링센터 구성이 완료되었습니다. 가상어플라이언스 상태가 정상입니다.');
                        // 운영 상태조회
                        let msg = "";
                        if (step2 != "RUNNING") {
                          msg += '스토리지센터 가상머신이 ' + step2 + ' 상태 입니다.\n';
                          msg += '스토리지센터 가상머신이 shut off 상태일 경우 스토리지센터 가상머신 카드에서 스토리지센터 VM을 시작해주세요.\n';
                          showRibbon('warning', msg);
                        }
                        if (step4 != "HEALTH_OK") {
                          msg += '스토리지센터 클러스터가 ' + step4 + ' 상태 입니다.\n';
                          msg += 'oout, nobackfill, norecover flag인 경우 의도하지 않은 유지보수 모드일 경우 스토리지센터 클러스터 상태 카드에서 유지보수 모드 해제해주세요.\n';
                          msg += '스토리지센터 클러스터 상태가 Monitor clock detected 인 경우 cube host, scvm, ccvm의 ntp 시간 동기화 작업을 해야합니다.';
                          showRibbon('warning', msg);
                        }
                        if (step6 != "RUNNING") {
                          msg += '클라우드센터 가상머신이 ' + step6 + ' 상태 입니다.\n';
                          msg += '클라우드센터 가상머신 Mold 서비스 , DB 상태를 확인하여 정지상태일 경우 서비스 재시작\n';
                          msg += '또는 클라우드센터 클러스터 상태 카드에서 가상머신 시작하여 문제를 해결할 수 있습니다.';
                          showRibbon('warning', msg);
                        }
                        if (step13 == "false") {
                          $('#button-open-modal-security-update').show();
                        } else {
                          $('#button-open-modal-security-update').hide();
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      $('#button-open-modal-wizard-storage-cluster').show();
      showRibbon('warning', '스토리지센터 및 클라우드센터 VM이 배포되지 않았습니다. 클러스터 구성준비를 진행하십시오.');
    }
    refreshSystemUpdateButton();
  }, 200);
}

/**
 * Meathod Name : showRibbon
 * Date Created : 2021.03.23
 * Writer : 박다정
 * Description : 배포 및 운영 상태에 따른 요약리본 알림메세지 및 class 속성 변경
 * Parameter : (String) status, (String) description
 * Return : 없음
 * History : 2021.03.23 최초 작성
 */
function showRibbon(status, description) {
  $('#ribbon').attr('class', 'pf-v6-c-alert pf-m-' + status)
  if (status == 'success') {
    $('#main-ribbon').text('Success alert:');
  }
  let alert_text = $('#main-ribbon-description').text(description);
  alert_text.html(alert_text.html().replace(/\n/g, '<br/>'));
}

/**
 * Meathod Name : saveHostInfo
 * Date Created : 2021.04.01
 * Writer : 박다정
 * Description : 호스트 파일 정보를 세션스토리지에 저장
 * Parameter : 없음
 * Return : 없음
 * History : 2021.04.01 최초 작성
 */
function saveHostInfo() {
  //createLoggerInfo("saveHostInfo() start");
  cockpit.spawn(['cat', '/etc/hosts'])
    .then(function (data) {
      var line = data.split("\n");
      for (var i = 0; i < line.length; i++) {
        var word = line[i].split("\t");
        if (word.length > 1) {
          sessionStorage.setItem(word[1], word[0]);
        }
      }
    })
    .catch(function (error) {
      createLoggerInfo("Hosts file is not configured error");
      console.log("Hosts file is not configured :" + error);
    });
}



/**
 * Meathod Name : scanHostKey
 * Date Created : 2021.04.14
 * Writer : 박다정
 * Description : 호스트 키 스캔
 * Parameter : 없음
 * Return : 없음
 * History : 2021.04.14 최초 작성
 */
function scanHostKey() {
  //createLoggerInfo("scanHostKey() start");
  cockpit.spawn(['python3', pluginpath + '/python/host/ssh-scan.py'])
    .then(function (data) {
      console.log("keyscan ok");
    })
    .catch(function (err) {
      createLoggerInfo("keyscan err");
      console.log("keyscan err : " + err);
    });
}

/**
 * Meathod Name : pcsExeHost
 * Date Created : 2022.09.14
 * Writer : 배태주
 * Description : pcs 클러스터 명령이 가능한 호스트의 정보를 세팅하는 함수
 * Parameter : 없음
 * Return : 없음
 * History : 2022.09.14 최초 작성
 */
function pcsExeHost() {
  cockpit.spawn(['python3', pluginpath + '/python/pcs/pcsExehost.py'])
    .then(function (data) {
      let retVal = JSON.parse(data);
      pcs_exe_host = retVal.val;
    })
    .catch(function (err) {
      createLoggerInfo("pcsExeHost err");
      console.log("pcsExeHost err : " + err);
    });
}

/**
 * Meathod Name : resetBootstrap
 * Date Created : 2021.04.14
 * Writer : 박다정
 * Description : 클러스터 구성 전인 경우 bootstrap 관련 프로퍼티 초기화
 * Parameter : 없음
 * Return : 없음
 * History : 2021.04.14 최초 작성
 */
function resetBootstrap() {
  createLoggerInfo("resetBootstrap() start");
  //scvm bootstrap 프로퍼티 초기화
  cockpit.spawn(["python3", pluginpath + "/python/ablestack_json/ablestackJson.py", "update", "--depth1", "bootstrap", "--depth2", "scvm", "--value", "false"])
    .then(function (data) {
      createLoggerInfo("resetBootstrap scvm ok");
      console.log("resetBootstrap scvm ok");
    })
    .catch(function (err) {
      createLoggerInfo("resetBootstrap scvm err");
      console.log("resetBootstrap scvm err : " + err);
    });
  //ccvm bootstrap 프로퍼티 초기화
  cockpit.spawn(["python3", pluginpath + "/python/ablestack_json/ablestackJson.py", "update", "--depth1", "bootstrap", "--depth2", "ccvm", "--value", "false"])
    .then(function (data) {
      createLoggerInfo("resetBootstrap ccvm ok");
      console.log("resetBootstrap ccvm ok");
    })
    .catch(function (err) {
      createLoggerInfo("resetBootstrap ccvm err");
      console.log("resetBootstrap ccvm err : " + err);
    });
  //wall monitoring 프로퍼티 초기화
  cockpit.spawn(["python3", pluginpath + "/python/ablestack_json/ablestackJson.py", "update", "--depth1", "monitoring", "--depth2", "wall", "--value", "false"])
    .then(function (data) {
      createLoggerInfo("resetBootstrap wall ok");
      console.log("resetBootstrap wall ok");
    })
    .catch(function (err) {
      createLoggerInfo("resetBootstrap wall err");
      console.log("resetBootstrap wall err : " + err);
    });
}

function ribbonWorker() {
  if (os_type == "ablestack-vm") {
    Promise.all([
      pcsExeHost(),
      checkLicenseStatus(),
      checkConfigStatus(),
      CardCloudClusterStatus(),
      gfsDiskStatus(),
      gfsResourceStatus(),
      new CloudCenterVirtualMachine().checkCCVM()
    ])
      .then(function () {
        scanHostKey();
      })
      .finally(function () {
        checkDeployStatus();
        license_check();

      });
  } else if (os_type == "ablestack-standalone") {
    Promise.all([
      checkLicenseStatus(),
      checkConfigStatus(),
      LocalDiskStatus(),
      LocalCloudVMCheck(),
      new CloudCenterVirtualMachine().checkCCVM()
    ])
      .then(function () {
        scanHostKey();
      })
      .finally(function () {
        checkDeployStatus();
        license_check();

      });
  } else if (os_type == "ablestack-hci-filesystem") {
    Promise.all([
      pcsExeHost(),
      checkLicenseStatus(),
      checkConfigStatus(),
      checkStorageVmStatus(),
      checkStorageClusterStatus(),
      CardCloudClusterStatus(),
      gfsDiskStatus(),
      gfsResourceStatus(),
      new CloudCenterVirtualMachine().checkCCVM()
    ])
      .then(function () {
        scanHostKey();
      })
      .finally(function () {
        checkDeployStatus();
        license_check();

      });
  } else {
    Promise.all([pcsExeHost(), checkLicenseStatus(), checkConfigStatus(), checkStorageClusterStatus(),
    checkStorageVmStatus(), CardCloudClusterStatus(), new CloudCenterVirtualMachine().checkCCVM()]).then(function () {
      scanHostKey();
      checkDeployStatus();
      license_check();
    });
  }
}

/**
 * Meathod Name : setPfmpStatus
 * Date Created : 2024.09.19
 * Writer : 정민철
 * Description : 파워플렉스 관리 플랫폼 가상머신 상태 조회
 * Parameter : 없음
 * Return : 없음
 * History : 2024.09.19 최초 작성
 */
function setPfmpStatus() {
  cockpit.spawn(['python3', pluginpath + '/python/pfmp/pfmp_status_detail.py', 'detail'])
    .then(function (data) {
      var retVal = JSON.parse(data);
      pfmp_status_result = retVal.val.pfmp_status;
      sessionStorage.setItem('pfmp_status', pfmp_status_result);
    });
}
/**
 * Meathod Name : updateSpinnerPercentage
 * Date Created : 2024.10.25
 * Writer : 정민철
 * Description : 파워플렉스 관리 플랫폼 설치 퍼센트 조회
 * Parameter : 없음
 * Return : 없음
 * History : 2024.09.19 최초 작성
 */
function updateSpinnerPercentage(percentage) {
  document.getElementById('spinner-percentage').innerText = percentage + '%';
}
/**
 * Meathod Name : updatePfmpInstall
 * Date Created : 2024.10.25
 * Writer : 정민철
 * Description : 파워플렉스 관리 플랫폼 설치 퍼센트 조회
 * Parameter : time_value, unit
 * Return : 없음
 * History : 2024.09.19 최초 작성
 */
function updatePfmpInstall(time_value, unit) {
  let currentPercentage = 0;
  let intervalTime;

  if (interval) {
    clearInterval(interval);
  }

  document.getElementById('spinner-percentage').innerText = '0%';

  // 단위를 초 단위로 변환
  if (unit === "minute") {
    intervalTime = (time_value * 60 * 1000) / 100; // 분 -> 밀리초로 변환 후 1%당 시간 계산
  } else if (unit === "second") {
    intervalTime = (time_value * 1000) / 100; // 초 -> 밀리초로 변환 후 1%당 시간 계산
  }

  // 퍼센트 업데이트 실행
  interval = setInterval(() => {
    if (currentPercentage <= 100) {
      updateSpinnerPercentage(currentPercentage);
      currentPercentage += 1; // 1%씩 증가
    } else {
      clearInterval(interval); // 100%가 되면 타이머 종료
    }
  }, intervalTime);
}
/**
 * Meathod Name : screenConversion
 * Date Created : 2024.09.19
 * Writer : 정민철
 * Description : 서버 가상화에 대한 화면 처리
 * Parameter : 없음
 * Return : 없음
 * History : 2024.09.19 최초 작성
 */
function screenConversion() {
  if (os_type == "ablestack-vm") {
    $('#div-card-gfs-cluster-status').show();
    $('#div-card-storage-cluster-status').hide();
    $('#div-card-storage-vm-status').hide();
    $('#div-card-gfs-disk-status').show();
    $('#gfs-maintenance-update').show();
    $('#div-disk-image-create').hide();
    $('#button-refresh-modal-gfs-disk-add').hide();
    $('#button-refresh-modal-gfs-disk-extend').hide();
    $('#div-disk-image-create-expand').hide();
  } else if (os_type == "ablestack-standalone") {
    $('#div-card-gfs-cluster-status').hide();
    $('#div-card-storage-cluster-status').hide();
    $('#div-card-storage-vm-status').hide();
    $('#div-card-gfs-disk-status').hide();
    $('#div-card-cloud-cluster-status').hide();
    $('#gfs-maintenance-update').hide();
    $('#div-grid-main').removeClass('pf-m-12-col').addClass('pf-m-6-col');
    // 클라우드센터 가상머신 상태 화면 변경으로 인한 show
    $('#div-card-cloud-vm-status-1').hide();
    $('#div-card-cloud-vm-status-2').show();
    // 로컬 디스크 상태 show
    $('#div-card-local-disk-status').show();
  } else if (os_type == "ablestack-hci-filesystem") {
    $('#div-card-gfs-integration-status').removeClass('pf-m-6-col').addClass('pf-m-3-col');
    $('#div-card-storage-cluster-status').removeClass('pf-m-6-col').addClass('pf-m-3-col');
    $('#div-card-gfs-integration-status').show();
    $('#div-card-storage-cluster-status').show();
    $('#div-card-storage-vm-status').show();
    $('#gfs-integration-maintenance-update').show();
  } else {

  }
}

/**
 * Meathod Name : gfs_maintenance_run
 * Date Created : 2024.12.09
 * Writer : 정민철
 * Description : GFS 유지보수 일 경우 Stonith Disable or Enable 설정
 * Parameter : 없음
 * Return : 없음
 * History : 2024.12.09 최초 작성
 */
function gfs_maintenance_run() {
  var stonith_status = sessionStorage.getItem("stonith_status");
  if (stonith_status == "Started") {
    $('#gfs-maintenance-setting-head').text("펜스 장치 유지보수 설정");
    $('#gfs-maintenance-setting-body').text("펜스 장치 유지보수를 설정하시겠습니까?");
    $('#div-modal-gfs-maintenance-setting').show();
  } else {
    $('#gfs-maintenance-setting-head').text("펜스 장치 유지보수 해제");
    $('#gfs-maintenance-setting-body').text("펜스 장치 유지보수를 해제하시겠습니까?");
    $('#div-modal-gfs-maintenance-setting').show();
  }
}
function gfsDiskStatus() {
  return new Promise((resolve) => {
    $('#gfs-disk-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $("#gfs-disk-css").attr('class', 'pf-v6-c-label pf-m-orange');
    $("#gfs-disk-icon").attr('class', 'fas fa-fw fa-exclamation-triangle');

    cockpit.spawn(['python3', pluginpath + '/python/gfs/gfs_disk_status.py'])
      .then(function (data) {
        var retVal = JSON.parse(data);

        if (retVal.code == "200") {
          // Clear previous data
          if (retVal.val.mode == "multi") {
            $('#page-gfs-disk-mode').text("다중 모드");
          } else {
            $('#page-gfs-disk-mode').text("단일 모드");
          }
          $('#page-gfs-disk-mount-info, #page-gfs-integration-disk-mount-info').html("");
          $('#gfs-disk-deploy-status-check').text("GFS 디스크가 생성되었습니다.");
          setStatusTone($('#gfs-disk-deploy-status-check'), "ok");
          $('#gfs-disk-status').text("Health OK");
          $('#gfs-disk-icon').attr('class', 'fas fa-fw fa-check-circle');
          $('#gfs-disk-css').attr('class', 'pf-v6-c-label pf-m-green');

          for (var i = 0; i < retVal.val.blockdevices.length; i++) {
            var blockDevice = retVal.val.blockdevices[i];
            var mountPoint = blockDevice.mountpoint;
            var multipaths = blockDevice.multipaths.join(", ");
            var devices = blockDevice.devices.join(", ");
            var physicalVolume = blockDevice.lvm; // Assuming `lvm` is the physical volume
            var volumeGroup = blockDevice.lvm.split('-')[0]; // Assuming `lvm` contains volume group info
            var diskSize = blockDevice.size + "B";
            if (i % 3 == 0) {
              margin = "margin: 6px 0px;margin-right: 10px"
            } else {
              margin = "margin: 6px 10px"
            }
            // Create a clickable link for the mount point
            var linkHTML = `<a id=page-mount-path-${i} href="javascript:void(0);" class="gfs-mount-link pf-v6-c-button pf-m-link"
          style="display: inline-flex; align-items: center; padding: 8px 16px;
          border: 1px solid; border-radius: 4px;
          text-decoration: none; font-weight: bold; ${margin};
          transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
          data-mountpoint="${mountPoint}"
          data-multipaths="${multipaths}"
          data-devices="${devices}"
          data-physicalvolume="${physicalVolume}"
          data-volumegroup="${volumeGroup}"
          data-disksize="${diskSize}">
          ${mountPoint}
        </a>`;

            if ((i + 1) % 3 == 0) {
              linkHTML += "<br>";
            }

            // Append the link to the container
            $('#page-gfs-disk-mount-info, #page-gfs-integration-disk-mount-info').append(linkHTML);
          }
          $('#menu-item-set-gfs-clvm-disk-add').removeClass('pf-m-disabled');
          $('#menu-item-set-gfs-clvm-disk-delete').removeClass('pf-m-disabled');
          $('#menu-item-set-gfs-clvm-disk-info').removeClass('pf-m-disabled');
          $('#menu-item-set-disk-detail-info').removeClass('pf-m-disabled');
          $('#menu-item-set-disk-integration-detail-info').removeClass('pf-m-disabled');
          $('#menu-item-set-gfs-disk-add').removeClass('pf-m-disabled');
          $('#menu-item-set-gfs-integration-disk-add').removeClass('pf-m-disabled');
          $('#menu-item-set-gfs-disk-delete').removeClass('pf-m-disabled');
          $('#menu-item-set-gfs-integration-disk-delete').removeClass('pf-m-disabled');
          $('#menu-item-set-gfs-disk-extend').removeClass('pf-m-disabled');
          $('#menu-item-set-gfs-integration-disk-extend').removeClass('pf-m-disabled');
          // Add click event to show detailed information in a modal
          $('.gfs-mount-link').on('click', function () {
            var mountPoint = $(this).data('mountpoint');
            var multipaths = $(this).data('multipaths');
            var devices = $(this).data('devices');
            var physicalVolume = $(this).data('physicalvolume');
            var volumeGroup = $(this).data('volumegroup');
            var diskSize = $(this).data('disksize');
            // Update modal content
            updateModalContent(mountPoint, multipaths, devices, physicalVolume, volumeGroup, diskSize);
            // Show the modal
            $('#div-modal-gfs-disk-info').show();
          });
          sessionStorage.setItem("gfs_configure", "true");
        } else {
          $('#gfs-disk-deploy-status-check').text("GFS 디스크가 생성되지 않았습니다.");
          setStatusTone($('#gfs-disk-deploy-status-check'), "danger");
          $('#page-gfs-disk-mount-info, #page-gfs-integration-disk-mount-info').html("");
          $('#page-gfs-disk-mount-info, #page-gfs-integration-disk-mount-info').text("N/A");
          $('#page-gfs-disk-mode').text("N/A");

          sessionStorage.setItem("gfs_configure", "false");
        }
        resolve();
      });
  });
}

// Close button in the modal
$('#button-close-modal-gfs-disk-info').on('click', function () {
  $('#div-modal-gfs-disk-info').hide();;
});

// Cancel button in the modal (optional, depending on your design)
$('#button-cancel-modal-gfs-disk-info').on('click', function () {
  $('#div-modal-gfs-disk-info').hide();;
});

/**
 * Meathod Name : setDiskAction
 * Date Created : 2025.01.09
 * Writer : 정민철
 * Description : CLVM 디스크 추가 및 GFS 디스크 추가
 * Parameter : 없음
 * Return : 없음
 * History : 2025.01.07 최초 작성
 */
function setDiskAction(type, action, extend) {
  if (type == "clvm" && action == "add") {
    var cmd = ["python3", pluginpath + "/python/disk/disk_action.py", "gfs-list"];

    cockpit.spawn(cmd).then(function (data) {
      // 초기화
      $('#clvm-disk-add-list').empty();

      var el = '';
      var multipathElements = ''; // MultiPath 정보를 저장할 변수
      var result = JSON.parse(data);
      var clvm_list = result.val.blockdevices;

      // MultiPath 중복 제거용 세트
      var displayedMultipaths = new Set();
      var displayedName = new Set();

      if (clvm_list.length > 0) {
        for (var i = 0; i < clvm_list.length; i++) {
          var partition_text = '';
          var check_disable = '';

          if (clvm_list[i].children != undefined) {
            for (var j = 0; j < clvm_list[i].children.length; j++) {
              if (!clvm_list[i].wwn) {
                clvm_list[i].wwn = ""; // 값을 공백으로 설정
              }
              var mpathName = clvm_list[i].children[j].name;
              if (clvm_list[i].children[j].name.includes('mpath')) {
                if (clvm_list[i].children[j].children != undefined) {
                  partition_text = '( Partition exists count : ' + clvm_list[i].children[j].children.length + ' )';
                  check_disable = 'disabled';
                }
                // MultiPath가 이미 표시된 경우 스킵
                if (!displayedMultipaths.has(mpathName)) {
                  var mpathHtml = '';
                  mpathHtml += '<div class="pf-v6-c-check">';
                  mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-clvm-checkbox-disk-add' + i + '" name="form-clvm-checkbox-disk-add" value="' + clvm_list[i].children[j].path + '" ' + 'data-disk_id="' + clvm_list[i].children[j].id + '" ' + check_disable + ' />';
                  // mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-clvm-checkbox-disk-add' + i + '" name="form-clvm-checkbox-disk-add" value="' + clvm_list[i].children[j].path + '" />';
                  mpathHtml += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-clvm-checkbox-disk-add' + i + '">' + clvm_list[i].children[j].path + ' ' + clvm_list[i].children[j].state + ' (' + clvm_list[i].children[j].type + ') ' + clvm_list[i].children[j].size + ' ' + ' ' + clvm_list[i].vendor + ' ' + clvm_list[i].wwn + ' ' + partition_text + '</label>';
                  mpathHtml += '</div>';

                  multipathElements += mpathHtml; // MultiPath 요소를 multipathElements에 저장

                  displayedMultipaths.add(mpathName); // MultiPath 이름을 Set에 추가
                }
              } else {
                partition_text = '( Partition exists count : ' + clvm_list[i].children.length + ' )';
                check_disable = 'disabled';

                var disk_name = clvm_list[i].name;
                if (!displayedName.has(disk_name)) {
                  el += '<div class="pf-v6-c-check">';
                  el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-clvm-checkbox-disk-add' + i + '" name="form-clvm-checkbox-disk-add" value="' + clvm_list[i].path + '" ' + 'data-disk_id="' + clvm_list[i].path + '" ' + check_disable + ' />';
                  // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-clvm-checkbox-disk-add' + i + '" name="form-clvm-checkbox-disk-add" value="' + clvm_list[i].path + '" />';
                  el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-clvm-checkbox-disk-add' + i + '">' + clvm_list[i].path + ' ' + clvm_list[i].state + ' (' + clvm_list[i].tran + ') ' + clvm_list[i].size + ' ' + clvm_list[i].model + ' ' + clvm_list[i].wwn + partition_text + '</label>';
                  el += '</div>';

                  displayedName.add(disk_name);
                }
              }
            }
          } else {
            if (!clvm_list[i].wwn) {
              clvm_list[i].wwn = ""; // 값을 공백으로 설정
            }
            el += '<div class="pf-v6-c-check">';
            el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-clvm-checkbox-disk-add' + i + '" name="form-clvm-checkbox-disk-add" value="' + clvm_list[i].path + '" ' + 'data-disk_id="' + clvm_list[i].path + '" ' + check_disable + ' />';
            // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-clvm-checkbox-disk-add' + i + '" name="form-clvm-checkbox-disk-add" value="' + clvm_list[i].path + '" />';
            el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-clvm-checkbox-disk-add' + i + '">' + clvm_list[i].path + ' ' + clvm_list[i].state + ' (' + clvm_list[i].tran + ') ' + clvm_list[i].size + ' ' + clvm_list[i].model + ' ' + clvm_list[i].wwn + partition_text + '</label>';
            el += '</div>';
          }
        }
      } else {
        el += '<div class="pf-v6-c-check">';
        el += '<label class="pf-v6-c-check__label" style="margin-top:5px">데이터가 존재하지 않습니다.</label>';
        el += '</div>';
      }

      // 일반 장치 정보를 먼저 추가하고, 마지막에 MultiPath 정보를 추가
      $('#clvm-disk-add-list').append(multipathElements + el);

    }).catch(function () {
      createLoggerInfo("setDiskAction error");
    });
  } else if (type == "clvm" && action == "delete") {
    var cmd = ["python3", pluginpath + "/python/clvm/disk_manage.py", "--list-clvm"];

    cockpit.spawn(cmd).then(function (data) {
      // 초기화
      $('#clvm-disk-delete-list').empty();

      // JSON 데이터 파싱
      var result = JSON.parse(data);

      // 결과 리스트 가져오기
      var clvmList = result.val;

      var output = ''; // 최종 출력 문자열

      if (clvmList.length > 0) {
        // 데이터를 순회하면서 출력 형식 생성
        for (var i = 0; i < clvmList.length; i++) {
          var clvm = clvmList[i];

          // 체크박스 추가
          output += `
            <div style="margin-bottom: 8px;">
              <input type="checkbox" class="clvm-checkbox" id="clvm-${i}" name="form-clvm-disk-delete"
                data-vg="${clvm.vg_name}"
                data-pv="${clvm.pv_name}"
                data-size="${clvm.pv_size}"
                data-wwn="${clvm.wwn}"
                data-disk_id="${clvm.disk_id}"
                style="margin-left:5px;transform: scale(1.3);">
              <label for="clvm-${i}">
                ${i + 1}. ${clvm.vg_name} ${clvm.pv_name} ${clvm.pv_size} ${clvm.wwn}
              </label>
            </div>
          `;
        }
      } else {
        output = '데이터가 존재하지 않습니다.<br>';
      }

      // 출력 데이터 추가
      $('#clvm-disk-delete-list').append(output);

    }).catch(function () {
      createLoggerInfo("setDiskAction error");
    });
  } else if (type == "clvm" && action == "list") {
    var cmd = ["python3", pluginpath + "/python/clvm/disk_manage.py", "--list-clvm"];

    cockpit.spawn(cmd).then(function (data) {
      // 초기화
      $('#clvm-disk-info-list').empty();

      // JSON 데이터 파싱
      var result = JSON.parse(data);

      // 결과 리스트 가져오기
      var clvmList = result.val;

      var output = ''; // 최종 출력 문자열

      if (clvmList.length > 0) {
        // 데이터를 순회하면서 출력 형식 생성
        for (var i = 0; i < clvmList.length; i++) {
          var clvm = clvmList[i];
          output += `${i + 1}. ${clvm.vg_name} ${clvm.pv_name} ${clvm.pv_size} ${clvm.wwn}<br>`;
        }
      } else {
        output = '데이터가 존재하지 않습니다.<br>';
      }
      // 출력 데이터 추가
      $('#clvm-disk-info-list').append(output);

    }).catch(function () {
      createLoggerInfo("setDiskAction error");
    });
  } else if (type == "gfs" && action == "add") {
    var cmd = ["python3", pluginpath + "/python/disk/disk_action.py", "gfs-list"];

    cockpit.spawn(cmd).then(function (data) {
      // 초기화
      if (extend == "true") {
        $('#gfs-disk-extend-add-list').empty();
      } else {
        $('#gfs-disk-add-list').empty();
      }

      var el = '';
      var multipathElements = ''; // MultiPath 정보를 저장할 변수
      var result = JSON.parse(data);
      var gfs_list = result.val.blockdevices;

      // MultiPath 중복 제거용 세트
      var displayedMultipaths = new Set();
      var displayedName = new Set();

      if (gfs_list.length > 0) {
        for (var i = 0; i < gfs_list.length; i++) {
          var partition_text = '';
          var check_disable = '';

          if (gfs_list[i].children != undefined) {
            for (var j = 0; j < gfs_list[i].children.length; j++) {
              if (!gfs_list[i].wwn) {
                gfs_list[i].wwn = ""; // 값을 공백으로 설정
              }
              var mpathName = gfs_list[i].children[j].name;
              if (gfs_list[i].children[j].name.includes('mpath')) {
                if (gfs_list[i].children[j].children != undefined) {
                  partition_text = '( Partition exists count : ' + gfs_list[i].children[j].children.length + ' )';
                  check_disable = 'disabled';
                }
                // MultiPath가 이미 표시된 경우 스킵
                if (!displayedMultipaths.has(mpathName)) {
                  var mpathHtml = '';
                  if (extend == "true") {
                    mpathHtml += '<div class="pf-v6-c-check">';
                    mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].children[j].path + '" ' + 'data-disk_id="' + gfs_list[i].children[j].id + '" ' + check_disable + ' />';
                    // mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].children[j].path + '" />';
                    mpathHtml += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-extend-add' + i + '">' + gfs_list[i].children[j].path + ' ' + gfs_list[i].children[j].state + ' (' + gfs_list[i].children[j].type + ') ' + gfs_list[i].children[j].size + ' ' + ' ' + gfs_list[i].vendor + ' ' + gfs_list[i].wwn + ' ' + partition_text + '</label>';
                    mpathHtml += '</div>';
                  } else {
                    mpathHtml += '<div class="pf-v6-c-check">';
                    mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].children[j].path + '" ' + 'data-disk_id="' + gfs_list[i].children[j].id + '" ' + check_disable + ' />';
                    // mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].children[j].path + '" />';
                    mpathHtml += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-add' + i + '">' + gfs_list[i].children[j].path + ' ' + gfs_list[i].children[j].state + ' (' + gfs_list[i].children[j].type + ') ' + gfs_list[i].children[j].size + ' ' + ' ' + gfs_list[i].vendor + ' ' + gfs_list[i].wwn + ' ' + partition_text + '</label>';
                    mpathHtml += '</div>';
                  }

                  multipathElements += mpathHtml; // MultiPath 요소를 multipathElements에 저장

                  displayedMultipaths.add(mpathName); // MultiPath 이름을 Set에 추가
                }
              } else {
                partition_text = '( Partition exists count : ' + gfs_list[i].children.length + ' )';
                check_disable = 'disabled';

                var disk_name = gfs_list[i].name;
                if (!displayedName.has(disk_name)) {
                  if (extend == "true") {
                    el += '<div class="pf-v6-c-check">';
                    el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].path + '" ' + 'data-disk_id="' + gfs_list[i].path + '" ' + check_disable + ' />';
                    // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].path + '" />';
                    el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-extend-add' + i + '">' + gfs_list[i].path + ' ' + gfs_list[i].state + ' (' + gfs_list[i].tran + ') ' + gfs_list[i].size + ' ' + gfs_list[i].model + ' ' + gfs_list[i].wwn + partition_text + '</label>';
                    el += '</div>';
                  } else {
                    el += '<div class="pf-v6-c-check">';
                    el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].path + '" ' + 'data-disk_id="' + gfs_list[i].path + '" ' + check_disable + ' />';
                    // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].path + '" />';
                    el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-add' + i + '">' + gfs_list[i].path + ' ' + gfs_list[i].state + ' (' + gfs_list[i].tran + ') ' + gfs_list[i].size + ' ' + gfs_list[i].model + ' ' + gfs_list[i].wwn + partition_text + '</label>';
                    el += '</div>';
                  }

                  displayedName.add(disk_name);
                }
              }
            }
          } else {
            if (!gfs_list[i].wwn) {
              gfs_list[i].wwn = ""; // 값을 공백으로 설정
            }
            if (extend == "true") {
              el += '<div class="pf-v6-c-check">';
              el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].path + '" ' + 'data-disk_id="' + gfs_list[i].path + '" ' + check_disable + ' />';
              // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].path + '" />';
              el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-extend-add' + i + '">' + gfs_list[i].path + ' ' + gfs_list[i].state + ' (' + gfs_list[i].tran + ') ' + gfs_list[i].size + ' ' + gfs_list[i].model + ' ' + gfs_list[i].wwn + partition_text + '</label>';
              el += '</div>';
            } else {
              el += '<div class="pf-v6-c-check">';
              el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].path + '" ' + 'data-disk_id="' + gfs_list[i].path + '" ' + check_disable + ' />';
              // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].path + '" />';
              el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-add' + i + '">' + gfs_list[i].path + ' ' + gfs_list[i].state + ' (' + gfs_list[i].tran + ') ' + gfs_list[i].size + ' ' + gfs_list[i].model + ' ' + gfs_list[i].wwn + partition_text + '</label>';
              el += '</div>';
            }
          }
        }
      } else {
        el += '<div class="pf-v6-c-check">';
        el += '<label class="pf-v6-c-check__label" style="margin-top:5px">데이터가 존재하지 않습니다.</label>';
        el += '</div>';
      }

      // 일반 장치 정보를 먼저 추가하고, 마지막에 MultiPath 정보를 추가
      if (extend == "true") {
        $('#gfs-disk-extend-add-list').append(multipathElements + el);
      } else {
        $('#gfs-disk-add-list').append(multipathElements + el);
      }
    }).catch(function () {
      createLoggerInfo("setDiskAction error");
    });
  } else if (type == "gfs" && action == "delete") {
    var cmd = ["python3", pluginpath + "/python/gfs/gfs_disk_status.py"];

    cockpit.spawn(cmd).then(function (data) {
      $('#gfs-disk-delete-list').empty();

      // JSON 데이터 파싱
      var result = JSON.parse(data);
      var gfsList = result.val.blockdevices;
      var mode = result.val.mode;
      var output = '';

      if (gfsList.length > 0) {
        for (var i = 0; i < gfsList.length; i++) {
          var gfs_disk = gfsList[i];
          var multipaths = gfs_disk.multipaths.join(', ');
          if (mode == "single") {
            var disk_id = gfs_disk.devices;
          } else {
            var disk_id = Array.isArray(gfs_disk.disk_id) ? gfs_disk.disk_id.join(',') : (gfs_disk.disk_id || '');
          }

          // 각 데이터 길이에 따라 너비 조정
          var mountpointWidth = Math.max(gfs_disk.mountpoint.length * 10, 160); // 최소 200px
          var multipathWidth = Math.max(multipaths.length * 10, 200);      // 최소 300px
          var formattedMultipaths = '';

          // multipaths 배열을 여러 줄로 표시하도록 수정
          for (var j = 0; j < gfs_disk.multipaths.length; j += 2) {
            formattedMultipaths += `
              <div style="display: flex; gap: 10px; font-family: monospace;">
                <span>${gfs_disk.multipaths[j]}</span>
                ${gfs_disk.multipaths[j + 1] ? `<span>${gfs_disk.multipaths[j + 1]}</span>` : ''}
              </div>
            `;
          }

          output += `
            <div style="margin-bottom: 8px; display: flex; align-items: center; font-family: monospace;">
              <input type="checkbox" class="gfs-disk-delete-checkbox" id="gfs-disk-checkbox-delete-${i}"
                name="form-gfs-checkbox-disk-delete" data-mountpoint="${gfs_disk.mountpoint}" data-devices="${gfs_disk.devices}"
                data-multipaths="${multipaths}" data-size="${gfs_disk.size}" data-lvm="${gfs_disk.lvm}"
                data-disk_id="${disk_id}" style="margin-left:5px; transform: scale(1.3); margin-right:10px;">

              <label for="gfs-disk-checkbox-delete-${i}"
                style="display: inline-block; min-width:${mountpointWidth}px; flex-grow: 1; overflow: hidden; text-overflow: ellipsis;">
                ${gfs_disk.mountpoint}
              </label>

              <label for="gfs-disk-checkbox-delete-${i}"
                style="display: inline-block; min-width:${multipathWidth}px; flex-grow: 2; overflow: hidden; text-overflow: ellipsis;">
                ${formattedMultipaths}
              </label>

              <label for="gfs-disk-checkbox-delete-${i}"
                style="display: inline-block; width: 100px; text-align: right;">
                ${gfs_disk.size}
              </label>

            </div>
          `;
        }
      } else {
        output = '데이터가 존재하지 않습니다.<br>';
      }

      $('#gfs-disk-delete-list').append(output);
    });

  } else if (type == "gfs" && action == "extend") {
    var cmd = ["python3", pluginpath + "/python/gfs/gfs_disk_status.py"];

    cockpit.spawn(cmd).then(function (data) {
      $('#gfs-disk-extend-list').empty();

      // JSON 데이터 파싱
      var result = JSON.parse(data);
      var gfsList = result.val.blockdevices;
      var mode = result.val.mode;

      var output = '';

      if (gfsList.length > 0) {
        for (var i = 0; i < gfsList.length; i++) {
          var gfs_disk = gfsList[i];
          var multipaths = gfs_disk.multipaths.join(',');
          if (mode == "single") {
            var disk_id = gfs_disk.devices;
          } else {
            var disk_id = Array.isArray(gfs_disk.disk_id) ? gfs_disk.disk_id.join(',') : (gfs_disk.disk_id || '');
          }
          var [vg_name, lv_name] = gfs_disk.lvm.split("/").pop().split(/-(.+)/);
          var gfs_name = gfs_disk.mountpoint.split("/").pop();
          var formattedMultipaths = '';

          // multipaths 배열을 여러 줄로 표시하도록 수정
          for (var j = 0; j < gfs_disk.multipaths.length; j += 2) {
            formattedMultipaths += `
              <div style="display: flex; gap: 10px; font-family: monospace;">
                <span>${gfs_disk.multipaths[j]}</span>
                ${gfs_disk.multipaths[j + 1] ? `<span>${gfs_disk.multipaths[j + 1]}</span>` : ''}
              </div>
            `;
          }

          output += `
            <div style="display: flex; align-items: center; font-family: monospace;">
              <input type="checkbox" class="gfs-disk-extend-checkbox" id="gfs-disk-checkbox-extend-${i}"
                name="form-gfs-checkbox-disk-extend" data-mountpoint="${gfs_disk.mountpoint}"
                data-multipaths="${multipaths}" data-size="${gfs_disk.size}" data-lvm="${gfs_disk.lvm}"
                data-vg_name="${vg_name}" data-lv_name="${lv_name}" data-gfs_name="${gfs_name}" data-disk_id="${disk_id}"
                style="margin-left:5px; transform: scale(1.3); margin-right:10px;">

              <label for="gfs-disk-checkbox-extend-${i}"
                style="display: inline-block; min-width:200px; overflow: hidden; text-overflow: ellipsis;">
                ${gfs_disk.mountpoint}
              </label>

              <label for="gfs-disk-checkbox-extend-${i}"
                style="display: inline-block; min-width:300px; overflow: hidden; text-overflow: ellipsis;">
                ${vg_name}   ${lv_name}
              </label>

              <label for="gfs-disk-checkbox-extend-${i}"
                style="display: inline-block; width: 100px;">
                ${gfs_disk.size}
              </label>

            </div>
          `;
        }
      } else {
        output = '데이터가 존재하지 않습니다.<br>';
      }

      $('#gfs-disk-extend-list').append(output);
    });

  } else if (type == "hba" && action == "list") {
    var cmd = ["python3", pluginpath + "/python/clvm/disk_manage.py", "--list-hba-wwn"];

    cockpit.spawn(cmd).then(function (data) {
      // 초기화
      $('#hba-wwn-list').empty();

      // JSON 데이터 파싱
      var result = JSON.parse(data);

      // 결과 리스트 가져오기
      var wwnList = result.val;

      // 테이블 생성
      var output = `
        <table class="pf-v6-c-table pf-m-compact ablestack-grid-table" style="width: 100%; text-align: left;">
          <thead>
            <tr>
              <th style="padding: 8px;">호스트명</th>
              <th style="padding: 8px;">WWN</th>
            </tr>
          </thead>
          <tbody>
      `;

      if (wwnList.length > 0) {
        // 데이터를 순회하면서 테이블 행 추가
        for (var i = 0; i < wwnList.length; i++) {
          var wwn = wwnList[i];
          output += `
            <tr>
              <td style="padding: 8px;">${wwn.hostname}</td>
              <td style="padding: 8px;">
                ${wwn.wwn.join('<br>')}
              </td>
            </tr>
          `;
        }
      } else {
        output += `
          <tr>
            <td colspan="2" style="padding: 8px; text-align: center;">데이터가 존재하지 않습니다.</td>
          </tr>
        `;
      }

      // 테이블 닫기
      output += `
          </tbody>
        </table>
      `;

      // 출력 데이터 추가
      $('#hba-wwn-list').append(output);

    }).catch(function () {
      createLoggerInfo("setDiskAction error");
    });
  } else if (type == "disk" && action == "detail") {
    var cmd = ["python3", pluginpath + "/python/disk/mpath_detail.py"];

    cockpit.spawn(cmd).then(function (data) {
      // 초기화
      $('#disk-detail-info').empty();

      // JSON 파싱
      var result = JSON.parse(data);
      var diskList = result.val;

      if (result.type == "multipath") {
        // 테이블 헤더 작성
        var output = `
        <table class="pf-v6-c-table pf-m-compact ablestack-grid-table" style="width: 100%; text-align: left;">
          <thead>
            <tr>
              <th style="padding: 8px;">멀티패스 이름</th>
              <th style="padding: 8px;">멀티패스 UUID 경로</th>
              <th style="padding: 8px;">싱글패스 SCSI 이름</th>
              <th style="padding: 8px;">싱글패스 WWN 이름</th>
            </tr>
          </thead>
          <tbody>
      `;

        // 결과 데이터 순회
        Object.entries(diskList).forEach(([dm, info]) => {
          var mpathName = info.multipath_name?.[0] || '-';
          var mpathUUID = info.multipath_id?.[0] || '-';
          var scsi = info.scsi?.join('<br>') || '-';
          var wwn = info.wwn?.join('<br>') || '-';

          output += `
          <tr>
            <td style="padding: 8px;">${mpathName}</td>
            <td style="padding: 8px;">
              <a href="#" onclick="copyToClipboard('${mpathUUID}'); return false;"
              style="color: var(--pf-t--global--text--color--link--default); text-decoration: underline; margin-left: 10px; cursor: pointer;">
              ${mpathUUID}
              </a>

            </td>
            <td style="padding: 8px;">${scsi}</td>
            <td style="padding: 8px;">${wwn}</td>
          </tr>
        `;
        });

        output += `
          </tbody>
        </table>
      `;
      } else {
        // 테이블 헤더 작성
        var output = `
      <table class="pf-v6-c-table pf-m-compact ablestack-grid-table" style="width: 100%; text-align: left;">
        <thead>
          <tr>
            <th style="padding: 8px;">싱글패스 이름</th>
            <th style="padding: 8px;">싱글패스 UUID 경로</th>
            <th style="padding: 8px;">싱글패스 SCSI 이름</th>
            <th style="padding: 8px;">싱글패스 WWN 이름</th>
          </tr>
        </thead>
        <tbody>
    `;

        // 결과 데이터 순회
        Object.entries(diskList).forEach(([dm, info]) => {
          var singleName = info.single_name?.[0] || '-';
          var singleUUID = info.single_id?.[0] || '-';
          var scsi = info.scsi?.join('<br>') || '-';
          var wwn = info.wwn?.join('<br>') || '-';

          output += `
        <tr>
          <td style="padding: 8px;">${singleName}</td>
          <td style="padding: 8px;">
            <a href="#" onclick="copyToClipboard('${singleUUID}'); return false;"
            style="color: var(--pf-t--global--text--color--link--default); text-decoration: underline; margin-left: 10px; cursor: pointer;">
            ${singleUUID}
            </a>

          </td>
          <td style="padding: 8px;">${scsi}</td>
          <td style="padding: 8px;">${wwn}</td>
        </tr>
      `;
        });

        output += `
        </tbody>
      </table>
    `;
      }

      $('#disk-detail-info').append(output);

    }).catch(function () {
      createLoggerInfo("setDiskAction error");
    });
  } else if (type == "hci-gfs" && action == "add") {
    var cmd = ["python3", pluginpath + "/python/disk/disk_action.py", "hci-shared-file-list"];

    cockpit.spawn(cmd).then(function (data) {
      // 초기화
      if (extend == "true") {
        $('#gfs-disk-extend-add-list').empty();
      } else {
        $('#gfs-disk-add-list').empty();
      }

      var el = '';
      var multipathElements = ''; // MultiPath 정보를 저장할 변수
      var result = JSON.parse(data);
      var gfs_list = result.val.blockdevices;

      // MultiPath 중복 제거용 세트
      var displayedMultipaths = new Set();
      var displayedName = new Set();

      if (gfs_list.length > 0) {
        for (var i = 0; i < gfs_list.length; i++) {
          var partition_text = '';
          var check_disable = '';

          if (gfs_list[i].children != undefined) {
            for (var j = 0; j < gfs_list[i].children.length; j++) {
              if (!gfs_list[i].wwn) {
                gfs_list[i].wwn = ""; // 값을 공백으로 설정
              }
              var mpathName = gfs_list[i].children[j].name;
              if (gfs_list[i].children[j].name.includes('mpath')) {
                if (gfs_list[i].children[j].children != undefined) {
                  partition_text = '( Partition exists count : ' + gfs_list[i].children[j].children.length + ' )';
                  check_disable = 'disabled';
                }
                // MultiPath가 이미 표시된 경우 스킵
                if (!displayedMultipaths.has(mpathName)) {
                  var mpathHtml = '';
                  if (extend == "true") {
                    mpathHtml += '<div class="pf-v6-c-check">';
                    mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].children[j].path + '" ' + 'data-disk_id="' + gfs_list[i].children[j].rbd_path + '" ' + check_disable + ' />';
                    // mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].children[j].path + '" />';
                    mpathHtml += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-extend-add' + i + '">' + gfs_list[i].children[j].path + ' ' + gfs_list[i].children[j].state + ' (' + gfs_list[i].children[j].type + ') ' + gfs_list[i].children[j].size + ' ' + partition_text + '</label>';
                    mpathHtml += '</div>';
                  } else {
                    mpathHtml += '<div class="pf-v6-c-check">';
                    mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].children[j].path + '" ' + 'data-disk_id="' + gfs_list[i].children[j].rbd_path + '" ' + check_disable + ' />';
                    // mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].children[j].path + '" />';
                    mpathHtml += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-add' + i + '">' + gfs_list[i].children[j].path + ' ' + gfs_list[i].children[j].state + ' (' + gfs_list[i].children[j].type + ') ' + gfs_list[i].children[j].size + ' ' + partition_text + '</label>';
                    mpathHtml += '</div>';
                  }

                  multipathElements += mpathHtml; // MultiPath 요소를 multipathElements에 저장

                  displayedMultipaths.add(mpathName); // MultiPath 이름을 Set에 추가
                }
              } else {
                partition_text = '( Partition exists count : ' + gfs_list[i].children.length + ' )';
                check_disable = 'disabled';

                var disk_name = gfs_list[i].name;
                if (!displayedName.has(disk_name)) {
                  if (extend == "true") {
                    el += '<div class="pf-v6-c-check">';
                    el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].path + '" ' + 'data-disk_id="' + gfs_list[i].rbd_path + '" ' + check_disable + ' />';
                    // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].path + '" />';
                    el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-extend-add' + i + '">' + gfs_list[i].path + ' ' + gfs_list[i].state + ' ' + gfs_list[i].size + ' ' + partition_text + '</label>';
                    el += '</div>';
                  } else {
                    el += '<div class="pf-v6-c-check">';
                    el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].path + '" ' + 'data-disk_id="' + gfs_list[i].rbd_path + '" ' + check_disable + ' />';
                    // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].path + '" />';
                    el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-add' + i + '">' + gfs_list[i].path + ' ' + gfs_list[i].state + ' ' + gfs_list[i].size + ' ' + partition_text + '</label>';
                    el += '</div>';
                  }

                  displayedName.add(disk_name);
                }
              }
            }
          } else {
            if (!gfs_list[i].wwn) {
              gfs_list[i].wwn = ""; // 값을 공백으로 설정
            }
            if (extend == "true") {
              el += '<div class="pf-v6-c-check">';
              el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].path + '" ' + 'data-disk_id="' + gfs_list[i].rbd_path + '" ' + check_disable + ' />';
              // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-extend-add' + i + '" name="form-gfs-checkbox-disk-extend-add" value="' + gfs_list[i].path + '" />';
              el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-extend-add' + i + '">' + gfs_list[i].path + ' ' + gfs_list[i].state + ' ' + gfs_list[i].size + ' ' + partition_text + '</label>';
              el += '</div>';
            } else {
              el += '<div class="pf-v6-c-check">';
              el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].path + '" ' + 'data-disk_id="' + gfs_list[i].rbd_path + '" ' + check_disable + ' />';
              // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-checkbox-disk-add' + i + '" name="form-gfs-checkbox-disk-add" value="' + gfs_list[i].path + '" />';
              el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-checkbox-disk-add' + i + '">' + gfs_list[i].path + ' ' + gfs_list[i].state + ' ' + gfs_list[i].size + ' ' + partition_text + '</label>';
              el += '</div>';
            }
          }
        }
      } else {
        el += '<div class="pf-v6-c-check">';
        el += '<label class="pf-v6-c-check__label" style="margin-top:5px">데이터가 존재하지 않습니다.</label>';
        el += '</div>';
      }

      // 일반 장치 정보를 먼저 추가하고, 마지막에 MultiPath 정보를 추가
      if (extend == "true") {
        $('#gfs-disk-extend-add-list').append(multipathElements + el);
      } else {
        $('#gfs-disk-add-list').append(multipathElements + el);
      }
    }).catch(function () {
      createLoggerInfo("setDiskAction error");
    });
  } else if (type == "hci-gfs" && action == "delete") {
    var cmd = ["python3", pluginpath + "/python/disk/disk_action.py", "hci-shared-file-list"];

    cockpit.spawn(cmd).then(function (data) {
      // 초기화
      $('#disk-image-delete-list').empty();

      // JSON 데이터 파싱
      var result = JSON.parse(data);
      var blockdevices = result.val.blockdevices;
      var output = '';

      if (blockdevices.length > 0) {
        for (var i = 0; i < blockdevices.length; i++) {
          var disk_id = blockdevices[i].rbd_path;
          var partition_text = '';
          var check_disable = '';

          // 각 데이터 길이에 따라 너비 조정
          var sizeWidth = Math.max(blockdevices[i].size.length * 10, 50);   // 최소 50px
          var maxSizeWidth = Math.max(blockdevices[i].size.length * 10, 100);   // 최대 100
          var pathWidth = Math.max(blockdevices[i].path.length * 10, 200);      // 최소 200px
          var rbaPathWidth = Math.max(blockdevices[i].rbd_path.length * 10, 200); // 최소 200px

          if (blockdevices[i].children != undefined) {
            partition_text = '( Partition exists count : ' + blockdevices[i].children.length + ' )';
            check_disable = 'disabled';
          }

          output += `
            <div style="margin-bottom: 8px; display: flex; align-items: center; font-family: monospace;">
              <input type="checkbox" class="disk-image-delete-checkbox" id="disk-image-checkbox-delete-${i}"
                name="form-disk-image-checkbox-delete" data-size="${blockdevices[i].size}"
                data-disk_id="${disk_id}" style="margin-left:5px; transform: scale(1.3); margin-right:10px;" ${check_disable}>
              <label for="disk-image-checkbox-delete-${i}"
                style="display: inline-block; min-width:${sizeWidth}px; max-width:${maxSizeWidth}px; flex-grow: 2; overflow: hidden; text-overflow: ellipsis;">
                ${blockdevices[i].path}
              </label>
              <label for="disk-image-checkbox-delete-${i}"
                style="display: inline-block; min-width:${sizeWidth}px; max-width:${maxSizeWidth}px; flex-grow: 1; overflow: hidden; text-overflow: ellipsis;">
                ${blockdevices[i].size}
              </label>
              <label for="disk-image-checkbox-delete-${i}"
                style="display: inline-block; min-width:${rbaPathWidth}px; flex-grow: 2; overflow: hidden; text-overflow: ellipsis;">
                ${blockdevices[i].rbd_path} ${partition_text}
              </label>
            </div>
          `;
        }
      } else {
        output = '데이터가 존재하지 않습니다.<br>';
      }

      $('#disk-image-delete-list').append(output);
    });

  }
}

// 복사 함수
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showCopyNotification("클립보드에 복사되었습니다: " + text);
  }).catch(err => {
    showCopyNotification("복사 실패: " + err);
  });
}

function showCopyNotification(message) {
  const notification = document.createElement("div");
  notification.innerText = message;
  notification.style.position = "fixed";
  notification.style.bottom = "30px";
  notification.style.right = "30px";
  notification.style.backgroundColor = "#333";
  notification.style.color = "#fff";
  notification.style.padding = "10px 20px";
  notification.style.borderRadius = "8px";
  notification.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  notification.style.zIndex = "1000";
  notification.style.opacity = "0";
  notification.style.transition = "opacity 0.5s";

  document.body.appendChild(notification);

  // fade in
  setTimeout(() => {
    notification.style.opacity = "1";
  }, 10);

  // fade out and remove
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 2000);
}

function applyExtendMethodStyles() {
  const checkedRadio = document.querySelector('input[name="extend-method"]:checked');
  const lunSection = document.getElementById('lun-selection-section');
  const diskImageCreate = document.getElementById('div-disk-image-create-extend');

  // 확장 방식에 따라 LUN 선택 영역 표시/숨김
  if (checkedRadio && lunSection) {
    lunSection.style.display = checkedRadio.value === 'add-lun' ? 'block' : 'none';
  }
  if (os_type == "ablestack-hci-filesystem" && (checkedRadio && diskImageCreate)) {
    diskImageCreate.style.display = checkedRadio.value === 'add-lun' ? 'flex' : 'none';
  }

  // 선택된 옵션 스타일 토글
  document.querySelectorAll('.ablestack-extend-method-option').forEach((label) => {
    label.classList.remove('is-selected');
  });
  if (checkedRadio) {
    const selectedLabel = checkedRadio.closest('.ablestack-extend-method-option');
    if (selectedLabel) {
      selectedLabel.classList.add('is-selected');
    }
  }
}

// 초기 상태에도 적용
applyExtendMethodStyles();

// 변경 이벤트에 적용
document.querySelectorAll('input[name="extend-method"]').forEach((radio) => {
  radio.addEventListener('change', applyExtendMethodStyles);
});
$('#div-modal-gfs-disk-extend').on('change', 'input[type=checkbox][name="form-gfs-checkbox-disk-extend"], input[type=radio][id="method-resize"], input[type=radio][id="method-add-lun"], input[type=checkbox][name="form-gfs-checkbox-disk-extend-add"]', function () {
  // 체크박스와 라디오 버튼의 상태 확인
  var isCheckboxChecked = $('input[type=checkbox][name="form-gfs-checkbox-disk-extend"]:checked').length > 0;
  var isResizeSelected = $('input[type=radio][id="method-resize"]:checked').length > 0;
  var isAddLunSelected = $('input[type=radio][id="method-add-lun"]:checked').length > 0;
  var isAddLunDiskSelected = $('input[type=checkbox][name="form-gfs-checkbox-disk-extend-add"]:checked').length > 0;

  // 버튼을 활성화할 조건들
  var isResizeChecked = isCheckboxChecked && isResizeSelected;
  var isAddLunChecked = isCheckboxChecked && isAddLunSelected && isAddLunDiskSelected;

  // 두 가지 조건 중 하나라도 만족하면 버튼 활성화
  var isChecked = isResizeChecked || isAddLunChecked;

  // 버튼의 disabled 속성 설정
  $('#button-execution-modal-gfs-disk-extend').prop('disabled', !isChecked);
});
$('#button-execution-modal-gfs-disk-extend').on('click', function () {
  $('#div-modal-gfs-disk-extend').hide();
  if (os_type == "ablestack-hci-filesystem") {
    $('#div-modal-spinner-header-txt').text("GFS 디스크를 확장 중입니다.");
  } else {
    $('#div-modal-spinner-header-txt').text("GFS 디스크를 스캔 중입니다.");
  }
  $('#div-modal-spinner').show();

  var extend_method = $('input[name="extend-method"]:checked').val();
  var non_stop_check = $('#modal-input-gfs-extend-no-downtime').prop('checked');

  var vg_name = $('input[type=checkbox][name="form-gfs-checkbox-disk-extend"]:checked')
    .map(function () {
      return $(this).data('vg_name');
    })
    .get().join(',');

  var lv_name = $('input[type=checkbox][name="form-gfs-checkbox-disk-extend"]:checked')
    .map(function () {
      return $(this).data('lv_name');
    })
    .get().join(',');

  var mount_point = $('input[type=checkbox][name="form-gfs-checkbox-disk-extend"]:checked')
    .map(function () {
      return $(this).data('mountpoint');
    })
    .get().join(',');

  var disks = $('input[type=checkbox][name="form-gfs-checkbox-disk-extend-add"]:checked')
    .map(function () {
      return $(this).data('disk_id');
    })
    .get()
    .join(',');

  var gfs_name = $('input[type=checkbox][name="form-gfs-checkbox-disk-extend"]:checked')
    .map(function () {
      var name = $(this).data('mountpoint');
      return name.split("/").pop();
    })
    .get().join(',');

  if (os_type == "ablestack-hci-filesystem") {
    if (extend_method == "resize") {
      cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--extend', '--vg-names', vg_name, '--lv-names', lv_name, '--mount-point', mount_point, '--non-stop-check', non_stop_check];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        var retVal = JSON.parse(data);
        console.log(retVal);
        if (retVal.code == "200") {
          $('#div-modal-spinner').hide();
          $('#modal-status-alert-title').html("GFS 디스크 확장");
          $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 확장했습니다.");
          $('#div-modal-status-alert').show();
        } else {
          $('#div-modal-spinner').hide();
          $('#modal-status-alert-title').html("GFS 디스크 확장");
          $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 실패했습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $('#modal-status-alert-title').html("GFS 디스크 확장");
        $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 실패했습니다.");
        $('#div-modal-status-alert').show();
      });
    } else if (extend_method == "add-lun") {
      $('#div-modal-spinner-header-txt').text("GFS 디스크 논리 볼륨을 확장 중입니다.")
      cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--add-extend', '--vg-names', vg_name, '--lv-names', lv_name, '--mount-point', mount_point, '--disks', disks, '--gfs-name', gfs_name, '--non-stop-check', non_stop_check];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        var retVal = JSON.parse(data);
        console.log(retVal);
        if (retVal.code == "200") {
          $('#div-modal-spinner').hide();
          $('#modal-status-alert-title').html("GFS 디스크 확장");
          $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 확장했습니다.");
          $('#div-modal-status-alert').show();
        } else {
          $('#div-modal-spinner').hide();
          $('#modal-status-alert-title').html("GFS 디스크 확장");
          $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 실패했습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $('#modal-status-alert-title').html("GFS 디스크 확장");
        $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 실패했습니다.");
        $('#div-modal-status-alert').show();
      });
    }
  } else {
    if (extend_method == "resize") {
      cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--rescan', '--vg-names', vg_name, '--lv-names', lv_name, '--mount-point', mount_point];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        var retVal = JSON.parse(data);
        console.log(retVal);
        if (retVal.code == "200") {
          $('#div-modal-spinner-header-txt').text("GFS 디스크 논리 볼륨을 확장 중입니다.")
          cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--extend', '--vg-names', vg_name, '--lv-names', lv_name, '--mount-point', mount_point, '--non-stop-check', non_stop_check];
          console.log(cmd);
          cockpit.spawn(cmd).then(function (data) {
            var retVal = JSON.parse(data);
            console.log(retVal);
            if (retVal.code == "200") {
              $('#div-modal-spinner').hide();
              $('#modal-status-alert-title').html("GFS 디스크 확장");
              $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 확장했습니다.");
              $('#div-modal-status-alert').show();
            } else {
              $('#div-modal-spinner').hide();
              $('#modal-status-alert-title').html("GFS 디스크 확장");
              $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 실패했습니다.");
              $('#div-modal-status-alert').show();
            }
          }).catch(function () {
            $('#div-modal-spinner').hide();
            $('#modal-status-alert-title').html("GFS 디스크 확장");
            $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 실패했습니다.");
            $('#div-modal-status-alert').show();
          });
        } else {
          $('#div-modal-spinner').hide();
          $('#modal-status-alert-title').html("GFS 디스크 확장");
          $("#modal-status-alert-body").html("GFS 디스크 스캔을 실패했습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $('#modal-status-alert-title').html("GFS 디스크 확장");
        $("#modal-status-alert-body").html("GFS 디스크 스캔을 실패했습니다.");
        $('#div-modal-status-alert').show();
      })
    } else if (extend_method == "add-lun") {
      cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--scan'];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        var retVal = JSON.parse(data);
        console.log(retVal);
        if (retVal.code == "200") {
          $('#div-modal-spinner-header-txt').text("GFS 디스크 논리 볼륨을 확장 중입니다.")
          cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--add-extend', '--vg-names', vg_name, '--lv-names', lv_name, '--mount-point', mount_point, '--disks', disks, '--gfs-name', gfs_name, '--non-stop-check', non_stop_check];
          console.log(cmd);
          cockpit.spawn(cmd).then(function (data) {
            var retVal = JSON.parse(data);
            console.log(retVal);
            if (retVal.code == "200") {
              $('#div-modal-spinner').hide();
              $('#modal-status-alert-title').html("GFS 디스크 확장");
              $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 확장했습니다.");
              $('#div-modal-status-alert').show();
            } else {
              $('#div-modal-spinner').hide();
              $('#modal-status-alert-title').html("GFS 디스크 확장");
              $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 실패했습니다.");
              $('#div-modal-status-alert').show();
            }
          }).catch(function () {
            $('#div-modal-spinner').hide();
            $('#modal-status-alert-title').html("GFS 디스크 확장");
            $("#modal-status-alert-body").html("GFS 디스크 논리 볼륨을 실패했습니다.");
            $('#div-modal-status-alert').show();
          });
        } else {
          $('#div-modal-spinner').hide();
          $('#modal-status-alert-title').html("GFS 디스크 확장");
          $("#modal-status-alert-body").html("GFS 디스크 스캔을 실패했습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $('#modal-status-alert-title').html("GFS 디스크 확장");
        $("#modal-status-alert-body").html("GFS 디스크 스캔을 실패했습니다.");
        $('#div-modal-status-alert').show();
      });
    }
  }
});
$('#menu-item-set-gfs-clvm-disk-add').on('click', function () {
  setDiskAction("clvm", "add")
  $('#div-modal-clvm-disk-add').show();
});
$('#menu-item-set-hci-clvm-disk-add').on('click', function () {
  setDiskAction("clvm", "add")
  $('#div-modal-clvm-disk-add').show();
});
$('#button-close-modal-clvm-disk-add, #button-cancel-modal-clvm-disk-add').on('click', function () {
  $('#div-modal-clvm-disk-add').hide();
});
$('#button-close-modal-hba-wwn-list, #button-execution-modal-hba-wwn-list').on('click', function () {
  $('#div-modal-hba-wwn-list').hide();
});
$('#button-execution-modal-clvm-disk-add').on('click', function () {
  $('#div-modal-clvm-disk-add').hide();
  $('#div-modal-spinner-header-txt').text("CLVM 디스크 논리 볼륨을 구성 중입니다.")
  $('#div-modal-spinner').show();

  var clvm_disk_name = $('input[type=checkbox][name="form-clvm-checkbox-disk-add"]:checked')
    .map(function () {
      return $(this).data('disk_id'); // 체크된 값 가져오기
    })
    .get() // jQuery 객체를 배열로 변환
    .join(','); // 쉼표로 연결
  cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--create-clvm', '--disks', clvm_disk_name];
  console.log(cmd);
  cockpit.spawn(cmd)
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == "200") {
        $('#div-modal-spinner').hide();
        $('#modal-status-alert-title').html("CVLM 디스크 추가");
        $("#modal-status-alert-body").html("CLVM 디스크 논리 볼륨을 구성했습니다.");
        $('#div-modal-status-alert').show();
      } else {
        $('#div-modal-spinner').hide();
        $('#modal-status-alert-title').html("CVLM 디스크 추가");
        $("#modal-status-alert-body").html("CLVM 디스크 논리 볼륨을 실패했습니다.");
        $('#div-modal-status-alert').show();
      }
    })
});
$('#div-modal-clvm-disk-add').on('change', 'input[type=checkbox][name="form-clvm-checkbox-disk-add"]', function () {
  // 체크된 항목이 있는지 확인
  var isChecked = $('input[type=checkbox][name="form-clvm-checkbox-disk-add"]:checked').length > 0;

  // 체크되면 버튼 활성화, 아니면 비활성화
  $('#button-execution-modal-clvm-disk-add').prop('disabled', !isChecked);
});

$('#menu-item-set-gfs-clvm-disk-delete').on('click', function () {
  setDiskAction("clvm", "delete")
  $('#div-modal-clvm-disk-delete').show();
});
$('#menu-item-set-hci-clvm-disk-delete').on('click', function () {
  setDiskAction("clvm", "delete")
  $('#div-modal-clvm-disk-delete').show();
});
$('#button-close-modal-clvm-disk-delete, #button-cancel-modal-clvm-disk-delete').on('click', function () {
  $('#div-modal-clvm-disk-delete').hide();
});
$('#button-execution-modal-clvm-disk-delete').on('click', function () {
  $('#div-modal-clvm-disk-delete').hide();
  $('#div-modal-spinner-header-txt').text("CLVM 디스크 논리 볼륨을 삭제 중입니다.")
  $('#div-modal-spinner').show();

  var vg_names = $('input[type=checkbox][name="form-clvm-disk-delete"]:checked')
    .map(function () {
      return $(this).data('vg'); // 체크된 값 가져오기
    })
    .get() // jQuery 객체를 배열로 변환
    .join(','); // 쉼표로 연결

  var pv_names = $('input[type=checkbox][name="form-clvm-disk-delete"]:checked')
    .map(function () {
      return $(this).data('pv'); // 체크된 값 가져오기
    })
    .get() // jQuery 객체를 배열로 변환
    .join(','); // 쉼표로 연결

  var disks = $('input[type=checkbox][name="form-clvm-disk-delete"]:checked')
    .map(function () {
      return $(this).data('disk_id'); // 체크된 값 가져오기
    })
    .get() // jQuery 객체를 배열로 변환
    .join(','); // 쉼표로 연결
  cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--delete-clvm', '--vg-names', vg_names, '--pv-names', pv_names, '--disks', disks];
  console.log(cmd);
  cockpit.spawn(cmd)
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == "200") {
        $('#div-modal-spinner').hide();
        $('#modal-status-alert-title').html("CVLM 디스크 삭제");
        $("#modal-status-alert-body").html("CLVM 디스크 논리 볼륨을 삭제했습니다.");
        $('#div-modal-status-alert').show();
      } else {
        $('#div-modal-spinner').hide();
        $('#modal-status-alert-title').html("CVLM 디스크 삭제");
        $("#modal-status-alert-body").html("CLVM 디스크 논리 볼륨 삭제를 실패했습니다.");
        $('#div-modal-status-alert').show();
      }
    })
});
$('#button-cancel-modal-clvm-disk-delete, #button-close-modal-clvm-disk-delete').on('click', function () {
  $('#div-modal-clvm-disk-delete').hide();
})
$('#div-modal-clvm-disk-delete').on('change', 'input[type=checkbox][name="form-clvm-disk-delete"]', function () {
  // 체크된 항목이 있는지 확인
  var isChecked = $('input[type=checkbox][name="form-clvm-disk-delete"]:checked').length > 0;
  // 체크되면 버튼 활성화, 아니면 비활성화
  $('#button-execution-modal-clvm-disk-delete').prop('disabled', !isChecked);
});
$('#menu-item-set-disk-detail-info, #menu-item-set-disk-integration-detail-info').on('click', function () {
  setDiskAction("disk", "detail");
  $('#div-modal-disk-detail-info').show();
});
$('#button-execution-modal-disk-detail-info, #button-close-modal-disk-detail-info').on('click', function () {
  $('#div-modal-disk-detail-info').hide();
});
$('#menu-item-set-gfs-clvm-disk-info').on('click', function () {
  setDiskAction("clvm", "list");
  $('#div-modal-clvm-disk-info').show();
});
$('#menu-item-set-hci-clvm-disk-info').on('click', function () {
  setDiskAction("clvm", "list");
  $('#div-modal-clvm-disk-info').show();
});
$('#menu-item-hci-hba-wwn-list').on('click', function () {
  setDiskAction("hba", "list");
  $('#div-modal-hba-wwn-list').show();
});
$('#menu-item-gfs-hba-wwn-list').on('click', function () {
  setDiskAction("hba", "list");
  $('#div-modal-hba-wwn-list').show();
});
$('#button-execution-modal-clvm-disk-info, #button-close-modal-clvm-disk-info').on('click', function () {
  $('#div-modal-clvm-disk-info').hide();
});
$('#button-execution-modal-gfs-maintenance-setting').on('click', function () {
  $('#div-modal-gfs-maintenance-setting').hide();
  var stonith_status = sessionStorage.getItem('stonith_status');

  if (stonith_status == "Started") {
    $('#div-modal-spinner-header-txt').text('펜스 장치 유지보수 설정 중입니다.');
    $('#div-modal-spinner').show();
    cockpit.spawn(['python3', pluginpath + '/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'disable'])
      .then(function (data) {
        $('#div-modal-spinner').hide();
        var retVal = JSON.parse(data);
        if (retVal.code == "200") {
          $("#modal-status-alert-title").html("펜스 장치 유지보수 설정 완료");
          $("#modal-status-alert-body").html("펜스 장치 유지보수 설정을 완료하였습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function (data) {
        $('#div-modal-spinner').hide();
        $('#div-modal-status-alert').show();
        createLoggerInfo("펜스 장치 유지보수 설정 실패 : " + data);
      });
  } else {
    $('#div-modal-spinner-header-txt').text('펜스 장치 유지보수 해제 중입니다.');
    $('#div-modal-spinner').show();
    cockpit.spawn(['python3', pluginpath + '/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'enable'])
      .then(function (data) {
        $('#div-modal-spinner').hide();
        var retVal = JSON.parse(data);
        if (retVal.code == "200") {
          $("#modal-status-alert-title").html("펜스 장치 유지보수 해제 완료");
          $("#modal-status-alert-body").html("펜스 장치 유지보수 해제를 완료하였습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function (data) {
        $('#div-modal-spinner').hide();
        $('#div-modal-status-alert').show();
        createLoggerInfo("펜스 장치 유지보수 해제 실패 : " + data);
      });
  }
});
$('#button-cancel-modal-gfs-maintenance-setting, #button-close-modal-cloud-vm-maintenance-setting').on('click', function () {
  $('#div-modal-gfs-maintenance-setting').hide();
})

// $('#button-gfs-qdevice-init').on('click', function(){
//   $('#div-modal-cloud-vm-qdevice-init').show();
// });
// $('#button-close-modal-cloud-vm-qdevice-init, #button-cancel-modal-cloud-vm-qdevice-init').on('click', function(){
//   $('#div-modal-cloud-vm-qdevice-init').hide();
// });
// $('#button-execution-modal-cloud-vm-qdevice-init').on('click', function(){
//   $('#div-modal-cloud-vm-qdevice-init').hide();

//   $('#div-modal-spinner-header-txt').text('쿼럼을 초기화하고 있습니다.');
//   $('#div-modal-spinner').show();

//   $("#modal-status-alert-title").html("쿼럼 초기화");
//   $("#modal-status-alert-body").html("쿼럼 초기화를 실패하였습니다.<br/>쿼럼 상태를 확인해주세요.");

//   cmd =["python3", pluginpath + "/python/gfs/gfs_manage.py", "--init-qdevice"];
//   console.log(cmd);
//   cockpit.spawn(cmd)
//   .then(function(data){
//     var retVal = JSON.parse(data);
//     if(retVal.code == "200"){
//       $('#div-modal-spinner').hide();
//       $("#modal-status-alert-title").html("쿼럼 초기화 완료");
//       $("#modal-status-alert-body").html("쿼럼 초기화를 완료하였습니다.");
//       $('#div-modal-status-alert').show();
//     }else{
//       $('#div-modal-spinner').hide();
//       $("#modal-status-alert-title").html("쿼럼 초기화 실패");
//       $("#modal-status-alert-body").html("쿼럼 초기화를 실패하였습니다.");
//       $('#div-modal-status-alert').show();
//     }
//   }).catch(function(data){
//     $('#div-modal-spinner').hide();
//     $('#div-modal-status-alert').show();
//     createLoggerInfo("쿼럼 초기화 실패 : " + data);
//   });

// });

$('[name="button-gfs-multipath-sync-name"]').on("click", function () {
  $('#div-modal-multipath-sync').show();
});
$('[name="button-gfs-storage-rescan-name"]').on("click", function () {
  $('#div-modal-storage-rescan').show();
});
$('#button-execution-modal-multipath-sync').on("click", function () {
  $('#div-modal-multipath-sync').hide();
  $('#div-modal-spinner-header-txt').text('외부 스토리지 장치 동기화하고 있습니다.');
  $('#div-modal-spinner').show();

  cmd = ["sh", pluginpath + "/shell/host/multipath_sync.sh", "sync"];
  console.log(cmd);
  cockpit.spawn(cmd)
    .then(function () {
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("외부 스토리지 동기화");
      $("#modal-status-alert-body").html("외부 스토리지 동기화가 완료되었습니다.");
      $('#div-modal-status-alert').show();

      $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
      $('#nav-button-gfs-disk-configure').removeClass('pf-m-disabled');
      $('#nav-button-gfs-ipmi-info').removeClass('pf-m-disabled');
      $('#nav-button-gfs-review').removeClass('pf-m-disabled');
    });
});
$('#button-execution-modal-storage-rescan').on("click", function () {
  $('#div-modal-storage-rescan').hide();
  $('#div-modal-spinner-header-txt').text('외부 스토리지를 재검색하고 있습니다.');
  $('#div-modal-spinner').show();

  cmd = ["sh", pluginpath + "/shell/host/multipath_sync.sh", "rescan"];
  console.log(cmd);
  cockpit.spawn(cmd)
    .then(function () {
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("외부 스토리지 재검색");
      $("#modal-status-alert-body").html("외부 스토리지 재검색이 완료되었습니다.");
      $('#div-modal-status-alert').show();
    });
});
$('#modal-input-multipath-sync').on('click', function () {
  var condition = $("#button-execution-modal-multipath-sync").prop('disabled');
  $("#button-execution-modal-multipath-sync").prop("disabled", condition ? false : true);
});
$('#modal-input-multipath-connect-check').on('click', function () {
  var condition = $("#button-execution-modal-storage-rescan").prop('disabled');
  $("#button-execution-modal-storage-rescan").prop("disabled", condition ? false : true);
});
$('#button-close-modal-multipath-sync, #button-cancel-modal-multipath-sync').on("click", function () {
  $('#div-modal-multipath-sync').hide();
});
$('#button-close-modal-storage-rescan, #button-cancel-modal-storage-rescan').on("click", function () {
  $('#div-modal-storage-rescan').hide();
});
$('#menu-item-set-gfs-disk-add').on('click', function () {
  setDiskAction("gfs", "add");
  $('#div-modal-gfs-disk-add').show();
});
$('#menu-item-set-gfs-integration-disk-add').on('click', function () {
  setDiskAction("hci-gfs", "add");
  $('#div-modal-gfs-disk-add').show();
})
$('#menu-item-set-gfs-disk-extend').on('click', function () {
  $('#button-execution-modal-gfs-disk-extend').attr('disabled', true);
  $('#method-resize').is(":checked");
  setDiskAction("gfs", "extend");
  setDiskAction("gfs", "add", "true");
  $('#div-modal-gfs-disk-extend').show();
});
$('#menu-item-set-gfs-integration-disk-extend').on('click', function () {
  $('#button-execution-modal-gfs-disk-extend').attr('disabled', true);
  $('#method-resize').is(":checked");
  setDiskAction("gfs", "extend");
  setDiskAction("hci-gfs", "add", "true");
  $('#div-modal-gfs-disk-extend').show();
})
$('#button-close-modal-gfs-disk-extend, #button-cancel-modal-gfs-disk-extend').on('click', function () {
  $('#div-modal-gfs-disk-extend').hide();
});
$('#button-close-modal-gfs-disk-add, #button-cancel-modal-gfs-disk-add').on('click', function () {
  $('#div-modal-gfs-disk-add').hide();
});
$('#button-execution-modal-gfs-disk-add').on('click', function () {
  $('#div-modal-gfs-disk-add').hide();
  $('#div-modal-spinner-header-txt').text('GFS 디스크를 추가 중입니다.');
  $('#div-modal-spinner').show();

  var gfs_disk_name = $('input[type=checkbox][name="form-gfs-checkbox-disk-add"]:checked')
    .map(function () {
      return $(this).data('disk_id'); // 체크된 값 가져오기
    })
    .get()
    .join(',');
  cockpit.file(pluginpath + '/tools/properties/cluster.json').read()
    .then(function (data) {
      var retVal = JSON.parse(data);

      var journal_nums = String(retVal.clusterConfig.hosts.length + 1);
      var list_ips = retVal.clusterConfig.hosts.map(function (host) {
        return host.ablecube;
      }).join(' ');
      cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--list-gfs'];
      console.log(cmd);
      cockpit.spawn(cmd)
        .then(function (data) {
          var retVal = JSON.parse(data);
          var maxIndex = 0;
          if (retVal.code == "200") {
            var vg_name = "";
            var lv_name = "";
            var mount_point = "";
            var gfs_name = "";
            for (var i = 0; i < retVal.val.length; i++) {
              var match = retVal.val[i].vg_name.match(/vg_glue_(\d+)/);
              if (match) {
                var num = parseInt(match[1], 10); // 숫자 부분만 가져와서 정수로 변환
                if (num > maxIndex) {
                  maxIndex = num;
                }
              }

              newIndex = maxIndex > 0 ? maxIndex + 1 : 1;
              vg_name = "vg_glue_" + newIndex;
              lv_name = "lv_glue_" + newIndex;
              mount_point = "/mnt/glue-gfs-" + newIndex;
              gfs_name = "glue-gfs-" + newIndex;
            }
            var cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--create-gfs', '--disks', gfs_disk_name,
              '--vg-name', vg_name, '--lv-name', lv_name, '--gfs-name', gfs_name, '--mount-point', mount_point,
              '--cluster-name', 'cloudcenter_res', '--journal-nums', journal_nums, '--list-ip', list_ips];
            console.log(cmd);

            cockpit.spawn(cmd).then(function (data) {

              var retVal = JSON.parse(data);
              if (retVal.code == "200") {
                $('#div-modal-spinner').hide();
                $("#modal-status-alert-title").html("GFS 디스크 추가");
                $("#modal-status-alert-body").html("GFS 디스크를 추가하였습니다.");
                $('#div-modal-status-alert').show();
              } else {
                $('#div-modal-spinner').hide();
                $("#modal-status-alert-title").html("GFS 디스크 추가");
                $("#modal-status-alert-body").html("GFS 디스크 추가를 실패하였습니다.");
                $('#div-modal-status-alert').show();
              }
            }).catch(function (error) {
              $('#div-modal-spinner').hide();
              $("#modal-status-alert-title").html("GFS 디스크 추가");
              $("#modal-status-alert-body").html("GFS 디스크 추가를 실패하였습니다.");
              $('#div-modal-status-alert').show();
              console.error("GFS 디스크 추가 실패:", error);
            });
          }
        }).catch(function (error) {
          $('#div-modal-spinner').hide();
          $("#modal-status-alert-title").html("GFS 디스크 추가");
          $("#modal-status-alert-body").html("GFS 디스크 리스트 정보를 불러오지 못했습니다.");
          $('#div-modal-status-alert').show();
          console.error("디스크 목록 조회 실패:", error);
        });
    }).catch(function () {
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("GFS 디스크 추가");
      $("#modal-status-alert-body").html("Cluster.json 파일을 불러오지 못했습니다.");
      $('#div-modal-status-alert').show();
      console.error("클러스터 정보를 불러오지 못했습니다.");
    });
});
$('#div-modal-gfs-disk-add').on('change', 'input[type=checkbox][name="form-gfs-checkbox-disk-add"]', function () {
  // 체크된 항목이 있는지 확인
  var isChecked = $('input[type=checkbox][name="form-gfs-checkbox-disk-add"]:checked').length > 0;

  // 체크되면 버튼 활성화, 아니면 비활성화
  $('#button-execution-modal-gfs-disk-add').prop('disabled', !isChecked);
});
$('#button-close-modal-gfs-disk-info,#button-cancel-modal-gfs-disk-info').on('click', function () {
  $('#div-modal-gfs-disk-info').hide();
});
$('#menu-item-set-gfs-disk-delete, #menu-item-set-gfs-integration-disk-delete').on('click', function () {
  setDiskAction("gfs", "delete");
  $('#div-modal-gfs-disk-delete').show();
});
$('#button-cancel-modal-gfs-disk-delete , #button-close-modal-gfs-disk-delete').on('click', function () {
  $('#div-modal-gfs-disk-delete').hide();
});
$('#div-modal-gfs-disk-delete').on('change', 'input[type=checkbox][name="form-gfs-checkbox-disk-delete"]', function () {
  if (this.checked) {
    // 다른 체크박스는 모두 해제
    $('input[type=checkbox][name="form-gfs-checkbox-disk-delete"]').not(this).prop('checked', false);
  }
  // 체크된 항목이 있는지 확인
  var isChecked = $('input[type=checkbox][name="form-gfs-checkbox-disk-delete"]:checked').length > 0;

  // 체크되면 버튼 활성화, 아니면 비활성화
  $('#button-execution-modal-gfs-disk-delete').prop('disabled', !isChecked);
});
$('#button-execution-modal-gfs-disk-delete').on('click', function () {
  $('#div-modal-gfs-disk-delete').hide();
  $('#div-modal-spinner-header-txt').text('GFS 디스크를 삭제 중입니다.');
  $('#div-modal-spinner').show();
  function extractData(selector, dataAttribute, regex) {
    return $(selector)
      .map(function () {
        return $(this).data(dataAttribute);
      })
      .get()
      .map(function (value) {
        var match = value.match(regex);
        return match ? match[1] : '';
      })
      .join(','); // 배열을 콤마로 구분된 문자열로 변환
  }

  var gfs_disk_name = $('input[type=checkbox][name="form-gfs-checkbox-disk-delete"]:checked')
    .map(function () {
      if (os_type == "ablestack-hci-filesystem") {
        return $(this).data('devices');
      } else {
        return $(this).data('disk_id');
      }
    })
    .get()
    .join(','); // 최종적으로 모든 결과를 콤마로 연결

  var gfs_name = extractData('input[type=checkbox][name="form-gfs-checkbox-disk-delete"]:checked', 'mountpoint', /\/mnt\/(.*)/);
  var vg_name = extractData('input[type=checkbox][name="form-gfs-checkbox-disk-delete"]:checked', 'lvm', /\/dev\/mapper\/([^\-]+)/);
  var lv_name = extractData('input[type=checkbox][name="form-gfs-checkbox-disk-delete"]:checked', 'lvm', /\/dev\/mapper\/[^-]+-(.*)/);

  cmd = ['python3', pluginpath + '/python/clvm/disk_manage.py', '--delete-gfs', '--disks', gfs_disk_name, '--gfs-name', gfs_name, '--vg-names', vg_name, '--lv-names', lv_name];
  console.log(cmd);
  cockpit.spawn(cmd)
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == "200") {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("GFS 디스크 삭제");
        $("#modal-status-alert-body").html("GFS 디스크를 삭제하였습니다.");
        $('#div-modal-status-alert').show();
      } else {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("GFS 디스크 삭제");
        $("#modal-status-alert-body").html("GFS 디스크 삭제를 실패하였습니다.");
        $('#div-modal-status-alert').show();
      }
    }).catch(function () {
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("GFS 디스크 삭제");
      $("#modal-status-alert-body").html("GFS 디스크 삭제를 실패하였습니다.");
      $('#div-modal-status-alert').show();
    });
});
$('#button-gfs-host-remove').on('click', function () {
  updateGfsHostList();
  $('#div-modal-gfs-host-remove').show();
});

$('#button-cancel-modal-gfs-host-remove, #button-close-gfs-host-remove').on('click', function () {
  $('#div-modal-gfs-host-remove').hide();
});

$('#modal-input-gfs-host-remove').on('click', function () {
  var condition = $("#button-execution-modal-gfs-host-remove").prop('disabled');
  var check = $('#form-select-gfs-host-remove').val();

  $("#button-execution-modal-gfs-host-remove").prop("disabled", condition ? (check ? false : true) : true);
});

$('#button-execution-modal-gfs-host-remove').on('click', function () {
  $('#div-modal-gfs-host-remove').hide();
  $('#div-modal-spinner-header-txt').text('CCVM 체크 및 마이그레이션 중');
  $('#div-modal-spinner').show();
  var remove_host_name = $('#form-select-gfs-host-remove option:selected').val();
  var remove_host_ip = $('#form-select-gfs-host-remove option:selected').data('ip');
  cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--check-ccvm', '--target-ip', remove_host_ip];
  console.log(cmd);
  cockpit.spawn(cmd).then(function (data) {
    retVal = JSON.parse(data);
    console.log(retVal);
    if (retVal.code == "200" || retVal.code == "201") {
      $('#div-modal-spinner-header-txt').text('호스트 제거 중');
      cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--remove-host', '--target-ip', remove_host_ip, '--hostname', remove_host_name];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        retVal = JSON.parse(data);
        if (retVal.code == "200") {
          console.log(retVal);
          $('#div-modal-spinner').hide();
          $("#modal-status-alert-title").html("호스트 제거");
          $("#modal-status-alert-body").html("호스트 제거를 성공하였습니다.");
          $('#div-modal-status-alert').show();
        } else {
          $('#div-modal-spinner').hide();
          $("#modal-status-alert-title").html("호스트 제거");
          $("#modal-status-alert-body").html("호스트를 제거를 실패하였습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("호스트 제거");
        $("#modal-status-alert-body").html("호스트를 제거를 실패하였습니다.");
        $('#div-modal-status-alert').show();
      });
    } else {
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("CCVM 체크 중");
      $("#modal-status-alert-body").html("CCVM 체크 및 마이그레이션을 실패하였습니다.");
      $('#div-modal-status-alert').show();
    }
  }).catch(function () {
    $('#div-modal-spinner').hide();
    $("#modal-status-alert-title").html("CCVM 체크 중");
    $("#modal-status-alert-body").html("CCVM 체크 및 마이그레이션을 실패하였습니다.");
    $('#div-modal-status-alert').show();
  });
});
/**
 * Meathod Name : gfsResourceStatus
 * Date Created : 2025.01.06
 * Writer : 정민철
 * Description : GFS 리소스 상태 카드란 처리
 * Parameter : 없음
 * Return : 없음
 * History : 2025.01.06 최초 작성
 */
function gfsResourceStatus() {
  return new Promise((resolve) => {
    //초기 상태 체크 중 표시
    $('#gfs-fence-status, #gfs-lock-status, #gfs-integration-fence-status, #gfs-integration-lock-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $('#gfs-fence-back-color, #gfs-lock-back-color, #gfs-integration-fence-back-color, #gfs-integration-lock-back-color').attr('class', 'pf-v6-c-label pf-m-orange');
    $('#gfs-fence-icon, #gfs-lock-icon, #gfs-integration-fence-icon, #gfs-integration-lock-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');

    cockpit.spawn(['python3', pluginpath + '/python/gfs/gfs_resource_status.py'])
      .then(function (data) {
        var retVal = JSON.parse(data);
        if (retVal.code == "200") {
          var gfs_fence_started_arr = [];
          var gfs_fence_stopped_arr = [];
          var gfs_fence_offline_arr = [];

          var gfs_lvmlockd_arr = [];
          var gfs_dlm_arr = [];
          var gfs_file_system_arr_list = [];
          var gfs_lvmlockd_start_arr = [];
          var gfs_lvmlockd_stop_arr = [];
          var gfs_dlm_start_arr = [];
          var gfs_dlm_stop_arr = [];
          var gfs_dlm_offline_arr = [];
          var gfs_lvmlockd_offline_arr = [];
          var num = 0;

          for (var m = 0; m < retVal.val.nodes_info.length; m++) {
            var node_name = retVal.val.nodes_info[m].name;
            var state = retVal.val.nodes_info[m].online;
            if (state == "false") {
              gfs_fence_offline_arr.push(node_name);
              gfs_lvmlockd_offline_arr.push(node_name);
              gfs_dlm_offline_arr.push(node_name);
              gfs_file_system_arr.push(["", node_name, "offline"]);
            }
          }
          for (var i = 0; i < retVal.val.resources.fence_resources.length; i++) {
            var gfs_fence_host = retVal.val.resources.fence_resources[i].node_name;
            var gfs_fence_status = retVal.val.resources.fence_resources[i].role;

            if (gfs_fence_status == "Started") {
              gfs_fence_started_arr.push(gfs_fence_host);
            } else {
              gfs_fence_stopped_arr.push(gfs_fence_host);
            }
          }

          for (var j = 0; j < retVal.val.node_history.length; j++) {

            var node_name = retVal.val.node_history[j].node_name;

            for (var k = 0; k < retVal.val.node_history[j].resource_histories.length; k++) {
              var resource_name = retVal.val.node_history[j].resource_histories[k].resource_id;
              var resource_status;
              var start_error_occurred = false; // start에서 error 발생 여부를 추적

              for (var n = 0; n < retVal.val.node_history[j].resource_histories[k].operations.length; n++) {
                var operation_length = retVal.val.node_history[j].resource_histories[k].operations;
                var operation = retVal.val.node_history[j].resource_histories[k].operations[n];
                var task = operation.task;
                var rc_text = operation.rc_text;

                if (n == operation_length.length - 1) {
                  if (task == "start" || task == "stop" || task == "monitor") {
                    if (resource_name === "glue-lvmlockd") {
                      resource_status = task;

                      if (task == "start" && rc_text == "error") {
                        resource_status = task + "(" + rc_text + ")"
                        start_error_occurred = true; // start에서 오류 발생
                      }
                      if (task == "stop" && start_error_occurred) {
                        // start에서 error가 발생했으므로 stop 추가하지 않음
                        continue;
                      }
                      if (task == "monitor" && resource_status != "stop") {
                        resource_status = "start";
                        gfs_lvmlockd_arr.push([node_name, resource_status]); //
                      } else {
                        gfs_lvmlockd_arr.push([node_name, resource_status]); //
                      }

                    } else if (resource_name === "glue-dlm") {
                      resource_status = task;
                      if (task == "start" && rc_text == "error") {
                        resource_status = task + "(" + rc_text + ")"
                        start_error_occurred = true; // start에서 오류 발생
                      }

                      if (task == "stop" && start_error_occurred) {
                        // start에서 error가 발생했으므로 stop 추가하지 않음
                        continue;
                      }
                      if (task == "monitor" && resource_status != "stop") {
                        resource_status = "start";
                        gfs_dlm_arr.push([node_name, resource_status]); // 배열 추가
                      } else {
                        gfs_dlm_arr.push([node_name, resource_status]); // 배열 추가
                      }

                    } else if (/^glue-gfs(-\d+)?$/.test(resource_name)) {

                      gfs_file_system_arr_list[num] = [];
                      resource_status = task;
                      if (task == "start" && rc_text == "error") {
                        resource_status = task + "(" + rc_text + ")"
                        start_error_occurred = true; // start에서 오류 발생
                      }

                      if (task == "stop" && start_error_occurred) {
                        // start에서 error가 발생했으므로 stop 추가하지 않음
                        continue;
                      }
                      if (task == "monitor" && resource_status != "stop") {
                        resource_status = "start";
                        gfs_file_system_arr_list[num].push([resource_name, node_name, resource_status]); // 배열 추가
                      } else {
                        gfs_file_system_arr_list[num].push([resource_name, node_name, resource_status]); // 배열 추가
                      }
                      num++;
                    }
                  }
                }

              }
            }
          }
          if (gfs_fence_offline_arr.length == 0) {
            if (gfs_fence_stopped_arr.length == 0) {
              $("#gfs-fence-back-color, #gfs-integration-fence-back-color").attr('class', 'pf-v6-c-label pf-m-green');
              $("#gfs-fence-icon, #gfs-integration-fence-icon").attr('class', 'fas fa-fw fa-check-circle');
              $('#gfs-fence-status, #gfs-integration-fence-status').text("Health OK");
              $('#gfs-fence-text, #gfs-integration-fence-text').text('Started ( ' + gfs_fence_started_arr.join(', ') + ' )');
            } else if (gfs_fence_started_arr.length == 0) {
              $("#gfs-fence-back-color, #gfs-integration-fence-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
              $('#gfs-fence-status, #gfs-integration-fence-status').text("Health Warn");
              $('#gfs-fence-text, #gfs-integration-fence-text').text('Stopped ( ' + gfs_fence_stopped_arr.join(', ') + ' )');
            } else {
              $("#gfs-fence-back-color, #gfs-integration-fence-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
              $('#gfs-fence-status, #gfs-integration-fence-status').text("Health Warn");
              $('#gfs-fence-text, #gfs-integration-fence-text').text('Started ( ' + gfs_fence_started_arr.join(', ') + ' ), ' + 'Stopped ( ' + gfs_fence_stopped_arr.join(', ') + ' )');
            }
          } else {
            if (gfs_fence_stopped_arr.length == 0) {
              $("#gfs-fence-back-color, #gfs-integration-fence-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
              $('#gfs-fence-status, #gfs-integration-fence-status').text("Health Warn");
              $('#gfs-fence-text, #gfs-integration-fence-text').text('Started ( ' + gfs_fence_started_arr.join(', ') + ' ), Offline ( ' + gfs_fence_offline_arr.join(', ') + ' )');
            } else if (gfs_fence_started_arr.length == 0) {
              $("#gfs-fence-back-color, #gfs-integration-fence-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
              $('#gfs-fence-status, #gfs-integration-fence-status').text("Health Warn");
              $('#gfs-fence-text, #gfs-integration-fence-text').text('Stopped ( ' + gfs_fence_stopped_arr.join(', ') + ' ), Offline ( ' + gfs_fence_offline_arr.join(', ') + ' )');
            } else {
              $("#gfs-fence-back-color, #gfs-integration-fence-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
              $('#gfs-fence-status, #gfs-integration-fence-status').text("Health Warn");
              $('#gfs-fence-text, #gfs-integration-fence-text').text('Started ( ' + gfs_fence_started_arr.join(', ') + ' ), ' + 'Stopped ( ' + gfs_fence_stopped_arr.join(', ') + ' ), Offline ( ' + gfs_fence_offline_arr.join(', ') + ' )');
            }
          }
          try {

            for (var l = 0; l < gfs_lvmlockd_arr.length; l++) {
              // gfs_lvmlockd 처리
              if (l < gfs_lvmlockd_arr.length && gfs_lvmlockd_arr[l][1] !== undefined) {
                if (gfs_lvmlockd_arr[l][1] == "stop") {
                  gfs_lvmlockd_stop_arr.push(gfs_lvmlockd_arr[l][0]);
                } else if (gfs_lvmlockd_arr[l][1] == "start(error)") {
                  $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Err");
                  $('#gfs-lock-back-color, #gfs-integration-lock-back-color').attr('class', 'pf-v6-c-label pf-m-red');
                  $('#gfs-lock-icon, #gfs-integration-lock-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');
                  setStatusTone($('#gfs-low-info, #gfs-integration-low-info'), "danger");
                  $('#gfs-low-info, #gfs-integration-low-info').text("GFS 잠금 장치 구성 중 오류가 발생했습니다.");

                  return;
                } else {
                  gfs_lvmlockd_start_arr.push(gfs_lvmlockd_arr[l][0]);
                }
              } else {
                $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Err");
                $('#gfs-lock-back-color, #gfs-integration-lock-back-color').attr('class', 'pf-v6-c-label pf-m-red');
                $('#gfs-lock-icon, #gfs-integration-lock-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');
                setStatusTone($('#gfs-low-info, #gfs-integration-low-info'), "danger");
                $('#gfs-low-info, #gfs-integration-low-info').text("GFS 잠금 장치 구성 중 오류가 발생했습니다.");
              }

              // gfs_dlm 처리
              if (l < gfs_dlm_arr.length && gfs_dlm_arr[l][1] !== undefined) {
                if (gfs_dlm_arr[l][1] == "stop") {
                  gfs_dlm_stop_arr.push(gfs_dlm_arr[l][0]);
                } else if (gfs_dlm_arr[l][1] == "start(error)") {
                  $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Err");
                  $('#gfs-lock-back-color, #gfs-integration-lock-back-color').attr('class', 'pf-v6-c-label pf-m-red');
                  $('#gfs-lock-icon, #gfs-integration-lock-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');
                  setStatusTone($('#gfs-low-info, #gfs-integration-low-info'), "danger");
                  $('#gfs-low-info, #gfs-integration-low-info').text("GFS 잠금 장치 구성 중 오류가 발생했습니다.");
                  return;
                } else {
                  gfs_dlm_start_arr.push(gfs_dlm_arr[l][0]);
                }
              } else {
                $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Err");
                $('#gfs-lock-back-color, #gfs-integration-lock-back-color').attr('class', 'pf-v6-c-label pf-m-red');
                $('#gfs-lock-icon, #gfs-integration-lock-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');
                setStatusTone($('#gfs-low-info, #gfs-integration-low-info'), "danger");
                $('#gfs-low-info, #gfs-integration-low-info').text("GFS 잠금 장치 구성 중 오류가 발생했습니다.");
              }
            }
            if (gfs_dlm_offline_arr.length == 0 && gfs_lvmlockd_offline_arr == 0) {
              if (gfs_dlm_stop_arr.length == 0 && gfs_lvmlockd_stop_arr.length == 0) {
                $("#gfs-lock-back-color, #gfs-integration-lock-back-color").attr('class', 'pf-v6-c-label pf-m-green');
                $("#gfs-lock-icon, #gfs-integration-lock-icon").attr('class', 'fas fa-fw fa-check-circle');
                $('#gfs-lock-status, #gfs-integration-lock-status').text("Health OK");
                $('#gfs-lock-text, #gfs-integration-lock-text').html(
                  'glue-dlm, glue-lvmlockd : Started ( ' + gfs_lvmlockd_start_arr.join(', ') + ' )'
                );
              } else if (gfs_dlm_start_arr.length == 0 && gfs_lvmlockd_start_arr.length == 0) {
                $("#gfs-lock-back-color, #gfs-integration-lock-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
                $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Warn");
                $('#gfs-lock-text, #gfs-integration-lock-text').html(
                  'glue-dlm, glue-lvmlockd : Stopped ( ' + gfs_lvmlockd_stop_arr.join(', ') + ' )'
                );
              } else {
                $("#gfs-lock-back-color, #gfs-integration-lock-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
                $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Warn");
                $('#gfs-lock-text, #gfs-integration-lock-text').html(
                  'glue-dlm, glue-lvmlockd : Started ( ' + gfs_lvmlockd_start_arr.join(', ') + ' ),</br> ' +
                  'Stopped ( ' + gfs_lvmlockd_stop_arr.join(', ') + ' )</br>'
                );
              }
            } else {
              if (gfs_dlm_stop_arr.length == 0 && gfs_lvmlockd_stop_arr.length == 0) {
                $("#gfs-lock-back-color, #gfs-integration-lock-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
                $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Warn");
                $('#gfs-lock-text, #gfs-integration-lock-text').html(
                  'glue-dlm, glue-lvmlockd : Started ( ' + gfs_lvmlockd_start_arr.join(', ') + ' ), Offline ( ' + gfs_lvmlockd_offline_arr.join(', ') + ' )'
                );
              } else if (gfs_dlm_start_arr.length == 0 && gfs_lvmlockd_start_arr.length == 0) {
                $("#gfs-lock-back-color, #gfs-integration-lock-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
                $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Warn");
                $('#gfs-lock-text, #gfs-integration-lock-text').html(
                  'glue-dlm, glue-lvmlockd : Stopped ( ' + gfs_lvmlockd_stop_arr.join(', ') + ' ), Offline ( ' + gfs_lvmlockd_offline_arr.join(', ') + ' )'
                );
              } else {
                $("#gfs-lock-back-color, #gfs-integration-lock-back-color").attr('class', 'pf-v6-c-label pf-m-orange');
                $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Warn");
                $('#gfs-lock-text, #gfs-integration-lock-text').html(
                  'glue-dlm, glue-lvmlockd : Started ( ' + gfs_lvmlockd_start_arr.join(', ') + ' ), Offline ( ' + gfs_dlm_offline_arr.join(', ') + ' )</br>' +
                  'Stopped ( ' + gfs_lvmlockd_stop_arr.join(', ') + ' ), Offline ( ' + gfs_lvmlockd_offline_arr.join(', ') + ' )'
                );
              }
            }

            for (var l = 0; l < gfs_file_system_arr_list.length; l++) {
              // gfs_file_system 처리
              if (l < gfs_file_system_arr_list.length && gfs_file_system_arr_list[l][0][2] !== undefined) {
                gfs_file_system_arr.push([gfs_file_system_arr_list[l][0][0], gfs_file_system_arr_list[l][0][1], gfs_file_system_arr_list[l][0][2]]);
              }
            }

          } catch (error) {
            $('#gfs-lock-status, #gfs-integration-lock-status').text("Health Err");
            $('#gfs-lock-back-color, #gfs-integration-lock-back-color').attr('class', 'pf-v6-c-label pf-m-red');
            $('#gfs-lock-icon, #gfs-integration-lock-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');
            // 오류 처리 추가 (필요 시 사용자 알림 등)
            setStatusTone($('#gfs-low-info, #gfs-integration-low-info'), "danger");
            $('#gfs-low-info').text("GFS 리소스 구성 중 오류가 발생했습니다.");
            $('#gfs-integration-low-info').text("GFS 통합 구성 중 오류가 발생했습니다.");
            return;
          }
          setStatusTone($('#gfs-low-info, #gfs-integration-low-info'), "ok");
          $('#gfs-low-info').text("GFS 리소스가 구성되었습니다.");
          $('#gfs-integration-low-info').text("GFS 통합이 구성되었습니다.");
        } else {
          $('#gfs-fence-status, #gfs-lock-status, #gfs-integration-fence-status, #gfs-integration-lock-status').text("Health Err");
          $('#gfs-fence-back-color, #gfs-lock-back-color, #gfs-integration-fence-back-color, #gfs-integration-lock-back-color').attr('class', 'pf-v6-c-label pf-m-red');
          $('#gfs-fence-icon, #gfs-lock-icon, #gfs-integration-fence-icon, #gfs-integration-lock-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');
          $('#gfs-fence-text, #gfs-lock-text, #gfs-integration-fence-text, #gfs-integration-lock-text').text("N/A");
          setStatusTone($('#gfs-low-info, #gfs-integration-low-info'), "danger");
          $('#gfs-low-info').text("GFS 리소스가 구성되지 않았습니다.");
          $('#gfs-integration-low-info').text("GFS 통합이 구성되지 않았습니다.");
        }

        resolve();
      })
    cockpit.spawn(['python3', pluginpath + '/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'check'])
      .then(function (data) {
        var retVal = JSON.parse(data);
        sessionStorage.setItem("stonith_status", retVal.val);

        if (retVal.val == "Started") {
          $('#gfs-maintenance-update, #gfs-integration-maintenance-update').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-gfs-maintenance" onclick="gfs_maintenance_run()">펜스 장치 유지보수 설정</a>');
        } else if (retVal.val == "Stopped") {
          $('#gfs-maintenance-update, #gfs-integration-maintenance-update').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-gfs-maintenance" onclick="gfs_maintenance_run()">펜스 장치 유지보수 해제</a>');
        }
        else {
          $('#gfs-maintenance-update, #gfs-integration-maintenance-update').html('<a class="pf-v6-c-menu__item pf-m-disabled" href="#" id="menu-item-gfs-maintenance" onclick="gfs_maintenance_run()">펜스 장치 유지보수 설정</a>');
        }
        resolve();
      })

    // cockpit.spawn(['python3', pluginpath + '/python/gfs/gfs_manage.py', '--check-qdevice'])
    // .then(function(data){
    //   var retVal =JSON.parse(data);
    //   if (retVal.code == "200" || retVal.code == "204"){
    //     sessionStorage.setItem("qdevice_status","true");
    //     $('#button-gfs-qdevice-init').removeClass("pf-m-disabled");
    //   }else{
    //     sessionStorage.setItem("qdevice_status","false");
    //   }
    //   resolve();
    // })
  })
}
/**
 * Meathod Name : updateGfsHostList
 * Date Created : 2025.02.28
 * Writer : 정민철
 * Description : GFS 호스트 제거를 위한 호스트 리스트
 * Parameter : 없음
 * Return : 없음
 * History : 2025.02.28 최초 작성
 */
function updateGfsHostList() {
  cockpit.spawn(['python3', pluginpath + '/python/gfs/gfs_manage.py', '--check-host']).then(function (data) {
    var result = JSON.parse(data);
    if (result.code == "200") {
      var hostList = result.val;
      var selectHost = $('#form-select-gfs-host-remove');
      selectHost.empty();
      selectHost.append('<option value="">- 선택하십시오 -</option>');
      for (var i = 0; i < hostList.length; i++) {
        selectHost.append('<option value="' + hostList[i].hostname + '" data-ip="' + hostList[i].ablecube + '">' + hostList[i].hostname + '</option>');
      }
    }
  })
}
function updateModalContent(mountPoint, multipaths, devices, physicalVolume, volumeGroup, diskSize) {
  // Populate the modal with relevant information
  $('#gfs-disk-mount-info').text(mountPoint);
  $('#gfs-disk-physical-volume').text(devices + " ( " + multipaths + " ) ");
  $('#gfs-disk-volume-group').text(physicalVolume);
  $('#gfs-disk-size').text(diskSize);
  $('#gfs-disk-status').text("Health OK"); // You can customize based on the actual status
  // You can adjust status class based on the state (e.g., if there's an error, change color)
  $('#gfs-disk-css').removeClass('pf-m-red').addClass('pf-m-green'); // Adjust based on your logic
  $('#gfs-disk-icon').removeClass('fa-exclamation-triangle').addClass('fa-check-circle'); // Adjust based on status\

  $('#gfs-disk-text').text('N/A');
  for (var i = 0; i < gfs_file_system_arr.length; i++) {
    if (gfs_file_system_arr[i][0] == mountPoint.split("/")[2]) {

      var offline_filteredIPs = [...new Set(
        gfs_file_system_arr
          .filter(item => item[2] === "offline")
          .map(item => item[1])
      )].join(', ');

      var start_filteredIPs = [...new Set(
        gfs_file_system_arr
          .filter(item => item[0] === mountPoint.split("/")[2] && item[2] === "start")
          .map(item => item[1])
      )].join(', ');

      var stop_filteredIPs = [...new Set(
        gfs_file_system_arr
          .filter(item => item[0] === mountPoint.split("/")[2] && item[2].includes("stop"))
          .map(item => item[1])
      )].join(', ');


      if (offline_filteredIPs) {
        if (start_filteredIPs && !stop_filteredIPs) {
          $('#gfs-disk-text').html('Started ( ' + start_filteredIPs + ' )</br>' + 'Offline ( ' + offline_filteredIPs + ' )');
        } else if (!start_filteredIPs && stop_filteredIPs) {
          $('#gfs-disk-text').html('Stopped ( ' + stop_filteredIPs + ' )</br>' + 'Offline ( ' + offline_filteredIPs + ' )');
        } else {
          $('#gfs-disk-text').html('Started ( ' + start_filteredIPs + ' )</br>' + 'Offline ( ' + offline_filteredIPs + ' )');
        }
      } else {
        if (start_filteredIPs && !stop_filteredIPs) {
          $('#gfs-disk-text').text('Started ( ' + start_filteredIPs + ' )');
        } else if (!start_filteredIPs && stop_filteredIPs) {
          $('#gfs-disk-text').text('Stop ( ' + stop_filteredIPs + ' )');
        } else {
          $('#gfs-disk-text').html('Started ( ' + start_filteredIPs + ' )</br> Stopped ( ' + stop_filteredIPs + ' )');
        }
      }
    }
  }
}
// 라이센스 상태 확인 및 표시
function updateLicenseStatus() {
  // superuser 권한으로 실행
  cockpit.spawn(['python3', '/usr/share/cockpit/ablestack/python/license/register_license.py', '--status'], { superuser: true })
    .then(function (data) {
      var result = JSON.parse(data);
      var licenseDescription = '';
      console.log(result.code, result.val.status)

      if (result.code == "200" && result.val && result.val.status === 'active') {
        // 유효한 라이센스가 있는 경우
        licenseDescription = `
          <div class="license-info">
            <p><i class="fas fa-check-circle" style="color: green;"></i> 라이센스가 등록되어 있습니다.</p>
            <p><strong>시작일:</strong> ${result.val.issued}</p>
            <p><strong>만료일:</strong> ${result.val.expired}</p>
            <hr>
            <p class="text-muted">새로운 라이센스를 등록하면 기존 라이센스가 교체됩니다.</p>
          </div>
        `;
      } else if (result.code == "404") {
        // 라이센스가 없는 경우
        licenseDescription = `
          <div class="license-info">
            <p><i class="fas fa-exclamation-circle" style="orange;"></i> 등록된 라이센스가 없습니다.</p>
            <p>라이센스 파일을 선택하여 등록해주세요.</p>
          </div>
        `;
      } else if (result.code == "200" && result.val.status == 'inactive') {
        licenseDescription = `
          <div class="license-info">
          <p style="font-size: 15.7px; color: crimson;"><i class="fas fa-exclamation-triangle" style="color: red;"></i> 등록된 라이선스의 유효기간이 만료되었습니다.새로운 라이센스를 등록해 주세요.</p>
            <p><strong>시작일:</strong> ${result.val.issued}</p>
            <p><strong>만료일:</strong> ${result.val.expired}</p>
            <hr>
            <p class="text-muted">새로운 라이센스를 등록하면 기존 라이센스가 교체됩니다.</p>
          </div>
        `;
      } else {
        // 오류가 발생한 경우
        licenseDescription = `
          <div class="license-info error">
            <p><i class="fas fa-exclamation-triangle" style="color: red;"></i> 라이센스 상태 확인 중 오류가 발생했습니다.</p>
            <p>${result.val}</p>
          </div>
        `;
      }

      $('#div-license-description').html(licenseDescription);
    })
    .catch(function (error) {
      console.error("라이센스 상태 확인 실패:", error);
      $('#div-license-description').html(`
        <div class="license-info error">
          <p><i class="fas fa-exclamation-triangle" style="color: red;"></i> 라이센스 상태를 확인할 수 없습니다.</p>
          <p>시스템 오류가 발생했습니다.</p>
        </div>
      `);
    });
}
// 라이센스 등록 버튼 클릭 이벤트
$('#button-execution-modal-license-register').on('click', function () {
  // ... 기존 코드 ...
});

// 모달이 열릴 때 라이센스 상태 확인
$('#button-open-modal-license-register').on('click', function () {
  $('#div-modal-license-register').show();
  updateLicenseStatus();
});

// 파일 선택 시 버튼 활성화
$('#input-license-file').on('change', function () {
  $('#button-execution-modal-license-register').prop('disabled', !this.files.length);
});

// 라이센스 관련 이벤트 핸들러
function initializeLicenseHandlers() {
  // 라이센스 등록 모달 열기
  $('#button-open-modal-license-register').on('click', function () {
    $('#div-modal-license-register').show();
    checkLicenseStatusConfirm();
  });

  // 모달 닫기
  $('#button-close-modal-license-register, #button-cancel-modal-license-register').on('click', function () {
    $('#div-modal-license-register').hide();
    $('#input-license-file').val("");
  });

  // 파일 선택 시 버튼 활성화
  $('#input-license-file').on('change', function () {
    $('#button-execution-modal-license-register').prop('disabled', !this.files.length);
  });

  // 라이센스 등록 실행
  $('#button-execution-modal-license-register').on('click', function () {
    const licenseFile = $('#input-license-file')[0].files[0];
    if (!licenseFile) {
      alert("라이센스 파일을 선택해주세요.");
      return;
    }

    // 로딩 스피너 표시
    $('#div-modal-spinner-header-txt').text('라이센스 등록중입니다...');
    $('#div-modal-spinner-body-txt').text('라이센스를 등록하는 중입니다. 잠시만 기다려주세요.');
    $('#div-modal-spinner').show();

    const reader = new FileReader();
    reader.onload = function (e) {
      const fileContent = e.target.result;
      const base64Content = btoa(fileContent);

      // 라이센스 등록 API 호출
      cockpit.spawn([
        'python3',
        '/usr/share/cockpit/ablestack/python/license/register_license.py',
        '--license-content',
        base64Content,
        '--original-filename',
        licenseFile.name
      ], { superuser: true })
        .then(function (data) {
          $('#div-modal-spinner').hide();
          const result = JSON.parse(data);
          if (result.code == "200") {
            $('#div-modal-license-register').hide();
            alert("라이센스가 성공적으로 등록되었습니다.");
            location.reload();
          } else {
            alert("라이센스 등록 실패: " + result.val);
            location.reload();
          }
        })
        .catch(function (error) {
          $('#div-modal-spinner').hide();
          $('#div-modal-license-register').hide();
          console.error("Error:", error);
          alert("라이센스 등록 중 오류가 발생했습니다: " + error);
          location.reload();
        });
    };
    reader.readAsBinaryString(licenseFile);
  });
}
/**
 * Meathod Name : LocalDiskStatus
 * Date Created : 2025.08.07
 * Writer : 정민철
 * Description : 단일 서버 구성에서 로컬 디스크 상태 조회
 * Parameter : 없음
 * Return : 없음
 * History : 2025.08.07 최초 작성
 */
function LocalDiskStatus() {
  return new Promise((resolve) => {
    //초기 상태 체크 중 표시
    $('#local-disk-status, #local-disk-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $('#local-disk-css, #local-disk-css').attr('class', 'pf-v6-c-label pf-m-orange');
    $('#local-disk-icon, #local-disk-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');

    cockpit.spawn(['python3', pluginpath + '/python/local/local_manage.py', '--local-disk-status'])
      .then(function (data) {
        var retVal = JSON.parse(data);
        if (retVal.code == "200") {
          $('#local-disk-status').text(retVal.val.status);
          $('#local-disk-css').attr('class', 'pf-v6-c-label pf-m-green');
          $('#local-disk-icon').attr('class', 'fas fa-fw fa-check-circle');
          $('#page-local-disk-mount-info').text(retVal.val.mount_path);
          $('#page-local-disk-physical-volume').text(retVal.val.pv);
          $('#page-local-disk-volume-group').text(retVal.val.vg);
          $('#page-local-disk-size').text(retVal.val.size + "B");
          setStatusTone($('#local-disk-low-info'), "ok");
          $('#local-disk-low-info').text("로컬 디스크가 생성되었습니다.");
          sessionStorage.setItem("local_configure", "true");

          cockpit.spawn(['python3', pluginpath + '/python/ablestack_json/ablestackJson.py', "update", "--depth1", "bootstrap", "--depth2", "local_configure", "--value", "true"])
        } else {
          $('#local-disk-status').text(retVal.val.status);
          $('#local-disk-css').attr('class', 'pf-v6-c-label pf-m-red');
          $('#local-disk-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');
          $('#page-local-disk-mount-info').text(retVal.val.mount_path);
          $('#page-local-disk-physical-volume').text(retVal.val.pv);
          $('#page-local-disk-volume-group').text(retVal.val.vg);
          $('#page-local-disk-size').text(retVal.val.size);
          setStatusTone($('#local-disk-low-info'), "danger");
          $('#local-disk-low-info').text("로컬 디스크가 생성되지 않았습니다.");
          sessionStorage.setItem("local_configure", "false");

          cockpit.spawn(['python3', pluginpath + '/python/ablestack_json/ablestackJson.py', "update", "--depth1", "bootstrap", "--depth2", "local_configure", "--value", "false"])
        }
        resolve();
      }).catch(function () {
        $('#local-disk-status').text(retVal.val.status);
        $('#local-disk-css').attr('class', 'pf-v6-c-label pf-m-red');
        $('#local-disk-icon').attr('class', 'fas fa-fw fa-exclamation-triangle');
        $('#page-local-disk-mount-info').text(retVal.val.mount_path);
        $('#page-local-disk-physical-volume').text(retVal.val.pv);
        $('#page-local-disk-volume-group').text(retVal.val.vg);
        $('#page-local-disk-size').text(retVal.val.size);
        setStatusTone($('#local-disk-low-info'), "danger");
        $('#local-disk-low-info').text("로컬 디스크가 생성되지 않았습니다.");
        sessionStorage.setItem("local_configure", "false");

        cockpit.spawn(['python3', pluginpath + '/python/ablestack_json/ablestackJson.py', "update", "--depth1", "bootstrap", "--depth2", "local_configure", "--value", "false"])
      })
  })
}
/**
 * Meathod Name : insertCloudVmCard
 * Date Created : 2025.08.08
 * Writer : 정민철
 * Description : 로컬 또는 그외의 타입을 선택했을 때 클라우드 VM 카드 변경
 * Parameter : os_type
 * Return : 없음
 * History : 2025.08.08 최초 작성
 */
// os_type 값에 따라 카드 삽입
function insertCloudVmCard(os_type) {
  var local_first_button = '';
  var local_last_button = '';
  var snapshop_button = '';
  var backup_button = '';
  if (os_type == "ablestack-standalone") {
    local_first_button = `
      <li class="pf-v6-c-divider" role="separator"></li>
      <li><button id="button-cloud-cluster-start-local" class="pf-v6-c-menu__item" type="button">클라우드센터VM 시작</button></li>
      <li><button id="button-cloud-cluster-stop-local" class="pf-v6-c-menu__item" type="button">클라우드센터VM 정지</button></li>
      <li><button id="button-cloud-cluster-delete-local" class="pf-v6-c-menu__item" type="button">클라우드센터VM 파기</button></li>
      <li class="pf-v6-c-divider" role="separator"></li>
    `;
    local_last_button = `
      <li class="pf-v6-c-divider" role="separator"></li>
      <li id="ccvm-after-monitoring-run-local"></li>
      <li id="ccvm-before-monitoring-run-local"></li>
      <li id="ccvm-monitoring-config-update-local"></li>
    `;
    backup_button = `
      <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-cloud-vm-backup" type="button">클라우드센터VM 백업</button></li>
      <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-cloud-vm-restore" type="button">클라우드센터VM 복구</button></li>
      <li class="pf-v6-c-divider" role="separator"></li>
    `;
  } else if (os_type == "ablestack-hci" || os_type == "ablestack-hci-filesystem") {
    snapshop_button = `
      <li class="pf-v6-c-divider" role="separator"></li>
      <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-cloud-vm-snap-backup" type="button">스냅샷 백업</button></li>
      <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-cloud-vm-snap-rollback" type="button">스냅샷 복구</button></li>
    `;
  }else if (os_type == "ablestack-vm"){
    backup_button = `
      <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-cloud-vm-backup" type="button">클라우드센터VM 백업</button></li>
      <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-cloud-vm-restore" type="button">클라우드센터VM 복구</button></li>
      <li class="pf-v6-c-divider" role="separator"></li>
    `;
  }
  var vmCardHtml = `
    <!-- 🌐 클라우드센터VM 상태 카드 시작 -->
    <div class="pf-v6-c-card pf-m-hoverable pf-m-compact" id="card-cloud-vm-status">

      <!-- 🧭 카드 헤더 -->
      <div class="pf-v6-c-card__header">
        <div class="pf-v6-c-card__header-main">
          <i class="pf-v6-pficon-virtual-machine"
            style="font-size: var(--pf-v6-global--icon--FontSize--lg); padding-right: 15px"
            aria-hidden="true"></i>
        </div>
        <div class="pf-v6-c-card__title ablestack-card-title-status" id="card-cloud-vm-title">
          클라우드센터 가상머신 상태
        </div>
        <div class="pf-v6-c-card__actions">
          <div class="ablestack-menu-dropdown">
            <button class="pf-v6-c-menu-toggle pf-m-plain"
                id="card-action-cloud-vm-status"
                aria-expanded="false"
                type="button"
                aria-label="Actions">
              <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
            </button>
            <ul class="pf-v6-c-menu ablestack-menu pf-m-align-right"
              aria-labelledby="card-action-cloud-vm-status"
              id="dropdown-menu-cloud-vm-status">
              <li id="cloud-center-after-bootstrap-run"></li>
              <li id="cloud-center-before-bootstrap-run"></li>
              ${local_first_button}
              <li><button class="pf-v6-c-menu__item pf-m-disabled" id="card-action-cloud-vm-change" type="button">클라우드센터VM 자원변경</button></li>
              <li class="pf-v6-c-divider" role="separator"></li>
              <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-mold-service-control" type="button">Mold 서비스 제어</button></li>
              <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-mold-db-control" type="button">Mold DB 제어</button></li>
              <li><button class="pf-v6-c-menu__item pf-m-disabled" id="button-mold-secondary-size-expansion" type="button">Mold 세컨더리 용량 추가</button></li>
              ${snapshop_button}
              <li class="pf-v6-c-divider" role="separator"></li>
              ${backup_button}
              <li><button class="pf-v6-c-menu__item" id="card-action-cloud-vm-db-dump" type="button">DB 백업</button></li>
              ${local_last_button}
            </ul>
          </div>
        </div>
      </div>

      <div class="pf-v6-c-divider" role="separator"></div>

      <!-- 🧾 카드 본문 -->
      <div class="pf-v6-c-card__body">
        <section class="pf-v6-c-page__main-breadcrumb">
          <dl class="pf-v6-c-description-list pf-m-horizontal" style="--pf-v6-c-description-list--RowGap: 10px;">

            <!-- 💡 VM 상태 -->
            <div class="pf-v6-c-description-list__group">
              <dt class="pf-v6-c-description-list__term">
                <span class="pf-v6-c-description-list__text">가상머신 상태</span>
              </dt>
              <dd id="description-cloud-vm-status" class="pf-v6-c-description-list__description" style="overflow: auto;">
                <div class="pf-v6-c-description-list__text">
                  <span class="pf-v6-c-label pf-m-red" id="span-cloud-vm-status">
                    <span class="pf-v6-c-label__content" id="span-cloud-vm-status-content">
                      <span class="pf-v6-c-label__icon">
                        <i id="ccvm_status_icon" class="fas fa-fw fa-exclamation-triangle" aria-hidden="true"></i>
                      </span>Health Err
                    </span>
                  </span>
                </div>
              </dd>
            </div>

            <!-- 🛠 기타 항목 -->
            ${[
      ['Mold 서비스 상태', 'div-mold-service-status', 'N/A'],
      ['Mold DB 상태', 'div-mold-db-status', 'N/A'],
      ['CPU', 'div-cloud-vm-cpu-text', 'N/A vCore'],
      ['Memory', 'div-cloud-vm-memory-text', 'N/A GiB'],
      ['ROOT Disk 크기', 'div-cloud-vm-disk-text', 'N/A GiB'],
      ['세컨더리 Disk 크기', 'div-cloud-vm-secondary-disk-text', 'N/A GiB'],
      ['관리 NIC', 'div-cloud-vm-nic-type-text', 'NIC Type : N/A (Parent : N/A)'],
      ['&nbsp;', 'div-cloud-vm-nic-ip-text', 'IP : N/A'],
      ['&nbsp;', 'div-cloud-vm-nic-prefix-text', 'PREFIX : N/A'],
      ['&nbsp;', 'div-cloud-vm-nic-gw-text', 'GW : N/A'],
      ['&nbsp;', 'div-cloud-vm-nic-dns-text', 'DNS : N/A']
    ].map(([label, id, value]) => `
              <div class="pf-v6-c-description-list__group">
                <dt class="pf-v6-c-description-list__term">
                  <span class="pf-v6-c-description-list__text">${label}</span>
                </dt>
                <dd class="pf-v6-c-description-list__description">
                  <div class="pf-v6-c-description-list__text" id="${id}">${value}</div>
                </dd>
              </div>
            `).join('')}
          </dl>
        </section>
      </div>

      <div class="pf-v6-c-divider" role="separator"></div>

      <!-- 📢 상태 메시지 -->
      <div id="ccvm-low-info" class="pf-v6-c-card__footer ablestack-status-text ablestack-status-danger">
        클라우드센터 가상머신이 배포되지 않았습니다.
      </div>
    </div>
    <!-- 🌐 클라우드센터VM 상태 카드 끝 -->
  `;

  // 🎯 os_type에 따라 위치 지정
  if (os_type === 'ablestack-standalone') {
    $("#div-card-cloud-vm-status-2").html(vmCardHtml);
    $('#div-card-cloud-vm-status-2').show();
    $('#div-card-cloud-vm-status-1').hide();
  } else {
    $("#div-card-cloud-vm-status-1").html(vmCardHtml);
    $('#div-card-cloud-vm-status-1').show();
    $('#div-card-cloud-vm-status-2').hide();
  }
}

function LocalCloudVMCheck() {
  return new Promise((resolve) => {
    ccvm_status = sessionStorage.getItem("ccvm_status");
    if (ccvm_status == "RUNNING") {
      $("#button-cloud-cluster-start-local").addClass('pf-m-disabled');
      $("#button-cloud-cluster-stop-local").removeClass('pf-m-disabled');
      $("#button-cloud-cluster-delete-local").addClass('pf-m-disabled');
      $("#button-mold-service-control").removeClass('pf-m-disabled');
      $("#button-mold-db-control").removeClass('pf-m-disabled');
      $("#button-mold-secondary-size-expansion").removeClass('pf-m-disabled');
      $("#card-action-cloud-vm-db-dump").removeClass('pf-m-disabled');
    } else if (ccvm_status === null) {
      $("#button-cloud-cluster-start-local").addClass('pf-m-disabled');
      $("#button-cloud-cluster-stop-local").addClass('pf-m-disabled');
      $("#button-cloud-cluster-delete-local").addClass('pf-m-disabled');
      $("#button-mold-service-control").addClass('pf-m-disabled');
      $("#button-mold-db-control").addClass('pf-m-disabled');
      $("#button-mold-secondary-size-expansion").addClass('pf-m-disabled');
      $("#card-action-cloud-vm-db-dump").addClass('pf-m-disabled');
    }
    else {
      $("#button-cloud-cluster-start-local").removeClass('pf-m-disabled');
      $("#button-cloud-cluster-stop-local").addClass('pf-m-disabled');
      $("#button-cloud-cluster-delete-local").removeClass('pf-m-disabled');
      $("#button-mold-service-control").addClass('pf-m-disabled');
      $("#button-mold-db-control").addClass('pf-m-disabled');
      $("#button-mold-secondary-size-expansion").addClass('pf-m-disabled');
      $("#card-action-cloud-vm-db-dump").addClass('pf-m-disabled');
    }
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ablestack_json/ablestackJson.py', 'status', '--depth1', 'bootstrap', '--depth2', 'ccvm'])
      .then(function (bootstrap_data) {
        console.log("ablestackJson.py : " + bootstrap_data);
        var retVal = JSON.parse(bootstrap_data);
        var ccvmStatus = retVal.val;
        console.log("ccvmStatus.ccvm = " + ccvmStatus.ccvm);
        if (ccvmStatus.ccvm == 'false') {
          sessionStorage.setItem("ccvm_bootstrap_status", "false");
          console.log('ccvm false in')
          $('#cloud-center-after-bootstrap-run').html('');
          $('#cloud-center-before-bootstrap-run').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-bootstrap-run-ccvm" onclick="ccvm_bootstrap_run()">클라우드센터 구성하기</a>');
        } else if (ccvmStatus.ccvm == 'true') {
          sessionStorage.setItem("ccvm_bootstrap_status", "true");
          console.log('ccvm true in')
          $('#cloud-center-after-bootstrap-run').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-linkto-storage-center-ccvm" onclick="cccc_link_go()">클라우드센터 연결</a>');
          $('#cloud-center-before-bootstrap-run').html('');
        }
        resolve();
      }).catch(function (data) {
        console.log('ClusterStatusInfo spawn error(ablestackJson.py');

      });
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ablestack_json/ablestackJson.py', 'status', '--depth1', 'monitoring', '--depth2', 'wall'])
      .then(function (monitoring_data) {
        console.log("ablestackJson.py : " + monitoring_data);
        var retVal = JSON.parse(monitoring_data);
        var wallStatus = retVal.val;
        console.log("wallStatus.wall = " + wallStatus.wall);
        if (wallStatus.wall == 'false') {
          sessionStorage.setItem("wall_monitoring_status", "false");
          console.log('wall false in')
          $('#ccvm-before-monitoring-run-local').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-monitoring-run-ccvm" onclick="wall_monitoring_run()">모니터링센터 구성</a>');
          $('#ccvm-after-monitoring-run-local').html('');
          $('#ccvm-monitoring-config-update-local').html('');
        } else if (wallStatus.wall == 'true') {
          sessionStorage.setItem("wall_monitoring_status", "true");
          console.log('wall true in')
          $('#ccvm-before-monitoring-run-local').html('');
          $('#ccvm-after-monitoring-run-local').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-linkto-wall" onclick="wall_link_go()">모니터링센터 대시보드 연결</a>');
          $('#ccvm-monitoring-config-update-local').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-update-wall-config" onclick="wall_config_update_modal()">모니터링센터 수집 정보 업데이트</a>');
        }
        resolve();
      }).catch(function (data) {
        createLoggerInfo("ClusterStatusInfo spawn error(ablestackJson.py error");
        console.log('ClusterStatusInfo spawn error(ablestackJson.py');
      });


  });
}
/** 로컬 디스크일 경우 클라우드센터VM 시작 action start */
$(document).on('click', '#button-cloud-cluster-start-local', function () {
  $('#div-modal-start-cloud-vm').show();
});

$(document).on('click', '#button-close-modal-cloud-vm-start, #button-cancel-modal-cloud-vm-start', function () {
  $('#div-modal-start-cloud-vm').hide();
});

/** 로컬 디스크일 경우 클라우드센터VM 시작 action end */

/** 로컬 디스크일 경우 클라우드센터VM 정지 action start */
$(document).on('click', '#button-cloud-cluster-stop-local', function () {
  if (os_type == "ablestack-standalone") {
    $('#modal-div-force-quit').show();
  }
  $('#div-modal-stop-cloud-vm').show();
});
$(document).on('click', '#button-close-modal-cloud-vm-stop, #button-cancel-modal-cloud-vm-stop', function () {
  $('#div-modal-stop-cloud-vm').hide();
});
/** 로컬 디스크일 경우 클라우드센터VM 정지 action end */

/** 로컬 디스크일 경우 클라우드센터VM 파기 action start */
$(document).on('click', '#button-cloud-cluster-delete-local', function () {
  $('#div-modal-delete-cloud-vm').show();
});
$(document).on('click', '#button-close-modal-cloud-vm-delete, #button-cancel-modal-cloud-vm-delete', function () {
  $('#div-modal-delete-cloud-vm').hide();
});
/** 로컬 디스크일 경우 클라우드센터VM 파기 action end */

/** Mold 서비스 제어 관련 action start */
$(document).on('click', '#button-mold-service-control', function () {
  $('#div-modal-mold-service-control').show();
});

$(document).on('click', '#button-close-mold-service-control, #button-cancel-modal-mold-service-control', function () {
  $('#div-modal-mold-service-control').hide();
});

/** Mold 서비스 제어 modal 관련 action end */

/** Mold DB 제어 관련 action start */
$(document).on('click', '#button-mold-db-control', function () {
  $('#div-modal-mold-db-control').show();
});

$(document).on('click', '#button-close-mold-db-control, #button-cancel-modal-mold-db-control', function () {
  $('#div-modal-mold-db-control').hide();
});

/** Mold DB 제어 modal 관련 action end */
/** 2차 스토리지 size 확장 제어 관련 action start */
$(document).on('click', '#button-mold-secondary-size-expansion', function () {
  if (os_type == "ablestack-hci" || os_type == "ablestack-hci-filesystem") {
    $('#input-checkbox-mold-secondary-size-expansion').prop('checked', false);
    $('#label-checkbox-mold-secondary-size-expansion').show();
  } else {
    $('#input-checkbox-mold-secondary-size-expansion').prop('checked', true);
    $('#label-checkbox-mold-secondary-size-expansion').hide();
  }
  $('#form-input-mold-secondary-size-expansion').val("");
  $('#div-modal-mold-secondary-size-expansion').show();
});

$(document).on('click', '#button-close-mold-secondary-size-expansion, #button-cancel-modal-mold-secondary-size-expansion', function () {
  $('#div-modal-mold-secondary-size-expansion').hide();
});

/** 2차 스토리지 size 확장 제어 관련 action end */
/** 클라우드센터 VM 백업 제어 관련 action start */
$(document).on('click', '#button-cloud-vm-backup', function () {
  $('#div-modal-ccvm-backup').show();
});
$(document).on('click', '#ccvm-vm-backup-button-close-modal-cloud-vm-dump, #ccvm-vm-backup-button-cancel-modal-cloud-vm-dump', function () {
  $('#div-modal-ccvm-backup').hide();
});
/** 클라우드센터 VM 백업 제어 관련 action end */
/** 클라우드센터 VM 복구 제어 관련 action start */
$(document).on('click', '#button-cloud-vm-restore', function () {
  $('#div-modal-ccvm-restore').show();
});
$(document).on('click', '#ccvm-vm-restore-button-close-modal-cloud-vm-restore, #ccvm-vm-restore-button-cancel-modal-cloud-vm-restore', function () {
  $('#div-modal-ccvm-restore').hide();
});
/** 클라우드센터 VM 복구 제어 관련 action end */
/** 클라우드센터 VM 백업 상태 제어 관련 action start */
$(document).on('click', '#ccvm-vm-backup-button-open-status', function () {
  const openStatusModal = function () {
    const $statusWrapper = $('#div-modal-ccvm-backup-status');
    const $statusModal = $('#ccvm-vm-backup-status-div-modal');
    if (!$statusWrapper.length || !$statusModal.length) {
      $('#div-modal-ccvm-backup').show();
      return;
    }
    $statusWrapper.show();
    $statusModal.show();
    if (window.loadCcvmBackupStatus) {
      window.loadCcvmBackupStatus();
    }
    $('#div-modal-ccvm-backup').hide();
  };

  let $container = $('#div-modal-ccvm-backup-status');
  if ($container.length === 0) {
    $container = $('<div id="div-modal-ccvm-backup-status"></div>');
    $('body').append($container);
  }

  const hasModal = $container.find('#ccvm-vm-backup-status-div-modal').length > 0;
  if (!hasModal || $container.is(':empty')) {
    $container.empty().load("./src/features/ccvm-backup-status.html", function () {
      openStatusModal();
    });
    return;
  }

  openStatusModal();
});
$(document).on('click', '#ccvm-vm-backup-status-button-close, #ccvm-vm-backup-status-button-cancel', function () {
  $('#div-modal-ccvm-backup-status').hide();
  $('#ccvm-vm-backup-status-div-modal').hide();
  $('#div-modal-ccvm-backup').show();
});
/** 클라우드센터 VM 백업 상태 제어 관련 action end */
/** 스냅샷 백업 제어 관련 action start */
$(document).on('click', '#button-cloud-vm-snap-backup', function () {
  $('#div-modal-cloud-vm-snap-backup').show();
});
$(document).on('click', '#button-close-modal-cloud-vm-snap-backup, #button-cancel-modal-cloud-vm-snap-backup', function () {
  $('#div-modal-cloud-vm-snap-backup').hide();
});
/** 스냅샷 백업 제어 관련 action end */
/** 스냅샷 복구 제어 관련 action start */
$(document).on('click', '#button-close-modal-cloud-vm-snap-rollback-confirm, #button-cancel-modal-cloud-vm-snap-rollback-confirm', function () {
  $('#div-modal-cloud-vm-snap-rollback-confirm').hide();
});
$(document).on('click', '#button-close-modal-cloud-vm-snap-rollback, #button-cancel-modal-cloud-vm-snap-rollback', function () {
  $('#div-modal-cloud-vm-snap-rollback').hide();
});
$(document).on('click', '#button-cloud-vm-snap-rollback', function () {
  $('#form-select-cloud-vm-snap option').remove();
  cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_snap/ccvm_snap_action.py', 'list'], { host: pcs_exe_host })
    .then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == 200) {
        var selectHtml = '<option selected="" value="null">스냅샷을 선택해 주세요.</option>';
        for (var i = 0; i < retVal.val.length; i++) {
          var id = retVal.val[i].id;
          var name = retVal.val[i].name;
          var size = retVal.val[i].size / 1024 / 1024 / 1024;
          var timestamp = retVal.val[i].timestamp;

          // selectHtml = selectHtml + '<option value="' + name + '"> ID : ' + id + ' \t/ 이름 : ' + name + ' \t/ 용량 : ' + size + ' \t/ 생성일시 : ' + timestamp + '</option>';
          selectHtml = selectHtml + '<option value="' + name + '"> ID : ' + id + ' \t/ 이름 : ' + name + '</option>';
        }

        $('#form-select-cloud-vm-snap').append(selectHtml);

        createLoggerInfo("cloudcenter vm snap select spawn success");
      }
      $('#div-modal-cloud-vm-snap-message').text('');
      $('#div-modal-spinner').hide();
    }).catch(function (data) {
      createLoggerInfo("cloudcenter vm snap select spawn error");
      console.log('cloudcenter vm snap select spawn error');
    });

  $('#div-modal-cloud-vm-snap-rollback').show();
});
/** 스냅샷 복구 제어 관련 action end */

/** ABLESTACK Version 업데이트 제어 관련 action start */
let systemUpdateInfo = null;
const SYSTEM_UPDATE_COPY_PATH = "/opt/ABLESTACK_UPDATE";
const SYSTEM_UPDATE_TYPE_LABELS = {
  all: "전체 업데이트",
  mold: "Mold 업데이트"
};
const SYSTEM_UPDATE_SCRIPT_NAMES = {
  all: "update-all.sh",
  mold: "update-mold.sh"
};

function isAblestackTrue(value) {
  return value === true || value === "true";
}

function getSystemUpdateRule(osType) {
  const rules = {
    "ablestack-hci": [
      ["bootstrap", "scvm"],
      ["bootstrap", "ccvm"],
      ["monitoring", "wall"]
    ],
    "ablestack-hci-filesystem": [
      ["bootstrap", "scvm"],
      ["bootstrap", "ccvm"],
      ["monitoring", "wall"]
    ],
    "ablestack-vm": [
      ["bootstrap", "ccvm"],
      ["bootstrap", "gfs_configure"],
      ["monitoring", "wall"]
    ],
    "ablestack-standalone": [
      ["bootstrap", "ccvm"],
      ["bootstrap", "local_configure"],
      ["monitoring", "wall"]
    ]
  };
  return rules[osType] || null;
}

function getSystemUpdateRuleText(osType) {
  if (osType == "ablestack-hci" || osType == "ablestack-hci-filesystem") {
    return "SCVM, CCVM, WALL 구성이 완료되어야 업데이트를 실행할 수 있습니다.";
  }
  if (osType == "ablestack-vm") {
    return "CCVM, WALL, GFS 구성이 완료되어야 업데이트를 실행할 수 있습니다.";
  }
  if (osType == "ablestack-standalone") {
    return "CCVM, WALL, 로컬 스토리지 구성이 완료되어야 업데이트를 실행할 수 있습니다.";
  }
  return "현재 OS 타입에서는 ABLESTACK Version 업데이트를 지원하지 않습니다.";
}

function setSystemUpdateButtonEnabled(enabled, title) {
  const $button = $('#button-open-modal-system-update');
  if (!$button.length) {
    return;
  }
  $button.prop('disabled', !enabled);
  $button.attr('aria-disabled', String(!enabled));
  $button.attr('title', enabled ? "ABLESTACK Version 업데이트" : title);
}

function getSelectedSystemUpdateType() {
  const updateType = $('input[name="radio-system-update-type"]:checked').val();
  if (SYSTEM_UPDATE_TYPE_LABELS[updateType]) {
    return updateType;
  }
  return "all";
}

function getSystemUpdateTypeLabel(updateType) {
  return SYSTEM_UPDATE_TYPE_LABELS[updateType] || SYSTEM_UPDATE_TYPE_LABELS.all;
}

function getSystemUpdateScriptName(updateType) {
  return SYSTEM_UPDATE_SCRIPT_NAMES[updateType] || SYSTEM_UPDATE_SCRIPT_NAMES.all;
}

function isSystemUpdateEnabled(config, osType) {
  const rule = getSystemUpdateRule(osType);
  if (!rule) {
    return false;
  }
  for (let i = 0; i < rule.length; i++) {
    const depth1 = rule[i][0];
    const depth2 = rule[i][1];
    if (!config[depth1] || !isAblestackTrue(config[depth1][depth2])) {
      return false;
    }
  }
  return true;
}

function refreshSystemUpdateButton() {
  const osType = sessionStorage.getItem("os_type") || os_type;
  setSystemUpdateButtonEnabled(false, getSystemUpdateRuleText(osType));

  cockpit.spawn(["cat", pluginpath + "/tools/properties/ablestack.json"])
    .then(function (data) {
      const config = JSON.parse(data);
      const enabled = isSystemUpdateEnabled(config, osType);
      setSystemUpdateButtonEnabled(enabled, getSystemUpdateRuleText(osType));
    })
    .catch(function (err) {
      createLoggerInfo("ablestack.json update condition read error");
      console.log("ablestack.json update condition read error : " + err);
      setSystemUpdateButtonEnabled(false, "ablestack.json 상태를 확인할 수 없습니다.");
    });
}

function resetSystemUpdateModal() {
  systemUpdateInfo = null;
  $('#input-system-update-mount-path').val('');
  $('#radio-system-update-type-all').prop('checked', true);
  $('#system-update-mount-helper').text('').removeAttr('style');
  clearSystemUpdateLoadedInfo();
}

function clearSystemUpdateLoadedInfo() {
  systemUpdateInfo = null;
  $('#system-update-current-ablestack-version').text('N/A');
  $('#system-update-target-ablestack-version').text('N/A');
  $('#button-open-modal-system-update-confirm').prop('disabled', true).attr('aria-disabled', 'true');
}

function setSystemUpdateHelper(message, isError) {
  const $helper = $('#system-update-mount-helper');
  $helper.text(message || '');
  if (isError) {
    $helper.css('color', '#c9190b');
  } else {
    $helper.css('color', '#3e8635');
  }
}

function updateSystemUpdateInfo(info) {
  const updateType = info.update_type || getSelectedSystemUpdateType();
  systemUpdateInfo = Object.assign({}, info, {
    update_type: updateType,
    update_label: info.update_label || getSystemUpdateTypeLabel(updateType),
    copy_path: info.copy_path || SYSTEM_UPDATE_COPY_PATH
  });
  $('#input-system-update-mount-path').val(info.mount_path);
  $('#system-update-current-ablestack-version').text(info.current_ablestack_version || 'N/A');
  $('#system-update-target-ablestack-version').text(info.target_ablestack_version || 'N/A');
  $('#button-open-modal-system-update-confirm').prop('disabled', false).attr('aria-disabled', 'false');
}

function getSystemUpdateErrorText(err) {
  if (err && err.message) {
    return err.message;
  }
  if (err && err.problem) {
    return err.problem;
  }
  return String(err || "");
}

function getSystemUpdateMountPathErrorText(detail) {
  const detailText = $.trim(detail || "");
  if (detailText == "") {
    return "마운트 경로를 확인해 주세요.";
  }
  return "마운트 경로를 확인해 주세요. " + detailText;
}

function isSystemUpdateHelperMissing(err) {
  const errorText = getSystemUpdateErrorText(err);
  return errorText.indexOf("ablestack_update.py") >= 0
    && (errorText.indexOf("can't open file") >= 0 || errorText.indexOf("No such file or directory") >= 0);
}

function normalizeSystemUpdatePath(path) {
  const normalizedPath = $.trim(path).replace(/\/+$/, "");
  return normalizedPath || "/";
}

function joinSystemUpdatePath(mountPath, relativePath) {
  const normalizedPath = normalizeSystemUpdatePath(mountPath);
  if (normalizedPath == "/") {
    return "/" + relativePath;
  }
  return normalizedPath + "/" + relativePath;
}

function normalizeSystemUpdateValue(value) {
  let normalizedValue = $.trim(value || "");
  if (normalizedValue.length >= 2) {
    const firstChar = normalizedValue.charAt(0);
    const lastChar = normalizedValue.charAt(normalizedValue.length - 1);
    if ((firstChar == '"' || firstChar == "'") && firstChar == lastChar) {
      normalizedValue = normalizedValue.substring(1, normalizedValue.length - 1);
    }
  }
  return normalizedValue;
}

function parseSystemUpdateKeyValues(data) {
  const values = {};
  const lines = String(data || "").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = $.trim(lines[i]);
    const splitIndex = line.indexOf("=");
    if (line == "" || line.charAt(0) == "#" || splitIndex < 0) {
      continue;
    }
    const key = $.trim(line.substring(0, splitIndex));
    const value = line.substring(splitIndex + 1);
    values[key] = normalizeSystemUpdateValue(value);
  }
  return values;
}

function loadSystemUpdateInfoFallback(mountPath, updateType) {
  const normalizedMountPath = normalizeSystemUpdatePath(mountPath);
  const ksPath = joinSystemUpdatePath(normalizedMountPath, "ks/ablestack-ks.cfg");
  const scriptName = getSystemUpdateScriptName(updateType);
  const updateScriptPath = joinSystemUpdatePath(normalizedMountPath, scriptName);

  return Promise.all([
    cockpit.spawn(["test", "-d", normalizedMountPath], { superuser: true }),
    cockpit.spawn(["test", "-f", updateScriptPath], { superuser: true }),
    cockpit.spawn(["cat", "/etc/os-release"], { superuser: true }),
    cockpit.spawn(["cat", ksPath], { superuser: true })
  ]).then(function (data) {
    const currentInfo = parseSystemUpdateKeyValues(data[2]);
    const targetKsInfo = parseSystemUpdateKeyValues(data[3]);
    const targetAblestackVersion = targetKsInfo.ABLESTACK_VERSION || "";

    if (targetAblestackVersion == "") {
      throw new Error("ks/ablestack-ks.cfg 파일에서 ABLESTACK_VERSION 값을 찾을 수 없습니다.");
    }

    return {
      mount_path: normalizedMountPath,
      copy_path: SYSTEM_UPDATE_COPY_PATH,
      current_ablestack_version: currentInfo.PRETTY_NAME || "N/A",
      target_ablestack_version: targetAblestackVersion,
      update_type: updateType,
      update_label: getSystemUpdateTypeLabel(updateType),
      update_script: updateScriptPath,
      work_update_script: joinSystemUpdatePath(SYSTEM_UPDATE_COPY_PATH, scriptName)
    };
  });
}

function runSystemUpdateFallback(mountPath, updateType) {
  const normalizedMountPath = normalizeSystemUpdatePath(mountPath);
  const scriptName = getSystemUpdateScriptName(updateType);
  return cockpit.spawn(
    [
      "/bin/bash",
      "-c",
      [
        "set -e",
        "src=\"$1\"",
        "dest=\"$2\"",
        "script=\"$3\"",
        "update_type=\"$4\"",
        "case \"$script\" in update-all.sh|update-mold.sh) ;; *) echo \"지원하지 않는 업데이트 스크립트입니다.\" >&2; exit 1 ;; esac",
        "case \"$update_type\" in all|mold) ;; *) echo \"지원하지 않는 업데이트 방식입니다.\" >&2; exit 1 ;; esac",
        "[ -d \"$src\" ] || { echo \"입력한 ISO 마운트 경로가 존재하지 않습니다.\" >&2; exit 1; }",
        "[ -f \"$src/$script\" ] || { echo \"$script 파일을 찾을 수 없습니다.\" >&2; exit 1; }",
        "src_real=$(readlink -f \"$src\")",
        "dest_real=$(readlink -m \"$dest\")",
        "[ \"$src_real\" != \"$dest_real\" ] || { echo \"ISO 마운트 경로와 복사 대상 경로를 분리해야 합니다.\" >&2; exit 1; }",
        "case \"$dest_real/\" in \"$src_real\"/*) echo \"ISO 마운트 경로와 복사 대상 경로를 분리해야 합니다.\" >&2; exit 1 ;; esac",
        "case \"$src_real/\" in \"$dest_real\"/*) echo \"ISO 마운트 경로와 복사 대상 경로를 분리해야 합니다.\" >&2; exit 1 ;; esac",
        "[ ! -L \"$dest\" ] || { echo \"$dest 경로가 심볼릭 링크입니다.\" >&2; exit 1; }",
        "rm -rf \"$dest\"",
        "mkdir -p \"$dest\"",
        "cp -rRp \"$src\"/. \"$dest\"/ || cp -Rp \"$src\"/. \"$dest\"/",
        "cd \"$dest\"",
        "export ABLESTACK_UPDATE_MOUNT_PATH=\"$src_real\"",
        "export ABLESTACK_UPDATE_WORK_PATH=\"$dest_real\"",
        "export ABLESTACK_UPDATE_COPY_PATH=\"$dest_real\"",
        "export ABLESTACK_UPDATE_TYPE=\"$update_type\"",
        "exec /bin/bash \"./$script\""
      ].join("\n"),
      "ablestack-update",
      normalizedMountPath,
      SYSTEM_UPDATE_COPY_PATH,
      scriptName,
      updateType
    ],
    { superuser: true }
  ).then(function (data) {
    return {
      code: 200,
      val: {
        message: "ABLESTACK " + getSystemUpdateTypeLabel(updateType) + " 실행이 완료되었습니다.",
        mount_path: normalizedMountPath,
        copy_path: SYSTEM_UPDATE_COPY_PATH,
        update_type: updateType,
        update_label: getSystemUpdateTypeLabel(updateType),
        update_script: joinSystemUpdatePath(SYSTEM_UPDATE_COPY_PATH, scriptName),
        stdout: String(data || ""),
        stderr: ""
      }
    };
  });
}

function loadSystemUpdateInfo() {
  const mountPath = $.trim($('#input-system-update-mount-path').val());
  const updateType = getSelectedSystemUpdateType();
  if (mountPath == "") {
    setSystemUpdateHelper("ISO 마운트 경로를 입력해 주세요.", true);
    $('#button-open-modal-system-update-confirm').prop('disabled', true).attr('aria-disabled', 'true');
    return;
  }

  setSystemUpdateHelper("버전 정보를 확인 중입니다.", false);
  $('#button-system-update-load-info').prop('disabled', true).attr('aria-disabled', 'true');
  $('#button-open-modal-system-update-confirm').prop('disabled', true).attr('aria-disabled', 'true');

  cockpit.spawn(["python3", pluginpath + "/python/host/ablestack_update.py", "info", "--mount-path", mountPath, "--update-type", updateType], { superuser: true })
    .then(function (data) {
      const retVal = JSON.parse(data);
      if (retVal.code == 200) {
        updateSystemUpdateInfo(retVal.val);
        setSystemUpdateHelper("업데이트 ISO 정보를 확인했습니다.", false);
      } else {
        systemUpdateInfo = null;
        setSystemUpdateHelper(getSystemUpdateMountPathErrorText(retVal.val), true);
      }
    })
    .catch(function (err) {
      if (isSystemUpdateHelperMissing(err)) {
        return loadSystemUpdateInfoFallback(mountPath, updateType)
          .then(function (info) {
            updateSystemUpdateInfo(info);
            setSystemUpdateHelper("업데이트 ISO 정보를 확인했습니다.", false);
          })
          .catch(function (fallbackErr) {
            systemUpdateInfo = null;
            setSystemUpdateHelper(getSystemUpdateMountPathErrorText(getSystemUpdateErrorText(fallbackErr)), true);
          });
      }
      systemUpdateInfo = null;
      setSystemUpdateHelper(getSystemUpdateMountPathErrorText(getSystemUpdateErrorText(err)), true);
    })
    .finally(function () {
      $('#button-system-update-load-info').prop('disabled', false).attr('aria-disabled', 'false');
    });
}

function openSystemUpdateModal() {
  resetSystemUpdateModal();
  $('#div-modal-system-update').show();
}

function closeSystemUpdateModal() {
  $('#div-modal-system-update').hide();
}

function closeSystemUpdateConfirmModal() {
  $('#div-modal-system-update-confirm').hide();
}

function resetSystemUpdateConfirmModal() {
  $('#modal-input-system-update-warning-check').prop('checked', false);
  $('#system-update-confirm-type').text('N/A');
  $('#button-execution-modal-system-update').prop('disabled', true).attr('aria-disabled', 'true');
}

$(document).on('click', '#button-open-modal-system-update', function () {
  if ($(this).prop('disabled')) {
    return;
  }
  openSystemUpdateModal();
});

$(document).on('click', '#button-close-modal-system-update, #button-cancel-modal-system-update', function () {
  closeSystemUpdateModal();
});

$(document).on('click', '#button-system-update-load-info', function () {
  loadSystemUpdateInfo();
});

$(document).on('input', '#input-system-update-mount-path', function () {
  clearSystemUpdateLoadedInfo();
  $('#system-update-mount-helper').text('').removeAttr('style');
});

$(document).on('change', 'input[name="radio-system-update-type"]', function () {
  clearSystemUpdateLoadedInfo();
  $('#system-update-mount-helper').text('').removeAttr('style');
});

$(document).on('keydown', '#input-system-update-mount-path', function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    loadSystemUpdateInfo();
  }
});

$(document).on('submit', '#div-modal-system-update form', function (e) {
  e.preventDefault();
  loadSystemUpdateInfo();
});

$(document).on('click', '#button-open-modal-system-update-confirm', function () {
  if (!systemUpdateInfo || $(this).prop('disabled')) {
    setSystemUpdateHelper("업데이트 ISO 정보를 먼저 확인해 주세요.", true);
    return;
  }
  resetSystemUpdateConfirmModal();
  $('#system-update-confirm-type').text(systemUpdateInfo.update_label || getSystemUpdateTypeLabel(systemUpdateInfo.update_type));
  $('#div-modal-system-update-confirm').show();
});

$(document).on('click', '#button-close-modal-system-update-confirm, #button-cancel-modal-system-update-confirm', function () {
  closeSystemUpdateConfirmModal();
});

$(document).on('change', '#modal-input-system-update-warning-check', function () {
  const checked = $(this).is(':checked');
  $('#button-execution-modal-system-update').prop('disabled', !checked).attr('aria-disabled', String(!checked));
});

$(document).on('click', '#button-execution-modal-system-update', function () {
  if ($(this).prop('disabled')) {
    return;
  }
  if (!systemUpdateInfo || !systemUpdateInfo.mount_path) {
    closeSystemUpdateConfirmModal();
    setSystemUpdateHelper("업데이트 ISO 정보를 먼저 확인해 주세요.", true);
    $('#div-modal-system-update').show();
    return;
  }

  const updateType = systemUpdateInfo.update_type || getSelectedSystemUpdateType();
  const updateLabel = systemUpdateInfo.update_label || getSystemUpdateTypeLabel(updateType);
  closeSystemUpdateConfirmModal();
  closeSystemUpdateModal();
  $('#div-modal-spinner-header-txt').text('ABLESTACK Version 업데이트');
  $('#div-modal-spinner-body-txt').text('ABLESTACK ' + updateLabel + '를 실행 중입니다.');
  $('#div-modal-spinner').show();

  function showSystemUpdateResult(retVal) {
    $('#div-modal-spinner').hide();
    $("#modal-status-alert-title").html("ABLESTACK Version 업데이트");
    if (retVal.code == 200) {
      const resultLabel = retVal.val && retVal.val.update_label ? retVal.val.update_label : updateLabel;
      $("#modal-status-alert-body").html("ABLESTACK " + resultLabel + " 실행이 완료되었습니다.<br/>업데이트 후 시스템 재부팅이 필요합니다.");
    } else {
      $("#modal-status-alert-body").text("ABLESTACK Version 업데이트 실행 중 오류가 발생했습니다 " + retVal.val);
    }
    $('#div-modal-status-alert').show();
  }

  function showSystemUpdateError(err) {
    $('#div-modal-spinner').hide();
    $("#modal-status-alert-title").html("ABLESTACK Version 업데이트");
    $("#modal-status-alert-body").text("ABLESTACK Version 업데이트 실행 중 오류가 발생했습니다 " + getSystemUpdateErrorText(err));
    $('#div-modal-status-alert').show();
  }

  cockpit.spawn(["python3", pluginpath + "/python/host/ablestack_update.py", "run", "--mount-path", systemUpdateInfo.mount_path, "--update-type", updateType], { superuser: true })
    .then(function (data) {
      const retVal = JSON.parse(data);
      showSystemUpdateResult(retVal);
    })
    .catch(function (err) {
      if (isSystemUpdateHelperMissing(err)) {
        return runSystemUpdateFallback(systemUpdateInfo.mount_path, updateType)
          .then(function (retVal) {
            showSystemUpdateResult(retVal);
          })
          .catch(function (fallbackErr) {
            showSystemUpdateError(fallbackErr);
          });
      }
      showSystemUpdateError(err);
    })
    .finally(function () {
      refreshSystemUpdateButton();
    });
});
/** ABLESTACK Version 업데이트 제어 관련 action end */

/** 보안 점검 증적 제어 관련 action start */
const SECURITY_EVIDENCE_HELPER = pluginpath + '/python/security_evidence/security_evidence_package.py';
let securityEvidenceModalBlobUrl = null;

function showSecurityEvidenceStatus(message, tone, isLoading) {
  const $status = $('#div-modal-security-evidence-status');
  const loading = Boolean(isLoading);
  $status.removeClass('pf-m-info pf-m-success pf-m-danger');
  $status.addClass(tone || 'pf-m-info');
  $status.attr('aria-busy', loading ? 'true' : 'false');
  $('#icon-modal-security-evidence-status').toggle(!loading);
  $('#spinner-modal-security-evidence-status').toggle(loading);
  $('#text-modal-security-evidence-status').text(message);
  $status.show();
}

function downloadSecurityEvidencePackage(metadata) {
  if (!metadata || !metadata.path) {
    return Promise.reject(new Error('다운로드할 증적 파일 경로가 없습니다.'));
  }
  return cockpit.spawn(
    ['/usr/bin/cat', metadata.path],
    { superuser: true, binary: true }
  ).then(function (packageBytes) {
    const blobUrl = URL.createObjectURL(
      new Blob([packageBytes], { type: 'application/zip' })
    );
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = metadata.filename || 'ABLESTACK 보안 취약점 증적 자료.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () {
      URL.revokeObjectURL(blobUrl);
    }, 30000);
  });
}
window.downloadSecurityEvidencePackage = downloadSecurityEvidencePackage;

function clearSecurityEvidenceModalDownloadLink() {
  if (securityEvidenceModalBlobUrl) {
    URL.revokeObjectURL(securityEvidenceModalBlobUrl);
    securityEvidenceModalBlobUrl = null;
  }
  $('#link-modal-security-evidence-download')
    .attr('href', '#')
    .removeAttr('download');
  $('#text-modal-security-evidence-download-file').text('');
  $('#div-modal-security-evidence-download').hide();
}

function prepareSecurityEvidenceModalDownloadLink(metadata) {
  if (!metadata || !metadata.path) {
    return Promise.reject(new Error('다운로드할 증적 파일 경로가 없습니다.'));
  }
  return cockpit.spawn(
    ['/usr/bin/cat', metadata.path],
    { superuser: true, binary: true }
  ).then(function (packageBytes) {
    clearSecurityEvidenceModalDownloadLink();
    securityEvidenceModalBlobUrl = URL.createObjectURL(
      new Blob([packageBytes], { type: 'application/zip' })
    );
    const filename = metadata.filename || 'ABLESTACK 보안 취약점 증적 자료.zip';
    $('#link-modal-security-evidence-download')
      .attr('href', securityEvidenceModalBlobUrl)
      .attr('download', filename);
    $('#text-modal-security-evidence-download-file').text(filename);
    $('#div-modal-security-evidence-download').css('display', 'flex');
  });
}

function refreshSecurityEvidenceDownloadLink() {
  const $link = $('#span-modal-security-evidence-download');
  if (!$link.length) {
    return Promise.resolve();
  }
  $link
    .addClass('pf-m-disabled')
    .attr('aria-disabled', 'true')
    .text('최신 생성 자료를 확인 중입니다')
    .off('click.securityEvidence');

  return cockpit.spawn(
    ['python3', SECURITY_EVIDENCE_HELPER, 'latest'],
    { superuser: true }
  ).then(function (data) {
    const result = JSON.parse(data);
    if (result.code != 200) {
      $link.text('생성된 자료가 없습니다');
      return;
    }
    const metadata = result.val;
    $link
      .removeClass('pf-m-disabled')
      .attr('aria-disabled', 'false')
      .text('최신 자료 다운로드 (' + metadata.generatedAt + ')')
      .on('click.securityEvidence', function (event) {
        event.preventDefault();
        downloadSecurityEvidencePackage(metadata).catch(function (error) {
          alert('보안 취약점 증적 자료 다운로드에 실패했습니다: ' + error);
        });
      });
  }).catch(function () {
    $link.text('생성된 자료가 없습니다');
  });
}
window.refreshSecurityEvidenceDownloadLink = refreshSecurityEvidenceDownloadLink;

function markSecurityPatchCompleted() {
  sessionStorage.setItem('security_patch', 'true');
  $('#button-open-modal-security-update').hide();
  $('#button-open-modal-security-evidence').show();
}

$('#button-open-modal-security-evidence').on('click', function () {
  $('#div-modal-security-evidence').show();
  $('#div-modal-security-evidence-status').hide();
  clearSecurityEvidenceModalDownloadLink();
});

$('#button-close-modal-security-evidence, #button-cancel-modal-security-evidence').on('click', function () {
  $('#div-modal-security-evidence').hide();
  clearSecurityEvidenceModalDownloadLink();
});

$('#button-execution-modal-security-evidence').on('click', function () {
  const $execute = $('#button-execution-modal-security-evidence');
  const $cancel = $('#button-cancel-modal-security-evidence');
  clearSecurityEvidenceModalDownloadLink();
  $execute.prop('disabled', true).attr('aria-disabled', 'true');
  $cancel.prop('disabled', true).attr('aria-disabled', 'true');
  showSecurityEvidenceStatus(
    '전체 호스트의 보안 점검 증적을 수집하고 있습니다. 잠시만 기다려주세요.',
    'pf-m-info',
    true
  );

  cockpit.spawn(
    ['python3', SECURITY_EVIDENCE_HELPER, 'generate'],
    { superuser: true }
  ).then(function (data) {
    const result = JSON.parse(data);
    if (result.code != 200) {
      throw new Error(result.val || '증적 자료 생성에 실패했습니다.');
    }
    return prepareSecurityEvidenceModalDownloadLink(result.val).then(function () {
      const hostSummary = result.val.requestedHosts
        ? ' (요청 ' + result.val.requestedHosts + '대, 수집 ' + result.val.hosts + '대)'
        : '';
      const warning = result.val.collectorStatus
        ? ' 일부 호스트의 SSH 수집 결과를 확인해주세요.'
        : '';
      showSecurityEvidenceStatus(
        'ABLESTACK 보안 취약점 증적 자료 생성이 완료되었습니다.'
          + hostSummary + warning,
        result.val.collectorStatus ? 'pf-m-info' : 'pf-m-success'
      );
      refreshSecurityEvidenceDownloadLink();
    });
  }).catch(function (error) {
    showSecurityEvidenceStatus(
      '보안 취약점 증적 자료 생성 또는 다운로드 링크 준비에 실패했습니다: ' + error,
      'pf-m-danger'
    );
  }).finally(function () {
    $execute.prop('disabled', false).attr('aria-disabled', 'false');
    $cancel.prop('disabled', false).attr('aria-disabled', 'false');
  });
});
/** 보안 점검 증적 제어 관련 action end */

/** 보안 업데이트 제어 관련 action start */
$('#button-open-modal-security-update').on('click', function () {
  $('#div-modal-security-update').show();
});
$('#button-close-modal-security-update, #button-cancel-modal-security-update').on('click', function () {
  $('#div-modal-security-update').hide();
});
$('#modal-input-security-update-check').on('click', function () {
  var condition = $("#button-execution-modal-security-update").prop('disabled');
  $("#button-execution-modal-security-update").prop("disabled", condition ? false : true);
});
// 간단 jQuery 버전입니다.
// eslint: space-infix-ops, comma-spacing 준수
$(function () {
  const $modal = $('#div-modal-security-update');
  const $sshToggle = $modal.find('#modal-input-ssh-port-change');
  const $confirm = $modal.find('#modal-input-security-update-check');
  const $portWrap = $modal.find('#modal-div-ssh-port');
  const $port = $modal.find('#modal-input-ssh-port');
  const $help = $modal.find('#modal-help-ssh-port');
  const $exec = $modal.find('#button-execution-modal-security-update');
  const $btnClose = $modal.find('#button-close-modal-security-update');
  const $btnCancel = $modal.find('#button-cancel-modal-security-update');

  // 숫자 인풋 정규화: 숫자만, 최대 5자리, 1~65535
  function clampPortInput(el) {
    let v = String(el.value || '').replace(/\D/g, '');
    if (v.length > 5) { v = v.slice(0, 5); }
    if (v !== '' && Number(v) > 65535) { v = '65535'; }
    el.value = v;
  }

  function isValidPort(v) {
    const n = Number($.trim(v));
    return Number.isInteger(n) && n >= 1 && n <= 65535;
  }

  // 화면 상태 갱신(실행 버튼 활성/비활성 포함)
  function refresh() {
    const tOn = $sshToggle.is(':checked');
    const cOn = $confirm.is(':checked');

    if (tOn) {
      $portWrap.show();
    } else {
      $portWrap.hide();
      $port.val('');
      $help.text('');
    }

    let portOk = true;
    if (tOn) {
      const v = $port.val();
      if (v === '') {
        $help.text('포트를 입력해 주세요(1~65535)입니다.');
        portOk = false;
      } else if (!isValidPort(v)) {
        $help.text('유효하지 않은 포트입니다. 1~65535 범위를 입력해 주세요.');
        portOk = false;
      } else {
        $help.text('사용 가능한 포트입니다.');
        portOk = true;
      }
    }

    const canExec = cOn && portOk;
    $exec.prop('disabled', !canExec).attr('aria-disabled', String(!canExec));
  }

  // 초기화: 이벤트는 유지, 값/표시만 리셋
  function resetModalState() {
    // 입력 타입/마스크 영향 제거 및 안전 속성
    $port.attr({ type: 'number', inputmode: 'numeric', pattern: '[0-9]*' }).removeAttr('maxlength');

    $sshToggle.prop('checked', false);
    $confirm.prop('checked', false);
    $port.val('');
    $help.text('');
    $portWrap.hide();

    $exec.prop('disabled', true).attr('aria-disabled', 'true');
  }

  // 열기: 리셋 후 show
  function openSecurityUpdateModal() {
    resetModalState();
    $modal.show();

    // 다른 스크립트가 뒤에서 버튼을 바꾸는 경우 대비(안전장치)
    setTimeout(function () {
      $exec.prop('disabled', true).attr('aria-disabled', 'true');
    }, 0);
  }

  // 닫기: 이벤트는 유지(재열림 시 동작 보장)
  function closeSecurityUpdateModal() {
    $modal.hide();
  }

  // ===== 이벤트 바인딩(한 번만) =====
  // 전역 바인딩/마스크가 있었다면 이 인풋에 한해 제거 후 우리 필터 적용
  $port.off('input.sshport keydown.sshport keyup.sshport');
  try { $port.inputmask && $port.inputmask('remove'); } catch (e) { }
  try { $port.unmask && $port.unmask(); } catch (e) { }

  $port.on('input.sshport keydown.sshport keyup.sshport', function (e) {
    // 전역 위임 핸들러가 잘라내는 것을 방지
    e.stopPropagation();
    if (e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
    clampPortInput(this);
    if (e.type === 'input') { refresh(); }
  });

  $sshToggle.on('change.sshport', refresh);
  $confirm.on('change.sshport', refresh);

  $btnClose.on('click.sshport', closeSecurityUpdateModal);
  $btnCancel.on('click.sshport', closeSecurityUpdateModal);

  // 페이지 로드시 즉시 초기 상태로 만들어 둠(처음 열 때 disabled 보장)
  resetModalState();

  // 외부 버튼에서 호출해 여세요(예: “보안 업데이트” 버튼)
  // $('#button-open-modal-security-update').on('click', openSecurityUpdateModal);
  // 필요 시 전역으로 노출
  window.openSecurityUpdateModal = openSecurityUpdateModal;

  // ====================================================
  // === SSH Port 변경 모달(#div-modal-ssh-port-change) 추가 ===
  // ====================================================
  const $portChangeModal = $('#div-modal-ssh-port-change');
  const $pcPortWrapBefore = $portChangeModal.find('#modal-div-ssh-port-change-before');
  const $pcPortBefore = $portChangeModal.find('#modal-input-ssh-port-change-before');
  const $pcHelpBefore = $portChangeModal.find('#modal-help-ssh-port-change-before');
  const $pcPortWrapAfter = $portChangeModal.find('#modal-div-ssh-port-change-after');
  const $pcPortAfter = $portChangeModal.find('#modal-input-ssh-port-change-after');
  const $pcHelpAfter = $portChangeModal.find('#modal-help-ssh-port-change-after');
  const $pcCheck = $portChangeModal.find('#modal-input-ssh-port-change-check');
  const $pcExec = $portChangeModal.find('#button-execution-modal-ssh-port-change');
  const $pcBtnClose = $portChangeModal.find('#button-close-modal-ssh-port-change');
  const $pcBtnCancel = $portChangeModal.find('#button-cancel-modal-ssh-port-change');

  // 실행 버튼 활성/비활성 + 포트 유효성 검사
  function refreshPortChangeModal() {
    const v_after = $pcPortAfter.val();
    const v_before = $pcPortBefore.val();
    let portOk = false;

    if (v_after === '') {
      $pcHelpAfter.text('포트를 입력해 주세요(1~65535)입니다.');
    } else if (!isValidPort(v_after)) {
      $pcHelpAfter.text('유효하지 않은 포트입니다. 1~65535 범위를 입력해 주세요.');
    } else {
      $pcHelpAfter.text('사용 가능한 포트입니다.');
      portOk = true;
    }
    if (v_before === '') {
      $pcHelpBefore.text('포트를 입력해 주세요(1~65535)입니다.');
    } else if (!isValidPort(v_before)) {
      $pcHelpBefore.text('유효하지 않은 포트입니다. 1~65535 범위를 입력해 주세요.');
    } else {
      $pcHelpBefore.text('사용 가능한 포트입니다.');
      portOk = true;
    }
    const canExec = portOk && $pcCheck.is(':checked');
    $pcExec.prop('disabled', !canExec).attr('aria-disabled', String(!canExec));
  }

  // 모달 초기 상태
  function resetPortChangeModal() {
    // 포트 입력 영역이 숨겨져 있다면 보이게 처리
    $pcPortWrapAfter.removeClass('is-hidden');
    $pcPortWrapBefore.removeClass('is-hidden');

    $pcPortBefore.attr({ type: 'number', inputmode: 'numeric', pattern: '[0-9]*', min: 1, max: 65535 });
    $pcPortBefore.val('');
    $pcHelpBefore.text('');

    $pcPortAfter.attr({ type: 'number', inputmode: 'numeric', pattern: '[0-9]*', min: 1, max: 65535 });
    $pcPortAfter.val('');
    $pcHelpAfter.text('');
    $pcCheck.prop('checked', false);
    $pcExec.prop('disabled', true).attr('aria-disabled', 'true');
  }

  // 모달 열기/닫기
  function openSshPortChangeModal() {
    resetPortChangeModal();
    $portChangeModal.show();
  }

  function closeSshPortChangeModal() {
    $portChangeModal.hide();
  }

  // 입력 이벤트: 자리수 제한 + 숫자만 + 유효성 검사
  $pcPortAfter.off('input.sshportchange keydown.sshportchange keyup.sshportchange');
  $pcPortAfter.on('input.sshportchange keydown.sshportchange keyup.sshportchange', function (e) {
    e.stopPropagation();
    if (e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
    clampPortInput(this);
    if (e.type === 'input') {
      refreshPortChangeModal();
    }
  });
  $pcPortBefore.off('input.sshportchange keydown.sshportchange keyup.sshportchange');
  $pcPortBefore.on('input.sshportchange keydown.sshportchange keyup.sshportchange', function (e) {
    e.stopPropagation();
    if (e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
    clampPortInput(this);
    if (e.type === 'input') {
      refreshPortChangeModal();
    }
  });
  // “SSH Port 확인” 스위치 체크 시 실행 버튼 상태 갱신
  $pcCheck.on('change.sshportchange', refreshPortChangeModal);

  // 닫기/취소 버튼
  $pcBtnClose.on('click.sshportchange', closeSshPortChangeModal);
  $pcBtnCancel.on('click.sshportchange', closeSshPortChangeModal);

  // 필요하면 외부에서 열기용으로 사용
  window.openSshPortChangeModal = openSshPortChangeModal;
});

$('#button-execution-modal-security-update').on('click', function () {
  $('#div-modal-security-update').hide();
  $('#div-modal-spinner-header-txt').text('클러스터 유지보수 모드 활성화');
  $('#div-modal-spinner').show();

  const changeSshPort = $('#modal-input-ssh-port-change').is(':checked');
  const changeAddHost = $('#modal-input-add-host-security-update-run').is(':checked');
  if (changeSshPort) {
    port = $('#modal-input-ssh-port').val();
    if (changeAddHost) {
      cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-disable'];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        var retVal = JSON.parse(data);
        if (retVal.code == 200) {
          $('#div-modal-spinner-header-txt').text('보안 업데이트 진행');
          cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--add-host', '-P', port];
          console.log(cmd);
          cockpit.spawn(cmd).then(function (data) {
            var retVal = JSON.parse(data);
            if (retVal.code == 200) {
              $('#div-modal-spinner-header-txt').text('보안 업데이트 파일 동기화');
              cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--update-json-file', '--local'];
              console.log(cmd);
              cockpit.spawn(cmd).then(function (data) {
                var retVal = JSON.parse(data);
                if (retVal.code == 200) {
                  $('#div-modal-spinner-header-txt').text('클러스터 유지보수 모드 비활성화');
                  cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-enable'];
                  console.log(cmd);
                  cockpit.spawn(cmd).then(function (data) {
                    var retVal = JSON.parse(data);
                    if (retVal.code == 200) {
                      $('#div-modal-spinner').hide();
                      $("#modal-status-alert-title").html("보안 업데이트 적용");
                      $("#modal-status-alert-body").html("보안 업데이트 적용이 완료되었습니다.");
                      markSecurityPatchCompleted();
                      $('#div-modal-status-alert').show();
                    } else {
                      $('#div-modal-spinner').hide();
                      $("#modal-status-alert-title").html("보안 업데이트 적용");
                      $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                      $('#div-modal-status-alert').show();
                    }
                  }).catch(function () {
                    $('#div-modal-spinner').hide();
                    $("#modal-status-alert-title").html("보안 업데이트 적용");
                    $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                    $('#div-modal-status-alert').show();
                  })
                } else {
                  $('#div-modal-spinner').hide();
                  $("#modal-status-alert-title").html("보안 업데이트 적용");
                  $("#modal-status-alert-body").html("보안 업데이트 파일 동기화 과정에서 오류가 발생했습니다.");
                  $('#div-modal-status-alert').show();
                }
              }).catch(function () {
                $('#div-modal-spinner').hide();
                $("#modal-status-alert-title").html("보안 업데이트 적용");
                $("#modal-status-alert-body").html("보안 업데이트 파일 동기화 과정에서 오류가 발생했습니다.");
                $('#div-modal-status-alert').show();
              })
            } else {
              $('#div-modal-spinner').hide();
              $("#modal-status-alert-title").html("보안 업데이트 적용");
              $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
              $('#div-modal-status-alert').show();
            }
          }).catch(function () {
            $('#div-modal-spinner').hide();
            $("#modal-status-alert-title").html("보안 업데이트 적용");
            $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
            $('#div-modal-status-alert').show();
          })
        } else {
          $('#div-modal-spinner').hide();
          $("#modal-status-alert-title").html("보안 업데이트 적용");
          $("#modal-status-alert-body").html("클러스터 유지보수 모드를 활성화하는 과정에서 오류가 발생했습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("보안 업데이트 적용");
        $("#modal-status-alert-body").html("클러스터 유지보수 모드를 활성화하는 과정에서 오류가 발생했습니다.");
        $('#div-modal-status-alert').show();
      })
    } else {
      cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-disable'];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        var retVal = JSON.parse(data);
        if (retVal.code == 200) {
          $('#div-modal-spinner-header-txt').text('보안 업데이트 진행');
          cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '-P', port];
          console.log(cmd);
          cockpit.spawn(cmd).then(function (data) {
            var retVal = JSON.parse(data);
            if (retVal.code == 200) {
              $('#div-modal-spinner-header-txt').text('보안 업데이트 파일 동기화');
              cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--update-json-file'];
              console.log(cmd);
              cockpit.spawn(cmd).then(function (data) {
                var retVal = JSON.parse(data);
                if (retVal.code == 200) {
                  if (os_type == "ablestack-hci" || os_type == "ablestack-hci-filesystem") {
                    $('#div-modal-spinner-header-txt').text('스토리지 가상머신 포트 변경');
                    cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--ceph-ssh-change', '-P', port];
                    console.log(cmd);
                    cockpit.spawn(cmd).then(function (data) {
                      var retVal = JSON.parse(data);
                      if (retVal.code == 200) {
                        $('#div-modal-spinner-header-txt').text('클러스터 유지보수 모드 비활성화');
                        cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-enable'];
                        console.log(cmd);
                        cockpit.spawn(cmd).then(function (data) {
                          var retVal = JSON.parse(data);
                          if (retVal.code == 200) {
                            $('#div-modal-spinner').hide();
                            $("#modal-status-alert-title").html("보안 업데이트 적용");
                            $("#modal-status-alert-body").html("보안 업데이트 적용이 완료되었습니다.");
                            markSecurityPatchCompleted();
                            $('#div-modal-status-alert').show();
                          } else {
                            $('#div-modal-spinner').hide();
                            $("#modal-status-alert-title").html("보안 업데이트 적용");
                            $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                            $('#div-modal-status-alert').show();
                          }
                        }).catch(function () {
                          $('#div-modal-spinner').hide();
                          $("#modal-status-alert-title").html("보안 업데이트 적용");
                          $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                          $('#div-modal-status-alert').show();
                        })
                      } else {
                        $('#div-modal-spinner').hide();
                        $("#modal-status-alert-title").html("보안 업데이트 적용");
                        $("#modal-status-alert-body").html("Glue 전용 SSH 포트 변경하는 과정에서 오류가 발생했습니다.");
                        $('#div-modal-status-alert').show();
                      }
                    }).catch(function () {
                      $('#div-modal-spinner').hide();
                      $("#modal-status-alert-title").html("보안 업데이트 적용");
                      $("#modal-status-alert-body").html("Glue 전용 SSH 포트 변경하는 과정에서 오류가 발생했습니다.");
                      $('#div-modal-status-alert').show();
                    })
                  } else {
                    $('#div-modal-spinner-header-txt').text('클러스터 유지보수 모드 비활성화');
                    cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-enable'];
                    console.log(cmd);
                    cockpit.spawn(cmd).then(function (data) {
                      var retVal = JSON.parse(data);
                      if (retVal.code == 200) {
                        $('#div-modal-spinner').hide();
                        $("#modal-status-alert-title").html("보안 업데이트 적용");
                        $("#modal-status-alert-body").html("보안 업데이트 적용이 완료되었습니다.");
                        markSecurityPatchCompleted();
                        $('#div-modal-status-alert').show();
                      } else {
                        $('#div-modal-spinner').hide();
                        $("#modal-status-alert-title").html("보안 업데이트 적용");
                        $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                        $('#div-modal-status-alert').show();
                      }
                    }).catch(function () {
                      $('#div-modal-spinner').hide();
                      $("#modal-status-alert-title").html("보안 업데이트 적용");
                      $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                      $('#div-modal-status-alert').show();
                    })
                  }
                } else {
                  $('#div-modal-spinner').hide();
                  $("#modal-status-alert-title").html("보안 업데이트 적용");
                  $("#modal-status-alert-body").html("보안 업데이트 파일 동기화 과정에서 오류가 발생했습니다.");
                  $('#div-modal-status-alert').show();
                }
              }).catch(function () {
                $('#div-modal-spinner').hide();
                $("#modal-status-alert-title").html("보안 업데이트 적용");
                $("#modal-status-alert-body").html("보안 업데이트 파일 동기화 과정에서 오류가 발생했습니다.");
                $('#div-modal-status-alert').show();
              })
            } else {
              $('#div-modal-spinner').hide();
              $("#modal-status-alert-title").html("보안 업데이트 적용");
              $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
              $('#div-modal-status-alert').show();
            }
          }).catch(function () {
            $('#div-modal-spinner').hide();
            $("#modal-status-alert-title").html("보안 업데이트 적용");
            $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
            $('#div-modal-status-alert').show();
          })
        } else {
          $('#div-modal-spinner').hide();
          $("#modal-status-alert-title").html("보안 업데이트 적용");
          $("#modal-status-alert-body").html("클러스터 유지보수 모드를 활성화하는 과정에서 오류가 발생했습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("보안 업데이트 적용");
        $("#modal-status-alert-body").html("클러스터 유지보수 모드를 활성화하는 과정에서 오류가 발생했습니다.");
        $('#div-modal-status-alert').show();
      })
    }
  } else {
    if (changeAddHost) {
      cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-disable'];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        var retVal = JSON.parse(data);
        if (retVal.code == 200) {
          $('#div-modal-spinner-header-txt').text('보안 업데이트 진행');
          cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--add-host'];
          console.log(cmd);
          cockpit.spawn(cmd).then(function (data) {
            var retVal = JSON.parse(data);
            if (retVal.code == 200) {
              $('#div-modal-spinner-header-txt').text('보안 업데이트 파일 동기화');
              cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--update-json-file', '--local'];
              console.log(cmd);
              cockpit.spawn(cmd).then(function (data) {
                var retVal = JSON.parse(data);
                if (retVal.code == 200) {
                  $('#div-modal-spinner-header-txt').text('클러스터 유지보수 모드 비활성화');
                  cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-enable'];
                  console.log(cmd);
                  cockpit.spawn(cmd).then(function (data) {
                    var retVal = JSON.parse(data);
                    if (retVal.code == 200) {
                      $('#div-modal-spinner').hide();
                      $("#modal-status-alert-title").html("보안 업데이트 적용");
                      $("#modal-status-alert-body").html("보안 업데이트 적용이 완료되었습니다.");
                      markSecurityPatchCompleted();
                      $('#div-modal-status-alert').show();
                    } else {
                      $('#div-modal-spinner').hide();
                      $("#modal-status-alert-title").html("보안 업데이트 적용");
                      $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                      $('#div-modal-status-alert').show();
                    }
                  }).catch(function () {
                    $('#div-modal-spinner').hide();
                    $("#modal-status-alert-title").html("보안 업데이트 적용");
                    $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                    $('#div-modal-status-alert').show();
                  })
                  $('#div-modal-spinner').hide();
                  $("#modal-status-alert-title").html("보안 업데이트 적용");
                  $("#modal-status-alert-body").html("보안 업데이트 적용이 완료되었습니다.");
                  markSecurityPatchCompleted();
                  $('#div-modal-status-alert').show();
                } else {
                  $('#div-modal-spinner').hide();
                  $("#modal-status-alert-title").html("보안 업데이트 적용");
                  $("#modal-status-alert-body").html("보안 업데이트 파일 동기화 과정에서 오류가 발생했습니다.");
                  $('#div-modal-status-alert').show();
                }
              }).catch(function () {
                $('#div-modal-spinner').hide();
                $("#modal-status-alert-title").html("보안 업데이트 적용");
                $("#modal-status-alert-body").html("보안 업데이트 파일 동기화 과정에서 오류가 발생했습니다.");
                $('#div-modal-status-alert').show();
              })

            } else {
              $('#div-modal-spinner').hide();
              $("#modal-status-alert-title").html("보안 업데이트 적용");
              $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
              $('#div-modal-status-alert').show();
            }
          }).catch(function () {
            $('#div-modal-spinner').hide();
            $("#modal-status-alert-title").html("보안 업데이트 적용");
            $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
            $('#div-modal-status-alert').show();
          })
        } else {
          $('#div-modal-spinner').hide();
          $("#modal-status-alert-title").html("보안 업데이트 적용");
          $("#modal-status-alert-body").html("클러스터 유지보수 모드를 활성화하는 과정에서 오류가 발생했습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("보안 업데이트 적용");
        $("#modal-status-alert-body").html("클러스터 유지보수 모드를 활성화하는 과정에서 오류가 발생했습니다.");
        $('#div-modal-status-alert').show();
      })

    } else {
      cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-disable'];
      console.log(cmd);
      cockpit.spawn(cmd).then(function (data) {
        var retVal = JSON.parse(data);
        if (retVal.code == 200) {
          $('#div-modal-spinner-header-txt').text('보안 업데이트 진행');
          cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py'];
          console.log(cmd);
          cockpit.spawn(cmd).then(function (data) {
            var retVal = JSON.parse(data);
            if (retVal.code == 200) {
              $('#div-modal-spinner-header-txt').text('보안 업데이트 파일 동기화');
              cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--update-json-file'];
              console.log(cmd);
              cockpit.spawn(cmd).then(function (data) {
                var retVal = JSON.parse(data);
                if (retVal.code == 200) {
                  $('#div-modal-spinner-header-txt').text('클러스터 유지보수 모드 비활성화');
                  cmd = ['python3', '/usr/share/cockpit/ablestack/python/gfs/gfs_manage.py', '--check-stonith', '--control', 'security-enable'];
                  console.log(cmd);
                  cockpit.spawn(cmd).then(function (data) {
                    var retVal = JSON.parse(data);
                    if (retVal.code == 200) {
                      $('#div-modal-spinner').hide();
                      $("#modal-status-alert-title").html("보안 업데이트 적용");
                      $("#modal-status-alert-body").html("보안 업데이트 적용이 완료되었습니다.");
                      markSecurityPatchCompleted();
                      $('#div-modal-status-alert').show();
                    } else {
                      $('#div-modal-spinner').hide();
                      $("#modal-status-alert-title").html("보안 업데이트 적용");
                      $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                      $('#div-modal-status-alert').show();
                    }
                  }).catch(function () {
                    $('#div-modal-spinner').hide();
                    $("#modal-status-alert-title").html("보안 업데이트 적용");
                    $("#modal-status-alert-body").html("클러스터 유지보수 모드를 비활성화하는 과정에서 오류가 발생했습니다.");
                    $('#div-modal-status-alert').show();
                  })
                } else {
                  $('#div-modal-spinner').hide();
                  $("#modal-status-alert-title").html("보안 업데이트 적용");
                  $("#modal-status-alert-body").html("보안 업데이트 파일 동기화 과정에서 오류가 발생했습니다.");
                  $('#div-modal-status-alert').show();
                }
              }).catch(function () {
                $('#div-modal-spinner').hide();
                $("#modal-status-alert-title").html("보안 업데이트 적용");
                $("#modal-status-alert-body").html("보안 업데이트 파일 동기화 과정에서 오류가 발생했습니다.");
                $('#div-modal-status-alert').show();
              })
            } else {
              $('#div-modal-spinner').hide();
              $("#modal-status-alert-title").html("보안 업데이트 적용");
              $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
              $('#div-modal-status-alert').show();
            }
          }).catch(function () {
            $('#div-modal-spinner').hide();
            $("#modal-status-alert-title").html("보안 업데이트 적용");
            $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
            $('#div-modal-status-alert').show();
          })
        } else {
          $('#div-modal-spinner').hide();
          $("#modal-status-alert-title").html("보안 업데이트 적용");
          $("#modal-status-alert-body").html("클러스터 유지보수 모드를 활성화하는 과정에서 오류가 발생했습니다.");
          $('#div-modal-status-alert').show();
        }
      }).catch(function () {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("보안 업데이트 적용");
        $("#modal-status-alert-body").html("클러스터 유지보수 모드를 활성화하는 과정에서 오류가 발생했습니다.");
        $('#div-modal-status-alert').show();
      })
    }
  }
});

$('#button-cloud-cluster-ssh-port').on('click', function () {
  $('#div-modal-ssh-port-change').show();
});
$('#button-close-modal-ssh-port-change, #button-cancel-modal-ssh-port-change').on('click', function () {
  $('#div-modal-ssh-port-change').hide();
});
$('#button-execution-modal-ssh-port-change').on('click', function () {
  $('#div-modal-ssh-port-change').hide();
  $('#div-modal-spinner-header-txt').text('SSH 포트 변경 중');
  $('#div-modal-spinner').show();

  const beforePort = $('#modal-input-ssh-port-change-before').val();
  const afterPort = $('#modal-input-ssh-port-change-after').val();

  cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--ssh-port', beforePort, '-P', afterPort, '--port-change'];
  console.log(cmd);
  cockpit.spawn(cmd).then(function (data) {
    var retVal = JSON.parse(data);
    if (retVal.code == 200) {
      if (os_type == "ablestack-hci" || os_type == "ablestack-hci-filesystem") {
        cmd = ['python3', '/usr/share/cockpit/ablestack/python/security_patch/security_patch.py', '--ceph-ssh-change', '-P', afterPort];
        console.log(cmd);
        cockpit.spawn(cmd).then(function (data) {
          var retVal = JSON.parse(data);
          if (retVal.code == 200) {
            $('#div-modal-spinner').hide();
            $("#modal-status-alert-title").html("SSH 포트 변경");
            $("#modal-status-alert-body").html("SSH 포트 변경이 완료되었습니다.");
            $('#div-modal-status-alert').show();
          } else {
            $('#div-modal-spinner').hide();
            $("#modal-status-alert-title").html("보안 업데이트 적용");
            $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
            $('#div-modal-status-alert').show();
          }
        }).catch(function () {
          $('#div-modal-spinner').hide();
          $("#modal-status-alert-title").html("보안 업데이트 적용");
          $("#modal-status-alert-body").html("보안 업데이트를 적용하는 중 오류가 발생했습니다.");
          $('#div-modal-status-alert').show();
        })
      }
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("SSH 포트 변경");
      $("#modal-status-alert-body").html("SSH 포트 변경이 완료되었습니다.");
      $('#div-modal-status-alert').show();
    } else {
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("SSH 포트 변경");
      $("#modal-status-alert-body").html("SSH 포트 변경 중 오류가 발생했습니다.");
      $('#div-modal-status-alert').show();
    }
  }).catch(function () {
    $('#div-modal-spinner').hide();
    $("#modal-status-alert-title").html("SSH 포트 변경");
    $("#modal-status-alert-body").html("SSH 포트 변경 중 오류가 발생했습니다.");
    $('#div-modal-status-alert').show();
  })
});

$('#button-link-hci-shared-file-configure').on('click', function () {
  $('#div-modal-wizard-hci-shared-file-configure').show();
});
// 공유 파일 생성 모달 닫기
$('#button-close-modal-hci-shared-file-create, #button-cancel-modal-hci-shared-file-create').on('click', function () {
  $('#div-modal-hci-shared-file-create').hide();
})
$('#button-execution-modal-hci-shared-file-create').on('click', function () {
  $('#div-modal-hci-shared-file-create').hide();
  $('#div-modal-spinner-header-txt').text('공유 파일 생성 중');
  $('#div-modal-spinner').show();

  var size = $('#form-input-hci-file-volume').val();

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function (data) {
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var all_host_name = "";
    var host_names = [];
    for (let i = 0; i < hosts.length; i++) {
      var hostName = hosts[i].ablecubePn;
      all_host_name += (all_host_name ? " " : "") + hostName;
      if (hostName) {
        host_names.push(hostName); // 유효한 이름만 배열에 추가
      }

    }
    cmd = ["python3", "/usr/share/cockpit/ablestack/python/rbd/rbd_manage.py", "--create-rbd-image", "--size", size, "--list-ip", all_host_name];
    console.log(cmd);
    cockpit.spawn(cmd).then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == "200") {
        $('#div-modal-spinner').hide();
        $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
        $('#div-modal-hci-shared-file-create').hide();
        $("#modal-status-alert-title").html("HCI 공유 파일 생성");
        $("#modal-status-alert-body").html("HCI 공유 파일 생성이 완료되었습니다.");
        $('#div-modal-status-alert').show();
      } else {
        $('#div-modal-spinner').hide();
        $('#div-modal-hci-shared-file-create').hide();
        $("#modal-status-alert-title").html("HCI 공유 파일 생성");
        $("#modal-status-alert-body").html("HCI 공유 파일 생성 중 오류가 발생했습니다.");
        $('#div-modal-status-alert').show();
      }
    }).catch(function () {
      $('#div-modal-spinner').hide();
      $('#div-modal-hci-shared-file-create').hide();
      $("#modal-status-alert-title").html("HCI 공유 파일 생성");
      $("#modal-status-alert-body").html("HCI 공유 파일 생성 중 오류가 발생했습니다.");
      $('#div-modal-status-alert').show();
    })
  })
})
$('#modal-input-hci-shared-file-create').on('click', function () {
  var condition = $("#button-execution-modal-hci-shared-file-create").prop('disabled');
  $("#button-execution-modal-hci-shared-file-create").prop("disabled", condition ? false : true);
});
// 새로 고침 버튼에 대한 액션 정의
$('#button-refresh-modal-gfs-disk-add').on('click', function () {
  setDiskAction("hci-gfs", "add");
});
$(' #button-refresh-modal-gfs-disk-extend').on('click', function () {
  setDiskAction("hci-gfs", "add", "true");
});
// 디스크 이미지 생성 버튼에 대한 액션 정의
$('#div-disk-image-create, #div-disk-image-create-extend').on('click', function () {
  $('#form-input-disk-image-size').val('');
  $('input[type=checkbox][id="modal-input-disk-image-create-confirm"]').prop("checked", false);
  $('#button-execution-modal-disk-image-create').attr('disabled', true);
  $('#div-modal-disk-image-create').show();
});
$('#button-cancel-modal-disk-image-create, #button-close-modal-disk-image-create').on('click', function () {
  $('#div-modal-disk-image-create').hide();
});
$('#modal-input-disk-image-create-confirm').on('click', function () {
  var condition = $("#button-execution-modal-disk-image-create").prop('disabled');
  $("#button-execution-modal-disk-image-create").prop("disabled", condition ? false : true);
});
$('#button-execution-modal-disk-image-create').on('click', function () {
  $('#div-modal-disk-image-create').hide();
  $('#div-modal-spinner-header-txt').text('디스크 이미지 생성 중');
  $('#div-modal-spinner').detach().appendTo('body').show();

  var size = $('#form-input-disk-image-size').val();

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function (data) {
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var all_host_name = "";
    var host_names = [];
    for (let i = 0; i < hosts.length; i++) {
      var hostName = hosts[i].ablecubePn;
      all_host_name += (all_host_name ? " " : "") + hostName;
      if (hostName) {
        host_names.push(hostName); // 유효한 이름만 배열에 추가
      }

    }
    cmd = ["python3", pluginpath + "/python/rbd/rbd_manage.py", "--create-rbd-image", "--size", size, "--list-ip", all_host_name];
    console.log(cmd);
    cockpit.spawn(cmd).then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == "200") {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("디스크 이미지 생성");
        $("#modal-status-alert-body").html("디스크 이미지 생성이 완료되었습니다.");
        $('#div-modal-status-alert').detach().appendTo('body').show();
      } else {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("디스크 이미지 생성");
        $("#modal-status-alert-body").html("디스크 이미지 생성 중 오류가 발생했습니다.");
        $('#div-modal-status-alert').detach().appendTo('body').show();
      }
    }).catch(function () {
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("디스크 이미지 파일 생성");
      $("#modal-status-alert-body").html("디스크 이미지 생성 중 오류가 발생했습니다.");
      $('#div-modal-status-alert').detach().appendTo('body').show();
    })
  })
});

$('#menu-item-set-disk-image-add').on('click', function () {
  $('#form-input-disk-image-size').val('');
  $('input[type=checkbox][id="modal-input-disk-image-create-confirm"]').prop("checked", false);
  $('#button-execution-modal-disk-image-create').attr('disabled', true);
  $('#div-modal-disk-image-create').show();
});
$('#menu-item-set-disk-image-delete').on('click', function () {
  setDiskAction("hci-gfs", "delete");
  $('#div-modal-disk-image-delete').show();
});
$('#button-cancel-modal-disk-image-add, #button-close-modal-disk-image-add').on('click', function () {
  $('#div-modal-disk-image-add').hide();
});
$('#button-cancel-modal-disk-image-delete, #button-close-modal-disk-image-delete').on('click', function () {
  $('#div-modal-disk-image-delete').hide();
});
$('#div-modal-gfs-disk-add').on('change', 'input[type=checkbox][name="form-gfs-checkbox-disk-add"]', function () {
  // 체크된 항목이 있는지 확인
  var isChecked = $('input[type=checkbox][name="form-gfs-checkbox-disk-add"]:checked').length > 0;

  // 체크되면 버튼 활성화, 아니면 비활성화
  $('#button-execution-modal-gfs-disk-add').prop('disabled', !isChecked);
});
$('#div-modal-disk-image-delete').on('change', 'input[type=checkbox][name="form-disk-image-checkbox-delete"]', function () {
  // 체크된 항목이 있는지 확인
  var isChecked = $('input[type=checkbox][name="form-disk-image-checkbox-delete"]:checked').length > 0;

  // 체크되면 버튼 활성화, 아니면 비활성화
  $('#button-execution-modal-disk-image-delete').prop('disabled', !isChecked);
});
$('#button-execution-modal-disk-image-delete').on('click', function () {
  $('#div-modal-disk-image-delete').hide();
  $('#div-modal-spinner-header-txt').text('디스크 이미지 삭제 중');
  $('#div-modal-spinner').show();

  var image_name = $('input[type=checkbox][name="form-disk-image-checkbox-delete"]:checked')
    .map(function () {
      return $(this).data('disk_id'); // 체크된 값 가져오기
    })
    .get()
    .join(',');

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function (data) {
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var all_host_name = "";
    var host_names = [];
    for (let i = 0; i < hosts.length; i++) {
      var hostName = hosts[i].ablecubePn;
      all_host_name += (all_host_name ? " " : "") + hostName;
      if (hostName) {
        host_names.push(hostName); // 유효한 이름만 배열에 추가
      }
    }
    cmd = ["python3", pluginpath + "/python/rbd/rbd_manage.py", "--delete-rbd-image", "--image-name", image_name, "--list-ip", all_host_name];
    console.log(cmd);
    cockpit.spawn(cmd).then(function (data) {
      var retVal = JSON.parse(data);
      if (retVal.code == "200") {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("디스크 이미지 삭제");
        $("#modal-status-alert-body").html("디스크 이미지 삭제가 완료되었습니다.");
        $('#div-modal-status-alert').detach().appendTo('body').show();
      } else {
        $('#div-modal-spinner').hide();
        $("#modal-status-alert-title").html("디스크 이미지 삭제");
        $("#modal-status-alert-body").html("디스크 이미지 삭제 중 오류가 발생했습니다.");
        $('#div-modal-status-alert').detach().appendTo('body').show();
      }
    }).catch(function () {
      $('#div-modal-spinner').hide();
      $("#modal-status-alert-title").html("디스크 이미지 삭제");
      $("#modal-status-alert-body").html("디스크 이미지 삭제 중 오류가 발생했습니다.");
      $('#div-modal-status-alert').detach().appendTo('body').show();
    })
  })
});
