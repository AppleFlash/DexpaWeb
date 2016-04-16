DexpaApp.controller('ReportsCtrl', ['$scope', '$controller', function ($scope, $http, $filter) {

    getOrderStates();
    getWorkConditions();
    getOrderSources();

    initialization("driver"); //dropdownPanel events initialization

    $scope.yearList = [];

    $scope.filterOrderState = {
        name: "Завершен",
        type: 5
    };

    $scope.filterOrderSource = null;

    $scope.init = function (report) {
        var toDate = new Date();
        var year = toDate.getFullYear();
        var month = toDate.getMonth();
        var day = toDate.getDate();
        toDate = moment().format("YYYY-MM-DDTHH:mm:ss");
        var fromDate = new Date(moment([year, month, day]).subtract("days", 1));
        fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
        jQuery('#filterFromDate').val(fromDate);
        jQuery('#filterToDate').val(toDate);
        $scope.getDrivers();
        $scope.driverQuery = "-";
        dropdownHide("driver");
        switch (report) {
            case "drivers":
                $scope.datapickerInit(fromDate, toDate);
                $scope.getDriversReport(fromDate, toDate);
                break;
            case "orders":
                $scope.filterMonthFrom = 1;
                $scope.filterMonthTo = 12;
                var year = new Date();
                $scope.filterYear = year.getFullYear();
                for (var i = 2010; i < 2021; i++) {
                    $scope.yearList.push(i);
                }
                var fromDate = new Date();
                fromDate = moment([fromDate.getFullYear(), "00", "01"]).format("YYYY-MM-DDTHH:mm:ss");
                var toDate = new Date();
                toDate = moment([toDate.getFullYear(), "11", "01"]).format("YYYY-MM-DDTHH:mm:ss");
                $scope.getOrdersReport(fromDate, toDate);
                break;
            case "dispatchers":
                $scope.getDispatchersReport();
                break;
            case "allOrders":
                $scope.datapickerInit(fromDate, toDate);
                $scope.getAllOrdersReport(fromDate, toDate, $scope.selectedDriver, $scope.filterOrderState, $scope.filterOrderSource);
                break;

            case "organizationsOrders":
                $scope.getOrganizationsOrders();
                break;
            case "yandex-orders":
                $scope.getDrivers();
                $("#loader").hide();
                $("#main_part").show();
                var datetimepickerOptions = {
                    lang: 'ru',
                    format: 'd.m.Y H:i',
                    dayOfWeekStart: 1,
                    validateOnBlur: false,
                    mask: true,
                    onSelectDate: function () {
                        $scope.fromDate = jQuery('#filterFromDate').val();
                        $scope.toDate = jQuery('#filterToDate').val();
                        $scope.getYandexReport();
                    }
                };
                jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
                jQuery('#filterToDate').datetimepicker(datetimepickerOptions);
                var toDate = new Date();
                var year = toDate.getFullYear();
                var month = toDate.getMonth();
                var day = toDate.getDate();
                $scope.fromDate = moment([year, month, day]).subtract("days", 1).format('DD.MM.YYYY HH:mm');
                $scope.toDate = moment([year, month, day]).add("days", 1).format('DD.MM.YYYY HH:mm');
                $scope.selectedDriverId = null;
                $scope.driver = "-";
                $scope.getYandexReport();
                break;

            case "driver-time":
                var datetimepickerOptions = {
                    lang: 'ru',
                    format: 'd.m.Y',
                    dayOfWeekStart: 1,
                    validateOnBlur: false,
                    mask: true,
                    onSelectDate: function () {
                        $scope.fromDate = jQuery('#filterFromDate').val();
                        $scope.toDate = jQuery('#filterToDate').val();
                        $scope.getDriverTimeReport();
                    }
                };
                jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
                jQuery('#filterToDate').datetimepicker(datetimepickerOptions);
                var toDate = new Date();
                var year = toDate.getFullYear();
                var month = toDate.getMonth();
                var day = toDate.getDate();
                $scope.fromDate = moment([year, month, day]).format('DD.MM.YYYY');
                $scope.toDate = moment([year, month, day]).add("days", 1).format('DD.MM.YYYY');
                $scope.getDriverTimeReport();
                break;
            case "rating":
                $scope.getRatingReport();
                break;
            default:
        }
    };

    $scope.getRatingReport = function () {
        var url = ApiServerUrl + "report/GetRatingReport";
        if ($scope.selectedDriver != null) {
            url += "?driverId=" + $scope.selectedDriverId;
        }
        $.ajax({
            url: url,
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    $scope.getDriverTimeReport = function() {
        var fromDate = formatDate($scope.fromDate);
        var toDate = formatDate($scope.toDate);
        if ($scope.selectedDriver == null) {
            $scope.firstColumnName = "Водитель";
            $scope.secondColumnName = "Среднее время в сутки, часов";
        } else {
            $scope.firstColumnName = "Дата";
            $scope.secondColumnName = "Время, часов";
        }
        $.ajax({
            url: ApiServerUrl + "report/GetDriverTimeReport?dateFrom=" + fromDate + "&dateTo=" + toDate + "&driverId=" + $scope.selectedDriverId,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            if ($scope.selectedDriver == null) {
                for (var i = 0; i < data.length; i++) {
                    data[i].firstColumn = data[i].driverName;
                }
            } else {
                for (var i = 0; i < data.length; i++) {
                    data[i].firstColumn = dateToNormal(data[i].date);
                }
            }
            for (var i = 0; i < data.length; i++) {
                if (data[i].freeTime == 0 && data[i].onOrderTime == 0) {
                    data[i].efficiency = "-";
                }
            }
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function(msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    function dateToNormal(date) {
        var bufferDate = date.split('T');
        var bufferDate = bufferDate[0].split('-');
        return bufferDate[2] + "." + bufferDate[1] + "." + bufferDate[0];
    }

    $scope.datapickerInit = function (fromDate, toDate) {
        $scope.fromDate = moment(fromDate).format("DD.MM.YYYY");
        $scope.toDate = moment(toDate).format("DD.MM.YYYY");
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y',
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false,
            mask: true,
            onSelectDate: function () {
                fromDate = $("#filterFromDate").val();
                toDate = $("#filterToDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
                console.log(fromDate + " - " + toDate);
            }
        };
        jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterToDate').datetimepicker(datetimepickerOptions);

        jQuery('#searchFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#searchToDate').datetimepicker(datetimepickerOptions);
    };

    $scope.reports = [];

    $scope.getYandexReport = function () {
        $("#reportLoader").show();
        $scope.reports = [];
        var dateFrom = formatDateTime($scope.fromDate);
        var dateTo = formatDateTime($scope.toDate);
        var urlData = {
            driverId: $scope.selectedDriverId,
            dateTimeFrom:dateFrom,
            dateTimeTo: dateTo
        };
        $.ajax({
            url: ApiServerUrl + 'report/GetYandexOrdersReport',
            method: 'GET',
            data: urlData,
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = [];
            $scope.reports.push(data);
            $scope.$apply();
            $("#reportLoader").hide();
        }).error(function (msg) {
            $("#reportLoader").hide();
            console.error(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    function formatDateTime(date) {
        if (date != null) {
            date = date.split(' ');
            var bufferDate = date[0].split('.');
            bufferDate = bufferDate[2] + "-" + bufferDate[1] + "-" + bufferDate[0];
            return bufferDate + "T" + date[1];
        }
    }

    function formatDate(date) {
        if (date != null) {
            var date = date.split('.');
            return date[2] + "-" + date[1] + "-" + date[0];
        }
    }


    $scope.getDriversReport = function (fromDate, toDate) {
        //$scope.selectedWorkCondition = "Все";
        $scope.reports = [];
        $("#loader").show();
        var url = ApiServerUrl + 'report/GetDriversReport?dateTimeFrom=' + fromDate + '&dateTimeTo=' + toDate;
        if ($scope.selectedDriverId != null) {
            url += "&driverId=" + $scope.selectedDriverId;
        }
        if ($scope.workConditionId != null) {
            url += "&workConditionsId=" + $scope.workConditionId;
        }
        $.ajax({
            url: url,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverCount = data.length;
            $scope.allAmount = 0;
            $scope.rentAmount = 0;
            $scope.techSupportAmount = 0;
            $scope.taxometrAmount = 0;
            $scope.allOrdersCount = 0;
            $scope.doneOrdersCount = 0;
            $scope.clientCanceledOrdersCount = 0;
            $scope.driverCanceledOrdersCount = 0;
            for (var i = 0; i < data.length; i++) {
                $scope.allAmount += parseFloat(data[i].amount);
                $scope.rentAmount += parseFloat(data[i].rent);
                $scope.techSupportAmount += parseFloat(data[i].techSupport);
                $scope.taxometrAmount += parseFloat(data[i].taxometrAmount);
                $scope.allOrdersCount += parseInt(data[i].allOrders);
                $scope.doneOrdersCount += parseInt(data[i].doneOrders);
                $scope.clientCanceledOrdersCount += parseInt(data[i].clientCanceled);
                $scope.driverCanceledOrdersCount += parseInt(data[i].driverCanceled);
            }
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    $scope.formatWC = function(wc) {
        return wc.name;
    }

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.getAllOrdersReport = function (fromDate, toDate, driver, state, source) {
        $scope.reports = [];
        $("#loader").show();
        var driverQuery = "";
        if (driver != null)
            driverQuery = '&driverId=' + driver.id;

        var stateQuery = "";
        if (state != null && state.type != 999)
            stateQuery = '&state=' + state.type;

        var sourceQuery = "";
        if (source !=null && source.source != 999)
            sourceQuery = '&source=' + source.source;

        var completeOnly = '&completeOnly=true';

        $.ajax({
            url: ApiServerUrl + 'report/AllOrdersReport/Light?dateTimeFrom=' + fromDate + '&dateTimeTo=' + toDate + driverQuery + stateQuery + sourceQuery + completeOnly,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = formatOrdersReport(data);
            $scope.$apply();

            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    function formatOrdersReport(data) {
        for (var i = 0; i < data.length; i++) {
            data[i].customer = {
                name: data[i].cutomerName,
                phone: data[i].customerPhone
            };
            data[i].driver = {
                name: data[i].driverName,
                callsign: data[i].driverCallsign,
                phones: data[i].driverPhone
            };

            for (var j = 0; j < $scope.orderStatesList.length; j++) {
                if (data[i].state == $scope.orderStatesList[j].type) {

                    data[i].driverApproved = false;

                    var oState = data[i].state;
                    if (oState == 3 || oState == 4 || oState == 2 || oState == 5 || oState == 7 || oState == 8) {
                        data[i].driverApproved = true;
                    }

                    data[i].state = {
                        name: $scope.orderStatesList[j].name,
                        type: $scope.orderStatesList[j].type
                    };
                }
            }
        }
        return data;
    }

    $scope.getOrdersReport = function (fromDate, toDate) {
        $scope.exportFromDate = fromDate;
        $scope.exportToDate = toDate;
        console.log(ApiServerUrl + 'report/GetOrdersReport?dateFrom=' + fromDate + "&dateTo=" + toDate);
        $.ajax({
            url: ApiServerUrl + 'report/GetOrdersReport?dateFrom=' + fromDate + "&dateTo=" + toDate,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    $scope.getDispatchersReport = function () {
        $.ajax({
            url: ApiServerUrl + 'report/GetDispatcherReport',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };
    
    $scope.getOrganizationsOrders = function() {
        $.ajax({
            url: ApiServerUrl + 'report/GetOrganizationOrdersReport',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };


    /*START SORTING*/

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.reports, orderBy);
        $scope.reports = sortBy(predicate);
    };

    /*END SORTING*/

    $scope.drivers = [];

    $scope.getDrivers = function () {
        $.ajax({
            url: ApiServerUrl + 'Drivers/SimpleDriversList',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.drivers = data;
            $scope.driverQuery = "";
            $("#driver").val("");
            $scope.$apply();
            dropdownLoaderHide();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.selectedDriver = null;
    $scope.selectedDriverId = null;

    $scope.selectDriver = function (driver, isDriverChange) {
        if (isDriverChange) {
            if (driver == undefined) {
                $scope.selectedDriver = null;
                $scope.selectedDriverId = null;
                $scope.driverQuery = "-";
                $("#driver").val("-");
            } else {
                $scope.selectedDriver = driver;
                $scope.selectedDriverId = driver.id;
                $("#driver").val($scope.selectedDriver.name);
            }
            dropdownHide("driver");
        }
    };

    $scope.oldReport = [];

    $scope.getReportByDriver = function (driver, isDriverChange) {
        $scope.selectDriver(driver, isDriverChange);

        var fromDate = $("#filterFromDate").val();
        var toDate = $("#filterToDate").val();
        fromDate = fromDate.split('.');
        fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
        toDate = toDate.split('.');
        toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
        $scope.getDriversReport(fromDate, toDate);
        /*if (driver == null) {
            if ($scope.oldReport.length != 0) {
                $scope.reports = $scope.oldReport;
                $("#driver").val("");
                showDropDown = false;
                dropdownHide("driver");
                $("#driver").val("Все");
            }
        } else {
            if ($scope.oldReport.length == 0) {
                $scope.oldReport = $scope.reports;
            } else {
                $scope.reports = $scope.oldReport;
            }
            var reports = [];
            $scope.selectDriver(driver, false);
            driver = $("#driver").val();
            console.log(driver);
            driver = driver.split('-');
            driver = driver[1].trim();
            for (var i = 0; i < $scope.reports.length; i++) {
                var report = $scope.reports[i];
                var name = report.driverName;
                if (driver == name) {
                    reports.push(report);
                }
            }
            $scope.reports = [];
            $scope.reports = reports;
            console.log($scope.reports);
        }*/
    };

    $scope.workConditions = [];

    function getWorkConditions() {
        $.ajax({
            url: ApiServerUrl + 'DriverWorkConditions',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.workConditions = data;
            $scope.selectedWorkCondition = 'Все';
            $scope.workConditions.unshift({ name: 'Все' });
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.orderSourcesList = [];

    function getOrderSources() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/OrdersSources',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.orderSourcesList.push({
                source: 999,
                name: "Все"
            });
            $scope.orderSourcesList = $scope.orderSourcesList.concat(data);
            $scope.filterOrderSource = $scope.orderSourcesList[0];
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.orderStatesList = [];
    
    function getOrderStates() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/OrdersStates',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.orderStatesList.push({
                type: 999,
                name: "Все"
            });
            $scope.orderStatesList = $scope.orderStatesList.concat(data);
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.getDriversReportDate = function() {
        var fromDate = $("#filterFromDate").val();
        var toDate = $("#filterToDate").val();
        fromDate = fromDate.split('.');
        fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
        toDate = toDate.split('.');
        toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
        $scope.getDriversReport(fromDate, toDate);
    }

    $scope.oldReports = [];

    $scope.workCondition = null;
    $scope.workConditionId = null;

    $scope.filterByWC = function () {
        console.log($scope.selectedWorkCondition);
        if ($scope.selectedWorkCondition==null) {
            $scope.workConditionId = null;
        } else {
            //for (var i = 0; i < $scope.workConditions.length; i++) {
            //    if ($scope.selectedWorkCondition == $scope.workConditions[i].name) {
            //        $scope.workConditionId = $scope.workConditions[i].id;
            //    }
            //}
            $scope.workConditionId = $scope.selectedWorkCondition.id;
        }
        var fromDate = $("#filterFromDate").val();
        var toDate = $("#filterToDate").val();
        fromDate = fromDate.split('.');
        fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
        toDate = toDate.split('.');
        toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
        $scope.getDriversReport(fromDate, toDate);
        //if ($scope.selectedWorkCondition == "Все") {
        //    if ($scope.oldReports.length != 0) {
        //        $scope.reports = $scope.oldReports;
        //    }
        //} else {
        //    if ($scope.oldReports.length == 0) {
        //        $scope.oldReports = $scope.reports;
        //    } else {
        //        $scope.reports = $scope.oldReports;
        //    }
        //    var reports = [];
        //    for (var i = 0; i < $scope.reports.length; i++) {
        //        var report = $scope.reports[i];
        //        var workConditions = report.driverWorkConditions;
        //        console.log(workConditions);
        //        console.log($scope.selectedWorkCondition);
        //        if ($scope.selectedWorkCondition == workConditions) {
        //            reports.push(report);
        //        }
        //    }
        //    $scope.reports = [];
        //    $scope.reports = reports;
        //}
        //console.log($scope.oldWC);
        //console.log($scope.workConditions);
    };

    $scope.filterOrderReport = function (type) {
        var year = $scope.filterYear;
        var monthFrom = $scope.filterMonthFrom;
        monthFrom--;
        var monthTo = $scope.filterMonthTo;
        monthTo--;
        var fromDate = moment([year, monthFrom, "01"]).format("YYYY-MM-DDTHH:mm:ss");
        var toDate = moment([year, monthTo, "01"]).format("YYYY-MM-DDTHH:mm:ss");
        $scope.exportFromDate = fromDate;
        $scope.exportToDate = toDate;
        $scope.getOrdersReport(fromDate, toDate);
    };

    $scope.filterAllOrderReport = function (driver, isDriverChange) {
        $scope.selectDriver(driver, isDriverChange);

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
        $scope.getAllOrdersReport(fromDate, toDate, $scope.selectedDriver, $scope.filterOrderState, $scope.filterOrderSource);
    };

    function convertStringToDate(currentDate) {
        currentDate = currentDate.split('.');
        currentDate = new Date(currentDate[2], currentDate[1], currentDate[0]);
        return currentDate.setMonth(currentDate.getMonth() - 1);
    }

    function convertDateToString(currentDate) {
        currentDate = currentDate.split('-');
        return currentDate[2].split('T')[0] + "." + currentDate[1] + "." + currentDate[0];
    }

    $scope.exportOrderURL = "";
    $scope.exportDriverURL = "";
    $scope.exportAllOrderURL = "";
    $scope.exportFromDate = "";
    $scope.exportToDate = "";
    $scope.exportConvertOrderDate = false;

    $scope.Export = function (type, reportType) {
        var token = GetHeaders().Authorization;
        var url;
        switch (reportType) {
            case 'orders':
                /*if (!$scope.exportConvertOrderDate) {
                    $scope.exportFromDate = moment($scope.exportFromDate).format("YYYY-DD-MMTHH:mm:ss");
                    $scope.exportToDate = moment($scope.exportToDate).format("YYYY-DD-MMTHH:mm:ss");
                    $scope.exportConvertOrderDate = true;
                }*/
                url = $scope.exportOrderURL = "/Admin/ExportOrderReport?Type=" + type + "&dateFrom=" + $scope.exportFromDate + "&dateTo=" + $scope.exportToDate+"&token="+token;
                break;
            case 'drivers':
                var fromDate = $("#filterFromDate").val();
                var toDate = $("#filterToDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];

                //var driver = $("#driver").val();
                //var WC = $scope.selectedWorkCondition;
                //if (driver != null && driver != "-" && driver != "") {
                //    driver = driver.split('-');
                //    driver = driver[1].trim();
                //    $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + "&driver=" + driver;
                //} else {
                //    $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate;
                //}
                //if (WC != null && WC != "Все" && WC != "") {
                //    $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + "&workConditions=" + WC;
                //}
                //if (driver != null && driver != "Все" && driver != "" && WC != null && WC != "Все" && WC != "") {
                //    $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + "&driver=" + driver + "&workConditions=" + WC;
                //}
                $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + "&driver=" + $scope.selectedDriverId + "&workConditions=" + $scope.workConditionId + "&token=" + token;
                url = $scope.exportDriverURL;
                break;
            case 'allOrders':
                var fromDate = $("#filterFromDate").val();
                var toDate = $("#filterToDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];

                var driverQuery = "";
                if ($scope.selectedDriver != null)
                    driverQuery = '&driverId=' + $scope.selectedDriver.id;

                var stateQuery = "";
                if ($scope.filterOrderState != null && $scope.filterOrderState.type != 999)
                    stateQuery = '&stateType=' + $scope.filterOrderState.type;

                var sourceQuery = "";
                if ($scope.filterOrderSource != null && $scope.filterOrderSource.source != 999)
                    sourceQuery = '&sourceType=' + $scope.filterOrderSource.source;

                $scope.exportAllOrderURL = '/Admin/ExportAllOrdersReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + driverQuery + stateQuery + sourceQuery + "&token=" + token;

                url = $scope.exportAllOrderURL;
                break;
            case 'organizationOrders':
                url = "/Admin/ExportOrganizationOrderReport?Type=" + type + "&token=" + token;
                break;
            case 'driver-time':
                var fromDate = $("#filterFromDate").val();
                var toDate = $("#filterToDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
                url = "/Admin/ExportDriverTimeReport?type=" + type + "&fromDate=" + fromDate + "&toDate=" + toDate;
                if ($scope.selectDriver != null) {
                    url += "&driverId=" + $scope.selectedDriverId;
                }
                url += "&token=" + token;
                break;
            default:
        }
        window.open(url);
    };

    $scope.convertDateTime = function (date) {
        if (date !== undefined && date !== null) {
            var bufDate = date.split('T');
            var bufTime = bufDate[1];
            bufDate = bufDate[0].split('-');
            date = bufDate[2] + "." + bufDate[1] + "." + bufDate[0] + " " + bufTime;
            return date;
        }
    };

    $scope.convertTime = function(time) {
        if (time !== undefined && time !== null) {
            var bufDate = time.split('T');
            var bufTime = bufDate[1].split(':');
            bufTime = new Date(0, 0, 0, bufTime[0], bufTime[1], bufTime[2]);
            bufTime = (bufTime.getHours() < 10 ? "0" + bufTime.getHours() : bufTime.getHours()) + ":" + (bufTime.getMinutes() < 10 ? "0" + bufTime.getMinutes() : bufTime.getMinutes()) + ":" + (bufTime.getSeconds() < 10 ? "0" + bufTime.getSeconds() : bufTime.getSeconds());
            time = bufTime;
            return time;
        }
    };

    //---------Orders Search----------------
    var isSearch = false;
    $("#searchPanel").hide();

    $scope.searchObj = {
        orderId: "",
        cusPhone: "",
        fromAddr:""
    };

    $scope.openCloseSearchPanel = function() {
        if (isSearch) {
            isSearch = false;
            $("#filterPanel").show(200);
            $("#searchPanel").hide(200);
            $scope.filterAllOrderReport();
        } else {
            isSearch = true;
            $("#searchPanel").show(200);
            $("#filterPanel").hide(200);
            $scope.searchAllOrderReport();
        }
    }

    $scope.searchAllOrderReport = function() {
        if (jQuery('#searchFromDate').val() == "" || jQuery('#searchToDate').val() == "") {
            var toDate = new Date();
            var year = toDate.getFullYear();
            var month = toDate.getMonth();
            var day = toDate.getDate();
            toDate = moment().format("YYYY-MM-DDTHH:mm:ss");
            var fromDate = new Date(moment([year, month, day]).subtract("days", 1));
            fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
            jQuery('#searchFromDate').val(convertDateToString(fromDate));
            jQuery('#searchToDate').val(convertDateToString(toDate));
        } else {
            toDate = convertStringToDate(jQuery('#searchToDate').val());
            toDate = moment(toDate).format("YYYY-MM-DDTHH:mm:ss");
            fromDate = convertStringToDate(jQuery('#searchFromDate').val());
            fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
        }

        $scope.searchObj.dateTimeFrom = fromDate;
        $scope.searchObj.dateTimeTo = toDate;

        $scope.reports = [];

        $("#loader").show();

        $.ajax({
            url: ApiServerUrl + "report/SearchOrdersReport/Light",
            method: 'POST',
            data: $scope.searchObj,
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = formatOrdersReport(data);
            $scope.$apply();

            $("#loader").hide();
        }).error(function (msg) {
            $("#loader").hide();
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    }

    //--------------------------------------
}]);