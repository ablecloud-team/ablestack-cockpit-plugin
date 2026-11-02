/**
 * File Name : smb.js
 * Date Created : 2024.02.22
 * Writer : 배태주
 * Description : smb service, user 관련 발생하는 이벤트 처리를 위한 JavaScript
**/

function smbServiceList(){
  //조회
  $('#button-smb-service-search').html("<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
  var api_url = 'https://'+glue_api_ip+':'+glue_api_port;
  Promise.all([fetch(api_url+'/api/v1/smb',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()),
  fetch(api_url+'/api/v1/glue/hosts', { method: 'GET' })
    .then(res => {
      if (!res.ok) throw new Error('호스트 IP 조회 실패');
      return res.json();
    })
    .catch(function(error){
      console.log('SMB 스토리지 IP 조회 실패: '+error);
      return [];
    })
  ]).then(function(results){
    var data = results[0];
    var hosts = Array.isArray(results[1]) ? results[1] : [];
    $('#smb-service-list tr').remove();

    for(var i=0; i < data.length; i++){
      console.log(data[i]);
      if(!(data[i] == null || data[i] == undefined || data[i] == NaN || data[i] == "" || data[i] == 'null')){
        let insert_tr = "";
  
        var user_cnt = "-";
        if(data[i].users!=null){
          user_cnt = data[i].users.length
        }

        var folder_name = "-";
        var path = "-";
        var volume_path = "-";
        var mount_yn = "-";
        if(data[i].path_list != undefined){
          path_list = Object.keys(data[i].path_list);
          for(var j=0; j<Object.keys(data[i].path_list).length; j++){
            if(j == 0){
              if(data[i].path_list[path_list[j]].mount_yn == "true"){
                mount_yn = "OK";
              } else {
                mount_yn = "No mount";
              }

              folder_name = path_list[j];
              // fs mount 경로 = path
              path = data[i].path_list[path_list[j]].path+" ("+mount_yn+")";
              // fs 경로 = voluem_path
              volume_path = data[i].path_list[path_list[j]].path;
            }else{
              if(data[i].path_list[path_list[j]].mount_yn == "true"){
                mount_yn = "OK";
              } else {
                mount_yn = "No mount";
              }

              folder_name += "<br/>"+path_list[j];
              // fs mount 경로 = path
              path += "<br/>"+data[i].path_list[path_list[j]].path+" ("+mount_yn+")";
              // fs 경로 = voluem_path
              volume_path += "<br/>"+data[i].path_list[path_list[j]].path;
            }
          }
        }

        insert_tr += '<tr role="row">';
        insert_tr += '  <td role="cell" data-label="호스트">'+data[i].hostname+'</td>';
        var host = hosts.find(function(host){
          return host && host.hostname === data[i].hostname;
        });
        var ip_cell = $('<span>').text(data[i].ip_address).html();
        if(host && host.addr && host.addr !== data[i].ip_address){
          ip_cell += ' (관리)<br/>'+$('<span>').text(host.addr).html()+' (스토리지)';
        }
        insert_tr += '  <td role="cell" data-label="IP">'+ip_cell+'</td>';
        insert_tr += '  <td role="cell" data-label="상태">'+data[i].status+'</td>';
        insert_tr += '  <td role="cell" data-label="보안 타입">'+data[i].security_type+'</td>';
        if(data[i].security_type == 'normal'){
          insert_tr += '  <td role="cell" data-label="유저 수">'+user_cnt+'</td>';
        }else{
          insert_tr += '  <td role="cell" data-label="유저 수">-</td>';
        }
        insert_tr += '  <td role="cell" data-label="SMB 공유 폴더">'+folder_name+'</td>';
        insert_tr += '  <td role="cell" data-label="SMB 마운트 경로 (상태)">'+path+'</td>';
        insert_tr += '  <td role="cell" data-label="GlueFS 경로({FS 이름}/{볼륨 경로})">'+volume_path+'</td>';

        // insert_tr += '  <td role="cell" data-label="PORT" id="smb-service-volume-path">'+volume_path+'</td>';
        insert_tr += '  <td class="pf-v6-c-table__icon" role="cell" data-label="편집">';
        insert_tr += '    <div class="ablestack-menu-dropdown">';
        insert_tr += '      <button class="pf-v6-c-menu-toggle pf-m-plain" id="card-action-smb-service-status'+i+'" aria-expanded="false" type="button" aria-label="Actions">';
        insert_tr += '        <i class="fas fa-ellipsis-v" aria-hidden="true"></i>';
        insert_tr += '      </button>';
        insert_tr += '      <ul class="pf-v6-c-menu ablestack-menu pf-m-align-right" aria-labelledby="card-action-smb-service-status'+i+'" id="dropdown-menu-card-action-smb-service-status'+i+'">';
        insert_tr += '        <li>';
        if(data[i].security_type == 'normal'){
          if(data[i].status == 'active'){
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbServiceDelete("'+data[i].hostname+'")\' >SMB 서비스 삭제</button>';
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbFolderCreate("'+data[i].hostname+'",'+JSON.stringify(data[i].path_list)+')\' >공유 폴더 추가</button>';
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbFolderDelete("'+data[i].hostname+'",'+JSON.stringify(data[i].path_list)+')\' >공유 폴더 삭제</button>';
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbUserList("'+data[i].users+'")\' >유저 목록</button>';
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbUserCreate("'+data[i].hostname+'")\' >유저 생성</button>';
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbUserPasswdUpdate("'+data[i].hostname+'","'+data[i].users+'")\' >유저 비밀번호 변경</button>';
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbUserDelete("'+data[i].hostname+'","'+data[i].users+'")\' >유저 삭제</button>';
          }else{
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbServiceCreate("'+data[i].hostname+'")\' >SMB 서비스 구성</button>';
          }
        }else if(data[i].security_type == 'ads'){
          if(data[i].status[0] == 'active'){
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbServiceDelete("'+data[i].hostname+'")\' >SMB 서비스 삭제</button>';
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbFolderCreate("'+data[i].hostname+'",'+JSON.stringify(data[i].path_list)+')\' >공유 폴더 추가</button>';
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbFolderDelete("'+data[i].hostname+'",'+JSON.stringify(data[i].path_list)+')\' >공유 폴더 삭제</button>';
          }else{
            insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-set-smb-service-remove" onclick=\'smbServiceCreate("'+data[i].hostname+'")\' >SMB 서비스 구성</button>';
          }
        }
        insert_tr += '        </li>';
        insert_tr += '      </ul>';
        insert_tr += '    </div>';
        insert_tr += '  </td>';
        insert_tr += '</tr>';
    
        $("#smb-service-list:last").append(insert_tr);
        $('#dropdown-menu-card-action-smb-service-status'+i).hide();
      }
    }

    $('#button-smb-service-search').html("<i class='fas fa-fw fa-redo' aria-hidden='true'></i>");
  }).catch(function(data){
    console.log("error : "+data);
    //조회되는 데이터가 없음
    noList("smb-service-list",9);
    // $('#smb-service-list tr').remove();
    $('#button-smb-service-search').html("<i class='fas fa-fw fa-redo' aria-hidden='true'></i>");
  });
}

$('#form-select-smb-gluefs-path').on('change', function(){
  $('#form-input-smb-actual-shared-path').val("/"+$('#form-select-smb-gluefs-name').val()+$('#form-select-smb-gluefs-path').val())
});

$('#form-select-smb-folder-gluefs-path').on('change', function(){
  $('#form-input-smb-folder-actual-shared-path').val("/"+$('#form-select-smb-folder-gluefs-name').val()+$('#form-select-smb-folder-gluefs-path').val())
});

/** smb-service search 관련 action start */
$('#button-smb-service-search').on('click', function(){
  smbServiceList();
});
/** smb service search 관련 action end */

/** SMB Service create 관련 action start */
function smbServiceCreate(hostname){
  setSmbHostInput("single");
  smbServiceCreateInitInputValue();
  $('#form-input-smb-hostname').val(hostname);
  setGlueFsSelectBox("form-select-smb-gluefs-name","form-select-smb-gluefs-path");
  $('#div-modal-create-smb-service').show();
}

$('#button-smb-service-multi-create').on('click', function(){
  setSmbHostInput("multi");
  smbServiceCreateInitInputValue();
  setSelectHostsCheckbox('div-smb-glue-hosts-list','form-input-smb-placement-hosts');
  setGlueFsSelectBox("form-select-smb-gluefs-name","form-select-smb-gluefs-path");
  $('#div-modal-create-smb-service').show();
});

$('#button-close-modal-create-smb-service').on('click', function(){
  $('#div-modal-create-smb-service').hide();
});

$('#button-cancel-modal-create-smb-service').on('click', function(){
  $('#div-modal-create-smb-service').hide();
});

$('#button-execution-modal-create-smb-service').on('click', function(){
  if(smbServiceCreateValidateCheck()){
    var folder_name = $('#form-input-smb-share-folder-name').val();
    var path = $('#form-input-smb-actual-shared-path').val();
    var fs_name = $('#form-select-smb-gluefs-name option:selected').val();
    var volume_path = $('#form-select-smb-gluefs-path option:selected').val();
    var cache_policy = $('#form-select-smb-csc-policy option:selected').val();
    
    var body_val = "folder_name="+folder_name+"&path="+path+"&fs_name="+fs_name+"&volume_path="+volume_path+"&cache_policy="+cache_policy
    
    var create_type = $('#smb-service-create-type').val();
    if (create_type == "multi") {
      $('input[type=checkbox][name="glue-hosts-list"]').each(function() {
        if(this.checked){
          body_val += "&hosts="+this.value;
        }
      });
    }else{
      var hosts = $('#form-input-smb-hostname').val();
      body_val += "&hosts="+hosts
    }    

    var yn_bool = $('input[type=checkbox][id="form-checkbox-smb-ad-use-yn"]').is(":checked");
    if(yn_bool){
      var ad_username = $('#form-input-smb-ad-user-name').val();
      var ad_password = $('#form-input-smb-ad-user-password').val();
      var realm = $('#form-input-smb-ad-realm').val();
      var dns = $('#form-input-smb-ad-dns').val();
      var sec_type = "ads";
      body_val += "&username="+ad_username+"&password="+ad_password+"&realm="+realm+"&dns="+dns+"&sec_type="+sec_type
    }else{
      var username = $('#form-input-smb-user-name').val(); 
      var password = $('#form-input-smb-user-password').val();
      var sec_type = "normal";
      body_val += "&username="+username+"&password="+password+"&sec_type="+sec_type
    }
    
    $('#div-modal-create-smb-service').hide();
    $('#div-modal-spinner-header-txt').text('SMB Service를 생성하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("SMB Service 생성 실패");
    $("#modal-status-alert-body").html("SMB Service 생성을 실패하였습니다.");
  
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/smb',{
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body_val
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("SMB Service 생성 완료");
        $("#modal-status-alert-body").html("SMB Service 생성을 완료하였습니다.<br/>새로고침 버튼을 클릭하여 서비스 상태를 확인할 수 있습니다.");
        $('#div-modal-status-alert').show();
        smbServiceList();
        createLoggerInfo("SMB Service create success");
      }else if(data.code == 500){
        $("#modal-status-alert-body").html("SMB Service 생성을 실패하였습니다.<br/>AD 정보를 확인해 주세요.");
        $('#div-modal-status-alert').show();
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("SMB Service create error : "+ data);
      console.log('button-execution-modal-create-smb-service : '+data);
    });
  }
});
/** SMB Service create 관련 action end */

