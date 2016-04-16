DexpaApp.controller('NewOrderCtrl', function ($scope, $http) {

    $scope.radius = 0;

    $scope.init = function () {
        $scope.getOrderSources(false);
        $scope.getTariffs();
        $scope.GetChildrenSeats();
        $scope.getOrganizations();

        $scope.order.source = {
            source: 0,
            name: "Диспетчерская"
        }

        var drivers = $.ajax({
            url: ApiServerUrl + "Drivers",
            method: 'GET',
            headers: GetHeaders()
        });
        drivers.success(function (result) {
            $scope.drivers = new Array();
            for (var i = 0; i < result.length; i++) {
                if (result[i].state.state == 0)
                    $scope.drivers.push(result[i]);
            }
            dropdownLoaderHide();

            ymaps.ready(function () {
                DrawDrivers($scope.drivers);
            });

            $scope.$apply();

        }).error(function (error) {
            console.log(error);
        });
        //initialization("oneDriver"); //dropdownPanel events initialization
        dropdownHide("driver");

        $("#legalEntityBlock").hide();

        $("#legalEntity").bind("click", function () {
            if ($("#legalEntity").prop("checked")) {
                $("#simpleClientBlock").hide();
                $("#legalEntityBlock").show();
            } else {
                $("#simpleClientBlock").show();
                $("#legalEntityBlock").hide();
            }
        });
    };

    $scope.initUpdate = function (id) {
        $scope.getTariffs();
        $scope.getOrderSources(false);
        $scope.GetChildrenSeats();
        $scope.getOrder(id);
    };

    $scope.GetChildrenSeats = function () {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/ChildrenSeats',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.childrenSeats = data;
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    var historyStylesDictionary = {
        "Normal": "",
        "Success": "successText",
        "Warning": "warningText",
        "Danger": "dangerText"
    }

    $scope.setSelectedDriver = function (driver) {
        $scope.order.driver = driver;
        $scope.order.driver.id = driver.id;
        $("#driver").val("[" + driver.callsign + "] - " + driver.lastName + " " + driver.firstName + " " + driver.middleName);
        $('#selectDriverModal').modal('hide');
    };
        
    $scope.orderHistory = new Array();

    $scope.GetOrderHistory = function (orderId) {
        $http.get(ApiServerUrl + 'Orders/' + orderId + '/history').success(function (data) {
            $scope.orderHistory = new Array();
            for (var i = 0; i < data.length; i++) {
                var d = convertDateToString(data[i].timeStamp);
                $scope.orderHistory.push({
                    timeStamp: d[0] + " " + d[1],
                    oldValues: data[i].oldValues.split('@'),
                    style: historyStylesDictionary[data[i].messageType],
                    comment: data[i].comment
            });
            }
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.getOrder = function(id) {
        $.ajax({
            url:ApiServerUrl + 'Orders/'+id,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.GetOrderHistory(id);
            $scope.order = data;

            $scope.canEdit = false;
            if ($scope.order.state.type < 5 || $scope.order.state.type > 8) {
                $scope.canEdit = true;
            }

            var d = convertDateToString(data.departureDate);
            $("#departureDate").val(d[0]);
            $("#departureTime").val(d[1]);

            $scope.order.tariff = {
                id:data.tariffId
            }

            var orderDriverId = null;
            if (data.driver != undefined && data.driver != null) {
                $("#driver").val("[" + data.driver.callsign + "] - " + data.driver.lastName + " " + data.driver.firstName + " " + data.driver.middleName);
                orderDriverId = $scope.order.driver.id;
            } else {
                $scope.selectDriver();
            }

            ymaps.ready(function () {
                $scope.updateFromAddressDetails();
                $scope.updateToAddressDetails();
            });

            $scope.order.customer.phone = $scope.order.customer.phone.toString();
            $scope.formatPhones($scope.order.customer.phone);

            $scope.initializationLabel(data.customer.id);
            $scope.getCustomerLabel(data.customer.id);

            $scope.drawStatebuttons();

            $.ajax({
                url:ApiServerUrl+"Drivers",
                method: 'GET',
                headers: GetHeaders()
            }).success(function (result) {
                $scope.drivers = new Array();
                for (var i = 0; i < result.length; i++) {
                    if (result[i].state.state == 0)
                        $scope.drivers.push(result[i]);
                }
                dropdownLoaderHide();

                ymaps.ready(function () {
                    DrawDrivers($scope.drivers);
                });

            $scope.$apply();

            }).error(function (error) {
                console.log(error);
            });
            dropdownHide("driver");
        }).error(function (msg) {
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    $scope.checkDiscount = function () {
        var parsed = parseInt($scope.order.discount);

        if (isNaN(parsed)) {
            $scope.order.discount = "0";
            return;
        }

        if (parsed > 100) {
            $scope.order.discount = "100";
        } else {
            $scope.order.discount = ""+parsed;
        }
    }


// many drivers functional-------------

    $scope.driversList = ["-"];
    $scope.currentDriverIndex = 0;
    $scope.driversMainList = [null];

    $scope.addOneDriver = function() {
        $scope.driversList.push("-");
        $scope.driversMainList.push(null);
        dropdownHide("driver");
    }

    $scope.isdropDownShow = false;
    $scope.openCloseDriverPanel = function (index, event) {
        if ($scope.isdropDownShow) {
            dropdownHide("driver");
            $scope.isdropDownShow = false;
        } else {
            var elem = $(event.target);
            $("#driversPanel").css({ top: (elem.position().top + elem.outerHeight(true)) + "px" });
            dropdownShow("driver");
            $scope.isdropDownShow = true;
        }
        $scope.currentDriverIndex = index;
    }

    $scope.clearOneDriver = function(index) {
        $scope.driversList.splice(index, 1);
        $scope.driversMainList.splice(index, 1);
        dropdownHide("driver");
    }

    $scope.setSelectedOneDriver = function (driver) {
        if (driver == undefined) {
            $scope.driversList[$scope.currentDriverIndex] = "-";
            $scope.driversMainList[$scope.currentDriverIndex] = null;
        } else {
            if (FindObjInArray(driver.id, $scope.driversMainList) == -1) {
                $scope.driversList[$scope.currentDriverIndex] = "[" + driver.callsign + "] - " + driver.lastName + " " + driver.firstName + " " + driver.middleName;
                $scope.driversMainList[$scope.currentDriverIndex] = driver;
            }
        }

        dropdownHide("driver");
    };

//-----------------------------------------

    $scope.filterDriversByOptions = function (driver) {
        if (driver.car != undefined && driver.car != null) {
            var isDriver = true;

            if ($scope.order.orderOptions.childrenSeat.type != 0 && driver.car.childrenSeat.type != $scope.order.orderOptions.childrenSeat.type) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.conditioner && !driver.car.features.conditioner) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.smoke && !driver.car.features.smoke) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.withAnimals && !driver.car.features.withAnimals) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.stationWagon && !driver.car.features.stationWagon) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.wifi && !driver.car.features.wifi) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.bussiness && !driver.car.features.bussiness) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.comfort && !driver.car.features.comfort) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.economy && !driver.car.features.economy) {
                isDriver = false;
            }

            if ($scope.order.orderOptions.carFeatures.minivan && !driver.car.features.minivan) {
                isDriver = false;
            }

            return isDriver;
        }
        return false;
    };


    $scope.tariffs = [];

    $scope.getTariffs = function () {
        $.ajax({
            url:ApiServerUrl+"Tariffs",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.tariffs = [];
            var dateMass = $("#departureDate").val().split('.');
            var nowDay = new Date(dateMass[2], parseInt(dateMass[1])-1, dateMass[0]).getDay();
            for (var item in data) {

                var day = data[item].days.monday;

                if (day) {
                    if (nowDay == 1)
                        $scope.tariffs.push(data[item]);
                }

                day = data[item].days.tuesday;

                if (day) {
                    if (nowDay == 2)
                        $scope.tariffs.push(data[item]);
                }

                day = data[item].days.wednesday;

                if (day) {
                    if (nowDay == 3)
                        $scope.tariffs.push(data[item]);
                }

                day = data[item].days.thursday;

                if (day) {
                    if (nowDay == 4)
                        $scope.tariffs.push(data[item]);
                }

                day = data[item].days.friday;

                if (day) {
                    if (nowDay == 5)
                        $scope.tariffs.push(data[item]);
                }

                day = data[item].days.saturday;

                if (day) {
                    if (nowDay == 6)
                        $scope.tariffs.push(data[item]);
                }

                day = data[item].days.sunday;

                if (day) {
                    if (nowDay == 0)
                        $scope.tariffs.push(data[item]);
                }
            }
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных");
            showNotification('danger', "Ошибка при получении данных");
            console.log(msg);
        });
    }

    $scope.resetStateButtonsStyle = function () {
        for (var i = 1; i <= 5; i++) {
            $("#state" + i).removeClass("btn-default");
            $("#state" + i).addClass("btn-success");
        }
    }

    $scope.setOrderState = function (newState, buttonId) {
        if ($scope.order != undefined || $scope.order != null) {

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
                var newStateObj = {
                    name: k[1],
                    type: Number(k[0])
                };
                $scope.order.state = newStateObj;
            }
        }
    }

    $scope.cancelOrder = function() {
        if ($scope.cancelReasonType == 0) {
            $scope.order.state = { type: 8 };
            $scope.cancelUpdateReason = "Клиент отменил заказ. ";
            $scope.order.toBlackList = $scope.cancelReasonToBlackList;
        } else {
            $scope.order.state = { type: 7 };
            $scope.cancelUpdateReason = "Водитель отменил заказ. ";
            $scope.order.toBlackList = false;
        }

        $scope.cancelUpdateReason += $scope.cancelReasonComment != undefined ? $scope.cancelReasonComment : "";
    }

    $scope.drawStatebuttons = function () {
        $scope.OrderStateButtons = {
            Driving: false,
            Waiting: false,
            Transporting: false,
            Completed: false,
            Canceled: false
        };
        if ($scope.order != undefined) {
            if ($scope.order.state.type == 10) {
                $scope.OrderStateButtons.Driving = true;
                $scope.OrderStateButtons.Canceled = true;
            }

            if ($scope.order.state.type == 2) {
                $scope.OrderStateButtons.Waiting = true;
                $scope.OrderStateButtons.Canceled = true;
            }

            if ($scope.order.state.type == 3) {
                $scope.OrderStateButtons.Transporting = true;
            }

            if ($scope.order.state.type == 4) {
                $scope.OrderStateButtons.Completed = true;
            }

            if ($scope.order.state.type == 0 || $scope.order.state.type == 1 || $scope.order.state.type == 9) {
                $scope.OrderStateButtons.Canceled = true;
            }
        }
    }

    $scope.updateFromAddressDetails = function () {
        var adr = $scope.getFullAddress($scope.order.fromAddressDetails);
        GetAddress(adr, true, $scope.radius, $scope);
        if ($scope.order.toAddressDetails.street != "") {
            setTimeout(DrawRoute, 1000, $scope.getFullAddress($scope.order.fromAddressDetails), $scope.getFullAddress($scope.order.toAddressDetails));
        } else {
            EreaseSelectedOrder();
        }
    }

    $scope.updateToAddressDetails = function () {
        var adr = $scope.getFullAddress($scope.order.toAddressDetails);
        GetAddress(adr, false, 0, $scope);
        if ($scope.order.fromAddressDetails.street != "") {
            setTimeout(DrawRoute, 1000, $scope.getFullAddress($scope.order.fromAddressDetails), $scope.getFullAddress($scope.order.toAddressDetails));
        } else {
            EreaseSelectedOrder();
        }
    }

    $scope.getFullAddress = function (adrObj) {
        var city = "";
        if (adrObj.city != undefined && adrObj.city != null && adrObj.city != "")
            city = adrObj.city;

        var street = "";
        if (adrObj.street != undefined && adrObj.street != null && adrObj.street != "")
            street = ", " + adrObj.street;

        var house = "";
        if (adrObj.house != undefined && adrObj.house != null && adrObj.house != "")
            house = " " + adrObj.house;

        var staircase = "";
        if (adrObj.staircase != undefined && adrObj.staircase != null && adrObj.staircase != "")
            staircase = " подъезд " + adrObj.staircase;

        var building = "";
        if (adrObj.building != undefined && adrObj.building != null && adrObj.building != "")
            building = " строение " + adrObj.building;

        var housing = "";
        if (adrObj.housing != undefined && adrObj.housing != null && adrObj.housing != "")
            housing = " корпус " + adrObj.housing;

        return city + street + house + housing + building + staircase;
    }
    
    $scope.setRadius = function (newRad) {
        $scope.radius = newRad;
        if (newRad != 0) {
            SetCircleForFromMarker(newRad);
            resetDriversMarks();
            FindDriversInRadius();
        } else {
            SetCircleForFromMarker(0);
            resetDriversMarks();
        }
    }

    $scope.order = {
        fromAddressDetails: {
            city: "Москва",
            street: "",
            house: "",
            housing: "",
            building: "",
            staircase: "",
            comment: ""
        },
        toAddressDetails: {
            city: "Москва",
            street: "",
            house: "",
            housing: "",
            building: "",
            staircase: "",
            comment: ""
        },
        orderOptions: {
            carFeatures: {
                conditioner: false,
                smoke: false,
                withAnimals: false,
                wifi: false,
                stationWagon: false
            },
            childrenSeat: {
                type: 0,
                name: "Нет"
            }
        },
        customer: {
            name:"",
            phone:""
        }
    }
    $scope.orderSourcesList = [];
    $scope.getOrderSources = function (includeYandex) {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/OrdersSources',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            if (!includeYandex) {
                var index;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].source == 1)
                        index = i;
                }
                if (index != undefined)
                    data.splice(index, 1);
            }

            $scope.orderSourcesList = data;
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.nearestDrivers = new Array();

    $scope.add = function (order) {

        if (validateForm("newOrderForm")) {

            if (order.driver == null) {
                order.state = {
                    type: 0
                };
            } else {
                order.state = {
                    type: 1
                };
            }
            order.departureDate = convertStringToDate($("#departureDate").val(), $("#departureTime").val());
            order.tariffId = order.tariffId.id;
            $scope.showIndicator(true);
            order.customer.phone = order.customer.phone.replace(/-/gi, '');

            order.drivers = $scope.driversMainList;

            $.ajax({
                url: ApiServerUrl + 'Orders',
                method: 'POST',
                data: order,
                headers: GetHeaders()
            }).success(function (data) {
                //showModal("", "Заказ успешно создан.");
                //$scope.showIndicator(false);
                document.location.href = "/Dispatcher";
            }).error(function (msg) {
                //date = order.departureDate.split('T');
                //$("#departureDate").val(date[0]);
                //$("#departureTime").val(date[1]);
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
                $scope.showIndicator(false);
            });
        } else {
            console.error(false);
        }

        console.log(order);
    };

            
    $scope.update = function (order) {
        $scope.resetStateButtonsStyle();
        if (validateForm("newOrderForm")) {

            //if (order.driver == null) {
            //    order.state = {
            //        type: 0
            //    };
            //} else {
            //    order.state = {
            //        type: 1
            //    };
            //}

            order.departureDate = convertStringToDate($("#departureDate").val(), $("#departureTime").val());
            order.tariffId = order.tariff.id;
            $scope.showIndicator(true);
            order.customer.phone = order.customer.phone.replace(/-/gi, '');
            $.ajax({
                url: ApiServerUrl + 'Orders/'+order.id,
                method: 'PUT',
                data: { updateCancelReason: $scope.cancelUpdateReason, order: order },
                headers: GetHeaders()
            }).success(function (data) {
                //showModal("", "Заказ успешно создан.");
                //$scope.showIndicator(false);
                document.location.href = "/Dispatcher";
            }).error(function (msg) {
                //date = order.departureDate.split('T');
                //$("#departureDate").val(date[0]);
                //$("#departureTime").val(date[1]);
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
                $scope.showIndicator(false);
            });
        } else {
            console.error(false);
        }

        console.log(order);
    };

    $scope.order.driver = null;
    $scope.driverQuery = "-";

    $scope.selectDriver = function (driver) {
        if (driver == undefined) {
            $scope.order.driver = null;
            $("#driver").val("-");
        } else {
            $scope.order.driver = { id: 0 };
            $scope.order.driver.id = driver.id;
            $("#driver").val("[" + driver.callsign + "] - " + driver.lastName + " " + driver.firstName + " " + driver.middleName);
        }
        dropdownHide("driver");
    };

    $scope.showIndicator = function (status) {
        $scope.isDisabled = status;
        $scope.isVisible = status;
        $scope.$apply();
    };

    $scope.formatPhones = function (phones) {
        phones = phones.split(',');

        var length;

        for (var i = 0; i < phones.length; i++) {
            phones[i] = phones[i].replace(/\s*/g, '');

            length = phones[i].length;

            switch (length) {
                case 6:
                    phones[i] = phones[i][0] + phones[i][1] + "-" + phones[i][2] + phones[i][3] + "-" + phones[i][4] + phones[i][5];
                    break;
                case 7:
                    phones[i] = phones[i][0] + phones[i][1] + phones[i][2] + "-" + phones[i][3] + phones[i][4] + "-" + phones[i][5] + phones[i][6];
                    break;
                case 11:
                    phones[i] = phones[i][0] + "-" + phones[i][1] + phones[i][2] + phones[i][3] + "-" + phones[i][4] + phones[i][5] + phones[i][6] + "-" + phones[i][7] + phones[i][8] + phones[i][9] + phones[i][10];
                    break;
                default:
                    console.log("Other");
                    break;
            }
        }

        $scope.order.customer.phone = phones.join(', ');

        console.log(phones);
    };

    //$scope.oldCustomerName = null;

    $scope.customerSearching = false;
    $scope.findCustomerByPhone = function () {
        var skip = 0;
        var take = 15;
        var phone = $scope.order.customer.phone.replace(/-/gi, '');
        //if ($scope.order.customer.name != null && $scope.order.customer.name != "") {
        //    $scope.oldCustomerName = $scope.order.customer.name.slice();
        //}

        $scope.labels = [];
        $scope.order.customer.name = "";
        $scope.customerLabels = [];
        $scope.fromAddressDetailses = [];
        $scope.toAddressDetailses = [];

        if (phone == null || phone == "") {
            return 0;
        }

        $scope.customerSearching = true;
        $.ajax({
            url: ApiServerUrl + "Customers?filterPhone=" + phone + "&skip=" + 0 + "&take=" + take,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            if (data.length == 0) {
                //$scope.setCustomerName($scope.oldCustomerName);
            } else {
                $scope.setCustomerName(data[0].name);
                $scope.getAddresses(data[0].id);
                LABEL_CUSTOMER_ID = data[0].id;
                $scope.initializationLabel(data[0].id);//labels initialization
                $scope.getCustomerLabel(data[0].id);
            }
            $scope.customerSearching = false;
            $scope.$apply();
        }).error(function (msg) {
            $scope.setCustomerName("");
            console.error(msg);

            $scope.customerSearching = false;
            $scope.$apply();
        });
    };


    $scope.setCustomerName = function (name) {
        $scope.order.customer.name = name;
        $scope.$apply();
    };

    $scope.fromAddressDetailses = [];
    $scope.toAddressDetailses = [];

    $scope.getAddresses = function (customerId) {
        console.log(customerId);
        $.ajax({
            url: ApiServerUrl + "Orders?customerId=" + customerId,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.fromAddressDetailses = [];
            $scope.toAddressDetailses = [];
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                if (data[i].fromAddressDetails.city != null) {
                    if (!IsAddrInArray($scope.fromAddressDetailses, data[i].fromAddressDetails))
                        $scope.fromAddressDetailses.push({ address: data[i].fromAddressDetails });
                }
                if (data[i].toAddressDetails.city != null) {
                    if (!IsAddrInArray($scope.toAddressDetailses, data[i].toAddressDetails))
                        $scope.toAddressDetailses.push({ address: data[i].toAddressDetails });
                }
            }
            $scope.$apply();
            if ($scope.fromAddressDetailses.length > 0 && $scope.toAddressDetailses.length > 0) {
                initialization("fromAddressDetails");
                initialization("toAddressDetails");
                //dropdownShow("fromAddressDetails");
                //dropdownShow("toAddressDetails");
            }
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.selectAddress = function (field, model) {
        switch (field) {
            case "fromAddressDetails":
                $scope.order.fromAddressDetails = model.address;
                break;
            case "toAddressDetails":
                $scope.order.toAddressDetails = model.address;
                break;
            default:
        }
        dropdownHide(field);
    };

    $scope.selectLabelFrom = null;
    $scope.selectLabelTo = null;

    $scope.labels = [];
    $scope.customerLabels = [];

    var LABEL_CUSTOMER_ID = null;

    $scope.getCustomerLabel = function (customerId) {
        $.ajax({
            url: ApiServerUrl + "CustomerAddresses?customerId=" + customerId,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.customerLabels = data;
            $scope.$apply();
        }).error(function (msg) {
            showNotification(msg);
        });
    };

    $scope.initializationLabel = function(customerId) {
        $.ajax({
            url: ApiServerUrl + "CustomerAddresses?customerId=" + customerId,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.labels = data;
            console.log($scope.labels);
            $scope.$apply();
        }).error(function (msg) {
            showNotification(msg);
        });
    };

    $scope.addLabel = function (label) {
        var isLabelExists = false;
        for (var i = 0; i < $scope.labels.length; i++) {
            if ($scope.customerLabels[i].name == label) {
                isLabelExists = true;
                break;
            }
        }

        if (isLabelExists) {
            showNotification('danger', "Ярлык с таким именем уже существует");
            return 0;
        }

        label = {
            name: label,
            address: LABEL_ADDRESS,
            customerId: LABEL_CUSTOMER_ID
        };
        console.log(label);
        if (label.address.city != "" && label.address.street != "") {
            $.ajax({
                url: ApiServerUrl + "CustomerAddresses",
                method: 'POST',
                data: label,
                headers: GetHeaders()
            }).success(function (data) {
                $scope.labels.push(data);
                $scope.getCustomerLabel(data.customerId);
                $scope.$apply();
            }).error(function (msg) {
                showNotification(msg);
            });
        } else {
            showNotification('danger',"Нельзя добавить ярлык с пустым адресом");
        }
    };

    var LABEL_ADDRESS = null;

    $scope.selectLabelModal = function (type) {
        switch (type) {
            case 'from':
                LABEL_ADDRESS = $scope.order.fromAddressDetails;
                break;
            case 'to':
                LABEL_ADDRESS = $scope.order.toAddressDetails;
                break;
            default:
        }
        $scope.showModal();
    };

    $scope.deleteLabel = function (label) {
        event.stopPropagation();
        if (confirm("Вы действительно хотите удалить ярлык " + label.name + "?")) {
            $.ajax({
                url: ApiServerUrl + "CustomerAddresses/" + label.id,
                method: 'DELETE',
                headers: GetHeaders()
            }).success(function (data) {
                $scope.initializationLabel(LABEL_CUSTOMER_ID);
                $scope.getCustomerLabel(LABEL_CUSTOMER_ID);
                console.log("DELETED");
                $scope.$apply();
            }).error(function (msg) {
                console.error(msg);
                showNotification('danger', msg);
            });
        } else {

        }
    };

    $scope.selectLabelFromModal = function (label) {
        if ($scope.customerLabels != undefined && $scope.customerLabels != null) {
            var isLabelExists = false;
            for (var i = 0; i < $scope.customerLabels.length; i++) {
                if ($scope.customerLabels[i].name == label.name) {
                    isLabelExists = true;
                    break;
                }
            }

            if (!isLabelExists) {
                $scope.customerLabels.push(label);
            }
        }
        $("#labelModal").modal('hide');
    };

    $scope.selectLabel = function (type, label) {
        switch (type) {
            case 'from':
                $scope.order.fromAddressDetails = label.address;
                $("#labelFrom .AddressLabel").text(label.name);
                $("#labelFrom .AddressLabel").removeAttr("ng-click");
                break;
            case 'to':
                $scope.order.toAddressDetails = label.address;
                $("#labelTo .AddressLabel").text(label.name);
                $("#labelTo .AddressLabel").removeAttr("ng-click");
                break;
            default:
        }
    };

    $scope.clearLabel = function (type) {
        switch (type) {
            case 'from':
                $scope.order.fromAddressDetails = null;
                $("#labelFrom .AddressLabel").text("нет ярлыка");
                $("#labelFrom .AddressLabel").attr("ng-click", "selectLabel('from',label)");
                break;
            case 'to':
                $scope.order.toAddressDetails = null;
                $("#labelTo .AddressLabel").text("нет ярлыка");
                $("#labelTo .AddressLabel").attr("ng-click", "selectLabel('to',label)");
                break;
            default:
        }
    };

    $scope.showModal = function () {
        $scope.labelQuery = "";
        $('#labelModal').modal({
            keyboard: false
        });
    };

    $scope.legalEntities = [];

    $scope.findCustomerByCodeword = function () {

        var codeword = $("#codeword").val();

        for (var i = 0; i < $scope.organizations.length; i++) {
            if (codeword == $scope.organizations[i].codeword) {
                $scope.organization = $scope.organizations[i].name;
                break;
            }
        }

        if (codeword != "") {
            $.ajax({
                url: ApiServerUrl + "Customers?organizationCodeword=" + codeword,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {
                $scope.legalEntities = data;
                $scope.$apply();
            }).error(function (msg) {
                console.error(msg);
            });
        }

    };

    $scope.organizations = [];

    $scope.getOrganizations = function() {
        $.ajax({
            url: ApiServerUrl + "Organization",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.organizations = data;
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.selectOrganization = function () {
        var organization = $scope.organization;
        for (var i = 0; i < $scope.organizations.length; i++) {
            var name = $scope.organizations[i].name;
            if (organization == name) {
                $("#codeword").val($scope.organizations[i].codeword);
                break;
            }
        }
        $scope.findCustomerByCodeword();
    };

    $scope.selectCustomer = function (order) {
        var customer = $scope.legalEntity;
        customer = customer.split(": ");
        order.customer = {
            phone: customer[0],
            name: customer[1]
        };
        $scope.findCustomerByPhone();
        console.log(order);
    };
});

var errorStatus = {
    "orderDTO.Customer.Name": { id: "customerName", message: "Поле \"Имя Клиента\" должно содержать буквы русского алфавита" },
    "orderDTO.Customer.Phone": { id: "customerPhone", message: "Поле \"Телефоны\" должно содержать цифры" },
    "orderDTO.DepartureDate": { id: "departureDate", message: "Неверный формат даты" }
}

function convertStringToDate(date, time) {
    time = time.split(':');
    date = date.split('.');
    return date[2] + "-" + date[1] + "-" + date[0] + "T" + time[0] + ":" + time[1];
}

function convertDateToString(data) {
    var d = data.split('T');
    var time = d[1].split(':');
    var date = d[0].split('-');
    var dd = new Array();
    dd.push(date[2] + "." + date[1] + "." + date[0]);
    dd.push(time[0]+':'+time[1]);
    return  dd;
}

function IsAddrInArray(array, addr) {
    for (var i = 0; i < array.length; i++) {
        var isEquals = true;
        for (var x in array[i].address) {
            if (addr[x] != array[i].address[x]) {
                isEquals = false;
            }
        }
        if (isEquals)
            return true;
    }
    return false;
}