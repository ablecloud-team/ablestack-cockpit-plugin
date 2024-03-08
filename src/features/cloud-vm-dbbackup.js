/** cloud vm DB backup modal 관련 action start */

// 클라우드센터 VM DB 백업 실행 클릭 시
$('#button-execution-modal-cloud-vm-db-dump').on('click', function () {
    let deativationDbBackup = $('input:checkbox[id="switch-ccvm-backup-check"]').is(":checked")
    let radio_ccvm_backup = $('input[name=radio-ccvm-backup]:checked').val();
    if (deativationDbBackup == false && radio_ccvm_backup != 'instantBackup') {
        deactiveDBBackupCronjob()
    }else {
        $('#dbdump-prepare-status').html("<svg class='pf-c-spinner pf-m-xl' role='progressbar' aria-valuetext='Loading...' viewBox='0 0 100 100'><circle class='pf-c-spinner__path' cx='50' cy='50' r='45' fill='none'></circle></svg>" +
        "<h1 data-ouia-component-type='PF4/Title' data-ouia-safe='true' data-ouia-component-id='OUIA-Generated-Title-1' class='pf-c-title pf-m-lg'>백업파일 준비 중...</h1><div class='pf-c-empty-state__body'></div>")
        ccvmDbBackup();
        $('#div-db-backup').hide();
        $('#button-execution-modal-cloud-vm-db-dump').hide();
        $('#button-cancel-modal-cloud-vm-db-dump').hide();
        $('#button-close-modal-cloud-vm-db-dump').hide();
        $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide();
        $('#div-modal-wizard-cluster-config-finish-db-dump-file-download-empty-state').hide();
    }
})

// 클라우드센터 VM DB 백업파일 다운로드 링크 클릭 시
$('#span-modal-wizard-cluster-config-finish-db-dump-file-download').on('click', function () {
    
})

$('#button-close-modal-cloud-vm-db-dump').on('click', function(){
    $('#dbdump-prepare-status').html("")
    $('#div-modal-db-backup-cloud-vm-first').hide();
    $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide();
    $('#button-execution-modal-cloud-vm-db-dump').show();
    $('#button-cancel-modal-cloud-vm-db-dump').show();
    $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스를 백업하시겠습니까?");
});
$('#button-cancel-modal-cloud-vm-db-dump').on('click', function(){
    $('#dbdump-prepare-status').html("")
    $('#div-modal-db-backup-cloud-vm-first').hide();
    $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide();
    $('#button-execution-modal-cloud-vm-db-dump').show();
    $('#button-cancel-modal-cloud-vm-db-dump').show();
    $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스를 백업하시겠습니까?");
    $('#radio-ccvm-instance-backup').prop('checked', true);
    $('#radio-ccvm-regular-backup').prop('checked', false);
    $('#div-db-backup-cloud-vm-manage').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-activation').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-repeat').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-date').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').hide();
    
    $('#input-ccvm-regular-backup-timepicker-no').show();
    $('#input-ccvm-regular-backup-timepicker-hourly').hide();
    $('#input-ccvm-regular-backup-timepicker-daily').hide();
    $('#input-ccvm-regular-backup-timepicker-weekly').hide();
    $('#input-ccvm-regular-backup-timepicker-monthly').hide();
    $('#input-ccvm-regular-backup-timepicker-no').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-hourly').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-daily').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-weekly').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-monthly').val('0:00');
    $('#select-db-backup-cloud-vm-drop-repeat').val('no');
    $('#select-db-backup-cloud-vm-week-days').val('0');
    $('#select-db-backup-cloud-vm-months').val('0');
    $('#select-db-backup-cloud-vm-days').val('1');
});

