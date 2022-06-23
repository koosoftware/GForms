
    /* Stores any search results */
var CurrentSLVersion = "0.00.2.0";
var SelectedTool;
var arrSearchResuls;
var arrAddResuls;
var RequestObject =
{
    Url: "",
    Value2Search: "",
    minx: "",
    miny: "",
    maxx: "",
    maxy: "",
    CountOnly: "false",
    GroupBy: "",   /*   ACtual fiels */
    OutputStatistics: "",  /*  JSON object with info  */
    SpatialReference: ""
};

var GroupByStat =
   [
       {
           "statisticType": "<count | sum | min | max | avg | stddev | var>",
           "onStatisticField": "Field1",
           "outStatisticFieldName": "Out_Field_Name1"
       }
   ]
;




/*
*/
var StartUpConfig = "";
var StartUpConfigXml;
var MapProcessName = "";
var MapApplication =
{
    IsMap: true,
    EvalFunction: "",
    HasData: false,
    MapLoaded: false
};

function LoadXml() {
    if (FilterOption["GIS_MapContainer"] == undefined)
        FilterOption["GIS_MapContainer"] = "divHomeSite";
    var obj =
        {
            ProcessID: iProjID,
            Process: getParameter("ProcessID")
        };

    RequestObject.ProjectID = iProjID;

    req1 = $.ajax({
        type: "POST",
        dataType: 'json',
        url: rootUrl + "WebServices/GisServices.asmx/GetMapInfo",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ PassesObj: obj }),
        success: function (data) {

            if (data.d == "") {
                alert("Fetching configuration failed", "<p>An unexpected error occured while fetching the configurations.</p><p>Please contact your administrator.</p>", "");
                return;
            }
            StartUpConfig = JSON.parse(data.d);
            MapApplication.HasData = true;
            if (StartUpConfig.Code == "404") {
                alert("Missing information", "<p>There appears to be some data missing with this application.</p><p>Please correct the configuration before proceeding.</p>", "");
            }
            else {

                if (GetConfigProp("Application>RequireAuth") == "true" && userDetail == "") {
                    alert("Authentication required");
                }
                else {
                    StartUpConfigXml = $.parseXML(StartUpConfig.content);

                    if (MapApplication.IsMap) {
                        LoadSL();
 
                        if (GetConfigProp("Viewer>apptype") != "arcgisonline") {
                            $("#silverlightControlHost").css("height", window.innerHeight - 50);
                            FetchMapData(GetConfigProp("ToolsID"));
                        }
                        else {
                            $("#" + FilterOption["GIS_MapContainer"]).css("height", window.innerHeight - 50);
                        }

                    }
                }
            }

            if (MapApplication.EvalFunction != "") {
                eval(MapApplication.EvalFunction);
                MapApplication.EvalFunction = "";
            }
        },
        onError:function(){ alert("failed");
                          }
    });
    req1.done(function () {
        $("#divMapLoader").html("");
    });
}

function LoadMap() {
    MapApplication.IsMap = true;
    MapApplication.HasData = false;

    if (MapProcessName == "")
        MapProcessName = getParameter("MapProcessName");
    ShowLoadingMessage();

    LoadXml();


}


