ymaps.ready(init);
var dexpaMap;

var driversMarks = {}; //массив отметок водителей
var driversRadiuses = {}; //массив радиусов водителей
var fromAddressMark; //Маркер адреса подачи
var toAddressMark; //Маркер адреса назначения
var fromCircleMark; //окружность заказа

var orderRoute; // route выбранного заказа

var driversArray; //дополнительный массив для поиска водителей в радиусе на странице создания нового заказа

function init() {
    dexpaMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 10,
        controls: ["trafficControl", "zoomControl", "rulerControl"]
    });
}

function DeleteDriverMark(driver) {
    if (driver.id in driversMarks) {
        var driverPm = driversMarks[driver.id];
        dexpaMap.geoObjects.remove(driverPm);
        delete driversMarks[driver.id];
    }

    if (driver.id in driversRadiuses) {
        var driverRm = driversRadiuses[driver.id];
        dexpaMap.geoObjects.remove(driverRm);
        delete driversRadiuses[driver.id];
    }
}

function CreateOrUpdateDriverMark(driver, withRadius) {
    if (driversMarks.hasOwnProperty(driver.id)) {
        var driverPm = driversMarks[driver.id];
        driverPm.geometry.setCoordinates([driver.location.latitude, driver.location.longitude]);
        BalloonContentLayout = CreateDriverBaloonContent(driver);

        var mapDriverIco = "";
        if (driver.isOnline) {
            mapDriverIco = driverStatesIcons[driver.state.state];
        } else {
            mapDriverIco = driverStatesIcons[3];
        }

        driverPm.options.set({
            balloonContentLayout: BalloonContentLayout,
            iconImageHref: mapDriverIco
        });
    } else {
        var driverMark = DrawDriver(driver);
        driversMarks[driver.id] = driverMark;
        dexpaMap.geoObjects.add(driverMark);

        if (withRadius && driver.orderRadius != 0) {
            var circle = DrawCircle([driver.location.latitude, driver.location.longitude], 1000 * driver.orderRadius);
            driversRadiuses[driver.id] = circle;
            dexpaMap.geoObjects.add(circle);
        }
    }
}

function RemoveDrivers() {
    for (var dr in driversMarks) {
        dexpaMap.geoObjects.remove(driversMarks[dr]);
    }

    driversMarks = {};
}

function RemoveDriversRadiuses() {
    for (var r in driversRadiuses) {
        dexpaMap.geoObjects.remove(driversRadiuses[r]);
    }

    driversRadiuses = {};
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
    var check = points;
    points = points.points;
    dexpaMap.geoObjects.removeAll();

    if (points.length > 0) {
        var eps = 0.000001;
        var firstPoint = points[0];
        var coordsForLine = new Array();

        var partOfLine = new Array();

        partOfLine.push([firstPoint.latitude, firstPoint.longitude]);

        var arrTemp = new Array();

        for (var i = 1; i < points.length + 1; i++) {
            var point2 = points[i];
            var point1 = points[i - 1];

            if (point2 != undefined) {
                var coord1 = [point2.latitude, point2.longitude];
                var cLon2 = point2.longitude;
                var cLat2 = point2.latitude;
            }
            var coord2 = [point1.latitude, point1.longitude];
            var cLon1 = point1.longitude;
            var cLat1 = point1.latitude;

            var balloonContent = selectBalloonContent(points[i - 1], check);
            arrTemp.push(balloonContent);

            if (i == points.length) {
                wrappingTemplate(points[i - 1], check, arrTemp);
                arrTemp = [];
            }
            if (Math.abs(cLat2 - cLat1) <= eps && Math.abs(cLon2 - cLon1) <= eps) {
                if (cLat2 != undefined && cLon2 != undefined)
                    continue;
            }
            else {
                wrappingTemplate(points[i - 1], check, arrTemp);
                arrTemp = [];
            }

            if (point2 != undefined) {
                if (GetTimeSpanMs(point1, point2) > 180000 ||
                    GetTwoPointsDistance(coord1, coord2) > 2000 ||
                    point1.driverState != point2.driverState) {
                    coordsForLine.push({
                        points: partOfLine,
                        driverState: point1.driverState
                    });
                    partOfLine = new Array();
                    partOfLine.push([point2.latitude, point2.longitude]);
                } else {
                    partOfLine.push([point2.latitude, point2.longitude]);
                }
            }
        }

        if (coordsForLine.length == 0) {
            coordsForLine.push({
                points: partOfLine,
                driverState: firstPoint.driverState
            });
        }

        for (var j = 0; j < coordsForLine.length; j++) {
            var color = getColorByDriverState(coordsForLine[j].driverState);
            dexpaMap.geoObjects.add(DrawPolyLine(coordsForLine[j].points, color));
        }
        //var orderPointsVar = check.orderPoints;
        var orderPointsVar = check;
        var arrayNewEmptyOrder = new Array();
        for (var k = 0; k < orderPointsVar.length; k++) {
            if (orderPointsVar[k].pointId === null) {
                balloonContent = selectEmptyBalloonContent(orderPointsVar[k]);
                arrayNewEmptyOrder.push(balloonContent);
                wrappingTemplate(orderPointsVar[k], check, arrayNewEmptyOrder);
                arrayNewEmptyOrder = [];
            }
        }
    }
}

