/**
 * File Name : storage-vm-wizard.js  
 * Date Created : 2020.02.19
 * Writer  : 박동혁
 * Description : 스토리지센터 VM 배포 마법사에서 발생하는 이벤트 처리를 위한 JavaScript
**/

// 변수 선언
var cur_step_wizard_vm_config = "1";

var disk_json_string = '{';
disk_json_string += '"code": 200,';
disk_json_string += '    "val": {';
disk_json_string += '      "blockdevices": [';
disk_json_string += '        {';
disk_json_string += '          "name": "sda",';
disk_json_string += '          "path": "/dev/sda",';
disk_json_string += '          "rota": false,';
disk_json_string += '          "model": "Seagate_BarraCuda_SSD_ZA2000CM10002",';
disk_json_string += '          "size": "1.8T",';
disk_json_string += '          "state": "running",';
disk_json_string += '          "group": "disk",';
disk_json_string += '          "type": "disk",';
disk_json_string += '          "tran": "sata",';
disk_json_string += '          "subsystems": "block:scsi:pci"';
disk_json_string += '        },';
disk_json_string += '        {';
disk_json_string += '            "name": "sdb",';
disk_json_string += '            "path": "/dev/sdb",';
disk_json_string += '            "rota": false,';
disk_json_string += '            "model": "Seagate_BarraCuda_SSD_ZA2000CM10002",';
disk_json_string += '            "size": "1.8T",';
disk_json_string += '            "state": "running",';
disk_json_string += '            "group": "disk",';
disk_json_string += '            "type": "disk",';
disk_json_string += '            "tran": "sata",';
disk_json_string += '            "subsystems": "block:scsi:pci"';
disk_json_string += '        },';
disk_json_string += '        {';
disk_json_string += '            "name": "sdc",';
disk_json_string += '            "path": "/dev/sdc",';
disk_json_string += '            "rota": false,';
disk_json_string += '            "model": "Seagate_BarraCuda_SSD_ZA2000CM10002",';
disk_json_string += '            "size": "1.8T",';
disk_json_string += '            "state": "running",';
disk_json_string += '            "group": "disk",';
disk_json_string += '            "type": "disk",';
disk_json_string += '            "tran": "sata",';
disk_json_string += '            "subsystems": "block:scsi:pci"';
disk_json_string += '        },';
disk_json_string += '        {';
disk_json_string += '          "name": "nvme0n1",';
disk_json_string += '          "path": "/dev/nvme0n1",';
disk_json_string += '          "rota": false,';
disk_json_string += '          "model": "SAMSUNG MZVLB512HBJQ-00000",';
disk_json_string += '          "size": "477G",';
disk_json_string += '          "state": "live",';
disk_json_string += '          "group": "disk",';
disk_json_string += '          "type": "disk",';
disk_json_string += '          "tran": "nvme",';
disk_json_string += '          "subsystems": "block:nvme:pci"';
disk_json_string += '        }';
disk_json_string += '      ],';
disk_json_string += '      "raidcontrollers": [';
disk_json_string += '        {';
disk_json_string += '          "Slot": "00:00.0",';
disk_json_string += '          "Class": "Raid",';
disk_json_string += '          "Vendor": "Advanced Micro Devices, Inc. [AMD]",';
disk_json_string += '          "Device": "Raid",';
disk_json_string += '          "SVendor": "Advanced Micro Devices, Inc. [AMD]",';
disk_json_string += '          "SDevice": "testRaid"';
disk_json_string += '        },';
disk_json_string += '        {';
disk_json_string += '            "Slot": "01:01.0",';
disk_json_string += '            "Class": "Raid",';
disk_json_string += '            "Vendor": "Advanced Micro Devices2, Inc. [AMD]",';
disk_json_string += '            "Device": "Raid",';
disk_json_string += '            "SVendor": "Advanced Micro Devices2, Inc. [AMD]",';
disk_json_string += '            "SDevice": "testRaid2"';
disk_json_string += '        }';
disk_json_string += '      ]';
disk_json_string += '    },';
disk_json_string += '    "name": "listDiskInterface",';
disk_json_string += '    "type": "dict"';
disk_json_string += '  }';



