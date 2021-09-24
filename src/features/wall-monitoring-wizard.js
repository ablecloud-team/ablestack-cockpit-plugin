/**
 * File Name : wall-monitoring-wizard.js
 * Date Created : 2021.09.01
 * Writer  : 배태주
 * Description : Wall 모니터링센터 구성 마법사 UI를 컨트롤하기 위한 스크립트
**/

// 변수 선언
var cur_step_wizard_wall_vm = "1";
var completed = false;

/* Document Ready 이벤트 처리 시작 */

$(document).ready(function () {
    // 마법사 페이지 준비
    $('#div-modal-wizard-wall-monitoring-ip-info').hide();
    $('#div-modal-wizard-wall-monitoring-smtp').hide();
    $('#div-modal-wizard-wall-monitoring-review').hide();
    $('#div-modal-wizard-wall-monitoring-deploy').hide();
    $('#div-modal-wizard-wall-monitoring-finish').hide();

    $('#div-accordion-wall-monitoring-ip-info').hide();
    $('#div-accordion-wall-monitoring-smtp').hide();

    // $('#nav-button-wall-monitoring-review').addClass('pf-m-disabled');
    $('#nav-button-wall-monitoring-finish').addClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

    // 첫번째 스텝에서 시작
    cur_step_wizard_wall_vm = "1";

});

/* Document Ready 이벤트 처리 끝 */

/* Title 영역에서 발생하는 이벤트 처리 시작 */

$('#button-close-modal-wizard-wall-monitoring').on('click', function () {
    $('#div-modal-wizard-wall-monitoring').hide();
    if (completed) {
        //상태값 초기화 겸 페이지 리로드
        location.reload();
    }
});

/* Title 영역에서 발생하는 이벤트 처리 끝 */

/* 사이드 메뉴 영역에서 발생하는 이벤트 처리 시작 */

$('#nav-button-wall-monitoring-overview').on('click', function () {
    resetWallMonitoringWizard();

    $('#div-modal-wizard-wall-monitoring-overview').show();
    $('#nav-button-wall-monitoring-overview').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

    cur_step_wizard_wall_vm = "1";
});

$('#nav-button-wall-monitoring-ip-info').on('click', function () {
    resetWallMonitoringWizard();

    $('#div-modal-wizard-wall-monitoring-ip-info').show();
    $('#nav-button-wall-monitoring-ip-info').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

    cur_step_wizard_wall_vm = "2";
});

$('#nav-button-wall-monitoring-smtp').on('click', function () {
    resetWallMonitoringWizard();

    $('#div-modal-wizard-wall-monitoring-smtp').show();
    $('#nav-button-wall-monitoring-smtp').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

    cur_step_wizard_wall_vm = "3";
});

$('#nav-button-wall-monitoring-review').on('click', function () {

    setWallReviewInfo();

    resetWallMonitoringWizard();

    $('#div-modal-wizard-wall-monitoring-review').show();
    $('#nav-button-wall-monitoring-review').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-wall-monitoring').html('구성');
    $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

    cur_step_wizard_wall_vm = "4";
});

$('#nav-button-wall-monitoring-finish').on('click', function () {
    resetWallMonitoringWizard();

    $('#div-modal-wizard-wall-monitoring-finish').show();
    $('#nav-button-wall-monitoring-finish').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-wall-monitoring').html('완료');
    $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
    $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

    cur_step_wizard_wall_vm = "5";
});

/* 사이드 메뉴 영역에서 발생하는 이벤트 처리 시작 */

/* Footer 영역에서 발생하는 이벤트 처리 시작 */

$('#button-next-step-modal-wizard-wall-monitoring').on('click', function () {
    if (cur_step_wizard_wall_vm == "1") {
        resetWallMonitoringWizard();

        $('#div-modal-wizard-wall-monitoring-ip-info').show();
        $('#nav-button-wall-monitoring-ip-info').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

        cur_step_wizard_wall_vm = "2";
    }
    else if (cur_step_wizard_wall_vm == "2") {
        resetWallMonitoringWizard();

        $('#div-modal-wizard-wall-monitoring-smtp').show();
        $('#nav-button-wall-monitoring-smtp').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

        cur_step_wizard_wall_vm = "3";
    }
    else if (cur_step_wizard_wall_vm == "3") {
        resetWallMonitoringWizard();

        setWallReviewInfo();

        $('#div-modal-wizard-wall-monitoring-review').show();
        $('#nav-button-wall-monitoring-review').addClass('pf-m-current');
        //$('#nav-button-wall-monitoring-finish').removeClass('pf-m-disabled');

        $('#button-next-step-modal-wizard-wall-monitoring').html('구성');
        $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

        cur_step_wizard_wall_vm = "4";
    }
    else if (cur_step_wizard_wall_vm == "4") {
        $('#div-modal-wall-wizard-confirm').show();
    }
    else if (cur_step_wizard_wall_vm == "5") {
        $('#div-modal-wizard-wall-monitoring').hide();
    }
});

