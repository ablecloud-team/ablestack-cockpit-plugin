/**
 * File Name : cluster-config-prepare.js
 * Date Created : 2020.03.02
 * Writer  : 박동혁
 * Description : 클러스터 구성 준비 마법사 UI를 컨트롤하기 위한 스크립트
 **/

// 변수 선언
var cur_step_wizard_cluster_config_prepare = "1";

// Document.ready 시작
$(document).ready(function () {
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

    // Hosts 파일 단계에서 Host OS 종류와 Host명을 불러오는 함수
    checkHostsOs();
    checkHostName();
});

// 타이틀 닫기 버튼 이벤트 처리
$('#button-close-modal-wizard-cluster-config-prepare').on('click', function () {
    $('#div-modal-wizard-cluster-config-prepare').hide();
});


/* 마법사 사이드 메뉴 버튼 클릭 이벤트 처리 시작 */

$('#nav-button-cluster-config-overview').on('click', function () {
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-overview').show();
    $('#nav-button-cluster-config-overview').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', true);

    cur_step_wizard_cluster_config_prepare = "1";
});

$('#nav-button-cluster-config-ssh-key').on('click', function () {
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-ssh-key').show();
    $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "2";
});

$('#nav-button-cluster-config-ip-info').on('click', function () {
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-ip-info').show();
    $('#nav-button-cluster-config-ip-info').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "3";
});

$('#nav-button-cluster-config-time-server').on('click', function () {
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-time-server').show();
    $('#nav-button-cluster-config-time-server').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "4";
});

$('#nav-button-cluster-config-review').on('click', function () {
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-review').show();
    $('#nav-button-cluster-config-review').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    $('#button-next-step-modal-wizard-cluster-config-prepare').html('완료');
    cur_step_wizard_cluster_config_prepare = "5";

    // 변경된 키 내용을 설정 확인에 반영
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);
    // 변경된 hosts file 내용을 설정 확인에 반영
    let host_file_type = $('input[name=radio-hosts-file]:checked').val();
    putHostsValueIntoTextarea(host_file_type);
    // time server 내용을 설정 확인에 반영
    let timeserver_type = $('input[name=radio-hosts-file]:checked').val();
    putTimeServerValueIntoTextarea(timeserver_type);
});

$('#nav-button-cluster-config-finish').on('click', function () {
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-finish').show();
    $('#nav-button-cluster-config-finish').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    $('#button-next-step-modal-wizard-cluster-config-prepare').html('종료');

    cur_step_wizard_cluster_config_prepare = "6";

    // 변경된 키 내용을 설정 확인에 반영
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);
    // 변경된 hosts file 내용을 설정 확인에 반영
    let host_file_type = $('input[name=radio-hosts-file]:checked').val();
    putHostsValueIntoTextarea(host_file_type);
    // time server 내용을 설정 확인에 반영
    let ntp_timeserver_type = $('input[name=radio-timeserver]:checked').val();
    putTimeServerValueIntoTextarea(ntp_timeserver_type);
});

/* 마법사 사이드 메뉴 버튼 클릭 이벤트 처리 끝 */

/* 마법사 Footer 영역의 버튼 클릭 이벤트 처리 시작 */

$('#button-next-step-modal-wizard-cluster-config-prepare').on('click', function () {
    resetClusterConfigWizard();

    if (cur_step_wizard_cluster_config_prepare == "1") {
        $('#div-modal-wizard-cluster-config-ssh-key').show();
        $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "2";
    } else if (cur_step_wizard_cluster_config_prepare == "2") {
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
        // time server 내용을 설정 확인에 반영
        let timeserver_type = $('input[name=radio-timeserver]:checked').val();
        putTimeServerValueIntoTextarea(timeserver_type);

    } else if (cur_step_wizard_cluster_config_prepare == "4") {
        $('#div-modal-wizard-cluster-config-review').show();
        $('#nav-button-cluster-config-review').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        $('#button-next-step-modal-wizard-cluster-config-prepare').html('완료');
        cur_step_wizard_cluster_config_prepare = "5";

        // 변경된 키 내용을 설정 확인에 반영
        let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
        putSshKeyValueIntoTextarea(ssh_key_type);
        // 변경된 hosts file 내용을 설정 확인에 반영
        let host_file_type = $('input[name=radio-hosts-file]:checked').val();
        putHostsValueIntoTextarea(host_file_type);
        // time server 내용을 설정 확인에 반영
        let timeserver_type = $('input[name=radio-timeserver]:checked').val();
        putTimeServerValueIntoTextarea(timeserver_type);

    } else if (cur_step_wizard_cluster_config_prepare == "5") {

        // 유효성 검증 후 완료 버튼을 누르면 선택한 내용대로 파일이 호스트에 저장
        let timeserver_type = $('input[name=radio-timeserver]:checked').val();
        let cluster_config_prepare_vaildation = validateClusterConfigPrepare(timeserver_type);
        if (cluster_config_prepare_vaildation != false) {
            // SSH Key 파일
            let radio_value = $('input[name=radio-ssh-key]:checked').val();
            putSshKeyValueIntoTextarea(radio_value);
            let pri_ssh_key_text = $('#div-textarea-cluster-config-confirm-ssh-key-pri-file').val();
            let pub_ssh_key_text = $('#div-textarea-cluster-config-confirm-ssh-key-pub-file').val();
            let file_type = "ssh_key";
            writeSshKeyFile(pri_ssh_key_text, pub_ssh_key_text, file_type);

            // hosts 파일
            radio_value = $('input[name=radio-hosts-file]:checked').val();
            putHostsValueIntoTextarea(radio_value);
            let hosts_file_text = $('#div-textarea-cluster-config-confirm-hosts-file').val();
            let os_type = ($('#os-type').val()).trim();
            let host_name = $('#host-name').val();
            writeHostsFile(hosts_file_text, os_type, host_name);

            // time server 파일
            timeserver_type = $('input[name=radio-timeserver]:checked').val();
            let timeserver_current_host_num = $('input[name=radio-timeserver_host_num]:checked').val();
            let timeserver_confirm_ip_list = new Array();
            for (let i = 1; i <= 3; i++) {
                timeserver_confirm_ip_list.push($('#form-input-cluster-config-time-server-ip-' + i).val());
            }
            timeserver_confirm_ip_list = timeserver_confirm_ip_list.filter(function (item) {
                return item !== null && item !== undefined && item !== '';
            });
            modifyTimeServer(timeserver_confirm_ip_list, timeserver_type, timeserver_current_host_num);

            $('#nav-button-cluster-config-finish').removeClass('pf-m-disabled');
            $('#nav-button-cluster-config-overview').addClass('pf-m-disabled');
            $('#nav-button-cluster-config-ssh-key').addClass('pf-m-disabled');
            $('#nav-button-cluster-config-ip-info').addClass('pf-m-disabled');
            $('#nav-button-cluster-config-time-server').addClass('pf-m-disabled');
            $('#nav-button-cluster-config-review').addClass('pf-m-disabled');
            $('#button-before-step-modal-wizard-cluster-config-prepare').hide();
            $('#button-cancel-config-modal-wizard-cluster-config-prepare').hide();

            $('#button-next-step-modal-wizard-cluster-config-prepare').html('종료');
            $('#div-modal-wizard-cluster-config-finish').show();
            $('#nav-button-cluster-config-finish').addClass('pf-m-current');
            $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
            $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
            cur_step_wizard_cluster_config_prepare = "6";
        }else {
            $('#button-next-step-modal-wizard-cluster-config-prepare').html('완료');
            $('#div-modal-wizard-cluster-config-review').show();
            $('#nav-button-cluster-config-review').addClass('pf-m-current');
            $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
            $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
            cur_step_wizard_cluster_config_prepare = "5";
        }
    } else if (cur_step_wizard_cluster_config_prepare == "6") {
            resetClusterConfigWizard();
            resetClusterConfigWizardWithData();
            cur_step_wizard_cluster_config_prepare = "1";
            // 페이지 새로고침
            location.reload();
    }
});


