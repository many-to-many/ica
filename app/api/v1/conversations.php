<?php

  require_once(DIR_ROOT . "/lib/shared.php");
  require_once(DIR_ROOT . "/lib/conversations.php");
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

  if (handle("conversations")) switch ($REQUEST_METHOD) {

    case "GET":

      $limit = 40;

      if (array_key_exists("q", $_GET)) {
        if (empty($_GET["q"])) {
          $data = [];
        } elseif (!empty($_SERVER["HTTP_X_ICA_STATE"])) {
          $data = \ICA\Conversations\getConversationsByMetaTitle($_GET["q"], $limit, $_SERVER["HTTP_X_ICA_STATE"]);
        } else {
          $data = \ICA\Conversations\getConversationsByMetaTitle($_GET["q"], $limit);
        }
      } else {
        if (!empty($_SERVER["HTTP_X_ICA_STATE"])) {
          $data = \ICA\Conversations\getConversations($limit, $_SERVER["HTTP_X_ICA_STATE"]);
        } else {
          $data = \ICA\Conversations\getConversations($limit);
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

  } elseif (list($conversationId) = handle("conversations/{}")) switch ($REQUEST_METHOD) {

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

  } elseif (list($conversationId) = handle("conversations/{}/sources")) switch ($REQUEST_METHOD) {

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

  } elseif (list($conversationId, $sourceId) = handle("conversations/{}/sources/{}")) switch ($REQUEST_METHOD) {

    case "PUT": \Session\requireVerification();

      \ICA\Sources\partialPutConversationContentRevision($sourceId, $REQUEST_DATA["content"]);

      respondJSON([]);

      break;

    case "DELETE": \Session\requireVerification();

      \ICA\Sources\insertSourceState($sourceId, STATE_UNPUBLISHED);

      respondJSON([]);

      break;

  }

?>
