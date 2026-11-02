/**
 * File Name : gluefs.js
 * Date Created : 2024.02.05
 * Writer : 배태주
 * Description : Glue File System 관련 발생하는 이벤트 처리를 위한 JavaScript
**/

function gluefsList(){
  //조회
  $('#gluefs-subvolume-group-list tr').remove();
  $('#button-gluefs-search').html("<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    if(data.list.length != 0){
      $('#gluefs-list tr').remove();
      for(var i=0; i < data.list.length; i++){
        if(i==0){
          gluefsSubvolumeGroupList(data.list[i].name,data.list[i].data_pools)
        }

        let insert_tr = "";
        var used = 0;
        var avail = 0;
        var active = "";
        for(var j=0; j < data.status.pools.length; j++){
          if(data.list[i].data_pools[0] == data.status.pools[j].name){
            used = data.status.pools[j].used
            avail = data.status.pools[j].avail
          }
        }
        
        for(var j=0; j < data.status.mdsmap.length; j++){
          if(data.list[i].name == data.status.mdsmap[j].name.split('.')[0]){
            if(active==""){
              active += data.status.mdsmap[j].state
            }else{
              active += "/"+data.status.mdsmap[j].state
            }
          }
        }
        insert_tr += '<tr role="row">';
        insert_tr += '  <td role="cell" data-label="이름" id="gluefs-name"><a onclick=\'gluefsSubvolumeGroupList("'+data.list[i].name+'","'+data.list[i].data_pools+'")\'>'+data.list[i].name+'</a></td>';
        insert_tr += '  <td role="cell" data-label="상태" id="gluefs-status">'+active+'</td>';
        insert_tr += '  <td role="cell" data-label="사용량" id="gluefs-usage">'+bytesToSize(used)+'</td>';
        insert_tr += '  <td role="cell" data-label="전체용량" id="gluefs-total-capacity">'+bytesToSize(avail)+'</td>';
        insert_tr += '  <td role="cell" data-label="데이터 풀" id="gluefs-data-pool">'+data.list[i].data_pools+'</td>';
        // insert_tr += '  <td role="cell" data-label="메타 데이터 풀" id="gluefs-meta-data-pool">'+data.list[i].metadata_pool+'</td>';
        insert_tr += '  <td class="pf-v6-c-table__icon" role="cell" data-label="편집">';
        insert_tr += '    <div class="ablestack-menu-dropdown">';
        insert_tr += '      <button class="pf-v6-c-menu-toggle pf-m-plain" id="card-action-glue-file-system-status'+i+'" aria-expanded="false" type="button" aria-label="Actions">';
        insert_tr += '        <i class="fas fa-ellipsis-v" aria-hidden="true"></i>';
        insert_tr += '      </button>';
        insert_tr += '      <ul class="pf-v6-c-menu ablestack-menu pf-m-align-right pf-m-disabled" aria-labelledby="card-action-glue-file-system-status'+i+'" id="dropdown-menu-card-action-glue-file-system-status'+i+'">';
        insert_tr += '        <li>';
        insert_tr += '          <button class="pf-v6-c-menu__item" type="button" id="menu-item-gluefs-remove" onclick=\'glueFsDelete("'+data.list[i].name+'")\' >GlueFS 삭제</button>';
        insert_tr += '        </li>';
        insert_tr += '       </ul>';
        insert_tr += '    </div>';
        insert_tr += '  </td>';
        insert_tr += '</tr>';
  
        $("#gluefs-list:last").append(insert_tr);
        $('#dropdown-menu-card-action-glue-file-system-status'+i).hide();
      }
    }else{
      noList("gluefs-list",7);
      noList("gluefs-subvolume-group-list",5);
    }
    $('#button-gluefs-search').html("<i class='fas fa-fw fa-redo' aria-hidden='true'></i>");
  }).catch(function(data){
    console.log("error : "+data);
    noList("gluefs-list",7);
    noList("gluefs-subvolume-group-list",5);
    $('#button-gluefs-search').html("<i class='fas fa-fw fa-redo' aria-hidden='true'></i>");
  });
}

/** glue fs search 관련 action start */
$('#button-gluefs-search').on('click', function(){
  gluefsList();
});
/** glue fs search 관련 action end */

/** glue fs create 관련 action start */
$('#button-gluefs-create').on('click', function(){
  gluefsCreateInitInputValue();
  setSelectHostsCheckbox('div-gluefs-glue-hosts-list','form-input-gluefs-placement-hosts');
  $('#div-modal-create-gluefs').show();
});

