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

    $scope.driver = {
        driverLicense: {}
    };

    $scope.isFileChanged = null;
    $scope.isLoginPassChanged = false;


// file upload block----------------
    $scope.isUploading = false;

    $scope.uploadFiles = uploadFiles;

    function uploadFiles(driverId) {
        var url = ApiServerUrl + 'Content/?uploadContext=0@' + driverId;

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
    $scope.userNameChanged = userNameChanged;
    $scope.passwordChanged = passwordChanged;

    $scope.DriverRoleNumber = 1;

    function userNameChanged() {
        $scope.isUserNameChanged = true;
    }

    function passwordChanged() {
        $scope.isPasswordChanged = true;
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
            url: ApiServerUrl + 'Drivers/Light',
            method: 'get',
            headers: GetHeaders()
        }).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].name = data[i].lastName + " " + data[i].firstName + " " + (data[i].middleName!=null?data[i].middleName:"");
                data[i].phones = $scope.formatPhones(data[i].phones, true);
                for (var j = 0; j < $scope.driverStates.length; j++) {
                    if (data[i].state == $scope.driverStates[j].state) {
                        data[i].state = $scope.driverStates[j].name;
                    }
                }
            }
            $scope.drivers = data;
            $scope.$apply();
            //console.log($scope.drivers);
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

    $scope.carFeatures = "";

    function getDriver(driverID, isShow) {
        $scope.getDriverStates();
        if (driverID != null) {
            $.ajax({
                url: ApiServerUrl + 'Drivers/' + driverID,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {

                if (data.car != null) {
                    var carFeatures = data.car.features;
                    if (carFeatures.bussiness) {
                        $scope.carFeatures += "Бизнес";
                    }
                    if (carFeatures.comfort) {
                        $scope.carFeatures += ", Комфорт";
                    }
                    if (carFeatures.minivan) {
                        $scope.carFeatures += ", Минивэн";
                    }
                    if (carFeatures.economy) {
                        $scope.carFeatures += ", Эконом";
                    }
                    var startSymbol = $scope.carFeatures.slice(0, 1);
                    if (startSymbol == ',') {
                        $scope.carFeatures = $scope.carFeatures.slice(2, $scope.carFeatures.length);
                    }
                }

                data.phones = $scope.formatPhones(data.phones, true);

                data.driverLicense.dateFrom = moment(data.driverLicense.dateFrom).format("DD.MM.YYYY");
                data.driverLicense.dateTo = moment(data.driverLicense.dateTo).format("DD.MM.YYYY");

                data.dayTimeFee = data.dayTimeFee.toFixed(2);
                data.balanceLimit = data.balanceLimit.toFixed(2);


                //$scope.getCarById(data.car.id);

                $scope.carForShow = "";
                if (data.car != null) {
                    $scope.carForShow = "[" + data.car.regNumber + "] - " + data.car.brand + " " + data.car.model;
                }

                if (data.content == null) {
                    data.content = {driverPhoto:{ webUrl: "/Content/Images/no-photo.png" }};
                } else {
                    if (data.content.driverPhoto == null) {
                        data.content.driverPhoto = { webUrl: "/Content/Images/no-photo.png" };
                    }
                }

                data.workScheduleString = $scope.DaysToString(data.workSchedule);

                $scope.DriverTaximetr.oldUserName = data.userName;
                $scope.DriverTaximetr.UserName = data.userName;
                $scope.DriverTaximetr.Password = data.userPassword;
                $scope.driver = data;
                $scope.$apply();
                if (!isShow) {
                    $scope.datapickerInit();
                }

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
        
        if (validateForm("addDriverForm")) {
            $scope.showIndicator(true);
            console.log(true);
            console.log(driver);

            var carBuffer = driver.car;

            if ($scope.checkDate(driver.driverLicense.dateFrom)) {
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

            if (driver.robotSettings == undefined) {
                driver.robotSettings = {
                    enabled: false,
                    orderRadius: 2,
                    airports: false,
                    ordersSequence: false,
                    wantToHome: false,
                    addressSearch: "",
                    minutesDepartureTime: 0
                };
            }

            driver.userName = $scope.DriverTaximetr.UserName;
            driver.userPassword = $scope.DriverTaximetr.Password;

            $scope.setClientSignUpData(driver);

            $.ajax({
                url: ApiServerUrl + 'Drivers/',
                method: 'POST',
                data: driver,
                headers: GetHeaders()
            }).success(function (data) {
                driver.driverLicense.dateFrom = normalDate(driver.driverLicense.dateFrom);
                driver.driverLicense.dateTo = normalDate(driver.driverLicense.dateTo);
                uploadFiles(data.id);
            }).error(function (msg) {
                driver.driverLicense.dateFrom = normalDate(driver.driverLicense.dateFrom);
                driver.driverLicense.dateTo = normalDate(driver.driverLicense.dateTo);
                var error = errorHandling(msg);
                showNotification('danger', error);
                console.error(msg);
                $scope.showIndicator(false);
                driver.driverLicense.dateFrom = moment(driver.driverLicense.dateFrom).format("DD.MM.YYYY");
                driver.driverLicense.dateTo = moment(driver.driverLicense.dateTo).format("DD.MM.YYYY");
            });
        } else {
            console.log(false);
        }
    };

    $scope.editDriver = function (driver, id) {

        if (validateForm("editDriverForm")) {

           
            if (driver.car != null) {
                driver.car = { id: driver.car.id };
            }

            console.log(driver);

            if ($scope.checkDate(driver.driverLicense.dateFrom)) {
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
            driver.userName = $scope.DriverTaximetr.UserName;
            driver.userPassword = $scope.DriverTaximetr.Password;

            $scope.setClientSignUpData(driver);

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
                uploadFiles(id);
                $scope.$apply();
                console.log(data);
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
    };

    $scope.formatPhones = function (phones, isNotInitLogins) {
        var length;

        if (phones == null) {
            return "";
        }

        phones = phones.toString();

        length = phones.length;

        switch (length) {
            case 6:
                phones = phones[0] + phones[1] + "-" + phones[2] + phones[3] + "-" + phones[4] + phones[5];
                break;
            case 7:
                phones = phones[0] + phones[1] + phones[2] + "-" + phones[3] + phones[4] + "-" + phones[5] + phones[6];
                break;
            case 11:
                phones = phones[0] + "-" + phones[1] + phones[2] + phones[3] + "-" + phones[4] + phones[5] + phones[6] + "-" + phones[7] + phones[8] + phones[9] + phones[10];
                break;
            default:
                console.log("Other");
                break;
        }
        if (!isNotInitLogins)
            setBasicAccountValues(phones);

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
            $scope.cars.push(null);
            for (var i = 0; i < data.length; i++) {
                $scope.cars.push(data[i]);
            }
            //console.log($scope.cars);
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

    $scope.formatCar = function (car) {
        if (car == null) {
            return "";
        }

        return '[' + car.regNumber + '] - ' + car.brand + ' ' + car.model;
    }

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
        $scope.getCars();
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

    $scope.validateEmail = function(email) {
        if (email==null || email == "")
            return;

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(email)) {
            showNotification('danger', "Неправильный E-mail");
        }
    }

    $scope.checkDate = function(date, isFrom) {
        var regex = "[0-9]{2}.(0[1-9]|1[012]).(0[1-9]|1[0-9]|2[0-9]|3[01])";

        regex = new RegExp(regex);

        if (!regex.test(date)) {
            $scope.driver.driverLicense.dateTo = "";
            if (isFrom) {
                $scope.driver.driverLicense.dateFrom = "";
            }
            showNotification('danger', "Неправильная дата");
            return false;
        }

        if (isFrom) {
            var toD = date.split(".");
            $scope.driver.driverLicense.dateTo = toD[0] + "." + toD[1] + "." + (parseInt(toD[2]) + 10);
        }
        return true;
    };

    $scope.datapickerInit = function () {
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y',
            mask: true,
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false
        };
        $("#datefrom").datetimepicker(datetimepickerOptions);
        $("#dateto").datetimepicker(datetimepickerOptions);
    };

    $scope.ratingTableIsClose = true;
    $scope.marksTableIsClose = true;

    $scope.OpenTable = function(table) {
        switch (table) {
            case "rating":
                $scope.ratingTableIsClose = !$scope.ratingTableIsClose;
            break;
            case "marks":
                $scope.marksTableIsClose = !$scope.marksTableIsClose;
                break;
        default:
        }
    }

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
