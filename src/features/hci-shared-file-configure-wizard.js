/**
 * File Name : hci-shared-file-configure-wizard.js
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : HCI 공유 파일 구성 마법사에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// 변수 선언
var cur_step_wizard_hci_shared_file_config = "1";
var completed = false;
var os_type = sessionStorage.getItem("os_type");

// Document.ready 시작
$(document).ready(function(){
  // hci-shared-file 스토리지 구성 마법사 페이지 준비
  $('#div-modal-wizard-hci-shared-file-volume').hide();
  $('#div-modal-wizard-hci-shared-file-disk-configure').hide();
  $('#div-modal-wizard-hci-shared-file-ipmi').hide();
  $('#div-modal-wizard-hci-shared-file-review').hide();
  $('#div-modal-wizard-hci-shared-file-deploy').hide();
  $('#div-modal-wizard-hci-shared-file-finish').hide();

  $('#div-accordion-hci-shared-file-disk').attr('hidden', true).hide();

  // $('#nav-button-hci-shared-file-review').addClass('pf-m-disabled');
  $('#nav-button-hci-shared-file-finish').addClass('pf-m-disabled');

  $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', true);
  $('#button-cancel-config-modal-hci-shared-file-wizard-config').attr('disabled', false);

  // 첫번째 스텝에서 시작
  cur_step_wizard_hci_shared_file_config = "1";

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    updateHciSharedFIleIPMIcredentials(hosts.length,$('input[name="radio-hci-shared-file-ipmi"]:checked').val())
  })
  //디스크 구성방식 초기 세팅
  setHciSharedFileDiskInfo();
  SharedVolumeSizeNumberLimit();
});
// document ready 끝
$('#button-close-modal-hci-shared-file-wizard-confirm, #button-cancel-modal-hci-shared-file-wizard-confirm').on('click', function(){
  $('#div-modal-hci-shared-file-wizard-confirm').hide();
});
$('#button-close-modal-hci-shared-file-wizard, #button-cancel-config-modal-hci-shared-file-wizard-config').on('click', function(){
  $('#div-modal-wizard-hci-shared-file-configure').hide();
})
// 이벤트 처리 함수
$('#button-close-modal-wizard-hci-shared-file').on('click', function(){
  $('#div-modal-wizard-hci-shared-file-configure').hide();
  if(completed){
    //상태값 초기화 겸 페이지 리로드
    location.reload();
  }
});

// '다음' 버튼 클릭 시 이벤트를 처리하기 위한 함수
$('#button-next-step-modal-hci-shared-file-wizard-config').on('click', function(){
  if (cur_step_wizard_hci_shared_file_config == "1") {

    $('#div-modal-wizard-hci-shared-file-overview').hide();
    $('#div-modal-wizard-hci-shared-file-volume').show();
    $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', true);
    $('#nav-button-hci-shared-file-overview').removeClass('pf-m-current');
    $('#nav-button-hci-shared-file-volume').addClass('pf-m-current');

    cur_step_wizard_hci_shared_file_config = "2";
  }
  else if (cur_step_wizard_hci_shared_file_config == "2") {
    setHciSharedFileDiskInfo();

    $('#div-modal-wizard-hci-shared-file-volume').hide();
    $('#div-modal-wizard-hci-shared-file-disk-configure').show();
    $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#nav-button-hci-shared-file-volume').removeClass('pf-m-current');
    $('#nav-button-hci-shared-file-disk-configure').addClass('pf-m-current');

    cur_step_wizard_hci_shared_file_config = "3";
  }
  else if (cur_step_wizard_hci_shared_file_config == "3") {
    $('#div-modal-wizard-hci-shared-file-disk-configure').hide();
    $('#div-modal-wizard-hci-shared-file-ipmi').show();
    $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#nav-button-hci-shared-file-disk-configure').removeClass('pf-m-current');
    $('#nav-button-hci-shared-file-ipmi-info').addClass('pf-m-current');

    cur_step_wizard_hci_shared_file_config = "4";
  }
  else if (cur_step_wizard_hci_shared_file_config == "4") {

    // review 정보 세팅
    setHciSharedFileReviewInfo();

    $('#div-modal-wizard-hci-shared-file-ipmi').hide();
    $('#div-modal-wizard-hci-shared-file-review').show();
    $('#nav-button-hci-shared-file-ipmi-info').removeClass('pf-m-current');
    $('#nav-button-hci-shared-file-review').addClass('pf-m-current');

    HciSharedFileIpmiCheck().then(function(result){
      if (result){
        $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
        $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
        cur_step_wizard_hci_shared_file_config = "5";
      }else{
        $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', true);
        $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
        $('#button-cancel-config-modal-hci-shared-file-wizard-config').attr('disabled', false);
        cur_step_wizard_hci_shared_file_config = "5";
      }
    })

  }
  else if (cur_step_wizard_hci_shared_file_config == "5") {
    $('#div-modal-hci-shared-file-wizard-confirm').show();
  }
});

// '이전' 버튼 클릭 시 이벤트를 처리하기 위한 함수
$('#button-before-step-modal-hci-shared-file-wizard-config').on('click', function(){
  if (cur_step_wizard_hci_shared_file_config == "1") {
    // 이전 버튼 없음
  }
  else if (cur_step_wizard_hci_shared_file_config == "2") {
    // 1번 스텝으로 이동
    $('#div-modal-wizard-hci-shared-file-overview').show();
    $('#div-modal-wizard-hci-shared-file-volume').hide();
    $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', true);
    $('#nav-button-hci-shared-file-overview').addClass('pf-m-current');
    $('#nav-button-hci-shared-file-volume').removeClass('pf-m-current');

    // 1번으로 변수값 변경
    cur_step_wizard_hci_shared_file_config = "1";
  }
  else if (cur_step_wizard_hci_shared_file_config == "3") {

    $('#div-modal-wizard-hci-shared-file-volume').show();
    $('#div-modal-wizard-hci-shared-file-disk-configure').hide();
    $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#nav-button-hci-shared-file-volume').addClass('pf-m-current');
    $('#nav-button-hci-shared-file-disk-configure').removeClass('pf-m-current');

    cur_step_wizard_hci_shared_file_config = "2";
  }
  else if (cur_step_wizard_hci_shared_file_config == "4") {
    $('#div-modal-wizard-hci-shared-file-disk-configure').show();
    $('#div-modal-wizard-hci-shared-file-ipmi').hide();
    $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#nav-button-hci-shared-file-disk-configure').addClass('pf-m-current');
    $('#nav-button-hci-shared-file-ipmi-info').removeClass('pf-m-current');

    cur_step_wizard_hci_shared_file_config = "3";
  }
  else if (cur_step_wizard_hci_shared_file_config == "5") {
    $('#div-modal-wizard-hci-shared-file-ipmi').show();
    $('#div-modal-wizard-hci-shared-file-review').hide();
    $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
    $('#nav-button-hci-shared-file-ipmi-info').addClass('pf-m-current');
    $('#nav-button-hci-shared-file-review').removeClass('pf-m-current');

    $('#button-next-step-modal-hci-shared-file-wizard-config').html('다음');

    cur_step_wizard_hci_shared_file_config = "4";
  }

});

$('#nav-button-hci-shared-file-overview').on('click', function(){
  HciSharedFilehideAllMainBody();
  HciSharedFileresetCurrentMode();

  $('#div-modal-wizard-hci-shared-file-overview').show();
  $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', true);
  $('#nav-button-hci-shared-file-overview').addClass('pf-m-current');

  cur_step_wizard_hci_shared_file_config = "1";
});

$('#nav-button-hci-shared-file-volume').on('click', function(){
  HciSharedFilehideAllMainBody();
  HciSharedFileresetCurrentMode();

  $('#div-modal-wizard-hci-shared-file-volume').show();
  $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', true);
  $('#nav-button-hci-shared-file-volume').addClass('pf-m-current');

  cur_step_wizard_hci_shared_file_config = "2";
});

$('#nav-button-hci-shared-file-disk-configure').on('click', function(){
  HciSharedFilehideAllMainBody();
  HciSharedFileresetCurrentMode();

  $('#div-modal-wizard-hci-shared-file-disk-configure').show();
  $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#nav-button-hci-shared-file-disk-configure').addClass('pf-m-current');

  cur_step_wizard_hci_shared_file_config = "3";
});

$('#nav-button-hci-shared-file-ipmi-info').on('click', function(){
  HciSharedFilehideAllMainBody();
  HciSharedFileresetCurrentMode();

  $('#div-modal-wizard-hci-shared-file-ipmi').show();
  $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#nav-button-hci-shared-file-ipmi-info').addClass('pf-m-current');

  cur_step_wizard_hci_shared_file_config = "4";
});

$('#nav-button-hci-shared-file-review').on('click', function(){
  HciSharedFilehideAllMainBody();
  HciSharedFileresetCurrentMode();

  // review 정보 세팅
  setHciSharedFileReviewInfo();

  $('#div-modal-wizard-hci-shared-file-review').show();
  $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#nav-button-hci-shared-file-review').addClass('pf-m-current');

  $('#button-next-step-modal-hci-shared-file-wizard-config').html('배포');

  cur_step_wizard_hci_shared_file_config = "5";
});

$('#nav-button-hci-shared-file-finish').on('click', function(){
  HciSharedFilehideAllMainBody();
  HciSharedFileresetCurrentMode();

  $('#div-modal-wizard-hci-shared-file-finish').show();
  $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
  $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', true);
  $('#nav-button-hci-shared-file-finish').addClass('pf-m-current');

  $('#button-next-step-modal-hci-shared-file-wizard-config').hide();
  $('#button-before-step-modal-hci-shared-file-wizard-config').hide();
  $('#button-cancel-config-modal-hci-shared-file-wizard-config').hide();

  cur_step_wizard_hci_shared_file_config = "6";
});

// 설정확인 단계의 아코디언 개체에서 발생하는 이벤트의 처리

$('#button-accordion-hci-shared-file-disk').on('click', function(){
  if ($('#button-accordion-hci-shared-file-disk').attr("aria-expanded") == "false") {
    $('#button-accordion-hci-shared-file-disk').attr("aria-expanded", "true");
    $('#button-accordion-hci-shared-file-disk').addClass("pf-m-expanded");
    $('#div-accordion-hci-shared-file-disk').removeAttr('hidden').fadeIn();
    $('#div-accordion-hci-shared-file-disk').addClass("pf-m-expanded");
    $('#div-accordion-hci-shared-file-disk').closest('.pf-v6-c-accordion__item').addClass("pf-m-expanded");
  }
  else {
    $('#button-accordion-hci-shared-file-disk').attr("aria-expanded", "false");
    $('#button-accordion-hci-shared-file-disk').removeClass("pf-m-expanded");
    $('#div-accordion-hci-shared-file-disk').attr('hidden', true).fadeOut();
    $('#div-accordion-hci-shared-file-disk').removeClass("pf-m-expanded");
    $('#div-accordion-hci-shared-file-disk').closest('.pf-v6-c-accordion__item').removeClass("pf-m-expanded");
  }
});

$(document).on('click', '#button-accordion-hci-shared-file-ipmi', function () {
  const button = $(this); // 현재 클릭된 버튼
  const content = $('#div-accordion-hci-shared-file-expaned-ipmi'); // 아코디언 내용 영역

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
$('#button-hci-shared-file-create').on('click', function(){
  $('#hci-shared-file-size-info').text($('#form-input-hci-file-volume').val());
  $('#div-modal-hci-shared-file-create').show();
});
// 마법사 "배포 실행 버튼 모달창"
// 마법사 "배포 버튼 모달창" 실행 버튼을 눌러 hci-shared-file 스토리지 구성
$('#button-execution-modal-hci-shared-file-wizard-confirm').on('click', function () {
  $('#div-modal-hci-shared-file-wizard-confirm').hide();
  validateHciSharedFileStorage().then(function(valid){
    if(valid){
      // 배포 버튼을 누르면 배포 진행 단계로 이동한다.
      HciSharedFilehideAllMainBody();
      HciSharedFileresetCurrentMode();

      $('#div-modal-wizard-hci-shared-file-deploy').show();
      $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', true);
      $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', true);

      $('#nav-button-hci-shared-file-finish').addClass('pf-m-current');

      cur_step_wizard_hci_shared_file_config = "6";

      deployHciSharedFileStorage();
    }
  });
});

// 마법사 "취소 버튼 모달창" show, hide
$('#button-cancel-modal-hci-shared-file-wizard-confirm').on('click', function () {
  $('#div-modal-cancel-hci-shared-file-wizard-cancel').show();
});
$('#button-close-modal-hci-shared-file-wizard-cancel').on('click', function () {
  $('#div-modal-cancel-hci-shared-file-wizard-cancel').hide();
});
$('#button-cancel-modal-hci-shared-file-wizard-cancel').on('click', function () {
  $('#div-modal-cancel-hci-shared-file-wizard-cancel').hide();
});
// 마법사 "취소 버튼 모달창" 실행 버튼을 눌러 취소를 실행
$('#button-execution-modal-wizard-cancel').on('click', function () {
  //상태값 초기화 겸 페이지 리로드
  location.reload();
});

$('#button-execution-modal-hci-shared-file-wizard-cancel').on('click', function(){
  //상태값 초기화 겸 페이지 리로드
  location.reload();
})
/**
 * Meathod Name : HciSharedFilehideAllMainBody
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 마법사 대화상자의 모든 Main Body Division 숨기기
 * Parameter : 없음
 * Return : 없음
 * History : 2026.01.14 최초 작성
 */