/** SMB Service delete 관련 action start */
function smbServiceDelete(hostname){
  $('#input-checkbox-smb-service-remove').prop('checked',false);
  $('#div-modal-remove-smb-service').show();
  $('#smb-service-hostname').val(hostname);
  $('#smb-service-text').text('선택하신 '+hostname+' 을(를) 삭제하시겠습니까?');
}

$('#menu-item-smb-service-remove').on('click', function(){
  $('#div-modal-remove-smb-service').show();
});

$('#button-close-modal-remove-smb-service').on('click', function(){
  $('#div-modal-remove-smb-service').hide();
});

$('#button-cancel-modal-remove-smb-service').on('click', function(){
  $('#div-modal-remove-smb-service').hide();
});

$('#button-execution-modal-remove-smb-service').on('click', function(){
  if($('#input-checkbox-smb-service-remove').is(":checked")){
    var hosts = $('#smb-service-hostname').val()
    
    $('#div-modal-remove-smb-service').hide();
    $('#div-modal-spinner-header-txt').text('SMB Service를 삭제하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("SMB Service 삭제 실패");
    $("#modal-status-alert-body").html("SMB Service 삭제를 실패하였습니다.");
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/smb?hosts='+hosts,{
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("SMB Service 삭제 완료");
        $("#modal-status-alert-body").html("SMB Service 삭제를 완료하였습니다.");
        $('#div-modal-status-alert').show();
        smbServiceList();
        createLoggerInfo("SMB Service remove success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("SMB Service remove error : "+ data);
      console.log('button-execution-modal-remove-smb-service : '+data);
    });
  }else{
    alert("삭제 여부를 체크해주세요.");
  }
});
/** SMB Service delete 관련 action end */