var nic_json_string='{';
nic_json_string += '  "code": 200,';
nic_json_string += '  "val": {';
nic_json_string += '    "bridges": [';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "bridge0",';
nic_json_string += '        "TYPE": "bridge",';
nic_json_string += '        "STATE": "connected"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "bridge1",';
nic_json_string += '        "TYPE": "bridge",';
nic_json_string += '        "STATE": "connected"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "bridge2",';
nic_json_string += '        "TYPE": "bridge",';
nic_json_string += '        "STATE": "connected"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "cloud0",';
nic_json_string += '        "TYPE": "bridge",';
nic_json_string += '        "STATE": "connected"';
nic_json_string += '      }';
nic_json_string += '    ],';
nic_json_string += '    "ethernets": [';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "enp3s0",';
nic_json_string += '        "TYPE": "ethernet",';
nic_json_string += '        "STATE": "connected",';
nic_json_string += '        "PCI": "0000:03:00.0"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "enp3s0",';
nic_json_string += '        "TYPE": "ethernet",';
nic_json_string += '        "STATE": "connected",';
nic_json_string += '        "PCI": "0000:03:00.1"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "enp3s1",';
nic_json_string += '        "TYPE": "ethernet",';
nic_json_string += '        "STATE": "connected",';
nic_json_string += '        "PCI": "0000:04:00.0"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "enp3s1",';
nic_json_string += '        "TYPE": "ethernet",';
nic_json_string += '        "STATE": "connected",';
nic_json_string += '        "PCI": "0000:04:00.1"';
nic_json_string += '      }';
nic_json_string += '    ],';
nic_json_string += '    "others": [';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "wlp2s0",';
nic_json_string += '        "TYPE": "wifi",';
nic_json_string += '        "STATE": "connected"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "vnet0",';
nic_json_string += '        "TYPE": "tun",';
nic_json_string += '        "STATE": "connected"';
nic_json_string += '     },';
nic_json_string += '     {';
nic_json_string += '       "DEVICE": "vnet1",';
nic_json_string += '       "TYPE": "tun",';
nic_json_string += '        "STATE": "connected"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "vnet2",';
nic_json_string += '        "TYPE": "tun",';
nic_json_string += '        "STATE": "connected"';
nic_json_string += '      },';
nic_json_string += '      {';
nic_json_string += '        "DEVICE": "lo",';
nic_json_string += '        "TYPE": "loopback",';
nic_json_string += '        "STATE": "unmanaged"';
nic_json_string += '      }';
nic_json_string += '    ]';
nic_json_string += '  },';
nic_json_string += '  "name": "listNetworkInterface",';
nic_json_string += '  "type": "dict"';
nic_json_string += '}';
  

// Document.ready 시작
$(document).ready(function(){
    // 스토리지센터 가상머신 배포 마법사 페이지 준비
    $('#div-modal-wizard-vm-config-compute').hide();
    $('#div-modal-wizard-vm-config-disk').hide();
    $('#div-modal-wizard-vm-config-network').hide();
    $('#div-modal-wizard-vm-config-additional').hide();
    $('#div-modal-wizard-vm-config-ssh-key').hide();
    $('#div-modal-wizard-vm-config-review').hide();
    $('#div-modal-wizard-vm-config-deploy').hide();
    $('#div-modal-wizard-vm-config-finish').hide();

    // $('#nav-button-review').addClass('pf-m-disabled');
    $('#nav-button-finish').addClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#button-cancel-config-modal-wizard-vm-config').attr('disabled', false);

    // 첫번째 스텝에서 시작
    cur_step_wizard_vm_config = "1";

    //디스크 구성방식 초기 세팅
    setDiskInfo();

    //관리 NIC용 Bridge 리스트 초기 세팅
    setNicBridge('form-select-storage-vm-mngt-nic');

    //스토리지 트래픽 구성 리스트 NIC Passthrough로 초기 세팅
    setNicPassthrough('form-select-storage-vm-public-nic1');
    setNicPassthrough('form-select-storage-vm-cluster-nic1');

});
// document ready 끝

