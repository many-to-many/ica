<?php

  require_once(DIR_ROOT . "/lib/shared.php");
  require_once(DIR_ROOT . "/lib/themes.php");

  if (handle(["themes"])) switch ($REQUEST_METHOD) {

    case "GET":

      respondJSON(\ICA\Themes\getThemesByFrequency());

      break;

  }

?>