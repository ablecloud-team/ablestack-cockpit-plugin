/**
 * File Name : storage-vm-resource-update.js  
 * Date Created : 2020.03.17
 * Writer  : 최진성
 * Description : 스토리지센터 가상머신 자원변경시 발생하는 이벤트 처리를 위한 JavaScript
**/
// 닫기 이벤트 처리
$('#button-close1, #button-close2').on('click', function(){
    $('#div-modal-storage-vm-resource-update').hide();
});

//실행 버튼 클릭 이벤트
$('#scvm-resource-update').click(function(){
    $('#dropdown-menu-storage-vm-status').toggle();
    $('#div-modal-storage-vm-resource-update').hide();
    $('#div-modal-spinner-header-txt').text('스토리지센터 가상머신 자원 변경중입니다.');
    $('#div-modal-spinner').show();

    var cpu = $('#form-select-storage-vm-cpu-update option:selected').val();
    var memory = $('#form-select-storage-vm-memory-update option:selected').val();    
    if(cpu == 0 && memory == 0) {//넘겨받은 cpu, memory 두 값이 전부 선택된것이 없을 때
        alert("CPU 또는 Memory 사용 정보를 선택하세요.")
    }else{//넘겨받은 cpu, memory 두 값중 하나라도 변경이 있을 시         
        cockpit.spawn(["python3", "/usr/share/cockpit/ablestack/python/scvm_status/scvm_status_update.py", "resource", "-c", cpu, "-m", memory ])
        .then(function(data){            
            var retVal = JSON.parse(data);
            if(retVal.code == "200"){ 
                location.reload();
            }else{
                alert("정상적으로 처리되지 않았습니다.")
            }
        })
        .catch(function(data){
            console.log(":::scvm resource update Error::: "+data);
            alert("정상적으로 처리되지 않았습니다.")            
        });
    }
});
