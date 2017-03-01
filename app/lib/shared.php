<?php

  define("STATE_PUBLISHED_ENCODED", 1);
  define("STATE_PUBLISHED", "published");
  define("STATE_UNPUBLISHED_ENCODED", 2);
  define("STATE_UNPUBLISHED", "unpublished");

  define("TYPE_TEXT_ENCODED", 1);
  define("TYPE_TEXT", "text");
  define("TYPE_AUDIO_ENCODED", 2);
  define("TYPE_AUDIO", "audio");
  define("TYPE_IMAGE_ENCODED", 3);
  define("TYPE_IMAGE", "image");
  define("TYPE_VIDEO_ENCODED", 4);
  define("TYPE_VIDEO", "video");

  define("LANG_UNDEFINED_ENCODED", 0);
  define("LANG_UNDEFINED", "*");

  function encodeLang($lang) {
    switch ($lang) {
      case LANG_UNDEFINED: return LANG_UNDEFINED_ENCODED;
    }
    throw new \Exception("Unable to encode lang");
  }

  function decodeLang($code) {
    switch ($code) {
      case LANG_UNDEFINED_ENCODED: return LANG_UNDEFINED;
    }
    throw new \Exception("Unable to decode lang");
  }

  function encodeType($type) {
    switch ($type) {
      case TYPE_IMAGE: return TYPE_IMAGE_ENCODED;
      case TYPE_AUDIO: return TYPE_AUDIO_ENCODED;
      case TYPE_VIDEO: return TYPE_VIDEO_ENCODED;
      case TYPE_TEXT: return TYPE_TEXT_ENCODED;
    }
    throw new \Exception("Unable to encode type");
  }

  function decodeType($type) {
    switch ($type) {
      case TYPE_IMAGE_ENCODED: return TYPE_IMAGE;
      case TYPE_AUDIO_ENCODED: return TYPE_AUDIO;
      case TYPE_VIDEO_ENCODED: return TYPE_VIDEO;
      case TYPE_TEXT_ENCODED: return TYPE_TEXT;
    }
    throw new \Exception("Unable to decode type");
  }

  function encodeState($state) {
    switch ($state) {
      case STATE_PUBLISHED: return STATE_PUBLISHED_ENCODED;
      case STATE_UNPUBLISHED: return STATE_UNPUBLISHED_ENCODED;
    }
    throw new \Exception("Unable to encode state");
  }

  function decodeState($code) {
    switch ($code) {
      case STATE_PUBLISHED_ENCODED: return STATE_PUBLISHED;
      case STATE_UNPUBLISHED_ENCODED: return STATE_UNPUBLISHED;
    }
    throw new \Exception("Unable to decode state");
  }

?>