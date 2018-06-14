<?php

  namespace ICA\JointSources;

  require_once(__DIR__ . "/../lib/integration_algolia.php");

  define("JOINTSOURCE_CONVERSATION", 1);
  define("JOINTSOURCE_RESPONSE", 2);
  define("JOINTSOURCE_DISCUSSION", 3);

  class JointSource {

    public $refereeJointSourceIds = [];

    public $referrerJointSourceIds = [];

  }

  function getJointSourceIdsByAlgoliaQueryString($queryString, $limit, &$page) {

    global $ALGOLIA_INDEX;

    if (!isset($ALGOLIA_INDEX)) return [];

    $result = $ALGOLIA_INDEX->search($queryString, [
      "attributesToRetrieve" => [
        "jointSourceId"
      ],
      "hitsPerPage" => $limit,
      "page" => $page,
      "distinct" => true
    ]);

    // Move onto next page if there are more available
    if ($result["nbPages"] == $page) $page = -1;
    elseif ($result["nbPages"] > $page) $page++;

    $jointSourceIds = [];
    foreach ($result["hits"] as $hit) {
      $jointSourceIds[] = intval($hit["jointSourceId"]);
    }

    return $jointSourceIds;

  }

  function getJointSourcesByAlgoliaQueryString($queryString, $limit, &$page) {

    $jointSourceIds = getJointSourceIdsByAlgoliaQueryString($queryString, $limit, $page);

    $jointSources = [];
    foreach ($jointSourceIds as $jointSourceId) {
      try {
        $jointSources[$jointSourceId] = getJointSourceByJointSourceId($jointSourceId);
      } catch (\Exception $e) {
        // Noop
      }
    }

    return $jointSources;

  }

  function getJointSourceByJointSourceId($jointSourceId) {

    $jointSourceType = \ICA\JointSources\retrieveJointSourceType($jointSourceId);

    $data = NULL;
    switch ($jointSourceType) {
      case JOINTSOURCE_CONVERSATION:
        $data = \ICA\Conversations\getConversation($jointSourceId);
        $data->type = "conversation";
        break;
      case JOINTSOURCE_DISCUSSION:
        $data = \ICA\Discussions\getDiscussion($jointSourceId);
        $data->type = "discussion";
        break;
      case JOINTSOURCE_RESPONSE:
        $data = \ICA\Responses\getResponse($jointSourceId);
        $data->type = "response";
        break;
    }

    return $data;

  }

  /**
   * Requests the type of joint source with id.
   */
  function retrieveJointSourceType($jointSourceId) {

    $result = query("SELECT `type`
      FROM jointsources
      WHERE id = $jointSourceId
      LIMIT 1;");

    if ($result->num_rows == 0) throw new \Exception("Joint source not found");

    $data = $result->fetch_assoc();

    return $data["type"];

  }

  /**
   * Request new storage space for joint source.
   */
  function requestJointSourceId($jointSourceType = 0) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new joint source
    query("INSERT INTO jointsources
      (`author_id`, `type`)
      VALUES ($accountId, $jointSourceType);");

    $jointSourceId = $DATABASE->insert_id;
    return $jointSourceId;

  }

  /**
   * Inserts a new state for the specified joint source.
   */
  function insertJointSourceState($jointSourceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);

    query("INSERT INTO jointsources_states
      (`jointsource_id`, `author_id`, `state`)
      VALUES ($jointSourceId, $accountId, $stateEncoded);");
    $stateId = $DATABASE->insert_id;

    return $stateId;

  }

  // References

  function insertReferenceState($referenceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);
    query("INSERT INTO references_states
      (`reference_id`, `author_id`, `state`)
      VALUES ($referenceId, $accountId, $stateEncoded);");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  function partialPutReference($refereeJointSourceId, $referrerJointSourceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = query("SELECT *
      FROM references_summary
      WHERE referee_jointsource_id = $refereeJointSourceId
        AND referrer_jointsource_id = $referrerJointSourceId;");

    if ($result->num_rows == 0) {
      query("INSERT INTO `references`
        (`referee_jointsource_id`, `referrer_jointsource_id`, `author_id`)
        VALUES ($refereeJointSourceId, $referrerJointSourceId, $accountId);");
      $referenceId = $DATABASE->insert_id;

      // Set initial state
      insertReferenceState($referenceId, $state);
    } else {
      $row = $result->fetch_assoc();
      $referenceId = $row["reference_id"];

      if (decodeState($row["state"]) != $state) {
        // Update existing state
        insertReferenceState($referenceId, $state);
      }
    }

    return $referenceId;

  }

  function getRefereeJointSourceIds($referrerJointSourceId, $state = STATE_PUBLISHED) {

    $stateEncoded = encodeState($state);

    $result = query("SELECT referee_jointsource_id
      FROM references_summary
      WHERE referrer_jointsource_id = $referrerJointSourceId
        AND state = $stateEncoded;");

    $data = [];
    while ($row = $result->fetch_assoc()) {
      array_push($data, $row["referee_jointsource_id"]);
    }

    return $data;

  }

  function partialPutRefereeJointSourceIds($refereeJointSourceIds, $referrerJointSourceId, $state = STATE_PUBLISHED) {

    retainDatabaseTransaction();

    foreach ($refereeJointSourceIds as $refereeJointSourceId) {
      partialPutReference($refereeJointSourceId, $referrerJointSourceId, $state);
    }

    releaseDatabaseTransaction();

  }

  function putRefereeJointSourceIds($refereeJointSourceIds, $referrerJointSourceId, $state = STATE_PUBLISHED) {

    retainDatabaseTransaction();

    partialPutRefereeJointSourceIds($refereeJointSourceIds, $referrerJointSourceId, $state);

    $result = query("SELECT *
      FROM references_summary
      WHERE referrer_jointsource_id = $referrerJointSourceId;");

    while ($row = $result->fetch_assoc()) {
      if (!in_array($row["referee_jointsource_id"], $refereeJointSourceIds)) {
        partialPutReference($row["referee_jointsource_id"], $referrerJointSourceId, STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

  function getReferrerJointSourceIds($refereeJointSourceId, $state = STATE_PUBLISHED) {

    $stateEncoded = encodeState($state);

    $result = query("SELECT referrer_jointsource_id
      FROM references_summary
      WHERE referee_jointsource_id = $refereeJointSourceId
      AND state = $stateEncoded;");

    $data = [];
    while ($row = $result->fetch_assoc()) {
      array_push($data, $row["referrer_jointsource_id"]);
    }

    return $data;

  }

  function partialPutReferrerJointSourceIds($referrerJointSourceIds, $refereeJointSourceId, $state = STATE_PUBLISHED) {

    retainDatabaseTransaction();

    foreach ($referrerJointSourceIds as $referrerJointSourceId) {
      partialPutReference($refereeJointSourceId, $referrerJointSourceId, $state);
    }

    releaseDatabaseTransaction();

  }

  function putReferrerJointSourceIds($referrerJointSourceIds, $refereeJointSourceId, $state = STATE_PUBLISHED) {

    retainDatabaseTransaction();

    partialPutReferrerJointSourceIds($referrerJointSourceIds, $refereeJointSourceId, $state);

    $result = query("SELECT *
        FROM references_summary
        WHERE referee_jointsource_id = $refereeJointSourceId;");

    while ($row = $result->fetch_assoc()) {
      if (!in_array($row["referrer_jointsource_id"], $referrerJointSourceIds)) {
        partialPutReference($refereeJointSourceId, $row["referrer_jointsource_id"], STATE_UNPUBLISHED);
      }
    }

    releaseDatabaseTransaction();

  }

?>
