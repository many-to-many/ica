<?php

  require_once(DIR_ROOT . "/lib/responses.php");

  $REQUEST_BODY = file_get_contents("php://input");
  if ($REQUEST_BODY && $REQUEST_METHOD == "GET") $REQUEST_METHOD = "POST";
  if (isset($_SERVER["CONTENT_TYPE"])) {
    switch ($_SERVER["CONTENT_TYPE"]) {
      case "application/json":
        $REQUEST_DATA = json_decode($REQUEST_BODY, true);
        break;
      default:
        $REQUEST_DATA = $REQUEST_BODY;
    }
  } else $REQUEST_DATA = $REQUEST_BODY;

  if (handle("responses")) switch ($REQUEST_METHOD) {

    case "POST": \Session\requireVerification();

      $accountId = \Session\getAccountId();

      // Validation
      if (!$REQUEST_DATA) throw new Exception("No request data");
      if (empty($REQUEST_DATA["refereeJointSourceIds"]) && empty($REQUEST_DATA["referrerJointSourceIds"])) throw new Exception("No referencing joint sources");

      $response = new \ICA\Responses\Response;
      $response->message = $REQUEST_DATA["message"];

      retainDatabaseTransaction();

      // Publish response
      $responseId = \ICA\Responses\insertResponse($response);

      // Update references
      if (!empty($REQUEST_DATA["refereeJointSourceIds"]))
        foreach ($REQUEST_DATA["refereeJointSourceIds"] as $jointSourceId) {
          \ICA\JointSources\touchReference($jointSourceId, $responseId);
        }
      if (!empty($REQUEST_DATA["referrerJointSourceIds"]))
        foreach ($REQUEST_DATA["referrerJointSourceIds"] as $jointSourceId) {
          \ICA\JointSources\touchReference($responseId, $jointSourceId);
        }

      releaseDatabaseTransaction();

      respondJSON([$responseId => [
        "_id" => $REQUEST_DATA["_id"],
        "_authorId" => $accountId,
        "_timestampAuthored" => time() // TODO: Use time recorded in the database
      ]]);

      break;

  } elseif (list($responseId) = handle("responses/{}")) switch ($REQUEST_METHOD) {

    case "PUT": \Session\requireVerification();

      // Validation
      if (!$REQUEST_DATA) throw new Exception("No request data");
      if (empty($REQUEST_DATA["message"])) throw new Exception("No message");

      $response = new \ICA\Responses\Response;
      $response->message = $REQUEST_DATA["message"];

      \ICA\Responses\putResponse($responseId, $response);

      respondJSON([]);

      break;

    case "DELETE": \Session\requireVerification();

      \ICA\Responses\insertResponseState($responseId, STATE_UNPUBLISHED);

      respondJSON([]);

      break;

  }

  require_once(__DIR__ . "/jointsources.php");

?>
