

    function LoadPivotForm(page, control) {
        console.log("!");
        windowResizeW();
        $("[lbl='Loader']").html("<i class='fa fa-refresh'/><i>Loading.... Please wait....</i>'");


        setTimeout(function () {

            FetchTableData(FormSet.applications[global_applicationid].pivots[page].TableSources[0].TableSources[0]);
            setTimeout(LoadPivotForm2, 200, page, control);

        }, 200);
    }


    function LoadPivotForm2(page, control) {
        console.log("!");

        // Also get the table data
        var container;
        if (control == undefined) {
            $("[container='mainPanel']").html("Loading...");
        }

        $('[container="footer"]').html("Loading Control");


        // Reset All the panel - Just makes the app having less HTML present
        // Also, if there is an error, the app will just say "Loading...".... 
        // #TODO: Add fail safe code... sometime...
        var c = $("<div>");
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
                                    .attr("loadingBox", FormSet.applications[global_applicationid].pivots[page].ViewID)
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
                                 .html("<h2 style='margin-top:0px'>" + FormSet.applications[global_applicationid].pivots[page].FormName + "</h2>")
                             )
                     );



        if (SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable] == undefined) {
            alert("Data has not been pre-loaded");
            $("#VIEW_" + FormSet.applications[global_applicationid].pivots[page].ViewID).html("Please contact your administrator.");
            $('[container="footer"]').html("View Loaded");
            return;
        }

        var xRow = new Array();
        var iCountX = 0;
        var iCountY = 0;

        for (var xrow = 0; xrow < SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows.length; xrow++) {
            var x = SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows[xrow][FormSet.applications[global_applicationid].pivots[page].XRowField.DataField];
            if (xRow[x] == undefined)
            {
                iCountX++;
                xRow[x] = iCountX;
            }
        }

        var yRow = new Array();
        for (var xrow = 0; xrow < SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows.length; xrow++) {
            var x = SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows[xrow][FormSet.applications[global_applicationid].pivots[page].YRowField.DataField];
            if (yRow[x] == undefined){
                iCountY++;
                yRow[x] = iCountY;
            }
        }

        iCountY++;
        iCountX++;

        var xHtml = $("<table>").attr("class", "table table-striped");
        for (var y = 0; y < iCountY; y++) {
            var tRow = $("<tr>");

            for (var x = 0; x < iCountX; x++) {
                var tColumn = $("<td>").attr("xLoc", x).attr("yLoc", y).html("");

                tRow.append(tColumn);
            }
            xHtml.append(tRow);
        }
        for (var x = 1; x < iCountX; x++) {
             $(xHtml).find("[xLoc='" + x + "'][yLoc='0']").html(Object.keys(xRow)[x-1]);
        }
        for (var y = 1; y < iCountY; y++) {
             $(xHtml).find("[yLoc='" + y + "'][xLoc='0']").html(Object.keys(yRow)[y-1]);
        }

        var table = $("<table>").attr("class", "table table-striped");
        var head = $("<tr>");
        var xrow_c = 0;
        // Loop all the data rows
        for (var xrow = 0; xrow < SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows.length; xrow++) {
            
            var idx = SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows[xrow][FormSet.applications[global_applicationid].pivots[page].IDField.DataField];
            var xx = SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows[xrow][FormSet.applications[global_applicationid].pivots[page].XRowField.DataField];
            var yx = SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows[xrow][FormSet.applications[global_applicationid].pivots[page].YRowField.DataField];
            
            // First Check the Filters
            var Filter = FormSet.applications[global_applicationid].pivots[page].Filters;
            // By default continue
            var bMatched = true;
            for (var xFilterHead = 0; xFilterHead < Filter.length; xFilterHead++) {
                var some_matched = -1;
                // All these must match
                for (var xFilterField = 0; xFilterField < Filter[xFilterHead].FilterFields.length; xFilterField++) {
                    // Some of these must much
                    var field = Filter[xFilterHead].FilterFields[xFilterField].FilterField;
                    var value2c = SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows[xrow][field];

                    for (var xFilterFieldValue = 0; xFilterFieldValue < Filter[xFilterHead].FilterFields[xFilterField].FixedValues.length; xFilterFieldValue++) {
                        if (some_matched == -1)
                            some_matched = 0;
                        if (Filter[xFilterHead].FilterFields[xFilterField].FixedValues[xFilterFieldValue].Value == value2c)
                            some_matched++;
                    }

                    for (var xFilterFieldValue = 0; xFilterFieldValue < Filter[xFilterHead].FilterFields[xFilterField].UserAttrValues.length; xFilterFieldValue++) {
                        for (var xUA = 0; xUA < FormSet.userInfo.Attributes.length; xUA++) {
                            if (FormSet.userInfo.Attributes[xUA].AttributeName == Filter[xFilterHead].FilterFields[xFilterField].UserAttrValues[xFilterFieldValue].UserAttributeName) {
                                console.log(FormSet.userInfo.Attributes[xUA].AttrubuteValue);
                                console.log(value2c);
                                if (some_matched == -1)
                                    some_matched = 0;
                                if (FormSet.userInfo.Attributes[xUA].AttributeValue == value2c)
                                    some_matched++;
                            }
                        }
                    }

                }
                if (some_matched == 0)
                    bMatched = false;
            }

            if (!bMatched)
                continue;


            var row = $("<tr>")
            .attr("recordrow", xrow)
            .on({
                click: function () {
                    $(this).fadeIn('slow').fadeOut('slow').fadeIn('slow');

                }
            });

            // Now built every column
            for (var xFields = 0; xFields < FormSet.applications[global_applicationid].pivots[page].Fields.length; xFields++) {
                row.append(
                        $("<td>").html(
                            SQLOfflineData[FormSet.applications[global_applicationid].pivots[page].PrimaryTable].rows[xrow][FormSet.applications[global_applicationid].pivots[page].Fields[xFields].DataField]
                                      ));
                if (xrow_c == 0) {
                    head.append($("<th>").html(FormSet.applications[global_applicationid].pivots[page].Fields[xFields].Label));
                }


            }

            if (xrow_c == 0) {
                
            }
            $(xHtml).find("[xLoc='" +  xRow[xx] + "']"+ "[yLoc='" +  yRow[yx] + "']").append( $("<table>").attr("class",'table').css("background-color","transparent").append(row) );
            //table.append(row);
            xrow_c++;
        }


        $(c).append(
            $("<div>").attr("class", "row")
                .css("overflow", "overlay").append(
                $("<div>").attr("class", "col-sm-12")).append(table));

        $(c).append($("<br/>"));
        $(c).append(xHtml);

        $(c).append($("<br/>"));

        if (control == undefined) {
            $("#PVT_" + FormSet.applications[global_applicationid].pivots[page].ViewID).html("");
            $("#PVT_" + FormSet.applications[global_applicationid].pivots[page].ViewID).append(c);
        }
        else {
            $(control).html("");
            $(control).append(c);
        }

        $("[lbl='Loader']").html("<i class='fa fa-check'></i> Form ready");
        $('[container="footer"]').html("Form Loaded");
        //  $('[container="formrowid"][parentpage="' + page + '"]').attr("jsonS", JSON.stringify(child_item));
    }
