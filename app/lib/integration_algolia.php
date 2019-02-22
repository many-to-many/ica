<?php

namespace {

  require_once(__DIR__ . "/init.php");

}

namespace ICA\Algolia {

  function init() {

    if (!defined("ALGOLIA_APP_ID") ||
        !defined("ALGOLIA_API_KEY") ||
        !defined("ALGOLIA_INDEX")) return;

    global $ALGOLIA_INDEX;

    try {
      $client = new \AlgoliaSearch\Client(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
      $ALGOLIA_INDEX = $client->initIndex(ALGOLIA_INDEX);
    } catch (\Exception $e) {
      die("Failed to initialize Algolia integration");
    }

  }

  init();

}
