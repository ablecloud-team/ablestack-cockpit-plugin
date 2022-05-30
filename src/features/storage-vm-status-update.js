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
    createLoggerInfo("button-storage-vm-status-update click");

    var cmd = $('#scvm-status-update-cmd').val();    
    if(cmd == "stop"){//스토리지센터VM 정지 버튼 클릭시
        cockpit.spawn(["python3", pluginpath+"/python/scvm_status/scvm_status_update.py", "stop" ])
        .then(function(data){
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){                
                console.log(data);
                location.reload();
            }else{
                createLoggerInfo(":::scvm stop Error:::");
                console.log(":::scvm stop Error::: "+ data);
            }            
        })
        .catch(function(data){
            createLoggerInfo(":::scvm stop Error:::");
            console.log(":::scvm stop Error::: " + data);            
        });    
    }else if(cmd == "start"){//스토리지센터VM 시작 버튼 클릭시
        cockpit.spawn(["python3", pluginpath+"/python/scvm_status/scvm_status_update.py", "start" ])
        .then(function(data){  
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){                
                console.log(data);
                location.reload();
            }else{
                createLoggerInfo(":::scvm start Error:::");
                console.log(":::scvm start Error::: "+ data);
            }
        })
        .catch(function(data){
            createLoggerInfo(":::scvm delete Error:::");
            console.log(":::scvm delete Error::: "+data);
        });        
    }else if(cmd == "delete"){//스토리지센터VM 삭제 버튼 클릭시
        cockpit.spawn(["python3", pluginpath+"/python/scvm_status/scvm_status_update.py", "delete" ])
        .then(function(data){  
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
                //scvm bootstrap 프로퍼티 초기화
                cockpit.spawn(["python3", pluginpath+"/python/ablestack_json/ablestackJson.py", "update", "--depth1", "bootstrap", "--depth2", "scvm", "--value", "false"])
                .then(function(data){
                    createLoggerInfo("Success in initializing ablestackJson's scvm setting to false");
                    console.log("Success in initializing ablestackJson's scvm setting to false");
                })
                .catch(function(err){
                    createLoggerInfo("Error in initializing ablestackJson's scvm setting to false");
                    console.log("Error in initializing ablestackJson's scvm setting to false : " + err);
                });
                console.log(data);
                location.reload();    
            }else{
                createLoggerInfo(":::scvm delete Error:::");
                console.log(":::scvm delete Error::: "+ data);
            }
        })
        .catch(function(data){
            createLoggerInfo(":::scvm delete Error:::");
            console.log(":::scvm delete Error:::"+data);
        });        
    }else if(cmd == "bootstrap"){//SCC bootstrap실행 버튼 클릭시        
        // /root/bootstrap.sh 파일을 실행함.
        cockpit.spawn(["sh", pluginpath+"/shell/host/bootstrap_run.sh","scvm"])
        .then(function(data){
            console.log(data);
            location.reload();
        })
        .catch(function(data){
            createLoggerInfo("bootstrap_run_check() Error");
            console.log("bootstrap_run_check() Error : " + data);        
        });
    }else if(cmd == "bootstrap_ccvm"){//CCC bootstrap실행 버튼 클릭시
        $('#div-modal-spinner-header-txt').text('클라우드센터 가상머신 상태 변경중입니다.');
        // /root/bootstrap.sh 파일을 실행함.
        cockpit.spawn(["sh", pluginpath+"/shell/host/bootstrap_run.sh","ccvm"])
            .then(function(data){
                console.log(data);
                location.reload();
            })
            .catch(function(data){
                createLoggerInfo("bootstrap_run_check() Error");
                console.log("bootstrap_run_check() Error : " + data);
            });
    }
    $('#scvm-status-update-cmd').val("");
});