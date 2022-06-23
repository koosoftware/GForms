var mapx = undefined;
var maxy = undefined;
var mapUrl; var ISFACEAUTH = false;


/**
  ****   We need to write to the disk in a future addition, but not required for now  ****
window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

    console.log('file system open: ' + fs.name);
    fs.root.getFile("newPersistentFile.txt", { create: true, exclusive: false }, function (fileEntry) {

        console.log("fileEntry is file?" + fileEntry.isFile.toString());
        // fileEntry.name == 'someFile.txt'
        // fileEntry.fullPath == '/someFile.txt'
        writeFile(fileEntry, null);

    }, onErrorCreateFile);

}, onErrorLoadFs);
*/

function FindChildControl(childID, pageid) {
    for (var xS = 0; xS < FormSet.applications[global_applicationid].forms[pageid].Sections.length; xS++) {
        for (var xF = 0; xF < FormSet.applications[global_applicationid].forms[pageid].Sections[xS].Fields.length; xF++) {
            if (FormSet.applications[global_applicationid].forms[pageid].Sections[xS].Fields[xF].ID == "fld" + childID) {
                return [pageid, xS, xF];
            }
        }
    }
    return null;
}


/*  This function updates when the   */
function CheckDDLControlChange() {

    var fieldID = $(this).attr("fieldid");
    var pageID = $(this).attr("pageid");
    var sectionID = $(this).attr("sectionid");

    // Do Parent to Child 
    if (FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Parent2ChildFields != undefined) {
        for (var x = 0; x < FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Parent2ChildFields.length; x++) {
            var DDL = $('[name="fld' + FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Parent2ChildFields[x].TargetID + '"]');
            var d = FindChildControl(FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Parent2ChildFields[x].TargetID, pageID);
            var dc = FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Parent2ChildFields[x].ChildParentColumn;
            BuildDynoDDL(d[0], d[1], d[2], DDL, $(this).val(), dc);
        }
    }



    // Do Copy Form Values - lookups
    if (FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy != undefined) {
        for (var xLKF = 0; xLKF < FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy.length; xLKF++) {
            var FilterSearch = SearchRecord(eval("SQLOfflineData." + FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupSource), FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].DataField, $(this).val());
            for (var xLK = 0; xLK < FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupFields.length; xLK++) {
                if (FilterSearch.length > 0) {
                    var setVal = eval('FilterSearch[FilterSearch.length-1].' + FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupFields[xLK].LookupField);

                    // if it is a drop down, set the True/False to 1/0
                    if ($("[dest='" + FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupSource + "." +
                        FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupFields[xLK].LookupField + "'").attr("form_ddl") != undefined) {

                        if (setVal == "True")
                            setVal = "1";
                        else if (setVal == "False")
                            setVal = "0";
                        else if (setVal == "")
                            setVal = "[NULL]";
                    }

                    // Set the controls value = to the lookup
                    $("[dest='" + FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupSource + "." +
                        FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupFields[xLK].LookupField + "'").val(setVal);
                }
                else {
                    // This clears the control if no value is specified... 
                    /*   $("[dest='" + FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupSource + "." +
                      FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Formcopy[xLKF].LookupFields[xLK].LookupField + "'").val("");  */
                }
            }
        }
    }
}


function BuildDynoDDL(page, xSection, xFields, DDL, whereValue, childFilterC, controlType, dValue) {
    $(DDL).empty();
    var tableSource = SQLOfflineData[FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Datatable];


    if (controlType == undefined || controlType == "Single" || controlType == "") {
        $(DDL).append($("<option>")
            .attr("value", "[NULL]")
            .text("Select...")
        );
    }



    if (tableSource == undefined) {
        $(DDL).append($("<option>")
            .attr("value", "null")
            .text("ERROR- Preloaded datasource not found")
        );
    }
    else {


        for (var xDDLValue = 0; xDDLValue < tableSource.rows.length; xDDLValue++) {
            var pass = true;

            var fieldIDVal = eval("tableSource.rows[xDDLValue]." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.IDField);


            var v = FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.FilterValue;

            var selected = false;

            if (dValue != undefined && dValue == fieldIDVal) {
                selected = true;
            }

            if (whereValue != "") {
                var cmpValFieldIDVal = eval("tableSource.rows[xDDLValue]." + childFilterC);
                if (cmpValFieldIDVal == whereValue)
                    pass = true;
                else
                    pass = false;
            }
            if (pass)
                $(DDL).append($("<option>")
                    .attr("value", fieldIDVal)
                    .attr(selected ? "selected" : "notselected", "selected")
                    .text(eval("tableSource.rows[xDDLValue]." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.DisplayField))
                );
        }
    }
    return DDL;
}

var iCurrentActivePage = -1;
function LoadController(page, control, editRow, pageOld) {
    $("#dim_wrapper").show();
	/*if(iCurrentActivePage == page){
		return;		
	}*/
    iCurrentActivePage = page;
    windowResizeW();

    GetPosition();


    var xBreak = 0;
    while (DevicePosition == undefined) {
        xBreak++;
        if (xBreak > 20) {
            console.log("Breaking...");
            break;
        }
    }

    $("[lbl='Loader']").html("<i class='fa fa-refresh'/><i>Loading.... Please wait....</i>");


    setTimeout(function () {

        if (DevicePosition == undefined)
            DevicePosition = new Object();

        if (DevicePosition.msg == undefined)
            DevicePosition.msg = "";

        FetchTableData(FormSet.applications[global_applicationid].forms[page].TableSources[0].TableSources[0]);
        setTimeout(LoadController2, (DevicePosition.msg == "Failed to get position" ? 0 : 2000), page, control, editRow, pageOld);

    }, 200);
}

