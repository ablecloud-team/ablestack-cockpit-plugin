// textarea에서 "Tab"키 사용.
$(".tab-available").keydown(function (e) {
    if (e.keyCode === 9) {
        var start = this.selectionStart;
        var end = this.selectionEnd;
        var $this = $(this);
        var value = $this.val();
        $this.val(value.substring(0, start)
            + "\t"
            + value.substring(end));
        this.selectionStart = this.selectionEnd = start + 1;
        e.preventDefault();
    }
});


/**
 * Meathod Name : setNicBridge
 * Date Created : 2021.03.16
 * Writer  : 배태주
 * Description : nic Bridge 정보를 호출하여 셀렉트 박스 세팅
 * Parameter : (string) input selete id
 * Return  : 없음
 * History  : 2021.03.16 최초 작성
 * History  : 2021.03.18 wizard ui 공통 함수로 분리
 */
 function setNicBridge(select_box_id){
    var cmd = ["python3",pluginpath + "/python/nic/network_action.py","list"];

    cockpit.spawn(cmd).then(function(data){
        
        // 초기화
        $('#'+select_box_id).empty();

        var el ='';
        var result = JSON.parse(data);
        var bridge_list = result.val.bridges;
        var bridge_others_list = result.val.others;

        el += '<option value="" selected>선택하십시오</option>';
        for(var i = 0 ; i < bridge_list.length ; i ++ ){
            el += '<option value="'+bridge_list[i].DEVICE+'">'+bridge_list[i].DEVICE+' ('+bridge_list[i].STATE+')</option>';
        }

        for(var i = 0 ; i < bridge_others_list.length ; i ++ ){
            el += '<option value="'+bridge_others_list[i].DEVICE+'">'+bridge_others_list[i].DEVICE+' ('+bridge_others_list[i].STATE+')</option>';
        }

        $('#'+select_box_id).append(el);

        createLoggerInfo("setNicBridge success");

    }).catch(function(){
        createLoggerInfo("setNicBridge error");
        alert("setNicBridge error");
    });
}

