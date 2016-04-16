DexpaApp.controller('DispatcherCtrl', function ($scope, $http, $interval, $filter) {

    $scope.orders = new Array();
    $("#searchResults").hide();
    $("#searchButton").hide();
    $("#results").hide();
    $("#searchLoader").hide();
    $scope.readyDrivers = new Array();
    $scope.busyDrivers = new Array();
    $scope.notAvailableDrivers = new Array();
    $scope.blockedDrivers = new Array();

    var dispatherLogin = "";

    var nowDate = new Date();
    //var nowDate = new Date(2014, 5, 15);
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    var day = nowDate.getDate();
    var date = year + "-" + (month < 10 ? '0' : '') + month + "-" + (day < 10 ? '0' : '') + day;

    $scope.orderStates = [];
    $scope.selectedStatus = {
        type:-1,
        name: "Все"
    }

    initialization("driverFilter");
    dropdownHide("driverFilter");

    $scope.getOrderStates = function () {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/OrdersStates',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.orderStates.push({
                type: -1,
                name: "Все"
            });
            $scope.orderStates = $scope.orderStates.concat(data);
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.getOrderStates();

    $scope.initDispatcher = function(dispLogin) {
        dispatherLogin = dispLogin;
    }

    function getOrders() {
        var orders = $.ajax({
            url: ApiServerUrl + "Orders/Light",
            method: 'GET',
            headers: GetHeaders()
        });
        orders.success(function (data) {
            
            var result = new Array();

            for (var i = 0; i < data.length; i++) {
                data[i].order.customer = {
                    name: data[i].order.cutomerName,
                    phone: data[i].order.customerPhone
                };
                data[i].order.driver = {
                    name: data[i].order.driverName,
                    callsign: data[i].order.driverCallsign,
                    phones: data[i].order.driverPhone
                };

                for (var j = 0; j < $scope.orderStates.length; j++) {
                    if (data[i].order.state == $scope.orderStates[j].type) {

                        data[i].order.driverApproved = false;

                        var oState = data[i].order.state;
                        if (oState==3 || oState==4 ||oState==2 ||oState==5 ||oState==7 ||oState==8) {
                            data[i].order.driverApproved = true;
                        }

                        data[i].order.state = {
                            name: $scope.orderStates[j].name,
                            type: $scope.orderStates[j].type
                        };
                    }
                }
            }

            for (var l = 0; l < data.length; l++) {
                data[l].order.priorityColor = GetOrderPriorityColor(data[l]);

                data[l].order.priority = data[l].priority;
                data[l].order.showIndex = l;
                result.push(data[l].order);
            }

            var ordersForDel = new Array(); //массив заказов для удаления из списка

            for (var i = 0; i < $scope.orders.length; i++) {
                if (FindInArray(result, $scope.orders[i].id) == -1) {
                    ordersForDel.push($scope.orders[i]);
                }
            }

            for (var k = 0; k < $scope.orders.length; k++) {
                $scope.orders[k].timeLeft = $scope.subtractDate($scope.orders[k].departureDate.replace('T', ' '));
            }

            for (var j = 0; j < result.length; j++) {
                var oldOrderIndex = FindInArray($scope.orders, result[j].id);
                if (oldOrderIndex != -1) {
                    var oldOrder = $scope.orders[oldOrderIndex];
                    UpdateOrder(oldOrder, result[j]); //сделать обновление заказа
                } else {
                    $scope.orders.push(result[j]); //добавить новый заказ из эвента
                }
            }

            //удаление лишних заказов
            for (j = 0; j < ordersForDel.length; j++) {
                var index = FindInArray($scope.orders, ordersForDel[j].id);
                if (index != -1) {
                    $scope.orders.splice(index, 1);
                }
            }
            
            $scope.$apply();
            $scope.drawStatebuttons();


        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    $scope.driverStates = [];

    $scope.getDriverStates = function () {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/DriverStates',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverStates = data;
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.getDriverStates();


    function getDrivers() {
        var drivers = $.ajax({
            url: ApiServerUrl + 'Drivers/DriverCarReport',
            method: 'GET',
            headers: GetHeaders()
        });
        drivers.success(function (result) {

            $scope.cancelReasonType = 0;
            ymaps.ready(function() {
                var readyForDel = CreateMassForDelObjects($scope.readyDrivers, result);
                var busyForDel = CreateMassForDelObjects($scope.busyDrivers, result);
                var notAvailableForDel = CreateMassForDelObjects($scope.notAvailableDrivers, result);
                var blockedForDel = CreateMassForDelObjects($scope.blockedDrivers, result);

                for (var i = 0; i < result.length; i++) {
                    var driver = result[i];

                    for (var j = 0; j < $scope.driverStates.length; j++) {
                        if (result[i].state == $scope.driverStates[j].state) {
                            result[i].state = $scope.driverStates[j];
                        }
                    }

                    /*if (result[i].content == null) {
                        result[i].content = { driverPhoto: { webUrlSmall: "/Content/Images/no-photo-small.png" } };
                    } else {
                        if (result[i].content.driverPhoto == null) {
                            result[i].content.driverPhoto = { webUrlSmall: "/Content/Images/no-photo-small.png" };
                        }
                    }*/

                    if (result[i].photoUrlSmall == null) {
                        result[i].photoUrlSmall = "/Content/Images/no-photo-small.png";
                    }

                    var index;

                    switch (driver.state.state) {
                        case 0:
                            {
                                index = FindInArray($scope.readyDrivers, driver.id);
                                if (index != -1) {
                                    UpdateDriver($scope.readyDrivers[index], driver);
                                    CreateOrUpdateDriverMark(driver);
                                } else {
                                    DeleteObjFromArray($scope.busyDrivers, [driver]);
                                    DeleteObjFromArray($scope.notAvailableDrivers, [driver]);
                                    DeleteObjFromArray($scope.blockedDrivers, [driver]);
                                    CreateOrUpdateDriverMark(driver);

                                    $scope.readyDrivers.push(driver);
                                }
                                break;
                            }
                        case 1:
                            {
                                index = FindInArray($scope.notAvailableDrivers, driver.id);
                                if (index != -1) {
                                    UpdateDriver($scope.notAvailableDrivers[index], driver);
                                    CreateOrUpdateDriverMark(driver);
                                } else {
                                    DeleteObjFromArray($scope.busyDrivers, [driver]);
                                    DeleteObjFromArray($scope.readyDrivers, [driver]);
                                    DeleteObjFromArray($scope.blockedDrivers, [driver]);
                                    CreateOrUpdateDriverMark(driver);

                                    $scope.notAvailableDrivers.push(driver);
                                }
                                break;
                            }
                        case 2:
                            {
                                index = FindInArray($scope.busyDrivers, driver.id);
                                if (index != -1) {
                                    UpdateDriver($scope.busyDrivers[index], driver);
                                    CreateOrUpdateDriverMark(driver);
                                } else {
                                    DeleteObjFromArray($scope.readyDrivers, [driver]);
                                    DeleteObjFromArray($scope.notAvailableDrivers, [driver]);
                                    DeleteObjFromArray($scope.blockedDrivers, [driver]);
                                    CreateOrUpdateDriverMark(driver);

                                    $scope.busyDrivers.push(driver);
                                }
                                break;
                            }
                        case 4:
                            {
                                index = FindInArray($scope.blockedDrivers, driver.id);
                                if (index != -1) {
                                    UpdateDriver($scope.blockedDrivers[index], driver);
                                    CreateOrUpdateDriverMark(driver);
                                } else {
                                    DeleteObjFromArray($scope.readyDrivers, [driver]);
                                    DeleteObjFromArray($scope.busyDrivers, [driver]);
                                    DeleteObjFromArray($scope.notAvailableDrivers, [driver]);
                                    CreateOrUpdateDriverMark(driver);

                                    $scope.blockedDrivers.push(driver);
                                }
                                break;
                            }
                    }
                }

                for (var j = 0; j < readyForDel.length; j++) {
                    DeleteDriverMark(readyForDel[j]);
                }
                for (j = 0; j < busyForDel.length; j++) {
                    DeleteDriverMark(busyForDel[j]);
                }
                for (j = 0; j < notAvailableForDel.length; j++) {
                    DeleteDriverMark(notAvailableForDel[j]);
                }
                for (j = 0; j < blockedForDel.length; j++) {
                    DeleteDriverMark(blockedForDel[j]);
                }

                DeleteObjFromArray($scope.readyDrivers, readyForDel);
                DeleteObjFromArray($scope.busyDrivers, busyForDel);
                DeleteObjFromArray($scope.notAvailableDrivers, notAvailableForDel);
                DeleteObjFromArray($scope.blockedDrivers, blockedForDel);

                $scope.driversCount = $scope.readyDrivers.length + $scope.busyDrivers.length + $scope.notAvailableDrivers.length;

                $scope.allDrivers = $scope.readyDrivers.concat($scope.busyDrivers);
                $scope.allDrivers = $scope.allDrivers.concat($scope.notAvailableDrivers);
            });
            $("#loader").hide();
            $("#main_part").show();
            $scope.$apply();
            $("#driverFilter").val("Все");
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    getOrders();
    getDrivers();
    $interval(getOrders, 5000);
    $interval(getDrivers, 5000);

    $scope.selectOrder = function (id) {
        var row = document.getElementsByClassName("selectedTableRow");
        if (row.length != 0) {
            if (id != row[0].id) {
                $("#" + row[0].id).removeClass("selectedTableRow");

                $("#" + id).addClass("selectedTableRow");
                $scope.selectedOrder = $scope.orders[FindInArray($scope.orders, id)];
                DrawOrder($scope.selectedOrder);
            } else {
                EreaseSelectedOrder();
                $scope.selectedOrder = undefined;
                $("#" + row[0].id).removeClass("selectedTableRow");
            }
        } else {
            $("#" + id).addClass("selectedTableRow");
            $scope.selectedOrder = $scope.orders[FindInArray($scope.orders, id)];
            DrawOrder($scope.selectedOrder);
        }
        $scope.drawStatebuttons();
    }
//------------Driver block-----------
    $scope.blockData = {
        comment: "",
        block: false,
        driverId: null,
        dispatcherLogin:""
    }

    $scope.openBlockDialog = function (driver) {
        $scope.selectedDriver = driver;
        if ($scope.selectedDriver.state.state == 4) {
            $scope.blockData.block = true;
        } else {
            $scope.blockData.block = false;
        }
        $('#blockDriverModal').modal('show');
    }

    $scope.setBlockDriverState = function () {

        $scope.blockData.driverId = $scope.selectedDriver.id;
        $scope.blockData.dispatcherLogin = dispatherLogin;
        if ($scope.blockData.block == null) {
            $scope.blockData.block = false;
        }

        var oldState = $scope.selectedDriver.state.state;

        $.ajax({
            url: ApiServerUrl + '/Drivers/BlockUnblockDriver/',
            method: 'PUT',
            data: $scope.blockData,
            headers: GetHeaders()
        }).success(function (data) {
            var state = null;
            for (var j = 0; j < $scope.driverStates.length; j++) {
                if (data.state.state == $scope.driverStates[j].state) {
                    state = $scope.driverStates[j];
                }
            }
            var driver;

            if (data.state.state == 4) {
                var array;

                switch (oldState) {
                    case 0:
                        array = $scope.readyDrivers;
                        break;
                    case 1:
                        array = $scope.notAvailableDrivers;
                        break;
                    case 2:
                        array = $scope.busyDrivers;
                        break;
                default:
                    return;
                }

                var index = FindInArray(array, data.id);
                if (index != -1) {
                    $scope.driversCount = $scope.driversCount - 1;
                    driver = array.splice(index, 1)[0];
                    driver.state = state;
                    $scope.blockedDrivers.push(driver);
                    CreateOrUpdateDriverMark(driver);
                    $scope.$apply();
                }
            } else {
                var index = FindInArray($scope.blockedDrivers, data.id);
                if (index != -1) {
                    $scope.driversCount = $scope.driversCount + 1;
                    driver = $scope.blockedDrivers.splice(index, 1)[0];
                    driver.state = state;
                    $scope.notAvailableDrivers.push(driver);
                    CreateOrUpdateDriverMark(driver);
                    $scope.$apply();
                }
            }

            $scope.selectedDriver = null;
            $scope.blockData = {
                comment: "",
                block: false,
                driverId: null,
                dispatcherLogin: ""
            }
        }).error(function (msg) {
            showNotification('danger', "Возникла ошибка. Статус водителя не изменен.");
            console.error(msg);
            $scope.selectedDriver = null;
            $scope.blockData = {
                comment: "",
                block: false,
                driverId: null,
                dispatcherLogin: ""
            }
        });
        $('#blockDriverModal').modal('hide');
    }
//-----------------------------------
    $scope.resetStateButtonsStyle = function () {
        for (var i = 1; i <= 5; i++) {
            $("#state" + i).removeClass("btn-default");
            $("#state" + i).addClass("btn-success");
        }
    }

    $scope.updateSelectedOrder = function (updateCancelReason, oldStateObj) {
        $scope.resetStateButtonsStyle();
        
        $.ajax({
            url: ApiServerUrl + 'Orders/'+$scope.selectedOrder.id+'/State/',
            method: 'POST',
            data: { updateCancelReason: updateCancelReason, order: $scope.selectedOrder }
        }).success(function () { }).error(function (msg) {
            $scope.selectedOrder.state = oldStateObj;
            //showModal("Ошибка!", "Ошибка при изменении статуса заказа");
            showNotification('danger', "Ошибка при изменении статуса заказа");
            console.error(msg);
        });
        $scope.selectOrder($scope.selectedOrder.id);
    }

    $scope.setOrderState = function (newState, buttonId) {
        if ($scope.selectedOrder != undefined || $scope.selectedOrder != null) {

            for (var i = 1; i <= 5; i++) {
                if (i == buttonId) {
                    $("#state" + i).removeClass("btn-success");
                    $("#state" + i).addClass("btn-default");
                } else {
                    $("#state" + i).removeClass("btn-default");
                    $("#state" + i).addClass("btn-success");
                }
            }
            var k = newState.split('_');
            if (Number(k[0]) == 8) {
                $('#CancelModal').modal({
                    keyboard: false
                });
            } else {
                var oldStateObj = $scope.selectedOrder.state;
                $scope.selectedOrder.state = Number(k[0]);
                $scope.updateSelectedOrder(oldStateObj);
            }
        }
    }

    $scope.driversList = [""];
    $scope.currentDriverIndex = 0;
    $scope.driversMainList = [null];

    $scope.addOneDriver = function() {
        $scope.driversList.push("");
        $scope.driversMainList.push(null);
        dropdownHide("driverFilter");
    }

    $scope.isdropDownShow = false;
    $scope.openCloseDriverPanel = function (index, event) {
        if ($scope.isdropDownShow) {
            dropdownHide("driverFilter");
            $scope.isdropDownShow = false;
            if ($scope.driversMainList[index] != null) {
                var driver = $scope.driversMainList[index];
                $scope.driversList[index] = "[" + driver.callsign + "] - " + driver.lastName + " " + driver.firstName + " " + driver.middleName;
            }
        } else {
            $scope.driversList[index] = "";
            var elem = $(event.target);
            $("#driversPanel").css({ top: (elem.position().top + elem.outerHeight(true)) + "px" });
            dropdownShow("driverFilter");
            $scope.isdropDownShow = true;
        }
        $scope.currentDriverIndex = index;
    }

    $scope.blurDriverPanel = function () {
        dropdownHide("driverFilter");
        $scope.isdropDownShow = false;
    }

    $scope.clearOneDriver = function(index) {
        $scope.driversList.splice(index, 1);
        $scope.driversMainList.splice(index, 1);
        dropdownHide("driverFilter");
    }

    $scope.setSelectedOneDriver = function (driver) {
        if (driver == undefined) {
            $scope.driversList[$scope.currentDriverIndex] = "";
            $scope.driversMainList[$scope.currentDriverIndex] = null;
        } else {
            var isExistsIndex = FindObjInArray(driver.id, $scope.driversMainList);
            if (isExistsIndex == -1) {
                $scope.driversList[$scope.currentDriverIndex] = "[" + driver.callsign + "] - " + driver.lastName + " " + driver.firstName + " " + driver.middleName;
                $scope.driversMainList[$scope.currentDriverIndex] = driver;
            } else {
                if ($scope.driversMainList[isExistsIndex] != null) {
                    var curDriver = $scope.driversMainList[isExistsIndex];
                    $scope.driversList[index] = "[" + curDriver.callsign + "] - " + curDriver.lastName + " " + curDriver.firstName + " " + curDriver.middleName;
                }
            }
        }

        $scope.blurDriverPanel();
    };

    $scope.cancelOrder = function () {
        $scope.resetStateButtonsStyle();
        var oldStateObj = $scope.selectedOrder.state;
        var cancelReason = "";
        if ($scope.cancelReasonType == 0) {
            $scope.selectedOrder.state = 8;
            cancelReason = "Клиент отменил заказ. ";
            $scope.selectedOrder.customer.toBlackList = $scope.cancelReasonToBlackList;
        } else {
            $scope.selectedOrder.state = 7;
            cancelReason = "Водитель отменил заказ. ";
            $scope.selectedOrder.customer.toBlackList = false;
        }

        cancelReason += ($scope.cancelReasonComment != undefined ? $scope.cancelReasonComment : "");

        $scope.updateSelectedOrder(cancelReason, oldStateObj);
    }

    $scope.OrderStateButtons = {
        Driving: false,
        Waiting: false,
        Transporting: false,
        Completed: false,
        Rejected: false
    };

    $scope.drawStatebuttons = function () {
        $scope.resetStateButtonsStyle();

        $scope.OrderStateButtons = {
            Driving: false,
            Waiting: false,
            Transporting: false,
            Completed: false,
            Canceled: false
        };

        if ($scope.selectedOrder != undefined) {
            if ($scope.selectedOrder.state.type == 10) {
                $scope.OrderStateButtons.Driving = true;
                $scope.OrderStateButtons.Canceled = true;
            }

            if ($scope.selectedOrder.state.type == 2) {
                $scope.OrderStateButtons.Waiting = true;
                $scope.OrderStateButtons.Canceled = true;
            }

            if ($scope.selectedOrder.state.type == 3) {
                $scope.OrderStateButtons.Transporting = true;
            }

            if ($scope.selectedOrder.state.type == 4) {
                $scope.OrderStateButtons.Completed = true;
            }

            if ($scope.selectedOrder.state.type == 0 || $scope.selectedOrder.state.type == 1 || $scope.selectedOrder.state.type == 9) {
                $scope.OrderStateButtons.Canceled = true;
            }
        }
    }

    $scope.showOnMap = function (driver) {
        showDriver(driver);

        if (driver.state.state == 2) { //Busy
            for (var i = 0; i < $scope.orders.length; i++) {
                if ($scope.orders[i].driver != null) {
                    if (driver.id == $scope.orders[i].driver.id) {
                        $scope.selectOrder($scope.orders[i].id);
                    }
                }
            }
        }
    };

    $scope.SearchEvent = function () {
        if (event.keyCode == 13) {
            $scope.search();
        }
    };

    $scope.searchResults = [];

    $scope.search = function () {
        $("#searchButton").show();
        $("#dispatcherButtons").hide();
        $("#dispatcherPanel").hide();
        $("#searchResults").show();
        $("#searchLoader").show();
        $scope.searchResults = [];
        var query = $scope.searchQuery;
        $.ajax({
            url: ApiServerUrl + "AdvancedSearch?query=" + query,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].driver != null) {
                    $scope.searchResults.push({
                        type: "Водители",
                        text: "[" + data[i].driver.callsign + "] - " + data[i].driver.lastName + " " + data[i].driver.firstName + " " + data[i].driver.middleName,
                        link: "/Driver/ShowDriver/" + data[i].driver.id,
                        actionType: 'none',
                        param: null,
                        newTab: "_blank"
                    });
                }
                if (data[i].car != null) {
                    $scope.searchResults.push({
                        type: "Транспортные средства",
                        text: "[" + data[i].car.callsign + "] " + data[i].car.brand + " " + data[i].car.model,
                        link: "/CarsDictionary/ShowCar/" + data[i].car.id,
                        actionType: 'none',
                        param: null,
                        newTab: "_blank"
                    });
                }
                if (data[i].order != null) {
                    $scope.searchResults.push({
                        type: "Заказы",
                        text: "От: " + data[i].order.fromAddress + " До: " + data[i].order.toAddress + " Время: " + data[i].order.departureDate.replace('T', ' '),
                        link: null,
                        actionType: 'id',
                        param: data[i].order.id,
                        newTab: "_self"
                    });
                }
                if (data[i].mapObject != null) {
                    var object = JSON.parse(data[i].mapObject);
                    var geoObjects = object.response.GeoObjectCollection.featureMember;
                    for (var j = 0; j < geoObjects.length; j++) {
                        $scope.searchResults.push({
                            type: geoObjects[j].GeoObject.description,
                            text: geoObjects[j].GeoObject.name,
                            link: null,
                            actionType: 'map',
                            param: geoObjects[j].GeoObject.Point.pos,
                            newTab: "_self"
                        });
                    }
                }
            }
            $('#searchLoader').hide();
            $("#results").show();
            console.log($scope.searchResults);
            $scope.$apply();
        }).error(function(msg) {
            console.error(msg);
        });
    };


    $scope.searchAction = function(type, param) {
        switch (type) {
            case "id":
                $scope.selectOrder(param);
                break;
            case "map":
                $scope.showPointOnMap(param);
                break;
            case "none":
                break;
            default:
        }
    };

    $scope.showPointOnMap = function (position)
    {
        console.log(position);
        var location = position.split(' ');
        location = {longitude:location[0],latitude:location[1]};
        dexpaMap.setCenter([location.latitude, location.longitude], 16);
        dexpaMap.geoObjects.add(DrawMarker(location));
    };

    $scope.subtractDate = function(date) {
        var nowDate = new Date();
        date = new Date(date);
        var ms = date.getTime() - nowDate.getTime();
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

        if (minutes==0) {
            return seconds + "с";
        }

        return hours + "ч " + minutes + "м";
    };


    /*START SORTING*/

    $scope.reverse = false;
    $scope.predicate = "showIndex";
    var count = 0;

    $scope.iconStyle = "";

    $scope.sortBy = function (predicate) {
        //var orderBy = $filter('orderBy');
        //sortingInitialisation($scope.orders, orderBy);
        //$scope.orders = sortBy(predicate);

        count = (count + 1) % 3;
        switch (count) {
            case 0:
                $scope.predicate = "showIndex";
                $scope.reverse = false;
                $scope.iconStyle = "";
                break;
            case 1:
                $scope.predicate = predicate;
                $scope.reverse = false;
                $scope.iconStyle = 'fa fa-caret-up';
                break;
            case 2:
                $scope.predicate = predicate;
                $scope.reverse = true;
                $scope.iconStyle = 'fa fa-caret-down';
                break;
            default:
                $scope.predicate = "showIndex";
                $scope.reverse = false;
                $scope.iconStyle = "";
                break;
        }

    };

    /*END SORTING*/

    $scope.convertDateTime = function (data) {
        if (data != undefined && data != null && data != "") {
            var d = convertDateToString(data);
            return d[0] + " " + d[1];
        } else {
            return "";
        }
    }

    $scope.convertDate = function (data) {
        if (data != undefined && data != null && data != "") {
            var d = convertDateToString(data);
            return d[0];
        } else {
            return "";
        }
    }

    $scope.convertTime = function (data) {
        if (data != undefined && data != null && data != "") {
            var d = convertDateToString(data);
            return d[1];
        } else {
            return "";
        }
    }

    $scope.selectDriverForCall = function (driver) {
        showPhone();
        showTab('driver');
        if (driver != null) {
            $("#call-driver-number").val(driver.phones.split(",")[0].trim(' '));
            $("#ip_phone_driver").val([driver.callsign] + " - " + driver.name);
        }
    };

    $scope.selectOrderForCall = function (order) {
        $.ajax({
            url: ApiServerUrl + "orders/" + order.id,
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            showPhone();
            showTab('order');
            $("#ip_phone_order_id").text("Заказ №" + data.id);
            $("#ip_phone_order_address").text(data.fromAddress);
            var carFeatures = data.orderOptions.carFeatures;
            var wishes = (carFeatures.bussiness ? "Бизнес, " : "") + (carFeatures.comfort ? "Комфорт, " : "") + (carFeatures.conditioner ? "Кондиционер, " : "") + (carFeatures.economy ? "Эконом, " : "") + (carFeatures.minivan ? "Минивэн, " : "") + (carFeatures.smoke ? "Курить, " : "") + (carFeatures.stationWagon ? "Универсал, " : "") + (carFeatures.wifi ? "Wi-Fi, " : "") + (carFeatures.withAnimals ? "Животные, " : "") + "Детское кресло: " + data.orderOptions.childrenSeat.name + "<br>";
            $("#ip_phone_order_wishes").html("<strong>Пожелания:</strong> " + wishes);
            $("#ip_phone_order_comments").html("<strong>Примечание:</strong> " + data.comments);
            $("#ip_phone_order_date").html("<span class=\"fa fa-calendar\"></span>&nbsp;" + $scope.convertDateTime(data.departureDate));
            if (data.customer != null) {
                $("#ip_phone_order_client_number").val(data.customer.phone);
                $("#ip_phone_order_client_info").text(data.customer.name + ", " + data.customer.phone);
            }
            if (order.driver.name != null) {
                $("#ip_phone_order_driver_info").text("[" + data.driver.callsign + "] - " + data.driver.lastName + " " + data.driver.firstName + " " + data.driver.middleName + ", " + data.driver.phones[0] + ", " + (data.driver.car != null ? data.driver.car.regNumber : "-"));
                $("#ip_phone_order_driver_number").val(data.driver.phones[0]);
            } else {
                $("#ip_phone_order_driver_info").text("");
                $("#ip_phone_order_driver_number").val();
            }
        });
    };

    $scope.selectDriver = function (driver) {
        if (driver == undefined) {
            $scope.filterDriver = null;
            $("#driverFilter").val("Все");
        } else {
            $scope.filterDriver = driver;
            $("#driverFilter").val("[" + driver.callsign + "] - " + driver.lastName + " " + driver.firstName + " " + driver.middleName);
        }
        dropdownHide("driverFilter");
    };

    $scope.filterOrdersByState = function (order)
    {
        if ($scope.selectedStatus.type == -1) {
            return true;
        }

        if (order.state.type == $scope.selectedStatus.type) {
            return true;
        }
        return false;
    }

    $scope.filterOrdersByDriver = function (order)
    {
        if ($scope.filterDriver == null) {
            return true;
        }

        if (order.driverId == $scope.filterDriver.id) {
            return true;
        }
        return false;
    }

    $("#driverFilter").val("Все");

});



function convertDateToString(data) {
    var d = data.split('T');
    var time = d[1].split(':');
    var date = d[0].split('-');
    var dd = new Array();
    dd.push(date[2] + "." + date[1] + "." + date[0]);
    dd.push(time[0] + ':' + time[1]);
    return dd;
}

function FindInArray(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id == id)
            return i;
    }
    return -1;
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

    oldOrder.lastHistoryTime = newOrder.lastHistoryTime;
    oldOrder.isOrganization = newOrder.isOrganization;
    oldOrder.driverApproved = newOrder.driverApproved;

    oldOrder.showIndex = newOrder.showIndex;
    oldOrder.priority = newOrder.priority;

    oldOrder.isFreeWaitOver = newOrder.isFreeWaitOver;
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

    oldDriver.photoUrl = newDriver.photoUrl;
    oldDriver.photoUrlSmall = newDriver.photoUrlSmall;
    oldDriver.photoUrlThumb = newDriver.photoUrlThumb;
}

function CreateMassForDelObjects(oldMass, newMass) {
    var massForDel = new Array();
    for (var i = 0; i < oldMass.length; i++) {
        if (FindInArray(newMass, oldMass[i].id) == -1) {
            massForDel.push(oldMass[i]);
        }
    }
    return massForDel;
}

function DeleteObjFromArray(currentMass, massForDel) {
    var isAnyDel = false;
    for (var j = 0; j < massForDel.length; j++) {
        var index = FindInArray(currentMass, massForDel[j].id);
        if (index != -1) {
            currentMass.splice(index, 1);
            isAnyDel = true;
        }
    }
    return isAnyDel;
}

function GetOrderPriorityColor(orderWpriority) {
    if (orderWpriority.priority == 1) {
        return 1;
    } else {
        if (orderWpriority.order.isOrganization) {
            return 2;
        } else {
            return orderWpriority.order.isYandex ? 3 : 4;
        }
    }
}