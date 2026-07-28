-- =============================================================================
-- Nexus-Campus -- MySQL Initialization Script
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `nexus_campus`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `nexus_campus`;

-- =============================================================================
-- Schema -- DDL (adapted from src/main/resources/schema.sql for MySQL 8.0)
-- =============================================================================

-- 1. User Core Table
CREATE TABLE IF NOT EXISTS `sys_user` (
  `id` bigint NOT NULL PRIMARY KEY,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(100) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `avatar` varchar(255) DEFAULT 'default_avatar.png',
  `role` varchar(20) NOT NULL DEFAULT 'USER',
  `core_power` int NOT NULL DEFAULT 0,
  `level` int NOT NULL DEFAULT 1,
  `status` tinyint NOT NULL DEFAULT 1,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vibe_channel` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `slug` varchar(50) DEFAULT NULL UNIQUE,
  `sort_order` int NOT NULL DEFAULT 0,
  `status` tinyint NOT NULL DEFAULT 1,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tag Table
CREATE TABLE IF NOT EXISTS `bbs_tag` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(30) NOT NULL,
  `status` tinyint NOT NULL DEFAULT 1,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Post Data Table
CREATE TABLE IF NOT EXISTS `bbs_post` (
  `id` bigint NOT NULL PRIMARY KEY,
  `user_id` bigint NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` longtext NOT NULL,
  `summary` varchar(255) DEFAULT NULL,
  `view_count` int NOT NULL DEFAULT 0,
  `like_count` int NOT NULL DEFAULT 0,
  `comment_count` int NOT NULL DEFAULT 0,
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '1-Active, 2-Pending Audit, 3-Rejected',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_post_user_id` ON `bbs_post`(`user_id`);
CREATE INDEX `idx_post_category_id` ON `bbs_post`(`category_id`);
CREATE INDEX `idx_post_status` ON `bbs_post`(`status`);

-- 5. Post-Tag Junction Table
CREATE TABLE IF NOT EXISTS `bbs_post_tag` (
  `id` bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `post_id` bigint NOT NULL,
  `tag_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Neuron Comment Table
CREATE TABLE IF NOT EXISTS `bbs_comment` (
  `id` bigint NOT NULL PRIMARY KEY,
  `post_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `parent_id` bigint NOT NULL DEFAULT 0,
  `target_id` bigint NOT NULL DEFAULT 0,
  `content` text NOT NULL,
  `status` tinyint NOT NULL DEFAULT 1,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_comment_post_id` ON `bbs_comment`(`post_id`);
CREATE INDEX `idx_comment_parent_id` ON `bbs_comment`(`parent_id`);

-- 7. Message Table
CREATE TABLE IF NOT EXISTS `sys_message` (
  `id` bigint NOT NULL PRIMARY KEY,
  `from_user_id` bigint NOT NULL,
  `to_user_id` bigint NOT NULL,
  `content` text NOT NULL,
  `type` tinyint NOT NULL DEFAULT 1,
  `is_read` tinyint NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_msg_to_user` ON `sys_message`(`to_user_id`);
CREATE INDEX `idx_msg_from_user` ON `sys_message`(`from_user_id`);

-- 8. AI Review Log Table
CREATE TABLE IF NOT EXISTS `ai_review_log` (
  `id` bigint NOT NULL PRIMARY KEY,
  `post_id` bigint NOT NULL,
  `reviewer` varchar(50) NOT NULL DEFAULT 'code-review-agent',
  `result_json` text,
  `severity` varchar(20),
  `is_approved` tinyint DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. AI Review columns for vibe_post
ALTER TABLE `vibe_post` ADD COLUMN IF NOT EXISTS `code_snippets` text;
ALTER TABLE `vibe_post` ADD COLUMN IF NOT EXISTS `ai_reviewed` tinyint NOT NULL DEFAULT 0;
ALTER TABLE `vibe_post` ADD COLUMN IF NOT EXISTS `ai_review_score` int NOT NULL DEFAULT 0;
ALTER TABLE `vibe_post` ADD COLUMN IF NOT EXISTS `token_count` int NOT NULL DEFAULT 0;

-- =============================================================================
-- Seed Data (adapted from src/main/resources/data.sql for MySQL)
-- =============================================================================

-- Admin User (password: admin123 -> SHA-256)
INSERT INTO `sys_user` (`id`, `username`, `password`, `nickname`, `avatar`, `role`, `core_power`, `level`, `status`)
VALUES (1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Nexus Admin', 'default_avatar.png', 'ADMIN', 99999, 8, 1);

-- Demo User (password: test123)
INSERT INTO `sys_user` (`id`, `username`, `password`, `nickname`, `avatar`, `role`, `core_power`, `level`, `status`)
VALUES (2, 'testuser', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Test User', 'default_avatar.png', 'USER', 50, 1, 1);

INSERT INTO `vibe_channel` (`id`, `name`, `description`, `slug`, `sort_order`, `status`)
VALUES
(1, '社区公告', '系统公告、更新日志（管理员只读）', 'announcements', 1, 1),
(2, 'Prompt 工坊', 'System Prompt 设计、Chain-of-Thought、少样本技巧', 'prompts', 2, 1),
(3, '作品展示', 'Vibe Coding 成品展示：网页、工具、自动化流程', 'showcase', 3, 1),
(4, 'Agent 实战', 'Multi-Agent、工具调用、OpenClaw/Codex 使用心得', 'agents', 4, 1),
(5, 'Vibe Coding 经验', '上下文控制、幻觉治理、架构设计的纯经验讨论', 'vibe-coding', 5, 1),
(6, '代码急诊室', '贴报错上下文，社区或 AI Agent 协助分析', 'debug', 6, 1),
(7, '资源聚合', '工具链推荐、API 评测、教程链接', 'resources', 7, 1);

-- Tags
INSERT INTO `bbs_tag` (`id`, `name`, `status`)
VALUES
(1, 'Java', 1),
(2, 'Python', 1),
(3, 'Frontend', 1),
(4, 'Database', 1),
(5, 'AI/ML', 1),
(6, 'Cybersecurity', 1),
(7, 'DevOps', 1),
(8, 'Algorithm', 1),
(9, 'Campus', 1),
(10, 'Internship', 1);

-- Sample Posts
INSERT INTO `bbs_post` (`id`, `user_id`, `category_id`, `title`, `content`, `summary`, `view_count`, `like_count`, `comment_count`, `status`)
VALUES
(17921094810291, 2, 1, 'Welcome to Nexus Campus - The Cyberpunk Forum',

-- AI Agent System Account (id=999, non-login placeholder)
INSERT INTO `sys_user` (`id`, `username`, `password`, `nickname`, `avatar`, `role`, `core_power`, `level`, `status`)
VALUES (999, 'AiAgent', 'NOLOGIN_AI_AGENT_ACCOUNT', 'AI 助手', 'robot_avatar.png', 'AI_AGENT', 0, 1, 1);
'<h1>Welcome, Netrunners!</h1><p>This is the Nexus Campus Forum - a high-performance, cyberpunk-themed campus discussion platform.</p>',
'Welcome to Nexus Campus Forum.', 42, 7, 0, 1),
(17921094810292, 2, 1, 'Spring Boot Integrated ES Complete Guide',
'<h2>Elasticsearch Integration Guide</h2><p>Complete guide for integrating Elasticsearch with Spring Boot.</p>',
'Complete guide on integrating ES with Spring Boot.', 128, 24, 0, 1),
(17921094810293, 2, 2, 'Campus Cyberpunk Night - This Friday!',
'<h2>Event Announcement</h2><p>Join us this Friday for the Campus Cyberpunk Night!</p>',
'Join the Campus Cyberpunk Night this Friday.', 256, 42, 0, 1);
