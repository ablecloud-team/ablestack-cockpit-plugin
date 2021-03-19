// import spawn from "../../../base1/cockpit.js"

let ccvm_instance=null
class CloudCenterVirtualMachine
{

    constructor() {
        if(ccvm_instance) return ccvm_instance;
        ccvm_instance = this;
        ccvm_instance.runningHost = '10.10.1.3'

    }

    createDescriptionListText(id='span-cloud-vm-status', status='red', description='N/A'){
        let description_list__text = $("<div />").addClass('pf-c-description-list__text')
        let span_cloud_vm_status = $("<span></span>").attr('id', id).addClass('pf-c-label').addClass('pf-m-' + status);
        let span_content = $("<span></span>").addClass("pf-c-label__content").attr('id',"span-cloud-vm-status-content");
        let span_icon = $("<span />").addClass("pf-c-label__icon").prepend($('<i class="fas fa-fw fa-info-circle" aria-hidden="true"></i>'));
        description_list__text.prepend(span_cloud_vm_status.prepend(span_content.prepend(span_icon).append(description)))
        return description_list__text[0]
    };
    checkVIRSHOK(data, message) {

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
        console.log(obj)
        let status_span = $("#description-cloud-vm-status");
        let vms = obj
        vms.forEach(function(vm){
            if(vm.Name=="djpark-dev-2") {
                $("#div-cloud-vm-cpu-text").text(
                    vm['CPU(s)']+" vCore(N/A Socket, N/A Core)"
                );
                $("#div-cloud-vm-memory-text").text(
                    vm['Max memory']
                );
                $("#div-cloud-vm-disk-text").text(
                    vm['DISK_CAP'] + " bytes (" + vm['DISK_PHY'] + " bytes used)"
                );
                $("#div-cloud-vm-nic-type-text").text(
                    "NIC Type : " + "N/A (Parent : N/A)"
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
            }
        })
    }
    checkVIRSHERR(data, message) {

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
        console.log(obj)
        let status_span = $("#description-cloud-vm-status");
        if (obj.code == 200) {
            let a = ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'green', 'test');
            status_span[0].children[0].replaceWith(a)
        }
    }
    checkPCSOK(data, message) {

        console.log("ok: "+data)
        console.log("ok: "+message)
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
        if(obj.code==200){
            let a=ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'green', 'test');
            status_span[0].children[0].replaceWith(a)
            cockpit.spawn([
                '/root/virshlist.py',
                // '/usr/sbin/ip', 'a'
            ], {'host':ccvm_instance.runningHost, 'env':'LANG="en_US.UTF-8"' })
                .then( ccvm_instance.checkVIRSHOK)
                .catch( ccvm_instance.checkVIRSHERR)
            //  .stream(ccvm_instance.checkVIRSHStream)
        }
        else{
            let a=ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', 'test');
            status_span[0].children[0].replaceWith(a)
        }
    }
    checkPCSERR(data, message){

        console.log("err: "+data)
        console.log("err: "+message)

        let a=ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'red', 'test');
        let status_span = $("#description-cloud-vm-status");
        status_span[0].children[0].replaceWith(a)
    }
    checkPCSStream(data){

        console.log("stream: "+data)
        let a=ccvm_instance.createDescriptionListText("span-cloud-vm-status", 'yellow', 'test');
        let status_span = $("#description-cloud-vm-status");
        status_span[0].children[0].replaceWith(a)
    }
    checkCCVM() {

        //cockpit.spawn(["ping", "-c", "4", "8.8.8.8"])
        cockpit.spawn(['/usr/bin/python3',
            '/usr/share/cockpit/cockpit-plugin-ablestack/python/pcs/main.py',
            'status','--resource','test_res'], {'host':'localhost' })
            .then( ccvm_instance.checkPCSOK)
            .catch( ccvm_instance.checkPCSERR)
        //  .stream(ccvm_instance.checkPCSStream)

    }
}