$('#button-before-step-modal-wizard-wall-monitoring').on('click', function () {
    if (cur_step_wizard_wall_vm == "1") {
        // 이벤트 처리 없음
    }
    else if (cur_step_wizard_wall_vm == "2") {
        resetWallMonitoringWizard();

        $('#div-modal-wizard-wall-monitoring-overview').show();
        $('#nav-button-wall-monitoring-overview').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', true);
        $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

        cur_step_wizard_wall_vm = "1";
    }
    else if (cur_step_wizard_wall_vm == "3") {
        resetWallMonitoringWizard();

        $('#div-modal-wizard-wall-monitoring-ip-info').show();
        $('#nav-button-wall-monitoring-ip-info').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

        cur_step_wizard_wall_vm = "2";
    }
    else if (cur_step_wizard_wall_vm == "4") {
        resetWallMonitoringWizard();

        $('#div-modal-wizard-wall-monitoring-smtp').show();
        $('#nav-button-wall-monitoring-smtp').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

        cur_step_wizard_wall_vm = "3";
    }
    else if (cur_step_wizard_wall_vm == "5") {
        resetWallMonitoringWizard();

        $('#div-modal-wizard-wall-monitoring-review').show();
        $('#nav-button-wall-monitoring-review').addClass('pf-m-current');
        $('#nav-button-wall-monitoring-finish').removeClass('pf-m-disabled');

        $('#button-next-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-before-step-modal-wizard-wall-monitoring').attr('disabled', false);
        $('#button-cancel-config-modal-wizard-wall-monitoring').attr('disabled', false);

        cur_step_wizard_wall_vm = "4";
    }
});

/* Footer 영역에서 발생하는 이벤트 처리 끝 */

/* HTML Object에서 발생하는 이벤트 처리 시작 */

// 설정확인 단계의 아코디언 개체에서 발생하는 이벤트의 처리
$('#button-accordion-wall-monitoring-ip-info').on('click', function () {
    if ($('#button-accordion-wall-monitoring-ip-info').attr("aria-expanded") == "false") {
        $('#button-accordion-wall-monitoring-ip-info').attr("aria-expanded", "true");
        $('#button-accordion-wall-monitoring-ip-info').addClass("pf-m-expanded");
        $('#div-accordion-wall-monitoring-ip-info').fadeIn();
        $('#div-accordion-wall-monitoring-ip-info').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-wall-monitoring-ip-info').attr("aria-expanded", "false");
        $('#button-accordion-wall-monitoring-ip-info').removeClass("pf-m-expanded");
        $('#div-accordion-wall-monitoring-ip-info').fadeOut();
        $('#div-accordion-wall-monitoring-ip-info').removeClass("pf-m-expanded");
    }
});

$('#button-accordion-wall-monitoring-smtp').on('click', function () {
    if ($('#button-accordion-wall-monitoring-smtp').attr("aria-expanded") == "false") {
        $('#button-accordion-wall-monitoring-smtp').attr("aria-expanded", "true");
        $('#button-accordion-wall-monitoring-smtp').addClass("pf-m-expanded");
        $('#div-accordion-wall-monitoring-smtp').fadeIn();
        $('#div-accordion-wall-monitoring-smtp').addClass("pf-m-expanded");
    }
    else {
        $('#button-accordion-wall-monitoring-smtp').attr("aria-expanded", "false");
        $('#button-accordion-wall-monitoring-smtp').removeClass("pf-m-expanded");
        $('#div-accordion-wall-monitoring-smtp').fadeOut();
        $('#div-accordion-wall-monitoring-smtp').removeClass("pf-m-expanded");
    }
});

// 마법사 "배포 실행 버튼 모달창"
$('#button-cancel-modal-wall-wizard-confirm').on('click', function () {
    $('#div-modal-wall-wizard-confirm').hide();
});
$('#button-close-modal-wall-wizard-confirm').on('click', function () {
    $('#div-modal-wall-wizard-confirm').hide();
});
// 마법사 "배포 버튼 모달창" 실행 버튼을 눌러 가상머신 배포
$('#button-execution-modal-wall-wizard-confirm').on('click', function () {
    $('#div-modal-wall-wizard-confirm').hide();
    if (validateWallMonitoringVm()) {
        deployWallMonitoringVM();
        cur_step_wizard_wall_vm = "5";
    }
});

// 마법사 "취소 버튼 모달창" show, hide
$('#button-cancel-config-modal-wizard-wall-monitoring').on('click', function () {
    $('#div-modal-cancel-wall-wizard-cancel').show();
});
$('#button-close-modal-wall-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-wall-wizard-cancel').hide();
});
$('#button-cancel-modal-wall-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-wall-wizard-cancel').hide();
});
// 마법사 "취소 버튼 모달창" 실행 버튼을 눌러 취소를 실행
$('#button-execution-modal-wall-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-wall-wizard-cancel').hide();
    $('#div-modal-wizard-wall-monitoring').hide();
    //상태값 초기화 겸 페이지 리로드
    location.reload();
});

/* HTML Object에서 발생하는 이벤트 처리 끝 */

/* 함수 정의 시작 */

/**
 * Meathod Name : resetWallMonitoringWizard
 * Date Created : 2021.09.01
 * Writer  : 배태주
 * Description : 마법사 대화상자의 모든 디비전 및 사이드버튼 속성을 초기화
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.01 최초 작성
 */
function resetWallMonitoringWizard() {
    // 모든 디비전 숨기기
    $('#div-modal-wizard-wall-monitoring-overview').hide();
    $('#div-modal-wizard-wall-monitoring-ip-info').hide();
    $('#div-modal-wizard-wall-monitoring-smtp').hide();
    $('#div-modal-wizard-wall-monitoring-review').hide();
    $('#div-modal-wizard-wall-monitoring-deploy').hide();
    $('#div-modal-wizard-wall-monitoring-finish').hide();

    // 모든 사이드버튼 '기본' 속성 삭제
    $('#nav-button-wall-monitoring-overview').removeClass('pf-m-current');
    $('#nav-button-wall-monitoring-ip-info').removeClass('pf-m-current');
    $('#nav-button-wall-monitoring-smtp').removeClass('pf-m-current');
    $('#nav-button-wall-monitoring-review').removeClass('pf-m-current');
    $('#nav-button-wall-monitoring-finish').removeClass('pf-m-current');

    // footer 버튼 속성 설정
    $('#button-next-step-modal-wizard-wall-monitoring').html('다음');
}

