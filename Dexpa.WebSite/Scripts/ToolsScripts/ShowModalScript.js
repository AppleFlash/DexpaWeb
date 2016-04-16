function showModal(title, text) {
    $(".modal-title").text(title);
    $(".modal-body").text(text);
    $('#infoModal').modal({
        keyboard: false
    });
}