

var FilterOption;

var strScriptVersion = "1.0031";
var selectedValues = new Array();
var return_value_ = true;
var temp_space = '';
var form_has_been_called = false;
var callback_list = "";
var lang = "en-za";
var pendingReq = 0;
var msg_error_ = '<div><table cellpadding="0" cellspacing="0"><tr><td class="paragraph" style="border:1px solid #535353; margin:0px; background-color:#63BF06; color:#FFF"><span  class="Paragraph" style="Color:White" >&nbsp;Oops....</span></td></tr><tr><td style="border:1px solid #535353; margin:0px;"><p>Due to technical difficulties, the information you require is not available at the moment. <br/>Please try again later</p><br/></td></tr></table></div>';

var userType = '';
var userDetail = '';

var menu;

$(document).ready(function(){
    $({ cache: false });
});


/* JS String case convert */
String.prototype.toTitleCase = function () {
    var i, str, lowers, uppers;
    str = this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless 
    // they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
    'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
    for (i = 0; i < lowers.length; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
            function (txt) {
                return txt.toLowerCase();
            });

    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id', 'Tv'];
    for (i = 0; i < uppers.length; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
            uppers[i].toUpperCase());

    return str;
}
/* JS String case convert */

function TitleText() {
    $(".CapText").each(function () { $(this).text($(this).text().toTitleCase()); });
}




/********************************************************************************
*							                       								*
*								Dim screen object								*
*							                       								*
********************************************************************************/

(function () {

    function Page_Dimmer_Init(speed, opacity) {
        this.ShowSpeed = speed;
        this.DimOpacity = opacity;

        this.Show = function (item, callback) {
            if (typeof (jQuery('div._page_dimmer')[0]) === 'undefined') {

                if (typeof (item) === 'function') { callback = item; item = null; }

                var dim = jQuery('<div/>').addClass('_page_dimmer');
                dim.css({
                    background: '#000',
                    height: jQuery(document).height() > jQuery(window).height() ? jQuery(document).height() : jQuery(window).height(),
                    left: '0px',
                    opacity: 0,
                    position: 'fixed',
                    top: '0px',
                    width: jQuery(window).width(),
                    zIndex: 999
                });


                jQuery(item ? document.getElementById(item) : document.body.firstChild).before(dim);
                dim.fadeTo(this.ShowSpeed, this.DimOpacity, function () {
                    if (typeof (callback) === 'function') {
                        callback();
                    }
                });
            }
        };
        this.Stop = function (callback) {
            var dim = jQuery('._page_dimmer');
            dim.fadeOut(this.ShowSpeed,
				function () {
				    dim.remove();
				    if (typeof (callback) === 'function') {
				        callback();
				    }
				});
        };
    };


})();

/********************************************************************************
*							                       								*
*								Cookie handlers 								*
*							                       								*
********************************************************************************/



var DateClass = function () {

    this.month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    this.monthAvb = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    this.weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


    this.GetTheWeek = function (val) {
        return this.weekday[val];
    }

    this.GetTheMonth = function (val) {
        return this.month[val];
    }
    this.GetTheShortMonth = function (val) {
        return this.monthAvb[val];
    }
};

var dateClass = new DateClass();



$(window).resize(function () {
});





/**********************************************/
/******* CUSTOM DROP DOWN STUFF           *****/
/**********************************************/
function Close() {
    $('.DropDownListOptions').css('display', 'none');
}




$(document).click(function (event) {
    // If clicked anywhere outside the dropdown list boxes, hide dropdown boxes.
    // IMPROVMENT : Instead of per class, maybe per controls (?)
    if (!($(event.target).parents().andSelf().is('.DropDownList'))) {
        $('.DropDownListOptions').css('display', 'none');
    }
});



function PerformCall(url, data, control) {

    var divName = control;
    var curHtml = $("#" + control).html();
    $("#" + control).children().remove();
    $("#" + control).html("<div id='" + divName + "_new'></div><div id='" + divName + "_load'></div><div id='" + divName + "_old'></div>");
    $("#" + control + "_old").html(curHtml);
    $("#" + control + "_old").hide("fast");

    if (lang == "af-za")
        $("#" + control + "_old").html("Laai tans...<br/><img src='" + rootUrl + "images/ajax_loader.gif'/>");
    else
        $("#" + control + "_old").html("Loading...<br/><img src='" + rootUrl + "images/ajax_loader.gif'/>");
    while (data.toString().indexOf("'") > -1) {
        data = data.toString().replace("'", "\\\"");
    }

    var timeout = 100;
    if (!form_has_been_called) {
        timeout = 1500;
        form_has_been_called = true;
    }

    setTimeout("PerformCall_F('" + url + "','" + data + "','" + control + "_new');", timeout);
}



function PerformCallC(url, data, control) {
    var divName = control;
    var curHtml = $("#" + control).html();
    $("#" + control).children().remove();
    $("#" + control).html("<div id='" + divName + "_new'></div><div id='" + divName + "_load'></div><div id='" + divName + "_old'></div>");
    $("#" + control + "_old").remove();
    $("#" + control + "_old").html(curHtml);
    $("#" + control + "_old").hide("fast");

    if (lang == "af-za")
        $("#" + control + "_load").html("Laai tans...<br/><img src='" + rootUrl + "images/ajax_loader.gif'/>");
    else
        $("#" + control + "_load").html("Loading...<br/><img src='" + rootUrl + "images/ajax_loader.gif'/>");

    while (data.toString().indexOf("'") > -1) {
        data = data.toString().replace("'", "\\\"");
    }
    setTimeout("PerformCallC_F('" + url + "','" + data + "','" + control + "');", 100);
}



