/**
 * File Name : main-glue.js
 * Date Created : 2023.04.25
 * Writer :배태주
 * Description : main-glue.html에서 발생하는 이벤트 처리를 위한 JavaScript
 **/

// document.ready 영역 시작
pluginpath = '/usr/share/cockpit/ablestack';
glue_api_ip = '';
glue_api_port = '8080';
hypervisor = '';

var console_log = true;

$(document).ready(function(){
  // glue_conf.json 읽어 오기
  cockpit.spawn(["cat", pluginpath + "/tools/properties/glue_conf.json"])
  .then(function(data){
    var glueConf = JSON.parse(data);
    glue_api_port = glueConf.apiPort;
    hypervisor = glueConf.hypervisor;

    cockpit.script([`cat /etc/hosts | grep -E '(^|\\s)scvm-mngt(\\s|$)' | awk '{print $1}'`])
    .then(function (ip) {
      if(ip != ""){
        glue_api_ip = ip;
        topTabAction("button-tab-glue-vm");
        scanHostKey();
        glueVmList();

        if(hypervisor == 'cell'){
          cockpit.script(["scp -q -o StrictHostKeyChecking=no root@ablecube:/usr/share/cockpit/ablestack/tools/properties/cluster.json /usr/share/cockpit/ablestack/tools/properties/cluster.json"])
          .then(function () {
            gwvmInfoSet();
          }).catch(function (error) {
            alert("초기 cluster.json 파일 복사 실패 : "+error);
          });
          setInterval(() => {
            gwvmInfoSet(),glueVmList()
          }, 15000);
        }else{
          setInterval(() => {
            glueVmList()
          }, 15000);
        }

      }else{
        alert("/etc/hosts 파일에 호스트 해당명이 없습니다. /etc/hosts 파일을 확인해주세요.");
      }
    })
  })
  .catch(function(data){
    createLoggerInfo("glue_conf.json 파일 읽기 실패");
    console.log("glue_conf.json 파일 읽기 실패" + data);
  });
});
// document.ready 영역 끝

// 이벤트 처리 함수
// Use viewport coordinates so scrollable cards and dialogs cannot clip menus.
function glueMenuPosition(anchor, menuWidth, menuHeight, viewportWidth, viewportHeight, alignRight){
  var edge = 8;
  var gap = 4;
  var width = Math.min(menuWidth, Math.max(0, viewportWidth - edge * 2));
  var below = Math.max(0, viewportHeight - edge - anchor.bottom - gap);
  var above = Math.max(0, anchor.top - edge - gap);
  var openAbove = below < menuHeight && above > below;
  var height = Math.min(menuHeight, openAbove ? above : below);
  var left = alignRight ? anchor.right - width : anchor.left;
  return {
    left: Math.max(edge, Math.min(left, viewportWidth - edge - width)),
    top: openAbove ? anchor.top - gap - height : anchor.bottom + gap,
    width: width,
    maxHeight: height
  };
}

function closeAblestackMenus(){
  $('.pf-v6-c-menu.ablestack-menu').each(function(){
    var $menu = $(this);
    // Hide before restoring styles so closing cannot animate the menu size.
    $menu.attr('hidden', true).hide();
    if($menu.hasClass('glue-floating-menu')){
      var originalStyle = $menu.data('glue-original-style');
      if(originalStyle == null){
        $menu.removeAttr('style');
      }else{
        $menu.attr('style', originalStyle);
      }
      $menu.removeClass('glue-floating-menu glue-menu-measuring').removeData('glue-original-style');
    }
    $menu.attr('hidden', true).hide();
  });
  $('.pf-v6-c-menu-toggle[aria-expanded="true"]').attr('aria-expanded', 'false');
  $('.ablestack-menu-dropdown.pf-m-expanded, .ablestack-menu-select.pf-m-expanded').removeClass('pf-m-expanded');
}

function openAblestackMenu($toggle, $menu){
  if(!$menu || !$menu.length || !$toggle || !$toggle.length){
    return;
  }
  $menu.data('glue-original-style', $menu.attr('style') || '');
  var anchor = $toggle[0].getBoundingClientRect();
  var isSelect = $toggle.closest('.ablestack-menu-select').length > 0;
  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  var menu = $menu[0];
  // Set the size before display and measure invisibly at the viewport origin.
  // This avoids both an oversized first frame and overflow during measurement.
  $menu.addClass('glue-floating-menu glue-menu-measuring');
  menu.style.setProperty('--glue-menu-width', isSelect ? anchor.width + 'px' : 'max-content');
  menu.style.setProperty('--glue-menu-max-width', Math.max(0, viewportWidth - 16) + 'px');
  $menu.removeAttr('hidden').show();
  var bounds = menu.getBoundingClientRect();
  var position = glueMenuPosition(anchor, isSelect ? anchor.width : bounds.width, Math.min(bounds.height, 300),
    viewportWidth, viewportHeight, $menu.hasClass('pf-m-align-right'));
  menu.style.setProperty('--glue-menu-width', position.width + 'px');
  menu.style.setProperty('--glue-menu-left', position.left + 'px');
  menu.style.setProperty('--glue-menu-top', position.top + 'px');
  menu.style.setProperty('--glue-menu-max-height', position.maxHeight + 'px');
  $menu.removeClass('glue-menu-measuring');
  $toggle.attr('aria-expanded', 'true');
  $toggle.closest('.ablestack-menu-dropdown, .ablestack-menu-select').addClass('pf-m-expanded');
}

// Close when the anchor moves; scrolling inside the menu itself stays usable.
window.addEventListener('scroll', function(e){
  if(!$(e.target).closest('.glue-floating-menu').length){
    closeAblestackMenus();
  }
}, true);
$(window).on('resize', closeAblestackMenus);
$(document).on('keydown', function(e){
  if(e.key === 'Escape'){
    var $toggle = $('.pf-v6-c-menu-toggle[aria-expanded="true"]').first();
    closeAblestackMenus();
    $toggle.trigger('focus');
  }
});

function toggleAblestackMenu($toggle){
  var $container = $toggle.closest('.ablestack-menu-dropdown, .ablestack-menu-select');
  var $menu = $container.find('.pf-v6-c-menu.ablestack-menu').first();
  var isOpen = $menu.length && $menu.is(':visible') && !$menu.attr('hidden');
  closeAblestackMenus();
  if(!isOpen){
    openAblestackMenu($toggle, $menu);
  }
}

// 메뉴 외부 클릭 시 닫기
$(document).on('click', function(e){
  if($(e.target).closest('.ablestack-menu-dropdown, .ablestack-menu-select, .pf-v6-c-menu.ablestack-menu').length === 0){
    closeAblestackMenus();
  }
});

// 상위 문서 영역 클릭 시 닫기 (iframe 외부 클릭)
$(top.document).on('click', function(){
  closeAblestackMenus();
});

// 메뉴 토글 클릭
$(document).on('click', '.ablestack-menu-dropdown .pf-v6-c-menu-toggle, .ablestack-menu-select .pf-v6-c-menu-toggle', function(e){
  e.preventDefault();
  e.stopPropagation();
  toggleAblestackMenu($(this));
});

// 드롭다운 메뉴 항목 클릭 시 닫기
$(document).on('click', '.ablestack-menu-dropdown .pf-v6-c-menu__item', function(){
  closeAblestackMenus();
});

// 상태 보기 드롭다운 메뉴 토글
function toggleAction(id,index){
  var menuId = '#' + id + index;
  var $menu = $(menuId);
  if(!$menu.length){
    return;
  }
  var labelledBy = $menu.attr('aria-labelledby');
  var $toggle = labelledBy ? $('#' + labelledBy) : $menu.closest('.ablestack-menu-dropdown, .ablestack-menu-select').find('.pf-v6-c-menu-toggle').first();
  var isOpen = $menu.is(':visible') && !$menu.attr('hidden');
  closeAblestackMenus();
  if(!isOpen){
    openAblestackMenu($toggle, $menu);
  }
}

