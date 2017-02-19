<?php

  namespace ICA\Sources;

  define("STATE_PUBLISHED_ENCODED", 1);
  define("STATE_PUBLISHED", "published");
  define("STATE_UNPUBLISHED_ENCODED", 2);
  define("STATE_UNPUBLISHED", "unpublished");

  define("TYPE_TEXT_ENCODED", 1);
  define("TYPE_TEXT", "text");
  define("TYPE_AUDIO_ENCODED", 2);
  define("TYPE_AUDIO", "audio");
  define("TYPE_IMAGE_ENCODED", 3);
  define("TYPE_IMAGE", "image");
  define("TYPE_VIDEO_ENCODED", 4);
  define("TYPE_VIDEO", "video");

  define("LANG_UNDEFINED_ENCODED", 0);
  define("LANG_UNDEFINED", "*");

  function encodeLang($lang) {
    switch ($lang) {
      case LANG_UNDEFINED: return LANG_UNDEFINED_ENCODED;
    }
    throw new \Exception("Unable to encode lang");
  }

  function decodeLang($code) {
    switch ($code) {
      case LANG_UNDEFINED_ENCODED: return LANG_UNDEFINED;
    }
    throw new \Exception("Unable to decode lang");
  }

  function encodeType($type) {
    switch ($type) {
      case TYPE_IMAGE: return TYPE_IMAGE_ENCODED;
      case TYPE_AUDIO: return TYPE_AUDIO_ENCODED;
      case TYPE_VIDEO: return TYPE_VIDEO_ENCODED;
      case TYPE_TEXT: return TYPE_TEXT_ENCODED;
    }
    throw new \Exception("Unable to encode type");
  }

  function decodeType($type) {
    switch ($type) {
      case TYPE_IMAGE_ENCODED: return TYPE_IMAGE;
      case TYPE_AUDIO_ENCODED: return TYPE_AUDIO;
      case TYPE_VIDEO_ENCODED: return TYPE_VIDEO;
      case TYPE_TEXT_ENCODED: return TYPE_TEXT;
    }
    throw new \Exception("Unable to decode type");
  }

  function encodeState($state) {
    switch ($state) {
      case STATE_PUBLISHED: return STATE_PUBLISHED_ENCODED;
      case STATE_UNPUBLISHED: return STATE_UNPUBLISHED_ENCODED;
    }
    throw new \Exception("Unable to encode state");
  }

  function decodeState($code) {
    switch ($code) {
      case STATE_PUBLISHED_ENCODED: return STATE_PUBLISHED;
      case STATE_UNPUBLISHED_ENCODED: return STATE_UNPUBLISHED;
    }
    throw new \Exception("Unable to decode state");
  }


  function encodeContent($meta) {
    return json_encode($meta);
  }

  function decodeContent($text) {
    return json_decode($text);
  }

  class JointSource {

    public $meta;

    public function __construct() {
      $this->meta = [];
    }

  }

  class Source {

    public $type;

    public function __construct() {
      $this->content = [];
    }

  }

  /* Content */

  function requestContentId() {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new joint source
    $result = query("INSERT INTO contents
      (`author_id`)
      VALUES ({$accountId});");

    $contentId = $DATABASE->insert_id;
    return $contentId;

  }

  function insertContentLanguageState($langId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    $result = query("INSERT INTO contents_langs_states
      (`lang_id`, `author_id`, `state`)
      VALUES ({$langId}, {$accountId}, {$stateEncoded})");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  function insertContentLanguageRevision($langId, $content) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $contentEncoded = encodeContent($content);
    $result = query("INSERT INTO contents_langs_revs
      (`lang_id`, `author_id`, `content`)
      VALUES ({$langId}, {$accountId}, '{$contentEncoded}')");

    $revisionId = $DATABASE->insert_id;
    return $revisionId;

  }

  function insertContentLanguage($contentId, $lang, $rev, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $langEncoded = encodeLang($lang);

    $result = query("SELECT *
      FROM `contents_langs_summary`
      WHERE content_id = {$contentId} AND lang = {$langEncoded}");

    if ($result->num_rows == 0) {
      // Content does not hold language of which the revision is given
      $result = query("INSERT INTO `contents_langs`
        (`content_id`, `author_id`, `lang`)
        VALUES ({$contentId}, {$accountId}, {$langEncoded});");
      $langId = $DATABASE->insert_id;

      // Set initial state
      insertContentLanguageState($langId, $state);

    } else {
      $row = $result->fetch_assoc();
      $langId = $row["lang_id"];

      if (decodeState($row["state"]) != $state) {
        // Update existing state
        insertContentLanguageState($langId, $state);
      }
    }

    // Add new revision
    $revisionId = insertContentLanguageRevision($langId, $rev);

    return $revisionId;

  }

  function insertContentLanguages($contentId, $revs, $state = STATE_PUBLISHED) {
    foreach ($revs as $lang => $rev) {
      insertContentLanguage($contentId, $lang, $rev, $state);
    }
  }

  function getContentLanguagesOfLatestRevision($contentId) {

    $result = query("SELECT * FROM contents_langs_summary WHERE content_id = {$contentId};");
    $data = [];
    while ($row = $result->fetch_assoc()) {
      $data[decodeLang($row["lang"])] = decodeContent($row["rev_content"]);
    }
    return $data;

  }

  /* Joint source */

  function getJointSources($limit = 200) {

    global $DATABASE;

    $state = STATE_PUBLISHED;
    $result = query("SELECT * FROM jointsources_summary LIMIT $limit;");

    if ($result->num_rows == 0) return [];
    $data = [];
    // Iterate through joint sources
    while ($row = $result->fetch_assoc()) {
      $jointSourceId = $row["jointsource_id"];
      $contentId = $row["content_id"];
      if (empty($data[$jointSourceId])) {
        $jointSource = new JointSource;
      } else {
        $jointSource = $data[$jointSourceId];
      }

      $jointSource->meta = getContentLanguagesOfLatestRevision($contentId);

      // Run all sources joint by joint source
      $jointSource->sources = getSources($jointSourceId);

      $data[$jointSourceId] = $jointSource;
    }

    return $data;
  }

  function insertJointSource($jointSource, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Request content versioning unit id
    $contentId = requestContentId();

    // Create a new joint source
    $result = query("INSERT INTO jointsources
      (`author_id`, `content_id`)
      VALUES ({$accountId}, {$contentId});");
    $jointSourceId = $DATABASE->insert_id;

    $stateId = insertJointSourceState($jointSourceId, $state);
    insertContentLanguages($contentId, $jointSource->meta);

    return $jointSourceId;

  }

  function insertJointSourceState($jointSourceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);

    $result = query("INSERT INTO jointsources_states
      (`jointsource_id`, `author_id`, `state`)
      VALUES ($jointSourceId, $accountId, $stateEncoded);");
    $stateId = $DATABASE->insert_id;

    return $stateId;

  }

  function insertJointSourceMetaRevision($jointSourceId, $meta) {

    $result = query("SELECT content_id FROM jointsources WHERE id = {$jointSourceId};");
    if ($result->num_rows == 0) {
      return false; // Joint source not found
    }

    $contentId = $result->fetch_assoc()["content_id"];
    insertContentLanguages($contentId, $meta);

  }

  /* Source */

  function getSources($jointSourceId) {

    global $DATABASE;

    $state = STATE_PUBLISHED;
    $result = query("SELECT * FROM sources_summary WHERE jointsource_id = {$jointSourceId};");

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

      $source->content = getContentLanguagesOfLatestRevision($contentId);

      $data[$sourceId] = $source;
    }
    return $data;

  }

  function insertSource($jointSourceId, $source, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Request content versioning unit id
    $contentId = requestContentId();

    // Create a new joint source
    $typeEncoded = encodeType($source->type);
    $result = query("INSERT INTO sources
      (`jointsource_id`, `author_id`, `content_id`, `type`)
      VALUES ({$jointSourceId}, {$accountId}, {$contentId}, {$typeEncoded});");
    $sourceId = $DATABASE->insert_id;

    $stateId = insertSourceState($sourceId, $state);
    insertContentLanguages($contentId, $source->content);

    return $sourceId;

  }

  function insertSourceState($sourceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);

    $result = query("INSERT INTO sources_states
      (`source_id`, `author_id`, `state`)
      VALUES ($sourceId, $accountId, $stateEncoded);");
    $stateId = $DATABASE->insert_id;

    return $stateId;

  }

  function insertJointSourceContentRevision($sourceId, $content) {

    $result = query("SELECT content_id FROM sources WHERE id = {$sourceId};");
    if ($result->num_rows == 0) {
      return false; // Joint source not found
    }

    $contentId = $result->fetch_assoc()["content_id"];
    insertContentLanguages($contentId, $content);

  }

?>
