<?php

  namespace ICA\Themes;

  require_once(__DIR__ . "/shared.php");

  /**
   * Returns a list of most frequent (time insensitive) themes.
   */
  function getThemesByFrequency($limit = 200) {

    $stateEncoded = STATE_PUBLISHED_ENCODED;
    $result = query("SELECT
        tbl_theme.theme AS theme,
        COUNT(*) AS freq
      FROM themes AS tbl_theme
      INNER JOIN jointsources_themes_summary AS tbl_deleg
        ON tbl_deleg.theme_id = tbl_theme.id AND tbl_deleg.state = {$stateEncoded}
      GROUP BY theme
      ORDER BY freq DESC, theme ASC
      LIMIT {$limit};");

    return createArrayFromQueryResult($result, "theme");

  }

?>