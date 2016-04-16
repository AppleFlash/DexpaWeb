ymaps.ready(init);
var dexpaMap;

var driversMarks = {}; //массив отметок водителей
var fromAddressMark; //Маркер адреса подачи
var toAddressMark; //Маркер адреса назначения
var fromCircleMark; //окружность заказа

var orderRoute; // route выбранного заказа

var driversArray; //дополнительный массив для поиска водителей в радиусе на странице создания нового заказа

function init() {
    dexpaMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 10,
        controls: ["trafficControl", "zoomControl"]
    });
}

function DeleteDriverMark(driver) {
    if (driver.id in driversMarks) {
        var driverPm = driversMarks[driver.id];
        dexpaMap.geoObjects.remove(driverPm);
        delete driversMarks[driver.id];
    }
}

function CreateOrUpdateDriverMark(driver) {
    if (driversMarks.hasOwnProperty(driver.id)) {
        var driverPm = driversMarks[driver.id];
        driverPm.geometry.setCoordinates([driver.location.latitude, driver.location.longitude]);
        BalloonContentLayout = CreateDriverBaloonContent(driver);
        driverPm.options.set({
            balloonContentLayout: BalloonContentLayout,
            iconImageHref: driverStatesIcons[driver.state.state]
        });
    } else {
        var driverMark = DrawDriver(driver);
        driversMarks[driver.id] = driverMark;
        dexpaMap.geoObjects.add(driverMark);
    }

}

function RemoveDrivers() {
    for (var dr in driversMarks) {
        dexpaMap.geoObjects.remove(driversMarks[dr]);
    }

    driversMarks = {};
}

function DrawDrivers(drivers) {
    RemoveDrivers();
    driversArray = drivers;

    for (var i = 0; i < drivers.length; i++) {
        var driverMark = DrawDriver(drivers[i]);
        driversMarks[drivers[i].id] = driverMark;
        dexpaMap.geoObjects.add(driverMark);
    }
}

function DrawTrackPoints(points) {
    dexpaMap.geoObjects.removeAll();

    if (points.length > 0) {
        var coordsForLine = new Array();

        var partOfLine = new Array();

        partOfLine.push([points[0].latitude, points[0].longitude]);
        var trackPoint = DrawDriverTrackPoint(points[0]);
        dexpaMap.geoObjects.add(trackPoint);

        for (var i = 1; i < points.length; i++) {
            var trackPoint = DrawDriverTrackPoint(points[i]);
            dexpaMap.geoObjects.add(trackPoint);

            var coord1 = [points[i].latitude, points[i].longitude];
            var coord2 = [points[i-1].latitude, points[i-1].longitude];

            if (GetTimeSpanMs(points[i - 1], points[i]) > 180000 || GetTwoPointsDistance(coord1, coord2) > 2000) {
                coordsForLine.push(new Array(partOfLine));
                partOfLine = new Array();
                partOfLine.push([points[i].latitude, points[i].longitude]);
            } else {
                partOfLine.push([points[i].latitude, points[i].longitude]);
            }
        }

        if (coordsForLine.length == 0) {
            coordsForLine.push(new Array(partOfLine));
        }

        for (var j = 0; j < coordsForLine.length; j++) {
            dexpaMap.geoObjects.add(DrawPolyLine(coordsForLine[j][0]));
        }
    }
}

function ConvertStringToDate(strDate) {
    var dTm1 = strDate.split('T');
    var dateMass1 = dTm1[0].split('-');
    var timeMass1 = dTm1[1].split(':');
    var date1 = new Date(dateMass1[0], dateMass1[1], dateMass1[2], timeMass1[0], timeMass1[1], timeMass1[2].split('.')[0]);
    date1.setMonth(date1.getMonth() - 1);

    return date1;
}

function GetTwoPointsDistance(point1, point2) {
    return ymaps.coordSystem.geo.getDistance(point1, point2);
}

function GetTimeSpanMs(point1, point2) {
    var date1 = ConvertStringToDate(point1.timestamp);
    var date2 = ConvertStringToDate(point2.timestamp);

    date1 = date1.getTime();
    date2 = date2.getTime();

    var dateSpan = date1 - date2;

    return Math.abs(dateSpan);
}

function GetAddress(text, isFrom, circleRadius, scope) {
    if (text != undefined && text != "") {
        ymaps.geocode(text, {
            results: 10,
            boundedBy: [[56.48, 36.18], [54.92, 39.10]],
            strictBounds: true
        }).then(function (res) {
            var geoObject = getGeoObject(res.geoObjects, text);
            var placeData = geoObject.properties.get('metaDataProperty.GeocoderMetaData').AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality;
            var coords;
            var cScope = $("#angularControllerDiv").scope();
            if (isFrom) {
                dexpaMap.geoObjects.remove(fromAddressMark);
                coords = geoObject.geometry.getCoordinates();
                //cScope.order.fromAddress = res.geoObjects.get(0).properties.get('name');
                cScope.order.fromAddressDetails = createAddressObj(placeData, cScope.order.fromAddressDetails.comment);
                cScope.$apply();
                fromAddressMark = DrawMarkWithText("Точка отправления", coords);
                dexpaMap.geoObjects.add(fromAddressMark);
                SetCircleForFromMarker(circleRadius);
                resetDriversMarks();
                FindDriversInRadius();
            } else {
                dexpaMap.geoObjects.remove(toAddressMark);
                coords = geoObject.geometry.getCoordinates();
                //cScope.order.toAddress = res.geoObjects.get(0).properties.get('name');
                cScope.order.toAddressDetails = createAddressObj(placeData, cScope.order.toAddressDetails.comment);
                cScope.$apply();
                toAddressMark = DrawMarkWithText("Точка прибытия", coords);
                dexpaMap.geoObjects.add(toAddressMark);
            }
        });
    } else {
        if (isFrom) {
            dexpaMap.geoObjects.remove(fromAddressMark);
        } else {
            dexpaMap.geoObjects.remove(toAddressMark);
        }
    }
}

