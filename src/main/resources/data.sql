-- Nexus-Campus Seed Data

-- Admin User (password: admin123 -> SHA-256)
MERGE INTO `sys_user` (`id`, `username`, `password`, `nickname`, `avatar`, `role`, `core_power`, `level`, `status`) KEY(username) VALUES
(1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Nexus Admin', 'default_avatar.png', 'ADMIN', 99999, 8, 1);

-- Demo User (password: test123)
MERGE INTO `sys_user` (`id`, `username`, `password`, `nickname`, `avatar`, `role`, `core_power`, `level`, `status`) KEY(username) VALUES
(2, 'testuser', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Test User', 'default_avatar.png', 'USER', 50, 1, 1);

-- Categories
MERGE INTO `bbs_category` (`id`, `name`, `description`, `sort_order`, `status`) KEY(id) VALUES
(1, 'Technical Exchange', 'Coding, architecture, and technology discussions', 1, 1),
(2, 'Life Sharing', 'Campus life, hobbies, and daily experiences', 2, 1),
(3, 'Academic Frontier', 'Research, papers, and academic resources', 3, 1),
(4, 'Career Development', 'Internships, jobs, and career planning', 4, 1),
(5, 'Creative Space', 'Art, music, writing, and creative projects', 5, 1);

-- Tags
MERGE INTO `bbs_tag` (`id`, `name`, `status`) KEY(id) VALUES
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
MERGE INTO `bbs_post` (`id`, `user_id`, `category_id`, `title`, `content`, `summary`, `view_count`, `like_count`, `comment_count`, `status`) KEY(id) VALUES
(17921094810291, 2, 1, 'Welcome to Nexus Campus - The Cyberpunk Forum', '<h1>Welcome, Netrunners!</h1><p>This is the Nexus Campus Forum - a high-performance, cyberpunk-themed campus discussion platform. Here you can:</p><ul><li>Share technical knowledge</li><li>Discuss campus life</li><li>Explore academic frontiers</li><li>Network with fellow students</li></ul><p>Stay tuned for more features. The future is now.</p>', 'Welcome to Nexus Campus Forum - a cyberpunk-themed campus discussion platform for tech, life, and academic exchange.', 42, 7, 0, 1),
(17921094810292, 2, 1, 'Spring Boot 整合 ES 核心全景指南', '<h2>Elasticsearch Integration Guide</h2><p>This guide covers the complete process of integrating Elasticsearch with Spring Boot, including:</p><ol><li>Configuration and setup</li><li>Repository pattern</li><li>Full-text search implementation</li><li>Performance optimization</li></ol>', 'Complete guide on integrating Elasticsearch with Spring Boot for high-performance full-text search.', 128, 24, 0, 1),
(17921094810293, 2, 2, 'Campus Cyberpunk Night - This Friday!', '<h2>Event Announcement</h2><p>Join us this Friday for the Campus Cyberpunk Night! There will be:</p><ul><li>Neon light art exhibition</li><li>Tech demos and workshops</li><li>Live coding battles</li><li>Synthwave music</li></ul><p>Location: Building 7, Room 301</p>', 'Join the Campus Cyberpunk Night this Friday with neon art, tech demos, coding battles, and synthwave music.', 256, 42, 0, 1);
