/**
 * File Name : storage-vm-status-update.js  
 * Date Created : 2020.03.17
 * Writer  : 최진성
 * Description : 스토리지센터 가상머신 상태 변경시 발생하는 이벤트 처리를 위한 JavaScript
**/
// 닫기 이벤트 처리
$('#button-close1, #button-close2').on('click', function(){
    $('#div-modal-storage-vm-status-update').hide();
});

// 변경 버튼 클릭 이벤트
$('#button-storage-vm-status-update').on('click', function(){
    var cmd = $('#scvm-status-update-cmd').val();    
    if(cmd == "stop"){//스토리지센터VM 정지 버튼 클릭시
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py", "stop" ])
        .then(function(data){
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
            }else{
                alert("정상적으로 처리되지 않았습니다.")
            }            
        })
        .catch(function(data){ 
            alert("정상적으로 처리되지 않았습니다.")
            //console.log(":::Error:::");            
        });    
    }else if(cmd == "start"){//스토리지센터VM 시작 버튼 클릭시
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py", "start" ])
        .then(function(data){  
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
            }else{
                alert("정상적으로 처리되지 않았습니다.")
            }
        })
        .catch(function(data){
            alert("정상적으로 처리되지 않았습니다.")
            //console.log(":::Error:::"+data);
        });        
    }else if(cmd == "delete"){//스토리지센터VM 삭제 버튼 클릭시
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py", "delete" ])
        .then(function(data){  
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){                
            }else{
                alert("정상적으로 처리되지 않았습니다.")
            }
        })
        .catch(function(data){
            alert("정상적으로 처리되지 않았습니다.")
            //console.log(":::Error:::"+data);
        });        
    }

    //가상머신 시작, 정지, 삭제시 최종 상태값 전달이 확인될때까지 실행(setInterval - 1.5초 간격 확인)
    //예) stop 요청 후 최종 가상머신 상태값이 shut off가 될때 modal을 숨긴 후 새로고침 됨    
    intervalCall = setInterval(function () {
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_detail.py", "detail" ])
        .then(function(data){
            var retVal = JSON.parse(data);
            if(cmd == "stop" && retVal.val.scvm_status == "shut off" 
            || cmd == "start" && retVal.val.scvm_status == "running"
            || cmd == "delete" && retVal.val.scvm_status == "no signal" ){                
                clearInterval(intervalCall);
                $('#scvm-status-update-cmd').val("");
                $('#div-modal-storage-vm-status-update').hide();   
                location.reload();
            }else{
                //console.log("아직 상태값이 변경전입니다.");
            }
        });
    }, 1500);
});





