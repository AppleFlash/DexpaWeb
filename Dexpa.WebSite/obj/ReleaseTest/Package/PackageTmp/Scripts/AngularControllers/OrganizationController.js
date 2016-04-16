DexpaApp.controller("OrganizationsCtrl", function($scope, $http, $filter) {

    $scope.organizations = [];

    $scope.init = function() {
        $.ajax({
            url: ApiServerUrl + "Organization",
            method: "GET",
            headers: GetHeaders()
        }).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                if (checkDate(data[i].dateTo)) {
                    data[i].isActive = true;
                } else {
                    data[i].isActive = false;
                }
                data[i].dateFrom = dateToNormal(data[i].dateFrom);
                data[i].dateTo = dateToNormal(data[i].dateTo);
                data[i].balance = data[i].balance.toFixed(2);
            }
            $scope.organizations = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке данных");
        });

    };

    $scope.tariffs = [];

    $scope.initAdd = function () {
        $scope.datapickerInit();
        $("#customers").hide();
        $scope.getTariffs();
    };

    $scope.getOrganization = function (id) {
        $scope.initAdd();
        $scope.getCustomers(id);
        $.ajax({
            url: ApiServerUrl + "Organization/"+id,
            method: "GET",
            headers: GetHeaders()
        }).success(function (data) {
            data.dateFrom = dateToNormal(data.dateFrom);
            data.dateTo = dateToNormal(data.dateTo);
            $scope.organizations.push(data);
            $scope.$apply();
            $scope.datapickerInit();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке данных");
        });
    };

    $scope.checkDate = function (date) {
        var regex = "[0-9]{2}.(0[1-9]|1[012]).(0[1-9]|1[0-9]|2[0-9]|3[01])";

        regex = new RegExp(regex);

        if (!regex.test(date)) {
            showNotification('danger', "Неправильная дата");
            return false;
        }
        return true;
    };

    $scope.addOrganization = function(organization) {
        if (validateForm("addOrganizationForm")) {

            if (organization.tariff instanceof Object) {
                organization.tariff = { id: organization.tariff.id };
            } else {
                organization.tariff = { id: organization.tariff };
            }

            organization.dateFrom = $("#datefrom").val();
            organization.dateTo = $("#dateto").val();

            if ($scope.checkDate(organization.dateFrom) && $scope.checkDate(organization.dateTo)) {
                organization.dateFrom = formatDate(organization.dateFrom);
                organization.dateTo = formatDate(organization.dateTo);
            } else {
                return false;
            }

            console.log(organization);
            $scope.organizations.push(organization);

            $scope.showIndicator(true);
            $.ajax({
                url: ApiServerUrl + "Organization",
                method: 'POST',
                data: organization,
                headers: GetHeaders()
            }).success(function(data) {
                location.href = "/Organization";
            }).error(function(msg) {
                console.error(msg);
                showNotification('danger', "Такая организация уже есть");
                $scope.showIndicator(false);
            });
        }
    };

    $scope.editOrganization = function (organization, id) {
        if (validateForm("editOrganizationForm")) {

            if(organization.tariff instanceof Object)
            {
                organization.tariff = { id: organization.tariff.id };
            } else {
                organization.tariff = { id: organization.tariff };
            }

            organization.dateFrom = $("#datefrom").val();
            organization.dateTo = $("#dateto").val();

            if ($scope.checkDate(organization.dateFrom) && $scope.checkDate(organization.dateTo)) {
                organization.dateFrom = formatDate(organization.dateFrom);
                organization.dateTo = formatDate(organization.dateTo);
            } else {
                return false;
            }

            console.log(organization);
            $scope.organizations.push(organization);

            $scope.showIndicator(true);
            $.ajax({
                url: ApiServerUrl + "Organization/"+id,
                method: 'PUT',
                data: organization,
                headers: GetHeaders()
            }).success(function (data) {
                location.href = "/Organization";
            }).error(function (msg) {
                console.error(msg);
                showNotification('danger', "Что-то пошло не так");
                $scope.showIndicator(false);
            });
        }
    };

    $scope.getOrganizationBalance = function(id) {

        $.ajax({
            url: ApiServerUrl + "Transaction?organizationId=" + id,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.$apply();
            return data;
        }).error(function (msg) {
            console.error(msg);
            return 0;
        });

    };

    $scope.customers = [];

    $scope.getCustomers = function(id) {
        
        $.ajax({
            url: ApiServerUrl + "Customers?organizationId=" + id,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.customers = data;
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });

    };

    $scope.getTariffs = function() {
        $.ajax({
            url: ApiServerUrl + "Tariffs",
            method: "GET",
            headers: GetHeaders()
        }).success(function(data) {
            $scope.tariffs = data;
            $scope.$apply();
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке данных");
        });
    };

    $scope.AddCustomer = function(id) {
        var customerBuffer = $("#customer").val();
        if (customerBuffer == null || customerBuffer=="") {
            showNotification('danger', "Ответственное лицо не задано");
        } else {
            var customer = customerBuffer.split(': ');
            customer = {
                phone: customer[0],
                name: customer[1],
                organization: {id:id}
            };

            $scope.sendCustomer(customer, id);
        }
    };

    $scope.sendCustomer = function(customer, id) {

        $.ajax({
            url: ApiServerUrl + "Customers",
            method: 'POST',
            data: customer,
            headers: GetHeaders()
        }).success(function() {
            $scope.getCustomers(id);
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при добавлении ответственного лица");
        });

    };

    $scope.showIndicator = function (status) {
        $scope.isDisabled = status;
        $scope.isVisible = status;
        $scope.$apply();
    };

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.datapickerInit = function () {
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y',
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false
        };
        $("#datefrom").datetimepicker(datetimepickerOptions);
        $("#dateto").datetimepicker(datetimepickerOptions);
    };
});

function formatDate(date) {
    var bufferDate = date.split('.');
    return bufferDate[2] + "-" + bufferDate[1] + "-" + bufferDate[0];
}

function dateToNormal(date) {
    var bufferDate = date.split('T');
    var bufferDate = bufferDate[0].split('-');
    return bufferDate[2] + "." + bufferDate[1] + "." + bufferDate[0];
}

function checkDate(date) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();

    var bufferDate = date.split('T');
    date = bufferDate[0];
    date = new Date(date).valueOf();

    if (date >= today) {
        return true;
    } else {
        return false;
    }
}