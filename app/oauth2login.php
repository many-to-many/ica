<?php try {

  require_once(__DIR__ . "/config.oauth2.php");

  $redirectUri = sprintf(
    "%s/Authorize?client_id=%s&response_type=code&scope=account.names:read+account.identifier:read",
    OAUTH2_URI,
    OAUTH2_CLIENT_ID
  );

  header("Location: $redirectUri");

} catch (Exception $e) {

  exit("Caught exception: " . (isset($e) && $e ? $e->getMessage() : ""));

} ?>
