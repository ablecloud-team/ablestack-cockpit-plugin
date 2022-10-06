/**
 * File Name : auto-shutdown.js
 * Date Created : 2022.09.10
 * Writer  : 류홍욱
 * Description : 전체 시스템 자동화 기능 중, 이벤트 처리를 위한 JavaScript
**/


// 닫기 이벤트 처리
$('#button-close1, #button-close-auto-shutdown').on('click', function(){
    $('#modal-input-auto-shutdown-mount').prop('checked',false);
    $('#button-auto-shutdown').prop('disabled',true);
    $('#div-modal-auto-shutdown').hide();
});

// 닫기 이벤트 처리
$('#modal-input-auto-shutdown-mount').on('click', function(){
    // $('#button-auto-shutdown').prop('disabled',true);
    var condition = $("#button-auto-shutdown").prop( 'disabled' );
    $("#button-auto-shutdown").prop("disabled", condition ? false : true);
});

// 변경 버튼 클릭 이벤트
$('#button-auto-shutdown').on('click', async function(){
    $('#dropdown-menu-storage-cluster-status').toggle();
    $('#div-modal-auto-shutdown').hide();
    $('#modal-div-auto-shutdown-mount').hide();
    $('#div-modal-spinner-header-txt').text('전체 시스템 자동 종료를 시작합니다.');
    console.log("전체 시스템 자동 종료를 시작합니다");
    $('#div-modal-spinner').show();

    createLoggerInfo("button-auto-shutdown click");
    var cmd = $('#auto-shutdown-cmd').val();
    
    // // 6. Mount 해제 여부를 체크
    // $('#dropdown-menu-cloud-cluster-status').toggle();
    // $('#div-modal-spinner-header-txt').text('Mount 해제 여부를 체크를 하고 있습니다.');
    // createLoggerInfo("mount-status mountCheck");
    // cockpit.spawn(["/usr/bin/python3", pluginpath+"/python/host/auto-shutdown.py", "check_mount"])
    // .then(function(data){
    //     var retVal = JSON.parse(data);
    //     if(retVal.code == 200){
    //         console.log("Mount 체크 성공"); 
            // 7.	클라우드센터 가상머신 정지
            $('#dropdown-menu-cloud-cluster-status').toggle();
            $('#div-modal-spinner-header-txt').text('클라우드센터VM을 정지하고 있습니다.');
            createLoggerInfo("cloud-cluster-status pcsStop");
            cockpit.spawn(['/usr/bin/python3', pluginpath + '/python/cloud_cluster_status/card-cloud-cluster-status.py', 'pcsStop'])
            .then(function(data){
                var retVal = JSON.parse(data);
                if(retVal.code == 200){
                    CardCloudClusterStatus();
                    $('#card-action-cloud-vm-change').attr('disabled', false);
                    $('#button-cloud-vm-snap-rollback').attr('disabled', false);
                    createLoggerInfo("cloud vm stop success");
                    console.log("클라우드센터VM을 정지하고 있습니다."); 
                    //8.	스토리지센터 클러스터 유지보수 모드 설정
                    // 변경 버튼 클릭 이벤트
                    $('#div-modal-spinner-header-txt').text('스토리지 클러스터 유지보수모드 변경중입니다.');
                    createLoggerInfo("scc-maintenance-update set");
                    cockpit.spawn(["python3", pluginpath+"/python/scc_status/scc_status_update.py", "set_noout" ])
                    .then(function(data){            
                        var retVal = JSON.parse(data);
                        if(retVal.code == "200"){
                            sessionStorage.setItem("storage_cluster_maintenance_status", "true"); //유지보수모드 해제 요청 후 세션스토리지에 상태값 재세팅
                            console.log("스토리지 클러스터 유지보수모드 변경중입니다.")
                            // 9.	스토리지센터 가상머신 정지
                            $('#div-modal-spinner-header-txt').text('스토리지센터 가상머신 상태 변경중입니다.');
                            createLoggerInfo("scvm_status_update stop");
                            cockpit.spawn(["python3", pluginpath+"/python/host/auto-shutdown.py","stop_scvms"])
                            .then(function(data){
                                var retVal = JSON.parse(data);
                                if(retVal.code == "200"){
                                    console.log(data);
                                    // 10.	호스트 종료
                                    $('#div-modal-spinner-header-txt').text('호스트 종료 중입니다.');
                                    createLoggerInfo("host_shutdown");
                                    console.log("호스트 종료 중입니다.")
                                    cockpit.spawn(["/usr/bin/python3", pluginpath+"/python/host/auto-shutdown.py","shutdown_hosts"])
                                    .then(function(data){  
                                        console.log(data);
                                        location.reload();
                                        $('#div-modal-spinner').hide();
                                    })
                                    .catch(function(data){
                                        $('#div-modal-spinner-header-txt').text('호스트 종료 오류');
                                        $('#modal-description-auto-shutdown').html("<p>호스트 종료 오류로 중단되었습니다.</p>");
                                        failedAutoShutdown();
                                        createLoggerInfo(":::shutdown Error:::");
                                        console.log(":::shutdown Error::: "+data);
                                    });        

                                }else{
                                    $('#div-modal-spinner-header-txt').text('스토리지센터 가상머신 종료 오류');
                                    createLoggerInfo(":::scvm stop Error:::");
                                    console.log(":::scvm stop Error::: " + data);         
                                }
                            })
                            .catch(function(data){
                                $('#div-modal-spinner-header-txt').text('스토리지센터 가상머신 종료 오류');
                                $('#modal-description-auto-shutdown').html("<p>스토리지센터 가상머신 종료 오류로 중단되었습니다.</p>");
                                failedAutoShutdown();
                                createLoggerInfo(":::scvm stop Error:::");
                                console.log(":::scvm stop Error::: " + data);            
                            });    
                            $('#scvm-status-update-cmd').val("");
                        }else{
                            $('#div-modal-spinner-header-txt').text('스토리지센터 클러스터 유지보수 모드 설정 오류');
                            createLoggerInfo(":::scc maintenance update set Error:::");
                            console.log(":::scc maintenance update set Error::: " +data);
                        }
                    })
                    .catch(function(data){
                        $('#div-modal-spinner-header-txt').text('스토리지센터 클러스터 유지보수 모드 설정 오류');
                        $('#modal-description-auto-shutdown').html("<p>스토리지센터 클러스터 유지보수 모드 설정 오류로 중단되었습니다.</p>");
                        failedAutoShutdown();
                        createLoggerInfo(":::scc maintenance update set Error:::");
                        console.log(":::scc maintenance update set Error::: " +data);
                    });
                }else{
                    $('#div-modal-spinner-header-txt').text('클라우드센터 가상머신 종료 오류');
                    createLoggerInfo(":::cloud vm stop Error:::");
                    console.log(":::cloud vm stop Error::: " +data);
                }
            }).catch(function(data){
                $('#div-modal-spinner-header-txt').text('클라우드센터 가상머신 종료 오류');
                $('#modal-description-auto-shutdown').html("<p>클라우드센터 가상머신 종료 오류로 중단되었습니다.</p>");
                failedAutoShutdown();
                createLoggerInfo("cloud vm stop error");
                console.log('button-execution-modal-cloud-vm-stop spawn error');
            });
    //     }else{
    //         $('#div-modal-spinner-header-txt').text('Mount 해제 오류');
    //         createLoggerInfo(":::nfs check Error:::");
    //         console.log(":::nfs check Error::: " +data);
    //     }
    // }).catch(function(data){
    //     $('#div-modal-spinner-header-txt').text('Mount 해제 오류');
    //     $('#modal-description-auto-shutdown').html("<p>Mount 해제 오류로 중단되었습니다.</p>");
    //     failedAutoShutdown();
    //     createLoggerInfo("nfs check error");
    //     console.log('button-execution-modal-cloud-vm-stop spawn error');
    // });
});

/**
 * Meathod Name : failedAutoShutdown
 * Date Created : 2022.09.23
 * Writer  : 류홍욱
 * Description : 전체 종료 기능 실패 시, UI 복구
 * Parameter : 없음
 * Return  : 없음
 * History  : 2022.09.23 최초 작성
 */
function failedAutoShutdown() {
    $('#div-modal-spinner').hide();
    $('#div-modal-auto-shutdown').show();
    $('#button-close-auto-shutdown').hide();
    $('#button-auto-shutdown').hide();
    $('#modal-div-auto-shutdown-mount').hide();
}