var iEditedIndex = -1;
var iActiveHeadPageIndex = 0;
function LoadController2(page, control, editRow, pageOld) {

    // Address Edit Function

    // Plan:

    /** REGION 

        When a form is loaded with edit function- */
    var arrShowHideSettings = new Array();
    /** editData contains the actual row  **/
    var editData = undefined;
    /** editIDField has the name of the field being used as ID  **/
    var editIDField = undefined;

    /* END REGION */


    editData = undefined;
    editIDField = undefined;

    if (isNaN(editRow) == false) {

        iEditedIndex = editRow;
        editData = SQLOfflineData[FormSet.applications[global_applicationid].forms[page].PrimaryTable].rows[editRow];
        console.log("Edited row is: " + editData);
    }

    var language2use = false;
    var appLanguage = false;
    var formLanguages = false;
    if (selectedLang != "") {
        language2use = GetSelectedLanguage();
        appLanguage = GetSelectedAppLanguage(language2use, global_applicationid);
    }

    if (appLanguage !== false)
        formLanguages = GetSelectedFormLanguage(appLanguage, FormSet.applications[global_applicationid].forms[page].FormSysID)
    // Also get the table data
    var container;
    if (control == undefined) {
        $("[container='mainPanel']").html("Loading...");
        iActiveHeadPageIndex = page;
    }

    $('[container="footer"]').html("Loading Control");


    // Reset All the panel - Just makes the app having less HTML present
    // Also, if there is an error, the app will just say "Loading...".... 
    // #TODO: Add fail safe code... sometime...


    var c = $("<div>")
        .attr("class", "form-horizontal form-basic");


    $(c).append(
        $("<div>")
            .attr("class", "form-group")
            .attr("container", "formrowid")
            .attr("parentpage", page)
            .attr("startTime", (DevicePosition.timestamp == undefined ? new Date().getTime() : DevicePosition.timestamp))
            .attr("startLat", (DevicePosition.coords.latitude == undefined ? "0" : DevicePosition.coords.latitude))
            .attr("startLong", (DevicePosition.coords.longitude == undefined ? "0" : DevicePosition.coords.longitude))
            .attr("uniqeValue", new Date().getTime())
            .attr("isEdit", (editRow == undefined ? false : true))

            .append(
            $("<div>")
                .attr("class", "col-sm-12")
                .append(
                $("<div>")
                    .attr("loadingBox", FormSet.applications[global_applicationid].forms[page].FormID)
                )
            )
    );


    $(c).append(
        $("<div>")
            .attr("class", "pull-right")
            .attr("container", "sectionrowclass")
            .attr("parentpage", page)
            .append(
            $("<div>")
                .attr("class", "fa fa-circle")
                .css("color", (FormSet.applications[global_applicationid].forms[page].IsOffline == 1 ? "lime" : "red"))
            )
    );
    $(c).append(
        $("<div>")
            .attr("class", "row")
            .attr("container", "sectionrowclass")
            .attr("parentpage", page)
            .append(
            $("<div>")
                .attr("class", "col-sm-12")
                .html("<h2 style='margin-top:0px; color:red'>" + FormSet.applications[global_applicationid].forms[page].FormName + "</h2>")
            )
    );

    // Loop each section and create the controls.
    for (var xSection = 0; xSection < FormSet.applications[global_applicationid].forms[page].Sections.length; xSection++) {

        var sectionLang = false;
        if (formLanguages !== false) {
            // if a language was specified.... something needs to happen here
            sectionLang = GetSelectedSectionLanguage(formLanguages, FormSet.applications[global_applicationid].forms[page].Sections[xSection].SectionID)
        }

        // Build up the section block - title/header
        if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Title != "") {
            var title = FormSet.applications[global_applicationid].forms[page].Sections[xSection].Title;
            if (FormSet)
                $(c).append(
                    $("<div>")
                        .attr("class", "row")
                        .attr("container", "sectionrowclass")
                        .attr("parentpage", page)
                        .append(
                        $("<div>")
                            .attr("class", "col-sm-12")
                            .append(
                            $("<h3>")
                                .css("margin-top", "0px")
                                .html(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Title)
                            )
                        )
                );
        }

        // Now built every control
        for (var xFields = 0; xFields < FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields.length; xFields++) {
            var right_control;

            var fieldLanguage = false;
            if (sectionLang !== false) {
                // if a language was specified.... something needs to happen here
                fieldLanguage = GetSelectedFieldLanguage(sectionLang, FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].FID);
            }

            var dValue = "";
            // Now check edit value
            if (editData != undefined) {
                dValue = editData[FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField];
            }


            if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DefaultValue !== undefined)
                dValue = FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DefaultValue;
            else if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DefaultValueJS !== undefined) {

                dValue = eval(replaceVals(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DefaultValueJS, "{this.val}", dValue));
            }


            var req = "";
            if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].IsRequired == "yes")
                req = "<i style='color:red'>*</i>&nbsp;";

            var cenabled = (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].enableEdit == "false" ? "disabled" : "isenabled");
            var chidden = (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].hiddenbydefault == "true" ? "none" : "block");


            var labelText = FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label;
            if (fieldLanguage !== false) {
                // if a language was specified.... something needs to happen here
                labelText = fieldLanguage.Text;
            }
            // Left control is normally label, unless a special control like a button, where the left control is then removed
            var left_control = $("<label>")
                .attr("class", "")
                .html("<span>" + req + labelText + "</span>");

            try {
                if (ExternalFormLink.Fields.length > 0) {
                    for (var xEXC = 0; xEXC < ExternalFormLink.Fields.length; xEXC++) {
                        if (ExternalFormLink.Fields[xEXC].split(':')[0] == FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label) {
                            var v = ExternalFormLink.Fields[xEXC].split(':')[1];
                            if (v.substring(0, 3) == "JS-") {
                                v = eval(v.substring(3));
                            }
                            console.log(ExternalFormLink.Fields[xEXC]);
                            dValue = v;
                        }
                    }
                }
            }
            catch (x) {
                console.warn(x);
            }


            var sDisplayField = sDisplayChild = FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].ControlVisible == "false" ? "none" : "block";


            if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].JSONExtra != undefined) {
                for (var ixS = 0; ixS < FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].JSONExtra.AdditionalSettings.length; ixS++) {
                    if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].JSONExtra.AdditionalSettings[ixS].Key == "showonlywhen") {
                        sDisplayField = "none";

                        var sField2Watch = FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].JSONExtra.AdditionalSettings[ixS].Value.split('=');
                        /* Source Field,TargetField, Target Value,  */

                        console.log(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].InputType);
                        var arrFieldInfo = [
                            (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].InputType == "SubForm" ? FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label
                                : FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField), sField2Watch[0], sField2Watch[1]];

                        console.log(arrFieldInfo[1] + " - " + $('[field_dest="' + arrFieldInfo[1] + '"]').val() + " == " + arrFieldInfo[2] + " /" + arrFieldInfo[0]);
                        if ($('[field_dest="' + arrFieldInfo[1] + '"]').val() == arrFieldInfo[2]) {

                            $('[datafid="' + arrFieldInfo[0] + '"]').show();
                            sDisplayField = "block";
                        }

                        arrShowHideSettings.push(arrFieldInfo);


                    }
                }
            }

            sizeCls = "";
            switch (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].InputType) {
                case "Input":

                    var typeOfControl = (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].NumOnly != undefined && FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].NumOnly == 'true' ? 'number' : "input");

                    right_control =
                        $("<input>")
                            .attr("class", "form-control_old")

                            .attr("dest", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                            .attr("field_dest", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                            .attr("type", "input")
                            .attr(cenabled, cenabled)
                            .attr("pageid", page)
                            .attr("fieldid", xFields)
                            .attr("sectionid", xSection)
                            .attr("FORM_INPUT", page)
                            .attr("doProcess", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Process)
                            .attr("value", dValue)
                            .attr("id", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "_" + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                            .on({
                                change: function () {
                                    try {
                                        if (FormSet.applications[global_applicationid].forms[$(this).attr("pageid")].Sections[$(this).attr("sectionid")].Fields[$(this).attr("fieldid")].OnKeyUpCode != undefined) {
                                            var js = FormSet.applications[global_applicationid].forms[$(this).attr("pageid")].Sections[$(this).attr("sectionid")].Fields[$(this).attr("fieldid")].OnKeyUpCode;
                                            // setup selected value
                                            js = replaceVals(js, "{controlvalue}", $(this).val());
                                            // Now setup controls
                                            js = replaceVals(js, "{control.[FIELD]}", $(this).val());
                                            while (js.indexOf("{control.") > -1) {
                                                // Get the control
                                                var split = js.substr(js.indexOf("{control.") + 9)
                                                split = split.substr(0, split.indexOf("}"));
                                                var newJS = '$("[field_dest=\'' + split + '\']")';
                                                js = replaceVals(js, "{control." + split + "}", newJS);
                                            }

                                            console.log(js);
                                            eval(js);
                                        }
                                    } catch (r) { }
                                }

                            })
                    break;
                case "Radio":
                    var DDL = $("<div>")
                        .attr("FORM_RADIO", page);
                    if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Type == "Static") {
                        for (var xDDLValue = 0; xDDLValue < FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values.length; xDDLValue++) {
                            $(DDL).append($("<input>")
                                .attr("type", "radio")
                                .attr("value", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values[xDDLValue].Value)
                                .text(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values[xDDLValue].Display)
                            );
                        }
                    }
                    right_control = DDL;
                    break;

                case "MultiDDL":
                    var DDL = $("<select>")
                        .attr("class", "form-control_old")
                        .attr(cenabled, cenabled)
                        .attr("fieldid", xFields)
                        .attr("multiple", "")
                        .attr("field_dest", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("sectionid", xSection)
                        .css("z-index", "10000")
                        .css("color", "black")
                        .attr("dest", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("pageid", page)
                        .attr("name", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].ID)
                        .attr("value", "[NULL]")
                        .on({ change: CheckDDLControlChange })
                        .attr("doProcess", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Process)
                        .on({
                            change: function () {
                                try {
                                    if (FormSet.applications[global_applicationid].forms[$(this).attr("pageid")].Sections[$(this).attr("sectionid")].Fields[$(this).attr("fieldid")].OnKeyUpCode != undefined) {
                                        var js = FormSet.applications[global_applicationid].forms[$(this).attr("pageid")].Sections[$(this).attr("sectionid")].Fields[$(this).attr("fieldid")].OnKeyUpCode;
                                        // setup selected value
                                        js = replaceVals(js, "{controlvalue}", $(this).val());
                                        // Now setup controls
                                        js = replaceVals(js, "{control.[FIELD]}", $(this).val());
                                        while (js.indexOf("{control.") > -1) {
                                            // Get the control
                                            var split = js.substr(js.indexOf("{control.") + 9)
                                            split = split.substr(0, split.indexOf("}"));
                                            var newJS = '$("[field_dest=\'' + split + '\']")';
                                            js = replaceVals(js, "{control." + split + "}", newJS);
                                        }

                                        console.log(js);
                                        eval(js);
                                    }
                                } catch (r) { }
                            }

                        })
                        .attr("FORM_DDL_MULTI", page);
                    if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.SourceType == "Static") {
                        for (var xDDLValue = 0; xDDLValue < FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values.length; xDDLValue++) {
                            $(DDL).append($("<option>")
                                .attr("value", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values[xDDLValue].Value)
                                .text(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values[xDDLValue].Display)
                            );
                        }
                    }
                    else if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.SourceType == "SQL") {
                        DDL = BuildDynoDDL(page, xSection, xFields, DDL, "", "Multi", dValue);
                    }
                    right_control = DDL;
                    break;
                case "DDL":
                    if (dValue == "")
                        dValue == "[NULL]";
                    else {
                    }
                    var DDL = $("<select>")
                        .attr("class", "form-control_old")
                        .attr(cenabled, cenabled)
                        .attr("fieldid", xFields)
                        .attr("id", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "_" + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("field_dest", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("sectionid", xSection)
                        .attr("dest", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("pageid", page)
                        .text("Select...")
                        .attr("name", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].ID)
                        .attr("value", dValue)
                        .attr("value2", dValue)
                        .on({ change: CheckDDLControlChange })
                        .on({
                            change: function () {
                                try {
                                    if (FormSet.applications[global_applicationid].forms[$(this).attr("pageid")].Sections[$(this).attr("sectionid")].Fields[$(this).attr("fieldid")].OnKeyUpCode != undefined) {
                                        var js = FormSet.applications[global_applicationid].forms[$(this).attr("pageid")].Sections[$(this).attr("sectionid")].Fields[$(this).attr("fieldid")].OnKeyUpCode;
                                        // setup selected value
                                        js = replaceVals(js, "{controlvalue}", $(this).val());


                                        js = replaceVals(js, "{this}", '[field_dest="' + $(this).attr("field_dest") + '"]');

                                        // Now setup controls
                                        js = replaceVals(js, "{control.[FIELD]}", $(this).val());
                                        while (js.indexOf("{control.") > -1) {
                                            // Get the control
                                            var split = js.substr(js.indexOf("{control.") + 9)
                                            split = split.substr(0, split.indexOf("}"));
                                            var newJS = '$("[field_dest=\'' + split + '\']")';
                                            js = replaceVals(js, "{control." + split + "}", newJS);
                                        }

                                        eval(js);
                                    }
                                } catch (r) { }
                            }

                        })
                        .attr("doProcess", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Process)
                        .attr("FORM_DDL", page);
                    if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.SourceType == "Static") {
                        for (var xDDLValue = 0; xDDLValue < FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values.length; xDDLValue++) {

                            var opt = $("<option>")
                                .attr("value", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values[xDDLValue].Value)
                                .text(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values[xDDLValue].Display)
                                ;
                            if (dValue == FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.Values[xDDLValue].Value) {
                                $(opt).attr("selected", "selected");
                            }
                            $(DDL).append(opt);
                        }
                    }
                    else if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataSource.SourceType == "SQL") {
                        DDL = BuildDynoDDL(page, xSection, xFields, DDL, "", "", dValue);
                        console.log(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label + " - ");
                    }
                    right_control = DDL;
                    break;
                case "Date":
                    if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DefaultDateNow != undefined) {
                        dValue = new Date().toISOString().slice(0, 10);
                    }

                    var DDL = $("<input>")
                        .attr("dest", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("fieldid", xFields)
                        .attr(cenabled, cenabled)
                        .attr("sectionid", xSection)
                        .attr("FORM_DATE", page)
                        .attr("value", dValue)
                        .attr("type", "date");


                    right_control = DDL;
                    break;

                case "TICK_BOX":
                    var chacked = '';
                    if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].AutoChecked != undefined) {
                        chacked = (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].AutoChecked == "yes" ? "checked" : "");
                    }

                    var DDL = $("<input>")
                        .attr("dest", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("fieldid", xFields)
                        .attr(cenabled, cenabled)
                        .attr("id", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "_" + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("sectionid", xSection)

                        .attr("FORM_CHECK", page)
                        .attr("value", dValue)
                        .attr("type", "checkbox");


                    right_control = DDL;
                    break;

                case "SubForm":
                    if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].subForm == undefined) {
                        alert("Subform for field " + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label + " was not found.");
                    }


                    left_control = $("<div>");
                    sizeCls = "col-sm-12";
                    var DDL = $("<div>")
                        .attr("dest", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .attr("fieldid", xFields)
                        .attr("sectionid", xSection)
                        .attr("FORM_SUB_FORM", page)
                        .attr("type", "date")

                        .append(
                        $("<div>")
                            .attr("class", "row")
                            .append(
                            $("<div>")
                                .attr("class", "col-sm-12").css("padding-right", "0").css("padding-left", "0")
                                .append($("<div>").append($("<button>").html("dummy").css("display", "none"))
                                    .append(
                                    $("<button>")
                                        .attr("type", "button")
                                        .attr("class", "btn btn-primary")
                                        .html("" + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label +
                                        (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].IsRequired == "yes" ? "&nbsp;<i style='color:white'>*</i>" : ""))
                                        .attr("fieldid", xFields)
                                        .attr("sectionid", xSection)
                                        .css("width", "320px")
                                        .attr("pageid", page)
                                        .attr("relationship", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].relationship)
                                        .attr("buttonAct", "addFrom")
                                        .on({
                                            click: function () {
                                                // Load the subform

                                                $("[subformBack]").hide();
                                                var fieldID = $(this).attr("fieldid");
                                                var sectionID = $(this).attr("sectionid");
                                                var pageID = $(this).attr("pageid");


                                                if ($(this).attr("relationship") == "1")// && $("[pageid='"+  pageID + "'][sectionid='"+  sectionID + "'][fieldid='"+  fieldID + "'][childResults] tr").length==1)
                                                {
                                                    $(this).attr("disabled", "disabled");
                                                }

                                                child_item = new Object();
                                                child_item.ParentForm = pageID;
                                                child_item.ParentSectionID = sectionID;
                                                child_item.ParentFieldID = fieldID;
                                                child_item.ParentFormUID = FormSet.applications[global_applicationid].forms[pageID].FormName;
                                                child_item.ParentFormName = FormSet.applications[global_applicationid].forms[pageID].FormName;
                                                child_item.PageID = undefined;

                                                $("[container='child'][fieldid='" + fieldID + "'][sectionid='" + sectionID + "'][pageid='" + pageID + "']").html("Loading... Please wait...");


                                                $("[buttonAct='addFrom'][pageid='" + pageID + "']").hide();
                                                for (var x = 0; x < FormSet.applications[global_applicationid].forms.length; x++) {

                                                    if (FormSet.applications[global_applicationid].forms[x].FormSysID ==
                                                        FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].subForm.SubformID) {
                                                        // Sub form found
                                                        child_item.PageID = x;
                                                        LoadController(x + "", { newPage: x, fieldID: fieldID, sectionID: sectionID, pageID: pageID });

                                                        setTimeout(function () {
                                                            console.log("!" + pageID);
                                                            $("[buttonAct='cancel'][pageid='" + pageID + "']").show();
                                                        }, 200);
                                                    }
                                                }

                                                if (child_item.PageID == undefined) {
                                                    // No permissions?
                                                    $("[container='child'][fieldid='" + fieldID + "'][sectionid='" + sectionID + "'][pageid='" + pageID + "']").html("Could not access Sub Form. Please check permissions.");
                                                }
                                            }
                                        })
                                    ).append(
                                    $("<button>")
                                        .attr("type", "button")
                                        .attr("class", "btn btn-primary")
                                        .html("<i class='fa fa-backward'></i> Back")
                                        .css("display", "none")
                                        .attr("subformBack", "1")
                                        .attr("fieldid", xFields)
                                        .attr("sectionid", xSection)
                                        .attr("pageid", page)
                                        .attr("buttonAct", "cancel")
                                        .on({
                                            click: function () {
                                                // Load the subform

                                                $("[subformBack]").show();

                                                var fieldID = $(this).attr("fieldid");
                                                var sectionID = $(this).attr("sectionid");
                                                var pageID = $(this).attr("pageid");

                                                iCurrentActivePage = -1;

                                                $("[buttonAct='addFrom'][pageid='" + pageID + "']").show();
                                                $("[buttonAct='cancel'][pageid='" + pageID + "']").hide();
                                                $("[container='sectionrowclass'][parentpage='" + pageID + "']").show();
                                                $("[container='itemrowclass'][parentpage='" + pageID + "']").show();

                                                $("[container='child'][fieldid='" + fieldID + "'][sectionid='" + sectionID + "'][pageid='" + pageID + "']").html("");
                                            }
                                        })



                                    ).append(
                                    $("<div>")
                                        .attr("container", "child")
                                        .attr("fieldid", xFields)
                                        .attr("sectionid", xSection)
                                        .attr("pageid", page)
                                        .html("")
                                    ))
                            )
                        )

                        .append(
                        $("<div>")
                            .attr("container", "childResults")
                            .attr("fieldid", xFields)
                            .attr("sectionid", xSection)
                            .attr("pageid", page)
                            .append($("<table>"))
                        )
                        .append(
                        $("<p>")
                        );



                    right_control = DDL;
                    break;
                case "jsig":
                    var left_control = $("<label>")
                        .attr("class", "")
                        .html("<span>" + req + labelText + "</span>");

                    var ParentElement = $("<div>")
                        .attr("fieldid", xFields)
                        .attr("sectionid", xSection)
                        .attr("FORM_JSIG", page)
                        .css("display", "inline")
                        .css("margin", "0px")
                        //.css("width","85px")
                        .append(
                        $("<button>")
                            .attr("class", "btn blue")
                            .attr("fieldid", xFields)
                            .attr("sectionid", xSection)
                            .css("display", "inline")
                            .css("margin", "0px")
                            .html("Sign")
                            .on({
                                click: function () {
                                    $("[container='signature_sign']").html("");
                                    $("[container='signature_sign']").attr("fieldid", $(this).attr("fieldid"));
                                    $("[container='signature_sign']").attr("sectionid", $(this).attr("sectionid"));

                                    $("#divSignHere").show('fast', function () {

                                        setTimeout(function () {

                                            $("[container='signature_sign']").jSignature({ height: $('[container="signature_sign"]').height() - 20, width: $('[container="signature_sign"]').width() });
                                        }, 200);
                                    });

                                }
                            })
                        )
                        .append(
                        $("<div>")
                            .attr("container", "signature")
                            .css("display", "none")
                            .html("")
                        );

                    right_control = ParentElement;
                    break;
                case "ArcGisOnlineMap":
                    var ParentElement = $("<div>")
                        .css("display", "inline")
                        .attr("fieldid", xFields)
                        .attr("sectionid", xSection)
                        .attr("FORM_ARCGISONLINE", page);

                    //   for(var xMaps =0; xMaps < FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].MapFields.AdditionalSettings.length; xMaps++)
                    {
                        $(ParentElement).append(
                            $("<div>")
                                .css("display", "inline")
                                .append(
                                $("<button>")
                                    .attr("class", "btn blue")
                                    .attr("fieldid", xFields)
                                    .attr("sectionid", xSection)
                                    .attr("pageid", page)
                                    .attr("xFields", xFields)
                                    //                 .attr("xSettingIndex", xMaps)
                                    .html("<i class='fa  fa-map-marker'/>")
                                    .css("display", "inline")
                                    .attr("fieldid_map", xFields)
                                    .on({
                                        click: function () {

                                            var fieldID = $(this).attr("fieldid");
                                            var sectionID = $(this).attr("sectionid");
                                            var pageID = $(this).attr("pageid");


                                            $("#main1").attr("fieldid", fieldID);
                                            $("#main1").attr("sectionID", sectionID);
                                            $("#main1").attr("pageID", pageID);

                                            for (var ixS = 0; ixS < FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].JSONExtra.AdditionalSettings.length; ixS++) {
                                                if (FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].JSONExtra.AdditionalSettings[ixS].Key == "mapUrl")
                                                    mapUrl = FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].JSONExtra.AdditionalSettings[ixS].Value;
                                            }

                                            $("#main1").load("GoogleMap.html");
                                        }
                                    })
                                )
                                .append($("<div>").attr("id", "main1"))
                        );
                    }



                    right_control = ParentElement;
                    break;
                case "geolocation":

                    var val = "";
                    var ParentElement = $("<div>")
                        .attr("fieldid", xFields)
                        .attr("sectionid", xSection)



                    right_control =
                        $("<input>")
                            .attr("class", "form-control_old")
                            .attr("FORM_GEO", page)
                            .attr("id", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "_" + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                            .attr("dest", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                            .attr("type", "input")
                            .attr(cenabled, cenabled)
                            .attr("fieldid", xFields)
                            .attr("sectionid", xSection)
                            .attr("FORM_GEO", page)
                            .attr("value", dValue)

                    //right_control = ParentElement;

                    break;
                case "ParentField":
                    var ParentElement = $("<div>")
                        .attr("fieldid", xFields)
                        .attr("key", dValue)
                        .attr("sectionid", xSection)
                        .attr("FORM_PARENTID", page);

                    right_control = ParentElement;
                    left_control = $("<label>");
                    break;


                case "PHOTO_V2":
                    var ParentElement = $("<div>")
                        .attr("fieldid", xFields)
                        .attr("sectionid", xSection)
                        .attr("pageid", page)
                        .attr("FORM_PHOTO_V2", page)

                        .css("display", "inline")
                        .append(
                        $("<div>")
                            .css("display", "inline")
                            .append(
                            $("<button>")
                                .attr("class", "btn blue")
                                .css("display", "inline")
                                .css("margin", "0px")
                                .attr("xFields", xFields)
                                .attr("fieldid", xFields)
                                .attr("sectionid", xSection)
                                .attr("pageid", page)
                                .attr("camtype", "photo")
                                .attr("type", "button")
                                .html("Capture Photo")
                                .on({
                                    click: function () {

                                        if (navigator.camera == undefined)
                                            alert("Can not open camra");

                                        else {
                                            getPhotoUrl((navigator.camera == undefined ? "" : navigator.camera.PictureSourceType.CAMERA), $(this).attr("xFields"));
                                        }

                                    }

                                })
                            )
                            .append(
                            $("<hidden>")
                                .attr("xFields", xFields)
                                .attr("txt", "yes")
                            )
                            .append(
                            $("<button>")
                                .attr("class", "btn blue")
                                .attr("camtype", "album")
                                .attr("xFields", xFields)
                                .css("display", "block")
                                .html("From Photo Album")
                                .on({
                                    click: function () {
                                        getPhotoUrl(navigator.camera.PictureSourceType.SAVEDPHOTOALBUM, $(this).attr("xFields"));
                                    }
                                })
                            )
                            .append($("<br/>"))
                            .append(
                            $("<img>")
                                .attr("image", "smallImage")
                                .css("display", "none")
                                .css("width", "60px")
                                .css("height", "60px")
                                .attr("fieldid_cam", xFields)
                            )
                        );
                    right_control = ParentElement;
                    break;
                    break;

                case "device camara":
                    var ParentElement = $("<div>")
                        .attr("fieldid", xFields)
                        .attr("sectionid", xSection)
                        .attr("FORM_PHOTO", page)
                        .append(
                        $("<div>")
                            .append(
                            $("<button>")
                                .attr("class", "btn blue")
                                .attr("xFields", xFields)
                                .html("Capture Photo")
                                .on({
                                    click: function () {
                                        getPhoto((navigator.camera == undefined ? "" : navigator.camera.PictureSourceType.CAMERA), $(this).attr("xFields"));
                                    }
                                })
                            )
                            .append(
                            $("<hidden>")
                                .attr("xFields", xFields)
                                .attr("txt", "yes")
                            )
                            .append(
                            $("<button>")
                                .attr("class", "btn blue")
                                .attr("xFields", xFields)
                                .css("display", "none")
                                .html("From Photo Library")
                                .on({
                                    click: function () {
                                        getPhoto(navigator.camera.PictureSourceType.PHOTOLIBRARY, $(this).attr("xFields"));
                                    }
                                })
                            )
                            /* .append(
                                 $("<button>")
                                     .attr("class", "btn blue")
                                     .attr("xFields", xFields)
                                     .html("From Photo Album")
                                     .on({
                                         click: function () {
                                             getPhoto(navigator.camera.PictureSourceType.SAVEDPHOTOALBUM, $(this).attr("xFields"));
                                         }
                                     })
                             )*/
                            .append($("<br/>"))
                            .append(
                            $("<img>")
                                .attr("image", "smallImage")
                                .css("display", "none")
                                .css("width", "60px")
                                .css("height", "60px")
                                .attr("fieldid_cam", xFields)
                            )
                        );
                    right_control = ParentElement;
                    break;
                case "AUDIO_REC":
                    var ParentElement = $("<div>")
                        .attr("fieldid", xFields)
                        .attr("sectionid", xSection)
                        .attr("FORM_AUDIO_REC", page)
                        .append(
                        $("<div>")
                            .append(
                            $("<button>")
                                .attr("class", "btn blue")
                                .attr("xFields", xFields)
                                .html("Click to Record")
                                .on({
                                    click: function () {
                                        RecordAudio($(this).attr("xFields"));
                                    }
                                })
                            )
                        );
                    right_control = ParentElement;
                    break;
                case "FaceAuth":
                    var ParentElement = $("<div>")
                        .attr("fieldid", xFields)
                        .attr("sectionid", xSection)
                        .attr("FORM_FACESCAN", page)
                        .append(
                        $("<div>")
                            .append(
                            $("<button>")
                                .attr("class", "btn blue")
                                .attr("xFields", xFields)
                                .html("Click to Authenticate")
                                .on({
                                    click: function () {
                                        PerformFaceAuthentication($(this).attr("xFields"));
                                    }
                                })
                            )
                        );
                    right_control = ParentElement;
                    break;
                case "BarcodeScanner":
                    var ParentElement =
                        $("<div>").css("display", "inline").append(
                            $("<input>")
                                .attr("dest", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "." + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                                .attr("field_dest", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                                .attr("fieldid", xFields)
                                .attr("sectionid", xSection)
                                .attr("FORM_BARCODE", page)
                                .attr("xFields", xFields)
                                .attr("fieldid_scan", xFields)
                                .attr("class", "form-control_old")
                                .attr("value", dValue)
                                .css("display", "inline")
                        )
                            .append(
                            $("<a>")
                                .attr("class", "btn blue")
                                .attr("xFields_", xFields)
                                .html("<i class='fa fa-barcode' style='color:white'>&nbsp;</i>")
                                .on({
                                    click: function () {
                                        OpenBarCodeScanner($(this).attr("xFields_"));
                                    }
                                })
                            )
                        ;
                    right_control = ParentElement;
                    break;
                case "Button":
                    left_control = $("<label>");

                    if (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Action == "SubmitForm") {

                        $(c).append(
                            $("<div>")
                                .attr("class", "row")
                                .append(
                                $("<div>")
                                    .attr("class", "col-sm-12")
                                    .append(
                                    $("<div>")
                                        .attr("loadingBox", FormSet.applications[global_applicationid].forms[page].FormID)
                                    )
                                )
                        );
                    }

                    right_control =
                        $("<div>")
                            .attr("class", "col-sm-6")
                            .append(
                            $("<input>")
                                .attr("class", "btn btn-primary")
                                .attr("type", "btn btn-info")
                                .attr("fieldid", xFields)
                                .css("font-size", "large")
                                .css("color", "white")
                                .attr("id", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "_" + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Action)
                                .attr("sectionid", xSection)
                                .attr("pageid", page)
                                .attr("childForm", (control == undefined ? "false" : "true"))
                                .html("<b style='color:white'><i class='fa fa-check'></i>" + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label + "</b>")
                                .attr("value", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label)
                                .on({
                                    click: function () {

                                        $(this).attr("disabled", "disabled");
                                        var fieldID = $(this).attr("fieldid");
                                        var pageID = $(this).attr("pageid");
                                        var sectionID = $(this).attr("sectionid");

                                        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].Action == "SubmitForm") {


                                            iCurrentActivePage = -1;
                                            // Standard Insert Function
                                            if ($(this).attr("childForm") == "true") {

                                                var fieldID = $(this).attr("fieldid");
                                                var sectionID = $(this).attr("sectionid");
                                                var pageID = $(this).attr("pageid");

                                                $("[buttonAct='addFrom'][pageid='" + pageID + "']").show();
                                                $("[buttonAct='cancel'][pageid='" + pageID + "']").hide();
                                                $("[container='sectionrowclass'][parentpage='" + pageID + "']").show();
                                                $("[container='itemrowclass'][parentpage='" + pageID + "'][show='true']").show();

                                                $("[container='child'][fieldid='" + fieldID + "'][sectionid='" + sectionID + "'][pageid='" + pageID + "']").html("");

                                                // Create temp variable here
                                                child_item.PageID = pageID;

                                            }
                                            else {
                                            }



                                            GetPosition();
                                            FilterOption["pageid"] = pageID;
                                            setTimeout(function () {
                                                PerformInsert(FilterOption["pageid"]);
                                            }, (DevicePosition.msg == "Failed to get position" ? 0 : 1200));
                                        }
                                        else {


                                            if (FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].ButtonScript != undefined) {
                                                eval(FormSet.applications[global_applicationid].forms[pageID].Sections[sectionID].Fields[fieldID].ButtonScript);
                                            }
                                            $(this).removeAttr("disabled");
                                        }
                                    }
                                })
                            );
                    break;
                case "label":
                    right_control = "";
                    left_control = $("<p>")
                        .attr("class", "col-sm-12")
                        .html(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label).css("text-align", "left");
                    break;
                case "devider":
                    right_control = "";
                    left_control = $("<p>")
                        .attr("class", "col-sm-12")
                        .attr("id", FormSet.applications[global_applicationid].forms[page].PrimaryTable + "_" + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField)
                        .html("<hr/>")
                    break;
                default:
                    console.log("Control not found: " + FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].InputType);
                    right_control = $("<p>NA</p>");
                    break;
            }


            $(left_control).css("margin-bottom", "22px").css("display", sDisplayChild);
            $(c).append(
                $("<div>")
                    .attr("datafid", (FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].InputType == "SubForm" ? FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Label
                        : FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].DataField))
                    .attr("container", "itemrowclass")
                    .attr("parentpage", page)
                    .attr("fieldid", xFields)
                    .attr("sectionid", xSection)
                    .attr("validate-maxlen", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].maxLen)
                    .attr("validate-minlen", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].minLen)
                    .css("show", FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].ControlVisible)
                    .css("display", sDisplayField)
                    .attr("class", "form-group form-row")
                    .append(
                    $(left_control).append(right_control)
                    )

            );
        }
        $(c).append($("<br/>"));
    }


    $("[buttonAct='cancel'][pageid='" + pageOld + "']").show();
    // End of loop   

    $('[container="footer"]').html("Form Ready");
    $('[container="footer"]').html("Form Ready");

    if (!navigator.geolocation) {
        $("[FORM_GEO]").val("Position not supported.");
    }
    else {
        GetPosition();

    }

    $(c).append(
        $("<div>")
            .attr("id", "divSignHere")
            .css("display", "none")
            .css("position", "fixed")
            .css("top", "5%")
            .css("left", "5%")
            .css("z-index", "4000")
            .css("background", "#f3f3f3")
            .css("border", "1px solid #535353")
            .css("height", "75%")
            .css("width", "90%")
            .css("padding", "10px")
            .append($("<span>").text("Please sign below"))
            .append(
            $("<div>")
                .css("height", "85%")
                .css("width", "95%")
                .attr("container", "signature_sign")
                .html("Signature")
            )
            .append(
            $("<div>")
                .css("display", "inline")
                .append(
                $("<button>")
                    .attr("class", "btn btn-info")
                    .css("display", "inline")
                    .html("Cancel")
                    .on({
                        click: function () {
                            $("#divSignHere").hide();
                        }
                    })
                )
                .append(
                $("<button>")
                    .attr("class", "btn btn-primary")
                    .html("Done")
                    .css("display", "inline")
                    .on({
                        click: function () {
                            $("[FORM_JSIG][fieldid='" + $("[container='signature_sign']").attr("fieldid") + "'][sectionid='" + $("[container='signature_sign']").attr("sectionid") + "'] [container='signature']").html($("[container='signature_sign']").jSignature("getData"));
                            $("button[fieldid='" + $("[container='signature_sign']").attr("fieldid") + "'][sectionid='" + $("[container='signature_sign']").attr("sectionid") + "']").html("Sign <i class='fa fa-check'>");
                            $("#divSignHere").hide();
                        }
                    })
                )
            )
    )




    if (control == undefined) {

        $("#FORM_" + FormSet.applications[global_applicationid].forms[page].FormID).html("");
        $("#FORM_" + FormSet.applications[global_applicationid].forms[page].FormID).append(c);
    }
    else {

        $("[container='child'][fieldid='" + control.fieldID + "'][sectionid='" + control.sectionID + "'][pageid='" + control.pageID + "']").html("");
        $("[container='child'][fieldid='" + control.fieldID + "'][sectionid='" + control.sectionID + "'][pageid='" + control.pageID + "']").append(c);


        $("[container='sectionrowclass'][parentpage='" + control.pageID + "']").hide();
        $("[container='itemrowclass'][parentpage='" + control.pageID + "']").hide();
        $("[container='itemrowclass'][parentpage='" + control.pageID + "'][sectionid='" + control.sectionID + "'][fieldid='" + control.fieldID + "']").show();


    }

    setTimeout(function () {
        $("[lbl='Loader']").html("<i class='fa fa-check'></i> Form ready");
        $("#dim_wrapper").hide('fast');
    }, 200);

    $('[container="formrowid"][parentpage="' + page + '"]').attr("jsonS", JSON.stringify(child_item));



    for (var xC = 0; xC < arrShowHideSettings.length; xC++) {
        $("[field_dest='" + arrShowHideSettings[xC][1] + "']").on("change", { _data: "test", xC: xC }, function (event) {
            $('[datafid="' + arrShowHideSettings[event.data.xC][0] + '"][lastUpt!="' + iLastChange + '"]').hide();
            if ($(this).val() == arrShowHideSettings[event.data.xC][2])
                $('[datafid="' + arrShowHideSettings[event.data.xC][0] + '"]').attr("lastUpt", iLastChange).show('fast');
            setTimeout(function () { iLastChange = new Date().getSeconds() }, 800);
        }
        );

    }

}




