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

    $('#dropdown-menu-storage-cluster-status').hide();
    // gluefs 구성 화면 로드
    $('#div-modal-gluefs-construction').load("./src/features/glue/gluefs-construction.html");
    $('#div-modal-gluefs-construction').hide();
    // nfs 구성 화면 로드
    $('#div-modal-nfs-construction').load("./src/features/glue/nfs-construction.html");
    $('#div-modal-nfs-construction').hide();
    // smb 구성 화면 로드
    $('#div-modal-smb-construction').load("./src/features/glue/smb-construction.html");
    $('#div-modal-smb-construction').hide();

    $('#menu-item-set-gluefs-delete').hide();
    $('#menu-item-set-nfs-delete').hide();
    $('#menu-item-set-smb-delete').hide();


    gwvmInfoSet();
    sambaCheckInfo();
    gluefsCheckInfo();
    nfsCheckInfo();
    setInterval(() => {
        gwvmInfoSet(),sambaCheckInfo(),gluefsCheckInfo(),nfsCheckInfo();
    }, 60000);
});
// document.ready 영역 끝

// 이벤트 처리 함수
$('#button-open-modal-wizard-gateway-vm').on('click', function(){
    $('#div-modal-wizard-gateway-vm').show();
});
// 파일 시스템 눈금 클릭 시
$('#card-action-storage-cluster-status').on('click',function(){

    if( $('#gluefs-status').text() != 'Health Err' || $('#nfs-status').text() != 'Health Err' || $('#smb-status').text() != 'Health Err'){
        $('#menu-item-set-filesystem-control').removeClass('pf-m-disabled');
        $('#menu-item-set-filesystem-control').addClass('pf-m-enabled');
    }else{
        $('#menu-item-set-filesystem-control').removeClass('pf-m-enabled');
        $('#menu-item-set-filesystem-control').addClass('pf-m-disabeld');
    }
    $('#dropdown-menu-storage-cluster-status').toggle();
});

/** 스토리지 서비스 구성 관련 action start */
$('#button-gateway-vm-setup').on('click', function(){
    $('#div-modal-gateway-vm-setup').show();
});

//gluefs 구성 화면 열기
$('#menu-item-set-gluefs-construction').on('click',function(){
    localStorage.clear();
    sessionStorage.clear();
    $('#div-modal-gluefs-construction').show();
});
// nfs 구성 화면 열기
$('#menu-item-set-nfs-construction').on('click',function(){
    localStorage.clear();
    sessionStorage.clear();
    $('#div-modal-nfs-construction').show();
});
// smb 구성 화면 열기
$('#menu-item-set-smb-construction').on('click',function(){
    localStorage.clear();
    sessionStorage.clear();
    $('#div-modal-smb-construction').show();
});

// div-modal-alert-button-confirm 클릭시
$('#modal-status-alert-button-confirm').on('click',function(){
    $('#div-modal-status-alert').hide();
    location.reload();
});
// alert modal 닫기
$('#modal-status-alert-button-close1, #modal-status-alert-button-close2').on('click', function(){
    $('#div-modal-status-alert').hide();
});

