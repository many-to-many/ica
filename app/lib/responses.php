<?php

  namespace ICA\Responses;

  require_once(__DIR__ . "/shared.php");
  require_once(__DIR__ . "/contents.php");
  require_once(__DIR__ . "/jointsources.php");

  /**
   * Abstract for response.
   */
  class Response {

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
        $response->message = getResponseMessageOfLatestRevision($row["response_message_id"]);

        // Readonly data
        $response->_authorId = $row["response_author_id"];
        $response->_timestampAuthored = time($row["response_authored"]);

        // NB: Useful here for less work from client requesting referee joint source id's additionally
        $response->refereeJointSourceIds = \ICA\JointSources\getRefereeJointSourceIds($responseId);

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
    $result = query("INSERT INTO responses
      (`id`, `message_id`, `author_id`)
      VALUES ($responseId, $messageId, $accountId);");

    $stateId = insertResponseState($responseId, $state);

    if (!empty($response->message)) partialPutResponseMessage($messageId, $response->message);

    releaseDatabaseTransaction();

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

    putResponseMessage($row["message_id"], $response->message);

  }

  /**
   * Inserts a new state for the specified response.
   */
  function insertResponseState($responseId, $state = STATE_PUBLISHED) {

    \ICA\JointSources\insertJointSourceState($responseId, $state);

  }

  function getResponseMessageOfLatestRevision($messageId) {
    return \ICA\Contents\getContentLanguagesOfLatestRevision($messageId);
  }

  function partialPutResponseMessage($messageId, $message) {
    \ICA\Contents\partialPutContentLanguages($messageId, $message);
  }

  function putResponseMessage($messageId, $message) {
    \ICA\Contents\partialPutContentLanguages($messageId, $message);
  }

?>
