/*
    How to use:
    paste this line showNotification(type, message) in your code
    types:
    success
    info
    warning
    danger
*/

var showTimerId;
var hideTimerId;

function showNotification(type, message) {
    clearTimeout(hideTimerId);
    $("#alert").html("<div class=\"alert-layout alert alert-" + type + "\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\" onclick=\"clearTimeouts()\">" +
        "<span class=\"glyphicon glyphicon-remove\"></span></button>" + message + "</div>");
    $(".alert-layout").animate({
        top: "0px"
    }, 200);
    showTimerId = setTimeout(hideNotification, 4500);
}

function hideNotification() {
    clearTimeout(showTimerId);
    $(".alert-layout").animate({
        top: "-55px"
    }, 200);
    hideTimerId = setTimeout(function () { $(".alert").alert('close'); }, 200);
}

function clearTimepouts() {
    clearTimeout(showTimerId);
    clearTimeout(hideTimerId);
}