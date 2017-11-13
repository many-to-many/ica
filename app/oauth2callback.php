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
    if (!$response) throw new Exception("Failed to get access token");
    $token = $response->access_token;

    // Get user identifier

    $requestUri = sprintf(
      "%s/TokenInfo?access_token=%s",
      OAUTH2_URI,
      $token
    );
    $response = json_decode(file_get_contents($requestUri));
    if (!$response) throw new Exception("Failed to get user identifier");
    $identifier = $response->identifier;

    // Confirm user identifier
    if (isset($identifier) && $identifier) {

      $accountId = \Accounts\getAccountIdByIdentifier($identifier);
      if (!$accountId) {
        // Account not yet registered
        $accountId = \Accounts\registerAccountByIdentifier($identifier);

        if (!$accountId) throw new Exception("Failed to create new account");
      }

      // Account assume registered if no error emitted

    } else throw new Exception("Identifier not found");

    // Get user names

    $requestUri = sprintf(
      "%s/account/names?access_token=%s",
      MINTKIT_API,
      $token
    );
    $response = json_decode(file_get_contents($requestUri), true);
    if (!$response) throw new Exception("Failed to get user names");
    $names = $response;

    if (!empty($names["en"])) {
      $name = implode(" ", [$names["en"]["first"], $names["en"]["last"]]);
    } else {
      $arrNames = array_values($names);
      $name = count($arrNames) > 0 ? $arrNames[0]["first"] : "";
    }

    // Update user name
    \Accounts\updateAccountName($accountId, $name);

  }

  $sessionId = \Session\init($accountId);

} catch (Exception $e) {

  exit("Caught exception: " . (isset($e) && $e ? $e->getMessage() : ""));

} ?>
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript">
      if (window.opener) {
        window.opener.loginCallback(<?=json_encode([
          "accountId" => $accountId,
          "sessionId" => $sessionId,
          "timestampLogin" => time()
        ])?>);
        window.close();
        window.location = "index.html";
      } else {
        // Error with window opener
        console.error("Cannot find window opener");
        alert("Cannot find window opener");
      }
    </script>
  </head>
  <body></body>
</html>
