DexpaApp.controller('BalanceCtrl', function ($scope, $http, $filter) {
    $scope.balanceList = [];
    $scope.totalRent = 0;
    $scope.totalLimit = 0;
    $scope.totalBalance = 0;

    $scope.driverStates = [];
    $scope.driverWCs = [];

    $scope.selectedStatus = {
        name: "Все",
        state: -1
    };

    $scope.selectedWC = {
        name: "Все",
        id: -1
    };

    $scope.init = function () {
        getDriverStates();
    }

    function getDriverStates() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/DriverStates',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverStates.push({
                name: "Все",
                state: -1
            });
            $scope.driverStates = $scope.driverStates.concat(data);

            getDriverWCs();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    function getDriverWCs() {
        $.ajax({
            url: ApiServerUrl + 'DriverWorkConditions/Light',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverWCs.push({
                name: "Все",
                id: -1
            });
            $scope.driverWCs = $scope.driverWCs.concat(data);

            getBalanceList();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    function getBalanceList() {
        $.ajax({
            url: ApiServerUrl + 'BalanceReport?includeFired=true',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
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
                        data[i].driverState = $scope.driverStates[j];
                        break;
                    }
                }
                for (var j = 0; j < $scope.driverWCs.length; j++) {
                    if (data[i].workConditions == $scope.driverWCs[j].id) {
                        data[i].workConditions = $scope.driverWCs[j];
                        break;
                    }
                }
            }
            $scope.$apply();

            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.filterByStatus = function(row) {
        if ($scope.selectedStatus.state == -1)
            return true;
        if ($scope.selectedStatus.state == row.driverState.state) {
            return true;
        }
        return false;
    }

    $scope.filterByWC = function(row) {
        if ($scope.selectedWC.id == -1)
            return true;
        if (row.workConditions != null && $scope.selectedWC.id == row.workConditions.id) {
            return true;
        }
        return false;
    }

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.exportReport = function(type) {
        var token = GetHeaders().Authorization;
        var url = "/CashDesk/ExportReport?type="+type+"&token="+token;
         
        window.open(url);
    };

    /*START SORTING*/

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.balanceList, orderBy);
        $scope.balanceList = sortBy(predicate);
    };

    /*END SORTING*/

});