// ccvm db backup 방식에 따라 html 구성 변경
$('#radio-ccvm-instance-backup').on('click', function () {
    $('#div-db-backup-cloud-vm-manage').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-activation').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-repeat').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-date').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').hide();
    $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide();
});
$('#radio-ccvm-regular-backup').on('click', function () {
    $('#div-db-backup-cloud-vm-manage').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-activation').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-repeat').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-time-label').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-time').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-date-label').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-monthly').hide();
    $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()

    // 정기 백업 선택 시 초기 화면
    $('#input-ccvm-regular-backup-timepicker-no').show();
    $('#input-ccvm-regular-backup-timepicker-hourly').hide();
    $('#input-ccvm-regular-backup-timepicker-daily').hide();
    $('#input-ccvm-regular-backup-timepicker-weekly').hide();
    $('#input-ccvm-regular-backup-timepicker-monthly').hide();
    $('#input-ccvm-regular-backup-timepicker-no').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-hourly').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-daily').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-weekly').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-monthly').val('0:00');
    $('#select-db-backup-cloud-vm-drop-repeat').val('no');
    $('#select-db-backup-cloud-vm-week-days').val('0');
    $('#select-db-backup-cloud-vm-months').val('1');
    $('#select-db-backup-cloud-vm-days').val('1');
    $('#form-input-db-backup-cloud-vm-number').val('');
    $('#span-ccvm-backup-kind').text('정기 백업 활성화');
    $('#span-ccvm-backup-check').text("최초 실행 일정 : ");

    checkDBBackupCronjob()
    
});
$('#radio-ccvm-manage-backup').on('click', function () {
    $('#div-db-backup-cloud-vm-manage').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-activation').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-repeat').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-time-label').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-time').show();
    $('#div-modal-db-backup-cloud-vm-regular-backup-date-label').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').hide();
    $('#div-modal-db-backup-cloud-vm-regular-backup-option-monthly').hide();
    $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()
    $('#input-ccvm-regular-backup-timepicker-no').show();
    $('#input-ccvm-regular-backup-timepicker-hourly').hide();
    $('#input-ccvm-regular-backup-timepicker-daily').hide();
    $('#input-ccvm-regular-backup-timepicker-weekly').hide();
    $('#input-ccvm-regular-backup-timepicker-monthly').hide();
    $('#input-ccvm-regular-backup-timepicker-no').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-hourly').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-daily').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-weekly').val('0:00');
    $('#input-ccvm-regular-backup-timepicker-monthly').val('0:00');
    $('#select-db-backup-cloud-vm-drop-repeat').val('no');
    $('#select-db-backup-cloud-vm-week-days').val('0');
    $('#select-db-backup-cloud-vm-months').val('1');
    $('#select-db-backup-cloud-vm-days').val('1');
    $('#form-input-db-backup-cloud-vm-number').val('0');
    // $('#form-input-db-backup-cloud-vm-number-plus').attr('disabled', true);
    $('#span-ccvm-backup-kind').text('백업 삭제 활성화');
    $('#span-ccvm-backup-check').text("최초 실행 일정 : ");

    checkDBBackupCronjob()
});

// db backup 스위치 토글 기능
$('#toggle-ccvm-backup-check').click(function(){
    $('#switch-ccvm-backup-check').prop('checked',function(){
        return !$(this).prop('checked');
    });
    $("select[name=select-db-backup-cloud-vm], [name=ccvm-regular-backup-time]").prop('disabled',function(){
        return !$(this).prop('disabled');
    });
});

// db backup 파일 보존 기간 변경하는 '+', '-' 기능 
$('#form-input-db-backup-cloud-vm-number-plus').on('click', function () {
    let num = $("#form-input-db-backup-cloud-vm-number").val();
    $("#form-input-db-backup-cloud-vm-number").val(num * 1 + 1);
    
});
$('#form-input-db-backup-cloud-vm-number-minus').on('click', function () {
    let num = $("#form-input-db-backup-cloud-vm-number").val();
    if(num > 0){
        $('#form-input-db-backup-cloud-vm-number').val(num * 1 - 1)
    }
});
$('input[type="number"]').on('input', function() {
    $(this).val($(this).val().replace(/[^0-9]/g, '').slice(0, 4));
});

