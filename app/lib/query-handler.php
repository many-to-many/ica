<?php

  define("REQUEST_PARAMETER", "$");

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

  function respondHeaderResponseCode($code, $text) {
    $protocol = isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0';
    header("{$protocol} {$code} {$text}");
  }

  function respondJSON($data) {

    exit(json_encode($data));

  }

  function respondFile($path, $mime) {

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

    $handler = fopen($path, 'r');
    fseek($handler, $offset);
    $data = fread($handler, $length);
    fclose($handler);

    header('Content-Length: ' . $length);
    header('Content-Type: ' . $mime);
    header('Accept-Ranges: bytes');

    print($data);
    flush();

    exit();

  }

  $REQUEST_PATH = array_filter(explode("/", strtolower($_GET["q"])), function ($value) {
    return $value;
  });

?>