/**
 * Meathod Name : deployWallMonitoringVM
 * Date Created : 2021.09.01
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신에 Wall monitoring을 배포하는 작업을 화면에 표시하도록 하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.01 최초 작성
 */
 function deployWallMonitoringVM() {

    resetWallMonitoringWizard();

    $('#div-modal-wizard-wall-monitoring-deploy').show();
    $('#nav-button-wall-monitoring-finish').addClass('pf-m-current');

    // 하단 버튼 숨김
    $('#button-next-step-modal-wizard-wall-monitoring').hide();
    $('#button-before-step-modal-wizard-wall-monitoring').hide();
    $('#button-cancel-config-modal-wizard-wall-monitoring').hide();

    // 왼쪽 사이드 버튼 전부 비활성화
    $('#nav-button-wall-monitoring-overview').addClass('pf-m-disabled');
    $('#nav-button-wall-monitoring-ip-info').addClass('pf-m-disabled');
    $('#nav-button-wall-monitoring-smtp').addClass('pf-m-disabled');
    $('#nav-button-wall-monitoring-review').addClass('pf-m-disabled');

    var host_count = $('input[type=text][id="form-input-wall-host-number"]').val();

    var ccvm_ip = $('#form-input-wall-monitoring-ccvm-ip').val();

    var smtp_yn_bool = $('input[type=checkbox][id="form-checkbox-smtp-yn"]').is(":checked");
    var smtp_server_ip = $('#form-input-wall-smtp-server-ip').val();
    var smtp_server_port = $('#form-input-wall-smtp-server-port').val();
    var email_addr = $('#form-input-wall-smtp-email-addr').val();
    var email_pw = $('#form-input-wall-smtp-email-pw').val();
    var receive_email_addr = $('#form-input-wall-smtp-receive-email-addr').val();

    if (!smtp_yn_bool) {
        $('#div-wall-progress-step3').hide();
    }

    setWallProgressStep("span-wall-progress-step1", 1);
    var pythonPath = '/usr/share/ablestack/ablestack-wall/python/';
    var console_log = true;
    //=========== 1-1. 모니터링 대상 IP Ping 테스트 ===========
    var host_ping_test_cmd = ['python3', pythonPath + 'host_ping_test.py', '-hns', ccvm_ip];

    for(var i = 1 ; i <= host_count ; i ++ ){
        var cubehost_ip = $('#form-input-wall-monitoring-cubehost'+i+'-ip').val();
        host_ping_test_cmd.push(cubehost_ip);
    }

    for(var i = 1 ; i <= host_count ; i ++ ){
        var scvm_ip = $('#form-input-wall-monitoring-scvm'+i+'-ip').val();
        host_ping_test_cmd.push(scvm_ip);
    }

    if (console_log) { console.log(host_ping_test_cmd); }
    cockpit.spawn(host_ping_test_cmd, { host: ccvm_ip })
    .then(function (data) {
        var host_ping_test_result = JSON.parse(data);
        if(host_ping_test_result.code=="200") { //정상
            //=========== 1-2. skydive 구성 ===========
            var skydive_config_cmd = ['python3', pythonPath + 'config_skydive.py', 'config', '--ccvm', ccvm_ip];
            skydive_config_cmd.push('--cube');
            for(var i = 1 ; i <= host_count ; i ++ ){
                var cubehost_ip = $('#form-input-wall-monitoring-cubehost'+i+'-ip').val();
                skydive_config_cmd.push(cubehost_ip);
            }

            if (console_log) { console.log(skydive_config_cmd); }
            cockpit.spawn(skydive_config_cmd, { host: ccvm_ip })
            .then(function (data) {
                var skydive_config_result = JSON.parse(data);
                if(skydive_config_result.code=="200") { //정상
                    //=========== 1-3. 모니터링 서비스 전체 종료 ===========
                    var wall_service_stop_cmd = ['python3', pythonPath + 'start_services.py', 'stop', '--service', 'blackbox-exporter', 'node-exporter', 'grafana-server', 'process-exporter', 'prometheus', 'skydive-analyzer'];
                    if (console_log) { console.log(wall_service_stop_cmd); }
                    cockpit.spawn(wall_service_stop_cmd, { host: ccvm_ip })
                    .then(function (data) {
                        var wall_service_stop_result = JSON.parse(data);
                        if(wall_service_stop_result.code=="200") { //정상
                            //=========== 2-1. 모니터링 대상 IP 설정 ===========
                            setWallProgressStep("span-wall-progress-step1",2);
                            setWallProgressStep("span-wall-progress-step2",1);

                            var prometheus_config_cmd = ['python3', pythonPath + 'config_wall.py', 'config','--ccvm', ccvm_ip];
                            prometheus_config_cmd.push('--cube');
                            for(var i = 1 ; i <= host_count ; i ++ ){
                                var cubehost_ip = $('#form-input-wall-monitoring-cubehost'+i+'-ip').val();
                                prometheus_config_cmd.push(cubehost_ip);
                            }
                            prometheus_config_cmd.push('--scvm');
                            for(var i = 1 ; i <= host_count ; i ++ ){
                                var scvm_ip = $('#form-input-wall-monitoring-scvm'+i+'-ip').val();
                                prometheus_config_cmd.push(scvm_ip);
                            }
                            if (console_log) { console.log(prometheus_config_cmd); }
                            cockpit.spawn(prometheus_config_cmd, { host: ccvm_ip })
                            .then(function (data) {
                                var prometheus_config_result = JSON.parse(data);
                                if(prometheus_config_result.code=="200") { //정상
                                    //=========== 2-2. Wall Monitoring 구성 서비스 실행 ===========
                                    var wall_service_start_cmd = ['python3', pythonPath + 'start_services.py', 'start', '--service', 'blackbox-exporter', 'node-exporter', 'grafana-server', 'process-exporter', 'prometheus', 'skydive-analyzer'];
                                    if (console_log) { console.log(wall_service_start_cmd); }
                                    cockpit.spawn(wall_service_start_cmd, { host: ccvm_ip })
                                    .then(function (data) {
                                        var wall_service_start_result = JSON.parse(data);
                                        if(wall_service_start_result.code=="200") { //정상
                                            if(smtp_yn_bool){ //SMTP 작업 진행
                                                //=========== 3-1. smtp 설정 (grafana.ini) ===========
                                                setWallProgressStep("span-wall-progress-step2",2);
                                                setWallProgressStep("span-wall-progress-step3",1);
                                                var smtp_conf_cmd = ['python3', pythonPath + 'config_smtp.py', 'config', '--host', smtp_server_ip+':'+smtp_server_port, '--user', email_addr, '--password', email_pw];
                                                if (console_log) { console.log(smtp_conf_cmd); }
                                                cockpit.spawn(smtp_conf_cmd, { host: ccvm_ip })
                                                .then(function (data) {
                                                    var smtp_conf_result = JSON.parse(data);
                                                    if(smtp_conf_result.code=="200") { //정상
                                                        //=========== 3-2. API key 생성 ===========
                                                        var api_key_cmd = ['python3', pythonPath + 'create_admin_apikey.py', ccvm_ip, 'ablestack-admin'];
                                                        if (console_log) { console.log(api_key_cmd); }
                                                        cockpit.spawn(api_key_cmd, { host: ccvm_ip })
                                                        .then(function (data) {
                                                            var api_key_result = JSON.parse(data);
                                                            if(api_key_result.code=="200") { //정상
                                                                //=========== 3-3. notification channel 설정 파일 (json) 업데이트 ===========
                                                                var notifi_channel_config_cmd = ['python3', pythonPath + 'update_noti_json.py', receive_email_addr];
                                                                if (console_log) { console.log(notifi_channel_config_cmd); }
                                                                cockpit.spawn(notifi_channel_config_cmd, { host: ccvm_ip })
                                                                .then(function (data) {
                                                                    var notifi_channel_config_result = JSON.parse(data);
                                                                    if(notifi_channel_config_result.code=="200") { //정상
                                                                        //=========== 3-4. notification channel 생성 ===========
                                                                        var notifi_channel_create_cmd = ['python3', pythonPath + 'create_noti_channel.py', ccvm_ip];
                                                                        if (console_log) { console.log(notifi_channel_create_cmd); }
                                                                        cockpit.spawn(notifi_channel_create_cmd, { host: ccvm_ip })
                                                                        .then(function (data) {
                                                                            var notifi_channel_create_result = JSON.parse(data);
                                                                            if(notifi_channel_create_result.code=="200") { //정상
                                                                                //=========== 3-5. smtp - notification channel 테스트 ===========
                                                                                var notifi_channel_test_cmd = ['python3', pythonPath + 'test_noti_channel.py', ccvm_ip];
                                                                                if (console_log) { console.log(notifi_channel_test_cmd); }
                                                                                cockpit.spawn(notifi_channel_test_cmd, { host: ccvm_ip })
                                                                                .then(function (data) {
                                                                                    var notifi_channel_test_result = JSON.parse(data);
                                                                                    if(notifi_channel_test_result.code=="200") { //정상
                                                                                        // /root/bootstrap.sh 파일을 실행함.
                                                                                        cockpit.spawn(["sh", pluginpath+"/shell/host/bootstrap_run.sh","wall"])
                                                                                        .then(function(data){
                                                                                            console.log(data);
                                                                                            setWallProgressStep("span-wall-progress-step3",2);
                                                                                            //최종 화면 호출
                                                                                            showDivisionWallConfigFinish();
                                                                                        })
                                                                                        .catch(function(data){
                                                                                            console.log("bootstrap_run_check() Error : " + data);
                                                                                        });
                                                                                    } else {
                                                                                        setWallProgressFail(3);
                                                                                        alert(notifi_channel_test_result.val);
                                                                                    }
                                                                                })
                                                                                .catch(function (data) {
                                                                                    setWallProgressFail(3);
                                                                                    alert("notification channel 연결 테스트 실패 : " + data);
                                                                                });
                                                                            } else {
                                                                                setWallProgressFail(3);
                                                                                alert(notifi_channel_create_result.val);
                                                                            }
                                                                        })
                                                                        .catch(function (data) {
                                                                            setWallProgressFail(3);
                                                                            alert("notification channel 생성 실패 : " + data);
                                                                        });
                                                                    } else {
                                                                        setWallProgressFail(3);
                                                                        alert(notifi_channel_config_result.val);
                                                                    }
                                                                })
                                                                .catch(function (data) {
                                                                    setWallProgressFail(3);
                                                                    alert("notification channel 설정 파일 (json) 업데이트 실패 : " + data);
                                                                });
                                                            } else {
                                                                setWallProgressFail(3);
                                                                alert(api_key_result.val);
                                                            }
                                                        })
                                                        .catch(function (data) {
                                                            setWallProgressFail(3);
                                                            alert("API key 생성 실패 : " + data);
                                                        });
                                                    } else {
                                                        setWallProgressFail(3);
                                                        alert(smtp_conf_result.val);
                                                    }
                                                })
                                                .catch(function (data) {
                                                    setWallProgressFail(3);
                                                    alert("smtp 설정 defaults.ini 구성 실패 : " + data);
                                                });
                                            }else{ // smtp 설정을 생략하고 실행 완료
                                                // /root/bootstrap.sh 파일을 실행함.
                                                cockpit.spawn(["sh", pluginpath+"/shell/host/bootstrap_run.sh","wall"])
                                                .then(function(data){
                                                    console.log(data);
                                                    setWallProgressStep("span-wall-progress-step2",2);
                                                    setWallProgressStep("span-wall-progress-step3",2);
                                                    //최종 화면 호출
                                                    showDivisionWallConfigFinish();
                                                })
                                                .catch(function(data){
                                                    console.log("bootstrap_run_check() Error : " + data);
                                                });
                                            }
                                        } else {
                                            setWallProgressFail(2);
                                            alert(wall_service_start_result.val);
                                        }
                                    })
                                    .catch(function (data) {
                                        setWallProgressFail(2);
                                        alert("Wall Monitoring 구성 서비스 실행 실패 : " + data);
                                    });
                                } else {
                                    setWallProgressFail(2);
                                    alert(prometheus_config_result.val);
                                }
                            })
                            .catch(function (data) {
                                setWallProgressFail(2);
                                alert("Prometheus.yml 파일 구성 실패 : " + data);
                            });
                        } else {
                            setWallProgressFail(1);
                            alert(wall_service_stop_result.val);
                        }
                    })
                    .catch(function (data) {
                        setWallProgressFail(1);
                        alert("Wall Monitoring 서비스 중지 실패 : " + data);
                    });
                } else {
                    setWallProgressFail(1);
                    alert(skydive_config_result.val);
                }
            })
            .catch(function (data) {
                setWallProgressFail(1);
                alert("skydive 구성 실패 : "+data);
            });
        } else {
            setWallProgressFail(1);
            alert(host_ping_test_result.val);
        }
    })
    .catch(function (data) {
        setWallProgressFail(1);
        alert("Wall 모니터링 구성할 host 연결 상태 확인 실패 : "+data);
    });

}