$('#select-db-backup-cloud-vm-drop-repeat').change(function() {
    if($(this).val() == "no"){
        $('#input-ccvm-regular-backup-timepicker-no').show();
        $('#input-ccvm-regular-backup-timepicker-hourly').hide();
        $('#input-ccvm-regular-backup-timepicker-daily').hide();
        $('#input-ccvm-regular-backup-timepicker-weekly').hide();
        $('#input-ccvm-regular-backup-timepicker-monthly').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-date').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-time-label').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-date-label').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-monthly').hide();
    } else if($(this).val() == "hourly"){
        $('#input-ccvm-regular-backup-timepicker-no').hide();
        $('#input-ccvm-regular-backup-timepicker-hourly').show();
        $('#input-ccvm-regular-backup-timepicker-daily').hide();
        $('#input-ccvm-regular-backup-timepicker-weekly').hide();
        $('#input-ccvm-regular-backup-timepicker-monthly').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-date').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-time-label').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-date-label').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-monthly').hide();
    } else if($(this).val() == "daily"){
        $('#input-ccvm-regular-backup-timepicker-no').hide();
        $('#input-ccvm-regular-backup-timepicker-hourly').hide();
        $('#input-ccvm-regular-backup-timepicker-daily').show();
        $('#input-ccvm-regular-backup-timepicker-weekly').hide();
        $('#input-ccvm-regular-backup-timepicker-monthly').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-date').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-time-label').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-date-label').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-monthly').hide();
    } else if($(this).val() == "weekly"){
        $('#input-ccvm-regular-backup-timepicker-no').hide();
        $('#input-ccvm-regular-backup-timepicker-hourly').hide();
        $('#input-ccvm-regular-backup-timepicker-daily').hide();
        $('#input-ccvm-regular-backup-timepicker-weekly').show();
        $('#input-ccvm-regular-backup-timepicker-monthly').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-time').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-time-label').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-date-label').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-monthly').hide();
    } else if($(this).val() == "monthly"){
        $('#input-ccvm-regular-backup-timepicker-no').hide();
        $('#input-ccvm-regular-backup-timepicker-hourly').hide();
        $('#input-ccvm-regular-backup-timepicker-daily').hide();
        $('#input-ccvm-regular-backup-timepicker-weekly').hide();
        $('#input-ccvm-regular-backup-timepicker-monthly').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-week').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-time').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-time-label').hide();
        $('#div-modal-db-backup-cloud-vm-regular-backup-date-label').show();
        $('#div-modal-db-backup-cloud-vm-regular-backup-option-monthly').show();
    }
});

$('#input-ccvm-regular-backup-timepicker-no').timepicker({
    timeFormat: 'H:mm',
    interval: 10,
    defaultTime: '0',
    dynamic: false,
    dropdown: true,
    scrollbar: true
});

$('#input-ccvm-regular-backup-timepicker-hourly').timepicker({
    timeFormat: '0:mm',
    interval: 1,
    defaultTime: '0:00',
    minMinutes: 00,
    maxMinutes: 59,
    dynamic: false,
    dropdown: true,
    scrollbar: true
});

$('#input-ccvm-regular-backup-timepicker-daily').timepicker({
    timeFormat: 'H:mm',
    interval: 10,
    defaultTime: '0',
    dynamic: false,
    dropdown: true,
    scrollbar: true
});

$('#input-ccvm-regular-backup-timepicker-weekly').timepicker({
    timeFormat: 'H:mm',
    interval: 10,
    defaultTime: '0',
    dynamic: false,
    dropdown: true,
    scrollbar: true
});

$('#input-ccvm-regular-backup-timepicker-monthly').timepicker({
    timeFormat: 'H:mm',
    interval: 10,
    defaultTime: '0',
    dynamic: false,
    dropdown: true,
    scrollbar: true
});

$('#input-ccvm-regular-backup-timepicker-yearly').timepicker({
    timeFormat: 'H:mm',
    interval: 10,
    defaultTime: '0',
    dynamic: false,
    dropdown: true,
    scrollbar: true
});

/**
 * Meathod Name : ccvmDbBackup
 * Date Created : 2023.3.21
 * Writer  : 류홍욱
 * Description : DB Dump 파일을 로컬 저장소에 저장하고 다운로드 링크를 생성하는 함수
 * Parameter : file_path
 * Return  : 없음
 * History  : 2023.3.21 수정
 */
