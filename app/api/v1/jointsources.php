<?php

  require_once(DIR_ROOT . "/lib/conversations.php");
  require_once(DIR_ROOT . "/lib/discussions.php");
  require_once(DIR_ROOT . "/lib/responses.php");

  if (list($jointSourceId) = handle("jointsources/{i}")) switch ($REQUEST_METHOD) {

    case "GET":

      $data = NULL;

      $jointSourceType = \ICA\JointSources\retrieveJointSourceType($jointSourceId);

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

      respondJSON($data);

      break;

  } else if (list($jointSourceId) = handle("jointsources/{i}/responses")
    ?: handle("conversations/{i}/responses")
    ?: handle("responses/{i}/responses")
    ?: handle("discussions/{i}/responses")) switch ($REQUEST_METHOD) {

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

  } else if (list($jointSourceId) = handle("jointsources/{i}/discussions")
    ?: handle("conversations/{i}/discussions")
      ?: handle("responses/{i}/discussions")
        ?: handle("discussions/{i}/discussions")) switch ($REQUEST_METHOD) {

    case "GET":

      $limit = 40;

      if (!empty($_SERVER["HTTP_X_ICA_STATE"])) {
        $data = \ICA\Discussions\getJointSourceDiscussions($jointSourceId, $limit, $_SERVER["HTTP_X_ICA_STATE"]);
      } else {
        $data = \ICA\Discussions\getJointSourceDiscussions($jointSourceId, $limit);
      }

      // There is probably more data available
      if (count($data) == $limit) {
        end($data); // Move the internal pointer to the end of the array
        header("X-ICA-State-Next: " . key($data));
      }

      respondJSON($data);

      break;

  } else if (list($jointSourceId) = handle("jointsources/{i}/refereeJointSourceIds")
    ?: handle("conversations/{i}/refereeJointSourceIds")
    ?: handle("responses/{i}/refereeJointSourceIds")
    ?: handle("discussions/{i}/refereeJointSourceIds")) switch ($REQUEST_METHOD) {

    case "GET":

      $data = \ICA\JointSources\getRefereeJointSourceIds($jointSourceId);

      respondJSON($data);

      break;

  } else if (list($jointSourceId) = handle("jointsources/{i}/referrerJointSourceIds")
    ?: handle("conversations/{i}/referrerJointSourceIds")
    ?: handle("responses/{i}/referrerJointSourceIds")
    ?: handle("discussions/{i}/referrerJointSourceIds")) switch ($REQUEST_METHOD) {

    case "GET":

      $data = \ICA\JointSources\getReferrerJointSourceIds($jointSourceId);

      respondJSON($data);

      break;

  }


?>
