var sipStack;
var OpenLine = true;
var SecondIncoming = null;

var stackEventsListener = function(e) {
    console.info('stack event = ' + e.type);
    switch (e.type) {
        case 'started':
            login();
            break;
        case 'i_new_call':
            if (OpenLine) {
                showPhoneState("Входящий");
                makeCall();
                ringtonePlay();
                incomingCall(e);
            } else {
                SecondIncoming = true;
                rejectCall(e);
            }
            break;
        default:
    }
}

var sessionEventsListener = function (e) {
    console.info('session event = ' + e.type);
    switch (e.type) {
        case 'connected':
            if (e.session == registerSession) {
                makeCall();
            }
            break;
        case 'terminating': case 'terminated':
            hidePhoneState();
            if (callSession != null) {
                if (SecondIncoming == null) {
                    ringtoneStop();
                    hangUp();
                    showTab('number');
                    callSession = null;
                } else {
                    SecondIncoming = null;
                }
            }
            OpenLine = true;
            break;
        case 'm_stream_audio_remote_added':
            showPhoneState('Разговор');
            ringbacktoneStop();
            if (SecondNumberPart!=null) {
                for (var i = 0; i < SecondNumberPart.length; i++) {
                    sipSendDTMF(SecondNumberPart[i]);
                }
            }
            break;
        default:
    }
}

//var Realm = 'taxikortezh.itl.me';
//var Realm = 'sip2sip.info';
var Realm;
var PrivateIdentity;
var PublicIdentity;
var Password;
var DisplayName = 'taxikortezh';

function createSipStack() {

    PublicIdentity = 'sip:' + PrivateIdentity + '@' + Realm;
    
    sipStack = new SIPml.Stack({
        realm: Realm,
        impi: PrivateIdentity,
        impu: PublicIdentity,
        password: Password,
        display_name: DisplayName,
        //websocket_proxy_url: 'wss://sipml5.org:10062',
        enable_rtcweb_breaker: true,
        events_listener: { events: '*', listener: stackEventsListener }
    });
    sipStack.start();
}

var registerSession;

var login = function () {
    registerSession = sipStack.newSession('register', {
        events_listener: { events: '*', listener: sessionEventsListener }
    });
    registerSession.register();
}

var callSession;
var callSessonConfig;

var makeCall = function () {
    $("#acceptCall").show();
    $("#rejectCall").text('Отклонить');
    callSession = null;
    callSessonConfig = {
        audio_remote: document.getElementById('audio_remote'),
        bandwidth: { audio: true, video: false },
        events_listener: { events: '*', listener: sessionEventsListener }
    }
    callSession = sipStack.newSession('call-audio', callSessonConfig);
}

var sipSendDTMF = function(c) {
    if (callSession && c) {
        if (callSession.dtmf(c) == 0) {
            try { DtmfTone.play(); } catch (e) { }
        }
    }
}

var incomingCall = function (e) {
    $("#ip_phone_caller_name").text();
    $("#ip_phone_caller_type").text();
    $("#ip_phone_caller_current_order").html("");
    var number = e.newSession.o_session.o_uri_from.s_user_name;
    findDriverByPhone(number);
    showPhone();
    showTab('incoming_call');
    $("#ip_phone_incoming_call_number").text(number);
    $("#acceptCall").bind('click', function() {
        acceptCall(e);
    });

    $("#rejectCall").bind('click', function () {
        rejectCall(e);
    });
}

var acceptCall = function (e) {
    OpenLine = false;
    $("#acceptCall").hide();
    $("#rejectCall").text("Завершить");
    ringtoneStop();
    e.newSession.accept(callSessonConfig);
}

var rejectCall = function (e) {
    if (SecondIncoming == null) {
        $("#acceptCall").show();
        $("#rejectCall").text("Отклонить");
        showTab('number');
        hidePhoneState();
    }
    ringtoneStop();
    MainNumberPart = null;
    SecondNumberPart = null;
    e.newSession.reject(callSessonConfig);
}

var MainNumberPart = null;
var SecondNumberPart = null;

var call = function (number) {
    showPhoneState("Исходящий");
    makeCall();
    if (number.search(',') != -1) {
        number = number.split(',');
        MainNumberPart = number[0].trim();
        SecondNumberPart = number[1].trim();
    } else {
        MainNumberPart = number;
        SecondNumberPart = null;
    }
    callSession.call(MainNumberPart);
    ringbacktonePlay();
}

var hangUp = function() {
    hidePhoneState();
    callSession.hangup({ events_listener: { events: '*', listener: sessionEventsListener } });
    ringbacktoneStop();
}

var RingTone;

var RingBackTone;

var DtmfTone;

$(document).ready(function () {
    RingTone = document.getElementById('ringtone');

    RingBackTone = document.getElementById('ringbacktone');

    DtmfTone = document.getElementById('dtmfTone');
});

var ringtonePlay = function() {
    RingTone.play();
}

var ringtoneStop = function () {
    RingTone.currentTime = 0;
    RingTone.pause();
}

var ringbacktonePlay = function () {
    RingBackTone.play();
}

var ringbacktoneStop = function () {
    RingBackTone.currentTime = 0;
    RingBackTone.pause();
}

var dtmfTonePlay = function() {
    DtmfTone.play();
}

var dtmfToneStop = function() {
    DtmfTone.currentTime = 0;
    DtmfTone.pause();
}

var findDriverByPhone = function(number) {
    $.ajax({
        url: ApiServerUrl + 'Drivers/GetDriverByPhone',
        method: 'GET',
        data: { phone: number }
    }).success(function(data) {
        if (data != null) {
            $("#ip_phone_caller_type").text("Водитель:");
            $("#ip_phone_caller_name").text("[" + data.callsign + "] - " + data.lastName + " " + data.firstName + " " + data.middleName);
            findDriverCurrentOrder(data.id);
        } else {
            findCustomerByPhone(number);
        }
    }).error(function(msg) {
        console.error(msg);
    });
}

var findCustomerByPhone = function(number) {
    $.ajax({
        url: ApiServerUrl + 'Customers?filterPhone='+number,
        method: 'GET',
        data: { phone: number }
    }).success(function (data) {
        if (data.length!=0) {
            $("#ip_phone_caller_type").text("Клиент:");
            $("#ip_phone_caller_name").text(data[0].name);
            findCustomerCurrentOrder(data[0].id);
        }
    }).error(function (msg) {
        console.error(msg);
    });
}

var findDriverCurrentOrder = function(id) {
    $.ajax({
        url: ApiServerUrl + "Orders/GetDriverCurrentOrder",
        method: 'GET',
        data: { driverId: id }
    }).success(function (data) {
        if(data!=null)
            $("#ip_phone_caller_current_order").html("<strong>Заказ [" + data.id + "]:</strong> <br><span class=\"ip_phone_caller_current_order_link\">" + data.fromAddress + " - " + data.toAddress + "</span>");
    }).error(function(msg) {
        console.error(msg);
    });
}

var findCustomerCurrentOrder = function(id) {
    $.ajax({
        url: ApiServerUrl + "Orders/GetCustomerCurrentOrder",
        method: 'GET',
        data: { customerId: id }
    }).success(function (data) {
        if(data!=null)
            $("#ip_phone_caller_current_order").html("<strong>Заказ [" + data.id + "]:</strong> <br><span class=\"ip_phone_caller_current_order_link\">" + data.fromAddress + " - " + data.toAddress + "</span>");
    }).error(function (msg) {
        console.error(msg);
    });
}