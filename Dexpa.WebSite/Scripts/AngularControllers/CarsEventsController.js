DexpaApp.controller('CarEventsCtrl', function ($scope, $http, $filter) {

    var currentUser;
    var isUpdate = false;

    $scope.car = {};
    $scope.repair = {};
    $scope.event = {};

    $scope.repairs = [];
    $scope.report = []; //all events

    $scope.selectedEvent = {};

    $scope.initAllCarEvents = function (carId) {
        $scope.getCar(carId, false);
        $scope.getAllCarEvents(carId);
    }

    $scope.initRepairs = function(carId) {
        $scope.getCar(carId, false);
        $scope.getCarRepairs(carId);
    }

    $scope.InitAddRepair = function (carId, userName) {
        $scope.repair.implementedByLogin = userName;
        $scope.getCar(carId, true);
    }

    $scope.InitEditRepair = function (repId, userName) {
        isUpdate = true;
        currentUser = userName;
        getRepair(repId);
    }

    $scope.InitAddCarEvent = function (carId, userName) {
        $scope.event.implementedByLogin = userName;
        $scope.getCar(carId, false);
    }

    $scope.InitEditCarEvent = function (eventId, userName) {
        currentUser = userName;
        getCarEvent(eventId);
    }

    $scope.selectEvent = function (event) {
        $scope.selectedEvent.isSelected = false;

        if ($scope.selectedEvent.id == event.id) {
            $scope.selectedEvent = {};
        } else {
            $scope.selectedEvent = event;
            $scope.selectedEvent.isSelected = true;
        }
    }

    $scope.getAllCarEvents = function (carId) {
        if (carId != null) {
            $.ajax({
                url: ApiServerUrl + 'CarEventReport?carId=' + carId,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {
                $scope.report = data;
                $scope.$apply();
            }).error(function (msg) {
                showNotification('danger', "Ошибка при получении данных");
                console.error(msg);
            });
        }
    }

    $scope.getCarRepairs = function (carId) {
        if (carId != null) {
            $.ajax({
                url: ApiServerUrl + 'Repairs?carId=' + carId,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {
                $scope.repairs = data;
                $scope.$apply();
            }).error(function (msg) {
                showNotification('danger', "Ошибка при получении данных");
                console.error(msg);
            });
        }
    }

    function getRepair(repId) {
        if (repId != null) {
            $.ajax({
                url: ApiServerUrl + 'Repairs/' + repId,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {
                $scope.repair = data;
                $scope.getCar(data.carId, true);
                $scope.$apply();
            }).error(function (msg) {
                showNotification('danger', "Ошибка при получении данных");
                console.error(msg);
            });
        }
    };

    function getCarEvent(eventId) {
        if (eventId != null) {
            $.ajax({
                url: ApiServerUrl + 'CarEvent/' + eventId,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {
                $scope.event = data;
                $scope.getCar(data.carId, false);
                $scope.$apply();
            }).error(function (msg) {
                showNotification('danger', "Ошибка при получении данных");
                console.error(msg);
            });
        }
    };

    $scope.getCar = function (carId, isGetDrivers) {
        if (carId != null) {
            $.ajax({
                url: ApiServerUrl + 'Car/' + carId,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {
                $scope.car = data;

                $scope.repair.carId = carId;
                $scope.event.carId = carId;
                $scope.$apply();
                if (isGetDrivers)
                    getDrivers();

            }).error(function (msg) {
                showNotification('danger', "Ошибка при получении данных");
                console.error(msg);
            });
        }
    };

    function getDrivers() {
        var drivers = $.ajax({
            url: ApiServerUrl + "Drivers",
            method: 'GET',
            headers: GetHeaders()
        });
        drivers.success(function (result) {
            $scope.drivers = result;

            if (isUpdate) {
                $scope.setSelectedDriver(GetDriverById($scope.repair.guiltyDriverId));
            } else {
                $scope.setSelectedDriver(GetDriverByCar($scope.car.id));
            }
            $scope.$apply();
        }).error(function (error) {
            console.log(error);
        });
    }

    $scope.addRepair = function (repair) {
        if (validateForm("addRepairForm")) {
            $.ajax({
                url: ApiServerUrl + 'Repairs',
                method: 'POST',
                data: repair,
                headers: GetHeaders()
            }).success(function (data) {
                uploadFiles(data.id, repair.carId);
            }).error(function (msg) {
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
            });
        } else {
            console.error(false);
        }
    };

    $scope.updateRepair = function (repair) {
        if (validateForm("editRepairForm")) {
            repair.implementedByLogin = currentUser;
            $.ajax({
                url: ApiServerUrl + 'Repairs/' + repair.id,
                method: 'PUT',
                data: repair,
                headers: GetHeaders()
            }).success(function (data) {
                uploadFiles(data.id, repair.carId);
            }).error(function (msg) {
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
            });
        } else {
            console.error(false);
        }
    };

    $scope.addEvent = function (event) {
        if (validateForm("addEventForm")) {
            $.ajax({
                url: ApiServerUrl + 'CarEvent',
                method: 'POST',
                data: event,
                headers: GetHeaders()
            }).success(function (data) {
                document.location.href = "/CarEvents/Index/" + data.carId;
            }).error(function (msg) {
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
            });
        } else {
            console.error(false);
        }
    };

    $scope.updateCarEvent = function (event) {
        if (validateForm("editCarEventForm")) {
            event.implementedByLogin = currentUser;
            $.ajax({
                url: ApiServerUrl + 'CarEvent/' + event.id,
                method: 'PUT',
                data: event,
                headers: GetHeaders()
            }).success(function (data) {
                document.location.href = "/CarEvents/Index/" + data.carId;
            }).error(function (msg) {
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
            });
        } else {
            console.error(false);
        }
    };

    $scope.removeRepair = function() {
        $.ajax({
            url: ApiServerUrl + "Repairs/" + $scope.selectedEvent.id,
            method: 'DELETE',
            headers: GetHeaders()
        }).success(function () {
            for (var i = 0; i < $scope.repairs.length; i++) {
                if ($scope.selectedEvent.id == $scope.repairs[i].id) {
                    $scope.repairs.splice(i, 1);
                    $scope.selectedEvent = {};
                    $scope.$apply();
                    return;
                }
            }
        }).error(function (msg) {
            var error = errorHandling(msg);
            showNotification('danger', error);
            console.error(msg);
        });
        $('#deleteModal').modal('hide');
    }

    $scope.isRemoveRepair = false;
    $scope.isRemoveEvent = false;

    $scope.removeEventModal = function() {
        $scope.isRemoveEvent = true;
        $('#deleteModalLabel').text("Удаление");
        $('#deleteModalText').text("Вы действительно хотите удалить событие ТС?");
        $('#deleteModal').modal();
    };

    $scope.removeRepairModal = function() {
        $scope.isRemoveRepair = true;
        $('#deleteModalLabel').text("Удаление");
        $('#deleteModalText').text("Вы действительно хотите удалить данные о ремонте ТС?");
        $('#deleteModal').modal();
    };

    $scope.DeletePositiveAnswer = function() {
        if ($scope.isRemoveEvent) {
            $scope.removeEvent();
            $scope.isRemoveEvent = false;
        }
        if ($scope.isRemoveRepair) {
            $scope.removeRepair();
            $scope.isRemoveRepair = false;
        }
    };

    $scope.removeEvent = function () {
        var eventType = "";
        var eventId = "";
        if ($scope.selectedEvent.repairId == null) {
            eventType = "CarEvent";
            eventId = $scope.selectedEvent.carEventId;
        } else {
            eventType = "Repairs";
            eventId = $scope.selectedEvent.repairId;
        }

        $.ajax({
            url: ApiServerUrl + eventType + '/' + eventId,
            method: 'DELETE',
            headers: GetHeaders()
        }).success(function () {
            var array;
            if ($scope.repairs.length == 0) {
                array = $scope.report;
            } else {
                array = $scope.repairs;
            }

            for (var i = 0; i < array.length; i++) {
                if ($scope.selectedEvent.id == array[i].id) {
                    array.splice(i, 1);
                    $scope.selectedEvent = {};
                    $scope.$apply();
                    return;
                }
            }
        }).error(function (msg) {
            var error = errorHandling(msg);
            showNotification('danger', error);
            console.error(msg);
        });
        $('#deleteModal').modal('hide');
    };

    $scope.isdropDownShow = false;
    $scope.openCloseDriverPanel = function (event) {
        if ($scope.isdropDownShow) {
            dropdownHide("driver");
            $scope.isdropDownShow = false;
        } else {
            var elem = $(event.target);
            $("#driversPanel").css({ top: (elem.position().top + elem.outerHeight(true)) + "px" });
            dropdownShow("driver");
            $scope.isdropDownShow = true;
        }
    }

    $scope.setSelectedDriver = function(driver) {
        if (driver == undefined) {
            $scope.repair.guiltyDriverId = null;
            $("#driver").val("-");
        } else {
            $scope.repair.guiltyDriverId = driver.id;
            $("#driver").val($scope.driverToString(driver));
        }
        dropdownHide("driver");
        $scope.isdropDownShow = false;
    };

    function GetDriverByCar(carId) {
        for (var i = 0; i < $scope.drivers.length; i++) {
            if ($scope.drivers[i].car != null && $scope.drivers[i].car.id == carId)
                return $scope.drivers[i];
        }
        return undefined;
    }

    function GetDriverById(driverId) {
        for (var i = 0; i < $scope.drivers.length; i++) {
            if ($scope.drivers[i].id != null && $scope.drivers[i].id == driverId)
                return $scope.drivers[i];
        }
        return undefined;
    }

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.convertDateTime = function(data) {
        if (data != undefined && data != null && data != "") {
            var d = convertDateToString(data);
            return d[0] + " " + d[1];
        } else {
            return "";
        }
    };

    $scope.driverToString = function (driver) {
        if (driver === undefined || driver === null) {
            return "-";
        }

        var callSign = driver.callsign === null ? "" : driver.callsign;

        return "[" + callSign + "] - " + driver.lastName + " " + driver.firstName + " " + driver.middleName;
    }

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

// file upload block----------------
function uploadFiles(repairId, carId) {
    var url = ApiServerUrl + '/Content/?uploadContext=6@' + repairId;

    var fileSelect = document.getElementById('file-select');
    var files = fileSelect.files;

    if (files.length > 0) {
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            if (!file.type.match('image.*')) {
                continue;
            }
            formData.append('files[]', file, file.name);
        }

        $.ajax({
            url: url, //Server script to process data
            type: 'POST',
            headers: GetHeaders(),
            xhr: function () {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) { // Check if upload property exists

                }
                return myXhr;
            },
            success: function (data) {
                console.log(data);
                if (data.message != null) {
                    showNotification('danger', "Возникла ошибка при добавлении фотографии. Данные ремонта успешно обновлены.");
                } else {
                    document.location.href = "/CarEvents/Repairs/" + carId;
                }
            },
            error: function (err) {
                showNotification('danger', "Возникла ошибка при добавлении фотографии. Данные ремонта успешно обновлены.");
                console.log(err);
            },
            // Form data
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            contentType: false,
            processData: false
        });
    } else {
        document.location.href = "/CarEvents/Repairs/" + carId;
    }
}