$('#button-before-step-modal-wizard-cluster-config-prepare').on('click', function () {
    resetClusterConfigWizard();

    if (cur_step_wizard_cluster_config_prepare == "2") {
        $('#div-modal-wizard-cluster-config-overview').show();
        $('#nav-button-cluster-config-overview').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "1";
    } else if (cur_step_wizard_cluster_config_prepare == "3") {
        $('#div-modal-wizard-cluster-config-ssh-key').show();
        $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', true);

        cur_step_wizard_cluster_config_prepare = "2";

    } else if (cur_step_wizard_cluster_config_prepare == "4") {
        $('#div-modal-wizard-cluster-config-ip-info').show();
        $('#nav-button-cluster-config-ip-info').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "3";
    } else if (cur_step_wizard_cluster_config_prepare == "5") {
        $('#div-modal-wizard-cluster-config-time-server').show();
        $('#nav-button-cluster-config-time-server').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        cur_step_wizard_cluster_config_prepare = "4";
    } else if (cur_step_wizard_cluster_config_prepare == "6") {
        $('#div-modal-wizard-cluster-config-review').show();
        $('#nav-button-cluster-config-review').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

        $('#nav-button-cluster-config-finish').addClass('pf-m-disabled');
        cur_step_wizard_cluster_config_prepare = "5";
    }
});

/* 마법사 Footer 영역의 버튼 클릭 이벤트 처리 끝 */

/* HTML Object에서 발생하는 이벤트 처리 시작 */

