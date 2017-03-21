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

  /**
   * Returns the latest languages for a content.
   */
  function getContentLanguagesOfLatestRevision($contentId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM contents_langs_summary
      WHERE content_id = {$contentId}
        AND state = {$stateEncoded};");
    $data = [];
    while ($row = $result->fetch_assoc()) {
      $data[decodeLang($row["lang"])] = $row["content"];
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
  function insertContentLanguageRevision($langId, $content) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $contentEncoded = $DATABASE->real_escape_string($content);
    $result = query("INSERT INTO contents_langs_revs
      (`lang_id`, `author_id`, `content`)
      VALUES ({$langId}, {$accountId}, '{$contentEncoded}')");

    $revisionId = $DATABASE->insert_id;
    return $revisionId;

  }

  /**
   * Partially puts the language specific content by content id.
   */
  function partialPutContentLanguage($contentId, $lang, $content, $state = STATE_PUBLISHED) {

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

      if (decodeState($row["state"]) != $state) {
        // Update existing state
        insertContentLanguageState($langId, $state);
      }
      if ($content == $row["content"]) {
        releaseDatabaseTransaction();
        return $row["rev_id"];
      }
    }

    // Add new revision
    $revisionId = insertContentLanguageRevision($langId, $content);

    releaseDatabaseTransaction();

    return $revisionId;

  }

  /**
   * Partially batch puts the language specific content by content id.
   */
  function partialPutContentLanguages($contentId, $langs, $state = STATE_PUBLISHED) {

    retainDatabaseTransaction();

    foreach ($langs as $lang => $content) {
      partialPutContentLanguage($contentId, $lang, $content, $state);
    }

    releaseDatabaseTransaction();

  }

  /**
   * Puts the language specific content by content id.
   */
  function putContentLanguages($contentId, $langs, $state = STATE_PUBLISHED) {

    retainDatabaseTransaction();

    // Add new languages to the database

    partialPutContentLanguages($contentId, $langs);

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
