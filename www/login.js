/*
PROCESS:
	1: Login to GISCOE server
	2: Code to login to alternative server
	
	1: User opens app, login to server (hardcoded @ builder.giscoe.com) 
		- Nothing uniqe about this, standard login effect
	
	2: User Enters a code
		- Code is sent back to hardcoded url ( builder.giscoe.com )
		- Server finds the code and return with the url to client server
		- App contacts the client server and confirms registration and authorization
		- App contacts GISCOE server again to confirm and finalize
		- Device never contacts GISCOE server again, and only point to client server (unless client logs out or uninstall app)
		- Client Logs into the new URL
		- Once client is logged in, the user is locked on the server, and no other app can use this user.
			- This must be checked on the Sync Operation
			- The server will record the login user name and the device ID used
		- User will have the oppertunity to log out, allowing the user to be avaliable for another device
*/

function InitLoginScreen() {
  $('[lbl="welcome"]').on({
    click: function () {
      $('[lbl="welcome"]').append(
        $("<lable>").html("<br/>Server is: " + serverUrl + "")
      );
    },
  });
  $('[action="ParseCode"]').on({ click: LOGIN_ParseCode });
  $('[action="ParseCodeReset"]').on({
    click: function () {
      serverUrl = defaultServerUrl;
      $("[act='ShowHideCode']").trigger("click");
    },
  });
  $("[act='ShowHideCode']").on({
    click: function () {
      if ($("[container='initCode']").attr("closed") == "true") {
        $("[act='ShowHideCode']").html(
          "<a class='btn red' href='#back'>Back to standard login <i class='fa fa-lock'></i></a>"
        );
        $("[container='login2server']").hide("fast", function () {
          $("[container='initCode']").show("fast");
        });
        $("[container='initCode']").attr("closed", "false");
      } else {
        $("[act='ShowHideCode']").html(
          "<a href='#back' class='btn red'>I have a code <i class='fa fa-lock'></i></a>"
        );
        $("[container='initCode']").hide("fast", function () {
          $("[container='login2server']").show("fast");
        });
        $("[container='initCode']").attr("closed", "true");
      }
    },
  });

  $("[btn='SubmitLogin']").on({
    click: function () {
      $('[lbl="login.loading"]').html("Loading... Please wait...");
      LOGIN_ExecuteLogin();
    },
  });

  if (guestUser != "") $("[btn='SubmitLoginG']").show();
  $("[btn='SubmitLoginG']").on({
    click: function () {
      $('[lbl="login.loading"]').html("Loading... Please wait...");
      $('[txt="username"]').val(guestUser);
      $('[txt="password"]').val("");
      LOGIN_ExecuteLogin();
    },
  });
}

function LOGIN_ExecuteLogin() {
  $("[btn='SubmitLogin']").attr("disabled", "disabled");
  $.ajax({
    type: "POST",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    url: serverUrl + "WebServices/Offline/SyncService.asmx/LoginService",
    data: JSON.stringify({
      Input: {
        UserName: $('[txt="username"]').val(),
        Password: $('[txt="password"]').val(),
      },
    }),
    success: function (data) {
      console.log(data.d);
      FilterOption["lastPsw"] = $('[txt="password"]').val();
      $('[lbl="login.loading"]').html("");
      //InitAppConfig();
      loggedinuser = JSON.parse(data.d);

      if (loggedinuser.Success) {
        localStorage.setItem("LocalUser", JSON.stringify(loggedinuser));
        $("#loginSection").hide("fast");
        ApplicationInformation.LastConnectedDate = Date();
        InitAppConfig();
      } else {
        $('[lbl="login.loading"]').html(loggedinuser.failedMessage);
      }

      $("[btn='SubmitLogin']").removeAttr("disabled");
    },
  }).fail(function () {
    $('[lbl="login.loading"]').html(
      "Unable to login.<br/>Please ensure connectivity to the internet."
    );
    $("[btn='SubmitLogin']").removeAttr("disabled");
    // Find the offline config
  });
}

function LOGIN_ParseCode() {
  $('[action="ParseCode"]').attr("disabled", "disabled");
  $('[lbl="authcode.loading"]').html("Authenticating... Please wait.");
  $('[container="footer"]').html(
    "Checking configurations.... <br/>Please wait..."
  );
  $.ajax({
    type: "POST",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    url: serverUrl + "WebServices/Offline/SyncService.asmx/ParseCode",
    data: JSON.stringify({ Input: { Code: $('[txt="authCode"]').val() } }),
    success: function (data) {
      authdata = JSON.parse(data.d);
      if (authdata.Success) {
        $('[lbl="authcode.loading"]').html(
          "System is now connecting to " + authdata.ServerName
        );
        serverUrl = authdata.Url;
        $('[lbl="login.loading"]').html(
          "System is now connecting to " + authdata.ServerName
        );
        ApplicationInformation.ConnectedServer = authdata.ServerName;
        ApplicationInformation.serverUrl = authdata.Url;

        localStorage.setItem(
          "SystemProperties",
          JSON.stringify(ApplicationInformation)
        );

        $("[act='ShowHideCode']").trigger("click");
      } else {
        $('[lbl="authcode.loading"]').html("Access Code Invalid.");
      }
      $('[action="ParseCode"]').removeAttr("disabled");
    },
  }).fail(function () {
    $('[lbl="authcode.loading"]').html(
      "Unable to login.<br/>Please ensure connectivity to the internet."
    );
    $('[action="ParseCode"]').removeAttr("disabled");
    // Find the offline config
  });
}

function SYNC_Logout() {
  $("[act='Logout']").attr("disabled", "disabled");
  $("#divStatus").html("Logging out.... <br/>Please wait...");
  $.ajax({
    type: "POST",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    url: serverUrl + "WebServices/Offline/SyncService.asmx/LogoutService",
    data: JSON.stringify({
      Input: { UserName: loggedinuser.UserID },
    }),
    success: function (data) {
      syncOperationsLayer = new Object();
      syncOperationsLayer.InsertLayer = new Array();
      syncOperationsLayer.InsertLayerFields = new Array();
      localStorage.setItem(
        "syncOperationsLayer",
        JSON.stringify(syncOperationsLayer)
      );
      loggedinuser = undefined;
      localStorage.setItem("LocalUser", loggedinuser);
      $("[container='WorkWindow']").hide();
      $("#switchApplication").hide();
      $("#loginSection").load("login.html");
      $("[container='WorkWindow']").hide("fast", function () {
        $("#loginSection").show("fast");
      });
      $("#divStatus").html("Logout successfull");
      $("[act='Logout']").removeAttr("disabled");
      $('[container="usererrormessage"]').hide();
    },
  }).fail(function () {
    alert("Please refresh");
    $("#divStatus").html(
      "Logout unsuccessfull...<br/>Please ensure connectivity to the server."
    );
    $("[act='Logout']").removeAttr("disabled");
    // Find the offline config
  });
}
