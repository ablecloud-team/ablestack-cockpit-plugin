/**
 * File Name : storage-vm-resource-update.js  
 * Date Created : 2020.03.17
 * Writer  : 최진성
 * Description : 스토리지센터 VM 자원변경시 발생하는 이벤트 처리를 위한 JavaScript
**/


$(document).ready(function(){

});


// 이벤트 처리 함수
$('#button-close1, #button-close2').on('click', function(){
    $('#div-modal-storage-vm-resource-update').hide();
});


$('#scvm-resource-update').click(function(){    
    var cpu = $('#form-select-storage-vm-cpu-update option:selected').val();
    var memory = $('#form-select-storage-vm-memory-update option:selected').val();
    if(cpu == 0 && memory == 0) {
        alert("CPU 또는 Memory 사용 정보를 선택하세요.")
    }else{
        
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/storage_center_vm_status/scvm_status_update.py", "resource", "-c", cpu, "-m", memory ])
        .then(function(data){
            //console.log(data);
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){
                //alert("가상머신을 시작하면 변경된 자원이 정상적으로 반영됩니다.")
                $('#div-modal-storage-vm-resource-update').hide();   
                location.reload();
            }else{
                alert("정상적으로 처리되지 않았습니다.")
            }
            
        })
        .catch(function(data){ 
            alert("정상적으로 처리되지 않았습니다.")
            //console.log(":::Error:::");            
        });
    }
    

});
