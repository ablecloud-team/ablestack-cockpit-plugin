/**
 * File Name : gfs-storage-configure-wizard.js
 * Date Created : 2025.07.17
 * Writer : 정민철
 * Description : GFS 스토리지 구성 마법사에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// 변수 선언
var cur_step_wizard_gfs_config = "1";
var completed = false;
var os_type = sessionStorage.getItem("os_type");

// Document.ready 시작
$(document).ready(function(){
  // GFS 스토리지 구성 마법사 페이지 준비
  $('#div-modal-wizard-gfs-external-storage-sync').hide();
  $('#div-modal-wizard-gfs-disk-configure').hide();
  $('#div-modal-wizard-gfs-ipmi').hide();
  $('#div-modal-wizard-gfs-review').hide();
  $('#div-modal-wizard-gfs-deploy').hide();
  $('#div-modal-wizard-gfs-finish').hide();

  $('#div-accordion-gfs-externel-storage-sync').attr('hidden', true).hide();
  $('#div-accordion-gfs-disk').attr('hidden', true).hide();

  // $('#nav-button-gfs-review').addClass('pf-m-disabled');
  $('#nav-button-gfs-finish').addClass('pf-m-disabled');

  $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', true);
  $('#button-cancel-config-modal-gfs-storage-wizard-config').attr('disabled', false);

  // 루트 디스크
  $('#form-select-cloud-vm-root-disk-size').text("500 GiB (THIN Provisioning)");
  $('#span-cloud-vm-root-disk-size').text("500 GiB");
  // 첫번째 스텝에서 시작
  cur_step_wizard_gfs_config = "1";

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    updateIPMIcredentials(hosts.length,$('input[name="radio-gfs-ipmi"]:checked').val())
  })


  //디스크 구성방식 초기 세팅
  setGfsDiskInfo();

});
// document ready 끝
$('#button-close-modal-gfs-storage-wizard-confirm, #button-cancel-modal-gfs-storage-wizard-confirm').on('click', function(){
  $('#div-modal-gfs-storage-wizard-confirm').hide();
});
// 이벤트 처리 함수
$('#button-close-modal-wizard-gfs').on('click', function(){
  $('#div-modal-wizard-gfs-storage-configure').hide();
  if(completed){
    //상태값 초기화 겸 페이지 리로드
    location.reload();
  }
});

// '다음' 버튼 클릭 시 이벤트를 처리하기 위한 함수
$('#button-next-step-modal-gfs-storage-wizard-config').on('click', function(){
  if (cur_step_wizard_gfs_config == "1") {


    var selectedValue = $('input[name="form-radio-gfs-external-storage-sync"]:checked').val();

    if (selectedValue == "duplication") {
      $('#div-gfs-external-storage-sync').show();
      $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', true);
      $('#nav-button-gfs-disk-configure').addClass('pf-m-disabled');
      $('#nav-button-gfs-ipmi-info').addClass('pf-m-disabled');
      $('#nav-button-gfs-review').addClass('pf-m-disabled');
    } else {
      $('#div-gfs-external-storage-sync').hide();
      $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
      $('#nav-button-gfs-disk-configure').removeClass('pf-m-disabled');
      $('#nav-button-gfs-ipmi-info').removeClass('pf-m-disabled');
      $('#nav-button-gfs-review').removeClass('pf-m-disabled');
    }

    $('#div-modal-wizard-gfs-overview').hide();
    $('#div-modal-wizard-gfs-external-storage-sync').show();
    $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#nav-button-gfs-overview').removeClass('pf-m-current');
    $('#nav-button-gfs-external-storage-sync').addClass('pf-m-current');

    cur_step_wizard_gfs_config = "2";
  }
  else if (cur_step_wizard_gfs_config == "2") {
    setGfsDiskInfo();

    $('#div-modal-wizard-gfs-external-storage-sync').hide();
    $('#div-modal-wizard-gfs-disk-configure').show();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#nav-button-gfs-external-storage-sync').removeClass('pf-m-current');
    $('#nav-button-gfs-disk-configure').addClass('pf-m-current');

    cur_step_wizard_gfs_config = "3";
  }
  else if (cur_step_wizard_gfs_config == "3") {
    $('#div-modal-wizard-gfs-disk-configure').hide();
    $('#div-modal-wizard-gfs-ipmi').show();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#nav-button-gfs-disk-configure').removeClass('pf-m-current');
    $('#nav-button-gfs-ipmi-info').addClass('pf-m-current');

    cur_step_wizard_gfs_config = "4";
  }
  else if (cur_step_wizard_gfs_config == "4") {

    // review 정보 세팅
    setGfsReviewInfo();

    $('#div-modal-wizard-gfs-ipmi').hide();
    $('#div-modal-wizard-gfs-review').show();
    $('#nav-button-gfs-ipmi-info').removeClass('pf-m-current');
    $('#nav-button-gfs-review').addClass('pf-m-current');

    IpmiCheck().then(function(result){
      if (result){
        $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
        $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
        cur_step_wizard_gfs_config = "5";
      }else{
        $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', true);
        $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
        $('#button-cancel-config-modal-gfs-storage-wizard-config').attr('disabled', false);
        cur_step_wizard_gfs_config = "5";
      }
    })

  }
  else if (cur_step_wizard_gfs_config == "5") {
    $('#div-modal-gfs-storage-wizard-confirm').show();
  }
});

// '이전' 버튼 클릭 시 이벤트를 처리하기 위한 함수
$('#button-before-step-modal-gfs-storage-wizard-config').on('click', function(){
  if (cur_step_wizard_gfs_config == "1") {
    // 이전 버튼 없음
  }
  else if (cur_step_wizard_gfs_config == "2") {
    // 1번 스텝으로 이동
    $('#div-modal-wizard-gfs-overview').show();
    $('#div-modal-wizard-gfs-external-storage-sync').hide();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', true);
    $('#nav-button-gfs-overview').addClass('pf-m-current');
    $('#nav-button-gfs-external-storage-sync').removeClass('pf-m-current');

    // 1번으로 변수값 변경
    cur_step_wizard_gfs_config = "1";
  }
  else if (cur_step_wizard_gfs_config == "3") {


    var selectedValue = $('input[name="form-radio-gfs-external-storage-sync"]:checked').val();

    if (selectedValue == "duplication") {
      $('#div-gfs-external-storage-sync').show();
      $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', true);
      $('#nav-button-gfs-disk-configure').addClass('pf-m-disabled');
      $('#nav-button-gfs-ipmi-info').addClass('pf-m-disabled');
      $('#nav-button-gfs-review').addClass('pf-m-disabled');
    } else {
      $('#div-gfs-external-storage-sync').hide();
      $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
      $('#nav-button-gfs-disk-configure').removeClass('pf-m-disabled');
      $('#nav-button-gfs-ipmi-info').removeClass('pf-m-disabled');
      $('#nav-button-gfs-review').removeClass('pf-m-disabled');
    }

    $('#div-modal-wizard-gfs-external-storage-sync').show();
    $('#div-modal-wizard-gfs-disk-configure').hide();
    $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#nav-button-gfs-external-storage-sync').addClass('pf-m-current');
    $('#nav-button-gfs-disk-configure').removeClass('pf-m-current');

    cur_step_wizard_gfs_config = "2";
  }
  else if (cur_step_wizard_gfs_config == "4") {
    $('#div-modal-wizard-gfs-disk-configure').show();
    $('#div-modal-wizard-gfs-ipmi').hide();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#nav-button-gfs-disk-configure').addClass('pf-m-current');
    $('#nav-button-gfs-ipmi-info').removeClass('pf-m-current');

    cur_step_wizard_gfs_config = "3";
  }
  else if (cur_step_wizard_gfs_config == "5") {
    $('#div-modal-wizard-gfs-ipmi').show();
    $('#div-modal-wizard-gfs-review').hide();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#nav-button-gfs-ipmi-info').addClass('pf-m-current');
    $('#nav-button-gfs-review').removeClass('pf-m-current');

    $('#button-next-step-modal-gfs-storage-wizard-config').html('다음');

    cur_step_wizard_gfs_config = "4";
  }

});

$('#nav-button-gfs-overview').on('click', function(){
  gfshideAllMainBody();
  gfsresetCurrentMode();

  $('#div-modal-wizard-gfs-overview').show();
  $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', true);
  $('#nav-button-gfs-overview').addClass('pf-m-current');

  cur_step_wizard_gfs_config = "1";
});

$('#nav-button-gfs-external-storage-sync').on('click', function(){
  gfshideAllMainBody();
  gfsresetCurrentMode();

  var selectedValue = $('input[name="form-radio-gfs-external-storage-sync"]:checked').val();

  if (selectedValue == "duplication") {
    $('#div-gfs-external-storage-sync').show();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', true);
    $('#nav-button-gfs-disk-configure').addClass('pf-m-disabled');
    $('#nav-button-gfs-ipmi-info').addClass('pf-m-disabled');
    $('#nav-button-gfs-review').addClass('pf-m-disabled');
  } else {
    $('#div-gfs-external-storage-sync').hide();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#nav-button-gfs-disk-configure').removeClass('pf-m-disabled');
    $('#nav-button-gfs-ipmi-info').removeClass('pf-m-disabled');
    $('#nav-button-gfs-review').removeClass('pf-m-disabled');
  }

  $('#div-modal-wizard-gfs-external-storage-sync').show();
  $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#nav-button-gfs-external-storage-sync').addClass('pf-m-current');

  cur_step_wizard_gfs_config = "2";
});

$('#nav-button-gfs-disk-configure').on('click', function(){
  gfshideAllMainBody();
  gfsresetCurrentMode();

  $('#div-modal-wizard-gfs-disk-configure').show();
  $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#nav-button-gfs-disk-configure').addClass('pf-m-current');

  cur_step_wizard_gfs_config = "3";
});

$('#nav-button-gfs-ipmi-info').on('click', function(){
  gfshideAllMainBody();
  gfsresetCurrentMode();

  $('#div-modal-wizard-gfs-ipmi').show();
  $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#nav-button-gfs-ipmi-info').addClass('pf-m-current');

  cur_step_wizard_gfs_config = "4";
});

$('#nav-button-gfs-review').on('click', function(){
  gfshideAllMainBody();
  gfsresetCurrentMode();

  // review 정보 세팅
  setGfsReviewInfo();

  $('#div-modal-wizard-gfs-review').show();
  $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#nav-button-gfs-review').addClass('pf-m-current');

  $('#button-next-step-modal-gfs-storage-wizard-config').html('배포');

  cur_step_wizard_gfs_config = "5";
});

$('#nav-button-gfs-finish').on('click', function(){
  gfshideAllMainBody();
  gfsresetCurrentMode();

  $('#div-modal-wizard-gfs-finish').show();
  $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', true);
  $('#nav-button-gfs-finish').addClass('pf-m-current');

  $('#button-next-step-modal-gfs-storage-wizard-config').hide();
  $('#button-before-step-modal-gfs-storage-wizard-config').hide();
  $('#button-cancel-config-modal-gfs-storage-wizard-config').hide();

  cur_step_wizard_gfs_config = "6";
});

// 설정확인 단계의 아코디언 개체에서 발생하는 이벤트의 처리
$('#button-accordion-gfs-externel-storage-sync').on('click', function(){
  if ($('#button-accordion-gfs-externel-storage-sync').attr("aria-expanded") == "false") {
    $('#button-accordion-gfs-externel-storage-sync').attr("aria-expanded", "true");
    $('#button-accordion-gfs-externel-storage-sync').addClass("pf-m-expanded");
    $('#div-accordion-gfs-externel-storage-sync').removeAttr('hidden').fadeIn();
    $('#div-accordion-gfs-externel-storage-sync').addClass("pf-m-expanded");
    $('#div-accordion-gfs-externel-storage-sync').closest('.pf-v6-c-accordion__item').addClass("pf-m-expanded");
  }
  else {
    $('#button-accordion-gfs-externel-storage-sync').attr("aria-expanded", "false");
    $('#button-accordion-gfs-externel-storage-sync').removeClass("pf-m-expanded");
    $('#div-accordion-gfs-externel-storage-sync').attr('hidden', true).fadeOut();
    $('#div-accordion-gfs-externel-storage-sync').removeClass("pf-m-expanded");
    $('#div-accordion-gfs-externel-storage-sync').closest('.pf-v6-c-accordion__item').removeClass("pf-m-expanded");
  }
});

$('#button-accordion-gfs-disk').on('click', function(){
  if ($('#button-accordion-gfs-disk').attr("aria-expanded") == "false") {
    $('#button-accordion-gfs-disk').attr("aria-expanded", "true");
    $('#button-accordion-gfs-disk').addClass("pf-m-expanded");
    $('#div-accordion-gfs-disk').removeAttr('hidden').fadeIn();
    $('#div-accordion-gfs-disk').addClass("pf-m-expanded");
    $('#div-accordion-gfs-disk').closest('.pf-v6-c-accordion__item').addClass("pf-m-expanded");
  }
  else {
    $('#button-accordion-gfs-disk').attr("aria-expanded", "false");
    $('#button-accordion-gfs-disk').removeClass("pf-m-expanded");
    $('#div-accordion-gfs-disk').attr('hidden', true).fadeOut();
    $('#div-accordion-gfs-disk').removeClass("pf-m-expanded");
    $('#div-accordion-gfs-disk').closest('.pf-v6-c-accordion__item').removeClass("pf-m-expanded");
  }
});

$(document).on('click', '#button-accordion-gfs-ipmi', function () {
  const button = $(this); // 현재 클릭된 버튼
  const content = $('#div-accordion-gfs-expaned-ipmi'); // 아코디언 내용 영역

  if (button.attr("aria-expanded") == "false") {
    button.attr("aria-expanded", "true");
    button.addClass("pf-m-expanded");
    content.removeAttr('hidden').fadeIn();
    content.addClass("pf-m-expanded");
    content.closest('.pf-v6-c-accordion__item').addClass("pf-m-expanded");
  } else {
    button.attr("aria-expanded", "false");
    button.removeClass("pf-m-expanded");
    content.attr('hidden', true).fadeOut();
    content.removeClass("pf-m-expanded");
    content.closest('.pf-v6-c-accordion__item').removeClass("pf-m-expanded");
  }
});
$('input[type=radio][name="form-radio-gfs-external-storage-sync"]').on('change', function() {

  var selectedValue = $('input[name="form-radio-gfs-external-storage-sync"]:checked').val();

  if (selectedValue == "duplication") {
    $('#div-gfs-external-storage-sync').show();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', true);
    $('#nav-button-gfs-disk-configure').addClass('pf-m-disabled');
    $('#nav-button-gfs-ipmi-info').addClass('pf-m-disabled');
    $('#nav-button-gfs-review').addClass('pf-m-disabled');
  } else {
    $('#div-gfs-external-storage-sync').hide();
    $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
    $('#nav-button-gfs-disk-configure').removeClass('pf-m-disabled');
    $('#nav-button-gfs-ipmi-info').removeClass('pf-m-disabled');
    $('#nav-button-gfs-review').removeClass('pf-m-disabled');
  }
});
// 마법사 "배포 실행 버튼 모달창"
$('#button-close-modal-wizard-gfs, #button-cancel-config-modal-wizard-gfs-config').on('click', function () {
  $('#div-modal-gfs-storage-wizard-confirm').hide();
});

$('#button-gfs-external-storage-sync').on('click', function(){
  $('#div-modal-multipath-sync').show();
});
// 마법사 "배포 버튼 모달창" 실행 버튼을 눌러 GFS 스토리지 구성
$('#button-execution-modal-gfs-storage-wizard-confirm').on('click', function () {
  $('#div-modal-gfs-storage-wizard-confirm').hide();
  validateGfsStorage().then(function(valid){
    if(valid){
      // 배포 버튼을 누르면 배포 진행 단계로 이동한다.
      gfshideAllMainBody();
      gfsresetCurrentMode();

      $('#div-modal-wizard-gfs-deploy').show();
      $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', true);
      $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', true);

      $('#nav-button-gfs-finish').addClass('pf-m-current');

      cur_step_wizard_gfs_config = "6";

      deployGfsStorage();
    }
  });
});

// 마법사 "취소 버튼 모달창" show, hide
$('#button-cancel-config-modal-gfs-storage-wizard-config').on('click', function () {
  $('#div-modal-cancel-gfs-storage-wizard-cancel').show();
});
$('#button-cancel-modal-gfs-storage-wizard-confirm').on('click', function () {
  $('#div-modal-cancel-gfs-storage-wizard-cancel').show();
});
$('#button-close-modal-gfs-storage-wizard-cancel').on('click', function () {
  $('#div-modal-cancel-gfs-storage-wizard-cancel').hide();
});
$('#button-cancel-modal-gfs-storage-wizard-cancel').on('click', function () {
  $('#div-modal-cancel-gfs-storage-wizard-cancel').hide();
});
// 마법사 "취소 버튼 모달창" 실행 버튼을 눌러 취소를 실행
$('#button-execution-modal-storage-wizard-cancel').on('click', function () {
  //상태값 초기화 겸 페이지 리로드
  location.reload();
});

$('#button-execution-modal-gfs-storage-wizard-cancel').on('click', function(){
  //상태값 초기화 겸 페이지 리로드
  location.reload();
})
/**
 * Meathod Name : gfshideAllMainBody
 * Date Created : 2025.07.23
 * Writer : 정민철
 * Description : 마법사 대화상자의 모든 Main Body Division 숨기기
 * Parameter : 없음
 * Return : 없음
 * History : 2025.07.23 최초 작성
 */