var iLastChange = 0;
var GPS_accuracy_attempt = 0;

function GetPosition() {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    if (mapx == undefined)
        navigator.geolocation.getCurrentPosition(function (position) {
            DevicePosition = position;
            $('[container="footer"]').html("GPS Accuracy: " + parseInt(DevicePosition.coords.accuracy));
            if (DevicePosition.coords.accuracy > 8 && GPS_accuracy_attempt < 5) {
                GPS_accuracy_attempt++;

                setTimeout(function () { GetPosition(); }, (DevicePosition.msg == "Failed to get position" ? 10 : 3000));

                return;
            }


            //  if(FormSet.applications[global_applicationid].forms[page].Sections[xSection].Fields[xFields].Process)
            $("[FORM_GEO]").each(function () {

                var fid = $(this).attr("fieldid");
                var sid = $(this).attr("sectionid");
                var pageID = $(this).attr("FORM_GEO");

                if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_longonly != undefined) {
                    if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_longonly == "true") {
                        $(this).val(DevicePosition.coords.longitude);
                    }
                    else {
                    }
                }
                else if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_latonly != undefined) {
                    if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_latonly == "true") {
                        $(this).val(DevicePosition.coords.latitude);
                    }
                    else {
                    }
                }
                else if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_acconly != undefined) {
                    if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_acconly == "true") {
                        $(this).val(DevicePosition.coords.accuracy);
                    }
                    else {
                    }
                }

                else if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_timestamp_only != undefined) {
                    if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_timestamp_only == "true") {
                        var formatted = "";
                        try {
                            var t = new Date(DevicePosition.timestamp.toISOString());
                            formatted = t.format("dd.mm.yyyy hh:MM:ss");
                        }
                        catch (e) {
                            var t = new Date();
                            formatted = t.format("dd.mm.yyyy hh:MM:ss");

                        }
                        $(this).val(formatted);
                    }
                    else {
                    }
                }

                else {
                    $(this).val(JSON.stringify(DevicePosition));
                }


            });
        },
            function (error) {
                console.log("Get posiition failed");

                if (GPS_accuracy_attempt < 5) {
                    GPS_accuracy_attempt++;
                    GetPosition();
                    return;
                }
                DevicePosition = new Object();
                DevicePosition.msg = "Failed to get position";
                DevicePosition.error = error;
                DevicePosition.coords = new Object();
                DevicePosition.coords.longitude = 0;
                DevicePosition.coords.latitude = 0;
                DevicePosition.timestamp = new Date();
                $("[FORM_GEO]").val("0");
            }, options);
    else {
        $("[FORM_GEO]").each(function () {

            var fid = $(this).attr("fieldid");
            var sid = $(this).attr("sectionid");
            var pageID = $(this).attr("FORM_GEO");

            if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_longonly != undefined) {
                if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_longonly == "true") {
                    $(this).val(mapy);
                }
                else {
                }
            }
            else if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_latonly != undefined) {
                if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_latonly == "true") {
                    $(this).val(mapx);
                }
                else {
                }
            }
            else if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_acconly != undefined) {
                if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_acconly == "true") {
                    $(this).val(1);
                }
                else {
                }
            }

            else if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_timestamp_only != undefined) {
                if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].pos_timestamp_only == "true") {
                    var formatted = "";
                    try {
                        var t = new Date(DevicePosition.timestamp.toISOString());
                        formatted = t.format("dd.mm.yyyy hh:MM:ss");
                    }
                    catch (e) {
                        var t = new Date();
                        formatted = t.format("dd.mm.yyyy hh:MM:ss");

                    }
                    $(this).val(formatted);
                }
                else {
                }
            }

            else {
                $(this).val(JSON.stringify(DevicePosition));
            }


        });

    }
}

