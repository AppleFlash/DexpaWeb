function GetHeaders() {
    return "";
    return { "Authorization": "Bearer 4XILCkcNTOGLQSCdpWxqF_5Cbg_P5hcyTFP3cod9OSdR2RP3td081CS9Kgv5qJIxrzNPc1p_dbybgxSx9gcS3L2nyiQkVM1bZ-sQlwaZGWAC-cbOOZ_u2dQKJ72d321p1v7U8y2aKlKKrI67EZA8eBy2zi0q9mX3ipWoFlB_K60JJrZQUSnBB_PVeBmhpbSc_kD8Avazh7Y-5Q0-zILy-yWrsJ3_Dt_POMbGyd_6OHQLhkTmkbH3s6zFZWzfcmoRlC5qEDNjqQZeBAuZmZqOkUDcls4-obVc7wRJdZuEDeVafmdAtyJiOC0Schw42ooyFUc-ufaMCiFqSFJ22oXt0ZfrMiIwhWlnXdK1wCoHNxfPJr40EGJ5HSGaLh370hWqRG-ZWUpbOiIw4TsBI5J1H5bVWF8_sRV8Sb9yAG_6wh8_CRZq_TMfq2KY5C_Ni2WiSbe9ETtcD0W2vybpQMMsdZzdjHMK7SH0khiCQq60KgA" };
    var name = ".AspNet.Token";
    var cookie_name = name + "=";
    var cookie_length = document.cookie.length;
    var cookie_begin = 0;
    while (cookie_begin < cookie_length) {
        var value_begin = cookie_begin + cookie_name.length;
        if (document.cookie.substring(cookie_begin, value_begin) == cookie_name) {
            var value_end = document.cookie.indexOf(";", value_begin);
            if (value_end == -1) {
                value_end = cookie_length;
            }
            return { "Authorization": unescape(document.cookie.substring(value_begin, value_end)) };
        }
        cookie_begin = document.cookie.indexOf(" ", cookie_begin) + 1;
        if (cookie_begin == 0) {
            break;
        }
    }
    return null;
}