/** 스토리지 서비스 구성 관련 action start */
$('#button-glue-api-server-connect').on('click', function(){
  window.open('https://'+glue_api_ip+':'+glue_api_port+'/swagger/index.html');
});

/** 스토리지 서비스 구성 관련 action start */
$('#menu-item-gateway-vm-setup').on('click', function(){
  cockpit.script(["scp -q -o StrictHostKeyChecking=no root@ablecube:/usr/share/cockpit/ablestack/tools/properties/cluster.json /usr/share/cockpit/ablestack/tools/properties/cluster.json"])
  .then(function () {
    $('#form-select-gateway-vm-mngt-nic-parent').val("");
    $('#form-input-gateway-vm-mngt-nic-ip').val("");
    $('#form-select-gateway-vm-storage-nic-parent').val("");
    $('#form-input-gateway-vm-storage-nic-ip').val("");

    $('#div-modal-gateway-vm-setup').show();
  })
  .catch(function (error) {
    alert("cluster.json 파일 복사 실패 : "+error);
  });
});

/** 스토리지 서비스 구성 관련 action start */
$('#menu-item-gateway-vm-setup2').on('click', function(){
  $('#div-modal-gateway-vm-setup').show();
});

// div-modal-alert-button-confirm 클릭시
$('#modal-status-alert-button-confirm').on('click',function(){
  $('#div-modal-status-alert').hide();
});

// alert modal 닫기
$('#modal-status-alert-button-close1, #modal-status-alert-button-close2').on('click', function(){
  $('#div-modal-status-alert').hide();
});

// help 팝업 이벤트 처리 시작
$('i[name=icon-help-action]').on('click',function(e){
  $("#modal-help-title").html("");
  // $("#modal-help-body").html("");

  if(e.target.id == "icon-help-glue-vm-status"){
    $("#modal-help-title").html("Glue 가상머신 도움말");
    $("#modal-help-body").html("Glue 스토리지 클러스터를 구성하는 가상머신 상태 정보와 IP 정보를 확인할 수 있습니다.");
  } else if (e.target.id == "icon-help-gateway-vm-status") {
    $("#modal-help-title").html("게이트웨이 가상머신 도움말");
    $("#modal-help-body").html("스토리지 서비스 게이트웨이 전용 가상머신으로 필요시 해당 가상머신을 구성하여 사용할 수 있습니다.");
  } else if (e.target.id == "icon-help-gluefs") {
    $("#modal-help-title").html("Glue File System 도움말");
    $("#modal-help-body").html("Glue 파일 시스템( GlueFS )은 Glue의 분산 객체 저장소인 RADOS 위에 구축된 POSIX 호환 파일 시스템입니다. Glue FS는 공유 홈 디렉터리, HPC 스크래치 공간, 분산 워크플로 공유 스토리지와 같은 다양한 애플리케이션을 위한 다용도 고가용성 고성능 파일 저장소를 제공합니다.<br>Glue File System 마운트는 CUBE HOST 및 SCVM에서만 가능하며 외부 HOST 및 가상머신은 NFS 및 SMB를 이용하여 마운트할 수 있습니다.");
  } else if (e.target.id == "icon-help-gluefs-subvolume-group") {
    $("#modal-help-title").html("Glue FS Subvolume Group 도움말");
    $("#modal-help-body").html("GlueFS(Glue File System) 하위 볼륨 그룹을 생성, 조회, 절대 경로 가져오기 및 제거할 수 있습니다. Glue FS의 하위 그룹을 생성하여 효율적으로 GlueFS의 그룹 및 경로를 관리할 수 있습니다.");
  } else if (e.target.id == "icon-help-nfs-cluster") {
    $("#modal-help-title").html("NFS Cluster 도움말");
    $("#modal-help-body").html("NFS 서비스를 제공하는 클러스터를 생성할 수 있습니다.");
  } else if (e.target.id == "icon-help-nfs-export") {
    $("#modal-help-title").html("NFS Export 도움말");
    $("#modal-help-body").html("NFS Export의 경로, GlueFS, 프로토콜, 접근타입, Squash를 설정 및 관리할 수 있습니다.");
  } else if (e.target.id == "icon-help-smb-service") {
    $("#modal-help-title").html("SMB Service 도움말");
    $("#modal-help-body").html("Glue 가상머신 별 SMB 서비스를 제공 및 활성화 하고 관리할 수 있습니다. 또한 사용자 정보를 관리할 수 있습니다.");
  } else if (e.target.id == "icon-help-object-gateway") {
    $("#modal-help-title").html("Object Gateway 도움말");
    $("#modal-help-body").html("Object Gateway는 Glue 위에 구축된 객체 스토리지 인터페이스입니다. 애플리케이션과 Glue Storage Cluster 사이에 RESTful 게이트웨이를 제공합니다. Glue Object Storage는 S3과 Swift 두 가지 RESTful API와 호환되는 인터페이스로 객체 스토리지 기능을 제공합니다.");
  } else if (e.target.id == "icon-help-object-gateway-user") {
    $("#modal-help-title").html("Object Gateway User 도움말");
    $("#modal-help-body").html("Object Gateway User는 객체 스토리지 사용자정보를 관리하는 기능으로서 엑세스 정보와 사용량 제한 등 관리기능을 제공합니다. Object Gateway Admin User 생성 기능을 통해 관리자 권한의 사용자를 생성할 수 있습니다.");
  } else if (e.target.id == "icon-help-object-gateway-bucket") {
    $("#modal-help-title").html("Object Gateway Bucket 도움말");
    $("#modal-help-body").html("Object Gateway Bucket은 연관된 오브젝트(파일)를 그룹핑한 최상위 디렉토리이며, 사용자별 여러개의 버킷을 생성하여 사용할 수 있습니다.");
  } else if (e.target.id == "icon-help-ingress-service") {
    $("#modal-help-title").html("INGRESS Service 도움말");
    $("#modal-help-body").html("NFS, OBJECT GATEWAY 서비스에 대한 INGRESS 서비스를 배포하면 가상 IP를 통한 안정적 접근이 가능하고, SCVM 장애 발생시 SCVM간 페일오버가 가능합니다. INGRESS 서비스는 배치한 호스트 마다 haproxy와 keepalived 데몬이 동작합니다.");
  } else if (e.target.id == "icon-help-iscsi-service") {
    $("#modal-help-title").html("iSCSI Service 도움말");
    $("#modal-help-body").html("iSCSI 게이트웨이 서비스는 RBD(RADOS 블록 장치) 이미지를 SCSI 디스크로 내보내는 HA(고가용성) iSCSI Target을 제공합니다. iSCSI 프로토콜을 사용하면 클라이언트(이니시에이터)가 TCP/IP 네트워크를 통해 스토리지 장치(대상)에 SCSI 명령을 보낼 수 있으므로 클라이언트가 Glue 블록 스토리지에 액세스할 수 있습니다.");
  } else if (e.target.id == "icon-help-iscsi-target") {
    $("#modal-help-title").html("iSCSI Target 도움말");
    $("#modal-help-body").html("iSCSI Target을 생성하고 관리할 수 있습니다.");
  } else if (e.target.id == "icon-help-nvmeof-service") {
    $("#modal-help-title").html("NVMe-oF Service 도움말");
    $("#modal-help-body").html("NVMe-oF 게이트웨이 서비스는 RBD(RADOS 블록 장치) 이미지를 NVMe 네임스페이스로 내보내는 NVMe-oF 타겟을 제공합니다. NVMe-oF 프로토콜을 사용하면 클라이언트(이니시에이터)가 TCP/IP 네트워크를 통해 스토리지 장치(타겟)에 NVMe 명령을 보낼 수 있으므로 기본 Glue 클라이언트 지원이 없는 클라이언트가 Glue 블록 스토리지에 액세스할 수 있습니다.");
  } else if (e.target.id == "icon-help-nvmeof-target") {
    $("#modal-help-title").html("NVMe-oF Target 도움말");
    $("#modal-help-body").html("NVMe-oF Target을 생성하고 관리할 수 있습니다.");
  }



  $('#div-modal-help').show();
})
// help 팝업 이벤트 처리 끝

