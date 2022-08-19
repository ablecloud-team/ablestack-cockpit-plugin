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
        let str = "";
        let find_string = "scvm";
        let total_scvm_num = 0;
        let current_scvm_num = 0;
        // hosts 파일에 구분자 (탭)이 없을 경우 추가하는데 필요한 정규식
        let ip_format = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        if ($(input).val() != "") {
            let file_name = file_list[0].name;
            // 파일 이름 및 용량 체크
            if (checkClusterConfigPrepareFileName(file_name, file_type) != false && checkFileSize(file) != false) {
                // FileList
                let reader = new FileReader();
                try {
                    reader.onload = function (progressEvent) {
                        let result = progressEvent.target.result;
                        // 공백제거
                        result = $.trim(result);
                        // finalList는 host정보를 최종 결과값을 list를 2중화 하여 저장할 변수
                        // ex : ["10.10.1.10", "ccvm-mngt", "ccvm"],["10.10.1.1", "hostname1", "ablecube1","ablecube"],["10.10.1.2", "hostname2", "ablecube2"]...
                        finalList = [];  
                        // hosts 정보를 한줄씩 변환
                        let result_line_arr = result.split(/[\r]|[\n]/);
                        for (let i=0; i<result_line_arr.length; i++) {
                            // 호스트 한줄 정보를 tab 문자로 구분하여 객체화 시킴 ex : ["10.10.1.10", "ccvm-mngt", "ccvm"]
                            if(result_line_arr[i] != "" || !result_line_arr[i].includes("localhost")){
                                let result_arr = result_line_arr[i].split(/[\t]|[\n]/);
                                let arr = [];
                                for (let j=0; j<result_arr.length; j++) {
                                    if(ip_format.test(result_arr[0]) && result_arr[j] != ""){
                                        arr.push(result_arr[j]);
                                    }
                                }
                                if(arr.length > 0){
                                    finalList.push(arr);
                                }
                            }
                        }

                        let insert_tr = "";
                        
                        // clusterHostYN는 신규 클러스터 호스트 = new, 추가 호스트 = add
                        clusterHostYN = $('input[name=radio-cluster-host]:checked').val()
                        if (clusterHostYN=="new"){
                            // 배열 데이터를 테이블 형식으로 생성 최대 td 개수는 4개 (ip, Alias1, Alias2, Alias3)
                            for (let i=0; i<finalList.length; i++) {
                                insert_tr += "<tr>";

                                for(let j=0; j<finalList[i].length; j++) {
                                    insert_tr += "<td contenteditable='true'>"+finalList[i][j]+"</td>";
                                }
                                if(finalList[i].length == 2){
                                    insert_tr += "<td contenteditable='true'></td>";
                                    insert_tr += "<td contenteditable='true'></td>";
                                } else if (finalList[i].length == 3) {
                                    insert_tr += "<td contenteditable='true'></td>";
                                }
                                insert_tr += "</tr>";
                            }
                        } else if(clusterHostYN=="add") {
                            //해당 alias의 최대 번호값을 구해오는 함수 호출 


                            // 배열 데이터를 테이블 형식으로 생성 최대 td 개수는 4개 (ip, Alias1, Alias2, Alias3)
                            for (let i=0; i<finalList.length; i++) {
                                insert_tr += "<tr>";

                                for(let j=0; j<finalList[i].length; j++) {
                                    insert_tr += "<td contenteditable='true'>"+finalList[i][j]+"</td>";
                                }
                                if(finalList[i].length == 2){
                                    insert_tr += "<td contenteditable='true'></td>";
                                    insert_tr += "<td contenteditable='true'></td>";
                                } else if (finalList[i].length == 3) {
                                    insert_tr += "<td contenteditable='true'></td>";
                                }
                                insert_tr += "</tr>";
                            }
                        }

                        hostsAliasMaxNum(finalList,"ablecube");




                        // for (let i=0; i<result_arr.length;) {
                        //     insert_tr += "<tr>";
                        //     for(let j=1; j<=3; j++) {
                        //         if(i < result_arr.length) {
                        //             insert_tr += "<td contenteditable='true'>"+result_arr[i]+"</td>";
                        //             // ccvm 문자열 검색하여 구성된 총 호스트의 수를 파악
                        //             str = result_arr[i];
                        //             if(str.length == 5 || str.length == 6) {
                        //                 if(str.substring(0,4) == find_string) {
                        //                     total_scvm_num++
                        //                 }
                        //             }
                        //             // ccvm 문자열 검색하여 현재 호스트의 번호를 파악
                        //             str = result_arr[i];
                        //             if(str.length == 4) {
                        //                 if(str == find_string) {
                        //                     let current_scvm = "";
                        //                     current_scvm = result_arr[i-1]
                        //                     if(current_scvm.length == 5) {
                        //                         current_scvm_num = current_scvm.substring(4,5)
                        //                     }else if(current_scvm.length == 6) {
                        //                         current_scvm_num = current_scvm.substring(4,6)
                        //                     }
                        //                 }
                        //             }
                        //             i++
                        //         }
                        //     }
                        //     insert_tr += "</tr>";
                        // }
                        // 기존 호스트파일을 읽어와 구성할 호스트, 현재 호스트를 input 박스에 넣기
                        $('#form-input-cluster-config-host-number'+option+'').val(total_scvm_num);
                        $('#form-input-cluster-config-current-host-number'+option+'').val(current_scvm_num);
                        $('#form-table-tbody-cluster-config-existing-host-profile'+option+' tr').remove();
                        $(insert_tr).appendTo('#form-table-tbody-cluster-config-existing-host-profile'+option+'');
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
 function changeAlias2(option) {
    if($('#form-table-tbody-cluster-config-existing-host-profile'+option+' > tr').length && $('input[name="radio-hosts-file'+option+'"]:checked').val() == "existing") {
        let hosts_input_number = $('#form-input-cluster-config-host-number'+option+'').val();
        let current_hosts_input_number = $('#form-input-cluster-config-current-host-number'+option+'').val();
        current_hosts_input_number = current_hosts_input_number*1
        let tbody_td_number = $('#form-table-tbody-cluster-config-existing-host-profile'+option+' > tr > td').length;
        // 현재호트스 숫자 *1(Alias2 순서) + 1(ccvm 포함하여 2번째 줄부터) *3(1줄 3칸) -1(테이블 시작점 0)
        let ablecube = ((hosts_input_number*1)+1)*3-1;
        let scvm_mngt = ((hosts_input_number*2)+1)*3-1;
        let ablecube_pn = ((hosts_input_number*3)+1)*3-1;
        let scvm = ((hosts_input_number*4)+1)*3-1;
        let scvm_cn = ((hosts_input_number*5)+1)*3-1;
        let pre_td = 3;
        let gap_num = hosts_input_number-current_hosts_input_number;

        // Alias2 (ccvm제외) 모두 삭제
        for(let i=3; i < tbody_td_number; i++) {
            let j;
            j = i+1;
            if(j%3 == 0) {
                $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(i)+")").text("");
            }
        }
        for(let i=0; i < tbody_td_number; i++) {
            $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(ablecube+(pre_td*gap_num)*-1)+")").text("ablecube");
            $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(scvm_mngt+(pre_td*gap_num)*-1)+")").text("scvm-mngt");
            $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(ablecube_pn+(pre_td*gap_num)*-1)+")").text("ablecube-pn");
            $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(scvm+(pre_td*gap_num)*-1)+")").text("scvm");
            $('#form-table-tbody-cluster-config-existing-host-profile'+option+'').find("td:eq("+(scvm_cn+(pre_td*gap_num)*-1)+")").text("scvm-cn");
        }
    }else if ($('input[name="radio-hosts-file'+option+'"]:checked').val() == "existing"){
        console.log("There are no data");
    }
}

