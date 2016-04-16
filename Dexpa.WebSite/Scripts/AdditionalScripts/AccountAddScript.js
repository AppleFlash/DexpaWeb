$(document).ready(function () {
    $("#UserName").blur(function() {
        $("#UserName").val($("#UserName").val().trim());
    });
});