/**
 * File Name : cluster-config-prepare.js  
 * Date Created : 2020.03.02
 * Writer  : 박동혁
 * Description : 클러스터 구성 준비 마법사 UI를 컨트롤하기 위한 스크립트
**/

// 변수 선언
var cur_step_wizard_cluster_config_prepare = "1";

// Document.ready 시작
$(document).ready(function(){
    // 마법사 페이지 준비
    $('#div-modal-wizard-cluster-config-ssh-key').hide();
    $('#div-modal-wizard-cluster-config-ip-info').hide();
    $('#div-modal-wizard-cluster-config-time-server').hide();
    $('#div-modal-wizard-cluster-config-review').hide();
    $('#div-modal-wizard-cluster-config-finish').hide();
    $('#div-form-hosts-file').hide();
    $('#span-timeserver2-required').hide();
    $('#span-timeserver3-required').hide();
    $('#div-accordion-ssh-key').hide();
    $('#div-accordion-hosts-file').hide();
    $('#div-accordion-timeserver').hide();

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', true);    

    $('#nav-button-cluster-config-overview').addClass('pf-m-current');
});

// 타이틀 닫기 버튼 이벤트 처리
$('#button-close-modal-wizard-cluster-config-prepare').on('click', function(){
    $('#div-modal-wizard-cluster-config-prepare').hide();
});

/* 마법사 사이드 메뉴 버튼 클릭 이벤트 처리 시작 */

$('#nav-button-cluster-config-overview').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-overview').show();
    $('#nav-button-cluster-config-overview').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', true);

    cur_step_wizard_cluster_config_prepare = "1";
});

$('#nav-button-cluster-config-ssh-key').on('click', function(){
    resetClusterConfigWizard();
    
    $('#div-modal-wizard-cluster-config-ssh-key').show();
    $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "2";
});

$('#nav-button-cluster-config-ip-info').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-ip-info').show();
    $('#nav-button-cluster-config-ip-info').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "3";
});

$('#nav-button-cluster-config-time-server').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-time-server').show();
    $('#nav-button-cluster-config-time-server').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "4";
});

$('#nav-button-cluster-config-review').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-review').show();
    $('#nav-button-cluster-config-review').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "5";

    // 변경된 키 내용을 설정 확인에 반영
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);
    // 변경된 hosts file 내용을 설정 확인에 반영
    let host_file_type = $('input[name=radio-hosts-file]:checked').val();
    putHostsValueIntoTextarea(host_file_type);
});

$('#nav-button-cluster-config-finish').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-finish').show();
    $('#nav-button-cluster-config-finish').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    $('#button-next-step-modal-wizard-cluster-config-prepare').html('완료');

    cur_step_wizard_cluster_config_prepare = "6";

    // 변경된 키 내용을 설정 확인에 반영
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);
    // 변경된 hosts file 내용을 설정 확인에 반영
    let host_file_type = $('input[name=radio-hosts-file]:checked').val();
    putHostsValueIntoTextarea(host_file_type);
});

/* 마법사 사이드 메뉴 버튼 클릭 이벤트 처리 끝 */

/* 마법사 Footer 영역의 버튼 클릭 이벤트 처리 시작 */