function getColorByDriverState(driverState) {
    if (driverState == 0)//ready to work
    {
        return "#00FF00";
    }
    else if (driverState == 1)//NotAvailable
    {
        return "#d00000";
    }
    else if (driverState == 2)//Busy
    {
        return "#FFE400";
    }
    else if (driverState == 4)//Blocked
    {
        return "#d00000";
    }
    return "#A0A0A0";
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

function intValueMin(millisec) {
    var min = (millisec / 1000 / 60).toString();
    min = min.split('.');
    min = min[0];
    return min;
}

function GetTimeForBalloon(timeMs, point, nextPoint) {
    if (timeMs != 0) {
        var tWith = convertDateToString(point.timestamp);
        var tTo = convertDateToString(nextPoint.timestamp);
        if (tWith.length < 2 && tTo.length < 2) {
            var date = point.timestamp.split('T');
            date = date[0].split('-');
            var staingDate = "<br>" + date[0] + '.' + date[1] + '.' + date[2];
        }
        var min = intValueMin(timeMs);
        var hour = (min / 60).toString();
        hour = hour.split('.');
        hour = hour[0];
        if (min > 60) {
            min -= 60;
            hour++;
        }
        var answer;
        var ending;
        var ch = hour % 10;
        if (ch == 0) ending = "часов";
        if (ch == 1) ending = "час";
        if (ch > 1 && ch < 5) ending = "часа";
        if (hour == 0) {
            if (hour < "1" && min < "1")
                return answer = "Простой меньше минуты" + (staingDate != undefined ? "<br>" + staingDate : "");
            else {
                return answer =
                    min + " мин" + "<br>" +
                    " c" + tWith + " до " + tTo + (staingDate != undefined ? "<br>" + staingDate : "");
            }
        }
        else {
            return answer = hour + " " + ending + " " + min + " мин"
                + "<br>" + " c" + tWith + " до " + tTo + (staingDate != undefined ? "<br>" + staingDate : "");
        }
    }
}

	function GetAddress(text, isFrom, circleRadius) {
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
					fromAddressMark = DrawMarkWithText("A", coords);
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
					toAddressMark = DrawMarkWithText("B", coords);
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
        for (var i = 0; i < geoObjectsCollection.getLength(); i++) {
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
        ymaps.route(coords, { avoidTrafficJams: true }).then(function(route) {
            var length = Math.round(route.getLength()) / 1000;
            driverObj = FindObjInArray(key, driversArray);
            driverObj.distance = length;
            cScope.nearestDrivers.push(driverObj);
            cScope.$apply();
        }, function() {
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
        //EreaseSelectedOrder();
        ExperimentalEreaseOrder();

        if (order.toAddress == null || order.toAddress == "" || order.toAddress == order.fromAddress) {
            DrawOrderWithoutToAddr(order.fromAddress);
        } else {
            //DrawOrderWithToAddr(order.fromAddress, order.toAddress);
            ExperimentalDrawOrder(order.fromAddress, order.toAddress);
        }
    }

    function DrawOrderWithToAddr(fromAddr, toAddr) {
        //ymaps.route([order.fromAddress, order.toAddress], {
        ymaps.route([fromAddr, toAddr], {
            avoidTrafficJams: true,
            boundedBy: [[56.50, 36.00], [54.70, 39.20]],
            strictBounds: true,
            mapStateAutoApply: true
        }).then(function(routeRes) {
            orderRoute = routeRes;

            var points = routeRes.getWayPoints(),
                lastPoint = points.getLength() - 1;
            points.options.set('preset', 'islands#darkGreenStretchyIcon');

            points.get(0).properties.set('iconContent', 'A');
            points.get(lastPoint).properties.set('iconContent', 'B');

            dexpaMap.geoObjects.add(orderRoute);
        });
    }

    function DrawOrderWithoutToAddr(fromAddr) {
        ymaps.geocode(fromAddr, {
            boundedBy: [[56.50, 36.00], [54.70, 39.20]],
            strictBounds: true,
            mapStateAutoApply: true,
            results: 1
        }).then(function(res) {
            res = res.geoObjects.get(0);
            coords = res.geometry.getCoordinates();
            orderRoute = DrawMarkWithText("A", coords);
            dexpaMap.geoObjects.add(orderRoute);
        });
    }

    function DrawRoute(from, to, drawMarks) {
        ymaps.route([from, to], {
            avoidTrafficJams: true,
            boundedBy: [[56.50, 36.00], [54.70, 39.20]],
            strictBounds: true,
            mapStateAutoApply: true
        }).then(function(routeRes) {
            EreaseSelectedOrder();
            orderRoute = routeRes;
            var points = routeRes.getWayPoints(),
                lastPoint = points.getLength() - 1;
            points.options.set('visible', false);

            dexpaMap.geoObjects.add(orderRoute);

            if (drawMarks) {
                ExperimentalDrawOrderMarks(points);
            }

        }, function(err) {
            EreaseSelectedOrder();
        });
    }

//---------Experimental Draw Order functions-----------------

    function ExperimentalDrawOrder(from, to) {
        DrawRoute(from, to, true);
    }

    function ExperimentalDrawOrderMarks(points) {
        var Apoint = points.get(0).geometry.getCoordinates();
        var Bpoint = points.get(1).geometry.getCoordinates();

        fromAddressMark = DrawMarkWithText("A", Apoint);
        dexpaMap.geoObjects.add(fromAddressMark);

        toAddressMark = DrawMarkWithText("B", Bpoint);
        dexpaMap.geoObjects.add(toAddressMark);
    }

    function ExperimentalEreaseOrder() {
        dexpaMap.geoObjects.remove(fromAddressMark);
        fromAddressMark = undefined;

        dexpaMap.geoObjects.remove(toAddressMark);
        toAddressMark = undefined;

        dexpaMap.geoObjects.remove(orderRoute);
        orderRoute = undefined;
    }

//---------Experimental Draw Order functions-----------------

    function EreaseSelectedOrder() {
        //dexpaMap.geoObjects.remove(orderRoute);
        ExperimentalEreaseOrder();
        SetMapZoomByBounds(0);
    }

    function showDriver(driver) {
        dexpaMap.setCenter([driver.location.latitude, driver.location.longitude], 12);
        driversMarks[driver.id].balloon.open();
    }

    function EreaseAllObjects() {
        driversMarks = {}; //массив отметок водителей
        driversRadiuses = {}; //массив радиусов водителей
        fromAddressMark = null; //Маркер адреса подачи
        toAddressMark = null; //Маркер адреса назначения
        fromCircleMark = null; //окружность заказа

        orderRoute = null; // route выбранного заказа
        driversArray = null;

        dexpaMap.geoObjects.removeAll();
        SetMapZoomByBounds(0);
    }


    function convertDateToString(data, flag) {
        flag = flag || false;
        var d = data.split('T');
        var time = d[1].split(':');
        var timeSec = time[2].split('.');
        var date = d[0].split('-');
        var dd = new Array();

        var dateNow = new Date();
        var day = dateNow.getDate();
        var month = (dateNow.getMonth() + 1);
        var year = dateNow.getFullYear();

        if (day == date[2] && month + 1 == date[1] && year == date[0])
            dd.push(time[0] + ':' + time[1]);
        else {
            if (flag) {
                dd.push(time[0] + ':' + time[1] + '<br>' + date[2] + "." + date[1] + "." + date[0]);
            } else {
                dd.push(date[2] + "." + date[1] + "." + date[0] + ' ' + time[0] + ':' + time[1] + ':' + timeSec[0]);
            }
        }
        return dd;
    }

    function wrappingTemplate(point, check, array) {
        var prepareTemplate = crateBalloonTemplate(array);
        var balloonTemp = DrawDriverTrackPoint(point, check, prepareTemplate);
        dexpaMap.geoObjects.add(balloonTemp);
    }

    function crateBalloonTemplate(data) {
        var strTemplate = "";
        var a = '<hr>';
        for (var i = 0; i < data.length; i++) {
            if (data.length > 1) {
                if (i == data.length - 1)
                    strTemplate += data[i];
                else
                    strTemplate += data[i] + a;
            } else
                strTemplate += data[i];
        }
        var wrapp = ymaps.templateLayoutFactory.createClass(strTemplate);
        return wrapp;
    }

    function getTime(date1, date2) {
        var d1 = date1.split('T');
        var d2 = date2.split('T');
        var time1 = d1[1].split(':');
        var time2 = d2[1].split(':');
        var date = d1[0].split('-');

        var deltH = time2[0] - time1[0];
        var deltM = time2[1] - time1[1];

    }