function PerformCall_F(url, data, control) {
    $.ajax({
        url: url,
        data: data,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        async: true,
        success: function (data, e) {

            var nextCall = callback_list = callback_list.split('|||')[0];
            callback_list = callback_list.replace(nextCall, '');
            if (callback_list[0] == '|') {
                callback_list = callback_list.replace('|||', '');
            }
            $("#" + control).children().remove();
            $("#" + control).hide();
            $("#" + control).html(data.d);
            $("#" + control).show("slow");
            setTimeout(nextCall, 200);

        },
        error: function (data) {
            $("#" + control).html(msg_error_);
        }
    });
}


function PerformValidations() {
    var iValidator = 0;
    for (iValidator = 0; iValidator < xmlDoc.iNumOfValidators; iValidator++) {
        if (xmlDoc.lstValidators[iValidator].sType == "FileCheck") {

            $("#divLoader_").append("<p>" + xmlDoc.lstValidators[iValidator].sDisplayName + "</p><div id='divSection_" + iValidator + "'></div>");
            var FileValidationCheck = '[';
            var xParts = 0;
            while (xmlDoc.lstValidators[iValidator].objValue.arrParts[xParts] != null) {
                FileValidationCheck += '["' + xmlDoc.lstValidators[iValidator].objValue.arrParts[xParts][1] + '",';
                switch (xmlDoc.lstValidators[iValidator].objValue.arrParts[xParts][0]) {
                    case "StaticText":
                        FileValidationCheck += '""]';
                        break;
                    case "QueryString":
                        FileValidationCheck += '"' + getParameter(xmlDoc.lstValidators[iValidator].objValue.arrParts[xParts][1]) + '"]';
                        break;
                    default:
                        break;
                }
                FileValidationCheck += ",";
                xParts++;
            }
            FileValidationCheck += "['','']";
            FileValidationCheck += ']';

            PerformCallC(xmlDoc.strUrl + "WebServices/DynoServices.asmx/FileValidationCheck", BuildString("sConnID", xmlDoc.sUID) + ", 'arrFilters': " + FileValidationCheck + "," + BuildString("iIndex", iValidator + ''), "divSection_" + iValidator + "");
            iCall++;
        }
        else if (xmlDoc.lstValidators[iValidator].sType == "SpatialCheck") {
            $("#divLoader_").append("<p>" + xmlDoc.lstValidators[iValidator].sDisplayName + "</p><div id='divSection_" + iValidator + "'></div>");
            var FileValidationCheck = '[';
            for (var xParts = 0; xParts < xmlDoc.lstValidators[iValidator].objValue.iValidatorParamCount; xParts++) {
                FileValidationCheck += '["' + xmlDoc.lstValidators[iValidator].objValue.arrParts[xParts][1] + '",';
                switch (xmlDoc.lstValidators[iValidator].objValue.arrParts[xParts][0]) {
                    case "StaticText":
                        FileValidationCheck += '""]';
                        break;
                    case "QueryString":
                        FileValidationCheck += '"' + getParameter(xmlDoc.lstValidators[iValidator].objValue.arrParts[xParts][1]) + '"]';
                        break;
                }
                FileValidationCheck += ",";
            }
            FileValidationCheck += '["",""]';
            FileValidationCheck += ']';

            PerformCallC(xmlDoc.strUrl + "WebServices/DynoServices.asmx/DoSpatialFilter", BuildString("sConnID", xmlDoc.sUID) + ", 'arrFilters': " + FileValidationCheck + "," + BuildString("iIndex", iValidator + ''), "divSection_" + iValidator + "");
            iCall++;
        }
    }

    if (iValidator == 0) {
        BuildInputForm();
    }
}

var xmlDoc;
function loadXMLString(txt) {

    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(txt, "text/xml");
    }
    else // Internet Explorer
    {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(txt);
    }
}


var JSON_ERROR_;

function PerformCallC_F(url, data, control) {
    $.ajax({
        url: url,
        data: "{ " + data + "}",
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        async: true,
        success: function (data, e) {
            $("#" + control).children().remove();
            $("#" + control).html(data.d);

            var nextCall = callback_list = callback_list.split('|||')[0];
            callback_list = callback_list.replace(nextCall, '');
            if (callback_list[0] == '|') {
                callback_list = callback_list.replace('|||', '');
            }
            eval(nextCall);


        },
        error: function (data) {
            if (data.status == "200") {
                $("#" + control).children().remove();
                $("#" + control).html(data.responseText);

                var nextCall = callback_list = callback_list.split('|||')[0];
                callback_list = callback_list.replace(nextCall, '');
                if (callback_list[0] == '|') {
                    callback_list = callback_list.replace('|||', '');
                }
                eval(nextCall);
                
            }
            else {
                JSON_ERROR_ = data;
                $("#" + control).html(msg_error_);
            }
        }
    });
}

function PerformCallP(url, data, control) {
    if (lang == "af-za")
        $("#" + control).html("Laai tans...<br/><img src='" + rootUrl + "images/ajax_loader.gif'/>");
    else
        $("#" + control).html("<img src='" + rootUrl + "images/ajax_loader.gif'/>");

    setTimeout("PerformCallP_F('" + url + "','" + data + "','" + control + "');", 100);
}