$('#button-next-step-modal-wizard-cluster-config-prepare').on('click', function(){
    resetClusterConfigWizard();

    if (cur_step_wizard_cluster_config_prepare == "1") {
        $('#div-modal-wizard-cluster-config-ssh-key').show();
        $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "2";
    }
    else if(cur_step_wizard_cluster_config_prepare == "2") {
        $('#div-modal-wizard-cluster-config-ip-info').show();
        $('#nav-button-cluster-config-ip-info').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "3";

    } else if (cur_step_wizard_cluster_config_prepare == "3") {
        $('#div-modal-wizard-cluster-config-time-server').show();
        $('#nav-button-cluster-config-time-server').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "4";

        // 변경된 키 내용을 설정 확인에 반영
        let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
        putSshKeyValueIntoTextarea(ssh_key_type);
        // 변경된 hosts file 내용을 설정 확인에 반영
        let host_file_type = $('input[name=radio-hosts-file]:checked').val();
        putHostsValueIntoTextarea(host_file_type);

    }
    else if(cur_step_wizard_cluster_config_prepare == "4") {
        $('#div-modal-wizard-cluster-config-review').show();
        $('#nav-button-cluster-config-review').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "5";

    }
    else if(cur_step_wizard_cluster_config_prepare == "5") {
        $('#div-modal-wizard-cluster-config-finish').show();
        $('#nav-button-cluster-config-finish').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        $('#button-next-step-modal-wizard-cluster-config-prepare').html('완료');

        cur_step_wizard_cluster_config_prepare = "6";
    }
    else if(cur_step_wizard_cluster_config_prepare == "6") {
        resetClusterConfigWizard();

        $('#div-modal-wizard-cluster-config-prepare').hide();
        $('#div-modal-wizard-cluster-config-overview').show();
        $('#nav-button-cluster-config-overview').addClass('pf-m-current');

        cur_step_wizard_cluster_config_prepare = "1";

        // 완료 버튼을 누르면 선택한 내용대로 파일이 서버에 저장
        // SSH Key 파일
        let radio_value = $('input[name=radio-ssh-key]:checked').val();
        putSshKeyValueIntoTextarea(radio_value);
        let pri_ssh_key_text = $('#div-textarea-cluster-config-confirm-ssh-key-pri-file').val();
        let pub_ssh_key_text = $('#div-textarea-cluster-config-confirm-ssh-key-pub-file').val();
        let file_type = "ssh_key";
        writeFile(pri_ssh_key_text, pub_ssh_key_text, file_type);

        // hosts 파일
        radio_value = $('input[name=radio-hosts-file]:checked').val();
        putSshKeyValueIntoTextarea(radio_value);
        let hosts_file_text = $('#div-textarea-cluster-config-confirm-hosts-file').val();
        file_type = "hosts_file";
        writeFile(hosts_file_text, "", file_type);
    }
});

$('#button-before-step-modal-wizard-cluster-config-prepare').on('click', function(){
    resetClusterConfigWizard();

    if (cur_step_wizard_cluster_config_prepare == "2") {
        $('#div-modal-wizard-cluster-config-overview').show();
        $('#nav-button-cluster-config-overview').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "1";
    }
    else if(cur_step_wizard_cluster_config_prepare == "3") {
        $('#div-modal-wizard-cluster-config-ssh-key').show();
        $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "2";

    }
    else if(cur_step_wizard_cluster_config_prepare == "4") {
        $('#div-modal-wizard-cluster-config-ip-info').show();
        $('#nav-button-cluster-config-ip-info').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "3";
    }
    else if(cur_step_wizard_cluster_config_prepare == "5") {
        $('#div-modal-wizard-cluster-config-time-server').show();
        $('#nav-button-cluster-config-time-server').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "4";
    }
    else if(cur_step_wizard_cluster_config_prepare == "6") {
        $('#div-modal-wizard-cluster-config-review').show();
        $('#nav-button-cluster-config-review').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "5";
    }
});

$('#button-cancel-config-modal-wizard-cluster-config-prepare').on('click', function(){
    $('#div-modal-wizard-cluster-config-prepare').hide();
});


/* 마법사 Footer 영역의 버튼 클릭 이벤트 처리 끝 */

/* HTML Object에서 발생하는 이벤트 처리 시작 */

// SSH Key 준비 방법 중 신규 생성을 클릭하는 경우 SSH Key 파일 항목을 비활성화함
$('#form-radio-ssh-key-new').on('click', function(){
    $('#form-input-cluster-config-ssh-key-pri-file').attr('disabled', true);
    $('#form-input-cluster-config-ssh-key-pub-file').attr('disabled', true);
});

// SSH Key 준비 방법 중 기존 파일 사용을 클릭하는 경우 SSH Key 파일 항목을 활성화함
$('#form-radio-ssh-key-file').on('click', function () {
    $('#form-input-cluster-config-ssh-key-pri-file').attr('disabled', false);
    $('#form-input-cluster-config-ssh-key-pub-file').attr('disabled', false);
    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
});