function LoadSL() {

    if (MapProcessName == "")
        MapProcessName = getParameter("MapProcessName");
    $('[headContainer="UserTab"]').hide();
    MapApplication.MapLoaded = false;
    ShowLoadingMessage();
    var admin = getParameter("Admin");
    if (FilterOption["GIS_Admin"] != undefined)
        admin = FilterOption["GIS_Admin"];
    if (GetConfigProp("Viewer>apptype") == "arcgisonline") {

        $("#silverlightControlHost").css("min-height", "600px");
        PerformCallP(rootUrl + "HTML5Map/Services/pages/getmap.aspx?MapUrl=" + GetConfigProp("Viewer>arcgisonlineurl") + "&Admin=" + admin + "&MapProcessName=" + MapProcessName, "", FilterOption["GIS_MapContainer"]);

        MapApplication.MapLoaded = true;
    }
    else if (GetConfigProp("Viewer>apptype") == "arcgisoffline") {
        PerformCallP(rootUrl + "HTML5Map/services/Pages/getMap.aspx?MapUrl=" + GetConfigProp("Viewer>arcgisonlineurl"), "", "silverlightControlHost");
        MapApplication.MapLoaded = true;
    }
    else {
        console.log(GetDynoConfigProp("StaticData>Url[name='" + GetConfigProp("Viewer>UrlName") + "']") + GetConfigProp("Viewer>ApplicationName") + "/" + GetConfigProp("Viewer>FileName"));
        Silverlight.createObjectEx({
            source: GetDynoConfigProp("StaticData>Url[name='" + GetConfigProp("Viewer>UrlName") + "']") + GetConfigProp("Viewer>ApplicationName") + "/" + GetConfigProp("Viewer>FileName"),
            parentElement: silverlightControlHost,
            id: "silverlightControlHost2",
            properties: {
                width: "100%",
                onError: "onSilverlightError",
                onLoad: "pluginLoaded",
                enableGPUAcceleration: 'true',
                enablehtmlaccess: 'true',
                onSourceDownloadProgressChanged: "onSourceDownloadProgressChanged",
                Windowless: "true",
                autoUpgrade: "true",
                EnableHtmlAccess: "true",
                source: GetDynoConfigProp("StaticData>Url[name='" + GetConfigProp("Viewer>UrlName") + "']") + GetConfigProp("Viewer>ApplicationName") + "/" + GetConfigProp("Viewer>FileName"),
                height: "99%",
                background: "#ECEEF1",
                alt: "<p>Silverlight was not found on your browser.<br/><a target='blank' href='http://go.microsoft.com/fwlink/?LinkID=149156&v=3.0.40818.0'>Download it from here</a></p>",
                version: "5.1.30214.0"
            },
            events: { onSourceDownloadProgressChanged: "onSourceDownloadProgressChanged", onLoad: "pluginLoaded", onError: "onSilverlightError" },
            initParams: "param1=value1,param2=value2",
            context: "row4"
        });
    }

    setTimeout(function () {

        $("#divMapContentArea").css("height", "100%");
        $("#divMapContentArea>object").css("height", "100%");
    }, 1300);
}



function DrawMapWithIdentify() {
    /*1:get map object*/

    EnableDrawMode("false");

    if (arrSearchResuls == undefined || arrSearchResuls.features == undefined || arrSearchResuls.features.length == undefined) {
        popUpT("<p>Could not draw on the map using the identify feature</p><p>The results returned were invalid</p>", "Could not draw on map");
        $("#divMapLoader").html("");
        return;
    }
    if (arrSearchResuls.features.length == 0) {
        alert("No results", "The query did not return any results", "");
        $("#divMapLoader").html("");
    }
    if (arrSearchResuls.features[0].geometry == undefined) {
        $("#divMapLoader").html("");
        return;
    }
    var DrawString = "";
    for (var x = 0; x < arrSearchResuls.features.length; x++) {

        if (arrSearchResuls.features[0].geometry.rings == undefined) {
            DrawString += arrSearchResuls.features[x].geometry.x + "," + arrSearchResuls.features[x].geometry.y + ";";
        }
        else {
            DrawString += arrSearchResuls.features[x].geometry.rings + ";";
        }

    }


    try {
        var spType = "";

        if (GetConfigProp("Viewer>apptype") == "arcgisonline") {

            if (FilterOption["Graphic"] == undefined) {
                FilterOption["Graphic"] = new Object();
                FilterOption["Graphic"].FillColor = new FilterOption.Esri.Color("red");
                FilterOption["Graphic"].LineWidth = "2";
            }
        }
        else {
            var sp = "";
            if (arrSearchResuls.spatialReference.wkt != undefined) {
                spType = "wkt";
                sp = arrSearchResuls.spatialReference.wkt;
            }
            else if (arrSearchResuls.spatialReference.wkid != undefined) {
                spType = "wkid";
                sp = arrSearchResuls.spatialReference.wkid;
            }

            if (sp != "")
                FilterOption["DrawWithIdentifyResponse"] = slCtl.Content.MyMap.DrawOnMap(DrawString, sp, spType);
            else {
                alert("Could not draw on silverlight map", "<p>Could not draw on the map using the identify feature</p><p>The spatial reference is unknown</p>", "");
            }
        }
    }
    catch (err) {
        popUpT("Could not draw on the map using the identify feature", "Failed to Draw on Map");
        $("#divMapLoader").html("");
    }
}


