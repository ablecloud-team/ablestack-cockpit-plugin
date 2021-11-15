/**
 * File Name : cloud-vm-wizard.js  
 * Date Created : 2020.03.03
 * Writer  : 박동혁
 * Description : 클라우드센터 VM 배포 마법사 UI를 컨트롤하기 위한 스크립트
**/

// 변수 선언
var cur_step_wizard_cloud_vm = "1";
var xml_create_cmd;
var completed = false;

/* Document Ready 이벤트 처리 시작 */

$(document).ready(function(){
    // 마법사 페이지 준비
    $('#div-modal-wizard-cloud-vm-failover-cluster').hide();
    $('#div-modal-wizard-cloud-vm-compute').hide();
    $('#div-modal-wizard-cloud-vm-network').hide();
    $('#div-modal-wizard-cloud-vm-additional').hide();
    $('#div-modal-wizard-cloud-vm-ssh-key').hide();
    $('#div-modal-wizard-cloud-vm-review').hide();
    $('#div-modal-wizard-cloud-vm-deploy').hide();
    $('#div-modal-wizard-cloud-vm-finish').hide();

    $('#div-form-hosts-file-ccvm').hide();
    $('#div-form-hosts-table-ccvm').hide();

    $('#div-accordion-cloud-vm-failover-cluster').hide();
    $('#div-accordion-cloud-vm-compute-network').hide();
    $('#div-accordion-cloud-vm-additional').hide();
    $('#div-accordion-cloud-vm-ssh-key').hide();

    // $('#nav-button-cloud-vm-review').addClass('pf-m-disabled');
    $('#nav-button-cloud-vm-finish').addClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    // 첫번째 스텝에서 시작
    cur_step_wizard_cloud_vm = "1";

    //관리네트워크 리스트 초기 세팅
    setNicBridge('form-select-cloud-vm-mngt-parent');

    //서비스네트워크 리스트 초기 세팅
    setNicBridge('form-select-cloud-vm-svc-parent');

    //hosts 파일 선택 이벤트 세팅
    // setHostsFileReader($('#form-input-cloud-vm-hosts-file'), 'hosts', setCcvmNetworkInfo);
    
    //ssh 개인 key 파일 선택 이벤트 세팅
    setSshKeyFileReader($('#form-input-cloud-vm-ssh-private-key-file'), 'id_rsa', setCcvmSshPrivateKeyInfo);

    //ssh 공개 key 파일 선택 이벤트 세팅
    setSshKeyFileReader($('#form-input-cloud-vm-ssh-public-key-file'), 'id_rsa.pub', setCcvmSshPublicKeyInfo);
});

/* Document Ready 이벤트 처리 끝 */

/* Title 영역에서 발생하는 이벤트 처리 시작 */

$('#button-close-modal-wizard-cloud-vm').on('click', function(){
    $('#div-modal-wizard-cloud-vm').hide();
    if(completed){
        //상태값 초기화 겸 페이지 리로드
        location.reload();
    }
});

/* Title 영역에서 발생하는 이벤트 처리 끝 */

/* 사이드 메뉴 영역에서 발생하는 이벤트 처리 시작 */

$('#nav-button-cloud-vm-overview').on('click',function(){
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-overview').show();
    $('#nav-button-cloud-vm-overview').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "1";
});

$('#nav-button-cloud-vm-cluster').on('click',function(){
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-failover-cluster').show();
    $('#nav-button-cloud-vm-cluster').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "2";
});

$('#nav-button-cloud-vm-appliance').on('click',function(){
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-compute').show();
    $('#nav-button-cloud-vm-appliance').addClass('pf-m-current');
    $('#nav-button-cloud-vm-compute').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "3";
});

$('#nav-button-cloud-vm-compute').on('click',function(){
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-compute').show();
    $('#nav-button-cloud-vm-appliance').addClass('pf-m-current');
    $('#nav-button-cloud-vm-compute').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "3";
});

$('#nav-button-cloud-vm-network').on('click',function(){
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-network').show();
    $('#nav-button-cloud-vm-appliance').addClass('pf-m-current');
    $('#nav-button-cloud-vm-network').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "4";
});

$('#nav-button-cloud-vm-additional').on('click',function(){
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-additional').show();
    $('#nav-button-cloud-vm-additional').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "5";
});

$('#nav-button-cloud-vm-ssh-key').on('click',function(){
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-ssh-key').show();
    $('#nav-button-cloud-vm-ssh-key').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "6";
});

$('#nav-button-cloud-vm-review').on('click',function(){ 

    setCcvmReviewInfo();

    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-review').show();
    $('#nav-button-cloud-vm-review').addClass('pf-m-current');
    //$('#nav-button-cloud-vm-finish').removeClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-cloud-vm').html('배포');
    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "7";
});

$('#nav-button-cloud-vm-finish').on('click',function(){
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-finish').show();
    $('#nav-button-cloud-vm-finish').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cloud-vm').html('완료');
    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "8";
});

/* 사이드 메뉴 영역에서 발생하는 이벤트 처리 시작 */

/* Footer 영역에서 발생하는 이벤트 처리 시작 */

$('#button-next-step-modal-wizard-cloud-vm').on('click', function(){
    if (cur_step_wizard_cloud_vm == "1") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-failover-cluster').show();
        $('#nav-button-cloud-vm-cluster').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "2";
    }
    else if (cur_step_wizard_cloud_vm == "2") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-compute').show();
        $('#nav-button-cloud-vm-appliance').addClass('pf-m-current');
        $('#nav-button-cloud-vm-compute').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "3";
    }
    else if (cur_step_wizard_cloud_vm == "3") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-network').show();
        $('#nav-button-cloud-vm-appliance').addClass('pf-m-current');
        $('#nav-button-cloud-vm-network').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "4";
    }
    else if (cur_step_wizard_cloud_vm == "4") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-additional').show();
        $('#nav-button-cloud-vm-additional').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "5";
    }
    else if (cur_step_wizard_cloud_vm == "5") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-ssh-key').show();
        $('#nav-button-cloud-vm-ssh-key').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "6";
    }
    else if (cur_step_wizard_cloud_vm == "6") {
        resetCloudVMWizard();

        setCcvmReviewInfo();

        $('#div-modal-wizard-cloud-vm-review').show();
        $('#nav-button-cloud-vm-review').addClass('pf-m-current');
        //$('#nav-button-cloud-vm-finish').removeClass('pf-m-disabled');

        $('#button-next-step-modal-wizard-cloud-vm').html('배포');
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "7";
    }
    else if (cur_step_wizard_cloud_vm == "7") {
        $('#div-modal-cloud-wizard-confirm').show();
    }
    else if (cur_step_wizard_cloud_vm == "8") {
        $('#div-modal-wizard-cloud-vm').hide();
    }
});

