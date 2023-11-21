/**
 * File Name : storage-vm-wizard.js
 * Date Created : 2020.02.19
 * Writer  : 박동혁
 * Description : 스토리지센터 VM 배포 마법사에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// 변수 선언
var cur_step_wizard_vm_config = "1";
var xml_create_cmd;
var completed = false;
var option_scvm = "-scvm";

// Document.ready 시작
$(document).ready(function(){
    // 스토리지센터 가상머신 배포 마법사 페이지 준비
    $('#div-modal-wizard-vm-config-compute').hide();
    $('#div-modal-wizard-vm-config-disk').hide();
    $('#div-modal-wizard-vm-config-network').hide();
    $('#div-modal-wizard-vm-config-additional').hide();
    $('#div-modal-wizard-vm-config-ssh-key').hide();
    $('#div-modal-wizard-vm-config-review').hide();
    $('#div-modal-wizard-vm-config-deploy').hide();
    $('#div-modal-wizard-vm-config-finish').hide();

    $('#div-form-hosts-file-scvm').hide();
    $('#div-form-hosts-table-scvm').hide();

    $('#div-accordion-storage-vm-device-conifg').hide();
    $('#div-accordion-storage-vm-additional').hide();
    $('#div-accordion-storage-vm-ssh-key').hide();

    // $('#nav-button-review').addClass('pf-m-disabled');
    $('#nav-button-finish').addClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-vm-config').attr('disabled', false);

    // 첫번째 스텝에서 시작
    cur_step_wizard_vm_config = "1";

    //디스크 구성방식 초기 세팅
    setDiskInfo();

    //관리 NIC용 Bridge 리스트 초기 세팅
    setNicBridge('form-select-storage-vm-mngt-nic');

    //스토리지 트래픽 구성 리스트 NIC Passthrough로 초기 세팅
    setNicPassthrough('form-select-storage-vm-public-nic1');
    setNicPassthrough('form-select-storage-vm-cluster-nic1');

    //hosts 파일 선택 이벤트 세팅
    // setHostsFileReader($('#form-input-storage-vm-hosts-file'), 'hosts', setScvmNetworkInfo);

    //ssh 개인 key 파일 선택 이벤트 세팅
    setSshKeyFileReader($('#form-input-storage-vm-ssh-private-key-file'), 'id_rsa', setScvmSshPrivateKeyInfo);

    //ssh 공개 key 파일 선택 이벤트 세팅
    setSshKeyFileReader($('#form-input-storage-vm-ssh-public-key-file'), 'id_rsa.pub', setScvmSshPublicKeyInfo);

    //SSH Key 정보 자동 세팅
    settingSshKey(option_scvm);

    //현재 호스트 명 세팅
    checkHostName(option_scvm);

    $('#form-radio-hosts-file-scvm').click();
});
// document ready 끝

// 이벤트 처리 함수
$('#button-close-modal-wizard-storage-vm').on('click', function(){
    $('#div-modal-wizard-storage-vm').hide();
    if(completed){
        //상태값 초기화 겸 페이지 리로드
        location.reload();
    }
});

// '다음' 버튼 클릭 시 이벤트를 처리하기 위한 함수
$('#button-next-step-modal-wizard-vm-config').on('click', function(){
    if (cur_step_wizard_vm_config == "1") {
        $('#div-modal-wizard-vm-config-overview').hide();
        $('#div-modal-wizard-vm-config-compute').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-overview').removeClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-compute').addClass('pf-m-current');

        cur_step_wizard_vm_config = "2";
    }
    else if (cur_step_wizard_vm_config == "2") {
        $('#div-modal-wizard-vm-config-compute').hide();
        $('#div-modal-wizard-vm-config-disk').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-compute').removeClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-disk').addClass('pf-m-current');

        cur_step_wizard_vm_config = "3";
    }
    else if (cur_step_wizard_vm_config == "3") {
        $('#div-modal-wizard-vm-config-disk').hide();
        $('#div-modal-wizard-vm-config-network').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-disk').removeClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-network').addClass('pf-m-current');

        cur_step_wizard_vm_config = "4";
    }
    else if (cur_step_wizard_vm_config == "4") {
        $('#div-modal-wizard-vm-config-network').hide();
        $('#div-modal-wizard-vm-config-additional').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-network').removeClass('pf-m-current');
        $('#nav-button-vm-config').removeClass('pf-m-current');
        $('#nav-button-additional').addClass('pf-m-current');

        cur_step_wizard_vm_config = "5";
    }
    else if (cur_step_wizard_vm_config == "5") {
        $('#div-modal-wizard-vm-config-additional').hide();
        $('#div-modal-wizard-vm-config-ssh-key').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-additional').removeClass('pf-m-current');
        $('#nav-button-vm-config').removeClass('pf-m-current');
        $('#nav-button-ssh-key').addClass('pf-m-current');

        cur_step_wizard_vm_config = "6";
    }
    else if (cur_step_wizard_vm_config == "6") {

        // review 정보 세팅
        setReviewInfo();

        $('#div-modal-wizard-vm-config-ssh-key').hide();
        $('#div-modal-wizard-vm-config-review').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-ssh-key').removeClass('pf-m-current');
        $('#nav-button-vm-config').removeClass('pf-m-current');
        $('#nav-button-review').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-vm-config').html('배포');

        cur_step_wizard_vm_config = "7";
    }
    else if (cur_step_wizard_vm_config == "7") {
        $('#div-modal-storage-wizard-confirm').show();
    }
    else if (cur_step_wizard_vm_config == "8") {

    }
    else if (cur_step_wizard_vm_config == "9") {

    }
});

// '이전' 버튼 클릭 시 이벤트를 처리하기 위한 함수
$('#button-before-step-modal-wizard-vm-config').on('click', function(){
    if (cur_step_wizard_vm_config == "1") {
        // 이전 버튼 없음
    }
    else if (cur_step_wizard_vm_config == "2") {
        // 1번 스텝으로 이동
        $('#div-modal-wizard-vm-config-overview').show();
        $('#div-modal-wizard-vm-config-compute').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
        $('#nav-button-overview').addClass('pf-m-current');
        $('#nav-button-vm-config').removeClass('pf-m-current');
        $('#nav-button-compute').removeClass('pf-m-current');

        // 1번으로 변수값 변경
        cur_step_wizard_vm_config = "1";
    }
    else if (cur_step_wizard_vm_config == "3") {
        $('#div-modal-wizard-vm-config-compute').show();
        $('#div-modal-wizard-vm-config-disk').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-compute').addClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-disk').removeClass('pf-m-current');

        cur_step_wizard_vm_config = "2";
    }
    else if (cur_step_wizard_vm_config == "4") {
        $('#div-modal-wizard-vm-config-disk').show();
        $('#div-modal-wizard-vm-config-network').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-disk').addClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-network').removeClass('pf-m-current');

        cur_step_wizard_vm_config = "3";
    }
    else if (cur_step_wizard_vm_config == "5") {
        $('#div-modal-wizard-vm-config-network').show();
        $('#div-modal-wizard-vm-config-additional').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-network').addClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-additional').removeClass('pf-m-current');

        cur_step_wizard_vm_config = "4";
    }
    else if (cur_step_wizard_vm_config == "6") {
        $('#div-modal-wizard-vm-config-additional').show();
        $('#div-modal-wizard-vm-config-ssh-key').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-additional').addClass('pf-m-current');
        $('#nav-button-ssh-key').removeClass('pf-m-current');

        cur_step_wizard_vm_config = "5";
    }
    else if (cur_step_wizard_vm_config == "7") {
        $('#div-modal-wizard-vm-config-ssh-key').show();
        $('#div-modal-wizard-vm-config-review').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-ssh-key').addClass('pf-m-current');
        $('#nav-button-review').removeClass('pf-m-current');

        $('#button-next-step-modal-wizard-vm-config').html('다음');

        cur_step_wizard_vm_config = "6";
    }
    else if (cur_step_wizard_vm_config == "8") {

    }
    else if (cur_step_wizard_vm_config == "9") {

    }
});

// 취소 버튼 클릭 이벤트 처리
/*
$('#button-cancel-config-modal-wizard-vm-config').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    // Form에 입력된 모든 데이터를 초기화한다.
    cur_step_wizard_vm_config = "1";

    $('#div-modal-wizard-vm-config-overview').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-overview').addClass('pf-m-current');

    // 모달 창을 닫는다.
    $('#div-modal-wizard-storage-vm').hide();
});
*/
// 마법사 Side 버튼 이벤트 처리
$('#nav-button-overview').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-overview').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-overview').addClass('pf-m-current');

    cur_step_wizard_vm_config = "1";
});