function getGeoObject(geoObjectsCollection, requestAddress) {
    for (var i = 0; i < geoObjectsCollection.getLength() ; i++) {
        var geoObj = geoObjectsCollection.get(i);
        if (requestAddress.toLowerCase().indexOf('аэропорт') > -1) {
            if (geoObj.properties.get('metaDataProperty.GeocoderMetaData').kind == 'airport') {
                return geoObj;
            }
        } else {

            return geoObj;
        }
    }

    return geoObjectsCollection.get(0);
}

function createAddressObj(data, comment) {
    var city = data.LocalityName;
    var street = (data.Thoroughfare != undefined) ? data.Thoroughfare.ThoroughfareName : (data.DependentLocality != undefined) ? data.DependentLocality.DependentLocalityName : "";
    var house = "";
    if (street != "") {
        house = (data.Thoroughfare != undefined && data.Thoroughfare.Premise != undefined) ? data.Thoroughfare.Premise.PremiseNumber : "";
    }

    return {
        city: city,
        street: street,
        house: house,
        comment: comment
    };
}

function SetCircleForFromMarker(radius) {
    if (radius != 0) {
        if (fromAddressMark != undefined) {
            if (fromCircleMark != undefined)
                dexpaMap.geoObjects.remove(fromCircleMark);
            fromCircleMark = DrawCircle(fromAddressMark.geometry.getCoordinates(), radius);

            dexpaMap.geoObjects.add(fromCircleMark);
            SetMapZoomByBounds(fromCircleMark.geometry.getBounds());
        }
    } else {
        dexpaMap.geoObjects.remove(fromCircleMark);
        SetMapZoomByBounds(0);
    }
}

function SetMapZoomByBounds(bounds) {
    if (bounds == 0) { //сброс масштаба
        dexpaMap.setCenter([55.76, 37.64], 10);
    } else {
        dexpaMap.setBounds(bounds, {
            checkZoomRange: true // проверяем наличие тайлов на данном масштабе.
        });
    }
}

var cScope;

function FindDriversInRadius() {
    if (fromCircleMark != undefined) {
        cScope = $("#angularControllerDiv").scope();
        cScope.nearestDrivers = new Array();
        for (var key in driversMarks) {
            var coordsD = driversMarks[key].geometry.getCoordinates();
            var coordsM = fromCircleMark.geometry.getCoordinates();
            if (fromCircleMark.geometry.contains(coordsD)) {
                getLength(key, [coordsD, coordsM]);
            } else {
                dexpaMap.geoObjects.remove(driversMarks[key]);
            }
        }
    }
}

function getLength(key, coords) {
    var driverObj;
    ymaps.route(coords, { avoidTrafficJams: true }).then(function (route) {
        var length = Math.round(route.getLength()) / 1000;
        driverObj = FindObjInArray(key, driversArray);
        driverObj.distance = length;
        cScope.nearestDrivers.push(driverObj);
        cScope.$apply();
    }, function () {
        driverObj = FindObjInArray(key, driversArray);
        driverObj.distance = 0.0;
        cScope.nearestDrivers.push(driverObj);
        cScope.$apply();
    });
}

function resetDriversMarks() {
    for (var callsign in driversMarks) {
        if (dexpaMap.geoObjects.indexOf(driversMarks[callsign]) == -1)
            dexpaMap.geoObjects.add(driversMarks[callsign]);
    }
}

function GetLengthOfObject(center, coords) {
    return Math.sqrt(Math.pow(center[0] - coords[0]) + Math.pow(center[1] - coords[1]));
}

function FindObjInArray(id, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] != null && array[i].id == id) {
            return array[i];
        }
    }
    return -1;
}

function DrawOrder(order) {
    EreaseSelectedOrder();
    ymaps.route([order.fromAddressDetails.fullName, order.toAddressDetails.fullName], {
        avoidTrafficJams: true,
        boundedBy: [[56.50, 36.00], [54.70, 39.20]],
        strictBounds: true,
        mapStateAutoApply: true
    }).then(function (routeRes) {
        orderRoute = routeRes;

        var points = routeRes.getWayPoints(),
            lastPoint = points.getLength() - 1;
        points.options.set('preset', 'islands#darkGreenStretchyIcon');

        points.get(0).properties.set('iconContent', 'Точка отправления');
        points.get(lastPoint).properties.set('iconContent', 'Точка прибытия');

        dexpaMap.geoObjects.add(orderRoute);
    });
}

function DrawRoute(from, to) {
    EreaseSelectedOrder();
    ymaps.route([from, to], {
        avoidTrafficJams: true,
        boundedBy: [[56.50, 36.00], [54.70, 39.20]],
        strictBounds: true,
        mapStateAutoApply: true
    }).then(function (routeRes) {
        orderRoute = routeRes;
        var points = routeRes.getWayPoints(),
            lastPoint = points.getLength() - 1;
        points.options.set('visible', false);

        dexpaMap.geoObjects.add(orderRoute);
    });
}

function EreaseSelectedOrder() {
    dexpaMap.geoObjects.remove(orderRoute);
    SetMapZoomByBounds(0);
}

function showDriver(driver) {
    dexpaMap.setCenter([driver.location.latitude, driver.location.longitude], 12);
    driversMarks[driver.id].balloon.open();
}