// Host 파일 준비 방법 중 신규생성을 클릭하는 경우 Host 프로파일 디비전을 보여주고 Hosts 파일 디비전은 숨긴다.
$('#form-radio-hosts-new').on('click', function(){
    $('#div-form-hosts-profile').show();
    $('#div-form-hosts-file').hide();
});
// Host 파일 준비 방법 중 기존 파일 사용을 클릭하는 경우 Host 프로파일 디비전을 숨기고 Hosts 파일 디비전은 보여준다.
$('#form-radio-hosts-file').on('click', function(){
    $('#div-form-hosts-profile').hide();
    $('#div-form-hosts-file').show();
});
// Host 파일 준비 중 Host 수를 편집하고 제한하는 기능
$('#form-input-cluster-config-host-number-plus').on('click', function () {
    let n = $('.bt_up').index(this);
    let num = $("#form-input-cluster-config-host-number:eq(" + n + ")").val();
    num = $("#form-input-cluster-config-host-number:eq(" + n + ")").val(num * 1 + 1);
});
$('#form-input-cluster-config-host-number-minus').on('click', function () {
    let n = $('.bt_down').index(this);
    let num = $("#form-input-cluster-config-host-number:eq(" + n + ")").val();
    if (num > 1) {
        num = $("#form-input-cluster-config-host-number:eq(" + n + ")").val(num * 1 - 1);
        return;
    }
});
$('#form-input-cluster-config-host-number').on('keyup', function () {
    if(this.value <= 0){
        this.value = 1;
    }
});
// Host 파일 준비 중 신규생성을 선택한 경우 Host 수에 따라 텍스트 값 변경
$('#form-input-cluster-config-host-number, #form-input-cluster-config-host-number-plus, #form-input-cluster-config-host-number-minus').on('change click', function () {
    let current_val = $('#form-input-cluster-config-host-number').val();
    let target_textarea = $('#form-textarea-cluster-config-new-host-profile');

    target_textarea.text("");
    target_textarea.append("10.10.0.10\tccvm-mngt\n" + "192.168.0.10\tccvm-svc\n");
    for(let i=1; i<=current_val; i++){
        target_textarea.append("10.10.0.1"+i+"\tablestack"+i+"\n");
    }
    for(let i=1; i<=current_val; i++){
        target_textarea.append("10.10.0.10"+i+"\tscvm"+i+"-pn\n");
    }
    for(let i=1; i<=current_val; i++){
        target_textarea.append("100.100.0.10"+i+"\tscvm"+i+"-cn\n");
    }
});

// 외부 시간서버를 시간서버로 선택하면 시간서버 2, 3은 선택 입력으로 전환한다.
$('#form-radio-timeserver-ext').on('click', function(){
    $('#span-timeserver2-required').hide();
    $('#span-timeserver3-required').hide();
});

// 로컬 시간서버를 시간서버로 선택하면 시간서버 2, 3은 필수 입력으로 전환한다.
$('#form-radio-timeserver-int').on('click', function(){
    $('#span-timeserver2-required').show();
    $('#span-timeserver3-required').show();
});