$('#button-before-step-modal-wizard-cloud-vm').on('click', function(){
    if (cur_step_wizard_cloud_vm == "1") {
        // 이벤트 처리 없음
    }
    else if (cur_step_wizard_cloud_vm == "2") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-overview').show();
        $('#nav-button-cloud-vm-overview').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', true);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "1";
    }
    else if (cur_step_wizard_cloud_vm == "3") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-failover-cluster').show();
        $('#nav-button-cloud-vm-cluster').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "2";
    }
    else if (cur_step_wizard_cloud_vm == "4") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-compute').show();
        $('#nav-button-cloud-vm-appliance').addClass('pf-m-current');
        $('#nav-button-cloud-vm-compute').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "3";
    }
    else if (cur_step_wizard_cloud_vm == "5") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-network').show();
        $('#nav-button-cloud-vm-appliance').addClass('pf-m-current');
        $('#nav-button-cloud-vm-network').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "4";
    }
    else if (cur_step_wizard_cloud_vm == "6") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-additional').show();
        $('#nav-button-cloud-vm-additional').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "5";
    }
    else if (cur_step_wizard_cloud_vm == "7") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-ssh-key').show();
        $('#nav-button-cloud-vm-ssh-key').addClass('pf-m-current');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "6";
    }
    else if (cur_step_wizard_cloud_vm == "8") {
        resetCloudVMWizard();

        $('#div-modal-wizard-cloud-vm-review').show();
        $('#nav-button-cloud-vm-review').addClass('pf-m-current');
        $('#nav-button-cloud-vm-finish').removeClass('pf-m-disabled');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "7";
    }
});

/* Footer 영역에서 발생하는 이벤트 처리 끝 */

/* HTML Object에서 발생하는 이벤트 처리 시작 */

