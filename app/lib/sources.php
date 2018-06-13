<?php

  namespace ICA\Sources;

  require_once(__DIR__ . "/common.php");
  require_once(__DIR__ . "/contents.php");

  class Source {

    public $type;

    public $content = [];

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

    retainDatabaseTransaction();

    // Request content versioning unit id
    $titleId = \ICA\Contents\requestContentId();
    $contentId = \ICA\Contents\requestContentId();

    // Create a new joint source
    $typeEncoded = encodeType($source->type);
    query("INSERT INTO sources
      (`jointsource_id`, `author_id`, `title_id`, `content_id`, `type`)
      VALUES ({$jointSourceId}, {$accountId}, {$titleId}, {$contentId}, {$typeEncoded});");
    $sourceId = $DATABASE->insert_id;

    insertSourceState($sourceId, $state);
    partialPutSourceContentLanguages($contentId, $source->content, $source->type, $state);

    releaseDatabaseTransaction();

    return $sourceId;

  }

  function fixSourcesTitles() {

    retainDatabaseTransaction();

    $result = query("SELECT * FROM sources WHERE title_id = 0;");
    while ($row = $result->fetch_assoc()) {
      $titleId = \ICA\Contents\requestContentId();
      query("UPDATE sources SET title_id = {$titleId} WHERE id = {$row['id']}");
    }

    releaseDatabaseTransaction();

  }

  function insertSourceState($sourceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);

    query("INSERT INTO sources_states
      (`source_id`, `author_id`, `state`)
      VALUES ({$sourceId}, {$accountId}, {$stateEncoded});");
    $stateId = $DATABASE->insert_id;

    return $stateId;

  }

  function partialPutSourceContent($sourceId, $content) {

    $result = query("SELECT content_id, type
      FROM sources
      WHERE id = {$sourceId};");
    if ($result->num_rows == 0) {
      return false; // Joint source not found
    }

    $row = $result->fetch_assoc();
    $contentId = $row["content_id"];
    $sourceType = decodeType($row["type"]);
    partialPutSourceContentLanguages($contentId, $content, $sourceType);

  }

  function partialPutSourceContentLanguages($contentId, $langs, $sourceType, $state = STATE_PUBLISHED) {

    retainDatabaseTransaction();

    foreach ($langs as $lang => $content) {

      // Only index text content
      $indexed =
        $sourceType == TYPE_TEXT ||
        $sourceType == TYPE_AUDIO && $lang == LANG_1;

      \ICA\Contents\partialPutContentLanguage($contentId, $lang, $content, $state, $indexed);
    }

    releaseDatabaseTransaction();

  }

?>
