<?php

  namespace ICA\Contents;

  /**
   * Request new storage space for a language-major revisional content.
   * Returns a content id with which the service can be requested.
   */
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

  function getLookupContent($lookupId, $lookupTable, $lookupColumn = NULL) {

    $result = query("SELECT * FROM `{$lookupTable}`
      WHERE id = '{$lookupId}';");

    if ($row = $result->fetch_assoc()) {
      $lookupColumn = !empty($lookupColumn) ? $lookupColumn : "content";
      return $row[$lookupColumn];
    }
    // Inconsistency with lookup table
    return NULL;

  }

  function getContentLanguageOfLatestRevision($contentId, $lang, $lookupTable = NULL, $lookupColumn = NULL) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $langEncoded = encodeLang($lang);
    $result = query("SELECT *
      FROM contents_langs_summary
      WHERE content_id = {$contentId} AND lang = {$langEncoded}
        AND state = {$stateEncoded};");

    if ($row = $result->fetch_assoc()) {
      $content = $row["content"];
      if (!empty($lookupTable)) {
        $lookupId = $content;
        $content = getLookupContent($lookupId, $lookupTable, $lookupColumn);
      }
      return $content;
    }
    return NULL;

  }

  /**
   * Returns the latest languages for a content.
   */
  function getContentLanguagesOfLatestRevision($contentId, $lookupTables = [], $lookupColumns = []) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM contents_langs_summary
      WHERE content_id = {$contentId}
        AND state = {$stateEncoded};");
    $data = [];
    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      $content = $row["content"];
      if (!empty($lookupTables[$lang])) {
        $lookupTable = $lookupTables[$lang];
        $lookupId = $content;
        $content = getLookupContent($lookupId, $lookupTable, !empty($lookupColumns[$lang])
          ? $lookupColumns[$lang]
          : NULL);
      }
      $data[$lang] = $content;
    }
    return $data;

  }

  /**
   * Inserts a new state for the specified language of one content.
   */
  function insertContentLanguageState($langId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    $result = query("INSERT INTO contents_langs_states
      (`lang_id`, `author_id`, `state`)
      VALUES ({$langId}, {$accountId}, {$stateEncoded});");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  /**
   * Inserts a new revision for a language-specific content by the language id.
   */
  function insertContentLanguageRevision($langId, $content, $lookupTable = NULL, $lookupColumn = NULL) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $contentEncoded = $DATABASE->real_escape_string($content);
    if (!empty($lookupTable)) {
      if (empty($lookupColumn)) $lookupColumn = "content";

      $result = query("SELECT * FROM `{$lookupTable}`
        WHERE {$lookupColumn} = '{$contentEncoded}';");

      if ($result->num_rows == 0) {
        query("INSERT INTO `{$lookupTable}`
          (`author_id`, {$lookupColumn})
          VALUES ({$accountId}, '{$contentEncoded}')");
        $lookupId = $DATABASE->insert_id;
      } else {
        $row = $result->fetch_assoc();
        $lookupId = $row["id"];
      }
      $contentEncoded = $lookupId;
    }
    $result = query("INSERT INTO contents_langs_revs
      (`lang_id`, `author_id`, `content`)
      VALUES ({$langId}, {$accountId}, '{$contentEncoded}')");

    $revisionId = $DATABASE->insert_id;
    return $revisionId;

  }

  /**
   * Partially puts the language specific content by content id.
   */
  function partialPutContentLanguage($contentId, $lang, $content, $state = STATE_PUBLISHED, $lookupTable = NULL, $lookupColumn = NULL) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    $langEncoded = encodeLang($lang);
    $result = query("SELECT *
      FROM `contents_langs_summary`
      WHERE content_id = {$contentId} AND lang = {$langEncoded};");

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
      $rev = $row["content"];

      if (decodeState($row["state"]) != $state) {
        // Update existing state
        insertContentLanguageState($langId, $state);
      }

      if (!empty($lookupTable)) {
        $lookupId = $rev;
        $rev = getLookupContent($lookupId, $lookupTable, $lookupColumn);
      }
      if ($content == $rev) {
        return $row["rev_id"];
      }
    }

    // Add new revision
    $revisionId = insertContentLanguageRevision($langId, $content, $lookupTable, $lookupColumn);

    releaseDatabaseTransaction();

    return $revisionId;

  }

  /**
   * Partially batch puts the language specific content by content id.
   */
  function partialPutContentLanguages($contentId, $langs, $state = STATE_PUBLISHED, $lookupTables = [], $lookupColumns = []) {

    retainDatabaseTransaction();

    foreach ($langs as $lang => $content) {

      if (!empty($lookupTables[$lang])) {
        partialPutContentLanguage($contentId, $lang, $content, $state,
          $lookupTables[$lang],
          !empty($lookupColumns[$lang])
            ? $lookupColumns[$lang]
            : NULL);
      } else {
        partialPutContentLanguage($contentId, $lang, $content, $state);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Puts the language specific content by content id.
   */
  function putContentLanguages($contentId, $langs, $state = STATE_PUBLISHED, $lookupTables = [], $lookupColumns = []) {

    retainDatabaseTransaction();

    // Add new languages to the database

    partialPutContentLanguages($contentId, $langs, $state, $lookupTables, $lookupColumns);

    // Unpublish languages no longer listed in the content put

    $result = query("SELECT *
      FROM contents_langs_summary
      WHERE content_id = {$contentId};");

    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $langs)) {
        insertContentLanguageState($row["lang_id"], STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

?>