// 설정확인 단계의 아코디언 개체에서 발생하는 이벤트의 처리
$('#button-accordion-cloud-vm-failover-cluster').on('click', function(){
    if ($('#button-accordion-cloud-vm-failover-cluster').attr("aria-expanded") == "false") {
        $('#button-accordion-cloud-vm-failover-cluster').attr("aria-expanded", "true");
        $('#button-accordion-cloud-vm-failover-cluster').addClass("pf-m-expanded");
        $('#div-accordion-cloud-vm-failover-cluster').fadeIn();
        $('#div-accordion-cloud-vm-failover-cluster').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-cloud-vm-failover-cluster').attr("aria-expanded", "false");
        $('#button-accordion-cloud-vm-failover-cluster').removeClass("pf-m-expanded");
        $('#div-accordion-cloud-vm-failover-cluster').fadeOut();
        $('#div-accordion-cloud-vm-failover-cluster').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-cloud-vm-compute-network').on('click', function(){
    if ($('#button-accordion-cloud-vm-compute-network').attr("aria-expanded") == "false") {
        $('#button-accordion-cloud-vm-compute-network').attr("aria-expanded", "true");
        $('#button-accordion-cloud-vm-compute-network').addClass("pf-m-expanded");
        $('#div-accordion-cloud-vm-compute-network').fadeIn();
        $('#div-accordion-cloud-vm-compute-network').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-cloud-vm-compute-network').attr("aria-expanded", "false");
        $('#button-accordion-cloud-vm-compute-network').removeClass("pf-m-expanded");
        $('#div-accordion-cloud-vm-compute-network').fadeOut();
        $('#div-accordion-cloud-vm-compute-network').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-cloud-vm-additional').on('click', function(){
    if ($('#button-accordion-cloud-vm-additional').attr("aria-expanded") == "false") {
        $('#button-accordion-cloud-vm-additional').attr("aria-expanded", "true");
        $('#button-accordion-cloud-vm-additional').addClass("pf-m-expanded");
        $('#div-accordion-cloud-vm-additional').fadeIn();
        $('#div-accordion-cloud-vm-additional').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-cloud-vm-additional').attr("aria-expanded", "false");
        $('#button-accordion-cloud-vm-additional').removeClass("pf-m-expanded");
        $('#div-accordion-cloud-vm-additional').fadeOut();
        $('#div-accordion-cloud-vm-additional').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-cloud-vm-ssh-key').on('click', function(){
    if ($('#button-accordion-cloud-vm-ssh-key').attr("aria-expanded") == "false") {
        $('#button-accordion-cloud-vm-ssh-key').attr("aria-expanded", "true");
        $('#button-accordion-cloud-vm-ssh-key').addClass("pf-m-expanded");
        $('#div-accordion-cloud-vm-ssh-key').fadeIn();
        $('#div-accordion-cloud-vm-ssh-key').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-cloud-vm-ssh-key').attr("aria-expanded", "false");
        $('#button-accordion-cloud-vm-ssh-key').removeClass("pf-m-expanded");
        $('#div-accordion-cloud-vm-ssh-key').fadeOut();
        $('#div-accordion-cloud-vm-ssh-key').removeClass("pf-m-expanded");
    }
});

// 네트워크 구성에서 "서비스네트워크"의 선택여부가 변경되었을 때의 이벤트 처리
$('#form-checkbox-svc-network').on('change', function(){
    if ($('#form-checkbox-svc-network').is(':checked') == true) {
        // 서비스네트워크를 사용하으로 선택한 경우 서비스네트워크 브릿지 선택상자를 활성화 함
        $('#form-select-cloud-vm-svc-parent').attr('disabled', false);

        // 추가 네트워크 정보에서 서비스 NIC 정보를 입력할 수 있도록 활성화 해야 함
        $('#form-input-cloud-vm-svc-nic-ip').attr('disabled', false);
        $('#form-input-cloud-vm-svc-vlan').attr('disabled', false);
        $('#form-input-cloud-vm-svc-gw').attr('disabled', false);
    }
    else {
        // 서비스네트워크를 사용하지 않음으로 선택한 경우 서비스네트워크 브릿지 선택상자를 비활성화 함
        $('#form-select-cloud-vm-svc-parent').attr('disabled', true);

        // 추가 네트워크 정보에서 서비스 NIC 정보를 입력할 수 없도록 비활성화 해야 함
        $('#form-input-cloud-vm-svc-nic-ip').attr('disabled', true);
        $('#form-input-cloud-vm-svc-vlan').attr('disabled', true);
        $('#form-input-cloud-vm-svc-gw').attr('disabled', true);
    }
});

// Host 파일 준비 방법 중 신규생성을 클릭하는 경우 Host 프로파일 디비전을 보여주고 Hosts 파일 디비전은 숨긴다.
$('#form-radio-hosts-new-ccvm').on('click', function () {
    $('#div-form-hosts-profile-ccvm').show();
    $('#div-form-hosts-file-ccvm').hide();
    $('#div-form-hosts-table-ccvm').hide();
    $('#div-form-hosts-input-number-ccvm').show();
    $('#div-form-hosts-input-current-number-ccvm').show();
    $('#form-input-cluster-config-host-number-ccvm').val(1);
    $('#form-input-cluster-config-current-host-number-ccvm').val(1);
    $('#form-input-cluster-config-host-number-plus-ccvm').removeAttr('disabled');
    $('#form-input-cluster-config-host-number-minus-ccvm').removeAttr('disabled');
    $('#form-input-cluster-config-host-number-ccvm').removeAttr('disabled');
    $('#form-table-tbody-cluster-config-existing-host-profile-ccvm tr').remove();
    $('#form-input-cloud-vm-hosts-file').val("")
    
    // 테이블 형식으로 변경
    // "기존 파일 사용"에서 "신규 생성"을 클릭하면 초기화 된다.
    $("#form-table-tbody-cluster-config-new-host-profile-ccvm").empty();
    let insert_tr = "";
    insert_tr += "<tr>";
    insert_tr += "<td contenteditable='true'>192.168.0.10</td>";
    insert_tr += "<td contenteditable='flase'>ccvm-mngt</td>";
    insert_tr += "<td contenteditable='flase'>ccvm</td>";
    insert_tr += "</tr>";
    insert_tr += "<tr>";
    insert_tr += "<td contenteditable='true'>192.168.1.1</td>";
    insert_tr += "<td contenteditable='true'>ablecube1</td>";
    insert_tr += "<td contenteditable='true'>ablecube</td>";
    insert_tr += "</tr>";
    insert_tr += "<tr>";
    insert_tr += "<td contenteditable='true'>192.168.2.1</td>";
    insert_tr += "<td contenteditable='flase'>scvm1-mngt</td>";
    insert_tr += "<td contenteditable='flase'>scvm-mngt</td>";
    insert_tr += "</tr>";
    insert_tr += "<tr>";
    insert_tr += "<td contenteditable='true'>100.100.10.1</td>";
    insert_tr += "<td contenteditable='true'>ablecube1-pn</td>";
    insert_tr += "<td contenteditable='true'>ablecube-pn</td>";
    insert_tr += "</tr>";
    insert_tr += "<tr>";
    insert_tr += "<td contenteditable='true'>100.100.10.101</td>";
    insert_tr += "<td contenteditable='flase'>scvm1</td>";
    insert_tr += "<td contenteditable='flase'>scvm</td>";
    insert_tr += "</tr>";
    insert_tr += "<tr>";
    insert_tr += "<td contenteditable='true'>100.200.10.11</td>";
    insert_tr += "<td contenteditable='flase'>scvm1-cn</td>";
    insert_tr += "<td contenteditable='flase'>scvm-cn</td>";
    insert_tr += "</tr>";
    $("#form-table-cluster-config-new-host-profile-ccvm").append(insert_tr);
});

// Host 파일 준비 방법 중 기존 파일 사용을 클릭하는 경우 Host 프로파일 디비전을 숨기고 Hosts 파일 디비전은 보여준다.
$('#form-radio-hosts-file-ccvm').on('click', function () {
    $('#div-form-hosts-profile-ccvm').hide();
    $('#div-form-hosts-file-ccvm').show();
    $('#div-form-hosts-table-ccvm').show();
    $('#div-form-hosts-input-number-ccvm').show();
    $('#div-form-hosts-input-current-number-ccvm').show();
    $('#form-input-cluster-config-host-number-ccvm').val(1);
    $('#form-input-cluster-config-current-host-number-ccvm').val(1);
    $('#form-input-cluster-config-host-number-plus-ccvm').attr('disabled', 'true');
    $('#form-input-cluster-config-host-number-minus-ccvm').attr('disabled', 'true');
    $('#form-input-cluster-config-host-number-ccvm').attr('disabled', 'true');
});

// Host 파일 준비 중 "현재 호스트 번호"를 변경하는 '+', '-' 기능 
$('#form-input-cluster-config-current-host-number-plus-ccvm').on('click', function () {
    let total_host_num_val = $('#form-input-cluster-config-host-number-ccvm').val();
    let n = $('.bt_up').index(this);
    let num = $("#form-input-cluster-config-current-host-number-ccvm:eq(" + n + ")").val();
    if (num*1 < total_host_num_val*1) {
        num = $("#form-input-cluster-config-current-host-number-ccvm:eq(" + n + ")").val(num * 1 + 1);
    }
});
$('#form-input-cluster-config-current-host-number-minus-ccvm').on('click', function () {
    let n = $('.bt_down').index(this);
    let num = $("#form-input-cluster-config-current-host-number-ccvm:eq(" + n + ")").val();
    if (num > 1) {
        num = $("#form-input-cluster-config-current-host-number-ccvm:eq(" + n + ")").val(num * 1 - 1);
        return;
    }
});
$('#form-input-cluster-config-current-host-number-ccvm').on('propertychange change keyup paste input', function () {
    let total_host_num_val = $('#form-input-cluster-config-host-number-ccvm').val();
    if (this.value <= 0 || this.value > 99) {
        this.value = total_host_num_val;
    }else if(this.value*1 > total_host_num_val*1) {
        this.value = total_host_num_val;
        return;
    }
});

// Host 파일 준비 중 "구성할 호스트"를 변경하는 '+', '-' 기능 
$('#form-input-cluster-config-host-number-plus-ccvm').on('click', function () {
    let n = $('.bt_up').index(this);
    let num = $("#form-input-cluster-config-host-number-ccvm:eq(" + n + ")").val();
    num = $("#form-input-cluster-config-host-number-ccvm:eq(" + n + ")").val(num * 1 + 1);
});
$('#form-input-cluster-config-host-number-minus-ccvm').on('click', function () {
    let current_host_num_val = $('#form-input-cluster-config-current-host-number-ccvm').val();
    let n = $('.bt_down').index(this);
    let num = $("#form-input-cluster-config-host-number-ccvm:eq(" + n + ")").val();
    if (current_host_num_val >= num && num != 1) {
        $('#form-input-cluster-config-current-host-number-ccvm').val(num * 1 - 1)
    }
    if (num > 1) {
        num = $("#form-input-cluster-config-host-number-ccvm:eq(" + n + ")").val(num * 1 - 1);
        return;
    }
});
$('#form-input-cluster-config-host-number-ccvm').on('propertychange change keyup paste input', function () {
    let current_host_num_val = $('#form-input-cluster-config-current-host-number-ccvm').val();
    current_host_num_val = current_host_num_val*1;
    if (this.value <= 0 || this.value > 99) {
        this.value = 1;
        alert("1~99까지의 숫자만 입력할 수 있습니다.")
        return;
    }else if(this.value < current_host_num_val) {
        $('#form-input-cluster-config-current-host-number-ccvm').val(this.value)
        let option = "-ccvm";
        changeAlias2(option);
        return;
    }
});
// Host 파일 준비 중 신규생성을 선택한 경우 Host 수에 따라 텍스트 값 변경
$('#form-input-cluster-config-host-number-ccvm, #form-input-cluster-config-host-number-plus-ccvm, #form-input-cluster-config-host-number-minus-ccvm' +
', #form-input-cluster-config-current-host-number-ccvm, #form-input-cluster-config-current-host-number-plus-ccvm, #form-input-cluster-config-current-host-number-minus-ccvm').on('change click', function () {

    let current_host_num_val = $('#form-input-cluster-config-current-host-number-ccvm').val();
    let total_host_num_val = $('#form-input-cluster-config-host-number-ccvm').val();
    if (total_host_num_val <= 99 && current_host_num_val <= 99) {
        let target_table = $("#form-table-tbody-cluster-config-new-host-profile-ccvm");
        target_table.empty();
        let insert_tr;
        insert_tr += "<tr>";
        insert_tr += "<td contenteditable='true'>192.168.0.10</td>";
        insert_tr += "<td contenteditable='flase'>ccvm-mngt</td>";
        insert_tr += "<td contenteditable='flase'>ccvm</td>";
        insert_tr += "</tr>";

        for (let i = 1; i <= total_host_num_val; i++) {
            let sum = 0 + i;
            insert_tr += "<tr>";
            insert_tr += "<td contenteditable='true'>192.168.1."+ sum +"</td>";
            insert_tr += "<td contenteditable='true'>ablecube"+ i +"</td>";
            if(current_host_num_val == sum) {
                insert_tr += "<td contenteditable='true'>ablecube</td>";
            }else {
                insert_tr += "<td contenteditable='flase'></td>";
            }
            insert_tr += "</tr>";
        }
        for (let i = 1; i <= total_host_num_val; i++) {
            let sum = 0 + i;
            insert_tr += "<tr>";
            insert_tr += "<td contenteditable='true'>192.168.2."+ sum +"</td>";
            insert_tr += "<td contenteditable='flase'>scvm"+ i +"-mngt</td>";
            if(current_host_num_val == sum) {
                insert_tr += "<td contenteditable='flase'>scvm-mngt</td>";
            }else {
                insert_tr += "<td contenteditable='flase'></td>";
            }
            insert_tr += "</tr>";
        }
        for (let i = 1; i <= total_host_num_val; i++) {
            let sum = 0 + i;
            insert_tr += "<tr>";
            insert_tr += "<td contenteditable='true'>100.100.10."+ sum +"</td>";
            insert_tr += "<td contenteditable='true'>ablecube"+ i +"-pn" +"</td>";
            if(current_host_num_val == sum) {
                insert_tr += "<td contenteditable='true'>ablecube-pn</td>";
            }else {
                insert_tr += "<td contenteditable='flase'></td>";
            }
            insert_tr += "</tr>";
        }
        for (let i = 1; i <= total_host_num_val; i++) {
            let sum = 100 + i;
            insert_tr += "<tr>";
            insert_tr += "<td contenteditable='true'>100.100.10."+ sum +"</td>";
            insert_tr += "<td contenteditable='flase'>scvm"+ i +"</td>";
            if(current_host_num_val == sum-100) {
                insert_tr += "<td contenteditable='flase'>scvm</td>";
            }else {
                insert_tr += "<td contenteditable='flase'></td>";
            }
            insert_tr += "</tr>";
        }
        for (let i = 1; i <= total_host_num_val; i++) {
            let sum = 10 + i;
            insert_tr += "<tr>";
            insert_tr += "<td contenteditable='true'>100.200.10."+ sum +"</td>";
            insert_tr += "<td contenteditable='flase'>scvm"+ i +"-cn</td>";
            if(current_host_num_val == sum-10) {
                insert_tr += "<td contenteditable='flase'>scvm-cn</td>";
            }else {
                insert_tr += "<td contenteditable='flase'></td>";
            }
            insert_tr += "</tr>";
        }
        $("#form-table-cluster-config-new-host-profile-ccvm").append(insert_tr);

    } else {
        $('#form-input-cluster-config-host-number-ccvm').val(99);
        $('#form-input-cluster-config-current-host-number-ccvm').val(99);
        alert("1~99까지의 숫자만 입력할 수 있습니다.");
    }
    // 기존 파일 사용 시, 현재 호스트 + 또는 - 클릭 시 Alias2 변경 
    let option = "-ccvm";
    changeAlias2(option);
});

// Hosts 기존 파일 선택 시 hidden textarea 내용을 선택한 파일의 내용으로 변경
$('#form-input-cloud-vm-hosts-file').on('click', function () {
    let hosts_input = document.querySelector('#form-input-cloud-vm-hosts-file');
    let file_type = "hosts";
    let option = "-ccvm";
    fileReaderIntoTableFunc(hosts_input, file_type, option);
    $('#form-input-cloud-vm-hosts-file').val("");
});
// Hosts 기존 파일 선택 시, 파일 선택 취소 시 table 초기화
$('#form-input-cloud-vm-hosts-file').on('change', function () {
    if ($(this).val() == "") {
        $('#form-table-tbody-cluster-config-existing-host-profile-ccvm tr').remove();
    }
});

// 마법사 "배포 실행 버튼 모달창"
$('#button-cancel-modal-cloud-wizard-confirm').on('click', function () {
    $('#div-modal-cloud-wizard-confirm').hide();
});
$('#button-close-modal-cloud-wizard-confirm').on('click', function () {
    $('#div-modal-cloud-wizard-confirm').hide();
});
// 마법사 "배포 버튼 모달창" 실행 버튼을 눌러 가상머신 배포
$('#button-execution-modal-cloud-wizard-confirm').on('click', function () {
    $('#div-modal-cloud-wizard-confirm').hide();
    if(validateCloudCenterVm()){
        deployCloudCenterVM();
        cur_step_wizard_cloud_vm = "8";
    }
});

// 마법사 "취소 버튼 모달창" show, hide
$('#button-cancel-config-modal-wizard-cloud-vm').on('click', function () {
    $('#div-modal-cancel-cloud-wizard-cancel').show();
});
$('#button-close-modal-cloud-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-cloud-wizard-cancel').hide();
});
$('#button-cancel-modal-cloud-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-cloud-wizard-cancel').hide();
});
// 마법사 "취소 버튼 모달창" 실행 버튼을 눌러 취소를 실행
$('#button-execution-modal-cloud-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-cloud-wizard-cancel').hide();
    $('#div-modal-wizard-cloud-vm').hide();
    // hosts
    $('#form-radio-hosts-new').prop('checked', true);
    $('#form-radio-hosts-file').prop('checked', false);
    $('#form-input-cluster-config-hosts-file').val("");
    $('#form-textarea-cluster-config-existing-host-profile').val("");
    $('#div-form-hosts-profile').show();
    $('#div-form-hosts-file').hide();
    $('#div-form-hosts-table').hide();
    $('#div-form-hosts-input-number').show();
    $('#div-form-hosts-input-current-number').show();
    // hosts 입력 테이블 초기화
    $('#form-table-tbody-cluster-config-new-host-profile tr').remove();
    $('#form-table-tbody-cluster-config-existing-host-profile tr').remove();
    $('#form-input-cluster-config-host-number').val(1);
    $('#form-input-cluster-config-currnt-host-number').val(1);
    //상태값 초기화 겸 페이지 리로드
    location.reload();
});