// 아코디언 개체의 버튼 클릭 이벤트 처리
$('#button-accordion-ssh-key').on('click', function(){
    if ($('#button-accordion-ssh-key').attr("aria-expanded") == "false") {
        $('#button-accordion-ssh-key').attr("aria-expanded", "true");
        $('#button-accordion-ssh-key').addClass("pf-m-expanded");
        $('#div-accordion-ssh-key').fadeIn();
        $('#div-accordion-ssh-key').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-ssh-key').attr("aria-expanded", "false");
        $('#button-accordion-ssh-key').removeClass("pf-m-expanded");
        $('#div-accordion-ssh-key').fadeOut();
        $('#div-accordion-ssh-key').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-hosts-file').on('click', function(){
    if ($('#button-accordion-hosts-file').attr("aria-expanded") == "false") {
        $('#button-accordion-hosts-file').attr("aria-expanded", "true");
        $('#button-accordion-hosts-file').addClass("pf-m-expanded");
        $('#div-accordion-hosts-file').fadeIn();
        $('#div-accordion-hosts-file').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-hosts-file').attr("aria-expanded", "false");
        $('#button-accordion-hosts-file').removeClass("pf-m-expanded");
        $('#div-accordion-hosts-file').fadeOut();
        $('#div-accordion-hosts-file').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-timeserver').on('click', function(){
    if ($('#button-accordion-timeserver').attr("aria-expanded") == "false") {
        $('#button-accordion-timeserver').attr("aria-expanded", "true");
        $('#button-accordion-timeserver').addClass("pf-m-expanded");
        $('#div-accordion-timeserver').fadeIn();
        $('#div-accordion-timeserver').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-timeserver').attr("aria-expanded", "false");
        $('#button-accordion-timeserver').removeClass("pf-m-expanded");
        $('#div-accordion-timeserver').fadeOut();
        $('#div-accordion-timeserver').removeClass("pf-m-expanded");
    }
});

// ssh-key 클러스터 구성 준비 마법사가 시작되면 ssh key키를 생성하고 읽어와 hidden 처리된 textarea에 저장
$('#button-open-modal-wizard-storage-cluster').on('click', function(){
    generateSshkey();
    readSshKeyFile();
});

// ssh-key 기존 파일 선택 시 hidden textarea 내용을 선택한 파일의 내용으로 변경
$('#form-input-cluster-config-ssh-key-pri-file').on('click', function(){
    let ssh_key_input_pri = document.querySelector('#form-input-cluster-config-ssh-key-pri-file');
    let ssh_key_textarea_existing_pri = "div-textarea-cluster-config-temp-existing-ssh-key-pri-file";
    fileReaderFunc(ssh_key_input_pri, ssh_key_textarea_existing_pri);
});
$('#form-input-cluster-config-ssh-key-pub-file').on('click', function(){
    let ssh_key_input_pub = document.querySelector('#form-input-cluster-config-ssh-key-pub-file');
    let ssh_key_textarea_existing_pub = "div-textarea-cluster-config-temp-existing-ssh-key-pub-file";
    fileReaderFunc(ssh_key_input_pub, ssh_key_textarea_existing_pub);
});

// ssh-key 기존 파일 선택 시 파일 선택 취소 시 hidden textarea 초기화
$('#form-input-cluster-config-ssh-key-pri-file').on('change', function(){
    if($(this).val() == ""){
        $('#div-textarea-cluster-config-temp-existing-ssh-key-pri-file').val("");
    }
});
$('#form-input-cluster-config-ssh-key-pub-file').on('change', function(){
    if($(this).val() == ""){
        $('#div-textarea-cluster-config-temp-existing-ssh-key-pub-file').val("");
    }
});
// ssh-key input, hidden textarea 초기화
$('input[name=radio-ssh-key]').on('click', function() {
    if ($(this).val() == "new") {
        $('#form-input-cluster-config-ssh-key-pri-file').val("");
        $('#form-input-cluster-config-ssh-key-pub-file').val("");
        $('#div-textarea-cluster-config-temp-existing-ssh-key-pri-file').val("");
        $('#div-textarea-cluster-config-temp-existing-ssh-key-pub-file').val("");
    }
});

// Hosts 기존 파일 선택 시 hidden textarea 내용을 선택한 파일의 내용으로 변경
$('#form-input-cluster-config-hosts-file').on('click', function(){
    let hosts_input = document.querySelector('#form-input-cluster-config-hosts-file');
    let hosts_textarea_existing = "form-textarea-cluster-config-existing-host-profile";
    fileReaderFunc(hosts_input, hosts_textarea_existing);
});
// Hosts 기존 파일 선택 시 파일 선택 취소 시 hidden textarea 초기화
$('#form-input-cluster-config-hosts-file').on('change', function(){
    if($(this).val() == ""){
        $('#form-textarea-cluster-config-existing-host-profile').val("");
    }
});

// 설정확인에서 버튼 클릭 시 파일 읽어오기
// SSH KEY 준비 방식에 따라 키 내용 보여주기
$('#button-accordion-ssh-key').on('click change', function(){
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);
});
// hosts 파일 준비 방식에 따라 내용 보여주기
$('#button-accordion-hosts-file').on('click change', function(){
    let hosts_file_type = $('input[name=radio-hosts-file]:checked').val();
    putHostsValueIntoTextarea(hosts_file_type);
});
// npt 서버 종에 따라 내용 보여주기
$('#button-accordion-hosts-file').on('click change', function(){
    let ntp_type = $('input[name=form-radio-timeserver-ext]:checked').val();
    putNtpValueIntoTextarea(ntp_type);
});

// 완료 단계에서 파일 다운로드 링크 생성
// SSH Key 다운로드 링크 생성
$('a[name=span-modal-wizard-cluster-config-finish-sshkey-download]').on('click', function (){
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);

    let pri_ssh_key_text = $('#div-textarea-cluster-config-confirm-ssh-key-pri-file').val();
    let pub_ssh_key_text = $('#div-textarea-cluster-config-confirm-ssh-key-pub-file').val();
    let pri_ssh_key_download_link_id = 'span-modal-wizard-cluster-config-finish-pri-sshkey-download';
    let pub_ssh_key_download_link_id = 'span-modal-wizard-cluster-config-finish-pub-sshkey-download';

    saveAsFile(pri_ssh_key_download_link_id, pri_ssh_key_text, "ablecloud");
    saveAsFile(pub_ssh_key_download_link_id, pub_ssh_key_text, "ablecloud.pub");
});
// Host File 다운로드 링크 생성
$('#span-modal-wizard-cluster-config-finish-hosts-file-download').on('click', function (){
    let hosts_file_type = $('input[name=radio-hosts-file]:checked').val();
    putSshKeyValueIntoTextarea(hosts_file_type);

    let hosts_file_text = $('#div-textarea-cluster-config-confirm-hosts-file').val();
    let hosts_file_download_link_id = 'span-modal-wizard-cluster-config-finish-hosts-file-download';

    saveAsFile(hosts_file_download_link_id, hosts_file_text, "hosts");
});


