/**
 * File Name : cloud-vm-wizard.js  
 * Date Created : 2020.03.03
 * Writer  : 박동혁
 * Description : 클라우드센터 VM 배포 마법사 UI를 컨트롤하기 위한 스크립트
**/

// 변수 선언
var cur_step_wizard_cloud_vm = "1";

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
});

/* Document Ready 이벤트 처리 끝 */

/* Title 영역에서 발생하는 이벤트 처리 시작 */

$('#button-close-modal-wizard-cloud-vm').on('click', function(){
    $('#div-modal-wizard-cloud-vm').hide();
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
    resetCloudVMWizard();

    $('#div-modal-wizard-cloud-vm-review').show();
    $('#nav-button-cloud-vm-review').addClass('pf-m-current');
    $('#nav-button-cloud-vm-finish').removeClass('pf-m-disabled');

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

        $('#div-modal-wizard-cloud-vm-review').show();
        $('#nav-button-cloud-vm-review').addClass('pf-m-current');
        $('#nav-button-cloud-vm-finish').removeClass('pf-m-disabled');
    
        $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);
    
        cur_step_wizard_cloud_vm = "7";
    }
    else if (cur_step_wizard_cloud_vm == "7") {
        deployCloudCenterVM();
    
        cur_step_wizard_cloud_vm = "8";
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

$('#button-cancel-config-modal-wizard-cloud-vm').on('click', function(){
    $('#div-modal-wizard-cloud-vm').hide();
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

    $('#button-next-step-modal-wizard-cloud-vm').html('완료');
    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', true);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    setTimeout(showDivisionCloudVMConfigFinish, 5000);
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

    $('#button-next-step-modal-wizard-cloud-vm').html('완료');
    $('#button-next-step-modal-wizard-cloud-vm').attr('disabled', false);
    $('#button-before-step-modal-wizard-cloud-vm').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-cloud-vm').attr('disabled', false);

    cur_step_wizard_cloud_vm = "8";
}

/* 함수 정의 끝 */