function gfshideAllMainBody() {
  $('#div-modal-wizard-gfs-overview').hide();
  $('#div-modal-wizard-gfs-external-storage-sync').hide();
  $('#div-modal-wizard-gfs-disk-configure').hide();
  $('#div-modal-wizard-gfs-ipmi').hide();
  $('#div-modal-wizard-gfs-review').hide();
  $('#div-modal-wizard-gfs-deploy').hide();
  $('#div-modal-wizard-gfs-finish').hide();

  $('#button-next-step-modal-gfs-storage-wizard-config').html('다음');
}

/**
 * Meathod Name : gfsresetCurrentMode
 * Date Created : 2025.07.23
 * Writer : 정민철
 * Description : 마법사 대화상자의 측면 버튼의 '현재 위치'를 모두 리셋
 * Parameter : 없음
 * Return : 없음
 * History : 2025.07.23 최초 작성
 */
function gfsresetCurrentMode() {
  $('#nav-button-gfs-overview').removeClass('pf-m-current');
  $('#nav-button-gfs-external-storage-sync').removeClass('pf-m-current');
  $('#nav-button-gfs-disk-configure').removeClass('pf-m-current');
  $('#nav-button-gfs-ipmi-info').removeClass('pf-m-current');
  $('#nav-button-gfs-review').removeClass('pf-m-current');
  $('#nav-button-gfs-finish').removeClass('pf-m-current');
}