/** SMB Folder create 관련 action start */
function smbFolderCreate(hostname, path){
  setSmbFolderHostInput("single");
  smbFolderCreateInitInputValue();
  $('#form-input-smb-folder-hostname').val(hostname);
  $('#form-input-smb-folder-path-json').val(JSON.stringify(path));
  setGlueFsSelectBox("form-select-smb-folder-gluefs-name","form-select-smb-folder-gluefs-path");
  $('#div-modal-create-smb-folder').show();
}

$('#button-smb-folder-multi-create').on('click', function(){
  setSmbFolderHostInput("multi");
  smbFolderCreateInitInputValue();
  setSelectHostsCheckbox('div-smb-folder-glue-hosts-list','form-input-smb-folder-placement-hosts');
  setGlueFsSelectBox("form-select-smb-folder-gluefs-name","form-select-smb-folder-gluefs-path");
  $('#div-modal-create-smb-folder').show();
});

$('#button-close-modal-create-smb-folder').on('click', function(){
  $('#div-modal-create-smb-folder').hide();
});

$('#button-cancel-modal-create-smb-folder').on('click', function(){
  $('#div-modal-create-smb-folder').hide();
});

$('#button-execution-modal-create-smb-folder').on('click', function(){
  if(smbFolderCreateValidateCheck()){
    var folder_name = $('#form-input-smb-folder-share-folder-name').val();
    var path = $('#form-input-smb-folder-actual-shared-path').val();
    var fs_name = $('#form-select-smb-folder-gluefs-name option:selected').val();
    var volume_path = $('#form-select-smb-folder-gluefs-path option:selected').val();
    var cache_policy = $('#form-select-smb-folder-csc-policy option:selected').val();
    
    var body_val = "folder_name="+folder_name+"&path="+path+"&fs_name="+fs_name+"&volume_path="+volume_path+"&cache_policy="+cache_policy
    
    var create_type = $('#smb-folder-create-type').val();
    if (create_type == "multi") {
      $('input[type=checkbox][name="glue-hosts-list"]').each(function() {
        if(this.checked){
          body_val += "&hosts="+this.value;
        }
      });
    }else{
      var hosts = $('#form-input-smb-folder-hostname').val();
      body_val += "&hosts="+hosts
    }

    $('#div-modal-create-smb-folder').hide();
    $('#div-modal-spinner-header-txt').text('SMB 폴더를 생성하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("SMB 폴더 생성 실패");
    $("#modal-status-alert-body").html("SMB 폴더 생성을 실패하였습니다.");
  
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/smb/folder',{
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body_val
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("SMB 폴더 생성 완료");
        $("#modal-status-alert-body").html("SMB 폴더 생성을 완료하였습니다.");
        $('#div-modal-status-alert').show();
        smbServiceList();
        createLoggerInfo("SMB Folder create success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("SMB Folder create error : "+ data);
      console.log('button-execution-modal-create-smb- : '+data);
    });
  }
});
/** SMB Folder create 관련 action end */

