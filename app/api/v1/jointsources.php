<?php

  require_once(DIR_ROOT . "/lib/responses.php");

  if (list($jointSourceId) = handle("jointsources/{}/responses")
    ?: handle("conversations/{}/responses")
    ?: handle("responses/{}/responses")) switch ($REQUEST_METHOD) {

    case "GET":

      $limit = 40;

      if (!empty($_SERVER["HTTP_X_ICA_STATE"])) {
        $data = \ICA\Responses\getJointSourceResponses($jointSourceId, $limit, $_SERVER["HTTP_X_ICA_STATE"]);
      } else {
        $data = \ICA\Responses\getJointSourceResponses($jointSourceId, $limit);
      }

      // There is probably more data available
      if (count($data) == $limit) {
        end($data); // Move the internal pointer to the end of the array
        header("X-ICA-State-Next: " . key($data));
      }

      respondJSON($data);

      break;

  } else if (list($jointSourceId) = handle("jointsources/{}/refereeJointSourceIds")
    ?: handle("conversations/{}/refereeJointSourceIds")
    ?: handle("responses/{}/refereeJointSourceIds")) switch ($REQUEST_METHOD) {

    case "GET":

      $data = \ICA\JointSources\getRefereeJointSourceIds($jointSourceId);

      respondJSON($data);

      break;

  } else if (list($jointSourceId, $refereeJointSourceId) = handle("jointsources/{}/refereeJointSourceIds/{}")
    ?: handle("conversations/{}/refereeJointSourceIds/{}")
    ?: handle("responses/{}/refereeJointSourceIds/{}")) switch ($REQUEST_METHOD) {

    case "POST":

      $data = \ICA\JointSources\touchReference($refereeJointSourceId, $jointSourceId);

      respondJSON($data);

      break;

  } else if (list($jointSourceId) = handle("jointsources/{}/referrerJointSourceIds")
    ?: handle("conversations/{}/referrerJointSourceIds")
    ?: handle("responses/{}/referrerJointSourceIds")) switch ($REQUEST_METHOD) {

    case "GET":

      $data = \ICA\JointSources\getReferrerJointSourceIds($jointSourceId);

      respondJSON($data);

      break;

  } else if (list($jointSourceId, $referrerJointSourceId) = handle("jointsources/{}/referrerJointSourceIds/{}")
    ?: handle("conversations/{}/referrerJointSourceIds/{}")
    ?: handle("responses/{}/referrerJointSourceIds/{}")) switch ($REQUEST_METHOD) {

    case "POST":

      $data = \ICA\JointSources\touchReference($jointSourceId, $referrerJointSourceId);

      respondJSON($data);

      break;

  }


?>