/**
 * Meathod Name : deployGfsStorage
 * Date Created : 2025.07.23
 * Writer : 정민철
 * Description : 가상머신을 배포하는 작업을 화면에 표시하도록 하는 함수
 * Parameter : 없음
 * Return : 없음
 * History : 2025.07.23 최초 작성
 * History : 2025.03.17 기능 구현
 */
function deployGfsStorage() {
  // 하단 버튼 숨김
  $('#button-next-step-modal-gfs-storage-wizard-config').hide();
  $('#button-before-step-modal-gfs-storage-wizard-config').hide();
  $('#button-cancel-config-modal-gfs-storage-wizard-config').hide();

  // 왼쪽 사이드 버튼 전부 비활성화
  $('#nav-button-gfs-overview').addClass('pf-m-disabled');
  $('#nav-button-gfs-external-storage-sync').addClass('pf-m-disabled');
  $('#nav-button-gfs-disk-configure').addClass('pf-m-disabled');
  $('#nav-button-gfs-ipmi-info').addClass('pf-m-disabled');
  $('#nav-button-gfs-review').addClass('pf-m-disabled');

  createLoggerInfo("deployGfsStorage start");

  var iscsi_check = sessionStorage.getItem("iscsi_check");
  //=========== 1. 스토리지센터 가상머신 초기화 작업 ===========
  // 설정 초기화 ( 필요시 python까지 종료 )

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var all_host_name = "";
    var host_names = [];
    for (let i = 0; i < hosts.length ; i++) {
      if (iscsi_check == "true"){
        var hostName = hosts[i].ablecubePn;
      }else{
        var hostName = hosts[i].ablecube;
      }
      all_host_name += (all_host_name ? " " : "") + hostName;
      if (hostName) {
        host_names.push(hostName); // 유효한 이름만 배열에 추가
      }

    }
    var ipmi_port = "623";
    var ipmi_check_value = $('input[name="radio-gfs-ipmi"]:checked').val();

    var externel_storage_sync = $('input[type=radio][name="form-radio-gfs-external-storage-sync"]:checked').val();

    var ipmi_config = ""; // 최종 IPMI 설정 문자열 초기화
    var ipmi_data = []; // IPMI 데이터를 담을 배열
    if (ipmi_check_value === "individual") {
      // 개별 자격 증명 처리
      for (let i = 0; i < hosts.length; i++) {
        // 동적으로 각 IPMI 입력값 가져오기
        let ip = $(`#form-input-individual-credentials-ipmi-ip${i+1}`).val() || '';
        let user = $(`#form-input-individual-credentials-ipmi-user${i+1}`).val() || '';
        let password = $(`#form-input-individual-credentials-ipmi-password${i+1}`).val() || '';

        if (!ip) break; // IP가 없으면 더 이상 처리하지 않음
        ipmi_data.push({ ip, user, password }); // 배열에 추가
      }
    } else {
      // 공통 자격 증명 처리
      for (let i = 0; i < hosts.length; i++) {
        // 동적으로 각 IPMI 입력값 가져오기
        let ip = $(`#form-input-common-credentials-ipmi-ip${i+1}`).val() || '';
        if (!ip) break; // IP가 없으면 더 이상 처리하지 않음

        // 공통 사용자 정보 추가
        let user = $('#form-input-common-credentials-ipmi-user').val();
        let password = $('#form-input-common-credentials-ipmi-password').val();

        ipmi_data.push({ ip, user, password }); // 배열에 추가
      }
    }
    ipmi_data.forEach((entry, index) => {
      ipmi_config += `${index > 0 ? ";" : ""}${entry.ip},${ipmi_port},${entry.user},${entry.password}`;
    });
    var journal_nums = String(hosts.length + 1);

    // 결과 출력 (디스크가 하나든 여러 개든 자동 처리)
    var gfs_cluster_name = "cloudcenter_res";
    var gfs_mount_point = "/mnt/glue-gfs";
    var gfs_name = "glue-gfs";
    var gfs_vg_name = "vg_glue";
    var gfs_lv_name = "lv_glue";
    var ret_json_string = ClusterConfigJsonStringGFS(retVal, iscsi_check);
    var mgmt_ip = retVal.clusterConfig.ccvm.ip;
    //=========== 1. 클러스터 구성 host 네트워크 연결 및 초기화 작업 ===========
    setGfsProgressStep("span-gfs-progress-step1",1);
    var console_log = true;
    createLoggerInfo("deployGfsStorage start");
    var host_ping_test_and_cluster_config_cmd = ['python3', pluginpath + '/python/cluster/cluster_config.py', 'check', '-js', ret_json_string, '-cmi', mgmt_ip, '-pcl', all_host_name];
    if(console_log){console.log(host_ping_test_and_cluster_config_cmd);}
    cockpit.spawn(host_ping_test_and_cluster_config_cmd)
      .then(function(data){
        //결과 값 json으로 return
        var ping_test_result = JSON.parse(data);
        if(ping_test_result.code=="200") { //정상
          if(externel_storage_sync == "duplication" || externel_storage_sync == "skip"){
              // 체크된 디스크 이름들을 동적으로 가져옴
              var general_virtual_disk_name = $('input[type=checkbox][name="form-gfs-storage-checkbox-disk"]:checked')
              .map(function () {
                return $(this).data('disk_id'); // 체크된 값 가져오기
              })
              .get() // jQuery 객체를 배열로 변환
              .join(','); // 쉼표로 연결
              setGfsProgressStep("span-gfs-progress-step1",2);
              setGfsProgressStep("span-gfs-progress-step2",1);
              var reset_cloud_center_cmd = ['python3', pluginpath + '/python/vm/reset_cloud_center.py'];
              if(console_log){console.log(reset_cloud_center_cmd);}
              cockpit.spawn(reset_cloud_center_cmd)
                .then(function(data){
                  //결과 값 json으로 return
                  var reset_cloud_center_result = JSON.parse(data);
                  if(reset_cloud_center_result.code=="200") { //정상
                    setGfsProgressStep("span-gfs-progress-step2",2);
                    setGfsProgressStep("span-gfs-progress-step3",1);
                    //=========== 2. GFS 구성 설정 및 Pcs 설정 ===========
                    // 설정 초기화 ( 필요시 python까지 종료 )
                    var set_lvm_conf_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--modify-lvm-conf', '--list-ip', all_host_name];
                    console.log(set_lvm_conf_cmd);
                    cockpit.spawn(set_lvm_conf_cmd)
                    .then(function(data){
                      var set_lvm_conf_result = JSON.parse(data);
                      console.log(set_lvm_conf_result);
                      if (set_lvm_conf_result.code == "200"){
                        var set_password_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--set-password', 'password', '--list-ip', all_host_name];
                        console.log(set_password_cmd);
                        cockpit.spawn(set_password_cmd)
                        .then(function(data){
                          var set_password_result = JSON.parse(data);
                          console.log(set_password_result)
                          if (set_password_result.code == "200"){
                            var auth_hosts_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--auth-hosts', 'password', '--list-ip', all_host_name];
                            console.log(auth_hosts_cmd);
                            cockpit.spawn(auth_hosts_cmd)
                            .then(function(data){
                              var auth_hosts_result = JSON.parse(data);
                              console.log(auth_hosts_result)
                              if (auth_hosts_result.code == "200"){
                                var setup_cluster_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--setup-cluster', gfs_cluster_name, '--list-ip', all_host_name];
                                console.log(setup_cluster_cmd);
                                cockpit.spawn(setup_cluster_cmd)
                                .then(function(data){
                                  var setup_cluster_result = JSON.parse(data);
                                  console.log(setup_cluster_result)
                                  if (setup_cluster_result.code == "200"){
                                    var set_configure_stonith_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--configure-stonith',
                                                      ipmi_config, '--list-ip', all_host_name];
                                    console.log(set_configure_stonith_cmd);
                                    cockpit.spawn(set_configure_stonith_cmd)
                                    .then(function(data){
                                      var set_configure_stonith_result = JSON.parse(data);
                                      console.log(set_configure_stonith_result);
                                      if (set_configure_stonith_result.code == "200"){
                                        var set_alert_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--set-alert', '--list-ip', all_host_name];
                                        console.log(set_alert_cmd);
                                        cockpit.spawn(set_alert_cmd)
                                        .then(function(data){
                                          var set_alert_result = JSON.parse(data);
                                          console.log(set_alert_result);
                                          if(set_alert_result.code == "200"){
                                            setGfsProgressStep("span-gfs-progress-step3",4);
                                            var create_gfs_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--create-gfs',
                                                        '--disks', general_virtual_disk_name , '--vg-name', gfs_vg_name, '--lv-name', gfs_lv_name,
                                                        '--gfs-name', gfs_name, '--mount-point', gfs_mount_point, '--cluster-name', gfs_cluster_name,
                                                        '--journal-nums', journal_nums, '--list-ip', all_host_name]
                                            console.log(create_gfs_cmd);
                                            cockpit.spawn(create_gfs_cmd)
                                            .then(function(data){
                                              var create_gfs_result = JSON.parse(data);
                                              console.log(create_gfs_result);
                                              if (create_gfs_result.code == "200"){
                                                var gfs_boostrap_cmd = ['python3', pluginpath + '/python/ablestack_json/ablestackJson.py','update', '--depth1', 'bootstrap', '--depth2', 'gfs_configure', '--value', 'true', '--all-hosts']
                                                console.log(gfs_boostrap_cmd);
                                                cockpit.spawn(gfs_boostrap_cmd)
                                                .then(function(data){
                                                  var gfs_bootstrap_result = JSON.parse(data);
                                                  if (gfs_bootstrap_result.code == "200"){
                                                    createLoggerInfo("deployGfsStorage success");
                                                    setGfsProgressStep("span-gfs-progress-step3",2);
                                                    //최종 화면 호출
                                                    showDivisionGFSConfigFinish();
                                                  }else{
                                                    setGfsProgressFail(3);
                                                    createLoggerInfo("GFS configuration succeeded, but gfs_configure synchronization failed");
                                                    alert("GFS 구성은 완료되었으나 일부 호스트의 구성 상태 동기화에 실패했습니다.");
                                                  }
                                                }).catch(function(data){
                                                  setGfsProgressFail(3);
                                                  createLoggerInfo("GFS configuration succeeded, but gfs_configure synchronization command failed");
                                                  alert("GFS 구성은 완료되었으나 구성 상태 동기화 명령 실행에 실패했습니다 : "+data);
                                                })
                                              }else{
                                                setGfsProgressFail(3);
                                                createLoggerInfo(create_gfs_result.val);
                                                alert(create_gfs_result.val);
                                              }
                                            }).catch(function(data){
                                              setGfsProgressFail(3);
                                              createLoggerInfo("GFS configuration settings and Pcs task Pcs resource settings failed");
                                              alert("GFS 구성 설정 및 Pcs 작업 7. Pcs 리소스 설정 실패 : "+data);
                                            });
                                          }else{
                                            setGfsProgressFail(3);
                                            createLoggerInfo(set_alert_result.val);
                                            alert(set_alert_result.val);
                                          }
                                        }).catch(function(data){
                                          setGfsProgressFail(3);
                                          createLoggerInfo("GFS configuration setup and Pcs Alert setup failed");
                                          alert("GFS 구성 설정 및 Pcs 작업 6. PCS 알림 설정 실패 : "+data);
                                        });

                                      }else{
                                        setGfsProgressFail(3);
                                        createLoggerInfo(set_configure_stonith_result.val);
                                        alert(set_configure_stonith_result.val);
                                      }
                                    }).catch(function(data){
                                      setGfsProgressFail(3);
                                      createLoggerInfo("Failed to set GFS configuration and Pcs task IPMI information");
                                      alert("GFS 구성 설정 및 Pcs 작업 5. IPMI 정보 설정 실패 : "+data);
                                    })
                                  }else{
                                    setGfsProgressFail(3);
                                    createLoggerInfo(setup_cluster_result.val);
                                    alert(setup_cluster_result.val);
                                  }
                                }).catch(function(data){
                                  setGfsProgressFail(3);
                                  createLoggerInfo("GFS configuration setup and Pcs task cluster setup failed");
                                  alert("GFS 구성 설정 및 Pcs 작업 4. 클러스터 설정 실패 : "+data);
                                });
                              }else{
                                setGfsProgressFail(3);
                                createLoggerInfo(auth_hosts_result.val);
                                alert(auth_hosts_result.val);
                              }
                            }).catch(function(data){
                              setGfsProgressFail(3);
                              createLoggerInfo("Failed to set GFS configuration and Pcs task host authentication settings");
                              alert("GFS 구성 설정 및 Pcs 작업 3. 호스트 인증 설정 실패 : "+data);
                            });
                          }else{
                            setGfsProgressFail(3);
                            createLoggerInfo(set_password_result.val);
                            alert(set_password_result.val);
                          }
                        }).catch(function(data){
                          setGfsProgressFail(3);
                          createLoggerInfo("Failed to set GFS configuration and Pcs task password");
                          alert("GFS 구성 설정 및 Pcs 작업 2. 패스워드 설정 실패 : "+data);
                        });
                      }else{
                        setGfsProgressFail(3);
                        createLoggerInfo(set_lvm_conf_result.val);
                        alert(set_lvm_conf_result.val);
                      }
                    }).catch(function(data){
                      setGfsProgressFail(3);
                      createLoggerInfo("Failed to set LVM CONF file during GFS configuration setup and Pcs operation");
                      alert("GFS 구성 설정 및 Pcs 작업 1. LVM CONF 파일 설정 실패 : "+data);
                    });
                  } else {
                    setGfsProgressFail(2);
                    createLoggerInfo(reset_cloud_center_result.val);
                    alert(reset_cloud_center_result.val);
                  }
                })
                .catch(function(data){
                  setGfsProgressFail(2);
                  createLoggerInfo("Failed to initialize cluster configuration settings");
                  alert("클러스터 구성 설정 초기화 작업 실패 : "+data);
                });
          }else{
            // 체크된 디스크 이름들을 동적으로 가져옴
            var general_virtual_disk_name = $('input[type=checkbox][name="form-gfs-storage-checkbox-disk"]:checked')
            .map(function () {
              return $(this).val(); // 체크된 값 가져오기
            })
            .get() // jQuery 객체를 배열로 변환
            .join(','); // 쉼표로 연결

            setGfsProgressStep("span-gfs-progress-step1",2);
            setGfsProgressStep("span-gfs-progress-step2",1);
            var reset_cloud_center_cmd = ['python3', pluginpath + '/python/vm/reset_cloud_center.py'];
            if(console_log){console.log(reset_cloud_center_cmd);}
            cockpit.spawn(reset_cloud_center_cmd)
              .then(function(data){
                //결과 값 json으로 return
                var reset_cloud_center_result = JSON.parse(data);
                if(reset_cloud_center_result.code=="200") { //정상
                  setGfsProgressStep("span-gfs-progress-step2",2);
                  setGfsProgressStep("span-gfs-progress-step3",1);
                  //=========== 2. GFS 구성 설정 및 Pcs 설정 ===========
                  // 설정 초기화 ( 필요시 python까지 종료 )
                  var set_lvm_conf_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--modify-lvm-conf', '--list-ip', all_host_name];
                  console.log(set_lvm_conf_cmd);
                  cockpit.spawn(set_lvm_conf_cmd)
                  .then(function(data){
                    var set_lvm_conf_result = JSON.parse(data);
                    console.log(set_lvm_conf_result);
                    if (set_lvm_conf_result.code == "200"){
                      var set_password_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--set-password', 'password', '--list-ip', all_host_name];
                      console.log(set_password_cmd);
                      cockpit.spawn(set_password_cmd)
                      .then(function(data){
                        var set_password_result = JSON.parse(data);
                        console.log(set_password_result)
                        if (set_password_result.code == "200"){
                          var auth_hosts_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--auth-hosts', 'password', '--list-ip', all_host_name];
                          console.log(auth_hosts_cmd);
                          cockpit.spawn(auth_hosts_cmd)
                          .then(function(data){
                            var auth_hosts_result = JSON.parse(data);
                            console.log(auth_hosts_result)
                            if (auth_hosts_result.code == "200"){
                              var setup_cluster_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--setup-cluster', gfs_cluster_name, '--list-ip', all_host_name];
                              console.log(setup_cluster_cmd);
                              cockpit.spawn(setup_cluster_cmd)
                              .then(function(data){
                                var setup_cluster_result = JSON.parse(data);
                                console.log(setup_cluster_result)
                                if (setup_cluster_result.code == "200"){
                                  var set_configure_stonith_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--configure-stonith',
                                                    ipmi_config, '--list-ip', all_host_name];
                                  console.log(set_configure_stonith_cmd);
                                  cockpit.spawn(set_configure_stonith_cmd)
                                  .then(function(data){
                                    var set_configure_stonith_result = JSON.parse(data);
                                    console.log(set_configure_stonith_result);
                                    if (set_configure_stonith_result.code == "200"){
                                      var set_alert_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--set-alert', '--list-ip', all_host_name];
                                      console.log(set_alert_cmd);
                                      cockpit.spawn(set_alert_cmd)
                                      .then(function(data){
                                        var set_alert_result = JSON.parse(data);
                                        console.log(set_alert_result);
                                        if(set_alert_result.code == "200"){
                                          setGfsProgressStep("span-gfs-progress-step3",4);
                                          var create_gfs_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--create-gfs',
                                                      '--disks', general_virtual_disk_name , '--vg-name', gfs_vg_name, '--lv-name', gfs_lv_name,
                                                      '--gfs-name', gfs_name, '--mount-point', gfs_mount_point, '--cluster-name', gfs_cluster_name,
                                                      '--journal-nums', journal_nums, '--list-ip', all_host_name]
                                          console.log(create_gfs_cmd);
                                          cockpit.spawn(create_gfs_cmd)
                                          .then(function(data){
                                            var create_gfs_result = JSON.parse(data);
                                            console.log(create_gfs_result);
                                            if (create_gfs_result.code == "200"){
                                              var gfs_boostrap_cmd = ['python3', pluginpath + '/python/ablestack_json/ablestackJson.py','update', '--depth1', 'bootstrap', '--depth2', 'gfs_configure', '--value', 'true', '--all-hosts']
                                              console.log(gfs_boostrap_cmd);
                                              cockpit.spawn(gfs_boostrap_cmd)
                                              .then(function(data){
                                                var gfs_bootstrap_result = JSON.parse(data);
                                                if (gfs_bootstrap_result.code == "200"){
                                                  createLoggerInfo("deployGfsStorage success");
                                                  setGfsProgressStep("span-gfs-progress-step3",2);
                                                  //최종 화면 호출
                                                  showDivisionGFSConfigFinish();
                                                }else{
                                                  setGfsProgressFail(3);
                                                  createLoggerInfo("GFS configuration succeeded, but gfs_configure synchronization failed");
                                                  alert("GFS 구성은 완료되었으나 일부 호스트의 구성 상태 동기화에 실패했습니다.");
                                                }
                                              }).catch(function(data){
                                                setGfsProgressFail(3);
                                                createLoggerInfo("GFS configuration succeeded, but gfs_configure synchronization command failed");
                                                alert("GFS 구성은 완료되었으나 구성 상태 동기화 명령 실행에 실패했습니다 : "+data);
                                              })
                                            }else{
                                              setGfsProgressFail(3);
                                              createLoggerInfo(create_gfs_result.val);
                                              alert(create_gfs_result.val);
                                            }
                                          }).catch(function(data){
                                            setGfsProgressFail(3);
                                            createLoggerInfo("GFS configuration settings and Pcs task Pcs resource settings failed");
                                            alert("GFS 구성 설정 및 Pcs 작업 7. Pcs 리소스 설정 실패 : "+data);
                                          });
                                        }else{
                                          setGfsProgressFail(3);
                                          createLoggerInfo(set_alert_result.val);
                                          alert(set_alert_result.val);
                                        }
                                      }).catch(function(data){
                                        setGfsProgressFail(3);
                                        createLoggerInfo("GFS configuration setup and Pcs Alert setup failed");
                                        alert("GFS 구성 설정 및 Pcs 작업 6. PCS 알림 설정 실패 : "+data);
                                      });

                                    }else{
                                      setGfsProgressFail(3);
                                      createLoggerInfo(set_configure_stonith_result.val);
                                      alert(set_configure_stonith_result.val);
                                    }
                                  }).catch(function(data){
                                    setGfsProgressFail(3);
                                    createLoggerInfo("Failed to set GFS configuration and Pcs task IPMI information");
                                    alert("GFS 구성 설정 및 Pcs 작업 5. IPMI 정보 설정 실패 : "+data);
                                  })
                                }else{
                                  setGfsProgressFail(3);
                                  createLoggerInfo(setup_cluster_result.val);
                                  alert(setup_cluster_result.val);
                                }
                              }).catch(function(data){
                                setGfsProgressFail(3);
                                createLoggerInfo("GFS configuration setup and Pcs task cluster setup failed");
                                alert("GFS 구성 설정 및 Pcs 작업 4. 클러스터 설정 실패 : "+data);
                              });
                            }else{
                              setGfsProgressFail(3);
                              createLoggerInfo(auth_hosts_result.val);
                              alert(auth_hosts_result.val);
                            }
                          }).catch(function(data){
                            setGfsProgressFail(3);
                            createLoggerInfo("Failed to set GFS configuration and Pcs task host authentication settings");
                            alert("GFS 구성 설정 및 Pcs 작업 3. 호스트 인증 설정 실패 : "+data);
                          });
                        }else{
                          setGfsProgressFail(3);
                          createLoggerInfo(set_password_result.val);
                          alert(set_password_result.val);
                        }
                      }).catch(function(data){
                        setGfsProgressFail(3);
                        createLoggerInfo("Failed to set GFS configuration and Pcs task password");
                        alert("GFS 구성 설정 및 Pcs 작업 2. 패스워드 설정 실패 : "+data);
                      });
                    }else{
                      setGfsProgressFail(3);
                      createLoggerInfo(set_lvm_conf_result.val);
                      alert(set_lvm_conf_result.val);
                    }
                  }).catch(function(data){
                    setGfsProgressFail(3);
                    createLoggerInfo("Failed to set LVM CONF file during GFS configuration setup and Pcs operation");
                    alert("GFS 구성 설정 및 Pcs 작업 1. LVM CONF 파일 설정 실패 : "+data);
                  });
                } else {
                  setGfsProgressFail(2);
                  createLoggerInfo(reset_cloud_center_result.val);
                  alert(reset_cloud_center_result.val);
                }
              })
              .catch(function(data){
                setGfsProgressFail(2);
                createLoggerInfo("Failed to initialize cluster configuration settings");
                alert("클러스터 구성 설정 초기화 작업 실패 : "+data);
              });
          }

        } else {
          setGfsProgressFail(1);
          createLoggerInfo(ping_test_result.val);
          alert(ping_test_result.val);
        }
      })
      .catch(function(data){
        setGfsProgressFail(1);
        createLoggerInfo("Failed to check connection status of host to configure cluster");
        alert("클러스터 구성할 host 연결 상태 확인 및 cluster.json config 실패 : "+data);
      });
  });

}
$('[name="radio-gfs-ipmi"]').on('change', function () {
  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    updateIPMIcredentials(hosts.length,$('input[name="radio-gfs-ipmi"]:checked').val())
  })
});
/**
 * Meathod Name : showDivisionGFSConfigFinish
 * Date Created : 2025.07.23
 * Writer : 정민철
 * Description : 가상머신을 배포한 후 마지막 페이지를 보여주는 함수
 * Parameter : 없음
 * Return : 없음
 * History : 2025.07.23 최초 작성
 */
