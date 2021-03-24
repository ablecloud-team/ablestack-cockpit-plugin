/**
 * File Name : storage-vm-wizard.js  
 * Date Created : 2020.02.19
 * Writer  : 박동혁
 * Description : 스토리지센터 VM 배포 마법사에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// 변수 선언
var cur_step_wizard_vm_config = "1";

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

    // $('#nav-button-review').addClass('pf-m-disabled');
    $('#nav-button-finish').addClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-vm-config').attr('disabled', false);

    // 첫번째 스텝에서 시작
    cur_step_wizard_vm_config = "1";
});
// document ready 끝

// 이벤트 처리 함수
$('#button-close-modal-wizard-storage-vm').on('click', function(){
    $('#div-modal-wizard-storage-vm').hide();
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
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', true);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-ssh-key').addClass('pf-m-current');

    cur_step_wizard_vm_config = "6";
});

$('#nav-button-review').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

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

// ssh-key 파일 선택 시 hidden textarea 내용을 선택한 파일의 내용으로 변경
$('#form-input-storage-vm-ssh-key-pri-file').on('click', function(){
    let ssh_key_input_pri = document.querySelector('#form-input-storage-vm-ssh-key-pri-file');
    let ssh_key_textarea_existing_pri = "div-textarea-storage-vm-temp-ssh-key-pri-file";
    fileReaderFunc(ssh_key_input_pri, ssh_key_textarea_existing_pri);
});
$('#form-input-storage-vm-ssh-key-pub-file').on('click', function(){
    let ssh_key_input_pub = document.querySelector('#form-input-storage-vm-ssh-key-pub-file');
    let ssh_key_textarea_existing_pub = "div-textarea-storage-vm-temp-ssh-key-pub-file";
    fileReaderFunc(ssh_key_input_pub, ssh_key_textarea_existing_pub);
});
// Hosts 파일 선택 시 hidden textarea 내용을 선택한 파일의 내용으로 변경
$('#form-input-storage-vm-hosts-file').on('click', function(){
    let hosts_input = document.querySelector('#form-input-storage-vm-hosts-file');
    let hosts_textarea_existing = "div-textarea-storage-vm-temp-hosts-file";
    fileReaderFunc(hosts_input, hosts_textarea_existing);
});
// Hosts 기존 파일 선택 시 파일 선택 취소 시 hidden textarea 초기화
$('#form-input-storage-vm-hosts-file').on('change', function(){
    if($(this).val() == ""){
        $('#div-textarea-storage-vm-temp-hosts-file').val("");
    }
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
 */
function deployStorageCenterVM() {
    setTimeout(showDivisionVMConfigFinish, 5000);
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
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', true);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-finish').addClass('pf-m-current');
    $('#nav-button-finish').removeClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-vm-config').hide();
    $('#button-before-step-modal-wizard-vm-config').hide();
    $('#button-cancel-config-modal-wizard-vm-config').hide();

    cur_step_wizard_vm_config = "9";
}