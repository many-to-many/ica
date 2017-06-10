<?php

  require_once(DIR_ROOT . "/lib/shared.php");
  require_once(DIR_ROOT . "/lib/authors.php");

  if (list($authorId) = handle("authors/{}")) switch ($REQUEST_METHOD) {

    case "GET":

      respondJSON(\ICA\Authors\getAuthor($authorId));

      break;

  }

?>