/**
 * Meathod Name : setHostsFileReader
 * Date Created : 2021.03.18
 * Writer  : 배태주
 * Description : hosts file을 읽어 편집하는 기능
 * Parameter : input, file_name, callBackFunction
 * Return  : 없음
 * History  : 2021.03.18 최초 작성
**/
function setHostsFileReader(input, file_name, callBackFunction) {
    input.on("change", function(event) { 
        // FileList
        let file_list = input.files || event.target.files;
        // File
        let file = file_list[0];
        if(file.name == file_name ){
            if(checkFileSize(file) != false){
                if(input.val() != ""){
                    try {
                        let reader = new FileReader();
                        reader.onload = function (e) {
                            var text = e.target.result
                            var host_array = readHostsFileCallBack(text);
                            callBackFunction(host_array, text);
                        };
                        reader.readAsText(file);
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    callBackFunction("");
                }
            } else {
                input.val("");
            }            
        } else {
            alert(file_name+" 파일만 업로드할 수 있습니다.");
            input.val("");
        }
    });
}

/**
 * Meathod Name : readHostsFileCallBack
 * Date Created : 2021.03.18
 * Writer  : 배태주
 * Description : hosts 파일 읽어 [{"ip":"10.10.0.10", "hostName":"host1"},{"ip":"10.10.0.11", "hostName":"host2"}...] json String 형식으로 리턴
 * Parameter : String
 * Return  : Array
 * History  : 2021.03.18 최초 작성
 */
 function readHostsFileCallBack(text){

    // 결과값 저장을 위한 변수
    var result_array = new Array();

    // hosts 내용 text를 한줄 단위로 나눔
    var text_array = text.split("\n");
    
    for(var i = 0; i < text_array.length; i++){
        if(text_array[i] != "" && text_array[i] != " " && text_array[i].substr(0,1) != "#" ){ // 라인 내용이 없거나 첫 단어가 주석 #가 아닌 경우
            // 문자열의 모든 tab 문자열을 공백으로 치환
            var replace_text = text_array[i].replace(/\t+/g, " ");
            // 문자열의 모든 공백 문자를 하나의 공백문자로 치환 (ex : "    " -> "")
            replace_text = replace_text.replace(/\s+/g, " ");

            // 공백으로 스플릿
            var split_text = replace_text.split(" "); // 예상결과 ex1 : [10.10.0.1, hostname1], ex2 : [10.10.0.1, hostname1, hostname2...]
            for(var j = 0; j < split_text.length; j++){
                if(j>0){ // 첫번째 값은 항상 ip
                    var ip = split_text[0]
                    var host_name = split_text[j];
                    
                    // 리스트에 생성된 객체 삽입 , 예상결과 ex : "10.10.0.1,hostname1"
                    result_array.push(ip+","+host_name);
                }
            }
        }
    }
    
    var uniq_result = Array.from(new Set(result_array));
    var result_json_array = new Array();

    for(var i = 0 ; i < uniq_result.length ; i++){
        var json_obj = new Object();
    
        var val = uniq_result[i].split(",");
        json_obj.ip = val[0]
        json_obj.hostName = val[1];
    
        result_json_array.push(json_obj);
    }
    
    //json 형식의 문자열 반환
    return JSON.stringify(result_json_array);
 }

 /**
 * Meathod Name : setSshKeyFileReader
 * Date Created : 2021.03.18
 * Writer  : 배태주
 * Description : ssh key file을 읽어 문자열을 반환하는 함수
 * Parameter : input, callBackFunction
 * Return  : 없음
 * History  : 2021.03.18 최초 작성
**/
function setSshKeyFileReader(input, file_name, callBackFunction) {
    input.on("change", function(event) { 
        // FileList
        let file_list = input.files || event.target.files;
        // File
        let file = file_list[0];
        if(file.name == file_name){
            if(checkFileSize(file) != false){
                if(input.val() != ""){
                    try {
    
                        let reader = new FileReader();
                        reader.onload = function (e) {
                            var text = e.target.result
                            callBackFunction(text);
                        };
                        reader.readAsText(file);
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    callBackFunction("");
                }
            } else {
                input.val("");
            }
        } else {
            alert(file_name+" 파일만 업로드할 수 있습니다.");
            input.val("");
        }
    });
}

/**
 * Meathod Name : setProgressStep
 * Date Created : 2021.03.22
 * Writer  : 배태주
 * Description : span id와 status 입력받아 해당하는 span의 진행상태를 입력받은 status 변경
 * Parameter : String, String
 * Return  : 없음
 * History  : 2021.03.22 최초 작성
 */
 function setProgressStep(span_id, status){
    //proceeding or 1: 진행중, completed or 2: 완료됨, aborted or 3: 중단됨
    if(status=="proceeding" || status=="completed" || status=="aborted" || status==1 || status==2 || status==3){
        var span = $('#'+span_id);
        var icon = $('#'+span_id).children('span').children('span').children("i");
        var progress_text = $('#'+span_id).children('span').children('p');

        // 초기화
        span.removeClass('pf-m-blue pf-m-green pf-m-orange pf-m-red');
        icon.removeClass('fa-info-circle fa-check-circle fa-play fa-exclamation-circle');

        if(status == "proceeding" || status==1){
            if(span.attr('id') == "span-ccvm-progress-step1"){
                $('#ccvm-progress-step-text').text('클라우드센터 가상머신을 배포 중입니다. 전체 5단계 중 1단계 진행 중입니다.');
            } else if(span.attr('id') == "span-ccvm-progress-step2"){
                $('#ccvm-progress-step-text').text('클라우드센터 가상머신을 배포 중입니다. 전체 5단계 중 2단계 진행 중입니다.');
            } else if(span.attr('id') == "span-ccvm-progress-step3"){
                $('#ccvm-progress-step-text').text('클라우드센터 가상머신을 배포 중입니다. 전체 5단계 중 3단계 진행 중입니다.');
            } else if(span.attr('id') == "span-ccvm-progress-step4"){
                $('#ccvm-progress-step-text').text('클라우드센터 가상머신을 배포 중입니다. 전체 5단계 중 4단계 진행 중입니다.');
            } else if(span.attr('id') == "span-ccvm-progress-step5"){
                $('#ccvm-progress-step-text').text('클라우드센터 가상머신을 배포 중입니다. 전체 5단계 중 5단계 진행 중입니다.');

            }

            span.addClass('pf-m-orange');
            icon.addClass('fa-play');
            progress_text.text('진행중');
        } else if(status=="completed" || status==2){
            span.addClass('pf-m-green');
            icon.addClass('fa-check-circle');
            progress_text.text('완료됨');
        } else if(status=="aborted" || status==3){
            span.addClass('pf-m-red');
            icon.addClass('fa-exclamation-circle');
            progress_text.text('중단됨');
        }
    }else{
        alert("진행 상태를 잘못 입력했습니다.");
    }    
}

/**
 * Meathod Name : seScvmProgressStep
 * Date Created : 2021.03.22
 * Writer  : 배태주
 * Description : span id와 status 입력받아 해당하는 span의 진행상태를 입력받은 status 변경
 * Parameter : String, String
 * Return  : 없음
 * History  : 2021.03.22 최초 작성
 */
 function seScvmProgressStep(span_id, status){
    //proceeding or 1: 진행중, completed or 2: 완료됨, aborted or 3: 중단됨
    if(status=="proceeding" || status=="completed" || status=="aborted" || status==1 || status==2 || status==3){
        var span = $('#'+span_id);
        var icon = $('#'+span_id).children('span').children('span').children("i");
        var progress_text = $('#'+span_id).children('span').children('p');

        // 초기화
        span.removeClass('pf-m-blue pf-m-green pf-m-orange pf-m-red');
        icon.removeClass('fa-info-circle fa-check-circle fa-play fa-exclamation-circle');

        if(status == "proceeding" || status==1){
            if(span.attr('id') == "span-progress-step1"){
                $('#progress-step-text').text('스토리지센터 가상머신을 배포 중입니다. 전체 4단계 중 1단계 진행 중입니다.');
            } else if(span.attr('id') == "span-progress-step2"){
                $('#progress-step-text').text('스토리지센터 가상머신을 배포 중입니다. 전체 4단계 중 2단계 진행 중입니다.');
            } else if(span.attr('id') == "span-progress-step3"){
                $('#progress-step-text').text('스토리지센터 가상머신을 배포 중입니다. 전체 4단계 중 3단계 진행 중입니다.');
            } else if(span.attr('id') == "span-progress-step4"){
                $('#progress-step-text').text('스토리지센터 가상머신을 배포 중입니다. 전체 4단계 중 4단계 진행 중입니다.');
            }

            span.addClass('pf-m-orange');
            icon.addClass('fa-play');
            progress_text.text('진행중');
        } else if(status=="completed" || status==2){
            span.addClass('pf-m-green');
            icon.addClass('fa-check-circle');
            progress_text.text('완료됨');
        } else if(status=="aborted" || status==3){
            span.addClass('pf-m-red');
            icon.addClass('fa-exclamation-circle');
            progress_text.text('중단됨');
        }
    }else{
        alert("진행 상태를 잘못 입력했습니다.");
    }    
}

/**
 * Meathod Name : setWallProgressStep
 * Date Created : 2021.09.03
 * Writer  : 배태주
 * Description : span id와 status 입력받아 해당하는 span의 진행상태를 입력받은 status 변경
 * Parameter : String, String
 * Return  : 없음
 * History  : 2021.09.03 최초 작성
 */
 function setWallProgressStep(span_id, status){
    //proceeding or 1: 진행중, completed or 2: 완료됨, aborted or 3: 중단됨
    if(status=="proceeding" || status=="completed" || status=="aborted" || status==1 || status==2 || status==3){
        var span = $('#'+span_id);
        var icon = $('#'+span_id).children('span').children('span').children("i");
        var progress_text = $('#'+span_id).children('span').children('p');

        // 초기화
        span.removeClass('pf-m-blue pf-m-green pf-m-orange pf-m-red');
        icon.removeClass('fa-info-circle fa-check-circle fa-play fa-exclamation-circle');

        if(status == "proceeding" || status==1){
            if(span.attr('id') == "span-wall-progress-step1"){
                $('#wall-progress-step-text').text('Wall 모니터링센터를 구성 중입니다. 전체 3단계 중 1단계 진행 중입니다.');
            } else if(span.attr('id') == "span-wall-progress-step2"){
                $('#wall-progress-step-text').text('Wall 모니터링센터를 구성 중입니다. 전체 3단계 중 2단계 진행 중입니다.');
            } else if(span.attr('id') == "span-wall-progress-step3"){
                $('#wall-progress-step-text').text('Wall 모니터링센터를 구성 중입니다. 전체 3단계 중 3단계 진행 중입니다.');
            }

            span.addClass('pf-m-orange');
            icon.addClass('fa-play');
            progress_text.text('진행중');
        } else if(status=="completed" || status==2){
            span.addClass('pf-m-green');
            icon.addClass('fa-check-circle');
            progress_text.text('완료됨');
        } else if(status=="aborted" || status==3){
            span.addClass('pf-m-red');
            icon.addClass('fa-exclamation-circle');
            progress_text.text('중단됨');
        }
    }else{
        alert("진행 상태를 잘못 입력했습니다.");
    }
}

/**
 * Meathod Name : setClusterProgressStep
 * Date Created : 2022.09.08
 * Writer  : 배태주
 * Description : span id와 status 입력받아 해당하는 span의 진행상태를 입력받은 status 변경
 * Parameter : String, String
 * Return  : 없음
 * History  : 2022.09.08 최초 작성
 */
 function setClusterProgressStep(span_id, status){
    //proceeding or 1: 진행중, completed or 2: 완료됨, aborted or 3: 중단됨
    if(status=="proceeding" || status=="completed" || status=="aborted" || status==1 || status==2 || status==3){
        var span = $('#'+span_id);
        var icon = $('#'+span_id).children('span').children('span').children("i");
        var progress_text = $('#'+span_id).children('span').children('p');

        // 초기화
        span.removeClass('pf-m-blue pf-m-green pf-m-orange pf-m-red');
        icon.removeClass('fa-info-circle fa-check-circle fa-play fa-exclamation-circle');

        if(status == "proceeding" || status==1){
            if(span.attr('id') == "span-cluster-progress-step1"){
                $('#cluster-progress-step-text').text('클러스터 구성 준비 중입니다. 전체 3단계 중 1단계 진행 중입니다.');
            } else if(span.attr('id') == "span-cluster-progress-step2"){
                $('#cluster-progress-step-text').text('클러스터 구성 준비 중입니다. 전체 3단계 중 2단계 진행 중입니다.');
            } else if(span.attr('id') == "span-cluster-progress-step3"){
                $('#cluster-progress-step-text').text('클러스터 구성 준비 중입니다. 전체 3단계 중 3단계 진행 중입니다.');
            }

            span.addClass('pf-m-orange');
            icon.addClass('fa-play');
            progress_text.text('진행중');
        } else if(status=="completed" || status==2){
            span.addClass('pf-m-green');
            icon.addClass('fa-check-circle');
            progress_text.text('완료됨');
        } else if(status=="aborted" || status==3){
            span.addClass('pf-m-red');
            icon.addClass('fa-exclamation-circle');
            progress_text.text('중단됨');
        }
    }else{
        alert("진행 상태를 잘못 입력했습니다.");
    }    
}


/** 
 * Meathod Name : setClusterProgressFail
 * Date Created : 2022.09.08
 * Writer  : 배태주
 * Description : 클러스터 구성 준비 진행중 실패 단계에 따른 중단됨 UI 처리
 * Parameter : setp_num
 * Return  : 없음
 * History  : 2022.09.08 최초 작성
 */
 function setClusterProgressFail(setp_num){
    if( setp_num == 1 || setp_num == '1' ){   // 1단계 이하 단계 전부 중단된 처리
        setClusterProgressStep("span-cluster-progress-step1",3);
        setClusterProgressStep("span-cluster-progress-step2",3);
        setClusterProgressStep("span-cluster-progress-step3",3);
    } else if(setp_num == 2 || setp_num == '2') {   // 2단계 이하 단계 전부 중단된 처리
        setClusterProgressStep("span-cluster-progress-step2",3);
        setClusterProgressStep("span-cluster-progress-step3",3);
    } else if(setp_num == 3 || setp_num == '3') {   // 3단계 이하 단계 전부 중단된 처리
        setClusterProgressStep("span-cluster-progress-step3",3);
    }
}


/**
 * Meathod Name : checkHostName
 * Date Created : 2021.04.05
 * Writer  : 류홍욱
 * Description : 호스트 이름을 체크하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.04.05
 */

function checkHostName(option) {

    cockpit.script(["hostname"])
        .then(function (data) {
            $('#form-input-current-host-name'+option).val(data);
        })
        .catch(function (error) {
        });
}

/**
 * Meathod Name : fileReaderIntoTableFunc
 * Date Created : 2021.10.19
 * Writer  : 류홍욱
 * Description : 클러스터 준비 마법사에서 input box에서 파일을 선택하면 문자열로 읽어와 table에 담는 함수
 * Parameter : input (input box id 값), file_type(ssh-key, hosts 파일 타입에 따라 분류)
 * Return  : 없음
 * History  : 2021.10.19 최초 작성
 **/

 async function fileReaderIntoTableFunc(input, file_type, option) {
    input.addEventListener('change', function (event) {
        let file_list = input.files || event.target.files;
        let file = file_list[0];
        let id = input.getAttribute('id');
        // 배열 안 데이터 검색을 위한 변수
        //let str = "";
        //let find_string = "scvm";
        //let total_scvm_num = 0;
        //let current_scvm_num = 0;
        // hosts 파일에 구분자 (탭)이 없을 경우 추가하는데 필요한 정규식
        //let ip_format = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        if ($(input).val() != "") {
            let file_name = file_list[0].name;
            // 파일 이름 및 용량 체크
            if (checkClusterConfigPrepareFileName(file_name, file_type) != false && checkFileSize(file) != false) {
                // FileList
                let reader = new FileReader();
                try {
                    reader.onload = function (progressEvent) {
                        let result = progressEvent.target.result;
                        var confJson = JSON.parse(result);
                        let hostsJson = confJson.clusterConfig.hosts;
                        let hostCnt = confJson.clusterConfig.hosts.length; // 설정파일에서 읽어온 node 수
                        
                        let insert_tr = "";
                        let max_index = 0;
                        let current_host_name = $("#form-input-current-host-name").val();
                        let add_tr_yn = true;
                        for (let i = 0 ; i < hostCnt ; i++){
                            insert_tr += "<tr style='border-bottom: solid 1px #dcdcdc'>";
                            insert_tr += "  <td contenteditable='false'>"+hostsJson[i].index+"</td>";
                            insert_tr += "  <td contenteditable='false'>"+hostsJson[i].hostname+"</td>";
                            insert_tr += "  <td contenteditable='false'>"+hostsJson[i].ablecube+"</td>";
                            insert_tr += "  <td contenteditable='false'>"+hostsJson[i].scvmMngt+"</td>";
                            insert_tr += "  <td contenteditable='false'>"+hostsJson[i].ablecubePn+"</td>";
                            insert_tr += "  <td contenteditable='false'>"+hostsJson[i].scvm+"</td>";
                            insert_tr += "  <td contenteditable='false'>"+hostsJson[i].scvmCn+"</td>";
                            insert_tr += "</tr>";

                            if(Number(hostsJson[i].index) >= max_index) {
                                max_index = Number(hostsJson[i].index)+1;
                            }
                            if(current_host_name == hostsJson[i].hostname){
                                add_tr_yn = false;
                            }
                        }

                        // cluster_host_yn은 신규 클러스터 호스트 = new, 추가 호스트 = add / hostsJson에 현재 호스트명과 동일한 호스트명이 존재하면 추가하지 않음
                        // cluster_host_yn = $('input[name=radio-cluster-host]:checked').val()
                        // if(cluster_host_yn=="add" && option == "") {
                        if(option == "") {
                            if(add_tr_yn){
                                insert_tr += "<tr style='border-bottom: solid 1px #dcdcdc'>";
                                insert_tr += "  <td contenteditable='true'>"+max_index+"</td>";
                                insert_tr += "  <td contenteditable='true'></td>";
                                insert_tr += "  <td contenteditable='true'></td>";
                                insert_tr += "  <td contenteditable='true'></td>";
                                insert_tr += "  <td contenteditable='true'></td>";
                                insert_tr += "  <td contenteditable='true'></td>";
                                insert_tr += "  <td contenteditable='true'></td>";
                                insert_tr += "</tr>";
    
                                hostCnt = hostCnt+1;
                            }
                            
                            $("#form-input-cluster-ccvm-mngt-ip").val(confJson.clusterConfig.ccvm.ip);
                            $("#form-input-cluster-pcs-hostname1").val(confJson.clusterConfig.pcsCluster.hostname1);
                            $("#form-input-cluster-pcs-hostname2").val(confJson.clusterConfig.pcsCluster.hostname2);
                            $("#form-input-cluster-pcs-hostname3").val(confJson.clusterConfig.pcsCluster.hostname3);
                        }

                        $('#form-input-cluster-config-host-number'+option+'').val(hostCnt);
                        $('#form-table-tbody-cluster-config-existing-host-profile'+option+' tr').remove();
                        $(insert_tr).appendTo('#form-table-tbody-cluster-config-existing-host-profile'+option+'');

                        //option이 -scvm 일 경우 스토리지센터 가상머신 배포 마법사 네트워크 자동 세팅
                        if(option == "-scvm"){
                            let current_host_name_scvm = $("#form-input-current-host-name-scvm").val();

                            // 세팅 값 초기화
                            $("#form-input-storage-vm-hostname").val("");
                            $("#form-input-storage-vm-mgmt-ip").val("");
                            $("#form-input-storage-vm-mgmt-gw").val("");
                            $("#form-input-storage-vm-public-ip").val("");
                            $("#form-input-storage-vm-cluster-ip").val("");
                            $("#form-input-ccvm-mngt-ip").val("");

                            //
                            $("#form-input-ccvm-mngt-ip").val(confJson.clusterConfig.ccvm.ip);

                            $('#form-table-tbody-cluster-config-existing-host-profile-scvm tr').each(function(){
                                let host_name = $(this).find('td').eq(1).text().trim();
                                if(current_host_name_scvm == host_name && host_name != null){
                                    let host_index = $(this).find('td').eq(0).text().trim();
                                    // 호스트명을 세팅
                                    $("#form-input-storage-vm-hostname").val("scvm"+host_index);
                                    // 관리 NIC IP 및 CIDR 기본 입력
                                    $("#form-input-storage-vm-mgmt-ip").val($(this).find('td').eq(3).text().trim()+"/16");
                                    // 스토리지 서버 NIC IP
                                    $("#form-input-storage-vm-public-ip").val($(this).find('td').eq(5).text().trim()+"/16");
                                    // 스토리지 복제 NIC IP
                                    $("#form-input-storage-vm-cluster-ip").val($(this).find('td').eq(6).text().trim()+"/16");
                        
                                    return false;
                                }
                            });
                        }

                        if(option == "-ccvm"){
                            // 세팅 값 초기화
                            $("#form-input-cloud-vm-mngt-nic-ip").val("");
                            $("#form-input-cloud-vm-failover-cluster-host1-name").val("");
                            $("#form-input-cloud-vm-failover-cluster-host2-name").val("");
                            $("#form-input-cloud-vm-failover-cluster-host3-name").val("");

                            // 값 세팅
                            if(confJson.clusterConfig.ccvm.ip != "" && confJson.clusterConfig.ccvm.ip != null){
                                $("#form-input-cloud-vm-mngt-nic-ip").val(confJson.clusterConfig.ccvm.ip+"/16");
                            }

                            if(confJson.clusterConfig.pcsCluster.hostname1 != "" && confJson.clusterConfig.pcsCluster.hostname1 != null){
                                $("#form-input-cloud-vm-failover-cluster-host1-name").val(confJson.clusterConfig.pcsCluster.hostname1);
                            }else{
                                $("#form-input-cloud-vm-failover-cluster-host1-name").val(confJson.clusterConfig.hosts[0].hostname);
                            }

                            if(confJson.clusterConfig.pcsCluster.hostname2 != "" && confJson.clusterConfig.pcsCluster.hostname2 != null){
                                $("#form-input-cloud-vm-failover-cluster-host2-name").val(confJson.clusterConfig.pcsCluster.hostname2);
                            }else{
                                $("#form-input-cloud-vm-failover-cluster-host2-name").val(confJson.clusterConfig.hosts[1].hostname);
                            }

                            if(confJson.clusterConfig.pcsCluster.hostname3 != "" && confJson.clusterConfig.pcsCluster.hostname3 != null){
                                $("#form-input-cloud-vm-failover-cluster-host3-name").val(confJson.clusterConfig.pcsCluster.hostname3);
                            }else{
                                $("#form-input-cloud-vm-failover-cluster-host3-name").val(confJson.clusterConfig.hosts[2].hostname);
                            }
                        }
                    };
                    reader.readAsText(file);
                } catch (err) {
                }
            } else {
                // validation 실패 시 초기화
                $('#' + id).val("");
                $('#form-table-tbody-cluster-config-existing-host-profile'+option+' tr').remove();
            }
        }
    });
}

/**
 * Meathod Name : changeAlias2
 * Date Created : 2021.11.01
 * Writer  : 류홍욱
 * Description : 준비 마법사에서 기존 호스트 파일의 Alias2를 현재 호스트 숫자에 따라 변경하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.11.01 수정
 **/
//  function changeAlias2(option) {
//     if($('#form-table-tbody-cluster-config-existing-host-profile'+option+' > tr').length && $('input[name="radio-hosts-file'+option+'"]:checked').val() == "existing") {
//         let hosts_input_number = $('#form-input-cluster-config-host-number'+option+'').val();
//         let current_hosts_input_number = $('#form-input-cluster-config-current-host-number'+option+'').val();
//         current_hosts_input_number = current_hosts_input_number*1
//         let tbody_td_number = $('#form-table-tbody-cluster-config-existing-host-profile'+option+' > tr > td').length;
//         // 현재호트스 숫자 *1(Alias2 순서) + 1(ccvm 포함하여 2번째 줄부터) *3(1줄 3칸) -1(테이블 시작점 0)
//         let ablecube = ((hosts_input_number*1)+1)*3-1;
//         let scvm_mngt = ((hosts_input_number*2)+1)*3-1;
//         let ablecube_pn = ((hosts_input_number*3)+1)*3-1;
//         let scvm = ((hosts_input_number*4)+1)*3-1;
//         let scvm_cn = ((hosts_input_number*5)+1)*3-1;
//         let pre_td = 3;
//         let gap_num = hosts_input_number-current_hosts_input_number;

//         // Alias2 (ccvm제외) 모두 삭제
//         for(let i=3; i < tbody_td_number; i++) {
//             let j;
//             j = i+1;
//             if(j%3 == 0) {
//                 $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(i)+")").text("");
//             }
//         }
//         for(let i=0; i < tbody_td_number; i++) {
//             $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(ablecube+(pre_td*gap_num)*-1)+")").text("ablecube");
//             $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(scvm_mngt+(pre_td*gap_num)*-1)+")").text("scvm-mngt");
//             $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(ablecube_pn+(pre_td*gap_num)*-1)+")").text("ablecube-pn");
//             $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(scvm+(pre_td*gap_num)*-1)+")").text("scvm");
//             $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(scvm_cn+(pre_td*gap_num)*-1)+")").text("scvm-cn");
//         }
//     }else if ($('input[name="radio-hosts-file'+option+'"]:checked').val() == "existing"){
//         console.log("There are no data");
//     }
// }

/**
 * Meathod Name : putHostsValueIntoTextarea
 * Date Created : 2021.03.22
 * Writer  : 류홍욱
 * Description : 준비 마법사에서 설정에 따라 설정확인에 위치한 textarea에 hosts 값을 넣는 함수
 * Parameter : radio_value, option
 * Return  : 없음
 * History  : 2021.10.21 수정
 **/

 function putHostsValueIntoTextarea(radio_value, option) {
    if (radio_value == "new") {
        // hosts file 준비 방법 표시 및 값 설정
        $('#span-hosts-file'+option+'').text("신규 생성");
        
        let result = tableToHostsText($('#form-table-tbody-cluster-config-new-host-profile'+option+' tr'), option);
        $('#div-textarea-cluster-config-confirm-hosts-file'+option+'').val(result.trim());

    } else if (radio_value == "existing") {
        // hosts file 준비 방법 표시 및 값 설정
        $('#span-hosts-file'+option+'').text("기존 파일 사용");
        
        let result = tableToHostsText($('#form-table-tbody-cluster-config-existing-host-profile'+option+' tr'), option);
        $('#div-textarea-cluster-config-confirm-hosts-file'+option+'').val(result.trim());
    }
}

/**
 * Meathod Name : tableToHostsText()
 * Date Created : 2022.08.24
 * Writer  : 배태주 
 * Description : 입력 받은 클러스터 구성 정보를 통해 ablecube host에서 사용할 hosts 파일 텍스트 생성
 * Parameter : table_tr_obj
 * Return  : hosts text
 * History  : 2022.08.24 최초 작성
 **/
function tableToHostsText(table_tr_obj, option){

    // 신규로 생성할 경우 테이블의 내용을 table에 넣는 코드
    let hsots_text = "";
    // 현재 ablecube 호스트의 이름
    let current_host_name = $("#form-input-current-host-name"+option).val();
    
    if(option == ""){
        if($("#form-input-cluster-ccvm-mngt-ip").val() != ""){
            hsots_text += $("#form-input-cluster-ccvm-mngt-ip").val() + "\t" + "ccvm-mngt" + "\t" + "ccvm" + "\n";
        }
    }else if(option == "-scvm"){
        if($("#form-input-ccvm-mngt-ip").val() != ""){
            hsots_text += $("#form-input-ccvm-mngt-ip").val() + "\t" + "ccvm-mngt" + "\t" + "ccvm" + "\n";
        }
    }else if(option == "-ccvm"){
        if($('#form-input-cloud-vm-mngt-nic-ip').val() != ""){
            var mgmt_ip = $('#form-input-cloud-vm-mngt-nic-ip').val().split("/")[0];
            hsots_text += mgmt_ip + "\t" + "ccvm-mngt" + "\t" + "ccvm" + "\n";
        }
    }

    table_tr_obj.each(function(){
        // $(this).find('td').eq(0) 순서는 아래와 같습니다.
        // eq(0) : index
        // eq(1) : 호스트 명
        // eq(2) : 호스트 IP (ablecube)
        // eq(3) : SCVM MNGT IP
        // eq(4) : 호스트 PN IP (ablecube-pn)
        // eq(5) : SCVM PN IP
        // eq(6) : SCVM CN IP
        
        let idx = $(this).find('td').eq(0).text().trim();
        let host_name = $(this).find('td').eq(1).text().trim();
        let host_ip = $(this).find('td').eq(2).text().trim();
        let scvm_mngt_ip = $(this).find('td').eq(3).text().trim();
        let host_pn_ip = $(this).find('td').eq(4).text().trim();
        let scvm_pn_ip = $(this).find('td').eq(5).text().trim();
        let scvm_cn_ip = $(this).find('td').eq(6).text().trim();
        
        // 10.10.3.1	ablecloud1	ablecube
        // 10.10.3.11	scvm1-mngt	scvm-mngt
        // 100.100.3.1	ablecube1-pn	ablecube-pn
        // 100.100.3.11	scvm1	scvm
        // 100.200.3.11	scvm1-cn	scvm-cn

        let temp_text = "";
        if(current_host_name == host_name){
            temp_text = host_ip + "\t" + host_name + "\t" + "ablecube" + "\n";
            temp_text += scvm_mngt_ip + "\t"  + "scvm"+idx+"-mngt" + "\t" + "scvm-mngt" + "\n";
            temp_text += host_pn_ip + "\t"  + "ablecube"+idx+"-pn" + "\t" + "ablecube-pn" + "\n";
            temp_text += scvm_pn_ip + "\t"  + "scvm"+idx+ "\t" + "scvm" + "\n";
            temp_text += scvm_cn_ip + "\t"  + "scvm"+idx+"-cn" + "\t" + "scvm-cn" + "\n";
        } else {
            temp_text = host_ip + "\t" + host_name + "\n";
            temp_text += scvm_mngt_ip + "\t"  + "scvm"+idx+"-mngt" + "\n";
            temp_text += host_pn_ip + "\t"  + "ablecube"+idx+"-pn" + "\n";
            temp_text += scvm_pn_ip + "\t"  + "scvm"+idx+ "\n";
            temp_text += scvm_cn_ip + "\t"  + "scvm"+idx+"-cn" + "\n";
        }
        hsots_text += temp_text;
    });
    return hsots_text;    
}

/**
 * Meathod Name : clusterConfigTableChange()
 * Date Created : 2022.08.23
 * Writer  : 배태주 
 * Description : 클러스터 구성할 호스트 대수에 따라 클러스터 구성 프로파일 입력항목을 추가하거나 제거하는 함수
 * Parameter : number_input, table_tbody
 * Return  : 없음
 * History  : 2022.08.23 최초 작성
 **/
 function clusterConfigTableChange(number_input, table_tbody) {
    
    let input_num = $("#"+number_input).val();
    let tr_cnt = $("#"+table_tbody+ " > tr").length;

    if(input_num > tr_cnt){ // <tr> 증가 경우 6 > 5
        for(let i = 0 ; i < input_num-tr_cnt ; i++){
            let insert_tr = "";
            insert_tr += "<tr style='border-bottom: solid 1px #dcdcdc'>";
            insert_tr += "  <td contenteditable='false'>"+(tr_cnt+i+1)+"</td>";
            insert_tr += "  <td contenteditable='true'></td>";
            insert_tr += "  <td contenteditable='true'></td>";
            insert_tr += "  <td contenteditable='true'></td>";
            insert_tr += "  <td contenteditable='true'></td>";
            insert_tr += "  <td contenteditable='true'></td>";
            insert_tr += "  <td contenteditable='true'></td>";
            insert_tr += "</tr>";
            $("#" + table_tbody + ":last").append(insert_tr);
        }
    } else if (input_num < tr_cnt){ // <tr> 감소 경우
        for(let i = 0 ; i > input_num-tr_cnt ; i--){
            $("#" + table_tbody + " > tr:last").remove();
        }
    }
}

/**
 * Meathod Name : tableToClusterConfigJsonObj()
 * Date Created : 2022.08.24
 * Writer  : 배태주 
 * Description : table에 입력된 json 데이터를 json string으로 변환하는 함수
 * Parameter : radio_value, option
 * Return  : json string
 * History  : 2022.08.25 최초 작성
 **/
function tableToClusterConfigJsonString(radio_value, option){

    var resultArrList = new Array();
    let table_tr_obj;

    if (radio_value == "new") {
        table_tr_obj = $('#form-table-tbody-cluster-config-new-host-profile'+option+' tr');

    } else if (radio_value == "existing") {
        table_tr_obj = $('#form-table-tbody-cluster-config-existing-host-profile'+option+' tr');
    }
    
    table_tr_obj.each(function(){
        // $(this).find('td').eq(0) 순서는 아래와 같습니다.
        // eq(0) : index
        // eq(1) : 호스트 명
        // eq(2) : 호스트 IP (ablecube)
        // eq(3) : SCVM MNGT IP
        // eq(4) : 호스트 PN IP (ablecube-pn)
        // eq(5) : SCVM PN IP
        // eq(6) : SCVM CN IP

        // 객체 생성
		var data = new Object() ;

        let idx = $(this).find('td').eq(0).text().trim();
        let host_name = $(this).find('td').eq(1).text().trim();
        let host_ip = $(this).find('td').eq(2).text().trim();
        let scvm_mngt_ip = $(this).find('td').eq(3).text().trim();
        let host_pn_ip = $(this).find('td').eq(4).text().trim();
        let scvm_pn_ip = $(this).find('td').eq(5).text().trim();
        let scvm_cn_ip = $(this).find('td').eq(6).text().trim();

        data.index = idx;
        data.hostname = host_name;
        data.ablecube = host_ip;
        data.scvmMngt = scvm_mngt_ip;
        data.ablecubePn = host_pn_ip;
        data.scvm = scvm_pn_ip;
        data.scvmCn = scvm_cn_ip;

		// 리스트에 생성된 객체 삽입
        resultArrList.push(data) ;

    });
    
    return JSON.stringify(resultArrList);
}

/**
 * Meathod Name : validateClusterConfigProfile()
 * Date Created : 2022.08.29
 * Writer  : 배태주
 * Description : table에 입력된 json 데이터 값을 검증하는 기능
 * Parameter : radio_value, option
 * Return  : 
 * History  : 2022.08.25 최초 작성
 **/
 function validateClusterConfigProfile(radio_value, option){

    let table_tr_obj;
    let validate_check = false;

    if (radio_value == "new") {
        table_tr_obj = $('#form-table-tbody-cluster-config-new-host-profile'+option+' tr');

    } else if (radio_value == "existing") {
        table_tr_obj = $('#form-table-tbody-cluster-config-existing-host-profile'+option+' tr');
    }
    
    table_tr_obj.each(function(index_num){
        // $(this).find('td').eq(0) 순서는 아래와 같습니다.
        // eq(0) : index
        // eq(1) : 호스트 명
        // eq(2) : 호스트 IP (ablecube)
        // eq(3) : SCVM MNGT IP
        // eq(4) : 호스트 PN IP (ablecube-pn)
        // eq(5) : SCVM PN IP
        // eq(6) : SCVM CN IP

        let idx = $(this).find('td').eq(0).text().trim();
        let host_name = $(this).find('td').eq(1).text().trim();
        let host_ip = $(this).find('td').eq(2).text().trim();
        let scvm_mngt_ip = $(this).find('td').eq(3).text().trim();
        let host_pn_ip = $(this).find('td').eq(4).text().trim();
        let scvm_pn_ip = $(this).find('td').eq(5).text().trim();
        let scvm_cn_ip = $(this).find('td').eq(6).text().trim();

        let idx_cnt = 0;
        table_tr_obj.each(function(){
            if (idx == $(this).find('td').eq(0).text().trim()){
                idx_cnt = idx_cnt+1;
            }
        });
        
        let host_name_cnt = 0;
        let current_host_name_cnt = 0;
        // 현재 ablecube 호스트의 이름
        let current_host_name = $("#form-input-current-host-name"+option).val();
        
        table_tr_obj.each(function(){
            if (host_name == $(this).find('td').eq(1).text().trim()){
                host_name_cnt = host_name_cnt+1;
            }

            if (current_host_name == $(this).find('td').eq(1).text().trim()){
                current_host_name_cnt = current_host_name_cnt+1;
            }
        });

        let host_ip_cnt = checkDupIpCnt(host_ip, index_num, table_tr_obj);
        let scvm_mngt_ip_cnt = checkDupIpCnt(scvm_mngt_ip, index_num, table_tr_obj);
        let host_pn_ip_cnt = checkDupIpCnt(host_pn_ip, index_num, table_tr_obj);
        let scvm_pn_ip_cnt = checkDupIpCnt(scvm_pn_ip, index_num, table_tr_obj);
        let scvm_cn_ip_cnt = checkDupIpCnt(scvm_cn_ip, index_num, table_tr_obj);

        // 점검항목 1 : 빈 값이 있으면 안됨
        if (idx == "" || idx == undefined || idx == null){
            alert("idx " + idx + " 번의 값이 존재하지 않습니다.");
            validate_check = true;
            return false;
        } else if (host_name == "" || host_name == undefined || host_name == null){
            alert("idx " + idx + "번의 호스트 명 값이 존재하지 않습니다.");
            validate_check = true;
            return false;
        } else if (host_ip == "" || host_ip == undefined || host_ip == null){
            alert("idx " + idx + "번의 호스트 IP 값이 존재하지 않습니다.");
            validate_check = true;
            return false;
        } else if (scvm_mngt_ip == "" || scvm_mngt_ip == undefined || scvm_mngt_ip == null){
            alert("idx " + idx + "번의 SCVM MNGT IP 값이 존재하지 않습니다.");
            validate_check = true;
            return false;
        } else if (host_pn_ip == "" || host_pn_ip == undefined || host_pn_ip == null){
            alert("idx " + idx + "번의 호스트 PN IP 값이 존재하지 않습니다.");
            validate_check = true;
            return false;
        } else if (scvm_pn_ip == "" || scvm_pn_ip == undefined || scvm_pn_ip == null){
            alert("idx " + idx + "번의 SCVM PN IP 값이 존재하지 않습니다.");
            validate_check = true;
            return false;
        } else if (scvm_cn_ip == "" || scvm_cn_ip == undefined || scvm_cn_ip == null){
            alert("idx " + idx + "번의 SCVM CN IP 값이 존재하지 않습니다.");
            validate_check = true;
            return false;
        }

        // 점검항목 2 : index가 중복되면 안됨        
        else if (idx_cnt >= 2) { // 동일한 idx가 2개 이상 중복되는 경우 에러
            alert("중복된 idx가 존재합니다.");
            validate_check = true;
            return false;
        }

        // 점검항목 3 : 호스트명이 중복되면 안됨
        else if (host_name_cnt >= 2) { // 동일한 호스트 명이 2개 이상 중복되는 경우 에러
            alert("중복된 호스트 명이 존재합니다.");
            validate_check = true;
            return false;
        }
        
        // 점검항목 4 : 다른 inx의 IP와 중복되면 안됨 (동일 idx내에서는 중복 허용)
        else if (host_ip_cnt >= 2) { // 다른 idx에 동일 ip가 존재하면 중복으로 처리
            alert("중복된 호스트 IP가 존재합니다.");
            validate_check = true;
            return false;
        }
        else if (scvm_mngt_ip_cnt >= 2) { // 다른 idx에 동일 ip가 존재하면 중복으로 처리
            alert("중복된 SCVM MNGT IP가 존재합니다.");
            validate_check = true;
            return false;
        }
        else if (host_pn_ip_cnt >= 2) { // 다른 idx에 동일 ip가 존재하면 중복으로 처리
            alert("중복된 호스트 PN IP가 존재합니다.");
            validate_check = true;
            return false;
        }
        else if (scvm_pn_ip_cnt >= 2) { // 다른 idx에 동일 ip가 존재하면 중복으로 처리
            alert("중복된 SCVM PN IP가 존재합니다.");
            validate_check = true;
            return false;
        }
        else if (scvm_cn_ip_cnt >= 2) { // 다른 idx에 동일 ip가 존재하면 중복으로 처리
            alert("중복된 SCVM CN IP가 존재합니다.");
            validate_check = true;
            return false;
        }

        // 점검항목 5 : 모든 IP는 IP 유형 체크
        else if (!checkIp(host_ip)){
            alert("idx " + idx + "번의 호스트 IP 유형이 올바르지 않습니다.");
            validate_check = true;
            return false;
        } else if (!checkIp(scvm_mngt_ip)){
            alert("idx " + idx + "번의 SCVM MNGT IP 유형이 올바르지 않습니다.");
            validate_check = true;
            return false;
        } else if (!checkIp(host_pn_ip)){
            alert("idx " + idx + "번의 호스트 PN IP 유형이 올바르지 않습니다.");
            validate_check = true;
            return false;
        } else if (!checkIp(scvm_pn_ip)){
            alert("idx " + idx + "번의 SCVM PN IP 유형이 올바르지 않습니다.");
            validate_check = true;
            return false;
        } else if (!checkIp(scvm_cn_ip)){
            alert("idx " + idx + "번의 SCVM CN IP 유형이 올바르지 않습니다.");
            validate_check = true;
            return false;
        }
        
        // 점검항목 6 : 현재 호스트명으로 된 항목이 존재하지 않으면 에러
        else if (current_host_name_cnt == 0 ){
            alert("클러스터 구성 프로파일 호스트 명과 현재 호스트 명과 동일한 항목이 없습니다.");
            validate_check = true;
            return false;
        } 
    });
    return validate_check;
}

/**
 * Meathod Name : checkDuplicateCcvmIp()
 * Date Created : 2022.09.14
 * Writer  : 배태주
 * Description : table에 입력된 ip값에 중복된 ccvm-mngt-ip가 존재하는지 확인
 * Parameter : ip, radio_value, option
 * Return  : 
 * History  : 2022.09.14 최초 작성
 **/
 function checkDuplicateCcvmIp(ip, radio_value, option){

    let table_tr_obj;
    let validate_check = false;

    if (radio_value == "new") {
        table_tr_obj = $('#form-table-tbody-cluster-config-new-host-profile'+option+' tr');

    } else if (radio_value == "existing") {
        table_tr_obj = $('#form-table-tbody-cluster-config-existing-host-profile'+option+' tr');
    }
    
    table_tr_obj.each(function(index_num){
        // $(this).find('td').eq(0) 순서는 아래와 같습니다.
        // eq(0) : index
        // eq(1) : 호스트 명
        // eq(2) : 호스트 IP (ablecube)
        // eq(3) : SCVM MNGT IP
        // eq(4) : 호스트 PN IP (ablecube-pn)
        // eq(5) : SCVM PN IP
        // eq(6) : SCVM CN IP

        let host_ip = $(this).find('td').eq(2).text().trim();
        let scvm_mngt_ip = $(this).find('td').eq(3).text().trim();
        let host_pn_ip = $(this).find('td').eq(4).text().trim();
        let scvm_pn_ip = $(this).find('td').eq(5).text().trim();
        let scvm_cn_ip = $(this).find('td').eq(6).text().trim();

        if (ip == host_ip || ip == scvm_mngt_ip || ip == host_pn_ip || ip == scvm_pn_ip || ip == scvm_cn_ip) {
            alert((index_num+1)+"번 idx에 CCVM 관리 IP와 중복된 IP가 존재합니다.");
            validate_check = true;
            return false;
        }
    });
    return validate_check;
}

/**
 * Meathod Name : checkDupIpCnt()
 * Date Created : 2022.08.31
 * Writer  : 배태주
 * Description : 중복되는 ip가 존재하는지 체크하는 함수
 * Parameter : ip, index_num, table_tr_obj
 * Return  : num
 * History  : 2022.08.31 최초 작성
 **/
function checkDupIpCnt(ip, index_num, table_tr_obj){
    duplication_ip_cnt = 0;

    table_tr_obj.each(function(index_num2){
        // if(index_num != index_num2){ // 다른 inx의 IP와 중복되면 안됨 (동일 idx내에서는 중복 허용)
        //     if (ip == $(this).find('td').eq(2).text().trim()){
        //         duplication_ip_cnt = duplication_ip_cnt+1;
        //     } else if (ip == $(this).find('td').eq(3).text().trim()){
        //         duplication_ip_cnt = duplication_ip_cnt+1;
        //     } else if (ip == $(this).find('td').eq(4).text().trim()){
        //         duplication_ip_cnt = duplication_ip_cnt+1;
        //     } else if (ip == $(this).find('td').eq(5).text().trim()){
        //         duplication_ip_cnt = duplication_ip_cnt+1;
        //     } else if (ip == $(this).find('td').eq(6).text().trim()){
        //         duplication_ip_cnt = duplication_ip_cnt+1;
        //     }
        // }
        if (ip == $(this).find('td').eq(2).text().trim()){
            duplication_ip_cnt = duplication_ip_cnt+1;
        }
        if (ip == $(this).find('td').eq(3).text().trim()){
            duplication_ip_cnt = duplication_ip_cnt+1;
        }
        if (ip == $(this).find('td').eq(4).text().trim()){
            duplication_ip_cnt = duplication_ip_cnt+1;
        }
        if (ip == $(this).find('td').eq(5).text().trim()){
            duplication_ip_cnt = duplication_ip_cnt+1;
        }
        if (ip == $(this).find('td').eq(6).text().trim()){
            duplication_ip_cnt = duplication_ip_cnt+1;
        }
    });

    return duplication_ip_cnt;
}