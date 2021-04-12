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
        }
    })
    .catch(function(data){
        console.log('cloud-cluster-connect');
    });
});

// 클라우드 센터 클러스터 상태 조회 및 조회 결과값으로 화면 변경하는 함수
function CardCloudClusterStatus(){
    return new Promise((resolve) => {
        cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsDetail' ])
        .then(function(data){
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
                $('#cccs_back_color').attr('class','pf-c-label pf-m-green');
                $('#cccs_cluster_icon').attr('class','fas fa-fw fa-check-circle');
                $('#cccs_status').text('HEALTH OK');
                $('#cccs_node_info').text('총 ' + Object.keys(retVal.val.clustered_host).length + '노드로 구성됨 : ' + nodeText);
                sessionStorage.setItem("cc_status", "HEALTH_OK"); 
                if(retVal.val.active == 'true'){
                    $('#cccs_resource_status').text('실행중');
                    $('#cccs_execution_node').text(retVal.val.started);
                    $('#button-cloud-cluster-start').prop('disabled', true);
                    $('#button-cloud-cluster-stop').prop('disabled', false);
                    $('#button-cloud-cluster-cleanup').prop('disabled', false);
                    $('#button-cloud-cluster-migration').prop('disabled', false);
                    $('#button-cloud-cluster-connect').prop('disabled', false);
                    $('#form-select-cloud-vm-migration-node').append(selectHtml);
                }else if(retVal.val.active == 'false'){
                    $('#cccs_resource_status').text('정지됨');
                    $('#cccs_execution_node').text('N/A');
                    $('#button-cloud-cluster-start').prop('disabled', false);
                    $('#button-cloud-cluster-stop').prop('disabled', true);
                    $('#button-cloud-cluster-cleanup').prop('disabled', false);
                    $('#button-cloud-cluster-migration').prop('disabled', true);
                    $('#button-cloud-cluster-connect').prop('disabled', true);
                }
                $('#cccs-low-info').text('클라우드센터 클러스터가 구성되었습니다.');
                $('#cccs-low-info').attr('style','color: var(--pf-global--success-color--100)')
            }else if(retVal.code == '400' && retVal.val == 'cluster is not configured.'){
                $('#cccs_status').text('Health Err.');
                $('#cccs_back_color').attr('class','pf-c-label pf-m-red');
                $('#cccs_cluster_icon').attr('class','fas fa-fw fa-exclamation-triangle');
                $('#cccs-low-info').text('클라우드센터 클러스터가 구성되지 않았습니다.');
                sessionStorage.setItem("cc_status", "HEALTH_ERR1"); 
            }else if(retVal.code == '400' && retVal.val == 'resource not found.'){
                $('#cccs_status').text('Health Err.');
                $('#cccs_back_color').attr('class','pf-c-label pf-m-red');
                $('#cccs_cluster_icon').attr('class','fas fa-fw fa-exclamation-triangle');
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