// 이벤트 처리 함수
$('#button-close-modal-wizard-storage-vm').on('click', function(){
    $('#div-modal-wizard-storage-vm').hide();
});

// '다음' 버튼 클릭 시 이벤트를 처리하기 위한 함수
$('#button-next-step-modal-wizard-vm-config').on('click', function(){
    if (cur_step_wizard_vm_config == "1") {
        $('#div-modal-wizard-vm-config-overview').hide();
        $('#div-modal-wizard-vm-config-compute').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-overview').removeClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-compute').addClass('pf-m-current');

        cur_step_wizard_vm_config = "2";
    }
    else if (cur_step_wizard_vm_config == "2") {
        $('#div-modal-wizard-vm-config-compute').hide();
        $('#div-modal-wizard-vm-config-disk').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-compute').removeClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-disk').addClass('pf-m-current');

        cur_step_wizard_vm_config = "3";
    }
    else if (cur_step_wizard_vm_config == "3") {
        $('#div-modal-wizard-vm-config-disk').hide();
        $('#div-modal-wizard-vm-config-network').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-disk').removeClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-network').addClass('pf-m-current');

        cur_step_wizard_vm_config = "4";
    }
    else if (cur_step_wizard_vm_config == "4") {
        $('#div-modal-wizard-vm-config-network').hide();
        $('#div-modal-wizard-vm-config-additional').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-network').removeClass('pf-m-current');
        $('#nav-button-vm-config').removeClass('pf-m-current');
        $('#nav-button-additional').addClass('pf-m-current');

        cur_step_wizard_vm_config = "5";
    }
    else if (cur_step_wizard_vm_config == "5") {
        $('#div-modal-wizard-vm-config-additional').hide();
        $('#div-modal-wizard-vm-config-ssh-key').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-additional').removeClass('pf-m-current');
        $('#nav-button-vm-config').removeClass('pf-m-current');
        $('#nav-button-ssh-key').addClass('pf-m-current');
        
        cur_step_wizard_vm_config = "6";
    }
    else if (cur_step_wizard_vm_config == "6") {

        $('#div-modal-wizard-vm-config-ssh-key').hide();
        $('#div-modal-wizard-vm-config-review').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-ssh-key').removeClass('pf-m-current');
        $('#nav-button-vm-config').removeClass('pf-m-current');
        $('#nav-button-review').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-vm-config').html('배포');

        cur_step_wizard_vm_config = "7";
    }
    else if (cur_step_wizard_vm_config == "7") {
        // 배포 버튼을 누르면 배포 진행 단계로 이동한다. 
        hideAllMainBody();
        resetCurrentMode();
    
        $('#div-modal-wizard-vm-config-deploy').show();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', true);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
        $('#nav-button-finish').addClass('pf-m-current');

        cur_step_wizard_vm_config = "8";

        deployStorageCenterVM();
    }
    else if (cur_step_wizard_vm_config == "8") {

    }
    else if (cur_step_wizard_vm_config == "9") {

    }
});