function showDivisionGFSConfigFinish() {
  gfshideAllMainBody();
  gfsresetCurrentMode();

  $('#div-modal-wizard-gfs-finish').show();
  $('#nav-button-gfs-finish').addClass('pf-m-current');
  $('#nav-button-gfs-finish').removeClass('pf-m-disabled');

  $('#button-next-step-modal-gfs-storage-wizard-config').text("완료");

  $('#button-next-step-modal-gfs-storage-wizard-config').hide();
  $('#button-before-step-modal-gfs-storage-wizard-config').hide();
  $('#button-cancel-config-modal-gfs-storage-wizard-config').hide();

  completed = true;

  cur_step_wizard_gfs_config = "7";
}

/**
 * Meathod Name : validateIpmiCredentials
 * Date Created : 2024.11.26
 * Writer : 정민철
 * Description : 입력된 값이 없는지 체크하여 값이 있을 경우 true return, 없을 경우 false 리턴
 * Parameter : int, String
 * Return : bool
 * History : 2024.11.26 최초 작성
 */
function validateIpmiCredentials(index, type) {
  let prefix = type === "individual" ? `form-input-individual-credentials-ipmi` : `form-input-common-credentials-ipmi`;
  let ip = $(`#${prefix}-ip${index}`).val() || '';
  let user = type === "individual" ? $(`#${prefix}-user${index}`).val() || '' : $('#form-input-common-credentials-ipmi-user').val();
  let password = type === "individual" ? $(`#${prefix}-password${index}`).val() || '' : $('#form-input-common-credentials-ipmi-password').val();

  if (!ip) {
    alert(`${index}번 호스트 IPMI IP를 입력해주세요.`);
    return false;
  }
  if (!checkIp(ip)) {
    alert(`${index}번 호스트 IPMI IP 형식을 확인해주세요.`);
    return false;
  }
  if (!user) {
    alert(`${index}번 호스트 IPMI 아이디를 입력해주세요.`);
    return false;
  }
  if (!password) {
    alert(`${index}번 호스트 IPMI 비밀번호를 입력해주세요.`);
    return false;
  }

  return true;
}