// div-modal-alert-button-confirm 클릭시
$('#modal-help-button-confirm, #modal-help-button-close1').on('click',function(){
  $('#div-modal-help').hide();
});

// 삭제 modal 닫기
$('#button-cancel-modal-delete, #button-close-modal-delete').on('click',function(){
  $('#div-modal-all-delete').hide();
});

/**
 * Meathod Name : Byte
 * Date Created : 2023.08.30
 * Writer : 정민철
 * Description : 용량 숫자를 단위에 맞춰 byte단위로 변경하는 함수
 * Parameter : 없음
 * Return : 없음
 * History : 2023.08.30 최초 작성
 */
function Byte(size){
  var ret_byte
  var ret_byte_name


  if(size < (1024*1024))
  {
    ret_byte = parseFloat(size)/1024;
    ret_byte_name = " KiB";
  }
  else if (size < (1024*1024*1024))
  {
    ret_byte = parseFloat(size)/(1024*1024);
    ret_byte_name = " MiB";
  }
  else if (size < (1024*1024*1024*1024)){
    ret_byte = parseFloat(size)/(1024*1024*1024);
    ret_byte_name = " GiB";
  }
  else if (size < (1024*1024*1024*1024*1024)){
    ret_byte = parseFloat(size)/(1024*1024*1024*1024);
    ret_byte_name = " TiB";
  }

  var bytes = parseInt(ret_byte);

  return (bytes + ret_byte_name);

}

/**
 * Meathod Name : Byte
 * Date Created : 2023.08.30
 * Writer : 정민철
 * Description : 용량 숫자를 단위에 맞춰 byte단위로 변경하는 함수
 * Parameter : 없음
 * Return : 없음
 * History : 2023.08.30 최초 작성
 */
function byteOnlyGib(size){
  var ret_byte

  ret_byte = parseFloat(size)/(1024*1024*1024);
  ret_byte_name = "GiB";


  var bytes = parseInt(ret_byte);

  return (bytes);
}

/**
 * Meathod Name : gwvmInfoSet
 * Date Created : 2023.05.25
 * Writer : 배태주
 * Description : 게이트웨이 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return : 없음
 * History : 2023.05.25 최초 작성
 */
function gwvmInfoSet(){
  $('#gwvm-status').html("상태 체크 중 &bull;&bull;&bull;&nbsp;&nbsp;&nbsp;<svg class='pf-v6-c-spinner pf-m-md' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100' ><circle class='pf-v6-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>");
  $("#gwvm-back-color").attr('class','pf-v6-c-label pf-m-orange');
  $("#gwvm-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');

  //디테일 정보 가져오기
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gwvm/detail/cell',{
    method: 'GET'
  }).then(res => res.json()).then(data => {
    var retDetailVal = JSON.parse(data.Message);
    if (retDetailVal.code == "200" || retDetailVal.val["role"] == 'Running') {
      fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gwvm/cell',{
        method: 'GET'
      }).then(res => res.json()).then(data => {
        var retVal = JSON.parse(data.Message);
        if(retVal.code == "200"){
          if(retVal.val["role"] == "Started"){
            $("#gwvm-status").text(retDetailVal.val["role"]);
            $("#gwvm-back-color").attr('class','pf-v6-c-label pf-m-green');
            $("#gwvm-cluster-icon").attr('class','fas fa-fw fa-check-circle');

            $('#td_gwvm_started_host').text(retVal.val["started"]);
            $('#td_gwvm_cpu_mem').text(retVal.val['CPU(s)'] + " vCore / " + toBytes(retVal.val['Max memory']));
            $('#td_gwvm_ip').text(retVal.val["ip"]);
            $('#td_gwvm_root_disk').text(retVal.val["disk_cap"] + " (사용가능 " + retVal.val["disk_phy"] + " / 사용률 " + retVal.val["disk_usage_rate"] + ")");

            // 마이그레이션 노드 옵션 설정
            var nodeText = '( ';
            var selectHtml = '<option selected="" value="null">노드를 선택해주세요.</option>';
            $('#form-select-gateway-vm-migration-node option').remove();
            for(var i=0; i<Object.keys(retDetailVal.val.clustered_host).length; i++){
              nodeText = nodeText +retDetailVal.val.clustered_host[i];
              if(retDetailVal.val.clustered_host[i] != retDetailVal.val.started){
                selectHtml = selectHtml + '<option value="' + retDetailVal.val.clustered_host[i] + '">' + retDetailVal.val.clustered_host[i] + '</option>';
              }
              if(i == (Object.keys(retDetailVal.val.clustered_host).length - 1)){

                nodeText = nodeText + ' )';
              }else{
                nodeText = nodeText + ', ';
              }
            }
            $('#form-select-gateway-vm-migration-node').append(selectHtml);

            //게이트웨이 버튼 디스플레이 액션
            $("#button-gateway-vm-setup").hide();
            $("#menu-item-gateway-vm-setup").hide();
            $("#menu-item-gateway-vm-setup").removeClass('pf-m-disabled');
            $("#menu-item-gateway-vm-start").addClass('pf-m-disabled');
            $("#menu-item-gateway-vm-stop").removeClass('pf-m-disabled');
            $("#menu-item-gateway-vm-destroy").addClass('pf-m-disabled');
            $("#menu-item-gateway-vm-cleanup").removeClass('pf-m-disabled');
            $("#menu-item-gateway-vm-migrate").removeClass('pf-m-disabled');
          }else if(retVal.val["role"] == "Stopped") {
            $("#gwvm-status").text(retDetailVal.val["role"]);
            cleanGwvmInfo();
            //게이트웨이 버튼 디스플레이 액션
            $("#button-gateway-vm-setup").hide();
            $("#menu-item-gateway-vm-setup").hide();
            $("#menu-item-gateway-vm-start").removeClass('pf-m-disabled');
            $("#menu-item-gateway-vm-stop").addClass('pf-m-disabled');
            $("#menu-item-gateway-vm-destroy").removeClass('pf-m-disabled');
            $("#menu-item-gateway-vm-cleanup").addClass('pf-m-disabled');
            $("#menu-item-gateway-vm-migrate").addClass('pf-m-disabled');
          }else{
            allDisableConfig(retDetailVal.val["role"]);
          }
        } else {
          allDisableConfig(retDetailVal.val["role"]);
          console.log("err1");
        }
      }).catch(function(data){
        allDisableConfig("Health Err");
        createLoggerInfo("게이트웨이 가상머신 정보 조회 실패 "+data);
        console.log("게이트웨이 가상머신 정보 조회 실패 "+data);
      });
    } else if (retDetailVal.code == "200" || retDetailVal.val["role"] == 'Stopped') {
      $("#gwvm-status").text("Stopped1");
      console.log("err2");
    } else if (retDetailVal.code == "400") {
      allDisableConfig("Not configured");
      stateBeforeConfig();
      console.log("Not configured");
    } else {
      allDisableConfig(retDetailVal.val["role"]);
      console.log("err4");
    }
  }).catch(function(data){
    allDisableConfig("Health Err");
    createLoggerInfo("게이트웨이 가상머신 상태 정보 상세 조회 실패 "+data);
    console.log("게이트웨이 가상머신 상태 정보 상세 조회 실패 "+data);
  });
}

// Gwvm 구성 전 상태
function stateBeforeConfig(){
  $("#button-gateway-vm-setup").show();
  $("#menu-item-gateway-vm-setup").show();
  $("#menu-item-gateway-vm-setup").removeClass('pf-m-disabled');
  $("#menu-item-gateway-vm-start").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-stop").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-destroy").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-cleanup").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-migrate").addClass('pf-m-disabled');
}

