<?php

  namespace ICA\JointSources;

  define("JOINTSOURCE_CONVERSATION", 1);

  /**
   * Request new storage space for joint source.
   */
  function requestJointSourceId($jointSourceExt = 0) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $isConversation = $jointSourceExt & JOINTSOURCE_CONVERSATION > 0;

    // Create & save a new joint source
    $result = query("INSERT INTO jointsources
      (`author_id`, `is_conversation`)
      VALUES ($accountId, $isConversation);");

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
