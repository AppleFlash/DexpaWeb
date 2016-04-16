DexpaApp.directive('capitalize', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var capitalize = function (inputValue) {
                if (inputValue != undefined) {
                    var capitalized = inputValue.toUpperCase();
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                } else {
                    return "";
                }
            }
            modelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]);  // capitalize initial value
        }
    };
});


DexpaApp.controller('CarsCtrl', function ($scope, $http, $filter) {
    $scope.carsList = [];
    $scope.car = { childrenSeat: "" };

    $scope.belongsCompanyCarsCount = 0;
    $scope.showOnlyBelongs = false;

    $scope.getCarsList = function () {
        $.ajax({
            url: ApiServerUrl + 'Car',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.carsList = data;

            var carsDictionary = {
                carsByBrands: {},
                carsByModels: {}
            };

            $scope.belongsCompanyCarsCount = 0;

            for (var i = 0; i < data.length; i++) {

                if (data[i].belongsCompany) {
                    $scope.belongsCompanyCarsCount++;
                }

                if (data[i].brand in carsDictionary.carsByBrands) {
                    carsDictionary.carsByBrands[data[i].brand][0] += 1;
                } else {
                    carsDictionary.carsByBrands[data[i].brand] = [1, data[i].brandLogo];
                }

                if (data[i].model in carsDictionary.carsByModels) {
                    carsDictionary.carsByModels[data[i].model][0] += 1;
                } else {
                    carsDictionary.carsByModels[data[i].model] = [1, data[i].brandLogo];
                }
            }

            $scope.carsByBrands = $.map(carsDictionary.carsByBrands, function (value, index) {
                return { brand: index, val: value };
            });
            $scope.carsByModels = $.map(carsDictionary.carsByModels, function (value, index) {
                return { model: index, val: value };
            });

            $("#loader").hide();
            $("#main_part").show();
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.getCar = function (carId) {
        if (carId != null) {
            $.ajax({
                url:ApiServerUrl + 'Car/' + carId,
                method: 'GET',
                headers: GetHeaders()
            }).success(function (data) {

                $scope.carsList = [];
                $scope.carsList.push(data);

                $scope.carsList[0].childrenSeat = data.childrenSeat;

                $scope.$apply();

            }).error(function (msg) {
                //showModal("Ошибка!", "Ошибка при загрузке данных");
                showNotification('danger', "Ошибка при получении данных");
                console.error(msg);
            });
        }
    };

    $scope.GetDataForCarEdit = function (id) {
        $scope.GetCarStatuses();
        $scope.GetChildrenSeats();
        $scope.GetCarYears();
        $scope.getCar(id);
    }

    $scope.GetAddData = function () {
        $scope.GetCarStatuses();
        $scope.GetChildrenSeats();
        $scope.GetCarYears();
    }

    $scope.GetCarStatuses = function () {

        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/CarStatuses',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.carStatuses = data;
            $scope.car.Status = data[2];
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    $scope.GetChildrenSeats = function () {

        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/ChildrenSeats',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.childrenSeats = data;
            $scope.car.childrenSeat = data[0];
            $scope.$apply();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    $scope.GetCarYears = function() {
        $scope.productionYears = new Array();
        var today = new Date();
        var yr = today.getFullYear();

        for (var i = yr; i >= 1950; i--) {
            $scope.productionYears.push(i);
        }
    };

    $scope.addCar = function (car) {
        var oldCars = $scope.carsList;
        $scope.carsList = [];
        $scope.carsList.push(car);

        if (validateForm("addCarForm")&&car.Status.type!=0) {
            $scope.showIndicator(true);
            console.log(true);
            $.ajax({
                url: ApiServerUrl + 'Car/',
                method: 'POST',
                data: car,
                headers: GetHeaders()
            }).success(function (data) {
                console.log(data);
                var id = data.id;
                location.href = "/CarsDictionary/";
                $scope.showIndicator(false);
            }).error(function (msg) {
                if (msg.status == 400) {
                    showNotification('danger', "Машина с таким позывным или гос. номером уже существует.");
                } else {
                    var error = errorHandling(msg);
                    showNotification('danger', error);
                    console.error(msg);
                }

                $scope.showIndicator(false);
            });
        } else {
            if (car.Status.type == 0) {
                showNotification('danger', "Поле \"Статус\" пустое");
            }
            console.log(false);
        }
        console.log($scope.cars);
    };

    $scope.editCar = function (car) {

        if (validateForm("editCarForm")) {
            $scope.showIndicator(true);
            console.log(true);
            $.ajax({
                url: ApiServerUrl + 'Car/' + car.id,
                method: 'PUT',
                data: car,
                headers: GetHeaders()
            }).success(function (data) {
                console.log(data);
                location.href = "/CarsDictionary/";
                $scope.showIndicator(false);
            }).error(function (msg) {
                if (msg.status == 400) {
                    showNotification('danger', "Машина с таким позывным или гос. номером уже существует.");
                } else {
                    var error = errorHandling(msg);
                    showNotification('danger', error);
                    console.error(msg);
                }
                $scope.showIndicator(false);
            });
        } else {
            console.log(false);
        }

        console.log(car);
    };

    $scope.showIndicator = function (status) {
        $scope.isDisabled = status;
        $scope.isVisible = status;
    };

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    /*START SORTING*/

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.carsList, orderBy);
        $scope.carsList = sortBy(predicate);
    };

    /*END SORTING*/

    var carBrands = [];
    var carModels = [];

    $scope.GetBrandsAndModels = function() {
        $.ajax({
            url: ApiServerUrl + "cars/brands",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                if (!inArray(data[i], carBrands)) {
                    carBrands.push(data[i]);
                }
            }
            $("#brand").autocomplete({
                source:carBrands
            });
            $scope.$apply();
        }).error(function(msg) {
            console.error(msg);
        });

        $.ajax({
            url: ApiServerUrl + "cars/models",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                if (!inArray(data[i], carModels)) {
                    carModels.push(data[i]);
                }
            }
            $("#model").autocomplete({
                source: carModels
            });
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    function inArray(value, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].toString() == value) {
                return true;
            }
        }
        return false;
    }

    $scope.loadImage = function () {
        var url;
        var carBrand = $("#brand").val();
        if (carBrand != "") {
            url = "/Content/BrandLogos/" + carBrand.toLowerCase() + ".png";
        } else {
            url = "/Content/images/noCarPhoto.png";
        }
        $("#carBrandLogo").attr("src", url);
    };

    $scope.fixedBrand = function(car) {
        car.brand = $("#brand").val();
    };

    $scope.fixedModel = function (car) {
        car.model = $("#model").val();
    };

    $scope.filterCarsByBelong = function(car) {
        if ($scope.showOnlyBelongs) {
            if (car.belongsCompany) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }

});

var errorStatus = {
    "carDTO.Permission.Number": { id: "number", message: "Поле \"№ Разрешения\" должно содержать только цифры" },
    "carDTO.Permission.Series": { id: "series", message: "Поле \"Серия\" должно содержать только цифры" },
    "carDTO.Permission.Number2": { id: "number2", message: "Поле \"№ Разрешения\" должно содержать только цифры" }
}