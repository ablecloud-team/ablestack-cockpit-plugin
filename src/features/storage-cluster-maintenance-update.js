/**
 * File Name : storage-cluster-maintenance-update.js  
 * Date Created : 2020.03.17
 * Writer  : 최진성
 * Description : 스토리지클러스터 유지보수모드 변경시 발생하는 이벤트 처리를 위한 JavaScript
**/
// 닫기 이벤트 처리
$('#button-close1, #button-close2').on('click', function(){
    $('#div-modal-storage-cluster-maintenance-update').hide();
});

// 변경 버튼 클릭 이벤트
$('#button-maintenance-mode-update').on('click', function(){
    $('#dropdown-menu-storage-cluster-status').toggle();
    $('#div-modal-storage-cluster-maintenance-update').hide();
    $('#div-modal-spinner-header-txt').text('스토리지 클러스터 유지보수모드 변경중입니다.');
    $('#div-modal-spinner').show();

    var cmd = $('#scc-maintenance-update-cmd').val();    
    if(cmd == "unset"){//유지보수 모드 해제 시 이벤트 요청        
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/scc_status/scc_status_update.py", "unset_noout" ])
        .then(function(data){            
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
                sessionStorage.setItem("storage_cluster_maintenance_status", "false"); //유지보수모드 해제 요청 후 세션스토리지에 상태값 재세팅
                location.reload();                
            }else{
                console.log(":::scc maintenance update unset Error::: " +data);
            }
        })
        .catch(function(data){
            console.log(":::scc maintenance update unset Error::: " +data);
        });    
    }else if(cmd == "set"){//유지보수 모드 설정 시 이벤트 요청        
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/scc_status/scc_status_update.py", "set_noout" ])
        .then(function(data){            
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
                sessionStorage.setItem("storage_cluster_maintenance_status", "true"); //유지보수모드 해제 요청 후 세션스토리지에 상태값 재세팅
                location.reload();                
            }else{
                console.log(":::scc maintenance update set Error::: " +data);
            }
        })
        .catch(function(data){
            console.log(":::scc maintenance update set Error::: " +data);
        });        
    }    
});