/** SMB Folder delete 관련 action start */
function smbFolderDelete(hostname, path){
  
  $('#smb-folder-remove-hostname').val(hostname);
  setSmbFolderSelectBox("form-select-remove-smb-folder",path)
  
  $('#div-modal-remove-smb-folder').show();
}

$('#menu-item-smb-folder-remove').on('click', function(){
  $('#div-modal-remove-smb-folder').show();
});

$('#button-close-modal-remove-smb-folder').on('click', function(){
  $('#div-modal-remove-smb-folder').hide();
});

$('#button-cancel-modal-remove-smb-folder').on('click', function(){
  $('#div-modal-remove-smb-folder').hide();
});

$('#button-execution-modal-remove-smb-folder').on('click', function(){
  if(smbFolderDeleteValidateCheck()){
    var hosts = $('#smb-folder-remove-hostname').val()
    var folder_name = $('select#form-select-remove-smb-folder option:checked').text();
    var path = $('select#form-select-remove-smb-folder option:checked').val();
    // path = /gluefs/volumes/smb -> 첫번째 gluefs 가 fs의 이름임
    var fs_name = path.split("/")[1];

    $('#div-modal-remove-smb-folder').hide();
    $('#div-modal-spinner-header-txt').text('SMB 폴더를 삭제하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("SMB 폴더 삭제 실패");
    $("#modal-status-alert-body").html("SMB 폴더 삭제를 실패하였습니다.");
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/smb/folder?hosts='+hosts+'&folder_name='+folder_name+'&path='+path+'&fs_name='+fs_name,{
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("SMB 폴더 삭제 완료");
        $("#modal-status-alert-body").html("SMB 폴더 삭제를 완료하였습니다.");
        $('#div-modal-status-alert').show();
        smbServiceList();
        createLoggerInfo("SMB Folder remove success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("SMB Folder remove error : "+ data);
      console.log('button-execution-modal-remove-smb-folder : '+data);
    });
  }
});
/** SMB Folder delete 관련 action end */

