DexpaApp.controller('BalanceCtrl', function ($scope, $http, $filter) {
    $scope.balanceList = [];
    $scope.totalRent = 0;
    $scope.totalLimit = 0;
    $scope.totalBalance = 0;

    $scope.driverStates = [];

    $scope.getDriverStates = function () {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/DriverStates',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverStates = data;
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.getDriverStates();

    $scope.getBalanceList = function () {
        $http.get(ApiServerUrl + 'BalanceReport').success(function (data) {
            $scope.balanceList = data;

            for (var i = 0; i < data.length; i++) {
                $scope.totalRent += data[i].rentCost;
                $scope.totalLimit += data[i].moneyLimit;
                $scope.totalBalance += data[i].balance;
            }

            $scope.totalRent = $scope.totalRent.toFixed(2);
            $scope.totalLimit = $scope.totalLimit.toFixed(2);
            $scope.totalBalance = $scope.totalBalance.toFixed(2);

            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < $scope.driverStates.length; j++) {
                    if (data[i].driverState == $scope.driverStates[j].state) {
                        data[i].driverState = $scope.driverStates[j].name;
                    }
                }
            }


            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    /*START SORTING*/

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.balanceList, orderBy);
        $scope.balanceList = sortBy(predicate);
    };

    /*END SORTING*/

});