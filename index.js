/**
 * File Name : index.js
 * Date Created : 2023.04.25
 * Writer  : 배태주
 * Description : index.html에서 출력할 메인 페이지를 분기하는 스크립트
 **/

// document.ready 영역 시작
$(document).ready(function(){
    cockpit.script(["hostname"])
    .then(function (hostname) {
        if (hostname.includes("scvm")) {
            $('#index-page').load("main_glue.html");
        } else {
            $('#index-page').load("main.html");
        }
    })
    .catch(function (error) {
        $('#index-page').load("main.html");
    });
});