<?php try {

  require_once(__DIR__ . "/init.php");

  if (list($requestFileName) = handle([REQUEST_PARAMETER], true)) {
    list($requestFileId, $requestFileExt) = explode(".", $requestFileName);
    $file = \ICA\Files\getFile($requestFileId);
    if (!$file) throw new Exception("File not found");

    preg_match("/([^\/]+)\/([^\/]+)/", $file->mime, $matches);
    $fileType = $matches[1];
    $fileSubtype = $matches[2];

    switch ($fileType) {
      case "image":

        // Functions for image manipulation
        $imageCreateFunctions = [
          "jpeg" => "imagecreatefromjpeg",
        ];
        $imageFunctions = [
          "jpeg" => "imagejpeg"
        ];
        $requestImageSubtypesByFileExt = [
          "jpg" => "jpeg",
          "jpeg" => "jpeg"
        ];

        if (empty($requestFileExt)) {
          $requestImageSubtype = $fileSubtype;
        } elseif (array_key_exists($requestFileExt, $requestImageSubtypesByFileExt)) {
          $requestImageSubtype = $requestImageSubtypesByFileExt[$requestFileExt];
        } else {
          throw new Exception("Unsupported file extension");
        }

        $width = isset($_GET["width"]) ? intval($_GET["width"]) : 0;
        $height = isset($_GET["height"]) ? intval($_GET["height"]) : 0;

        // Path to extension-specific image cache
        $path = DIR_ROOT . "/cache/{$file->path}/{$width}x{$height}-{$requestImageSubtype}";

        if (file_exists($path)) {

          // Responds the file if already available
          respondFile($path, "image/{$requestImageSubtype}");

        } elseif (
          // If the image is convertible
          array_key_exists($fileSubtype, $imageCreateFunctions)
          && array_key_exists($requestImageSubtype, $imageFunctions)
        ) {

          // Convert and resize the image if not already made available
          $src = $imageCreateFunctions[$fileSubtype](DIR_ROOT . "/data/{$file->path}");

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
            throw new Exception("Unable to create directory for image");
          }

          $imageFunctions[$requestImageSubtype]($dst, $path);
          respondFile($path, $file->mime);

        } elseif ($requestImageSubtype == $fileSubtype) {

          // Image cannot be resampled, but type conversion unncessary
          // Serve original file
          break;

        } else {

          throw new Exception("Unsupported image type conversion");

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