$('#nav-button-vm-config').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-compute').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-vm-config').addClass('pf-m-current');
    $('#nav-button-compute').addClass('pf-m-current');

    cur_step_wizard_vm_config = "2";
});

$('#nav-button-compute').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-compute').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-vm-config').addClass('pf-m-current');
    $('#nav-button-compute').addClass('pf-m-current');

    cur_step_wizard_vm_config = "2";
});

$('#nav-button-disk').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-disk').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-vm-config').addClass('pf-m-current');
    $('#nav-button-disk').addClass('pf-m-current');

    cur_step_wizard_vm_config = "3";
});

$('#nav-button-network').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-network').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-vm-config').addClass('pf-m-current');
    $('#nav-button-network').addClass('pf-m-current');

    cur_step_wizard_vm_config = "4";
});

$('#nav-button-additional').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-additional').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-additional').addClass('pf-m-current');

    cur_step_wizard_vm_config = "5";
});

$('#nav-button-ssh-key').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-ssh-key').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-ssh-key').addClass('pf-m-current');

    cur_step_wizard_vm_config = "6";
});

$('#nav-button-review').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    // review 정보 세팅
    setReviewInfo();

    $('#div-modal-wizard-vm-config-review').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-review').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-vm-config').html('배포');

    cur_step_wizard_vm_config = "7";
});

$('#nav-button-finish').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-finish').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-finish').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-vm-config').hide();
    $('#button-before-step-modal-wizard-vm-config').hide();
    $('#button-cancel-config-modal-wizard-vm-config').hide();

    cur_step_wizard_vm_config = "9";
});