$('#button-close-modal-create-gluefs').on('click', function(){
  $('#div-modal-create-gluefs').hide();
});

$('#button-cancel-modal-create-gluefs').on('click', function(){
  $('#div-modal-create-gluefs').hide();
});

$('#button-execution-modal-create-gluefs').on('click', function(){
  if(gluefsValidateCheck()){
    var body_val = "";
    var gluefs_id = $('#form-input-glue-fs-name').val()

    var cnt_num = 0;
    $('input[type=checkbox][name="glue-hosts-list"]').each(function() {
      if(this.checked){
        if(cnt_num == 0){
          body_val += "hosts="+this.value
          cnt_num++;
        }else{
          body_val += "&hosts="+this.value
        }
      }
    });
    
    $('#div-modal-create-gluefs').hide();
    $('#div-modal-spinner-header-txt').text('Glue File System을 생성하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("Glue File System 생성 실패");
    $("#modal-status-alert-body").html("Glue File System 생성을 실패하였습니다.");
  
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs/'+gluefs_id,{
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body_val
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("Glue File System 생성 완료");
        $("#modal-status-alert-body").html("Glue File System 생성을 완료하였습니다.<br/>새로고침 버튼을 클릭하여 상태가 active인지 확인 가능합니다.");
        $('#div-modal-status-alert').show();
        gluefsList();
        createLoggerInfo("gluefs create success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("gluefs create error : "+ data);
      console.log('button-execution-modal-create-gluefs : '+data);
    });
  }
});
/** glue fs create 관련 action end */

/** glue fs delete 관련 action start */
function glueFsDelete(id){
  $('#input-checkbox-gluefs-remove').prop('checked',false);
  $('#div-modal-remove-gluefs').show();
  $('#gluefs-remove-id').val(id);
  $('#gluefs-id').text('선택하신 '+id+' 을(를) 삭제하시겠습니까?');
}

$('#menu-item-gluefs-remove').on('click', function(){
  $('#div-modal-remove-gluefs').show();
});

$('#button-close-modal-remove-gluefs').on('click', function(){
  $('#div-modal-remove-gluefs').hide();
});

$('#button-cancel-modal-remove-gluefs').on('click', function(){
  $('#div-modal-remove-gluefs').hide();
});

$('#button-execution-modal-remove-gluefs').on('click', function(){
  if($('#input-checkbox-gluefs-remove').is(":checked")){
    var gluefs_id = $('#gluefs-remove-id').val()
    
    // $('#dropdown-menu-gateway-vm-status').toggle();
    $('#div-modal-remove-gluefs').hide();
    $('#div-modal-spinner-header-txt').text('Glue File System을 삭제하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("Glue File System 삭제 실패");
    $("#modal-status-alert-body").html("Glue File System 삭제를 실패하였습니다.");
  
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs/'+gluefs_id,{
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("Glue File System 삭제 완료");
        $("#modal-status-alert-body").html("Glue File System 삭제를 완료하였습니다.");
        $('#div-modal-status-alert').show();
        gluefsList();
        createLoggerInfo("gluefs remove success");
      } else if(data == "Please Subvolume Group Check"){
        $("#modal-status-alert-body").html("GlueFS를 삭제하려면 SubVolume을 모두 제거해야 합니다.");
        $('#div-modal-status-alert').show();
        gluefsList();
        createLoggerInfo("gluefs remove success");
      } else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("gluefs remove error : "+ data);
      console.log('button-execution-modal-remove-gluefs : '+data);
    });
  }else{
    alert("삭제 여부를 체크해주세요.");
  }

});
/** glue fs delete 관련 action end */

