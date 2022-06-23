var syncOperationsLayer;
var DevicePosition;
var global_applicationid = -1;
var selectedLang = "";
var ApplicationInformation = {
    ApplicationVersion: "1.9.0.0",
    ConnectedServer: "Giscoe"
}


var child_item = new Object();

var ChildForms = new Array();

FilterOption["ImageSync"] = 0;
FilterOption["Images"] = new Array();


if(localStorage.getItem("Image") != undefined){
    FilterOption["Images"] = JSON.parse(localStorage.getItem("Image"));
}



var loggedinuser = {
    userid: 0
};
/*  
 This is the source of the application. 
 Application will always go here first, and if the client server is local then this url will be updated with the value in local cache
 */

//var defaultServerUrl = "http://172.16.10.104/dev/GiscoeOfflineBuilder/";  
var serverUrl = "";

try {
    serverUrl = (defaultServerUrl == undefined ? rootUrl : defaultServerUrl)
}
catch (e) { };



function GetSelectedLanguage()
{
    for(var xlang = 0;xlang< FormSet.appLanguage.languages.length; xlang++)
    {
        if(selectedLang == FormSet.appLanguage.languages[xlang].LanguageCode)
        {
            return FormSet.appLanguage.languages[xlang];
        }
    }
    return false;
}

function GetSelectedAppLanguage(languages)
{
    for(var xlang = 0;xlang< languages.AppLanguages.length; xlang++)
    {
        if(languages.AppLanguages[xlang].AppID == FormSet.applications[global_applicationid].AppID)
        {
            return languages.AppLanguages[xlang];
        }
    }
    return false;
}

function GetSelectedFormLanguage(appData, formID)
{
    for(var xlang = 0;xlang< appData.Forms.length; xlang++)
    {
        if(appData.Forms[xlang].FormID == formID)
        {
            return appData.Forms[xlang];
        }
    }
    return false;
}

function GetSelectedSectionLanguage(formData, sectionID)
{
    for(var xlang = 0;xlang< formData.LanguageSectionText.length; xlang++)
    {
        if(formData.LanguageSectionText[xlang].SectionID == sectionID)
        {
            return formData.LanguageSectionText[xlang];
        }
    }
    return false;
}

function GetSelectedFieldLanguage(sectionData, fieldID)
{
    for(var xlang = 0;xlang< sectionData.LanguageText.length; xlang++)
    {
        if(sectionData.LanguageText[xlang].FieldID == fieldID)
        {
            return sectionData.LanguageText[xlang];
        }
    }
    return false;
}


function initStorage() {

    if (typeof (Storage) !== "undefined") {
    } else {
        $("#SyncPanel").html("Local storage is not avaliable!");
    }

    /* cREATE A LOCAL STORAGE UNIT FOR RECORDING CHANGES */

    syncOperationsLayer = JSON.parse(localStorage.getItem("syncOperationsLayer"));

    if (syncOperationsLayer == undefined) {
        RecreateStorage();
    }
    else {
 
    }

    // Get User info  
    try {
        loggedinuser = JSON.parse(localStorage.getItem("LocalUser"));
        console.log(loggedinuser)
    }
    catch (err) {  
    }  
} 


function RecreateStorage() {
    
    
        for(var x =0; x< FilterOption["Images"].length; x++)
        {
            localStorage.setItem("Image." + FilterOption["Images"][x].ImageName, undefined);
        }
    
    FilterOption["Images"] = Array();
    
    
    syncOperationsLayer = new Object();
    syncOperationsLayer.InsertLayer = new Array();
    syncOperationsLayer.InsertLayerFields = new Array();
    //SQLOfflineData = new Array();
    ChildForms = new Array();
    localStorage.setItem("syncOperationsLayer", JSON.stringify(syncOperationsLayer));


}


var backedUpSync = undefined;
var szSubFormReturnData = null;

