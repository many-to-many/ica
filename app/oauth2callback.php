<?php try {

  require_once(__DIR__ . "/init.php");

  // Validate callback
  if (isset($_GET["code"]) && $_GET["code"]) {

    $code = $_GET["code"];

    // Get access token with authentication code
    $requestUri = sprintf(
      "%s/Token?client_id=%s&client_secret=%s&grant_type=authorization_code&code=%s",
      OAUTH2_URI,
      OAUTH2_CLIENT_ID,
      OAUTH2_CLIENT_SECRET,
      $code
    );
    $response = json_decode(file_get_contents($requestUri));
    if (!$response) throw new Error("Failed to get access token");
    $token = $response->access_token;

    // Get user information
    $requestUri = sprintf(
      "%s/TokenInfo?access_token=%s",
      OAUTH2_URI,
      $token
    );
    $response = json_decode(file_get_contents($requestUri));
    if (!$response) throw new Error("Failed to get user identifier");
    $identifier = $response->identifier;

    // Confirm user identifier
    if (isset($identifier) && $identifier) {

      $account = \Accounts\getAccountByIdentifier($identifier);
      if (!isset($account) || !$account) {

        // Account not yet registered
        $account = \Accounts\registerAccountByIdentifier($identifier);

      }

      // Account assume registered if no error emitted

    } else throw new Exception("Identifier not found");

  }

  \Session\init(isset($account) && $account ? $account->id : "");

  $items = [
    "_ica_account_id" => $_SESSION["_ica_account_id"],
    "_ica_account_session" => $_SESSION["_ica_account_session"],
  ];

} catch (Exception $e) {

  exit("Caught exception: " . (isset($e) && $e ? $e->getMessage() : ""));

} ?>
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript">

      if (window.opener) {

        window.opener.sessionStorage.setItem("_ica_oauth2_timestamp", new Date().getTime());

        // Set session storage on window opener
        var items = <?=json_encode($items)?>;
        for (var key in items) window.opener.sessionStorage.setItem(key, items[key]);

        // Close the window after saving account id
        window.close();

        window.location = "index.html";

      } else {

        // Error with window opener
        console.error("Cannot find window opener");

      }

    </script>
  </head>
  <body>
  </body>
</html>
