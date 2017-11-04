<?php

  namespace ICA\Discussions;

  require_once(__DIR__ . "/shared.php");
  require_once(__DIR__ . "/contents.php");
  require_once(__DIR__ . "/jointsources.php");
  require_once(__DIR__ . "/responses.php");

  /**
   * Abstract for discussion.
   */
  class Discussion extends \ICA\JointSources\JointSource {

    public $title;

  }

  /**
   * Returns a list of Discussion instances created according to the result from a database query from `discussion`.
   */
  function createDiscussionsFromQueryResult($result) {

    if ($result->num_rows == 0) return [];

    $data = [];
    // Iterate through discussions
    while ($row = $result->fetch_assoc()) {
      $discussionId = $row["discussion_id"];
      if (empty($data[$discussionId])) {
        $discussion = new Discussion();

        // Populating data from the database
        $discussion->title = getDiscussionTitleOfLatestRevision(!empty($row["title_id"]) ? $row["title_id"] : $row["discussion_title_id"]);

        $data[$discussionId] = $discussion;
      }
    }
    return $data;

  }

  /**
   * Returns a list of most recent Discussion instances.
   */
  function getDiscussions($limit = 200, $underDiscussionId = NULL) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM discussions_summary
      WHERE state = $stateEncoded
        " . ($underDiscussionId ? "AND discussion_id < $underDiscussionId" : "") . "
      ORDER BY discussion_id DESC
      LIMIT $limit;");

    return createDiscussionsFromQueryResult($result);

  }

  function getDiscussion($discussionId) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT *
      FROM discussions_summary
      WHERE discussion_id = $discussionId
        AND state = $stateEncoded;");

    if ($result->num_rows == 0) throw new \Exception("Discussion not found");

    return createDiscussionsFromQueryResult($result)[$discussionId];

  }

  /**
   * Inserts a new discussion record into the database.
   */
  function insertDiscussion($discussion, $state = STATE_PUBLISHED) {

    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    // Request discussion id
    $discussionId = \ICA\JointSources\requestJointSourceId(JOINTSOURCE_DISCUSSION);

    // Request content versioning unit id
    $titleId = \ICA\Contents\requestContentId();

    // Create a new discussion
    query("INSERT INTO discussions
      (`id`, `title_id`, `author_id`)
      VALUES ($discussionId, $titleId, $accountId);");

    insertDiscussionState($discussionId, $state);

    if (!empty($discussion->title)) partialPutDiscussionTitle($titleId, $discussion->title);

    releaseDatabaseTransaction();

    return $discussionId;

  }

  /**
   * Inserts a new state for the specified discussion.
   */
  function insertDiscussionState($discussionId, $state = STATE_PUBLISHED) {

    return \ICA\JointSources\insertJointSourceState($discussionId, $state);

  }

  /**
   * Returns a list of most recent Response instances in to the discussion.
   */
  function getResponsesInDiscussion($discussionId, $limit = 200, $underResponseId) {

    $referenceStateEncoded = STATE_PUBLISHED_ENCODED;
    $responseStateEncoded = STATE_PUBLISHED_ENCODED;

    $result = query("SELECT *
      FROM responses_discussions_summary
      WHERE discussion_id = $discussionId
        AND reference_state = $referenceStateEncoded
        AND response_state = $responseStateEncoded 
        " . ($underResponseId ? "AND response_id < $underResponseId" : "") . "
      ORDER BY response_id DESC
      LIMIT $limit;");

    return \ICA\Responses\createResponsesFromQueryResult($result);

  }

  function getJointSourceDiscussions($jointSourceId, $limit = 200, $underDiscussionId = NULL) {

    $referenceStateEncoded = STATE_PUBLISHED_ENCODED;
    $discussionStateEncoded = STATE_PUBLISHED_ENCODED;

    $result = query("SELECT *
      FROM jointsources_discussions_summary
      WHERE jointsource_id = $jointSourceId
        AND reference_state = $referenceStateEncoded
        AND discussion_state = $discussionStateEncoded 
        " . ($underDiscussionId ? "AND discussion_id < $underDiscussionId" : "") . "
      ORDER BY discussion_id DESC
      LIMIT $limit;");

    return createDiscussionsFromQueryResult($result);

  }

  /**
   * Puts the meta for the specified discussion.
   */
  function putDiscussion($discussionId, $title) {

    $result = query("SELECT *
      FROM discussions
      WHERE id = $discussionId;");
    if ($result->num_rows == 0) {
      return false; // discussion not found
    }

    $row = $result->fetch_assoc();

    retainDatabaseTransaction();

    if (!empty($title)) putDiscussionTitle($row["title_id"], $title);

    releaseDatabaseTransaction();

  }

  /**
   * Discussion title
   */

  /**
   * Returns the latest revision of the title.
   */
  function getDiscussionTitleOfLatestRevision($titleId) {
    return \ICA\Contents\getContentLanguagesOfLatestRevision($titleId);
  }

  /**
   * Partially puts a new title with the content id of the title.
   */
  function partialPutDiscussionTitle($titleId, $title) {
    \ICA\Contents\partialPutContentLanguages($titleId, $title);
  }

  /**
   * Puts a new title with the content id of the title.
   */
  function putDiscussionTitle($titleId, $title) {
    \ICA\Contents\putContentLanguages($titleId, $title);
  }

?>