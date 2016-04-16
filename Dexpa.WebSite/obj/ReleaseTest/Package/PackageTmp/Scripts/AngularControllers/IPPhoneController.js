DexpaApp.controller('IPPhoneCtrl', function ($scope, $http) {

    $scope.OnlineDrivers = true;
    $scope.FiredDrivers = false;
    $scope.IPPhoneDrivers = [];

    $scope.ipPhoneInit = function () {
        $scope.events();
        $scope.getDrivers();
        initialization("ip_phone_driver");
        dropdownHide("ip_phone_driver");
    };

    $scope.getDrivers = function() {
        var url;
        if ($scope.OnlineDrivers) {
            url = "Drivers/GetOnline";
        } else {
            url = "Drivers/GetFired";
        }
        $.ajax({
            url: ApiServerUrl + url,
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            $scope.IPPhoneDrivers = data;
            dropdownLoaderHide();
            $scope.$apply();
        }).error(function(msg) {
            console.error(msg);
        });
    };

    $scope.selectDriver = function (driver) {
        $("#call-driver-number").val(driver.phones[0]);
        $("#ip_phone_driver").val([driver.callsign] + " - " + driver.lastName + " " + driver.firstName + " " + driver.middleName);
    };

    $scope.events = function () {

        function clearDrivers() {
            $("#call-driver-number").val("");
            $("#ip_phone_driver").val("");
            $scope.IPPhoneDrivers = [];
            dropdownLoaderShow();
            $scope.getDrivers();
        }

        $("#ip_phone_online_drivers").bind('click', function() {
            $scope.OnlineDrivers = !$scope.OnlineDrivers;
            if ($scope.FiredDrivers) {
                $scope.FiredDrivers = !$scope.FiredDrivers;
            }
            clearDrivers();
        });

        $("#ip_phone_fired_drivers").bind('click', function () {
            $scope.FiredDrivers = !$scope.FiredDrivers;
            if ($scope.OnlineDrivers) {
                $scope.OnlineDrivers = !$scope.OnlineDrivers;
            }
            clearDrivers();
        });

        var CALL_TAB;

        function outcomingCall(tab, number) {
            if (number == '') {
                showNotification('warning', 'Пустой номер телефона');
                return false;
            } else {
                call(number);
            }
            $("#ip_phone_outcoming_call_number").text(number);
            CALL_TAB = tab;
            showTab('outcoming_call');
        }

        $("#call-button").bind('click', function () {
            var number = $("#call-number").val();
            outcomingCall('number', number);
        });

        $("#cancel-button").bind('click', function () {
            $("#call-number").val("");
        });

        $("#call-driver").bind('click', function() {
            var number = $("#call-driver-number").val();
            outcomingCall('driver', number);
        });

        $("#cancel-driver").bind('click', function () {
            clearDrivers();
        });

        $("#call-order-client").bind('click', function() {
            var phone = $("#ip_phone_order_client_number").val();
            $("#call-order-number").val(phone);
            outcomingCall('order', phone);
        });

        $("#call-order-driver").bind('click', function () {
            var phone = $("#ip_phone_order_driver_number").val();
            $("#call-order-number").val(phone);
            outcomingCall('order', phone);
        });

        $("#cancel-order").bind('click', function () {
            $("#call-order-number").val("");
            $("#ip_phone_order_id").text("");
            $("#ip_phone_order_address").text("");
            $("#ip_phone_order_date").text("");
        });

        $('#hang-up').bind('click', function() {
            hangUp();
            $("#ip_phone_outcoming_call_number").text("");
            showTab(CALL_TAB);
        });

    };
});