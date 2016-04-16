$(document).ready(function () {

    $(".setRadiusBtn").click(function () {
        var allButtons = $(".setRadiusBtn");
        for (var i = 0; i < 5; i++) {
            allButtons[i].className = allButtons[i].className.replace("success", "default");
        }
        this.className = this.className.replace("default", "success");
    });

    function logic1() {
        jQuery("#departureTime").val("");
        logic2();
    }

    var logic2 = function () {
        var k = document.getElementById("departureDate").value;
        if (k == "") {
            return;
        }
        var dateMass = k.split('.');
        var y = dateMass[2];
        var m = dateMass[1];
        var d = dateMass[0];

        var today_d = new Date();
        var cd = SetFullDate(today_d.getDate());
        var cy = today_d.getFullYear().toString();
        var cm = SetFullDate(today_d.getMonth()+1);

        if (y == cy && m == cm && d == cd) {
            //this.setOptions({
            //    minTime: 0
            //});
            jQuery("#departureTime").datetimepicker({
                lang: 'ru',
                format: 'H:i',
                minTime: 0,
                step: 30,
                datepicker: false,
                onChangeDateTime: logic2,
                validateOnBlur: true
            });
        }
        else {
            //this.setOptions({
            //    minTime: '00:00'
            //});
            jQuery("#departureTime").datetimepicker({
                lang: 'ru',
                format: 'H:i',
                minTime: '00:00',
                step: 30,
                datepicker: false,
                onChangeDateTime: logic2,
                validateOnBlur: true
            });
        }
    }

    jQuery('#departureDate').datetimepicker({
        lang: 'ru',
        format: 'd.m.Y',
        minDate: 0,
        dayOfWeekStart: 1,
        timepicker: false,
        onChangeDateTime: logic1,
        validateOnBlur: true
    });

    jQuery("#departureTime").datetimepicker({
        lang: 'ru',
        format: 'H:i',
        minTime: 0,
        step: 30,
        datepicker: false,
        onChangeDateTime: logic2,
        validateOnBlur: true
    });


    function addMinutes(date, minutes) {
        var newDate = new Date(date.getTime() + minutes * 60000);
        return newDate;
    }

    function getStringDate(date) {
        var s = "" + SetFullDate(date.getDate()) + "." + SetFullDate((date.getMonth() + 1)) + "." + date.getFullYear();
        return s;
    }

    function getStringTime(date) {
        var s = "" + SetFullDate(date.getHours()) + ":" + SetFullDate(date.getMinutes());
        return s;
    }

    var currDate30 = addMinutes(new Date(), 30);

    jQuery("#departureDate").val(getStringDate(currDate30));
    jQuery("#departureTime").val(getStringTime(currDate30));

    function SetFullDate(d) {
        if (d < 10)
            return "0" + d;
        else {
            return d;
        }
    }
});