// 설정확인 단계의 아코디언 개체에서 발생하는 이벤트의 처리
$('#button-accordion-storage-vm-device-conifg').on('click', function(){
    if ($('#button-accordion-storage-vm-device-conifg').attr("aria-expanded") == "false") {
        $('#button-accordion-storage-vm-device-conifg').attr("aria-expanded", "true");
        $('#button-accordion-storage-vm-device-conifg').addClass("pf-m-expanded");
        $('#div-accordion-storage-vm-device-conifg').fadeIn();
        $('#div-accordion-storage-vm-device-conifg').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-storage-vm-device-conifg').attr("aria-expanded", "false");
        $('#button-accordion-storage-vm-device-conifg').removeClass("pf-m-expanded");
        $('#div-accordion-storage-vm-device-conifg').fadeOut();
        $('#div-accordion-storage-vm-device-conifg').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-storage-vm-additional').on('click', function(){
    if ($('#button-accordion-storage-vm-additional').attr("aria-expanded") == "false") {
        $('#button-accordion-storage-vm-additional').attr("aria-expanded", "true");
        $('#button-accordion-storage-vm-additional').addClass("pf-m-expanded");
        $('#div-accordion-storage-vm-additional').fadeIn();
        $('#div-accordion-storage-vm-additional').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-storage-vm-additional').attr("aria-expanded", "false");
        $('#button-accordion-storage-vm-additional').removeClass("pf-m-expanded");
        $('#div-accordion-storage-vm-additional').fadeOut();
        $('#div-accordion-storage-vm-additional').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-storage-vm-ssh-key').on('click', function(){
    if ($('#button-accordion-storage-vm-ssh-key').attr("aria-expanded") == "false") {
        $('#button-accordion-storage-vm-ssh-key').attr("aria-expanded", "true");
        $('#button-accordion-storage-vm-ssh-key').addClass("pf-m-expanded");
        $('#div-accordion-storage-vm-ssh-key').fadeIn();
        $('#div-accordion-storage-vm-ssh-key').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-storage-vm-ssh-key').attr("aria-expanded", "false");
        $('#button-accordion-storage-vm-ssh-key').removeClass("pf-m-expanded");
        $('#div-accordion-storage-vm-ssh-key').fadeOut();
        $('#div-accordion-storage-vm-ssh-key').removeClass("pf-m-expanded");
    }
});

// Host 파일 준비 방법 중 신규생성을 클릭하는 경우 Host 프로파일 디비전을 보여주고 Hosts 파일 디비전은 숨긴다.
$('#form-radio-hosts-new-scvm').on('click', function () {
    $('#div-form-hosts-profile-scvm').show();
    $('#div-form-hosts-file-scvm').hide();
    $('#div-form-hosts-table-scvm').hide();
    $('#div-form-hosts-input-number-scvm').show();
    $('#div-form-hosts-input-current-number-scvm').show();
    $('#form-input-cluster-config-host-number-scvm').val(3);
    // "기존 파일 사용"에서 "신규 생성"을 클릭하면 초기화 된다.
    $("#form-table-tbody-cluster-config-new-host-profile-scvm").empty();
    clusterConfigTableChange("form-input-cluster-config-host-number-scvm", "form-table-tbody-cluster-config-new-host-profile-scvm");
    resetScvmNetworkInfo();
    //$('#form-input-cluster-config-current-host-number-scvm').val(1);
    $('#form-input-cluster-config-host-number-plus-scvm').removeAttr('disabled');
    $('#form-input-cluster-config-host-number-minus-scvm').removeAttr('disabled');
    $('#form-input-cluster-config-host-number-scvm').removeAttr('disabled');
    $('#form-table-tbody-cluster-config-existing-host-profile-scvm tr').remove();
    // $('#form-input-storage-vm-hosts-file').val("");

    $("#form-input-ccvm-mngt-ip").val("");
    $("#form-input-ccvm-mngt-ip").attr('disabled', false);
});

// Host 파일 준비 방법 중 기존 파일 사용을 클릭하는 경우 Host 프로파일 디비전을 숨기고 Hosts 파일 디비전은 보여준다.
$('#form-radio-hosts-file-scvm').on('click', function () {
    $('#div-form-hosts-profile-scvm').hide();
    $('#div-form-hosts-file-scvm').show();
    $('#div-form-hosts-table-scvm').show();
    $('#div-form-hosts-input-number-scvm').show();
    $('#div-form-hosts-input-current-number-scvm').show();
    $('#form-input-cluster-config-host-number-scvm').val(0);
    $("#form-table-tbody-cluster-config-existing-host-profile-scvm").empty();
    clusterConfigTableChange("form-input-cluster-config-host-number-scvm", "form-table-tbody-cluster-config-existing-host-profile-scvm");
    resetScvmNetworkInfo();
    // $('#form-input-cluster-config-current-host-number-scvm').val(1);
    $('#form-input-cluster-config-host-number-plus-scvm').attr('disabled', 'true');
    $('#form-input-cluster-config-host-number-minus-scvm').attr('disabled', 'true');
    $('#form-input-cluster-config-host-number-scvm').attr('disabled', 'true');

    $("#form-input-ccvm-mngt-ip").val("");
    $("#form-input-ccvm-mngt-ip").attr('disabled', true);

    cockpit.spawn(["cat", pluginpath + "/tools/properties/cluster.json"])
    .then(function(data){
        var clusterJsonConf = JSON.parse(data);
        settingProfile(clusterJsonConf, option_scvm);
    })
    .catch(function(data){
        createLoggerInfo("cluster.json 파일 읽기 실패");
        console.log("cluster.json 파일 읽기 실패" + data);
    });

});

// Host 파일 준비 중 "현재 호스트 번호"를 변경하는 '+', '-' 기능
// $('#form-input-cluster-config-current-host-number-plus-scvm').on('click', function () {
//     let total_host_num_val = $('#form-input-cluster-config-host-number-scvm').val();
//     let n = $('.bt_up').index(this);
//     let num = $("#form-input-cluster-config-current-host-number-scvm:eq(" + n + ")").val();
//     if (num*1 < total_host_num_val*1) {
//         num = $("#form-input-cluster-config-current-host-number-scvm:eq(" + n + ")").val(num * 1 + 1);
//     }
// });
// $('#form-input-cluster-config-current-host-number-minus-scvm').on('click', function () {
//     let n = $('.bt_down').index(this);
//     let num = $("#form-input-cluster-config-current-host-number-scvm:eq(" + n + ")").val();
//     if (num > 1) {
//         num = $("#form-input-cluster-config-current-host-number-scvm:eq(" + n + ")").val(num * 1 - 1);
//         return;
//     }
// });
// $('#form-input-cluster-config-current-host-number-scvm').on('propertychange change keyup paste input', function () {
//     let total_host_num_val = $('#form-input-cluster-config-host-number-scvm').val();
//     if (this.value <= 0 || this.value > 99) {
//         this.value = total_host_num_val;
//     }else if(this.value*1 > total_host_num_val*1) {
//         this.value = total_host_num_val;
//         return;
//     }
// });

// Host 파일 준비 중 "구성할 호스트"를 변경하는 '+', '-' 기능
// $('#form-input-cluster-config-host-number-plus-scvm').on('click', function () {
//     let n = $('.bt_up').index(this);
//     let num = $("#form-input-cluster-config-host-number-scvm:eq(" + n + ")").val();
//     num = $("#form-input-cluster-config-host-number-scvm:eq(" + n + ")").val(num * 1 + 1);
// });
// $('#form-input-cluster-config-host-number-minus-scvm').on('click', function () {
//     let current_host_num_val = $('#form-input-cluster-config-current-host-number-scvm').val();
//     let n = $('.bt_down').index(this);
//     let num = $("#form-input-cluster-config-host-number-scvm:eq(" + n + ")").val();
//     if (current_host_num_val >= num && num != 1) {
//         $('#form-input-cluster-config-current-host-number-scvm').val(num * 1 - 1)
//     }
//     if (num > 1) {
//         num = $("#form-input-cluster-config-host-number-scvm:eq(" + n + ")").val(num * 1 - 1);
//         return;
//     }
// });
// $('#form-input-cluster-config-host-number-scvm').on('propertychange change keyup paste input', function () {
//     let current_host_num_val = $('#form-input-cluster-config-current-host-number-scvm').val();
//     current_host_num_val = current_host_num_val*1;
//     if (this.value <= 0 || this.value > 99) {
//         this.value = 1;
//         alert("1~99까지의 숫자만 입력할 수 있습니다.")
//         return;
//     }else if(this.value < current_host_num_val) {
//         $('#form-input-cluster-config-current-host-number-scvm').val(this.value)
//         let option = "-scvm";
//         changeAlias2(option);
//         return;
//     }
// });

// Host 파일 준비 중 "구성할 호스트"를 변경하는 '+', '-' 기능
$('#form-input-cluster-config-host-number-plus-scvm').on('click', function () {
    let num = $("#form-input-cluster-config-host-number-scvm").val();
    $("#form-input-cluster-config-host-number-scvm").val(num * 1 + 1);

    clusterConfigTableChange("form-input-cluster-config-host-number-scvm", "form-table-tbody-cluster-config-new-host-profile-scvm");
});
$('#form-input-cluster-config-host-number-minus-scvm').on('click', function () {
    let num = $("#form-input-cluster-config-host-number-scvm").val();
    if(num > 3){
        $('#form-input-cluster-config-host-number-scvm').val(num * 1 - 1)
        clusterConfigTableChange("form-input-cluster-config-host-number-scvm", "form-table-tbody-cluster-config-new-host-profile-scvm");
    }
});

$('#form-input-cluster-config-host-number-scvm').on('change', function () {

    if (this.value < 3 || this.value > 99) {
        this.value = 3;
        alert("3~99까지의 숫자만 입력할 수 있습니다.")
        clusterConfigTableChange("form-input-cluster-config-host-number-scvm", "form-table-tbody-cluster-config-new-host-profile-scvm");
        return;
    } else {
        clusterConfigTableChange("form-input-cluster-config-host-number-scvm", "form-table-tbody-cluster-config-new-host-profile-scvm");
    }
});
// Host 파일 준비 중 신규생성을 선택한 경우 Host 수에 따라 텍스트 값 변경
// $('#form-input-cluster-config-host-number-scvm, #form-input-cluster-config-host-number-plus-scvm, #form-input-cluster-config-host-number-minus-scvm' +
// ', #form-input-cluster-config-current-host-number-scvm, #form-input-cluster-config-current-host-number-plus-scvm, #form-input-cluster-config-current-host-number-minus-scvm').on('change click', function () {

//     let current_host_num_val = $('#form-input-cluster-config-current-host-number-scvm').val();
//     let total_host_num_val = $('#form-input-cluster-config-host-number-scvm').val();
//     if (total_host_num_val <= 99 && current_host_num_val <= 99) {
//         let target_table = $("#form-table-tbody-cluster-config-new-host-profile-scvm");
//         target_table.empty();
//         let insert_tr;
//         insert_tr += "<tr>";
//         insert_tr += "<td contenteditable='true'>192.168.0.10</td>";
//         insert_tr += "<td contenteditable='flase'>ccvm-mngt</td>";
//         insert_tr += "<td contenteditable='flase'>ccvm</td>";
//         insert_tr += "</tr>";

//         for (let i = 1; i <= total_host_num_val; i++) {
//             let sum = 0 + i;
//             insert_tr += "<tr>";
//             insert_tr += "<td contenteditable='true'>192.168.1."+ sum +"</td>";
//             insert_tr += "<td contenteditable='true'>ablecube"+ i +"</td>";
//             if(current_host_num_val == sum) {
//                 insert_tr += "<td contenteditable='true'>ablecube</td>";
//             }else {
//                 insert_tr += "<td contenteditable='flase'></td>";
//             }
//             insert_tr += "</tr>";
//         }
//         for (let i = 1; i <= total_host_num_val; i++) {
//             let sum = 0 + i;
//             insert_tr += "<tr>";
//             insert_tr += "<td contenteditable='true'>192.168.2."+ sum +"</td>";
//             insert_tr += "<td contenteditable='flase'>scvm"+ i +"-mngt</td>";
//             if(current_host_num_val == sum) {
//                 insert_tr += "<td contenteditable='flase'>scvm-mngt</td>";
//             }else {
//                 insert_tr += "<td contenteditable='flase'></td>";
//             }
//             insert_tr += "</tr>";
//         }
//         for (let i = 1; i <= total_host_num_val; i++) {
//             let sum = 0 + i;
//             insert_tr += "<tr>";
//             insert_tr += "<td contenteditable='true'>100.100.10."+ sum +"</td>";
//             insert_tr += "<td contenteditable='true'>ablecube"+ i +"-pn" +"</td>";
//             if(current_host_num_val == sum) {
//                 insert_tr += "<td contenteditable='true'>ablecube-pn</td>";
//             }else {
//                 insert_tr += "<td contenteditable='flase'></td>";
//             }
//             insert_tr += "</tr>";
//         }
//         for (let i = 1; i <= total_host_num_val; i++) {
//             let sum = 100 + i;
//             insert_tr += "<tr>";
//             insert_tr += "<td contenteditable='true'>100.100.10."+ sum +"</td>";
//             insert_tr += "<td contenteditable='flase'>scvm"+ i +"</td>";
//             if(current_host_num_val == sum-100) {
//                 insert_tr += "<td contenteditable='flase'>scvm</td>";
//             }else {
//                 insert_tr += "<td contenteditable='flase'></td>";
//             }
//             insert_tr += "</tr>";
//         }
//         for (let i = 1; i <= total_host_num_val; i++) {
//             let sum = 10 + i;
//             insert_tr += "<tr>";
//             insert_tr += "<td contenteditable='true'>100.200.10."+ sum +"</td>";
//             insert_tr += "<td contenteditable='flase'>scvm"+ i +"-cn</td>";
//             if(current_host_num_val == sum-10) {
//                 insert_tr += "<td contenteditable='flase'>scvm-cn</td>";
//             }else {
//                 insert_tr += "<td contenteditable='flase'></td>";
//             }
//             insert_tr += "</tr>";
//         }
//         $("#form-table-cluster-config-new-host-profile-scvm").append(insert_tr);

//     } else {
//         $('#form-input-cluster-config-host-number-scvm').val(99);
//         $('#form-input-cluster-config-current-host-number-scvm').val(99);
//         alert("1~99까지의 숫자만 입력할 수 있습니다.");
//     }
//     // 기존 파일 사용 시, 현재 호스트 + 또는 - 클릭 시 Alias2 변경
//     let option = "-scvm";
//     changeAlias2(option);
// });

// Hosts 기존 파일 선택 시 hidden textarea 내용을 선택한 파일의 내용으로 변경
// $('#form-input-storage-vm-hosts-file').on('click', function () {
//     let hosts_input = document.querySelector('#form-input-storage-vm-hosts-file');
//     let file_type = "cluster.json";
//     fileReaderIntoTableFunc(hosts_input, file_type, option_scvm);

//     $('#form-input-storage-vm-hosts-file').val("");
// });
// Hosts 기존 파일 선택 시, 파일 선택 취소 시 table 초기화
// $('#form-input-storage-vm-hosts-file').on('change', function () {
//     if ($(this).val() == "") {
//         $('#form-table-tbody-cluster-config-existing-host-profile-scvm tr').remove();
//     }
// });

// 마법사 "배포 실행 버튼 모달창"
$('#button-cancel-modal-storage-wizard-confirm').on('click', function () {
    $('#div-modal-storage-wizard-confirm').hide();
});
$('#button-close-modal-storage-wizard-confirm').on('click', function () {
    $('#div-modal-storage-wizard-confirm').hide();
});
// 마법사 "배포 버튼 모달창" 실행 버튼을 눌러 가상머신 배포
$('#button-execution-modal-storage-wizard-confirm').on('click', function () {
    $('#div-modal-storage-wizard-confirm').hide();
    if(validateStorageVm()){
        // 배포 버튼을 누르면 배포 진행 단계로 이동한다.
        hideAllMainBody();
        resetCurrentMode();

        $('#div-modal-wizard-vm-config-deploy').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', true);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);

        $('#nav-button-finish').addClass('pf-m-current');

        cur_step_wizard_vm_config = "8";

        deployStorageCenterVM();
    }
});

// 마법사 "취소 버튼 모달창" show, hide
$('#button-cancel-config-modal-wizard-vm-config').on('click', function () {
    $('#div-modal-cancel-storage-wizard-cancel').show();
});
$('#button-close-modal-storage-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-storage-wizard-cancel').hide();
});
$('#button-cancel-modal-storage-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-storage-wizard-cancel').hide();
});
// 마법사 "취소 버튼 모달창" 실행 버튼을 눌러 취소를 실행
$('#button-execution-modal-storage-wizard-cancel').on('click', function () {
    // $('#div-modal-cancel-storage-wizard-cancel').hide();
    // $('#div-modal-wizard-storage-vm').hide();
    // // hosts
    // $('#form-radio-hosts-new-scvm').prop('checked', true);
    // $('#form-radio-hosts-file-scvm').prop('checked', false);
    // $('#form-input-cluster-config-hosts-file').val("");
    // $('#form-textarea-cluster-config-existing-host-profile').val("");
    // $('#div-form-hosts-profile').show();
    // $('#div-form-hosts-file').hide();
    // $('#div-form-hosts-table').hide();
    // $('#div-form-hosts-input-number').show();
    // $('#div-form-hosts-input-current-number').show();
    // // hosts 입력 테이블 초기화
    // $('#form-table-tbody-cluster-config-new-host-profile tr').remove();
    // $('#form-table-tbody-cluster-config-existing-host-profile tr').remove();
    // $('#form-input-cluster-config-host-number').val(1);
    // $('#form-input-cluster-config-currnt-host-number').val(1);
    //상태값 초기화 겸 페이지 리로드
    location.reload();
});

