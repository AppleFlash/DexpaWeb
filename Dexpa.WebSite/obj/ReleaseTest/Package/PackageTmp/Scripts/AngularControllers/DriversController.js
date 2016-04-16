DexpaApp.directive('numbersanddash', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                // this next if is necessary for when using ng-required on your input. 
                // In such cases, when a letter is typed first, this parser will be called
                // again, and the 2nd time, the value will be undefined
                if (inputValue == undefined) return '';
                var transformedInput = inputValue.replace(/[^0-9\-\,]/g, '');
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
});

DexpaApp.controller('DriverCtrl', function ($scope, $http, $filter) {
    $scope.initEditDriver = initEditDriver;
    $scope.initAddDriver = initAddDriver;

    $scope.getDriver = getDriver;
    $scope.getWorkConditions = getWorkConditions;

    $scope.workConditionsList = [];
    $scope.drivers = [];

    $scope.driver = {};

    $scope.isFileChanged = null;
    $scope.isLoginPassChanged = false;


// file upload block----------------
    $scope.isUploading = false;

    $scope.uploadFiles = uploadFiles;

    function uploadFiles(driverId) {
        var newUrl = ApiServerUrl.split("/api/");
        var url = newUrl[0] + '/FileUploadInstance/FileHandler/?uploadContext=0@' + driverId;

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
                url: url,  //Server script to process data
                type: 'POST',
                xhr: function () {  // Custom XMLHttpRequest
                    var myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) { // Check if upload property exists

                    }
                    return myXhr;
                },
                success: function (data) {
                    console.log(data);
                    if (data.message != null) {
                        showNotification('danger', "Возникла ошибка при добавлении фотографии. Данные профиля успешно обновлены.");
                        $scope.showIndicator(false);
                    } else {
                        $scope.showIndicator(false);
                        location.href = "/Driver/";
                    }
                },
                error: function (err) {
                    showNotification('danger', "Возникла ошибка при добавлении фотографии. Данные профиля успешно обновлены.");
                    console.log(err);
                    $scope.showIndicator(false);
                },
                // Form data
                data: formData,
                //Options to tell jQuery not to process data or worry about content-type.
                cache: false,
                contentType: false,
                processData: false
            });
        } else {
            location.href = "/Driver/";
        }
    }

