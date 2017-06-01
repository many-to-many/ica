<?php

  namespace ICA\Comments;

  /**
   * Abstract for comment.
   */
  class Comment {

    public $content = [];

  }

  /**
   * Returns a list of Comment instances created according to the result from a database query from `comments_summary`.
   */
  function createCommentsFromQueryResult($result) {

    if ($result->num_rows == 0) return [];

    $data = [];
    // Iterate through comments
    while ($row = $result->fetch_assoc()) {
      $commentId = $row["comment_id"];
      $contentId = $row["content_id"];

      if (empty($data[$commentId])) {
        $comment = new Comment;
        $data[$commentId] = $comment;
      } else {
        $comment = $data[$commentId];
      }

      $comment->content = \ICA\Contents\getContentLanguagesOfLatestRevision($contentId);
      $comment->authorId = $row["author_id"];
      $comment->timestampAuthored = $row["timestamp_authored"];
    }
    return $data;

  }

  /**
   * Inserts a new comment record into the database.
   * NB: This should be called implicitly.
   */
  function insertComment($comment, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    retainDatabaseTransaction();

    // Request content versioning unit id
    $contentId = \ICA\Contents\requestContentId();

    // Create new comment
    $result = query("INSERT INTO comments
      (`content_id`, `author_id`)
      VALUES ($contentId, $accountId);");
    $commentId = $DATABASE->insert_id;

    insertCommentState($commentId, $state);
    \ICA\Contents\partialPutContentLanguages($contentId, $comment->content);

    releaseDatabaseTransaction();

    return $commentId;

  }

  /**
   * Inserts a new state for the specified comment.
   */
  function insertCommentState($commentId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $stateEncoded = encodeState($state);

    $result = query("INSERT INTO comments_states
      (`comment_id`, `author_id`, `state`)
      VALUES ($commentId, $accountId, $stateEncoded);");
    $stateId = $DATABASE->insert_id;

    return $stateId;

  }

?>