/** SMB User List 관련 action start */
function smbUserList(users){
  $('#smb-user-list tr').remove();
  if(users!=null){
    var user_list = users.split(",")
    var insert_tr = "";
    for(var i=0; i < user_list.length; i++){
      insert_tr += '<tr role="row">';
      insert_tr += '  <td role="cell" data-label="사용자 이름" >'+user_list[i]+'</td>';
      insert_tr += '</tr>';
    }
    $("#smb-user-list:last").append(insert_tr);
  }else{
    noList("smb-user-list",1);
  }
  $('#div-modal-search-smb-user').show();
}

$('#button-close-modal-search-smb-user').on('click', function(){
  $('#div-modal-search-smb-user').hide();
});

$('#button-cancel-modal-search-smb-user').on('click', function(){
  $('#div-modal-search-smb-user').hide();
});

/** SMB User List 관련 action end */


/** SMB User create 관련 action start */
function smbUserCreate(hostname){
  smbUserCreateInitInputValue();
  $('#div-modal-create-smb-user').show();
  $('#form-input-smb-create-user-hostname').val(hostname);
}

$('#button-smb-user-create').on('click', function(){
  $('#div-modal-create-smb-user').show();
});

$('#button-close-modal-create-smb-user').on('click', function(){
  $('#div-modal-create-smb-user').hide();
});

$('#button-cancel-modal-create-smb-user').on('click', function(){
  $('#div-modal-create-smb-user').hide();
});

$('#button-execution-modal-create-smb-user').on('click', function(){
  if(smbUserCreateValidateCheck()){
    var hosts = $('#form-input-smb-create-user-hostname').val();
    var username = $('#form-input-smb-create-user-name').val();
    var password = $('#form-input-smb-create-user-password').val();
  
    var body_val = "hosts="+hosts+"&username="+username+"&password="+password  
    
    $('#div-modal-create-smb-user').hide();
    $('#div-modal-spinner-header-txt').text('SMB User를 생성하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("SMB User 생성 실패");
    $("#modal-status-alert-body").html("SMB User 생성을 실패하였습니다.");
  
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/smb/user',{
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body_val
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("SMB User 생성 완료");
        $("#modal-status-alert-body").html("SMB User 생성을 완료하였습니다.");
        $('#div-modal-status-alert').show();
        smbServiceList();
        createLoggerInfo("SMB User create success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("SMB User create error : "+ data);
      console.log('button-execution-modal-create-smb-user : '+data);
    });
  }
});
/** SMB User create 관련 action end */

/** SMB User update 관련 action start */
function smbUserPasswdUpdate(hostname, users){
  smbUserPasswordUpdateInitInputValue();
  $('#smb-update-user-hostname').val(hostname);
  setSmbUserSelectBox("form-select-update-smb-user",users)
  
  $('#div-modal-update-smb-user').show();
}

$('#menu-item-smb-user-update').on('click', function(){
  $('#div-modal-update-smb-user').show();
});

$('#button-close-modal-update-smb-user').on('click', function(){
  $('#div-modal-update-smb-user').hide();
});

$('#button-cancel-modal-update-smb-user').on('click', function(){
  $('#div-modal-update-smb-user').hide();
});

$('#button-execution-modal-update-smb-user').on('click', function(){
  if(smbUserUpdateValidateCheck()){
    var hosts = $('#smb-update-user-hostname').val();
    var username = $('select#form-select-update-smb-user option:checked').val();
    var password = $('#form-input-update-smb-user-password').val();
  
    var body_val = "hosts="+hosts+"&username="+username+"&password="+password
  
    $('#div-modal-update-smb-user').hide();
    $('#div-modal-spinner-header-txt').text('SMB User 비밀번호를 변경하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("SMB User 비밀번호 변경 실패");
    $("#modal-status-alert-body").html("SMB User 비밀번호 변경을 실패하였습니다.");
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/smb/user',{
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body_val
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("SMB User 비밀번호 변경 완료");
        $("#modal-status-alert-body").html("SMB User 비밀번호 변경을 완료하였습니다.");
        $('#div-modal-status-alert').show();
        smbServiceList();
        createLoggerInfo("SMB User update success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("SMB User update error : "+ data);
      console.log('button-execution-modal-update-smb-user : '+data);
    });
  }
});
/** SMB User update 관련 action end */