function stopStatusConfig(){
  cleanGwvmInfo();
  $("#gwvm-status").text("Stopped");
  //게이트웨이 버튼 디스플레이 액션
  $("#button-gateway-vm-setup").hide();
  $("#menu-item-gateway-vm-setup").hide();
  $("#menu-item-gateway-vm-start").removeClass('pf-m-disabled');
  $("#menu-item-gateway-vm-stop").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-destroy").removeClass('pf-m-disabled');
  $("#menu-item-gateway-vm-cleanup").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-migrate").addClass('pf-m-disabled');
}

function allDisableConfig(text){
  cleanGwvmInfo();
  $("#gwvm-status").text(text);
  $("#button-gateway-vm-setup").hide();
  $("#menu-item-gateway-vm-setup").hide();
  $("#menu-item-gateway-vm-start").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-stop").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-destroy").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-cleanup").addClass('pf-m-disabled');
  $("#menu-item-gateway-vm-migrate").addClass('pf-m-disabled');
}

function cleanGwvmInfo(){
  $("#gwvm-back-color").attr('class','pf-v6-c-label pf-m-red');
  $("#gwvm-cluster-icon").attr('class','fas fa-fw fa-exclamation-triangle');
  $('#td_gwvm_started_host').text("N/A");
  $('#td_gwvm_cpu_mem').text("N/A");
  $('#td_gwvm_ip').text("N/A");
  $('#td_gwvm_gw').text("N/A");
  $('#td_gwvm_root_disk').text("N/A");
}

function sleep(sec) {
  let start = Date.now(), now = start;
  while (now - start < sec * 1000) {
    now = Date.now();
  }
}

/*
  용량 숫자를 단위에 맞춰 bytes단위로 변경하는 함수
  ex) ccvm_instance.toBytes("1.5 GiB") == 1610612736

  파라미터 설명 : size: str: 용량을 나타내는 문자열
  반환값 : float: bytes 단위의 용량
*/
function toBytes(size){
  var ret_bytes
  if( size.search('KB') >= 0) ret_bytes = parseFloat(size)*1000
  else if( size.search('KiB') >= 0) ret_bytes = parseFloat(size)*1024
  else if( size.search('MB') >= 0) ret_bytes = parseFloat(size)*1000*1000
  else if( size.search('MiB') >= 0) ret_bytes = parseFloat(size)*1024*1024
  else if( size.search('GB') >= 0) ret_bytes = parseFloat(size)*1000*1000*1000
  else if( size.search('GiB') >= 0) ret_bytes = parseFloat(size)*1024*1024*1024
  else if( size.search('TB') >= 0) ret_bytes = parseFloat(size)*1000*1000*1000*1000
  else if( size.search('TiB') >= 0) ret_bytes = parseFloat(size)*1024*1024*1024*1024
  else if( size.search('PB') >= 0) ret_bytes = parseFloat(size)*1000*1000*1000*1000*1000
  else if( size.search('PiB') >= 0) ret_bytes = parseFloat(size)*1024*1024*1024*1024*1024

  var bytes = parseInt(ret_bytes);

  var s = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

  var e = Math.floor(Math.log(bytes) / Math.log(1024));

  if (e == "-Infinity") return "0 " + s[0];
  else
    return (bytes / Math.pow(1024, Math.floor(e))) + " " + s[e];

}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  if (bytes === 0) return '0 B'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
  if (i === 0) return `${bytes} ${sizes[i]})`
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}

$('#button-storage-dashboard-connect').on('click', function(){
  // storageCenter url 링크 주소 가져오기
  createLoggerInfo("button-storage-dashboard-connect click");
  cockpit.spawn(["python3", pluginpath+"/python/url/create_address.py", "storageCenter"])
  .then(function(data){
    var retVal = JSON.parse(data);
    if(retVal.code == 200){
      // 스토리지센터 연결
      window.open(retVal.val);
    }else{
      $("#modal-status-alert-title").html("스토리지센터 연결");
      $("#modal-status-alert-body").html(retVal.val);
      $('#div-modal-status-alert').show();
    }
  })
  .catch(function(err){
    createLoggerInfo(":::create_address.py storageCenter Error:::");
    console.log(":::create_address.py storageCenter Error:::"+ err);
  });
});

/**
 * Meathod Name : glueVmList
 * Date Created : 2024.02.22
 * Writer : 배태주
 * Description : 게이트웨이 가상머신 생성 전 입력받은 값의 유효성 검사
 * Parameter : 없음
 * Return : 없음
 * History : 2024.02.22 최초 작성
 */
function glueVmList(){
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/glue/hosts',{
    method: 'GET'
  }).then(res => res.json()).then(data => {
    $('#glue-vm-list tr').remove();

    for(var i=0; i < data.length; i++){
      let insert_tr = "";

      insert_tr += '<tr role="row">';

      insert_tr += '<tr role="row">';
      insert_tr += '  <td role="cell" data-label="이름" id="td_glue_host_name">'+data[i].hostname+'</td>';
      insert_tr += '  <td role="cell" data-label="상태">';
      if(data[i].status == ''){
        insert_tr += '    <span class="pf-v6-c-label pf-m-green">';
        insert_tr += '      <span class="pf-v6-c-label__content">';
        insert_tr += '        <span class="pf-v6-c-label__icon">';
        insert_tr += '          <i class="fas fa-fw fa-check-circle" aria-hidden="true"></i>';
        insert_tr += '        </span><div>Online</div>';
        insert_tr += '      </span>';
        insert_tr += '    </span>';
      }else{
        insert_tr += '    <span class="pf-v6-c-label pf-m-orange">';
        insert_tr += '      <span class="pf-v6-c-label__content">';
        insert_tr += '        <span class="pf-v6-c-label__icon">';
        insert_tr += '          <i class="fas fa-fw fa-exclamation-triangle" aria-hidden="true"></i>';
        insert_tr += '        </span><div>'+data[i].status+'</div>';
        insert_tr += '      </span>';
        insert_tr += '    </span>';
      }
      insert_tr += '  </td>';
      insert_tr += '  <td role="cell" data-label="관리 IP" id="td_glue_host_mngt_ip">'+data[i].ip_address+'</td>';
      insert_tr += '  <td role="cell" data-label="스토리지 IP " id="td_glue_host_storage_ip">'+data[i].addr+'</td>';
      insert_tr += '</tr>';
      $("#glue-vm-list:last").append(insert_tr);
    }
  }).catch(function(data){
    createLoggerInfo("Glue 가상머신 정보 조회 실패 "+data);
    console.log("Glue 가상머신 정보 조회 실패 "+data);
  });
}

// Host, portal and image selectors use the delegated menu toggle handler above.
function scanHostKey(){
  //createLoggerInfo("scanHostKey() start");
  cockpit.spawn(['python3', pluginpath + '/python/host/ssh-scan.py'])
  .then(function(data){
    console.log("keyscan ok");
  })
  .catch(function(err){
    createLoggerInfo("keyscan err");
    console.log("keyscan err : " + err);
  });
}

/**
 * Meathod Name : noList
 * Date Created : 2024.03.06
 * Writer : 배태주
 * Description : 조회되는 데이터가 없을경우 테이블에 조회되는 데이터 없음으로 표시해주는 공통 메소드
 * Parameter : 없음
 * Return : 없음
 * History : 2024.03.06 최초 작성
 */
function noList(tbody_id, col_num, text_val){
  let insert_tr = "";
  let txt = "조회되는 데이터가 없습니다.";
  if(text_val != null){
    txt = text_val
  }

  $('#'+tbody_id+' tr').remove();
  insert_tr += '<tr role="row">';
  insert_tr += '  <td role="cell" colspan="'+col_num+'" style="text-align: center;">'+txt+'</td>';
  insert_tr += '</tr>';
  $("#"+tbody_id+":last").append(insert_tr);
}


/**
 * Meathod Name : hostListCheckbox
 * Date Created : 2024.03.06
 * Writer : 배태주
 * Description : 호스트 다중 체크리스트를 세팅하는 메소드
 * Parameter : 없음
 * Return : 없음
 * History : 2024.03.06 최초 작성
 */
