DexpaApp.controller('DriverCtrl', function ($scope, $http) {
    $http.get(ApiServerUrl + "api/drivers").success(function (data) {
        $scope.drivers = data;
    });
});