function PerformInsert(pageID) {
    
    
    GetPosition();
    
    
    szSubFormReturnData = new Object();
    szSubFormReturnData.altered = false;
    szSubFormReturnData.TotalFields = 0;
    szSubFormReturnData.Headers = new Array();
    szSubFormReturnData.Data = new Array();
    
    var ErrorLog = "";
    var syncOperationsLayer_ = JSON.parse(JSON.stringify(syncOperationsLayer));
    $("[loadingBox='" + FormSet.applications[global_applicationid].forms[pageID].FormID + "']").html("Creating Record... Please wait...");

    if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == undefined)
        FormSet.applications[global_applicationid].forms[pageID].IsOffline = 2;

    var imidiateInsert = new Object();
    imidiateInsert.InsertLayer = new Array();
    imidiateInsert.InsertLayerFields = new Array();

    child_item = JSON.parse($('[container="formrowid"][parentpage="' + pageID + '"]').attr("jsonS"));
    // If this is a subform, create a clean var
    if (child_item.PageID == pageID) {
        syncOperationsLayer_ = new Object();
        syncOperationsLayer_.InsertLayer = new Array();
        syncOperationsLayer_.InsertLayerFields = new Array();
    }

    // Get All The Inputs for a form					
    // First get all "inputs"
    var UniqeFieldValue = $('[container="formrowid"][parentpage="' + pageID + '"]').attr("uniqeValue");
    var IsEdit = $('[container="formrowid"][parentpage="' + pageID + '"]').attr("isEdit");


    var tempObject = new Object();
    tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
    tempObject.FormName = FormSet.applications[global_applicationid].forms[pageID].FormName;
    tempObject.TableScheme = FormSet.applications[global_applicationid].forms[pageID].TableScheme;
    tempObject.UniqeID = UniqeFieldValue;
    tempObject.FormID = FormSet.applications[global_applicationid].forms[pageID].FormSysID;
    
    
    tempObject.FormEndDate = new Date(  parseInt( DevicePosition.timestamp));
    tempObject.FormEndLat = DevicePosition.coords.latitude;
    tempObject.FormEndLong = DevicePosition.coords.longitude;     
    
    
    tempObject.FormStartDate = new Date(  parseInt( $('[container="formrowid"][parentpage="' + pageID + '"]').attr("startTime") ));
    tempObject.FormStartLat = $('[container="formrowid"][parentpage="' + pageID + '"]').attr("startLat");
    tempObject.FormStartLong = $('[container="formrowid"][parentpage="' + pageID + '"]').attr("startLong");
    
    
    tempObject.Connection = FormSet.applications[global_applicationid].forms[pageID].Connection
    tempObject.DateInserted = new Date().toString();
    tempObject.UniqeID = UniqeFieldValue;
    tempObject.Synced = false;
    tempObject.Edit = IsEdit;
    
    
    
    if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
        imidiateInsert.InsertLayer.push(tempObject);
    else
        syncOperationsLayer_.InsertLayer.push(tempObject);

    $("[FORM_INPUT='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
       
        tempObject = new Object();
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = $(this).val();
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        
		
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DisplaySubform == "yes"){
            szSubFormReturnData.altered = true;

            szSubFormReturnData.TotalFields++;
            szSubFormReturnData.Headers.push( FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label);
            szSubFormReturnData.Data.push( $(this).val() ) ;
        }
        
        tempObject.UniqeID = UniqeFieldValue;
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" && $(this).val() == "") {
            ErrorLog += "<p><i class='fa fa-warning' /> Value for " + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + " is required</p>";
			return;
        }
		
		
        if (tempObject.Value == "")
            return;
		
		
        if ($(this).attr("doProcess") == "false") { }
        
        else
        {
            if(FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IDColumn == "true")                
            {
                tempObject.IDField= true;
            }
            
            if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
                imidiateInsert.InsertLayerFields.push(tempObject);
            else
                syncOperationsLayer_.InsertLayerFields.push(tempObject);
        }
    });


    // if a subform -> pop
    /*
            $("[FORM_SUBFORM='" + pageID + "']").each(function () {
            var fid= $(this).attr("fieldid");
            var sid= $(this).attr("sectionid");
            tempObject = new Object();
            tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
            tempObject.Value = JSON.stringify(ChildForm)
            tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
            tempObject.UniqeID = UniqeFieldValue;

            if(FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" &&    $(this).val() == "")
            {
                ErrorLog += "<p><i class='fa fa-warning' />Value for " +FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label  +   " is required</p>";
            }

                if(FormSet.applications[global_applicationid].forms[pageID].IsOffline==1)
                    imidiateInsert.InsertLayerFields.push( tempObject  );
                else
                    syncOperationsLayer_.InsertLayerFields.push( tempObject  );
           });

     */
    
    $("[FORM_DATE='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        tempObject = new Object();
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = $(this).val();
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;

        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" && $(this).val() == "") {
            ErrorLog += "<p><i class='fa fa-warning'></i> Value for " + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + " is required</p>";
			return;
        }

        if (tempObject.Value == "")
            return;
		
        if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
            imidiateInsert.InsertLayerFields.push(tempObject);
        else
            syncOperationsLayer_.InsertLayerFields.push(tempObject);
        
        
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DisplaySubform == "yes"){
            szSubFormReturnData.altered = true;

            szSubFormReturnData.TotalFields++;
            szSubFormReturnData.Headers.push( FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label);
            szSubFormReturnData.Data.push( $(this).val() ) ;
        }
        
    });

    $("[FORM_DDL='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        tempObject = new Object();

        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = $(this).val();
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;
		
		
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" && $(this).val() == "[NULL]") {
            ErrorLog += "<p><i class='fa fa-warning'></i> Value for " + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + " is required</p>";
        }

        if (tempObject.Value == "")
            return;
		
        if ($(this).attr("doProcess") == "false") { }
        else
        {
            if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
                imidiateInsert.InsertLayerFields.push(tempObject);
            else
                syncOperationsLayer_.InsertLayerFields.push(tempObject);
        }
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DisplaySubform == "yes"){
            szSubFormReturnData.altered = true;

            szSubFormReturnData.TotalFields++;
            szSubFormReturnData.Headers.push( FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label);
            szSubFormReturnData.Data.push( $(this).find(":selected").text() ) ;
        }
    });
    
    
    $("[FORM_DDL_MULTI='" + pageID + "']").each(function () {
        console.log($(this).val());
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        tempObject = new Object();

        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = "";
        tempObject.Text = "";
        $(this).find(":selected").each(function() {
            if(tempObject.Value!=""){
                tempObject.Value += ",";
                tempObject.Text += ",";
            }
            tempObject.Value += $(this).val();
            tempObject.Text += $(this).text();
        } );
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;
        
        
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DisplaySubform == "yes"){
            szSubFormReturnData.altered = true;

            szSubFormReturnData.TotalFields++;
            szSubFormReturnData.Headers.push( FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label);
            szSubFormReturnData.Data.push(tempObject.Text) ;
        }
        
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" && ($(this).val() == "null" || $(this).val() == null)) {
            ErrorLog += "<p><i class='fa fa-warning'></i> Value for " + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + " is required</p>";
        }
        if ($(this).attr("doProcess") == "false") { }
        else
        {
            if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
                imidiateInsert.InsertLayerFields.push(tempObject);
            else
                syncOperationsLayer_.InsertLayerFields.push(tempObject);
        }
    });
    

    /// Foreach Signature
    $("[FORM_JSIG='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        tempObject = new Object();
        tempObject.Type = "FORM_JSIG";
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = $(this).find("[container]").html();
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;

        if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
            imidiateInsert.InsertLayerFields.push(tempObject);
        else
            syncOperationsLayer_.InsertLayerFields.push(tempObject);
    });


    /// Foreach Signature
    $("[FORM_BARCODE='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        tempObject = new Object();
        
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = ( $(this).val() == "Open Scanner"?"": $(this).val());//JSON.stringify(DevicePosition);
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;

        
        tempObject.UniqeID = UniqeFieldValue;
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" && $(this).val() == "") {
            ErrorLog += "<p><i class='fa fa-warning' /> Value for " + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + " is required</p>";
        }
        
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DisplaySubform == "yes"){
            szSubFormReturnData.altered = true;

            szSubFormReturnData.TotalFields++;
            szSubFormReturnData.Headers.push( FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label);
            szSubFormReturnData.Data.push( $(this).val() ) ;
        }
        if ($(this).attr("doProcess") == "false") { }
        else
        {
            if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
                imidiateInsert.InsertLayerFields.push(tempObject);
            else
                syncOperationsLayer_.InsertLayerFields.push(tempObject);
        } 
    });
    

    /// Foreach Signature
    $("[FORM_GEO='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        tempObject = new Object();
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = $(this).val();//JSON.stringify(DevicePosition);
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;

        if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
            imidiateInsert.InsertLayerFields.push(tempObject);
        else
            syncOperationsLayer_.InsertLayerFields.push(tempObject);
    });

    
    $("[form_sub_form='" + pageID + "']").each(function () {
        
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" &&  $("[container='childResults'][pageid='" + pageID + "'][fieldid='" + fid + "'][sectionid='" + sid + "'] tr").length==0)
         {
            ErrorLog += "<p><i class='fa fa-warning'></i> Please fill in '" + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + "' form</p>";
         }
    });
  
    $("[FORM_CHECK='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        
        tempObject = new Object();
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = $(this).prop("checked");
        
        tempObject.Type = "FORM_CHECK";
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;


/*
        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" && $(this).find("[txt]").val() == "") {
            ErrorLog += "<p><i class='fa fa-warning'></i> Photo for " + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + " is required</p>";
        }
*/
  
        if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
            imidiateInsert.InsertLayerFields.push(tempObject);
        else
            syncOperationsLayer_.InsertLayerFields.push(tempObject);
    });
	
    $("[FORM_PHOTO_V2='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        
        tempObject = new Object();
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        
        var base6x = $(this).find("[txt]").val();
        
         if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" && $(this).find("[txt]").val() == "") {
            ErrorLog += "<p><i class='fa fa-warning'></i> Photo for " + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + " is required</p>";
        }
        
        if ( $(this).find("[txt]").val() != ""){
        
        var details = Object();
        details.ImageName = UniqeFieldValue + "." +fid;
        details.Application =  FormSet.applications[global_applicationid].ApplicationName;         
        details.ProjectName = FormSet.applications[global_applicationid].Project;
        details.UniqeFieldValue = UniqeFieldValue;
        details.fid =fid;
        details.ImageName =  UniqeFieldValue + "." +fid;
        
        FilterOption["Images"].push(  details );
        
            
            
            try{
                
                

            db.transaction(function (tx) {
                tx.executeSql('INSERT INTO PHOTOS VALUES (?,?,?)', [details.ImageName, base6x, JSON.stringify(details)]);
            }, function (error) {
               alert('Transaction ERROR: ' + error.message);
            }, function () {
            });
                
                /*
                
                localStorage.setItem("Image", JSON.stringify(FilterOption["Images"]));
                var xName  ="Image." + details.ImageName;
                //localStorage.setItem(, base6x);                
                
dbPhotos.save({key:xName, value:{ name:xName, data:base6x, ImageInfo:details}});
            
                */
            }
            catch(e){
                console.log(e);
                alert("Image not saved! Not enough storage.");
            }
        
        
        tempObject.ImageName = UniqeFieldValue + "." +fid;
        tempObject.Value = "";
        

        
        tempObject.Type = "FORM_PHOTO_V2";
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;

       
        if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
            imidiateInsert.InsertLayerFields.push(tempObject);
        else
            syncOperationsLayer_.InsertLayerFields.push(tempObject);
        }
    });
    
    
    $("[FORM_PHOTO='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        
        tempObject = new Object();
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;
        tempObject.Value = $(this).find("[txt]").val();
        
        tempObject.Type = "FORM_PHOTO";
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;

        if (FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].IsRequired == "yes" && $(this).find("[txt]").val() == "") {
            ErrorLog += "<p><i class='fa fa-warning'></i> Photo for " + FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].Label + " is required</p>";
			return;
        }
        
        if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
            imidiateInsert.InsertLayerFields.push(tempObject);
        else
            syncOperationsLayer_.InsertLayerFields.push(tempObject);
    });
    

    $("[FORM_PARENTID='" + pageID + "']").each(function () {
        var fid = $(this).attr("fieldid");
        var sid = $(this).attr("sectionid");
        tempObject = new Object();
        tempObject.Field = FormSet.applications[global_applicationid].forms[pageID].Sections[sid].Fields[fid].DataField;



        tempObject.Value = "[PARENT_ID]";
        tempObject.Table = FormSet.applications[global_applicationid].forms[pageID].PrimaryTable;
        tempObject.UniqeID = UniqeFieldValue;

        if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
            imidiateInsert.InsertLayerFields.push(tempObject);
        else
            syncOperationsLayer_.InsertLayerFields.push(tempObject);
    });


    if (ErrorLog != "") {
        $('[value="Submit"]').removeAttr("disabled");
        $("[loadingBox='" + FormSet.applications[global_applicationid].forms[pageID].FormID + "']").html(ErrorLog);

    }
    else {
        ExternalFormLink = {
            fullUrl: "",
            FormName: "",
            failed: false,
            Fields: []
        };

        $("[loadingBox='" + FormSet.applications[global_applicationid].forms[pageID].FormID + "']").html("Finalizing...");

        // First Loop thru all the child items and add related children
        // If it is a sub form, dont save yet
        if (child_item.PageID == pageID) {
            $("[loadingBox='" + FormSet.applications[global_applicationid].forms[pageID].FormID + "']").html("");

            $("[buttonAct='addFrom'][pageid='" + child_item.ParentForm + "']").show();
            $("[buttonAct='cancel'][pageid='" + child_item.ParentForm + "']").hide();
            $("[container='sectionrowclass'][parentpage='" + pageID + "']").hide();
            $("[container='itemrowclass'][parentpage='" + child_item.ParentForm + "']").show();
            $("[container='sectionrowclass'][parentpage='" + child_item.ParentForm + "']").show();
            $("[container='itemrowclass'][parentpage='" + child_item.PageID + "']").hide();
            // Return to parent form
            child_item.ParentFormUID = $('[container="formrowid"][parentpage="' + child_item.ParentForm + '"]').attr("uniqeValue");
            if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1)
                child_item.SyncArray = imidiateInsert;
            else
                child_item.SyncArray = syncOperationsLayer_;

            ChildForms.push(child_item);
            
            ChildForms.forEach(function(r){
                if(r.PageID == pageID){
                    var c  = new Date( r.SyncArray.InsertLayer[0].DateInserted); 
                    
                    if(szSubFormReturnData.altered)
                    {
                        if($("[container='childResults'][pageid='" + child_item.ParentForm + "'][fieldid='" + child_item.ParentFieldID + "'][sectionid='" + child_item.ParentSectionID + "'] tr").length ==0)
                        {
                            
                            var tr = $("<tr>");
                            for(var x =0; x< szSubFormReturnData.TotalFields; x++)
                            {
                                $(tr).append($("<th>").text( szSubFormReturnData.Headers[x] ))
                            }
                            $("[container='childResults'][pageid='" + child_item.ParentForm + "'][fieldid='" + child_item.ParentFieldID + "'][sectionid='" + child_item.ParentSectionID + "'] table")
                                .attr("class", "table table-stripped")
                                .append(tr)
                                    
                        }
                    }
                    tr = $("<tr>");
                    for(var x =0; x< szSubFormReturnData.TotalFields; x++)
                    {
                        $(tr).append($("<td>").text( szSubFormReturnData.Data[x] ))
                    }
                    $("[container='childResults'][pageid='" + child_item.ParentForm + "'][fieldid='" + child_item.ParentFieldID + "'][sectionid='" + child_item.ParentSectionID + "'] table")
                                .append(tr)
                 /*   $("[container='childResults'][pageid='" + child_item.ParentForm + "'][fieldid='" + child_item.ParentFieldID + "'][sectionid='" + child_item.ParentSectionID + "']").append($("<p>").html(
                       " Form added: " + c.getHours() + ":" + c.getMinutes() + ":" + c.getSeconds() ));*/
                    szSubFormReturnData = new Object();
                }
            } 
                              )
            
            // display some info on the child objects
            child_item = new Object();




        }
        else {
            if (FormSet.applications[global_applicationid].forms[pageID].IsOffline == 1) {
                imidiateInsert.ChildData = ChildForms;
                $("[loadingBox='" + FormSet.applications[global_applicationid].forms[pageID].FormID + "']").html("Writing Changes... Please wait...");
                // Iff the form is not offline
                PerformOnlineSyncOperation(imidiateInsert, pageID);
            }
            else {
                syncOperationsLayer_.ChildData = ChildForms;
                syncOperationsLayer = syncOperationsLayer_;
                // if the page is offline, drop in local storage, else pop it up
                
                try{
                localStorage.setItem("syncOperationsLayer", JSON.stringify(syncOperationsLayer));
                }
                catch(eroor){
                    alert("There is not enough memory space to save this form. Please notify your administrator.");
                    }
                /* $("[loadingBox='" +  FormSet.applications[global_applicationid].forms[pageID].FormID + "']").html("<div id='divAlertSection' class='alert alert-info'>Successs... <br/>Please use the Sync Menu to finalize</div><a id='MoveTrigger' href='#divAlertSection'>");
                 */
                $('[act="SyncModule"]').trigger("click");

            }
        }
    }

}