/**
 * Meathod Name : hideAllMainBody
 * Date Created : 2021.02.22
 * Writer  : 박동혁
 * Description : 마법사 대화상자의 모든 Main Body Division 숨기기
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.02.22 최초 작성
 */
function hideAllMainBody() {
    $('#div-modal-wizard-vm-config-overview').hide();
    $('#div-modal-wizard-vm-config-compute').hide();
    $('#div-modal-wizard-vm-config-disk').hide();
    $('#div-modal-wizard-vm-config-network').hide();
    $('#div-modal-wizard-vm-config-additional').hide();
    $('#div-modal-wizard-vm-config-ssh-key').hide();
    $('#div-modal-wizard-vm-config-review').hide();
    $('#div-modal-wizard-vm-config-deploy').hide();
    $('#div-modal-wizard-vm-config-finish').hide();

    $('#button-next-step-modal-wizard-vm-config').html('다음');
}

/**
 * Meathod Name : resetCurrentMode
 * Date Created : 2021.02.22
 * Writer  : 박동혁
 * Description : 마법사 대화상자의 측면 버튼의 '현재 위치'를 모두 리셋
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.02.22 최초 작성
 */
function resetCurrentMode() {
    $('#nav-button-overview').removeClass('pf-m-current');
    $('#nav-button-vm-config').removeClass('pf-m-current');
    $('#nav-button-compute').removeClass('pf-m-current');
    $('#nav-button-disk').removeClass('pf-m-current');
    $('#nav-button-network').removeClass('pf-m-current');
    $('#nav-button-additional').removeClass('pf-m-current');
    $('#nav-button-ssh-key').removeClass('pf-m-current');
    $('#nav-button-review').removeClass('pf-m-current');
    $('#nav-button-finish').removeClass('pf-m-current');
}

/**
 * Meathod Name : deployStorageCenterVM
 * Date Created : 2021.02.25
 * Writer  : 박동혁
 * Description : 가상머신을 배포하는 작업을 화면에 표시하도록 하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.02.25 최초 작성
 * History  : 2021.03.17 기능 구현
 */
