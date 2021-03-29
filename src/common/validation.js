/**
 * Meathod Name : IpCheck
 * Date Created : 2021.03.25
 * Writer  : 류홍욱
 * Description : IP주소와 필수 여부 값으로 유효성 검사를 실행하고 실패할 경우 false를 리턴하는 함수.
 * Parameter : ip_address(ip주소 값), required_check(외부 또는 로컬 시간서버별로 필수 입력 값이 달라 구분하기 위한 값)
 * Return  : boolean
 * History  : 2021.03.25 최초 작성
**/

// IP 확인
function IpCheck(ip_address, required_check) {
// IP 주소 미입력
  let ip_format_check_boolean = false;
  let ip_format = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  let ip_address_arr = ip_address.split('.');
  // 필수 입력 값이 아닌 IP 주소의 정상 범위 체크
  if (required_check == false){
    if(ip_address !=="" && ip_address !==undefined){
      if(ip_address.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*()\-\\_=+|;:'",/<>?]/g, "").match(ip_format) && !Number(ip_address_arr[3])==0) ip_format_check_boolean = true;
      return ip_format_check_boolean;
    } else {
      ip_format_check_boolean = true;
      return ip_format_check_boolean;
    }
  // 필수 입력해야하는 IP 주소의 정상 범위 체크
  } else {
    if(ip_address.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*()\-\\_=+|;:'",/<>?]/g, "").match(ip_format) && !Number(ip_address_arr[3])==0) ip_format_check_boolean = true;
    return ip_format_check_boolean;
  }
}

/**
 * Meathod Name : fileSizeCheck
 * Date Created : 2021.03.26
 * Writer  : 류홍욱
 * Description : 파일을 선택할 때 파일 용량을 검사하는 함수 (비대칭키, hosts 파일 업로드 용으로 파일용량을 10KB 이하로 설정)
 * Parameter : file (Array)
 * Return  : boolean
 * History  : 2021.03.26 최초 작성
 */

function fileSizeCheck(file) {
    // let file = this.files[0];
    if (!file) return false;
    let size = file.size || file.fileSize;
    let limit = 8500;
    if (size > limit) {
        alert('파일용량은 10KB 를 넘을수 없습니다.');
        $(this).val('');
        return false;
    }
}

/**
 * Meathod Name : netmaskFormatCheck
 * Date Created : 2021.03.28
 * Writer  : 류홍욱
 * Description : netmask 유효성 체크 (예 :255.255.255.255)
 * Parameter : obj
 * Return  : boolean
 * History  : 2021.03.28 최초 작성
 */

function netmaskFormatCheck(obj){
  let netmaskFormatCheckBoolean = false;
  let netmaskFormat = /^(255?)\.(255?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if(obj.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*()\-\\_=+|;:'",/<>?]/g, "").match(netmaskFormat)) netmaskFormatCheckBoolean = true;
  return netmaskFormatCheckBoolean;
}


/**
 * Meathod Name : cidrFormatCheck
 * Date Created : 2021.03.28
 * Writer  : 류홍욱
 * Description : cidr 유효성 체크
 * Parameter : obj (예: 192.168.0.0/16)
 * Return  : boolean
 * History  : 2021.03.28 최초 작성
 */

function cidrFormatCheck(obj){
  let cidrFormatCheckBoolean = false;
  let cidrkFormat = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
  if(obj.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣`~!@#$%^&*()\-\\_=+|;:'",<>?]/g, "").match(cidrkFormat)) cidrFormatCheckBoolean = true;
  return cidrFormatCheckBoolean;
}