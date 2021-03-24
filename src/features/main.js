/**
 * File Name : main.js  
 * Date Created : 2020.02.18
 * Writer  : 박동혁
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/

$(document).click(function(e){
    //토글 생성시 토글영역 외의 영역을 클릭시 토글 숨김
    if (!$(e.target).is('#card-action-storage-cluster-status, #card-action-cloud-cluster-status, #card-action-storage-vm-status, #card-action-cloud-vm-status')) {
        $('#dropdown-menu-storage-cluster-status, #dropdown-menu-cloud-cluster-status, #dropdown-menu-storage-vm-status, #dropdown-menu-cloud-vm-status').hide();
    }
});


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

    //스토리지 센터 가상머신 자원변경 페이지 로드
    $('#div-modal-storage-vm-resource-update').load("./src/features/storage-vm-resource-update.html");
    $('#div-modal-storage-vm-resource-update').hide();
    
    //스토리지 센터 가상머신 상태변경 페이지 로드
    $('#div-modal-storage-vm-status-update').load("./src/features/storage-vm-status-update.html");
    $('#div-modal-storage-vm-status-update').hide();   

    //스토리지 클러스터 유지보수 모드 변경 페이지 로드
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
            $("#scc-cluster-css").attr('class','pf-c-label pf-m-green');
            $("#scc-cluster-icon").attr('class','fas fa-fw fa-check-circle');            
        }else if(retVal.val.cluster_status == "HEALTH_WARN"){
            $("#scc-cluster-css").attr('class','pf-c-label pf-m-orange');
            $("#scc-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');            
        }else if(retVal.val.cluster_status == "HEALTH_ERR"){
            $("#scc-cluster-css").attr('class','pf-c-label pf-m-red');
            $("#scc-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');            
        }else{
            $("#scc-cluster-css").attr('class','pf-c-label');
            $("#scc-cluster-icon").attr('class','fas fa-fw fa-times-circle');            
        }        
        
        $('#scc-status').text(retVal.val.cluster_status);
        $('#scc-osd').text("전체 " + retVal.val.osd + "개의 디스크 중 " + retVal.val.osd_up + "개 작동 중");
        $('#scc-gw').text("RBD GW " + retVal.val.mon_gw1 + "개 제공중(quorum : " + retVal.val.mon_gw2 + ")");
        $('#scc-mgr').text(retVal.val.mgr + "(전체 " + retVal.val.mgr_cnt + "개 실행중)");
        $('#scc-pools').text(retVal.val.pools + " pools");
        $('#scc-usage').text("전체 " + retVal.val.avail + " 중 " +retVal.val.used + " 사용 중 (사용률 " + retVal.val.usage_percentage+ " %)" );

        if(retVal.code == 200){
            $('#scc-status-check').text("스토리지센터 클러스터가 구성되었습니다.");
            $('#scc-status-check').attr("style","color: var(--pf-global--success-color--100)");
        }else{
            $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");            
            $('#scc-status-check').attr("style","color: var(--pf-global--danger-color--100)");
        }

    })
    .catch(function(data){
        console.log(":::Error:::");
        $('#scc-status-check').text("토리지센터 클러스터가 구성되지 않았습니다.");
        $('#scc-status-check').attr("style","color: var(--pf-global--danger-color--100)");
    });
    


    // 스토리지센터 VM 상태 조회 시작
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_detail.py", "detail" ])
    .then(function(data){
        
        var retVal = JSON.parse(data);        

        sessionStorage.setItem("scvm_status", retVal.val.scvm_status);

        if(retVal.val.scvm_status == "running"){
            $("#scvm-css").attr('class','pf-c-label pf-m-green');
            $("#scvm-icon").attr('class','fas fa-fw fa-check-circle');

            $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            
            if(sessionStorage.getItem("storage_cluster_maintenance_status") =="true"){                
                $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item');
            }else{
                $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item pf-m-disabled'); 
            }

        }else{
            $("#scvm-css").attr('class','pf-c-label');
            $("#scvm-icon").attr('class','fas fa-fw fa-times-circle');
            
            $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item pf-m-disabled');

            if(sessionStorage.getItem("storage_cluster_maintenance_status") =="true"){
                $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item');
                $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item');                            
            }else{        
                $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item pf-m-disabled');  
                $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item pf-m-disabled');       
            }
        }


        if(sessionStorage.getItem("cluster_status") == "N/A"){
            $("#menu-item-set-storage-center-vm-delete").attr('class','pf-c-dropdown__menu-item');
        }else{
            $("#menu-item-set-storage-center-vm-delete").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        }

        
        $('#scvm-status').text(retVal.val.scvm_status.toUpperCase());
        $('#scvm-cpu').text(retVal.val.vcpu + " vCore");
        //$('#scvm-cpu').text(retVal.val.vcpu + "vCore(" + retVal.val.socket + " Socket, "+retVal.val.core+" Core)");
        $('#scvm-memory').text(retVal.val.memory);
        $('#scvm-rdisk').text(retVal.val.rdisk);
        $('#scvm-manage-nic-type').text("NIC Type : " + retVal.val.manageNicType + " (Parent : " + retVal.val.manageNicParent + ")");
        $('#scvm-manage-nic-ip').text("IP : " + retVal.val.manageNicIp);
        $('#scvm-manage-nic-gw').text("GW : " + retVal.val.manageNicGw);
        $('#scvm-storage-server-nic-type').text("서버용 NIC Type : " + retVal.val.storageServerNicType + " (Parent : " + retVal.val.storageServerNicParent + ")");
        $('#scvm-storage-server-nic-ip').text("서버용 IP : " + retVal.val.storageServerNicIp);
        $('#scvm-storage-replication-nic-type').text("복제용 NIC Type : " + retVal.val.storageReplicationNicType + " (Parent : " + retVal.val.storageReplicationNicParent + ")");
        $('#scvm-storage-replication-nic-ip').text("복제용 IP : " + retVal.val.storageReplicationNicIp);
        $('#scvm-storage-datadisk-type').text("Disk Type : " + retVal.val.dataDiskType);


        if(retVal.code == 200){
            $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되었습니다.");
            $('#scvm-deploy-status-check').attr("style","color: var(--pf-global--success-color--100)");
        }else{
            $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            $("#menu-item-set-storage-center-vm-delete").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            

            $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되지 않았습니다.");            
            $('#scvm-deploy-status-check').attr("style","color: var(--pf-global--danger-color--100)");
        }

    })
    .catch(function(data){
        //console.log(":::Error:::");        
        $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-set-storage-center-vm-delete").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item pf-m-disabled');

        $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되지 않았습니다.");
        $('#scvm-deploy-status-check').attr("style","color: var(--pf-global--danger-color--100)");
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


// 스토리지센터 클러스터 유지보수모드 설정 
$('#menu-item-set-maintenance-mode').on('click',function(){
    $('#modal-description-maintenance-status').html("<p>스토리지 클러스터를 유지보수 모드를 '설정' 하시겠습니까?</p>");
    $('#scc-maintenance-update-cmd').val("set");
    $('#div-modal-storage-cluster-maintenance-update').show();
});

// 스토리지센터 클러스터 유지보수모드 설정 
$('#menu-item-unset-maintenance-mode').on('click',function(){
    $('#modal-description-maintenance-status').html("<p>스토리지 클러스터를 유지보수 모드를 '해제' 하시겠습니까?</p>");
    $('#scc-maintenance-update-cmd').val("unset");
    $('#div-modal-storage-cluster-maintenance-update').show();  
});

// 스토리지센터 VM 상태 변경(시작) 
$('#menu-item-set-storage-center-vm-start').on('click',function(){  
    $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '시작' 하시겠습니까?</p>");
    $('#scvm-status-update-cmd').val("start");
    $('#div-modal-storage-vm-status-update').show();
});

// 스토리지센터 VM 상태 변경(정지) 
$('#menu-item-set-storage-center-vm-stop').on('click',function(){
    $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '정지' 하시겠습니까?</p>");
    $('#scvm-status-update-cmd').val("stop");
    $('#div-modal-storage-vm-status-update').show();
});

// 스토리지센터 VM 상태 변경(삭제) 
$('#menu-item-set-storage-center-vm-delete').on('click',function(){
    $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '삭제' 하시겠습니까?</p>");
    $('#scvm-status-update-cmd').val("delete");
    $('#div-modal-storage-vm-status-update').show();    
});

// 스토리지센터 VM 자원 변경
$('#menu-item-set-storage-center-vm-resource-update').on('click', function(){    
    $('#div-modal-storage-vm-resource-update').show();
});