function PerformCallP_F(url, data, control) {
    $.ajax({
        url: url,
        data: data,
        type: "GET",
        dataType: "json",
        contentType: "text/html; charset=utf-8",
        async: true,
        success: function (data, e) {
            $("#" + control).children().remove();
            $("#" + control).html(data);

            var nextCall = callback_list = callback_list.split('|||')[0];
            callback_list = callback_list.replace(nextCall, '');
            if (callback_list[0] == '|') {
                callback_list = callback_list.replace('|||', '');
            }
            eval(nextCall);


        },
        error: function (data) {
            $("#" + control).html(data.responseText);
        }
    });
}


function PerformCallXML(url, data, control) {
    if (lang == "af-za")
        $("#" + control).html("Laai tans...<br/><img src='" + rootUrl + "images/ajax_loader.gif'/>");
    else
        $("#" + control).html("<img src='" + rootUrl + "images/ajax_loader.gif'/>");

    setTimeout("PerformCallXML_F('" + url + "','" + data + "','" + control + "');", 100);
}


function PerformCallXML_F(url, data, control) {
    $.ajax({
        url: url,
        data: data,
        type: "POST",
        contentType: "text/xml; charset=utf-8",
        async: true,
        success: function (data, e) {
            $("#" + control).children().remove();
            $("#" + control).html(data);

            var nextCall = callback_list = callback_list.split('|||')[0];
            callback_list = callback_list.replace(nextCall, '');
            if (callback_list[0] == '|') {
                callback_list = callback_list.replace('|||', '');
            }
            eval(nextCall);


        },
        error: function (data) {
            $("#" + control).html(data.responseText);
        }
    });
}


function LoadPageControl(page, cntrl) {
    PerformCallC(rootUrl + ListAllTransactions(), BuildString('strFilterDetail', page), cntrl);
}

function ListAllTransactions() {
    if (FilterOption["COMPILER"] == "PHP") {
        return "Logic/Engine/GetContent.php";
    }
    else {
        return "WebServices/CMS.asmx/ListAllTransaction";
    }
}

function splitNo(val) {
    while (val.indexOf('[COMMA]') > 0) { val = val.replace('[COMMA]', ','); }
    while (val.indexOf('[QUOT_INNER]') > 0) { val = val.replace('\'', ','); }

    PerformCallC(val.split('COMMA_MAIN')[0], val.split('COMMA_MAIN')[1], val.split('COMMA_MAIN')[2]);

    return val;
}


function AddQuot() {
    return "◘";
}

function AddQuotS() {
    return "╞";
}

function BuildString(name, value) {
    return '"' + name + '" : "' + DecodeString(value) + '"';
}

function ShowHideData(id) {

   
    if ($('#tbl_' + id + '_data').css('display') == 'none') {
        $('#tbl_' + id + '_data').show('slow');
        $('#tbl_' + id + '_container').css('color', '#390');
        $('#tbl_' + id + '_container .fa').attr("class", "fa fa-minus");

        try {
            var spl = id.split('grid_');
            if (spl.length == 2)
                if ($("#div" + spl[1]).length != 0) {
                    eval("fun_" + spl[1] + "('" + spl[0] + "');");
                }
        }
        catch (err) {
        }
    }
    else {
        $('#tbl_' + id + '_data').hide('fast');
        $('#tbl_' + id + '_container').css('color', '#390');
        $('#tbl_' + id + '_container .fa').attr("class", "fa fa-plus");
    }
}


function addComma(val) {
    while (val.toString().indexOf('[COMMA]') > 0)
        val = val.toString().replace('[COMMA]', ',');

    return val;
}

function splitComma(val) {
    return val.toString().split('[COMMA]');
}

function addMinus(val) {
    while (val.toString().indexOf('[MINUS]') > 0)
        val = val.toString().replace('[MINUS]', '-');

    return val;
}


var FileUploadBusy = false;
function ClientLoadFile(id) {
    if (FileUploadBusy == true) {
        window.alert("File upload in progress. Please wait.");
        return;
    }
    if ($('#frame').contents().find('#lblRef').length == 0) {
        window.alert("Please wait for the form to finish loading.");
        return;
    }
    $('#frame').contents().find('#lblRef').text("");
    $('#frame').contents().find('#fuFileLoader').trigger("click");

    $('#lblFileMsg').text((lang == "af-za" ? "Wag asseblief totdat die vorm volledig gelaai het voordat jy 'n volgende vorm aanheg of op \"stuur\" kliek." : "Please wait for the file name to appear before proceeding"));
    FileUploadBusy = true;
    checkUploadStatus(id);
}


function checkUploadStatus(id) {
    var name = $('#frame').contents().find('#lblRef').text();
    if (name == "") {
        setTimeout('checkUploadStatus("' + id + '");', 1200);
        return;
    }
    else {
        if (name == "0") {
            window.alert("File upload failed. Please try again.");
            FileUploadBusy = false;
            return;
        }
        $("#lblFileMsg").html((lang == "af-za" ? "Suksesvol opgelaai." : "Upload complete."));
        eval(id + " = " + id + " + '" + name.split('|')[1] + ",';");
        var count = eval(id + ".split(',').length;");
        var nameVal = name.split('|')[3];
        var imageAtt = name.split('|')[4];
        var ref_ = name.split('|')[1];
        $("#ref_" + id).html($("#ref_" + id).html() + "<p id='Uploader_" + count + "'><img src='" + imageAtt + "' /> &nbsp;&nbsp;" + eval(id + "_READY_STRING").replace('[REF_NO]', nameVal) +
                    " <a class='clsFileRemove' href='javascript:RemoveFile(\"" + ref_ + "\", \"" + id + "\"," + count + ");'> " + (lang == "af-za" ? "Verwyder" : "Remove") + " </a></p>");
        FileUploadBusy = false;
    }
}


