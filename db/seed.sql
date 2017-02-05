# ************************************************************
# Sequel Pro SQL dump
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table ica_accounts
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_accounts`;

CREATE TABLE `ica_accounts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `identifier` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ica_files
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_files`;

CREATE TABLE `ica_files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `author_id` int(11) unsigned DEFAULT NULL,
  `path` varchar(30) NOT NULL DEFAULT '',
  `mime` varchar(20) NOT NULL DEFAULT '',
  `lastupdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `ica_files_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ica_files_ibfk_4` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ica_jointsources
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_jointsources`;

CREATE TABLE `ica_jointsources` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `author_id` int(11) unsigned DEFAULT NULL,
  `revision_id` int(11) unsigned DEFAULT NULL,
  `state_id` int(11) unsigned DEFAULT NULL,
  `lastupdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `revision_id` (`revision_id`),
  KEY `state_id` (`state_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `ica_jointsources_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ica_jointsources_ibfk_2` FOREIGN KEY (`revision_id`) REFERENCES `ica_jointsources_revisions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ica_jointsources_ibfk_3` FOREIGN KEY (`state_id`) REFERENCES `ica_jointsources_states` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ica_jointsources_ibfk_4` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ica_jointsources_revisions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_jointsources_revisions`;

CREATE TABLE `ica_jointsources_revisions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `source_id` int(11) unsigned DEFAULT NULL,
  `author_id` int(11) unsigned DEFAULT NULL,
  `meta` text NOT NULL,
  `authored` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `lastupdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `source_id` (`source_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `ica_jointsources_revisions_ibfk_1` FOREIGN KEY (`source_id`) REFERENCES `ica_jointsources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ica_jointsources_revisions_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ica_jointsources_states
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_jointsources_states`;

CREATE TABLE `ica_jointsources_states` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `source_id` int(11) unsigned DEFAULT NULL,
  `author_id` int(11) unsigned DEFAULT NULL,
  `state` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `authored` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `lastupdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `source_id` (`source_id`),
  KEY `state` (`state`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `ica_jointsources_states_ibfk_1` FOREIGN KEY (`source_id`) REFERENCES `ica_jointsources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ica_jointsources_states_ibfk_2` FOREIGN KEY (`state`) REFERENCES `ica_states` (`state`) ON UPDATE CASCADE,
  CONSTRAINT `ica_jointsources_states_ibfk_3` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ica_sources
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_sources`;

CREATE TABLE `ica_sources` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `joint_id` int(11) unsigned DEFAULT NULL,
  `author_id` int(11) unsigned DEFAULT NULL,
  `type` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `revision_id` int(11) unsigned DEFAULT NULL,
  `state_id` int(11) unsigned DEFAULT NULL,
  `lastupdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `state_id` (`state_id`),
  KEY `revision_id` (`revision_id`),
  KEY `author_id` (`author_id`),
  KEY `joint_id` (`joint_id`),
  CONSTRAINT `ica_sources_ibfk_3` FOREIGN KEY (`type`) REFERENCES `ica_types` (`type`) ON UPDATE CASCADE,
  CONSTRAINT `ica_sources_ibfk_4` FOREIGN KEY (`state_id`) REFERENCES `ica_sources_states` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ica_sources_ibfk_5` FOREIGN KEY (`revision_id`) REFERENCES `ica_sources_revisions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ica_sources_ibfk_7` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ica_sources_ibfk_8` FOREIGN KEY (`joint_id`) REFERENCES `ica_jointsources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ica_sources_revisions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_sources_revisions`;

CREATE TABLE `ica_sources_revisions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `source_id` int(11) unsigned DEFAULT NULL,
  `author_id` int(11) unsigned DEFAULT NULL,
  `content` text NOT NULL,
  `authored` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `lastupdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `source_id` (`source_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `ica_sources_revisions_ibfk_1` FOREIGN KEY (`source_id`) REFERENCES `ica_sources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ica_sources_revisions_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ica_sources_states
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_sources_states`;

CREATE TABLE `ica_sources_states` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `source_id` int(11) unsigned DEFAULT NULL,
  `author_id` int(11) unsigned DEFAULT NULL,
  `state` tinyint(4) unsigned DEFAULT '1',
  `authored` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `lastupdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `source_id` (`source_id`),
  KEY `state` (`state`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `ica_sources_states_ibfk_1` FOREIGN KEY (`source_id`) REFERENCES `ica_sources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ica_sources_states_ibfk_2` FOREIGN KEY (`state`) REFERENCES `ica_states` (`state`) ON UPDATE CASCADE,
  CONSTRAINT `ica_sources_states_ibfk_3` FOREIGN KEY (`author_id`) REFERENCES `ica_accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ica_states
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_states`;

CREATE TABLE `ica_states` (
  `state` tinyint(4) unsigned NOT NULL AUTO_INCREMENT,
  `info` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `ica_states` WRITE;
/*!40000 ALTER TABLE `ica_states` DISABLE KEYS */;

INSERT INTO `ica_states` (`state`, `info`)
VALUES
	(1,'published'),
	(2,'unpublished');

/*!40000 ALTER TABLE `ica_states` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table ica_types
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ica_types`;

CREATE TABLE `ica_types` (
  `type` tinyint(4) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `ica_types` WRITE;
/*!40000 ALTER TABLE `ica_types` DISABLE KEYS */;

INSERT INTO `ica_types` (`type`, `name`)
VALUES
	(1,'text'),
	(2,'audio'),
	(3,'image');

/*!40000 ALTER TABLE `ica_types` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
