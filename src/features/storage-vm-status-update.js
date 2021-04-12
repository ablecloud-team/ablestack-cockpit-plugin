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

// 실행 버튼 클릭 이벤트
$('#button-storage-vm-status-update').on('click', function(){
    $('#dropdown-menu-storage-vm-status').toggle();
    $('#div-modal-storage-vm-status-update').hide();
    $('#div-modal-spinner-header-txt').text('스토리지센터 가상머신 상태 변경중입니다.');
    $('#div-modal-spinner').show();

    var cmd = $('#scvm-status-update-cmd').val();    
    if(cmd == "stop"){//스토리지센터VM 정지 버튼 클릭시
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/scvm_status/scvm_status_update.py", "stop" ])
        .then(function(data){
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
                console.log(data)
                location.reload();
            }else{
                alert("정상적으로 처리되지 않았습니다.");
            }            
        })
        .catch(function(data){ 
            alert("정상적으로 처리되지 않았습니다.");
            console.log(":::scvm stop Error::: " + data);            
        });    
    }else if(cmd == "start"){//스토리지센터VM 시작 버튼 클릭시
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/scvm_status/scvm_status_update.py", "start" ])
        .then(function(data){  
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
                console.log(data) 
                location.reload();
            }else{
                alert("정상적으로 처리되지 않았습니다.");
            }
        })
        .catch(function(data){
            alert("정상적으로 처리되지 않았습니다.");
            console.log(":::scvm delete Error::: "+data);
        });        
    }else if(cmd == "delete"){//스토리지센터VM 삭제 버튼 클릭시
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/scvm_status/scvm_status_update.py", "delete" ])
        .then(function(data){  
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){  
                console.log(data)         
                location.reload();    
            }else{
                alert("정상적으로 처리되지 않았습니다.");
            }
        })
        .catch(function(data){
            alert("정상적으로 처리되지 않았습니다.");
            console.log(":::scvm delete Error:::"+data);
        });        
    }else if(cmd == "bootstrap"){//스토리지센터VM 삭제 버튼 클릭시
        // bootstrap파일을 실행여부 확인을 위한 bootstrap_run_check 빈파일 생성 후
        // /root/bootstrap.sh 파일을 실행함.
        cockpit.spawn(["sh", "/usr/share/cockpit/ablestack/shell/host/bootstrap_run.sh"])
        .then(function(data){
            console.log(data)
            location.reload();
        })
        .catch(function(data){
            alert("정상적으로 처리되지 않았습니다.");
            console.log("bootstrap_run_check() Error : " + data);        
        });
         
    }
    $('#scvm-status-update-cmd').val("");
});