function RemoveFile(ref, id, count) {
    eval(id + " = " + id + ".replace('" + ref + ",','');");
    $("#Uploader_" + count).hide();
}

function SelectCheckbox(e) {
    var cntrlName = $(e).children(0).attr("id").split('_');
    $(".rdoCls_" + cntrlName[3]).removeAttr('checked');

    $("#rdo_" + cntrlName[1] + "_" + cntrlName[2] + "_" + cntrlName[3]).attr("checked", "checked");
}

function SelectNext(ID, cntrl, section) {
    $(".rdoCls_" + section).removeAttr('checked');
    $("#rdo_" + ID + "_" + cntrl + "_" + section).attr("checked", "checked");
    selectedValues[section] = cntrl;
}



function GetCheckedItems(controlName) {
    var list;
    list = $("#" + controlName);



    var temp_bindData = '';
    for (var oCounter = 0; oCounter < list.length; oCounter++) {
        temp_bindData += $(list[oCounter]).val() + ",";
    }
    return temp_bindData;
}



var numbers = "1234567890";
var alpha = "qwertyuioplkjhgfdsazxcvbnm";
var space = " ";
/*
*   control = The control (this/'#txtMyInput') - Whille be used like this $(control)...
*   type =  Type of allowed characters : 1 : Numbers only, 2 : Alpha only, 3 : Alpha and numbers, 4 :numbers and space, 5 :Alpha and spaces (no numbers), 6:all
*   maxAllowed = Maximum characters allowed in field
*   
*/
function ValidateScript(control, type, maxAllowed, search_function, e) {
    return_value_ = false;
    var validatingText = "";

    var charCode;

    if (e && e.which) {
        charCode = e.which;
    } else if (window.event) {
        e = window.event;
        charCode = e.keyCode;
    }

    if (charCode == 13) {
        eval(search_function);
        setTimeout('return_value_=true;', 200);
        return;
    }

    if (type == 1) {
        validatingText = numbers;
        // BNumbers only, so ensure it is valid for the sake of sum
    }
    else if (type == 2)
        validatingText = alpha
    else if (type == 3)
        validatingText = alpha + numbers;
    else if (type == 4)
        validatingText = space + numbers;
    else if (type == 5)
        validatingText = space + alpha;
    else if (type == 6)
        validatingText = space + alpha + numbers;
    var out_ = "";

    var txtToCompare = $(control).val(); // Get the value

    if (txtToCompare.length > maxAllowed) {
        txtToCompare = txtToCompare.substr(0, maxAllowed - 1);
    }


    for (var char = 0; char < txtToCompare.length; char++) { // Loop the value 'v','a','l','u','e'
        for (var test_pos = 0; test_pos < validatingText.length; test_pos++) { // Loop the chars to test
            if (txtToCompare[char].toString().toLowerCase().indexOf(validatingText[test_pos].toString().toLowerCase()) != -1) {
                // If a match was found, approve
                test_pos = validatingText.length; // match found
                out_ += txtToCompare[char].toString(); // Att to ret word
            }
        }
    }

    if (type == 1) {
        out_ = parseInt(out_, 10) + "";
        if (isNaN(parseInt(out_, 10)))
            out_ = "0";
        $(control).val(out_);
    }

    setTimeout('return_value_=true;', 200);
}



function CloseMainPopupWindow() {

    $(".close").trigger("click");
}


function LoadPopupPage(page) {
    popUp("<div id='divPopupWindow'></div>");
    LoadPageControl(page, "divPopupWindow");
}

function popUpT(html,title) {


    $("#divTempSpace").html("<a action='ShowEmptyPopupWindow' data-toggle='modal' href='#ConfirmDelete_masterpopup'></a>");
    $("[action='ShowEmptyPopupWindow']").trigger("click");

    $("#ConfirmDelete_masterpopup .modal-title").html(title);
    $("#divPopupExtra").html(html);
    return;

}

function popUp(html) {


    $("#divTempSpace").html("<a action='ShowEmptyPopupWindow' data-toggle='modal' href='#ConfirmDelete_masterpopup'></a>");
    $("[action='ShowEmptyPopupWindow']").trigger("click");

    $("#EmptyPopupWindow_Dialog").html(html);
    return;

    $("#divContent").html("<table><tr><td>" + html + "</td></tr></table>");

    $("#divContent").attr("title", "Information");
    $("#divContent").dialog({
        model: true, height: "auto", width: 600,

        buttons: {

            Close: function () {

                $(this).dialog("close");

            }
        }
    });
    $("#divContent").css("width", (parseInt($("body").width()) - 200) + "px");
    //$(this).scrollTop(0);
}