function HciSharedFilehideAllMainBody() {
  $('#div-modal-wizard-hci-shared-file-overview').hide();
  $('#div-modal-wizard-hci-shared-file-volume').hide();
  $('#div-modal-wizard-hci-shared-file-disk-configure').hide();
  $('#div-modal-wizard-hci-shared-file-ipmi').hide();
  $('#div-modal-wizard-hci-shared-file-review').hide();
  $('#div-modal-wizard-hci-shared-file-deploy').hide();
  $('#div-modal-wizard-hci-shared-file-finish').hide();

  $('#button-next-step-modal-hci-shared-file-wizard-config').html('다음');
}

/**
 * Meathod Name : HciSharedFileresetCurrentMode
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 마법사 대화상자의 측면 버튼의 '현재 위치'를 모두 리셋
 * Parameter : 없음
 * Return : 없음
 * History : 2026.01.14 최초 작성
 */
function HciSharedFileresetCurrentMode() {
  $('#nav-button-hci-shared-file-overview').removeClass('pf-m-current');
  $('#nav-button-hci-shared-file-volume').removeClass('pf-m-current');
  $('#nav-button-hci-shared-file-disk-configure').removeClass('pf-m-current');
  $('#nav-button-hci-shared-file-ipmi-info').removeClass('pf-m-current');
  $('#nav-button-hci-shared-file-review').removeClass('pf-m-current');
  $('#nav-button-hci-shared-file-finish').removeClass('pf-m-current');
}

