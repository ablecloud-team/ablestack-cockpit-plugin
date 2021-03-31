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
    var cmd = ["python3","/usr/share/cockpit/cockpit-plugin-ablestack/python/nic/network_action.py","list"];

    cockpit.spawn(cmd).then(function(data){
        
        // 초기화
        $('#'+select_box_id).empty();

        var el ='';
        var result = JSON.parse(data);
        var bridge_list = result.val.bridges;

        el += '<option value="" selected>선택하십시오</option>';
        for(var i = 0 ; i < bridge_list.length ; i ++ ){
            el += '<option value="'+bridge_list[i].DEVICE+'">'+bridge_list[i].DEVICE+' ('+bridge_list[i].STATE+')</option>';
        }

        $('#'+select_box_id).append(el);

    }).catch(function(){
        alert("error");
    });
}

/**
 * Meathod Name : setHostsFileReader
 * Date Created : 2021.03.18
 * Writer  : 배태주
 * Description : hosts file을 읽어 편집하는 기능
 * Parameter : input, callBackFunction
 * Return  : 없음
 * History  : 2021.03.18 최초 작성
**/
function setHostsFileReader(input, callBackFunction) {
    input.on("change", function(event) { 
        if(input.val() != ""){
            try {
                // FileList
                let file_list = input.files || event.target.files;
                // File
                let file = file_list[0];
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
function setSshKeyFileReader(input, callBackFunction) {
    input.on("change", function(event) { 
        if(input.val() != ""){
            try {
                // FileList
                let file_list = input.files || event.target.files;
                // File
                let file = file_list[0];
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