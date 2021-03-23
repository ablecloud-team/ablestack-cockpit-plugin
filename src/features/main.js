/**
 * File Name : main.js  
 * Date Created : 2020.02.18
 * Writer  : 박동혁
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// document.ready 영역 시작

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

    $('#button-open-modal-wizard-storage-cluster').hide()
    $('#button-open-modal-wizard-storage-vm').hide()
    $('#button-open-modal-wizard-cloud-vm').hide()
    $('#button-link-storage-center-dashboard').hide()
    $('#button-link-cloud-center').hide()
    $('#button-link-monitoring-center').hide()
 
    //Test 코드 (session에 상태값 넣기)
    sessionStorage.setItem("ccfg_status", "true"); //false, true
    sessionStorage.setItem("scvm_status", "running"); //running, shutoff
    sessionStorage.setItem("scc_status", "HEALTH_OK"); //HEALTH_OK, HEALTH_WARN
    sessionStorage.setItem("ccvm_status", "running"); //running, shut off
    sessionStorage.setItem("ccc_status", "HEALTH_OK"); //HEALTH_OK, HEALTH_WARN

    //상태요약리본
    selectDeployStatus()

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

/**
 * Meathod Name : selectDeployStatus  
 * Date Created : 2021.03.23
 * Writer  : 박다정
 * Description : 상태요약리본 알림메세지 및 버튼 이벤트 처리
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.23 최초 작성
 */

 function selectDeployStatus(){

    // 클러스터 구성 준비 상태 조회
    //  cockpit.spawn(['/usr/bin/python3',
    //          '/usr/share/cockpit/ablestack/python/host/deploy-status.py', 'clusterConfig'], {'host': 'localhost'})
    //          .then(data=>{
    //              const obj = JSON.parse(data)
    //              if(obj.val=='false'){
    //                  sessionStorage.setItem("ccfg_status", "false");         
    //              }else{
    //                  sessionStorage.setItem("ccfg_status", "true");
    //              }
    //          })
    //          .catch(err=>{
    //              console.log(err);
    //          })

    //Test 코드 (session에 상태값 가져오기)
    const step1 = sessionStorage.getItem("ccfg_status"); //false, true
    const step2 = sessionStorage.getItem("scvm_status"); //null, running, shutoff
    const step3 = sessionStorage.getItem("scc_status"); //null, HEALTH_OK, HEALTH_WARN
    const step4 = sessionStorage.getItem("ccvm_status"); //null, running, shutoff
    const step5 = sessionStorage.getItem("ccc_status"); //null, HEALTH_OK, HEALTH_WARN

    //배포 상태조회
    if(step1!="true"){
        //클러스터 구성준비 버튼 show
        $('#button-open-modal-wizard-storage-cluster').show()
        showRibbon('warning','스토리지센터 및 클라우드센터 VM이 배포되지 않았습니다. 클러스터 구성준비를 진행하십시오.')
    }else{
        if(step2==null){
            //클러스터 구성준비 버튼, 스토리지센터 VM 배포 버튼 show
            $('#button-open-modal-wizard-storage-cluster').show()
            $('#button-open-modal-wizard-storage-vm').show()
            showRibbon('warning','스토리지센터 및 클라우드센터 VM이 배포되지 않았습니다. 스토리지센터 VM 배포를 진행하십시오.')
        }else{
            if(step3==null){
                //스토리지센터 연결 버튼 show
                $('#button-open-modal-wizard-cloud-vm').show()
                $('#button-link-storage-center-dashboard').show()
                showRibbon('warning','클라우드센터 VM이 배포되지 않았습니다. 스토리지센터에 연결하여 스토리지 클러스터 구성한 후 클라우드센터 VM 배포를 진행하십시오.')
            }else{
                if(step4==null){
                    //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                    $('#button-open-modal-wizard-cloud-vm').show()
                    $('#button-link-storage-center-dashboard').show()
                    showRibbon('warning','클라우드센터 VM이 배포되지 않았습니다. 클라우드센터 VM 배포를 진행하십시오.')
                }else{
                    if(step5==null){
                        //클라우드센터 VM 배포 버튼, 스토리지센터 연결 버튼 show
                        $('#button-open-modal-wizard-cloud-vm').show()
                        $('#button-link-storage-center-dashboard').show()
                        showRibbon('warning','클라우드센터 클러스터가 구성되지 않았습니다.')
                    }else{
                        //스토리지센터 연결 버튼, 클라우드센터 연결 버튼 show
                        $('#button-link-storage-center-dashboard').show()
                        $('#button-link-cloud-center').show()
                        showRibbon('success','ABLESTACK 스토리지센터 및 클라우드센터 VM이 배포되었으며, 가상어플라이언스 상태가 정상입니다.')
                        //운영 상태조회
                        var msg ="";
                        if(step2!="running"){
                            msg += 'warning','스토리지센터 가상머신이 '+step2+' 상태입니다.\n'
                            showRibbon('warning', msg);
                        }
                        if(step3!="HEALTH_OK"){
                            msg += '스토리지센터 클러스터 상태가 '+step3+' 입니다.\n'
                            showRibbon('warning', msg);
                        }
                        if(step4!="running"){
                            msg += '클라우드센터 가상머신이 '+step4+' 상태입니다.\n'
                            showRibbon('warning', msg);
                        }
                        if(step5!="HEALTH_OK"){
                            msg += '클라우드센터 클러스터 상태가 '+step5+' 입니다.\n'
                            showRibbon('warning', msg);
                        }
                    }
                }
            }
        }
    }
}

/**
 * Meathod Name : showRibbon  
 * Date Created : 2021.03.23
 * Writer  : 박다정
 * Description : 배포 및 운영 상태에 따른 요약리본 알림메세지 및 class 속성 변경
 * Parameter : (String) status, (string) description
 * Return  : 없음
 * History  : 2021.03.23 최초 작성
 */

function showRibbon(status,description) {
    $('#ribbon').attr('class','pf-c-alert pf-m-'+status)
    if(status =='success'){
        $('.pf-screen-reader').text('Success alert:');
    }
    var alert_text = $('.pf-c-alert__description').text(description);
    alert_text.html(alert_text.html().replace(/\n/g, '<br/>'));
}
  