/**
 * Meathod Name : setGfsReviewInfo
 * Date Created : 2025.07.17
 * Writer : 정민철
 * Description : 설정확인을 위한 정보를 세팅하는 기능
 * Parameter : 없음
 * Return : 없음
 * History : 2025.07.17 최초 작성
 */
function setGfsReviewInfo(){

  var externel_storage_sync = $('input[type=radio][name="form-radio-gfs-external-storage-sync"]:checked').next('label').text();
  var externel_storage_sync_value = $('input[type=radio][name="form-radio-gfs-external-storage-sync"]:checked').val();
  if (externel_storage_sync_value == "duplication" || externel_storage_sync_value == "skip"){
    var gfs_disk = $('input[type=checkbox][name="form-gfs-storage-checkbox-disk"]:checked')
    .map(function () {
      return $(this).data("data-id"); // 체크된 값 가져오기
    })
    .get() // jQuery 객체를 배열로 변환
    .join(', '); // 쉼표로 연결
  }else{
    var gfs_disk = $('input[type=checkbox][name="form-gfs-storage-checkbox-disk"]:checked')
    .map(function () {
      return $(this).val(); // 체크된 값 가져오기
    })
    .get() // jQuery 객체를 배열로 변환
    .join(', '); // 쉼표로 연결
  }

  var ipmi_check_val = $('input[name="radio-gfs-ipmi"]:checked').val();

  $('#span-gfs-externel-storage-sync').text(externel_storage_sync);
  $('#span-gfs-disk').text(gfs_disk);

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    gfscreateAccordion("ipmi",hosts.length, ipmi_check_val);
  });
}

