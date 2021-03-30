/**
 * File Name : main.js  
 * Date Created : 2020.02.18
 * Writer  : 박동혁
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// document.ready 영역 시작

this.ccvm_instance = new CloudCenterVirtualMachine()
ccvm_instance = this.ccvm_instance
$(document).ccvm_instance = ccvm_instance

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

    $('#dev-modal-migration-cloud-vm').hide();
    $('#dev-modal-stop-cloud-vm').hide();

    CardCloudClusterStatus();

    $('#div-change-modal-cloud-vm').load("./src/features/cloud-vm-change.html");
    $('#div-change-modal-cloud-vm').hide();
    $('#div-change-alert-cloud-vm').load("./src/features/cloud-vm-change-alert.html");
    $('#div-change-alert-cloud-vm').hide();
    
    new CloudCenterVirtualMachine().checkCCVM();  
  
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
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/storage_center_cluster_status/scc_status_detail.py", "detail" ])
    .then(function(data){
        var retVal = JSON.parse(data);
        sessionStorage.setItem("cluster_status", retVal.val.cluster_status); //스토리지 클러스터 상태값 세션스토리지에 저장
        sessionStorage.setItem("storage_cluster_maintenance_status", retVal.val.maintenance_status); //스토리지 클러스터 유지보수 상태값 세션스토리지에 저장
        //스토리지 클러스터 유지보수 상태 확인 후 버튼 disabled 여부 세팅
        if(retVal.val.maintenance_status){
            $("#menu-item-set-maintenance-mode").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            $("#menu-item-unset-maintenance-mode").attr('class','pf-c-dropdown__menu-item');            
        }else{            
            $("#menu-item-set-maintenance-mode").attr('class','pf-c-dropdown__menu-item');
            $("#menu-item-unset-maintenance-mode").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        }
        //스토리지 클러스터 상태값에 따라 icon 및 색상 변경을 위한 css 설정 값 세팅 
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
        //json으로 넘겨 받은 값들 세팅
        $('#scc-status').text(retVal.val.cluster_status);
        $('#scc-osd').text("전체 " + retVal.val.osd + "개의 디스크 중 " + retVal.val.osd_up + "개 작동 중");
        $('#scc-gw').text("RBD GW " + retVal.val.mon_gw1 + "개 제공중(quorum : " + retVal.val.mon_gw2 + ")");
        $('#scc-mgr').text(retVal.val.mgr + "(전체 " + retVal.val.mgr_cnt + "개 실행중)");
        $('#scc-pools').text(retVal.val.pools + " pools");
        $('#scc-usage').text("전체 " + retVal.val.avail + " 중 " +retVal.val.used + " 사용 중 (사용률 " + retVal.val.usage_percentage+ " %)" );
        // 스토리지 클러스터 미배포 상태일경우 display세팅
        if(retVal.val.cluster_status == "no signal"){
            $('#scc-status-check').text("스토리지센터 클러스터가 구성되지 않았습니다.");            
            $('#scc-status-check').attr("style","color: var(--pf-global--danger-color--100)");
            $("#menu-item-linkto-storage-center").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        }else{
            $('#scc-status-check').text("스토리지센터 클러스터가 구성되었습니다.");
            $('#scc-status-check').attr("style","color: var(--pf-global--success-color--100)");
            $("#menu-item-linkto-storage-center").attr('class','pf-c-dropdown__menu-item');            
        }
    })
    .catch(function(data){
        //console.log(":::Error:::");
        $('#scc-status-check').text("토리지센터 클러스터가 구성되지 않았습니다.");
        $('#scc-status-check').attr("style","color: var(--pf-global--danger-color--100)");
        $("#menu-item-set-maintenance-mode").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-unset-maintenance-mode").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-linkto-storage-center").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
    });
    
    // 스토리지센터 VM 상태 조회 시작
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_detail.py", "detail" ])
    .then(function(data){        
        var retVal = JSON.parse(data);
        sessionStorage.setItem("scvm_status", retVal.val.scvm_status);//스트리지센터 가상머신 상태값 세션스토리지에 저장

        //json으로 넘겨 받은 값들 세팅
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
        // 스토리지센터 가상머신 미배포 상태일경우 display세팅
        if(retVal.val.scvm_status == "no signal"){
            $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되지 않았습니다.");            
            $('#scvm-deploy-status-check').attr("style","color: var(--pf-global--danger-color--100)");
            $("#menu-item-linkto-storage-center-vm").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        }else{        
            $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되었습니다.");
            $('#scvm-deploy-status-check').attr("style","color: var(--pf-global--success-color--100)");
            $("#menu-item-linkto-storage-center-vm").attr('class','pf-c-dropdown__menu-item');            
        }
        //스토리지 센터 가상머신 toggle세팅
        if(retVal.val.scvm_status == "running"){ //가상머신 상태가 running일 경우
            $("#scvm-css").attr('class','pf-c-label pf-m-green');
            $("#scvm-icon").attr('class','fas fa-fw fa-check-circle');    
            $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
            $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item pf-m-disabled');            
            if(sessionStorage.getItem("storage_cluster_maintenance_status") =="true"){ //스토리지 클러스터 유지보수 상태값이 true일 경우
                $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item');
            }else{
                $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item pf-m-disabled'); 
            }    
        }else{ //가상머신 상태가 running이 아닐 경우
            $("#scvm-css").attr('class','pf-c-label');
            $("#scvm-icon").attr('class','fas fa-fw fa-times-circle');            
            $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item pf-m-disabled');    
            if(sessionStorage.getItem("storage_cluster_maintenance_status") =="true"){ //스토리지 클러스터 유지보수 상태값이 true일 경우
                $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item');
                $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item');                            
            }else{        
                $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item pf-m-disabled');  
                $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item pf-m-disabled');       
            }
        }
    })
    .catch(function(data){
        //console.log(":::Error:::");
        $("#menu-item-set-storage-center-vm-start").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-set-storage-center-vm-stop").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-set-storage-center-vm-delete").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-set-storage-center-vm-resource-update").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $("#menu-item-linkto-storage-center-vm").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
        $('#scvm-deploy-status-check').text("스토리지센터 가상머신이 배포되지 않았습니다.");
        $('#scvm-deploy-status-check').attr("style","color: var(--pf-global--danger-color--100)");
    });
    //스코리지 클러스터 배포 여부 확인 후 스토리지센터 가상머신 삭제 버튼 disabled 여부 세팅
    if(sessionStorage.getItem("cluster_status") == "no signal"){
        $("#menu-item-set-storage-center-vm-delete").attr('class','pf-c-dropdown__menu-item');
    }else{
        $("#menu-item-set-storage-center-vm-delete").attr('class','pf-c-dropdown__menu-item pf-m-disabled');
    }


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

var cpu=0;
var memory=0;
$('#card-action-cloud-vm-change').on('click', function(){
    ccvm_instance.createChangeModal();
});

$('#card-action-cloud-vm-connect').on('click', function(){
    // 클라우드센터VM 연결
    window.open('http://' + ccvm_instance.ip + ":9090");
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

// 스토리지센터 클러스터 유지보수모드 설정 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-maintenance-mode').on('click',function(){
    $('#modal-description-maintenance-status').html("<p>스토리지 클러스터를 유지보수 모드를 '설정' 하시겠습니까?</p>");
    $('#scc-maintenance-update-cmd').val("set");
    $('#div-modal-storage-cluster-maintenance-update').show();
});

// 스토리지센터 클러스터 유지보수모드 해제 버튼 클릭시 modal의 설명 세팅
$('#menu-item-unset-maintenance-mode').on('click',function(){
    $('#modal-description-maintenance-status').html("<p>스토리지 클러스터를 유지보수 모드를 '해제' 하시겠습니까?</p>");
    $('#scc-maintenance-update-cmd').val("unset");
    $('#div-modal-storage-cluster-maintenance-update').show();  
});

// 스토리지센터 VM 시작 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-storage-center-vm-start').on('click',function(){  
    $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '시작' 하시겠습니까?</p>");
    $('#scvm-status-update-cmd').val("start");
    $('#div-modal-storage-vm-status-update').show();
});

// 스토리지센터 VM 정지 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-storage-center-vm-stop').on('click',function(){
    $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '정지' 하시겠습니까?</p>");
    $('#scvm-status-update-cmd').val("stop");
    $('#div-modal-storage-vm-status-update').show();
});

// 스토리지센터 VM 삭제 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-storage-center-vm-delete').on('click',function(){
    $('#modal-description-scvm-status').html("<p>스토리지 센터 가상머신을 '삭제' 하시겠습니까?</p>");
    $('#scvm-status-update-cmd').val("delete");
    $('#div-modal-storage-vm-status-update').show();    
});

// 스토리지센터 VM 자원변경 버튼 클릭시 modal의 설명 세팅
$('#menu-item-set-storage-center-vm-resource-update').on('click', function(){    
    $('#div-modal-storage-vm-resource-update').show();
});

//스토리지센터 연결 버튼 클릭시 URL 세팅
$('#menu-item-linkto-storage-center').on('click', function(){
    //storageCenter url 링크 주소 가져오기
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/url/create_address.py", "storageCenter", "-H" ])
    .then(function(data){
        var retVal = JSON.parse(data);        
        if(retVal.code == 200){
            // 스토리지 센터 VM 연결
            window.open(retVal.val);
        }
    })
    .catch(function(data){
        //console.log(":::Error:::");        
    });
});

//스토리지센터VM 연결 버튼 클릭시 URL 세팅
$('#menu-item-linkto-storage-center-vm').on('click', function(){
    //storageCenterVm url 링크 주소 가져오기
    cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/url/create_address.py", "storageCenterVm", "-H" ])
    .then(function(data){
        var retVal = JSON.parse(data);        
        if(retVal.code == 200){ 
            // 스토리지 센터 VM 연결
            window.open(retVal.val);
        }
    })
    .catch(function(data){
        //console.log(":::Error:::");        
    });    
});