/**
 * Meathod Name : deployHciSharedFileStorage
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 가상머신을 배포하는 작업을 화면에 표시하도록 하는 함수
 * Parameter : 없음
 * Return : 없음
 * History : 2026.01.14 최초 작성
 */
function deployHciSharedFileStorage() {
  // 하단 버튼 숨김
  $('#button-next-step-modal-hci-shared-file-wizard-config').hide();
  $('#button-before-step-modal-hci-shared-file-wizard-config').hide();
  $('#button-cancel-config-modal-hci-shared-file-wizard-config').hide();

  // 왼쪽 사이드 버튼 전부 비활성화
  $('#nav-button-hci-shared-file-overview').addClass('pf-m-disabled');
  $('#nav-button-hci-shared-file-volume').addClass('pf-m-disabled');
  $('#nav-button-hci-shared-file-disk-configure').addClass('pf-m-disabled');
  $('#nav-button-hci-shared-file-ipmi-info').addClass('pf-m-disabled');
  $('#nav-button-hci-shared-file-review').addClass('pf-m-disabled');

  createLoggerInfo("deployHciSharedFileStorage start");

  //=========== 1. 스토리지센터 가상머신 초기화 작업 ===========
  // 설정 초기화 ( 필요시 python까지 종료 )

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var all_host_name = "";
    var host_names = [];
    for (let i = 0; i < hosts.length ; i++) {
      var hostName = hosts[i].ablecubePn;
      all_host_name += (all_host_name ? " " : "") + hostName;
      if (hostName) {
        host_names.push(hostName); // 유효한 이름만 배열에 추가
      }

    }
    var ipmi_port = "623";
    var ipmi_check_value = $('input[name="radio-hci-shared-file-ipmi"]:checked').val();

    var ipmi_config = ""; // 최종 IPMI 설정 문자열 초기화
    var ipmi_data = []; // IPMI 데이터를 담을 배열
    if (ipmi_check_value === "individual") {
      // 개별 자격 증명 처리
      for (let i = 0; i < hosts.length; i++) {
        // 동적으로 각 IPMI 입력값 가져오기
        let ip = $(`#form-hci-shared-file-input-individual-credentials-ipmi-ip${i+1}`).val() || '';
        let user = $(`#form-hci-shared-file-input-individual-credentials-ipmi-user${i+1}`).val() || '';
        let password = $(`#form-hci-shared-file-input-individual-credentials-ipmi-password${i+1}`).val() || '';

        if (!ip) break; // IP가 없으면 더 이상 처리하지 않음
        ipmi_data.push({ ip, user, password }); // 배열에 추가
      }
    } else {
      // 공통 자격 증명 처리
      for (let i = 0; i < hosts.length; i++) {
        // 동적으로 각 IPMI 입력값 가져오기
        let ip = $(`#form-hci-shared-file-input-common-credentials-ipmi-ip${i+1}`).val() || '';
        if (!ip) break; // IP가 없으면 더 이상 처리하지 않음

        // 공통 사용자 정보 추가
        let user = $('#form-hci-shared-file-input-common-credentials-ipmi-user').val();
        let password = $('#form-hci-shared-file-input-common-credentials-ipmi-password').val();

        ipmi_data.push({ ip, user, password }); // 배열에 추가
      }
    }
    ipmi_data.forEach((entry, index) => {
      ipmi_config += `${index > 0 ? ";" : ""}${entry.ip},${ipmi_port},${entry.user},${entry.password}`;
    });
    var journal_nums = String(hosts.length + 1);

    // 결과 출력 (디스크가 하나든 여러 개든 자동 처리)
    var hci_shared_file_cluster_name = "cloudcenter_res";
    var hci_shared_file_mount_point = "/mnt/glue-gfs";
    var hci_shared_file_name = "glue-gfs";
    var hci_shared_file_vg_name = "vg_glue";
    var hci_shared_file_lv_name = "lv_glue";
    var ret_json_string = ClusterConfigJsonStringHciSharedFile(retVal);
    var mgmt_ip = retVal.clusterConfig.ccvm.ip;
    //=========== 1. 클러스터 구성 host 네트워크 연결 및 초기화 작업 ===========
    setHciSharedFileProgressStep("span-hci-shared-file-progress-step1",1);
    var console_log = true;
    createLoggerInfo("deployHciSharedFileStorage start");
    var host_ping_test_and_cluster_config_cmd = ['python3', pluginpath + '/python/cluster/cluster_config.py', 'check', '-js', ret_json_string, '-cmi', mgmt_ip, '-pcl', all_host_name];
    if(console_log){console.log(host_ping_test_and_cluster_config_cmd);}
    cockpit.spawn(host_ping_test_and_cluster_config_cmd)
      .then(function(data){
        //결과 값 json으로 return
        var ping_test_result = JSON.parse(data);
        if(ping_test_result.code=="200") { //정상
          // 체크된 디스크 이름들을 동적으로 가져옴
          var general_virtual_disk_name = $('input[type=checkbox][name="form-hci-shared-file-checkbox-disk"]:checked')
          .map(function () {
            return $(this).data("disk_id"); // 체크된 값 가져오기
          })
          .get() // jQuery 객체를 배열로 변환
          .join(','); // 쉼표로 연결
          setHciSharedFileProgressStep("span-hci-shared-file-progress-step1",2);
          setHciSharedFileProgressStep("span-hci-shared-file-progress-step2",1);
          var reset_cloud_center_cmd = ['python3', pluginpath + '/python/vm/reset_cloud_center.py'];
          if(console_log){console.log(reset_cloud_center_cmd);}
          cockpit.spawn(reset_cloud_center_cmd)
            .then(function(data){
              //결과 값 json으로 return
              var reset_cloud_center_result = JSON.parse(data);
              if(reset_cloud_center_result.code=="200") { //정상
                setHciSharedFileProgressStep("span-hci-shared-file-progress-step2",2);
                setHciSharedFileProgressStep("span-hci-shared-file-progress-step3",1);
                //=========== 2. hci-shared-file 구성 설정 및 Pcs 설정 ===========
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
                            var setup_cluster_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--setup-cluster', hci_shared_file_cluster_name, '--list-ip', all_host_name];
                            console.log(setup_cluster_cmd);
                            cockpit.spawn(setup_cluster_cmd)
                            .then(function(data){
                              var setup_cluster_result = JSON.parse(data);
                              console.log(setup_cluster_result)
                              if (setup_cluster_result.code == "200"){
                                var set_configure_stonith_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--configure-stonith',ipmi_config, '--list-ip', all_host_name];
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
                                        setHciSharedFileProgressStep("span-hci-shared-file-progress-step3",4);
                                        var create_hci_shared_file_cmd = ['python3', pluginpath + '/python/gfs/gfs_manage.py', '--create-gfs',
                                                    '--disks', general_virtual_disk_name , '--vg-name', hci_shared_file_vg_name, '--lv-name', hci_shared_file_lv_name,
                                                    '--gfs-name', hci_shared_file_name, '--mount-point', hci_shared_file_mount_point, '--cluster-name', hci_shared_file_cluster_name,
                                                    '--journal-nums', journal_nums, '--list-ip', all_host_name]
                                        console.log(create_hci_shared_file_cmd);
                                        cockpit.spawn(create_hci_shared_file_cmd)
                                        .then(function(data){
                                          var create_hci_shared_file_result = JSON.parse(data);
                                          console.log(create_hci_shared_file_result);
                                          if (create_hci_shared_file_result.code == "200"){
                                            var hci_shared_file_boostrap_cmd = ['python3', pluginpath + '/python/ablestack_json/ablestackJson.py','update', '--depth1', 'bootstrap', '--depth2', 'gfs_configure', '--value', 'true', '--all-hosts']
                                            console.log(hci_shared_file_boostrap_cmd);
                                            cockpit.spawn(hci_shared_file_boostrap_cmd)
                                            .then(function(data){
                                              var hci_shared_file_bootstrap_result = JSON.parse(data);
                                              if (hci_shared_file_bootstrap_result.code == "200"){
                                                createLoggerInfo("deployHciSharedFileStorage success");
                                                setHciSharedFileProgressStep("span-hci-shared-file-progress-step3",2);
                                                //최종 화면 호출
                                                showDivisionHciSharedFileConfigFinish();
                                              }else{
                                                seHciSharedFileProgressFail(3);
                                                createLoggerInfo("HCI Shared File configuration succeeded, but gfs_configure synchronization failed");
                                                alert("HCI 공유 파일 구성은 완료되었으나 일부 호스트의 구성 상태 동기화에 실패했습니다.");
                                              }
                                            }).catch(function(data){
                                              seHciSharedFileProgressFail(3);
                                              createLoggerInfo("HCI Shared File configuration succeeded, but gfs_configure synchronization command failed");
                                              alert("HCI 공유 파일 구성은 완료되었으나 구성 상태 동기화 명령 실행에 실패했습니다 : "+data);
                                            })
                                          }else{
                                            seHciSharedFileProgressFail(3);
                                            createLoggerInfo(create_hci_shared_file_result.val);
                                            alert(create_hci_shared_file_result.val);
                                          }
                                        }).catch(function(data){
                                          seHciSharedFileProgressFail(3);
                                          createLoggerInfo("HCI Shared File configuration settings and Pcs task Pcs resource settings failed");
                                          alert("HCI 공유 파일 구성 설정 및 Pcs 작업 7. Pcs 리소스 설정 실패 : "+data);
                                        });
                                      }else{
                                        seHciSharedFileProgressFail(3);
                                        createLoggerInfo(set_alert_result.val);
                                        alert(set_alert_result.val);
                                      }
                                    }).catch(function(data){
                                      seHciSharedFileProgressFail(3);
                                      createLoggerInfo("HCI Shared File configuration setup and Pcs Alert setup failed");
                                      alert("HCI 공유 파일 구성 설정 및 Pcs 작업 6. PCS 알림 설정 실패 : "+data);
                                    });

                                  }else{
                                    seHciSharedFileProgressFail(3);
                                    createLoggerInfo(set_configure_stonith_result.val);
                                    alert(set_configure_stonith_result.val);
                                  }
                                }).catch(function(data){
                                  seHciSharedFileProgressFail(3);
                                  createLoggerInfo("Failed to set HCI Shared File configuration and Pcs task IPMI information");
                                  alert("HCI 공유 파일 구성 설정 및 Pcs 작업 5. IPMI 정보 설정 실패 : "+data);
                                })
                              }else{
                                seHciSharedFileProgressFail(3);
                                createLoggerInfo(setup_cluster_result.val);
                                alert(setup_cluster_result.val);
                              }
                            }).catch(function(data){
                              seHciSharedFileProgressFail(3);
                              createLoggerInfo("GFS configuration setup and Pcs task cluster setup failed");
                              alert("GFS 구성 설정 및 Pcs 작업 4. 클러스터 설정 실패 : "+data);
                            })
                          }else{
                            seHciSharedFileProgressFail(3);
                            createLoggerInfo(auth_hosts_result.val);
                            alert(auth_hosts_result.val);
                          }
                        }).catch(function(data){
                          seHciSharedFileProgressFail(3);
                          createLoggerInfo("Failed to set GFS configuration and Pcs task host authentication settings");
                          alert("GFS 구성 설정 및 Pcs 작업 3. 호스트 인증 설정 실패 : "+data);
                        })
                      }else{
                        seHciSharedFileProgressFail(3);
                        createLoggerInfo(set_password_result.val);
                        alert(set_password_result.val);
                      }
                    }).catch(function(data){
                      seHciSharedFileProgressFail(3);
                      createLoggerInfo("Failed to set GFS configuration and Pcs task password");
                      alert("GFS 구성 설정 및 Pcs 작업 2. 패스워드 설정 실패 : "+data);
                    })
                  }else{
                    seHciSharedFileProgressFail(3);
                    createLoggerInfo(set_lvm_conf_result.val);
                    alert(set_lvm_conf_result.val);
                  }
                }).catch(function(data){
                  seHciSharedFileProgressFail(3);
                  createLoggerInfo("Failed to set LVM CONF file during HCI Shared File configuration setup and Pcs operation");
                  alert("HCI Shared File 구성 설정 및 Pcs 작업 1. LVM CONF 파일 설정 실패 : "+data);
                });
              } else {
                seHciSharedFileProgressFail(2);
                createLoggerInfo(reset_cloud_center_result.val);
                alert(reset_cloud_center_result.val);
              }
            })
            .catch(function(data){
              seHciSharedFileProgressFail(2);
              createLoggerInfo("Failed to initialize cluster configuration settings");
              alert("클러스터 구성 설정 초기화 작업 실패 : "+data);
            });
        } else {
          seHciSharedFileProgressFail(1);
          createLoggerInfo(ping_test_result.val);
          alert(ping_test_result.val);
        }
      })
      .catch(function(data){
        seHciSharedFileProgressFail(1);
        createLoggerInfo("Failed to check connection status of host to configure cluster");
        alert("클러스터 구성할 host 연결 상태 확인 및 cluster.json config 실패 : "+data);
      });
  });

}
$('[name="radio-hci-shared-file-ipmi"]').on('change', function () {
  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    updateHciSharedFIleIPMIcredentials(hosts.length,$('input[name="radio-hci-shared-file-ipmi"]:checked').val())
  })
});
/**
 * Meathod Name : showDivisionHciSharedFileConfigFinish
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 가상머신을 배포한 후 마지막 페이지를 보여주는 함수
 * Parameter : 없음
 * Return : 없음
 */