function hostListCheckbox(tbody_id, col_num, text_val){
  let insert_tr = "";
  let txt = "조회되는 데이터가 없습니다.";
  if(text_val != null){
    txt = text_val
  }

  $('#'+tbody_id+' tr').remove();
  insert_tr += '<tr role="row">';
  insert_tr += '  <td role="cell" colspan="'+col_num+'" style="text-align: center;">'+txt+'</td>';
  insert_tr += '</tr>';
  $("#"+tbody_id+":last").append(insert_tr);
}

function topTabAction(button_id){
  //선택되어 있는 탭 해제
  $('#ul-top-tab-list').children().each(function(index){
    $(this).removeClass('pf-m-current');
  });
  $('#'+button_id).parent().addClass('pf-m-current');

  //본문 영역 숨기기 시작
  $('#div-gwvm-card').hide();
  $('#div-glue-vm-card').hide();
  $('#div-glue-fs-card').hide();
  $('#div-nfs-cluster-card').hide();
  $('#div-nfs-export-card').hide();
  $('#div-ingress-card').hide();
  $('#div-iscsi-service-card').hide();
  $('#div-iscsi-target-card').hide();
  $('#div-nvmeof-service-card').hide();
  $('#div-nvmeof-target-card').hide();
  $('#div-smb-service-card').hide();
  $('#div-object-gateway-card').hide();
  $('#div-object-gateway-user-card').hide();
  $('#div-object-gateway-bucket-card').hide();

  //본문 영역 숨기기 끝
  switch (button_id) {
    case 'button-tab-glue-vm':
      $('div[name="div-help-content"]').remove();
      setHelpInfoContent("Glue 가상머신","Glue 스토리지 클러스터를 구성하는 Glue 가상머신 상태 정보와 IP 정보를 확인할 수 있습니다. 해당 Glue 가상머신을 통해 다양한 스토리지 서비스를 제공합니다.");
      $('#div-glue-vm-card').show();
      if(hypervisor == 'cell'){
        setHelpInfoContent("게이트웨이 가상머신","스토리지 서비스 게이트웨이 전용 가상머신이며, 선택적으로 해당 가상머신을 구성하여 사용할 수 있습니다.");
        $('#div-gwvm-card').show();
      }
      break;
    case 'button-tab-gluefs':
      $('div[name="div-help-content"]').remove();
      setHelpInfoContent("Glue File System","Glue 파일 시스템( GlueFS )은 Glue의 분산 객체 저장소인 RADOS 위에 구축된 POSIX 호환 파일 시스템입니다. Glue FS는 공유 홈 디렉터리, HPC 스크래치 공간, 분산 워크플로 공유 스토리지와 같은 다양한 애플리케이션을 위한 다용도 고가용성 고성능 파일 저장소를 제공합니다.<br>Glue File System 마운트는 CUBE HOST 및 SCVM에서만 가능하며 외부 HOST 및 가상머신은 NFS 및 SMB를 이용하여 마운트할 수 있습니다.");
      setHelpInfoContent("Glue FS Subvolume Group","GlueFS(Glue File System) 하위 볼륨 그룹을 생성, 조회, 절대 경로 가져오기 및 제거할 수 있습니다. Glue FS의 하위 그룹을 생성하여 효율적으로 GlueFS의 그룹 및 경로(/volumes/볼륨 그룹)를 관리할 수 있습니다.");
      gluefsList();
      $('#div-glue-fs-card').show();
      break;
    case 'button-tab-nfs':
      $('div[name="div-help-content"]').remove();
      setHelpInfoContent("NFS Cluster","Glue 가상머신을 클러스터링 하여 NFS 서비스를 제공하는 클러스터를 생성할 수 있습니다. 사용자는 해당 IP와 포트를 통해 NFS에 접근할 수 있습니다.");
      setHelpInfoContent("NFS Export","NFS Export의 내보내기 경로, GlueFS, 프로토콜, 접근타입, Squash를 설정 및 관리할 수 있습니다.");
      nfsClusterList();
      nfsExportList();
      $('#div-nfs-cluster-card').show();
      $('#div-nfs-export-card').show();
      break;
    case 'button-tab-ingress':
      $('div[name="div-help-content"]').remove();
      setHelpInfoContent("INGRESS Service","NFS, OBJECT GATEWAY 서비스에 대한 INGRESS 서비스를 배포하면 가상 IP를 통해 안정적 접근이 가능하고, SCVM 장애 발생시 SCVM간 페일오버가 가능합니다. INGRESS 서비스는 배치한 호스트 마다 haproxy와 keepalived 데몬이 동작합니다.");
      ingressList();
      $('#div-ingress-card').show();
      break;
    case 'button-tab-iscsi':
      $('div[name="div-help-content"]').remove();
      setHelpInfoContent("iSCSI Service","iSCSI 게이트웨이 서비스는 RBD(RADOS 블록 장치) 이미지를 SCSI 디스크로 내보내는 HA(고가용성) iSCSI Target을 제공합니다. iSCSI 프로토콜을 사용하면 클라이언트(이니시에이터)가 TCP/IP 네트워크를 통해 스토리지 장치(대상)에 SCSI 명령을 보낼 수 있으므로 클라이언트가 Glue 블록 스토리지에 액세스할 수 있습니다.");
      setHelpInfoContent("iSCSI Target","iSCSI Target을 생성하고 관리할 수 있습니다.");
      iscsiServiceList();
      iscsiTargetList();
      $('#div-iscsi-service-card').show();
      $('#div-iscsi-target-card').show();
      break;
    case 'button-tab-nvmeof':
      $('div[name="div-help-content"]').remove();
      setHelpInfoContent("NVMe-oF Service","NVMe-oF 게이트웨이 서비스는 RBD(RADOS 블록 장치) 이미지를 NVMe 네임스페이스로 내보내는 NVMe-oF 타겟을 제공합니다. NVMe-oF 프로토콜을 사용하면 클라이언트(이니시에이터)가 TCP/IP 네트워크를 통해 스토리지 장치(타겟)에 NVMe 명령을 보낼 수 있으므로 기본 Glue 클라이언트 지원이 없는 클라이언트가 Glue 블록 스토리지에 액세스할 수 있습니다.");
      setHelpInfoContent("NVMe-oF Target","NVMe-oF Target을 생성하고 관리할 수 있습니다.");
      nvmeofServiceList();
      nvmeofTargetList();
      $('#div-nvmeof-service-card').show();
      $('#div-nvmeof-target-card').show();
      break;
    case 'button-tab-smb':
      $('div[name="div-help-content"]').remove();
      setHelpInfoContent("SMB Service","Glue 가상머신 별 SMB 서비스를 제공 및 활성화 하고 관리할 수 있습니다. 또한 사용자 정보를 관리할 수 있습니다.")
      smbServiceList();
      $('#div-smb-service-card').show();
      break;
    case 'button-tab-object-gateway':
      $('div[name="div-help-content"]').remove();
      setHelpInfoContent("Object Gateway","Object Gateway는 Glue 위에 구축된 객체 스토리지 인터페이스입니다. 애플리케이션과 Glue Storage Cluster 사이에 RESTful 게이트웨이를 제공합니다. Glue Object Storage는 S3과 Swift 두 가지 RESTful API와 호환되는 인터페이스로 객체 스토리지 기능을 제공합니다.");
      setHelpInfoContent("Object Gateway User","Object Gateway User는 객체 스토리지 사용자정보를 관리하는 기능으로서 엑세스 정보와 사용량 제한 등 관리기능을 제공합니다. Object Gateway Admin User 생성 기능을 통해 관리자 권한의 사용자를 생성할 수 있습니다.");
      setHelpInfoContent("Object Gateway Bucket","Object Gateway Bucket은 연관된 오브젝트(파일)를 그룹핑한 최상위 디렉토리이며, 사용자별 여러개의 버킷을 생성하여 사용할 수 있습니다.");
      objectGatewayList();
      objectGatewayUserList();
      objectGatewayBucketList();
      $('#div-object-gateway-card').show();
      $('#div-object-gateway-user-card').show();
      $('#div-object-gateway-bucket-card').show();
      break;
    default:
      alert( "탭을 잘못 선택했습니다." );
  }
}

