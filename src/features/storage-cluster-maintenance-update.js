/**
 * File Name : storage-cluster-maintenance-update.js  
 * Date Created : 2020.03.17
 * Writer  : 최진성
 * Description : 스토리지클러스터 유지보수모드 변경시 발생하는 이벤트 처리를 위한 JavaScript
**/

$('#button-maintenance-mode-update').on('click', function(){
    
    if(sessionStorage.getItem("storage_cluster_maintenance_status") == "true"){            
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/scc_status_update.py", "unset_noout" ])
        .then(function(data){
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
                location.reload();
            }else{
                ('#div-modal-storage-cluster-maintenance-update').hide();
                alert("정상적으로 처리되지 않았습니다.")
            }
            
        })
        .catch(function(data){ 
            ('#div-modal-storage-cluster-maintenance-update').hide();
            alert("정상적으로 처리되지 않았습니다.")
            //console.log(":::Error:::");
            
        });

    }else{        
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_cluster_status/scc_status_update.py", "set_noout" ])
        .then(function(data){  
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
                location.reload();
            }else{
                ('#div-modal-storage-cluster-maintenance-update').hide();
                alert("정상적으로 처리되지 않았습니다.")
            }

        })
        .catch(function(data){
            ('#div-modal-storage-cluster-maintenance-update').hide();
            alert("정상적으로 처리되지 않았습니다.")
            //console.log(":::Error:::"+data);

        });
        
    }
});



$('#button-close1, #button-close2').on('click', function(){
    $('#div-modal-storage-cluster-maintenance-update').hide();
});