/* HTML Object에서 발생하는 이벤트 처리 끝 */

/* 함수 정의 시작 */

/**
 * Meathod Name : resetCloudVMWizard  
 * Date Created : 2021.03.08
 * Writer  : 박동혁
 * Description : 마법사 대화상자의 모든 디비전 및 사이드버튼 속성을 초기화
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.08 최초 작성
 */
function resetCloudVMWizard(){
    // 모든 디비전 숨기기
    $('#div-modal-wizard-cloud-vm-overview').hide();
    $('#div-modal-wizard-cloud-vm-failover-cluster').hide();
    $('#div-modal-wizard-cloud-vm-compute').hide();
    $('#div-modal-wizard-cloud-vm-network').hide();
    $('#div-modal-wizard-cloud-vm-additional').hide();
    $('#div-modal-wizard-cloud-vm-ssh-key').hide();
    $('#div-modal-wizard-cloud-vm-review').hide();
    $('#div-modal-wizard-cloud-vm-deploy').hide();
    $('#div-modal-wizard-cloud-vm-finish').hide();

    // 모든 사이드버튼 '기본' 속성 삭제
    $('#nav-button-cloud-vm-overview').removeClass('pf-m-current');
    $('#nav-button-cloud-vm-cluster').removeClass('pf-m-current');
    $('#nav-button-cloud-vm-appliance').removeClass('pf-m-current');
    $('#nav-button-cloud-vm-compute').removeClass('pf-m-current');
    $('#nav-button-cloud-vm-network').removeClass('pf-m-current');
    $('#nav-button-cloud-vm-additional').removeClass('pf-m-current');
    $('#nav-button-cloud-vm-ssh-key').removeClass('pf-m-current');
    $('#nav-button-cloud-vm-review').removeClass('pf-m-current');
    $('#nav-button-cloud-vm-finish').removeClass('pf-m-current');

    // footer 버튼 속성 설정
    $('#button-next-step-modal-wizard-cloud-vm').html('다음');
}