function setHelpInfoContent(title, contnet){
  let insert_tr = "";
  insert_tr += '<div class="pf-v6-c-helper-text__item" style="color:#6a6e73;margin-left: 10px;" name="div-help-content">';
  insert_tr += '  <span class="pf-v6-c-helper-text__item-icon">';
  insert_tr += '    <i class="fas fa-fw fa-minus" style="font-size: 0.5rem;" aria-hidden="true"></i>';
  insert_tr += '  </span>';
  insert_tr += '  <span class="pf-v6-c-helper-text__item-text">'+title+'</span>';
  insert_tr += '</div>';
  insert_tr += '<div class="pf-v6-c-helper-text__item" style="color:#6a6e73;margin-left: 23px;" name="div-help-content">';
  insert_tr += '  <span class="pf-v6-c-helper-text__item-text">'+contnet+'</span>';
  insert_tr += '</div>';
  $('#card-help-content-status').append(insert_tr);
}

$('#ul-top-tab-list').on('click', function(e){
  var button_id = "";
  if(e.target.className == "pf-v6-c-tabs__item-text"){
    button_id = e.target.parentElement.id;
  } else if (e.target.className == "pf-v6-c-tabs__link"){
    button_id = e.target.id
  }
  topTabAction(button_id);
});


function setSelectHostsCheckbox(div_id, form_input_id, selectHosts){
  $('fieldset[name="fieldset-glue-host-list"]').remove();
  $('#'+form_input_id).val('');
  //호스트 리스트 불러와서
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/glue/hosts',{
    method: 'GET'
  }).then(res => res.json()).then(data => {
    $('#'+div_id+' fieldset').remove();
    let insert_tr = "";
    if(selectHosts==null){
      insert_tr += '<fieldset class="pf-v6-c-menu__list" aria-label="Select input" name="fieldset-glue-host-list">';
      for(var i=0; i < data.length; i++){
        insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
        insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" name="glue-hosts-list" value="'+data[i].hostname+'"/>';
        insert_tr += '    <span class="pf-v6-c-check__label">'+data[i].hostname+'</span>';
        insert_tr += '  </label>';
      }
    }else{
      var el = "";
      for(var i=0; i < selectHosts.length; i++){
        if(i==0){
          el = selectHosts[i]
        }else{
          el += ", "+selectHosts[i]
        }
      }
      $('#'+form_input_id).val(el);

      insert_tr += '<fieldset class="pf-v6-c-menu__list" aria-label="Select input" name="fieldset-glue-host-list">';
      for(var i=0; i < data.length; i++){
        var selected_hosts_yn = false;
        for(var j=0 ; j < selectHosts.length; j++){
          if(selectHosts[j] == data[i].hostname){
            selected_hosts_yn = true;
            break;
          }
        }
        insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
        insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" name="glue-hosts-list" value="'+data[i].hostname+'" '+(selected_hosts_yn ? 'checked' : '')+'/>';
        insert_tr += '    <span class="pf-v6-c-check__label">'+data[i].hostname+'</span>';
        insert_tr += '  </label>';
      }

    }
    insert_tr += '</fieldset>';
    $("#"+div_id).append(insert_tr);

    if(form_input_id!=null){
      // glue 호스트 리스트 기능
      $('input[name=glue-hosts-list]').on('click', function(){
        var cnt = 0;
        var el = "";
        $('input[type=checkbox][name="glue-hosts-list"]').each(function() {
          if(this.checked){
            if(cnt==0){
              el = this.value
            }else{
              el += ", "+this.value
            }
            cnt++
          }
        });
        $('#'+form_input_id).val(el);
      });
    }
  }).catch(function(data){
    createLoggerInfo("Glue 가상머신 cleckbox 세팅 에러 : "+data);
    console.log("Glue 가상머신 cleckbox 세팅 에러 : "+data);
  });
}

function setSmbUserSelectBox(select_box_id, data){
  // 초기화
  $('#'+select_box_id).empty();
  var smb_user_list = data.split(",")

  var el ='';

  el += '<option value="" selected>선택하십시오.</option>';
  if(smb_user_list != ""){
    for(var i = 0 ; i < smb_user_list.length ; i ++ ){
      el += '<option value="'+smb_user_list[i]+'">'+smb_user_list[i]+'</option>';
    }
  }

  $('#'+select_box_id).append(el);

  createLoggerInfo("setSmbUserSelectBox success");
}

function setSmbFolderSelectBox(select_box_id, path_json_data){
  // 초기화
  $('#'+select_box_id).empty();
  
  var el ='';
  el += '<option value="" selected>선택하십시오.</option>';
  
  if(path_json_data != undefined){
    path_list = Object.keys(path_json_data);
    for(var i=0; i<Object.keys(path_json_data).length; i++){
      folder_name = path_list[i];
      // fs mount 경로 = path
      path = path_json_data[path_list[i]].path;
      
      el += '<option value="'+path+'">'+path_list[i]+'</option>';
    }
  }

  $('#'+select_box_id).append(el);
  createLoggerInfo("setSmbFolderSelectBox success");
}

function setGlueFsSelectBox(fs_select_box_id, path_select_box_id, selected_gluefs_id){
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#'+fs_select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';
    if(data.list.length != 0){
      // 초기화
      for(var i = 0 ; i < data.list.length ; i ++ ){
        if(selected_gluefs_id == null){
          el += '<option value="'+data.list[i].name+'">'+data.list[i].name+'</option>';
        } else {
          if(selected_gluefs_id != data.list[i].name){
            el += '<option value="'+data.list[i].name+'">'+data.list[i].name+'</option>';
          }else{
            el += '<option value="'+data.list[i].name+'" selected>'+data.list[i].name+'</option>';
          }
        }
      }
      if(path_select_box_id != ""){
        $('#'+fs_select_box_id).off('change');
        $('#'+fs_select_box_id).on('change',function(){
          var gluefs_name = $('#'+fs_select_box_id+' option:selected').val();
          setGlueFsVolumeGroupSelectBox(gluefs_name, path_select_box_id);
        });
      }
    }
    $('#'+fs_select_box_id).append(el);
    createLoggerInfo("setGlueFsSelectBox success");
  }).catch(function(data){
    console.log("setGlueFsSelectBox error : "+data);
  });
}

function setGlueFsVolumeGroupSelectBox(gluefs_name, path_select_box_id, selected_subvolume_group_path_id){
  $('#'+path_select_box_id).empty();
  $('#'+path_select_box_id).append('<option value="" selected>불러오는 중...</option>');
  if(gluefs_name == ""){
    $('#'+path_select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';
    $('#'+path_select_box_id).append(el);
    return
  }
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs/subvolume/group?vol_name='+gluefs_name,{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#'+path_select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';
    if(data != null && data.length != 0){
      // 초기화
      if(selected_subvolume_group_path_id == undefined){
        for(var i = 0 ; i < data.length ; i ++ ){
          el += '<option value="'+data[i].path+'">'+data[i].path+'</option>';
        }
      } else {
        for(var i = 0 ; i < data.length ; i ++ ){
          if(selected_subvolume_group_path_id == data[i].path){
            el += '<option value="'+data[i].path+'" selected>'+data[i].path+'</option>';
          }else{
            el += '<option value="'+data[i].path+'">'+data[i].path+'</option>';
          }
        }
      }
    }
    $('#'+path_select_box_id).append(el);
    createLoggerInfo("setGlueFsVolumeGroupSelectBox success");
  }).catch(function(data){
    console.log("setGlueFsVolumeGroupSelectBox error : "+data);
  });
}

