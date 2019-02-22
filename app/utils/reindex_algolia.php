<?php

require_once(__DIR__ . "/../lib/jointsources.php");
require_once(__DIR__ . "/../lib/sources.php");
require_once(__DIR__ . "/../lib/integration_algolia.php");

$jointSources = \ICA\JointSources\getJointSources();

foreach ($jointSources as $jointSourceId => $jointSource) {

  switch ($jointSource->type) {
    case "conversation":

      $ALGOLIA_INDEX->partialUpdateObjects([
        array_merge($jointSource->meta["title"], [
          "objectID" => $jointSource->meta["_titleId"],
          "jointSourceId" => $jointSourceId
        ]),
        array_merge($jointSource->meta["intro"], [
          "objectID" => $jointSource->meta["_introId"],
          "jointSourceId" => $jointSourceId
        ]),
        array_merge($jointSource->meta["others"], [
          "objectID" => $jointSource->meta["_othersId"],
          "jointSourceId" => $jointSourceId
        ])
      ]);

      break;
    case "discussion":

      $ALGOLIA_INDEX->partialUpdateObjects([
        array_merge($jointSource->meta["title"], [
          "objectID" => $jointSource->meta["_titleId"],
          "jointSourceId" => $jointSourceId
        ]),
        array_merge($jointSource->meta["intro"], [
          "objectID" => $jointSource->meta["_introId"],
          "jointSourceId" => $jointSourceId
        ])
      ]);

      break;
    case "response":

      $ALGOLIA_INDEX->partialUpdateObject(
        array_merge($jointSource->message, [
          "objectID" => $jointSource->_messageId,
          "jointSourceId" => $jointSourceId
        ])
      );

      break;
  }

  $sources = \ICA\Sources\getSources($jointSourceId);

  foreach ($sources as $sourceId => $source) {

    $ALGOLIA_INDEX->partialUpdateObject(
      array_merge($source->title, [
        "objectID" => $source->_titleId,
        "sourceId" => $sourceId,
        "jointSourceId" => $jointSourceId
      ])
    );

    switch ($source->type) {
      case TYPE_TEXT:

        $ALGOLIA_INDEX->partialUpdateObject([
          "objectID" => $source->_contentId,
          LANG_0_ENCODED => $source->content[LANG_0],
          "sourceId" => $sourceId,
          "jointSourceId" => $jointSourceId
        ]);

        break;
      case TYPE_IMAGE:

        $ALGOLIA_INDEX->partialUpdateObject([
          "objectID" => $source->_contentId,
          "sourceId" => $sourceId,
          "jointSourceId" => $jointSourceId
        ]);

        if (!empty($source->content[LANG_1])) {
          $ALGOLIA_INDEX->partialUpdateObject([
            "objectID" => $source->_contentId,
            LANG_1_ENCODED => $source->content[LANG_1]
          ]);
        }

        break;
    }

  }

}