/**
 * Meathod Name : deployCloudCenterVM  
 * Date Created : 2021.03.17
 * Writer  : 박동혁
 * Description : 클라우드센터 가상머신을 배포하는 작업을 화면에 표시하도록 하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.17 최초 작성
 */
function deployCloudCenterVM() {

    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-deploy').show();
    $('#nav-button-cloud-vm-finish').addClass('pf-m-current');

    /*
    $('#button-next-step-modal-wizard-cloud-vm').html('완료');
    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', true);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    */
    
    // 하단 버튼 숨김
    $('#button-next-step-modal-wizard-cloud-vm').hide();
    $('#button-before-step-modal-wizard-cloud-vm').hide();
    $('#button-cancel-config-modal-wizard-cloud-vm').hide();

    // 왼쪽 사이드 버튼 전부 비활성화 
    $('#nav-button-cloud-vm-overview').addClass('pf-m-disabled');
    $('#nav-button-cloud-vm-cluster').addClass('pf-m-disabled');
    $('#nav-button-cloud-vm-appliance').addClass('pf-m-disabled');
    $('#nav-button-cloud-vm-compute').addClass('pf-m-disabled');
    $('#nav-button-cloud-vm-network').addClass('pf-m-disabled');
    $('#nav-button-cloud-vm-additional').addClass('pf-m-disabled');
    $('#nav-button-cloud-vm-ssh-key').addClass('pf-m-disabled');
    $('#nav-button-cloud-vm-review').addClass('pf-m-disabled');

    var host1_name = $('#form-input-cloud-vm-failover-cluster-host1-name').val();
    var host2_name = $('#form-input-cloud-vm-failover-cluster-host2-name').val();
    var host3_name = $('#form-input-cloud-vm-failover-cluster-host3-name').val();

    //=========== 1. 클러스터 구성 host 네트워크 연결 테스트 ===========
    setProgressStep("span-ccvm-progress-step1",1);
    var console_log = true;
    createLoggerInfo("deployCloudCenterVM start");
    var host_ping_test_cmd = ['python3', pluginpath + '/python/vm/host_ping_test.py', '-hns', host1_name, host2_name, host3_name];
    if(console_log){console.log(host_ping_test_cmd);}
    cockpit.spawn(host_ping_test_cmd)
        .then(function(data){
            //결과 값 json으로 return
            var ping_test_result = JSON.parse(data);
            if(ping_test_result.code=="200") { //정상
                //=========== 2. 클러스터 구성 설정 초기화 작업 ===========
                // 설정 초기화 ( 필요시 python까지 종료 )
                setProgressStep("span-ccvm-progress-step1",2);
                setProgressStep("span-ccvm-progress-step2",1);
                var reset_cloud_center_cmd = ['python3', pluginpath + '/python/vm/reset_cloud_center.py'];
                if(console_log){console.log(reset_cloud_center_cmd);}
                cockpit.spawn(reset_cloud_center_cmd)
                    .then(function(data){
                        //결과 값 json으로 return
                        var reset_cloud_center_result = JSON.parse(data);
                        if(reset_cloud_center_result.code=="200") { //정상
                            //=========== 3. cloudinit iso 파일 생성 ===========
                            // host 파일 /usr/share/cockpit/ablestack/tools/vmconfig/ccvm/cloudinit 경로에 hosts, ssh key 파일 저장
                            setProgressStep("span-ccvm-progress-step2",2);
                            setProgressStep("span-ccvm-progress-step3",1);

                            var host_name = $('#form-input-cloud-vm-hostname').val();
                            var mgmt_ip = $('#form-input-cloud-vm-mngt-nic-ip').val().split("/")[0];
                            var mgmt_prefix = $('#form-input-cloud-vm-mngt-nic-ip').val().split("/")[1];
                            var mngt_gw = $('#form-input-cloud-vm-mngt-gw').val();
                            
                            create_ccvm_cloudinit_cmd = ['python3', pluginpath + '/python/vm/create_ccvm_cloudinit.py'
                                                    ,"-f1",pluginpath+"/tools/vmconfig/ccvm/hosts","-t1", $("#div-textarea-cluster-config-confirm-hosts-file-ccvm").val() // hosts 파일
                                                    ,"-f2",pluginpath+"/tools/vmconfig/ccvm/id_rsa","-t2", $("#form-textarea-cloud-vm-ssh-private-key-file").val() // ssh 개인 key 파일
                                                    ,"-f3",pluginpath+"/tools/vmconfig/ccvm/id_rsa.pub","-t3", $("#form-textarea-cloud-vm-ssh-public-key-file").val() // ssh 공개 key 파일
                                                    ,'--hostname',host_name
                                                    ,'-hns', host1_name, host2_name, host3_name
                                                    ,'--mgmt-nic','ens20'
                                                    ,'--mgmt-ip',mgmt_ip
                                                    ,'--mgmt-prefix',mgmt_prefix
                                                    ,'--mgmt-gw',mngt_gw
                                                ];
                            
                            var svc_bool = $('input[type=checkbox][id="form-checkbox-svc-network"]').is(":checked");
                            if(svc_bool){
                                var sn_ip = $('#form-input-cloud-vm-svc-nic-ip').val().split("/")[0];
                                var sn_prefix = $('#form-input-cloud-vm-svc-nic-ip').val().split("/")[1];
                                var sn_gw = $('#form-input-cloud-vm-svc-gw').val();
                                create_ccvm_cloudinit_cmd.push('--sn-nic','ens21','--sn-ip',sn_ip,'--sn-prefix',sn_prefix,'--sn-gw',sn_gw)
                            }
                            if(console_log){console.log(create_ccvm_cloudinit_cmd);}
                            cockpit.spawn(create_ccvm_cloudinit_cmd)
                                .then(function(data){
                                    //결과 값 json으로 return
                                    var create_ccvm_cloudinit_result = JSON.parse(data);
                                    if(create_ccvm_cloudinit_result.code=="200"){
                                        //=========== 4. 클라우드센터 가상머신 구성 ===========
                                        setProgressStep("span-ccvm-progress-step3",2);
                                        setProgressStep("span-ccvm-progress-step4",1);
                                        xml_create_cmd.push("-hns",host1_name,host2_name,host3_name);
                                        if(console_log){console.log(xml_create_cmd);}
                                        cockpit.spawn(xml_create_cmd)
                                            .then(function(data){
                                                //결과 값 json으로 return
                                                var create_ccvm_xml_result = JSON.parse(data);
                                                if(create_ccvm_xml_result.code=="200"){
                                                    //=========== 5. 클러스터 구성 및 클라우드센터 가상머신 배포 ===========
                                                    //클러스터 생성
                                                    setProgressStep("span-ccvm-progress-step4",2);
                                                    setProgressStep("span-ccvm-progress-step5",1);
                                                    var pcs_config = ['python3', pluginpath + '/python/vm/setup_pcs_cluster.py', '-hns', host1_name, host2_name, host3_name];
                                                    if(console_log){console.log(pcs_config);}
                                                    cockpit.spawn(pcs_config)
                                                        .then(function(data){
                                                            //결과 값 json으로 return
                                                            var result = JSON.parse(data);
                                                            if(result.code=="200"){
                                                                createLoggerInfo("deployCloudCenterVM success");
                                                                setProgressStep("span-ccvm-progress-step5",2);
                                                                //최종 화면 호출
                                                                showDivisionCloudVMConfigFinish();
                                                            } else {
                                                                setProgressFail(5);
                                                                createLoggerInfo(result.val);
                                                                alert(result.val);            
                                                            }
                                                        })
                                                        .catch(function(data){
                                                            setProgressFail(5);
                                                            createLoggerInfo("Cluster configuration and cloud center virtual machine deployment failed");
                                                            alert("클러스터 구성 및 클라우드센터 가상머신 배포 실패 : "+data);
                                                        });                                                        
                                                } else {
                                                    setProgressFail(4);
                                                    createLoggerInfo(create_ccvm_xml_result.val);
                                                    alert(create_ccvm_xml_result.val);
                                                }
                                            })
                                            .catch(function(data){
                                                setProgressFail(4);
                                                createLoggerInfo("Cloud Center Virtual Machine XML Creation Failed");
                                                alert("클라우드센터 가상머신 XML 생성 실패 : "+data);
                                            });                                        
                                    } else {
                                        setProgressFail(3);
                                        createLoggerInfo(create_ccvm_cloudinit_result.val);
                                        alert(create_ccvm_cloudinit_result.val);
                                    }
                                })
                                .catch(function(data){
                                    setProgressFail(3);
                                    createLoggerInfo("Failed to create cloudinit iso file");
                                    alert("cloudinit iso 파일 생성 실패 : "+data);
                                });

                        } else {
                            setProgressFail(2);
                            createLoggerInfo(reset_cloud_center_result.val);
                            alert(reset_cloud_center_result.val);
                        }
                    })
                    .catch(function(data){
                        setProgressFail(2);
                        createLoggerInfo("Failed to initialize cluster configuration settings");
                        alert("클러스터 구성 설정 초기화 작업 실패 : "+data);
                    });

            } else {
                setProgressFail(1);
                createLoggerInfo(ping_test_result.val);
                alert(ping_test_result.val);
            }
        })
        .catch(function(data){
            setProgressFail(1);
            createLoggerInfo("Failed to check connection status of host to configure cluster");
            alert("클러스터 구성할 host 연결 상태 확인 실패 : "+data);
        });
}