function setNfsClusterSelectBox(select_box_id, selected_cluster_id){
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/nfs',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#'+select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';

    nfs_cluster_names = Object.keys(data);
    if(nfs_cluster_names.length != 0){
      for(var i=0; i < nfs_cluster_names.length; i++){
        if(selected_cluster_id == null){
          el += '<option value="'+nfs_cluster_names[i]+'">'+nfs_cluster_names[i]+'</option>';
        } else {
          if(selected_cluster_id != nfs_cluster_names[i]){
            el += '<option value="'+nfs_cluster_names[i]+'">'+nfs_cluster_names[i]+'</option>';
          }else{
            el += '<option value="'+nfs_cluster_names[i]+'" selected>'+nfs_cluster_names[i]+'</option>';
          }
        }
      }
    }

    $('#'+select_box_id).append(el);
    createLoggerInfo("setNfsClusterSelectBox success");
  }).catch(function(data){
    console.log("setNfsClusterSelectBox error : "+data);
  });
}

function setIngressBackendSelectBox(select_box_id){
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/service',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#'+select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';
    for(var i = 0 ; i < data.length; i++){
      if(data[i].service_type == "nfs" || data[i].service_type == "rgw"){
        el += '<option value="'+data[i].service_name+'">'+data[i].service_name+'</option>';
      }
    }

    $('#'+select_box_id).append(el);
    createLoggerInfo("setNfsClusterSelectBox success");
  }).catch(function(data){
    console.log("setNfsClusterSelectBox error : "+data);
  });
}

function setSingleImageSelectBox(select_box_id, selected_image_id){
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/image',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#'+select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';

    for(var i=0; i < data.length; i++){
      if(selected_image_id == null){
        el += '<option value="'+data[i]+'">'+data[i]+'</option>';
      } else {
        if(selected_image_id != data[i]){
          el += '<option value="'+data[i]+'">'+data[i]+'</option>';
        }else{
          el += '<option value="'+data[i]+'" selected>'+data[i]+'</option>';
        }
      }
    }

    $('#'+select_box_id).append(el);
    createLoggerInfo("setNfsClusterSelectBox success");
  }).catch(function(data){
    console.log("setNfsClusterSelectBox error : "+data);
  });
}

function setPoolSelectBox(select_box_id, selected_pool_id){
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/pool?pool_type=rbd',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#'+select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';

    for(var i=0; i < data.length; i++){
      if(selected_pool_id == null){
        el += '<option value="'+data[i]+'">'+data[i]+'</option>';
      } else {
        if(selected_pool_id != data[i]){
          el += '<option value="'+data[i]+'">'+data[i]+'</option>';
        }else{
          el += '<option value="'+data[i]+'" selected>'+data[i]+'</option>';
        }
      }
    }

    $('#'+select_box_id).append(el);
    createLoggerInfo("setNfsClusterSelectBox success");
  }).catch(function(data){
    console.log("setNfsClusterSelectBox error : "+data);
  });
}

function setIscsiPortalCheckbox(div_id, form_input_id, portals_json){
  $('#'+div_id+' fieldset').remove();
  $('input[name=iscsi-image-list]').remove();
  $('input[type=checkbox][name="iscsi-portal-list"]').remove();

  //호스트 리스트 불러와서
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/service?service_type=iscsi',{
    method: 'GET'
  }).then(res => res.json()).then(iscsi_service => {
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/glue/hosts',{
      method: 'GET'
    }).then(res => res.json()).then(data => {
      var iscsi = [];

      for(var i=0; i < iscsi_service.length; i++){
        iscsi_service[i]["placement"]["hosts"].forEach((value, index) => {
          iscsi.push(value)
        });
      }
      //중복 제거
      const uniquePortalArray = iscsi.filter((value, index, self) => self.indexOf(value) === index);

      let insert_tr = "";
      insert_tr += '<fieldset class="pf-v6-c-menu__list" aria-label="Select input">';
      if(portals_json==null){
        for(var i=0; i < data.length; i++){
          if(uniquePortalArray.includes(data[i].hostname)){
            insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
            insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-portal-list-'+i+'" name="iscsi-portal-list" value="'+data[i].hostname+':'+data[i].ip_address+'"/>';
            insert_tr += '    <span class="pf-v6-c-check__label">'+data[i].hostname+':'+data[i].ip_address+'</span>';
            insert_tr += '  </label>';
            insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
            insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-portal-list-'+i+'" name="iscsi-portal-list" value="'+data[i].hostname+':'+data[i].addr+'"/>';
            insert_tr += '    <span class="pf-v6-c-check__label">'+data[i].hostname+':'+data[i].addr+'</span>';
            insert_tr += '  </label>';
          }
        }
      }else{
        for(var i=0; i < data.length; i++){
          if(uniquePortalArray.includes(data[i].hostname)){
            var ip_address_boolon = false;
            var addr_boolon = false;

            for(var j=0; j < portals_json.length; j++){
              if(portals_json[j].ip == data[i].ip_address){
                ip_address_boolon = true;
              }
              if(portals_json[j].ip == data[i].addr){
                addr_boolon = true;
              }
            }

            if(!ip_address_boolon){
              insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
              insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-portal-list-'+i+'" name="iscsi-portal-list" value="'+data[i].hostname+':'+data[i].ip_address+'"/>';
              insert_tr += '    <span class="pf-v6-c-check__label">'+data[i].hostname+':'+data[i].ip_address+'</span>';
              insert_tr += '  </label>';
            }else{
              insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
              insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-portal-list-'+i+'" name="iscsi-portal-list" value="'+data[i].hostname+':'+data[i].ip_address+'" checked/>';
              insert_tr += '    <span class="pf-v6-c-check__label">'+data[i].hostname+':'+data[i].ip_address+'</span>';
              insert_tr += '  </label>';
            }

            if(!addr_boolon){
              insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
              insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-portal-list-'+i+'" name="iscsi-portal-list" value="'+data[i].hostname+':'+data[i].addr+'"/>';
              insert_tr += '    <span class="pf-v6-c-check__label">'+data[i].hostname+':'+data[i].addr+'</span>';
              insert_tr += '  </label>';
            }else{
              insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
              insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-portal-list-'+i+'" name="iscsi-portal-list" value="'+data[i].hostname+':'+data[i].addr+'" checked/>';
              insert_tr += '    <span class="pf-v6-c-check__label">'+data[i].hostname+':'+data[i].addr+'</span>';
              insert_tr += '  </label>';
            }
          }
        }

        //form_input_id 세팅
        var el = "";
        for(var i=0; i < portals_json.length; i++){
          if(i==0){
            el += portals_json[i].host+":"+portals_json[i].ip
          }else{
            el += ", "+portals_json[i].host+":"+portals_json[i].ip
          }

        }
        $('#'+form_input_id).val(el);
      }

      insert_tr += '</fieldset>';
      $("#"+div_id).append(insert_tr);

      if(form_input_id!=null){
        // iscis portal 리스트 기능
        $('input[name=iscsi-portal-list]').on('click', function(){
          var cnt = 0;
          var el = "";
          $('input[type=checkbox][name="iscsi-portal-list"]').each(function() {
            if(this.checked){
              if(cnt==0){
                el = this.value
              }else{
                el += ", "+this.value
              }
              cnt++
            }
          });
          $('#'+form_input_id).val(el);
        });
      }
    }).catch(function(data){
      createLoggerInfo("iscis portal cleckbox 세팅 에러 : "+data);
      console.log("iscis portal cleckbox 세팅 에러 : "+data);
    });
  }).catch(function(data){
    createLoggerInfo("iscis service 호출 에러 : "+data);
    console.log("iscis service 호출 에러 : "+data);
  });
}

