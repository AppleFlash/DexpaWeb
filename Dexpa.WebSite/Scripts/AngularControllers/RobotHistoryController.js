DexpaApp.controller('RobotHistoryCtrl', function ($scope, $http, $interval, $filter) {
    $scope.orders = new Array();

    $scope.readyDrivers = new Array();
    $scope.busyDrivers = new Array();
    $scope.notAvailableDrivers = new Array();

    $scope.init = function () {
        $scope.getOrders();
        $scope.getDrivers();

        var toDate = new Date();
        var year = toDate.getFullYear();
        var month = toDate.getMonth();
        var day = toDate.getDate();
        var hours = toDate.getHours();
        var mins = toDate.getMinutes();

        toDate = moment().format("YYYY-MM-DDTHH:mm");
        var fromDate = new Date(moment([year, month, day, hours, mins]).subtract("hours", 3));
        fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm");
        jQuery('#filterFromDate').val(fromDate);
        jQuery('#filterToDate').val(toDate);

        $scope.datapickerInit(fromDate, toDate);
    }

    $scope.getOrders = function () {
        $scope.robotHistory = [];
        $scope.formatDrivers(true);
        $scope.trackPointsList = [];
        $scope.selectedOrder = undefined;

        $("#reportLoader").show();
        $scope.reverse = false;
        count = 1;
        $scope.sortBy('timestamp');

        if (jQuery('#filterToDate').val() == "" || jQuery('#filterToDate').val() == "") {
            var toDate = new Date();
            var year = toDate.getFullYear();
            var month = toDate.getMonth();
            var day = toDate.getDate();
            var hours = toDate.getHours();
            var mins = toDate.getMinutes();

            toDate = moment().format("YYYY-MM-DDTHH:mm");
            var fromDate = new Date(moment([year, month, day, hours, mins]).subtract("hours", 3));
            fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm");
            jQuery('#filterFromDate').val(convertDateToString(fromDate));
            jQuery('#filterToDate').val(convertDateToString(toDate));
        } else {
            var k = jQuery('#filterToDate').val();
            toDate = convertStringToDate(k, false);
            toDate = moment(toDate).format("YYYY-MM-DDTHH:mm");
            fromDate = convertStringToDate(jQuery('#filterFromDate').val(), true);
            fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm");
        }

        var orders = $.ajax({
            url: ApiServerUrl + 'report/GetAllOrdersReport?dateTimeFrom=' + fromDate + '&dateTimeTo=' + toDate,
            method: 'GET',
            headers: GetHeaders()
        });
        orders.success(function (data) {
            $scope.orders = data;
            $scope.$apply();
            $("#reportLoader").hide();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
            $("#reportLoader").hide();
        });
    }

    $scope.allDrivers = [];

    $scope.getDrivers = function () {
        var drivers = $.ajax({
            url: ApiServerUrl + 'Drivers/AllLightDrivers',
            method: 'GET',
            headers: GetHeaders()
        });
        drivers.success(function (result) {
            $scope.allDrivers = result;

            $scope.$apply();

            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    $scope.GetTrackPoints = function () {
        $("#reportLoader").show();
        var drivers = $.ajax({
            url: ApiServerUrl + 'TrackPoints?time=' + $scope.selectedOrder.timestamp,
            method: 'GET',
            headers: GetHeaders()
        });
        drivers.success(function (result) {
            $scope.trackPointsList = result;

            $scope.formatDrivers(false);
            $scope.$apply();
            $("#reportLoader").hide();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
            $("#reportLoader").hide();
        });
    }

    $scope.formatDrivers = function (ereaseDrivers) {
        RemoveDrivers();
        RemoveDriversRadiuses();

        if (ereaseDrivers)
            return;

        ymaps.ready(function () {
            for (var i = 0; i < $scope.trackPointsList.length; i++) {

                var track = $scope.trackPointsList[i];

                var driverIndex = $scope.findInArray($scope.allDrivers, track.driverId);
                if (driverIndex == -1)
                    continue;

                var driver = $scope.allDrivers[driverIndex];

                driver.state = getDriverState(track.driverState);
                driver.location.longitude = track.longitude;
                driver.location.latitude = track.latitude;
                driver.location.speed = track.speed;
                driver.location.direction = track.direction;

                CreateOrUpdateDriverMark(driver, true);
            }
            $scope.driversCount = $scope.readyDrivers.length + $scope.busyDrivers.length + $scope.notAvailableDrivers.length;
        });
    }

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.robotHistory = [];
    $scope.getRobotHistory = function (orderId) {
        var history = $.ajax({
            url: ApiServerUrl + "RobotLogs?orderId=" + orderId,
            method: 'GET',
            headers: GetHeaders()
        });
        history.success(function (data) {

            for (var i = 0; i < data.length; i++) {
                var index = $scope.findInArray($scope.allDrivers, data[i].driverId);
                if (index != -1)
                    data[i].driver = $scope.allDrivers[index];
            }

            $scope.robotHistory = data;
            $scope.$apply();
        });
    }

    $scope.selectOrder = function (id) {
        $scope.robotHistory = [];
        $scope.formatDrivers(true);
        $scope.trackPointsList = [];
        $scope.selectedOrder = undefined;

        var row = document.getElementsByClassName("selectedTableRow");
        if (row.length != 0) {
            if (id != row[0].id) {
                $scope.getRobotHistory(id);
                $("#" + row[0].id).removeClass("selectedTableRow");

                $("#" + id).addClass("selectedTableRow");
                $scope.selectedOrder = $scope.orders[$scope.findInArray($scope.orders, id)];
                DrawOrder($scope.selectedOrder);
                $scope.GetTrackPoints();
            } else {
                EreaseSelectedOrder();
                $scope.selectedOrder = undefined;
                $("#" + row[0].id).removeClass("selectedTableRow");
            }
        } else {
            $scope.getRobotHistory(id);
            $("#" + id).addClass("selectedTableRow");
            $scope.selectedOrder = $scope.orders[$scope.findInArray($scope.orders, id)];
            DrawOrder($scope.selectedOrder);
            $scope.GetTrackPoints();
        }
    }

    $scope.showOnMap = function (driver) {
        showDriver(driver);
        for (var i = 0; i < $scope.orders.length; i++) {
            if ($scope.orders[i].driver != null) {
                if (driver.id == $scope.orders[i].driver.id) {
                    $scope.selectOrder($scope.orders[i].id);
                }
            }
        }
    };

    $scope.showPointOnMap = function (position) {
        console.log(position);
        var location = position.split(' ');
        location = { longitude: location[0], latitude: location[1] };
        dexpaMap.setCenter([location.latitude, location.longitude], 16);
        dexpaMap.geoObjects.add(DrawMarker(location));
    };

    $scope.getControlTime = function (timeStamp, departure) {
        timeStamp = new Date(timeStamp);
        departure = new Date(departure);

        var ms = departure.getTime() - timeStamp.getTime();
        if (ms < 0) {
            return "-";
        } else {
            var sec = ms / 1000;
            var hours = sec / 3600 % 24;
            var minutes = sec / 60 % 60;
            var seconds = sec % 60;
            hours = Math.floor(hours);
            minutes = Math.floor(minutes);
            seconds = Math.floor(seconds);
            hours = hours < 10 ? 0 + hours : hours;
            minutes = minutes < 10 ? 0 + minutes : minutes;
            seconds = minutes < 10 ? 0 + seconds : seconds;
        }

        if (hours == 0) {
            return minutes + "м";
        }

        if (minutes == 0) {
            return seconds + "с";
        }

        return hours + "ч " + minutes + "м";
    };


    /*START SORTING*/

    $scope.reverse = false;
    $scope.predicate = '';
    var count = 0;

    $scope.iconStyle = '';

    $scope.sortBy = function (predicate) {
        count = (count + 1) % 3;
        switch (count) {
            case 0:
                $scope.predicate = '';
                $scope.reverse = false;
                $scope.iconStyle = '';
                break;
            case 1: $scope.predicate = predicate;
                $scope.reverse = false;
                $scope.iconStyle = 'fa fa-caret-up';
                break;
            case 2: $scope.predicate = predicate;
                $scope.reverse = true;
                $scope.iconStyle = 'fa fa-caret-down';
                break;
            default: $scope.predicate = '';
                $scope.reverse = false;
                $scope.iconStyle = '';
                break;
        }
    };

    /*END SORTING*/

    $scope.convertDateTime = function (data) {
        if (data != undefined && data != null && data != "") {
            var d = convertDateTimeToString(data);
            return d[0] + " " + d[1];
        } else {
            return "";
        }
    }

    $scope.convertTime = function (data) {
        if (data != undefined && data != null && data != "") {
            var d = convertDateTimeToString(data);
            return d[1];
        } else {
            return "";
        }
    }

    $scope.selectDriverForCall = function (driver) {
        showPhone();
        showTab('driver');
        $("#call-driver-number").val(driver.phones[0]);
        $("#ip_phone_driver").val([driver.callsign] + " - " + driver.lastName + " " + driver.firstName + " " + driver.middleName);
    };

    $scope.selectOrderForCall = function (order) {
        showPhone();
        showTab('order');
        $("#ip_phone_order_id").text("Заказ №" + order.id);
        $("#ip_phone_order_address").text(order.fromAddress + " - " + order.toAddress);
        $("#ip_phone_order_date").html("<span class=\"fa fa-calendar\"></span>&nbsp;" + $scope.convertDateTime(order.departureDate));
        $("#ip_phone_order_client_number").val(order.customer.phone);
        $("#ip_phone_order_driver_number").val(order.driver.phones[0]);
    };


    $scope.findInArray = function (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id == id)
                return i;
        }
        return -1;
    }

    $scope.findInArrayDriverId = function (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].driverId == id)
                return i;
        }
        return -1;
    }

    $scope.datapickerInit = function (fromDate, toDate) {
        $scope.fromDate = moment(fromDate).format("DD.MM.YYYY HH:mm");
        $scope.toDate = moment(toDate).format("DD.MM.YYYY HH:mm");
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y H:i',
            dayOfWeekStart: 1,
            timepicker: true,
            validateOnBlur: false,
            mask: true
        };
        jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterToDate').datetimepicker(datetimepickerOptions);
    };

    $scope.roundDouble = function (value) {
        value = parseFloat(value);
        return Math.round(value * 100) / 100;
    }

    $scope.getDriverVerdict = function (verdict) {
        switch (verdict) {
            case 0:
                return "Подходит";
            case 1:
                return "Водитель не допущен к работе";
            case 2:
                return "Робот выключен";
            case 3:
                return "Опции заказа не подходят водителю";
            case 4:
                return "Вне радиуса робота";
            case 5:
                return "Время до подачи авто больше заданного в настройках";
            case 6:
                return "Водитель не на смене";
            case 7:
                return "Водитель не отправлял треки более 3 минут";
            default:
                return "Неизвестный вердикт (код " + verdict + ")";
        }
    }
});