// A button will call this function
function capturePhoto(fieldid) {
    navigator.camera.getPicture(function (imageURI) {
        var data = imageURI;
        if (imageURI.startsWith("content")) {
            imageFID = fieldid;

            $('[container="footer"]').html("View Loaded");
            // Convert image
            getFileContentAsBase64(path, function (base64Image) {
                //window.open(base64Image);
                $("[fieldid_cam='" + fieldid + "']").show();
                $("[fieldid_cam='" + fieldid + "']").attr("src", "data:image/jpeg;base64," + base64Image);
                // Then you'll be able to handle the myimage.png file as base64
            });
        }
        else {
            $("[fieldid_cam='" + fieldid + "']").show();
            $("[fieldid_cam='" + fieldid + "']").attr("src", "data:image/jpeg;base64," + imageURI);
        }

    }, onFail, {
            quality: 25, destinationType: Camera.DestinationType.FILE_URL
        });
}



var imageFID;
// A button will call this function
function capturePhotoEdit(fieldid) {
    // Take picture using device camera, allow edit, and retrieve image as base64-encoded string
    navigator.camera.getPicture(function (imageURI) {

        var data = imageURI;
        if (imageURI.startsWith("content")) {
            imageFID = fieldid;

            // Convert image
            getFileContentAsBase64(path, function (base64Image) {
                //window.open(base64Image);
                $("[fieldid_cam='" + fieldid + "']").show();
                $("[fieldid_cam='" + fieldid + "']").attr("src", "data:image/jpeg;base64," + base64Image);
                // Then you'll be able to handle the myimage.png file as base64
            });
        }
        else {
            $("[fieldid_cam='" + fieldid + "']").show();
            $("[fieldid_cam='" + fieldid + "']").attr("src", "data:image/jpeg;base64," + imageURI);
        }
    }, onFail, {
            quality: 50, allowEdit: true
        });
}