function showDivisionHciSharedFileConfigFinish() {
  HciSharedFilehideAllMainBody();
  HciSharedFileresetCurrentMode();

  $('#div-modal-wizard-hci-shared-file-finish').show();
  $('#nav-button-hci-shared-file-finish').addClass('pf-m-current');
  $('#nav-button-hci-shared-file-finish').removeClass('pf-m-disabled');

  $('#button-next-step-modal-hci-shared-file-wizard-config').text("완료");

  $('#button-next-step-modal-hci-shared-file-wizard-config').hide();
  $('#button-before-step-modal-hci-shared-file-wizard-config').hide();
  $('#button-cancel-config-modal-hci-shared-file-wizard-config').hide();

  completed = true;

  cur_step_wizard_hci_shared_file_config = "7";
}

/**
 * Meathod Name : validateHciSharedFileIpmiCredentials
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 입력된 값이 없는지 체크하여 값이 있을 경우 true return, 없을 경우 false 리턴
 * Parameter : int, String
 * Return : bool
 * History : 2026.01.14 최초 작성
 */
function validateHciSharedFileIpmiCredentials(index, type) {
  let prefix = type === "individual" ? `form-hci-shared-file-input-individual-credentials-ipmi` : `form-hci-shared-file-input-common-credentials-ipmi`;
  let ip = $(`#${prefix}-ip${index}`).val() || '';
  let user = type === "individual" ? $(`#${prefix}-user${index}`).val() || '' : $('#form-hci-shared-file-input-common-credentials-ipmi-user').val();
  let password = type === "individual" ? $(`#${prefix}-password${index}`).val() || '' : $('#form-hci-shared-file-input-common-credentials-ipmi-password').val();

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
 * Meathod Name : setHciSharedFileReviewInfo
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 설정확인을 위한 정보를 세팅하는 기능
 * Parameter : 없음
 * Return : 없음
 * History : 2026.01.14 최초 작성
 */
function setHciSharedFileReviewInfo(){

  var hci_shared_file_disk = $('input[type=checkbox][name="form-hci-shared-file-checkbox-disk"]:checked')
  .map(function () {
    return $(this).data('disk_id'); // 체크된 값 가져오기
  })
  .get() // jQuery 객체를 배열로 변환
  .join(', '); // 쉼표로 연결

  var ipmi_check_val = $('input[name="radio-hci-shared-file-ipmi"]:checked').val();
  $('#span-hci-shared-file-disk').text(hci_shared_file_disk);

  cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    HciSharedFilecreateAccordion("ipmi",hosts.length, ipmi_check_val);
  });
}

