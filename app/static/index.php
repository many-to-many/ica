<?php try {

  require_once(__DIR__ . "/init.php");

  if (list($fileId) = handle([REQUEST_PARAMETER], true)) {
    $file = \ICA\Files\getFile($fileId);
    if (!$file) throw new Exception("File not found");

    preg_match("/([^\/]+)\/([^\/]+)/", $file->mime, $matches);

    switch ($matches[1]) {
      case "image":
        // Check if request needs image resizing
        if (isset($_GET["width"]) || isset($_GET["height"])) {
          $width = isset($_GET["width"]) ? intval($_GET["width"]) : 0;
          $height = isset($_GET["height"]) ? intval($_GET["height"]) : 0;

          $path = DIR_ROOT . "/cache/{$file->path}/{$width}x{$height}";
          // Resize the image if not already made available
          $imageFunctionPairs = [
            "jpeg" => ["imagecreatefromjpeg", "imagejpeg"]
          ];

          if (file_exists($path)) {
            respondFile($path, $file->mime);
          } elseif (array_key_exists($matches[2], $imageFunctionPairs)) {
            $src = $imageFunctionPairs[$matches[2]][0](DIR_ROOT . "/data/{$file->path}");

            list($imageWidth, $imageHeight) = getimagesize(DIR_ROOT . "/data/{$file->path}");
            if ($width <= 0 && $height > 0) {
              $width = $imageWidth * $height / $imageHeight;
            } elseif ($height <= 0 && $width > 0) {
              $height= $width * $imageHeight / $imageWidth;
            } elseif ($width <= 0 && $height <= 0) {
              $width = $imageWidth;
              $height = $imageHeight;
            }
            $dst = imagecreatetruecolor($width, $height);
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $width, $height, $imageWidth, $imageHeight);

            if (!is_dir(DIR_ROOT . "/cache/{$file->path}")
              && !mkdir(DIR_ROOT . "/cache/{$file->path}", 0755, true)) {
              throw new Exception("Unable to create directory structure");
            }

            $imageFunctionPairs[$matches[2]][1]($dst, $path);
            respondFile($path, $file->mime);
          }
        }
    }


    // Serve original file
    respondFile(DIR_ROOT . "/data/{$file->path}", $file->mime);

  }

  throw new Exception(sprintf("Unhandled request: /%s/",
    implode("/", $REQUEST_PATH)));

} catch (Exception $e) {

  exit("Error: " . (isset($e) && $e ? $e->getMessage() : ""));

} ?>