/**
 * Meathod Name : setWallProgressFail
 * Date Created : 2021.09.01
 * Writer  : 배태주
 * Description : Wall 모니터링 구성 진행중 실패 단계에 따른 중단됨 UI 처리
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.01 최초 작성
 */
function setWallProgressFail(setp_num) {
    if (setp_num == 1 || setp_num == '1') {   // 1단계 이하 단계 전부 중단된 처리
        setWallProgressStep("span-wall-progress-step1", 3);
        setWallProgressStep("span-wall-progress-step2", 3);
        setWallProgressStep("span-wall-progress-step3", 3);
    } else if (setp_num == 2 || setp_num == '2') {   // 2단계 이하 단계 전부 중단된 처리
        setWallProgressStep("span-wall-progress-step2", 3);
        setWallProgressStep("span-wall-progress-step3", 3);
    } else if (setp_num == 3 || setp_num == '3') {   // 3단계 이하 단계 전부 중단된 처리
        setWallProgressStep("span-wall-progress-step3", 3);
    }
}

$('input[type=checkbox][id="form-checkbox-smtp-yn"]').on('change', function () {
    resetSmtpValues();
});

/**
 * Meathod Name : resetSmtpValues
 * Date Created : 2021.09.02
 * Writer  : 배태주
 * Description : SMTP 구성 여부 체크박스 클릭에 따른 세팅값 초기화 이벤트
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.02 최초 작성
 */
