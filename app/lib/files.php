<?php

  namespace ICA\Files;

  class File {

    public $path;

    public $type;

    public $size;

  }

  function getFile($fileId) {

    global $DATABASE;

    // Ref: http://www.techfounder.net/2010/03/12/fetching-specific-rows-from-a-group-with-mysql/

    $result = $DATABASE->query("SELECT file.path AS path, file.type AS type, file.size AS size, file.uploader_id AS uploader_id
      FROM files AS file
      WHERE file.id = $fileId
      ORDER BY id DESC;");

    if (isset($result) && $result) {
      if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $file = new File;
        $file->path = $row["path"];
        $file->type = $row["type"];
        $file->size = $row["size"];
        return $file;
      } else return NULL;
    } else throw new \Exception($DATABASE->error);

  }

  function insertFile($file) {

    global $DATABASE;
    $accountId = \Session\getAccountId();

    $result = $DATABASE->query("INSERT INTO files
      (`uploader_id`, `path`, `type`, `size`)
      VALUES ($accountId, '{$file->path}', '{$file->type}', {$file->size});");
    if (empty($result)) throw new \Exception($DATABASE->error);

    $fileId = $DATABASE->insert_id;

    return $fileId;

  }

?>