function popUpH(html, H) {
    $("#divContent").html("<table><tr><td>" + html + "</td></tr></table>");
    //$("#pnlPopup").show();
    //$("#pnlPopup").css('height', H);
    // $(this).scrollTop(0);
    if (FilterOption["Login"] != undefined || FilterOption["Login"] == "JQUERY") {
        $("#divContent").attr("title", "Information");
        $("#divContent").dialog(
            {
                model: true, height: "auto", width: 600,
                buttons: {

                    Close: function () {

                        $(this).dialog("close");

                    }
                }
            });
    }
    $("#divContent").css("width", (parseInt($("body").width()) - 200) + "px");
}


function initUpdate(str) {
    var send_ = str.split('SPL_SNC')[0] + ';||DATA_SPLIT||';

    var arr = str.split('SPL_SNC')[1].split('SP_');

    for (var iLen = 0; iLen < arr.length; iLen++) {
        if (arr[iLen] == "")
            continue;
        send_ += arr[iLen].split('=')[0] + "||VALUE_SPLIT||" + $("#" + arr[iLen].split('=')[1]).val() + "||COLUMN||";
    }
    send_ += "||SPLIPT_ROW||";

    PerformCallC(rootUrl + "CMS/Web/Transaction.asmx/ExecuteDataTransactUpdate", BuildString("strData", send_), "divDefaultSpinner");
}



function UpdateDataFields(grid, value, id, column, cntrl) {
    PerformCallC(rootUrl + "CMS/Web/Transaction.asmx/ExecuteMassGridInsert", BuildString('grid', grid) + ", " + BuildString('value', value) + "," + BuildString('id', id) + ", " + BuildString('column', column) + "", cntrl);
}


$(function () {
    initTest();
    if ($('.sow').length > 0) { $('.sow').tipsy({ width: '600px', opacity: 1, gravity: 'se', html: true }); }

    // send all page load nitification
    SendTracking("SiteLoad");
    ;
    // Send au
});


function StartEdit(bloc) {
    $("div[ViewBloc=" + bloc + "EDIT]").show();
    $("div[ViewBloc=" + bloc + "VIEW]").hide();
}

function StopEdit(bloc) {
    $("div[ViewBloc=" + bloc + "VIEW]").show();
    $("div[ViewBloc=" + bloc + "EDIT]").hide();
}


StopEdit

function ChangeAttriubute(cntrl) {

    if ($("#" + cntrl).attr('checked') == 'checked')
        $("#" + cntrl).removeAttr('checked');
    else
        $("#" + cntrl).attr('checked', 'checked');
}



function SendTracking(content) {

    return;
    SendAdvTracking(content, "Send VIA  (SendTracking)", "3");
    return;
    // send page load nitification
    var fle = "U_" + new Date().format("yyyyMMdd");
    var send_ = "2;;" + fle + ";Data788212Audits788212SubmitTracking788212" + fle + ";;;||DATA_SPLIT||";
    send_ += "UserID||VALUE_SPLIT||" + userDetail + "||COLUMN||";
    send_ += "UserType||VALUE_SPLIT||" + userType + "||COLUMN||";
    send_ += "URL||VALUE_SPLIT||" + window.location.href + "||COLUMN||";
    send_ += "ButtonFile||VALUE_SPLIT||" + content + "||COLUMN||";
    send_ += "TimeStamp||VALUE_SPLIT||[TIME_STAMP]||COLUMN||";
    // Send au
    PerformCallC(rootUrl + "CMS/Web/Transaction.asmx/ExecuteDataTransactUpdate", BuildString("strData", send_), "divDefaultSpinner");
}


function SendAdvTracking(content, vals, eventType) {
    if (content.indexOf("FileUploader.aspx") != -1) {
        /* Dont log the fileuploader.... yet....*/
        return;
    }
    /* send page load nitification */
    var userTpy2 = "";
    try {
        if (super_no === undefined) { } else { userTpy2 = super_no; }
    }
    catch (err) { }
    var send_ = "4;;;;;||DATA_SPLIT||";
    send_ += "UserID||VALUE_SPLIT||" + userDetail + "||COLUMN||";
    send_ += "UserType||VALUE_SPLIT||" + userType + "||COLUMN||";
    send_ += "URL||VALUE_SPLIT||" + window.location.href + "||COLUMN||";
    send_ += "PageFolder||VALUE_SPLIT||" + content.split(' - ')[0] + "||COLUMN||";
    send_ += "PageName||VALUE_SPLIT||" + content.split(' - ')[1] + "||COLUMN||";
    send_ += "ButtonName||VALUE_SPLIT||" + content.split(' - ')[2] + "||COLUMN||";
    send_ += "EventType||VALUE_SPLIT||" + eventType + "||COLUMN||";
    send_ += "SuperUser||VALUE_SPLIT||" + userTpy2 + "||COLUMN||";
    send_ += "ScriptVersion||VALUE_SPLIT||" + strScriptVersion + "||COLUMN||";

    var inputs = "";
    for (var iCounter = 0; iCounter < vals.split(';') ; iCounter++) {
        inputs += (vals.split(';')[iCounter].split('=')[0]) + "=" + eval((vals.split(';')[iCounter].split('=')[1])) + ";";
    }
    send_ += "ValuesPassed||VALUE_SPLIT||" + inputs + "||COLUMN||";
    // Send au
    PerformCallC(rootUrl + "CMS/Web/Transaction.asmx/ExecuteDataTransact", BuildString("strData", send_), "divDefaultSpinner");
}



