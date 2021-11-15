/**
 * Meathod Name : checkIp
 * Date Created : 2021.03.25
 * Writer  : 류홍욱
 * Description : IP주소 유효성 체크를 실행하고 실패할 경우 false를 리턴하는 함수.
 * Parameter : ip_address(ip주소 값) (예: 192.168.11.233)
 * Return  : boolean
 * History  : 2021.03.25 최초 작성
**/

function checkIp(ip_address) {
    let ip_format_check_boolean = false;
    let ip_format = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    let ip_address_arr = ip_address.split('.');
    // IP 주소의 정상 범위 체크
    if (ip_address.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*()\-\\_=+|;:'",/<>?]/g, "").match(ip_format) && !Number(ip_address_arr[3]) == 0) ip_format_check_boolean = true;
    return ip_format_check_boolean;
}


/**
 * Meathod Name : checkNetmaskFormat
 * Date Created : 2021.03.28
 * Writer  : 류홍욱
 * Description : netmask 유효성 체크 (예 :255.255.255.255)
 * Parameter : obj
 * Return  : boolean
 * History  : 2021.04.09 수정
 */

function checkNetmaskFormat(obj){
  let netmask_format_check_boolean = false;
  let netmask_format = /^(255?)\.(255?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if(netmask_format.test(obj)) netmask_format_check_boolean = true;
  return netmask_format_check_boolean;
}


/**
 * Meathod Name : checkCidrFormat
 * Date Created : 2021.03.28
 * Writer  : 류홍욱
 * Description : cidr 유효성 체크
 * Parameter : obj (예: 192.168.0.0/16)
 * Return  : boolean
 * History  : 2021.04.09 수정
 */

function checkCidrFormat(obj){
  let cidr_format_check_boolean = false;
  let cidr_format = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
  if(cidr_format.test(obj)) cidr_format_check_boolean = true;
  return cidr_format_check_boolean;
}


/**
 * Meathod Name : checkVlan
 * Date Created : 2021.03.29
 * Writer  : 류홍욱
 * Description : cidr 유효성 체크
 * Parameter : obj (범위: 1~4094)
 * Return  : boolean
 * History  : 2021.03.29 최초 작성
 */

function checkVlan(obj) {
  let vlan_format_check_boolean = false;
  let vlan_format = /^[0-9]*$/;
  if(obj.match(vlan_format) && obj >= 1 && obj <= 4094) vlan_format_check_boolean = true;
  return vlan_format_check_boolean;
}


/**
 * Meathod Name : checkFirstChar
 * Date Created : 2021.03.29
 * Writer  : 류홍욱
 * Description : 입력 값의 첫번째 입력 문자 체크
 * Parameter : obj (hostname)
 * Return  : boolean
 * History  : 2021.03.29 최초 작성
 */
function checkFirstChar(obj){
  let first_char_check_boolean = false;
  let fir_str_chk = /^[a-zA-Z]{1}/;  // 첫번째 문자 알파벳 여부 체크 정규식
  if(fir_str_chk.test(obj)) first_char_check_boolean = true;
  return first_char_check_boolean;
}


/**
 * Meathod Name : checkHostFormat
 * Date Created : 2021.03.29
 * Writer  : 류홍욱
 * Description : 호스트 이름 검사(첫번때 입력 문자에 따라 호스트 이름을 검사)
 * Parameter : obj (hostname)
 * Return  : boolean
 * History  : 2021.04.09 수정
 */
function checkHostFormat(obj){
  let host_format_check_boolean = false;

  // 첫번째 입력 문자가 숫자일 때, IP 형식으로 입력되는지 검사
  if(!checkFirstChar(obj)){
    let host_format = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if(host_format.test(obj)) host_format_check_boolean = true;
  }
  // 첫번째 입력 문자가 숫자가 아닐 때 DNS 형식으로 입력되는지 검사
  else{
    let host_format = /[^a-zA-Z0-9\-\.]/;
    if(!host_format.test(obj)) host_format_check_boolean = true;
  }
  return host_format_check_boolean;
}


/**
 * Meathod Name : checkFileSize
 * Date Created : 2021.03.26
 * Writer  : 류홍욱
 * Description : 파일을 선택할 때 파일 용량을 검사하는 함수 (비대칭키, hosts 파일 업로드 용으로 파일용량을 100KB 이하로 설정)
 * Parameter : file (Array)
 * Return  : boolean
 * History  : 2021.03.26 최초 작성
 */

function checkFileSize(file) {
    // let file = this.files[0];
    if (!file) return false;
    let size = file.size || file.fileSize;
    let limit = 102400;
    if (size > limit) {
        alert('파일용량은 100KB 를 넘을수 없습니다.');
        $(this).val('');
        return false;
    }
}


/**
 * Meathod Name : checkEmail
 * Date Created : 2021.09.02
 * Writer  : 배태주
 * Description : 이메일 유형인지 확인
 * Parameter : str (문자열)
 * Return  : boolean
 * History  : 2021.09.02
 */
function checkEmail(email) {
  var regex=/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  return (email != '' && email != 'undefined' && regex.test(email));
}

/**
 * Meathod Name : checkNumber
 * Date Created : 2021.09.07
 * Writer  : 배태주
 * Description : 숫자만 입력 받도록 하는 함수
 * Parameter : 없음
 * Return  : 없음
 * History  : 2021.09.07 최초 작성
 */
 function checkNumber(event) {
  if(event.key >= 0 && event.key <= 9) {
    return true;
  }
  return false;
}