// '이전' 버튼 클릭 시 이벤트를 처리하기 위한 함수
$('#button-before-step-modal-wizard-vm-config').on('click', function(){
    if (cur_step_wizard_vm_config == "1") {
        // 이전 버튼 없음
    }
    else if (cur_step_wizard_vm_config == "2") {
        // 1번 스텝으로 이동
        $('#div-modal-wizard-vm-config-overview').show();
        $('#div-modal-wizard-vm-config-compute').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
        $('#nav-button-overview').addClass('pf-m-current');
        $('#nav-button-vm-config').removeClass('pf-m-current');
        $('#nav-button-compute').removeClass('pf-m-current');

        // 1번으로 변수값 변경
        cur_step_wizard_vm_config = "1";
    }
    else if (cur_step_wizard_vm_config == "3") {
        $('#div-modal-wizard-vm-config-compute').show();
        $('#div-modal-wizard-vm-config-disk').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-compute').addClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-disk').removeClass('pf-m-current');

        cur_step_wizard_vm_config = "2";
    }
    else if (cur_step_wizard_vm_config == "4") {
        $('#div-modal-wizard-vm-config-disk').show();
        $('#div-modal-wizard-vm-config-network').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-disk').addClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-network').removeClass('pf-m-current');

        cur_step_wizard_vm_config = "3";
    }
    else if (cur_step_wizard_vm_config == "5") {
        $('#div-modal-wizard-vm-config-network').show();
        $('#div-modal-wizard-vm-config-additional').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-network').addClass('pf-m-current');
        $('#nav-button-vm-config').addClass('pf-m-current');
        $('#nav-button-additional').removeClass('pf-m-current');

        cur_step_wizard_vm_config = "4";
    }
    else if (cur_step_wizard_vm_config == "6") {
        $('#div-modal-wizard-vm-config-additional').show();
        $('#div-modal-wizard-vm-config-ssh-key').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-additional').addClass('pf-m-current');
        $('#nav-button-ssh-key').removeClass('pf-m-current');

        cur_step_wizard_vm_config = "5";
    }
    else if (cur_step_wizard_vm_config == "7") {
        $('#div-modal-wizard-vm-config-ssh-key').show();
        $('#div-modal-wizard-vm-config-review').hide();
        $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
        $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
        $('#nav-button-ssh-key').addClass('pf-m-current');
        $('#nav-button-review').removeClass('pf-m-current');

        $('#button-next-step-modal-wizard-vm-config').html('다음');

        cur_step_wizard_vm_config = "6";
    }
    else if (cur_step_wizard_vm_config == "8") {

    }
    else if (cur_step_wizard_vm_config == "9") {

    }
});

// 취소 버튼 클릭 이벤트 처리
$('#button-cancel-config-modal-wizard-vm-config').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    // Form에 입력된 모든 데이터를 초기화한다.
    cur_step_wizard_vm_config = "1";

    $('#div-modal-wizard-vm-config-overview').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-overview').addClass('pf-m-current');   

    // 모달 창을 닫는다.
    $('#div-modal-wizard-storage-vm').hide();
});

// 마법사 Side 버튼 이벤트 처리
$('#nav-button-overview').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-overview').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-overview').addClass('pf-m-current');

    cur_step_wizard_vm_config = "1";
});

$('#nav-button-vm-config').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-compute').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-vm-config').addClass('pf-m-current');
    $('#nav-button-compute').addClass('pf-m-current');

    cur_step_wizard_vm_config = "2";
});

$('#nav-button-compute').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-compute').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-vm-config').addClass('pf-m-current');
    $('#nav-button-compute').addClass('pf-m-current');

    cur_step_wizard_vm_config = "2";
});

$('#nav-button-disk').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-disk').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-vm-config').addClass('pf-m-current');
    $('#nav-button-disk').addClass('pf-m-current');

    cur_step_wizard_vm_config = "3";
});

$('#nav-button-network').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-network').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-vm-config').addClass('pf-m-current');
    $('#nav-button-network').addClass('pf-m-current');

    cur_step_wizard_vm_config = "4";
});

$('#nav-button-additional').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-additional').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-additional').addClass('pf-m-current');

    cur_step_wizard_vm_config = "5";
});

$('#nav-button-ssh-key').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-ssh-key').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', true);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-ssh-key').addClass('pf-m-current');

    cur_step_wizard_vm_config = "6";
});