function resetSmtpValues() {
    var svc_bool = $('input[type=checkbox][id="form-checkbox-smtp-yn"]').is(":checked");
    //체크 해제시 관련 설정값 초기화
    if (svc_bool) {
        // 입력값 활성화
        $('#form-input-wall-smtp-server-ip').attr('disabled', false);
        $('#form-input-wall-smtp-server-port').attr('disabled', false);
        $('#form-input-wall-smtp-email-addr').attr('disabled', false);
        $('#form-input-wall-smtp-email-pw').attr('disabled', false);
        $('#form-input-wall-smtp-receive-email-addr').attr('disabled', false);
    }
    else {
        // 값 초기화
        $('#form-input-wall-smtp-server-ip').val("");
        $('#form-input-wall-smtp-server-port').val("");
        $('#form-input-wall-smtp-email-addr').val("");
        $('#form-input-wall-smtp-email-pw').val("");
        $('#form-input-wall-smtp-receive-email-addr').val("");

        // 입력값 비활성화
        $('#form-input-wall-smtp-server-ip').attr('disabled', true);
        $('#form-input-wall-smtp-server-port').attr('disabled', true);
        $('#form-input-wall-smtp-email-addr').attr('disabled', true);
        $('#form-input-wall-smtp-email-pw').attr('disabled', true);
        $('#form-input-wall-smtp-receive-email-addr').attr('disabled', true);
    }
}

/**
 * Meathod Name : showDivisionWallConfigFinish
 * Date Created : 2021.09.02
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신을 배포한 후 마지막 페이지를 보여주는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.02 최초 작성
 */