// A button will call this function
function getPhoto(source, fieldid) {
    /*
    if(DevicePosition.coords.accuracy > 8 && GPS_accuracy_attempt < 5){
                    GPS_accuracy_attempt=0;
                    GetPosition();
                    return;
                }*/

    // Retrieve image file location from specified source
    navigator.camera.getPicture(function (imageURI) {

        var data = imageURI;
        $("[xFields='" + fieldid + "'][txt]").val(imageURI);
        if (imageURI.startsWith("content") || imageURI.startsWith("blob:")) {

            //imageURI = imageURI.substring(imageURI.indexOf(':')+1);
            imageFID = fieldid;
            imageURI = imageURI.replace("blob:", "");
            // Convert image
            getFileContentAsBase64(imageURI, function (base64Image) {
                //window.open(base64Image);

                $("[fieldid_cam='" + fieldid + "']").show();
                $("[fieldid_cam='" + fieldid + "']").attr("src", "data:image/jpeg;base64," + base64Image);
                // Then you'll be able to handle the myimage.png file as base64
            });
        }
        else {
            $("[fieldid_cam='" + fieldid + "']").show();
            $("[fieldid_cam='" + fieldid + "']").attr("src", "data:image/jpeg;base64," + imageURI);
        }

    }, onFail, {
            quality: 50,
            sourceType: source,
            destinationType: Camera.DestinationType.FILE_URI
        });
}



