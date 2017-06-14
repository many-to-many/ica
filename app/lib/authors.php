<?php

  namespace ICA\Authors;

  class Author {

    public $name = "";

  }

  /**
   * Returns a list of Author instances created according to the result from a database query from `accounts`
   */
  function createAuthorsFromQueryResult($result) {

    if ($result->num_rows == 0) return [];

    $data = [];
    // Iterate through authors
    while ($row = $result->fetch_assoc()) {
      $authorId = $row["id"];

      if (empty($data[$authorId])) {
        $author = new Author;
        $data[$authorId] = $author;
      } else {
        $author = $data[$authorId];
      }

      // Populate data from db
      $author->name = $row["name"];
    }
    return $data;

  }

  function getAuthor($authorId) {

    $result = query("SELECT *
      FROM accounts
      WHERE id = $authorId;");

    if ($result->num_rows == 0) return NULL;
    return createAuthorsFromQueryResult($result)[$authorId];

  }

?>