function DrawMapWithCurrentShape() {
    /*1:get map object*/
    EnableDrawMode("false");
    var DrawString = "";

    if (GetConfigProp("Viewer>apptype") == "arcgisonline") {

        if (FilterOption["Graphic"] == undefined) {
            FilterOption["Graphic"] = new Object();
            FilterOption["Graphic"].FillColor = new FilterOption.Esri.Color("red");
            FilterOption["Graphic"].LineWidth = "2";
        }
        FilterOption[99].ZoomToResult(0);

    }
    else {
        for (var x = 0; x < geoLastDrawnObject.rings.length; x++) {
            DrawString += geoLastDrawnObject.rings[x] + ";";
        }


        try {
            var spType = "";
            var sp = "";
            if (geoLastDrawnObject.spatialReference.wkt != undefined) {
                spType = "wkt";
                sp = geoLastDrawnObject.spatialReference.wkt;
            }
            else if (geoLastDrawnObject.spatialReference.wkid != undefined) {
                spType = "wkid";
                sp = geoLastDrawnObject.spatialReference.wkid;
            }


            if (sp != "")
                slCtl.Content.MyMap.DrawOnMap(DrawString, sp, spType);
            else {
                alert("Could not draw on map with the specified shape", "<p>Could not draw on the map using the current shape</p><p>The spatial reference is unknown</p>", "");
            }
        }
        catch (err) {
            alert("Could not draw on map with the specified shape", "Could not draw on the map using the current shape", "");
            $("#divMapLoader").html("");
        }
    }

}



/**  When the map actually loaded **/
function MapInited() {

    if (GetConfigProp("Viewer>apptype") != "arcgisonline") {
        if (slCtl == undefined) {
            /*alert("Silverlight Load Error", "<p>A silverlight error occured and some of the tools might not be working.</p><p> Apologies for the inconvenience</p>", "");*/
            return;
        }
        var testV = slCtl.Content.MyMap.ExecuteMethod("GetVersion()", "", "");
        if (testV != CurrentSLVersion) {
            alert("Incorrect SL version", "<p>The cached version of your silverlight add in is out of sync.</p><p>Please refresh your browser/clear your cache</p><p>Your version:" + testV + ", server version: " + CurrentSLVersion + "</p>", "");
            return;
        }
    }
    else {

        if (FilterOption['Map'].map == undefined)
            return;


        if (GetConfigProp("AutoSearch>SpatialRefIn") != "") {
            FilterOption["Map"].map.spatialReference = new FilterOption.Esri.SpatialReference(parseInt(GetConfigProp("AutoSearch>SpatialRefIn")));
        }
        FilterOption[98].map.graphics.spatialReference = GetCurrentSpatialReference();

    }

    /* Load any map startups here */
    MapApplication.MapLoaded = true;




    var value2filter = (FilterOption["GIS_AutoValue"] == undefined ? getParameter("autovalue") : FilterOption["GIS_AutoValue"]);
    FilterOption["GIS_AutoValue"] = undefined;
    if (value2filter != "" && value2filter.toLowerCase() != "null") {
        callback_funtion = "ZoomToFeature_auto";

        if ((GetConfigProp("Viewer>apptype") == "arcgisonline")) {
            FilterOption["Graphic"] = new Object();
            FilterOption["Graphic"].FillColor = new FilterOption.Esri.Color({ g: 125, r: 11, b: 175, a: 0.2 })
            FilterOption["Graphic"].LineWidth = "2";
        }

        var callB = ((GetConfigProp("Viewer>apptype") != "arcgisonline") ? 2500 : 200);

        var Url = GetDynoConfigProp("StaticData>Url[name='" + GetConfigProp("AutoSearch>UrlName") + "']");
        if (Url == "") {
            alert("Unable to auto zoom. This may be because of incorrect configurations", "");
            return;
        }


        RequestObject.ReturnGeometry = "true";
        RequestObject.CountOnly = "false";
        RequestObject.Url = Url + GetConfigProp("AutoSearch>UrlExt");
        RequestObject.Value2Search = GetConfigProp("AutoSearch>Field") + "='" + value2filter + "'";
        setTimeout(function () {
            QueryMapServices();
        }, callB);

    }


    var execOnload = GetConfigProp("AutoSearch>OnLoadedScript");
    if (execOnload != "") {
        eval(execOnload);
    }
}



