var SQLite;
var sqlite;
var SQLOfflineData;
var db;
var bSQLFuncOffline = true;
var SyncEnabled = true;


var SQLPostCount = 0;
var SQLPostMax = 0;

var bFirstPass=  false;

function InitSqlLite() {

    // OBJ: 
    // Fetch content - Store in SQLLite - Incase testing, dont fetch actual data, sample data

    if (SQLOfflineData == undefined) {
        SQLOfflineData = new Array();
    }


    $("#main").html("<b sync_header='prep'>Preparing offline data... Please wait...</b>");


    //   console.log(FormSet.applications[global_applicationid]);

    // Always try an open a connection to SQL

    //db = window.sqlitePlugin.openDatabase({ name: 'GiscoeOfflineDB.db', location: 'default' }, function () { });
            $('[container="footer"]').html("Success");    

//            console.log("Fetching..." + global_applicationid);
 
    if(global_applicationid==-1){
        for(var iT =FormSet.applications.length; iT< FormSet.applications.length; iT++){
         global_applicationid= iT;
        if(FormSet.applications[global_applicationid].preloaded_datasources.length == 0){
                $("#main").html("<b sync_header='prep'>Please use the menu on the left to view available applications</b>");
        }
        else{
           // console.log(FormSet);
            for (var xDBC = 0; xDBC < FormSet.applications[global_applicationid].preloaded_datasources.length; xDBC++)
            {
              //  console.log("Fetching " + FormSet.applications[global_applicationid].preloaded_datasources[xDBC]);
                FetchTableData(FormSet.applications[global_applicationid].preloaded_datasources[xDBC]);
            }
        }
    }
    }
    else
    {
        {
        
        if(FormSet.applications[global_applicationid].preloaded_datasources.length == 0){
                $("#main").html("<b sync_header='prep'>Please use the menu on the left to view available applications</b>");
        }
        else{
           // console.log(FormSet);
            for (var xDBC = 0; xDBC < FormSet.applications[global_applicationid].preloaded_datasources.length; xDBC++)
            {
              //  console.log("Fetching " + FormSet.applications[global_applicationid].preloaded_datasources[xDBC]);
                FetchTableData(FormSet.applications[global_applicationid].preloaded_datasources[xDBC]);
            }
        }
    }
    }
    
    setTimeout(function() {
                $('[container="loadingScreen"]').hide('fast');
        }, 1200 )
    //});

    
            $("#menuScreen").show();
    // This is mostly for testing as extensions does not work in preview mode
    // Build Some Sample Data
}



function SearchRecord(DataObject, Columns, Value)
{
    //console.log("Searching");
    //console.log(DataObject);
    //console.log("Field " + Columns + " for " + Value);
    var RetObject = new Array();
    for (var xRow = 0; xRow < DataObject.rows.length; xRow++) {
       
        if (eval("DataObject.rows[" + xRow + "]." + Columns) == Value) {
            RetObject.push(DataObject.rows[xRow]);
        }
    }
    return RetObject;
}
  