function showDivisionWallConfigFinish() {
    resetWallMonitoringWizard();

    $('#div-modal-wizard-wall-monitoring-finish').show();

    $('#nav-button-wall-monitoring-finish').addClass('pf-m-current');
    $('#nav-button-wall-monitoring-finish').removeClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-wall-monitoring').html('완료');

    $('#button-next-step-modal-wizard-wall-monitoring').hide();
    $('#button-before-step-modal-wizard-wall-monitoring').hide();
    $('#button-cancel-config-modal-wizard-wall-monitoring').hide();

    completed = true;

    cur_step_wizard_wall_vm = "5";
}

/**
 * Meathod Name : setWallReviewInfo
 * Date Created : 2021.09.01
 * Writer  : 배태주
 * Description : Wall 모니터링센터 구성 전 설정확인을 위한 정보를 세팅하는 기능
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.01 최초 작성
 */
function setWallReviewInfo() {
    var host_count = $('input[type=text][id="form-input-wall-host-number"]').val();

    //-----모니터링 대상 IP 설정-----
    var host_num = $('#form-input-wall-host-number').val();
    if (host_num == '') {
        $('#span-wall-host-number').text("미입력");
    } else {
        $('#span-wall-host-number').text(host_num);
    }

    var ccvm_ip = $('#form-input-wall-monitoring-ccvm-ip').val();
    if (ccvm_ip == '') {
        $('#span-wall-monitoring-ccvm-ip').text("미입력");
    } else {
        $('#span-wall-monitoring-ccvm-ip').text(ccvm_ip);
    }

    for(var i = 1 ; i <= host_count ; i ++ ){
        var cubehost_ip = $('#form-input-wall-monitoring-cubehost'+i+'-ip').val();
        if (cubehost_ip == '') {
            $('#span-wall-monitoring-cubehost'+i+'-ip').text("미입력");
        } else {
            $('#span-wall-monitoring-cubehost'+i+'-ip').text(cubehost_ip);
        }
    }

    for(var i = 1 ; i <= host_count ; i ++ ){
        var scvm_ip = $('#form-input-wall-monitoring-scvm'+i+'-ip').val();
        if (scvm_ip == '') {
            $('#span-wall-monitoring-scvm'+i+'-ip').text("미입력");
        } else {
            $('#span-wall-monitoring-scvm'+i+'-ip').text(scvm_ip);
        }
    }

    //-----알림 SMTP 설정-----
    var smtp_server_ip = $('#form-input-wall-smtp-server-ip').val();
    if (smtp_server_ip == '') {
        $('#span-wall-monitoring-smtp-server-ip').text("미입력");
    } else {
        $('#span-wall-monitoring-smtp-server-ip').text(smtp_server_ip);
    }

    var smtp_server_port = $('#form-input-wall-smtp-server-port').val();
    if (smtp_server_port == '') {
        $('#span-wall-monitoring-smtp-server-port').text("미입력");
    } else {
        $('#span-wall-monitoring-smtp-server-port').text(smtp_server_port);
    }

    var email_addr = $('#form-input-wall-smtp-email-addr').val();
    if (email_addr == '') {
        $('#span-wall-monitoring-smtp-email-addr').text("미입력");
    } else {
        $('#span-wall-monitoring-smtp-email-addr').text(email_addr);
    }

    var email_pw = $('#form-input-wall-smtp-email-pw').val();
    if (email_pw == '') {
        $('#span-wall-monitoring-smtp-email-pw').text("미입력");
    } else {
        $('#span-wall-monitoring-smtp-email-pw').text("********");
    }

    var receive_email_addr = $('#form-input-wall-smtp-receive-email-addr').val();
    if (receive_email_addr == '') {
        $('#span-wall-monitoring-smtp-receive-email-addr').text("미입력");
    } else {
        $('#span-wall-monitoring-smtp-receive-email-addr').text(receive_email_addr);
    }

    var smtp_yn_bool = $('input[type=checkbox][id="form-checkbox-smtp-yn"]').is(":checked");
    if (smtp_yn_bool) {
        $('#span-wall-monitoring-smtp-yn').text("선택");
    } else {
        $('#span-wall-monitoring-smtp-yn').text("미선택");
        $('#span-wall-monitoring-smtp-server-ip').text("N/A");
        $('#span-wall-monitoring-smtp-server-port').text("N/A");
        $('#span-wall-monitoring-smtp-email-addr').text("N/A");
        $('#span-wall-monitoring-smtp-email-pw').text("N/A");
        $('#span-wall-monitoring-smtp-receive-email-addr').text("N/A");
    }
}

/**
 * Meathod Name : validateWallMonitoringVm
 * Date Created : 2021.09.02
 * Writer  : 배태주
 * Description : 클라우드센터 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.02 최초 작성
 */