/**  Generic version of the  'find feature' */
function QueryMapServices() {
    if (FilterOption["Graphic"] == undefined) {
        try{
            FilterOption["Graphic"] = new Object();
            FilterOption["Graphic"].FillColor = new FilterOption.Esri.Color("red");
            FilterOption["Graphic"].LineWidth = "2";
        }
        catch(exp)
        {}
    }
    if (MapApplication.IsMap) {
        /*
                if (slCtl.Content.MyMap == undefined) {
                    alert("<p>Map not initialized", "The map has not finished initializing yet.</p><p>Please wait till the map has loaded</p>", "");
                    return;
                }*/

        RequestObject.SpatialReference = GetCurrentSpatialReference();
        RequestObject.SpatialReferenceOut = GetConfigProp("AutoSearch>SpatialRefOut");
    }

    ShowLoadingMessage();

    req1 = $.ajax({
        type: "POST",
        dataType: 'json',
        url: rootUrl + "WebServices/GisServices.asmx/GetFeatureExtend_Simple",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ InfoObject: RequestObject }),
        success: function (data) {

            /* reset reqObj*/
            RequestObject.ReturnGeometry = "true";
            RequestObject.CountOnly = "false";

            if (data.d == "") {
                alert("No results", "The query did not return any results", "");
                return;
            }
            arrSearchResuls = JSON.parse(data.d);
            eval(callback_funtion + "()");
            callback_function = "alert";
        }
    });
    req1.done(function () {
        $("#divMapLoader").html("");
    })

}



/*  Generic Add Feature  */
function AddFeature() {
    ShowLoadingMessage();

    req1 = $.ajax({
        type: "POST",
        dataType: 'json',
        url: rootUrl + "WebServices/GisServices.asmx/AddFeature_Simple",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ InfoObject: RequestObject }),
        success: function (data) {
            arrAddResuls = JSON.parse(data.d);
            eval(callback_funtion + "()");
            callback_function = "alert";
        }
    });
    req1.done(function () {
        $("#divMapLoader").html("");
    })

}

/**   THe function that autro zooms if specified by onload   **/
function ZoomToFeature_auto() {
    if (arrSearchResuls.error != undefined) {
        alert("An error occured", "An initial map position was specified, but unable to zoom to the point", "");
    }
    else {
        if (arrSearchResuls.features.length == 0) {
            popUpT("<pre>The auto find did not return results</pre>", "No results found");
        }
        else {
            if (GetConfigProp("Viewer>apptype") == "arcgisonline") {
                FilterOption[99].ZoomToResult(0);
            }
            else {
                ZoomToFeature(0);
                DrawMapWithIdentify();
            }
        }
    }
}


var geoLastDrawnObject;

/** Gets called from silverlight when map finished loading   **/
function MapDrawComplete() {
    EnableDrawMode("false");
    if (GetConfigProp("Viewer>apptype") != "arcgisonline")
        geoLastDrawnObject = JSON.parse(slCtl.Content.MyMap.ExecuteMethod("geoLastDrawnObject.ToJson()", "", ""));
    else
        geoLastDrawnObject = FilterOption[99].GetLastDrawnGeo();
    eval(DrawCallback + "()");
}


