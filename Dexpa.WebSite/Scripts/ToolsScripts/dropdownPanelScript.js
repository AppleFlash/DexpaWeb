var showDropDown = false;

function initialization(elementId) {
    $("#" + elementId).bind('click', function () {
        if (!showDropDown) {
            showDropDown = true;
            dropdownShow(elementId);
        } else {
            showDropDown = false;
            dropdownHide(elementId);
        }
    });
    $(document).click(function (e) {
        var container = $("#"+elementId);

        if (!container.is(e.target) && container.has(e.target).length === 0) {
            showDropDown = false;
            dropdownHide(elementId);
        }
    });
}

function dropdownShow(elementId) {
    showDropDown = true;
    $(".dropdownPanel_"+elementId).show();
}

function dropdownHide(elementId) {
    showDropDown = false;
    $(".dropdownPanel_"+elementId).hide();
}

function dropdownLoaderHide() {
    $("#dropdownPanelLoader").hide();
}

function dropdownLoaderShow() {
    $("#dropdownPanelLoader").show();
}