// taximetr registration and authorization block-----------

    $scope.DriverTaximetr = {
        UserName: null,
        Password: null,
        DriverId: null
    }

    $scope.passwordStorage = null; // для хранения старого пароля
    $scope.isUserNameChanged = false;
    $scope.isPasswordChanged = false;

    $scope.generatePassword = generatePassword;
    $scope.setBasicAccountValues = setBasicAccountValues;
    $scope.focusOnPassword = focusOnPassword;
    $scope.blurOnPassword = blurOnPassword;
    $scope.registerInTaximetr = registerInTaximetr;
    $scope.updateTaximetrData = updateTaximetrData;
    $scope.userNameChanged = userNameChanged;
    $scope.passwordChanged = passwordChanged;

    $scope.DriverRoleNumber = 1;

    function userNameChanged() {
        $scope.isUserNameChanged = true;
    }

    function passwordChanged() {
        $scope.isPasswordChanged = true;
    }

    function updateTaximetrData(id) {
        if (!$scope.isPasswordChanged && !$scope.isUserNameChanged) {
            uploadFiles(id);
        } else {
            if (!$scope.isPasswordChanged) {
                $scope.passwordStorage = angular.copy($scope.DriverTaximetr.Password);
                $scope.DriverTaximetr.Password = "";
            }
            $scope.DriverTaximetr.DriverId = id;
            $scope.DriverTaximetr.Role = $scope.DriverRoleNumber;
            $.ajax({
                url: ApiServerUrl + 'Account/Update/',
                method: 'POST',
                data: $scope.DriverTaximetr,
                headers: GetHeaders()
            }).success(function (data) {
                if (!$scope.isPasswordChanged) {
                    $scope.blurOnPassword();
                }
                UpdateOnClient($scope.clientSignUpData);
                console.log($scope.clientSignUpData);
                uploadFiles(id);
            }).error(function (msg) {
                if (!$scope.isPasswordChanged) {
                    $scope.blurOnPassword();
                }
                $scope.showIndicator(false);
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
            });
        }
    }

    function registerInTaximetr(driver) {
        $scope.DriverTaximetr.DriverId = driver.id;
        $scope.DriverTaximetr.Role = $scope.DriverRoleNumber;
        $.ajax({
            url: ApiServerUrl + 'Account/Register/',
            method: 'POST',
            data: $scope.DriverTaximetr,
            headers: GetHeaders()
        }).success(function () {
            SignUpOnClient($scope.clientSignUpData);
            uploadFiles(driver.id);
        }).error(function (msg) {
            $scope.showIndicator(false);
            DeleteDriverProfile(driver.id);
            var error = errorHandling(msg);
            showNotification('danger', error);
            console.error(msg);
        });
    }

    function SignUpOnClient(data) {
        $.ajax({
            url: "/Account/Register",
            method: 'POST',
            data: data
        }).success(function (data) {
            console.log(data);
            showNotification('success', "Пользователь зарегистрирован");
        }).error(function (msg) {
            showNotification('danger', msg);
            console.error(msg);
        });
    }

    function UpdateOnClient(data) {
        $.ajax({
            url: "/Account/Manage",
            method: 'POST',
            data: data
        }).success(function (data) {
            console.log(data);
            showNotification('success', "Пользователь зарегистрирован");
        }).error(function (msg) {
            showNotification('danger', msg);
            console.error(msg);
        });
    }

    function DeleteDriverProfile(id) {
        $.ajax({
            url: ApiServerUrl + 'Drivers/'+ id,
            method: 'DELETE',
            headers: GetHeaders()
        }).success(function() {
            console.log("driverWasDeleted");
        }).error(function(msg) {
            console.log(msg);
        });
    }

    function focusOnPassword() {
        $scope.passwordStorage = angular.copy($scope.DriverTaximetr.Password);
        $scope.DriverTaximetr.Password = "";
    }

    function blurOnPassword() {
        if ($scope.DriverTaximetr.Password == "") {
            if ($scope.passwordStorage != "") {
                $scope.DriverTaximetr.Password = $scope.passwordStorage;
                $scope.DriverTaximetr.ConfirmPassword = $scope.DriverTaximetr.Password;
            } else {
                setBasicAccountValues($scope.DriverTaximetr.UserName);
            }
        } else {
             $scope.DriverTaximetr.ConfirmPassword = $scope.DriverTaximetr.Password;
        }
    }

    function setBasicAccountValues(userName) {
        if ($scope.DriverTaximetr.UserName == null || $scope.DriverTaximetr.UserName == "") {
            $scope.DriverTaximetr.UserName = userName.split('-').join('');
            var randPassword = generatePassword();
            $scope.DriverTaximetr.Password = randPassword;
            $scope.DriverTaximetr.ConfirmPassword = randPassword;
        }
    }

    function generatePassword() {
        var pass = '';
        var rnd = 0;
        var c = '';
        for (var i = 0; i < 8; i++) {
            rnd = mtRand(0, 2); // Латиница или цифры
            if (rnd == 0) {
                c = String.fromCharCode(mtRand(48, 57));
            }
            if (rnd == 1) {
                c = String.fromCharCode(mtRand(65, 90));
            }
            if (rnd == 2) {
                c = String.fromCharCode(mtRand(97, 122));
            }
            pass += c;
        }
        return pass;
    }

    function mtRand(min, max) {
        var range = max - min + 1;
        var n = Math.floor(Math.random() * range) + min;
        return n;
    }

