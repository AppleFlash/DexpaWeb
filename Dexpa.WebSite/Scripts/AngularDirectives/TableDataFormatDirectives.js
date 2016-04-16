DexpaApp.filter('formatDriver', function () {
    return function (driver) {
        if (driver === undefined || driver === null || driver.callsign === null)
            return " ";
        var phones = driver.phones === null ? "" : driver.phones;
        return "" + driver.callsign + " (" + phones.split(',')[0].trim(' ') + ")";
    };
});