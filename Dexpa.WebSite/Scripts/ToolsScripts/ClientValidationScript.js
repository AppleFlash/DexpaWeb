function validateForm(formID) {
    var form = document.getElementById(formID);

    var formElements = form.elements;

    var validateResult = 1;

    for (var i = 0; i < formElements.length; i++) {
        if (formElements[i].attributes.validate != undefined) {
            if (formElements[i].attributes.validate.value == "true") {
                //console.log(formElements[i].type + " - " + formElements[i].id + " - " + formElements[i].value);
                if (formElements[i].value != "? object:null ?" && formElements[i].value != "" && formElements[i].value != '?' && formElements[i].value != "? undefined:undefined ?") {
                    validateResult *= 1;
                }
                else {
                    validateResult *= 0;
                    location.href = "#" + formElements[i].id;
                    var validationMessage = "";
                    if (formElements[i].attributes.validationInfo != undefined) {
                        validationMessage = formElements[i].attributes.validationinfo.value;
                    } else {
                        break;
                    }
                    showNotification('danger', 'Поле "' + validationMessage + '" пустое');
                    break;
                }
            }
        }
    }

    return validateResult;
}

function errorHandling(message) {
    if (message.responseJSON.modelState == undefined) {
        return message.responseJSON.message;
    } else {
        for (var i in message.responseJSON.modelState) {
            return message.responseJSON.modelState[i][0];
        }
    }
}