function deployStorageCenterVM() {

    var console_log = true;

    // 하단 버튼 숨김
    $('#button-next-step-modal-wizard-vm-config').hide();
    $('#button-before-step-modal-wizard-vm-config').hide();
    $('#button-cancel-config-modal-wizard-vm-config').hide();

    // 왼쪽 사이드 버튼 전부 비활성화
    $('#nav-button-overview').addClass('pf-m-disabled');
    $('#nav-button-vm-config').addClass('pf-m-disabled');
    $('#nav-button-compute').addClass('pf-m-disabled');
    $('#nav-button-disk').addClass('pf-m-disabled');
    $('#nav-button-network').addClass('pf-m-disabled');
    $('#nav-button-additional').addClass('pf-m-disabled');
    $('#nav-button-ssh-key').addClass('pf-m-disabled');
    $('#nav-button-review').addClass('pf-m-disabled');

    createLoggerInfo("deployStorageCenterVM start");

    //=========== 1. 스토리지센터 가상머신 초기화 작업 ===========
    // 설정 초기화 ( 필요시 python까지 종료 )
    seScvmProgressStep("span-progress-step1",1);
    var reset_storage_center_cmd = ['python3', pluginpath + '/python/vm/reset_storage_center.py'];
    if(console_log){console.log(reset_storage_center_cmd);}
    cockpit.spawn(reset_storage_center_cmd)
        .then(function(data){
            //결과 값 json으로 return
            var reset_storage_center_result = JSON.parse(data);
            if(reset_storage_center_result.code=="200") { //정상
                //=========== 2. cloudinit iso 파일 생성 ===========
                // host 파일 /usr/share/cockpit/ablestack/tools/vmconfig/scvm/cloudinit 경로에 hosts, ssh key 파일 저장
                seScvmProgressStep("span-progress-step1",2);
                seScvmProgressStep("span-progress-step2",1);

                var host_name = $('#form-input-storage-vm-hostname').val();
                var mgmt_ip = $('#form-input-storage-vm-mgmt-ip').val().split("/")[0];
                var mgmt_prefix = $('#form-input-storage-vm-mgmt-ip').val().split("/")[1];
                var mgmt_gw = $('#form-input-storage-vm-mgmt-gw').val();
                var pn_ip = $('#form-input-storage-vm-public-ip').val().split("/")[0];
                var pn_prefix = $('#form-input-storage-vm-public-ip').val().split("/")[1];
                var cn_ip = $('#form-input-storage-vm-cluster-ip').val().split("/")[0];
                var cn_prefix = $('#form-input-storage-vm-cluster-ip').val().split("/")[1];
                var dns = $('#form-input-storage-vm-dns').val();

                var create_scvm_cloudinit_cmd = ['python3', pluginpath + '/python/vm/create_scvm_cloudinit.py'
                                        ,"-f1",pluginpath+"/tools/vmconfig/scvm/hosts","-t1", $("#div-textarea-cluster-config-confirm-hosts-file-scvm").val() // hosts 파일
                                        ,"-f2",pluginpath+"/tools/vmconfig/scvm/id_rsa","-t2", $("#form-textarea-storage-vm-ssh-private-key-file").val() // ssh 개인 key 파일
                                        ,"-f3",pluginpath+"/tools/vmconfig/scvm/id_rsa.pub","-t3", $("#form-textarea-storage-vm-ssh-public-key-file").val() // ssh 공개 key 파일
                                        ,"--hostname",host_name
                                        ,"--mgmt-ip",mgmt_ip
                                        ,"--mgmt-prefix",mgmt_prefix
                                        ,"--pn-ip",pn_ip
                                        ,"--pn-prefix",pn_prefix
                                        ,"--cn-ip",cn_ip
                                        ,"--cn-prefix",cn_prefix
                                    ];
                if(mgmt_gw != ""){
                    create_scvm_cloudinit_cmd.push('--mgmt-gw',mgmt_gw);
                }
                if(dns != ""){
                    create_scvm_cloudinit_cmd.push('--dns',dns);
                }
                if(console_log){console.log(create_scvm_cloudinit_cmd);}
                cockpit.spawn(create_scvm_cloudinit_cmd)
                    .then(function(data){
                        //결과 값 json으로 return
                        var create_scvm_cloudinit_result = JSON.parse(data);
                        if(create_scvm_cloudinit_result.code=="200"){
                            //=========== 3. 스토리지센터 가상머신 구성 ===========
                            seScvmProgressStep("span-progress-step2",2);
                            seScvmProgressStep("span-progress-step3",1);
                            if(console_log){console.log(xml_create_cmd);}
                            cockpit.spawn(xml_create_cmd)
                                .then(function(data){
                                    //결과 값 json으로 return
                                    var create_scvm_xml_result = JSON.parse(data);
                                    if(create_scvm_xml_result.code=="200"){
                                        //=========== 4. 스토리지센터 가상머신 배포 ===========
                                        //클러스터 생성
                                        seScvmProgressStep("span-progress-step3",2);
                                        seScvmProgressStep("span-progress-step4",1);
                                        var pcs_config = ['python3', pluginpath + '/python/vm/setup_storage_vm.py'];
                                        if(console_log){console.log(pcs_config);}
                                        cockpit.spawn(pcs_config)
                                            .then(function(data){
                                                //결과 값 json으로 return
                                                var result = JSON.parse(data);
                                                if(result.code=="200"){
                                                    seScvmProgressStep("span-progress-step4",2);
                                                    createLoggerInfo("deployStorageCenterVM success");

                                                    //최종 화면 호출
                                                    showDivisionVMConfigFinish();
                                                } else {
                                                    setScvmProgressFail(4);
                                                    createLoggerInfo(result.val);
                                                    alert(result.val);
                                                }
                                            })
                                            .catch(function(data){
                                                setScvmProgressFail(4);
                                                createLoggerInfo("Storage Center Virtual Machine Deployment Failed");
                                                alert("스토리지센터 가상머신 배포 실패 : "+data);
                                            });
                                    } else {
                                        setScvmProgressFail(3);
                                        createLoggerInfo(create_scvm_xml_result.val);
                                        alert(create_scvm_xml_result.val);
                                    }
                                })
                                .catch(function(data){
                                    setScvmProgressFail(3);
                                    createLoggerInfo("Storage center virtual machine configuration failed");
                                    alert("스토리지센터 가상머신 구성 실패 : "+data);
                                });
                        } else {
                            setScvmProgressFail(2);
                            createLoggerInfo(create_scvm_cloudinit_result.val);
                            alert(create_scvm_cloudinit_result.val);
                        }
                    })
                    .catch(function(data){
                        setScvmProgressFail(2);
                        createLoggerInfo("Failed to create cloudinit iso file");
                        alert("cloudinit iso 파일 생성 실패 : "+data);
                    });

            } else {
                setScvmProgressFail(1);
                createLoggerInfo(reset_storage_center_result.val);
                alert(reset_storage_center_result.val);
            }
        })
        .catch(function(data){
            setScvmProgressFail(1);
            createLoggerInfo("Storage center virtual machine initialization operation failed");
            alert("스토리지센터 가상머신 초기화 작업 실패 : "+data);
        });
}

/**
 * Meathod Name : showDivisionVMConfigFinish
 * Date Created : 2021.02.25
 * Writer  : 박동혁
 * Description : 가상머신을 배포한 후 마지막 페이지를 보여주는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.02.25 최초 작성
 */
function showDivisionVMConfigFinish() {
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-finish').show();
    $('#nav-button-finish').addClass('pf-m-current');
    $('#nav-button-finish').removeClass('pf-m-disabled');

    completed = true;

    cur_step_wizard_vm_config = "9";
}

/**
 * Meathod Name : setDiskInfo
 * Date Created : 2021.03.16
 * Writer  : 배태주
 * Description : 디스크 정보를 호출하여 raid passhtrough할 디스크 리스트를 세팅하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.16 최초 작성
 */
function setDiskInfo(){
    var cmd = ["python3",pluginpath + "/python/disk/disk_action.py","list"];

    // rp = raid passthrough, lp = lun passthrough
    disk_setup_type = $('input[name="form-radio-storage-vm-disk-type"]:checked').val()

    createLoggerInfo("setDiskInfo() start");

    cockpit.spawn(cmd).then(function(data){

        // 초기화
        $('#disk-pci-list').empty();

        var el ='';
        var result = JSON.parse(data);

        if(disk_setup_type == "rp"){
            var raid_pci_list = result.val.raidcontrollers;
            if(raid_pci_list.length > 0){
                for(var i = 0 ; i < raid_pci_list.length ; i ++ ){
                    el += '<div class="pf-c-check">';
                    el += '<input class="pf-c-check__input" type="checkbox" id="form-checkbox-disk'+i+'" name="form-checkbox-disk" value='+raid_pci_list[i].Slot+' />';
                    el += '<label class="pf-c-check__label" style="margin-top:5px" for="form-checkbox-disk'+i+'">'+raid_pci_list[i].Slot+' '+raid_pci_list[i].Vendor+'</label>';
                    el += '</div>';
                }
            }else{
                el += '<div class="pf-c-check">';
                el += '<label class="pf-c-check__label" style="margin-top:5px">데이터가 존재하지 않습니다.</label>';
                el += '</div>';
            }

        } else {
            var lun_pci_list = result.val.blockdevices;
            if(lun_pci_list.length > 0){
                for(var i = 0 ; i < lun_pci_list.length ; i ++ ){

                    var partition_text = '';
                    var check_disable = '';
                    if( lun_pci_list[i].children != undefined){
                        partition_text = '( Partition exists count : '+lun_pci_list[i].children.length+' )';
                        var check_disable = 'disabled';
                    }

                    //2022.10.12 디스크 경로를 /dev/sdb 형식이 아닌 /dev/disk/by-path/ 경로에서 참조 하도록 수정
                    el += '<div class="pf-c-check">';
                    // el += '<input class="pf-c-check__input" type="checkbox" id="form-checkbox-disk'+i+'" name="form-checkbox-disk" value="/dev/'+lun_pci_list[i].name+'" '+check_disable+' />';
                    el += '<input class="pf-c-check__input" type="checkbox" id="form-checkbox-disk'+i+'" name="form-checkbox-disk" value="'+lun_pci_list[i].path+'" '+check_disable+' />';
                    el += '<label class="pf-c-check__label" style="margin-top:5px" for="form-checkbox-disk'+i+'">/dev/'+lun_pci_list[i].name+' '+lun_pci_list[i].state+' '+lun_pci_list[i].size+' '+lun_pci_list[i].model+' '+partition_text+'</label>';
                    el += '</div>';
                }
            }else{
                el += '<div class="pf-c-check">';
                el += '<label class="pf-c-check__label" style="margin-top:5px">데이터가 존재하지 않습니다.</label>';
                el += '</div>';
            }
        }

        $('#disk-pci-list').append(el);

    }).catch(function(){
        createLoggerInfo("setDiskInfo error");
        // alert("setDiskInfo error");
    });
}

//디스크 raid passthrough 또는 lun passthrough 리스트를 호출하기 위한 기능
$('input[name="form-radio-storage-vm-disk-type"]').change(function() {
    setDiskInfo();
});

