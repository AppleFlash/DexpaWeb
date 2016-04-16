DexpaApp.controller("SettingsCtrl", function ($scope) {
    $scope.settings = [];
    $scope.init = function() {
        $.ajax({
            url: ApiServerUrl + "GlobalSettings",
            method: "GET",
            headers: GetHeaders()
        }).success(function (data) {
            data.qiwiCheckInterval = data.qiwiCheckInterval.toString();
            data.highPriorityOrderTime = data.highPriorityOrderTime.toString();
            if (data.qiwiCheckInterval.indexOf("мин.") == -1)
                data.qiwiCheckInterval += " мин.";
            if (data.highPriorityOrderTime.indexOf("ч.") == -1)
                data.highPriorityOrderTime += " ч.";
            $scope.settings.push(data);
            $scope.$apply();
            console.log(data);
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке данных");
        });
    }

    $scope.initSetting = function(setting) {
        if (validateForm("editSettingsForm")) {

            $scope.sendSettings = [];
            console.log(setting);
            $scope.sendSettings.push(setting);

            $.ajax({
                url: ApiServerUrl + "GlobalSettings",
                method: "PUT",
                data: setting,
                headers: GetHeaders()
            }).success(function() {
                document.location.href = "/Settings";
            }).error(function(msg) {
                console.error(msg);
                showNotification('danger', "Ошибка при загрузке данных");
            });
        } else {
            console.log(false);
        }
    }
    $scope.initTimePicker = function () {
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'H:i',
            step: 60,
            dayOfWeekStart: 1,
            datepicker: false,
            validateOnBlur: false,
            onChangeDateTime: $scope.logic,
        };
        $("#timeTrans").datetimepicker(datetimepickerOptions);
    };

    $scope.checkTime = function (time) {
        var regex = "^[0-9]{2}:[0-9]{2}$";
        var regex2 = "^[0-9]{2}:[0-9]{2}:[0-9]{2}$";

        regex = new RegExp(regex);
        regex2 = new RegExp(regex2);

        if (!regex.test(time) && !regex2.test(time)) {
            showNotification('danger', "Неправильное время");
            return false;
        }
        return true;
    };
    $scope.checkSupport = function(sup) {
        var regex = "^[0-9]+$";

        regex = new RegExp(regex);
        if (!regex.test(sup)) {
            showNotification('danger', "Неправильная стоимость ТО");
            return false;
        }
        return true;
    }
});



  /*  
     $scope.sendCustomer = function(customer, id) {

        $.ajax({
            url: ApiServerUrl + "Customers",
            method: 'POST',
            data: customer,
            headers: GetHeaders()
        }).success(function() {
            $scope.getCustomers(id);
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при добавлении ответственного лица");
        });

    */