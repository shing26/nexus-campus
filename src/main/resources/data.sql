-- Clear old data
DELETE FROM sys_message;
DELETE FROM bbs_comment;
DELETE FROM bbs_post_tag;
DELETE FROM bbs_post;
DELETE FROM bbs_tag;
DELETE FROM bbs_category;
DELETE FROM sys_user;

-- Users (password: 123456, SHA-256)
INSERT INTO sys_user (id, username, password, nickname, avatar, role, core_power, level, status, create_time, update_time) VALUES
(1, 'admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '系统管理员', 'default_avatar.png', 'ADMIN', 99999, 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'shing', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '阿星', 'default_avatar.png', 'USER', 2280, 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'alice', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Alice_学姐', 'default_avatar.png', 'USER', 1560, 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'bob', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Bob_开发者', 'default_avatar.png', 'USER', 920, 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Categories
INSERT INTO bbs_category (id, name, description, sort_order, status, create_time) VALUES
(1, '技术交流', 'Java, Python, 前端, 算法与高并发讨论', 1, 1, CURRENT_TIMESTAMP),
(2, '实习招聘', '秋招内推、校招面经与简历指导', 2, 1, CURRENT_TIMESTAMP),
(3, '校园生活', '日常吐槽、选课指南与校园趣事', 3, 1, CURRENT_TIMESTAMP),
(4, '二手交易', '闲置图书、数码宝贝与生活用品出让', 4, 1, CURRENT_TIMESTAMP);

-- Tags
INSERT INTO bbs_tag (id, name, status, create_time) VALUES
(1, 'Java', 1, CURRENT_TIMESTAMP),
(2, 'Redis', 1, CURRENT_TIMESTAMP),
(3, '秋招', 1, CURRENT_TIMESTAMP),
(4, '选课指南', 1, CURRENT_TIMESTAMP),
(5, '二手数码', 1, CURRENT_TIMESTAMP);

-- Posts (varying timestamps for Gravity Decay demo)
INSERT INTO bbs_post (id, title, content, user_id, category_id, status, like_count, comment_count, view_count, is_pinned, create_time) VALUES
(1, 'Nexus-Campus 社区系统架构重构实践分享！',
 '本项目基于 Spring Boot + Redis + Lua 脚本实现了分布式限流与高并发点赞写削峰。使用 DFA 敏感词过滤与 Redis ZSet 重力衰减热榜。',
 2, 1, 1, 85, 24, 320, 0, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(2, '字节跳动 Java 后端二面面经（含 Redis 深度追问）',
 '今天刚结束字节二面：1. Redis Lua 脚本怎么保证原子性？2. DFA 算法原理与 Trie 树实现。3. ZSet 热榜时间衰减公式推导。',
 3, 2, 1, 150, 45, 890, 0, DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(3, '2026 届计算机专业全栈自学路线图',
 '掌握 Spring全家桶、MySQL调优、Redis分布式锁以及Docker部署、K8s容器编排。一条龙自学路线。',
 1, 1, 1, 620, 180, 4500, 0, DATEADD('DAY', -7, CURRENT_TIMESTAMP)),
(4, '图书馆 4 楼空调效果太好了，有人一起自习吗？',
 '周末复习期末考，求组队自习打卡，自带冰美式咖啡！图书馆4楼靠窗位信号好、空调足。',
 4, 3, 1, 12, 5, 88, 0, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(5, '【待审核】出九成新 M2 MacPad 笔记本，可小刀',
 '毕业出闲置，九成新无拆修，附带原装充电器，感兴趣的私信！可当面验货。',
 3, 4, 2, 0, 0, 10, 0, CURRENT_TIMESTAMP);

-- Post-Tag associations
INSERT INTO bbs_post_tag (id, post_id, tag_id) VALUES
(1, 1, 1), (2, 1, 2),
(3, 2, 1), (4, 2, 3),
(5, 3, 1),
(6, 4, 4),
(7, 5, 5);

-- Comments
INSERT INTO bbs_comment (id, post_id, user_id, parent_id, target_id, content, status, create_time) VALUES
(1, 1, 3, 0, 0, '重构思路太清晰了！高并发点赞落盘机制学到了！', 1, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(2, 1, 4, 0, 0, '博主使用的 DFA 敏感词过滤是怎么做无感热更新的？', 1, DATEADD('MINUTE', -30, CURRENT_TIMESTAMP)),
(3, 2, 2, 0, 0, '感谢学姐分享，面试题已收录！', 1, DATEADD('HOUR', -18, CURRENT_TIMESTAMP));

-- System Messages
INSERT INTO sys_message (id, from_user_id, to_user_id, content, type, is_read, create_time) VALUES
(1, 3, 2, 'Alice_学姐 评论了你的帖子：Nexus-Campus 社区系统架构重构实践分享！', 2, 0, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(2, 4, 2, 'Bob_开发者 评论了你的帖子：Nexus-Campus 社区系统架构重构实践分享！', 2, 0, DATEADD('MINUTE', -30, CURRENT_TIMESTAMP)),
(3, 2, 1, '阿星 评论了你的帖子：2026 届计算机专业全栈自学路线图', 2, 0, DATEADD('DAY', -1, CURRENT_TIMESTAMP));