/**
 * Meathod Name : setProgressFail
 * Date Created : 2021.03.24
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신 배포 진행중 실패 단계에 따른 중단됨 UI 처리
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.24 최초 작성
 */
function setProgressFail(setp_num){
    if( setp_num == 1 || setp_num == '1' ){   // 1단계 이하 단계 전부 중단된 처리
        setProgressStep("span-ccvm-progress-step1",3);
        setProgressStep("span-ccvm-progress-step2",3);
        setProgressStep("span-ccvm-progress-step3",3);
        setProgressStep("span-ccvm-progress-step4",3);
        setProgressStep("span-ccvm-progress-step5",3);
    } else if(setp_num == 2 || setp_num == '2') {   // 2단계 이하 단계 전부 중단된 처리
        setProgressStep("span-ccvm-progress-step2",3);
        setProgressStep("span-ccvm-progress-step3",3);
        setProgressStep("span-ccvm-progress-step4",3);
        setProgressStep("span-ccvm-progress-step5",3);
    } else if(setp_num == 3 || setp_num == '3') {   // 3단계 이하 단계 전부 중단된 처리
        setProgressStep("span-ccvm-progress-step3",3);
        setProgressStep("span-ccvm-progress-step4",3);
        setProgressStep("span-ccvm-progress-step5",3);
    } else if(setp_num == 4 || setp_num == '4') {   // 4단계 이하 단계 전부 중단된 처리
        setProgressStep("span-ccvm-progress-step4",3);
        setProgressStep("span-ccvm-progress-step5",3);
    } else if(setp_num == 5 || setp_num == '5') {   // 5단계 이하 단계 전부 중단된 처리
        setProgressStep("span-ccvm-progress-step5",3);
    }
}


/**
 * Meathod Name : showDivisionCloudVMConfigFinish
 * Date Created : 2021.03.17
 * Writer  : 박동혁
 * Description : 클라우드센터 가상머신을 배포한 후 마지막 페이지를 보여주는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.17 최초 작성
 */
function showDivisionCloudVMConfigFinish() {
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-finish').show();

    $('#nav-button-cloud-vm-finish').addClass('pf-m-current');
    $('#nav-button-cloud-vm-finish').removeClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-cloud-vm').html('완료');
    //$('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    //$('#button-before-step-modal-wizard-cloud-vm').attr('disabled', true);
    //$('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    $('#button-next-step-modal-wizard-cloud-vm').hide();
    $('#button-before-step-modal-wizard-cloud-vm').hide();
    $('#button-cancel-config-modal-wizard-cloud-vm').hide();

    completed = true;
    
    cur_step_wizard_cloud_vm = "8";
}

$('input[type=checkbox][id="form-checkbox-svc-network"]').on('change', function(){
    resetSvcNetworkValues();
});

/**
 * Meathod Name : resetSvcNetworkValues
 * Date Created : 2021.03.18
 * Writer  : 배태주
 * Description : 서비스네트워크 체크박스 클릭에 따른 세팅값 초기화 이벤트
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.18 최초 작성
 */
function resetSvcNetworkValues(){
    var svc_bool = $('input[type=checkbox][id="form-checkbox-svc-network"]').is(":checked");
    //체크 해제시 관련 설정값 초기화
    if(!svc_bool){
        //서비스네트워크 셀렉트 박스
        $('select#form-select-cloud-vm-svc-parent').val("");
        //추가 네트워크 정보
        $("#form-input-cloud-vm-svc-nic-ip").val("");
        $("#form-input-cloud-vm-svc-vlan").val("");
        $("#form-input-cloud-vm-svc-gw").val("");
    }
}

/**
 * Meathod Name : setCcvmNetworkInfo
 * Date Created : 2021.03.19
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신 추가 네트워크 정보를 입력하는 기능
 * Parameter : array
 * Return  : 없음
 * History  : 2021.03.19 최초 작성
 */
function setCcvmNetworkInfo(host_array, text){
    if(host_array != ""){
        //호스트 파일로 세팅하겠다고 선택한 경우
        var host_file_setting = $('input[type=checkbox][id="form-input-cloud-vm-additional-file"]').is(":checked");
        if(host_file_setting){
            //초기화
            resetCcvmNetworkInfo();
            var host_list = JSON.parse(host_array);

            var ccvm_host_name = "ccvm";
            $("#form-input-cloud-vm-hostname").val(ccvm_host_name);

            //hosts 내용 textarea에 저장
            $("#form-textarea-cloud-vm-hosts-file").val(text);
            
            for(var i = 0 ; i < host_list.length ; i++){
                if(host_list[i].hostName == "ccvm-mngt"){
                    $("#form-input-cloud-vm-mngt-nic-ip").val(host_list[i].ip+"/24");
                }else if(host_list[i].hostName == "ccvm-svc"){
                    //서비스네트워크를 선택했을 경우에만 세팅
                    if($('input[type=checkbox][id="form-checkbox-svc-network"]').is(":checked")){
                        $("#form-input-cloud-vm-svc-nic-ip").val(host_list[i].ip+"/24");
                    }
                }
            }    
        }
    } else {
        //초기화
        resetCcvmNetworkInfo();
    }
}

/**
 * Meathod Name : resetCcvmNetworkInfo
 * Date Created : 2021.03.19
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신 추가 네트워크 정보를 초기화하는 기능
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.19 최초 작성
 */
