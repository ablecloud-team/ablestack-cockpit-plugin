/**
 * File Name : storage-vm-status-update.js  
 * Date Created : 2020.03.17
 * Writer  : 최진성
 * Description : 스토리지센터 가상머신 상태 변경시 발생하는 이벤트 처리를 위한 JavaScript
**/
$('#button-close1, #button-close2').on('click', function(){
    $('#div-modal-storage-vm-status-update').hide();
});


$('#button-storage-vm-status-update').on('click', function(){


    var cmd = $('#scvm-status-update-cmd').val();    

    if(cmd == "stop"){
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_update.py", "stop" ])
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

    }else if(cmd == "start"){
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_update.py", "start" ])
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
        
    }else if(cmd == "delete"){
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_update.py", "delete" ])
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
  
    

    intervalCall = setInterval(function () {
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack-jsdev/python/storage_center_vm_status/scvm_status_detail.py", "detail" ])
        .then(function(data){
            var retVal = JSON.parse(data);
            console.log($('#scvm-status-update-cmd').val() + " :::::::::::: " + retVal.val.scvm_status);
    
            if(cmd == "stop" && retVal.val.scvm_status == "shut off" 
            || cmd == "start" && retVal.val.scvm_status == "running"
            || cmd == "delete" && retVal.val.scvm_status == "no signal" ){
                console.log("OK Call!!!!!!!!!!!!");
                clearInterval(intervalCall);
                $('#scvm-status-update-cmd').val("");
                $('#div-modal-storage-vm-status-update').hide();   
                location.reload();
            }else{
                console.log("No No!!!!!!!!!!!!");
            }               
            
        });
    }, 1500);   


});