/**
 * Meathod Name : validateGfsStorage
 * Date Created : 2025.07.23
 * Writer : 정민철
 * Description : 스토리지 센터 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return : 없음
 * History : 2025.07.23 최초 작성
 */
function validateGfsStorage() {
  return cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var validate_check = true;
    var externel_storage_sync = $('input[type=radio][name=form-radio-gfs-external-storage-sync]:checked').val();
    var gfs_disk = $('input[type=checkbox][name="form-gfs-storage-checkbox-disk"]:checked').val();
    var ipmi_check_value = $('input[name="radio-gfs-ipmi"]:checked').val();

    if (ipmi_check_value === "individual") {
      for (let i = 1; i <= hosts.length; i++) {
        if (!validateIpmiCredentials(i, "individual")) {
          validate_check = false;
          break;
        }
      }
    } else if (ipmi_check_value === "common") {
      for (let i = 1; i <= hosts.length; i++) {
        if (!validateIpmiCredentials(i, "common")) {
          validate_check = false;
          break;
        }
      }
    } else if (externel_storage_sync == ""){
      validate_check = false;
      alert("외부 스토리지 동기화 여부를 선택해주세요.");
    } else if (gfs_disk == "") {
      validate_check = false;
      alert("GFS 디스크를 선택해주세요.");
    }

    return validate_check;
  });
}

/**
 * Meathod Name : setGfsProgressFail
 * Date Created : 2025.07.23
 * Writer : 정민철
 * Description : GFS 스토리지 구성 진행중 실패 단계에 따른 중단됨 UI 처리
 * Parameter : setp_num
 * Return : 없음
 * History : 2025.07.23 최초 작성
 */
 function setGfsProgressFail(setp_num){
  if( setp_num == 1 || setp_num == '1' ){  // 1단계 이하 단계 전부 중단된 처리
    seScvmProgressStep("span-gfs-progress-step1",3);
    seScvmProgressStep("span-gfs-progress-step2",3);
    seScvmProgressStep("span-gfs-progress-step3",3);
    seScvmProgressStep("span-gfs-progress-step4",3);
  } else if(setp_num == 2 || setp_num == '2') {  // 2단계 이하 단계 전부 중단된 처리
    seScvmProgressStep("span-gfs-progress-step2",3);
    seScvmProgressStep("span-gfs-progress-step3",3);
    seScvmProgressStep("span-gfs-progress-step4",3);
  } else if(setp_num == 3 || setp_num == '3') {  // 3단계 이하 단계 전부 중단된 처리
    seScvmProgressStep("span-gfs-progress-step3",3);
  }
}
/**
 * Meathod Name : gfscreateAccordion
 * Date Created : 2024.12.19
 * Writer : 정민철
 * Description : 호스트 수에 따른 IPMI 자격 증명, 페일오버 클러스터 등 동적 화면(설정 확인)
 * Parameter : 없음
 * Return : 없음
 * History : 2024.12.19 최초 작성
 */
