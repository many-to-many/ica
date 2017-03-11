<?php

  namespace {

    header("Access-Control-Allow-Origin: https://ica.mintkit.net");
    header("Access-Control-Allow-Headers: Cache-Control");

    require_once(__DIR__ . "/config.php");
    require_once(__DIR__ . "/config.oauth2.php");

    define("ICA_DEFAULT", "ICA_DEFAULT");
    define("ICA_EXCEPTION", "ICA_EXCEPTION");

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

    if (ob_get_level()) ob_end_clean();

  }

  namespace Accounts {

    /**
     * Account
     */

    class Account {

      public $id;

      public $identifier;

    }

    function getAccountByIdentifier($identifier) {

      global $DATABASE;

      $result = $DATABASE->query("SELECT *
        FROM `accounts`
        WHERE `identifier` = '$identifier'
        LIMIT 1;");

      if (isset($result) && $result) { // Statement executed
        if ($result->num_rows > 0) {

          $row = $result->fetch_assoc();
          $account = new Account;
          $account->id = $row["id"];
          $account->identifier = $row["identifier"];

          return $account;

        } else return NULL;
      } else throw new Exception($DATABASE->error);

    }

    function registerAccountByIdentifier($identifier) {

      global $DATABASE;

      $result = $DATABASE->query("INSERT INTO `accounts`
        (`identifier`) VALUES ('$identifier');");

      if (isset($result) && $result) { // Statement executed

        return getAccountByIdentifier($identifier); // Double confirmation

      } else throw new Exception($DATABASE->error);

    }

  }

  namespace Session {

    function init($accountId) {

      $_SESSION["_ica_account_id"] = $accountId;
      $_SESSION["_ica_account_session"] = substr(md5(microtime()), 0, 6);

    }

    function verify($accountSession) {

      return isset($_SESSION["_ica_account_id"])
        && isset($_SESSION["_ica_account_session"])
        && $_SESSION["_ica_account_session"] == $accountSession;

    }

    function requireVerification() {

      if ($_SERVER["HTTP_AUTHORIZATION"]) {
        return verify(substr($_SERVER["HTTP_AUTHORIZATION"], 7));
      }
      throw new \Exception("Not yet logged in");

    }

    function getAccountId() {

      if (requireVerification()) return $_SESSION["_ica_account_id"];
      throw new \Exception("Not yet logged in");

    }

    if (!session_id()) session_start();

  }

?>
