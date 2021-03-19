/**
 * File Name : card-cloud-cluster-status.js  
 * Date Created : 2020.03.08
 * Writer  : 이석민
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/

/** cloud vm start modal 관련 action start */
console.log("card-cloudcluster-status.js");
$('#button-close-modal-cloud-vm-start').on('click', function(){
    $('#dev-modal-start-cloud-vm').hide();
});

$('#button-cancel-modal-cloud-vm-start').on('click', function(){
    $('#dev-modal-start-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-start').on('click', function(){
    cockpit.spawn(['python3', '/usr/share/cockpit/ablestack/python/card-cloud-cluster-status.py', 'pcsStart'])
    .then(function(data){
        var retVal = JSON.parse(data);

        $('#cccs_resource_status').text(retVal.val.resourceStatus);
        $('#cccs_execution_node').text(retVal.val.executionNode);
        $('#button-cloud-cluster-start').prop('disabled',true);
        $('#button-cloud-cluster-stop').prop('disabled',false);
        $('#button-cloud-cluster-migration').prop('disabled',false);
        $('#button-cloud-cluster-connect').prop('disabled',false);

    })
    .catch(function(data){
        console.log('cloud-cluster-start spawn error');
    });

    $('#dev-modal-start-cloud-vm').hide();
});
/** cloud vm start modal 관련 action end */


/** cloud vm stop modal 관련 action start */
$('#button-close-modal-cloud-vm-stop').on('click', function(){
    $('#dev-modal-stop-cloud-vm').hide();
});

$('#button-cancel-modal-cloud-vm-stop').on('click', function(){
    $('#dev-modal-stop-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-stop').on('click', function(){
    cockpit.spawn(['python3', '/usr/share/cockpit/ablestack/python/card-cloud-cluster-status.py', 'pcsStop'])
    .then(function(data){
        var retVal = JSON.parse(data);

        $('#cccs_resource_status').text(retVal.val.resourceStatus);
        $('#cccs_execution_node').text(retVal.val.executionNode);
        $('#button-cloud-cluster-start').prop('disabled',false);
        $('#button-cloud-cluster-stop').prop('disabled',true);
        $('#button-cloud-cluster-migration').prop('disabled',true);
        $('#button-cloud-cluster-connect').prop('disabled',true);

    })
    .catch(function(data){

    });
    
    $('#dev-modal-stop-cloud-vm').hide();
});
/** cloud vm stop modal 관련 action end */

/** cloud vm cleanup modal 관련 action start */
$('#button-close-modal-cloud-vm-cleanup').on('click', function(){
    $('#dev-modal-migration-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-cleanup').on('click', function(){
    $('#dev-modal-cleanup-cloud-vm').hide();
});

$('#button-cancel-modal-cloud-vm-cleanup').on('click', function(){
    $('#dev-modal-cleanup-cloud-vm').hide();
});
/** cloud vm cleanup modal 관련 action end */

/** cloud vm migration modal 관련 action start */
$('#button-close-modal-cloud-vm-migration').on('click', function(){
    $('#dev-modal-migration-cloud-vm').hide();
});

$('#button-cancel-modal-cloud-vm-migration').on('click', function(){
    $('#dev-modal-migration-cloud-vm').hide();
});

$('#button-execution-modal-cloud-vm-migration').on('click', function(){
    $('#dev-modal-migration-cloud-vm').hide();
});
/** cloud vm migration modal 관련 action end */

$('#button-cloud-cluster-start').on('click', function(){
    $('#dev-modal-start-cloud-vm').show();
});

$('#button-cloud-cluster-stop').on('click', function(){
    $('#dev-modal-stop-cloud-vm').show();
});

$('#button-cloud-cluster-cleanup').on('click', function(){
    // console.log('cloud-cluster-cleanup start');
    // cockpit.spawn(['python3', '/usr/share/cockpit/ablestack/python/card-cloud-cluster-status.py', 'pcsCleanup'])
    // .then(function(data){

    // })
    // .catch(function(data){
    //     console.log('cloud-cluster-cleanup spawn error');
    // });
    $('#dev-modal-migration-cloud-vm').show();
});

$('#button-cloud-cluster-migration').on('click', function(){
    $('#dev-modal-migration-cloud-vm').show();
});

$('#button-cloud-cluster-connect').on('click', function(){
    console.log('cloud-cluster-connect click start');
    cockpit.spawn(['python3', '/usr/share/cockpit/ablestack/python/card-cloud-cluster-status.py', 'CCConnection'])
    .then(function(data){

    })
    .catch(function(data){
        console.log('cloud-cluster-connect spawn error');
    });
});

function CardCloudClusterStatus(){
    cockpit.spawn(['python3', '/usr/share/cockpit/ablestack/python/card-cloud-cluster-status.py', 'pcsDetail' ])
    .then(function(data){ 
        var retVal = JSON.parse(data);

        if(retVal.val.pcsClusterStatus == 'Health_OK'){
            $('#cccs_back_color').attr('class','pf-c-label pf-m-green');
            $('#cccs_cluster_icon').attr('class','fas fa-fw fa-check-circle');
        }else if(retVal.val.pcsClusterStatus == 'Health_Err'){
            $('#cccs_back_color').attr('class','pf-c-label pf-m-red');
            $('#cccs_cluster_icon').attr('class','fas fa-fw fa-exclamation-triangle');
        }else{
            $('#cccs_back_color').attr('class','pf-c-label');
            $('#cccs_cluster_icon').attr('class','fas fa-fw fa-times-circle');
        }
        
        $('#cccs_status').text(retVal.val.pcsClusterStatus);
        $('#cccs_node_info').text('총 ' + Object.keys(retVal.val.nodeConfig).length + '노드로 구성됨(' + retVal.val.nodeConfig.host1 + ' / ' + retVal.val.nodeConfig.host2 + ' / ' + retVal.val.nodeConfig.host3 + ')');
        $('#cccs_resource_status').text(retVal.val.resourceStatus);
        $('#cccs_execution_node').text(retVal.val.executionNode);
        $('#cccs-low-info').text('클라우드센터 클러스터가 구성되었습니다.');

        $('#button-cloud-cluster-start').prop('disabled',true);
        $('#button-cloud-cluster-stop').prop('disabled',false);
        $('#button-cloud-cluster-cleanup').prop('disabled',false);
        $('#button-cloud-cluster-migration').prop('disabled',false);
        $('#button-cloud-cluster-connect').prop('disabled',false);
    })
    .catch(function(data){
        console.log('CardCloudClusterStatus spawn error');
    });
}