function gluefsSubvolumeGroupList(gluefs_name, gluefs_data_pool){
  //조회
  $('#button-gluefs-subvolume-group-search').html("<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
  $('#gluefs-subvolume-group-list tr').remove();
  $('#card-gluefs-subvolume-group-title').text(gluefs_name+" SubVolume Group");
  $('#gluefs-select-id').val(gluefs_name);
  $('#gluefs-select-data-pool').val(gluefs_data_pool);

  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs/subvolume/group?vol_name='+gluefs_name,{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    if(data != null && data.length != 0){
      $('#gluefs-subvolume-group-list tr').remove();
      for(var i=0; i < data.length; i++){
        let insert_tr = "";

        insert_tr += '<tr role="row">';
        insert_tr += '  <td role="cell" data-label="이름" id="gluefs-subvolume-group-name">'+data[i].name+'</td>';
        insert_tr += '  <td role="cell" data-label="경로" id="gluefs-subvolume-group-path">'+data[i].path+'</td>';
        insert_tr += '  <td role="cell" data-label="사용량" id="gluef-subvolume-groups-usage">'+Math.floor(data[i].Info.bytes_pcent)+' %</td>';
        insert_tr += '  <td role="cell" data-label="사용량" id="gluef-subvolume-groups-total-capacity">'+Byte(data[i].Info.bytes_quota)+'</td>';
        insert_tr += '  <td class="pf-v6-c-table__icon" role="cell" data-label="편집">';
        insert_tr += '    <div class="ablestack-menu-dropdown">';
        insert_tr += '      <button class="pf-v6-c-menu-toggle pf-m-plain" id="card-action-gluefs-subvolume-group-status'+i+'" aria-expanded="false" type="button" aria-label="Actions">';
        insert_tr += '        <i class="fas fa-ellipsis-v" aria-hidden="true"></i>';
        insert_tr += '      </button>';
        insert_tr += '      <ul class="pf-v6-c-menu ablestack-menu pf-m-align-right pf-m-disabled" aria-labelledby="card-action-gluefs-subvolume-group-status'+i+'" id="dropdown-menu-card-action-gluefs-subvolume-group-status'+i+'">';
        insert_tr += '        <li>';
        insert_tr += '          <button class="pf-v6-c-menu__item" type="button" onclick=\'glueFsSubvolumeGroupUpdate("'+data[i].name+'","'+byteOnlyGib(data[i].Info.bytes_quota)+'")\' >SubVolume Group 수정</button>';
        insert_tr += '          <button class="pf-v6-c-menu__item" type="button" onclick=\'glueFsSubvolumeGroupDelete("'+data[i].name+'","'+data[i].path+'")\' >SubVolume Group 삭제</button>';
        insert_tr += '        </li>';
        insert_tr += '       </ul>';
        insert_tr += '    </div>';
        insert_tr += '  </td>';
        insert_tr += '</tr>';
  
        $("#gluefs-subvolume-group-list:last").append(insert_tr);
        $('#dropdown-menu-card-action-gluefs-subvolume-group-status'+i).hide();
      }
    }else{
      noList("gluefs-subvolume-group-list",5);
    }
    $('#button-gluefs-subvolume-group-search').html("<i class='fas fa-fw fa-redo' aria-hidden='true'></i>");
  }).catch(function(data){
    console.log("error : "+data);
    noList("gluefs-subvolume-group-list",5);
    $('#button-gluefs-subvolume-group-search').html("<i class='fas fa-fw fa-redo' aria-hidden='true'></i>");
  });
}

/** glue fs subvolume group search 관련 action start */
$('#button-gluefs-subvolume-group-search').on('click', function(){
  gluefsSubvolumeGroupList($('#gluefs-select-id').val(),$('#gluefs-select-data-pool').val());
});
/** glue fs subvolume group search 관련 action end */

/** glue fs subvolume group create 관련 action start */
$('#button-gluefs-subvolume-group-create').on('click', function(){
  gluefsSubvolumeGroupCreateInitInputValue();
  var vol_name = $('#gluefs-select-id').val();
  var data_pool_name = $('#gluefs-select-data-pool').val();
  
  $('#form-input-glue-fs-svg-name').val(vol_name)
  $('#form-input-glue-fs-subvolume-group-data-pool').val(data_pool_name)
  $('#div-modal-create-gluefs-subvolume-group').show();
});

$('#button-close-modal-create-gluefs-subvolume-group').on('click', function(){
  $('#div-modal-create-gluefs-subvolume-group').hide();
});

$('#button-cancel-modal-create-gluefs-subvolume-group').on('click', function(){
  $('#div-modal-create-gluefs-subvolume-group').hide();
});

