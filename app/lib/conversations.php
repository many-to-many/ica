<?php

  namespace ICA\Conversations;

  require_once(__DIR__ . "/common.php");
  require_once(__DIR__ . "/contents.php");
  require_once(__DIR__ . "/sources.php");
  require_once(__DIR__ . "/jointsources.php");

  /**
   * Abstract for conversation.
   */
  class Conversation extends \ICA\JointSources\JointSource {

    public $meta = [];

  }

  /**
   * Returns a list of Conversation instances created according to the result from a database query from `conversations`.
   */
  function createConversationsFromQueryResult($result) {

    if ($result->num_rows == 0) return [];

    $data = [];
    // Iterate through conversations
    while ($row = $result->fetch_assoc()) {
      $conversationId = $row["conversation_id"];
      if (empty($data[$conversationId])) {
        $conversation = new Conversation;

        // Populating metadata from the database
        $conversation->meta["title"] = getConversationMetaTitleOfLatestRevision($row["title_id"]);
        $conversation->meta["intro"] = getConversationMetaIntroOfLatestRevision($row["intro_id"]);
        $conversation->meta["themes"] = getConversationMetaThemesOfLatestRevision($conversationId);
        $conversation->meta["participants"] = getConversationMetaParticipantsOfLatestRevision($conversationId);
        $conversation->meta["region"] = getConversationMetaRegionOfLatestRevision($conversationId);
        $conversation->meta["others"] = getConversationMetaOthersOfLatestRevision($row["others_id"]);

        // Run all sources joint by conversation
        $conversation->sources = \ICA\Sources\getSources($conversationId);

        $data[$conversationId] = $conversation;
      }
    }
    return $data;

  }

  /**
   * Returns a list of Conversation instances which title contains the query text.
   */
  function getConversationsByMetaTitle($q, $limit = 200, $underConversationId = NULL) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT conversation.*
      FROM conversations_summary AS conversation
      INNER JOIN contents_langs_summary AS lang
        ON lang.content_id = conversation.title_id AND
          lang.state = {$stateEncoded} AND
          lang.content LIKE '%{$q}%'
      WHERE conversation.state = {$stateEncoded}
        " . ($underConversationId ? "AND conversation_id < {$underConversationId}" : "") . "
      ORDER BY conversation_id DESC
      LIMIT {$limit};");

    return createConversationsFromQueryResult($result);

  }

  /**
   * Returns a list of most recent Conversation instances.
   */
  function getConversations($limit = 200, $underConversationId = NULL) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM conversations_summary
      WHERE state = {$stateEncoded}
        " . ($underConversationId ? "AND conversation_id < {$underConversationId}" : "") . "
      ORDER BY conversation_id DESC
      LIMIT {$limit};");

    return createConversationsFromQueryResult($result);

  }

  function getConversation($conversationId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM conversations_summary
      WHERE conversation_id = $conversationId
        AND state = $stateEncoded;");

    if ($result->num_rows == 0) throw new \Exception("Conversation not found");

    return createConversationsFromQueryResult($result)[$conversationId];

  }

  /**
   * Inserts a new conversation record into the database.
   */
  function insertConversation($conversation, $state = STATE_PUBLISHED) {

    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    // Request conversation id
    $conversationId = \ICA\JointSources\requestJointSourceId(JOINTSOURCE_CONVERSATION);

    // Request content versioning unit id
    $titleId = \ICA\Contents\requestContentId();
    $introId = \ICA\Contents\requestContentId();
    $othersId = \ICA\Contents\requestContentId();

    // Create a new conversation
    query("INSERT INTO conversations
      (`id`, `title_id`, `intro_id`, `others_id`, `author_id`)
      VALUES ($conversationId, $titleId, $introId, $othersId, $accountId);");

    insertConversationState($conversationId, $state);

    if (!empty($conversation->meta["title"])) partialPutConversationMetaTitle($titleId, $conversation->meta["title"]);
    if (!empty($conversation->meta["intro"])) partialPutConversationMetaIntro($introId, $conversation->meta["intro"]);
    if (!empty($conversation->meta["themes"])) partialPutConversationMetaThemes($conversationId, $conversation->meta["themes"]);
    if (!empty($conversation->meta["participants"])) partialPutConversationMetaParticipants($conversationId, $conversation->meta["participants"]);
    if (!empty($conversation->meta["region"])) partialPutConversationMetaRegion($conversationId, $conversation->meta["region"]);
    if (!empty($conversation->meta["others"])) partialPutConversationMetaOthers($othersId, $conversation->meta["others"]);

    releaseDatabaseTransaction();

    return $conversationId;

  }

  /**
   * Inserts a new state for the specified conversation.
   */
  function insertConversationState($conversationId, $state = STATE_PUBLISHED) {

    return \ICA\JointSources\insertJointSourceState($conversationId, $state);

  }

  /**
   * Partially puts the meta for the specified conversation.
   */
  function partialPutConversationMeta($conversationId, $meta) {

    $result = query("SELECT *
      FROM conversations
      WHERE id = {$conversationId};");
    if ($result->num_rows == 0) {
      return false; // conversation not found
    }

    $row = $result->fetch_assoc();

    retainDatabaseTransaction();

    if (!empty($meta["title"])) partialPutConversationMetaTitle($row["title_id"], $meta["title"]);
    if (!empty($meta["intro"])) partialPutConversationMetaIntro($row["intro_id"], $meta["intro"]);
    if (!empty($meta["themes"])) partialPutConversationMetaThemes($conversationId, $meta["themes"]);
    if (!empty($meta["participants"])) partialPutConversationMetaParticipants($conversationId, $meta["participants"]);
    if (!empty($meta["region"])) partialPutConversationMetaRegion($conversationId, $meta["region"]);
    if (!empty($meta["others"])) partialPutConversationMetaOthers($row["others_id"], $meta["others"]);

    releaseDatabaseTransaction();

  }

  /**
   * Puts the meta for the specified conversation.
   */
  function putConversationMeta($conversationId, $meta) {

    $result = query("SELECT *
      FROM conversations
      WHERE id = {$conversationId};");
    if ($result->num_rows == 0) {
      return false; // conversation not found
    }

    $row = $result->fetch_assoc();

    retainDatabaseTransaction();

    if (!empty($meta["title"])) putConversationMetaTitle($row["title_id"], $meta["title"]);
    if (!empty($meta["intro"])) putConversationMetaIntro($row["intro_id"], $meta["intro"]);
    if (!empty($meta["themes"])) putConversationMetaThemes($conversationId, $meta["themes"]);
    if (!empty($meta["participants"])) putConversationMetaParticipants($conversationId, $meta["participants"]);
    if (!empty($meta["region"])) putConversationMetaRegion($conversationId, $meta["region"]);
    if (!empty($meta["others"])) putConversationMetaOthers($row["others_id"], $meta["others"]);

    releaseDatabaseTransaction();

  }

  /**
   * Conversation meta title
   */

  /**
   * Returns the latest revision of the title.
   */
  function getConversationMetaTitleOfLatestRevision($titleId) {
    return \ICA\Contents\getContentLanguagesOfLatestRevision($titleId);
  }

  /**
   * Partially puts a new meta title with the content id of the title.
   */
  function partialPutConversationMetaTitle($titleId, $metaTitle) {
    \ICA\Contents\partialPutContentLanguages($titleId, $metaTitle);
  }

  /**
   * Puts a new meta title with the content id of the title.
   */
  function putConversationMetaTitle($titleId, $metaTitle) {
    \ICA\Contents\putContentLanguages($titleId, $metaTitle);
  }

  /**
   * Conversation meta introduction
   */

  /**
   * Returns the latest revision of the introduction.
   */
  function getConversationMetaIntroOfLatestRevision($introId) {
    return \ICA\Contents\getContentLanguagesOfLatestRevision($introId);
  }

  /**
   * Partially puts a new meta introduction with the content id of the text.
   */
  function partialPutConversationMetaIntro($introId, $metaIntro) {
    \ICA\Contents\partialPutContentLanguages($introId, $metaIntro);
  }

  /**
   * Puts a new meta introduction with the content id of the text.
   */
  function putConversationMetaIntro($introId, $metaTitle) {
    \ICA\Contents\putContentLanguages($introId, $metaTitle);
  }

  /**
   * Conversation meta theme delegations
   */

  /**
   * Returns the latest revision of the cluster of themes.
   */
  function getConversationMetaThemesOfLatestRevision($conversationId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM conversations_themes_summary
      WHERE conversation_id = {$conversationId}
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
   * Partially puts the cluster of themes for the conversation.
   */
  function partialPutConversationMetaThemes($conversationId, $metaThemes, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

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

        // Get conversation-theme delegate
        $result = query("SELECT *
          FROM conversations_themes_summary
          WHERE conversation_id = {$conversationId}
            AND lang = {$langEncoded}
            AND theme_id = {$themeId}
          LIMIT 1;");

        if ($result->num_rows == 0) {
          query("INSERT INTO conversations_themes
            (`conversation_id`, `theme_id`, `lang`, `author_id`)
            VALUES ({$conversationId}, {$themeId}, {$langEncoded}, {$accountId})");
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
        insertConversationMetaThemeState($delegId, $state);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Inserts a new state for the theme.
   */
  function insertConversationMetaThemeState($delegId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    query("INSERT INTO conversations_themes_states
      (`deleg_id`, `state`, `author_id`)
      VALUES ({$delegId}, {$stateEncoded}, {$accountId});");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  /**
   * Puts the cluster of themes for the conversation.
   */
  function putConversationMetaThemes($conversationId, $metaThemes) {

    retainDatabaseTransaction();

    // Add new languages to the database

    partialPutConversationMetaThemes($conversationId, $metaThemes);

    // Unpublish languages no longer listed in the content put

    $result = query("SELECT *
      FROM conversations_themes_summary
      WHERE conversation_id = {$conversationId};");

    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $metaThemes)
        || !in_array($row["theme"], $metaThemes[$lang])) {
        $delegId = $row["deleg_id"];
        insertConversationMetaThemeState($delegId, STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Conversation meta participant delegations
   */

  /**
   * Returns the latest revision of the cluster of participants.
   */
  function getConversationMetaParticipantsOfLatestRevision($conversationId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM conversations_participants_summary
      WHERE conversation_id = {$conversationId}
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
   * Partially puts the cluster of participants for the conversation.
   */
  function partialPutConversationMetaParticipants($conversationId, $metaParticipants, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

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

        // Get conversation-participant delegate
        $result = query("SELECT *
          FROM conversations_participants_summary
          WHERE conversation_id = {$conversationId}
            AND lang = {$langEncoded}
            AND participant_id = {$participantId}
          LIMIT 1;");

        if ($result->num_rows == 0) {
          query("INSERT INTO conversations_participants
            (`conversation_id`, `participant_id`, `lang`, `author_id`)
            VALUES ({$conversationId}, {$participantId}, {$langEncoded}, {$accountId})");
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
        insertConversationMetaParticipantState($delegId, $state);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Inserts a new state for the participant.
   */
  function insertConversationMetaParticipantState($delegId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    query("INSERT INTO conversations_participants_states
      (`deleg_id`, `state`, `author_id`)
      VALUES ({$delegId}, {$stateEncoded}, {$accountId});");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  /**
   * Puts the cluster of participants for the conversation.
   */
  function putConversationMetaParticipants($conversationId, $metaParticipants) {

    retainDatabaseTransaction();

    // Add new languages to the database

    partialPutConversationMetaParticipants($conversationId, $metaParticipants);

    // Unpublish languages no longer listed in the content put

    $result = query("SELECT *
      FROM conversations_participants_summary
      WHERE conversation_id = {$conversationId};");

    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $metaParticipants)
        || !in_array($row["participant"], $metaParticipants[$lang])) {
        $delegId = $row["deleg_id"];
        insertConversationMetaParticipantState($delegId, STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Conversation meta region
   */

  /**
   * Returns the latest revision of the language-specific regions.
   */
  function getConversationMetaRegionOfLatestRevision($conversationId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM conversations_regions_langs_summary
      WHERE conversation_id = {$conversationId}
        AND state = {$stateEncoded};");

    $region = [];
    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      $region[$lang] = $row["region"];
    }
    return $region;

  }

  /**
   * Partially puts the language-specific regions for the conversation.
   */
  function partialPutConversationMetaRegion($conversationId, $metaRegion, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

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

      // Get conversation-region language
      $result = query("SELECT *
        FROM conversations_regions_langs_summary
        WHERE conversation_id = {$conversationId}
          AND lang = {$langEncoded}
          AND region_id = {$regionId}
        LIMIT 1;");

      if ($result->num_rows == 0) {
        query("INSERT INTO conversations_regions_langs
          (`conversation_id`, `lang`, `author_id`)
          VALUES ({$conversationId}, {$langEncoded}, {$accountId});");
        $langId = $DATABASE->insert_id;

        // Set initial state
        insertConversationMetaRegionLanguageState($langId, $state);

      } else {
        $row = $result->fetch_assoc();
        $langId = $row["lang_id"];

        if (decodeState($row["state"]) != $state) {
          // Update existing state
          insertConversationMetaRegionLanguageState($langId, $state);
        }
        if ($region == $row["region"]) {
          continue;
        }
      }

      // Add new revision
      query("INSERT INTO conversations_regions_langs_revs
        (`lang_id`, `author_id`, `region_id`)
        VALUES ({$langId}, {$accountId}, {$regionId});");

    }

    releaseDatabaseTransaction();

  }

  /**
   * Inserts a new state for the language-specific region.
   */
  function insertConversationMetaRegionLanguageState($langId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    query("INSERT INTO conversations_regions_langs_states
      (`lang_id`, `state`, `author_id`)
      VALUES ({$langId}, {$stateEncoded}, {$accountId});");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  /**
   * Puts the language-specific region for the conversation.
   */
  function putConversationMetaRegion($conversationId, $metaRegion) {

    retainDatabaseTransaction();

    // Add new languages to the database

    partialPutConversationMetaRegion($conversationId, $metaRegion);

    // Unpublish languages no longer listed in the content put

    $result = query("SELECT *
      FROM conversations_regions_langs_summary
      WHERE conversation_id = {$conversationId};");

    while ($row = $result->fetch_assoc()) {
      $lang = decodeLang($row["lang"]);
      if (!array_key_exists($lang, $metaRegion)) {
        insertConversationMetaRegionLanguageState($row["lang_id"], STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

  /**
   * Conversation meta other reflections
   */

  /**
   * Returns the latest revision of the other reflections.
   */
  function getConversationMetaOthersOfLatestRevision($othersId) {
    return \ICA\Contents\getContentLanguagesOfLatestRevision($othersId);
  }

  /**
   * Partially puts a new meta other reflections with the content id of the text.
   */
  function partialPutConversationMetaOthers($othersId, $metaOthers) {
    \ICA\Contents\partialPutContentLanguages($othersId, $metaOthers);
  }

  /**
   * Puts a new meta other reflections with the content id of the text.
   */
  function putConversationMetaOthers($othersId, $metaOthers) {
    \ICA\Contents\putContentLanguages($othersId, $metaOthers);
  }

  function fixConversationMetaOthers() {

    retainDatabaseTransaction();

    $result = query("SELECT * FROM conversations WHERE others_id = 0;");
    while ($row = $result->fetch_assoc()) {
      $othersId = \ICA\Contents\requestContentId();
      query("UPDATE conversations SET others_id = {$othersId} WHERE id = {$row['id']}");
    }

    releaseDatabaseTransaction();

  }

?>
