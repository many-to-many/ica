<?php

  require_once(DIR_ROOT . "/lib/common.php");
  require_once(DIR_ROOT . "/lib/conversations.php");
  require_once(DIR_ROOT . "/lib/sources.php");

  if (handle("conversations")) switch ($REQUEST_METHOD) {

    case "GET":

      $limit = 40;

      $data = \ICA\Conversations\getConversations($limit,
        empty($_SERVER["HTTP_X_ICA_STATE"]) ? NULL : $_SERVER["HTTP_X_ICA_STATE"]);

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

      $conversation = new \ICA\Conversations\Conversation;
      $conversation->meta = $REQUEST_DATA["meta"];

      $conversationId = \ICA\Conversations\insertConversation($conversation);

      $dataSources = [];
      // For each source
      foreach ($REQUEST_DATA["sources"] as $requestDataSource) {
        $source = new \ICA\Sources\Source;
        $source->type = $requestDataSource["type"];
        $source->content = $requestDataSource["content"];

        $sourceId = \ICA\Sources\insertSource($conversationId, $source);

        $dataSources[$sourceId] = [
          "_id" => $requestDataSource["_id"]
        ];
      }

      releaseDatabaseTransaction();

      respondJSON([$conversationId => [
        "_id" => $REQUEST_DATA["_id"],
        "sources" => $dataSources
      ]]);

      break;

  } elseif (list($conversationId) = handle("conversations/{i}")) switch ($REQUEST_METHOD) {

    case "GET":

      $data = \ICA\Conversations\getConversation($conversationId);

      respondJSON($data);

      break;

    case "PUT": \Session\requireVerification();

      // Validation
      if (!$REQUEST_DATA) throw new Exception("No request data");
      if (empty($REQUEST_DATA["meta"])) throw new Exception("Metadata must not be empty");

      \ICA\Conversations\putConversationMeta($conversationId, $REQUEST_DATA["meta"]);

      respondJSON([]);

      break;

    case "DELETE":

      \ICA\Conversations\insertConversationState($conversationId, STATE_UNPUBLISHED);

      respondJSON([]);

      break;

  } elseif (list($conversationId) = handle("conversations/{i}/sources")) switch ($REQUEST_METHOD) {

    case "POST": \Session\requireVerification();

      if (!$REQUEST_DATA) throw new Exception("No request data");

      $conversation = \ICA\Conversations\getConversation($conversationId);

      $source = new \ICA\Sources\Source;
      $source->type = $REQUEST_DATA["type"];
      $source->content = $REQUEST_DATA["content"];

      $sourceId = \ICA\Sources\insertSource($conversationId, $source);

      respondJSON([$sourceId => [
        "_id" => $REQUEST_DATA["_id"]
      ]]);

      break;

  } elseif (list($conversationId, $sourceId) = handle("conversations/{i}/sources/{i}")) switch ($REQUEST_METHOD) {

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
