
pluginpath = '/usr/share/cockpit/ablestack'
// nfs 구성 화면 닫기
$('#button-close-modal-nfs-construction, #button-cancel-modal-nfs-construction').on('click',function(){
    $('#div-modal-nfs-construction').hide();
});
// nfs 구성 화면
$('#buttion-create-modal-nfs-construction').on('click',function(){
    var access_type = $('#form-select-nfs-access-type').val();
    var squash = $('#form-select-nfs-squash').val();
    var quota = $('#nfs-construction-max-capacity').val();
    var type = sessionStorage.getItem('type');

    if(type == 'nfs_edit'){
        if(nfsValidateCheck() == true){
        $('#div-modal-nfs-construction').hide();
        $('#div-modal-spinner-header-txt').text('NFS 편집 중');
        $('#div-modal-spinner').show();

        cockpit.spawn(['python3', pluginpath + '/python/glue/nfs.py', 'edit', '--access-type', access_type, '--squash', squash, '--quota', quota]).then(function(data){
            var retVal = JSON.parse(data);
            var retVal_code = JSON.parse(retVal.code);
            $('#div-modal-spinner').hide();
            if(retVal_code == 200){
                $('#modal-status-alert-title').text("NFS 편집");
                $('#modal-status-alert-body').text("NFS 편집되었습니다.");
                $('#div-modal-status-alert').show();
            }
            else{
                $('#modal-status-alert-title').text("NFS 편집");
                $('#modal-status-alert-body').text("NFS 편집이 실패했습니다.");
                $('#div-modal-status-alert').show();
            }
        }).catch(function(){
            createLoggerInfo("NFS 편집 실패");
        });
    }
    }
    else{
        if(nfsValidateCheck() == true){
            $('#div-modal-nfs-construction').hide();
            $('#div-modal-spinner-header-txt').text('NFS 구성 중');
            $('#div-modal-spinner').show();

            cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py', 'config', '--type', 'nfs','--mount-path','/fs/nfs','--quota', quota]).then(function(data){
                var retVal = JSON.parse(data);
                var retVal_code = JSON.parse(retVal.code);
                if(retVal_code == 200){
                    cockpit.spawn(['python3', pluginpath + '/python/glue/nfs.py', 'config']).then(function(data){
                        var retVal = JSON.parse(data);
                        var retVal_code = JSON.parse(retVal.code);
                        if(retVal_code == 200){
                            cockpit.spawn(['python3', pluginpath + '/python/glue/nfs.py', 'create', '--access-type', access_type, '--squash', squash, '--quota', quota]).then(function(data){
                                var retVal = JSON.parse(data);
                                var retVal_code = JSON.parse(retVal.code);
                                $('#div-modal-spinner').hide();
                                if(retVal_code == 200){
                                    $('#div-modal-nfs-construction').hide();
                                    $('#modal-status-alert-title').text("NFS 구성");
                                    $('#modal-status-alert-body').text("NFS 구성이 성공했습니다.");
                                    $('#div-modal-status-alert').show();
                                    $('#menu-item-set-nfs-construction').hide();
                                    $('#menu-item-set-nfs-delete').show();
                                }else{
                                    $('#div-modal-nfs-construction').hide();
                                    $('#modal-status-alert-title').text("NFS 구성");
                                    $('#modal-status-alert-body').text("NFS 구성이 실패했습니다.");
                                    $('#div-modal-status-alert').show();
                                }
                            }).catch(function(){
                                createLoggerInfo("NFS 구성 실패");
                            });
                        }
                        else{
                            $('#div-modal-spinner').hide();
                            $('#div-modal-nfs-construction').hide();
                            $('#modal-status-alert-title').text("NFS 구성");
                            $('#modal-status-alert-body').text("NFS 구성이 실패했습니다.");
                            $('#div-modal-status-alert').show();
                        }
                    }).catch(function(){
                        createLoggerInfo("NFS 구성 실패");
                    });
                }
            else{
                $('#div-modal-nfs-construction').hide();
                $('#modal-status-alert-title').text("NFS 구성");
                $('#modal-status-alert-body').text("NFS 구성이 실패했습니다.");
                $('#div-modal-status-alert').show();
            }
        }).catch(function(){
            createLoggerInfo("NFS 구성 실패");
        });
    }
}
});

// 필수 값 유효성 검사
function nfsValidateCheck(){
    var validate_check = true;

    if($('#form-select-nfs-access-type').val() == ""){
        alert('액세스 유형을 선택해 주세요.');
        validate_check = false;
    }
    else if($('#form-select-nfs-squash').val() == ""){
        alert('squash를 선택해 주세요.');
        validate_check = false;
    }
    return validate_check
}