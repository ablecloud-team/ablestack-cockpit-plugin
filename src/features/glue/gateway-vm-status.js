/**
 * File Name : gateway-vm-status.js
 * Date Created : 2024.01.25
 * Writer : 배태주
 * Description : main-glue.html에서 gateway 가상머신 관련 발생하는 이벤트 처리를 위한 JavaScript
**/

/** gateway vm start 관련 action start */
$('#menu-item-gateway-vm-start').on('click', function(){
  $('#div-modal-start-gateway-vm').show();
});

$('#button-close-modal-gateway-vm-start').on('click', function(){
  $('#div-modal-start-gateway-vm').hide();
});

$('#button-cancel-modal-gateway-vm-start').on('click', function(){
  $('#div-modal-start-gateway-vm').hide();
});

$('#button-execution-modal-gateway-vm-start').on('click', function(){
  closeAblestackMenus();
  $('#div-modal-start-gateway-vm').hide();
  $('#div-modal-spinner-header-txt').text('게이트웨이 VM을 시작하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("게이트웨이 VM 시작 실패");
  $("#modal-status-alert-body").html("게이트웨이 VM 시작을 실패하였습니다.");

  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gwvm/start/cell',{
    method: 'PATCH',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#div-modal-spinner').hide();
    var retVal = JSON.parse(data.Message);
    if(retVal.code == 200){
      $("#modal-status-alert-title").html("게이트웨이 VM 시작 완료");
      $("#modal-status-alert-body").html("게이트웨이 VM 시작을 완료하였습니다.");
      $('#div-modal-status-alert').show();
      createLoggerInfo("gateway vm start success");
    }else{
      $('#div-modal-status-alert').show();
    }
  }).catch(function(data){
    $('#div-modal-spinner').hide();
    $('#div-modal-status-alert').show();
    createLoggerInfo("gateway vm start error : "+ data);
    console.log('button-execution-modal-gateway-vm-start : '+data);
  });
});
/** gateway vm start 관련 action end */


/** gateway vm stop modal 관련 action start */
$('#menu-item-gateway-vm-stop').on('click', function(){
  $('#div-modal-stop-gateway-vm').show();
});

$('#button-close-modal-gateway-vm-stop').on('click', function(){
  $('#div-modal-stop-gateway-vm').hide();
});

$('#button-cancel-modal-gateway-vm-stop').on('click', function(){
  $('#div-modal-stop-gateway-vm').hide();
});

$('#button-execution-modal-gateway-vm-stop').on('click', function(){
  closeAblestackMenus();
  $('#div-modal-stop-gateway-vm').hide();
  $('#div-modal-spinner-header-txt').text('게이트웨이 VM을 정지하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("게이트웨이 VM 정지 실패");
  $("#modal-status-alert-body").html("게이트웨이 VM 정지를 실패하였습니다.");

  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gwvm/stop/cell',{
    method: 'PATCH',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#div-modal-spinner').hide();
    var retVal = JSON.parse(data.Message);
    if(retVal.code == 200){
      $("#modal-status-alert-title").html("게이트웨이 VM 정지 완료");
      $("#modal-status-alert-body").html("게이트웨이 VM 정지를 완료하였습니다.");
      $('#div-modal-status-alert').show();
      createLoggerInfo("gateway vm stop success");
    }else{
      $('#div-modal-status-alert').show();
    }
  }).catch(function(data){
    $('#div-modal-spinner').hide();
    $('#div-modal-status-alert').show();
    createLoggerInfo("gateway vm stop error : "+ data);
    console.log('button-execution-modal-gateway-vm-stop : '+data);
  });
});
/** gateway vm stop modal 관련 action end */

/** gateway vm destroy modal 관련 action start */
$('#menu-item-gateway-vm-destroy').on('click', function(){
  $('#div-modal-destroy-gateway-vm').show();
});

$('#button-close-modal-gateway-vm-destroy').on('click', function(){
  $('#div-modal-destroy-gateway-vm').hide();
});

$('#button-cancel-modal-gateway-vm-destroy').on('click', function(){
  $('#div-modal-destroy-gateway-vm').hide();
});

$('#button-execution-modal-gateway-vm-destroy').on('click', function(){
  closeAblestackMenus();
  $('#div-modal-destroy-gateway-vm').hide();
  $('#div-modal-spinner-header-txt').text('게이트웨이 VM을 삭제하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("게이트웨이 VM 삭제 실패");
  $("#modal-status-alert-body").html("게이트웨이 VM 삭제를 실패하였습니다.");

  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gwvm/delete/cell',{
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    var retVal = JSON.parse(data.Message);

    if(retVal.code == 200){
      $("#modal-status-alert-title").html("게이트웨이 VM 삭제 완료");
      $("#modal-status-alert-body").html("게이트웨이 VM 삭제를 완료하였습니다.");
      $('#div-modal-status-alert').show();
      createLoggerInfo("gateway vm destroy success");
    }
    $('#div-modal-spinner').hide();
  }).catch(function(data){
    createLoggerInfo("gateway vm destroy error : "+data);
    console.log('button-execution-modal-gateway-vm-destroy spawn error : '+data);
  });
  
});
/** gateway vm destroy modal 관련 action end */

/** gateway vm cleanup modal 관련 action start */
$('#menu-item-gateway-vm-cleanup').on('click', function(){
  $('#div-modal-cleanup-gateway-vm').show();
});
$('#button-close-modal-gateway-vm-cleanup').on('click', function(){
  $('#div-modal-cleanup-gateway-vm').hide();
});

