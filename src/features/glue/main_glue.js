/**
 * File Name : main_glue.js
 * Date Created : 2023.04.25
 * Writer  :배태주
 * Description : main_glue.html에서 발생하는 이벤트 처리를 위한 JavaScript
 **/

// document.ready 영역 시작
pluginpath = '/usr/share/cockpit/ablestack';

$(document).ready(function(){
    $('#div-modal-wizard-gateway-vm').load("./src/features/glue/gateway-vm-wizard.html");
    $('#div-modal-wizard-gateway-vm').hide();

});
// document.ready 영역 끝

// 이벤트 처리 함수
$('#button-open-modal-wizard-gateway-vm').on('click', function(){
    $('#div-modal-wizard-gateway-vm').show();
});

/** 스토리지 서비스 구성 관련 action start */
$('#button-gateway-vm-setup').on('click', function(){
    $('#div-modal-gateway-vm-setup').show();
});


$('#input-checkbox-nfs').on('change', function(){
    if ($('#input-checkbox-nfs').is(':checked') == true) {
        $('#dev-nfs-info').show();
    }else{
        $('#dev-nfs-info').hide();
    }
});

$('#input-checkbox-smb').on('change', function(){
    if ($('#input-checkbox-smb').is(':checked') == true) {
        $('#dev-smb-info').show();
    }else{
        $('#dev-smb-info').hide();
    }
});

$('#input-checkbox-gluefs').on('change', function(){
    if ($('#input-checkbox-gluefs').is(':checked') == true) {
        $('#dev-gluefs-info').show();
    }else{
        $('#dev-gluefs-info').hide();
    }
});

$('#input-checkbox-iscsi').on('change', function(){
    if ($('#input-checkbox-iscsi').is(':checked') == true) {
        $('#dev-iscsi-info').show();
    }else{
        $('#dev-iscsi-info').hide();
    }
});

//div-modal-status-alert modal 닫기
$('#modal-status-alert-button-close1, #modal-status-alert-button-close2').on('click', function(){
    $('#div-modal-status-alert').hide();
});