function PerformOnlineSyncOperation(immidiatesync, pageID) {
    $("#divStatus").html("Processing... Please Wait...");
    
        GetPosition();
        try{
        ApplicationInformation.DeviceInfo = device.manufacturer + " " + device.model + " (" + device.platform + ") :" + device.serial;
        }
        catch(e){
            ApplicationInformation.DeviceInfo = "Failed to get device info";
        }
        
    
    $.ajax(
    {
        type: "POST",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
            url: serverUrl + "WebServices/Offline/SyncService.asmx/PerformSyncV2",
            data: JSON.stringify({ Input: immidiatesync, _UserInfo: loggedinuser, _AppInfo: ApplicationInformation, _DevicePosition: DevicePosition }),
        success: function (data) {
            $("[loadingBox='" + FormSet.applications[global_applicationid].forms[pageID].FormID + "']").html("");
            var results = JSON.parse(data.d);
            $("[loadingBox='" + FormSet.applications[global_applicationid].forms[pageID].FormID + "']").attr("class", "alert alert-info").append(
               $("<b>").append($("<b>").html("Success <i class='fa-check-circle'></i>"))
           ).append(
$("<button>").html("<i class='fa fa-back' /> Home")
	.on({click:function(){
                    $(".panel").hide();
                    $("#menuScreen").show();
	}})
           );

        }
    }).fail(function () {
        $("[loadingBox='" + FormSet.applications[global_applicationid].forms[pageID].FormID + "']").html("<p class='alert alert-error'><b>Failed to Sync</b></p><p>Could not connect to server for Sync. <br/>Please check your connection settings.</p>");
    });
}


