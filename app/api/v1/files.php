<?php

  require_once(DIR_ROOT . "/lib/files.php");

  if (handle(["files"])) switch ($REQUEST_METHOD) {

    case "POST": \Session\requireVerification();

      $mime = $_SERVER["CONTENT_TYPE"];
      if (!in_array($mime, [
        "image/jpeg",
        "audio/mpeg",
        "audio/x-m4a"
      ])) {
        throw new Exception("Unhandled content type: " . $mime);
      }

      $accountId = \Session\getAccountId();
      $year = date("Y");
      $month = date("m");
      $uid = uniqid();
      $dir = "$accountId/$year/$month";
      $path = "$dir/$uid";

      if (!is_dir(DIR_ROOT . "/data/$dir")
        && !mkdir(DIR_ROOT . "/data/$dir", 0755, true)) {
        throw new Exception("Unable to create directory structure");
      }

      $input = fopen("php://input", "r");
      $output = fopen(DIR_ROOT . "/data/$path", "w");
      while (!feof($input)) {
        $chunk = fread($input, 1024 * 1024); // 1 MB chunks
        fwrite($output, $chunk);
      }
      fclose($input);
      fclose($output);

      $file = new \ICA\Files\File;
      $file->path = $path;
      $file->mime = $mime;

      $fileId = \ICA\Files\insertFile($file);

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