function convertStringToDate(currentDate, isFrom) {
    currentDate = currentDate.split('.');
    var time = currentDate[2].split(' ');
    currentDate[2] = time[0];
    time = time[1].split(':');

    currentDate = new Date(currentDate[2], currentDate[1], currentDate[0], time[0], time[1], 0, 0);

    return currentDate.setMonth(currentDate.getMonth() - 1);
}

function convertDateToString(currentDate) {
    currentDate = currentDate.split('-');
    return currentDate[2].split('T')[0] + "." + currentDate[1] + "." + currentDate[0];
}

function convertDateTimeToString(data) {
    var d = data.split('T');
    var time = d[1].split(':');
    var date = d[0].split('-');
    var dd = new Array();
    dd.push(date[2] + "." + date[1] + "." + date[0]);
    dd.push(time[0] + ':' + time[1]);
    return dd;
}

function backToOrders() {
    $("#searchButton").hide();
    $("#dispatcherButtons").show();
    $("#dispatcherPanel").show();
    $("#searchResults").hide();
}

function UpdateOrder(oldOrder, newOrder) {
    oldOrder.state = newOrder.state;
    oldOrder.driver = newOrder.driver;
    oldOrder.timestamp = newOrder.timestamp;
    oldOrder.departureDate = newOrder.departureDate;
    oldOrder.startWaitTime = newOrder.startWaitTime;
    oldOrder.cost = newOrder.cost;
    oldOrder.fromAddress = newOrder.fromAddress;
    oldOrder.toAddress = newOrder.toAddress;
    oldOrder.customer = newOrder.customer;
    oldOrder.stateMessage = newOrder.stateMessage;
    oldOrder.source = newOrder.source;
}

function UpdateDriver(oldDriver, newDriver) {
    oldDriver.state = newDriver.state;
    oldDriver.driver = newDriver.driver;
    oldDriver.timestamp = newDriver.timestamp;
    oldDriver.departureDate = newDriver.departureDate;
    oldDriver.cost = newDriver.cost;
    oldDriver.fromAddress = newDriver.fromAddress;
    oldDriver.toAddress = newDriver.toAddress;
    oldDriver.customer = newDriver.customer;
    oldDriver.stateMessage = newDriver.stateMessage;
    oldDriver.source = newDriver.source;
    oldDriver.content = newDriver.content;
}

function getDriverState(driverState) {
    var name = "";
    switch (driverState) {
        case 0:
            name = "Свободен";
            break;
        case 1:
            name = "Недоступен";
            break;
        case 2:
            name = "На заказе";
            break;
        case 3:
            name = "Уволен";
            break;
        default:
            name = "";
    }

    return {
        state: driverState,
        name: name
    }
}

