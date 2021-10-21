/**
 * Meathod Name : createLoggerInfo
 * Date Created : 2021.9.30
 * Writer  : 배태주
 * Description : cockpit.spwan 후 실행 결과를 logger로 호스트에 등록하는 기능 (/var/log/message)
 * Parameter : (string) 에러 내용
 * Return  : 없음
 * History  : 2021.09.30 최초 작성
 * History  : 2021.09.30
 */
 function createLoggerInfo(error_str){
    var cmd = ["logger", "-t", "ablecloud", error_str];
    cockpit.spawn(cmd)
}