function err(e) {
    alert("error occured:");
    alert(e);
}

function getPhotoUrl(source, fieldid) {
    /*
    if(DevicePosition.coords.accuracy > 8 && GPS_accuracy_attempt < 5){
                    GPS_accuracy_attempt=0;
                    GetPosition();
                    return;
                }*/

    // Retrieve image file location from specified source
    navigator.camera.getPicture(function (imageURI) {

        var data = imageURI;
        $("[xFields='" + fieldid + "'][txt]").val(imageURI);
        if (imageURI.startsWith("content") || imageURI.startsWith("blob:")) {
            imageFID = fieldid;
            $("[fieldid_cam='" + fieldid + "']").attr("src", "" + imageURI);
            $("[fieldid_cam='" + fieldid + "']").show();

            //imageURI = imageURI.substring(imageURI.indexOf(':')+1);
            // Convert image
            getFileContentAsBase64(imageURI, function (base64Image) {
                //window.open(base64Image);

                $("[fieldid_cam='" + fieldid + "']").attr("src", "data:image/jpeg;base64," + base64Image);
                // Then you'll be able to handle the myimage.png file as base64
            });
        }
        else {


            $("[fieldid_cam='" + fieldid + "']").show();
            $("[fieldid_cam='" + fieldid + "']").attr("src", "data:image/jpeg;base64," + imageURI);
        }

    }, onFail, {
            quality: 20,
            sourceType: source,
            destinationType: Camera.DestinationType.DATA_URL
        });
}

