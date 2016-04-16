$(document).ready(function () {
    var error = $("#Error").val();
    if (error != null && error != "") {
        showNotification('danger', error);
    }
});