/**
 * Meathod Name : validateHciSharedFileStorage
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 스토리지 센터 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return : 없음
 * History : 2026.01.14 최초 작성
 */
function validateHciSharedFileStorage() {
  return cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var validate_check = true;
    var hci_shared_file_disk = $('input[type=checkbox][name="form-hci-shared-file-checkbox-disk"]:checked').val();
    var ipmi_check_value = $('input[name="radio-hci-shared-file-ipmi"]:checked').val();

    if (ipmi_check_value === "individual") {
      for (let i = 1; i <= hosts.length; i++) {
        if (!validateHciSharedFileIpmiCredentials(i, "individual")) {
          validate_check = false;
          break;
        }
      }
    } else if (ipmi_check_value === "common") {
      for (let i = 1; i <= hosts.length; i++) {
        if (!validateHciSharedFileIpmiCredentials(i, "common")) {
          validate_check = false;
          break;
        }
      }
    } else if (externel_storage_sync == ""){
      validate_check = false;
      alert("외부 스토리지 동기화 여부를 선택해주세요.");
    } else if (hci_shared_file_disk == "") {
      validate_check = false;
      alert("HCI 공유 파일 전용 디스크를 선택해주세요.");
    }

    return validate_check;
  });
}

/**
 * Meathod Name : seHciSharedFileProgressFail
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : HCI 공유 파일 구성 진행중 실패 단계에 따른 중단됨 UI 처리
 * Parameter : setp_num
 * Return : 없음
 * History : 2026.01.14 최초 작성
 */
 function seHciSharedFileProgressFail(setp_num){
  if( setp_num == 1 || setp_num == '1' ){  // 1단계 이하 단계 전부 중단된 처리
    seScvmProgressStep("span-hci-shared-file-progress-step1",3);
    seScvmProgressStep("span-hci-shared-file-progress-step2",3);
    seScvmProgressStep("span-hci-shared-file-progress-step3",3);
    seScvmProgressStep("span-hci-shared-file-progress-step4",3);
  } else if(setp_num == 2 || setp_num == '2') {  // 2단계 이하 단계 전부 중단된 처리
    seScvmProgressStep("span-hci-shared-file-progress-step2",3);
    seScvmProgressStep("span-hci-shared-file-progress-step3",3);
    seScvmProgressStep("span-hci-shared-file-progress-step4",3);
  } else if(setp_num == 3 || setp_num == '3') {  // 3단계 이하 단계 전부 중단된 처리
    seScvmProgressStep("span-hci-shared-file-progress-step3",3);
  }
}
/**
 * Meathod Name : HciSharedFilecreateAccordion
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 호스트 수에 따른 IPMI 자격 증명, 페일오버 클러스터 등 동적 화면(설정 확인)
 * Parameter : 없음
 * Return : 없음
 * History : 2026.01.14 최초 작성
 */
