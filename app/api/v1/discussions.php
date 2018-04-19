<?php

  require_once(DIR_ROOT . "/lib/common.php");
  require_once(DIR_ROOT . "/lib/discussions.php");
  require_once(DIR_ROOT . "/lib/sources.php");

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

      $dataSources = [];
      // For each source
      foreach ($REQUEST_DATA["sources"] as $requestDataSource) {
        $source = new \ICA\Sources\Source;
        $source->type = $requestDataSource["type"];
        $source->content = $requestDataSource["content"];

        $sourceId = \ICA\Sources\insertSource($discussionId, $source);

        $dataSources[$sourceId] = [
          "_id" => $requestDataSource["_id"]
        ];
      }

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

  } elseif (list($discussionId) = handle("discussions/{i}/sources")) switch ($REQUEST_METHOD) {

    case "POST": \Session\requireVerification();

      if (!$REQUEST_DATA) throw new Exception("No request data");

      $discussion = \ICA\Discussions\getDiscussion($discussionId);

      $source = new \ICA\Sources\Source;
      $source->type = $REQUEST_DATA["type"];
      $source->content = $REQUEST_DATA["content"];

      $sourceId = \ICA\Sources\insertSource($discussionId, $source);

      respondJSON([$sourceId => [
        "_id" => $REQUEST_DATA["_id"]
      ]]);

      break;

  } elseif (list($discussionId, $sourceId) = handle("discussions/{i}/sources/{i}")) switch ($REQUEST_METHOD) {

    case "PUT": \Session\requireVerification();

      \ICA\Sources\partialPutSourceContent($sourceId, $REQUEST_DATA["content"]);

      respondJSON([]);

      break;

    case "DELETE": \Session\requireVerification();

      \ICA\Sources\insertSourceState($sourceId, STATE_UNPUBLISHED);

      respondJSON([]);

      break;

  }

  require_once(__DIR__ . "/jointsources.php");

?>