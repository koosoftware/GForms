

function LoadView(page, control) {
    console.log("!");
    windowResizeW();
    $("[lbl='Loader']").html("<i class='fa fa-refresh'/><i>Loading.... Please wait....</i>'");


    setTimeout(function () {

        FetchTableData(FormSet.applications[global_applicationid].views[page].TableSources[0].TableSources[0]);
        setTimeout(LoadView2, 200, page, control);

    }, 200);
}


function LoadView2(page, control) {
    // Also get the table data
    var container;
    if (control == undefined) {
        $("[container='mainPanel']").html("Loading...");
    }

    $('[container="footer"]').html("Loading Control");


    // Reset All the panel - Just makes the app having less HTML present
    // Also, if there is an error, the app will just say "Loading...".... 
    // #TODO: Add fail safe code... sometime...

    var c = $("<div>").css("background-color","white").css("padding","10px");   
    $(c).append(
                $("<div>")
                    .attr("class", "row")
                    .append(
                    $("<div>")
                        .attr("class", "col-sm-12")
                        .attr("container", "formrowid")
                        .attr("parentpage", page)
                        .attr("uniqeValue", new Date().getTime())
                        .append(
                            $("<div>")
                                .attr("loadingBox", FormSet.applications[global_applicationid].views[page].ViewID)
                        )
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
                             .html("<h2 style='margin-top:0px'>" + FormSet.applications[global_applicationid].views[page].ViewName + "</h2>")
                         )
                 );

     
    
    if(SQLOfflineData[ FormSet.applications[global_applicationid].views[page].PrimaryTable ] == undefined){
        alert("Data has not been pre-loaded");
        $("#VIEW_" + FormSet.applications[global_applicationid].views[page].ViewID).html("Please contact your administrator.");
        $('[container="footer"]').html("View Loaded");
        return;
    }
    var table= $("<table>").attr("class", "table table-striped");
    var head = $("<tr>");
    var xrow_c =0;
    // Loop all the data rows
    for(var xrow = 0; xrow < SQLOfflineData[ FormSet.applications[global_applicationid].views[page].PrimaryTable ].rows.length; xrow++)
    {   
        
        // First Check the Filters
        var Filter = FormSet.applications[global_applicationid].views[page].Filters;
        // By default continue
        var bMatched = true;
        for(var xFilterHead = 0; xFilterHead < Filter.length; xFilterHead++)
        {
            var some_matched =-1;
            // All these must match
            for(var xFilterField = 0; xFilterField < Filter[xFilterHead].FilterFields.length; xFilterField++)
            {
                // Some of these must much
                var field = Filter[xFilterHead].FilterFields[xFilterField].FilterField;
                var value2c = SQLOfflineData[ FormSet.applications[global_applicationid].views[page].PrimaryTable ].rows[xrow][field];

                for(var xFilterFieldValue = 0; xFilterFieldValue < Filter[xFilterHead].FilterFields[xFilterField].FixedValues.length; xFilterFieldValue++)
                {
                    if(some_matched==-1) 
                        some_matched=0;
                    
                    
                    var val2test = Filter[xFilterHead].FilterFields[xFilterField].FixedValues[xFilterFieldValue].Value;
                    
                    if(val2test[0] == "$"){
                        val2test = eval( val2test.replace("$",""));
                    }
                    
                    
                        console.log("Filtering2 " + value2c + "/" + val2test);
                    
                    if(val2test == value2c)
                        some_matched++;
                }
                
                for(var xFilterFieldValue = 0; xFilterFieldValue < Filter[xFilterHead].FilterFields[xFilterField].UserAttrValues.length; xFilterFieldValue++)
                {
                    for(var xUA = 0; xUA < FormSet.userInfo.Attributes.length; xUA++)
                        {
                            if(FormSet.userInfo.Attributes[xUA].AttributeName == Filter[xFilterHead].FilterFields[xFilterField].UserAttrValues[xFilterFieldValue].UserAttributeName)
                                {
                                    console.log(FormSet.userInfo.Attributes[xUA].AttrubuteValue );
                                    console.log(value2c );
                                    if(some_matched==-1)
                                        some_matched=0;
                                    if(FormSet.userInfo.Attributes[xUA].AttributeValue == value2c)
                                        some_matched++;
                                }
                        }
                }
                
            }
            if(some_matched == 0)
                bMatched = false;
        }
        
        if(!bMatched)
            continue;
        
        
        var row = $("<tr>")
        .attr("recordrow",xrow )
        .on({ 
        click:function() {
            
			
			if(FormSet.applications[global_applicationid].views[page].ShowForm==0)
			{
				
				return;
			}
            
            var form2ID = FormSet.applications[global_applicationid].views[page].ShowForm; 
            var formIndex = -1;    
            
            console.log("looking for form " + form2ID);
            for(var formsC =0; formsC < FormSet.applications[global_applicationid].forms.length; formsC ++ )
            {  
                if(FormSet.applications[global_applicationid].forms[formsC].FormSysID == form2ID )
                    {
                        formIndex = formsC;						
                        break;
                    }
            }
            
			if(formIndex==-1){
				alert("Form to open was not found");
				console.log("No Form with id "+  form2ID);
			}
            
            
            var FormField = "PK_ID";
            var ViewField = "PK_ID";
            
            // Find the ID Field
            formData = SQLOfflineData[ FormSet.applications[global_applicationid].views[page].PrimaryTable ].rows;
            viewRow = SQLOfflineData[ FormSet.applications[global_applicationid].views[page].PrimaryTable ].rows[$(this).attr("recordrow")];
            
            viewValue2Check = viewRow[ViewField];
            FormRowId = 0;
             
            /*for(FormRowId=0; FormRowId< formData.length; FormRowId++)
            {
                if(formData[FormRowId][FormField] == viewValue2Check)
                {
                    break;
                }
                
            }*/
			
            
			$(".panel").hide();
			$("#FORM_" + FormSet.applications[global_applicationid].forms[formIndex].FormID).show();
			
		   LoadController(formIndex, undefined, $(this).attr("recordrow"));
            
            
            
            $(this).fadeIn('slow').fadeOut('slow').fadeIn('slow');
            
}});
        
        // Now built every column
        for (var xFields = 0; xFields < FormSet.applications[global_applicationid].views[page].Fields.length; xFields++) {
            row.append(
                    $("<td>").html( 
                        SQLOfflineData[ FormSet.applications[global_applicationid].views[page].PrimaryTable ].rows[xrow][FormSet.applications[global_applicationid].views[page].Fields[xFields].DataField]
                                  ));
            if(xrow_c == 0){
                head.append($("<th>").html(FormSet.applications[global_applicationid].views[page].Fields[xFields].Label));
            }
            
             
        } 
        
        if(xrow_c ==0)  
            {    
                table.append(head);   
            } 
                table.append(row); 
         xrow_c++; 
    }
      
        
        $(c).append( 
            $("<div>").attr("class", "row")
                .css("overflow","overlay").append(
                $("<div>").attr("class","col-sm-12").append(table) )); 
    
        $(c).append($("<br/>"));

 
    if (control == undefined) {
        $("#VIEW_" + FormSet.applications[global_applicationid].views[page].ViewID).html("");
        $("#VIEW_" + FormSet.applications[global_applicationid].views[page].ViewID).append(c);
    }
    else{
        $(control).html("");
        $(control).append(c);
    }

    $("[lbl='Loader']").html("<i class='fa fa-check'></i> Form ready");
    $('[container="footer"]').html("View Loaded");
  //  $('[container="formrowid"][parentpage="' + page + '"]').attr("jsonS", JSON.stringify(child_item));
}