function gfscreateAccordion(type, hostCount, ipmiCheckVal) {
  // Get the existing container by ID
  let accordionContainer;
  let expandedContentId;
  let toggleText_name;
  let toggleButton_name;

  if (type == "ipmi") {
    accordionContainer = document.getElementById("div-accordion-gfs-ipmi");
    toggleText_name = "IPMI 정보";
    expandedContentId = "div-accordion-gfs-expaned-ipmi";
    toggleButton_name = "button-accordion-gfs-ipmi";
  }

  // Clear existing content to avoid duplication
  accordionContainer.innerHTML = "";

  const accordionItem = document.createElement("div");
  accordionItem.className = "pf-v6-c-accordion__item";

  // Create toggle button
  const toggleButton = document.createElement("button");
  toggleButton.className = "pf-v6-c-accordion__toggle";
  toggleButton.setAttribute("type", "button");
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.id = toggleButton_name;

  const toggleText = document.createElement("span");
  toggleText.className = "pf-v6-c-accordion__toggle-text";
  toggleText.innerText = toggleText_name;

  const toggleIcon = document.createElement("span");
  toggleIcon.className = "pf-v6-c-accordion__toggle-icon";
  toggleIcon.innerHTML = '<i class="fas fa-angle-right" aria-hidden="true"></i>';

  toggleButton.appendChild(toggleText);
  toggleButton.appendChild(toggleIcon);

  // Append toggle button
  const heading = document.createElement("h3");
  heading.appendChild(toggleButton);
  accordionItem.appendChild(heading);

  // Create expanded content
  const expandedContent = document.createElement("div");
  expandedContent.className = "pf-v6-c-accordion__expandable-content";
  expandedContent.id = expandedContentId;
  expandedContent.setAttribute("hidden", ""); // 기본적으로 닫힌 상태

  const expandedBody = document.createElement("div");
  expandedBody.className = "pf-v6-c-accordion__expandable-content-body";

  const descriptionList = document.createElement("dl");
  descriptionList.className = "pf-v6-c-description-list pf-m-horizontal";
  descriptionList.style = "--pf-v6-c-description-list--RowGap: 10px; margin-left: 10px;";

  // Add 'IPMI 구성 준비' group
  if (type == "ipmi"){
    descriptionList.appendChild(gfscreateDescriptionGroup("IPMI 구성 준비", ""));

    // Add host-specific IPMI groups
    for (let i = 1; i <= hostCount; i++) {
      const hostGroup = gfscreateDescriptionGroup(
        `${i}번 호스트`,
        `
        IPMI IP: <span id="span-gfs-ipmi-ip${i}"></span><br/>
        <span id="span-gfs-ipmi-user${i}"></span>
        <span id="span-gfs-ipmi-password${i}"></span>
        `
      );
      descriptionList.appendChild(hostGroup);
    }

    // Add '모든 호스트 자격 증명' group
    const commonGroup = gfscreateDescriptionGroup(
      "모든 호스트 자격 증명",
      `
      IPMI 아이디: <span id="span-gfs-ipmi-user"></span><br/>
      IPMI 비밀번호: <span id="span-gfs-ipmi-password"></span>
      `
    );
    commonGroup.id = "accordion-common-ipmi";
    commonGroup.style.display = "none";
    descriptionList.appendChild(commonGroup);
  }

  expandedBody.appendChild(descriptionList);
  expandedContent.appendChild(expandedBody);
  accordionItem.appendChild(expandedContent);
  accordionContainer.appendChild(accordionItem);

  // Update spans with IPMI values
  gfsupdateSpans(type, hostCount, ipmiCheckVal);
}

function gfscreateDescriptionGroup(title, contentHtml) {
  const group = document.createElement("div");
  group.className = "pf-v6-c-description-list__group";

  const term = document.createElement("dt");
  term.className = "pf-v6-c-description-list__term";
  term.innerHTML = `<span class="pf-v6-c-description-list__text">${title}</span>`;

  const description = document.createElement("dd");
  description.className = "pf-v6-c-description-list__description";

  const textContainer = document.createElement("div");
  textContainer.className = "pf-v6-c-description-list__text";
  textContainer.innerHTML = contentHtml;

  description.appendChild(textContainer);
  group.appendChild(term);
  group.appendChild(description);

  return group;
}

function gfsupdateSpans(type, hostCount, ipmiCheckVal) {
  if (type == "ipmi"){
    if (ipmiCheckVal === "individual") {
      $('#accordion-common-ipmi').hide();
      for (let i = 1; i <= hostCount; i++) {
        $(`#span-gfs-ipmi-ip${i}`).text($(`#form-input-individual-credentials-ipmi-ip${i}`).val());
        $(`#span-gfs-ipmi-user${i}`).html("IPMI 아이디: " + $(`#form-input-individual-credentials-ipmi-user${i}`).val() + "<br/>");
        $(`#span-gfs-ipmi-password${i}`).text("IPMI 비밀번호: " + $(`#form-input-individual-credentials-ipmi-password${i}`).val());
      }
    } else {
      $('#accordion-common-ipmi').show();
      for (let i = 1; i <= hostCount; i++) {
        $(`#span-gfs-ipmi-ip${i}`).text($(`#form-input-common-credentials-ipmi-ip${i}`).val());
      }
      $('#span-gfs-ipmi-user').text($('#form-input-common-credentials-ipmi-user').val());
      $('#span-gfs-ipmi-password').text($('#form-input-common-credentials-ipmi-password').val());
    }
  }

}

/**
 * Meathod Name : updateIPMIcredentials
 * Date Created : 2024.11.14
 * Writer : 정민철
 * Description : 호스트 수에 따른 IPMI 자격 증명 동적 화면
 * Parameter : 없음
 * Return : 없음
 * History : 2024.11.14 최초 작성
 */
