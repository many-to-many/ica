<?php

  namespace {

    header("Access-Control-Allow-Origin: https://ica.mintkit.net");
    header("Access-Control-Allow-Headers: Cache-Control");

    require_once(__DIR__ . "/config.php");
    require_once(__DIR__ . "/config.oauth2.php");

    /**
     * Database
     */

    $DATABASE = new \mysqli(
      MYSQL_HOST,
      MYSQL_USER,
      MYSQL_PASSWORD,
      MYSQL_DATABASE
    );

    if (mysqli_connect_errno()) {

      printf("Connect failed: %s\n", mysqli_connect_error());
      exit();

    }

    if (!$DATABASE->set_charset("utf8mb4")) {

      printf("Error loading character set utf8mb4: %s\n", $DATABASE->error);
      exit();

    }

    function query($q) {

      global $DATABASE;
      $result = $DATABASE->query($q);
      if (empty($result)) {
        throw new \Exception($DATABASE->error);
      }
      return $result;

    }

    $DATABASE_NUM_TRANSACTIONS = 0;

    function retainDatabaseTransaction() {

      global $DATABASE, $DATABASE_NUM_TRANSACTIONS;

      $DATABASE->autocommit(false);
      ++$DATABASE_NUM_TRANSACTIONS;

    }

    function releaseDatabaseTransaction() {

      global $DATABASE, $DATABASE_NUM_TRANSACTIONS;

      if ($DATABASE_NUM_TRANSACTIONS > 0) {
        --$DATABASE_NUM_TRANSACTIONS;
        if ($DATABASE_NUM_TRANSACTIONS == 0) {
          $result = $DATABASE->commit();
          if (empty($result)) {
            throw new \Exception($DATABASE->error);
          }
          return $result;
        }
      }

    }

  }

  namespace Accounts {

    function getAccountIdByIdentifier($identifier) {

      global $DATABASE;

      $result = $DATABASE->query("SELECT `id`
        FROM `accounts`
        WHERE `identifier` = '$identifier'
        LIMIT 1;");

      if (isset($result) && $result) { // Statement executed
        if ($result->num_rows == 0) return false;
        $row = $result->fetch_assoc();
        return $row["id"];
      } else throw new Exception($DATABASE->error);

    }

    function registerAccountByIdentifier($identifier) {

      global $DATABASE;

      $DATABASE->query("INSERT INTO `accounts`
        (`identifier`) VALUES ('$identifier');");

      return getAccountIdByIdentifier($identifier); // Double confirmation

    }

    function updateAccountName($accountId, $name) {

      global $DATABASE;

      $nameEncoded = $DATABASE->real_escape_string($name);

      $DATABASE->query("UPDATE `accounts`
        SET `name` = '$nameEncoded'
        WHERE `id` = $accountId;");

    }

  }

  namespace Session {

    function init($accountId) {

      $_SESSION["_ica_account_id"] = $accountId;

      $sessionId = substr(md5(microtime()), 0, 6);
      $_SESSION["_ica_session_id"] = $sessionId;

      return $sessionId;

    }

    function verify($accountSession) {

      return !empty($_SESSION["_ica_account_id"])
        && !empty($_SESSION["_ica_session_id"])
        && $_SESSION["_ica_session_id"] == $accountSession;

    }

    function requireVerification() {

      if ($_SERVER["HTTP_AUTHORIZATION"] && verify(substr($_SERVER["HTTP_AUTHORIZATION"], 7))) {
        return;
      }

      respondHeaderResponseCode(401, "Unauthorized");
      exit();

    }

    function getAccountId() {

      requireVerification();
      return $_SESSION["_ica_account_id"];

    }

    if (!session_id()) session_start();

  }

?>