function HitCase(CaseID, data, control, conn){
	
	
	$("[processcontainer]").each(function(){ 
		if($(this).attr("type")== "GridList") {
			var v= eval("JSON.stringify( grid_"+ $(this).attr("listID") +".data)");
			
			data += $(this).attr("processvid") + "[_Q_1]"+ v +"[_Q_2]";
		}
		else
			data += $(this).attr("processvid") + "[_Q_1]"+ $(this).val() +"[_Q_2]";
	});
	
	
	$('#ProcessContent').html("Loading...");
	if(control =="" && activePControl!="")
		control = activePControl;
	if(conn == undefined)
		conn = activeGConn;
	
	if(control=='' || control == undefined){
	$( "#dialog" ).dialog();
    $.ajax({
		    type: "GET",
		    contentType: "application/json; charset=utf-8",
		    url: serverUrl + 'special/process/manage.aspx?caseid=' + CaseID + "&conn=" + conn + "&input="+ data,
		    success: function (data) {

			$('#ProcessContent').html(data);
						
		    }
		}).fail(function () {
		    // Find the offline config
		    $('#ProcessContent').html("Failed to execute case");
		});
	}
	else{
		activePControl= control;
		$("#"  + control).html("Loading...");
		 $.ajax({
		    type: "GET",
		    contentType: "application/json; charset=utf-8",
		    url: serverUrl + 'special/process/manage.aspx?caseid=' + CaseID + "&conn=" + conn + "&input="+ data,
		    success: function (data) {

			$("#"  + control).html(data);
						
		    }
		}).fail(function () {
		    // Find the offline config
		    $("#"  + activePControl).html("Failed to execute case");
		});
	}
}