//------------------------------
	
    $scope.getDrivers = function () {
        $("#main_part").hide();
        $scope.getDriverStates();
        $.ajax({
            url: ApiServerUrl + 'Drivers',
            method: 'get',
            headers: GetHeaders()
        }).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].name = data[i].lastName + " " + data[i].firstName + " " + data[i].middleName;
                data[i].phones = $scope.formatPhones(data[i].phones, true);
                for (var j = 0; j < $scope.driverStates.length; j++) {
                    if (data[i].state == $scope.driverStates[j].state) {
                        data[i].state = $scope.driverStates[j].name;
                    }
                }
            }
            $scope.drivers = data;
            $scope.$apply();
            console.log($scope.drivers);
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.driverStates = [];

    $scope.getDriverStates = function() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/DriverStates',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverStates = data;
            $scope.driver.state = data[1];
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    function getDriver(driverID) {
        $scope.getDriverStates();
        if (driverID != null) {
            $.ajax({
                url: ApiServerUrl + 'Drivers/' + driverID,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {

                data.phones = $scope.formatPhones(data.phones, true);

                data.driverLicense.dateFrom = moment(data.driverLicense.dateFrom).format("DD.MM.YYYY");
                data.driverLicense.dateTo = moment(data.driverLicense.dateTo).format("DD.MM.YYYY");

                data.dayTimeFee = data.dayTimeFee.toFixed(2);
                data.balanceLimit = data.balanceLimit.toFixed(2);


                //$scope.getCarById(data.car.id);

                $scope.carForShow = "";
                if (data.car != null) {
                    $scope.carForShow = data.car.id + ": " + data.car.callsign + " " + data.car.brand + " " + data.car.model;
                }

                if (data.content == null) {
                    data.content = {driverPhoto:{ webUrl: "/Content/Images/no-photo.png" }};
                } else {
                    if (data.content.driverPhoto == null) {
                        data.content.driverPhoto = { webUrl: "/Content/Images/no-photo.png" };
                    }
                }

                data.workScheduleString = $scope.DaysToString(data.workSchedule);

                $scope.DriverTaximetr.UserName = data.userName;
                $scope.DriverTaximetr.Password = data.userPassword;
                $scope.drivers = [];
                $scope.drivers.push(data);
                $scope.$apply();
                console.log($scope.drivers);
                $scope.datapickerInit();
            }).error(function (msg) {
                //showModal("Ошибка!", "Ошибка при загрузке данных");
                showNotification('danger', "Ошибка при получении данных");
                console.error(msg);
            });
        }
    };

    $scope.clientSignUpData;

    $scope.setClientSignUpData = function (driver) {
        $scope.clientSignUpData = {
            LastName: driver.lastName,
            Name: driver.firstName,
            MiddleName: driver.middleName,
            PhoneNumber: driver.phones[0],
            Email: driver.email,
            UserName: $("#DriverUserName").val(),
            Role: "Водитель",
            HasAccess: true,
            Password: $("#DriverPassword").val(),
            ConfirmPassword: $("#DriverPassword").val(),
            __RequestVerificationToken: $("[name = __RequestVerificationToken]").val()
        };
    };

    $scope.addDriver = function (driver) {
        var oldDrivers = $scope.drivers;
        $scope.drivers = [];
        //$scope.drivers.push(driver);
        
        if (validateForm("addDriverForm")) {
            $scope.showIndicator(true);
            console.log(true);
            console.log(driver);

            var carBuffer = driver.car;

            if ($scope.checkDate(driver.driverLicense.dateFrom) && $scope.checkDate(driver.driverLicense.dateTo)) {
                driver.driverLicense.dateFrom = formatDate(driver.driverLicense.dateFrom);
                driver.driverLicense.dateTo = formatDate(driver.driverLicense.dateTo);
            } else {
                return false;
            }

            driver.location = { longitude: 0, latitude: 0, speed: 0, direction: 0 };

            if (driver.phones instanceof Array) {
                driver.phones = driver.phones.join(',');
            }

            driver.phones = driver.phones.replace(/-/gi, '');
            driver.phones = driver.phones.split(',');

            driver.robotSettings = {
                enabled: false,
                orderRadius: 2,
                airports: false,
                ordersSequence: false,
                wantToHome: false,
                addressSearch: "",
                minutesDepartureTime:0
            };

            $scope.setClientSignUpData(driver);

            $.ajax({
                url: ApiServerUrl + 'Drivers/',
                method: 'POST',
                data: driver,
                headers: GetHeaders()
            }).success(function (data) {
                driver.driverLicense.dateFrom = normalDate(driver.driverLicense.dateFrom);
                driver.driverLicense.dateTo = normalDate(driver.driverLicense.dateTo);
                $scope.$apply();
                registerInTaximetr(data);
            }).error(function (msg) {
                driver.driverLicense.dateFrom = normalDate(driver.driverLicense.dateFrom);
                driver.driverLicense.dateTo = normalDate(driver.driverLicense.dateTo);
                $scope.$apply();
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
                $scope.showIndicator(false);
                driver.driverLicense.dateFrom = moment(driver.driverLicense.dateFrom).format("DD.MM.YYYY");
                driver.driverLicense.dateTo = moment(driver.driverLicense.dateTo).format("DD.MM.YYYY");
                $scope.$apply();
            });
        } else {
            console.log(false);
        }
        console.log($scope.drivers);
    };

    $scope.editDriver = function (driver, id) {
        var oldDrivers = $scope.drivers;
        $scope.drivers = [];

        console.log(driver);

        console.log(driver.phones);

        $scope.drivers.push(driver);

        if (validateForm("editDriverForm")) {

           
            if (driver.car != null) {
                driver.car = { id: driver.car.id };
            }

            console.log(driver);

            if ($scope.checkDate(driver.driverLicense.dateFrom) && $scope.checkDate(driver.driverLicense.dateTo)) {
                driver.driverLicense.dateFrom = formatDate(driver.driverLicense.dateFrom);
                driver.driverLicense.dateTo = formatDate(driver.driverLicense.dateTo);
            } else {
                return false;
            }

            var state = driver.state;
            for (var i = 0; i < $scope.driverStates.length; i++) {
                if (state == $scope.driverStates[i].name) {
                    driver.state = $scope.driverStates[i];
                }
            }

            if (driver.phones instanceof Array) {
                driver.phones = driver.phones.join(',');
            }

            driver.phones = driver.phones.replace(/-/gi, '');

            driver.phones = driver.phones.split(',');

            $scope.setClientSignUpData(driver);

            $scope.drivers.push(driver);

            $scope.showIndicator(true);
            console.log(true);
            $.ajax({
                url: ApiServerUrl + 'Drivers/' + id,
                method: 'PUT',
                data: driver,
                headers: GetHeaders()
            }).success(function (data) {
                driver.driverLicense.dateFrom = normalDate(driver.driverLicense.dateFrom);
                driver.driverLicense.dateTo = normalDate(driver.driverLicense.dateTo);
                $scope.$apply();
                console.log(data);
                $scope.showIndicator(false);
                updateTaximetrData(id);
            }).error(function (msg) {
                driver.driverLicense.dateFrom = normalDate(driver.driverLicense.dateFrom);
                driver.driverLicense.dateTo = normalDate(driver.driverLicense.dateTo);
                $scope.$apply();
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
                $scope.showIndicator(false);
                driver.driverLicense.dateFrom = moment(driver.driverLicense.dateFrom).format("DD.MM.YYYY");
                driver.driverLicense.dateTo = moment(driver.driverLicense.dateTo).format("DD.MM.YYYY");
                $scope.$apply();
            });
        } else {
            console.log(false);
        }
        console.log(driver);
    };

    function formatDate(date) {
        date = date.split('.');
        return date[2] + "-" + date[1] + "-" + date[0];
    }

    function normalDate(date) {
        date = date.split('-');
        return date[2] + "." + date[1] + "." + date[0];
    }

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.showIndicator = function(status) {
        $scope.isDisabled = status;
        $scope.isVisible = status;
        $scope.$apply();
    };

    $scope.formatPhones = function (phones, isNotInitLogins) {
        var length;

        for (var i = 0; i < phones.length; i++) {
            //phones[i] = phones[i].replace(/\s*/g, '');

            phones[i] = phones[i].toString();

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
        if (!isNotInitLogins)
            setBasicAccountValues(phones[0]);

        return phones;
    };

    $scope.formatPhone = function (driver, phones) {
        console.log(phones);
        if (phones instanceof Array) {
            phones = phones.join(',');
            phones = phones.replace(/-/gi, '');
        }
        phones = phones.split(',');
        driver.phones = $scope.formatPhones(phones);
        driver.phones = driver.phones.join(', ');
    };

    $scope.cars = [];

    $scope.getCars = function(driverId) {
        $.ajax({
            url:ApiServerUrl + 'Car/?unassigned=true&includeDriverCar=' + driverId,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.cars = data;
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.getCarId = function (car) {
        console.log(car);
        if (car != null) {
            car = car.split(":");
            console.log(car[0]);
            return car[0];
        }
        return 0;
    };

    $scope.car = null;

    $scope.getCarById = function(id) {
        $.ajax({
            url: ApiServerUrl + 'Car/'+id,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.car = data;
            $scope.$apply();
            console.log($scope.car);
        }).error(function (msg) {
            showModal("Ошибка!", "Ошибка при загрузке данных");
            console.error(msg);
        });
    };

    function initEditDriver(id) {
        $scope.getCars(id);
        getWorkConditions();
        getDriver(id);
    }

    function initAddDriver() {
        getWorkConditions();
        $scope.getDriverStates();
        $scope.datapickerInit();
    }

    function getWorkConditions() {
        $.ajax({
            url: ApiServerUrl + "DriverWorkConditions",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (result) {
            $scope.workConditionsList = result;
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных.");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    /*START SORTING*/

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.drivers, orderBy);
        $scope.drivers = sortBy(predicate);
    };

    /*END SORTING*/

    $scope.checkDate = function(date) {
        var regex = "[0-9]{2}.(0[1-9]|1[012]).(0[1-9]|1[0-9]|2[0-9]|3[01])";

        regex = new RegExp(regex);

        if (!regex.test(date)) {
            showNotification('danger', "Неправильная дата");
            return false;
        }
        return true;
    };

    $scope.datapickerInit = function () {
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y',
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false,
            mask: true,
        };
        $("#datefrom").datetimepicker(datetimepickerOptions);
        $("#dateto").datetimepicker(datetimepickerOptions);
    };

 $scope.DaysToString = function(daysList) {

            var days = [];

            var day = daysList.monday;

            if (day) {
                days.push("Пн");
            }

            day = daysList.tuesday;

            if (day) {
                days.push("Вт");
            }

            day = daysList.wednesday;

            if (day) {
                days.push("Ср");
            }

            day = daysList.thursday;

            if (day) {
                days.push("Чт");
            }

            day = daysList.friday;

            if (day) {
                days.push("Пт");
            }

            day = daysList.saturday;

            if (day) {
                days.push("Сб");
            }

            day = daysList.sunday;

            if (day) {
                days.push("Вск");
            }
        return days.join(', ');
        }




});