function validateWallMonitoringVm() {

    var valicate_check = true;
    var smtp_yn_bool = $('input[type=checkbox][id="form-checkbox-smtp-yn"]').is(":checked");
    var host_count = $('input[type=text][id="form-input-wall-host-number"]').val();

    if ($('#form-input-wall-host-number').val() == "") {
        alert("호스트 수를 입력해주세요.");
        valicate_check = false;
    }
    else if (!$.isNumeric($("#form-input-wall-host-number").val())) {
        alert("호스트 수를 숫자로 입력해주세요.");
        valicate_check = false;
    }
    else if ($('#form-input-wall-monitoring-ccvm-ip').val() == "") {
        alert("CCVM 관리 IP를 입력해주세요.");
        valicate_check = false;
    }
    else if (!checkIp($("#form-input-wall-monitoring-ccvm-ip").val())) {
        alert("CCVM 관리 IP 형식을 확인해주세요.");
        valicate_check = false;
    }

    for(var i = 1 ; i <= host_count ; i ++ ){
        if (valicate_check && $('#form-input-wall-monitoring-cubehost'+i+'-ip').val() == "") {
            alert('Cube'+i+' 관리 IP를 입력해주세요.');
            valicate_check = false;
        }

        if (valicate_check && !checkIp($('#form-input-wall-monitoring-cubehost'+i+'-ip').val())) {
            alert('Cube'+i+' 관리 IP 형식을 확인해주세요.');
            valicate_check = false;
        }
    }

    for(var i = 1 ; i <= host_count ; i ++ ){
        if (valicate_check && $('#form-input-wall-monitoring-scvm'+i+'-ip').val() == "") {
            alert('SCVM'+i+' 관리 IP를 입력해주세요.');
            valicate_check = false;
        }

        if (valicate_check && !checkIp($('#form-input-wall-monitoring-scvm'+i+'-ip').val())) {
            alert('SCVM'+i+' 관리 IP 형식을 확인해주세요.');
            valicate_check = false;
        }
    }

    if(valicate_check){
        if (smtp_yn_bool && $('#form-input-wall-smtp-server-ip').val() == "") {
            alert("SMTP 서버를 입력해주세요.");
            valicate_check = false;
        }
        //else if (smtp_yn_bool && !checkIp($("#form-input-wall-smtp-server-ip").val())) {
        //    alert("SMTP 서버 IP 형식을 확인해주세요.");
        //    valicate_check = false;
        //}
        else if (smtp_yn_bool && $('#form-input-wall-smtp-server-port').val() == "") {
            alert("SMTP 서버 Port를 입력해주세요.");
            valicate_check = false;
        }
        else if (smtp_yn_bool && !$.isNumeric($("#form-input-wall-smtp-server-port").val())) {
            alert("SMTP 서버 Port 형식을 확인해주세요.");
            valicate_check = false;
        }
        else if (smtp_yn_bool && $('#form-input-wall-smtp-email-addr').val() == "") {
            alert("관리자 이메일 주소를 입력해주세요.");
            valicate_check = false;
        }
        else if (smtp_yn_bool && !checkEmail($("#form-input-wall-smtp-email-addr").val())) {
            alert("관리자 이메일 주소 형식을 확인해주세요.");
            valicate_check = false;
        }
        else if (smtp_yn_bool && $('#form-input-wall-smtp-email-pw').val() == "") {
            alert("이메일 비밀번호를 입력해주세요.");
            valicate_check = false;
        }
        else if (smtp_yn_bool && !checkEmail($("#form-input-wall-smtp-receive-email-addr").val())) {
            alert("수신 이메일 주소 형식을 확인해주세요.");
            valicate_check = false;
        }
    }

    return valicate_check;
}

/**
 * Meathod Name :
 * Date Created : 2021.09.07
 * Writer  : 배태주
 * Description : 호스트 수에 따라 input 박스 다시 세팅하는 기능
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.07 최초 작성
 */
