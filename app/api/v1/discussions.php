<?php

  require_once(DIR_ROOT . "/lib/common.php");
  require_once(DIR_ROOT . "/lib/discussions.php");
  require_once(DIR_ROOT . "/lib/sources.php");

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

  if (handle("discussions")) switch ($REQUEST_METHOD) {

    case "GET":

      $limit = 40;

      $data = \ICA\Discussions\getDiscussions($limit,
        !empty($_SERVER["HTTP_X_ICA_STATE"]) ? $_SERVER["HTTP_X_ICA_STATE"] : NULL);

      // There is probably more data available
      if (count($data) == $limit) {
        end($data); // Move the internal pointer to the end of the array
        header("X-ICA-State-Next: " . key($data));
      }

      respondJSON($data);

      break;

    case "POST": \Session\requireVerification();

      // Validation
      if (empty($REQUEST_DATA)) throw new Exception("No request data");
      if (empty($REQUEST_DATA["meta"])) throw new Exception("Metadata must not be empty");

      retainDatabaseTransaction();

      $discussion = new \ICA\Discussions\Discussion();
      $discussion->meta = $REQUEST_DATA["meta"];

      $discussionId = \ICA\Discussions\insertDiscussion($discussion);

      releaseDatabaseTransaction();

      respondJSON([$discussionId => [
        "_id" => $REQUEST_DATA["_id"]
      ]]);

      break;

  } elseif (list($discussionId) = handle("discussions/{i}")) switch ($REQUEST_METHOD) {

    case "GET":

      $data = \ICA\Discussions\getDiscussion($discussionId);

      respondJSON($data);

      break;

    case "PUT":

      // Validation
      if (!$REQUEST_DATA) throw new Exception("No request data");
      if (empty($REQUEST_DATA["meta"])) throw new Exception("Metadata must not be empty");

      \ICA\Discussions\putDiscussionMeta($discussionId, $REQUEST_DATA["meta"]);

      respondJSON([]);

      break;

    case "DELETE":

      \ICA\Discussions\insertDiscussionState($discussionId, STATE_UNPUBLISHED);

      respondJSON([]);

      break;

  } elseif (list($discussionId) = handle("discussions/{i}/thread")) switch ($REQUEST_METHOD) {

    case "GET":

      $limit = 40;

      $data = \ICA\Discussions\getResponsesInDiscussion($discussionId, $limit,
        !empty($_SERVER["HTTP_X_ICA_STATE"]) ? $_SERVER["HTTP_X_ICA_STATE"] : NULL);

      // There is probably more data available
      if (count($data) == $limit) {
        end($data); // Move the internal pointer to the end of the array
        header("X-ICA-State-Next: " . key($data));
      }

      respondJSON($data);

      break;

  }

  require_once(__DIR__ . "/jointsources.php");

?>