// 삭제 modal 닫기
$('#button-cancel-modal-delete, #button-close-modal-delete').on('click',function(){
    $('#div-modal-all-delete').hide();
});
// gluefs 편집 열기
$('#gluefs-edit').on('click',function(){
    sessionStorage.setItem('type','gluefs_edit');

        $('#gluefs-construction-type').attr('style', "display:none;");
        $('#modal-title-gluefs-construciton').text('GlueFS 편집');
        $('#div-modal-gluefs-construction').show();

});
// nfs 편집 열기
$('#nfs-edit').on('click',function(){
    sessionStorage.setItem('type','nfs_edit');

    $('#modal-title-nfs-construciton').text('NFS 편집');
    $('#div-modal-nfs-construction').show();
});
// smb 편집 열기
$('#smb-edit').on('click',function(){
    sessionStorage.setItem('type','smb_edit');

    $('#smb-group-user, #smb-group-password').attr('style','display:none;');
    $('#modal-title-smb-construciton').text('SMB 편집');
    $('#div-modal-smb-construction').show();
});
// 파일 시스템 서비스 제어 열림
$('#menu-item-set-filesystem-control').on('click',function(){
    sessionStorage.clear();
    $('#div-modal-file-system-control').show();
});
// 파일 시스템 서비스 제어 닫힘
$('#button-close-file-system-control, #button-cancel-modal-file-system-control').on('click',function(){
    sessionStorage.clear();
    $('#div-modal-file-system-control').hide();
});
// 파일 시스템 서비스 실행 버튼 클릭 시
$('#button-execution-modal-file-system-control').on('click',function(){
    var service_name = $('#form-select-file-system-service-control').val();
    var service_action = $('#form-select-service-control-action').val();

    if(service_name == 'gluefs'){
            $('#div-modal-file-system-control').hide();
            $('#div-modal-spinner-header-txt').text('GlueFS 서비스 제어 중');
            $('#div-modal-spinner').show();

            var cmd = ['python3', pluginpath + '/python/glue/gluefs.py', 'daemon', '--control', service_action];
            cockpit.spawn(cmd).then(function(data){
                var retVal = JSON.parse(data);
                var retVal_code = JSON.parse(retVal.code);

                $('#div-modal-spinner').hide();

                if(service_action == 'stop'){
                    if(retVal_code == 200){
                        $('#modal-status-alert-title').text("GlueFS 서비스 제어");
                        $('#modal-status-alert-body').text("GlueFS 서비스가 정지되었습니다.");
                        $('#div-modal-status-alert').show();
                    }
                    else{
                        $('#modal-status-alert-title').text("GlueFS 서비스 제어");
                        $('#modal-status-alert-body').text("GlueFS 서비스를 정지 시키는 데 실패했습니다.");
                        $('#div-modal-status-alert').show();
                    }
                }
                else{
                    if(retVal_code == 200){
                        $('#modal-status-alert-title').text("GlueFS 서비스 제어");
                        $('#modal-status-alert-body').text("GlueFS 서비스가 시작되었습니다.");
                        $('#div-modal-status-alert').show();
                    }
                    else{
                        $('#modal-status-alert-title').text("GlueFS 서비스 제어");
                        $('#modal-status-alert-body').text("GlueFS 서비스를 시작 시키는 데 실패했습니다.");
                        $('#div-modal-status-alert').show();
                    }
                }

            });
    }
    else if(service_name == 'nfs'){
        $('#div-modal-file-system-control').hide();
        $('#div-modal-spinner-header-txt').text('NFS 서비스 제어 중');
        $('#div-modal-spinner').show();

        var cmd = ['python3', pluginpath + '/python/glue/nfs.py', 'daemon', '--control', service_action];
        cockpit.spawn(cmd).then(function(data){
            var retVal = JSON.parse(data);
            var retVal_code = JSON.parse(retVal.code);
            $('#div-modal-spinner').hide();
            if(service_action == 'stop'){
                if(retVal_code == 200){
                    $('#modal-status-alert-title').text("NFS 서비스 제어");
                    $('#modal-status-alert-body').text("NFS 서비스가 정지되었습니다.");
                    $('#div-modal-status-alert').show();
                }
                else{
                    $('#modal-status-alert-title').text("NFS 서비스 제어");
                    $('#modal-status-alert-body').text("NFS 서비스를 정지 시키는 데 실패했습니다.");
                    $('#div-modal-status-alert').show();
                }
            }
            else{
                if(retVal_code == 200){
                    $('#modal-status-alert-title').text("NFS 서비스 제어");
                    $('#modal-status-alert-body').text("NFS 서비스가 시작되었습니다.");
                    $('#div-modal-status-alert').show();
                }
                else{
                    $('#modal-status-alert-title').text("NFS 서비스 제어");
                    $('#modal-status-alert-body').text("NFS 서비스를 시작 시키는 데 실패했습니다.");
                    $('#div-modal-status-alert').show();
                }
            }
        });
        }
    else if(service_name == 'smb'){
        $('#div-modal-file-system-control').hide();
        $('#div-modal-spinner-header-txt').text('SMB 서비스 제어 중');
        $('#div-modal-spinner').show();

        var cmd = ['python3', pluginpath + '/python/glue/smb.py', service_action,'-sn','smb'];
        cockpit.spawn(cmd).then(function(data){
            var retVal = JSON.parse(data);
            $('#div-modal-spinner').hide();
            if(service_action == 'stop'){
                if(retVal.code == 200){
                    $('#modal-status-alert-title').text("SMB 서비스 제어");
                    $('#modal-status-alert-body').text("SMB 서비스가 정지되었습니다.");
                    $('#div-modal-status-alert').show();

                    localStorage.setItem('smb','stop');
                }
                else{
                    $('#modal-status-alert-title').text("SMB 서비스 제어");
                    $('#modal-status-alert-body').text("SMB 서비스를 정지 시키는 데 실패했습니다.");
                    $('#div-modal-status-alert').show();
                }
            }
            else{
                if(retVal.code == 200){
                    $('#modal-status-alert-title').text("SMB 서비스 제어");
                    $('#modal-status-alert-body').text("SMB 서비스가 시작되었습니다.");
                    $('#div-modal-status-alert').show();
                }
                else{
                    $('#modal-status-alert-title').text("SMB 서비스 제어");
                    $('#modal-status-alert-body').text("SMB 서비스를 시작 시키는 데 실패했습니다.");
                    $('#div-modal-status-alert').show();
                }
            }
        });
    }
});
// gluefs 삭제 버튼 클릭 시
$('#menu-item-set-gluefs-delete').on('click',function(){

    sessionStorage.setItem('type','gluefs_delete');

    $('#div-modal-delete-title').text("GlueFS 삭제");
    $('#div-modal-delete-body').text("GlueFS를 삭제하시겠습니까?");
    $('#div-modal-delete-body-p').show();
    if ($('#nfs-status').text() == "Health Err" && $('#smb-status').text() == "Health Err"){
        $('#button-execution-modal-delete').addClass('pf-m-enabled');
        $('#button-execution-modal-delete').removeClass('pf-m-disabled');
    }else{
        $('#button-execution-modal-delete').addClass('pf-m-disabled');
        $('#button-execution-modal-delete').removeClass('pf-m-enabled');
    }

    $('#div-modal-all-delete').show();
});
// nfs 삭제 버튼 클릭 시
$('#menu-item-set-nfs-delete').on('click',function(){

    sessionStorage.setItem('type','nfs_delete');

    $('#div-modal-delete-title').text("NFS 삭제");
    $('#div-modal-delete-body').text("NFS를 삭제하시겠습니까?");
    $('#div-modal-delete-body-p').hide();
    $('#button-execution-modal-delete').removeClass('pf-m-disabled');
    $('#button-execution-modal-delete').removeClass('pf-m-enabled');
    $('#div-modal-all-delete').show();
});
// smb 삭제 버튼 클릭 시
$('#menu-item-set-smb-delete').on('click',function(){
+
    sessionStorage.setItem('type','smb_delete');

    $('#div-modal-delete-title').text("SMB 삭제");
    $('#div-modal-delete-body').text("SMB를 삭제하시겠습니까?");
    $('#div-modal-delete-body-p').hide();
    $('#button-execution-modal-delete').removeClass('pf-m-disabled');
    $('#button-execution-modal-delete').removeClass('pf-m-enabled');
    $('#div-modal-all-delete').show();
});
// 삭제 실행 버튼 클릭 시
$('#button-execution-modal-delete').on('click',function(){

    var delete_session = sessionStorage.getItem('type');

    localStorage.clear();

    $('#div-modal-all-delete').hide();

    if(delete_session == 'gluefs_delete'){
        $('#div-modal-spinner-header-txt').text('GlueFS 삭제 중');
        $('#div-modal-spinner').show();

        cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py','delete']).then(function(data){
            var retVal = JSON.parse(data);
            var retVal_code = JSON.parse(retVal.code);
            if(retVal_code == 200){
                cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py', 'destroy']).then(function(data){
                    var retVal = JSON.parse(data);
                    var retVal_code = JSON.parse(retVal.code);
                    $('#div-modal-spinner').hide();

                    if(retVal_code == 200){
                        $('#modal-status-alert-title').text("GlueFS 삭제");
                        $('#modal-status-alert-body').text("GlueFS 삭제가 완료되었습니다.");
                        $('#div-modal-status-alert').show();

                        sessionStorage.removeItem('type');
                    }
                    else{
                        $('#modal-status-alert-title').text("GlueFS 삭제");
                        $('#modal-status-alert-body').text("GlueFS 삭제가 실패했습니다.");
                        $('#div-modal-status-alert').show();
                    }
                }).catch(function(){
                    createLoggerInfo("GlueFS destroy failed");
                });
            }
            else{
                $('#modal-status-alert-title').text("GlueFS 삭제");
                $('#modal-status-alert-body').text("GlueFS 삭제가 실패했습니다.");
                $('#div-modal-status-alert').show();
            }
        }).catch(function(){
                createLoggerInfo("GlueFS delete failed");
        });
    }
    else if(delete_session == 'nfs_delete'){
        $('#div-modal-spinner-header-txt').text('NFS 삭제 중');
        $('#div-modal-spinner').show();
        cockpit.spawn(['python3', pluginpath + '/python/glue/nfs.py','destroy']).then(function(data){
            var retVal = JSON.parse(data);
            var retVal_code = JSON.parse(retVal.code);

            $('#div-modal-spinner').hide();

            if(retVal_code == 200){
                $('#modal-status-alert-title').text("NFS 삭제");
                $('#modal-status-alert-body').text("NFS 삭제가 완료되었습니다.");
                $('#div-modal-status-alert').show();

                sessionStorage.removeItem('type');
            }
            else{
                $('#modal-status-alert-title').text("NFS 삭제");
                $('#modal-status-alert-body').text("NFS 삭제가 실패했습니다.");
                $('#div-modal-status-alert').show();
            }
        }).catch(function(){
            createLoggerInfo("NFS delete failed");
        });
    }
    else if(delete_session == 'smb_delete'){
        $('#div-modal-spinner-header-txt').text('SMB 삭제 중');
        $('#div-modal-spinner').show();
        cockpit.spawn(['python3', pluginpath + '/python/glue/smb.py','delete']).then(function(data){
            var retVal = JSON.parse(data);

            $('#div-modal-spinner').hide();

            if(retVal.code == 200){
                $('#div-modal-all-delete').hide();
                $('#modal-status-alert-title').text("SMB 삭제");
                $('#modal-status-alert-body').text("SMB 삭제가 완료되었습니다.");
                $('#div-modal-status-alert').show();

                sessionStorage.removeItem('type');
            }
            else{
                $('#modal-status-alert-title').text("SMB 삭제");
                $('#modal-status-alert-body').text("SMB 삭제가 실패했습니다.");
                $('#div-modal-status-alert').show();
            }
        }).catch(function(){
            createLoggerInfo("SMB delete failed");
        })
    }
});
/**
 * Meathod Name : sambaCheckInfo
 * Date Created : 2023.06.02
 * Writer  : 정민철
 * Description : 삼바 서비스 상태 동작 확인 및 정보 확인
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.05.31 최초 작성
 */
