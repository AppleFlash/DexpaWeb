var PHONE_LOADED = false;

$(document).ready(function () {

    initEvents();

    GetUserIdByUserName();
});

var readyCallback = function (e) {
    createSipStack(); // see next section
};
var errorCallback = function (e) {
    console.error('Failed to initialize the engine: ' + e.message);
};

function GetUserIdByUserName() {
    $.ajax({
        url: '/Account/GetUser',
        method: 'GET',
    }).success(function (data) {
        PHONE_USER = data;
        if (data != null) {
            if (data.IpPhoneLogin != null) {
                PrivateIdentity = data.IpPhoneLogin;
                Password = data.IpPhonePassword;
                Realm = data.IpPhoneProvider;
                SIPml.init(readyCallback, errorCallback);
                $("#ip_phone_widget_button").show();
                PHONE_LOADED = true;
            }
        }
    }).error(function (msg) {
        console.error(msg);
    });
}

var PHONE_USER;

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
    if (PHONE_USER != null) {
        if (PHONE_USER.IpPhoneLogin != null) {
            var rightIndent;
            rightIndent = '-250px';
            IP_PHONE_OPEN = false;
            $(".ip_phone").animate({ right: rightIndent }, 300);
            $("#ip_phone_widget_button").removeClass('ip_phone_widget_button_active');
            //$("#ip_phone_widget_button").animate({ right: "0px" }, 300);
        }
    }
}

function showPhone() {
    if (PHONE_USER != null) {
        if (PHONE_USER.IpPhoneLogin != null) {
            var rightIndent;
            rightIndent = 0;
            IP_PHONE_OPEN = true;
            $(".ip_phone").animate({ right: rightIndent }, 300);
            $("#ip_phone_widget_button").addClass('ip_phone_widget_button_active');
            //$("#ip_phone_widget_button").animate({ right: "249px" }, 300);
        }
    }
}

function numpadButtonAction(number) {
    var value = $('#call-number').val();
    value += number;
    $('#call-number').val(value);
}

function sendDTMF(number) {
    sipSendDTMF(number);
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

function showPhoneState(text) {
    $("#ip_phone_state").show();
    $("#ip_phone_state").text(text);
}

function hidePhoneState() {
    $("#ip_phone_state").hide();
    $("#ip_phone_state").text('');
}