async function ccvmDbBackup() {
    // ccvm에서 mysqldump 파일을 생성하는 파이썬 파일 실행
    let result="";
    let dump_sql_file_path = "";
    let dump_sql_file_name = "";
    let radio_ccvm_backup = $('input[name=radio-ccvm-backup]:checked').val();
    let regular_option_ccvm_backup = $('#select-db-backup-cloud-vm-drop-repeat option:selected').val();
    let regular_input_ccvm_backup_time_one = "";
    let regular_input_ccvm_backup_time_two = "";
    let form_input_db_backup_cloud_vm_number = $('#form-input-db-backup-cloud-vm-number').val();
    
    if (regular_option_ccvm_backup == "no") {
        regular_input_ccvm_backup_time_one = $('#input-ccvm-regular-backup-timepicker-no').val();
    }else if (regular_option_ccvm_backup == "hourly") {
        regular_input_ccvm_backup_time_one = $('#input-ccvm-regular-backup-timepicker-hourly').val();
    }else if (regular_option_ccvm_backup == "daily") {
        regular_input_ccvm_backup_time_one = $('#input-ccvm-regular-backup-timepicker-daily').val();
    }else if (regular_option_ccvm_backup == "weekly") {
        regular_input_ccvm_backup_time_one = $('#input-ccvm-regular-backup-timepicker-weekly').val();
        regular_input_ccvm_backup_time_two = $('#select-db-backup-cloud-vm-week-days option:selected').val();
    }else if (regular_option_ccvm_backup == "monthly") {
        regular_input_ccvm_backup_time_one = $('#input-ccvm-regular-backup-timepicker-monthly').val();
        regular_input_ccvm_backup_time_two = $('#select-db-backup-cloud-vm-months option:selected').val();
        regular_input_ccvm_backup_time_two = regular_input_ccvm_backup_time_two + "-" + $('#select-db-backup-cloud-vm-days option:selected').val();
    }else {
        regular_input_ccvm_backup_time_one = $('#input-ccvm-regular-backup-timepicker-monthly').val();
        regular_input_ccvm_backup_time_two = $('#input-ccvm-regular-backup-datepicker-yearly').val();
    }

    if (radio_ccvm_backup != "deleteOldBackup") {
        form_input_db_backup_cloud_vm_number = "";
    }

    let regular_input_ccvm_backup_path = $('#dump-path').val();

    await cockpit.spawn(['/usr/bin/python3', pluginpath+'/python/vm/dump_ccvm.py', radio_ccvm_backup, '--path', regular_input_ccvm_backup_path, '--repeat', 
    regular_option_ccvm_backup, '--timeone', regular_input_ccvm_backup_time_one, '--timetwo', regular_input_ccvm_backup_time_two, '--delete', form_input_db_backup_cloud_vm_number])
    .then(function(data){
        console.log(data);
        let retVal = JSON.parse(data);
        if (retVal.code == 200) {
            dump_sql_file_path = retVal.val;
            dump_sql_file_name = dump_sql_file_path.substr(dump_sql_file_path.lastIndexOf( "/" )+1);
            createLoggerInfo("Creation of mysqldump of ccvm is completed");
            console.log("Creation of mysqldump of ccvm is completed");
            result="200";
        }else {
            $('#div-db-backup').show();
            $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스 백업이 실패하었습니다.");
            $('#dbdump-prepare-status').html("")
            $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()
            $('#button-execution-modal-cloud-vm-db-dump').show();
            $('#button-cancel-modal-cloud-vm-db-dump').show();
            $('#button-close-modal-cloud-vm-db-dump').show();
            createLoggerInfo("Creation of mysqldump of ccvm is failed");
            console.log("Creation of mysqldump of ccvm is failed");
            result="500";
        }
        checkDBBackupCronjob()
    }).catch(function(data){
        $('#div-db-backup').show();
        $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스 백업이 실패하었습니다.");
        $('#dbdump-prepare-status').html("")
        $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()
        $('#button-execution-modal-cloud-vm-db-dump').show();
        $('#button-cancel-modal-cloud-vm-db-dump').show();
        $('#button-close-modal-cloud-vm-db-dump').show();
        createLoggerInfo("Creation of mysqldump of ccvm is failed");
        console.log("Creation of mysqldump of ccvm is failed");
        result="500";
    });
    // 파이썬 파일 실행 결과에 따라 다운로드 링크 생성
    if (result == "200" && radio_ccvm_backup == "instantBackup") {
        await cockpit.file(dump_sql_file_path,
            { max_read_size: 104857600
            }).read()
        .done(function (tag) {
            $('#span-modal-wizard-cluster-config-finish-db-dump-file-download').attr({
                target: '_blank',
                href: 'data:Application/octet-stream;application/x-xz;attachment;/,' + encodeURIComponent(tag),
                download: dump_sql_file_name
            });
            $('#div-modal-wizard-cluster-config-finish-db-dump-file-download-empty-state').hide();
            $('#div-db-backup').show();
            $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스 백업이 완료되었습니다.");
            $('#dbdump-prepare-status').html("")
            $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').show()
            $('#button-execution-modal-cloud-vm-db-dump').show();
            $('#button-cancel-modal-cloud-vm-db-dump').show();
            $('#button-close-modal-cloud-vm-db-dump').show();
            createLoggerInfo("Creation of download link of ccvm_mysqldump is completed");
            console.log("Creation of download link of ccvm_mysqldump is completed");
        }).catch(function(tag){
            $('#div-db-backup').show();
            $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스 백업이 실패하었습니다.");
            $('#dbdump-prepare-status').html("")
            $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()
            $('#button-execution-modal-cloud-vm-db-dump').show();
            $('#button-cancel-modal-cloud-vm-db-dump').show();
            $('#button-close-modal-cloud-vm-db-dump').show();
            createLoggerInfo("Creation download link of ccvm_mysqldump is failed");
            console.log("Creation download link of ccvm_mysqldump is failed");
        });
        cockpit.file().close()
    }else {
        $('#button-execution-modal-cloud-vm-db-dump').show();
        $('#button-cancel-modal-cloud-vm-db-dump').show();
        $('#button-close-modal-cloud-vm-db-dump').show();
    }
}

