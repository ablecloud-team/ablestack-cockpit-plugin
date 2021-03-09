# ABLESTACK Common Library
ABLESTACK의 공통 패키지를 모아놓은 Library입니다.
본 문서는 PluginRoot(ablestack)/tools/AblestackCommon/README.md와 같습니다.

## 빌드 방법
### dependency
pip3 install setuptools wheel 
### build
python3 setup.py bdist_wheel
### install
pip3 install dist/ablestack_common-{version}.whl

## createReturn
```python
def createReturn(retname: str,
             val: object,
             code: int,
             type_str: str) -> str:
```
* retname: return을 할 함수의 이름
* val: return 할 값
* code: 상태 코드

| 수준 | 숫자 값 | 의미 |
| ---|---| ---|
|OK | 200 | 정상 처리됨|
|ERROR | 400 | 찾을 수 없음|
|ERROR | 500 | 알수없는 내부 에러|
  

## createLogger
```python3
import logging
def createLogger(loggername: str,
                log_file: str,
                verbosity: int,
                file_log_level: int) -> logging.Logger:
```
* loggername: 로그의 이름(default: f"{os.path.basename(sys.argv[0])}")
* log_file: 로그 파일 경로(default: f"/var/log/{os.path.basename(sys.argv[0])}.log")
* verbosity: 화면 출력 로그의 레벨(default: logging.CRITICAL)
* file_log_level: 파일 출력 로그의 레벨(default: logging.DEBUG)
* 로그레벨

| 수준 | 숫자 값 | 의미 |
| ---------------|----------------| ---------------|
| CRITICAL   | 50         | 작동이 불가능한 수준의 심각한 에러가 발생함을 알림 |
| ERROR      | 40         | 중대한 문제로 인해 소프트웨어가 몇몇 기능들을 수행하지 못함을 알림 |
| WARNING    | 30         | 소프트웨어가 작동은 하고 있지만, 예상치 못한 일이 발생했거나 할 것으로 예측된다는 것을 알림 |
| INFO       | 20         | 계획대로 작동하고 있음을 알리는 확인 메시지 |
| DEBUG      | 10         | 간단히 문제를 진단하고 싶을 때 필요한 자세한 정보를 기록함 |



### 사용법
```python3
import logging
from Ablestack import createLogger

logger=createLogger(loggername="SampleModule", verbosity=logging.INFO, log_file="log.txt", file_log_level=logging.ERROR)
logger.debug("debug")       #출력없음
logger.info("info")         #화면출력
logger.warning("warning")   #화면출력
logger.error("error")       #둘다출력
logger.critical("critical") #둘다출력
```