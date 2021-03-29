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
 * History  : 2021.03.28 최초 작성
 */

function checkNetmaskFormat(obj){
  let netmaskFormatCheckBoolean = false;
  let netmaskFormat = /^(255?)\.(255?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if(obj.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*()\-\\_=+|;:'",/<>?]/g, "").match(netmaskFormat)) netmaskFormatCheckBoolean = true;
  return netmaskFormatCheckBoolean;
}


/**
 * Meathod Name : checkCidrFormat
 * Date Created : 2021.03.28
 * Writer  : 류홍욱
 * Description : cidr 유효성 체크
 * Parameter : obj (예: 192.168.0.0/16)
 * Return  : boolean
 * History  : 2021.03.28 최초 작성
 */

function checkCidrFormat(obj){
  let cidrFormatCheckBoolean = false;
  let cidrkFormat = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
  if(obj.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*()\-\\_=+|;:'",<>?]/g, "").match(cidrkFormat)) cidrFormatCheckBoolean = true;
  return cidrFormatCheckBoolean;
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
  let vlanFormatCheckBoolean = false;
  let vlanFormat = /^[0-9]*$/;
  if(obj.match(vlanFormat) && obj >= 1 && obj <= 4094) vlanFormatCheckBoolean = true;
  return vlanFormatCheckBoolean;
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
  let firstCharCheckBoolean = false;
  let firStrChk = /^[a-zA-Z]{1}/;  // 첫번째 문자 알파벳 여부 체크 정규식
  if(firStrChk.test(obj)) firstCharCheckBoolean = true;
  return firstCharCheckBoolean;
}


/**
 * Meathod Name : checkHostFormat
 * Date Created : 2021.03.29
 * Writer  : 류홍욱
 * Description : 호스트 이름 검사(첫번때 입력 문자에 따라 호스트 이름을 검사)
 * Parameter : obj (hostname)
 * Return  : boolean
 * History  : 2021.03.29 최초 작성
 */
function checkHostFormat(obj){
  let hostFormatCheckBoolean = false;

  // 첫번째 입력 문자가 숫자일 때, IP 형식으로 입력되는지 검사
  if(!checkFirstChar(obj)){
    let hostFormat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if(obj.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*()\-\\_=+|;:'",<>?]/g, "").match(hostFormat)) hostFormatCheckBoolean = true;
  }
  // 첫번째 입력 문자가 숫자가 아닐 때 DNS 형식으로 입력되는지 검사
  else{
    let hostFormat = /[^a-zA-Z0-9\-\.]/;
    if(!hostFormat.test(obj)) hostFormatCheckBoolean = true;
  }
  return hostFormatCheckBoolean;
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