/**
 * Meathod Name : checkDBBackupCronjob
 * Date Created : 2023.03.20
 * Writer  : 류홍욱
 * Description : DB 백업 예약작업(Cronjob, at) 확인하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.03.17 최초 작성
 */

async function checkDBBackupCronjob(){
    let span_ccvm_backup_check = ""
    let radio_ccvm_backup = $('input[name=radio-ccvm-backup]:checked').val();
    if (radio_ccvm_backup == "regularBackup") {
        span_ccvm_backup_check = "r";
    }else if (radio_ccvm_backup == "deleteOldBackup") {
        span_ccvm_backup_check = "d";
    }

    // 상태 체크 로딩 circle
    $('#ccvm-dump-status').show()
    $('#span-ccvm-backup-check').hide()
    $('#switch-ccvm-backup-check').prop('disabled', false);

    await cockpit.spawn(['/usr/bin/python3', pluginpath+'/python/vm/dump_ccvm.py', 'checkBackup', '--checkOption', span_ccvm_backup_check])
    .then(function(data){
        console.log(data);
        let retVal = JSON.parse(data);
        if (retVal.code == 200) {
            dump_check = retVal.val;
            // 상태 체크 로딩 circle hide
            $('#ccvm-dump-status').hide()
            $('#span-ccvm-backup-check').show()
            $('#switch-ccvm-backup-check').prop('checked', true);
            $('#span-ccvm-backup-check').text("최초 실행 일정 : "+dump_check);
            $("select[name=select-db-backup-cloud-vm]").prop('disabled', false)
            if (retVal.val == 'None'){
                $("[name=ccvm-regular-backup-time]").prop('disabled', true)
                $('#switch-ccvm-backup-check').prop('checked', false);
                $("select[name=select-db-backup-cloud-vm]").prop('disabled', true)
                $('#span-ccvm-backup-check').text("최초 실행 일정 : " + "예약된 작업 없음");
            }else {
                $("[name=ccvm-regular-backup-time]").prop('disabled', false)
            }
            createLoggerInfo("Check of mysqldump of ccvm is completed");
            console.log("Check of mysqldump of ccvm is completed");
            result="200";
        }else {
            $('#div-db-backup').show();
            $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스 백업 체크가 실패하었습니다.");
            $('#dbdump-prepare-status').html("")
            $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()
            $('#button-execution-modal-cloud-vm-db-dump').show();
            $('#button-cancel-modal-cloud-vm-db-dump').show();
            $('#button-close-modal-cloud-vm-db-dump').show();
            $('#switch-ccvm-backup-check').prop('checked', false);
            $('#span-ccvm-backup-check').text("예약된 작업 없음");
            $("select[name=select-db-backup-cloud-vm]").prop('disabled', true)
            $("[name=ccvm-regular-backup-time]").prop('disabled', true)
            createLoggerInfo("Check of mysqldump of ccvm is failed");
            console.log("Check of mysqldump of ccvm is failed");
            result="500";
        }
    }).catch(function(data){
        $('#div-db-backup').show();
        $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스 백업 체크가 실패하었습니다.");
        $('#dbdump-prepare-status').html("")
        $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()
        $('#button-execution-modal-cloud-vm-db-dump').show();
        $('#button-cancel-modal-cloud-vm-db-dump').show();
        $('#button-close-modal-cloud-vm-db-dump').show();
        createLoggerInfo("Check of mysqldump of ccvm is failed");
        console.log("Check of mysqldump of ccvm is failed");
        result="500";
    });
}

