/**
 * File Name : card-cloud-cluster-status.js  
 * Date Created : 2020.03.08
 * Writer  : 이석민
 * Description : main.html에서 발생하는 이벤트 처리를 위한 JavaScript
**/
console.log('card-cloud-cluster-status.js ready');
$('#cloud-cluster-start').on('click', function(){
    console.log('cloud-cluster-start start');

    cockpit.spawn(["python", "/usr/share/cockpit/ablecloud/python/card-cloud-cluster-status.py", "pcsStart"]);
    console.log('cloud-cluster-start end');
});

$('#cloud-cluster-stop').on('click', function(){
    console.log('cloud-cluster-stop click start');

    cockpit.spawn(["python", "/usr/share/cockpit/ablecloud/python/card-cloud-cluster-status.py", "pcsStop"]);
    console.log('cloud-cluster-stop end');
});

$('#cloud-cluster-cleanup').on('click', function(){
    console.log('cloud-cluster-cleanup click start');

    cockpit.spawn(["python", "/usr/share/cockpit/ablecloud/python/card-cloud-cluster-status.py", "pcsCleanup"]);
    console.log('cloud-cluster-cleanup end');
});

$('#cloud-cluster-migration').on('click', function(){
    console.log('cloud-cluster-migration click start');

    cockpit.spawn(["python", "/usr/share/cockpit/ablecloud/python/card-cloud-cluster-status.py", "pcsMigration"]);
    console.log('cloud-cluster-migration end');
});

$('#cloud-cluster-connect').on('click', function(){
    console.log('cloud-cluster-connect click start');

    cockpit.spawn(["python", "/usr/share/cockpit/ablecloud/python/card-cloud-cluster-status.py", "CCConnection"]);
    console.log('cloud-cluster-connect end');
});
