<?php

namespace {

  require_once(__DIR__ . "/init.php");

}

namespace ICA\Algolia {

  /**
   * @throws \Exception
   */
  function init() {

    $client = new \AlgoliaSearch\Client(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

    global $ALGOLIA_INDEX;
    $ALGOLIA_INDEX = $client->initIndex(ALGOLIA_INDEX);

  }

  init();

}