// SSH Key 준비 방법 중 신규 생성을 클릭하는 경우 SSH Key 파일 항목을 비활성화함
$('#form-radio-ssh-key-new').on('click', function () {
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
$('#form-radio-hosts-new').on('click', function () {
    $('#div-form-hosts-profile').show();
    $('#div-form-hosts-file').hide();
    $('#div-form-hosts-input-number').show();
    // "기존 파일 사용"에서 "신규 생성"을 클릭하면 초기화 된다.
    $('#form-textarea-cluster-config-new-host-profile').val("");
    let hosts_text = "10.10.10.10\tccvm-mngt\n" +
        "10.10.10.1\tablecube1\n" +
        "10.10.10.11\tscvm1-mngt\n" +
        "100.100.10.11\tscvm1\n" +
        "100.200.10.11\tscvm1-cn\n";
    $('#form-textarea-cluster-config-new-host-profile').val(hosts_text);
    $('#form-input-cluster-config-host-number').val(1);
});

// Host 파일 준비 방법 중 기존 파일 사용을 클릭하는 경우 Host 프로파일 디비전을 숨기고 Hosts 파일 디비전은 보여준다.
$('#form-radio-hosts-file').on('click', function () {
    $('#div-form-hosts-profile').hide();
    $('#div-form-hosts-file').show();
    $('#div-form-hosts-input-number').hide();
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
$('#form-input-cluster-config-host-number').on('propertychange change keyup paste input', function () {
    if (this.value <= 0 || this.value > 90) {
        alert("1~90까지의 숫자만 입력할 수 있습니다.")
        this.value = 1;
    }
});
// Host 파일 준비 중 신규생성을 선택한 경우 Host 수에 따라 텍스트 값 변경
$('#form-input-cluster-config-host-number, #form-input-cluster-config-host-number-plus, #form-input-cluster-config-host-number-minus').on('change click', function () {
    let current_val = $('#form-input-cluster-config-host-number').val();
    let target_textarea = $('#form-textarea-cluster-config-new-host-profile');
    let host_ip_info;
    if (current_val <= 90) {
        target_textarea.val("");
        host_ip_info = "10.10.10.10\tccvm-mngt\n";
        for (let i = 1; i <= current_val; i++) {
            let sum = 0 + i;
            host_ip_info = host_ip_info + "10.10.10." + sum + "\tablecube" + i + "\n";
        }
        for (let i = 1; i <= current_val; i++) {
            let sum = 10 + i;
            host_ip_info = host_ip_info + "10.10.10." + sum + "\tscvm" + i + "-mngt\n";
        }
        for (let i = 1; i <= current_val; i++) {
            let sum = 10 + i;
            host_ip_info = host_ip_info + "100.100.0." + sum + "\tscvm" + i + "\n";
        }
        for (let i = 1; i <= current_val; i++) {
            let sum = 10 + i;
            host_ip_info = host_ip_info + "100.200.0." + sum + "\tscvm" + i + "-cn\n";
        }
        target_textarea.val(host_ip_info);
    } else {
        $('#form-input-cluster-config-host-number').val(90);
        alert("1~90까지의 숫자만 입력할 수 있습니다.");
    }
});

// 로컬 시간서버를 외부 시간서버로 선택하면 시간서버 2, 3은 선택 입력으로 전환한다.
$('#form-radio-timeserver-ext').on('click', function () {
    $('#span-timeserver2-required').hide();
    $('#span-timeserver3-required').hide();
    $('#form-input-cluster-config-time-server-ip-2').removeAttr('required');
    $('#form-input-cluster-config-time-server-ip-3').removeAttr('required');
    // 현재 host radio 버튼 숨김
    $('#div-timeserver-host-num').hide();
    // radio 버튼 클릭 시 ip 정보 초기화
    $('input[name=form-input-cluster-config-timeserver]').val("");
});

// 외부 시간서버를 로컬 시간서버로 선택하면 시간서버 2, 3은 필수 입력으로 전환한다.
$('#form-radio-timeserver-int').on('click', function () {
    $('#span-timeserver2-required').show();
    $('#span-timeserver3-required').show();
    $('#form-input-cluster-config-time-server-ip-2').attr('required', 'required');
    $('#form-input-cluster-config-time-server-ip-3').attr('required', 'required');
    // 현재 host radio 버튼 보임
    $('#div-timeserver-host-num').show();
    $('input[name=form-input-cluster-config-timeserver]').val("");
});

// 아코디언 개체의 버튼 클릭 이벤트 처리
$('#button-accordion-ssh-key').on('click', function () {
    if ($('#button-accordion-ssh-key').attr("aria-expanded") == "false") {
        $('#button-accordion-ssh-key').attr("aria-expanded", "true");
        $('#button-accordion-ssh-key').addClass("pf-m-expanded");
        $('#div-accordion-ssh-key').fadeIn();
        $('#div-accordion-ssh-key').addClass("pf-m-expanded");
    } else {
        $('#button-accordion-ssh-key').attr("aria-expanded", "false");
        $('#button-accordion-ssh-key').removeClass("pf-m-expanded");
        $('#div-accordion-ssh-key').fadeOut();
        $('#div-accordion-ssh-key').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-hosts-file').on('click', function () {
    if ($('#button-accordion-hosts-file').attr("aria-expanded") == "false") {
        $('#button-accordion-hosts-file').attr("aria-expanded", "true");
        $('#button-accordion-hosts-file').addClass("pf-m-expanded");
        $('#div-accordion-hosts-file').fadeIn();
        $('#div-accordion-hosts-file').addClass("pf-m-expanded");
    } else {
        $('#button-accordion-hosts-file').attr("aria-expanded", "false");
        $('#button-accordion-hosts-file').removeClass("pf-m-expanded");
        $('#div-accordion-hosts-file').fadeOut();
        $('#div-accordion-hosts-file').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-timeserver').on('click', function () {
    if ($('#button-accordion-timeserver').attr("aria-expanded") == "false") {
        $('#button-accordion-timeserver').attr("aria-expanded", "true");
        $('#button-accordion-timeserver').addClass("pf-m-expanded");
        $('#div-accordion-timeserver').fadeIn();
        $('#div-accordion-timeserver').addClass("pf-m-expanded");
    } else {
        $('#button-accordion-timeserver').attr("aria-expanded", "false");
        $('#button-accordion-timeserver').removeClass("pf-m-expanded");
        $('#div-accordion-timeserver').fadeOut();
        $('#div-accordion-timeserver').removeClass("pf-m-expanded");
    }
});

// ssh-key 클러스터 구성 준비 마법사가 시작되면 ssh key키를 생성하고 읽어와 hidden 처리된 textarea에 저장
$('#button-open-modal-wizard-storage-cluster').on('click', function () {
    readSshKeyFile();
});

// ssh-key 기존 파일 선택 시 hidden textarea 내용을 선택한 파일의 내용으로 변경
$('#form-input-cluster-config-ssh-key-pri-file').on('click', function () {
    let ssh_key_input_pri = document.querySelector('#form-input-cluster-config-ssh-key-pri-file');
    let ssh_key_textarea_existing_pri = "div-textarea-cluster-config-temp-existing-ssh-key-pri-file";
    let file_type = "pri-ssh_key";
    fileReaderFunc(ssh_key_input_pri, ssh_key_textarea_existing_pri, file_type);
});
$('#form-input-cluster-config-ssh-key-pub-file').on('click', function () {
    let ssh_key_input_pub = document.querySelector('#form-input-cluster-config-ssh-key-pub-file');
    let ssh_key_textarea_existing_pub = "div-textarea-cluster-config-temp-existing-ssh-key-pub-file";
    let file_type = "pub-ssh_key";
    fileReaderFunc(ssh_key_input_pub, ssh_key_textarea_existing_pub, file_type);
});

// ssh-key 기존 파일 선택 시 파일 선택 취소 시 hidden textarea 초기화
$('#form-input-cluster-config-ssh-key-pri-file').on('change', function () {
    if ($(this).val() == "") {
        $('#div-textarea-cluster-config-temp-existing-ssh-key-pri-file').val("");
    }
});
$('#form-input-cluster-config-ssh-key-pub-file').on('change', function () {
    if ($(this).val() == "") {
        $('#div-textarea-cluster-config-temp-existing-ssh-key-pub-file').val("");
    }
});
// ssh-key input, hidden textarea 초기화
$('input[name=radio-ssh-key]').on('click', function () {
    if ($(this).val() == "new") {
        $('#form-input-cluster-config-ssh-key-pri-file').val("");
        $('#form-input-cluster-config-ssh-key-pub-file').val("");
        $('#div-textarea-cluster-config-temp-existing-ssh-key-pri-file').val("");
        $('#div-textarea-cluster-config-temp-existing-ssh-key-pub-file').val("");
    }
});

// Hosts 기존 파일 선택 시 hidden textarea 내용을 선택한 파일의 내용으로 변경
$('#form-input-cluster-config-hosts-file').on('click', function () {
    let hosts_input = document.querySelector('#form-input-cluster-config-hosts-file');
    let hosts_textarea_existing = "form-textarea-cluster-config-existing-host-profile";
    let file_type = "hosts";
    fileReaderFunc(hosts_input, hosts_textarea_existing, file_type);
});
// Hosts 기존 파일 선택 시 파일 선택 취소 시 hidden textarea 초기화
$('#form-input-cluster-config-hosts-file').on('change', function () {
    if ($(this).val() == "") {
        $('#form-textarea-cluster-config-existing-host-profile').val("");
    }
});


// 설정확인에서 버튼 클릭 시 파일 읽어오기
// SSH KEY 준비 방식에 따라 키 내용 보여주기
$('#button-accordion-ssh-key').on('click change', function () {
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);
});
// hosts 파일 준비 방식에 따라 내용 보여주기
$('#button-accordion-hosts-file').on('click change', function () {
    let hosts_file_type = $('input[name=radio-hosts-file]:checked').val();
    putHostsValueIntoTextarea(hosts_file_type);
});
// time server 종류에 따라 내용 보여주기
$('#button-accordion-timeserver').on('click change', function () {
    let timeserver_type = $('input[name=radio-timeserver]:checked').val();
    putTimeServerValueIntoTextarea(timeserver_type);
});

// 완료 단계에서 파일 다운로드 링크 생성
// SSH Key 다운로드 링크 생성
$('#span-modal-wizard-cluster-config-finish-pri-sshkey-download').on('click', function () {
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);

    let pri_ssh_key_text = $('#div-textarea-cluster-config-confirm-ssh-key-pri-file').val();
    let pri_ssh_key_download_link_id = 'span-modal-wizard-cluster-config-finish-pri-sshkey-download';
    // 다운로드 링크 생성 전 유효성 검정
    if (pri_ssh_key_text.trim() != "") {
        saveAsFile(pri_ssh_key_download_link_id, pri_ssh_key_text, "id_rsa");
    } else {
        alert("SSH 개인 키 파일 정보를 입력해 주세요.");
    }
});
$('#span-modal-wizard-cluster-config-finish-pub-sshkey-download').on('click', function () {
    let ssh_key_type = $('input[name=radio-ssh-key]:checked').val();
    putSshKeyValueIntoTextarea(ssh_key_type);

    let pub_ssh_key_text = $('#div-textarea-cluster-config-confirm-ssh-key-pub-file').val();
    let pub_ssh_key_download_link_id = 'span-modal-wizard-cluster-config-finish-pub-sshkey-download';
    // 다운로드 링크 생성 전 유효성 검정
    if (pub_ssh_key_text.trim() != "") {
        saveAsFile(pub_ssh_key_download_link_id, pub_ssh_key_text, "id_rsa.pub");
    } else {
        alert("SSH 공개 키 파일 정보를 입력해 주세요.");
    }
});
// Host File 다운로드 링크 생성
$('#span-modal-wizard-cluster-config-finish-hosts-file-download').on('click', function () {
    let hosts_file_type = $('input[name=radio-hosts-file]:checked').val();
    putHostsValueIntoTextarea(hosts_file_type);

    let hosts_file_text = $('#div-textarea-cluster-config-confirm-hosts-file').val();
    let hosts_file_download_link_id = 'span-modal-wizard-cluster-config-finish-hosts-file-download';
    // 다운로드 링크 생성 전 유효성 검정
    if (hosts_file_text.trim() != "") {
        saveAsFile(hosts_file_download_link_id, hosts_file_text, "hosts");
    } else {
        alert("Hosts 파일 정보를 입력해 주세요.");
    }
});


/* HTML Object에서 발생하는 이벤트 처리 끝 */


/* cluster cancel modal 관련 action 시작 */

// 마법사 "취소 버튼 모달창" show, hide
$('#button-cancel-config-modal-wizard-cluster-config-prepare').on('click', function () {
    $('#div-modal-cancel-cluster-config-prepare-cancel').show();
});
$('#button-close-modal-cluster-config-prepare-cancel').on('click', function () {
    $('#div-modal-cancel-cluster-config-prepare-cancel').hide();
});
$('#button-cancel-modal-cluster-config-prepare-cancel').on('click', function () {
    $('#div-modal-cancel-cluster-config-prepare-cancel').hide();
});
// 마법사 "취소 버튼 모달창" 실행 버튼을 눌러 취소를 실행
$('#button-execution-modal-cluster-config-prepare-cancel').on('click', function () {
    resetClusterConfigWizard();
    resetClusterConfigWizardWithData();
    $('#div-modal-cancel-cluster-config-prepare-cancel').hide();
    cur_step_wizard_cluster_config_prepare = "1";
});

/* cluster cancel modal 관련 action 끝 */

/**
 * Meathod Name : resetClusterConfigWizard
 * Date Created : 2021.03.03
 * Writer  : 박동혁
 * Description : 마법사 대화상자의 화면 위치 및 사이드 메뉴의 위치를 초기화 하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.03 최초 작성
 **/

function resetClusterConfigWizard() {
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
 * Meathod Name : resetClusterConfigWizardWithData
 * Date Created : 2021.03.30
 * Writer  : 류홍욱
 * Description : 마법사 대화상자에서 취소 및 완료를 클릭하면 화면 위치 및 사이드 메뉴의 위치, 입력된 데이터를 초기화하는 함수.
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.30 최초 작성
 **/

async function resetClusterConfigWizardWithData() {
    // 입력된 모든 데이터를 초기화한다.
    $('#nav-button-cluster-config-overview').addClass('pf-m-current');
    $('#nav-button-cluster-config-ssh-key').removeClass('pf-m-current');
    $('#nav-button-cluster-config-ip-info').removeClass('pf-m-current');
    $('#nav-button-cluster-config-time-server').removeClass('pf-m-current');
    $('#nav-button-cluster-config-review').removeClass('pf-m-current');
    $('#nav-button-cluster-config-finish').removeClass('pf-m-current');
    $('#div-modal-wizard-cluster-config-overview').show();
    // ssh-key
    $('#form-radio-ssh-key-new').prop('checked', true);
    $('#form-radio-ssh-key-file').prop('checked', false);
    $('#form-input-cluster-config-ssh-key-pri-file').attr('disabled', true);
    $('#form-input-cluster-config-ssh-key-pub-file').attr('disabled', true);
    $('input[name=form-input-cluster-config-ssh-key-file]').val("");
    $('textarea[name=div-textarea-cluster-config-temp-new-ssh-key-file]').val("");
    $('textarea[name=div-textarea-cluster-config-temp-existing-ssh-key-file]').val("");
    // hosts
    $('#form-radio-hosts-new').prop('checked', true);
    $('#form-radio-hosts-file').prop('checked', false);
    $('#form-input-cluster-config-hosts-file').val("");
    $('#form-textarea-cluster-config-existing-host-profile').val("");
    $('#div-form-hosts-profile').show();
    $('#div-form-hosts-file').hide();
    $('#div-form-hosts-input-number').show();
    let hosts_text = "10.10.10.10\tccvm-mngt\n" +
        "10.10.10.1\tablecube1\n" +
        "10.10.10.11\tscvm1-mngt\n" +
        "100.100.10.11\tscvm1\n" +
        "100.200.10.11\tscvm1-cn\n";
    $('#form-textarea-cluster-config-new-host-profile').val(hosts_text);
    $('#form-input-cluster-config-host-number').val(1);
    // 시간 서버
    $('#form-radio-timeserver-ext').prop('checked', true);
    $('#form-radio-timeserver-int').prop('checked', false);
    $('input[name=form-input-cluster-config-timeserver]').val("");
    $('#form-radio-timeserver-host-num-1').prop('checked', true);
    $('#form-radio-timeserver-host-num-2').prop('checked', false);
    $('#form-radio-timeserver-host-num-3').prop('checked', false);
    // 설정확인
    $('#button-accordion-ssh-key').attr("aria-expanded", "false");
    $('#button-accordion-ssh-key').removeClass("pf-m-expanded");
    $('#div-accordion-ssh-key').fadeOut();
    $('#div-accordion-ssh-key').removeClass("pf-m-expanded")
    $('#button-accordion-hosts-file').attr("aria-expanded", "false");
    $('#button-accordion-hosts-file').removeClass("pf-m-expanded");
    $('#div-accordion-hosts-file').fadeOut();
    $('#div-accordion-hosts-file').removeClass("pf-m-expanded");
    $('#button-accordion-timeserver').attr("aria-expanded", "false");
    $('#button-accordion-timeserver').removeClass("pf-m-expanded");
    $('#div-accordion-timeserver').fadeOut();
    $('#div-accordion-timeserver').removeClass("pf-m-expanded");
    // 클래스 원복
    $('#nav-button-cluster-config-finish').addClass('pf-m-disabled');
    $('#nav-button-cluster-config-overview').removeClass('pf-m-disabled');
    $('#nav-button-cluster-config-ssh-key').removeClass('pf-m-disabled');
    $('#nav-button-cluster-config-ip-info').removeClass('pf-m-disabled');
    $('#nav-button-cluster-config-time-server').removeClass('pf-m-disabled');
    $('#nav-button-cluster-config-review').removeClass('pf-m-disabled');
    $('#button-before-step-modal-wizard-cluster-config-prepare').show();
    $('#button-before-step-modal-wizard-cluster-config-prepare').show();
    $('#button-cancel-config-modal-wizard-cluster-config-prepare').show();

    $('#div-modal-wizard-cluster-config-prepare').hide();
}


/**
 * Meathod Name : generateSshkey
 * Date Created : 2021.03.11
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 SSHKey를 생성하는 함수
 키 속성 - 패스워드(없음), 알고리즘(RSA2048), 덮어쓰기(TRUE)
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
 **/

function generateSshkey() {
    return new Promise(function (resolve) {
        resolve(cockpit.script(["ssh-keygen -t rsa -b 2048 -f /root/.ssh/id_rsa -N '' <<<y 2>&1 >/dev/null"]));
    });
}


/**
 * Meathod Name : readSshKeyFile
 * Date Created : 2021.03.17
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 로컬에 존재하는 SSHKey를 읽어오는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
 **/

async function readSshKeyFile() {
    await generateSshkey();
    // 개인키 읽어오기
    cockpit.file("/root/.ssh/id_rsa").read()
        .done(function (tag) {
            // console.log(tag);
            // ssh_key_textarea에 텍스트 삽입
            $('#div-textarea-cluster-config-temp-new-ssh-key-pri-file').val(tag);
        })
        .fail(function (error) {
        });
    // 공개키 읽어오기
    cockpit.file("/root/.ssh/id_rsa.pub").read()
        .done(function (tag) {
            // console.log(tag);
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
 * Description : 클러스터 준비 마법사에서 input box에서 파일을 선택하면 문자열로 읽어와 textarea에 담 함수
 * Parameter : input (input box id 값), textarea_type(textarea id 값), file_type(ssh-key, hosts 파일 타입에 따라 분류)
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
 **/

function fileReaderFunc(input, textarea_type, file_type) {
    input.addEventListener('change', function (event) {
        let file_list = input.files || event.target.files;
        let file = file_list[0];
        let id = input.getAttribute('id');
        if ($(input).val() != "") {
            let file_name = file_list[0].name;
            // 파일 이름 및 용량 체크
            if (checkClusterConfigPrepareFileName(file_name, file_type) != false && checkFileSize(file) != false) {
                // FileList
                let reader = new FileReader();
                try {
                    reader.onload = function (progressEvent) {
                        // console.log(progressEvent.target.result);
                        let result = progressEvent.target.result;
                        $('#' + textarea_type).val(result);
                    };
                    reader.readAsText(file);
                } catch (err) {
                    // console.error(err);
                }
            } else {
                // validation 실패 시 초기화
                $('#' + id).val("");
                $('#' + textarea_type).val("");
            }
        }
    });
}


/**
 * Meathod Name : fileExtensionChecker
 * Date Created : 2021.03.19
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 파일을 선택할 때 확장자를 체크하는 함수
 * Parameter : file_name
 * Return  : true, false
 * History  : 2021.03.19 최초 작성
 **/

function fileExtensionChecker(file_name) {
    let ext = file_name.split('.').pop().toLowerCase();
    if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx', 'hwp', 'html', 'js', 'rpm']) != -1) {
        alert('해당 확장자 파일은 업로드할 수 있습니다.');
        return false;
    }
    ;
}


/**
 * Meathod Name : checkClusterConfigPrepareFileName
 * Date Created : 2021.03.19
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 파일을 선택할 때 이름을 체크하는 함수
 * Parameter : fileName, file_type(ssh-key 또는 hosts)
 * Return  : true, false
 * History  : 2021.03.19 최초 작성
 **/

function checkClusterConfigPrepareFileName(file_name, file_type) {
    if (file_type == "pri-ssh_key") {
        if (file_name != "id_rsa") {
            alert("'id_rsa'으로 된 개인 키 파일만 업로드할 수 있습니다.");
            return false;
        }
    } else if (file_type == "pub-ssh_key") {
        if (file_name != "id_rsa.pub") {
            alert("'id_rsa.pub'으로 된 공개 키 파일만 업로드할 수 있습니다.");
            return false;
        }
    } else if (file_type == "hosts") {
        if (file_name != "hosts") {
            alert("'hosts'으로 된 파일만 업로드할 수 있습니다.");
            return false;
        }
    }
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
        $('#div-accordion-ssh-key-type').text("신규 생성");
        $('#div-textarea-cluster-config-confirm-ssh-key-pri-file').val($('#div-textarea-cluster-config-temp-new-ssh-key-pri-file').val());
        $('#div-textarea-cluster-config-confirm-ssh-key-pub-file').val($('#div-textarea-cluster-config-temp-new-ssh-key-pub-file').val());
    } else if (radio_value == "existing") {
        // SSH KEY 준비 방법 표시 및 값 설정
        $('#div-accordion-ssh-key-type').text("기존 파일 사용");
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
        $('#div-accordion-hosts-file-type').text("신규 생성");
        $('#div-textarea-cluster-config-confirm-hosts-file').val($('#form-textarea-cluster-config-new-host-profile').val());
    } else if (radio_value == "existing") {
        // hosts file 준비 방법 표시 및 값 설정
        $('#div-accordion-hosts-file-type').text("기존 파일 사용");
        $('#div-textarea-cluster-config-confirm-hosts-file').val($('#form-textarea-cluster-config-existing-host-profile').val());
    }
}


/**
 * Meathod Name : putTimeServerValueIntoTextarea
 * Date Created : 2021.03.24
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 설정에 따라 설정확인에 위치한 구역에 time server 내용을 넣는 함수
 * Parameter : radio_value
 * Return  : 없음
 * History  : 2021.03.24 최초 작성
 **/

function putTimeServerValueIntoTextarea(radio_value) {
    if (radio_value == "external") {
        // time server 준비 방법 표시 및 값 설정
        $('#div-accordion-timeserver-type').text("외부 시간서버");
    } else if (radio_value == "internal") {
        // time server 준비 방법 표시 및 값 설정
        $('#div-accordion-timeserver-type').text("로컬 시간서버");
    }
    $('#div-cluster-config-confirm-time-server-1').text($('#form-input-cluster-config-time-server-ip-1').val());
    $('#div-cluster-config-confirm-time-server-2').text($('#form-input-cluster-config-time-server-ip-2').val());
    $('#div-cluster-config-confirm-time-server-3').text($('#form-input-cluster-config-time-server-ip-3').val());
}


/**
 * Meathod Name : saveAsFile
 * Date Created : 2021.03.21
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 변수 값을 다운로드 링크 형태로 제공하여 파일을 다운로드할 수 있는 함수
 * Parameter : id(링크 태크 id), str(다운로드 할 파일 내용), filename(다운로드 시 파일 명)
 * Return  : 없음
 * History  : 2021.03.21 최초 작성
 **/

function saveAsFile(id, str, filename) {
    $('#' + id).attr({
        target: '_blank',
        href: 'data:attachment/text,' + encodeURI(str),
        download: filename
    });
}


/**
 * Meathod Name : writeSshKeyFile
 * Date Created : 2021.03.17
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 완료를 누를 때 설정확인의 정보대로 파일(ssh-key)을 host에 업로드하거나 수정하는 함수
 * Parameter : text1, text2, file_type
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
 **/

async function writeSshKeyFile(text1, text2) {
    cockpit.script(["touch /root/.ssh/id_rsa"])
    cockpit.file("/root/.ssh/id_rsa").replace(text1)
        .done(function (tag) {
        })
        .fail(function (error) {
        });
    // 개인 키 파일 권한 변경
    cockpit.script(["chmod 600 /root/.ssh/id_rsa"])
    cockpit.script(["touch /root/.ssh/id_rsa.pub"])
    cockpit.file("/root/.ssh/id_rsa.pub").replace(text2)
        .done(function (tag) {
        })
        .fail(function (error) {
        });
    // 공개 키 파일 권한 변경
    cockpit.script(["chmod 644 /root/.ssh/id_rsa.pub"])
    // 공개 키 authorized_key 파일에 공개 키 내용 append 및 중복 내용 제거
    cockpit.script(["cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys"])
    cockpit.script(["sort /root/.ssh/authorized_keys | uniq > /root/.ssh/authorized_keys.uniq"])
    cockpit.script(["mv -f /root/.ssh/authorized_keys{.uniq}"])
    cockpit.script(["chmod 644 /root/.ssh/authorized_keys"])
    cockpit.script(["rm -f /root/.ssh/authorized_keys.uniq"])
}


/**
 * Meathod Name : writeHostsFile
 * Date Created : 2021.03.17
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 완료를 누를 때 설정확인의 정보대로 파일(hosts)을 host에 업로드하거나 수정하는 함수
 * Parameter : text1, os_type
 * Return  : 없음
 * History  : 2021.03.11 최초 작성
 **/

async function writeHostsFile(text1, os_type, host_name) {
    if (os_type.match("centos")) {
        let hosts_centos_default_text = "127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4\n" +
            "::1         localhost localhost.localdomain localhost6 localhost6.localdomain6\n\n";
        cockpit.script(["touch /etc/hosts"])
        cockpit.file("/etc/hosts").replace(hosts_centos_default_text + text1)
            .done(function (tag) {
            })
            .fail(function (error) {
            });
    } else if (os_type.match("ubuntu")) {
        host_name = host_name.trim();
        let hosts_ubuntu_default_text = "127.0.0.1\tlocalhost\n" +
            "127.0.1.1\t" + host_name + "\t" + host_name + "\n\n";
        cockpit.script(["touch /etc/hosts"])
        cockpit.file("/etc/hosts").replace(hosts_ubuntu_default_text + text1)
            .done(function (tag) {
            })
            .fail(function (error) {
            });
    }
}


/**
 * Meathod Name : checkHostsOs
 * Date Created : 2021.04.05
 * Writer  : 류홍욱
 * Description : 호스트 OS를 체크하는 함수
 * Parameter : 없음
 * Return  : string
 * History  : 2021.04.05
 */

function checkHostsOs() {
    cockpit.script(["awk -F= '$1==\"ID\" { print $2 ;}' /etc/os-release"])
        .then(function (data) {
            let os_type = data.replaceAll("\"", "");
            $('#os-type').val(os_type);
        })
        .catch(function (error) {
        });
}


/**
 * Meathod Name : checkHostName
 * Date Created : 2021.04.05
 * Writer  : 류홍욱
 * Description : 호스트 이름을 체크하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.04.05
 */

function checkHostName() {
    cockpit.script(["hostname"])
        .then(function (data) {
            $('#host-name').val(data);
        })
        .catch(function (error) {
        });
}


/**
 * Meathod Name : modifyTimeServer
 * Date Created : 2021.03.24
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 완료를 누를 때 설정확인 메뉴에서 확인했던 time server 정보대로 host에 업데이트하는 함수
 * Parameter : timeserver_confirm_ip_text(설정확인 단계에서의 ip주소 값), file_type(외부 또는 로컬서버) , timeserver_current_host_num(현재 설정 중인 호스트 번호)
 * Return  : 없음
 * History  : 2021.03.24 최초 작성
 **/

async function modifyTimeServer(timeserver_confirm_ip_text, file_type, timeserver_current_host_num) {
    let chrony_file_root = "/etc/chrony.conf"
    // chrony.conf 파일 서버 리스트 부분 초기화
    cockpit.script(["sed -i '/^server /d' /" + chrony_file_root + ""])
    cockpit.script(["sed -i '/^pool /d' /" + chrony_file_root + ""])

    // chrony.conf 파일에서 서버 추가하는 부분
    // 외부 시간 서버
    if (file_type == "external") {
        // chrony.conf 파일 서버 리스트 부분 초기화
        cockpit.script(["sed -i '/^#allow /d' /" + chrony_file_root + ""])
        cockpit.script(["sed -i '/^allow /d' /" + chrony_file_root + ""])
        // cockpit.script(["sed -i '/allow /d' /" + chrony_file_root + ""])
        cockpit.script(["sed -i '/^local stratum /d' /" + chrony_file_root + ""])
        cockpit.script(["sed -i '/local stratum /d' /" + chrony_file_root + ""])
        // cockpit.script(["sed -i'' -r -e \"/# Allow NTP client access from local network/a\\#allow 192.168.0.0/16\" /" + chrony_file_root + ""])
        cockpit.script(["sed -i'' -r -e \"/# Serve time even if not synchronized to a time source/a\\#local stratum 10\" /" + chrony_file_root + ""])
        for (let i in timeserver_confirm_ip_text) {
            cockpit.script(["sed -i'' -r -e \"/# Please consider joining the pool/a\\server " + timeserver_confirm_ip_text[i] + " iburst minpoll 0 maxpoll 0\" /" + chrony_file_root + ""])
        }
        let allow_ip = "100.100.0.0/24";
        cockpit.script(["sed -i'' -r -e \"/# Allow NTP client access from local network/a\\allow " + allow_ip + "\" /" + chrony_file_root + ""])
    }
    // 로컬 시간 서버
    if (file_type == "internal") {
        // chrony.conf 파일 서버 리스트 부분 초기화
        cockpit.script(["sed -i '/^#allow /d' /" + chrony_file_root + ""])
        cockpit.script(["sed -i '/^allow /d' /" + chrony_file_root + ""])
        cockpit.script(["sed -i '/^#local stratum /d' /" + chrony_file_root + ""])
        cockpit.script(["sed -i '/^local stratum /d' /" + chrony_file_root + ""])
        if (timeserver_current_host_num == 1) {
            cockpit.script(["sed -i'' -r -e \"/# Please consider joining the pool/a\\server " + timeserver_confirm_ip_text[0] + " iburst minpoll 0 maxpoll 0\" /" + chrony_file_root + ""])
        }
        if (timeserver_current_host_num == 2) {
            cockpit.script(["sed -i'' -r -e \"/# Please consider joining the pool/a\\server " + timeserver_confirm_ip_text[0] + " prefer iburst minpoll 0 maxpoll 0\" /" + chrony_file_root + ""])
            cockpit.script(["sed -i'' -r -e \"/# Please consider joining the pool/a\\server " + timeserver_confirm_ip_text[1] + " minpoll 0 maxpoll 0\" /" + chrony_file_root + ""])
        }
        if (timeserver_current_host_num == 3) {
            cockpit.script(["sed -i'' -r -e \"/# Please consider joining the pool/a\\server " + timeserver_confirm_ip_text[1] + " prefer iburst minpoll 0 maxpoll 0\" /" + chrony_file_root + ""])
            cockpit.script(["sed -i'' -r -e \"/# Please consider joining the pool/a\\server " + timeserver_confirm_ip_text[0] + " iburst minpoll 0 maxpoll 0\" /" + chrony_file_root + ""])
        }
        // 공통 수정 부분
        // let allow_ip = timeserver_confirm_ip_text[0];
        // allow_ip = allow_ip.split('.');
        // allow_ip = allow_ip[0] + "." + allow_ip[1] + ".0.0/24";
        let allow_ip = "100.100.0.0/24";
        cockpit.script(["sed -i'' -r -e \"/# Allow NTP client access from local network/a\\allow " + allow_ip + "\" /" + chrony_file_root + ""])
        cockpit.script(["sed -i'' -r -e \"/# Serve time even if not synchronized to a time source/a\\local stratum 10\" /" + chrony_file_root + ""])
    }
}


/**
 * Meathod Name : validateClusterConfigPrepare
 * Date Created : 2021.03.25
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 완료를 누를 때 유효성 검사하는 함수
 * Parameter : timeserver_type(시간서버 타입에 따라 필수 입력 값이 달라져 구분하기 위한 값)
 * Return  : 없음
 * History  : 2021.03.25 최초 작성
 */
function validateClusterConfigPrepare(timeserver_type) {

    let validate_check = true;
    // time server가 외부일 때는 IP, 문자열 입력 가능하나 내부일 때는 IP형식으로만 입력 가능
    let timeserver_ip_check_external_1 = checkHostFormat($('#div-cluster-config-confirm-time-server-1').text());
    let timeserver_ip_check_external_2 = checkHostFormat($('#div-cluster-config-confirm-time-server-2').text());
    let timeserver_ip_check_external_3 = checkHostFormat($('#div-cluster-config-confirm-time-server-3').text());
    let timeserver_ip_check_internal_1 = checkIp($('#div-cluster-config-confirm-time-server-1').text());
    let timeserver_ip_check_internal_2 = checkIp($('#div-cluster-config-confirm-time-server-2').text());
    let timeserver_ip_check_internal_3 = checkIp($('#div-cluster-config-confirm-time-server-3').text());

    if ($('#div-textarea-cluster-config-confirm-ssh-key-pri-file').val().trim() == "") {
        alert("SSH 개인 키 파일 정보를 확인해 주세요.");
        validate_check = false;
    } else if ($('#div-textarea-cluster-config-confirm-ssh-key-pub-file').val().trim() == "") {
        alert("SSH 공개 키 파일 정보를 확인해 주세요.");
        validate_check = false;
    } else if ($('#div-textarea-cluster-config-confirm-hosts-file').val().trim() == "") {
        alert("Hosts 파일 정보를 확인해 주세요.");
        validate_check = false;
    } else if (checkSpace($('#form-textarea-cluster-config-new-host-profile').val()) == false) {
        alert("Hosts 파일 작성 시 'Tab 키'만 사용 가능합니다.");
        validate_check = false;
    } else if (timeserver_type == "external") {
        if (timeserver_ip_check_external_1 == false) {
            alert("시간 서버 1번 IP정보를 확인해 주세요.");
            validate_check = false;
        } else if (timeserver_ip_check_external_2 == false && $('#div-cluster-config-confirm-time-server-2').text() != "") {
            alert("시간 서버 2번 IP정보를 확인해 주세요.");
            validate_check = false;
        } else if (timeserver_ip_check_external_3 == false && $('#div-cluster-config-confirm-time-server-3').text() != "") {
            alert("시간 서버 3번 IP정보를 확인해 주세요.");
            validate_check = false;
        }
    } else if (timeserver_type == "internal") {
        if (timeserver_ip_check_internal_1 == false) {
            alert("시간 서버 1번 IP정보를 확인해 주세요. IP 형식으로만 입력 가능합니다.");
            validate_check = false;
        } else if (timeserver_ip_check_internal_2 == false) {
            alert("시간 서버 2번 IP정보를 확인해 주세요. IP 형식으로만 입력 가능합니다.");
            validate_check = false;
        } else if (timeserver_ip_check_internal_3 == false) {
            alert("시간 서버 3번 IP정보를 확인해 주세요. IP 형식으로만 입력 가능합니다.");
            validate_check = false;
        }
    }
    return validate_check;
}



