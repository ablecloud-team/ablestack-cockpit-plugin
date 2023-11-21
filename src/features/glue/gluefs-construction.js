
pluginpath = '/usr/share/cockpit/ablestack'

//gluefs 실행 버튼 클릭 시
$('#buttion-create-modal-gluefs-construction').on('click',function(){
    var mount_path = $('#gluefs-construction-mount-path').val();
    var quota = $('#gluefs-construction-max-capacity').val();
    var option = $('#form-select-gluefs-control').val();
    var type = sessionStorage.getItem('type');

    if(type == 'gluefs_edit'){
        $('#div-modal-gluefs-construction').hide();
        $('#div-modal-spinner-header-txt').text('GlueFS 편집 중');
        $('#div-modal-spinner').show();

        cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py', 'edit', '--mount-path', mount_path, '--quota', quota]).then(function(data){
            var retVal = JSON.parse(data);
            $('#div-modal-spinner').hide();
            if(retVal.code == 200){
            $('#modal-status-alert-title').text('GlueFS 편집');
            $('#modal-status-alert-body').text('GlueFS 편집되었습니다.');
            $('#div-modal-status-alert').show();
            }
        }).catch(function(){
            createLoggerInfo("GlueFS 편집 실패")
        });
    }
    else{
        if(gluefsValidateCheck() == true){
        $('#div-modal-gluefs-construction').hide();
        $('#div-modal-spinner-header-txt').text('GlueFS 구성 중');
        $('#div-modal-spinner').show();


    cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py', "config", "--type", option, "--mount-path", mount_path, "--quota", quota]).then(function(data){
        var retVal = JSON.parse(data);
        var retVal_code = JSON.parse(retVal.code);
        $('#div-modal-spinner').hide();
        if(retVal_code == 200){
            $('#div-modal-gluefs-construction').hide();
            $('#modal-status-alert-title').text('GlueFS 구성');
            $('#modal-status-alert-body').text('GlueFS 구성이 성공했습니다.');
            $('#div-modal-status-alert').show();
            $('#menu-item-set-gluefs-construction').hide();
            $('#menu-item-set-gluefs-delete').show();
        }
        else{
            $('#modal-status-alert-title').text('GlueFS 구성');
            $('#modal-status-alert-body').text('GlueFS 구성이 실패했습니다.');
            $('#div-modal-status-alert').show();
        }
    }).catch(function(){
        createLoggerInfo("GlueFS 구성 실패");
    });
}
}
});

// gluefs 구성 화면 닫기
$('#button-close-modal-gluefs-construction, #button-cancel-modal-gluefs-construction').on('click',function(){
    $('#div-modal-gluefs-construction').hide();
});


// 필수값 유효성 검사
function gluefsValidateCheck(){

    var validate_check = true;

    if($('#form-select-gluefs-control').val() == ""){
        alert("하나의 종류를 선택해주세요.")
        validate_check = false;
    }else if ($('#form-select-gluefs-control').val() == 'gluefs' && $('#gluefs-construction-mount-path').val() == ""){
        alert("mount path를 입력해 주세요.")
        validate_check = false;
    }

    return validate_check
}
