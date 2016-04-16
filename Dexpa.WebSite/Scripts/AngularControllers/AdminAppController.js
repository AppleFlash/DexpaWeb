DexpaApp.controller('AdminCtrl', function ($scope, $http, $filter) {
    $scope.getUsers = getUsers;

    $scope.WorkConditions = [];
    $scope.selectedWC = null;
    $scope.getWorkConditions = getWorkConditions;
    $scope.getSingleWC = getSingleWC;
    $scope.initNewWC = initNewWC;
    $scope.addWC = addWC;
    $scope.updateWC = updateWC;
    $scope.editWC = editWC;
    $scope.deleteModalWC = deleteModalWC;
    $scope.deleteWC = deleteWC;

    $scope.drivers = [];

    function getUsers() {
        $http.get("/Admin/GetUsers").success(function (result) {
            var filtredUsers = [];
            for (var i = 0; i < result.length; i++) {
                if (result[i].Role != 'Водитель') { //is not a driver
                    filtredUsers.push(result[i]);
                }
            }
            $scope.users = filtredUsers;
        }).error(function (msg) {
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    function getWorkConditions() {
        $.ajax({
            url: ApiServerUrl + "DriverWorkConditions",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (result) {
            $scope.WorkConditions = result;
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
        getDrivers();
    }

    function deleteModalWC(WC) {
        $scope.selectedWC = WC;
        var drivers = [];
        for (var i = 0; i < $scope.drivers.length; i++) {
            if ($scope.drivers[i].workConditionId != null) {
                if (WC.id == $scope.drivers[i].workConditionId) {
                    drivers.push($scope.drivers[i]);
                }
            }
        }
        if (drivers.length > 0) {
            $(".modal-title").text("Внимание!");
            $(".modal-body").html("Это условие связанно с водителями:<br>");
            for (var i = 0; i < drivers.length; i++) {
                $(".modal-body").append("[" + drivers[i].callsign + "] - " + drivers[i].lastName + " " + drivers[i].firstName + " " + drivers[i].middleName + "<br>");
            }
            $(".modal-body").append("<br>");
            $(".modal-body").append("Чтобы удалить условие работы \"" + WC.name + "\", нужно задать новое для данных водителей.<br>");
            $("#checkModal").modal({
                keyboard: false
            });
            $("#deleteWCbutton").hide();
        } else {
            $(".modal-title").text("Удалить?");
            $(".modal-body").text("Вы действительно хотите удалить данное условие работы \'" + $scope.selectedWC.name + "\' ?");
            $('#deleteModal').modal({
                keyboard: false
            });
            $("#deleteWCbutton").show();
        }
    }

    function deleteWC() {
        $.ajax({
            url: ApiServerUrl + "DriverWorkConditions\\" + $scope.selectedWC.id,
            method: 'DELETE',
            headers: GetHeaders()
        }).success(function () {
            location.href = "/Admin/WorkingConditions/";
        }).error(function (msg) {
            var error = errorHandling(msg);
            showNotification('danger', "Возникла ошибка");
            console.error(msg);
        });
    }

    function getSingleWC(id) {
        $.ajax({
            url: ApiServerUrl + "DriverWorkConditions\\" + id,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (result) {
            $scope.selectedWC = result;
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    function initNewWC() {
        $.ajax({
            url:ApiServerUrl + "helpdictionaries/OrderTypes",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (result) {
            var fees = new Array();
            for (var i = 0; i < result.length; i++) {
                var fee = {
                    orderType: result[i],
                    value: 0,
                    feeType: 0
                }
                fees.push(fee);
            }
            $scope.selectedWC = {
                name: "",
                orderFees: fees
            };
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    function addWC(wc) {
        if (wc.name != undefined && wc.name != null && wc.name != "") {
            if ($scope.checkFeeValue(wc.orderFees)) {
                $.ajax({
                    url: ApiServerUrl + "DriverWorkConditions\\",
                    method: 'POST',
                    data: wc,
                    headers: GetHeaders()
                }).success(function () {
                    location.href = "/Admin/WorkingConditions/";
                }).error(function (msg) {
                    var error = errorHandling(msg);
                    showNotification('danger', error);
                    console.error(msg);
                });
            } else {
            showNotification('danger', "Некоторые поля значений комиссий заполнены некорректно");
            }
        } else {
            showNotification('danger', "Поле \"Название\" не заполнено");
        }
    }

    function updateWC(wc) {
        if (wc.name != undefined && wc.name != null && wc.name != "") {
            if ($scope.checkFeeValue(wc.orderFees)) {
                $.ajax({
                    url: ApiServerUrl + "DriverWorkConditions\\" + wc.id,
                    method: 'PUT',
                    data: wc,
                    headers: GetHeaders()
                }).success(function () {
                    location.href = "/Admin/WorkingConditions/";
                }).error(function (msg) {
                    var error = errorHandling(msg);
                    showNotification('danger', error);
                    console.error(msg);
                });
            } else {
                showNotification('danger', "Некоторые поля значений комиссий заполнены некорректно");
            }
        } else {
            showNotification('danger', "Поле \"Название\" не заполнено");
        }
    }

    function editWC(wc) {
        document.location.href = "/Admin/EditWorkCondition/" + wc.id;
    }

    $("#loader").hide();
    $("#main_part").show();

    function getDrivers() {
        $("#main_part").hide();
        $("#loader").show();
        $.ajax({
            url: ApiServerUrl + "Drivers/Light",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.drivers = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.error(msg);
        });
    }

    $scope.checkFeeValue = function (array) {
        var count = true;
        for (var i = 0; i < array.length; i++) {
            if (array[i].feeType == 0) {
                if (array[i].value > 100) {
                    count *= false;
                }
            }
        }
        if (count == 0) {
            count = false;
        }
        return count;
    };

    /*START SORTING*/

    $scope.userTableSortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.users, orderBy);
        $scope.users = sortBy(predicate);
    };

    $scope.wcTableSortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.WorkConditions, orderBy);
        $scope.WorkConditions = sortBy(predicate);
    };

    /*END SORTING*/


    $scope.selectedUserId = '';

    $scope.selectUser = function (user) {
        $scope.selectedUserId = user.UserName;
    };

    $scope.selectedEvent = {};

    $scope.selectEvent = function (event) {
        $scope.selectedEvent.isSelected = false;

        if ($scope.selectedEvent.UserName == event.UserName) {
            $scope.selectedEvent = {};
        } else {
            $scope.selectedEvent = event;
            $scope.selectedEvent.isSelected = true;
            $("#controlButtons").css("display", "inline-block");
        }
    };

    $scope.deleteUser = function (id) {
        $.ajax({
            url: 'account/delete',
            method: 'POST',
            data: {userId: id},
            headers: GetHeaders()
        }).success(function (data) {
            showNotification('success', 'Пользователь удален');
            location.reload();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', 'Ошибка при удалении');
        });
    };
});

DexpaApp.controller('TracksCtrl', function ($scope, $http, $filter) {

    initialization("driver");

    $scope.initTrack = function () {
        var toDate = new Date();
        var year = toDate.getFullYear();
        var month = toDate.getMonth();
        var day = toDate.getDate();
        toDate = moment().format("YYYY-MM-DDTHH:mm:ss");
        var fromDate = new Date(moment([year, month, day]).subtract("days", 1));
        fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
        jQuery('#filterFromDate').val(fromDate);
        jQuery('#filterToDate').val(toDate);

        $scope.datapickerInit(fromDate, toDate);
        $scope.getDrivers();
        dropdownHide("driver");
        $("#loader").hide();
        $("#main_part").show();

        ymaps.ready(function () {
            dexpaMap.controls.add("searchControl");
        });
        //$scope.getPoints();
    }

    $scope.drivers = [];

    $scope.getDrivers = function () {
        $.ajax({
            url:ApiServerUrl + 'Drivers/SimpleDriversList',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.drivers = data;
            $scope.$apply();
            dropdownLoaderHide();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.selectedDriver = null;

    $scope.selectDriver = function (driver) {
        if (driver == undefined) {
            $scope.selectedDriver = null;
        } else {
            $scope.selectedDriver = driver;
            $scope.driverQuery = $scope.selectedDriver.name;
            $scope.getDriverTrackPoints();
        }
        dropdownHide("driver");
    };

    $scope.getDriverTrackPoints = function () {
        if ($scope.selectedDriver == null) {
            showNotification('danger', "Выберите водителя");
        } else {
            if (jQuery('#filterToDate').val() == "" || jQuery('#filterToDate').val() == "") {
                var toDate = new Date();
                var year = toDate.getFullYear();
                var month = toDate.getMonth();
                var day = toDate.getDate();
                toDate = moment().format("YYYY-MM-DDTHH:mm:ss");
                var fromDate = new Date(moment([year, month, day]).subtract("days", 1));
                fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
                jQuery('#filterFromDate').val(convertDateToString(fromDate));
                jQuery('#filterToDate').val(convertDateToString(toDate));
            } else {
                toDate = convertStringToDate(jQuery('#filterToDate').val());
                toDate = moment(toDate).format("YYYY-MM-DDTHH:mm:ss");
                fromDate = convertStringToDate(jQuery('#filterFromDate').val());
                fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
            }
            
            /*$http.get(ApiServerUrl + 'TrackPoints?driverId=' + $scope.selectedDriver.id + '&fromDate=' + fromDate + '&toDate=' + toDate).success(function(data) {
                DrawTrackPoints(data);*/
            $.ajax({
                //url: ApiServerUrl + 'Tracker?fromdate=2014-11-11&todate=2014-11-11&driverid=0',
                url: ApiServerUrl + 'Tracker?driverId=' + $scope.selectedDriver.id + '&fromDate=' + fromDate + '&toDate=' + toDate,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {
                DrawTrackPoints(data);
            }).error(function(msg) {
                console.error(msg);
                showNotification('danger', "Ошибка при получении данных");
            });
        }
    };

    $scope.datapickerInit = function (fromDate, toDate) {
        $scope.fromDate = moment(fromDate).format("DD.MM.YYYY HH:MM");
        $scope.toDate = moment(toDate).format("DD.MM.YYYY HH:MM");
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y H:i',
            dayOfWeekStart: 1,
            timepicker: true,
            validateOnBlur: false,
            mask: true,
            onSelectDate: function () {
                fromDate = $("#filterFromDate").val();
                toDate = $("#filterToDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
            }
        };
        jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterToDate').datetimepicker(datetimepickerOptions);
    };

    function convertStringToDate(currentDate) {
        var tempCurrentDate = currentDate.split('.');
        tempCurrentDate[2] = tempCurrentDate[2].split(' ');
        var time = tempCurrentDate[2][1].split(':');
        tempCurrentDate = new Date(tempCurrentDate[2][0], tempCurrentDate[1], tempCurrentDate[0], time[0], time[1]);
        return tempCurrentDate.setMonth(tempCurrentDate.getMonth() - 1);
    }

    function convertDateToString(currentDate) {
        var tempCurrentDate = currentDate.split('-');
        var tempTimeDay = tempCurrentDate[2].split('T');
        return tempTimeDay[0] + "." + tempCurrentDate[1] + "." + tempCurrentDate[0] + " " + tempTimeDay[1];
    }
});