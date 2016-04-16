$(document).ready(function () {

    initEvents();

    GetUserId();

    //var server = "taxikortezh.itl.me";
    //var username = "1008";
    //var password = "kl@3!hjasekh234";

    ////https://www.linphone.org/docs/linphone-web/

    ////Initializing core
    //$("#audio").init();


    ////Registering the callback handlers
    ////function onCallStateChanged(event, call, state, message) {
    ////    console.log(message);
    ////}
    ////addEvent(core, "callStateChanged", onCallStateChanged);

    ////Starting iterate timer
    //core.iterateEnabled = true;

    ////Server registration
    //var register = function (username, password, server) {
    //    var proxy = core.newProxyConfig();
    //    var authinfo = core.newAuthInfo(username, null, password, null, null);
    //    core.addAuthInfo(authinfo);
    //    proxy.identity = 'sip:' + username + '@@' + server;
    //    proxy.serverAddr = 'sip:' + server;
    //    proxy.expires = 3600;
    //    proxy.registerEnabled = true;
    //    core.addProxyConfig(proxy);
    //    core.defaultProxy = proxy;
    //};


    //var call = function (addressStr) {
    //    var address = core.newAddress(addressStr);
    //    if (address !== null) {
    //        core.inviteAddress(address);
    //    }
    //};

    //register(username, password, server);

    //$("#call-button").click(function () {
    //    call("+79136708258");
    //});

});

var readyCallback = function (e) {
    createSipStack(); // see next section
};
var errorCallback = function (e) {
    console.error('Failed to initialize the engine: ' + e.message);
};

var USER_ID;

function GetUserId() {
    $.ajax({
        url: '/Account/GetUserId',
        method: 'GET'
    }).success(function (data) {
        GetUserInfo(data);
    }).error(function (msg) {
        console.error(msg);
    });
}

function GetUserIdByUserName(username) {
    $.ajax({
        url: '/Account/GetUserId',
        method: 'GET',
        data: {username:username}
    }).success(function (data) {
        USER_ID = data;
        GetPhoneUserInfo(data);
    }).error(function (msg) {
        console.error(msg);
    });
}

var NEED_ADD;

function GetUserInfo(id) {
    $.ajax({
        url: ApiServerUrl + 'IpPhoneUser/'+id,
        method: 'GET'
    }).success(function(data) {
        if (data != null) {
            PrivateIdentity = data.login;
            Password = data.password;
            Realm = data.realm;
            SIPml.init(readyCallback, errorCallback);
            $("#ip_phone").show();
        }
    }).error(function (msg) {
        console.error(msg);
    });
}

function GetPhoneUserInfo(id) {
    $.ajax({
        url: ApiServerUrl + 'IpPhoneUser/' + id,
        method: 'GET'
    }).success(function(data) {
        if (data != null) {
            NEED_ADD = false;
            $("#IpPhoneLogin").val(data.login);
            $("#IpPhonePassword").val(data.password);
            $("#IpPhoneRealm").val(data.realm);
        } else {
            NEED_ADD = true;
        }
    }).error(function (msg) {
        console.error(msg);
    });
}

var IP_PHONE_OPEN = false;

function initEvents() {    
    $("#ip_phone_widget_button").bind('click', function () {
        showHidePhone();
    });
}

function showHidePhone() {
    if (IP_PHONE_OPEN) {
        hidePhone();
    } else {
        showPhone();
    }
}

function hidePhone() {
    var rightIndent;
    rightIndent = '-250px';
    IP_PHONE_OPEN = false;
    $(".ip_phone").animate({ right: rightIndent }, 300);
}

function showPhone() {
    var rightIndent;
    rightIndent = 0;
    IP_PHONE_OPEN = true;
    $(".ip_phone").animate({ right: rightIndent }, 300);
}

function numpadButtonAction(number) {
    var value = $('#call-number').val();
    value += number;
    $('#call-number').val(value);
}

var tabsStates = [
    {
        name: 'number',
        number: true
    },
    {
        name: 'driver',
        driver: false
    },
    {
        name: 'order',
        order: false
    },
    {
        name: 'outcoming_call',
        outcoming_call: false
    },
    {
        name: 'incoming_call',
        incoming_call: false
    }
];

function showTab(tabName) {
    for (var i = 0; i < tabsStates.length; i++) {
        if (tabsStates[i][tabName]==false) {
            tabsStates[i][tabName] = true;
            $("#ip_phone_" + tabName + "_tab_header").switchClass('ip_phone_tab_unactive', 'ip_phone_tab_active');
            $("#ip_phone_" + tabName + "_tab").show();
        } else {
            var name = tabsStates[i].name;
            if (name!=tabName) {
                tabsStates[i][name] = false;
                $("#ip_phone_" + tabsStates[i].name + "_tab_header").switchClass('ip_phone_tab_active', 'ip_phone_tab_unactive');
                $("#ip_phone_" + tabsStates[i].name + "_tab").hide();
            }
        }
    }
}

function SavePhoneInfo() {
    var method;
    var url = 'IpPhoneUser';
    if (NEED_ADD) {
        method = 'POST';
    } else {
        method = 'PUT';
        url += '/' + USER_ID;
    }
    var data = {
        userId: USER_ID,
        login: $("#IpPhoneLogin").val(),
        password: $("#IpPhonePassword").val(),
        realm: $("#IpPhoneRealm").val()
    };

    $.ajax({
        url: ApiServerUrl + url,
        method: method,
        data: data
    }).success(function(data) {
        $("#IpPhoneUpdateStatus").addClass('alert alert-success').text('Обновление прошло успешно');
        setInterval(function() {
            $("#IpPhoneUpdateStatus").removeClass('alert alert-success').text('');
        }, 5000);
        GetUserInfo(USER_ID);
    }).error(function(msg) {
        $("#IpPhoneUpdateStatus").addClass('alert alert-danger').text('Ошибка');
        console.error(msg);
        setInterval(function () {
            $("#IpPhoneUpdateStatus").removeClass('alert alert-success').text('');
        }, 5000);
    });
}

function showPhoneState(text) {
    $("#ip_phone_state").show();
    $("#ip_phone_state").text(text);
}

function hidePhoneState() {
    $("#ip_phone_state").hide();
    $("#ip_phone_state").text('');
}