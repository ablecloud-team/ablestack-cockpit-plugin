/**
 * File Name : main.js  
 * Date Created : 2020.02.18
 * Writer  : 박동혁
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// 변수 선언
const status = document.getElementById("vmStatus");
const ribbon = document.getElementById("ribbon");

// document.ready 영역 시작

$(document).ready(function(){

    $('#ribbon').hide()
    $('#button-close').hide()
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

    showRibbonUi()

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

$('#button-close').on('click', function(){
    document.getElementById('ribbon').style.display = "none";
});


/**
 * Meathod Name : showRibbonUi
 * Date Created : 2021.03.16
 * Writer  : 박다정
 * Description : ABLESTACK 배포 상태 요약 Ribbon UI
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.16 최초 작성
 */
 function showRibbonUi() {
    // 요약리본 UI 조회
    cockpit.spawn(["/usr/bin/python3", "/usr/share/cockpit/ablestack/python/ribbon/deploy-status.py", "list"])
    .then(data => {
        var list_arr = JSON.parse(data);
        var list = list_arr.val[0]
        if(list.cluster_config=='false'){
            // 활성화 : 클러스터 구성 준비
            $('#button-open-modal-wizard-storage-cluster').attr('disabled', false);
            $('#button-open-modal-wizard-storage-vm').attr('disabled', true);
            $('#button-open-modal-wizard-cloud-vm').attr('disabled', true);
            $('#button-link-storage-center-dashboard').attr('disabled', true);
            $('#button-link-cloud-center').attr('disabled', true);
            status.append(document.createTextNode("ABLESTACK 스토리지센터 및 클라우드센터 VM이 배포되지 않았습니다. 클러스터 구성준비를 진행하십시오."));
        }else{
            if(list.storage_vm=='false'){
                // 활성화 : 스토리지센터 VM 배포
                $('#button-open-modal-wizard-storage-cluster').attr('disabled', true);
                $('#button-open-modal-wizard-storage-vm').attr('disabled', false);
                $('#button-open-modal-wizard-cloud-vm').attr('disabled', true);
                $('#button-link-storage-center-dashboard').attr('disabled', true);
                $('#button-link-cloud-center').attr('disabled', true);
                status.append(document.createTextNode("ABLESTACK 스토리지센터 및 클라우드센터 VM이 배포되지 않았습니다. 스토리지센터 VM 배포를 진행하십시오."));
            }else{
                if(list.cloud_vm=='false'){
                    // 활성화 : 스토리지센터 연결, 클라우드센터 VM 배포
                    $('#button-open-modal-wizard-storage-cluster').attr('disabled', true);
                    $('#button-open-modal-wizard-storage-vm').attr('disabled', true);
                    $('#button-open-modal-wizard-cloud-vm').attr('disabled', false);
                    $('#button-link-storage-center-dashboard').attr('disabled', false);
                    $('#button-link-cloud-center').attr('disabled', true);
                    status.append(document.createTextNode("ABLESTACK 클라우드센터 VM이 배포되지 않았습니다. 스토리지센터에 접속하여 스토리지 클러스터를 구성한 후 클라우드센터 VM 배포를 진행하십시오."));
                }else{
                    // 활성화 : 스토리지센터 연결, 클라우드센터 연결
                    $('div.pf-c-alert').attr('class', 'pf-c-alert pf-m-sccuess');
                    $('#button-open-modal-wizard-storage-cluster').attr('disabled', true);
                    $('#button-open-modal-wizard-storage-vm').attr('disabled', true);
                    $('#button-open-modal-wizard-cloud-vm').attr('disabled', true);
                    $('#button-link-storage-center-dashboard').attr('disabled', false);
                    $('#button-link-cloud-center').attr('disabled', false);
                    $('#button-close').show();
                    status.append(document.createTextNode("ABLESTACK 스토리지센터 및 클라우드센터 VM이 배포되었습니다."));
                }
            }
        }
        $('#ribbon').show()
    })
    .catch(err => {
        alert("error code : 200\nerror message : "+err.message);
        console.error(err);
    });

}