function sambaCheckInfo(){
    var action = localStorage.getItem('smb');

    $('#smb-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $("#smb-color").attr('class','pf-c-label pf-m-orange');
    $("#smb-icon").attr('class','fas fa-fw fa-exclamation-triangle');

    cockpit.spawn(['python3', pluginpath + '/python/glue/smb.py','detail']).then(function(data){
        var retVal_detail = JSON.parse(data);
        if(retVal_detail.code == 200){
            cockpit.spawn(['python3', pluginpath + '/python/glue/smb.py','status', '-sn','smb']).then(function(data){
                var retVal_status = JSON.parse(data);
                if(retVal_status.code == 500){
                    if(action == 'stop'){
                        ServiceQuota('smb');

                        $('#smb-path').text("/fs");
                        $('#smb-mount-path').text("/smb");
                        $('#smb-access-ip').text(retVal_detail.val.ip_address);
                        $('#smb-status').text("Stop");
                        $('#smb-color').attr('class','pf-c-label pf-m-red');
                        $('#smb-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                        $('#smb-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-enabled');
                        $('#menu-item-set-smb-construction').hide();
                        $('#menu-item-set-smb-delete').show();
                    }
                    else{
                        cleanSambaInfo();
                        $('#smb-status').text("Health Err");
                        $('#smb-color').attr('class','pf-c-label pf-m-red');
                        $('#smb-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                        $('#smb-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-disabled');
                        $("#form-select-file-system-service-control option[value=smb]").hide();
                        $('#menu-item-set-smb-construction').show();
                        $('#menu-item-set-smb-delete').hide();
                    }
                }
                else{
                    ServiceQuota('smb');

                    $('#smb-path').text("/fs");
                    $('#smb-mount-path').text("/smb");
                    $('#smb-access-ip').text(retVal_detail.val.ip_address);
                    $('#smb-status').text("Health OK");
                    $('#smb-color').attr('class','pf-c-label pf-m-green');
                    $('#smb-icon').attr('class','fas fa-fw fas fa-fw fa-check-circle');
                    $('#smb-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-enabled');
                    $('#menu-item-set-smb-construction').hide();
                    $('#menu-item-set-smb-delete').show();
                }
            }).catch(function(){
                createLoggerInfo("SMB status 조회 실패");
            });
        }
        else{
            $('#smb-status').text("Health Err");
            $('#smb-color').attr('class','pf-c-label pf-m-red');
            $('#smb-icon').attr('class','fas fa-fw fa-exclamation-triangle');
            $('#smb-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-disabled');
            $("#form-select-file-system-service-control option[value=smb]").hide();
            $('#menu-item-set-smb-construction').show();
            $('#menu-item-set-smb-delete').hide();
            cleanSambaInfo();
        }
    }).catch(function(){
        createLoggerInfo("SMB detail 조회 실패");
    });
}
function cleanSambaInfo(){
    $('#smb-path').text("N/A");
    $('#smb-mount-path').text("N/A");
    $('#smb-access-ip').text("N/A");
    $('#smb-usage').text("N/A");
}
/**
 * Meathod Name : gluefsCheckInfo
 * Date Created : 2023.06.02
 * Writer  : 정민철
 * Description : gluefs 서비스 상태 동작 확인 및 정보 확인
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.05.31 최초 작성
 */
function gluefsCheckInfo(){
    $('#gluefs-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $("#gluefs-color").attr('class','pf-c-label pf-m-orange');
    $("#gluefs-icon").attr('class','fas fa-fw fa-exclamation-triangle');

    cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py','status']).then(function(data){
        var retVal = JSON.parse(data);
        var retVal_code_status = JSON.parse(retVal.code);
        var retVal_val_status = JSON.parse(retVal.val);
        if(retVal_code_status == 200){
            if(retVal_val_status[0] == undefined){
                cleanGluefsInfo();
                $('#gluefs-status').text("Health Err");
                $('#gluefs-color').attr('class','pf-c-label pf-m-red');
                $('#gluefs-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                $('#gluefs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-disabled');
                $("#form-select-file-system-service-control option[value=gluefs]").hide();
                $('#menu-item-set-gluefs-construction').show();
                $('#menu-item-set-gluefs-delete').hide();
            }
            else{
                cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py','detail']).then(function(data){
                    var retVal = JSON.parse(data);
                    var retVal_code_detail = JSON.parse(retVal.code);
                    var retVal_val_detail = JSON.parse(retVal.val);
                    console.log(retVal_val_detail);
                    if(retVal_code_detail == 200){
                        gwvmEtcHostIp('gluefs');
                        ServiceQuota('gluefs');
                            if(retVal_val_status[0].status.running == 2){

                                $('#gluefs-mount-path').text("/gluefs");
                                $('#gluefs-status').text("Health OK");
                                $('#gluefs-color').attr('class','pf-c-label pf-m-green');
                                $('#gluefs-icon').attr('class','fas fa-fw fas fa-fw fa-check-circle');
                                $('#gluefs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-enabled');
                                $('#menu-item-set-gluefs-construction').hide();
                                $('#menu-item-set-gluefs-delete').show();
                            }
                            else {

                                $('#gluefs-mount-path').text("/gluefs");
                                $('#gluefs-status').text("Stop");
                                $('#gluefs-color').attr('class','pf-c-label pf-m-red');
                                $('#gluefs-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                                $('#gluefs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-enabled');
                                $('#menu-item-set-gluefs-construction').hide();
                                $('#menu-item-set-gluefs-delete').show();
                            }
                    }
                    else{
                        cleanGluefsInfo();
                        $('#gluefs-status').text("Health Err");
                        $('#gluefs-color').attr('class','pf-c-label pf-m-red');
                        $('#gluefs-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                        $('#gluefs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-disabled');
                        $("#form-select-file-system-service-control option[value=gluefs]").hide();
                        $('#menu-item-set-gluefs-construction').show();
                        $('#menu-item-set-gluefs-delete').hide();
                    }
                }).catch(function(){
                    createLoggerInfo("GlueFS status 조회 실패");
                });
            }
        }
        else{
            cleanGluefsInfo();
            $('#gluefs-status').text("Health Err");
            $('#gluefs-color').attr('class','pf-c-label pf-m-red');
            $('#gluefs-icon').attr('class','fas fa-fw fa-exclamation-triangle');
            $('#gluefs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-disabled');
            $("#form-select-file-system-service-control option[value=gluefs]").hide();
            $('#menu-item-set-gluefs-construction').show();
            $('#menu-item-set-gluefs-delete').hide();

        }
    }).catch(function(){
        createLoggerInfo("GlueFS detail 조회 실패");
    });
}
/**
 * Meathod Name : cleanGluefsInfo
 * Date Created : 2023.06.02
 * Writer  : 정민철
 * Description : gluefs 구성 초기화
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.05.31 최초 작성
 */
function cleanGluefsInfo(){
    $('#gluefs-path').text("N/A");
    $('#gluefs-mount-path').text("N/A");
    $('#gluefs-access-ip').text("N/A");
    $('#gluefs-usage').text("N/A");
}
/**
 * Meathod Name : nfsCheckInfo
 * Date Created : 2023.06.02
 * Writer  : 정민철
 * Description : nfs 서비스 상태 동작 확인 및 정보 확인
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.05.31 최초 작성
 */
function nfsCheckInfo(){
    $('#nfs-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $("#nfs-color").attr('class','pf-c-label pf-m-orange');
    $("#nfs-icon").attr('class','fas fa-fw fa-exclamation-triangle');

    cockpit.spawn(['python3', pluginpath + '/python/glue/nfs.py','status']).then(function(data){
        var retVal = JSON.parse(data);
        var retVal_code_status = JSON.parse(retVal.code);
        var retVal_val_status = JSON.parse(retVal.val);

        if(retVal_code_status == 200){
            if(retVal_val_status[0] == undefined){
                cleanNfsInfo();
                $('#nfs-status').text("Health Err");
                $('#nfs-color').attr('class','pf-c-label pf-m-red');
                $('#nfs-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                $('#nfs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-disabled');
                $("#form-select-file-system-service-control option[value=nfs]").hide();
                $('#menu-item-set-nfs-construction').show();
                $('#menu-item-set-nfs-delete').hide();
            }
            else{
                cockpit.spawn(['python3', pluginpath + '/python/glue/nfs.py','detail']).then(function(data){
                    var retVal = JSON.parse(data);
                    var retVal_code_detail = JSON.parse(retVal.code);
                    var retVal_val_detail = JSON.parse(retVal.val);
                    console.log(retVal_val_detail);

                    if(retVal_code_detail == 200){
                        gwvmEtcHostIp('nfs');
                        ServiceQuota('nfs');
                            if(retVal_val_status[0].status.running == 1){

                                $('#nfs-path').text("/fs");
                                $('#nfs-mount-path').text(retVal_val_detail.path);
                                $('#nfs-status').text("Health OK");
                                $('#nfs-color').attr('class','pf-c-label pf-m-green');
                                $('#nfs-icon').attr('class','fas fa-fw fas fa-fw fa-check-circle');
                                $('#nfs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-enabled');
                                $('#menu-item-set-nfs-construction').hide();
                                $('#menu-item-set-nfs-delete').show();
                            }
                            else{

                                $('#nfs-path').text("/fs");
                                $('#nfs-mount-path').text(retVal_val_detail.path);
                                $('#nfs-status').text("Stop");
                                $('#nfs-color').attr('class','pf-c-label pf-m-red');
                                $('#nfs-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                                $('#nfs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-enabled');
                                $('#menu-item-set-nfs-construction').hide();
                                $('#menu-item-set-nfs-delete').show();
                            }
                    }
                    else{
                        cleanNfsInfo();
                        $('#nfs-status').text("Health Err");
                        $('#nfs-color').attr('class','pf-c-label pf-m-red');
                        $('#nfs-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                        $('#nfs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-disabled');
                        $("#form-select-file-system-service-control option[value=nfs]").hide();
                        $('#menu-item-set-nfs-construction').show();
                        $('#menu-item-set-nfs-delete').hide();
                    }
                }).catch(function(){
                    createLoggerInfo("NFS status 조회 실패");
                });
            }
        }
        else{
            cleanNfsInfo();
            $('#nfs-status').text("Health Err");
            $('#nfs-color').attr('class','pf-c-label pf-m-red');
            $('#nfs-icon').attr('class','fas fa-fw fa-exclamation-triangle');
            $('#nfs-edit').attr('class','pf-c-dropdown__toggle pf-m-plain pf-m-disabled');
            $("#form-select-file-system-service-control option[value=nfs]").hide();
            $('#menu-item-set-nfs-construction').show();
            $('#menu-item-set-nfs-delete').hide();
        }
    }).catch(function(){
        createLoggerInfo("NFS detail 조회 실패");
    });

}
/**
 * Meathod Name : ServiceQuota
 * Date Created : 2023.09.05
 * Writer  : 정민철
 * Description : 스토리지 서비스 사용량 확인
 * Parameter : type
 * Return  : 없음
 * History  : 2023.09.05 최초 작성
 */
function ServiceQuota(type){

    if (type == 'smb'){
        cockpit.spawn(['python3', pluginpath + '/python/glue/smb.py','smb-quota']).then(function(data){
            var retVal = JSON.parse(data);
            if(retVal.code == 200){
                $('#smb-usage').text(retVal.val.usage+"B/"+Byte(retVal.val.quota));

            }
        });
    }else if(type == 'gluefs'){
        cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py', 'gluefs-quota']).then(function(data){
            var retVal = JSON.parse(data);
            if(retVal.code == 200){
                $('#gluefs-usage').text(retVal.val.usage+"B/"+Byte(retVal.val.quota));
                $('#gluefs-path').text(retVal.val.fs_path);
            }
        });
    }else if(type == 'nfs'){
        cockpit.spawn(['python3', pluginpath + '/python/glue/nfs.py', 'nfs-quota']).then(function(data){
            var retVal = JSON.parse(data);
            if(retVal.code == 200){
                $('#nfs-usage').text(retVal.val.usage+"B/"+Byte(retVal.val.quota));
            }
        });
    }
}
/**
 * Meathod Name : gwvmEtcHostIp
 * Date Created : 2023.08.30
 * Writer  : 정민철
 * Description : gluefs, nfs 접근 IP 구성
 * Parameter : type
 * Return  : 없음
 * History  : 2023.08.30 최초 작성
 */
function gwvmEtcHostIp(type){
     cockpit.spawn(['grep','gwvm-mngt','/etc/hosts']).then(function(data){
        var ip = data.split('\t');
            if(type == 'gluefs'){
                $('#gluefs-access-ip').text(ip[0]);
            }else if(type == 'nfs'){
                $('#nfs-access-ip').text(ip[0]);
            }
    });
}
/**
 * Meathod Name : cleanNfsInfo
 * Date Created : 2023.08.30
 * Writer  : 정민철
 * Description : nfs 구성 초기화
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.08.30 최초 작성
 */
function cleanNfsInfo(){
    $('#nfs-path').text("N/A");
    $('#nfs-mount-path').text("N/A");
    $('#nfs-access-ip').text("N/A");
    $('#nfs-usage').text("N/A");
}
/**
 * Meathod Name : Byte
 * Date Created : 2023.08.30
 * Writer  : 정민철
 * Description : 용량 숫자를 단위에 맞춰 byte단위로 변경하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.08.30 최초 작성
 */
function Byte(size){
    var ret_byte
    var ret_byte_name


    if(size < (1024*1024))
    {
        ret_byte = parseFloat(size)/1024;
        ret_byte_name = "KB";
    }
    else if (size < (1024*1024*1024))
    {
        ret_byte = parseFloat(size)/(1024*1024);
        ret_byte_name = "MB";
    }
    else if (size < (1024*1024*1024*1024)){
        ret_byte = parseFloat(size)/(1024*1024*1024);
        ret_byte_name = "GB";
    }
    else if (size < (1024*1024*1024*1024*1024)){
        ret_byte = parseFloat(size)/(1024*1024*1024*1024);
        ret_byte_name = "TB";
    }

    var bytes = parseInt(ret_byte);

    return (bytes + ret_byte_name);

}
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
        console.log(retVal)
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
