<?php

  namespace ICA\Sources;

  require_once(__DIR__ . "/shared.php");
  require_once(__DIR__ . "/contents.php");

  class Source {

    public $type;

    public function __construct() {
      $this->content = [];
    }

  }

  function getSources($jointSourceId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM sources_summary
      WHERE jointsource_id = {$jointSourceId}
        AND state = {$stateEncoded};");

    if ($result->num_rows == 0) return [];
    $data = [];
    // Iterate through joint sources
    while ($row = $result->fetch_assoc()) {
      $sourceId = $row["source_id"];
      $contentId = $row["content_id"];
      if (empty($data[$sourceId])) {
        $source = new Source;
        $source->type = decodeType($row["source_type"]);
      } else {
        $source = $data[$sourceId];
      }

      $source->content = \ICA\Contents\getContentLanguagesOfLatestRevision($contentId);

      $data[$sourceId] = $source;
    }
    return $data;

  }

  function insertSource($jointSourceId, $source, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Request content versioning unit id
    $contentId = \ICA\Contents\requestContentId();

    // Create a new joint source
    $typeEncoded = encodeType($source->type);
    $result = query("INSERT INTO sources
      (`jointsource_id`, `author_id`, `content_id`, `type`)
      VALUES ({$jointSourceId}, {$accountId}, {$contentId}, {$typeEncoded});");
    $sourceId = $DATABASE->insert_id;

    $stateId = insertSourceState($sourceId, $state);
    \ICA\Contents\partialPutContentLanguages($contentId, $source->content);

    return $sourceId;

  }

  function insertSourceState($sourceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);

    $result = query("INSERT INTO sources_states
      (`source_id`, `author_id`, `state`)
      VALUES ({$sourceId}, {$accountId}, {$stateEncoded});");
    $stateId = $DATABASE->insert_id;

    return $stateId;

  }

  function partialPutJointSourceContentRevision($sourceId, $content) {

    $result = query("SELECT content_id
      FROM sources
      WHERE id = {$sourceId};");
    if ($result->num_rows == 0) {
      return false; // Joint source not found
    }

    $contentId = $result->fetch_assoc()["content_id"];
    \ICA\Contents\partialPutContentLanguages($contentId, $content);

  }

?>
