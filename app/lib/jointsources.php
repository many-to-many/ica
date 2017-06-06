<?php

  namespace ICA\JointSources;

  /**
   * Request new storage space for joint source.
   */
  function requestJointSourceId() {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new joint source
    $result = query("INSERT INTO jointsources
      (`author_id`)
      VALUES ($accountId);");

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

?>
