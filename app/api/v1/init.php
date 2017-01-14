<?php

  require_once(__DIR__ . "/../init.php");
  require_once(DIR_ROOT . "/lib/query-handler.php");

  // Serializing the output to JSON
  header("Content-Type: application/json");

  $REQUEST_METHOD = $_SERVER["REQUEST_METHOD"] ?: "GET";

?>