//스토리지 트래픽 구성 방식의 선택에 따른 서버용 NIC, 복제용 NIC 셀렉트 박스를 세팅하는 버튼
$('input[name="form-radio-storage-vm-nic-type"]').change(function() {

    // np = nic passthrough, npb = nic passthrough bonding, bn = bridge network
    storage_traffic_setup_type = $('input[name="form-radio-storage-vm-nic-type"]:checked').val()

    //form-select-storage-vm-public-nic2, form-select-storage-vm-cluster-nic2 값 삭제
    $('#form-select-storage-vm-public-nic2').remove();
    $('#form-select-storage-vm-cluster-nic2').remove();

    if(storage_traffic_setup_type == "np"){
        setNicPassthrough('form-select-storage-vm-public-nic1');
        setNicPassthrough('form-select-storage-vm-cluster-nic1');
    }else if(storage_traffic_setup_type == "npb"){
       //form-select-storage-vm-public-nic2, form-select-storage-vm-cluster-nic2 값 요소 추가
        var el1 = '<select class="pf-c-form-control" id="form-select-storage-vm-public-nic2" name="form-select-storage-vm-public-nic2"></select>';
        var el2 = '<select class="pf-c-form-control" id="form-select-storage-vm-cluster-nic2" name="form-select-storage-vm-cluster-nic2"></select>';

        $('#public-nic').append(el1);
        $('#cluster-nic').append(el2);

        setNicPassthrough('form-select-storage-vm-public-nic1');
        setNicPassthrough('form-select-storage-vm-cluster-nic1');

        //nic2에 리스트 생성
        setNicPassthrough('form-select-storage-vm-public-nic2');
        setNicPassthrough('form-select-storage-vm-cluster-nic2');
    }else{
        setNicBridge('form-select-storage-vm-public-nic1');
        setNicBridge('form-select-storage-vm-cluster-nic1');
    }
});

/**
 * Meathod Name : setNicPassthrough
 * Date Created : 2021.03.16
 * Writer  : 배태주
 * Description : nic pic 정보를 호출하여 셀렉트 박스 세팅
 * Parameter : (string) input selete id
 * Return  : 없음
 * History  : 2021.03.16 최초 작성
 */
 function setNicPassthrough(select_box_id){
    var cmd = ["python3",pluginpath + "/python/nic/network_action.py","list"];
    createLoggerInfo("setNicPassthrough() start");
    cockpit.spawn(cmd).then(function(data){

        // 초기화
        $('#'+select_box_id).empty();

        var el ='';
        var result = JSON.parse(data);
        var ethernets_list = result.val.ethernets;

        el += '<option value="" selected>선택하십시오</option>';
        for(var i = 0 ; i < ethernets_list.length ; i ++ ){
            el += '<option value="'+ethernets_list[i].PCI+'">'+ethernets_list[i].DEVICE+' '+ethernets_list[i].TYPE+' '+ethernets_list[i].PCI+' ('+ethernets_list[i].STATE+')</option>';
        }

        $('#'+select_box_id).append(el);

    }).catch(function(){
        createLoggerInfo("setNicPassthrough error");
        //alert("setNicPassthrough error");
    });
}

/**
 * Meathod Name : setReviewInfo
 * Date Created : 2021.03.17
 * Writer  : 배태주
 * Description : 설정확인을 위한 정보를 세팅하는 기능
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.17 최초 작성
 */
function setReviewInfo(){
    xml_create_cmd = ["python3",pluginpath + "/python/vm/create_scvm_xml.py"];

    //cpu
    var cpu = $('select#form-select-storage-vm-cpu option:checked').val();
    var cpu_text = $('select#form-select-storage-vm-cpu option:checked').text();

    if(cpu == '') {
        $('#span-storage-vm-cpu-core').text("미입력");
    } else {
        xml_create_cmd.push("-c",cpu);
        $('#span-storage-vm-cpu-core').text(cpu_text);
    }

    //memory
    var memory = $('select#form-select-storage-vm-memory option:checked').val();
    var memory_txt = $('select#form-select-storage-vm-memory option:checked').text();

    if(memory == '') {
        $('#span-storage-vm-memory').text("미입력");
    } else {
        xml_create_cmd.push("-m",memory);
        $('#span-storage-vm-memory').text(memory_txt);
    }

    //디스크 구성 ( rp = RAID Passthrough, lp = LUN Passthrough )
    var svdt = $('input[type=radio][name=form-radio-storage-vm-disk-type]:checked').val();
    if(svdt == 'rp') {
        xml_create_cmd.push("-dt","raid_passthrough");
        xml_create_cmd.push("-rpl");
    } else if(svdt == 'lp') {
        xml_create_cmd.push("-dt","lun_passthrough");
        xml_create_cmd.push("-lpl");
    }

    $('#span-storage-vm-data-disk').empty();
    $('input[type=checkbox][name="form-checkbox-disk"]').each(function() {
        if(this.checked){
            var el = "";
            if(svdt == 'rp') {
                el += "RAID Passthrough : " + $('label[for="'+this.id+'"]').text()+"</br>";
            } else if(svdt == 'lp') {
                el += "LUN Passthrough : " + $('label[for="'+this.id+'"]').text()+"</br>";
            }
            $('#span-storage-vm-data-disk').append(el);
            xml_create_cmd.push(this.value);
        }
    });

    // 선택된 디스크가 없을 경우 "미입력" 표기
    if($('#span-storage-vm-data-disk').text() == ''){
        $('#span-storage-vm-data-disk').append("미입력");
    }

    //관리 NIC용 네트워크
    $('#span-storage-vm-management-traffic').empty();
    var mngt_nic = $('select#form-select-storage-vm-mngt-nic option:checked').val();
    var mngt_nic_txt = $('select#form-select-storage-vm-mngt-nic option:checked').text();

    if(mngt_nic == '') {
        $('#span-storage-vm-management-traffic').text("관리용 : 미입력");
    } else {
        var el = "관리용 : " + mngt_nic_txt;
        $('#span-storage-vm-management-traffic').append(el);
        xml_create_cmd.push("-mnb",mngt_nic);
    }

    //스토리지 트래픽 구성 ( np = NIC Passthrough, npb = NIC Passthrough Bonding, bn= Bridge Network )
    var svnt = $('input[type=radio][name=form-radio-storage-vm-nic-type]:checked').val();

    if(svnt == "npb"){
        xml_create_cmd.push("-stnt","nic_passthrough_bonding");
    } else if(svnt == "np"){
        xml_create_cmd.push("-stnt","nic_passthrough");
    } else if(svnt == "bn"){
        xml_create_cmd.push("-stnt","bridge");
    }


    $('#span-storage-vm-storage-traffic').empty();
    if(svnt == "npb"){
        //npb일 경우 서버용 nic와 복제용 nic를 2개씩 입력 받기 때문에 별도로 분리하여 사용
        //서버용 public-nic
        var svpn1 = $('select#form-select-storage-vm-public-nic1 option:checked').val();
        var svpn1_txt = $('select#form-select-storage-vm-public-nic1 option:checked').text();
        var svpn2 = $('select#form-select-storage-vm-public-nic2 option:checked').val();
        var svpn2_txt = $('select#form-select-storage-vm-public-nic2 option:checked').text();
        //복제용 cluster-nic
        var svcn1 = $('select#form-select-storage-vm-cluster-nic1 option:checked').val();
        var svcn1_txt = $('select#form-select-storage-vm-cluster-nic1 option:checked').text();
        var svcn2 = $('select#form-select-storage-vm-cluster-nic2 option:checked').val();
        var svcn2_txt = $('select#form-select-storage-vm-cluster-nic2 option:checked').text();

        var el = "";
        xml_create_cmd.push("-snpbl");

        if(svpn1 == '') {
            el += "서버용1 : 미입력</br>";
        } else {
            el += "서버용1 : "+svpn1_txt+"</br>";
            xml_create_cmd.push(svpn1);
        }

        if(svpn2 == '') {
            el += "서버용2 : 미입력</br>";
        } else {
            el += "서버용2 : "+svpn2_txt+"</br>";
            xml_create_cmd.push(svpn2);
        }

        xml_create_cmd.push("-rnpbl");

        if(svcn1 == '') {
            el += "복제용1 : 미입력</br>";
        } else {
            el += "복제용1 : "+svcn1_txt+"</br>";
            xml_create_cmd.push(svcn1);
        }

        if(svcn2 == '') {
            el += "복제용2 : 미입력</br>";
        } else {
            el += "복제용2 : "+svcn2_txt+"</br>";
            xml_create_cmd.push(svcn2);
        }

        $('#span-storage-vm-storage-traffic').append(el);


    } else {
        // np 또는 bn인 경우 서버용 nic와 복제용 nic를 1개씩 입력 받기 때문에 공통으로 사용해도 상관없음
        //서버용 public-nic
        var svpn1 = $('select#form-select-storage-vm-public-nic1 option:checked').val();
        var svpn1_txt = $('select#form-select-storage-vm-public-nic1 option:checked').text();
        //복제용 cluster-nic
        var svcn1 = $('select#form-select-storage-vm-cluster-nic1 option:checked').val();
        var svcn1_txt = $('select#form-select-storage-vm-cluster-nic1 option:checked').text();

        var el = "";

        if(svnt == "np"){
            xml_create_cmd.push("-snp");
        }else if(svnt == "bn"){
            xml_create_cmd.push("-snb");
        }

        if(svpn1 == '') {
            el += "서버용1 : 미입력</br>";
        } else {
            el += "서버용1 : "+svpn1_txt+"</br>";
            xml_create_cmd.push(svpn1);
        }

        if(svnt == "np"){
            xml_create_cmd.push("-rnp");
        }else if(svnt == "bn"){
            xml_create_cmd.push("-rnb");
        }

        if(svcn1 == '') {
            el += "복제용1 : 미입력</br>";
        } else {
            el += "복제용1 : "+svcn1_txt+"</br>";
            xml_create_cmd.push(svcn1);
        }

        $('#span-storage-vm-storage-traffic').append(el);

    }

    // 선택된 스토리지 트래픽 네트워크가 없을 경우 "미입력" 표기
    if($('#span-storage-vm-storage-traffic').text() == ''){
        $('#span-storage-vm-storage-traffic').append("미입력");
    }

    //----- 추가 네트워크 정보 -----

    //정보입력 소스
    // var host_file_setting = $('input[type=checkbox][id="form-input-storage-vm-additional-file"]').is(":checked");
    // if(host_file_setting) {
    //     $('#span-storage-vm-hosts-source').text("Hosts 파일 입력");
    // } else {
    //     $('#span-storage-vm-hosts-source').text("직접 입력");
    // }

    //hosts 파일
    // 변경된 hosts file 내용을 설정 확인에 반영
    let host_file_type = $('input[name=radio-hosts-file-scvm]:checked').val();

    putHostsValueIntoTextarea(host_file_type, option_scvm);

    var host_name = $('#form-input-storage-vm-hostname').val();
    if(host_name == '') {
        $('#span-storage-vm-host-name').text("미입력");
    } else {
        $('#span-storage-vm-host-name').text(host_name);
    }

    //관리네트워크 3가지
    var mngt_ip = $('#form-input-storage-vm-mgmt-ip').val();
    var mngt_gw = $('#form-input-storage-vm-mgmt-gw').val();
    var mngt_vlan = $('#form-input-storage-vm-mgmt-vlan').val();
    var dns = $('#form-input-storage-vm-dns').val();

    $('#span-storage-vm-mngt-ip-info').empty();
    var mngt_el = "";

    if(mngt_ip == '') {
        mngt_el += "IP Addr : 미입력</br>";
    } else {
        mngt_el += "IP Addr : "+mngt_ip+"</br>";
    }

    if(mngt_gw == '') {
        mngt_el += "Gateway : 미입력</br>";
    } else {
        mngt_el += "Gateway : "+mngt_gw+"</br>";
    }

    if(mngt_vlan != '') {
        mngt_el += "Vlan : "+mngt_vlan+"</br>";
    }

    if(dns == ''){
        mngt_el += "DNS : 미입력</br>";
    }else {
        mngt_el += "DNS : "+dns+"</br>";
    }

    $('#span-storage-vm-mngt-ip-info').append(mngt_el);

    //스토지리 네트워크 4가지

    var public_ip = $("#form-input-storage-vm-public-ip").val();
    var public_vlan = $("#form-input-storage-vm-public-vlan").val();
    var cluster_ip = $("#form-input-storage-vm-cluster-ip").val();
    var cluster_vlan = $("#form-input-storage-vm-cluster-vlan").val();

    $('#span-storage-vm-storage-traffic-ip-info').empty();
    var traffic_ip_el = "";

    if(public_ip == '') {
        traffic_ip_el += "서버 IP Addr : 미입력</br>";
    } else {
        traffic_ip_el += "서버 IP Addr : "+public_ip+"</br>";
    }

    if(public_vlan != '') {
        traffic_ip_el += "서버 Vlan : "+public_vlan+"</br>";
    }

    if(cluster_ip == '') {
        traffic_ip_el += "복제 IP Addr : 미입력</br>";
    } else {
        traffic_ip_el += "복제 IP Addr : "+cluster_ip+"</br>";
    }

    if(cluster_vlan != '') {
        traffic_ip_el += "복제 Vlan : "+cluster_vlan+"</br>";
    }

    $('#span-storage-vm-storage-traffic-ip-info').append(traffic_ip_el);

    if($("#form-input-ccvm-mngt-ip").val() == ""){
        $('#span-ccvm-mngt-ip').text("미입력");
    } else {
        $('#span-ccvm-mngt-ip').text($("#form-input-ccvm-mngt-ip").val());
    }

    //-----SSH Key 정보-----
    var ssh_private_key_url = $('#form-textarea-storage-vm-ssh-private-key-file').val();
    if(ssh_private_key_url == '') {
        $('#span-storage-vm-private-key-file').text("미입력");
    } else {
        $('#span-storage-vm-private-key-file').text(ssh_private_key_url);
    }

    var ssh_public_key_url = $('#form-textarea-storage-vm-ssh-public-key-file').val();
    if(ssh_public_key_url == '') {
        $('#span-storage-vm-public-key-file').text("미입력");
    } else {
        $('#span-storage-vm-public-key-file').text(ssh_public_key_url);
    }
}