function CMS_NextPage(ID, iPage) {
    if ($("[pagingitem='tbl_Page_" + ID + "_" + (iPage + 1) + "']").length == 0) {
        return iPage;
    }
    $("[pagingitem='tbl_Page_" + ID + "_" + (iPage + 1) + "']").show();
    $("[pagingitem='tbl_Page_" + ID + "_" + iPage + "']").hide();
    iPage++;
    $("#spn_ID_" + ID + "_PAGE").html((iPage + 1) + '');


    return iPage;
}


function CMS_PrevPage(ID, iPage) {
    if (iPage == 0 || iPage == undefined) {
        return 0;
    }
    $("[pagingitem='tbl_Page_" + ID + "_" + (iPage - 1) + "']").show();
    $("[pagingitem='tbl_Page_" + ID + "_" + iPage + "']").hide();
    iPage--;

    $("#spn_ID_" + ID + "_PAGE").html((iPage + 1) + '');


    return iPage;
}




function CMS_FirstPage(ID, iPage) {
    if (iPage == 0) {
        return 0;
    }
    $("[pagingitem='tbl_Page_" + ID + "_" + 0 + "']").show();
    $("[pagingitem='tbl_Page_" + ID + "_" + iPage + "']").hide();
    iPage = 0;

    $("#spn_ID_" + ID + "_PAGE").html((1) + '');


    return iPage;
}

function CMS_LastPage(ID, iPage, iLastP) {
    if (iPage == iLastP) {
        return iLastP;
    }
    $("[pagingitem='tbl_Page_" + ID + "_" + iLastP + "']").show();
    $("[pagingitem='tbl_Page_" + ID + "_" + iPage + "']").hide();
    iPage = iLastP;

    $("#spn_ID_" + ID + "_PAGE").html((iLastP + 1) + '');


    return iPage;
}



function GetSlash() {
    return '/';
}
function GetBracket(side) {
    if (side == 'L')
        return '[¢]';
    else
        return '[‼]';
}
function GetSlash() {
    return '/';
}
function GetPipes() {
    return '||';
}
function GetNewLine() {
    return '\n';
}
function GetQuot() {
    return "[QUOT_SINGLE]";
}


function getParameter(param) {
    var val = document.URL;
    var url = val.substr(val.indexOf('?') + 1);
    var values = url.split('&');
    for (var tempCount = 0; tempCount < values.length; tempCount++) {
        if (values[tempCount].split('=')[0].toLowerCase() == param.toLowerCase()) {
            return values[tempCount].split('=')[1];
        }
    }
    return "";
}


function StandardSessionMsg() {
    if (lang == "af-za")
        popUp("<p class='Header1'>Session expired</p><p>You need to be logged in to view this page</p><br/><p>You will now be redirected to the login page</p><img src='" + rootUrl + "images/ajax_loader.gif' />");
    else
        popUp("<p class='Header1'>Session expired</p><p>You need to be logged in to view this page</p><br/><p>You will now be redirected to the login page</p><img src='" + rootUrl + "images/ajax_loader.gif' />");
    setTimeout("window.location = rootUrl + 'login/';", 2500);
}




function DecodeString(str) {

    var strScriptText = str;
    if (str == undefined)
        return "";

   /*
    if (FilterOption["SCRIPT"] != "No") {
        while (strScriptText.indexOf('<script>') != -1)
        { strScriptText = strScriptText.replace('<script>', '<noscript>'); }

        while (strScriptText.indexOf('</script>') != -1)
        { strScriptText = strScriptText.replace('</script>', '</noscript>'); }
     } */

    while (strScriptText.indexOf('+') != -1)
    { strScriptText = strScriptText.replace('+', '[PLUS_SIGN]'); }
    /*
    while (strScriptText.indexOf('-') != -1)
    { strScriptText = strScriptText.replace('-', '[MINUS_SIGN_]'); }*/

    while (strScriptText.indexOf('&') != -1)
    { strScriptText = strScriptText.replace('&', 'Ω'); }

    while (strScriptText.indexOf('"') != -1)
    { strScriptText = strScriptText.replace('"', '◘'); }

    while (strScriptText.indexOf("'") != -1)
    { strScriptText = strScriptText.replace("'", '╞'); }

    while (strScriptText.indexOf("<") != -1)
    { strScriptText = strScriptText.replace("<", GetBracket('L')); }

    while (strScriptText.indexOf(">") != -1)
    { strScriptText = strScriptText.replace(">", GetBracket('R')); }

    while (strScriptText.indexOf(":") != -1) {
        strScriptText = strScriptText.replace(":", "[COLION_]");
    }

    while (strScriptText.indexOf("[AND_SIGN]") != -1) {
        strScriptText = strScriptText.replace("[AND_SIGN]", "Ω");
    }
    

    while (strScriptText.indexOf("||") != -1)
    { strScriptText = strScriptText.replace("||", "[DASH_DASH]"); }




    while (strScriptText.indexOf("\r") != -1)
    { strScriptText = strScriptText.replace("\r", ' '); }
    while (strScriptText.indexOf("\n") != -1)
    { strScriptText = strScriptText.replace("\n", ' '); }

    return strScriptText;
}



function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    } 
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}


function FixImages() {
    var cotrols = $(".imgFix");
    for (x = 0; x < cotrols.length; x++) {
        $(cotrols[x]).attr("src", $(cotrols[x]).attr("src").replace("[RESOLVE_URL]", rootUrl));
    }

}