/* Generic zoom to feature */
function ZoomToFeature(FeatureNr) {
    var v;

    if (arrSearchResuls.features[FeatureNr].geometry.rings != undefined) {
        v = getMinMax(arrSearchResuls.features[FeatureNr].geometry.rings[0]);
    }
    else if (arrSearchResuls.features[FeatureNr].geometry.x != undefined) {
        v = [arrSearchResuls.features[FeatureNr].geometry.x, arrSearchResuls.features[FeatureNr].geometry.y, arrSearchResuls.features[FeatureNr].geometry.x, arrSearchResuls.features[FeatureNr].geometry.y];
    }


    MyMapZoomTo(v);

}



/**---------------Utils---------------------*/
function EnableDrawMode(type) {
    if (GetConfigProp("Viewer>apptype") == "arcgisonline")
        if (type == "false")
            FilterOption[99].DisableToolbar();
        else
            FilterOption[99].GetToolbar(type.toLowerCase());
    else {
        slCtl.Content.MyMap.ExecuteMethod("CanDraw.DrawMode", type, "Enum");
        slCtl.Content.MyMap.ExecuteMethod("CanDraw.IsEnabled", "true", "");
    }
}

function MyMapZoomTo(v) {
    if (GetConfigProp("Viewer>apptype") == "arcgisonline") {
        FilterOption["Map"].map.setExtent(v[0], v[1], v[2], v[3]);
    }
    else {
        slCtl.Content.MyMap.ZoomTo(v[0], v[1], v[2], v[3]);
    }
}

function GetCurrentSpatialReference() {
    if (GetConfigProp("Viewer>apptype") == "arcgisonline") {
        if (GetConfigProp("AutoSearch>SpatialRefIn") != "") {
            return GetConfigProp("AutoSearch>SpatialRefIn");
        }
        if (FilterOption["Map"] == undefined)
            return "";
        if (FilterOption["Map"].map == undefined)
            return "";

        if (FilterOption["Map"].map.spatialReference != undefined)
            return FilterOption["Map"].map.spatialReference.wkid;

    }
    else {
        return slCtl.Content.MyMap.GetSpatialReference();
    }

}
/** Builld geomtry from results ***/
function Result2GeometryObject() {
    var DrawString = "";
    for (var x = 0; x < arrSearchResuls.features.length; x++) {
        DrawString += "[";
        for (var xRingObj = 0; xRingObj < arrSearchResuls.features[x].geometry.rings[0].length; xRingObj++) {

            DrawString += "[" + arrSearchResuls.features[x].geometry.rings[0][xRingObj] + "],";
        }
        DrawString = DrawString.substr(0, DrawString.length - 1)
        DrawString += "],";
    }
    DrawString = DrawString.substr(0, DrawString.length - 1);
    return DrawString;
}



function Draw2GeometryObject() {
    var DrawString = "";
    DrawString += "[";
    /* There should always be just one ring */
    for (var xRingObj = 0; xRingObj < geoLastDrawnObject.rings[0].length; xRingObj++) {

        DrawString += "[" + geoLastDrawnObject.rings[0][xRingObj] + "],";
    }
    DrawString = DrawString.substr(0, DrawString.length - 1)
    DrawString += "],";
    DrawString = DrawString.substr(0, DrawString.length - 1);
    return DrawString;
}




function ShowLoadingMessage() {
    $("#divMapLoader").html("<div style='maring:20px;'><img src='" + rootUrl + "images/LoadingScreenNew.gif'/></div>");
}




function GetConfigProp(prp) {
    if (MapProcessName == "" || $(StartUpConfigXml).find("root>ViewerData>" + MapProcessName + ">" + prp).length == 0)
        return $(StartUpConfigXml).find("root>ViewerData>StandardMapRoot>" + prp).text();
    else
        return $(StartUpConfigXml).find("root>ViewerData>" + MapProcessName + ">" + prp).text();
}

function GetConfigPropXml(prp) {
    if (MapProcessName == "" || $(StartUpConfigXml).find("root>ViewerData>" + MapProcessName + ">" + prp).length == 0)
        return $(StartUpConfigXml).find("root>ViewerData>StandardMapRoot>" + prp);
    else
        return $(StartUpConfigXml).find("root>ViewerData>" + MapProcessName + ">" + prp);
}


