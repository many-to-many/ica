<?php

  require_once(DIR_ROOT . "/lib/shared.php");
  require_once(DIR_ROOT . "/lib/jointsources.php");
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

  if (handle(["jointsources"])) switch ($REQUEST_METHOD) {

    case "GET":

      $limit = 40;

      if (array_key_exists("q", $_GET)) {
        if (empty($_GET["q"])) {
          $data = [];
        } elseif (!empty($_SERVER["HTTP_X_ICA_STATE"])) {
          $data = \ICA\JointSources\getJointSourcesByMetaTitle($_GET["q"], $limit, $_SERVER["HTTP_X_ICA_STATE"]);
        } else {
          $data = \ICA\JointSources\getJointSourcesByMetaTitle($_GET["q"], $limit);
        }
      } else {
        if (!empty($_SERVER["HTTP_X_ICA_STATE"])) {
          $data = \ICA\JointSources\getJointSources($limit, $_SERVER["HTTP_X_ICA_STATE"]);
        } else {
          $data = \ICA\JointSources\getJointSources($limit);
        }
      }

      // There is probably more data available
      if (count($data) == $limit) {
        end($data); // Move the internal pointer to the end of the array
        header("X-ICA-State-Next: " . key($data));
      }

      respondJSON($data);

      break;

    case "POST": \Session\requireVerification();

      // Validation
      if (!$REQUEST_DATA) throw new Exception("No request data");
      if (empty($REQUEST_DATA["meta"])) throw new Exception("Metadata must not be empty");

      retainDatabaseTransaction();

      $jointSource = new \ICA\JointSources\JointSource;
      $jointSource->meta = $REQUEST_DATA["meta"];

      $jointSourceId = \ICA\JointSources\insertJointSource($jointSource);

      $dataSources = [];
      // For each source
      foreach ($REQUEST_DATA["sources"] as $requestDataSource) {
        $source = new \ICA\Sources\Source;
        $source->type = $requestDataSource["type"];
        $source->content = $requestDataSource["content"];

        $sourceId = \ICA\Sources\insertSource($jointSourceId, $source);

        $dataSources[$sourceId] = [
          "_id" => $requestDataSource["_id"]
        ];
      }

      releaseDatabaseTransaction();

      respondJSON([$jointSourceId => [
        "_id" => $REQUEST_DATA["_id"],
        "sources" => $dataSources
      ]]);

      break;

  } elseif (list($jointSourceId) = handle(["jointsources", REQUEST_PARAMETER])) switch ($REQUEST_METHOD) {

    case "PUT": \Session\requireVerification();

      // Validation
      if (!$REQUEST_DATA) throw new Exception("No request data");
      if (empty($REQUEST_DATA["meta"])) throw new Exception("Metadata must not be empty");

      \ICA\JointSources\putJointSourceMeta($jointSourceId, $REQUEST_DATA["meta"]);

      respondJSON([]);

      break;

    case "DELETE":

      \ICA\JointSources\insertJointSourceState($jointSourceId, STATE_UNPUBLISHED);

      respondJSON([]);

      break;

  } elseif (list($jointSourceId) = handle(["jointsources", REQUEST_PARAMETER, "sources"])) switch ($REQUEST_METHOD) {

    case "POST": \Session\requireVerification();

      if (!$REQUEST_DATA) throw new Exception("No request data");

      $source = new \ICA\Sources\Source;
      $source->type = $REQUEST_DATA["type"];
      $source->content = $REQUEST_DATA["content"];

      $sourceId = \ICA\Sources\insertSource($jointSourceId, $source);

      respondJSON([$sourceId => [
        "_id" => $REQUEST_DATA["_id"]
      ]]);

      break;

  } elseif (list($jointSourceId, $sourceId) = handle(["jointsources", REQUEST_PARAMETER, "sources", REQUEST_PARAMETER])) switch ($REQUEST_METHOD) {

    case "PUT": \Session\requireVerification();

      \ICA\Sources\partialPutJointSourceContentRevision($sourceId, $REQUEST_DATA["content"]);

      respondJSON([]);

      break;

    case "DELETE": \Session\requireVerification();

      \ICA\Sources\insertSourceState($sourceId, STATE_UNPUBLISHED);

      respondJSON([]);

      break;

  }

?>
