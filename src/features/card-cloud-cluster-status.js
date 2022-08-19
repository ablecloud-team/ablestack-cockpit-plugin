/**
 * File Name : card-cloud-cluster-status.js  
 * Date Created : 2020.03.08
 * Writer  : 이석민
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/
var role = '';
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
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsStart'], { host: ccvm_instance.cmdExeHost})
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
});
/** cloud vm start 관련 action end */


/** cloud vm stop modal 관련 action start */
$('#button-cloud-cluster-stop').on('click', function(){
    $('#div-modal-stop-cloud-vm').show();
});

$('#button-close-modal-cloud-vm-stop').on('click', function(){
    $('#div-modal-stop-cloud-vm').hide();
});

$('#button-cancel-modal-cloud-vm-stop').on('click', function(){
    $('#div-modal-stop-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-stop').on('click', function(){
    $('#dropdown-menu-cloud-cluster-status').toggle();
    $('#div-modal-stop-cloud-vm').hide();
    $('#div-modal-spinner-header-txt').text('클라우드센터VM을 정지하고 있습니다.');
    $('#div-modal-spinner').show();
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsStop'], { host: ccvm_instance.cmdExeHost})
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
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsCleanup'], { host: ccvm_instance.cmdExeHost})
    .then(function(data){
        var retVal = JSON.parse(data);
        createLoggerInfo("cloud cluster cleanup spawn success");
    }).catch(function(data){
        createLoggerInfo("cloud cluster cleanup spawn error");
        console.log('cloud-cluster-cleanup spawn error');
    });
    $('#div-modal-spinner').hide();
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
        cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsMigration', '--target', valSelect], { host: ccvm_instance.cmdExeHost})
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
/** cloud vm migration modal 관련 action end */

$('#button-cloud-cluster-migration').on('click', function(){
    $('#div-modal-migration-cloud-vm').show();
});

/** cloud vm snap rollback modal 관련 action start */

$('#button-cloud-vm-snap-rollback').on('click', function(){
    $('#form-select-cloud-vm-snap option').remove();
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_snap/ccvm_snap_action.py', 'list'])
    .then(function(data){
        var retVal = JSON.parse(data);
        if(retVal.code == 200){
            var selectHtml = '<option selected="" value="null">스냅샷을 선택해 주세요.</option>';
            for(var i = 0 ; i < retVal.val.length ; i++){
                var id = retVal.val[i].id;
                var name = retVal.val[i].name;
                var size = retVal.val[i].size/1024/1024/1024;
                var timestamp = retVal.val[i].timestamp;

                // selectHtml = selectHtml + '<option value="' + name + '"> ID : ' + id + ' \t/ 이름 : ' + name + ' \t/ 용량 : ' + size + ' \t/ 생성일시 : ' + timestamp + '</option>';
                selectHtml = selectHtml + '<option value="' + name + '"> ID : ' + id + ' \t/ 이름 : ' + name + '</option>';
            }

            $('#form-select-cloud-vm-snap').append(selectHtml);

            createLoggerInfo("cloudcenter vm snap select spawn success");
        }
        $('#div-modal-cloud-vm-snap-message').text('');
        $('#div-modal-spinner').hide();
    }).catch(function(data){
        createLoggerInfo("cloudcenter vm snap select spawn error");
        console.log('cloudcenter vm snap select spawn error');
    });

    $('#div-modal-cloud-vm-snap-rollback').show();
});

$('#button-close-modal-cloud-vm-snap-rollback').on('click', function(){
    $('#div-modal-cloud-vm-snap-rollback').hide();
});

$('#button-cancel-modal-cloud-vm-snap-rollback').on('click', function(){
    $('#div-modal-cloud-vm-snap-rollback').hide();
});

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

$('#button-close-modal-cloud-vm-snap-rollback-confirm').on('click', function(){
    $('#div-modal-cloud-vm-snap-rollback-confirm').hide();
});

$('#button-cancel-modal-cloud-vm-snap-rollback-confirm').on('click', function(){
    $('#div-modal-cloud-vm-snap-rollback-confirm').hide();
});

$('#button-execution-modal-cloud-vm-snap-rollback-confirm').on('click', function(){
    
    $('#div-modal-cloud-vm-snap-rollback-confirm').hide();
    $('#div-modal-spinner-header-txt').text('클라우드센터VM을 스냅샷 복구하고 있습니다.');
    $('#div-modal-spinner').show();

    $("#modal-status-alert-title").html("클라우드센터VM 스냅샷 복구 실패");
    $("#modal-status-alert-body").html("스냅샷 복구를 실패하였습니다. 클라우드센터VM 상태를 점검해주세요.</br>(클라우드센터VM이 정지상태인 경우에만 복구가능합니다.)");
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/pcs/main.py', 'status', '--resource', 'cloudcenter_res'])
    .then(function(data){
        var retVal = JSON.parse(data);
        if(retVal.code == 200 && retVal.role == "Stopped"){
            
            // 스냅샷 복구
            var valSelect = $('#form-select-cloud-vm-snap option:selected').val();
            cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_snap/ccvm_snap_action.py', 'rollback', "--snap-name", valSelect])
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
        }
    }).catch(function(data){
        $('#div-modal-spinner').hide();
        $('#div-modal-status-alert').show();
        createLoggerInfo("rollback cloud vm snapshot status error : " + data);
    });
});
/** cloud vm snap rollback modal 관련 action end */

/** cloud vm snap backup modal 관련 action start */
$('#button-cloud-vm-snap-backup').on('click', function(){
    $('#div-modal-cloud-vm-snap-backup').show();
});

$('#button-close-modal-cloud-vm-snap-backup').on('click', function(){
    $('#div-modal-cloud-vm-snap-backup').hide();
});

$('#button-cancel-modal-cloud-vm-snap-backup').on('click', function(){
    $('#div-modal-cloud-vm-snap-backup').hide();
});

$('#button-execution-modal-cloud-vm-snap-backup').on('click', function(){
    
    $('#div-modal-cloud-vm-snap-backup').hide();
    $('#div-modal-spinner-header-txt').text('클라우드센터VM 복구용 스냅샷을 생성하고 있습니다.');
    $('#div-modal-spinner').show();

    $("#modal-status-alert-title").html("클라우드센터VM 복구용 스냅샷 생성 실패");
    $("#modal-status-alert-body").html("복구용 스냅샷 생성을 실패하였습니다. 클라우드센터VM 상태를 점검해주세요.");

    // 복구용 스냅샷 생성
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_snap/ccvm_snap_action.py', 'backup'])
    .then(function(data){
        $('#div-modal-spinner').hide();

        var retVal = JSON.parse(data);
        if(retVal.code == 200){
            $("#modal-status-alert-title").html("클라우드센터VM 복구용 스냅샷 생성 완료");
            $("#modal-status-alert-body").html("스냅샷 복구용 스냅샷 생성을 완료하였습니다. 클라우드센터VM을 시작해주세요.");
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
$('#button-mold-service-control').on('click', function(){
    $('#div-modal-mold-service-control').show();
});

$('#button-close-mold-service-control').on('click', function(){
    $('#div-modal-mold-service-control').hide();
});

$('#button-cancel-modal-mold-service-control').on('click', function(){
    $('#div-modal-mold-service-control').hide();
});

$('#button-execution-modal-mold-service-control').on('click', function(){
    
    var valSelect = $('#form-select-mold-service-control option:selected').val();
    var txtSelect = $('#form-select-mold-service-control option:selected').text();

    $('#div-modal-mold-service-control').hide();
    $('#div-modal-spinner-header-txt').text('Mold 서비스를 '+txtSelect+'하고 있습니다.');
    $('#div-modal-spinner').show();////

    $("#modal-status-alert-title").html("Mold 서비스 "+txtSelect+" 실패");
    $("#modal-status-alert-body").html("Mold 서비스 "+txtSelect+"을(를) 실패하였습니다. 클라우드센터VM 상태를 점검해주세요.");

    // Mold 서비스 작업
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/ccvm_service/ccvm_service_control.py', valSelect, '-sn', 'cloudstack-management.service'])
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

/** Mold DB 제어 관련 action start */
$('#button-mold-db-control').on('click', function(){
    $('#div-modal-mold-db-control').show();
});

$('#button-close-mold-db-control').on('click', function(){
    $('#div-modal-mold-db-control').hide();
});

$('#button-cancel-modal-mold-db-control').on('click', function(){
    $('#div-modal-mold-db-control').hide();
});

$('#button-execution-modal-mold-db-control').on('click', function(){
    
    var valSelect = $('#form-select-mold-db-control option:selected').val();
    var txtSelect = $('#form-select-mold-db-control option:selected').text();

    $('#div-modal-mold-db-control').hide();
    $('#div-modal-spinner-header-txt').text('Mold DB를 '+txtSelect+'하고 있습니다.');
    $('#div-modal-spinner').show();////

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

$('#cloud-cluster-connect').on('click', function(){
    //클라우드센터 연결
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/url/create_address.py', 'cloudCenter'])
    .then(function(data){
        var retVal = JSON.parse(data);        
        if(retVal.code == 200){
            window.open(retVal.val);
        }else{
            $("#modal-status-alert-title").html("클라우드센터 연결")
            $("#modal-status-alert-body").html(retVal.val)
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
        $('#cccs-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
        $("#cccs-back-color").attr('class','pf-c-label pf-m-orange');
        $("#cccs-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');

        cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsDetail' ], { host: "10.10.3.1"})
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
                        $('#ccvm-before-bootstrap-run').html('<a class="pf-c-dropdown__menu-item" href="#" id="menu-item-bootstrap-run-ccvm" onclick="ccvm_bootstrap_run()">Bootstrap 실행</a>');
                    }else if (ccvmStatus.ccvm == 'true'){
                        sessionStorage.setItem("ccvm_bootstrap_status","true");
                        console.log('ccvm true in')
                        $('#ccvm-after-bootstrap-run').html('<a class="pf-c-dropdown__menu-item" href="#" id="menu-item-linkto-storage-center-ccvm" onclick="cccc_link_go()">클라우드센터 연결</a>');
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
                        $('#ccvm-after-monitoring-run').html('');
                        $('#ccvm-before-monitoring-run').html('<a class="pf-c-dropdown__menu-item" href="#" id="menu-item-monitoring-run-ccvm" onclick="wall_monitoring_run()">모니터링센터 구성</a>');
                    }else if (wallStatus.wall == 'true'){
                        sessionStorage.setItem("wall_monitoring_status","true");
                        console.log('wall true in')
                        el = '<a class="pf-c-dropdown__menu-item" href="#" id="menu-item-linkto-wall" onclick="wall_link_go()">모니터링센터 대시보드 연결</a>';
                        $('#ccvm-after-monitoring-run').html(el);
                        $('#ccvm-before-monitoring-run').html('');
                    }
                }).catch(function(data){
                    createLoggerInfo("ClusterStatusInfo spawn error(ablestackJson.py error");
                    console.log('ClusterStatusInfo spawn error(ablestackJson.py');

            });
            var retVal = JSON.parse(data);
            if(retVal.code == '200'){
                var nodeText = '(';
                var selectHtml = '<option selected="" value="null">노드를 선택해주세요.</option>';
                $('#form-select-cloud-vm-migration-node option').remove();

                for(var i=0; i<Object.keys(retVal.val.clustered_host).length; i++){
                    nodeText = nodeText +retVal.val.clustered_host[i];
                    if(retVal.val.clustered_host[i] != retVal.val.started){
                        selectHtml = selectHtml + '<option value="' + retVal.val.clustered_host[i] + '">' + retVal.val.clustered_host[i] + '</option>';
                    }
                    if(i == (Object.keys(retVal.val.clustered_host).length - 1)){

                        nodeText = nodeText + ')';
                    }else{
                        nodeText = nodeText + ',';
                    }
                }
                $('#cccs-back-color').attr('class','pf-c-label pf-m-green');
                $('#cccs-cluster-icon').attr('class','fas fa-fw fa-check-circle');
                $('#cccs-status').text('Health Ok');
                $('#cccs-node-info').text('총 ' + Object.keys(retVal.val.clustered_host).length + '노드로 구성됨 : ' + nodeText);
                sessionStorage.setItem("cc_status", "HEALTH_OK");
                if(retVal.val.active == 'true'){
                    $('#cccs-resource-status').text('실행중');
                    $('#cccs-execution-node').text(retVal.val.started);
                    $('#button-cloud-cluster-start').prop('disabled', true);
                    $('#button-cloud-cluster-stop').prop('disabled', false);
                    $('#button-cloud-cluster-cleanup').prop('disabled', false);
                    $('#button-cloud-cluster-migration').prop('disabled', false);
                    $('#button-cloud-cluster-connect').prop('disabled', false);
                    $('#form-select-cloud-vm-migration-node').append(selectHtml);
                    $('#card-action-cloud-vm-change').attr('disabled', true);
                    $('#button-cloud-vm-snap-rollback').attr('disabled', true);
                }else if(retVal.val.active == 'false'){
                    $('#cccs-resource-status').text('정지됨');
                    $('#cccs-execution-node').text('N/A');
                    $('#div-mold-service-status').text('N/A');
                    $('#div-mold-db-status').text('N/A');
                    $('#button-cloud-cluster-start').prop('disabled', false);
                    $('#button-cloud-cluster-stop').prop('disabled', true);
                    $('#button-cloud-cluster-cleanup').prop('disabled', false);
                    $('#button-cloud-cluster-migration').prop('disabled', true);
                    $('#button-cloud-cluster-connect').prop('disabled', true);
                    $('#card-action-cloud-vm-change').attr('disabled', false);
                    $('#button-cloud-vm-snap-rollback').attr('disabled', false);
                }
                $('#cccs-low-info').text('클라우드센터 클러스터가 구성되었습니다.');
                $('#cccs-low-info').attr('style','color: var(--pf-global--success-color--100)')
            }else if(retVal.code == '400' && retVal.val == 'cluster is not configured.'){
                $('#cccs-status').text('Health Err');
                $('#cccs-back-color').attr('class','pf-c-label pf-m-red');
                $('#cccs-cluster-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                $('#cccs-low-info').text('클라우드센터 클러스터가 구성되지 않았습니다.');
                sessionStorage.setItem("cc_status", "HEALTH_ERR1");
            }else if(retVal.code == '400' && retVal.val == 'resource not found.'){
                $('#cccs-status').text('Health Err');
                $('#cccs-back-color').attr('class','pf-c-label pf-m-red');
                $('#cccs-cluster-icon').attr('class','fas fa-fw fa-exclamation-triangle');
                $('#cccs-low-info').text('클라우드센터 클러스터는 구성되었으나 리소스 구성이 되지 않았습니다.');
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
 * Meathod Name : scvm_bootstrap_run
 * Date Created : 2021.04.13
 * Writer  : 이석민
 * Description : ccvm /root/bootstrap.sh  파일 실행
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.04.13 최초 작성
 */
function ccvm_bootstrap_run(){
    $("#modal-status-alert-title").html("클라우드 센터 가상머신 상태 체크")
    $("#modal-status-alert-body").html("클라우드 센터 가상머신에 cloudinit 실행이 완료되지 않아<br>Bootstrap을 실행할 수 없습니다.<br><br>잠시 후 다시 실행해 주세요.")
    createLoggerInfo("ccvm_bootstrap_run() start");
    //scvm ping 체크
    cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "ping", "--target",  "ccvm"])
        .then(function(data){
            var retVal = JSON.parse(data);
            if(retVal.code == 200){
                //scvm 의 cloudinit 실행이 완료되었는지 확인하기 위한 명렁
                cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "status", "--target",  "ccvm"])
                    .then(function(data){
                        var retVal = JSON.parse(data);
                        console.log('cloudinit-status : '+retVal.val);
                        //cloudinit status: done 일때
                        if(retVal.code == 200 && retVal.val == "status: done"){
                            $('#modal-title-scvm-status').text("클라우드 센터 가상머신 Bootstrap 실행");
                            $('#modal-description-scvm-status').html("<p>클라우드 센터 가상머신의 Bootstrap.sh 파일을 실행 하시겠습니까??</p>");
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
            }
        })
        .catch(function(data){
            //console.log(":::Error:::");
        });
}

/**
 * Meathod Name : wall_monitoring_modal_show
 * Date Created : 2021.09.1
 * Writer  : 배태주
 * Description : wall 모니터링 배포 마법사 실행
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.01 최초 작성
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
 * Writer  : 배태주
 * Description : wall 모니터링 배포 마법사 실행
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.01 최초 작성
 */
 function wall_monitoring_run(){
    $("#modal-status-alert-title").html("클라우드 센터 가상머신 상태 체크")
    $("#modal-status-alert-body").html("클라우드 센터 가상머신에 cloudinit 실행이 완료되지 않아<br>모니터링센터 구성을 실행할 수 없습니다.<br><br>잠시 후 다시 실행해 주세요.")
    //scvm ping 체크
    cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "ping", "--target",  "ccvm"])
        .then(function(data){
            var retVal = JSON.parse(data);
            if(retVal.code == 200){
                //scvm 의 cloudinit 실행이 완료되었는지 확인하기 위한 명렁
                cockpit.spawn(["python3", pluginpath+"/python/cloudinit_status/cloudinit_status.py", "status", "--target",  "ccvm"])
                    .then(function(data){
                        var retVal = JSON.parse(data);
                        console.log('cloudinit-status : '+retVal.val);

                        //cloudinit status: done 이면서 진행단계가 step7이 완료 되었을때
                        step7 = sessionStorage.getItem("ccvm_bootstrap_status");
                        if(retVal.code == 200 && retVal.val == "status: done" && step7 == "true"){
                            $('#div-modal-wizard-wall-monitoring').show();
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
            }
        })
        .catch(function(data){
            //console.log(":::Error:::");
        });
}
