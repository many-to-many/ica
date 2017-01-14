<?php

  require_once(DIR_ROOT . "/lib/files.php");

  if (handle(["files"])) switch ($REQUEST_METHOD) {

    case "POST": \Session\requireVerification();

      $mime = $_SERVER["CONTENT_TYPE"];
      if (!in_array($mime, [
        "audio/mpeg",
        "audio/x-m4a"
      ])) {
        throw new Exception("Unhandled content type: " . $mime);
      }

      $DATABASE->autocommit(false);

      $accountId = \Session\getAccountId();
      $year = date("Y");
      $month = date("m");
      $day = date("d");
      $uid = uniqid();
      $dir = "$year/$month/$day";
      $path = "$dir/$uid";

      $fileId = \ICA\Files\insertFile($path, $mime);

      if (!is_dir(DIR_ROOT . "/accounts/$accountId/files/$dir")
        && !mkdir(DIR_ROOT . "/accounts/$accountId/files/$dir", 0755, true)) {
        throw new Exception("Unable to create directory structure");
      }

      $input = fopen("php://input", "r");
      $output = fopen(DIR_ROOT . "/accounts/$accountId/files/$path", "w");
      while (!feof($input)) {
        $chunk = fread($input, 1024 * 1024); // 1 MB chunks
        fwrite($output, $chunk);
      }
      fclose($input);
      fclose($output);

      $result = $DATABASE->commit();
      if (empty($result)) throw new \Exception($DATABASE->error);

      respondJSON($fileId);

      break;

  } elseif (list($fileId) = handle(["files", REQUEST_PARAMETER])) switch ($REQUEST_METHOD) {

    case "GET":

      $file = \ICA\Files\getFile($fileId);
      if (!$file) throw new Exception("File not found");
      respondJSON($file);

      break;

  }

?>