$('#nav-button-review').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();
    
    // review 정보 세팅
    setReviewInfo();

    $('#div-modal-wizard-vm-config-review').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', false);
    $('#nav-button-review').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-vm-config').html('배포');

    cur_step_wizard_vm_config = "7";
});

$('#nav-button-finish').on('click', function(){
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-finish').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', false);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-finish').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-vm-config').hide();
    $('#button-before-step-modal-wizard-vm-config').hide();
    $('#button-cancel-config-modal-wizard-vm-config').hide();

    cur_step_wizard_vm_config = "9";
});

/**
 * Meathod Name : hideAllMainBody  
 * Date Created : 2021.02.22
 * Writer  : 박동혁
 * Description : 마법사 대화상자의 모든 Main Body Division 숨기기
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.02.22 최초 작성
 */
function hideAllMainBody() {
    $('#div-modal-wizard-vm-config-overview').hide();
    $('#div-modal-wizard-vm-config-compute').hide();
    $('#div-modal-wizard-vm-config-disk').hide();
    $('#div-modal-wizard-vm-config-network').hide();
    $('#div-modal-wizard-vm-config-additional').hide();
    $('#div-modal-wizard-vm-config-ssh-key').hide();
    $('#div-modal-wizard-vm-config-review').hide();
    $('#div-modal-wizard-vm-config-deploy').hide();
    $('#div-modal-wizard-vm-config-finish').hide();

    $('#button-next-step-modal-wizard-vm-config').html('다음');
}

/**
 * Meathod Name : resetCurrentMode  
 * Date Created : 2021.02.22
 * Writer  : 박동혁
 * Description : 마법사 대화상자의 측면 버튼의 '현재 위치'를 모두 리셋
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.02.22 최초 작성
 */
function resetCurrentMode() {
    $('#nav-button-overview').removeClass('pf-m-current');
    $('#nav-button-vm-config').removeClass('pf-m-current');
    $('#nav-button-compute').removeClass('pf-m-current');
    $('#nav-button-disk').removeClass('pf-m-current');
    $('#nav-button-network').removeClass('pf-m-current');
    $('#nav-button-additional').removeClass('pf-m-current');
    $('#nav-button-ssh-key').removeClass('pf-m-current');
    $('#nav-button-review').removeClass('pf-m-current');
    $('#nav-button-finish').removeClass('pf-m-current');
}

/**
 * Meathod Name : deployStorageCenterVM  
 * Date Created : 2021.02.25
 * Writer  : 박동혁
 * Description : 가상머신을 배포하는 작업을 화면에 표시하도록 하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.02.25 최초 작성
 * History  : 2021.03.17 기능 구현
 */
function deployStorageCenterVM() {

    //validate 결과 true인 경우 다음 작업 진행    
    if(validateStorageVm()){
        
        //초기화 작업

        //xml 생성
        //createScvmXml()

        //가상머신 생성

        //가상머신 시작

        //스토리지 센터 가상머신 cloudinit 설정
        showDivisionVMConfigFinish();

    } else {

    }
    
    //setTimeout(showDivisionVMConfigFinish, 5000);
}

/**
 * Meathod Name : showDivisionVMConfigFinish
 * Date Created : 2021.02.25
 * Writer  : 박동혁
 * Description : 가상머신을 배포한 후 마지막 페이지를 보여주는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.02.25 최초 작성
 */
function showDivisionVMConfigFinish() {
    hideAllMainBody();
    resetCurrentMode();

    $('#div-modal-wizard-vm-config-finish').show();
    $('#button-next-step-modal-wizard-vm-config').attr('disabled', true);
    $('#button-before-step-modal-wizard-vm-config').attr('disabled', true);
    $('#nav-button-finish').addClass('pf-m-current');
    $('#nav-button-finish').removeClass('pf-m-disabled');

    $('#button-next-step-modal-wizard-vm-config').hide();
    $('#button-before-step-modal-wizard-vm-config').hide();
    $('#button-cancel-config-modal-wizard-vm-config').hide();

    cur_step_wizard_vm_config = "9";
}

