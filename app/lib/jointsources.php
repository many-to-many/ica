<?php

  namespace ICA\JointSources;

  require_once(__DIR__ . "/shared.php");
  require_once(__DIR__ . "/contents.php");
  require_once(__DIR__ . "/sources.php");

  /**
   * Abstract for joint source.
   */
  class JointSource {

    public $meta = [];

  }

  /**
   * Returns a list of JointSource instances created according to the result from a database query from `jointsources`.
   */
  function createJointSourcesFromQueryResult($result) {

    if ($result->num_rows == 0) return [];

    $data = [];
    // Iterate through joint sources
    while ($row = $result->fetch_assoc()) {
      $jointSourceId = $row["jointsource_id"];
      if (empty($data[$jointSourceId])) {
        $jointSource = new JointSource;

        // Populating metadata from the database
        $jointSource->meta["title"] = getJointSourceMetaTitleOfLatestRevision($row["title_id"]);
        $jointSource->meta["intro"] = getJointSourceMetaIntroOfLatestRevision($row["intro_id"]);
        $jointSource->meta["themes"] = getJointSourceMetaThemesOfLatestRevision($jointSourceId);
        $jointSource->meta["participants"] = getJointSourceMetaParticipantsOfLatestRevision($jointSourceId);
        $jointSource->meta["region"] = getJointSourceMetaRegionOfLatestRevision($jointSourceId);

        // Run all sources joint by joint source
        $jointSource->sources = \ICA\Sources\getSources($jointSourceId);

        $data[$jointSourceId] = $jointSource;
      }
    }
    return $data;

  }

  /**
   * Returns a list of JointSource instances which title contains the query text.
   */
  function getJointSourcesByMetaTitle($q, $limit = 200) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT jointsource.*
      FROM jointsources_summary AS jointsource
      INNER JOIN contents_langs_summary AS lang
        ON lang.content_id = jointsource.title_id AND
          lang.state = {$stateEncoded} AND
          lang.content LIKE '%{$q}%'
      WHERE jointsource.state = {$stateEncoded}
      LIMIT {$limit};");

    return createJointSourcesFromQueryResult($result);

  }

  /**
   * Returns a list of most recent JointSource instances.
   */
  function getJointSources($limit = 200) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM jointsources_summary
      WHERE state = {$stateEncoded}
      LIMIT {$limit};");

    return createJointSourcesFromQueryResult($result);

  }

  /**
   * Inserts a new joint source record into the database.
   */
  function insertJointSource($jointSource, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    // Request content versioning unit id
    $titleId = \ICA\Contents\requestContentId();
    $introId = \ICA\Contents\requestContentId();

    // Create a new joint source
    $result = query("INSERT INTO jointsources
      (`author_id`, `title_id`, `intro_id`)
      VALUES ({$accountId}, {$titleId}, {$introId});");
    $jointSourceId = $DATABASE->insert_id;

    $stateId = insertJointSourceState($jointSourceId, $state);

    if (!empty($jointSource->meta["title"])) partialPutJointSourceMetaTitle($titleId, $jointSource->meta["title"]);
    if (!empty($jointSource->meta["intro"])) partialPutJointSourceMetaIntro($introId, $jointSource->meta["intro"]);
    if (!empty($jointSource->meta["themes"])) partialPutJointSourceMetaThemes($jointSourceId, $jointSource->meta["themes"]);
    if (!empty($jointSource->meta["participants"])) partialPutJointSourceMetaParticipants($jointSourceId, $jointSource->meta["participants"]);
    if (!empty($jointSource->meta["region"])) partialPutJointSourceMetaRegion($jointSourceId, $jointSource->meta["region"]);

    releaseDatabaseTransaction();

    return $jointSourceId;

  }

  /**
   * Inserts a new state for the specified joint source.
   */
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

  /**
   * Partially puts the meta for the specified joint source.
   */
  function partialPutJointSourceMeta($jointSourceId, $meta) {

    $result = query("SELECT *
      FROM jointsources
      WHERE id = {$jointSourceId};");
    if ($result->num_rows == 0) {
      return false; // Joint source not found
    }

    $row = $result->fetch_assoc();

    retainDatabaseTransaction();

    if (!empty($meta["title"])) partialPutJointSourceMetaTitle($row["title_id"], $meta["title"]);
    if (!empty($meta["intro"])) partialPutJointSourceMetaIntro($row["intro_id"], $meta["intro"]);
    if (!empty($meta["themes"])) partialPutJointSourceMetaThemes($jointSourceId, $meta["themes"]);
    if (!empty($meta["participants"])) partialPutJointSourceMetaParticipants($jointSourceId, $meta["participants"]);
    if (!empty($meta["region"])) partialPutJointSourceMetaRegion($jointSourceId, $meta["region"]);

    releaseDatabaseTransaction();

  }

  /**
   * Puts the meta for the specified joint source.
   */
  function putJointSourceMeta($jointSourceId, $meta) {

    $result = query("SELECT *
      FROM jointsources
      WHERE id = {$jointSourceId};");
    if ($result->num_rows == 0) {
      return false; // Joint source not found
    }

    $row = $result->fetch_assoc();

    retainDatabaseTransaction();

    if (!empty($meta["title"])) putJointSourceMetaTitle($row["title_id"], $meta["title"]);
    if (!empty($meta["intro"])) putJointSourceMetaIntro($row["intro_id"], $meta["intro"]);
    if (!empty($meta["themes"])) putJointSourceMetaThemes($jointSourceId, $meta["themes"]);
    if (!empty($meta["participants"])) putJointSourceMetaParticipants($jointSourceId, $meta["participants"]);
    if (!empty($meta["region"])) putJointSourceMetaRegion($jointSourceId, $meta["region"]);

    releaseDatabaseTransaction();

  }

  /**
   * Joint source meta title
   */

  /**
   * Returns the latest revision of the title.
   */
  function getJointSourceMetaTitleOfLatestRevision($titleId) {
    return \ICA\Contents\getContentLanguagesOfLatestRevision($titleId);
  }

  /**
   * Partially puts a new meta title with the content id of the title.
   */
  function partialPutJointSourceMetaTitle($titleId, $metaTitle) {
    \ICA\Contents\partialPutContentLanguages($titleId, $metaTitle);
  }

  /**
   * Puts a new meta title with the content id of the title.
   */
  function putJointSourceMetaTitle($titleId, $metaTitle) {
    \ICA\Contents\putContentLanguages($titleId, $metaTitle);
  }

  /**
   * Joint source meta introduction
   */

  /**
   * Returns the latest revision of the introduction.
   */
  function getJointSourceMetaIntroOfLatestRevision($introId) {
    return \ICA\Contents\getContentLanguagesOfLatestRevision($introId);
  }

  /**
   * Partially puts a new meta introduction with the content id of the text.
   */
  function partialPutJointSourceMetaIntro($introId, $metaIntro) {
    \ICA\Contents\partialPutContentLanguages($introId, $metaIntro);
  }

  /**
   * Puts a new meta introduction with the content id of the text.
   */
  function putJointSourceMetaIntro($titleId, $metaTitle) {
    \ICA\Contents\putContentLanguages($titleId, $metaTitle);
  }

  /**
   * Joint source meta theme delegations
   */

  /**
   * Returns the latest revision of the cluster of themes.
   */
  function getJointSourceMetaThemesOfLatestRevision($jointSourceId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM jointsources_themes_summary
      WHERE jointsource_id = {$jointSourceId}
        AND state = {$stateEncoded};");

    $themes = [];
    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $themes)) {
        $themes[$lang] = [];
      }
      array_push($themes[$lang], $row["theme"]);
    }
    return $themes;

  }

  /**
   * Partially puts the cluster of themes for the joint source.
   */
  function partialPutJointSourceMetaThemes($jointSourceId, $metaThemes, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    $stateEncoded = encodeState($state);
    foreach ($metaThemes as $lang => $content) {
      $langEncoded = encodeLang($lang);

      foreach ($content as $theme) {
        $themeEncoded = $DATABASE->real_escape_string($theme);

        // Get theme id
        $result = query("SELECT id
          FROM themes
          WHERE theme = '{$themeEncoded}'
          LIMIT 1;");

        if ($result->num_rows == 0) {
          query("INSERT INTO themes
            (`theme`, `author_id`)
            VALUES ('{$themeEncoded}', {$accountId});");
          $themeId = $DATABASE->insert_id;
        } else {
          $row = $result->fetch_assoc();
          $themeId = $row["id"];
        }

        // Get joint source-theme delegate
        $result = query("SELECT *
          FROM jointsources_themes_summary
          WHERE jointsource_id = {$jointSourceId}
            AND lang = {$langEncoded}
            AND theme_id = {$themeId}
          LIMIT 1;");

        if ($result->num_rows == 0) {
          query("INSERT INTO jointsources_themes
            (`jointsource_id`, `theme_id`, `lang`, `author_id`)
            VALUES ({$jointSourceId}, {$themeId}, {$langEncoded}, {$accountId})");
          $delegId = $DATABASE->insert_id;
        } else {
          $row = $result->fetch_assoc();
          if (decodeState($row["state"]) == $state) {
            // Skip the current theme if already up to date
            continue;
          }
          $delegId = $row["deleg_id"];
        }

        // Update delegate status
        insertJointSourceMetaThemeState($delegId, $state);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Inserts a new state for the theme.
   */
  function insertJointSourceMetaThemeState($delegId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    $result = query("INSERT INTO jointsources_themes_states
      (`deleg_id`, `state`, `author_id`)
      VALUES ({$delegId}, {$stateEncoded}, {$accountId});");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  /**
   * Puts the cluster of themes for the joint source.
   */
  function putJointSourceMetaThemes($jointSourceId, $metaThemes) {

    retainDatabaseTransaction();

    // Add new languages to the database

    partialPutJointSourceMetaThemes($jointSourceId, $metaThemes);

    // Unpublish languages no longer listed in the content put

    $result = query("SELECT *
      FROM jointsources_themes_summary
      WHERE jointsource_id = {$jointSourceId};");

    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $metaThemes)
        || !in_array($row["theme"], $metaThemes[$lang])) {
        $delegId = $row["deleg_id"];
        insertJointSourceMetaThemeState($delegId, STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Joint source meta participant delegations
   */

  /**
   * Returns the latest revision of the cluster of participants.
   */
  function getJointSourceMetaParticipantsOfLatestRevision($jointSourceId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM jointsources_participants_summary
      WHERE jointsource_id = {$jointSourceId}
        AND state = {$stateEncoded};");

    $participants = [];
    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $participants)) {
        $participants[$lang] = [];
      }
      array_push($participants[$lang], $row["participant"]);
    }
    return $participants;

  }

  /**
   * Partially puts the cluster of participants for the joint source.
   */
  function partialPutJointSourceMetaParticipants($jointSourceId, $metaParticipants, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    $stateEncoded = encodeState($state);
    foreach ($metaParticipants as $lang => $content) {
      $langEncoded = encodeLang($lang);

      foreach ($content as $participant) {
        $participantEncoded = $DATABASE->real_escape_string($participant);

        // Get participant id
        $result = query("SELECT id
          FROM participants
          WHERE participant = '{$participantEncoded}'
          LIMIT 1;");

        if ($result->num_rows == 0) {
          query("INSERT INTO participants
            (`participant`, `author_id`)
            VALUES ('{$participantEncoded}', {$accountId});");
          $participantId = $DATABASE->insert_id;
        } else {
          $row = $result->fetch_assoc();
          $participantId = $row["id"];
        }

        // Get joint source-participant delegate
        $result = query("SELECT *
          FROM jointsources_participants_summary
          WHERE jointsource_id = {$jointSourceId}
            AND lang = {$langEncoded}
            AND participant_id = {$participantId}
          LIMIT 1;");

        if ($result->num_rows == 0) {
          query("INSERT INTO jointsources_participants
            (`jointsource_id`, `participant_id`, `lang`, `author_id`)
            VALUES ({$jointSourceId}, {$participantId}, {$langEncoded}, {$accountId})");
          $delegId = $DATABASE->insert_id;
        } else {
          $row = $result->fetch_assoc();
          if (decodeState($row["state"]) == $state) {
            // Skip the current participant if already up to date
            continue;
          }
          $delegId = $row["deleg_id"];
        }

        // Update delegate status
        insertJointSourceMetaParticipantState($delegId, $state);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Inserts a new state for the participant.
   */
  function insertJointSourceMetaParticipantState($delegId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    $result = query("INSERT INTO jointsources_participants_states
      (`deleg_id`, `state`, `author_id`)
      VALUES ({$delegId}, {$stateEncoded}, {$accountId});");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  /**
   * Puts the cluster of participants for the joint source.
   */
  function putJointSourceMetaParticipants($jointSourceId, $metaParticipants) {

    retainDatabaseTransaction();

    // Add new languages to the database

    partialPutJointSourceMetaParticipants($jointSourceId, $metaParticipants);

    // Unpublish languages no longer listed in the content put

    $result = query("SELECT *
      FROM jointsources_participants_summary
      WHERE jointsource_id = {$jointSourceId};");

    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $metaParticipants)
        || !in_array($row["participant"], $metaParticipants[$lang])) {
        $delegId = $row["deleg_id"];
        insertJointSourceMetaParticipantState($delegId, STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Joint source meta region
   */

  /**
   * Returns the latest revision of the language-specific regions.
   */
  function getJointSourceMetaRegionOfLatestRevision($jointSourceId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM jointsources_regions_langs_summary
      WHERE jointsource_id = {$jointSourceId}
        AND state = {$stateEncoded};");

    $region = [];
    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      $region[$lang] = $row["region"];
    }
    return $region;

  }

  /**
   * Partially puts the language-specific regions for the joint source.
   */
  function partialPutJointSourceMetaRegion($jointSourceId, $metaRegion, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    $stateEncoded = encodeState($state);
    foreach ($metaRegion as $lang => $region) {
      $langEncoded = encodeLang($lang);
      $regionEncoded = $DATABASE->real_escape_string($region);

      // Get region id
      $result = query("SELECT id
        FROM regions
        WHERE region = '{$regionEncoded}'
        LIMIT 1;");

      if ($result->num_rows == 0) {
        query("INSERT INTO regions
          (`region`, `author_id`)
          VALUES ('{$regionEncoded}', {$accountId})");
        $regionId = $DATABASE->insert_id;
      } else {
        $row = $result->fetch_assoc();
        $regionId = $row["id"];
      }

      // Get joint source-region language
      $result = query("SELECT *
        FROM jointsources_regions_langs_summary
        WHERE jointsource_id = {$jointSourceId}
          AND lang = {$langEncoded}
          AND region_id = {$regionId}
        LIMIT 1;");

      if ($result->num_rows == 0) {
        query("INSERT INTO jointsources_regions_langs
          (`jointsource_id`, `lang`, `author_id`)
          VALUES ({$jointSourceId}, {$langEncoded}, {$accountId});");
        $langId = $DATABASE->insert_id;

        // Set initial state
        insertJointSourceMetaRegionLanguageState($langId, $state);

      } else {
        $row = $result->fetch_assoc();
        $langId = $row["lang_id"];

        if (decodeState($row["state"]) != $state) {
          // Update existing state
          insertJointSourceMetaRegionLanguageState($langId, $state);
        }
        if ($region == $row["region"]) {
          continue;
        }
      }

      // Add new revision
      query("INSERT INTO jointsources_regions_langs_revs
        (`lang_id`, `author_id`, `region_id`)
        VALUES ({$langId}, {$accountId}, {$regionId});");

    }

    releaseDatabaseTransaction();

  }

  /**
   * Inserts a new state for the language-specific region.
   */
  function insertJointSourceMetaRegionLanguageState($langId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    $result = query("INSERT INTO jointsources_regions_langs_states
      (`lang_id`, `state`, `author_id`)
      VALUES ({$langId}, {$stateEncoded}, {$accountId});");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  /**
   * Puts the language-specific region for the joint source.
   */
  function putJointSourceMetaRegion($jointSourceId, $metaRegion) {

    retainDatabaseTransaction();

    // Add new languages to the database

    partialPutJointSourceMetaRegion($jointSourceId, $metaRegion);

    // Unpublish languages no longer listed in the content put

    $result = query("SELECT *
      FROM jointsources_regions_langs_summary
      WHERE jointsource_id = {$jointSourceId};");

    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $metaRegion)) {
        insertJointSourceMetaRegionLanguageState($row["lang_id"], STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

?>