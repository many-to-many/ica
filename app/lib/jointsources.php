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

?>