function setImageSelectBox(div_id, form_input_id, disks_json){
  //호스트 리스트 불러와서
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/image',{
    method: 'GET'
  }).then(res => res.json()).then(data => {
    $('#'+div_id+' fieldset').remove();
    let insert_tr = "";
    insert_tr += '<fieldset class="pf-v6-c-menu__list" aria-label="Select input">';

    if(data.length > 4){
      div_id
      $("#"+div_id).css('height', '200px');
      $("#"+div_id).css('overflow', 'auto');

    }

    if(disks_json==null){
      for(var i=0; i < data.length; i++){
        insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
        insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-image-list-'+i+'" name="iscsi-image-list" value="'+data[i]+'"/>';
        insert_tr += '    <span class="pf-v6-c-check__label">'+data[i]+'</span>';
        insert_tr += '  </label>';
      }
    }else{
      for(var i=0; i < data.length; i++){
        var disk_boolon = false;

        for(var j=0; j < disks_json.length; j++){
          var disk_split = data[i].split("/");
          if(disks_json[j].pool == disk_split[0] && disks_json[j].image == disk_split[1]){
            disk_boolon = true;
          }
        }

        if(!disk_boolon){
          insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
          insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-image-list-'+i+'" name="iscsi-image-list" value="'+data[i]+'"/>';
          insert_tr += '    <span class="pf-v6-c-check__label">'+data[i]+'</span>';
          insert_tr += '  </label>';
        }else{
          insert_tr += '  <label class="pf-v6-c-check pf-v6-c-menu__item">';
          insert_tr += '    <input class="pf-v6-c-check__input" type="checkbox" id="iscsi-image-list-'+i+'" name="iscsi-image-list" value="'+data[i]+'" checked/>';
          insert_tr += '    <span class="pf-v6-c-check__label">'+data[i]+'</span>';
          insert_tr += '  </label>';
        }
      }
      //form_input_id 세팅
      var el = "";
      for(var i=0; i < disks_json.length; i++){
        if(i==0){
          el += disks_json[i].pool+"/"+disks_json[i].image
        }else{
          el += ", "+disks_json[i].pool+"/"+disks_json[i].image
        }
      }
      $('#'+form_input_id).val(el);
    }

    insert_tr += '</fieldset>';
    $("#"+div_id).append(insert_tr);

    if(form_input_id!=null){
      // iscis portal 리스트 기능
      $('input[name=iscsi-image-list]').on('click', function(){
        var cnt = 0;
        var el = "";
        $('input[type=checkbox][name="iscsi-image-list"]').each(function() {
          if(this.checked){
            if(cnt==0){
              el = this.value
            }else{
              el += ", "+this.value
            }
            cnt++
          }
        });
        $('#'+form_input_id).val(el);
      });
    }
  }).catch(function(data){
    createLoggerInfo("iscis portal cleckbox 세팅 에러 : "+data);
    console.log("iscis portal cleckbox 세팅 에러 : "+data);
  });

}

function setRgwUserSelectBox(select_box_id, selected_user_id){
  $('#'+select_box_id).empty();
  $('#'+select_box_id).append('<option value="" selected>불러오는 중...</option>');
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/rgw/user',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#'+select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';

    for(var i=0; i < data.length; i++){
      if(selected_user_id == null){
        el += '<option value="'+data[i].user_id+'">'+data[i].user_id+'</option>';
      } else {
        if(selected_user_id != data[i].user_id){
          el += '<option value="'+data[i].user_id+'">'+data[i].user_id+'</option>';
        }else{
          el += '<option value="'+data[i].user_id+'" selected>'+data[i].user_id+'</option>';
        }
      }
    }

    $('#'+select_box_id).append(el);
    createLoggerInfo("setRgwUserSelectBox success");
  }).catch(function(data){
    console.log("setRgwUserSelectBox error : "+data);
  });
}

function setRgwBucketSelectBox(select_box_id, selected_bucket_id){
  $('#'+select_box_id).empty();
  $('#'+select_box_id).append('<option value="" selected>불러오는 중...</option>');
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/rgw/bucket?detail=false',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    $('#'+select_box_id).empty();
    var el ='';
    el += '<option value="" selected>선택하십시오.</option>';

    for(var i=0; i < data.length; i++){
      if(selected_bucket_id == null){
        el += '<option value="'+data[i]+'">'+data[i]+'</option>';
      } else {
        if(selected_bucket_id != data[i]){
          el += '<option value="'+data[i]+'">'+data[i]+'</option>';
        }else{
          el += '<option value="'+data[i]+'" selected>'+data[i]+'</option>';
        }
      }
    }

    $('#'+select_box_id).append(el);
    createLoggerInfo("setRgwBucketSelectBox success");
  }).catch(function(data){
    console.log("setRgwBucketSelectBox error : "+data);
  });
}

async function duplicatImageNameCheck(pool_name, image_name){
  var duplication_yn = false;
  await fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/image?pool_name='+pool_name,{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    for(var i=0; i < data.length; i++){
      if(data[i].image == image_name){
        duplication_yn = true
      }
    }
    createLoggerInfo("duplicatImageNameCheck success");
  }).catch(function(data){
    duplication_yn = false;
    console.log("duplicatImageNameCheck error : "+data);
  });
  return duplication_yn;
}

function setNvmeofHostIpSelectBox(select_box_id, selected_host_ip){
  fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/service?service_type=nvmeof',{
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json()).then(data => {
    fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/glue/hosts',{
      method: 'GET'
    }).then(res => res.json()).then(hosts_data => {

      $('#'+select_box_id).empty();
      var el ='';
      el += '<option value="" selected>선택하십시오.</option>';


      var host_ip = [];

      for(var i=0; i < data.length; i++){
        for(var j=0; j < hosts_data.length ; j++){
          for(var x=0; x < data[i].placement.hosts.length ; x++){
            if(hosts_data[j].hostname == data[i].placement.hosts[x]){
              host_ip.push(hosts_data[j].ip_address)
            }
          }
        }
      }

      //중복 제거
      const uniqueHostIpArray = host_ip.filter((value, index, self) => self.indexOf(value) === index);

      for(var i=0; i < uniqueHostIpArray.length; i++){
        if(selected_host_ip == null){
          el += '<option value="'+uniqueHostIpArray[i]+'">'+uniqueHostIpArray[i]+'</option>';
        } else {
          if(selected_host_ip != uniqueHostIpArray[i]){
            el += '<option value="'+uniqueHostIpArray[i]+'">'+uniqueHostIpArray[i]+'</option>';
          }else{
            el += '<option value="'+uniqueHostIpArray[i]+'" selected>'+uniqueHostIpArray[i]+'</option>';
          }
        }
      }

      $('#'+select_box_id).append(el);
      createLoggerInfo("setNvmeofHostIpSelectBox success");
    }).catch(function(data){
      console.log("setNvmeofHostIpSelectBox error : "+data);
    });
  }).catch(function(data){
    console.log("setNvmeofHostIpSelectBox error : "+data);
  });
}

/**
 * Meathod Name : checkForNameDuplicates
 * Date Created : 2024.05.08
 * Writer : 배태주
 * Description : 테이블 리스트에서 중복된 이름이 있는지 확인하는 함수
 * Parameter : 없음
 * Return : 없음
 * History : 2024.05.08 최초 작성
 */
function checkForNameDuplicates(table_list_id, compare_index, name_val){
  var check_boolean = false;
  $('#'+table_list_id).children('tr').each(function(){
    if($(this).children('td:eq('+compare_index+')').text() == name_val){
      check_boolean = true;
    }
  });
  return check_boolean;
}

/**
 * Meathod Name : checkForNameDuplicates1
 * Date Created : 2024.05.08
 * Writer : 배태주
 * Description : 테이블 리스트에서 중복된 이름이 있는지 확인하는 함수
 * Parameter : 없음
 * Return : 없음
 * History : 2024.05.08 최초 작성
 */
async function checkForNameDuplicates1(storage_type, name_val){
  var duplication_yn = false;

  if(storage_type == "gluefs"){
    await fetch('https://'+glue_api_ip+':'+glue_api_port+'/api/v1/gluefs',{
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => res.json()).then(data => {
      if(data.list.length != 0){
        $('#gluefs-list tr').remove();
        for(var i=0; i < data.list.length; i++){
          if(data.list[i].name == name_val){
            duplication_yn = true;
          }
        }
      }
      createLoggerInfo("duplicatImageNameCheck success");
    }).catch(function(data){
      duplication_yn = false;
      console.log("duplicatImageNameCheck error : "+data);
    });
  }

  return duplication_yn;
}
