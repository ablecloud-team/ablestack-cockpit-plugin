var cloudvmStatus = null;

function SetCloudClusterStatus(data){
    cloudvmStatus = data;
}

function GetCloudClusterStatus(){
    return cloudvmStatus;
}