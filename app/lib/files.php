<?php

  namespace ICA\Files;

  class File {

    public $path;

    public $mime;

    public $size;

  }

  function getFile($fileId) {

    global $DATABASE;

    // Ref: http://www.techfounder.net/2010/03/12/fetching-specific-rows-from-a-group-with-mysql/

    $result = $DATABASE->query("SELECT file.path AS path, file.mime AS mime, file.size AS size, file.uploader_id AS uploader_id
      FROM files AS file
      WHERE file.id = $fileId
      ORDER BY id DESC;");

    if (isset($result) && $result) {
      if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $file = new File;
        $file->path = $row["path"];
        $file->mime = $row["mime"];
        $file->size = $row["size"];
        $file->uploader_id = $row["uploader_id"];
        return $file;
      } else return NULL;
    } else throw new \Exception($DATABASE->error);

  }

  function insertFile($file) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = $DATABASE->query("INSERT INTO files
      (`uploader_id`, `path`, `mime`, `size`)
      VALUES ($accountId, '{$file->path}', '{$file->mime}', {$file->size});");
    if (empty($result)) throw new \Exception($DATABASE->error);

    $fileId = $DATABASE->insert_id;

    return $fileId;

  }

?>
