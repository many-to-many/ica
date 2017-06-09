<?php

  define("REQUEST_PARAMETER", "{}");

  function handle($path, $wildcard = false) {

    global $REQUEST_PATH;

    // Verify path
    if (is_string($path)) $path = array_filter(explode("/", strtolower($path)), function ($value) {
      return $value;
    });
    if ($wildcard && count($REQUEST_PATH) < count($path) ||
      !$wildcard && count($REQUEST_PATH) != count($path)) return false;

    $params = [];
    $pairs = array_map(NULL, $REQUEST_PATH, $path);
    foreach ($pairs as $pair) {
      $request = $pair[0];
      $expect = $pair[1];
      if ($expect) {
        if ($expect == REQUEST_PARAMETER) $params[] = $request;
        elseif ($request != $expect) return false;
      }
    }
    return $params ? $params : true;

  }

  $HEADER_RESPONSE_CODE_RESPONDED = false;
  function respondHeaderResponseCode($code, $text) {
    global $HEADER_RESPONSE_CODE_RESPONDED;

    if (!$HEADER_RESPONSE_CODE_RESPONDED) {
      $protocol = isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0';
      header("{$protocol} {$code} {$text}");

      $HEADER_RESPONSE_CODE_RESPONDED = true;
    }
  }

  function respondJSON($data) {

    exit(json_encode($data));

  }

  function respondFile($path, $type) {

    // From: https://github.com/pomle/php-serveFilePartial/blob/master/ServeFilePartial.inc.php

    $filesize = filesize($path);

    if (isset($_SERVER['HTTP_RANGE'])) {
      preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $matches);
      $offset = $matches[1] ? intval($matches[1]) : 0;
      $length = ($matches[2] ? intval($matches[2]) : $filesize - 1) - $offset + 1;

      respondHeaderResponseCode(206, "Partial Content");
      header('Content-Range: bytes ' . $offset . '-' . ($offset + $length - 1) . '/' . $filesize);
    } else {
      $offset = 0;
      $length = $filesize;
    }

    header('Content-Length: ' . $length);
    header('Content-Type: ' . $type);
    header('Accept-Ranges: bytes');

    $handler = fopen($path, 'r');
    fseek($handler, $offset);
    while (!feof($handler) && $length > 0) {
      $bytes = min($length, 1024 * 1024); // 1 MB chunks
      print(fread($handler, $bytes));
      flush();
      $length -= $bytes;
    }
    fclose($handler);

    exit();

  }

  $REQUEST_PATH = array_filter(explode("/", strtolower($_GET["p"])), function ($value) {
    return $value;
  });

?>