$('input[type=text][id="form-input-wall-host-number"]').on('change', function () {

    var host_count = $('input[type=text][id="form-input-wall-host-number"]').val();

    if(host_count >= 3 && host_count <= 100){
        $('#div-wall-ccvm-ip-area').empty();
        $('#div-wall-cubehost-ip-area').empty();
        $('#div-wall-scvm-ip-area').empty();
        $('#div-wall-review-area').empty();

        var ccvm_el ='';
        ccvm_el +='    <div class="pf-c-form__field-group-header"  style="padding-bottom:8px;">';
        ccvm_el +='        <div class="pf-c-form__field-group-header-main">';
        ccvm_el +='            <div class="pf-c-form__field-group-header-title">';
        ccvm_el +='                <div class="pf-c-form__field-group-header-title-text">클라우드센터 VM</div>';
        ccvm_el +='            </div>';
        ccvm_el +='        </div>';
        ccvm_el +='    </div>';
        ccvm_el +='    <div class="pf-c-form__field-group-body" style="padding-top:0px;">';
        ccvm_el +='        <div class="pf-c-form__group" style="padding:0px;">';
        ccvm_el +='            <div class="pf-c-form__group-label">';
        ccvm_el +='                <label class="pf-c-form__label" for="form-input-wall-monitoring-ccvm-ip">';
        ccvm_el +='                    <span class="pf-c-form__label-text">CCVM 관리 IP</span>';
        ccvm_el +='                    <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>';
        ccvm_el +='                </label>';
        ccvm_el +='            </div>';
        ccvm_el +='            <div class="pf-c-form__group-control">';
        ccvm_el +='                <input class="pf-c-form-control" style="width:70%" type="text" id="form-input-wall-monitoring-ccvm-ip" name="form-input-wall-monitoring-ccvm-ip" required />';
        ccvm_el +='            </div>';
        ccvm_el +='        </div>';
        ccvm_el +='    </div>';

        var cube_host_el = '';
        cube_host_el += '    <div class="pf-c-form__field-group-header"  style="padding-bottom:8px;">';
        cube_host_el += '        <div class="pf-c-form__field-group-header-main">';
        cube_host_el += '            <div class="pf-c-form__field-group-header-title">';
        cube_host_el += '                <div class="pf-c-form__field-group-header-title-text">Cube 호스트</div>';
        cube_host_el += '            </div>';
        cube_host_el += '        </div>';
        cube_host_el += '    </div>';
        cube_host_el += '    <div class="pf-c-form__field-group-body" style="padding-top:0px;">';
        for(var i = 1 ; i <= host_count ; i ++ ){
            cube_host_el += '        <div class="pf-c-form__group" style="padding:0px;">';
            cube_host_el += '            <div class="pf-c-form__group-label">';
            cube_host_el += '                <label class="pf-c-form__label" for="form-input-wall-monitoring-cubehost'+i+'-ip">';
            cube_host_el += '                    <span class="pf-c-form__label-text">Cube'+i+' 관리 IP</span>';
            cube_host_el += '                    <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>';
            cube_host_el += '                </label>';
            cube_host_el += '            </div>';
            cube_host_el += '            <div class="pf-c-form__group-control">';
            cube_host_el += '                <input class="pf-c-form-control" style="width:70%" type="text" id="form-input-wall-monitoring-cubehost'+i+'-ip" name="form-input-wall-monitoring-cubehost'+i+'-ip" required />';
            cube_host_el += '            </div>';
            cube_host_el += '        </div>';
        }
        cube_host_el += '    </div>';


        var scvm_el ='';
        scvm_el +='    <div class="pf-c-form__field-group-header"  style="padding-bottom:8px;">';
        scvm_el +='        <div class="pf-c-form__field-group-header-main">';
        scvm_el +='            <div class="pf-c-form__field-group-header-title">';
        scvm_el +='                <div class="pf-c-form__field-group-header-title-text">스토리지센터 VM</div>';
        scvm_el +='            </div>';
        scvm_el +='        </div>';
        scvm_el +='    </div>';
        scvm_el +='    <div class="pf-c-form__field-group-body" style="padding-top:0px;">';
        for(var i = 1 ; i <= host_count ; i ++ ){
            scvm_el +='        <div class="pf-c-form__group" style="padding:0px;">';
            scvm_el +='            <div class="pf-c-form__group-label">';
            scvm_el +='                <label class="pf-c-form__label" for="form-input-wall-monitoring-scvm1-ip">';
            scvm_el +='                    <span class="pf-c-form__label-text">SCVM'+i+' 관리 IP</span>';
            scvm_el +='                    <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>';
            scvm_el +='                </label>';
            scvm_el +='            </div>';
            scvm_el +='            <div class="pf-c-form__group-control">';
            scvm_el +='                <input class="pf-c-form-control" style="width:70%" type="text" id="form-input-wall-monitoring-scvm'+i+'-ip" name="form-input-wall-monitoring-scvm'+i+'-ip" required />';
            scvm_el +='            </div>';
            scvm_el +='        </div>';
        }
        scvm_el +='    </div>';

        var review_el ='';
        review_el +='    <dl class="pf-c-description-list pf-m-horizontal" style="--pf-c-description-list--RowGap: 10px;margin-left: 10px">';
        review_el +='        <div class="pf-c-description-list__group">';
        review_el +='            <dt class="pf-c-description-list__term">';
        review_el +='                <span class="pf-c-description-list__text">호스트 수</span>';
        review_el +='            </dt>';
        review_el +='             <dd class="pf-c-description-list__description">';
        review_el +='               <div class="pf-c-description-list__text">';
        review_el +='                    <span id="span-wall-host-number"></span><br/>';
        review_el +='               </div>';
        review_el +='            </dd>';
        review_el +='        </div>';
        review_el +='        <div class="pf-c-description-list__group">';
        review_el +='            <dt class="pf-c-description-list__term">';
        review_el +='                <span class="pf-c-description-list__text">클라우드센터 VM</span>';
        review_el +='            </dt>';
        review_el +='             <dd class="pf-c-description-list__description">';
        review_el +='               <div class="pf-c-description-list__text">';
        review_el +='                    CCVM 관리 IP : <span id="span-wall-monitoring-ccvm-ip"></span><br/>';
        review_el +='               </div>';
        review_el +='            </dd>';
        review_el +='        </div>';
        review_el +='        <div class="pf-c-description-list__group">';
        review_el +='            <dt class="pf-c-description-list__term">';
        review_el +='                <span class="pf-c-description-list__text">Cube 호스트</span>';
        review_el +='            </dt>';
        review_el +='           <dd class="pf-c-description-list__description">';
        for(var i = 1 ; i <= host_count ; i ++ ){
            review_el +='                <div class="pf-c-description-list__text">';
            review_el +='                    Cube'+i+' 관리 IP : <span id="span-wall-monitoring-cubehost'+i+'-ip"></span><br/>';
            review_el +='                </div>';
        }
        review_el +='            </dd>';
        review_el +='        </div>';
        review_el +='        <div class="pf-c-description-list__group">';
        review_el +='            <dt class="pf-c-description-list__term">';
        review_el +='                <span class="pf-c-description-list__text">스토리지센터 VM</span>';
        review_el +='            </dt>';
        review_el +='            <dd class="pf-c-description-list__description">';
        for(var i = 1 ; i <= host_count ; i ++ ){
            review_el +='                <div class="pf-c-description-list__text">';
            review_el +='                    SCVM'+i+' 관리 IP : <span id="span-wall-monitoring-scvm'+i+'-ip"></span><br/>';
            review_el +='                </div>';
        }
        review_el +='            </dd>';
        review_el +='       </div>';
        review_el +='    </dl>';

        $('#div-wall-ccvm-ip-area').append(ccvm_el);
        $('#div-wall-cubehost-ip-area').append(cube_host_el);
        $('#div-wall-scvm-ip-area').append(scvm_el);
        $('#div-wall-review-area').append(review_el);
    } else {
        alert("호스트 수는 3 이상 100 이하로 입력할 수 있습니다.");
    }
});


/* 함수 정의 끝 */