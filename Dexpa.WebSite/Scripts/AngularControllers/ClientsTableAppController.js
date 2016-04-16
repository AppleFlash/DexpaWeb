DexpaApp.controller('ClientsCtrl', function ($scope, $http, $filter) {
    $scope.initializeCustomers = initializeCustomers;
    $scope.getClients = getClients;
    $scope.SearchEvent = SearchEvent;
    $scope.search = search;
    $scope.backToClients = backToClients;
    $scope.changePage = changePage;

    $scope.Clients = [];
    $scope.isSearchMode = false; //режим отображения результатов поиска

    $scope.elements = 100;
    $scope.searchQuery = "";
    $scope.searchResults = [];
    $scope.searchResultsCount = null;
    $scope.searchCurrentPage = 1;
    $scope.isSearching = false; //процесс получения результатов поиска

    $scope.drawPaginator = drawPaginator;

    function initializeCustomers() {
        var cusCount = $.ajax({
            url: ApiServerUrl + "report/CusotomersCount",
            method: 'GET',
            headers: GetHeaders()
        });
        cusCount.success(function (result) {
            $scope.customersCount = result;
            $scope.pagesCount = Math.ceil($scope.customersCount / $scope.elements);
            getClients(1);
        }).error(function (msg) {
        //showModal("Ошибка!", "Ошибка при получении данных");
        showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    function getClients(num) {
        $("#loader").show();
        $("#main_part").hide();
        $scope.currentPage = num;
        var skip = $scope.elements * (num - 1);
        var take = $scope.elements;
        var clientsObj = $.ajax({
            url: ApiServerUrl + "Customers?skip=" + skip + "&take=" + take,
            method: 'GET',
            headers: GetHeaders()
        });
        clientsObj.success(function (result) {
            $scope.Clients = result;
            $scope.pagesCount = Math.ceil($scope.customersCount / $scope.elements);
            drawPaginator($scope.currentPage, $scope.pagesCount);
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            showModal("Ошибка!", "Ошибка при получении данных");
            console.error(msg);
        });
    }

    function changePage(num) {
        var page;
        var pagesCount;

        page = $scope.currentPage;
        pagesCount = $scope.pagesCount;

        if (num == 'p' || num == 'n') {
            if (num == 'p' &&  page != 1) {
                num = page - 1;
            } else {
                if (num == 'n' && page != pagesCount) {
                    num = page + 1;
                } else {
                    num = page;
                }
            }
        }

        if ($scope.isSearchMode) {
            search(num);
        } else {
            getClients(num);
        }
    }

    $scope.selectElementsCount = function () {
        if ($scope.isSearchMode) {
            search(1);
        } else {
            getClients(1);
        }
    };

    function SearchEvent() {
        if (event.keyCode == 13) {
            search(1);
        }
    };

    function search(num) {
        $("#loader").show();
        $("#main_part").hide();

        $scope.currentPage = num;
        var skip = $scope.elements * (num - 1);
        var take = $scope.elements;

        if ($scope.searchQuery == "") {
            $scope.searchQuery = angular.copy($scope.searchQueryCopy);
        } else {
            $scope.searchQueryCopy = angular.copy($scope.searchQuery);
        }

        $scope.isSearchMode = true;
        $.ajax({
                url: ApiServerUrl + "Customers?query=" + $scope.searchQueryCopy + "&skip=" + skip + "&take=" + take,
                method: 'GET',
                headers: GetHeaders()
            })
            .success(function (data) {
                $scope.customersCount = data[data.length - 1].phone;
                data.splice(data.length - 1, 1); //удаление лишнего клиента(количества результатов)
                $scope.Clients = data;
                $scope.isSearching = false;
                $scope.pagesCount = Math.ceil($scope.customersCount / $scope.elements);
                drawPaginator($scope.currentPage, $scope.pagesCount);
                $scope.$apply();
                $("#loader").hide();
                $("#main_part").show();
            });
    }

    function backToClients() {
        $scope.isSearchMode = false;
        $scope.Clients = [];
        drawPaginator(0, 0);
        initializeCustomers();
    }

    function drawPaginator(currPage, totalPages) {
        var left = 1;
        var right = 10;

        if (currPage > 5) {
            left = currPage - 5;
            right = currPage + 5;
        }

        if (currPage > totalPages - 5) {
            left = totalPages - 10;
            right = totalPages;
        }

        $scope.Pages = new Array();
        for (var i = left; i <= right; i++) {
            if (i > 0 && i <= totalPages) {
                $scope.Pages.push(i);
                if (i == currPage) {
                    $("#page" + i).addClass("active");
                } else {
                    $("#page" + i).removeClass("active");
                }
            }
        }
    }

    /*START SORTING*/

    var Increase = true;
    var PredicateHistory;
    var orderBy = 0;

    $scope.sortBy = function (predicate) {

        var num = $scope.currentPage;

        console.log(Increase);

        if (PredicateHistory != null) {
            $("span#" + PredicateHistory.replace('.', '')).removeAttr('class');
        }
        if (PredicateHistory != predicate) {
            Increase = true;
        }
        PredicateHistory = predicate;
        if (Increase) {
            Increase = false;
            icon = "up";
            orderBy = 0;
        } else {
            reverse = true;
            Increase = true;
            icon = "down";
            orderBy = 1;
        }
        $("span#" + predicate.replace('.', '')).attr("class", "fa fa-caret-" + icon);

        $scope.currentPage = num;
        var skip = $scope.elements * (num - 1);
        var take = $scope.elements;
        var clientsObj = $.ajax({
            url: ApiServerUrl + "Customers?skip=" + skip + "&take=" + take+"&sortBy="+predicate+"&orderBy="+orderBy,
            method: 'GET',
            headers: GetHeaders()
        });
        clientsObj.success(function (result) {
            $scope.Clients = result;
            $scope.pagesCount = Math.ceil($scope.customersCount / $scope.elements);
            drawPaginator($scope.currentPage, $scope.pagesCount);
            $scope.$apply();
        }).error(function (msg) {
            showModal("Ошибка!", "Ошибка при получении данных");
            console.error(msg);
        });
    };

    /*END SORTING*/


});



