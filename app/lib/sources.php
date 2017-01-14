<?php

  namespace ICA\Sources;

  define("STATE_PUBLISHED", 1);
  define("STATE_UNPUBLISHED", 2);

  define("SOURCE_TYPE_TEXT", 1);
  define("SOURCE_TYPE_AUDIO", 2);

  class JointSource {

    public $revision;

    public function __construct() {
      $this->revision = new JointSourceRevision;
    }

  }

  class JointSourceRevision {

    public $meta;

    public function encodeMeta() {
      return json_encode($this->meta);
    }

    public function decodeMeta($meta) {
      $this->meta = json_decode($meta);
    }

  }

  class Source {

    public $type;

    public $revision;

    public function encodeType() {
      switch ($this->type) {
        case "audio":
          return SOURCE_TYPE_AUDIO;
        case "text":
        default:
          return SOURCE_TYPE_TEXT;
      }
    }

    public function decodeType($type) {
      switch ($type) {
        case SOURCE_TYPE_AUDIO:
          $this->type = "audio";
          break;
        case SOURCE_TYPE_TEXT:
        default:
          $this->type = "text";
      }
    }

    public function __construct() {
      $this->revision = new SourceRevision;
    }

  }

  class SourceRevision {

    public $content;

    public function encodeContent() {
      return $this->content;
    }

    public function decodeContent($content) {
      $this->content = $content;
    }

  }

  function getSources($jointSourceId) {

    global $DATABASE;

    // Ref: http://www.techfounder.net/2010/03/12/fetching-specific-rows-from-a-group-with-mysql/

    $state = STATE_PUBLISHED;
    $result = $DATABASE->query("SELECT src.id AS id, src.joint_id AS joint_id, rev.id AS revision_id, src.type AS type, rev.content AS content
      FROM ica_sources AS src
      LEFT JOIN ica_sources_states as sta ON src.state_id = sta.id
      LEFT JOIN ica_sources_revisions as rev ON src.revision_id = rev.id
      WHERE src.joint_id = $jointSourceId AND sta.state = $state
      ORDER BY id DESC, revision_id DESC;");

    if (isset($result) && $result) {
      if ($result->num_rows > 0) {
        $data = [];
        // Iterate through joint sources
        while ($row = $result->fetch_assoc()) {
          $source = new Source;
          $source->decodeType($row["type"]);
          $source->revision->decodeContent($row["content"]);
          $data[$row["id"]] = $source;
        }
        return $data;
      } else return [];
    } else throw new \Exception($DATABASE->error);

  }

  function getJointSources($limit = 200) {

    global $DATABASE;

    $state = STATE_PUBLISHED;
    $result = $DATABASE->query("SELECT src.id AS id, rev.id AS revision_id, rev.meta AS meta, rev.lastupdated AS lastupdated
      FROM ica_jointsources AS src
      -- LEFT JOIN ( -- a derived subquery to discover latest revision for each joint source
      -- 	SELECT rev.source_id AS source_id, MAX(rev.id) AS id
      -- 	FROM ica_jointsources_revisions AS rev
      -- 	GROUP BY source_id
      -- ) AS latest ON latest.source_id = src.id
      -- LEFT JOIN ica_jointsources_revisions as rev ON latest.id = rev.id
      LEFT JOIN ica_jointsources_states as sta ON src.state_id = sta.id
      LEFT JOIN ica_jointsources_revisions as rev ON src.revision_id = rev.id
      WHERE sta.state = $state
      ORDER BY id DESC, revision_id DESC
      LIMIT $limit;");

    if (isset($result) && $result) {
      if ($result->num_rows > 0) {
        $data = [];
        // Iterate through joint sources
        while ($row = $result->fetch_assoc()) {
          $jointSource = new JointSource;
          $jointSourceId = $row["id"];

          $jointSource->revision->decodeMeta($row["meta"]);
          $data[$jointSourceId] = $jointSource;

          // Run all sources joint by joint source
          $jointSource->sources = getSources($jointSourceId);

          $jointSource->updated = strtotime($row["lastupdated"]);
        }
        return $data;
      } else return [];
    } else throw new \Exception($DATABASE->error);

  }

  function insertJointSource($jointSource, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new joint source
    $result = $DATABASE->query("INSERT INTO ica_jointsources
      (`author_id`)
      VALUES ($accountId);");
    if (empty($result)) throw new \Exception($DATABASE->error);

    // Update joint source id
    $jointSourceId = $DATABASE->insert_id;

    $stateId = insertJointSourceState($state, $jointSourceId);
    $revisionId = insertJointSourceRevision($jointSource->revision, $jointSourceId);

    return $jointSourceId;

  }

  // Joint source state

  function updateJointSourceState($state, $jointSourceId) {

    insertJointSourceState($state, $jointSourceId);

  }

  function insertJointSourceState($state, $jointSourceId) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = $DATABASE->query("INSERT INTO ica_jointsources_states
      (`source_id`, `author_id`, `state`)
      VALUES ($jointSourceId, $accountId, $state);");
    if (empty($result)) throw new \Exception($DATABASE->error);

    $stateId = $DATABASE->insert_id;

    updateJointSourceStateId($stateId, $jointSourceId);

    return $stateId;

  }

  function updateJointSourceStateId($stateId, $jointSourceId) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = $DATABASE->query("UPDATE ica_jointsources
      SET `state_id` = $stateId
      WHERE `id` = $jointSourceId;");
    if (empty($result)) throw new \Exception($DATABASE->error);

  }

  // Joint source revision

  function insertJointSourceRevision($jointSourceRevision, $jointSourceId) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new revision
    $queryMeta = $DATABASE->real_escape_string($jointSourceRevision->encodeMeta());
    $result = $DATABASE->query("INSERT INTO ica_jointsources_revisions
      (`source_id`, `author_id`, `meta`)
      VALUES ($jointSourceId, $accountId, \"$queryMeta\");");
    if (empty($result)) throw new \Exception($DATABASE->error);

    $revisionId = $DATABASE->insert_id;

    updateJointSourceRevisionId($revisionId, $jointSourceId);

    return $revisionId;

  }

  function updateJointSourceRevisionId($revisionId, $jointSourceId) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = $DATABASE->query("UPDATE ica_jointsources
      SET `revision_id` = $revisionId
      WHERE `id` = $jointSourceId;");
    if (empty($result)) throw new \Exception($DATABASE->error);

  }

  // Source

  function insertSource($source, $jointSourceId, $state = STATE_PUBLISHED) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new source
    $queryType = $DATABASE->real_escape_string($source->encodeType());
    $result = $DATABASE->query("INSERT INTO ica_sources
      (`joint_id`, `author_id`, `type`)
      VALUES ($jointSourceId, $accountId, \"$queryType\");");
    if (empty($result)) throw new \Exception($DATABASE->error);

    // Update source id
    $sourceId = $DATABASE->insert_id;

    $stateId = insertSourceState($state, $sourceId);
    $revisionId = insertSourceRevision($source->revision, $sourceId);

    return $sourceId;

  }

  // Source state

  function updateSourceState($state, $sourceId) {

    insertSourceState($state, $sourceId);

  }

  function insertSourceState($state, $sourceId) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = $DATABASE->query("INSERT INTO ica_sources_states
      (`source_id`, `author_id`, `state`)
      VALUES ($sourceId, $accountId, $state);");
    if (empty($result)) throw new \Exception($DATABASE->error);

    $stateId = $DATABASE->insert_id;

    updateSourceStateId($stateId, $sourceId);

    return $stateId;

  }

  function updateSourceStateId($stateId, $sourceId) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = $DATABASE->query("UPDATE ica_sources
      SET `state_id` = $stateId
      WHERE `id` = $sourceId;");
    if (empty($result)) throw new \Exception($DATABASE->error);

  }

  // Source revision

  function insertSourceRevision($sourceRevision, $sourceId) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new revision
    $queryContent = $DATABASE->real_escape_string($sourceRevision->encodeContent());
    $result = $DATABASE->query("INSERT INTO ica_sources_revisions
      (`source_id`, `author_id`, `content`)
      VALUES ($sourceId, $accountId, \"$queryContent\");");
    if (empty($result)) throw new \Exception($DATABASE->error);

    $sourceRevisionId = $DATABASE->insert_id;

    updateSourceRevisionId($sourceRevisionId, $sourceId);

  }

  function updateSourceRevisionId($sourceRevisionId, $sourceId) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    // Create & save a new revision
    $result = $DATABASE->query("UPDATE ica_sources
      SET `revision_id` = $sourceRevisionId
      WHERE `id` = $sourceId;");
    if (empty($result)) throw new \Exception($DATABASE->error);

  }

?>