/**
 * Meathod Name : putHostsValueIntoTextarea
 * Date Created : 2021.03.22
 * Writer  : 류홍욱
 * Description : 준비 마법사에서 설정에 따라 설정확인에 위치한 textarea에 hosts 값을 넣는 함수
 * Parameter : radio_value
 * Return  : 없음
 * History  : 2021.10.21 수정
 **/

 function putHostsValueIntoTextarea(radio_value, option) {
    if (radio_value == "new") {
        // hosts file 준비 방법 표시 및 값 설정
        $('#span-hosts-file'+option+'').text("신규 생성");
        // 신규로 생성할 경우 테이블의 내용을 table에 넣는 코드
        let colcnt = $('#form-table-cluster-config-new-host-profile'+option+' colgroup col').length;
        let arr = new Array();
        $('#form-table-tbody-cluster-config-new-host-profile'+option+' tr').each(function(){
            let j;
            for(let i = 0; i < colcnt; i++){
                j = i+1;
                arr += $(this).find('td').eq(i).text();
                if(j%3 == 0) {
                    arr += "\n"
                }
                else if(j%3 != 0){
                    arr += "\t"
                }
            }
        });
        $('#div-textarea-cluster-config-confirm-hosts-file'+option+'').val(arr.trim());
    } else if (radio_value == "existing") {
        // hosts file 준비 방법 표시 및 값 설정
        $('#span-hosts-file'+option+'').text("기존 파일 사용");
        // 기존 파일로 생성할 경우 테이블의 내용을 textarea에 넣는 코드
        let colcnt = $('#form-table-cluster-config-existing-host-profile'+option+' colgroup col').length;
        let arr = new Array();
        $('#form-table-tbody-cluster-config-existing-host-profile'+option+' tr').each(function(){
            let j;
            for(let i = 0; i < colcnt; i++){
                j = i+1;
                arr += $(this).find('td').eq(i).text();
                if(j%3 == 0) {
                    arr += "\n"
                }
                else if(j%3 != 0){
                    arr += "\t"
                }
            }
        });
        $('#div-textarea-cluster-config-confirm-hosts-file'+option+'').val(arr.trim());
    }
}


/**
 * Meathod Name : putHostsValueIntoTextarea
 * Date Created : 2021.03.22
 * Writer  : 류홍욱
 * Description : 준비 마법사에서 설정에 따라 설정확인에 위치한 textarea에 hosts 값을 넣는 함수
 * Parameter : radio_value
 * Return  : 없음
 * History  : 2021.10.21 수정
 **/

 function hostsAliasMaxNum(finalList,name) {
    // name의 종류 (ablecube, scvm-mngt, ablecube-pn, )
    // ablecube1 넘버링된 항목은 alias2 값에서 검색 조건
    // ablecube1-pn 넘버링된 항목은 alias1 값에서 검색
    // scvm1 넘버링된 항목은 alias1 값에서 검색
    // scvm1-mngt 넘버링된 항목은 alias1 값에서 검색
    // scvm1-cn 넘버링된 항목은 alias1 값에서 검색
    // ccvm-mngt 넘버링된 항목은 alias1 값에서 검색

    result_arr = 0;

    for (let i=0; i<finalList.length; i++) {
        for(let j=0; j<finalList[i].length; j++) {
            if(name == "ablecube"){
                if(j == 2 && finalList[i][j].includes("ablecube") && !finalList[i][j].includes("-pn")){
                    finalList[i][j]
                    result_arr.push(finalList[i][j]);
                }
            }
        }
    }

    

    

}