/**
 * Meathod Name : validateStorageVm
 * Date Created : 2021.03.17
 * Writer  : 배태주
 * Description : 스토리지 센터 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.17 최초 작성
 */
function validateStorageVm(){
    var validate_check = true;
    var svnt = $('input[type=radio][name=form-radio-storage-vm-nic-type]:checked').val();
    var uniq_nic_cnt = Array.from(new Set([$('select#form-select-storage-vm-public-nic1 option:checked').val(),$('select#form-select-storage-vm-cluster-nic1 option:checked').val(),$('select#form-select-storage-vm-public-nic2 option:checked').val(),$('select#form-select-storage-vm-cluster-nic2 option:checked').val()]));
    let host_file_type = $('input[name=radio-hosts-file-scvm]:checked').val();
    var disk_select_cnt = 0;
    $('input[type=checkbox][name="form-checkbox-disk"]').each(function() {
        if(this.checked){
            disk_select_cnt = disk_select_cnt + 1;
        }
    });

    if($('select#form-select-storage-vm-cpu option:checked').val() == ""){ //cpu
        alert("CPU를 입력해주세요.");
        validate_check = false;
    }else if($('select#form-select-storage-vm-memory option:checked').val() == ""){ //memory
        alert("Memory를 입력해주세요.");
        validate_check = false;
    }else if(disk_select_cnt == 0){
        alert("디스크를 입력해주세요.");
        validate_check = false;
    }else if($('select#form-select-storage-vm-mngt-nic option:checked').val() == ""){
        alert("관리 NIC용 Bridge를 입력해주세요.");
        validate_check = false;
    }else if(svnt == "npb" && $('select#form-select-storage-vm-public-nic1 option:checked').val() == ""){
        alert("서버용 NIC 1번을 입력해주세요.");
        validate_check = false;
    }else if(svnt == "npb" && $('select#form-select-storage-vm-public-nic2 option:checked').val() == ""){
        alert("서버용 NIC 2번을 입력해주세요.");
        validate_check = false;
    }else if(svnt == "npb" && $('select#form-select-storage-vm-cluster-nic1 option:checked').val() == ""){
        alert("복제용 NIC 1번을 입력해주세요.");
        validate_check = false;
    }else if(svnt == "npb" && $('select#form-select-storage-vm-cluster-nic2 option:checked').val() == ""){
        alert("복제용 NIC 2번을 입력해주세요.");
        validate_check = false;
    }else if(svnt != "npb" && $('select#form-select-storage-vm-public-nic1 option:checked').val() == ""){
        alert("서버용 NIC 1번을 입력해주세요.");
        validate_check = false;
    }else if(svnt != "npb" && $('select#form-select-storage-vm-cluster-nic1 option:checked').val() == ""){
        alert("복제용 NIC 1번을 입력해주세요.");
        validate_check = false;
    }else if(svnt == "np" && $('select#form-select-storage-vm-public-nic1 option:checked').val() == $('select#form-select-storage-vm-cluster-nic1 option:checked').val()){
        alert("NIC Passthrough 스토리지 트래픽 구성 값을 다르게 입력해주세요.");
        validate_check = false;
    }else if(svnt == "npb" && uniq_nic_cnt == 4){
        alert("NIC Passthrough Bonding 스토리지 트래픽 구성 값을 다르게 입력해주세요.");
        validate_check = false;
    }else if($('#div-textarea-cluster-config-confirm-hosts-file-scvm').val().trim() == "") {
        alert("클러스터 구성 프로파일 정보를 확인해 주세요.");
        validate_check = false;
    }else if(validateClusterConfigProfile(host_file_type, option_scvm)) { //cluster config 유효성 검사
        validate_check = false;
    }else if($("#form-input-storage-vm-hostname").val() == ""){
        alert("호스트명을 입력해주세요.");
        validate_check = false;
    }else if($("#form-input-storage-vm-mgmt-ip").val()  == ""){
        alert("관리 NIC IP를 입력해주세요.");
        validate_check = false;
    }else if($("#form-input-storage-vm-public-ip").val() == ""){
        alert("스토리지 서버 NIC IP를 입력해주세요.");
        validate_check = false;
    }else if($("#form-input-storage-vm-cluster-ip").val() == ""){
        alert("스토리지 복제 NIC IP를 입력해주세요.");
        validate_check = false;
    }else if ($('#form-input-ccvm-mngt-ip').val() == "") {
        alert("CCVM 관리 IP정보를 입력해주세요.");
        validate_check = false;
    }else if(!checkIp($('#form-input-ccvm-mngt-ip').val())){
        alert("CCVM 관리 IP 형식을 확인해주세요.");
        validate_check = false;
    }else if(!checkHostFormat($("#form-input-storage-vm-hostname").val())){
        alert("호스트명 입력 형식을 확인해주세요.");
        validate_check = false;
    }else if(!checkCidrFormat($("#form-input-storage-vm-mgmt-ip").val())){
        alert("관리 NIC IP 형식을 확인해주세요.");
        validate_check = false;
    }else if($("#form-input-storage-vm-mgmt-gw").val() != "" && !checkIp($("#form-input-storage-vm-mgmt-gw").val())){
        alert("관리 NIC Gateway 형식을 확인해주세요.");
        validate_check = false;
    }else if(!checkCidrFormat($("#form-input-storage-vm-public-ip").val())){
        alert("스토리지 서버 NIC IP 형식을 확인해주세요.");
        validate_check = false;
    }else if(!checkCidrFormat($("#form-input-storage-vm-cluster-ip").val())){
        alert("스토리지 복제 NIC IP 형식을 확인해주세요.");
        validate_check = false;
    }else if (!checkIp($("#form-input-storage-vm-dns").val()) && $("#form-input-storage-vm-dns").val() != ""){
        alert("DNS 형식을 확인해주세요.");
        validate_check = false;
    }else if($('#form-textarea-storage-vm-ssh-private-key-file').val() == ""){
        alert("SSH 개인 Key 파일을 입력해주세요.");
        validate_check = false;
    }else if($('#form-textarea-storage-vm-ssh-public-key-file').val() == ""){
        alert("SSH 공개 Key 파일을 입력해주세요.");
        validate_check = false;
    }

    return validate_check;
}