function replaceVals(in_str, what_str, with_str) {

    while (in_str.indexOf(what_str) > -1) {
        in_str = in_str.replace(what_str, with_str);
    }
    return in_str;
}


function SetDocs() {
    setTimeout(
        function () {
            $("#divFiles").find("a").css("color", "#63BF06");
            $("#divFiles").find("a").each(function () {
                $(this).html($(this).html().replace(".pdf", ""));
            });
        },
        500);


}

var errMsg = "";
function onSilverlightError(sender, args) {
    console.log("!? - 2");
    var appSource = "";
    if (sender != null && sender != 0) {
        appSource = sender.getHost().Source;
    }

    var errorType = args.ErrorType;
    var iErrorCode = args.ErrorCode;

    if (errorType == "ImageError" || errorType == "MediaError") {
        return;
    }

    errMsg = "Unhandled Error in Silverlight Application " + appSource + "\n";

    errMsg += "Code: " + iErrorCode + "    \n";
    errMsg += "Category: " + errorType + "       \n";
    errMsg += "Message: " + args.ErrorMessage + "     \n";

    if (errorType == "ParserError") {
        errMsg += "File: " + args.xamlFile + "     \n";
        errMsg += "Line: " + args.lineNumber + "     \n";
        errMsg += "Position: " + args.charPosition + "     \n";
    }
    else if (errorType == "RuntimeError") {
        if (args.lineNumber != 0) {
            errMsg += "Line: " + args.lineNumber + "     \n";
            errMsg += "Position: " + args.charPosition + "     \n";
        }
        errMsg += "Method Name: " + args.methodName + "     \n";
    }
    console.log(errMsg);
    alert("Silverlight error occured", "The map failed to load.<br/>" + errMsg, "");
}

function onSourceDownloadProgressChanged(sender, eventArgs) {

}

var iCall = 0;
var bValidatePass = true;

function ReturnSpatialCheck(varName, index) {
    iCall--;
    if (eval("" + varName + ".iCount") == "0") {
        bValidatePass = false;

        $("#divResult_" + index).html("<b style='color:red'>" + xmlDoc.lstValidators[index].sMsg + " </b>");
    }
    else {
        $("#divResult_" + index).html("<b>The spatial context exists.</b>");
    }
    if (iCall < 1) {
        ValidateCompleted();
    }
}


function ReturnFileCheck(varName, index) {
    iCall--;
    if (eval("" + varName + ".sFileName") == "") {
        bValidatePass = false;

        $("#divResult_" + index).html("<b style='color:red'>" + xmlDoc.lstValidators[index].sMsg + " </b>");
    }
    else {
        $("#divResult_" + index).html("<b>The file has been created.</b>");
    }

    if (iCall < 1) {
        ValidateCompleted();
    }
}

function ValidateCompleted() {
    $("#divPopupHeader").html('<b>Validations completed</b>');
    if (bValidatePass) {
        BuildInputForm();
    }
}



function BuildInputForm() {
    var iForms = 0;
    var iExecutables = 0;
    var retHtml = "";
    while (!(xmlDoc.lstForms[iForms] == null)) {
        switch (xmlDoc.lstForms[iForms].strType) {
            case "HiddenField":
                break;
            case "PrintMap":
                iExecutables++;
                retHtml += "<div id='divPrint" + iForms + "'></div>";
                break;
        }
        iForms++;
    }

    retHtml += "<div id='btnUpdateSenario'>Update text will be replaced</div>";

    $("#divLoader_").html(retHtml);
    $("#divPopupHeader").html(xmlDoc.strPopupText);



    /*  Forform call code   */
    PerformCallC(rootUrl + 'CMS/Web/Transaction.asmx/BuildControl', BuildString('strFileName', 'Buttons788212UpdateSenario'), 'btnUpdateSenario');

    iForms = 0;
    while (!(xmlDoc.lstForms[iForms] == null)) {
        switch (xmlDoc.lstForms[iForms].strType) {
            case "PrintMap":
                slCtl.Content.MyMap.GetMapXMLInfo();
                var coords2send = sMapCurrentCoords;
                while (coords2send.indexOf('<') > -1) {
                    coords2send = coords2send.replace('<', '&lt;');
                }
                while (coords2send.indexOf('>') > -1) {
                    coords2send = coords2send.replace('>', '&gt;');
                }


                PerformCallC(rootUrl + 'webservices/LlamaEnabled.asmx/PrintMapWeb',
                    BuildString('iPrintInfo', xmlDoc.lstForms[iForms].objFormInfo.sValue) + ", " +
                    BuildString('Template', "A4Portrait.xml") + ", " +
                    BuildString('sCoords', coords2send)
                    , 'divPrint' + iForms);
                break;
        }
        iForms++;
    }


    if (iExecutables == 0)
        UpdateScenario();
}

var sendData = new Array();
var passData = new Object();

var sMapCurrentCoords = "";

