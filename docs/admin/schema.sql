-- RentalSawari admin schema (MySQL / MariaDB).
-- Generated from lib/admin/db/schema.ts. The app creates these tables itself
-- on first connect; this file is only a reference / manual fallback.

CREATE TABLE IF NOT EXISTS `listings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `city` VARCHAR(60) NOT NULL,
  `area` VARCHAR(160) NOT NULL DEFAULT '',
  `whatsapp` VARCHAR(20) NOT NULL DEFAULT '',
  `phone` VARCHAR(20) NOT NULL DEFAULT '',
  `phone2` VARCHAR(20) NULL,
  `website` VARCHAR(500) NULL,
  `maps_url` TEXT NULL,
  `about` TEXT NULL,
  `services` MEDIUMTEXT NOT NULL,
  `cars` MEDIUMTEXT NOT NULL,
  `logo_url` VARCHAR(255) NULL,
  `google_rating` DOUBLE NULL,
  `google_reviews` INT NULL,
  `response_time` VARCHAR(60) NULL,
  `plan` VARCHAR(8) NOT NULL DEFAULT 'free',
  `plan_start` DATE NULL,
  `plan_end` DATE NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(8) NOT NULL DEFAULT 'live',
  `hidden_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  KEY `ix_city` (`city`),
  KEY `ix_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `listing_versions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `kind` VARCHAR(12) NOT NULL,
  `actor` VARCHAR(255) NOT NULL DEFAULT '',
  `note` VARCHAR(500) NOT NULL DEFAULT '',
  `changes` MEDIUMTEXT NOT NULL,
  `snapshot` MEDIUMTEXT NOT NULL,
  `prior` MEDIUMTEXT NULL,
  `ref_id` INT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_listing_id` (`listing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `listing_redirects` (
  `old_slug` VARCHAR(160) NOT NULL,
  `listing_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`old_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `listing_requests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `status` VARCHAR(12) NOT NULL DEFAULT 'new',
  `payload` MEDIUMTEXT NOT NULL,
  `fixes` MEDIUMTEXT NOT NULL,
  `duplicate_of` INT NULL,
  `reject_reason` VARCHAR(200) NULL,
  `note` TEXT NULL,
  `listing_id` INT NULL,
  `claim_id` INT NULL,
  `decided_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `ix_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `claims` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `listing_id` INT NOT NULL,
  `claimant_name` VARCHAR(200) NOT NULL,
  `role` VARCHAR(8) NOT NULL,
  `claimant_whatsapp` VARCHAR(20) NOT NULL,
  `message` TEXT NULL,
  `changes` MEDIUMTEXT NOT NULL,
  `close_requested` TINYINT(1) NOT NULL DEFAULT 0,
  `verification` MEDIUMTEXT NOT NULL,
  `applied_keys` MEDIUMTEXT NOT NULL,
  `status` VARCHAR(12) NOT NULL DEFAULT 'waiting',
  `flagged` TINYINT(1) NOT NULL DEFAULT 0,
  `reject_reason` VARCHAR(200) NULL,
  `note` TEXT NULL,
  `decided_at` DATETIME NULL,
  `request_id` INT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_status` (`status`),
  KEY `ix_listing_id` (`listing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `listing_id` INT NOT NULL,
  `reason` VARCHAR(16) NOT NULL,
  `details` TEXT NULL,
  `reporter_whatsapp` VARCHAR(20) NULL,
  `status` VARCHAR(12) NOT NULL DEFAULT 'new',
  `resolved_note` TEXT NULL,
  `resolved_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `ix_status` (`status`),
  KEY `ix_listing_id` (`listing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `media` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME NOT NULL,
  `mime` VARCHAR(40) NOT NULL,
  `size` INT NOT NULL,
  `data` MEDIUMBLOB NOT NULL,
  `ref` VARCHAR(60) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stat_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ts` DATETIME NOT NULL,
  `day` DATE NOT NULL,
  `hour` TINYINT NOT NULL DEFAULT 0,
  `listing_id` INT NOT NULL,
  `kind` VARCHAR(6) NOT NULL,
  `visitor` VARCHAR(16) NOT NULL DEFAULT '',
  `source` VARCHAR(10) NOT NULL DEFAULT '',
  `entry` VARCHAR(191) NOT NULL DEFAULT '',
  `device` VARCHAR(8) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `ix_day` (`day`),
  KEY `ix_listing_id_day` (`listing_id`, `day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stat_shown` (
  `day` DATE NOT NULL,
  `listing_id` INT NOT NULL,
  `page` VARCHAR(191) NOT NULL,
  `shown` INT NOT NULL DEFAULT 0,
  `pos_sum` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`day`, `listing_id`, `page`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `app_meta` (
  `k` VARCHAR(64) NOT NULL,
  `v` TEXT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