/**
 * Meathod Name : setScvmNetworkInfo
 * Date Created : 2021.03.29
 * Writer  : 배태주
 * Description : 스토리지센터 가상머신 추가 네트워크 정보를 입력하는 기능
 * Parameter : array
 * Return  : 없음
 * History  : 2021.03.29 최초 작성
 * History  : 2022.08.31 기능 개선
 */
//  function setScvmNetworkInfo(table_tr_obj){
//     let current_host_name = $("#form-input-current-host-name-scvm").val();

//     // 세팅 값 초기화
//     $("#form-input-storage-vm-hostname").val("");
//     $("#form-input-storage-vm-mgmt-ip").val("");
//     $("#form-input-storage-vm-public-ip").val("");
//     $("#form-input-storage-vm-cluster-ip").val("");

//     table_tr_obj.each(function(){
//         let host_name = $(this).find('td').eq(1).text().trim();
//         if(current_host_name == host_name){
//             let host_index = $(this).find('td').eq(0).text().trim();
//             // 호스트명을 세팅
//             $("#form-input-storage-vm-hostname").val("scvm"+host_index);
//             // 관리 NIC IP 및 CIDR 기본 입력
//             $("#form-input-storage-vm-mgmt-ip").val($(this).find('td').eq(3).text().trim()+"/16");
//             // 스토리지 서버 NIC IP
//             $("#form-input-storage-vm-public-ip").val($(this).find('td').eq(5).text().trim()+"/16");
//             // 스토리지 복제 NIC IP
//             $("#form-input-storage-vm-cluster-ip").val($(this).find('td').eq(6).text().trim()+"/16");

//             return false;
//         }
//     });
// }

/**
 * Meathod Name : resetScvmNetworkInfo
 * Date Created : 2021.03.19
 * Writer  : 배태주
 * Description : 스토리지센터 가상머신 추가 네트워크 정보를 초기화하는 기능
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.19 최초 작성
 */
 function resetScvmNetworkInfo(){
    //input 초기화
    // $("#form-input-storage-vm-hosts-file").val("");
    $("#form-input-storage-vm-hostname").val("");
    $("#form-input-storage-vm-mgmt-ip").val("");
    $("#form-input-storage-vm-mgmt-vlan").val("");
    $("#form-input-storage-vm-mgmt-gw").val("");
    $("#form-input-storage-vm-public-ip").val("");
    $("#form-input-storage-vm-public-vlan").val("");
    $("#form-input-storage-vm-cluster-ip").val("");
    $("#form-input-storage-vm-cluster-vlan").val("");
    $("#form-input-ccvm-mngt-ip").val("");
    $("#form-input-stroage-vm-dns").val("");
}

/**
 * Meathod Name : setScvmSshPrivateKeyInfo
 * Date Created : 2021.03.29
 * Writer  : 배태주
 * Description : 스토리지센터 가상머신에 사용할 ssh private key 파일 세팅
 * Parameter : String
 * Return  : 없음
 * History  : 2021.03.29 최초 작성
 */
 function setScvmSshPrivateKeyInfo(ssh_private_key){
    if(ssh_private_key != ""){
        $("#form-textarea-storage-vm-ssh-private-key-file").val(ssh_private_key);
    } else {
        $("#form-textarea-storage-vm-ssh-private-key-file").val("");
    }
}

/**
 * Meathod Name : setScvmSshPublicKeyInfo
 * Date Created : 2021.03.29
 * Writer  : 배태주
 * Description : 스토리지센터 가상머신에 사용할 ssh public key 파일 세팅
 * Parameter : String
 * Return  : 없음
 * History  : 2021.03.29 최초 작성
 */
 function setScvmSshPublicKeyInfo(ssh_public_key){
    if(ssh_public_key != ""){
        $("#form-textarea-storage-vm-ssh-public-key-file").val(ssh_public_key);
    } else {
        $("#form-textarea-storage-vm-ssh-public-key-file").val("");
    }
}

/**
 * Meathod Name : setScvmProgressFail
 * Date Created : 2021.03.30
 * Writer  : 배태주
 * Description : 스토리지센터 가상머신 배포 진행중 실패 단계에 따른 중단됨 UI 처리
 * Parameter : setp_num
 * Return  : 없음
 * History  : 2021.03.30 최초 작성
 */
 function setScvmProgressFail(setp_num){
    if( setp_num == 1 || setp_num == '1' ){   // 1단계 이하 단계 전부 중단된 처리
        seScvmProgressStep("span-progress-step1",3);
        seScvmProgressStep("span-progress-step2",3);
        seScvmProgressStep("span-progress-step3",3);
        seScvmProgressStep("span-progress-step4",3);
    } else if(setp_num == 2 || setp_num == '2') {   // 2단계 이하 단계 전부 중단된 처리
        seScvmProgressStep("span-progress-step2",3);
        seScvmProgressStep("span-progress-step3",3);
        seScvmProgressStep("span-progress-step4",3);
    } else if(setp_num == 3 || setp_num == '3') {   // 3단계 이하 단계 전부 중단된 처리
        seScvmProgressStep("span-progress-step3",3);
        seScvmProgressStep("span-progress-step4",3);
    } else if(setp_num == 4 || setp_num == '4') {   // 4단계 이하 단계 전부 중단된 처리
        seScvmProgressStep("span-progress-step4",3);
    }
}