function HciSharedFilecreateAccordion(type, hostCount, HciSharedFileIpmiCheckVal) {
  // Get the existing container by ID
  let accordionContainer;
  let expandedContentId;
  let toggleText_name;
  let toggleButton_name;

  if (type == "ipmi") {
    accordionContainer = document.getElementById("div-accordion-hci-shared-file-ipmi");
    toggleText_name = "IPMI 정보";
    expandedContentId = "div-accordion-hci-shared-file-expaned-ipmi";
    toggleButton_name = "button-accordion-hci-shared-file-ipmi";
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
    descriptionList.appendChild(HciSharedFilecreateDescriptionGroup("IPMI 구성 준비", ""));

    // Add host-specific IPMI groups
    for (let i = 1; i <= hostCount; i++) {
      const hostGroup = HciSharedFilecreateDescriptionGroup(
        `${i}번 호스트`,
        `
        IPMI IP: <span id="span-hci-shared-file-ipmi-ip${i}"></span><br/>
        <span id="span-hci-shared-file-ipmi-user${i}"></span>
        <span id="span-hci-shared-file-ipmi-password${i}"></span>
        `
      );
      descriptionList.appendChild(hostGroup);
    }

    // Add '모든 호스트 자격 증명' group
    const commonGroup = HciSharedFilecreateDescriptionGroup(
      "모든 호스트 자격 증명",
      `
      IPMI 아이디: <span id="span-hci-shared-file-ipmi-user"></span><br/>
      IPMI 비밀번호: <span id="span-hci-shared-file-ipmi-password"></span>
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
  HciSharedFileupdateSpans(type, hostCount, HciSharedFileIpmiCheckVal);
}

function HciSharedFilecreateDescriptionGroup(title, contentHtml) {
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

function HciSharedFileupdateSpans(type, hostCount, HciSharedFileIpmiCheckVal) {
  if (type == "ipmi"){
    if (HciSharedFileIpmiCheckVal === "individual") {
      $('#accordion-common-ipmi').hide();
      for (let i = 1; i <= hostCount; i++) {
        $(`#span-hci-shared-file-ipmi-ip${i}`).text($(`#form-hci-shared-file-input-individual-credentials-ipmi-ip${i}`).val());
        $(`#span-hci-shared-file-ipmi-user${i}`).html("IPMI 아이디: " + $(`#form-hci-shared-file-input-individual-credentials-ipmi-user${i}`).val() + "<br/>");
        $(`#span-hci-shared-file-ipmi-password${i}`).text("IPMI 비밀번호: " + $(`#form-hci-shared-file-input-individual-credentials-ipmi-password${i}`).val());
      }
    } else {
      $('#accordion-common-ipmi').show();
      for (let i = 1; i <= hostCount; i++) {
        $(`#span-hci-shared-file-ipmi-ip${i}`).text($(`#form-hci-shared-file-input-common-credentials-ipmi-ip${i}`).val());
      }
      $('#span-hci-shared-file-ipmi-user').text($('#form-hci-shared-file-input-common-credentials-ipmi-user').val());
      $('#span-hci-shared-file-ipmi-password').text($('#form-hci-shared-file-input-common-credentials-ipmi-password').val());
    }
  }

}