/** SMB User delete 관련 action start */
function smbUserDelete(hostname, users){
  $('#smb-user-remove-hostname').val(hostname);
  setSmbUserSelectBox("form-select-remove-smb-user",users)
  
  $('#div-modal-remove-smb-user').show();
}

$('#menu-item-smb-user-remove').on('click', function(){
  $('#div-modal-remove-smb-user').show();
});

$('#button-close-modal-remove-smb-user').on('click', function(){
  $('#div-modal-remove-smb-user').hide();
});

$('#button-cancel-modal-remove-smb-user').on('click', function(){
  $('#div-modal-remove-smb-user').hide();
});

$('#button-execution-modal-remove-smb-user').on('click', function(){
  if(smbUserDeleteValidateCheck()){
    var hosts = $('#smb-user-remove-hostname').val()
    var username = $('select#form-select-remove-smb-user option:checked').val();
    
    $('#div-modal-remove-smb-user').hide();
    $('#div-modal-spinner-header-txt').text('SMB User를 삭제하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("SMB User 삭제 실패");
    $("#modal-status-alert-body").html("SMB User 삭제를 실패하였습니다.");
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/smb/user?hosts='+hosts+'&username='+username,{
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("SMB User 삭제 완료");
        $("#modal-status-alert-body").html("SMB User 삭제를 완료하였습니다.");
        $('#div-modal-status-alert').show();
        smbServiceList();
        createLoggerInfo("SMB User remove success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("SMB User remove error : "+ data);
      console.log('button-execution-modal-remove-smb-user : '+data);
    });
  }
});
/** SMB User delete 관련 action end */

// smb 생성 입력값 초기화
function smbServiceCreateInitInputValue(){
  $('#form-input-smb-share-folder-name').val("");
  $('#form-select-smb-csc-policy').val("true");
  $('#form-input-smb-user-name').val("");
  $('#form-input-smb-user-password').val("");
  $('#form-input-smb-actual-shared-path').val("");

  var init_txt = '<option value="" selected>선택하십시오.</option>';
  $('#form-select-smb-gluefs-name option').remove();
  $('#form-select-smb-gluefs-name:last').append(init_txt);
  $('#form-select-smb-gluefs-path option').remove();
  $('#form-select-smb-gluefs-path:last').append(init_txt);

  $('#form-input-smb-ad-user-name').val("");
  $('#form-input-smb-ad-user-password').val("");
  $('#form-input-smb-ad-realm').val("");
  $('#form-input-smb-ad-dns').val("");

  $('input[type=checkbox][id="form-checkbox-smb-ad-use-yn"]').prop("checked", false);
  setSmbAdUse();
}

// smb 폴더 생성 입력값 초기화
function smbFolderCreateInitInputValue(){
  $('#form-input-smb-folder-share-folder-name').val("");
  $('#form-select-smb-folder-csc-policy').val("true");
  $('#form-input-smb-folder-actual-shared-path').val("");

  var init_txt = '<option value="" selected>선택하십시오.</option>';
  $('#form-select-smb-folder-gluefs-name option').remove();
  $('#form-select-smb-folder-gluefs-name:last').append(init_txt);
  $('#form-select-smb-folder-gluefs-path option').remove();
  $('#form-select-smb-folder-gluefs-path:last').append(init_txt);
}

// smb user 생성 입력값 초기화
function smbUserCreateInitInputValue(){
  $('#form-input-smb-create-user-name').val("");
  $('#form-input-smb-create-user-password').val("");
}

// smb user 비밀번호 변경 입력값 초기화
function smbUserPasswordUpdateInitInputValue(){
  $('#form-input-update-smb-user-password').val("");
  $('#form-input-update-smb-user-password-confirm').val("");
}

function setSmbHostInput(type){
  if(type == "multi"){
    $('#span-header-create-smb-service').text("SMB Service 다중 생성");
    $('#div-smb-multi-host').show();
    $('#div-smb-single-host').hide();
    $('#div-smb-multi-create-info').show();

  }else if(type == "single"){
    $('#span-header-create-smb-service').text("SMB Service 생성");
    $('#div-smb-multi-host').hide();
    $('#div-smb-single-host').show();
    $('#div-smb-multi-create-info').hide();
  }
  $('#smb-service-create-type').val(type);
}