$('#button-execution-modal-create-gluefs-subvolume-group').on('click', function(){
  if(gluefsSubvolumueGroupCreateValidateCheck()){
    var vol_name = $('#gluefs-select-id').val();
    var size = $('#form-input-glue-fs-subvolume-group-size').val();
    var group_name = $('#form-input-glue-fs-subvolume-group-name').val();
    var data_pool_name = $('#gluefs-select-data-pool').val();
    var mode = 777
  
    var body_val = "vol_name="+vol_name+"&group_name="+group_name+"&size="+size+"&data_pool_name="+data_pool_name+"&mode="+mode
    
    $('#div-modal-create-gluefs-subvolume-group').hide();
    $('#div-modal-spinner-header-txt').text('Glue FS Subvolume Group을 생성하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("Glue FS Subvolume Group 생성 실패");
    $("#modal-status-alert-body").html("Glue FS Subvolume Group 생성을 실패하였습니다.");
  
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs/subvolume/group',{
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body_val
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("Glue FS Subvolume Group 생성 완료");
        $("#modal-status-alert-body").html("Glue FS Subvolume Group 생성을 완료하였습니다.");
        $('#div-modal-status-alert').show();
        gluefsSubvolumeGroupList(vol_name, data_pool_name);
        createLoggerInfo("gluefs subvolume group create success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("gluefs subvolume group create error : "+ data);
      console.log('button-execution-modal-create-gluefs-subvolume-group : '+data);
    });
  }
});
/** glue fs subvolume group create 관련 action end */

/** glue fs subvolume group update 관련 action start */
function glueFsSubvolumeGroupUpdate(svg_id, size){
  $('#form-input-update-glue-fs-subvolume-group-name').val(svg_id);
  $('#form-input-update-glue-fs-subvolume-group-size').val(size);
  $('#div-modal-update-gluefs-subvolume-group').show();
}

$('#button-close-modal-update-gluefs-subvolume-group').on('click', function(){
  $('#div-modal-update-gluefs-subvolume-group').hide();
});

$('#button-cancel-modal-update-gluefs-subvolume-group').on('click', function(){
  $('#div-modal-update-gluefs-subvolume-group').hide();
});

$('#button-execution-modal-update-gluefs-subvolume-group').on('click', function(){
  if(gluefsSubvolumueGroupUpdateValidateCheck()){
    var vol_name = $('#gluefs-select-id').val();
    var data_pool_name = $('#gluefs-select-data-pool').val();
    var group_name= $('#form-input-update-glue-fs-subvolume-group-name').val();
    var new_size = $('#form-input-update-glue-fs-subvolume-group-size').val();
  
    var body_val = "vol_name="+vol_name+"&group_name="+group_name+"&new_size="+new_size
    
    $('#div-modal-update-gluefs-subvolume-group').hide();
    $('#div-modal-spinner-header-txt').text('Glue FS Subvolume Group을 수정하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("Glue FS Subvolume Group 수정 실패");
    $("#modal-status-alert-body").html("Glue FS Subvolume Group 수정을 실패하였습니다.");
  
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs/subvolume/group',{
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body_val
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("Glue FS Subvolume Group 수정 완료");
        $("#modal-status-alert-body").html("Glue FS Subvolume Group 수정을 완료하였습니다.");
        $('#div-modal-status-alert').show();
        gluefsSubvolumeGroupList(vol_name, data_pool_name);
        createLoggerInfo("gluefs subvolume group update success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("gluefs subvolume group update error : "+ data);
      console.log('button-execution-modal-update-gluefs-subvolume-group : '+data);
    });
  }
});
/** glue fs subvolume group update 관련 action end */
/** glue fs subvolume group delete 관련 action start */
function glueFsSubvolumeGroupDelete(svg_id, path){
  var gluefs_id = $('#gluefs-select-id').val();
  
  $('#input-checkbox-gluefs-subvolume-group-remove').prop('checked',false);
  $('#div-modal-remove-gluefs-subvolume-group').show();
  $('#gluefs-remove-id').val(gluefs_id);
  $('#gluefs-subvolume-group-remove-id').val(svg_id);
  $('#gluefs-subvolume-group-remove-path').val(path);

  $('#gluefs-subvolume-group-id').text('선택하신 '+gluefs_id+" 의 "+svg_id+' 을(를) 삭제하시겠습니까?');
}

$('#button-close-modal-remove-gluefs-subvolume-group').on('click', function(){
  $('#div-modal-remove-gluefs-subvolume-group').hide();
});

$('#button-cancel-modal-remove-gluefs-subvolume-group').on('click', function(){
  $('#div-modal-remove-gluefs-subvolume-group').hide();
});

