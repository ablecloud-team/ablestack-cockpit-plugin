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

    new CloudCenterVirtualMachine().checkCCVM();
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