function GetDynoConfigProp(prp) {
    return $(StartUpConfigXml).find("root>" + prp).text();
}

function FetchMapData(val) {
    PerformCallP(rootUrl + "Themes/MapControl/Full/SideMenu.aspx?MapID=" + val, "", "divMapSideMenu");
}


function getMinMax(r) {
    var xmin = r[0][0], xmax = r[0][0], ymin = r[0][1], ymax = r[0][1];
    for (var iC = 0; iC < r.length; iC++) {

        if (r[iC][0] < xmin)
            xmin = r[iC][0];
        if (r[iC][0] > xmax)
            xmax = r[iC][0];


        if (r[iC][1] < ymin)
            ymin = r[iC][1];
        if (r[iC][1] > ymax)
            ymax = r[iC][1];
    }

    return [xmin, ymin, xmax, ymax];
}





var ArcGis_Commands =
{
    DrawMode: function (type) {
        FilterOption["HtmlJSMapBuilder"].DrawMode("point");
    }
}



var GIS_V2C = "";
function CheckAllVersions(toolName)
{
    ShowGritter("Fetching Versions", "Please wait while the list of versions are being collected");
    CallGeoProcess(toolName);
    GIS_V2C = toolName;
}

var retStatus;

var GeoProcessingItems = new Array();
var GeoProcessingQueueRunning = false;
// Call a geoprocessing task...
function CallGeoProcess(toolName) {
    toolUrl = GetDynoConfigProp("StaticData>Url[name='" + GetConfigProp("Tools>" + toolName + ">UrlName") + "']") + GetConfigProp("Tools>" + toolName + ">UrlExt")
    if (toolUrl == "")
        return;
    // Fire off the job

    var attr2Pass = new Object();

    GeoProcessingItems.push( { "ToolName": toolName, "Status": "Started", "JobID": "NA", "TaskUrl": toolUrl });

    for (var c = 0; c < GetConfigPropXml("Tools>" + toolName + ">Properties>Attr[type='string']").length; c++)
    {
        eval("attr2Pass." + $(GetConfigPropXml("Tools>" + toolName + ">Properties>Attr[type='string']")[0]).attr("inputName") + " = '" + $(GetConfigPropXml("Tools>" + toolName + ">Properties>Attr[type='string']")[0]).text() + "';");
    }
    for (var c = 0; c < GetConfigPropXml("Tools>" + toolName + ">Properties>Attr[type='javascript']").length; c++) {
        eval("attr2Pass." + $(GetConfigPropXml("Tools>" + toolName + ">Properties>Attr[type='javascript']")[0]).attr("inputName") + " = " + $(GetConfigPropXml("Tools>" + toolName + ">Properties>Attr[type='javascript']")[0]).text() + ";");
    }

    retStatus = CallGeoProcessFunction(toolUrl + "/submitJob", attr2Pass);
    retStatus = JSON.parse(retStatus);
    GeoProcessingItems[GeoProcessingItems.length-1].JobID = retStatus.jobId;

    if (retStatus.jobStatus != "esriJobSubmitted") {
        ShowGritter("Failed to execute geoprocessing tool", "<b>Geoprocessing task failed.</b><br/>Please re-run your tool, or call your administrator for assistance");
        return;
    }

    // Only start the que if not running
    if (!GeoProcessingQueueRunning) {
        GeoProcessingQueueRunning = true;
        setTimeout(CheckGeoprocessStatus, 1200);
    }
}