function resetCcvmNetworkInfo(){
    //input 초기화
    $("#form-input-cloud-vm-hostname").val("");
    $("#form-input-cloud-vm-mngt-nic-ip").val("");
    $("#form-input-cloud-vm-mngt-vlan").val("");
    $("#form-input-cloud-vm-mngt-gw").val("");
    $("#form-input-cloud-vm-svc-nic-ip").val("");
    $("#form-input-cloud-vm-svc-vlan").val("");
    $("#form-input-cloud-vm-svc-gw").val("");
}

/**
 * Meathod Name : setCcvmSshPrivateKeyInfo
 * Date Created : 2021.03.19
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신에 사용할 ssh private key 파일 세팅
 * Parameter : String
 * Return  : 없음
 * History  : 2021.03.19 최초 작성
 */
function setCcvmSshPrivateKeyInfo(ssh_private_key){
    if(ssh_private_key != ""){
        $("#form-textarea-cloud-vm-ssh-private-key-file").val(ssh_private_key);
    } else {
        $("#form-textarea-cloud-vm-ssh-private-key-file").val("");
    }
}

/**
 * Meathod Name : setCcvmSshPublicKeyInfo
 * Date Created : 2021.03.29
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신에 사용할 ssh public key 파일 세팅
 * Parameter : String
 * Return  : 없음
 * History  : 2021.03.29 최초 작성
 */
 function setCcvmSshPublicKeyInfo(ssh_public_key){
    if(ssh_public_key != ""){
        $("#form-textarea-cloud-vm-ssh-public-key-file").val(ssh_public_key);
    } else {
        $("#form-textarea-cloud-vm-ssh-public-key-file").val("");
    }
}

/**
 * Meathod Name : setCcvmReviewInfo
 * Date Created : 2021.03.18
 * Writer  : 배태주
 * Description : 클라우드센터 VM 배포 전 설정확인을 위한 정보를 세팅하는 기능
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.18 최초 작성
 */
function setCcvmReviewInfo(){

    //클라우드센터 가상머신 XML 생성 커맨드 기본 텍스트
    xml_create_cmd = ["python3",pluginpath + "/python/vm/create_ccvm_xml.py"];
    
    //-----장애조치 클러스터 설정-----
    //클러스터 호스트1, 호스트2, 호스트3 이름
    var host1_name = $('#form-input-cloud-vm-failover-cluster-host1-name').val();
    if(host1_name == '') {
        $('#span-cloud-vm-failover-cluster-host1-name').text("미입력");
    } else {
        $('#span-cloud-vm-failover-cluster-host1-name').text(host1_name);
    }

    var host2_name = $('#form-input-cloud-vm-failover-cluster-host2-name').val();
    if(host2_name == '') {
        $('#span-cloud-vm-failover-cluster-host2-name').text("미입력");
    } else {
        $('#span-cloud-vm-failover-cluster-host2-name').text(host2_name);
    }

    var host3_name = $('#form-input-cloud-vm-failover-cluster-host3-name').val();
    if(host3_name == '') {
        $('#span-cloud-vm-failover-cluster-host3-name').text("미입력");
    } else {
        $('#span-cloud-vm-failover-cluster-host3-name').text(host3_name);
    }
    
    //-----클라우드센트 VM 설정-----
    //cpu
    var cpu = $('select#form-modal-select-cloud-vm-compute-cpu-core option:checked').val();
    var cpu_text = $('select#form-modal-select-cloud-vm-compute-cpu-core option:checked').text();
    
    if(cpu == '') {
        $('#span-cloud-vm-cpu-core').text("미입력");
    } else {
        xml_create_cmd.push("-c",cpu);
        $('#span-cloud-vm-cpu-core').text(cpu_text);
    }

    //memory
    var memory = $('select#form-modal-select-cloud-vm-compute-memory option:checked').val();
    var memory_txt = $('select#form-modal-select-cloud-vm-compute-memory option:checked').text();

    if(memory == '') {
        $('#span-cloud-vm-memory').text("미입력");
    } else {
        xml_create_cmd.push("-m",memory);
        $('#span-cloud-vm-memory').text(memory_txt);
    }
    
    //네트워크 구성 mngt_bool은 필수 값이므로 값이 항상 true
    var mngt_bool = $('input[type=checkbox][id="form-checkbox-mngt-network"]').is(":checked");
    var svc_bool = $('input[type=checkbox][id="form-checkbox-svc-network"]').is(":checked");

    if(mngt_bool && svc_bool) {
        $('#span-cloud-vm-network-config').text("관리네트워크, 서비스네트워크");
    } else {
        $('#span-cloud-vm-network-config').text("관리네트워크");
    }

    //관리용 bridge
    var mngt_nic = $('select#form-select-cloud-vm-mngt-parent option:checked').val();
    var mngt_nic_txt = $('select#form-select-cloud-vm-mngt-parent option:checked').text();
    
    if(mngt_nic == '') {
        $('#span-cloud-vm-mgmt-nic-bridge').text("미입력");
    } else {
        xml_create_cmd.push("-mnb",mngt_nic);
        $('#span-cloud-vm-mgmt-nic-bridge').text(mngt_nic_txt);
    }

    //서비스용 bridge
    if(svc_bool){
        var svc_nic = $('select#form-select-cloud-vm-svc-parent option:checked').val();
        var svc_nic_txt = $('select#form-select-cloud-vm-svc-parent option:checked').text();
        if(svc_nic == '') {
            $('#span-cloud-vm-svc-nic-bridge').text("미입력");
        } else {
            xml_create_cmd.push("-snb",svc_nic);
            $('#span-cloud-vm-svc-nic-bridge').text(svc_nic_txt);
        }   
    } else {
        $('#span-cloud-vm-svc-nic-bridge').text("N/A");
    }

    //-----추가 네트워크 정보-----
    //정보입력 소스
    var host_file_setting = $('input[type=checkbox][id="form-input-cloud-vm-additional-file"]').is(":checked");
    if(host_file_setting) {
        $('#span-cloud-vm-additional-hosts-source').text("Hosts 파일 입력");
    } else {
        $('#span-cloud-vm-additional-hosts-source').text("직접 입력");
    }

    //hosts 파일
    // 변경된 hosts file 내용을 설정 확인에 반영
    let host_file_type = $('input[name=radio-hosts-file-ccvm]:checked').val();
    let option = '-ccvm';
    putHostsValueIntoTextarea(host_file_type, option);
    
    //호스트명
    var ccvm_name = $('#form-input-cloud-vm-hostname').val();
    if(ccvm_name == '') {
        $('#span-cloud-vm-additional-hostname').text("미입력");
    } else {
        $('#span-cloud-vm-additional-hostname').text(ccvm_name);
    }

    //관리 NIC IP
    var ccvm_mngt_nic_ip = $('#form-input-cloud-vm-mngt-nic-ip').val();
    if(ccvm_mngt_nic_ip == '') {
        $('#span-cloud-vm-additional-mgmt-ipaddr').text("미입력");
    } else {
        $('#span-cloud-vm-additional-mgmt-ipaddr').text(ccvm_mngt_nic_ip);
    }
    
    //관리 VLAN ID
    var ccvm_mngt_vlan_id = $('#form-input-cloud-vm-mngt-vlan').val();
    if(ccvm_mngt_vlan_id == '') {
        $('#span-cloud-vm-additional-mgmt-vlan-id').text("N/A");
    } else {
        $('#span-cloud-vm-additional-mgmt-vlan-id').text(ccvm_mngt_vlan_id);
    }

    //관리 NIC Gateway
    var ccvm_mngt_gateway = $('#form-input-cloud-vm-mngt-gw').val();
    if(ccvm_mngt_gateway == '') {
        $('#span-cloud-vm-additional-mgmt-gateway').text("미입력");
    } else {
        $('#span-cloud-vm-additional-mgmt-gateway').text(ccvm_mngt_gateway);
    }

    if(svc_bool){
        //서비스 NIC IP
        var ccvm_svc_nic_ip = $('#form-input-cloud-vm-svc-nic-ip').val();
        if(ccvm_svc_nic_ip == '') {
            $('#span-cloud-vm-additional-svc-ipaddr').text("미입력");
        } else {
            $('#span-cloud-vm-additional-svc-ipaddr').text(ccvm_svc_nic_ip);
        }
        
        //서비스 VLAN ID
        var ccvm_svc_vlan_id = $('#form-input-cloud-vm-svc-vlan').val();
        if(ccvm_svc_vlan_id == '') {
            $('#span-cloud-vm-additional-svc-vlan-id').text("N/A");
        } else {
            $('#span-cloud-vm-additional-svc-vlan-id').text(ccvm_svc_vlan_id);
        }
        
        //서비스 NIC Gateway
        var ccvm_svc_gateway = $('#form-input-cloud-vm-svc-gw').val();
        if(ccvm_svc_gateway == '') {
            $('#span-cloud-vm-additional-svc-gateway').text("미입력");
        } else {
            $('#span-cloud-vm-additional-svc-gateway').text(ccvm_svc_gateway);
        }
    } else {
        $('#span-cloud-vm-additional-svc-ipaddr').text("N/A");
        $('#span-cloud-vm-additional-svc-vlan-id').text("N/A");
        $('#span-cloud-vm-additional-svc-gateway').text("N/A");
    }
    //-----SSH Key 정보-----
    var ssh_private_key_url = $('#form-input-cloud-vm-ssh-private-key-file').val();
    if(ssh_private_key_url == '') {
        $('#span-cloud-vm-ssh-private-key-file').text("미입력");
    } else {
        $('#span-cloud-vm-ssh-private-key-file').text(ssh_private_key_url);
    }

    var ssh_public_key_url = $('#form-input-cloud-vm-ssh-public-key-file').val();
    if(ssh_public_key_url == '') {
        $('#span-cloud-vm-ssh-public-key-file').text("미입력");
    } else {
        $('#span-cloud-vm-ssh-public-key-file').text(ssh_public_key_url);
    }
}

