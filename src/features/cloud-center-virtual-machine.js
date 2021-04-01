// import spawn from "../../../base1/cockpit.js"
/*
Copyright (c) 2021 ABLECLOUD Co. Ltd.

Cloud Center Virtual Machine(ccvm)의 정보를 조회하는 클래스입니다.

checkCCVM: CCVM의 정보를 조회하고 UI 에 입력합니다.
changeOffering: CCVM의 자원할당량을 변경합니다.
ccvm_instance: singleton 객체입니다. new를 통해 새로 object를 요청하면 기존 사용중이던 object를 동일하게 반환합니다.
최초작성일 : 2021-03-22
 */
var ccvm_instance;
class CloudCenterVirtualMachine {
    /*
    생성자 입니다.

    파라미터 설명 : 없음
    반환값 : 없음
    */
    constructor() {
        if (ccvm_instance !== undefined) return ccvm_instance;
        else {
            ccvm_instance = this;
            ccvm_instance.runningHost = ''
            ccvm_instance.clusterdHost = []
            ccvm_instance.Name = 'ccvm'
            ccvm_instance.xml = '/root/test.xml'
            ccvm_instance.resource = 'cloudcenter_res'
        }
    }
    /*
    용량 숫자를 단위에 맞춰 bytes단위로 변경하는 함수
    ex) ccvm_instance.toBytes("1.5 GiB") == 1610612736

    파라미터 설명 : size: str: 용량을 나타내는 문자열
    반환값 : float: bytes 단위의 용량
    */
    toBytes(size){
        if( size.search('KB') >= 0) return parseFloat(size)*1000
        else if( size.search('KiB') >= 0) return parseFloat(size)*1024
        else if( size.search('MB') >= 0) return parseFloat(size)*1000*1000
        else if( size.search('MiB') >= 0) return parseFloat(size)*1024*1024
        else if( size.search('GB') >= 0) return parseFloat(size)*1000*1000*1000
        else if( size.search('GiB') >= 0) return parseFloat(size)*1024*1024*1024
        else if( size.search('TB') >= 0) return parseFloat(size)*1000*1000*1000*1000
        else if( size.search('TiB') >= 0) return parseFloat(size)*1024*1024*1024*1024
        else if( size.search('PB') >= 0) return parseFloat(size)*1000*1000*1000*1000*1000
        else if( size.search('PiB') >= 0) return parseFloat(size)*1024*1024*1024*1024*1024

    }
    /*
    bytes용량 숫자를 적절한 단위를 붙이도록 변경하는 함수
    ex) ccvm_instance.byteCalculation(1610612736) == "1.50 GB"

    파라미터 설명 : bytes: int: bytes 단위의 용량
    반환값 : str: 적절한 단위를 붙인 용량문자
    */
    byteCalculation(bytes) {

        var bytes = parseInt(bytes);

        var s = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

        var e = Math.floor(Math.log(bytes) / Math.log(1024));


        if (e == "-Infinity") return "0 " + s[0];

        else

            return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];

    }


    /*
    가상머신 상태 필드의 상태 메세지부분의 html tag를 작성하는 함수
    ex) ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', '인스턴스를 찾을 수 없습니다.')
    == <div class="pf-c-description-list__text"><span id="span-cloud-vm-status" class="pf-c-label pf-m-red"><span class="pf-c-label__content" id="span-cloud-vm-status-content"><span class="pf-c-label__icon"><i class="fas fa-fw fa-info-circle" aria-hidden="true"></i></span>인스턴스를 찾을 수 없습니다.</span></span></div>

    파라미터 설명 : id: str: bytes 단위의 용량
    파라미터 설명 : status: str: bytes 단위의 용량
    파라미터 설명 : description: str: bytes 단위의 용량
    반환값 : str: 적절한 단위를 붙인 용량문자
    */
    createDescriptionListText(id = 'span-cloud-vm-status', status = 'red', description = 'N/A') {
        let description_list__text = $("<div />").addClass('pf-c-description-list__text')
        let span_cloud_vm_status = $("<span></span>").attr('id', id).addClass('pf-c-label').addClass('pf-m-' + status);
        let span_content = $("<span></span>").addClass("pf-c-label__content").attr('id', "span-cloud-vm-status-content");
        let span_icon = $("<span />").addClass("pf-c-label__icon").prepend($('<i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>'));
        description_list__text.prepend(span_cloud_vm_status.prepend(span_content.prepend(span_icon).append(description)))
        return description_list__text[0]
    };
    /*
    virshlist.py 를 통해 현재 ccvm의 상태를 조회한 경우 화면에 결과를 출력 하는 콜백 함수
    checkPCSOK에서 호출된다.

    */
    checkVIRSHOK(data, message) {
        return new Promise((resolve) => {
            console.log("ok: " + data)
            console.log("ok: " + message)
            const obj = JSON.parse(data)
            let status_span = $("#description-cloud-vm-status");
            let vms = obj
            let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', '인스턴스를 찾을 수 없습니다.');
            status_span[0].children[0].replaceWith(a)
            vms.forEach(function (vm) {
                if (vm.Name == ccvm_instance.Name) {
                    $("#div-cloud-vm-cpu-text").text(
                        vm['CPU(s)'] + " vCore"
                    );
                    $("#div-cloud-vm-memory-text").text(
                        ccvm_instance.byteCalculation(ccvm_instance.toBytes(vm['Max memory']))
                    );
                    $("#div-cloud-vm-disk-text").text(
                        ccvm_instance.byteCalculation(vm['DISK_CAP']) +" (" + ccvm_instance.byteCalculation(vm['DISK_PHY']) + " used)"
                    );
                    $("#div-cloud-vm-nic-type-text").text(
                        "NIC Type : " + vm['nictype'] + " (Parent : " + vm['nicbridge'] + ")"
                    );
                    $("#div-cloud-vm-nic-ip-text").text(
                        "IP : " + vm['ip']
                    );
                    $("#div-cloud-vm-nic-gw-text").text(
                        "GW : " + "N/A"
                    );
                    if (vm.State == "running") {
                        let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'green', 'running');
                        status_span[0].children[0].replaceWith(a)
                    } else {
                        let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', 'shut down');
                        status_span[0].children[0].replaceWith(a)
                    }
                    sessionStorage.setItem("ccvm_status", vm.State.toUpperCase()); 
                    ccvm_instance.cpus=vm['CPU(s)']
                    ccvm_instance.mem=vm['Max memory']
                    ccvm_instance.disk_cap=vm['DISK_CAP']
                    ccvm_instance.disk_phy=vm['DISK_PHY']
                    ccvm_instance.ip=vm['ip'].split('/')[0]
                    $('#card-action-cloud-vm-change').attr('disabled', false);
                    $('#card-action-cloud-vm-connect').removeClass('pf-m-disabled')
                    resolve();
                }else{
                    sessionStorage.setItem("ccvm_status", "no signal");
                    resolve();
                }
            })
        });
    }
    /*
    virshlist.py 를 통해 현재 ccvm의 상태를 조회중 스크립트 오류가 발생한 경우 화면에 결과를 출력 하는 콜백 함수
    checkPCSOK에서 호출된다.

    */
    checkVIRSHERR(data, message) {
        return new Promise((resolve) => {
            console.log("ok: " + data)
            console.log("ok: " + message)
            // if(data.search('Untrusted'))
            let status_span = $("#description-cloud-vm-status");
            let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', 'Error<br>'+data);
            status_span[0].children[0].replaceWith(a)
            resolve();
        });

    }
    /*
    pcs/main.py 를 통해 현재 클라우드센터 클러스터의 상태를 조회한 경우 화면에 결과를 출력하는 콜백 함수
    checkCCVM에서 호출된다.
    클러스터가 구성된경우 virshlist.py를 호출하여 checkVIRSH(OK|ERR)에 값을 전달한다.
    */
    checkPCSOK(data, message) {
        return new Promise((resolve) => {
            ccvm_instance= new CloudCenterVirtualMachine()
            console.log("ok: " + data)
            console.log("ok: " + message)
            const obj = JSON.parse(data)
            /*
                {
                    "code": 200,
                    "val": {
                        "clustered_host": [
                            "ycyun-1"
                        ],
                        "started": "false",
                        "active": "false",
                        "blocked": "false",
                        "failed": "false"
                    },
                    "name": "statusResource",
                    "type": "dict"
                }
            */
            let status_span = $("#description-cloud-vm-status");
            if (obj.code == 200) {
                let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'orange', '가상머신 확인중...');
                status_span[0].children[0].replaceWith(a)
                if (obj['val']['started'] == undefined ){
                        let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'orange', '가상머신이 동작중이지 않습니다..');
                        status_span[0].children[0].replaceWith(a)
                        return
                }
                ccvm_instance.runningHost = obj['val']['started']
                ccvm_instance.clusterdHost = obj['val']['clustered_host']
                console.log(ccvm_instance)
                cockpit.spawn(['/usr/bin/python3',
                '/usr/share/cockpit/ablestack/python/host/virshlist.py',
                ], {'host': ccvm_instance.runningHost, 'env': 'LANG="en_US.UTF-8"'})
                    .then(ccvm_instance.checkVIRSHOK)
                    .catch(ccvm_instance.checkVIRSHERR)
            } else if(obj.code == 500) {
                let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', '리소스가 구성되지 않았습니다.');
                status_span[0].children[0].replaceWith(a)
                resolve();
            } else{
                resolve();
            }
        });
    }

    /*
    pcs/main.py 를 통해 현재 클라우드센터 클러스터의 상태를 조회중 스크립트 오류가 발생한 경우 화면에 결과를 출력 하는 콜백 함수
    checkCCVM에서 호출된다.

    */
    checkPCSERR(data, message) {
        return new Promise((resolve) => {
            console.log("err: " + data)
            console.log("err: " + message)
            let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', 'checkPCSERR:<br>'+data);
            let status_span = $("#description-cloud-vm-status");
            status_span[0].children[0].replaceWith(a)
            resolve();
        });
    }

    /*
    pcs/main.py 를 통해 현재 클라우드센터 클러스터의 상태를 조회하는 메소드.
    ex) ccvm_instance.checkCCVM() 으로 호출한다.
    클러스터 상태를 조회하여 결과를 checkPCS(OK|ERR)에 넘겨준다.

    */
    checkCCVM() {

        cockpit.spawn(['/usr/bin/python3',
            pluginpath + '/python/pcs/main.py',
            'status', '--resource', ccvm_instance.resource], {'host': 'localhost'})
            .then(ccvm_instance.checkPCSOK)
            .catch(ccvm_instance.checkPCSERR)

    }
    /*
    virshedit.py 를 통해 현재 클라우드센터 클러스터의 자원 할당량을 변경하는 함수.
    ex) ccvm_instance.changeOffering(cpu, memory)
    완료된 이후 결과에 따른 modal을 생성한다.

    */
    changeOffering(cpu, memory) {
        ccvm_instance.clusterdHost.forEach(function (host){
        cockpit.spawn(['/usr/bin/python3',
            '/usr/share/cockpit/ablestack/python/host/virshedit.py',
            'edit', '--cpu', cpu, '--memory', memory, '--xml', ccvm_instance.xml], {'host': host})
            .then(ccvm_instance.createAlertModal)
            .catch(ccvm_instance.createAlertModal)
        })
    }
    /*
    자원변경 모달을 화면에 표시하는 함수.
    다른 방법을 찾는중

    */
    createChangeModal(){
        // 클라우드센터VM 자원변경
        $('#div-change-modal-cloud-vm').show();
        if(ccvm_instance.firstRun===undefined) {
            $('#button-execution-modal-cloud-vm-change').on('click', function () {
                // 클라우드센터VM 자원변경 실행
                $('#div-change-modal-cloud-vm').hide();
            });

            $('#button-cancel-modal-cloud-vm-change').on('click', function () {
                // 클라우드센터VM 자원변경 취소
                $('#div-change-modal-cloud-vm').hide();
            });

            $('#button-close-modal-cloud-vm-change').on('click', function () {
                // 클라우드센터VM 자원변경 취소
                $('#div-change-modal-cloud-vm').hide();
            });
            ccvm_instance.firstRun=false
        }
    }

    /*
    변경 완료후 안내 모달을 화면에 표시하는 함수.
    다른 방법을 찾는중

    */
    createAlertModal(data, message){

        const obj = JSON.parse(data)
        let msg = ''
        if(obj.code==200) msg = "클라우드센터VM의 자원를 변경했습니다. 클러스터를 재시작 해주세요."
        else msg = "클라우드센터VM의 자원를 변경하는데 실패했습니다.<br>"+data+"<br>"+message

        $('#div-change-alert-cloud-vm').show();
        $('#div-change-alert-cloud-vm-description').text(msg)
        $('#div-change-alert-cloud-vm button').on('click', function (){
            $('#div-change-alert-cloud-vm').hide()
        })
    }
}
this.ccvm_instance = new CloudCenterVirtualMachine()
ccvm_instance = this.ccvm_instance