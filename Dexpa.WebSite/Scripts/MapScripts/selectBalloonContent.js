const
    Staing = 0,
    Driving = 1,
    NewOrder = 2,
    DrivingToClient = 3,
    WaitingClient = 4,
    TransportingClient = 5,
    OrderCompleted = 6,
    OrderCancelled = 7,
    OrderFailed = 8;
const
    ReadyToWork = 0,
    NotAvailable = 1,
    Busy = 2,
    Fired = 3,
    Blocked = 4;

function selectBalloonContent(point, check) {
    var type = point.pointType;
    var state = point.driverState;
    var image = "";
    if (state == ReadyToWork)
        image = "ReadyToWork.png";
    if (state == NotAvailable || state == Fired || state == Blocked)
        image = "NotAvailable.png";
    if (state == Busy)
        image = "Busy.png";

    switch (type) {
        case Staing:
        {
            var state = "Простой";
            var nextPoint;
            for (var i = point.id + 1;;) {
                nextPoint = check.points[i];
                break;
            }
           var timeMill = GetTimeSpanMs(point, nextPoint);
           if(timeMill > 0)
                var resultTIme = GetTimeForBalloon(10, point, nextPoint);
            
           return CreateTrackPointBaloonContentStaing(point, state, resultTIme, image);
        }
        case Driving:
            {
                var state = "";
                if (type == 1)
                    state = "В пути";
                return CreateTrackPointBaloonContent(point, state, image);
            }
        case NewOrder:
        {
            var state = "Новый заказ";
                var newOrderPoint = check.orderPoints;
                for (var i = 0; i < newOrderPoint.length; i++) {
                    if (point.id === newOrderPoint[i].pointId) {
                        return CreateTrackPointBaloonContentNewOrdr(point, newOrderPoint[i], state, image);
                    }
                }
            }
        case DrivingToClient:
        case TransportingClient:
            {
                var state = "";
                if (type == DrivingToClient)
                    state = "В пути к клиенту";
                if (type == TransportingClient)
                    state = "Везу клиента";
                var drvrToClient = check.onOrderPoints;
                var address = check.orderPoints;
                for (var i = 0; i < drvrToClient.length; i++) {
                    if (point.id === drvrToClient[i].pointId) {
                        for (var j = 0; j < address.length; j++) {
                            if (drvrToClient[i].orderId === address[j].orderId)
                                return CreateTrackPointBaloonContentToClient(point, drvrToClient[i], address[j], state, image);
                        }
                    }
                }
            }
        case WaitingClient:
        {
            var state = "Ожидаю клиента";
                var waiting = check.waitingClientPoints;
                var address = check.orderPoints;
                for (var i = 0; i < waiting.length; i++) {
                    if (waiting[i].pointId === point.id) {
                        for (var j = 0; j < address.length; j++) {
                            if (waiting[i].orderId === address[j].orderId) {
                               return CreateTrackPointBaloonContentWaiting(point, waiting[i], address[j], state, image);
                            }
                        }
                    }
                }
            }
        case OrderCompleted:
        {
            var state = "Успешно завершен";
                var completed = check.onOrderPoints;
                for (var i = 0; i < completed.length; i++) {
                    if (point.id === completed[i].pointId)
                        return CreateTrackPointBaloonContentCompleted(completed[i], point, state, image);
                }
            }
        case OrderCancelled:
        {
            var state = "Отменен клиентом";
            return CreateTrackPointBaloonContentCancelled(point, state, image);
        }
        case OrderFailed:
        {
            var state = "Провален водителем";
            return CreateTrackPointBaloonContentFailed(point, state, image);
        }
        default:
    }
}

function selectEmptyBalloonContent(point) {
    var state = "Новый заказ";
    return CreateTrackPointEmptyBaloonContent(point, state);
}

function CreateTrackPointBaloonContentStaing(point, state, resultTime, image) {
    return '<table class="smallFontSize baloonTable">' +
        '<tr>'+
            '<td rowspan="3"><img class="imageBalloon" src="/Content/Images/DriverState/' + image + '"></td>' +
            '<td class="addrPos">' + state + '</td>' +
        '</tr>'+
        '<tr><td class="addrPosClassic"> ' + resultTime + '</td></tr>' +
        '</table>';
}