/**
 * Meathod Name : setDiskInfo
 * Date Created : 2021.03.16
 * Writer  : 배태주
 * Description : 디스크 정보를 호출하여 raid passhtrough할 디스크 리스트를 세팅하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.16 최초 작성
 */
function setDiskInfo(){
    //var cmd = ["python3","/usr/share/cockpit/cockpit-plugin-ablestack/python/disk/disk_action.py","list"];
    //명령어 확인 필요
    var cmd = "date";

    // rp = raid passthrough, lp = lun passthrough
    disk_setup_type = $('input[name="form-radio-storage-vm-disk-type"]:checked').val()
    
    cockpit.spawn(cmd).then(function(data){
        
        // 초기화
        $('#disk-pci-list').empty();

        var el ='';
        var result = JSON.parse(disk_json_string);
        
        if(disk_setup_type == "rp"){
            var raid_pci_list = result.val.raidcontrollers;
            for(var i = 0 ; i < raid_pci_list.length ; i ++ ){
                el += '<div class="pf-c-check">';
                el += '<input class="pf-c-check__input" type="checkbox" id="form-checkbox-disk'+i+'" name="form-checkbox-disk" value='+raid_pci_list[i].Slot+' />';
                el += '<label class="pf-c-check__label" style="margin-top:5px" for="form-checkbox-disk'+i+'">'+raid_pci_list[i].Slot+' '+raid_pci_list[i].Vendor+'</label>';
                el += '</div>';    
            }
        } else {
            var lun_pci_list = result.val.blockdevices;
            for(var i = 0 ; i < lun_pci_list.length ; i ++ ){
                el += '<div class="pf-c-check">';
                el += '<input class="pf-c-check__input" type="checkbox" id="form-checkbox-disk'+i+'" name="form-checkbox-disk" value='+lun_pci_list[i].path+' />';
                el += '<label class="pf-c-check__label" style="margin-top:5px" for="form-checkbox-disk'+i+'">'+lun_pci_list[i].path+' '+lun_pci_list[i].state+' '+lun_pci_list[i].size+' '+lun_pci_list[i].model+' '+'</label>';
                el += '</div>';    
            }
        }

        $('#disk-pci-list').append(el);

    }).catch(function(){
        alert("error");
    });
}

//디스크 raid passthrough 또는 lun passthrough 리스트를 호출하기 위한 기능
$('input[name="form-radio-storage-vm-disk-type"]').change(function() {
    setDiskInfo();
});