var activeGConn = "";
var activePControl ="";
function LaunchNewProcess(ProcessID, conn){
	$('#ProcessContent').html("Loading...");
	activeGConn= conn;
	$( "#dialog" ).dialog();
    $.ajax({
		    type: "GET",
		    contentType: "application/json; charset=utf-8",
		    url: serverUrl + 'special/process/manage.aspx?proc=' + ProcessID + "&conn=" + conn,
		    success: function (data) {
activePControl = "ProcessContent";
			$('#ProcessContent').html(data);
						
		    }
		}).fail(function () {
		    // Find the offline config
		    $('#ProcessContent').html("Failed to execute case");
		});
}


function InitAppConfig() {
    bFirstPass = false;
    $('[container="loadingScreen"]').show('fast');
    $('[container="footer"]').html("Loading Config.... <br/>Please wait...");
    $.ajax(
		{
		    type: "POST",
		    dataType: 'json',
		    contentType: "application/json; charset=utf-8",
		    url: serverUrl + "WebServices/Offline/SyncService.asmx/FetchConfig",
		    data: JSON.stringify({ Input: loggedinuser }),
		    success: function (data) {
		        var o = eval(data.d);

		        FormSet = o[0];
		        if (!FormSet.userInfo.Success) {
		            // Cant log the user in
		            $('[container="usererrormessage"]').show();
					$('[container="loadingScreen"]').hide();
					
		        }
		        else {
		            // Run thru all fields and add the Extra JSON
		            initWelcome();
		            localStorage.setItem("ApplicationProperties", JSON.stringify(FormSet));
		        }
		    }
		}).fail(function () {
		    $('[container="footer"]').html("Application is Offline");

                    $('[container="loadingScreen"]').hide('fast');
		    if (localStorage == undefined) {
		        initWelcome();
		    }
		    else {
		        // offline... hass init?

		        if (localStorage.getItem("ApplicationProperties") == undefined) {
		            $('[container="offlinemessage"]').show();
		            initWelcome();
		        }
		        else {
		            FormSet = JSON.parse(localStorage.getItem("ApplicationProperties"));
		            initWelcome();
		        }
		    }
		    // Find the offline config
		});
}



