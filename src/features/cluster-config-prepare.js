/**
 * File Name : cluster-config-prepare.js  
 * Date Created : 2020.03.02
 * Writer  : 박동혁
 * Description : 클러스터 구성 준비 마법사 UI를 컨트롤하기 위한 스크립트
**/

// 변수 선언
var cur_step_wizard_cluster_config_prepare = "1";

// Document.ready 시작
$(document).ready(function(){
    // 마법사 페이지 준비
    $('#div-modal-wizard-cluster-config-ssh-key').hide();
    $('#div-modal-wizard-cluster-config-ip-info').hide();
    $('#div-modal-wizard-cluster-config-time-server').hide();
    $('#div-modal-wizard-cluster-config-review').hide();
    $('#div-modal-wizard-cluster-config-finish').hide();

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', true);    

    $('#nav-button-cluster-config-overview').addClass('pf-m-current');
});

// 타이틀 닫기 버튼 이벤트 처리
$('#button-close-modal-wizard-cluster-config-prepare').on('click', function(){
    $('#div-modal-wizard-cluster-config-prepare').hide();
});

/* 마법사 사이드 메뉴 버튼 클릭 이벤트 처리 시작 */

$('#nav-button-cluster-config-overview').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-overview').show();
    $('#nav-button-cluster-config-overview').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', true);

    cur_step_wizard_cluster_config_prepare = "1";
});

$('#nav-button-cluster-config-ssh-key').on('click', function(){
    resetClusterConfigWizard();
    
    $('#div-modal-wizard-cluster-config-ssh-key').show();
    $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "2";
});

$('#nav-button-cluster-config-ip-info').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-ip-info').show();
    $('#nav-button-cluster-config-ip-info').addClass('pf-m-current');
    
    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "3";
});

$('#nav-button-cluster-config-time-server').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-time-server').show();
    $('#nav-button-cluster-config-time-server').addClass('pf-m-current');
    
    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "4";
});

$('#nav-button-cluster-config-review').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-review').show();
    $('#nav-button-cluster-config-review').addClass('pf-m-current');
    
    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    cur_step_wizard_cluster_config_prepare = "5";
});

$('#nav-button-cluster-config-finish').on('click', function(){
    resetClusterConfigWizard();

    $('#div-modal-wizard-cluster-config-finish').show();
    $('#nav-button-cluster-config-finish').addClass('pf-m-current');
    
    $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
    $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);

    $('#button-next-step-modal-wizard-cluster-config-prepare').html('완료');

    cur_step_wizard_cluster_config_prepare = "6";
});

/* 마법사 사이드 메뉴 버튼 클릭 이벤트 처리 끝 */

/* 마법사 Footer 영역의 버튼 클릭 이벤트 처리 시작 */

$('#button-next-step-modal-wizard-cluster-config-prepare').on('click', function(){
    resetClusterConfigWizard();

    if (cur_step_wizard_cluster_config_prepare == "1") {
        $('#div-modal-wizard-cluster-config-ssh-key').show();
        $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        cur_step_wizard_cluster_config_prepare = "2";
    }
    else if(cur_step_wizard_cluster_config_prepare == "2") {
        $('#div-modal-wizard-cluster-config-ip-info').show();
        $('#nav-button-cluster-config-ip-info').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        cur_step_wizard_cluster_config_prepare = "3";
    }
    else if(cur_step_wizard_cluster_config_prepare == "3") {
        $('#div-modal-wizard-cluster-config-time-server').show();
        $('#nav-button-cluster-config-time-server').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        cur_step_wizard_cluster_config_prepare = "4";
    }
    else if(cur_step_wizard_cluster_config_prepare == "4") {
        $('#div-modal-wizard-cluster-config-review').show();
        $('#nav-button-cluster-config-review').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        cur_step_wizard_cluster_config_prepare = "5";
    }
    else if(cur_step_wizard_cluster_config_prepare == "5") {
        $('#div-modal-wizard-cluster-config-finish').show();
        $('#nav-button-cluster-config-finish').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        $('#button-next-step-modal-wizard-cluster-config-prepare').html('완료');

        cur_step_wizard_cluster_config_prepare = "6";
    }
    else if(cur_step_wizard_cluster_config_prepare == "6") {
        resetClusterConfigWizard();
        $('#div-modal-wizard-cluster-config-prepare').hide();

        $('#div-modal-wizard-cluster-config-overview').show();
        $('#nav-button-cluster-config-overview').addClass('pf-m-current');

        cur_step_wizard_cluster_config_prepare = "1";
    }
});

$('#button-before-step-modal-wizard-cluster-config-prepare').on('click', function(){
    resetClusterConfigWizard();

    if (cur_step_wizard_cluster_config_prepare == "2") {
        $('#div-modal-wizard-cluster-config-overview').show();
        $('#nav-button-cluster-config-overview').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', true);    

        cur_step_wizard_cluster_config_prepare = "1";
    }
    else if(cur_step_wizard_cluster_config_prepare == "3") {
        $('#div-modal-wizard-cluster-config-ssh-key').show();
        $('#nav-button-cluster-config-ssh-key').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        cur_step_wizard_cluster_config_prepare = "2";
    }
    else if(cur_step_wizard_cluster_config_prepare == "4") {
        $('#div-modal-wizard-cluster-config-ip-info').show();
        $('#nav-button-cluster-config-ip-info').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        cur_step_wizard_cluster_config_prepare = "3";
    }
    else if(cur_step_wizard_cluster_config_prepare == "5") {
        $('#div-modal-wizard-cluster-config-time-server').show();
        $('#nav-button-cluster-config-time-server').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        cur_step_wizard_cluster_config_prepare = "4";
    }
    else if(cur_step_wizard_cluster_config_prepare == "6") {
        $('#div-modal-wizard-cluster-config-review').show();
        $('#nav-button-cluster-config-review').addClass('pf-m-current');

        $('#button-next-step-modal-wizard-cluster-config-prepare').attr('disabled', false);
        $('#button-before-step-modal-wizard-cluster-config-prepare').attr('disabled', false);    

        cur_step_wizard_cluster_config_prepare = "5";
    }
});

$('#button-cancel-config-modal-wizard-cluster-config-prepare').on('click', function(){
    $('#div-modal-wizard-cluster-config-prepare').hide();
});


/* 마법사 Footer 영역의 버튼 클릭 이벤트 처리 끝 */

/**
 * Meathod Name : resetClusterConfigWizard
 * Date Created : 2021.03.03
 * Writer  : 박동혁
 * Description : 마법사 대화상자의 화면 위치 및 사이드 메뉴의 위치를 초기화 하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.03.03 최초 작성
**/

function resetClusterConfigWizard(){
    $('#nav-button-cluster-config-overview').removeClass('pf-m-current');
    $('#nav-button-cluster-config-ssh-key').removeClass('pf-m-current');
    $('#nav-button-cluster-config-ip-info').removeClass('pf-m-current');
    $('#nav-button-cluster-config-time-server').removeClass('pf-m-current');
    $('#nav-button-cluster-config-review').removeClass('pf-m-current');
    $('#nav-button-cluster-config-finish').removeClass('pf-m-current');

    $('#div-modal-wizard-cluster-config-overview').hide();
    $('#div-modal-wizard-cluster-config-ssh-key').hide();
    $('#div-modal-wizard-cluster-config-ip-info').hide();
    $('#div-modal-wizard-cluster-config-time-server').hide();
    $('#div-modal-wizard-cluster-config-review').hide();
    $('#div-modal-wizard-cluster-config-finish').hide();

    $('#button-next-step-modal-wizard-cluster-config-prepare').html('다음');
}