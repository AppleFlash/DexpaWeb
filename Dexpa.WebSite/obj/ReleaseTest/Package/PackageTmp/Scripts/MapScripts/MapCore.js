var driverStatesIcons = new Array();
driverStatesIcons[0] = "/Content/Images/MapIcons/taxiGreen.png"; //0-ReadyToWork
driverStatesIcons[1] = "/Content/Images/MapIcons/taxiRed.png"; //1-NotAvailable
//driverStatesIcons[1] = "/Content/Images/MapIcons/taxiGray.png"; //1-NotAvailable
driverStatesIcons[2] = "/Content/Images/MapIcons/taxiYellow.png"; //2-Busy




function DrawDriver(driver) {

    //var DriverMarkTemplate = ymaps.templateLayoutFactory.createClass('<div class="test"><img src={{driverStatesIcons[properties.state]}}/><div class="arrowMark"></div></div>');
    //ymaps.layout.storage.add('my#DriverLayout', DriverMarkTemplate);

    var driverName = "";
    driverName += driver.callsign == null ? " " : driver.callsign + " ";
    driverName += driver.lastName == null ? " " : driver.lastName + " ";
    driverName += driver.firstName == null ? " " : (driver.firstName[0] + ".");
    driverName += driver.middleName == null ? " " : (driver.middleName[0] + ".");

    BalloonContentLayout = CreateDriverBaloonContent(driver);

    var driverPlacemark = new ymaps.Placemark([driver.location.latitude, driver.location.longitude], {
        hintContent: driverName
    }, {
        iconLayout: 'default#image',
        iconImageHref: driverStatesIcons[driver.state.state],
        iconImageSize: [30, 30],
        iconImageOffset: [-15, -15],
        balloonContentLayout: BalloonContentLayout,
        balloonPanelMaxMapArea: 0
    });

    return driverPlacemark;
}

function CreateDriverBaloonContent(driver) {
    return ymaps.templateLayoutFactory.createClass(
            '<strong>' +
                (driver.callsign == null ? " " : ('[' + driver.callsign + '] ')) +
                (driver.car == null ? " " : ('<a target="_blank" href="/CarsDictionary/ShowCar/' + driver.car.id + '">' + driver.car.brand + ' ' + driver.car.model + '</a>')) +
            '</strong>' +
            '<table class="smallFontSize baloonTable">' +
                '<tr><td>Статус:</td><td> ' + driver.state.name + '</td></tr>' +
                '<tr><td>Имя:</td><td> ' + (driver.firstName == null ? "___" : ('<a target="_blank" href="/Driver/ShowDriver/' + driver.id + '">' + driver.firstName + '</a>')) + '</td></tr>' +
                '<tr><td>Номер:</td><td> ' + (driver.car == null ? " " : driver.car.regNumber) + '</td></tr>' +
                '<tr><td>Цвет:</td><td> ' + (driver.car == null ? " " : driver.car.color) + '</td></tr>' +
                '<tr><td>Тел.:</td><td> ' + driver.phones[0] + '</td></tr>' +
            '</table>'+
            '<table class="smallFontSize text-success baloonTable">' +
                //'<tr><td>Gps:</td><td></td></tr>'+
                '<tr><td>Скорость:</td><td> ' + driver.location.speed + ' км/ч</td></tr>' +
                //'<tr><td>Обновлен:</td><td></td></tr>' +
            '</table>', {}
    );
}

function DrawDriverTrackPoint(point) {

    BalloonContentLayout = CreateTrackPointBaloonContent(point);

    var trackPoint = new ymaps.Placemark([point.latitude, point.longitude], {
        hintContent: point.timestamp.replace('T', ' ')
    }, {
        iconLayout: 'default#image',
        iconImageHref: "/Content/Images/MapIcons/smallPoint.png",
        iconImageSize: [12, 12],
        iconImageOffset: [-6, -6],
        balloonContentLayout: BalloonContentLayout,
        balloonPanelMaxMapArea: 0
    });

    return trackPoint;
}

function CreateTrackPointBaloonContent(point) {
    return ymaps.templateLayoutFactory.createClass(
        '<table class="smallFontSize baloonTable">' +
        '<tr><td>id:</td><td> ' + point.id + '</td></tr>' +
        '<tr><td>Время:</td><td> ' + point.timestamp.replace('T',' ') + '</td></tr>' +
        '<tr><td>Скорость:</td><td> ' + point.speed + '</td></tr>' +
        '<tr><td>Направление:</td><td> ' + point.direction + '</td></tr>' +
        '</table>'
    );
}

function DrawPolyLine(coordsMass) {
    return new ymaps.Polyline(coordsMass, {
    }, {
        strokeColor: "#00FF00",
        strokeWidth: 3,
        strokeOpacity: 0.5
    });
}

function DrawMarkWithText(text, coords) {

    var textPlacemark = new ymaps.Placemark(coords, {
        iconContent: text
    }, {
        preset: 'islands#darkGreenStretchyIcon'
    });

    return textPlacemark;
}

function DrawMarker(coords) {
    var placemark = new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: [coords.latitude, coords.longitude]
        }
    });
    return placemark;
}


function DrawCircle(coords, radius) {
    var orderCircle = new ymaps.Circle([
    coords,
    radius
    ], {}, {
        // Последний байт (77) определяет прозрачность.
        // Прозрачность заливки также можно задать используя опцию "fillOpacity".
        fillColor: "#1CAF9A22",
        // Цвет обводки.
        strokeColor: "#1CAF9A",
        // Прозрачность обводки.
        strokeOpacity: 0.5,
        // Ширина обводки в пикселях.
        strokeWidth: 2
    });
    return orderCircle;
}