//스토리지 트래픽 구성 방식의 선택에 따른 서버용 NIC, 복제용 NIC 셀렉트 박스를 세팅하는 버튼
$('input[name="form-radio-storage-vm-nic-type"]').change(function() {
    
    // np = nic passthrough, npb = nic passthrough bonding, bn = bridge network
    storage_traffic_setup_type = $('input[name="form-radio-storage-vm-nic-type"]:checked').val()

    //form-select-storage-vm-public-nic2, form-select-storage-vm-cluster-nic2 값 삭제
    $('#form-select-storage-vm-public-nic2').remove();
    $('#form-select-storage-vm-cluster-nic2').remove();

    if(storage_traffic_setup_type == "np"){
        setNicPassthrough('form-select-storage-vm-public-nic1');
        setNicPassthrough('form-select-storage-vm-cluster-nic1');
    }else if(storage_traffic_setup_type == "npb"){
       //form-select-storage-vm-public-nic2, form-select-storage-vm-cluster-nic2 값 요소 추가
        var el1 = '<select class="pf-c-form-control" id="form-select-storage-vm-public-nic2" name="form-select-storage-vm-public-nic2"></select>';
        var el2 = '<select class="pf-c-form-control" id="form-select-storage-vm-cluster-nic2" name="form-select-storage-vm-cluster-nic2"></select>';

        $('#public-nic').append(el1);
        $('#cluster-nic').append(el2);
       
        setNicPassthrough('form-select-storage-vm-public-nic1');
        setNicPassthrough('form-select-storage-vm-cluster-nic1');
        
        //nic2에 리스트 생성
        setNicPassthrough('form-select-storage-vm-public-nic2');
        setNicPassthrough('form-select-storage-vm-cluster-nic2');
    }else{
        setNicBridge('form-select-storage-vm-public-nic1');
        setNicBridge('form-select-storage-vm-cluster-nic1');
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
 */
 function setNicBridge(select_box_id){
    //var cmd = ["python3","/usr/share/cockpit/cockpit-plugin-ablestack/python/nic/network_action.py","list"];
    //명령어 확인 필요
    var cmd = "date";

    cockpit.spawn(cmd).then(function(data){
        
        // 초기화
        $('#'+select_box_id).empty();

        var el ='';
        var result = JSON.parse(nic_json_string);
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
 * Meathod Name : setNicPassthrough
 * Date Created : 2021.03.16
 * Writer  : 배태주
 * Description : nic pic 정보를 호출하여 셀렉트 박스 세팅
 * Parameter : (string) input selete id
 * Return  : 없음
 * History  : 2021.03.16 최초 작성
 */
 function setNicPassthrough(select_box_id){
    //var cmd = ["python3","/usr/share/cockpit/cockpit-plugin-ablestack/python/nic/network_action.py","list"];
    //명령어 확인 필요
    var cmd = "date";

    cockpit.spawn(cmd).then(function(data){
        
        // 초기화
        $('#'+select_box_id).empty();

        var el ='';
        var result = JSON.parse(nic_json_string);
        var ethernets_list = result.val.ethernets;

        el += '<option value="" selected>선택하십시오</option>';
        for(var i = 0 ; i < ethernets_list.length ; i ++ ){
            el += '<option value="'+ethernets_list[i].PCI+'">'+ethernets_list[i].DEVICE+' '+ethernets_list[i].TYPE+' '+ethernets_list[i].PCI+' ('+ethernets_list[i].STATE+')</option>';
        }

        $('#'+select_box_id).append(el);

    }).catch(function(){
        alert("error");
    });
}

/**
 * Meathod Name : setReviewInfo
 * Date Created : 2021.03.17
 * Writer  : 배태주
 * Description : 설정확인을 위한 정보를 세팅하는 기능
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.17 최초 작성
 */
function setReviewInfo(){
    //cpu
    var cpu = $('select#form-select-storage-vm-cpu option:checked').val();
    var cpu_text = $('select#form-select-storage-vm-cpu option:checked').text();
    
    if(cpu == '') {
        $('#rv-cpu').text("미입력");
    } else {
        $('#rv-cpu').text(cpu_text);
    }
    
    //memory
    var memory = $('select#form-select-storage-vm-memory option:checked').val();
    var memory_txt = $('select#form-select-storage-vm-memory option:checked').text();

    if(memory == '') {
        $('#rv-memory').text("미입력");
    } else {
        $('#rv-memory').text(memory_txt);
    }
    
    //디스크 구성 ( rp = RAID Passthrough, lp = LUN Passthrough )
    var svdt = $('input[type=radio][name=form-radio-storage-vm-disk-type]:checked').val();

    $('#rv-data-disk').empty();
    $('input[type=checkbox][name="form-checkbox-disk"]').each(function() {
        if(this.checked){
            var el = "";
            if(svdt == 'rp') {
                el += "RAID Passthrough : " + $('label[for="'+this.id+'"]').text()+"</br>";
            } else if(svdt == 'lp') {
                el += "LUN Passthrough : " + $('label[for="'+this.id+'"]').text()+"</br>";
            }
            $('#rv-data-disk').append(el);
        }
    });

    // 선택된 디스크가 없을 경우 "미입력" 표기
    if($('#rv-data-disk').text() == ''){
        $('#rv-data-disk').append("미입력");
    }

    //관리 NIC용 네트워크
    $('#rv-management-traffic').empty();
    var mngt_nic = $('select#form-select-storage-vm-mngt-nic option:checked').val();
    var mngt_nic_txt = $('select#form-select-storage-vm-mngt-nic option:checked').text();
    
    if(mngt_nic == '') {
        $('#rv-management-traffic').text("미입력");
    } else {
        var el = "관리용 : " + mngt_nic_txt;
        $('#rv-management-traffic').append(el);
    }

    //스토리지 트래픽 구성 ( np = NIC Passthrough, npb = NIC Passthrough Bonding, bn= Bridge Network )
    var svnt = $('input[type=radio][name=form-radio-storage-vm-nic-type]:checked').val();

    $('#rv-storage-traffic').empty();
    if(svnt == "npb"){
        //npb일 경우 서버용 nic와 복제용 nic를 2개씩 입력 받기 때문에 별도로 분리하여 사용
        //서버용 public-nic
        var svpn1 = $('select#form-select-storage-vm-public-nic1 option:checked').val();
        var svpn1_txt = $('select#form-select-storage-vm-public-nic1 option:checked').text();
        var svpn2 = $('select#form-select-storage-vm-public-nic2 option:checked').val();
        var svpn2_txt = $('select#form-select-storage-vm-public-nic2 option:checked').text();
        //복제용 cluster-nic
        var svcn1 = $('select#form-select-storage-vm-cluster-nic1 option:checked').val();
        var svcn1_txt = $('select#form-select-storage-vm-cluster-nic1 option:checked').text();
        var svcn2 = $('select#form-select-storage-vm-cluster-nic2 option:checked').val();
        var svcn2_txt = $('select#form-select-storage-vm-cluster-nic2 option:checked').text();

        var el = "";

        if(svpn1 == '') {
            el += "서버용1 : 미입력</br>";
        } else {
            el += "서버용1 : "+svpn1_txt+"</br>";
        }

        if(svpn2 == '') {
            el += "서버용2 : 미입력</br>";
        } else {
            el += "서버용2 : "+svpn2_txt+"</br>";
        }

        if(svpn1 == '') {
            el += "복제용1 : 미입력</br>";
        } else {
            el += "복제용1 : "+svcn1_txt+"</br>";
        }

        if(svpn2 == '') {
            el += "복제용2 : 미입력</br>";
        } else {
            el += "복제용2 : "+svcn2_txt+"</br>";
        }

        $('#rv-storage-traffic').append(el);

    } else {
        // np 또는 bn인 경우 서버용 nic와 복제용 nic를 1개씩 입력 받기 때문에 공통으로 사용해도 상관없음
        //서버용 public-nic
        var svpn1 = $('select#form-select-storage-vm-public-nic1 option:checked').val();
        var svpn1_txt = $('select#form-select-storage-vm-public-nic1 option:checked').text();
        //복제용 cluster-nic
        var svcn1 = $('select#form-select-storage-vm-cluster-nic1 option:checked').val();
        var svcn1_txt = $('select#form-select-storage-vm-cluster-nic1 option:checked').text();

        var el = "";

        if(svpn1 == '') {
            el += "서버용1 : 미입력</br>";
        } else {
            el += "서버용1 : "+svpn1_txt+"</br>";
        }

        if(svpn1 == '') {
            el += "복제용1 : 미입력</br>";
        } else {
            el += "복제용1 : "+svcn1_txt+"</br>";
        }

        $('#rv-storage-traffic').append(el);
        
    }

    // 선택된 스토리지 트래픽 네트워크가 없을 경우 "미입력" 표기
    if($('#rv-storage-traffic').text() == ''){
        $('#rv-storage-traffic').append("미입력");
    }
}

/**
 * Meathod Name : validateStorageVm
 * Date Created : 2021.03.17
 * Writer  : 배태주
 * Description : 스토리지 센터 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.17 최초 작성
 */
function validateStorageVm(){

    return true;

}