function returnUserAttribute(attrName){
    for(var x =0; x< FormSet.userInfo.Attributes.length; x++){
        if( FormSet.userInfo.Attributes[x].AttributeName == attrName  )
            return  FormSet.userInfo.Attributes[x].AttributeValue;
    }
    
    return "";
}

function UpdateJsonFields() {
    for (var xForm = 0; xForm < FormSet.applications[global_applicationid].forms.length; xForm++) {

        for (var xSection = 0; xSection < FormSet.applications[global_applicationid].forms[xForm].Sections.length; xSection++) {
            for (var xField = 0; xField < FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields.length; xField++) {
                if (FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].JSONExtra != undefined)
                    for (var xSettings = 0; xSettings < FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].JSONExtra.AdditionalSettings.length; xSettings++) {
                        if (FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].JSONExtra.AdditionalSettings[xSettings].sPath != "") {
                            // First ensure the path is solid - TODO!
                            eval('FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].' + FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].JSONExtra.AdditionalSettings[xSettings].sPath + ' = new Object()');
                        }

                        FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].JSONExtra.AdditionalSettings[xSettings].sPath += "";
                        eval('FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].' +
                             FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].JSONExtra.AdditionalSettings[xSettings].sPath +
                             FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].JSONExtra.AdditionalSettings[xSettings].Key + ' = "' +
                             FormSet.applications[global_applicationid].forms[xForm].Sections[xSection].Fields[xField].JSONExtra.AdditionalSettings[xSettings].Value + '";');
                    }
            }
        }
    }
}

var FormSet;