// Called if something bad happens.
function onFail(message) {
}


/**
 * This function will handle the conversion from a file to base64 format
 *
 * @path string
 * @callback function receives as first parameter the content of the image
 */
function getFileContentAsBase64(path, callback) {

    window.resolveLocalFileSystemURL(path, gotFile, fail);




    function fail(e) {
        alert("Failed to locate a stored photo. Photo will not be saved.");

    }

    function gotFile(fileEntry) {

        console.log("Reading Image");
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                var content = this.result;

                console.log(content);
                callback(content);
            };
            // The most important point, use the readAsDatURL Method from the file plugin
            reader.readAsDataURL(file);
        });
    }


}


function FaceAuthInitSuccess() {

    $("[container='splash_startingup']").hide(function () {
        $("[container='splash_zoomsection']").show();

        $("#enrollButton").on({
            click: function () {
                SetupZoom();
            }
        });

        $("#authButton").on({
            click: function () {
                PerformFaceAuthentication();
            }
        });

        $("#continueButton").on({
            click: function () {
                ApplicationMainStartPoint();
            }
        });
    });


    ZoomAuthentication.getVersion(function (v) {
        var versionElement = document.getElementById("version");
        versionElement.innerText = "SDK Version " + v;
        versionElement.setAttribute('style', 'display:block');
        this.isActive = true;
    });

    //  ApplicationMainStartPoint();
}

