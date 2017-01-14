<?php

  namespace ICA\Files;

  class File {

    public $path;

    public $mime;

  }

  function getFile($fileId) {

    global $DATABASE;

    // Ref: http://www.techfounder.net/2010/03/12/fetching-specific-rows-from-a-group-with-mysql/

    $result = $DATABASE->query("SELECT file.path AS path, file.mime AS mime, author_id AS author_id
      FROM ica_files AS file
      WHERE file.id = $fileId
      ORDER BY id DESC;");

    if (isset($result) && $result) {
      if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $file = new File;
        $file->path = $row["path"];
        $file->mime = $row["mime"];
        $file->author_id = $row["author_id"];
        return $file;
      } else return NULL;
    } else throw new \Exception($DATABASE->error);

  }

  function insertFile($path, $mime) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = $DATABASE->query("INSERT INTO ica_files
      (`author_id`, `path`, `mime`)
      VALUES ($accountId, '$path', '$mime');");
    if (empty($result)) throw new \Exception($DATABASE->error);

    $fileId = $DATABASE->insert_id;

    return $fileId;

  }

?>