function updateIPMIcredentials(count,credentials_type) {
  const hostCount = count;
  const credentials = document.getElementById("div-ipmi-credentials");
  credentials.innerHTML = "";
  if (credentials_type == "individual"){
    for (let i = 1; i <= hostCount; i++) {
      const individual_HTML = `
            <div class="pf-v6-c-form__field-group">
              <div class="pf-v6-c-form__field-group-header" style="padding-bottom:8px;">
                <div class="pf-v6-c-form__field-group-header-main">
                  <div class="pf-v6-c-form__field-group-header-title">
                    <div class="pf-v6-c-form__field-group-header-title-text" style="padding-top: 15px;">${i}번 호스트 정보</div>
                  </div>
                </div>
              </div>
              <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
                <div class="pf-v6-c-form__group" style="padding:0px;">
                  <div class="pf-v6-c-form__group-label">
                    <label class="pf-v6-c-form__label" for="form-input-individual-credentials-ipmi-ip${i}">
                      <span class="pf-v6-c-form__label-text">IPMI IP</span>
                      <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
                    </label>
                  </div>
                  <div class="pf-v6-c-form__group-control">
                    <input class="pf-v6-c-form-control" style="width:70%" type="text" id="form-input-individual-credentials-ipmi-ip${i}" name="form-input-individual-credentials-ipmi-ip${i}" placeholder="xxx.xxx.xxx.xxx 형식으로 입력" required/>
                  </div>
                </div>
              </div>
              <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
                <div class="pf-v6-c-form__group" style="padding:0px;">
                  <div class="pf-v6-c-form__group-label">
                    <label class="pf-v6-c-form__label" for="form-input-individual-credentials-ipmi-user${i}">
                      <span class="pf-v6-c-form__label-text">IPMI 아이디</span>
                      <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
                    </label>
                  </div>
                  <div class="pf-v6-c-form__group-control">
                    <input class="pf-v6-c-form-control" style="width:70%" type="text" id="form-input-individual-credentials-ipmi-user${i}" name="form-input-individual-credentials-ipmi-user${i}" placeholder="아이디를 입력하세요." required />
                  </div>
                </div>
              </div>
              <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
                <div class="pf-v6-c-form__group" style="padding:0px;">
                  <div class="pf-v6-c-form__group-label">
                    <label class="pf-v6-c-form__label" for="form-input-individual-credentials-ipmi-password${i}">
                      <span class="pf-v6-c-form__label-text">IPMI 비밀번호</span>
                      <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
                    </label>
                  </div>
                  <div class="pf-v6-c-form__group-control">
                    <input class="pf-v6-c-form-control" style="width:70%" type="password" autocomplete="off" id="form-input-individual-credentials-ipmi-password${i}" name="form-input-individual-credentials-ipmi-password1-check${i}" placeholder="비밀번호를 입력하세요." required />
                  </div>
                </div>
              </div>
            </div>
            `;
            credentials.insertAdjacentHTML('beforeend',individual_HTML);
    }
  }else{
    for (let i = 1; i <= hostCount; i++) {
      const common_HTML = `
          <div class="pf-v6-c-form__field-group">
            <div class="pf-v6-c-form__field-group-header" style="padding-bottom:8px;">
              <div class="pf-v6-c-form__field-group-header-main">
                <div class="pf-v6-c-form__field-group-header-title">
                  <div class="pf-v6-c-form__field-group-header-title-text" style="padding-top: 15px;">${i}번 호스트 정보</div>
                </div>
              </div>
            </div>
            <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
              <div class="pf-v6-c-form__group" style="padding:0px;">
                <div class="pf-v6-c-form__group-label">
                  <label class="pf-v6-c-form__label" for="form-input-common-credentials-ipmi-ip${i}">
                    <span class="pf-v6-c-form__label-text">IPMI IP</span>
                    <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
                  </label>
                </div>
                <div class="pf-v6-c-form__group-control">
                  <input class="pf-v6-c-form-control" style="width:70%" type="text" id="form-input-common-credentials-ipmi-ip${i}" name="form-input-common-credentials-ipmi-ip${i}" placeholder="xxx.xxx.xxx.xxx 형식으로 입력" required />
                </div>
              </div>
            </div>
          </div>
      `;

      credentials.insertAdjacentHTML('beforeend',common_HTML);
    }
    const common_credentials_HTML= `
      <div class="pf-v6-c-form__field-group">
        <div class="pf-v6-c-form__field-group-header" style="padding-bottom:8px;">
          <div class="pf-v6-c-form__field-group-header-main">
            <div class="pf-v6-c-form__field-group-header-title">
              <div class="pf-v6-c-form__field-group-header-title-text" style="margin-top: 20px;">모든 호스트 자격 증명</div>
            </div>
          </div>
        </div>
        <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
          <div class="pf-v6-c-form__group" style="padding:0px;">
            <div class="pf-v6-c-form__group-label">
              <label class="pf-v6-c-form__label" for="form-input-common-credentials-ipmi-user">
                <span class="pf-v6-c-form__label-text">IPMI 아이디</span>
                <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
              </label>
            </div>
            <div class="pf-v6-c-form__group-control">
              <input class="pf-v6-c-form-control" style="width:70%" type="text" id="form-input-common-credentials-ipmi-user" name="form-input-common-credentials-ipmi-user" placeholder="아이디를 입력하세요." required />
            </div>
          </div>
        </div>
        <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
          <div class="pf-v6-c-form__group" style="padding:0px;">
            <div class="pf-v6-c-form__group-label">
              <label class="pf-v6-c-form__label" for="form-input-common-credentials-ipmi-password">
                <span class="pf-v6-c-form__label-text">IPMI 비밀번호</span>
                <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
              </label>
            </div>
            <div class="pf-v6-c-form__group-control">
              <input class="pf-v6-c-form-control" style="width:70%" type="password" autocomplete="off" id="form-input-common-credentials-ipmi-password" name="form-input-common-credentials-ipmi-password-check" placeholder="비밀번호를 입력하세요." required />
            </div>
          </div>
        </div>
      </div>
  `;

  credentials.insertAdjacentHTML('beforeend',common_credentials_HTML);

  }

}
function setGfsDiskInfo(){
  var cmd = ["python3", pluginpath + "/python/disk/disk_action.py", "gfs-list"];

  createLoggerInfo("setDiskInfo() start");

  cockpit.spawn(cmd).then(function(data) {
    // 초기화
    $('#disk-gfs-storage-pci-list').empty();

    var el = '';
    var multipathElements = ''; // MultiPath 정보를 저장할 변수
    var result = JSON.parse(data);
    var pci_list = result.val.blockdevices;

    // MultiPath 중복 제거용 세트
    var displayedMultipaths = new Set();
    var displayedName = new Set();

    if (pci_list.length > 0) {
      for (var i = 0; i < pci_list.length; i++) {
        var partition_text = '';
        var check_disable = '';

        if (pci_list[i].children != undefined) {
          for (var j = 0; j < pci_list[i].children.length; j++) {
            if (!pci_list[i].wwn) {
              pci_list[i].wwn = ""; // 값을 공백으로 설정
            }
            var mpathName = pci_list[i].children[j].name;
            if (pci_list[i].children[j].name.includes('mpath')) {
              if (pci_list[i].children[j].children != undefined) {
                partition_text = '( Partition exists count : ' + pci_list[i].children[j].children.length + ' )';
                check_disable = 'disabled';
              }
              // MultiPath가 이미 표시된 경우 스킵
              if (!displayedMultipaths.has(mpathName)) {
                var mpathHtml = '';
                mpathHtml += '<div class="pf-v6-c-check">';
                mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-storage-checkbox-disk' + i + '" name="form-gfs-storage-checkbox-disk" value="' + pci_list[i].children[j].path + '" '+ 'data-disk_id="' + pci_list[i].children[j].id + '" ' + check_disable + ' />';
                // mpathHtml += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-storage-checkbox-disk' + i + '" name="form-gfs-storage-checkbox-disk" value="' + pci_list[i].children[j].path + '" />';
                mpathHtml += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-storage-checkbox-disk' + i + '">' + pci_list[i].children[j].path + ' ' + pci_list[i].children[j].state + ' (' + pci_list[i].children[j].type + ') ' + pci_list[i].children[j].size + ' ' + ' ' + pci_list[i].vendor + ' ' + pci_list[i].wwn + ' ' + partition_text + '</label>';
                mpathHtml += '</div>';

                multipathElements += mpathHtml; // MultiPath 요소를 multipathElements에 저장

                displayedMultipaths.add(mpathName); // MultiPath 이름을 Set에 추가
              }
            } else {
              partition_text = '( Partition exists count : ' + pci_list[i].children.length + ' )';
              check_disable = 'disabled';

              var disk_name = pci_list[i].name;
              if (!displayedName.has(disk_name)) {
                el += '<div class="pf-v6-c-check">';
                el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-storage-checkbox-disk' + i + '" name="form-gfs-storage-checkbox-disk" value="' + pci_list[i].path + '" ' + check_disable + ' />';
                // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-storage-checkbox-disk' + i + '" name="form-gfs-storage-checkbox-disk" value="' + pci_list[i].path + '" />';
                el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-storage-checkbox-disk' + i + '">' + pci_list[i].path + ' ' + pci_list[i].state + ' (' + pci_list[i].tran + ') ' + pci_list[i].size + ' ' + pci_list[i].model + ' ' + pci_list[i].wwn + partition_text + '</label>';
                el += '</div>';

                displayedName.add(disk_name);
              }
            }
          }
        } else {
          if (!pci_list[i].wwn) {
            pci_list[i].wwn = ""; // 값을 공백으로 설정
          }
          el += '<div class="pf-v6-c-check">';
          el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-storage-checkbox-disk' + i + '" name="form-gfs-storage-checkbox-disk" value="' + pci_list[i].path + '" ' + check_disable + ' />';
          // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-gfs-storage-checkbox-disk' + i + '" name="form-gfs-storage-checkbox-disk" value="' + pci_list[i].path + '" />';
          el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-gfs-storage-checkbox-disk' + i + '">' + pci_list[i].path + ' ' + pci_list[i].state + ' (' + pci_list[i].tran + ') ' + pci_list[i].size + ' ' + pci_list[i].model + ' ' + pci_list[i].wwn + partition_text + '</label>';
          el += '</div>';
        }
      }
    } else {
      el += '<div class="pf-v6-c-check">';
      el += '<label class="pf-v6-c-check__label" style="margin-top:5px">데이터가 존재하지 않습니다.</label>';
      el += '</div>';
    }

    // 일반 장치 정보를 먼저 추가하고, 마지막에 MultiPath 정보를 추가
    $('#disk-gfs-storage-pci-list').append(multipathElements + el);

  }).catch(function() {
    createLoggerInfo("setDiskInfo error");
  });
}

function IpmiCheck(){
  return cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var ipmi_port = "623";
    var ipmi_config = "";
    var ipmi_data = [];
    var ipmi_check_value = $('input[name="radio-gfs-ipmi"]:checked').val();

    if (ipmi_check_value == "common"){
      for(var i = 1; i <= hosts.length; i++){
        var ip = $(`#form-input-common-credentials-ipmi-ip${i}`).val() || '';
        if(!ip) break;
        var user = $('#form-input-common-credentials-ipmi-user').val();
        var password = $('#form-input-common-credentials-ipmi-password').val();
        ipmi_data.push({ip, user, password});
      }
    } else {
      for(var i = 1; i <= hosts.length; i++){
        var ip = $(`#form-input-individual-credentials-ipmi-ip${i}`).val() || '';
        var user = $(`#form-input-individual-credentials-ipmi-user${i}`).val() || '';
        var password = $(`#form-input-individual-credentials-ipmi-password${i}`).val() || '';
        if (!ip) break;
        ipmi_data.push({ ip, user, password });
      }
    }

    ipmi_data.forEach((entry, index) => {
      ipmi_config += `${index > 0 ? ";" : ""}${entry.ip},${ipmi_port},${entry.user},${entry.password}`;
    });

    var check_ipmi_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--check-ipmi', '--stonith', ipmi_config];
    console.log(check_ipmi_cmd)
    return cockpit.spawn(check_ipmi_cmd).then(function(data){
      var retVal = JSON.parse(data);
      if (retVal.code == "200") {
        $('#button-next-step-modal-gfs-storage-wizard-config').attr('disabled', false);
        $('#button-before-step-modal-gfs-storage-wizard-config').attr('disabled', false);
        $('#button-cancel-config-modal-gfs-storage-wizard-config').attr('disabled', false);
        $('#button-next-step-modal-gfs-storage-wizard-config').html('배포');
        return true;
      } else {
        alert(retVal.val.message + " 이전으로 돌아가 정확한 자격증명을 입력하시길 바랍니다.");
        return false;
      }
    }).catch(function(){
      alert("이전으로 돌아가 정확한 자격증명을 입력하시길 바랍니다.");
      return false;
    });
  });
}