// Constanly check the status...
function CheckGeoprocessStatus() {
    var bDone = false;
    var indx = -1;
    // find one that is not done

    for (var x = 0; x < GeoProcessingItems.length; x++) {
        if (GeoProcessingItems[x].Status == "Started") {
            indx = x;
            break;
        }
    }

    if (indx == -1)
        return;

    retStatus = JSON.parse(CallGeoProcessFunction(GeoProcessingItems[indx].TaskUrl + "/jobs/" + GeoProcessingItems[indx].JobID));
    

    if (retStatus.jobStatus == "esriJobSucceeded" || retStatus.jobStatus == "esriJobFailed") {
        if (retStatus.jobStatus == "esriJobSucceeded") {
            ShowGritter("Task complete", "The geoprocessing task has finished.");
        }
        else if (retStatus.jobStatus == "esriJobFailed") {
            ShowGritter("Task failed", "The geoprocessing task failed.");
        }
        GeoProcessingItems[indx].Status = "Done";

        // Execute the oncomplete
        console.log("Executing " + GetDynoConfigProp("Tools>" + GeoProcessingItems[indx].ToolName + ">OnComplete"))
        eval(GetConfigProp("Tools>" + GeoProcessingItems[indx].ToolName + ">OnComplete"));
        
        if (indx < (GeoProcessingItems.length - 1)) {
        }
        else {
            bDone = true;
        }
    }

    if (!bDone)
        setTimeout(CheckGeoprocessStatus, 1200);
    else {
        GeoProcessingQueueRunning = false;
    }
}
var r;
/// Create a popup that will show the results of the last processing task
function GIS_ShowAllVersions() {

    var toolUrl = GetDynoConfigProp("StaticData>Url[name='" + GetConfigProp("Tools>" + GIS_V2C + ">UrlName") + "']") + GetConfigProp("Tools>" + GIS_V2C + ">UrlExt")
    $.ajax({
        method: "POST",
        url: toolUrl + "/jobs/" + retStatus.jobId + "/" + retStatus.results.Versions.paramUrl + "?f=json",
        async: false
    })
  .done(function (msg) {
      r = JSON.parse(msg);
      
      retResult = msg;

      // Show features

      var tVList = $("<div>");
      for (iC = 0; iC < r.value.features.length; iC++) {
          tVList.append(
              $("<li>")
                    .html(r.value.features[iC].attributes.name)
                    .attr("itemrow", iC)
                    .css("padding", "2px")
                    .css("cursor", "pointer")
                    .on({
                        click: function () {
                            SetMapLayerVersion("", r.value.features[$(this).attr("itemrow")].attributes.name);
                            $("[lbl='info']").html("Version switched to " + r.value.features[$(this).attr("itemrow")].attributes.name);
                        }
                    })
           );
      }
      tVList.append(
              $("<p>")
                .css("margin", "5px")
                .attr("lbl", "info")
                )
      popUpT( "<div id='divP'></div>","Avaliable Versions");
      $("#divP").append(tVList);
       
      GIS_V2C = "";
  });
    
    
}



function CallGeoProcessFunction(url, attr) {

    var retResult = "no result";
    if (attr == undefined)
        attr = new Object();
    attr.f = "json";
    $.ajax({
        method: "POST",
        url: url,
        async: false,
        data: attr
    })
  .done(function (msg) {
      retResult = msg;
      return msg;
  });
    return retResult;
}



function SetMapLayerVersion(ConfigSetting, Version) {
    var szLayers = GetConfigProp("Tools>VersionSwitch>Layers").split(',');
    for (var layerN in szLayers) {
        try {
            FilterOption[98].map._layers[szLayers[layerN]].setGDBVersion(Version);
        } catch (x) {
            try {
                console.log("Could not set version for " + szLayers[layerN] + " (" + FilterOption[98].map._layers[szLayers[layerN]]._titleForLegend + ")");
            }
            catch (x2) {
                console.log("Failed to get layer info for " + szLayers[layerN]);
            }
        }
    }
}



function GISAdmin_GetAllLayersInfo() {
    popUpT("<div id='layerInfo'></div>", "Layers");

    var contrl = $("<table>");
    for (var key in FilterOption[98].map._layers) {
        if (FilterOption[98].map._layers.hasOwnProperty(key)) {
            contrl.append($("<tr><td>" + FilterOption[98].map._layers[key]._titleForLegend + "</td><td>" + key + "</td></tr>"));
        }
    }

    $("#layerInfo").append(contrl);
    /*
    $("#layerInfo").append(
        $("<input>")
        ).append(
        $("<button>")
            .text("Change version")
            .on({
                click: function () {

                }
            })
        );
     */
}