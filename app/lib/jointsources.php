<?php

  namespace ICA\JointSources;

  define("JOINTSOURCE_CONVERSATION", 1);
  define("JOINTSOURCE_RESPONSE", 2);
  define("JOINTSOURCE_DISCUSSION", 3);

  class JointSource {

    public $refereeJointSourceIds = [];

    public $referrerJointSourceIds = [];

  }

  /**
   * Request new storage space for joint source.
   */
  function requestJointSourceId($jointSourceType = 0) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new joint source
    $result = query("INSERT INTO jointsources
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

    $result = query("INSERT INTO jointsources_states
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
    $result = query("INSERT INTO references_states
      (`reference_id`, `author_id`, `state`)
      VALUES ($referenceId, $accountId, $stateEncoded);");

    $stateId = $DATABASE->insert_id;
    return $stateId;

  }

  function touchReference($refereeJointSourceId, $referrerJointSourceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = query("SELECT *
      FROM references_summary
      WHERE referee_jointsource_id = $refereeJointSourceId
        AND referrer_jointsource_id = $referrerJointSourceId;");

    if ($result->num_rows == 0) {
      $result = query("INSERT INTO `references`
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

?>