/* HTML Object에서 발생하는 이벤트 처리 끝 */


/**
 * Meathod Name : resetClusterConfigWizard
 * Date Created : 2021.03.03
 * Writer  : 박동혁
 * Description : 마법사 대화상자의 화면 위치 및 사이드 메뉴의 위치를 초기화 하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.03 최초 작성
**/


function resetClusterConfigWizard(){
    $('#nav-button-cluster-config-overview').removeClass('pf-m-current');
    $('#nav-button-cluster-config-ssh-key').removeClass('pf-m-current');
    $('#nav-button-cluster-config-ip-info').removeClass('pf-m-current');
    $('#nav-button-cluster-config-time-server').removeClass('pf-m-current');
    $('#nav-button-cluster-config-review').removeClass('pf-m-current');
    $('#nav-button-cluster-config-finish').removeClass('pf-m-current');

    $('#div-modal-wizard-cluster-config-overview').hide();
    $('#div-modal-wizard-cluster-config-ssh-key').hide();
    $('#div-modal-wizard-cluster-config-ip-info').hide();
    $('#div-modal-wizard-cluster-config-time-server').hide();
    $('#div-modal-wizard-cluster-config-review').hide();
    $('#div-modal-wizard-cluster-config-finish').hide();

    $('#button-next-step-modal-wizard-cluster-config-prepare').html('다음');
}


/**
 * Meathod Name : generateSshkey
 * Date Created : 2021.03.11
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 SSHKey를 생성하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
**/

function generateSshkey() {
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/cluster_wizard/cluster_wizard.py", "geneSsh"])
        .stream(console.log)
        .then(console.log)
        .catch(console.log);
}

/**
 * Meathod Name : generateHostsFile
 * Date Created : 2021.03.23
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 hosts 파일을 생성하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.23 최초 작성
**/

function generateHostsFile() {
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/cluster_wizard/cluster_wizard.py", "geneSsh"])
        .stream(console.log)
        .then(console.log)
        .catch(console.log);
}

/**
 * Meathod Name : readSshKeyFile
 * Date Created : 2021.03.17
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 설정확인을 위해 로컬에 존재하는 SSHKey를 읽어오는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
**/

function readSshKeyFile() {
    // 개인키 읽어오기
    cockpit.file("/root/.ssh/ablecloud").read()
        .done(function (tag) {
            console.log(tag);
            // ssh_key_textarea에 텍스트 삽입
            $('#div-textarea-cluster-config-temp-new-ssh-key-pri-file').val(tag);
        })
        .fail(function (error) {
        });
    // 공개키 읽어오기
    cockpit.file("/root/.ssh/ablecloud.pub").read()
        .done(function (tag) {
            console.log(tag);
            // ssh_key_textarea에 텍스트 삽입
            $('#div-textarea-cluster-config-temp-new-ssh-key-pub-file').val(tag);
        })
        .fail(function (error) {
        });
}


/**
 * Meathod Name : fileReaderFunc
 * Date Created : 2021.03.17
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 SSHKey 파일을 선택하면 문자열로 읽어오는 함수
 * Parameter : input
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
**/

function fileReaderFunc(input, textarea_type) {
    input.addEventListener('change', function (event) {
        try {
            let fileList = input.files || event.target.files;
            let file = fileList[0];
            // id
            let id = input.getAttribute('id');
            if ($(input).val() != "") {
                let fileName = fileList[0].name;
                // 파일 확장자 체크
                if (fileExtensionChecker(fileName) != false) {
                    // FileList
                    let reader = new FileReader();
                    reader.onload = function (progressEvent) {
                        console.log(progressEvent.target.result);
                        let result = progressEvent.target.result;
                        $('#'+textarea_type).val(result);
                    };
                    reader.readAsText(file);
                } else {
                    // input 박스 초기화
                    $('#'+id).val("");
                }
            }
        } catch (err) {
            console.error(err);
        }
    });
}