function SetCoords(coords) {
    sMapCurrentCoords = coords;
}
function UpdateScenario() {
    var iForms = 0;
    sendData = new Array();
    while (!(xmlDoc.lstForms[iForms] == null)) {

        passData = new Object();
        passData.strEntity = xmlDoc.strEntity;
        switch (xmlDoc.lstForms[iForms].strType) {
            case "HiddenField":
                passData.strValue = xmlDoc.lstForms[iForms].objFormInfo.sValue;
                break;
        }
        var xCountFilters = 0;
        passData.arrWhereCluase = new Array();

        while (!(xmlDoc.lstForms[iForms].lstFilters[xCountFilters] == null)) {
            var pair = new Object();
            if (xmlDoc.lstForms[iForms].lstFilters[xCountFilters].sType == "QueryString") {
                pair.Attr = xmlDoc.lstForms[iForms].lstFilters[xCountFilters].sAttribute;
                pair.Value = getParameter(xmlDoc.lstForms[iForms].lstFilters[xCountFilters].sContainer);
                passData.arrWhereCluase.push(pair);
            }
            xCountFilters++;
        }
        passData.filter = "";
        passData.strField = xmlDoc.lstForms[iForms].strFieldValue;
        iForms++;
        sendData.push(passData);
    }

    SaveEntity(sendData);
}

function SaveEntity(data) {
    var iCount = 0;
    var xml2Send = "";
    xml2Send += "<BizAgiWSParam>";
    xml2Send += "<Entities>";


    xml2Send += "<" + data[0].strEntity + " [BUSINESS_KEY]>";
    iCount = 0;
    var filter = "";
    while (!(data[iCount] == null)) {
        var iInnerFilterCount = 0;
        while (!(data[iCount].arrWhereCluase[iInnerFilterCount] == null)) {
            if (filter.indexOf(data[iCount].arrWhereCluase[iInnerFilterCount].Attr) == -1)
                filter += data[iCount].arrWhereCluase[iInnerFilterCount].Attr + "=[QUOT_SINGLE]" + data[iCount].arrWhereCluase[iInnerFilterCount].Value + "[QUOT_SINGLE] ";
            iInnerFilterCount++;
        }

        xml2Send += "<" + data[iCount].strField + ">" + data[iCount].strValue + "</" + data[iCount].strField + ">";
        iCount++;
    }

    if (filter != "")
        filter = " businessKey=◘" + filter + "◘";

    xml2Send = xml2Send.replace("[BUSINESS_KEY]", filter);
    xml2Send += "</" + data[0].strEntity + ">";
    xml2Send += "</Entities>";
    xml2Send += "</BizAgiWSParam>";


    PerformCallC(rootUrl + "WebServices/LlamaEnabled.asmx/UpdateEntity", BuildString("sUrl", xmlDoc.sPID) + "," + BuildString("sEntityInfo", xml2Send), "divLoader_");
    //$("#divLoader_").text(xml2Send);
}


function EntityUpdateComplete() {
    if (FilterOption["BizAgiUpdate"] != undefined) {
        eval(FilterOption["BizAgiUpdate"]);
    }
    if (xmlDoc.bCloseMap == true)
        window.open('', '_self').close();
    else
        CloseMainPopupWindow();
}


function ExecuteLLamaVSDympEvent(ref) {
    popUpH("<div id='divPopUpBody'><p id='divPopupHeader'>Performing validations</p><p>&nbsp;</p></div><div id='divLoader_'></div>", "auto");
    PerformCallC(rootUrl + "WebServices/DynoServices.asmx/GetConfig", BuildString("PID", "1") + "," + BuildString("sServer", "GIDEVVMSRV04") + "," + BuildString("sRef", ref + ""), "divLoader_");
}


function ViewHotlinkData() {
    popUpH("<div id='divPopUpBody'></div>", "auto");
    PerformCallP(rootUrl + "Map/DynoPages/HotLink.aspx", "", "divPopUpBody");
}


var slCtl = null;
function pluginLoaded(sender, args) {
    console.log(sender);

    slCtl = sender.getHost();
    $(silverlightControlHost).css("height", "99.5%");
    $(silverlightControlHost).css("width", "100%")
}

function SystemLogout(contrl) {
    PerformCall(rootUrl + "CMS/Web/CMSCreator.asmx/Logout", "{} ", contrl);
}



function ShowGritter(title, content) {
    $.gritter.add({
        // (string | mandatory) the heading of the notification
        title: title,
        // (string | mandatory) the text inside the notificationk
        text: content,
        // (string | optional) the image to display on the left
        image: '',
        // (bool | optional) if you want it to fade out on its own or just sit there
        sticky: false,
        // (int | optional) the time you want it to be alive for before fading out
        time: '3500'
    });
}




window.downloadFile = function (sUrl) {

    //iOS devices do not support downloading. We have to inform user about this.
    if (/(iP)/g.test(navigator.userAgent)) {
        alert('Your device does not support files downloading. Please try again in desktop browser.');
        return false;
    }

    //If in Chrome or Safari - download via virtual link click
    if (window.downloadFile.isChrome || window.downloadFile.isSafari || window.downloadFile.isMozilla) {
        //Creating new link node.
        var link = document.createElement('a');
        link.href = sUrl;

        if (link.download !== undefined) {
            //Set HTML5 download attribute. This will prevent file from opening if supported.
            var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
            link.download = fileName;
        }

        //Dispatching click event.
        if (document.createEvent) {
            var e = document.createEvent('MouseEvents');
            e.initEvent('click', true, true);
            link.dispatchEvent(e);
            return true;
        }
    }

    // Force file download (whether supported by server).

    window.open(sUrl, '_self');
    return true;
}

window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
window.downloadFile.isMozilla = navigator.userAgent.toLowerCase().indexOf('mozilla') > -1;