function CreateTrackPointBaloonContent(point, state, image) {
    return '<table class="smallFontSize baloonTable">' +
        '<tr>' +
            '<td rowspan="4"><img class="imageBalloon" src="/Content/Images/DriverState/' + image + '"></td>' +
            '<td class="addrPos" colspan="2">' + state + '</td>' +
        '</tr>' +
        '<tr><td class="addrPosClassic" colspan="2">' + convertDateToString(point.timestamp) + '</td></tr>' +
        '<tr><td class="textRight">Скорость:</td><td> ' + Math.round(point.speed) + ' км/ч</td></tr>' +
        '<tr><td class="textRight">Направление:</td><td> ' + point.direction + '</td></tr>' +
        '</table>';
}
function CreateTrackPointBaloonContentNewOrdr(point, newOrdr, state, image) {
    return '<table class="smallFontSize baloonTable">' +
        '<tr>'+
            '<td rowspan="4"><img class="imageBalloon" src="/Content/Images/DriverState/' + image + '"></td>' +
            '<td class="addrPos">' + state + '</td>' +
            
        '</tr>' +
        '<tr><td class="addrPosClassic">' + convertDateToString(point.timestamp) + '</td></tr>' +
        '<tr><td colspan="2" class="addrPosClassic"><a href="/Dispatcher/ShowOrder/' + newOrdr.orderId + '">Заказ №' + newOrdr.orderId + '</a>' +
        ' по адресу:</td></tr>' +
        '<tr><td class="addrPosClassic">' + newOrdr.fromAddress + ' в ' + convertDateToString(newOrdr.date) + '</td></tr>' +
        '</table>';
}
function CreateTrackPointBaloonContentToClient(point, onOrder, addrss, state, image) {
    return '<table class="smallFontSize baloonTable">' +
            '<tr>'+
                '<td rowspan="4"><img class="imageBalloon" src="/Content/Images/DriverState/' + image + '">' +
                '<td class="addrPos" colspan="2">' + state + '</td>' +
            '</tr>' +
            '<tr><td class="addrPosClassic" colspan="2">' + convertDateToString(point.timestamp) + '</td></tr>' +
            '<tr><td class="textRight">Скорость:</td><td> ' + Math.round(point.speed) + ' км/ч</td></tr>' +
            '<tr width="100"><td class="textRight">Направление:</td><td> ' + point.direction + '</td></tr>' +
        '<table class="smallFontSize baloonTable">' +
         '<tr><td><a href="/Dispatcher/ShowOrder/' + onOrder.orderId + '">Заказ №' + onOrder.orderId + '</a>' +
            ' по адресу:' + addrss.fromAddress + '<br>в ' + convertDateToString(addrss.date) + '</td></tr>' +
        '</table>' +
        '</table>' +
        '<table class="smallFontSize baloonTable centerTable">' +
            '<tr><td colspan="2" class="addrPos">На таксометре (подача)</td></tr>' +
            '<tr><td class="textRight">Расстояние город:</td><td> ' + onOrder.distanceCity + ' км</td></tr>' +
            '<tr><td class="textRight">Расстояние загород:</td><td> ' + onOrder.distanceOutCity + ' км</td></tr>' +
            '<tr><td class="textRight">Время город:</td><td> ' + onOrder.timeCity + ' мин</td></tr>' +
            '<tr><td class="textRight">Время загород:</td><td> ' + onOrder.timeOutCity + ' мин</td></tr>' +
            '<tr><td class="textRight"><b>Сумма:</td><td> <b>' + onOrder.cost + ' руб</b></td></tr>' +
        '</table>' +
        '</div>';
}
function CreateTrackPointBaloonContentWaiting(point, waiting, addrss, state, image) {
    return '<table class="smallFontSize baloonTable">' +
        '<tr>' +
        '<td rowspan="4" ><img class="imageBalloon" src="/Content/Images/DriverState/' + image + '">' +
        '<td class="addrPos" colspan="3">' + state + '</td>' +
        '</tr>' +
        '<tr><td class="addrPosClassic" colspan="3">На месте с ' + convertDateToString(point.timestamp, true) + '</td></tr>' +
        '<tr><td class="addrPosClassic" colspan="3"> ' + ((waiting.delay > 0) ? '<span class="delay">Опоздание ' :
                '<span class="ontime">Вовремя за ') + Math.abs(waiting.delay) + ' мин</span></td></tr>' +
        '</table>' + 
        '<table class="smallFontSize baloonTable">' +
        '<tr><td><a href="/Dispatcher/ShowOrder/' + waiting.orderId + '">Заказ №' + waiting.orderId + '</a>' +
            ' по адресу:' + addrss.fromAddress + '<br>в ' + convertDateToString(addrss.date) + '</td></tr>' +
        '</table>' +
        '<table class="smallFontSize baloonTable centerTable">' +
            '<tr><td colspan="2" class="addrPos">На таксометре</td></tr>' +
            '<tr><td class="textRight">Бесплатное ожидание:</td><td> ' + waiting.freeWaiting + ' мин</td></tr>' +
            '<tr><td class="textRight">Платное ожидание:</td><td> ' + waiting.paidWaiting + ' мин</td></tr>' +
            '<tr><td class="textRight"><b>Стоимость ожидания:</td><td> <b>' + waiting.waitingCost + ' руб</b></td></tr>' +
        '</table>' +
        '</table>';
}
function CreateTrackPointBaloonContentCompleted(cmpld, point, state, image) {
    return '<table class="smallFontSize baloonTable">' +
            '<tr>' +
                '<td rowspan="3"><img class="imageBalloon" src="/Content/Images/DriverState/' + image + '"></td>' +
                '<td class="addrPosClassic"><a href="/Dispatcher/ShowOrder/' + cmpld.orderId + '">Заказ №' + cmpld.orderId + '</a></td>' +
            '</tr>' +
            '<tr><td class="colorText">' + state + '</td></tr>' +
            '<tr><td class="addrPosClassic">' + convertDateToString(point.timestamp) + '</td></tr>' +
        '</table>'+
            '<table class="smallFontSize baloonTable">' +
            '<tr><td colspan="2" class="addrPos">На таксометре</td></tr>' +
            '<tr>' +
                '<td class="textRight">Расстояние город:</td>' +
                '<td> ' + cmpld.distanceCity + ' км</td>' +
            '</tr>' +
            '<tr><td class="textRight">Расстояние загород:</td><td> ' + cmpld.distanceOutCity + ' км</td></tr>' +
            '<tr><td class="textRight">Время город:</td><td> ' + cmpld.timeCity + ' мин</td></tr>' +
            '<tr><td class="textRight">Время загород:</td><td> ' + cmpld.timeOutCity + ' мин</td></tr>' +
            '<tr><td class="textRight"><b>Сумма:</td><td> <b>' + cmpld.cost + ' руб</b></td></tr>' +
        '</table>';
}
function CreateTrackPointBaloonContentCancelled(cnsld, state, image) {
    return '<table class="smallFontSize baloonTable">' +
        '<tr>' +
        '<td colspan="3"><img class="imageBalloon" src="/Content/Images/DriverState/' + image + '"></td>' +
        '</tr>' +
        '<tr><td class="addrPosClassic"><a href="/Dispatcher/ShowOrder/' + cnsld.orderId + '">Заказ №' + cnsld.orderId + '</a></td></tr>' +
        '<tr><td class="colorTxtPnt">' + state + '</td></tr>' +
        '<tr><td> ' + convertDateToString(cnsld.timestamp) + '</td></tr>' +
        '</table>';
}
function CreateTrackPointBaloonContentFailed(fld, state, image) {
    return '<table class="smallFontSize baloonTable">' +
            '<tr>' +
                '<td colspan="3"><img class="imageBalloon" src="/Content/Images/DriverState/' + image + '"></td>' +
            '</tr>' +
        '<tr><td class="addrPosClassic"><a href="/Dispatcher/ShowOrder/' + fld.orderId + '">Заказ №' + fld.orderId + '</a></td></tr>' +
        '<tr><td class="colorTxtPnt">' + state + '</td></tr>' +
        '<tr><td> ' + convertDateToString(fld.timestamp) + '</td></tr>' +
        '</table>';
}
function CreateTrackPointEmptyBaloonContent(newOrdr, state) {
    return '<table class="smallFontSize baloonTable">' +
    '<tr><td class="addrPos">' + state + '</td></tr>' +
        '<tr><td class="addrPosClassic"> ' + convertDateToString(newOrdr.timestamp) + '</td></tr>' +
        '<tr><td><a href="/Dispatcher/ShowOrder/' + newOrdr.orderId + '">Заказ №' + newOrdr.orderId + '</a>' +
        ' по адресу:<br>' + newOrdr.fromAddress + 'в ' + convertDateToString(newOrdr.date) + '</td></tr>' +
        '</table>';
}
