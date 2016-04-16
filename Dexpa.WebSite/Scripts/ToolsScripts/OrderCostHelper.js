function GetOrderPathForCost(fromAddr, toAddr) {
    return ymaps.route([fromAddr, toAddr], { avoidTrafficJams: true });
}

function ProcessOrderPath(route, tariffId, fromAddr, toAddr) {
    var path = route.getPaths().get(0);
    var segments = path.getSegments();

    var segmentsArray = new Array();

    for (var i = 0; i < segments.length; i++) {
        var startCoords = segments[i].getCoordinates()[0];

        segmentsArray.push({
            segmentLength: segments[i].getLength(),
            time: segments[i].getJamsTime(),
            latitude: startCoords[0],
            longitude: startCoords[1]
        });
    }

    var orderPathWithTariff = {
        tariffId: tariffId,
        segments: segmentsArray,
        fromAddress: fromAddr,
        toAddress: toAddr
    };

    return $.ajax({
        url: ApiServerUrl + 'Orders/Cost/',
        method: 'POST',
        data: orderPathWithTariff,
        headers: GetHeaders()
    });
}