/**
 * Meathod Name : fileExtensionChecker
 * Date Created : 2021.03.19
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 파일을 선택할 때 확장자를 체크하는 함수
 * Parameter : fileName
 * Return  : true, false
 * History  : 2021.03.19 최초 작성
**/

function fileExtensionChecker(fileName){
    let ext = fileName.split('.').pop().toLowerCase();
    if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx', 'hwp','html', 'js', 'rpm']) != -1) {
        alert('키 파일만 업로드할 수 있습니다.');
        return false;
    };
}

/**
 * Meathod Name : putSshKeyValueIntoTextarea
 * Date Created : 2021.03.22
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 설정에 따라 설정확인에 위치한 textarea에 ssh-key 값을 넣는 함수
 * Parameter : radio_value
 * Return  : 없음
 * History  : 2021.03.22 최초 작성
**/

function putSshKeyValueIntoTextarea(radio_value) {
    if (radio_value == "new") {
        // SSH KEY 준비 방법 표시 및 값 설정
        $('#div-accordion-ssh-key-description').text("새로운 파일 사용");
        $('#div-textarea-cluster-config-confirm-ssh-key-pri-file').val($('#div-textarea-cluster-config-temp-new-ssh-key-pri-file').val());
        $('#div-textarea-cluster-config-confirm-ssh-key-pub-file').val($('#div-textarea-cluster-config-temp-new-ssh-key-pub-file').val());
    } else if (radio_value == "existing") {
        // SSH KEY 준비 방법 표시 및 값 설정
        $('#div-accordion-ssh-key-description').text("기존 파일 사용");
        $('#div-textarea-cluster-config-confirm-ssh-key-pri-file').val($('#div-textarea-cluster-config-temp-existing-ssh-key-pri-file').val());
        $('#div-textarea-cluster-config-confirm-ssh-key-pub-file').val($('#div-textarea-cluster-config-temp-existing-ssh-key-pub-file').val());
    }
}

/**
 * Meathod Name : putHostsValueIntoTextarea
 * Date Created : 2021.03.22
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 설정에 따라 설정확인에 위치한 textarea에 hosts 값을 넣는 함수
 * Parameter : radio_value
 * Return  : 없음
 * History  : 2021.03.22 최초 작성
**/

function putHostsValueIntoTextarea(radio_value) {
    if (radio_value == "new") {
        // hosts file 준비 방법 표시 및 값 설정
        $('#span-accordion-hosts-file-description').val("새로운 파일 사용");
        $('#div-textarea-cluster-config-confirm-hosts-file').val($('#form-textarea-cluster-config-new-host-profile').val());
    } else if (radio_value == "existing") {
        // hosts file 준비 방법 표시 및 값 설정
        $('#span-accordion-hosts-file-description').val("기존 파일 사용");
        $('#div-textarea-cluster-config-confirm-hosts-file').val($('#form-textarea-cluster-config-existing-host-profile').val());
    }
}

/**
 * Meathod Name : saveAsFile
 * Date Created : 2021.03.21
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 파일을 저장할 때 사용하는 함수
 * Parameter : id, str, filename
 * Return  : 없음
 * History  : 2021.03.21 최초 작성
**/

function saveAsFile(id, str, filename) {
    console.log(id, str, filename);
    $('#'+id).attr({
        target: '_blank',
        href: 'data:attachment/text,' + encodeURI(str),
        download: filename
    });
}


/**
 * Meathod Name : writeFile
 * Date Created : 2021.03.17
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 완료를 누를 때 기존 키 선택했을 경우 파일을 host에 업로드하는 함수
 * Parameter : text1, text2, file_type
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
**/

function writeFile(text1, text2, file_type) {
    if (file_type == 'ssh_key') {
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/cluster_wizard/cluster_wizard.py", "makePri"])
        cockpit.file("/root/.ssh/ablecloud").replace(text1)
            .done(function (tag) {})
            .fail(function (error) {});
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/cluster_wizard/cluster_wizard.py", "makePub"])
        cockpit.file("/root/.ssh/ablecloud.pub").replace(text2)
            .done(function (tag) {})
            .fail(function (error) {});
    }else if (file_type == 'hosts_file'){
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/cluster_wizard/cluster_wizard.py", "makeHosts"])
        cockpit.file("/etc/hosts").replace(text1)
            .done(function (tag) {})
            .fail(function (error) {});
    }
}

