<?php

  namespace ICA\Sources;

  require_once(__DIR__ . "/shared.php");
  require_once(__DIR__ . "/contents.php");

  $TYPE_HYPERLINK_LOOKUP_TABLES = [
    LANG_UNDEFINED => "hyperlinks"
  ];
  $TYPE_HYPERLINK_LOOKUP_COLUMNS = [
    LANG_UNDEFINED => "link"
  ];

  class Source {

    public $type;

    public function __construct() {
      $this->content = [];
    }

  }

  function getSources($jointSourceId) {

    global $TYPE_HYPERLINK_LOOKUP_TABLES, $TYPE_HYPERLINK_LOOKUP_COLUMNS;

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

      switch ($source->type) {
        case TYPE_HYPERLINK:
          $source->content = \ICA\Contents\getContentLanguagesOfLatestRevision($contentId,
            $TYPE_HYPERLINK_LOOKUP_TABLES,
            $TYPE_HYPERLINK_LOOKUP_COLUMNS);
          break;
        default:
          $source->content = \ICA\Contents\getContentLanguagesOfLatestRevision($contentId);
      }

      $data[$sourceId] = $source;
    }
    return $data;

  }

  function insertSource($jointSourceId, $source, $state = STATE_PUBLISHED) {

    global $DATABASE;
    global $TYPE_HYPERLINK_LOOKUP_TABLES, $TYPE_HYPERLINK_LOOKUP_COLUMNS;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    // Request content versioning unit id
    $contentId = \ICA\Contents\requestContentId();

    // Create a new joint source
    $typeEncoded = encodeType($source->type);
    $result = query("INSERT INTO sources
      (`jointsource_id`, `author_id`, `content_id`, `type`)
      VALUES ({$jointSourceId}, {$accountId}, {$contentId}, {$typeEncoded});");
    $sourceId = $DATABASE->insert_id;

    $stateId = insertSourceState($sourceId, $state);
    switch ($source->type) {
      case TYPE_HYPERLINK:
        \ICA\Contents\partialPutContentLanguages($contentId, $source->content, $state,
          $TYPE_HYPERLINK_LOOKUP_TABLES,
          $TYPE_HYPERLINK_LOOKUP_COLUMNS);
        break;
      default:
        \ICA\Contents\partialPutContentLanguages($contentId, $source->content, $state);
    }

    releaseDatabaseTransaction();

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

  function partialPutSourceContentRevision($sourceId, $content, $state = STATE_PUBLISHED) {

    global $TYPE_HYPERLINK_LOOKUP_TABLES, $TYPE_HYPERLINK_LOOKUP_COLUMNS;

    $result = query("SELECT *
      FROM sources
      WHERE id = {$sourceId};");

    if ($row = $result->fetch_assoc()) {
      $type = decodeType($row["type"]);
      $contentId = $row["content_id"];

      switch ($type) {
        case TYPE_HYPERLINK:
          \ICA\Contents\partialPutContentLanguages($contentId, $content, $state,
            $TYPE_HYPERLINK_LOOKUP_TABLES,
            $TYPE_HYPERLINK_LOOKUP_COLUMNS);
          break;
        default:
          \ICA\Contents\partialPutContentLanguages($contentId, $content, $state);
      }
    }
    return false; // Joint source not found

  }

?>