function FaceAuthInitError() {
    alert("Face Auth Init failed.");
    //ApplicationMainStartPoint();
}


setTimeout(function () {

    if (ISFACEAUTH) {
        ZoomAuthentication.initialize("dS13Cc6y6sQW2FZ3paqTZpehV1WiFChT", /* onsuccess */ FaceAuthInitSuccess,
            /* On Error */FaceAuthInitError);
    }
    else {
        //ApplicationMainStartPoint();
    }


}, 800);


function onEnrollComplete(result) {
    if (result.successful) {
        alert('Success!');
    }
    else {
        alert("Enroll Notification: " + result.status);
    }
}

function SetupZoom() {
    $('[lbl="splashscreenmessage"]').html("Enrolling...");

    ZoomAuthentication.enroll(loggedinuser.UserID, encryptionSecret, onEnrollComplete, onFaceError);
}

var encryptionSecret = "giscoeencryptionkey";


function onAuthComplete(result) {
    $('[lbl="splashscreenmessage"]').html("Authentication Completed");
    if (result.successful) {
        $('[lbl="splashscreenmessage"]').html("Authenticated");
        alert('Success!');
    }
    else {

        if (result.status == "UserMustEnroll") {
            SetupZoom();
        }
        else
            alert("Notification: " + result.status);
    }
}

function onFaceError() {
    $('[lbl="splashscreenmessage"]').html("Face error occured");
}

function PerformFaceAuthentication() {
    ZoomAuthentication.authenticate(loggedinuser.UserID, encryptionSecret, onAuthComplete, onFaceError);
}

function RecordAudio(fieldid) {
    navigator.device.audiorecorder.recordAudio(function (data) {
        $("[fieldid_scan='" + fieldid + "']").val(data.full_path);
    }, function () { }, 120)
}

function audio_SuccessRecorded(data) {

};

function audio_ErrorRecorded(data) {

};

function OpenBarCodeScanner(fieldid) {
    if (cordova.plugins == undefined) {
        $("[fieldid_scan='" + fieldid + "']").val("result.text");
    }
    else {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (result.text == "")
                    $("[fieldid_scan='" + fieldid + "']").val("");
                else
                    $("[fieldid_scan='" + fieldid + "']").val(result.text);
            },
            function (error) {
                alert("Scanning failed: " + error);
            },
            {
                preferFrontCamera: true, // iOS and Android 
                showFlipCameraButton: true, // iOS and Android 
                showTorchButton: true, // iOS and Android 
                torchOn: false, // Android, launch with the torch switched on (if available) 
                prompt: "Place a barcode inside the scan area", // Android 
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500 
                formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED 
                orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device 
                disableAnimations: true, // iOS 
                disableSuccessBeep: false // iOS 
            }
        );
    }
}  