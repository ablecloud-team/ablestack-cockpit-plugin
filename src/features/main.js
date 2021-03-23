/**
 * File Name : main.js  
 * Date Created : 2020.02.18
 * Writer  : 박동혁
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// document.ready 영역 시작



$(document).ready(function(){
    $('#dropdown-menu-storage-cluster-status').hide();
    $('#dropdown-menu-cloud-cluster-status').hide();
    $('#dropdown-menu-storage-vm-status').hide();
    $('#dropdown-menu-cloud-vm-status').hide();

    $('#div-modal-wizard-storage-vm').load("./src/features/storage-vm-wizard.html");
    $('#div-modal-wizard-storage-vm').hide();

    $('#div-modal-wizard-cluster-config-prepare').load("./src/features/cluster-config-prepare.html");
    $('#div-modal-wizard-cluster-config-prepare').hide();

    $('#div-modal-wizard-cloud-vm').load("./src/features/cloud-vm-wizard.html");
    $('#div-modal-wizard-cloud-vm').hide();

    $('#div-modal-storage-center-vm-resource-update').load("./src/features/storage-vm-resource-update.html");
    $('#div-modal-storage-center-vm-resource-update').hide();

    $('#div-modal-storage-cluster-maintenance-update').load("./src/features/storage-cluster-maintenance-update.html");
    $('#div-modal-storage-cluster-maintenance-update').hide();


    
    // 스토리지센터 클러스터 상태 조회 시작
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/scc_status_detail.py", "detail" ])
    .then(function(data){  
      
        var retVal = JSON.parse(data);
        //console.log(":::"+retVal);

        sessionStorage.setItem("cluster_status", retVal.val.cluster_status);
        sessionStorage.setItem("storage_cluster_maintenance_status", retVal.val.maintenance_status);

        //console.log(typeof retVal.val.maintenance_status);
        if(retVal.val.maintenance_status){            
            $("#menu-item-set-maintenance-mode").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            $("#menu-item-unset-maintenance-mode").attr('class','pf-c-dropdown__menu-item');
            
        }else{            
            $("#menu-item-set-maintenance-mode").attr('class','pf-c-dropdown__menu-item');
            $("#menu-item-unset-maintenance-mode").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        }

        if(retVal.val.cluster_status == "HEALTH_OK"){
            $("#scc_cluster_css").attr('class','pf-c-label pf-m-green');
            $("#scc_cluster_icon").attr('class','fas fa-fw fa-check-circle');            
        }else if(retVal.val.cluster_status == "HEALTH_WARN"){
            $("#scc_cluster_css").attr('class','pf-c-label pf-m-orange');
            $("#scc_cluster_icon").attr('class','fas fa-fw fa-exclamation-triangle');            
        }else if(retVal.val.cluster_status == "HEALTH_ERR"){
            $("#scc_cluster_css").attr('class','pf-c-label pf-m-red');
            $("#scc_cluster_icon").attr('class','fas fa-fw fa-exclamation-triangle');            
        }else{
            $("#scc_cluster_css").attr('class','pf-c-label');
            $("#scc_cluster_icon").attr('class','fas fa-fw fa-times-circle');            
        }        
        
        $('#scc_status').text(retVal.val.cluster_status);
        $('#scc_osd').text("전체 " + retVal.val.osd + "개의 디스크 중 " + retVal.val.osd_up + "개 작동 중");
        $('#scc_gw').text("RBD GW " + retVal.val.mon_gw1 + "개 제공중(quorum : " + retVal.val.mon_gw2 + ")");
        $('#scc_mgr').text(retVal.val.mgr + "(전체 " + retVal.val.mgr_cnt + "개 실행중)");
        $('#scc_pools').text(retVal.val.pools + " pools");
        $('#scc_usage').text("전체 " + retVal.val.avail + " 중 " +retVal.val.used + " 사용 중 (사용률 " + retVal.val.usage_percentage+ " %)" );

        if(retVal.code == 200){
            $('#scc_status_check').text("스토리지센터 클러스터가 구성되었습니다.");
            $('#scc_status_check').attr("style","color: var(--pf-global--success-color--100)");
        }else{
            $('#scc_status_check').text("스토리지센터 클러스터가 구성되지 않았습니다.");            
            $('#scc_status_check').attr("style","color: var(--pf-global--danger-color--100)");
        }

    })
    .catch(function(data){
        console.log(":::Error:::");
        $('#scc_status_check').text("토리지센터 클러스터가 구성되지 않았습니다.");
        $('#scc_status_check').attr("style","color: var(--pf-global--danger-color--100)");
    });
    


    // 스토리지센터 VM 상태 조회 시작
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_detail.py", "detail" ])
    .then(function(data){
        
        var retVal = JSON.parse(data);        

        sessionStorage.setItem("scvm_status", retVal.val.scvm_status);

        if(retVal.val.scvm_status == "running"){
            $("#scvm_css").attr('class','pf-c-label pf-m-green');
            $("#scvm_icon").attr('class','fas fa-fw fa-check-circle');            
        }else{
            $("#scvm_css").attr('class','pf-c-label');
            $("#scvm_icon").attr('class','fas fa-fw fa-times-circle');            
        }

        
        $('#scvm_status').text(retVal.val.scvm_status.toUpperCase());
        $('#scvm_cpu').text(retVal.val.vcpu + " vCore");
        //$('#scvm_cpu').text(retVal.val.vcpu + "vCore(" + retVal.val.socket + " Socket, "+retVal.val.core+" Core)");
        $('#scvm_memory').text(retVal.val.memory);
        $('#scvm_rdisk').text(retVal.val.rdisk);
        $('#scvm_manage_nic_type').text("NIC Type : " + retVal.val.manageNicType + " (Parent : " + retVal.val.manageNicParent + ")");
        $('#scvm_manage_nic_ip').text("IP : " + retVal.val.manageNicIp);
        $('#scvm_manage_nic_gw').text("GW : " + retVal.val.manageNicGw);
        $('#scvm_storage_server_nic_type').text("서버용 NIC Type : " + retVal.val.storageServerNicType + " (Parent : " + retVal.val.storageServerNicParent + ")");
        $('#scvm_storage_server_nic_ip').text("서버용 IP : " + retVal.val.storageServerNicIp);
        $('#scvm_storage_replication_nic_type').text("복제용 NIC Type : " + retVal.val.storageReplicationNicType + " (Parent : " + retVal.val.storageReplicationNicParent + ")");
        $('#scvm_storage_replication_nic_ip').text("복제용 IP : " + retVal.val.storageReplicationNicIp);
        $('#scvm_storage_datadisk_type').text("Disk Type : " + retVal.val.dataDiskType);


        if(retVal.code == 200){
            $('#scvm_deploy_status_check').text("스토리지센터 가상머신이 배포되었습니다.");
            $('#scvm_deploy_status_check').attr("style","color: var(--pf-global--success-color--100)");
        }else{
            $('#scvm_deploy_status_check').text("스토리지센터 가상머신이 배포되지 않았습니다.");            
            $('#scvm_deploy_status_check').attr("style","color: var(--pf-global--danger-color--100)");
        }

    })
    .catch(function(data){
        console.log(":::Error:::");
        $('#scvm_deploy_status_check').text("스토리지센터 가상머신이 배포되지 않았습니다.");
        $('#scvm_deploy_status_check').attr("style","color: var(--pf-global--danger-color--100)");
    });

});

// document.ready 영역 끝

// 이벤트 처리 함수
$('#card-action-storage-cluster-status').on('click', function(){
    $('#dropdown-menu-storage-cluster-status').toggle();
});

$('#card-action-cloud-cluster-status').on('click', function(){
    $('#dropdown-menu-cloud-cluster-status').toggle();
});

$('#card-action-storage-vm-status').on('click', function(){
    $('#dropdown-menu-storage-vm-status').toggle();
});

$('#card-action-cloud-vm-status').on('click', function(){
    $('#dropdown-menu-cloud-vm-status').toggle();
});

$('#button-open-modal-wizard-storage-vm').on('click', function(){
    $('#div-modal-wizard-storage-vm').show();
});

$('#button-open-modal-wizard-storage-cluster').on('click', function(){
    $('#div-modal-wizard-cluster-config-prepare').show();
});

$('#button-open-modal-wizard-cloud-vm').on('click', function(){
    $('#div-modal-wizard-cloud-vm').show();
});

$('#card-action-cloud-vm-status').on('click', function(){
    $('#dropdown-menu-cloud-vm-status').toggle();
});




// 스토리지센터 VM 자원변경
$('#menu-item-set-storage-center-vm-resource-update').on('click', function(){
    $('#div-modal-storage-center-vm-resource-update').show();
});


// 스토리지센터 클러스터 유지보수모드 설정 
$('#menu-item-set-maintenance-mode, #menu-item-unset-maintenance-mode').on('click',function(){
    //console.log(typeof sessionStorage.getItem("storage_cluster_maintenance_status"))
    if(sessionStorage.getItem("storage_cluster_maintenance_status") == "true"){
        $('#modal-description').html("<p>스토리지 클러스터를 유지보수 모드 해제 하시겠습니까?</p>");
    }else{
        $('#modal-description').html("<p>스토리지 클러스터를 유지보수 모드로 설정하시겠습니까?</p>");
    }

    $('#div-modal-storage-cluster-maintenance-update').show();  

});


// 스토리지센터 가상머신 시작 설정 
$('#menu-item-set-storage-center-vm-start').on('click',function(){    
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_update.py", "start" ])
    .then(function(data){  
        
        var retVal = JSON.parse(data);  
        console.log(retVal);

    })
    .catch(function(data){        
        console.log(":::Error:::"+data);

    });

});

// 스토리지센터 가상머신 정지 설정 
$('#menu-item-set-storage-center-vm-stop').on('click',function(){
     cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_update.py", "stop" ])
    .then(function(data){  
        console.log(data);
        var retVal = JSON.parse(data);        
        
    })
    .catch(function(data){        
        console.log(":::Error:::"+data);
        
    });
});

// 스토리지센터 가상머신 삭제 설정 
$('#menu-item-set-storage-center-vm-delete').on('click',function(){
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_update.py", "delete" ])
   .then(function(data){  
       console.log(data);
       var retVal = JSON.parse(data);        
       
   })
   .catch(function(data){        
       console.log(":::Error:::"+data);
       
   });
});


