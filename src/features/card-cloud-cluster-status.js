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
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsStart'])
    .then(function(data){
        var retVal = JSON.parse(data);

        if(retVal.code == 200){
            CardCloudClusterStatus();
        }
        $('#div-modal-spinner').hide();
    }).catch(function(data){
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
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsStop'])
    .then(function(data){
        var retVal = JSON.parse(data);

        if(retVal.code == 200){
            CardCloudClusterStatus();
        }
        $('#div-modal-spinner').hide();
    }).catch(function(data){
        console.log('button-execution-modal-cloud-vm-stop spawn error');
    });
    
});
/** cloud vm stop modal 관련 action end */

/** cloud vm cleanup modal 관련 action start */
$('#button-cloud-cluster-cleanup').on('click', function(){
    $('#div-modal-cleanup-cloud-vm').show();
});
$('#button-close-modal-cloud-vm-cleanup').on('click', function(){
    $('#div-modal-migration-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-cleanup').on('click', function(){
    $('#dropdown-menu-cloud-cluster-status').toggle();
    $('#div-modal-cleanup-cloud-vm').hide();
    $('#div-modal-spinner-header-txt').text('클라우드센터 클러스터를 클린업하고 있습니다.');
    $('#div-modal-spinner').show();
    cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsCleanup'])
    .then(function(data){
        var retVal = JSON.parse(data);

    }).catch(function(data){
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
        cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsMigration', '--target', valSelect])
        .then(function(data){
            var retVal = JSON.parse(data);
            if(retVal.code == 200){
                CardCloudClusterStatus();
            }
            $('#div-modal-migration-cloud-vm-select').text('');
            $('#div-modal-spinner').hide();
        }).catch(function(data){
            console.log('cloud-cluster-cleanup spawn error');
        });
    }
});
/** cloud vm migration modal 관련 action end */

$('#button-cloud-cluster-migration').on('click', function(){
    $('#div-modal-migration-cloud-vm').show();
});

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
    })
    .catch(function(data){
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

        cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsDetail' ])
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
                }else if(retVal.val.active == 'false'){
                    $('#cccs-resource-status').text('정지됨');
                    $('#cccs-execution-node').text('N/A');
                    $('#button-cloud-cluster-start').prop('disabled', false);
                    $('#button-cloud-cluster-stop').prop('disabled', true);
                    $('#button-cloud-cluster-cleanup').prop('disabled', false);
                    $('#button-cloud-cluster-migration').prop('disabled', true);
                    $('#button-cloud-cluster-connect').prop('disabled', true);
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
                console.log('ClusterStatusInfo spawn error');
            }

            resolve();
        }).catch(function(data){
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
    $("#modal-status-alert-body").html("클라우드 센터 가상머신에 cloudinit 실행이 완료되지 않아~~~~~~~~~<br>Bootstrap을 실행할 수 없습니다.<br><br>잠시 후 다시 실행해 주세요.")
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

function cccc_link_go(){
    // 클라우드센터 연결
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
