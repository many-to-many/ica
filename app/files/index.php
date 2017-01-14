<?php try {

  require_once(__DIR__ . "/init.php");

  if (list($fileId) = handle([REQUEST_PARAMETER], true)) {
    $file = \ICA\Files\getFile($fileId);
    if (!$file) throw new Exception("File not found");

    respondFile($file);

  }

  throw new Exception(sprintf("Unhandled request: /%s/",
    implode("/", $REQUEST_PATH)));

} catch (Exception $e) {

  exit("Error: " . (isset($e) && $e ? $e->getMessage() : ""));

} ?>