function setSmbFolderHostInput(type){
  if(type == "multi"){
    $('#span-header-create-smb-folder').text("SMB 폴더 다중 생성");
    $('#div-smb-folder-multi-host').show();
    $('#div-smb-folder-single-host').hide();
    // $('#div-smb-folder-multi-create-info').show();

  }else if(type == "single"){
    $('#span-header-create-smb-service').text("SMB 폴더 생성");
    $('#div-smb-folder-multi-host').hide();
    $('#div-smb-folder-single-host').show();
    // $('#div-smb-multi-create-info').hide();
  }
  $('#smb-folder-create-type').val(type);
}


$('#form-checkbox-smb-ad-use-yn').on('change', function(){
  setSmbAdUse();
});

function setSmbAdUse(){
  var yn_bool = $('input[type=checkbox][id="form-checkbox-smb-ad-use-yn"]').is(":checked");
  if(yn_bool){
    $('#div-smb-user-name').hide();
    $('#div-smb-user-password').hide();
    $('#div-smb-ad-user-name').show();
    $('#div-smb-ad-user-password').show();
    $('#div-smb-ad-realm').show();
    $('#div-smb-ad-dns').show();
  }else{
    $('#div-smb-user-name').show();
    $('#div-smb-user-password').show();
    $('#div-smb-ad-user-name').hide();
    $('#div-smb-ad-user-password').hide();
    $('#div-smb-ad-realm').hide();
    $('#div-smb-ad-dns').hide();
  }
}

function smbServiceCreateValidateCheck(){
  var validate_check = true;

  var create_type = $('#smb-service-create-type').val();
  var host_cnt = $('input[type=checkbox][name="glue-hosts-list"]:checked').length

  var folder_name = $('#form-input-smb-share-folder-name').val();
  var username = $('#form-input-smb-user-name').val();
  var password = $('#form-input-smb-user-password').val();
  var fs_name = $('#form-select-smb-gluefs-name option:selected').val();
  var volume_path = $('#form-select-smb-gluefs-path option:selected').val();

  var yn_bool = $('input[type=checkbox][id="form-checkbox-smb-ad-use-yn"]').is(":checked");
  var ad_username = $('#form-input-smb-ad-user-name').val();
  var ad_password = $('#form-input-smb-ad-user-password').val();
  var ad_realm = $('#form-input-smb-ad-realm').val();
  var ad_dns = $('#form-input-smb-ad-dns').val();

  if (create_type == "multi" && host_cnt == 0) {
    alert("배치 호스트를 선택해주세요.");
    validate_check = false;
  } else if (folder_name == "") {
    alert("SMB 공유 폴더 명을 입력해주세요.");
    validate_check = false;
  } else if(!nameCheck(folder_name)) {
    alert("SMB 공유 폴더 명 생성 규칙은 영문, 숫자 특수문자 '-','_' 만 입력 가능합니다.");
    validate_check = false;
  } else if (fs_name == "") {
    alert("GlueFS 이름을 선택해주세요.");
    validate_check = false;
  } else if (volume_path == undefined || volume_path == "") {
    alert("GlueFS 경로를 선택해주세요.");
    validate_check = false;
  } else if (yn_bool){
    if (ad_username == "") {
      alert("AD User 이름을 입력해주세요.");
      validate_check = false;
    } else if (ad_password == "") {
      alert("AD User 비밀번호를 입력해주세요.");
      validate_check = false;
    } else if (ad_realm == "") {
      alert("AD Realm을 입력해주세요.");
      validate_check = false;
    } else if (ad_dns == "") {
      alert("AD DNS IP를 입력해주세요.");
      validate_check = false;
    } else if (!checkIp(ad_dns)){
      alert("AD DNS IP 유형이 올바르지 않습니다.");
      validate_check = true;
      return false;
    }
  }else{
    if (username == "") {
      alert("사용자 이름을 입력해주세요.");
      validate_check = false;
    } else if (!nameCheck(username)) {
      alert("사용자 이름 생성 규칙은 영문, 숫자 특수문자 '-','_' 만 입력 가능하고 영문으로 시작해야 합니다.");
      validate_check = false;
    } else if (unavailableIdCheck(username)) {
      alert(username+" 은(는) 사용할 수 없는 사용자 명입니다.");
      validate_check = false;
    } else if (password == "") {
      alert("비밀번호를 입력해주세요.");
      validate_check = false;
    }
  } 
  return validate_check;
}

