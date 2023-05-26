/**
 * File Name : main_glue.js
 * Date Created : 2023.04.25
 * Writer  :배태주
 * Description : main_glue.html에서 발생하는 이벤트 처리를 위한 JavaScript
 **/

// document.ready 영역 시작
pluginpath = '/usr/share/cockpit/ablestack';
var console_log = true;

$(document).ready(function(){
    $('#div-modal-wizard-gateway-vm').load("./src/features/glue/gateway-vm-wizard.html");
    $('#div-modal-wizard-gateway-vm').hide();

    gwvmInfoSet();
    setInterval(() => {
        gwvmInfoSet();
    }, 10000);
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

/**
 * Meathod Name : validateGatewayVm
 * Date Created : 2023.05.25
 * Writer  : 배태주
 * Description : 게이트웨이 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.05.25 최초 작성
 */
function gwvmInfoSet(){
    $('#gwvm-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $("#gwvm-back-color").attr('class','pf-c-label pf-m-orange');
    $("#gwvm-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');

    var cmd = ['python3', pluginpath + '/python/gwvm/gwvm_status_check.py',"check"];

    if(console_log){console.log(cmd);}
    cockpit.spawn(cmd).then(function(data){
        var retVal = JSON.parse(data);
        if(retVal.code == "200"){
            if(retVal.val["role"] == "Started"){
                var started_host = retVal.val["started"];
                var core = retVal.val['CPU(s)'];
                var mem = toBytes(retVal.val['Max memory'])
                var ip = retVal.val["ip"];
                var prefix = retVal.val["prefix"];
                var gw = retVal.val["gw"];
                var disk_cap = retVal.val["disk_cap"];
                var disk_phy = retVal.val["disk_phy"];
                var disk_usage_rate = retVal.val["disk_usage_rate"];
    
                $("#gwvm-status").text("Running");
                $("#gwvm-back-color").attr('class','pf-c-label pf-m-green');
                $("#gwvm-cluster-icon").attr('class','fas fa-fw fa-check-circle');

                $('#td_gwvm_started_host').text(retVal.val["started"]);
                $('#td_gwvm_cpu_mem').text(retVal.val['CPU(s)'] + " vCore / " + toBytes(retVal.val['Max memory']));
                $('#td_gwvm_ip_prefix').text(retVal.val["ip"] + "/" + retVal.val["prefix"]);
                $('#td_gwvm_gw').text(retVal.val["gw"]);
                $('#td_gwvm_root_disk').text(retVal.val["disk_cap"] + " (사용가능 " + retVal.val["disk_phy"] + " / 사용률 " + retVal.val["disk_usage_rate"] + ")");
            }else{
                $("#gwvm-status").text("Stopped");
                cleanGwvmInfo();
            }
        } else if (retVal.code == "400"){
            cleanGwvmInfo();
            $("#gwvm-back-color").attr('class','pf-c-label pf-m-orange');
            $("#gwvm-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');
            $("#gwvm-status").text("N/A");
        } else {
            cleanGwvmInfo();
            $("#gwvm-status").text("Health Err");
        }
    })
    .catch(function(data){
        cleanGwvmInfo()
        $("#gwvm-status").text("Health Err");
        createLoggerInfo("게이트웨이 가상머신 정보 조회 실패");
    });
}

function cleanGwvmInfo(){
    $("#gwvm-back-color").attr('class','pf-c-label pf-m-red');
    $("#gwvm-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');
    $('#td_gwvm_started_host').text("N/A");
    $('#td_gwvm_cpu_mem').text("N/A");
    $('#td_gwvm_ip_prefix').text("N/A");
    $('#td_gwvm_gw').text("N/A");
    $('#td_gwvm_root_disk').text("N/A");
}

/*
    용량 숫자를 단위에 맞춰 bytes단위로 변경하는 함수
    ex) ccvm_instance.toBytes("1.5 GiB") == 1610612736

    파라미터 설명 : size: str: 용량을 나타내는 문자열
    반환값 : float: bytes 단위의 용량
*/
function toBytes(size){
    var ret_bytes
    if( size.search('KB') >= 0) ret_bytes = parseFloat(size)*1000
    else if( size.search('KiB') >= 0) ret_bytes =  parseFloat(size)*1024
    else if( size.search('MB') >= 0) ret_bytes =  parseFloat(size)*1000*1000
    else if( size.search('MiB') >= 0) ret_bytes =  parseFloat(size)*1024*1024
    else if( size.search('GB') >= 0) ret_bytes =  parseFloat(size)*1000*1000*1000
    else if( size.search('GiB') >= 0) ret_bytes =  parseFloat(size)*1024*1024*1024
    else if( size.search('TB') >= 0) ret_bytes =  parseFloat(size)*1000*1000*1000*1000
    else if( size.search('TiB') >= 0) ret_bytes =  parseFloat(size)*1024*1024*1024*1024
    else if( size.search('PB') >= 0) ret_bytes =  parseFloat(size)*1000*1000*1000*1000*1000
    else if( size.search('PiB') >= 0) ret_bytes =  parseFloat(size)*1024*1024*1024*1024*1024

    var bytes = parseInt(ret_bytes);

    var s = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

    var e = Math.floor(Math.log(bytes) / Math.log(1024));

    if (e == "-Infinity") return "0 " + s[0];
    else
        return (bytes / Math.pow(1024, Math.floor(e))) + " " + s[e];

}