/**
 * Meathod Name : updateHciSharedFIleIPMIcredentials
 * Date Created : 2026.01.14
 * Writer : 정민철
 * Description : 호스트 수에 따른 IPMI 자격 증명 동적 화면
 * Parameter : 없음
 * Return : 없음
 * History : 2026.01.14 최초 작성
 */
function updateHciSharedFIleIPMIcredentials(count,credentials_type) {
  const hostCount = count;
  const credentials = document.getElementById("div-hci-shared-file-ipmi-credentials");
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
                    <label class="pf-v6-c-form__label" for="form-hci-shared-file-input-individual-credentials-ipmi-ip${i}">
                      <span class="pf-v6-c-form__label-text">IPMI IP</span>
                      <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
                    </label>
                  </div>
                  <div class="pf-v6-c-form__group-control">
                    <input class="pf-v6-c-form-control" style="width:70%" type="text" id="form-hci-shared-file-input-individual-credentials-ipmi-ip${i}" name="form-hci-shared-file-input-individual-credentials-ipmi-ip${i}" placeholder="xxx.xxx.xxx.xxx 형식으로 입력" required/>
                  </div>
                </div>
              </div>
              <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
                <div class="pf-v6-c-form__group" style="padding:0px;">
                  <div class="pf-v6-c-form__group-label">
                    <label class="pf-v6-c-form__label" for="form-hci-shared-file-input-individual-credentials-ipmi-user${i}">
                      <span class="pf-v6-c-form__label-text">IPMI 아이디</span>
                      <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
                    </label>
                  </div>
                  <div class="pf-v6-c-form__group-control">
                    <input class="pf-v6-c-form-control" style="width:70%" type="text" id="form-hci-shared-file-input-individual-credentials-ipmi-user${i}" name="form-hci-shared-file-input-individual-credentials-ipmi-user${i}" placeholder="아이디를 입력하세요." required />
                  </div>
                </div>
              </div>
              <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
                <div class="pf-v6-c-form__group" style="padding:0px;">
                  <div class="pf-v6-c-form__group-label">
                    <label class="pf-v6-c-form__label" for="form-hci-shared-file-input-individual-credentials-ipmi-password${i}">
                      <span class="pf-v6-c-form__label-text">IPMI 비밀번호</span>
                      <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
                    </label>
                  </div>
                  <div class="pf-v6-c-form__group-control">
                    <input class="pf-v6-c-form-control" style="width:70%" type="password" autocomplete="off" id="form-hci-shared-file-input-individual-credentials-ipmi-password${i}" name="form-hci-shared-file-input-individual-credentials-ipmi-password1-check${i}" placeholder="비밀번호를 입력하세요." required />
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
                  <label class="pf-v6-c-form__label" for="form-hci-shared-file-input-common-credentials-ipmi-ip${i}">
                    <span class="pf-v6-c-form__label-text">IPMI IP</span>
                    <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
                  </label>
                </div>
                <div class="pf-v6-c-form__group-control">
                  <input class="pf-v6-c-form-control" style="width:70%" type="text" id="form-hci-shared-file-input-common-credentials-ipmi-ip${i}" name="form-hci-shared-file-input-common-credentials-ipmi-ip${i}" placeholder="xxx.xxx.xxx.xxx 형식으로 입력" required />
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
              <label class="pf-v6-c-form__label" for="form-hci-shared-file-input-common-credentials-ipmi-user">
                <span class="pf-v6-c-form__label-text">IPMI 아이디</span>
                <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
              </label>
            </div>
            <div class="pf-v6-c-form__group-control">
              <input class="pf-v6-c-form-control" style="width:70%" type="text" id="form-hci-shared-file-input-common-credentials-ipmi-user" name="form-hci-shared-file-input-common-credentials-ipmi-user" placeholder="아이디를 입력하세요." required />
            </div>
          </div>
        </div>
        <div class="pf-v6-c-form__field-group-body" style="padding-top:0px;">
          <div class="pf-v6-c-form__group" style="padding:0px;">
            <div class="pf-v6-c-form__group-label">
              <label class="pf-v6-c-form__label" for="form-hci-shared-file-input-common-credentials-ipmi-password">
                <span class="pf-v6-c-form__label-text">IPMI 비밀번호</span>
                <span class="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
              </label>
            </div>
            <div class="pf-v6-c-form__group-control">
              <input class="pf-v6-c-form-control" style="width:70%" type="password" autocomplete="off" id="form-hci-shared-file-input-common-credentials-ipmi-password" name="form-hci-shared-file-input-common-credentials-ipmi-password-check" placeholder="비밀번호를 입력하세요." required />
            </div>
          </div>
        </div>
      </div>
  `;

  credentials.insertAdjacentHTML('beforeend',common_credentials_HTML);

  }

}
function setHciSharedFileDiskInfo(){
  var cmd = ["python3", pluginpath + "/python/disk/disk_action.py", "hci-shared-file-list"];

  createLoggerInfo("setDiskInfo() start");

  cockpit.spawn(cmd).then(function(data) {
    // 초기화
    $('#disk-hci-shared-file-pci-list').empty();

    var el = '';
    var result = JSON.parse(data);
    var pci_list = result.val.blockdevices;

    var displayedName = new Set();

    if (pci_list.length > 0) {
      for (var i = 0; i < pci_list.length; i++) {
        var partition_text = '';
        var check_disable = '';

        if (pci_list[i].children != undefined) {
          for (var j = 0; j < pci_list[i].children.length; j++) {
              partition_text = '( Partition exists count : ' + pci_list[i].children.length + ' )';
              check_disable = 'disabled';

              var disk_name = pci_list[i].name;
              if (!displayedName.has(disk_name)) {
                el += '<div class="pf-v6-c-check">';
                el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-hci-shared-file-checkbox-disk' + i + '" name="form-hci-shared-file-checkbox-disk" value="' + pci_list[i].path + '" ' + 'data-disk_id="' + pci_list[i].rbd_path + '" ' + check_disable + ' />';
                // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-hci-shared-file-checkbox-disk' + i + '" name="form-hci-shared-file-checkbox-disk" value="' + pci_list[i].path + '" />';
                el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-hci-shared-file-checkbox-disk' + i + '">' + pci_list[i].path + '\t' + pci_list[i].size + '\t' + pci_list[i].rbd_path + '\t' + partition_text + '</label>';
                el += '</div>';

                displayedName.add(disk_name);
              }

          }
        } else {
          el += '<div class="pf-v6-c-check">';
          el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-hci-shared-file-checkbox-disk' + i + '" name="form-hci-shared-file-checkbox-disk" value="' + pci_list[i].path + '" ' + 'data-disk_id="' + pci_list[i].rbd_path + '" ' + check_disable + ' />';
          // el += '<input class="pf-v6-c-check__input" type="checkbox" id="form-hci-shared-file-checkbox-disk' + i + '" name="form-hci-shared-file-checkbox-disk" value="' + pci_list[i].path + '" />';
          el += '<label class="pf-v6-c-check__label" style="margin-top:5px" for="form-hci-shared-file-checkbox-disk' + i + '">' + pci_list[i].path + '\t' + pci_list[i].size + '\t' + pci_list[i].rbd_path + '\t' + partition_text + '</label>';
          el += '</div>';
        }
      }
    } else {
      el += '<div class="pf-v6-c-check">';
      el += '<label class="pf-v6-c-check__label" style="margin-top:5px">데이터가 존재하지 않습니다.</label>';
      el += '</div>';
    }

    // 일반 장치 정보를 먼저 추가하고, 마지막에 MultiPath 정보를 추가
    $('#disk-hci-shared-file-pci-list').append(el);

  }).catch(function() {
    createLoggerInfo("setDiskInfo error");
  });
}

function HciSharedFileIpmiCheck(){
  return cockpit.spawn(['cat', pluginpath + '/tools/properties/cluster.json']).then(function(data){
    var retVal = JSON.parse(data);
    var hosts = retVal.clusterConfig.hosts;
    var ipmi_port = "623";
    var ipmi_config = "";
    var ipmi_data = [];
    var ipmi_check_value = $('input[name="radio-hci-shared-file-ipmi"]:checked').val();

    if (ipmi_check_value == "common"){
      for(var i = 1; i <= hosts.length; i++){
        var ip = $(`#form-hci-shared-file-input-common-credentials-ipmi-ip${i}`).val() || '';
        if(!ip) break;
        var user = $('#form-hci-shared-file-input-common-credentials-ipmi-user').val();
        var password = $('#form-hci-shared-file-input-common-credentials-ipmi-password').val();
        ipmi_data.push({ip, user, password});
      }
    } else {
      for(var i = 1; i <= hosts.length; i++){
        var ip = $(`#form-hci-shared-file-input-individual-credentials-ipmi-ip${i}`).val() || '';
        var user = $(`#form-hci-shared-file-input-individual-credentials-ipmi-user${i}`).val() || '';
        var password = $(`#form-hci-shared-file-input-individual-credentials-ipmi-password${i}`).val() || '';
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
        $('#button-next-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
        $('#button-before-step-modal-hci-shared-file-wizard-config').attr('disabled', false);
        $('#button-cancel-config-modal-hci-shared-file-wizard-config').attr('disabled', false);
        $('#button-next-step-modal-hci-shared-file-wizard-config').html('배포');
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
function SharedVolumeSizeNumberLimit() {
  var input = document.getElementById('form-input-hci-file-volume');
  var maxDigits = 5;

  if (!input) {
   return;
  }

  // 중복 바인딩 방지
  if (input.dataset.digitLimitBound === '1') {
   return;
  }
  input.dataset.digitLimitBound = '1';

  input.addEventListener('input', function (e) {
   var value = String(e.target.value || '');

   // 숫자만 남기기
   value = value.replace(/[^0-9]/g, '');

   // 6자리 초과 시 자르기
   if (value.length > maxDigits) {
    value = value.slice(0, maxDigits);
   }

   e.target.value = value;
  });
 }