function smbFolderCreateValidateCheck(){
  var validate_check = true;

  var create_type = $('#smb-folder-create-type').val();
  var host_cnt = $('input[type=checkbox][name="glue-hosts-list"]:checked').length

  var folder_name = $('#form-input-smb-folder-share-folder-name').val();
  var fs_name = $('#form-select-smb-folder-gluefs-name option:selected').val();
  var volume_path = $('#form-select-smb-folder-gluefs-path option:selected').val();
  var path = $('#form-input-smb-folder-actual-shared-path').val();
  var path_json_data = JSON.parse($('#form-input-smb-folder-path-json').val());

  if (create_type == "multi" && host_cnt == 0) {
    alert("배치 호스트를 선택해주세요.");
    validate_check = false;
  } else if (folder_name == "") {
    alert("SMB 공유 폴더 명을 입력해주세요.");
    validate_check = false;
  } else if(!nameCheck(folder_name)) {
    alert("SMB 공유 폴더 명 생성 규칙은 영문, 숫자 특수문자 '-','_' 만 입력 가능합니다.");
    validate_check = false;
  } else if (fs_name == "") {
    alert("GlueFS 이름을 선택해주세요.");
    validate_check = false;
  } else if (volume_path == undefined || volume_path == "") {
    alert("GlueFS 경로를 선택해주세요.");
    validate_check = false;
  } else if (Object.keys(path_json_data).length > 0) { // 빈값이면 아니면서
    var path_list = Object.keys(path_json_data);
    console.log(path_list)
    for(var i=0; i<Object.keys(path_json_data).length; i++){
      folder_name_chkval = path_list[i];
      // fs mount 경로 = path
      path_chkval = path_json_data[path_list[i]].path;

      if(folder_name == folder_name_chkval){
        alert("이미 사용중인 공유 폴더명 입니다.");
        validate_check = false;
        break;
      }else if(path == path_chkval){
        alert("이미 사용중인 GlueFS 경로입니다.");
        validate_check = false;
        break;
      }
    }
  }
  
  return validate_check;
}

function smbUserCreateValidateCheck(){
  var validate_check = true;

  var username = $('#form-input-smb-create-user-name').val();
  var password = $('#form-input-smb-create-user-password').val();

  if (username == "") {
    alert("사용자 이름을 입력해주세요.");
    validate_check = false;
  } else if (!nameCheck(username)) {
    alert("사용자 이름 생성 규칙은 영문, 숫자 특수문자 '-','_' 만 입력 가능하고 영문으로 시작해야 합니다.");
    validate_check = false;
  } else if (unavailableIdCheck(username)) {
    alert(username+" 은(는) 사용할 수 없는 사용자 명입니다.");
    validate_check = false;
  } else if (password == "") {
    alert("비밀번호를 입력해주세요.");
    validate_check = false;
  } 
 
  return validate_check;
}

function smbUserUpdateValidateCheck(){
  var validate_check = true;

  var username = $('select#form-select-update-smb-user option:checked').val();
  var password = $('#form-input-update-smb-user-password').val();
  var password_confirm = $('#form-input-update-smb-user-password-confirm').val();

  if (username == "") {
    alert("사용자를 선택해주세요.");
    validate_check = false;
  } else if (!nameCheck(username)) {
    alert("사용자 이름 생성 규칙은 영문, 숫자 특수문자 '-','_' 만 입력 가능하고 영문으로 시작해야 합니다.");
    validate_check = false;
  } else if (password == "") {
    alert("비밀번호를 입력해주세요.");
    validate_check = false;
  } else if (password_confirm == "") {
    alert("비밀번호 확인을 입력해주세요.");
    validate_check = false;
  } else if (password != password_confirm) {
    alert("비밀번호가 일치하지 않습니다.");
    validate_check = false;
  } 
 
  return validate_check;
}

function smbUserDeleteValidateCheck(){
  var validate_check = true;

  var username = $('select#form-select-remove-smb-user option:checked').val();

  if (username == "") {
    alert("사용자를 선택해주세요.");
    validate_check = false;
  }

  return validate_check;
}

function smbFolderDeleteValidateCheck(){
  var validate_check = true;

  var folder = $('select#form-select-remove-smb-folder option:checked').val();

  if (folder == "") {
    alert("공유 폴더를 선택해주세요.");
    validate_check = false;
  }

  return validate_check;
}
