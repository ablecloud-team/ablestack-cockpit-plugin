/**
 * File Name : card-cloud-cluster-status.js
 * Date Created : 2020.03.08
 * Writer : 이석민
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/
var role = '';
var os_type = sessionStorage.getItem('os_type');
/** cloud vm start 관련 action start */
$('#button-cloud-cluster-start').on('click', function(){
  $('#div-modal-start-cloud-vm').show();
});

$('#button-close-modal-cloud-vm-start').on('click', function(){
  $('#div-modal-start-cloud-vm').hide();
});

$('#button-cancel-modal-cloud-vm-start').on('click', function(){
  $('#div-modal-start-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-start').on('click', function(){
  $('#dropdown-menu-cloud-cluster-status').toggle();
  $('#div-modal-start-cloud-vm').hide();
  $('#div-modal-spinner-header-txt').text('클라우드센터VM을 시작하고 있습니다.');
  $('#div-modal-spinner').show();
  if (os_type == "ablestack-standalone"){
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/vm/local_ccvm_manage.py', 'start'])
    .then(function(data){
      var retVal = JSON.parse(data);

      if(retVal.code == 200){
        LocalCloudVMCheck();
        $('#card-action-cloud-vm-change').attr('disabled', true);
        $('#button-cloud-vm-snap-rollback').attr('disabled', true);
        createLoggerInfo("cloud vm start success");
      }
      $('#div-modal-spinner').hide();
    }).catch(function(data){
      createLoggerInfo("cloud vm start error");
      console.log('button-execution-modal-cloud-vm-start');
    });
  }else{
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsStart'], { host: pcs_exe_host})
    .then(function(data){
      var retVal = JSON.parse(data);

      if(retVal.code == 200){
        CardCloudClusterStatus();
        $('#card-action-cloud-vm-change').attr('disabled', true);
        $('#button-cloud-vm-snap-rollback').attr('disabled', true);
        createLoggerInfo("cloud vm start success");
      }
      $('#div-modal-spinner').hide();
    }).catch(function(data){
      createLoggerInfo("cloud vm start error");
      console.log('button-execution-modal-cloud-vm-start');
    });
  }

});
/** cloud vm start 관련 action end */

/** cloud vm delete modal 관려 action start */
$('#button-cloud-cluster-delete').on('click', function(){
  $('#div-modal-delete-cloud-vm').show();
});
$('#button-close-modal-cloud-vm-delete, #button-cancel-modal-cloud-vm-delete').on('click', function(){
  $('#div-modal-delete-cloud-vm').hide();
});
$('#button-execution-modal-cloud-vm-delete').on('click', function(){
  $('#dropdown-menu-cloud-cluster-status').toggle();
  $('#div-modal-delete-cloud-vm').hide();
  $('#div-modal-spinner-header-txt').text('클라우드센터VM을 파기하고 있습니다.');
  $('#div-modal-spinner').show();
  if (os_type == "ablestack-standalone"){
    var purge = $('#modal-input-cloud-vm-delete').prop('checked');
    cmd = ['/usr/bin/python3', pluginpath + '/python/vm/local_ccvm_manage.py', 'delete', '--purge' , purge];
    console.log(cmd);
    cockpit.spawn(cmd)
    .then(function(data){
      var retVal = JSON.parse(data);

      if(retVal.code == 200){
        LocalCloudVMCheck();
        $('#card-action-cloud-vm-change').attr('disabled', false);
        $('#button-cloud-vm-snap-rollback').attr('disabled', false);
        createLoggerInfo("cloud vm delete success");
      }
      $('#div-modal-spinner').hide();
    }).catch(function(){
      createLoggerInfo("cloud vm delete error");
      console.log('button-execution-modal-cloud-vm-delete spawn error');
    });
  }else{
    var purge = $('#modal-input-cloud-vm-delete').prop('checked');
    cmd = ['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsDestroy','--purge', purge];
    console.log(cmd);
    cockpit.spawn(cmd)
    .then(function(data){
      var retVal = JSON.parse(data);

      if(retVal.code == 200){
        CardCloudClusterStatus();
        $('#card-action-cloud-vm-change').attr('disabled', false);
        $('#button-cloud-vm-snap-rollback').attr('disabled', false);
        createLoggerInfo("cloud vm delete success");
      }
      $('#div-modal-spinner').hide();
    }).catch(function(){
      createLoggerInfo("cloud vm delete error");
      console.log('button-execution-modal-cloud-vm-delete spawn error');
    });
  }

});
/** cloud vm delete modal 관려 action end */

/** cloud vm stop modal 관련 action start */

$('#button-cloud-cluster-stop').on('click', function(){
  $('#div-modal-stop-cloud-vm').show();
});
$('#button-close-modal-cloud-vm-stop, #button-cancel-modal-cloud-vm-stop').on('click', function(){
  $('#div-modal-stop-cloud-vm').hide();
});


$('#button-execution-modal-cloud-vm-stop').on('click', function(){
  $('#dropdown-menu-cloud-cluster-status').toggle();
  $('#div-modal-stop-cloud-vm').hide();
  $('#div-modal-spinner-header-txt').text('클라우드센터VM을 정지하고 있습니다.');
  $('#div-modal-spinner').show();
  if(os_type == "ablestack-standalone"){
    var force_quit = $('#modal-input-force-quit').prop('checked');
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/vm/local_ccvm_manage.py', 'stop', '--destroy', force_quit])
    .then(function(data){
      var retVal = JSON.parse(data);

      if(retVal.code == 200){
        LocalCloudVMCheck();
        $('#card-action-cloud-vm-change').attr('disabled', false);
        $('#button-cloud-vm-snap-rollback').attr('disabled', false);
        createLoggerInfo("cloud vm stop success");
      }
      $('#div-modal-spinner').hide();
    }).catch(function(data){
      createLoggerInfo("cloud vm stop error");
      console.log('button-execution-modal-cloud-vm-stop spawn error');
    });
  }else{
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsStop'], { host: pcs_exe_host})
    .then(function(data){
      var retVal = JSON.parse(data);

      if(retVal.code == 200){
        CardCloudClusterStatus();
        $('#card-action-cloud-vm-change').attr('disabled', false);
        $('#button-cloud-vm-snap-rollback').attr('disabled', false);
        createLoggerInfo("cloud vm stop success");
      }
      $('#div-modal-spinner').hide();
    }).catch(function(data){
      createLoggerInfo("cloud vm stop error");
      console.log('button-execution-modal-cloud-vm-stop spawn error');
    });
  }

});
/** cloud vm stop modal 관련 action end */

/** cloud vm cleanup modal 관련 action start */
$('#button-cloud-cluster-cleanup').on('click', function(){
  $('#div-modal-cleanup-cloud-vm').show();
});
$('#button-close-modal-cloud-vm-cleanup').on('click', function(){
  $('#div-modal-cleanup-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-cleanup').on('click', function(){
  $('#dropdown-menu-cloud-cluster-status').toggle();
  $('#div-modal-cleanup-cloud-vm').hide();
  $('#div-modal-spinner-header-txt').text('클라우드센터 클러스터를 클린업하고 있습니다.');
  $('#div-modal-spinner').show();
  cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsCleanup'], { host: pcs_exe_host})
  .then(function(data){
    var retVal = JSON.parse(data);
    $('#div-modal-spinner').hide();
    createLoggerInfo("cloud cluster cleanup spawn success");
  }).catch(function(data){
    createLoggerInfo("cloud cluster cleanup spawn error");
    console.log('cloud-cluster-cleanup spawn error');
  });
});

$('#button-cancel-modal-cloud-vm-cleanup').on('click', function(){
  $('#div-modal-cleanup-cloud-vm').hide();
});
/** cloud vm cleanup modal 관련 action end */

/** cloud vm migration modal 관련 action start */
$('#button-close-modal-cloud-vm-migration').on('click', function(){
  $('#div-modal-migration-cloud-vm').hide();
});

$('#button-cancel-modal-cloud-vm-migration').on('click', function(){
  $('#div-modal-migration-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-migration').on('click', function(){
  var valSelect = $('#form-select-cloud-vm-migration-node option:selected').val();
  if(valSelect == 'null'){
    $('#div-modal-migration-cloud-vm-select').text('선택이 잘못되었습니다. 마이그레이션할 노드를 선택해주세요.');
  }else{
    $('#dropdown-menu-cloud-cluster-status').toggle();
    $('#div-modal-migration-cloud-vm').hide();
    $('#div-modal-spinner-header-txt').text('클라우드센터VM을 마이그레이션하고 있습니다.');
    $('#div-modal-spinner').show();
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsMigration', '--target', valSelect], { host: pcs_exe_host})
    .then(function(data){
      var retVal = JSON.parse(data);
      if(retVal.code == 200){
        CardCloudClusterStatus();
        createLoggerInfo("migration cloud vm select spawn success");
      }
      $('#div-modal-migration-cloud-vm-select').text('');
      $('#div-modal-spinner').hide();
    }).catch(function(data){
      createLoggerInfo("migration cloud vm select spawn error");
      console.log('div-modal-migration-cloud-vm-select spawn error');
    });
  }
});

$('#button-cloud-cluster-migration').on('click', function(){
  $('#div-modal-migration-cloud-vm').show();
});
/** cloud vm migration modal 관련 action end */

/** wall config update modal 관련 action start */
function wall_config_update_modal(){
  $('#div-modal-monitoring-config-update').show();
}

$('#button-close-modal-monitoring-config-update').on('click', function(){
  $('#div-modal-monitoring-config-update').hide();
});

$('#button-execution-modal-monitoring-config-update').on('click', function(){
  var console_log = true;
  $('#div-modal-monitoring-config-update').hide();
  $('#div-modal-spinner-header-txt').text('모니터링센터 수집 정보를 업데이트하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("모니터링 수집 정보를 업데이트");
  $("#modal-status-alert-body").html("모니터링센터 수집 정보 업데이트를 실패하였습니다.<br/>클라우드센터 가상머신 상태를 확인해주세요.");
  createLoggerInfo("update_wall_config() start");

  cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "ping", "--target", "ccvm"])
  .then(function(data){var retVal = JSON.parse(data);
    if(retVal.code == 200){
      $("#modal-status-alert-title").html("모니터링 수집 정보를 업데이트");
      $("#modal-status-alert-body").html("모니터링센터 수집 정보 업데이트를 실패하였습니다.<br/>cluster.json 파일을 확인해주세요.");
      // cluster.json 파일 읽어 오기
      cockpit.spawn(["cat", pluginpath + "/tools/properties/cluster.json"])
      .then(function(data){
        const pythonPath = '/usr/share/ablestack/ablestack-wall/python/';
        var config_json = JSON.parse(data);
        ccvm_ip = config_json.clusterConfig.ccvm.ip;

        // ccvm의 /usr/share/ablestack/ablestack-wall/python/config_wall.py을 실행시키기 위한 명령어 생성
        var prometheus_config_cmd = ['python3', pythonPath + 'config_wall.py', 'update','--ccvm', ccvm_ip];
        prometheus_config_cmd.push('--cube');
        for(var i = 0 ; i < config_json.clusterConfig.hosts.length ; i ++ ){
          prometheus_config_cmd.push(config_json.clusterConfig.hosts[i].ablecube);
        }

        prometheus_config_cmd.push('--scvm');
        for(var i = 0 ; i < config_json.clusterConfig.hosts.length ; i ++ ){
          prometheus_config_cmd.push(config_json.clusterConfig.hosts[i].scvmMngt);
        }

        if (console_log) { console.log(prometheus_config_cmd); }
        cockpit.spawn(prometheus_config_cmd, { host: ccvm_ip })
        .then(function(data){
          var config_update_data = JSON.parse(data);
          if (console_log) { console.log(config_update_data); }
          if(config_update_data.code=="200") { //정상
            $('#div-modal-spinner').hide();
            $("#modal-status-alert-body").html("모니터링센터 수집 정보 업데이트를 성공하였습니다");
            $('#div-modal-status-alert').show();
            createLoggerInfo("update prometheus.yml config spawn success");
          } else {
            $('#div-modal-spinner').hide();
            $("#modal-status-alert-body").html("모니터링센터 수집 정보 업데이트를 실패하였습니다.<br/>prometheus.yml 설정을 실패하였습니다.");
            $('#div-modal-status-alert').show();
            createLoggerInfo(config_update_data.val);
          }
        })
        .catch(function(data){
          $("#modal-status-alert-body").html("모니터링센터 수집 정보 업데이트를 실패하였습니다.<br/>업데이트를 다시 실행해 주세요.");
          $('#div-modal-spinner').hide();
          $('#div-modal-status-alert').show();
          createLoggerInfo(":::update_wall_config() Error prometheus_config_cmd ::: error");
          console.log(":::update_wall_config() Error prometheus_config_cmd :::" + data);
        });
      })
      .catch(function(data){
        $('#div-modal-spinner').hide();
        $('#div-modal-status-alert').show();
        createLoggerInfo(":::update_wall_config() Error ::: error");
        console.log(":::update_wall_config() Error :::" + data);
      });
    }else{
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo(":::update_wall_config() Error ::: error");
      console.log(":::update_wall_config() Error :::" + data);
    }
  })
  .catch(function(data){
    $('#div-modal-spinner').hide();
    $('#div-modal-status-alert').show();
    createLoggerInfo(":::update_wall_config() Error ::: error");
    console.log(":::update_wall_config() Error :::" + data);
  });
});

$('#button-cancel-modal-monitoring-config-update').on('click', function(){
  $('#div-modal-monitoring-config-update').hide();
});
/** wall config update modal 관련 action end */


/** cloud vm snap rollback modal 관련 action start */

$('#button-execution-modal-cloud-vm-snap-rollback').on('click', function(){
  var valSelect = $('#form-select-cloud-vm-snap option:selected').val();
  if(valSelect == 'null'){
    $('#div-modal-cloud-vm-snap-message').text('선택이 잘못되었습니다. 복구할 스냅샷을를 선택해주세요.');
  }else{

    $('#div-modal-cloud-vm-snap-rollback').hide();
    $('#div-modal-cloud-vm-snap-rollback-confirm').show();
    $('#cloud-vm-snap-rollback-confirm-msg').text("");
    var confirm_text = "선택하신 " + valSelect + " 스냅샷으로 클라우드센터VM 복구하시겠습니까?<br/>복구를 진행하시면 현재 상태로 되돌릴 수 없습니다."
    $('#cloud-vm-snap-rollback-confirm-msg').append(confirm_text);
  }
});

$('#button-execution-modal-cloud-vm-snap-rollback-confirm').on('click', function(){

  $('#div-modal-cloud-vm-snap-rollback-confirm').hide();
  $('#div-modal-spinner-header-txt').text('클라우드센터VM을 스냅샷 복구하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("클라우드센터VM 스냅샷 복구 실패");
  $("#modal-status-alert-body").html("스냅샷 복구를 실패하였습니다. 클라우드센터VM 상태를 점검해주세요.</br>(클라우드센터VM이 정지상태인 경우에만 복구가능합니다.)");
  cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/pcs/main.py', 'status', '--resource', 'cloudcenter_res'], { host: pcs_exe_host})
  .then(function(data){
    var retVal = JSON.parse(data);
    if(retVal.code == 200 && retVal.val.role == "Stopped"){
      // 스냅샷 복구
      var valSelect = $('#form-select-cloud-vm-snap option:selected').val();
      cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_snap/ccvm_snap_action.py', 'rollback', "--snap-name", valSelect], { host: pcs_exe_host})
      .then(function(data){
        $('#div-modal-spinner').hide();

        var retVal = JSON.parse(data);
        if(retVal.code == 200){
          $("#modal-status-alert-title").html("클라우드센터VM 스냅샷 복구 완료");
          $("#modal-status-alert-body").html("스냅샷 복구를 완료하였습니다. 클라우드센터VM을 시작해주세요.");
          $('#div-modal-status-alert').show();
          createLoggerInfo("rollback cloud vm snapshot spawn success");
        } else {
          $('#div-modal-status-alert').show();
          createLoggerInfo(retVal.val);
        }
      }).catch(function(data){
        $('#div-modal-status-alert').show();
        createLoggerInfo("rollback cloud vm snapshot spawn error : " + data);
      });
    }else{
      $('#div-modal-spinner').hide();
      $('#div-modal-status-alert').show();
      createLoggerInfo("rollback cloud vm snapshot status error : " + data);
    }
  }).catch(function(data){
    $('#div-modal-spinner').hide();
    $('#div-modal-status-alert').show();
    createLoggerInfo("rollback cloud vm snapshot status error : " + data);
  });
});
/** cloud vm snap rollback modal 관련 action end */

/** cloud vm snap backup modal 관련 action start */
$('#button-execution-modal-cloud-vm-snap-backup').on('click', function(){

  $('#div-modal-cloud-vm-snap-backup').hide();
  $('#div-modal-spinner-header-txt').text('클라우드센터VM 복구용 스냅샷을 생성하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("클라우드센터VM 복구용 스냅샷 생성 실패");
  $("#modal-status-alert-body").html("복구용 스냅샷 생성을 실패하였습니다.");

  // 복구용 스냅샷 생성
  cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_snap/ccvm_snap_action.py', 'backup'], { host: pcs_exe_host})
  .then(function(data){
    $('#div-modal-spinner').hide();

    var retVal = JSON.parse(data);
    if(retVal.code == 200){
      $("#modal-status-alert-title").html("클라우드센터VM 복구용 스냅샷 생성 완료");
      $("#modal-status-alert-body").html("스냅샷 복구용 스냅샷 생성을 완료하였습니다.");
      $('#div-modal-status-alert').show();
      createLoggerInfo("backup cloud vm snapshot spawn success");
    } else {
      $('#div-modal-status-alert').show();
      createLoggerInfo(retVal.val);
    }
  }).catch(function(data){
    $('#div-modal-spinner').hide();
    $('#div-modal-status-alert').show();
    createLoggerInfo("backup cloud vm snapshot spawn error : " + data);
  });
});
/** cloud vm snap backup modal 관련 action end */

/** Mold 서비스 제어 관련 action start */
$('#button-execution-modal-mold-service-control').on('click', function(){

  var valSelect = $('#form-select-mold-service-control option:selected').val();
  var txtSelect = $('#form-select-mold-service-control option:selected').text();

  $('#div-modal-mold-service-control').hide();
  $('#div-modal-spinner-header-txt').text('Mold 서비스를 '+txtSelect+'하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("Mold 서비스 "+txtSelect+" 실패");
  $("#modal-status-alert-body").html("Mold 서비스 "+txtSelect+"을(를) 실패하였습니다. 클라우드센터VM 상태를 점검해주세요.");

  // Mold 서비스 작업
  cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_service/ccvm_service_control.py', valSelect, '-sn', 'mold.service'])
  .then(function(data){
    $('#div-modal-spinner').hide();
    var retVal = JSON.parse(data);
    if(retVal.code == 200){
      $("#modal-status-alert-title").html("Mold 서비스 "+txtSelect+" 완료");
      $("#modal-status-alert-body").html("Mold 서비스 "+txtSelect+"을(를) 완료하였습니다.");
      $('#div-modal-status-alert').show();
      createLoggerInfo("mold service control spawn success");
    } else {
      $('#div-modal-status-alert').show();
      createLoggerInfo(retVal.val);
    }
  }).catch(function(data){
    $('#div-modal-spinner').hide();
    $('#div-modal-status-alert').show();
    createLoggerInfo("mold service control spawn error : " + data);
  });
});
/** Mold 서비스 제어 modal 관련 action end */

$('#button-execution-modal-mold-db-control').on('click', function(){

  var valSelect = $('#form-select-mold-db-control option:selected').val();
  var txtSelect = $('#form-select-mold-db-control option:selected').text();

  $('#div-modal-mold-db-control').hide();
  $('#div-modal-spinner-header-txt').text('Mold DB를 '+txtSelect+'하고 있습니다.');
  $('#div-modal-spinner').show();

  $("#modal-status-alert-title").html("Mold DB "+txtSelect+" 실패");
  $("#modal-status-alert-body").html("Mold DB "+txtSelect+"을(를) 실패하였습니다. 클라우드센터VM 상태를 점검해주세요.");

  // Mold DB 작업
  cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_service/ccvm_service_control.py', valSelect, '-sn', 'mysqld'])
  .then(function(data){
    $('#div-modal-spinner').hide();
    var retVal = JSON.parse(data);
    if(retVal.code == 200){
      $("#modal-status-alert-title").html("Mold DB "+txtSelect+" 완료");
      $("#modal-status-alert-body").html("Mold DB "+txtSelect+"을(를) 완료하였습니다.");
      $('#div-modal-status-alert').show();
      createLoggerInfo("mold db control spawn success");
    } else {
      $('#div-modal-status-alert').show();
      createLoggerInfo(retVal.val);
    }
  }).catch(function(data){
    $('#div-modal-spinner').hide();
    $('#div-modal-status-alert').show();
    createLoggerInfo("mold db control spawn error : " + data);
  });
});
/** Mold DB 제어 modal 관련 action end */

/** 2차 스토리지 size 확장 제어 관련 action start */
$('#button-mold-secondary-size-expansion').on('click', function(){
  $('#input-checkbox-mold-secondary-size-expansion').prop('checked',false);
  $('#form-input-mold-secondary-size-expansion').val("");
  $('#div-modal-mold-secondary-size-expansion').show();
});

$('#button-close-mold-secondary-size-expansion').on('click', function(){
  $('#div-modal-mold-secondary-size-expansion').hide();
});

$('#button-cancel-modal-mold-secondary-size-expansion').on('click', function(){
  $('#div-modal-mold-secondary-size-expansion').hide();
});

$('#button-execution-modal-mold-secondary-size-expansion').on('click', function(){
  if($('#input-checkbox-mold-secondary-size-expansion').is(":checked")){
    if(secondarySizeExpansionCheck()){
      $('#div-modal-mold-secondary-size-expansion').hide();
      $('#div-modal-spinner-header-txt').text('2차 스토리지 용량을 추가하고 있습니다.');
      $('#div-modal-spinner').show();

      $("#modal-status-alert-title").html("2차 스토리지 용량 추가 실패");
      $("#modal-status-alert-body").html("2차 스토리지 용량 실패하였습니다");

      // 2차 스토리지 size 확장 작업
      var addImageSize = $('#form-input-mold-secondary-size-expansion').val();
      cmd = ['/usr/bin/python3', pluginpath + '/python/vm/ccvm_secondary_resize.py', '--add-size', addImageSize];
      console.log(cmd);
      cockpit.spawn(cmd, { host: pcs_exe_host})
      .then(function(data){
        $('#div-modal-spinner').hide();
        var retVal = JSON.parse(data);
        if(retVal.code == 200){
          $("#modal-status-alert-title").html("2차 스토리지 용량 추가 완료");
          $("#modal-status-alert-body").html("2차 스토리지 용량 추가을 완료하였습니다.");
          $('#div-modal-status-alert').show();
          createLoggerInfo("2차 스토리지 size expansion spawn success");
        } else {
          $('#div-modal-status-alert').show();
          createLoggerInfo(retVal.val);
        }
      }).catch(function(data){
        $('#div-modal-spinner').hide();
        $('#div-modal-status-alert').show();
        createLoggerInfo("2차 스토리지 size expansion spawn error : " + data);
      });
    }
  }else{
    alert("용량 추가 작업 진행 여부를 체크해 주세요.");
  }
});


function secondarySizeExpansionCheck(){
  var validate_check = true;
  var addImageSize = $('#form-input-mold-secondary-size-expansion').val();

  if (addImageSize == "") {
    alert("추가 용량을 입력해주세요.");
    validate_check = false;
  } else if (!numberCheck(addImageSize)) {
    alert("추가 용량에 숫자만 입력해주세요.");
    validate_check = false;
  } else if (addImageSize > 500) {
    alert("추가 용량은 500 GiB 이하만 입력가능합니다.");
    validate_check = false;
  } else if (addImageSize <= 0) {
    alert("추가 용량은 1 GiB 이상만 입력가능합니다.");
    validate_check = false;
  }

  return validate_check;
}
/** 2차 스토리지 size 확장 제어 관련 action end */

/** 설정파일 다운로드 modal 관련 action start */
$('#button-config-file-download').on('click', function(){
  $('#div-modal-config-file-download').show();
  if (typeof window.refreshSecurityEvidenceDownloadLink === 'function') {
    window.refreshSecurityEvidenceDownloadLink();
  }

  cockpit.file("/root/.ssh/id_rsa").read()
  .then((content, tag) => {
    let pri_ssh_key_download = 'span-modal-wizard-cluster-config-pri-sshkey-download';
    // 다운로드 링크 생성 전 유효성 검정
    if (content != "" && content != null) {
      downloadAsFile(pri_ssh_key_download, content, "id_rsa");
    } else {
      alert("/root/.ssh/id_rsa 파일이 존재하지 않습니다.");
    }
  })
  .catch(error => {
    alert(error);
  });

  cockpit.file("/root/.ssh/id_rsa.pub").read()
  .then((content, tag) => {
    let pub_ssh_key_download = 'span-modal-wizard-cluster-config-pub-sshkey-download';
    // 다운로드 링크 생성 전 유효성 검정
    if (content != "" && content != null) {
      downloadAsFile(pub_ssh_key_download, content, "id_rsa.pub");
    } else {
      alert("/root/.ssh/id_rsa.pub 파일이 존재하지 않습니다.");
    }
  })
  .catch(error => {
    alert(error);
  });

  cockpit.file(pluginpath + "/tools/properties/cluster.json").read()
  .then((content, tag) => {
    let hosts_download = 'span-modal-wizard-cluster-config-hosts-file-download';
    // 다운로드 링크 생성 전 유효성 검정
    if (content != "" && content != null) {
      downloadAsFile(hosts_download, content, "cluster.json");
    } else {
      alert("cluster.json 파일이 존재하지 않습니다.");
    }
  })
  .catch(error => {
    alert(error);
  });
});

$('#button-close-config-file-download').on('click', function(){
  $('#div-modal-config-file-download').hide();
});

$('#button-cancel-modal-config-file-download').on('click', function(){
  $('#div-modal-config-file-download').hide();
});

function downloadAsFile(id, str, filename) {
  $('#' + id).attr({
    target: '_blank',
    href: 'data:attachment/text,' + encodeURI(str),
    download: filename
  });
}

/** 설정파일 다운로드 modal 관련 action end */

$('#cloud-cluster-connect').on('click', function(){
  //클라우드센터 연결
  cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/url/create_address.py', 'cloudCenter'])
  .then(function(data){
    var retVal = JSON.parse(data);
    if(retVal.code == 200){
      window.open(retVal.val);
    }else{
      $("#modal-status-alert-title").html("클라우드센터 연결");
      $("#modal-status-alert-body").html(retVal.val);
      $('#div-modal-status-alert').show();
    }
    createLoggerInfo("cloud cluster connect success");
  })
  .catch(function(data){
    createLoggerInfo("cloud cluster connect error");
    console.log('cloud-cluster-connect');
  });
});

// 클라우드 센터 클러스터 상태 조회 및 조회 결과값으로 화면 변경하는 함수
function CardCloudClusterStatus(){
  return new Promise((resolve) => {
    //초기 상태 체크 중 표시
    $('#cccs-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
    $("#cccs-back-color").attr('class','pf-v6-c-label pf-m-orange');
    $("#cccs-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');

    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsDetail' ], { host: pcs_exe_host})
    .then(function(data){
      cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ablestack_json/ablestackJson.py', 'status', '--depth1', 'bootstrap', '--depth2', 'ccvm' ])
        .then(function (bootstrap_data){
          console.log("ablestackJson.py : "+bootstrap_data);
          var retVal = JSON.parse(bootstrap_data);
          var ccvmStatus = retVal.val;
          console.log("ccvmStatus.ccvm = " + ccvmStatus.ccvm);
          if(ccvmStatus.ccvm == 'false'){
            sessionStorage.setItem("ccvm_bootstrap_status","false");
            console.log('ccvm false in')
            $('#ccvm-after-bootstrap-run').html('');
            $('#ccvm-before-bootstrap-run').html('<a class="pf-v6-c-menu__item pf-m-disabled" href="#" id="menu-item-bootstrap-run-ccvm" onclick="ccvm_bootstrap_run()">클라우드센터 구성하기</a>');
          }else if (ccvmStatus.ccvm == 'true'){
            sessionStorage.setItem("ccvm_bootstrap_status","true");
            console.log('ccvm true in')
            $('#ccvm-after-bootstrap-run').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-linkto-storage-center-ccvm" onclick="cccc_link_go()">클라우드센터 연결</a>');
            $('#ccvm-before-bootstrap-run').html('');
          }
        }).catch(function(data){
        console.log('ClusterStatusInfo spawn error(ablestackJson.py');

      });
      cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ablestack_json/ablestackJson.py', 'status', '--depth1', 'monitoring', '--depth2', 'wall' ])
        .then(function (monitoring_data){
          console.log("ablestackJson.py : "+monitoring_data);
          var retVal = JSON.parse(monitoring_data);
          var wallStatus = retVal.val;
          console.log("wallStatus.wall = " + wallStatus.wall);
          if(wallStatus.wall == 'false'){
            sessionStorage.setItem("wall_monitoring_status","false");
            console.log('wall false in')
            $('#ccvm-before-monitoring-run').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-monitoring-run-ccvm" onclick="wall_monitoring_run()">모니터링센터 구성</a>');
            $('#ccvm-after-monitoring-run').html('');
            $('#ccvm-monitoring-config-update').html('');
          }else if (wallStatus.wall == 'true'){
            sessionStorage.setItem("wall_monitoring_status","true");
            console.log('wall true in')
            $('#ccvm-before-monitoring-run').html('');
            $('#ccvm-after-monitoring-run').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-linkto-wall" onclick="wall_link_go()">모니터링센터 대시보드 연결</a>');
            $('#ccvm-monitoring-config-update').html('<a class="pf-v6-c-menu__item" href="#" id="menu-item-update-wall-config" onclick="wall_config_update_modal()">모니터링센터 수집 정보 업데이트</a>');
          }
        }).catch(function(data){
          createLoggerInfo("ClusterStatusInfo spawn error(ablestackJson.py error");
          console.log('ClusterStatusInfo spawn error(ablestackJson.py');
      });
      var retVal = JSON.parse(data);
      console.log(retVal);
      if(retVal.code == '200'){
        var nodeText = '( ';
        var selectHtml = '<option selected="" value="null">노드를 선택해주세요.</option>';
        $('#form-select-cloud-vm-migration-node option').remove();

        for(var i=0; i<Object.keys(retVal.val.clustered_host).length; i++){
          nodeText = nodeText +retVal.val.clustered_host[i];
          if(retVal.val.clustered_host[i] != retVal.val.started){
            selectHtml = selectHtml + '<option value="' + retVal.val.clustered_host[i] + '">' + retVal.val.clustered_host[i] + '</option>';
          }
          if(i == (Object.keys(retVal.val.clustered_host).length - 1)){

            nodeText = nodeText + ' )';
          }else{
            nodeText = nodeText + ', ';
          }
        }
        $('#cccs-back-color').attr('class','pf-v6-c-label pf-m-green');
        $('#cccs-cluster-icon').attr('class','fas fa-fw fa-check-circle');
        $('#cccs-status').text('Health Ok');
        $('#cccs-node-info').text('총 ' + Object.keys(retVal.val.clustered_host).length + '노드로 구성됨 : ' + nodeText);
        sessionStorage.setItem("cc_status", "HEALTH_OK");
        if(retVal.val.active == 'true'){
          $('#cccs-resource-status').text('실행중');
          $('#cccs-execution-node').text(retVal.val.started);

          $("#button-cloud-cluster-start").addClass('pf-m-disabled');
          $("#button-cloud-cluster-stop").removeClass('pf-m-disabled');
          $("#button-cloud-cluster-delete").addClass('pf-m-disabled');
          $("#button-cloud-cluster-cleanup").removeClass('pf-m-disabled');
          $("#button-cloud-cluster-migration").removeClass('pf-m-disabled');
          $("#button-cloud-cluster-connect").removeClass('pf-m-disabled');
          $("#card-action-cloud-vm-change").addClass('pf-m-disabled');
          $("#button-cloud-vm-snap-backup").removeClass('pf-m-disabled');
          $("#button-cloud-vm-snap-rollback").addClass('pf-m-disabled');
          $("#button-mold-service-control").removeClass('pf-m-disabled');
          $("#button-mold-db-control").removeClass('pf-m-disabled');
          $("#button-mold-secondary-size-expansion").removeClass('pf-m-disabled');
          $("#card-action-cloud-vm-db-dump").removeClass('pf-m-disabled');
          $("#menu-item-set-auto-shutdown-step-two").removeClass('pf-m-disabled');

          $('#form-select-cloud-vm-migration-node').append(selectHtml);
        }else if(retVal.val.active == 'false'){
          $('#cccs-resource-status').text('정지됨');
          $('#cccs-execution-node').text('N/A');
          $('#div-mold-service-status').text('N/A');
          $('#div-mold-db-status').text('N/A');

          $("#button-cloud-cluster-start").removeClass('pf-m-disabled');
          $("#button-cloud-cluster-stop").addClass('pf-m-disabled');
          $("#button-cloud-cluster-delete").removeClass('pf-m-disabled');
          $("#button-cloud-cluster-cleanup").removeClass('pf-m-disabled');
          $("#button-cloud-cluster-migration").addClass('pf-m-disabled');
          $("#button-cloud-cluster-connect").addClass('pf-m-disabled');
          $("#card-action-cloud-vm-change").removeClass('pf-m-disabled');
          $("#button-cloud-vm-snap-backup").removeClass('pf-m-disabled');
          $("#button-cloud-vm-snap-rollback").removeClass('pf-m-disabled');
          $("#button-mold-service-control").addClass('pf-m-disabled');
          $("#button-mold-db-control").addClass('pf-m-disabled');
          $("#button-mold-secondary-size-expansion").addClass('pf-m-disabled');
          $("#card-action-cloud-vm-db-dump").addClass('pf-m-disabled');
          $("#menu-item-set-auto-shutdown-step-two").addClass('pf-m-disabled');
        }
        $('#cccs-low-info').text('클라우드센터 클러스터가 구성되었습니다.');
        applyCardStatusTone($('#cccs-low-info'), "ok");
      }else if(retVal.code == '400' && retVal.val == 'cluster is not configured.'){
        $('#cccs-status').text('Health Err');
        $('#cccs-back-color').attr('class','pf-v6-c-label pf-m-red');
        $('#cccs-cluster-icon').attr('class','fas fa-fw fa-exclamation-triangle');
        $('#cccs-low-info').text('클라우드센터 클러스터가 구성되지 않았습니다.');
        applyCardStatusTone($('#cccs-low-info'), "danger");
        sessionStorage.setItem("cc_status", "HEALTH_ERR1");
      }else if(retVal.code == '400' && retVal.val == 'resource not found.'){
        $('#cccs-status').text('Health Err');
        $('#cccs-back-color').attr('class','pf-v6-c-label pf-m-red');
        $('#cccs-cluster-icon').attr('class','fas fa-fw fa-exclamation-triangle');
        $('#cccs-low-info').text('클라우드센터 클러스터는 구성되었으나 리소스 구성이 되지 않았습니다.');
        applyCardStatusTone($('#cccs-low-info'), "warn");
        sessionStorage.setItem("cc_status", "HEALTH_ERR2");
      }else{
        createLoggerInfo("ClusterStatusInfo spawn error");
        console.log('ClusterStatusInfo spawn error');
      }
      resolve();
    }).catch(function(data){
      createLoggerInfo("ClusterStatusInfo spawn error");
      console.log('ClusterStatusInfo spawn error');
      resolve();
    });
  });
}
/**
 * Meathod Name : license_check
 * Date Created : 2025.05.19
 * Writer : 정민철
 * Description : 라이선스 유무 판단하여 ccvm bootstrap 활성화
 * Parameter : 없음
 * Return : 없음
 * History : 2025.05.19 최초 작성
 */

function applyCardStatusTone($target, tone) {
  if (typeof setStatusTone === "function") {
    setStatusTone($target, tone);
    return;
  }
  if (!$target || !$target.length) {
    return;
  }
  $target.removeClass("ablestack-status-ok ablestack-status-warn ablestack-status-danger");
  $target.addClass("ablestack-status-text");
  if (tone) {
    $target.addClass(`ablestack-status-${tone}`);
  }
  $target.removeAttr("style");
}
function license_check(){
  cmd = ["curl", "-s", "-k", "https://localhost:8080/api/v1/license"];
  cockpit.spawn(cmd).then(function(data){
    var retVal = JSON.parse(data);
    if(retVal.code == 500){
      var license_type = "";
      cmd = ['python3', pluginpath + '/python/ablestack_json/ablestackJson.py', 'update', '--depth1', 'license', '--depth2', 'status', '--value', 'false'];
      cockpit.spawn(cmd).then(function(data){
        var retVal = JSON.parse(data);
        if(retVal.code == 200){
          cmd = ['python3', pluginpath + '/python/ablestack_json/ablestackJson.py', 'update', '--depth1', 'license', '--depth2', 'type', '--value', license_type];
          cockpit.spawn(cmd).then(function(data){
            var retVal = JSON.parse(data);
            if(retVal.code == 200){
              console.log("License check result: No license found");
            }
          })
        }
      })
      sessionStorage.setItem("license_type", license_type);
      $('#ccvm-before-bootstrap-run').show();
      $('#menu-item-bootstrap-run-ccvm').removeClass('pf-m-disabled');
      $('#ccvm-before-bootstrap-run').hide();
      if (!$('#menu-item-bootstrap-run-ccvm').hasClass('pf-m-disabled')) {
        $('#menu-item-bootstrap-run-ccvm').addClass('pf-m-disabled');
      }
    }else{
      var date = new Date();
      var local_date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      var retVal = JSON.parse(retVal);
      var license_type = retVal.oem;
      var expired_date_str = retVal.expired;
      var expired_date_parts = expired_date_str.split("-");
      var expired_date = new Date(
        parseInt(expired_date_parts[0]),
        parseInt(expired_date_parts[1]) - 1,
        parseInt(expired_date_parts[2])
      );
      if (local_date > expired_date){
        $('#ccvm-before-bootstrap-run').hide();
        if (!$('#menu-item-bootstrap-run-ccvm').hasClass('pf-m-disabled')) {
          $('#menu-item-bootstrap-run-ccvm').addClass('pf-m-disabled');
        }
      }else{
        cmd = ['python3', pluginpath + '/python/ablestack_json/ablestackJson.py', 'update', '--depth1', 'license', '--depth2', 'status', '--value', 'true'];
        cockpit.spawn(cmd).then(function(data){
          var retVal = JSON.parse(data);
          if(retVal.code == 200){
            cmd = ['python3', pluginpath + '/python/ablestack_json/ablestackJson.py', 'update', '--depth1', 'license', '--depth2', 'type', '--value', license_type];
            cockpit.spawn(cmd).then(function(data){
              var retVal = JSON.parse(data);
              if(retVal.code == 200){
                console.log("license check update success");
              }else{
                console.log("license check update error");
              }
            })
          }
        })
        sessionStorage.setItem("license_type", license_type);
        $('#ccvm-before-bootstrap-run').show();
        $('#menu-item-bootstrap-run-ccvm').removeClass('pf-m-disabled');
      }
    }
  });
}
/**
 * Meathod Name : scvm_bootstrap_run
 * Date Created : 2021.04.13
 * Writer : 이석민
 * Description : ccvm /root/bootstrap.sh 파일 실행
 * Parameter : 없음
 * Return : 없음
 * History : 2021.04.13 최초 작성
 */
function ccvm_bootstrap_run(){
  $("#modal-status-alert-title").html("클라우드 센터 가상머신 상태 체크");
  $("#modal-status-alert-body").html("클라우드센터 가상머신이 구성되지 않아<br>클라우드센터를 구성할 수 없습니다.<br><br>잠시 후 다시 실행해 주세요.");
  createLoggerInfo("ccvm_bootstrap_run() start");
  //scvm ping 체크
  cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "ping", "--target", "ccvm"])
    .then(function(data){
      var retVal = JSON.parse(data);
      if(retVal.code == 200){
        //scvm 의 cloudinit 실행이 완료되었는지 확인하기 위한 명렁
        cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "status", "--target", "ccvm"])
          .then(function(data){
            var retVal = JSON.parse(data);
            console.log('cloudinit-status : '+retVal.val);
            //cloudinit status: done 일때
            if(retVal.code == 200 && retVal.val == "status: done"){
              $('#modal-title-scvm-status').text("클라우드센터 구성하기");
              $('#modal-description-scvm-status').html("<p>클라우드센터를 구성하시겠습니까?</p>");
              $('#button-storage-vm-status-update').html("실행");
              $('#scvm-status-update-cmd').val("bootstrap_ccvm");
              $('#div-modal-storage-vm-status-update').show();
            }else{
              $('#div-modal-status-alert').show();
            }
          })
          .catch(function(data){
            createLoggerInfo(":::ccvm_bootstrap_run() Error ::: error");
            $('#div-modal-status-alert').show();
            console.log(":::ccvm_bootstrap_run() Error :::" + data);
          });
      }else{
        $('#div-modal-status-alert').show();
      }
    })
    .catch(function(data){
      createLoggerInfo(":::scvm_bootstrap_run() Error ::: error");
      $('#div-modal-status-alert').show();
      console.log(":::scvm_bootstrap_run() Error :::" + data);
    });
}

function cccc_link_go(){
  // 클라우드센터 연결
  createLoggerInfo("cccc_link_go() start");
  cockpit.spawn(["python3", pluginpath+"/python/url/create_address.py", "cloudCenter"])
    .then(function(data){
      var retVal = JSON.parse(data);
      if(retVal.code == 200){
        window.open(retVal.val);
      }else{
        alert("클라우드센터에 연결할 수 없습니다.\n클라우드센터 가상머신 및 Mold 서비스를 확인해주세요.");
      }
    })
    .catch(function(data){
      //console.log(":::Error:::");
    });
}

/**
 * Meathod Name : wall_monitoring_modal_show
 * Date Created : 2021.09.1
 * Writer : 배태주
 * Description : wall 모니터링 배포 마법사 실행
 * Parameter : 없음
 * Return : 없음
 * History : 2021.09.01 최초 작성
 */
 function wall_monitoring_modal_show(){

  const step7 = sessionStorage.getItem("ccvm_bootstrap_status");

  if(step7=="true"){
    $('#div-modal-wizard-wall-monitoring').show();
  }else{
    $('#div-modal-status-alert').show();
  }
 }

/**
 * Meathod Name : wall_monitoring_run
 * Date Created : 2021.09.01
 * Writer : 배태주
 * Description : wall 모니터링 배포 마법사 실행
 * Parameter : 없음
 * Return : 없음
 * History : 2021.09.01 최초 작성
 */
 function wall_monitoring_run(){
  $("#modal-status-alert-title").html("클라우드 센터 가상머신 상태 체크");
  $("#modal-status-alert-body").html("클라우드 센터 가상머신에 cloudinit 실행이 완료되지 않아<br>모니터링센터 구성을 실행할 수 없습니다.<br><br>잠시 후 다시 실행해 주세요.");
  //ccvm ping 체크
  cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "ping", "--target", "ccvm"])
    .then(function(data){
      var retVal = JSON.parse(data);
      if(retVal.code == 200){
        //ccvm 의 cloudinit 실행이 완료되었는지 확인하기 위한 명렁
        cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "status", "--target", "ccvm"])
          .then(function(data){
            var retVal = JSON.parse(data);
            console.log('cloudinit-status : '+retVal.val);

            //cloudinit status: done 이면서 진행단계가 step7이 완료 되었을때
            step7 = sessionStorage.getItem("ccvm_bootstrap_status");
            if(retVal.code == 200 && retVal.val == "status: done" && step7 == "true"){
              $('#div-modal-wizard-wall-monitoring').show();
              autoConfigWallIP();
            }else{
              $('#div-modal-status-alert').show();
            }
          })
          .catch(function(data){
            $('#div-modal-status-alert').show();
            console.log(":::ccvm_bootstrap_run() Error :::" + data);
          });
      }else{
        $('#div-modal-status-alert').show();
      }
    })
    .catch(function(data){
      $('#div-modal-status-alert').show();
      console.log(":::scvm_bootstrap_run() Error :::" + data);
    });
}

function wall_link_go(){
  // 모니터링센터 대시보드 연결
  cockpit.spawn(["python3", pluginpath+"/python/url/create_address.py", "wallCenter"])
    .then(function(data){
      var retVal = JSON.parse(data);
      if(retVal.code == 200){
        window.open(retVal.val);
      }else{
        alert("모니터링센터 대시보드에 연결할 수 없습니다.\n클라우드센터 가상머신 및 Wall 서비스를 확인해주세요.");
      }
    })
    .catch(function(data){
      //console.log(":::Error:::");
    });
}
