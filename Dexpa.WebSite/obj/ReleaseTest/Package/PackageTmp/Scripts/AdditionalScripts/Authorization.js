$(document).ready(function () {
    if (document.getElementById("submit") != null) {
        document.getElementById("submit").onclick = function () {
            Auth();
        };
    }
    if (document.getElementById("signUp") != null) {
        document.getElementById("signUp").onclick = function () {
            SignUp();
        };
    }
    if (document.getElementById("update") != null) {
        document.getElementById("update").onclick = function () {
            update();
        };
    }
});

function getProfileInfo() {
    var Role = $("#hiddenRole").val();
    var HasAccess = $("#hiddenHasAccess").val();

    var select = document.getElementById("Role");
    var options = select.options;

    for (var i = 0; i < options.length; i++) {
        if (options[i].value == Role) {
            options[i].selected = true;
            break;
        }
    }

    if (HasAccess == "True") {
        document.getElementById("HasAccess").checked = true;
    }
}

function Auth() {
    if (validateForm("loginForm")) {
        var data = "UserName=" + $("#UserName").val() + "&Password=" + $("#Password").val();
        data += "&grant_type=password";
        $.ajax({
            url: ApiServerUrl + "identity",
            method: 'POST',
            data: data
        }).success(function (data) {
            showNotification('success', "Вход выполнен успешно");
            document.cookie = ".AspNet.Token=" + data.token_type + " " + data.access_token + ";path=/";
            document.cookie = ".AspNet.Username=" + data.userName + ";path=/";
            getUserRole(data.userName);
        }).error(function (msg) {
            showNotification('danger', "Неверный логин или пароль");
            console.error(msg);
        });
    }
}

function getUserRole(username) {
    $.ajax({
        url: ApiServerUrl + "Account/GetUserRole?username=" + username,
        method: 'GET'
    }).success(function (data) {
        document.cookie = ".AspNet.UserRole=" + data + ";path=/";
        setAuth();
        //location.reload();
    }).error(function (msg) {
        console.error(msg);
    });
}

function setAuth() {
    $.ajax({
        url: "/Account/LoginUser",
        method: "GET"
    }).success(function (data) {
        var role = GetCookie(".AspNet.UserRole");
        if (role == "Водитель") {
            location.href = "/Content/Helpers/AccessDenied.html";
        } else {
            location.reload();
        }
    }).error(function (msg) {
        console.error(msg);
    });
}

function SignUp() {
    if (validateForm("signUpForm")) {
        blockButton(true);
        var signUpData = {
            LastName: $("#lastName").val(),
            Name: $("#firstName").val(),
            MiddleName: $("#middleName").val(),
            PhoneNumber: $("#phoneNumber").val(),
            Email: $("#Email").val(),
            UserName: $("#UserName").val(),
            Role: $("#Role").val(),
            HasAccess: $("#HasAccess").prop("checked"),
            Password: $("#Password").val(),
            ConfirmPassword: $("#ConfirmPassword").val(),
            __RequestVerificationToken: $("[name = __RequestVerificationToken]").val()
        };
        var RoleId;
        switch ($("#Role").val()) {
            case "Администраторы":
                RoleId = 0;
                break;
            case "Водители":
                RoleId = 1;
                break;
            case "Диспетчер":
                RoleId = 2;
                break;
            case "Кассир":
                RoleId = 3;
                break;
            case "Работник с кадрами":
                RoleId = 4;
                break;
            default:
        }
        var apiData = {
            UserName: $("#UserName").val(),
            Password: $("#Password").val(),
            DriverId: null,
            Role: RoleId
        };

        $.ajax({
            url: "/Account/Register",
            method: 'POST',
            data: signUpData,
        }).success(function (data) {
            if (data == null) {
                SignUpOnApi(apiData);
            } else {
                blockButton(false);
                showNotification('danger', data);
            }
        }).error(function (msg) {
            if (msg.status == 200) {
                location.href = "/Home/";
            } else {
                blockButton(false);
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
            }
        });


    }
}

function SignUpOnApi(data) {
    $.ajax({
        url: ApiServerUrl + "Account/Register",
        method: 'POST',
        data: data,
        headers: GetHeaders()
    }).success(function (data) {
        location.href = "/Home/";
        blockButton(false);
        //showNotification('success', "Пользователь зарегистрирован");
        //location.href = "/Home";
    }).error(function (msg) {
        blockButton(false);
        showNotification('danger', "Пользователь с таким логином уже существует");
        console.error(msg);
    });
}

function update() {
    if (validateForm("updateForm")) {
        var updateData = {
            LastName: $("#lastName").val(),
            Name: $("#firstName").val(),
            MiddleName: $("#middleName").val(),
            PhoneNumber: $("#phoneNumber").val(),
            Email: $("#Email").val(),
            UserName: $("#UserName").val(),
            Role: $("#Role").val(),
            HasAccess: $("#HasAccess").prop("checked"),
            OldPassword: $("#OldPassword").val(),
            NewPassword: $("#NewPassword").val(),
            ConfirmPassword: $("#ConfirmPassword").val(),
            __RequestVerificationToken: $("[name = __RequestVerificationToken]").val()
        };

        $.ajax({
            url: "/Account/Manage",
            method: 'POST',
            data: updateData,
            headers: GetHeaders()
        }).success(function (data) {
            if (data == null) {
                location.href = "/Home/";
            } else {
                showNotification('danger', data);
            }
        }).error(function (msg) {
            if (msg.status == 200) {
                location.href = "/Home/";
            } else {
                blockButton(false);
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
            }
        });
    }
}

function GetCookie(name) {
    var cookie_name = name + "=";
    var cookie_length = document.cookie.length;
    var cookie_begin = 0;
    while (cookie_begin < cookie_length) {
        var value_begin = cookie_begin + cookie_name.length;
        if (document.cookie.substring(cookie_begin, value_begin) == cookie_name) {
            var value_end = document.cookie.indexOf(";", value_begin);
            if (value_end == -1) {
                value_end = cookie_length;
            }
            return unescape(document.cookie.substring(value_begin, value_end));
        }
        cookie_begin = document.cookie.indexOf(" ", cookie_begin) + 1;
        if (cookie_begin == 0) {
            break;
        }
    }
    return null;
}

function blockButton(state) {
    if (state) {
        $("#signUp").attr("disabled", "disabled");
    } else {
        $("#signUp").removeAttr("disabled");
    }
}

function TestAuth(username, password) {
    var data = "UserName=" + username + "&Password=" + password;
    data += "&grant_type=password";
    $.ajax({
        url: ApiServerUrl + "identity",
        method: 'POST',
        data: data
    }).success(function (data) {
        console.log(data);
    }).error(function (msg) {
        console.error(msg);
    });

}