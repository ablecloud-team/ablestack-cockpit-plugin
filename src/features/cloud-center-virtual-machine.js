// import spawn from "../../../base1/cockpit.js"

var ccvm_instance;
class CloudCenterVirtualMachine {
    clusterdHost
    runningHost
    Name
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
    byteCalculation(bytes) {

        var bytes = parseInt(bytes);

        var s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

        var e = Math.floor(Math.log(bytes) / Math.log(1024));


        if (e == "-Infinity") return "0 " + s[0];

        else

            return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];

    }


    createDescriptionListText(id = 'span-cloud-vm-status', status = 'red', description = 'N/A') {
        let description_list__text = $("<div />").addClass('pf-c-description-list__text')
        let span_cloud_vm_status = $("<span></span>").attr('id', id).addClass('pf-c-label').addClass('pf-m-' + status);
        let span_content = $("<span></span>").addClass("pf-c-label__content").attr('id', "span-cloud-vm-status-content");
        let span_icon = $("<span />").addClass("pf-c-label__icon").prepend($('<i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>'));
        description_list__text.prepend(span_cloud_vm_status.prepend(span_content.prepend(span_icon).append(description)))
        return description_list__text[0]
    };

    checkVIRSHOK(data, message) {

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
                ccvm_instance.cpus=vm['CPU(s)']
                ccvm_instance.mem=vm['Max memory']
                ccvm_instance.disk_cap=vm['DISK_CAP']
                ccvm_instance.disk_phy=vm['DISK_PHY']
                ccvm_instance.ip=vm['ip'].split('/')[0]
                $('#card-action-cloud-vm-change').attr('disabled', false);
                $('#card-action-cloud-vm-connect').removeClass('pf-m-disabled')
            }
        })
    }

    checkVIRSHERR(data, message) {
        console.log("ok: " + data)
        console.log("ok: " + message)
        // if(data.search('Untrusted'))
        let status_span = $("#description-cloud-vm-status");
        let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', 'Error<br>'+data);
        status_span[0].children[0].replaceWith(a)

    }

    checkPCSOK(data, message) {
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
            cockpit.spawn([
                '/root/virshlist.py',
            ], {'host': ccvm_instance.runningHost, 'env': 'LANG="en_US.UTF-8"'})
                .then(ccvm_instance.checkVIRSHOK)
                .catch(ccvm_instance.checkVIRSHERR)
        } else if(obj.code == 500) {
            let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', '리소스가 구성되지 않았습니다.');
            status_span[0].children[0].replaceWith(a)
        }
    }

    checkPCSERR(data, message) {

        console.log("err: " + data)
        console.log("err: " + message)

        let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', 'checkPCSERR:<br>'+data);
        let status_span = $("#description-cloud-vm-status");
        status_span[0].children[0].replaceWith(a)
    }

    checkCCVM() {

        cockpit.spawn(['/usr/bin/python3',
            '/usr/share/cockpit/cockpit-plugin-ablestack/python/pcs/main.py',
            'status', '--resource', ccvm_instance.resource], {'host': 'localhost'})
            .then(ccvm_instance.checkPCSOK)
            .catch(ccvm_instance.checkPCSERR)

    }

    changeOffering(cpu, memory) {
        ccvm_instance.clusterdHost.forEach(function (host){
        cockpit.spawn(['/usr/bin/python3',
            '/usr/share/cockpit/cockpit-plugin-ablestack/python/host/virshedit.py',
            'edit', '--cpu', cpu.val(), '--memory', memory.val(), '--xml', ccvm_instance.xml], {'host': host})
            .then(ccvm_instance.checkPCSOK)
        })
    }
}
this.ccvm_instance = new CloudCenterVirtualMachine()
ccvm_instance = this.ccvm_instance