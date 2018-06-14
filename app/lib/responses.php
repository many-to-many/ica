<?php

  namespace ICA\Responses;

  require_once(__DIR__ . "/common.php");
  require_once(__DIR__ . "/contents.php");
  require_once(__DIR__ . "/jointsources.php");
  require_once(__DIR__ . "/../lib/integration_algolia.php");

  /**
   * Abstract for response.
   */
  class Response extends \ICA\JointSources\JointSource {

    public $message;

  }

  /**
   * Returns a list of Response instances created according to the result from a database query from `responses`.
   */
  function createResponsesFromQueryResult($result) {

    if ($result->num_rows == 0) return [];

    $data = [];
    // Iterate through responses
    while ($row = $result->fetch_assoc()) {
      $responseId = $row["response_id"];
      if (empty($data[$responseId])) {
        $response = new Response;

        // Populating metadata from the database
        $response->message = _getResponseMessageOfLatestRevision(!empty($row["message_id"]) ? $row["message_id"] : $row["response_message_id"]);

        // Readonly data
        $response->_authorId = !empty($row["author_id"]) ? $row["author_id"] : $row["response_author_id"];
        $response->_timestampAuthored = strtotime(!empty($row["authored"]) ? $row["authored"] : $row["response_authored"]);

        $response->refereeJointSourceIds = getResponseRefereeJointSourceIds($responseId);

        $data[$responseId] = $response;
      }
    }
    return $data;

  }

  /**
   * Returns a list of most recent Response instances linked to the joint source.
   */
  function getJointSourceResponses($jointSourceId, $limit = 200, $underResponseId = NULL) {

    $referenceStateEncoded = STATE_PUBLISHED_ENCODED;
    $responseStateEncoded = STATE_PUBLISHED_ENCODED;

    $result = query("SELECT *
      FROM jointsources_responses_summary
      WHERE reference_state = $referenceStateEncoded
        AND response_state = $responseStateEncoded
        AND jointsource_id = $jointSourceId
        " . ($underResponseId ? "AND response_id < $underResponseId" : "") . "
      ORDER BY response_id DESC
      LIMIT $limit;");

    return createResponsesFromQueryResult($result);

  }

  function getResponse($responseId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
        FROM responses_summary
        WHERE response_id = $responseId
          AND state = $stateEncoded;");

    if ($result->num_rows == 0) throw new \Exception("Response not found");

    return createResponsesFromQueryResult($result)[$responseId];

  }

  /**
   * Inserts a new response record into the database.
   */
  function insertResponse($response, $state = STATE_PUBLISHED) {

    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    // Request response id
    $responseId = \ICA\JointSources\requestJointSourceId(JOINTSOURCE_RESPONSE);

    // Request content versioning unit id
    $messageId = \ICA\Contents\requestContentId();

    // Create a new response
    query("INSERT INTO responses
      (`id`, `message_id`, `author_id`)
      VALUES ($responseId, $messageId, $accountId);");

    insertResponseState($responseId, $state);

    if (!empty($response->message)) _partialPutResponseMessage($messageId, $response->message);
    if (!empty($response->refereeJointSourceIds)) _partialPutResponseRefereeJointSourceIds($response->refereeJointSourceIds, $responseId);
    if (!empty($response->referrerJointSourceIds)) _partialPutResponseReferrerJointSourceIds($response->referrerJointSourceIds, $responseId);

    releaseDatabaseTransaction();

    // Integration for Algolia for indexing

    global $ALGOLIA_INDEX;

    if (isset($ALGOLIA_INDEX)) {
      $ALGOLIA_INDEX->partialUpdateObject([
        "objectID" => $messageId,
        "jointSourceId" => $responseId
      ], true);
    }

    return $responseId;

  }

  function putResponse($responseId, $response) {

    $accountId = \Session\getAccountId();

    $result = query("SELECT *
      FROM responses
      WHERE id = $responseId;");
    if ($result->num_rows == 0) {
      return false; // Response not found
    }

    $row = $result->fetch_assoc();

    if ($row["author_id"] != $accountId) {
      throw new \Exception("Account unable to update this response");
    }

    _putResponseMessage($row["message_id"], $response->message);
    _putResponseRefereeJointSourceIds($response->refereeJointSourceIds, $responseId);

  }

  /**
   * Inserts a new state for the specified response.
   */
  function insertResponseState($responseId, $state = STATE_PUBLISHED) {

    return \ICA\JointSources\insertJointSourceState($responseId, $state);

  }

  function _getResponseMessageOfLatestRevision($messageId) {
    return \ICA\Contents\getContentLanguagesOfLatestRevision($messageId);
  }

  function _partialPutResponseMessage($messageId, $message, $state = STATE_PUBLISHED) {
    \ICA\Contents\partialPutContentLanguages($messageId, $message, $state, true);
  }

  function _putResponseMessage($messageId, $message, $state = STATE_PUBLISHED) {
    \ICA\Contents\partialPutContentLanguages($messageId, $message, $state, true);
  }

  function getResponseRefereeJointSourceIds($responseId, $state = STATE_PUBLISHED) {
    return \ICA\JointSources\getRefereeJointSourceIds($responseId, $state);
  }

  function _partialPutResponseRefereeJointSourceIds($refereeJointSourceIds, $responseId, $state = STATE_PUBLISHED) {
    \ICA\JointSources\partialPutRefereeJointSourceIds($refereeJointSourceIds, $responseId, $state);
  }

  function _putResponseRefereeJointSourceIds($refereeJointSourceIds, $responseId, $state = STATE_PUBLISHED) {
    \ICA\JointSources\putRefereeJointSourceIds($refereeJointSourceIds, $responseId, $state);
  }

  function getResponseReferrerJointSourceIds($responseId, $state = STATE_PUBLISHED) {
    return \ICA\JointSources\getReferrerJointSourceIds($responseId, $state);
  }

  function _partialPutResponseReferrerJointSourceIds($referrerJointSourceIds, $responseId, $state = STATE_PUBLISHED) {
    \ICA\JointSources\partialPutReferrerJointSourceIds($referrerJointSourceIds, $responseId, $state);
  }

  function _putResponseReferrerJointSourceIds($referrerJointSourceIds, $responseId, $state = STATE_PUBLISHED) {
    \ICA\JointSources\putReferrerJointSourceIds($referrerJointSourceIds, $responseId, $state);
  }

?>