$('#button-execution-modal-gateway-vm-cleanup').on('click', function(){
  closeAblestackMenus();
  $('#div-modal-cleanup-gateway-vm').hide();
  $('#div-modal-spinner-header-txt').text('게이트웨이 VM을 클린업하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("게이트웨이 VM 클립업 실패");
  $("#modal-status-alert-body").html("게이트웨이 VM 클린업을 실패하였습니다.");

  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gwvm/cleanup/cell',{
    method: 'PATCH',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#div-modal-spinner').hide();
    var retVal = JSON.parse(data.Message);
    if(retVal.code == 200){
      $("#modal-status-alert-title").html("게이트웨이 VM 클린업 완료");
      $("#modal-status-alert-body").html("게이트웨이 VM 클린업을 완료하였습니다.");
      $('#div-modal-status-alert').show();
      createLoggerInfo("gateway vm cleanup success");
    }else{
      $('#div-modal-status-alert').show();
    }
  }).catch(function(data){
    $('#div-modal-spinner').hide();
    $('#div-modal-status-alert').show();
    createLoggerInfo("gateway vm cleanup error : "+ data);
    console.log('button-execution-modal-gateway-vm-cleanup : '+data);
  });
});

$('#button-cancel-modal-gateway-vm-cleanup').on('click', function(){
  $('#div-modal-cleanup-gateway-vm').hide();
});
/** gateway vm cleanup modal 관련 action end */

/** gateway vm migration modal 관련 action start */
$('#button-close-modal-gateway-vm-migration').on('click', function(){
  $('#div-modal-migration-gateway-vm').hide();
});

$('#button-cancel-modal-gateway-vm-migration').on('click', function(){
  $('#div-modal-migration-gateway-vm').hide();
});

$('#button-execution-modal-gateway-vm-migration').on('click', function(){
  var valSelect = $('#form-select-gateway-vm-migration-node option:selected').val();
  if(valSelect == 'null'){
    $('#div-modal-migration-gateway-vm-select').text('선택이 잘못되었습니다. 마이그레이션할 노드를 선택해주세요.');
  }else{
    closeAblestackMenus();
    $('#div-modal-migration-gateway-vm').hide();
    $('#div-modal-spinner-header-txt').text('게이트웨이 VM을 마이그레이션하고 있습니다.');
    $('#div-modal-spinner').show();

    $("#modal-status-alert-title").html("게이트웨이 VM 마이그레이션 실패");
    $("#modal-status-alert-body").html("게이트웨이 VM 마이그레이션을 실패하였습니다.");

    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gwvm/migrate/cell',{
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: "target="+valSelect
    }).then(res => res.json()).then(data => {
      $('#div-modal-spinner').hide();
      var retVal = JSON.parse(data.Message);
      if(retVal.code == 200){
        $("#modal-status-alert-title").html("게이트웨이 VM 마이그레이션 완료");
        $("#modal-status-alert-body").html("게이트웨이 VM 마이그레이션을 완료하였습니다.");
        $('#div-modal-status-alert').show();
        createLoggerInfo("gateway vm migrate success");
      }else{
        $('#div-modal-status-alert').show();
      }
    }).catch(function(data){
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      reateLoggerInfo("migration gateway vm select spawn error : "+data);
      console.log('div-modal-migration-gateway-vm-select spawn error : '+data);
    });



    // cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsMigration', '--target', valSelect], { host: pcs_exe_host})
    // .then(function(data){
    //   var retVal = JSON.parse(data);
    //   if(retVal.code == 200){
    //     CardCloudClusterStatus();
    //     createLoggerInfo("migration gateway vm select spawn success");
    //   }
    //   $('#div-modal-migration-gateway-vm-select').text('');
    //   $('#div-modal-spinner').hide();
    // }).catch(function(data){
    //   createLoggerInfo("migration gateway vm select spawn error");
    //   console.log('div-modal-migration-gateway-vm-select spawn error');
    // });
  }
});

$('#menu-item-gateway-vm-migrate').on('click', function(){
  $('#div-modal-migration-gateway-vm').show();
});
/** gateway vm migration modal 관련 action end */


// $('#cloud-cluster-connect').on('click', function(){
//   //클라우드센터 연결
//   cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/url/create_address.py', 'cloudCenter'])
//   .then(function(data){
//     var retVal = JSON.parse(data);    
//     if(retVal.code == 200){
//       window.open(retVal.val);
//     }else{
//       $("#modal-status-alert-title").html("클라우드센터 연결");
//       $("#modal-status-alert-body").html(retVal.val);
//       $('#div-modal-status-alert').show();
//     }
//     createLoggerInfo("cloud cluster connect success");
//   })
//   .catch(function(data){
//     createLoggerInfo("cloud cluster connect error");
//     console.log('cloud-cluster-connect');
//   });
// });

// function cccc_link_go(){
//   // 클라우드센터 연결
//   createLoggerInfo("cccc_link_go() start");
//   cockpit.spawn(["python3", pluginpath+"/python/url/create_address.py", "cloudCenter"])
//     .then(function(data){
//       var retVal = JSON.parse(data);
//       if(retVal.code == 200){
//         window.open(retVal.val);
//       }else{
//         alert("클라우드센터에 연결할 수 없습니다.\n클라우드센터 가상머신 및 Mold 서비스를 확인해주세요.");
//       }
//     })
//     .catch(function(data){
//       //console.log(":::Error:::");
//     });
// }