function FetchDataFromServer(PassObject,TableInfo)
{  
    
    // This function will either go online and sync the data, or try to fetch the data localy    
    // if online, fetch local, else fetch from server
    
    if(!SyncEnabled)
        {
            $('[container="footer"]').html("Working offline ");
              db.transaction(function(tx) {
                tx.executeSql('SELECT * FROM ' +TableInfo.Table , [], function(tx, rs) {   
                    SQLOfflineData[TableInfo.Table] = new Object();
                    SQLOfflineData[TableInfo.Table].rows = rs.rows;
                }, function(tx, error) {
                  console.log('SELECT error: ' + error.message);
                });
              });
        }
    else { 
        SQLPostCount++;
        SQLPostMax++;
        UpdateSyncLogStatus(false);
        $("#main").append($("<p>").attr("synctable",TableInfo.Table + "").html("<i class='fa fa-refresh' ></i> Fetching " + TableInfo.Table + " data... Please wait..."));
        $.ajax(  
		{   
                type: "POST",
                dataType: 'json', 
                contentType: "application/json; charset=utf-8",
                url : serverUrl + "WebServices/Offline/SyncService.asmx/FetchSQL",
                data : JSON.stringify( { Input: PassObject, TableInfo:TableInfo }  ),
                success: function (data) {
                    
                    ApplicationInformation.LastConnectedDate = Date();
                var results = JSON.parse( data.d);                
                SQLOfflineData[TableInfo.Table] = new Object(); 
                // Plugins is not supported in dev mode, then only load samples - Later dif?
                if (bSQLFuncOffline) {
                    // Simulate the "Query function
                    SQLOfflineData[TableInfo.Table].rows = new Array();
                    SQLOfflineData[TableInfo.Table].rows.item = function (row) { /* console.log($(this)[row]) */ return $(this)[row]; };
                    // populate data
                    for (var xR = 0; xR < results.rows.length; xR++) {
                        SQLOfflineData[TableInfo.Table].rows[xR] = new Object();
                        for (var xCC = 0; xCC < TableInfo.Columns.length; xCC++) {
                            eval('SQLOfflineData[TableInfo.Table].rows[xR].' + TableInfo.Columns[xCC][0] + ' = "' + (results.rows[xR][xCC]) + '";');
                        }
                    } 
                    localStorage.setItem("TABLE_" + TableInfo.Table,JSON.stringify( SQLOfflineData[TableInfo.Table]));
                }
                else { 
                    // 1) Create tables in SQL lite if not exist 

                    var ColumnList = "";
                    for (var xCC = 0; xCC < TableInfo.Columns.length; xCC++) {
                        if (ColumnList != "") { ColumnList += ","; ColumnList2 += ","; ColumnList3 += ","; }
                        ColumnList += TableInfo.Columns[ColumnList][0] + " TEXT";
                        ColumnList2 += TableInfo.Columns[ColumnList][0] + "";
                        ColumnList3 += "?"; 
                    }
                    db.transaction(function (tx) {
                        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + TableInfo.Table + ' (' + ColumnList + ')');
                        tx.executeSql('TRUNCATE TABLE ' + TableInfo.Table + '');
                        // 2) Fetch Data from server

                        for (var xR = 0; xR < results.rows.length; xR++) {
                            tx.executeSql(
                             ['INSERT INTO ' + TableInfo.Table + ' (' + ColumnList2 + ') VALUES (' + ColumnList3 + ')', results.rows[xR]]
                        );
                        }
                    }); 

                    // Is this Async?

                }
               /*  $("[synctable='" + TableInfo.Table + "']").html("" +  "Data retrieved...");  
                 $("[synctable='" + TableInfo.Table + "']").attr("class", "alert alert-success");*/
 $("[synctable='" + TableInfo.Table + "']").html("");  
                    
                 UpdateSyncLogStatus();
                $("[sync_header='prep']").html(""); 
            }
		}).fail(function () {
		    $('[container="footer"]').html("Offline");
		    if (SQLOfflineData[TableInfo.Table] == undefined &&  localStorage.getItem("TABLE_" + TableInfo.Table) == undefined) {
		        $("[synctable='" + TableInfo.Table + "']").attr("class", "alert alert-danger");
		        $("[synctable='" + TableInfo.Table + "']").html("Error occured while preparing data for " + TableInfo.Table);
		    }
		    else {
                SQLOfflineData[TableInfo.Table] = JSON.parse(localStorage.getItem("TABLE_" + TableInfo.Table));
		        $("[synctable='" + TableInfo.Table + "']").attr("class", "alert alert-warning");
		        $("[synctable='" + TableInfo.Table + "']").html("Offline data loaded for " + TableInfo.Table);
		    }
                $("[sync_header='prep']").html("Offline mode");
               UpdateSyncLogStatus();
		}).done(function () {
		});
    }
}
 


function UpdateSyncLogStatus(inc) {
    if (inc==false) { }
    else
     SQLPostCount--;
    if (SQLPostCount == 0) {
        SQLPostMax = 0;
        $("[lbl='AJAXCalls']").html("");
        $("[sync_header='prep']").html ("Offline data is ready.");
    }
    else {
        $("[lbl='AJAXCalls']").html("Fetching data... " + ((((SQLPostMax-SQLPostCount)/SQLPostMax)*100).toFixed(0)) + "%");
    }
    
    if(bFirstPass == false)
        if( isNaN( ((((SQLPostMax-SQLPostCount)/SQLPostMax)*100).toFixed(0)) ))
            {
            bFirstPass = true;
                $("[txt='FrontMessage']").html("<i class='fa fa-check'></i> Please select a form");
            }
}
  
/// This function will fetch Data and populate it into an offline DB
function FetchTableData(TableInfo, Filter)  
{  
        var fetchObject = new Object();
        fetchObject.Table = TableInfo.Table;
        fetchObject.Table = TableInfo.Schema;
        fetchObject.Filter = (Filter==undefined? "" : Filter);
        fetchObject.Columns = new Array();
        /*for (var xCC = 0; xCC < TableInfo.Columns.length; xCC++) {            
        } */
        FetchDataFromServer(fetchObject,TableInfo);  
  
}

function CreateTable(TableInfo) {   
    for (var xC = 0; xC < TableInfo.Columns.length; xC++) {
    }
}