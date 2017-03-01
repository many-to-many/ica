-- MySQL Script generated by MySQL Workbench
-- Wed Mar  1 13:14:01 2017
-- Model: Interactive Conversation Archive    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

-- -----------------------------------------------------
-- Schema ica
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema ica
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ica` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `ica` ;

-- -----------------------------------------------------
-- Table `ica`.`accounts`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`accounts` ;

CREATE TABLE IF NOT EXISTS `ica`.`accounts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `identifier` VARCHAR(100) NOT NULL,
  `lastmodified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`contents`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`contents` ;

CREATE TABLE IF NOT EXISTS `ica`.`contents` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_contents_accounts1_idx` (`author_id` ASC),
  CONSTRAINT `fk_contents_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_id` INT UNSIGNED NOT NULL,
  `intro_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_jointsources_accounts1_idx` (`author_id` ASC),
  INDEX `fk_jointsources_contents1_idx` (`title_id` ASC),
  INDEX `fk_jointsources_contents2_idx` (`intro_id` ASC),
  CONSTRAINT `fk_jointsources_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_contents1`
    FOREIGN KEY (`title_id`)
    REFERENCES `ica`.`contents` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_contents2`
    FOREIGN KEY (`intro_id`)
    REFERENCES `ica`.`contents` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`states`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`states` ;

CREATE TABLE IF NOT EXISTS `ica`.`states` (
  `state` TINYINT UNSIGNED NOT NULL,
  `name` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`state`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources_states`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources_states` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources_states` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `jointsource_id` INT UNSIGNED NOT NULL,
  `state` TINYINT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_jointsources_states_jointsources1_idx` (`jointsource_id` ASC),
  PRIMARY KEY (`id`),
  INDEX `fk_jointsources_states_accounts1_idx` (`author_id` ASC),
  INDEX `fk_jointsources_states_states1_idx` (`state` ASC),
  CONSTRAINT `fk_jointsources_states_jointsources1`
    FOREIGN KEY (`jointsource_id`)
    REFERENCES `ica`.`jointsources` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_states_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_states_states1`
    FOREIGN KEY (`state`)
    REFERENCES `ica`.`states` (`state`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`types`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`types` ;

CREATE TABLE IF NOT EXISTS `ica`.`types` (
  `type` TINYINT UNSIGNED NOT NULL,
  `name` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`type`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`sources`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`sources` ;

CREATE TABLE IF NOT EXISTS `ica`.`sources` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `jointsource_id` INT UNSIGNED NOT NULL,
  `content_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `type` TINYINT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_sources_accounts1_idx` (`author_id` ASC),
  INDEX `fk_sources_consts_sourcetypes1_idx` (`type` ASC),
  INDEX `fk_sources_jointsources1_idx` (`jointsource_id` ASC),
  INDEX `fk_sources_contents1_idx` (`content_id` ASC),
  CONSTRAINT `fk_sources_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sources_consts_sourcetypes1`
    FOREIGN KEY (`type`)
    REFERENCES `ica`.`types` (`type`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sources_jointsources1`
    FOREIGN KEY (`jointsource_id`)
    REFERENCES `ica`.`jointsources` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sources_contents1`
    FOREIGN KEY (`content_id`)
    REFERENCES `ica`.`contents` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`sources_states`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`sources_states` ;

CREATE TABLE IF NOT EXISTS `ica`.`sources_states` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` INT UNSIGNED NOT NULL,
  `source_id` INT UNSIGNED NOT NULL,
  `state` TINYINT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_sources_states_accounts1_idx` (`author_id` ASC),
  INDEX `fk_sources_states_states1_idx` (`state` ASC),
  INDEX `fk_sources_states_sources1_idx` (`source_id` ASC),
  CONSTRAINT `fk_sources_states_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sources_states_states1`
    FOREIGN KEY (`state`)
    REFERENCES `ica`.`states` (`state`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sources_states_sources1`
    FOREIGN KEY (`source_id`)
    REFERENCES `ica`.`sources` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`langs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`langs` ;

CREATE TABLE IF NOT EXISTS `ica`.`langs` (
  `lang` INT UNSIGNED NOT NULL,
  `name` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`lang`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`files`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`files` ;

CREATE TABLE IF NOT EXISTS `ica`.`files` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uploader_id` INT UNSIGNED NOT NULL,
  `path` VARCHAR(30) NOT NULL,
  `mime` VARCHAR(20) NOT NULL,
  `size` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_files_accounts1_idx` (`uploader_id` ASC),
  CONSTRAINT `fk_files_accounts1`
    FOREIGN KEY (`uploader_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`contents_langs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`contents_langs` ;

CREATE TABLE IF NOT EXISTS `ica`.`contents_langs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `content_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `lang` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_contents_langs_accounts1_idx` (`author_id` ASC),
  INDEX `fk_contents_langs_contents1_idx` (`content_id` ASC),
  INDEX `fk_contents_langs_langs1_idx` (`lang` ASC),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_contents_langs_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_contents_langs_contents1`
    FOREIGN KEY (`content_id`)
    REFERENCES `ica`.`contents` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_contents_langs_langs1`
    FOREIGN KEY (`lang`)
    REFERENCES `ica`.`langs` (`lang`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`contents_langs_revs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`contents_langs_revs` ;

CREATE TABLE IF NOT EXISTS `ica`.`contents_langs_revs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lang_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_contents_langs_revs_accounts1_idx` (`author_id` ASC),
  PRIMARY KEY (`id`),
  INDEX `fk_contents_langs_revs_contents_langs1_idx` (`lang_id` ASC),
  CONSTRAINT `fk_contents_langs_revs_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_contents_langs_revs_contents_langs1`
    FOREIGN KEY (`lang_id`)
    REFERENCES `ica`.`contents_langs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`contents_langs_states`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`contents_langs_states` ;

CREATE TABLE IF NOT EXISTS `ica`.`contents_langs_states` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lang_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `state` TINYINT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_contents_langs_states_accounts1_idx` (`author_id` ASC),
  INDEX `fk_contents_langs_states_states1_idx` (`state` ASC),
  PRIMARY KEY (`id`),
  INDEX `fk_contents_langs_states_contents_langs1_idx` (`lang_id` ASC),
  CONSTRAINT `fk_contents_langs_states_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_contents_langs_states_states1`
    FOREIGN KEY (`state`)
    REFERENCES `ica`.`states` (`state`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_contents_langs_states_contents_langs1`
    FOREIGN KEY (`lang_id`)
    REFERENCES `ica`.`contents_langs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`themes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`themes` ;

CREATE TABLE IF NOT EXISTS `ica`.`themes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `theme` VARCHAR(45) NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_themes_accounts1_idx` (`author_id` ASC),
  CONSTRAINT `fk_themes_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources_themes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources_themes` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources_themes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `jointsource_id` INT UNSIGNED NOT NULL,
  `theme_id` INT UNSIGNED NOT NULL,
  `lang` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_jointsources_themes_jointsources1_idx` (`jointsource_id` ASC),
  INDEX `fk_jointsources_themes_themes1_idx` (`theme_id` ASC),
  INDEX `fk_jointsources_themes_langs1_idx` (`lang` ASC),
  INDEX `fk_jointsources_themes_accounts1_idx` (`author_id` ASC),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_jointsources_themes_jointsources1`
    FOREIGN KEY (`jointsource_id`)
    REFERENCES `ica`.`jointsources` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_themes_themes1`
    FOREIGN KEY (`theme_id`)
    REFERENCES `ica`.`themes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_themes_langs1`
    FOREIGN KEY (`lang`)
    REFERENCES `ica`.`langs` (`lang`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_themes_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources_themes_states`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources_themes_states` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources_themes_states` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `state` TINYINT UNSIGNED NOT NULL,
  `deleg_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_jointsources_themes_states_states1_idx` (`state` ASC),
  PRIMARY KEY (`id`),
  INDEX `fk_jointsources_themes_states_accounts1_idx` (`author_id` ASC),
  INDEX `fk_jointsources_themes_states_jointsources_themes1_idx` (`deleg_id` ASC),
  CONSTRAINT `fk_jointsources_themes_states_states1`
    FOREIGN KEY (`state`)
    REFERENCES `ica`.`states` (`state`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_themes_states_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_themes_states_jointsources_themes1`
    FOREIGN KEY (`deleg_id`)
    REFERENCES `ica`.`jointsources_themes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`participants`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`participants` ;

CREATE TABLE IF NOT EXISTS `ica`.`participants` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `participant` VARCHAR(45) NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_participants_accounts1_idx` (`author_id` ASC),
  CONSTRAINT `fk_participants_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources_participants`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources_participants` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources_participants` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `jointsource_id` INT UNSIGNED NOT NULL,
  `participant_id` INT UNSIGNED NOT NULL,
  `lang` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_jointsources_participants_jointsources1_idx` (`jointsource_id` ASC),
  INDEX `fk_jointsources_participants_participants1_idx` (`participant_id` ASC),
  INDEX `fk_jointsources_participants_accounts1_idx` (`author_id` ASC),
  INDEX `fk_jointsources_participants_langs1_idx` (`lang` ASC),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_jointsources_participants_jointsources1`
    FOREIGN KEY (`jointsource_id`)
    REFERENCES `ica`.`jointsources` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_participants_participants1`
    FOREIGN KEY (`participant_id`)
    REFERENCES `ica`.`participants` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_participants_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_participants_langs1`
    FOREIGN KEY (`lang`)
    REFERENCES `ica`.`langs` (`lang`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources_participants_states`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources_participants_states` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources_participants_states` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `deleg_id` INT UNSIGNED NOT NULL,
  `state` TINYINT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_jointsources_participants_states_states1_idx` (`state` ASC),
  INDEX `fk_jointsources_participants_states_accounts1_idx` (`author_id` ASC),
  INDEX `fk_jointsources_participants_states_jointsources_participan_idx` (`deleg_id` ASC),
  CONSTRAINT `fk_jointsources_participants_states_states1`
    FOREIGN KEY (`state`)
    REFERENCES `ica`.`states` (`state`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_participants_states_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_participants_states_jointsources_participants1`
    FOREIGN KEY (`deleg_id`)
    REFERENCES `ica`.`jointsources_participants` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources_regions_langs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources_regions_langs` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources_regions_langs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `jointsource_id` INT UNSIGNED NOT NULL,
  `lang` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_jointsources_regions_jointsources1_idx` (`jointsource_id` ASC),
  PRIMARY KEY (`id`),
  INDEX `fk_jointsources_regions_accounts2_idx` (`author_id` ASC),
  INDEX `fk_jointsources_regions_langs_langs1_idx` (`lang` ASC),
  CONSTRAINT `fk_jointsources_regions_langs_jointsources1`
    FOREIGN KEY (`jointsource_id`)
    REFERENCES `ica`.`jointsources` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_regions_langs_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_regions_langs_langs1`
    FOREIGN KEY (`lang`)
    REFERENCES `ica`.`langs` (`lang`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`regions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`regions` ;

CREATE TABLE IF NOT EXISTS `ica`.`regions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `region` VARCHAR(45) NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_regions_langs_accounts1_idx` (`author_id` ASC),
  UNIQUE INDEX `region_UNIQUE` (`region` ASC),
  CONSTRAINT `fk_regions_langs_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources_regions_langs_revs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources_regions_langs_revs` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources_regions_langs_revs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lang_id` INT NOT NULL,
  `region_id` INT NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_jointsources_regions_langs_revs_jointsources_regions_lan_idx` (`lang_id` ASC),
  PRIMARY KEY (`id`),
  INDEX `fk_jointsources_regions_langs_revs_regions1_idx` (`region_id` ASC),
  INDEX `fk_jointsources_regions_langs_revs_accounts1_idx` (`author_id` ASC),
  CONSTRAINT `fk_jointsources_regions_langs_revs_jointsources_regions_langs1`
    FOREIGN KEY (`lang_id`)
    REFERENCES `ica`.`jointsources_regions_langs` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_regions_langs_revs_regions1`
    FOREIGN KEY (`region_id`)
    REFERENCES `ica`.`regions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_regions_langs_revs_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ica`.`jointsources_regions_langs_states`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ica`.`jointsources_regions_langs_states` ;

CREATE TABLE IF NOT EXISTS `ica`.`jointsources_regions_langs_states` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lang_id` INT NOT NULL,
  `state` TINYINT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `authored` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_jointsources_regions_langs_states_jointsources_regions_l_idx` (`lang_id` ASC),
  INDEX `fk_jointsources_regions_langs_states_states1_idx` (`state` ASC),
  INDEX `fk_jointsources_regions_langs_states_accounts1_idx` (`author_id` ASC),
  CONSTRAINT `fk_jointsources_regions_langs_states_jointsources_regions_lan1`
    FOREIGN KEY (`lang_id`)
    REFERENCES `ica`.`jointsources_regions_langs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_regions_langs_states_states1`
    FOREIGN KEY (`state`)
    REFERENCES `ica`.`states` (`state`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_jointsources_regions_langs_states_accounts1`
    FOREIGN KEY (`author_id`)
    REFERENCES `ica`.`accounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `ica` ;

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`jointsources_state_latest`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`jointsources_state_latest` (`jointsource_id` INT, `state_id` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`jointsources_summary`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`jointsources_summary` (`jointsource_id` INT, `state_id` INT, `state` INT, `title_id` INT, `intro_id` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`sources_state_latest`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`sources_state_latest` (`source_id` INT, `state_id` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`sources_summary`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`sources_summary` (`source_id` INT, `jointsource_id` INT, `source_type` INT, `state_id` INT, `state` INT, `content_id` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`contents_langs_summary`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`contents_langs_summary` (`content_id` INT, `lang_id` INT, `lang` INT, `state_id` INT, `state` INT, `rev_id` INT, `content` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`contents_langs_state_latest`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`contents_langs_state_latest` (`lang_id` INT, `state_id` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`contents_langs_rev_latest`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`contents_langs_rev_latest` (`lang_id` INT, `rev_id` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`jointsources_themes_state_latest`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`jointsources_themes_state_latest` (`deleg_id` INT, `state_id` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`jointsources_themes_summary`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`jointsources_themes_summary` (`jointsource_id` INT, `deleg_id` INT, `theme_id` INT, `theme` INT, `state_id` INT, `state` INT, `lang` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`jointsources_participants_summary`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`jointsources_participants_summary` (`jointsource_id` INT, `deleg_id` INT, `participant_id` INT, `participant` INT, `state_id` INT, `state` INT, `lang` INT);

-- -----------------------------------------------------
-- Placeholder table for view `ica`.`jointsources_participants_state_latest`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ica`.`jointsources_participants_state_latest` (`deleg_id` INT, `state_id` INT);

-- -----------------------------------------------------
-- View `ica`.`jointsources_state_latest`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`jointsources_state_latest` ;
DROP TABLE IF EXISTS `ica`.`jointsources_state_latest`;
USE `ica`;
CREATE  OR REPLACE VIEW `jointsources_state_latest` AS
SELECT
	tbl_state.jointsource_id AS jointsource_id,
	MAX(tbl_state.id) AS state_id
FROM `jointsources_states` AS tbl_state
GROUP BY jointsource_id;

-- -----------------------------------------------------
-- View `ica`.`jointsources_summary`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`jointsources_summary` ;
DROP TABLE IF EXISTS `ica`.`jointsources_summary`;
USE `ica`;
CREATE  OR REPLACE VIEW `jointsources_summary` AS
SELECT
	tbl_jointsource.id AS jointsource_id,
    tbl_state.id AS state_id,
    tbl_state.state AS state,
	tbl_jointsource.title_id AS title_id,
    tbl_jointsource.intro_id AS intro_id
    -- themes, participants, regions are excluded
FROM `jointsources` AS tbl_jointsource
LEFT JOIN `jointsources_state_latest` AS tbl_state_latest
	ON tbl_state_latest.jointsource_id = tbl_jointsource.id
LEFT JOIN `jointsources_states` AS tbl_state
	ON tbl_state.id = tbl_state_latest.state_id;

-- -----------------------------------------------------
-- View `ica`.`sources_state_latest`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`sources_state_latest` ;
DROP TABLE IF EXISTS `ica`.`sources_state_latest`;
USE `ica`;
CREATE  OR REPLACE VIEW `sources_state_latest` AS
SELECT
	tbl_state.source_id AS source_id,
	MAX(tbl_state.id) AS state_id
FROM `sources_states` AS tbl_state
GROUP BY source_id;

-- -----------------------------------------------------
-- View `ica`.`sources_summary`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`sources_summary` ;
DROP TABLE IF EXISTS `ica`.`sources_summary`;
USE `ica`;
CREATE  OR REPLACE VIEW `sources_summary` AS
SELECT
	tbl_source.id AS source_id,
    tbl_source.jointsource_id AS jointsource_id,
    tbl_source.type AS source_type,
    tbl_state.id AS state_id,
    tbl_state.state AS state,
	tbl_source.content_id AS content_id
FROM `sources` AS tbl_source
LEFT JOIN `sources_state_latest` AS tbl_state_latest
	ON tbl_state_latest.source_id = tbl_source.id
LEFT JOIN `sources_states` AS tbl_state
	ON tbl_state.id = tbl_state_latest.state_id;

-- -----------------------------------------------------
-- View `ica`.`contents_langs_summary`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`contents_langs_summary` ;
DROP TABLE IF EXISTS `ica`.`contents_langs_summary`;
USE `ica`;
CREATE  OR REPLACE VIEW `contents_langs_summary` AS
SELECT
	tbl_lang.content_id AS content_id,
    tbl_lang.id AS lang_id,
    tbl_lang.lang AS lang,
    tbl_state.id AS state_id,
    tbl_state.state AS state,
    tbl_rev.id AS rev_id,
    tbl_rev.content AS content
FROM `contents_langs` AS tbl_lang
LEFT JOIN `contents_langs_state_latest` AS tbl_state_latest
	ON tbl_state_latest.lang_id = tbl_lang.id
LEFT JOIN `contents_langs_rev_latest` AS tbl_rev_latest
	ON tbl_rev_latest.lang_id = tbl_lang.id
LEFT JOIN `contents_langs_states` AS tbl_state
	ON tbl_state.id = tbl_state_latest.state_id
LEFT JOIN `contents_langs_revs` AS tbl_rev
	ON tbl_rev.id = tbl_rev_latest.rev_id;

-- -----------------------------------------------------
-- View `ica`.`contents_langs_state_latest`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`contents_langs_state_latest` ;
DROP TABLE IF EXISTS `ica`.`contents_langs_state_latest`;
USE `ica`;
CREATE  OR REPLACE VIEW `contents_langs_state_latest` AS
SELECT
	tbl_state.lang_id AS lang_id,
	MAX(tbl_state.id) AS state_id
FROM `contents_langs_states` AS tbl_state
GROUP BY lang_id;

-- -----------------------------------------------------
-- View `ica`.`contents_langs_rev_latest`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`contents_langs_rev_latest` ;
DROP TABLE IF EXISTS `ica`.`contents_langs_rev_latest`;
USE `ica`;
CREATE  OR REPLACE VIEW `contents_langs_rev_latest` AS
SELECT
	tbl_rev.lang_id AS lang_id,
	MAX(tbl_rev.id) AS rev_id
FROM `contents_langs_revs` AS tbl_rev
GROUP BY lang_id;

-- -----------------------------------------------------
-- View `ica`.`jointsources_themes_state_latest`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`jointsources_themes_state_latest` ;
DROP TABLE IF EXISTS `ica`.`jointsources_themes_state_latest`;
USE `ica`;
CREATE  OR REPLACE VIEW `jointsources_themes_state_latest` AS
SELECT
	tbl_state.deleg_id AS deleg_id,
	MAX(tbl_state.id) AS state_id
FROM `jointsources_themes_states` AS tbl_state
GROUP BY deleg_id;

-- -----------------------------------------------------
-- View `ica`.`jointsources_themes_summary`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`jointsources_themes_summary` ;
DROP TABLE IF EXISTS `ica`.`jointsources_themes_summary`;
USE `ica`;
CREATE  OR REPLACE VIEW `jointsources_themes_summary` AS
SELECT
	tbl_deleg.jointsource_id AS jointsource_id,
	tbl_deleg.id AS deleg_id,
    tbl_theme.id AS theme_id,
    tbl_theme.theme AS theme,
    tbl_state.id AS state_id,
    tbl_state.state AS state,
    tbl_deleg.lang AS lang
FROM `jointsources_themes` AS tbl_deleg
LEFT JOIN `jointsources_themes_state_latest` AS tbl_state_latest
	ON tbl_state_latest.deleg_id = tbl_deleg.id
LEFT JOIN `jointsources_themes_states` AS tbl_state
	ON tbl_state.id = tbl_state_latest.state_id
LEFT JOIN `themes` AS tbl_theme
	ON tbl_theme.id = tbl_deleg.theme_id;
	;

-- -----------------------------------------------------
-- View `ica`.`jointsources_participants_summary`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`jointsources_participants_summary` ;
DROP TABLE IF EXISTS `ica`.`jointsources_participants_summary`;
USE `ica`;
CREATE  OR REPLACE VIEW `jointsources_participants_summary` AS
SELECT
	tbl_deleg.jointsource_id AS jointsource_id,
	tbl_deleg.id AS deleg_id,
    tbl_participant.id AS participant_id,
    tbl_participant.participant AS participant,
    tbl_state.id AS state_id,
    tbl_state.state AS state,
    tbl_deleg.lang AS lang
FROM `jointsources_participants` AS tbl_deleg
LEFT JOIN `jointsources_participants_state_latest` AS tbl_state_latest
	ON tbl_state_latest.deleg_id = tbl_deleg.id
LEFT JOIN `jointsources_participants_states` AS tbl_state
	ON tbl_state.id = tbl_state_latest.state_id
LEFT JOIN `participants` AS tbl_participant
	ON tbl_participant.id = tbl_deleg.participant_id;
	;

-- -----------------------------------------------------
-- View `ica`.`jointsources_participants_state_latest`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `ica`.`jointsources_participants_state_latest` ;
DROP TABLE IF EXISTS `ica`.`jointsources_participants_state_latest`;
USE `ica`;
CREATE  OR REPLACE VIEW `jointsources_participants_state_latest` AS
SELECT
	tbl_state.deleg_id AS deleg_id,
	MAX(tbl_state.id) AS state_id
FROM `jointsources_participants_states` AS tbl_state
GROUP BY deleg_id;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `ica`.`states`
-- -----------------------------------------------------
START TRANSACTION;
USE `ica`;
INSERT INTO `ica`.`states` (`state`, `name`) VALUES (1, 'published');
INSERT INTO `ica`.`states` (`state`, `name`) VALUES (2, 'unpublished');
INSERT INTO `ica`.`states` (`state`, `name`) VALUES (0, 'undefined');

COMMIT;


-- -----------------------------------------------------
-- Data for table `ica`.`types`
-- -----------------------------------------------------
START TRANSACTION;
USE `ica`;
INSERT INTO `ica`.`types` (`type`, `name`) VALUES (1, 'text');
INSERT INTO `ica`.`types` (`type`, `name`) VALUES (2, 'audio');
INSERT INTO `ica`.`types` (`type`, `name`) VALUES (3, 'image');
INSERT INTO `ica`.`types` (`type`, `name`) VALUES (4, 'video');
INSERT INTO `ica`.`types` (`type`, `name`) VALUES (0, 'undefined');

COMMIT;


-- -----------------------------------------------------
-- Data for table `ica`.`langs`
-- -----------------------------------------------------
START TRANSACTION;
USE `ica`;
INSERT INTO `ica`.`langs` (`lang`, `name`) VALUES (0, 'undefined');

COMMIT;

