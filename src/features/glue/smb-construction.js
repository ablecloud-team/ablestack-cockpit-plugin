
pluginpath = '/usr/share/cockpit/ablestack';

// smb 구성 화면 닫기
$('#button-cancel-modal-smb-construction, #button-close-modal-smb-construction').on('click',function(){
    $('#div-modal-smb-construction').hide();
});

// smb 구성 클릭 시
$('#buttion-create-modal-smb-construction').on('click',function(){
    var user_name = $('#smb-construction-user').val();
    var user_pw = $('#smb-construction-passwd').val();
    var quota = $('#smb-construction-max-capacity').val();
    var type = sessionStorage.getItem('type');

    if(type == 'smb_edit'){
        $('#div-modal-smb-construction').hide();
        $('#div-modal-spinner-header-txt').text('SMB 편집 중');
        $('#div-modal-spinner').show();

        cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py', 'quota', '--path', '/smb', '--quota', quota]).then(function(data){
            var retVal = JSON.parse(data);
            $('#div-modal-spinner').hide();
            if(retVal.code == 200){
                $('#modal-status-alert-title').text("SMB 편집");
                $('#modal-status-alert-body').text("SMB 편집되었습니다.");
                $('#div-modal-status-alert').show();
            }
            else{
                $('#modal-status-alert-title').text("SMB 편집");
                $('#modal-status-alert-body').text("SMB 편집이 실패했습니다.");
                $('#div-modal-status-alert').show();
            }
        }).catch(function(){
            createLoggerInfo("SMB 편집 실패")
        });
    }
    else{
        if(smbValidateCheck() == true){
        $('#div-modal-smb-construction').hide();
        $('#div-modal-spinner-header-txt').text('SMB 구성 중');
        $('#div-modal-spinner').show();

        cockpit.spawn(['python3', pluginpath + '/python/glue/smb.py','create', '-u', user_name, '-p', user_pw]).then(function(data){
            var retVal = JSON.parse(data);
            if(retVal.code == 200){
                cockpit.spawn(['python3', pluginpath + '/python/glue/gluefs.py','quota','--path','/smb','--quota', quota]).then(function(data){
                    var retVal = JSON.parse(data);

                    $('#div-modal-spinner').hide();

                    if(retVal.code == 200){
                        $('#modal-status-alert-title').text("SMB 구성");
                        $('#modal-status-alert-body').text("SMB 구성이 성공했습니다.");
                        $('#div-modal-status-alert').show();
                        $('#menu-item-set-smb-construction').hide();
                        $('#menu-item-set-smb-delete').show();
                    }
                    else{
                        $('#modal-status-alert-title').text("SMB 구성");
                        $('#modal-status-alert-body').text("SMB 구성이 실패했습니다.");
                        $('#div-modal-status-alert').show();
                    }
                }).catch(function(){
                    $('#modal-status-alert-title').text("SMB 구성");
                    $('#modal-status-alert-body').text("SMB 구성이 실패했습니다.");
                    $('#div-modal-status-alert').show();
                });
            }
        });
    }
}
});

function smbValidateCheck(){

   var validate_check = true;

   if($('#smb-construction-user').val() == ""){
       alert("Samba 유저를 입력해 주세요.");
       validate_check = false;
   }else if($('#smb-construction-passwd').val() == ""){
       alert("Samba 비밀번호를 입력해 주세요.");
       validate_check = false;
   }

   return validate_check
}
