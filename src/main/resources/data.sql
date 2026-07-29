-- Clear old data
DELETE FROM sys_message;
DELETE FROM vibe_comment;
DELETE FROM vibe_post_tag;
DELETE FROM vibe_post;
DELETE FROM vibe_tag;
DELETE FROM vibe_channel;
DELETE FROM sys_user;

-- Users (password: 123456, SHA-256)
INSERT INTO sys_user (id, username, password, nickname, avatar, role, core_power, level, status, create_time, update_time) VALUES
(1, 'admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'System Admin', 'default_avatar.png', 'ADMIN', 99999, 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'shing', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'shing', 'default_avatar.png', 'USER', 2280, 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'alice', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Alice', 'default_avatar.png', 'USER', 1560, 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'bob', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Bob', 'default_avatar.png', 'USER', 920, 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Channels (AI Community Channels with slugs)
INSERT INTO vibe_channel (id, name, description, slug, sort_order, status, create_time) VALUES
(1, '社区公告', '系统公告、更新日志（管理员只读）', 'announcements', 1, 1, CURRENT_TIMESTAMP),
(2, 'Prompt 工坊', 'System Prompt 设计、Chain-of-Thought、少样本技巧', 'prompts', 2, 1, CURRENT_TIMESTAMP),
(3, '作品展示', 'Vibe Coding 成品展示：网页、工具、自动化流程', 'showcase', 3, 1, CURRENT_TIMESTAMP),
(4, 'Agent 实战', 'Multi-Agent、工具调用、OpenClaw/Codex 使用心得', 'agents', 4, 1, CURRENT_TIMESTAMP),
(5, 'Vibe Coding 经验', '上下文控制、幻觉治理、架构设计的纯经验讨论', 'vibe-coding', 5, 1, CURRENT_TIMESTAMP),
(6, '代码急诊室', '贴报错上下文，社区或 AI Agent 协助分析', 'debug', 6, 1, CURRENT_TIMESTAMP),
(7, '资源聚合', '工具链推荐、API 评测、教程链接', 'resources', 7, 1, CURRENT_TIMESTAMP);

-- Tags
INSERT INTO vibe_tag (id, name, status, create_time) VALUES
(1, 'GPT-4', 1, CURRENT_TIMESTAMP),
(2, 'Claude', 1, CURRENT_TIMESTAMP),
(3, 'Stable Diffusion', 1, CURRENT_TIMESTAMP),
(4, 'RAG', 1, CURRENT_TIMESTAMP),
(5, 'Fine-tuning', 1, CURRENT_TIMESTAMP),
(6, 'Agents', 1, CURRENT_TIMESTAMP),
(7, 'Open Source', 1, CURRENT_TIMESTAMP);

-- Posts (varying timestamps for Gravity Decay demo)
INSERT INTO vibe_post (id, title, content, user_id, category_id, status, like_count, comment_count, view_count, is_pinned, post_type, create_time) VALUES
(1, 'Building a RAG pipeline with LangChain and Claude 3',
 'A step-by-step guide to building a production-ready RAG pipeline: document chunking strategies, embedding selection, vector store optimization with pgvector, and prompt templates for Claude 3. Includes benchmark comparisons across different chunk sizes.',
 2, 4, 1, 85, 24, 320, 0, 'post', DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(2, 'Fine-tuning Llama 3 on domain-specific code: lessons learned',
 'Deep dive into fine-tuning Llama 3 8B on a custom Python code dataset. Covers LoRA rank selection, dataset preparation, QLoRA vs full fine-tuning tradeoffs, and evaluation benchmarks vs GPT-3.5.',
 3, 5, 1, 150, 45, 890, 0, 'post', DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(3, 'Claude Computer Use: building autonomous browser agents',
 'Exploring Anthropic computer use capabilities: how to build agents that can browse, fill forms, extract data, and navigate complex web UIs autonomously. Includes safety guardrails and rate limiting strategies.',
 1, 4, 1, 620, 180, 4500, 0, 'post', DATEADD('DAY', -7, CURRENT_TIMESTAMP)),
(4, 'Prompt patterns for reliable structured output from LLMs',
 'A collection of battle-tested prompt patterns for getting consistent JSON output: role-locked formatting, chain-of-thought with schema enforcement, XML-tagged responses, and few-shot template design. Benchmarked across GPT-4, Claude 3.5, and Gemini.',
 4, 1, 1, 230, 67, 1200, 0, 'post', DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(5, '[Pending Audit] AI-generated music with Stable Audio and Suno: a comparison',
 'Comparing AI music generation platforms: prompt engineering for music, genre adherence, audio quality, and commercial usage rights. Includes sample outputs and production workflow recommendations.',
 3, 7, 2, 0, 0, 10, 0, 'post', CURRENT_TIMESTAMP);

-- Prompt Template Posts
INSERT INTO vibe_post (id, title, content, user_id, category_id, status, like_count, comment_count, view_count, is_pinned, post_type, prompt_metadata, create_time) VALUES
(100, 'React Component Generator',
 'Create a React component that follows best practices. Define the component name, props interface, and any specific features you need. The component should be type-safe with TypeScript, include proper JSDoc comments, and handle loading/error/empty states.',
 1, 2, 1, 42, 8, 560, 0, 'prompt', '{"role":"You are a senior React developer specializing in component architecture. Generate clean, composable, and well-documented React components with TypeScript. Follow SOLID principles and React best practices.","recommendedModel":"gpt-4o","temperature":0.7,"variables":["componentName","features"]}', DATEADD('DAY', -3, CURRENT_TIMESTAMP)),
(101, 'Tailwind UI Prompt Architect',
 'Design a responsive layout using Tailwind CSS. Specify the layout structure, color scheme preferences, and any specific UI patterns you want to include. The generated code should be production-ready with proper responsive breakpoints and accessibility attributes.',
 2, 2, 1, 35, 5, 420, 0, 'prompt', '{"role":"You are a Tailwind CSS expert and UI designer. Create beautiful, responsive, and accessible layouts using Tailwind CSS utility classes. Prioritize mobile-first design and adhere to WCAG 2.1 AA standards.","recommendedModel":"gpt-4o","temperature":0.5,"variables":["layout","colorScheme"]}', DATEADD('DAY', -1, CURRENT_TIMESTAMP));

-- Post-Tag associations
INSERT INTO vibe_post_tag (id, post_id, tag_id) VALUES
(1, 1, 2), (2, 1, 4),
(3, 2, 5), (4, 2, 7),
(5, 3, 6), (6, 3, 2),
(7, 4, 1), (8, 5, 3),
(9, 100, 1), (10, 100, 6),
(11, 101, 2), (12, 101, 7);

-- Comments
INSERT INTO vibe_comment (id, post_id, user_id, parent_id, target_id, content, status, create_time) VALUES
(1, 1, 3, 0, 0, 'Great walkthrough! Which embedding model did you use for the Chinese documents?', 1, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(2, 1, 4, 0, 0, 'Have you tried using parent-child chunking for better retrieval?', 1, DATEADD('MINUTE', -30, CURRENT_TIMESTAMP)),
(3, 2, 2, 0, 0, 'Thanks for sharing! The benchmark results are really insightful.', 1, DATEADD('HOUR', -18, CURRENT_TIMESTAMP));

-- System Messages
INSERT INTO sys_message (id, from_user_id, to_user_id, content, type, is_read, create_time) VALUES
(1, 3, 2, 'Alice commented on your post: Building a RAG pipeline with LangChain and Claude 3', 2, 0, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(2, 4, 2, 'Bob commented on your post: Building a RAG pipeline with LangChain and Claude 3', 2, 0, DATEADD('MINUTE', -30, CURRENT_TIMESTAMP)),
(3, 2, 1, 'shing commented on your post: Claude Computer Use: building autonomous browser agents', 2, 0, DATEADD('DAY', -1, CURRENT_TIMESTAMP));

-- AI Agent System Account (id=999, non-login placeholder)
INSERT INTO sys_user (id, username, password, nickname, avatar, role, core_power, level, status, create_time, update_time)
VALUES
(5, 'testuser', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Test User', 'default_avatar.png', 'USER', 50, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(999, 'AiAgent', 'NOLOGIN_AI_AGENT_ACCOUNT', 'AI 助手', 'robot_avatar.png', 'AI_AGENT', 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