/**
 * Meathod Name : validateCloudCenterVm
 * Date Created : 2021.03.18
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.18 최초 작성
 */
function validateCloudCenterVm(){

    var valicate_check = true;

    var svc_bool = $('input[type=checkbox][id="form-checkbox-svc-network"]').is(":checked");

    if($('#form-input-cloud-vm-failover-cluster-host1-name').val() == ""){ //host1 name
        alert("클러스터 호스트1의 이름을 입력해주세요.");
        valicate_check = false;
    } else if ($('#form-input-cloud-vm-failover-cluster-host2-name').val() == "") { //host2 name
        alert("클러스터 호스트2의 이름을 입력해주세요.");
        valicate_check = false;
    } else if ($('#form-input-cloud-vm-failover-cluster-host3-name').val() == "") { //host3 name
        alert("클러스터 호스트3의 이름을 입력해주세요.");
        valicate_check = false;
    } else if ($('select#form-modal-select-cloud-vm-compute-cpu-core option:checked').val() == "") { //cpu
        alert("CPU core를 입력해주세요.");
        valicate_check = false;
    } else if ($('select#form-select-cloud-vm-compute-memory option:checked').val() == "") { //memory
        alert("Memory를 입력해주세요.");
        valicate_check = false;
    } else if ($('select#form-select-cloud-vm-mngt-parent option:checked').val() == "") { //관리용 bridge
        alert("관리용네트워크를 입력해주세요.");
        valicate_check = false;
    } else if (svc_bool && $('select#form-select-cloud-vm-svc-parent option:checked').val() == "") {//서비스용 bridge
        alert("서비스네트워크를 입력해주세요.");
        valicate_check = false;
    } else if ($('#div-textarea-cluster-config-confirm-hosts-file-ccvm').val() == "") { //hosts 파일
        alert("Hosts 파일을 입력해주세요.");
        valicate_check = false;
    } else if ($('#form-input-cloud-vm-hostname').val() == "") { //클라우드센터 가상머신 호스트명
        alert("클라우드센터 가상머신의 호스트명 입력해주세요.");
        valicate_check = false;
    } else if ($('#form-input-cloud-vm-mngt-nic-ip').val() == "") { //관리 NIC IP
        alert("관리 NIC IP를 입력해주세요.");
        valicate_check = false;
    } else if ($('#form-input-cloud-vm-mngt-gw').val() == "") { //관리 NIC Gateway
        alert("관리 NIC Gateway를 입력해주세요.");
        valicate_check = false;
    } else if (svc_bool && $('#form-input-cloud-vm-svc-nic-ip').val() == "") { //서비스 NIC IP
        alert("서비스 NIC IP를 입력해주세요.");
        valicate_check = false;
    } else if (svc_bool && $('#form-input-cloud-vm-svc-gw').val() == "") { //서비스 NIC Gateway
        alert("서비스 NIC Gateway를 입력해주세요.");
        valicate_check = false;
    } else if ( $('#form-textarea-cloud-vm-ssh-private-key-file').val() == "") { //SSH 개인 Key 정보
        alert("SSH 개인 Key 파일을 입력해주세요.");
        valicate_check = false;
    } else if ( $('#form-textarea-cloud-vm-ssh-public-key-file').val() == "") { //SSH 공개 Key 정보
        alert("SSH 공개 Key 파일을 입력해주세요.");
        valicate_check = false;
    } else if(!checkHostFormat($("#form-input-cloud-vm-hostname").val())){
        alert("호스트명 입력 형식을 확인해주세요.");
        valicate_check = false;
    } else if(!checkCidrFormat($("#form-input-cloud-vm-mngt-nic-ip").val())){
        alert("관리 NIC IP 형식을 확인해주세요.");
        valicate_check = false;
    } else if(!checkIp($("#form-input-cloud-vm-mngt-gw").val())){
        alert("관리 NIC Gateway 형식을 확인해주세요.");
        valicate_check = false;
    } else if(svc_bool && !checkCidrFormat($("#form-input-cloud-vm-svc-nic-ip").val())){
        alert("서비스 NIC IP 형식을 확인해주세요.");
        valicate_check = false;
    } else if(svc_bool && !checkIp($("#form-input-cloud-vm-svc-gw").val())){
        alert("서비스 NIC Gateway 형식을 확인해주세요.");
        valicate_check = false;
    }

    return valicate_check;
}

/**
 * Meathod Name : checkValueNull
 * Date Created : 2021.03.22
 * Writer  : 배태주
 * Description : 입력된 값이 없는지 체크하여 값이 있을 경우 true return, 없을 경우 false 리턴
 * Parameter : String, String
 * Return  : bool
 * History  : 2021.03.22 최초 작성
 */
function checkValueNull(value, errorText){
    if(value == ""){
        alert(errorText);
        return false;
    } else {
        return;
    }
}

/* 함수 정의 끝 */