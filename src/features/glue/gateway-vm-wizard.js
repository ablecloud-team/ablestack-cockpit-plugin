/**
 * File Name : gateway-vm-wizard.js
 * Date Created : 2023.05.08
 * Writer  : 배태주
 * Description : 게이트웨이 VM 배포 마법사 UI를 컨트롤하기 위한 스크립트
**/

// 변수 선언
var console_log = true;

/* Document Ready 이벤트 처리 시작 */
$(document).ready(function(){

    //관리네트워크 리스트 초기 세팅
    setNicBridge('form-select-gateway-vm-mngt-nic-parent',"10.10.2.1");

    //스토리지네트워크 리스트 초기 세팅
    setNicBridge('form-select-gateway-vm-storage-nic-parent',"10.10.2.1");

});
/* Document Ready 이벤트 처리 끝 */

/* HTML Object에서 발생하는 이벤트 처리 시작 */

// 마법사 "배포 실행 버튼 모달창"
$('#button-cancel-modal-gateway-wizard-confirm').on('click', function () {
    $('#div-modal-gateway-wizard-confirm').hide();
});
$('#button-close-modal-gateway-wizard-confirm').on('click', function () {
    $('#div-modal-gateway-wizard-confirm').hide();
});

// 마법사 "취소 버튼 모달창" show, hide
$('#button-cancel-config-modal-wizard-gateway-vm').on('click', function () {
    $('#div-modal-cancel-gateway-wizard-cancel').show();
});
$('#button-close-modal-gateway-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-gateway-wizard-cancel').hide();
});
$('#button-cancel-modal-gateway-wizard-cancel').on('click', function () {
    $('#div-modal-cancel-gateway-wizard-cancel').hide();
});
// 마법사 "취소 버튼 모달창" 실행 버튼을 눌러 취소를 실행
$('#button-execution-modal-gateway-wizard-cancel').on('click', function () {
    location.reload();
});

/* HTML Object에서 발생하는 이벤트 처리 끝 */

/* 함수 정의 시작 */

// 마법사 "배포 버튼 모달창" 실행 버튼을 눌러 가상머신 배포
$('#button-execution-modal-gateway-vm-create').on('click', function () {
    var hypervisor = $('select#form-select-gateway-hypervisor option:checked').val();

    if(validateGatewayVm(hypervisor)){
        $('#div-modal-gateway-wizard-confirm').show();
    }
});

// 마법사 "배포 실행 버튼 모달창"
$('#button-cancel-modal-gateway-vm-create').on('click', function () {
    $('#div-modal-gateway-vm-setup').hide();
    //상태값 초기화 겸 페이지 리로드
    location.reload();
});

$('#button-close-modal-gateway-vm-create').on('click', function () {
    $('#div-modal-gateway-vm-setup').hide();
});

// 마법사 "배포 버튼 모달창" 실행 버튼을 눌러 가상머신 배포
$('#button-execution-modal-gateway-wizard-confirm').on('click', function () {
    // 마법사 닫기
    $('#div-modal-gateway-vm-setup').hide();

    // hypervisor
    var hypervisor = $('select#form-select-gateway-hypervisor option:checked').val();

    // 확인 창 닫기
    $('#div-modal-gateway-wizard-confirm').hide();
    // 진행창 열기
    $('#div-modal-spinner-header-txt').text('스토리지 서비스 가상머신 구성중 (약 15분 소요)');
    $('#div-modal-spinner').show();

    $("#modal-status-alert-title").html("스토리지 게이트웨이 서비스 가상머신 구성 실패");
    $("#modal-status-alert-body").html("스토리지 게이트웨이 서비스 가상머신 구성을 실패하였습니다.");

    if(hypervisor == "cell"){
        // 관리 nic
        var mngt_nic = $('select#form-select-gateway-vm-mngt-nic-parent option:checked').val();
        // 관리 ip
        var mngt_ip = $('#form-input-gateway-vm-mngt-nic-ip').val();
        // 스토리지 nic
        var snb_nic = $('select#form-select-gateway-vm-storage-nic-parent option:checked').val();
        // 스토리지 ip
        var snb_ip = $('#form-input-gateway-vm-storage-nic-ip').val();

        var cmd = ['python3', pluginpath + '/python/gwvm/gwvm_create.py',"create","-mnb",mngt_nic,"-mi",mngt_ip,"-snb",snb_nic,"-si",snb_ip];

        if(console_log){console.log(cmd);}
        cockpit.spawn(cmd).then(function(data){
            $('#div-modal-spinner').hide();
            var retVal = JSON.parse(data);
            console.log(retVal);
            if(retVal.code == "200"){
                
                $("#modal-status-alert-title").html("스토리지 게이트웨이 서비스 가상머신 구성 완료");
                $("#modal-status-alert-body").html("스토리지 게이트웨이 서비스 가상머신 구성을 완료하였습니다.");
                $('#div-modal-status-alert').show();
                createLoggerInfo("스토리지 서비스 구성 완료");
            } else {
                $('#div-modal-status-alert').show();
                createLoggerInfo(retVal.val);
            }
        })
        .catch(function(data){
            $('#div-modal-spinner').hide();
            $('#div-modal-status-alert').show();
            createLoggerInfo("스토리지 서비스 구성 실패");
            console.log("스토리지 서비스 구성 실패" + data);
        });
    }
});

/**
 * Meathod Name : validateGatewayVm
 * Date Created : 2023.05.23
 * Writer  : 배태주
 * Description : 게이트웨이 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.05.23 최초 작성
 */
function validateGatewayVm(hypervisor){
    var validate_check = true;
    if(hypervisor == "cell"){
        if ($('select#form-select-gateway-vm-mngt-nic-parent option:checked').val() == ""){
            alert("관리 NIC용 Bridge를 입력해주세요.");
            validate_check = false;
        } else if ($('#form-input-gateway-vm-mngt-nic-ip').val() == ""){
            alert("관리 NIC IP를 입력해주세요.");
            validate_check = false;
        } else if (!checkIp($('#form-input-gateway-vm-mngt-nic-ip').val()) && $('#form-input-gateway-vm-mngt-nic-ip').val() != ""){
            alert("관리 NIC IP 형식을 확인해주세요.");
            validate_check = false;
        } else if ($('select#form-select-gateway-vm-storage-nic-parent option:checked').val() == ""){
            alert("스토리지 NIC용 Bridge를 입력해주세요.");
            validate_check = false;
        } else if ($('#form-input-gateway-vm-storage-nic-ip').val() == ""){
            alert("스토리지 NIC IP를 입력해주세요.");
            validate_check = false;
        } else if (!checkIp($('#form-input-gateway-vm-storage-nic-ip').val()) && $('#form-input-gateway-vm-storage-nic-ip').val() != ""){
            alert("스토리지 NIC IP 형식을 확인해주세요.");
            validate_check = false;
        }
    }
    return validate_check;
}

/* 함수 정의 끝 */