$('#button-execution-modal-remove-gluefs-subvolume-group').on('click', function(){
  if($('#input-checkbox-gluefs-subvolume-group-remove').is(":checked")){
    var vol_name = $('#gluefs-select-id').val();
    var data_pool_name = $('#gluefs-select-data-pool').val();
    var group_name = $('#gluefs-subvolume-group-remove-id').val();
    var path = $('#gluefs-subvolume-group-remove-path').val();
        
    $('#div-modal-remove-gluefs-subvolume-group').hide();
    $('#div-modal-spinner-header-txt').text('Glue FS Subvolume Group을 삭제하고 있습니다.');
    $('#div-modal-spinner').show();
  
    $("#modal-status-alert-title").html("Glue FS Subvolume Group 삭제 실패");
    $("#modal-status-alert-body").html("Glue FS Subvolume Group 삭제를 실패하였습니다.");
  
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs/subvolume/group?vol_name='+vol_name+'&path='+path+'&group_name='+group_name,{
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      if(data == "Success"){
        $("#modal-status-alert-title").html("Glue FS Subvolume Group 삭제 완료");
        $("#modal-status-alert-body").html("Glue FS Subvolume Group 삭제를 완료하였습니다.");
        $('#div-modal-status-alert').show();
        gluefsSubvolumeGroupList(vol_name, data_pool_name);
        createLoggerInfo("gluefs subvolume group remove success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("gluefs subvolume group remove error : "+ data);
      console.log('button-execution-modal-remove-gluefs-subvolume-group : '+data);
    });
  }else{
    alert("삭제 여부를 체크해주세요.");
  }
});
/** glue fs subvolume group delete 관련 action end */

// glue fs 생성 입력값 초기화
function gluefsCreateInitInputValue(){
  $('#form-input-glue-fs-name').val("");
}

// glue fs subvolume group 생성 입력값 초기화
function gluefsSubvolumeGroupCreateInitInputValue(){
  $('#form-input-glue-fs-subvolume-group-name').val("");
  $('#form-input-glue-fs-subvolume-group-size').val("");
}

function gluefsValidateCheck(){
  var validate_check = true;
  var gluefs_id = $('#form-input-glue-fs-name').val();
  var host_cnt = $('input[type=checkbox][name="glue-hosts-list"]:checked').length

  if (gluefs_id == "") {
    alert("GlueFS 이름를 입력해주세요.");
    validate_check = false;
  } else if (checkForNameDuplicates("gluefs-list", 0, gluefs_id)) {
    alert(gluefs_id + "는 이미 사용중인 이름입니다.");
    validate_check = false;
  } else if (!nameCheck(gluefs_id)) {
    alert("GlueFS 이름 생성 규칙은 영문, 숫자 특수문자 '-','_' 만 입력 가능하고 영문으로 시작해야 합니다.");
    validate_check = false;
  } else if (host_cnt == 0) {
    alert("배치 호스트를 선택해주세요.");
    validate_check = false;
  } 
 
  return validate_check;
}

function gluefsSubvolumueGroupCreateValidateCheck(){
  var validate_check = true;

  var group_name = $('#form-input-glue-fs-subvolume-group-name').val();
  var size = $('#form-input-glue-fs-subvolume-group-size').val();
  
  if (group_name == "") {
    alert("Group 이름을 입력해주세요.");
    validate_check = false;
  } else if (checkForNameDuplicates("gluefs-subvolume-group-list", 0, group_name)) {
    alert(group_name + "는 이미 사용중인 이름입니다.");
    validate_check = false;
  } else if (!pathNameCheck(group_name)) {
    alert("Group 이름 생성 규칙은 영문, 숫자 특수문자 '-','_' 만 입력 가능합니다.");
    validate_check = false;
  } else if (size == "") {
    alert("용량을 입력해주세요.");
    validate_check = false;
  } else if (!numberCheck(size)) {
    alert("숫자만 입력해주세요.");
    validate_check = false;
  }
 
  return validate_check;
}

function gluefsSubvolumueGroupUpdateValidateCheck(){
  var validate_check = true;

  var group_name= $('#form-input-update-glue-fs-subvolume-group-name').val();
  var size = $('#form-input-update-glue-fs-subvolume-group-size').val();
  
  if (group_name == "") {
    alert("Group 이름을 입력해주세요.");
    validate_check = false;
  } else if (!pathNameCheck(group_name)) {
    alert("Group 이름 생성 규칙은 영문, 숫자 특수문자 '-','_' 만 입력 가능합니다.");
    validate_check = false;
  } else if (size == "") {
    alert("용량을 입력해주세요.");
    validate_check = false;
  } else if (!numberCheck(size)) {
    alert("용량에 숫자만 입력해주세요.");
    validate_check = false;
  }
 
  return validate_check;
}