/**
 * Meathod Name : deactiveDBBackupCronjob
 * Date Created : 2023.03.29
 * Writer  : 류홍욱
 * Description : DB 백업 예약작업(Cronjob, at) 비활성하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2023.03.17 최초 작성
 */

async function deactiveDBBackupCronjob(){
    let span_ccvm_backup_check = ""
    let radio_ccvm_backup = $('input[name=radio-ccvm-backup]:checked').val();
    if (radio_ccvm_backup == "regularBackup") {
        span_ccvm_backup_check = "r";
    }else if (radio_ccvm_backup == "deleteOldBackup") {
        span_ccvm_backup_check = "d";
    }

    await cockpit.spawn(['/usr/bin/python3', pluginpath+'/python/vm/dump_ccvm.py', 'deactiveBackup', '--checkOption', span_ccvm_backup_check])
    .then(function(data){
        console.log(data);
        let retVal = JSON.parse(data);
        if (retVal.code == 200) {
            dump_check = retVal.val;
            console.log(dump_check);
            $('#switch-ccvm-backup-check').prop('checked', false);
            $('#span-ccvm-backup-check').text("예약된 작업 없음");
            createLoggerInfo("deactivation of mysqldump of ccvm is completed");
            console.log("deactivation of mysqldump of ccvm is completed");
            result="200";
        }else {
            $('#div-db-backup').show();
            $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스 백업 비활성화 작업이 실패하었습니다.");
            $('#dbdump-prepare-status').html("")
            $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()
            $('#button-execution-modal-cloud-vm-db-dump').show();
            $('#button-cancel-modal-cloud-vm-db-dump').show();
            $('#button-close-modal-cloud-vm-db-dump').show();
            $('#switch-ccvm-backup-check').prop('checked', false);
            $('#span-ccvm-backup-check').text("예약된 작업 없음");
            $("select[name=select-db-backup-cloud-vm]").prop('disabled', true)
            $("[name=ccvm-regular-backup-time]").prop('disabled', true)
            createLoggerInfo("deactivation of mysqldump of ccvm is failed");
            console.log("deactivation of mysqldump of ccvm is failed");
            result="500";
        }
    }).catch(function(data){
        $('#div-db-backup').show();
        $('#div-db-backup').text("클라우드센터 가상머신의 데이터베이스 백업 비활성화 작업이 실패하었습니다.");
        $('#dbdump-prepare-status').html("")
        $('#div-modal-wizard-cluster-config-finish-db-dump-file-download').hide()
        $('#button-execution-modal-cloud-vm-db-dump').show();
        $('#button-cancel-modal-cloud-vm-db-dump').show();
        $('#button-close-modal-cloud-vm-db-dump').show();
        createLoggerInfo("deactivation of mysqldump of ccvm is failed");
        console.log("deactivation of mysqldump of ccvm is failed");
        result="500";
    });
}
