-- database/schema.sql
-- MySQL Schema for Gemini Pro Studio
-- Version: 1.0.0
-- Date: 1403/03/20

-- حذف و ایجاد مجدد دیتابیس
DROP DATABASE IF EXISTS gemini_pro_studio;
CREATE DATABASE gemini_pro_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;
USE gemini_pro_studio;

-- تنظیمات منطقه زمانی
SET time_zone = '+03:30';

-- ===========================
-- جداول اصلی سیستم
-- ===========================

-- جدول کاربران
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    
    -- تنظیمات کاربری
    theme ENUM('light', 'dark', 'auto') DEFAULT 'auto',
    language VARCHAR(10) DEFAULT 'fa',
    timezone VARCHAR(50) DEFAULT 'Asia/Tehran',
    
    -- وضعیت حساب
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- API و اعتبار
    api_usage_limit INT DEFAULT 100,
    api_usage_count INT DEFAULT 0,
    premium_expires_at TIMESTAMP NULL,
    
    -- زمان‌ها
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_uuid (uuid),
    INDEX idx_created_at (created_at)
);

-- جدول کلیدهای API
CREATE TABLE api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    api_key VARCHAR(500) NOT NULL,
    provider ENUM('google', 'openai', 'anthropic') DEFAULT 'google',
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INT DEFAULT 1000,
    usage_count INT DEFAULT 0,
    
    -- تنظیمات کلید
    allowed_models JSON,
    rate_limit_per_minute INT DEFAULT 60,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_provider (provider)
);

-- جدول مکالمات
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- تنظیمات مکالمه
    model_name VARCHAR(100) DEFAULT 'gemini-pro',
    system_prompt TEXT,
    temperature DECIMAL(3,2) DEFAULT 0.70,
    max_tokens INT DEFAULT 1000,
    top_p DECIMAL(3,2) DEFAULT 0.90,
    top_k INT DEFAULT 40,
    
    -- متادیتا
    message_count INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0.0000,
    
    -- وضعیت
    is_archived BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100) UNIQUE NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_uuid (uuid),
    INDEX idx_created_at (created_at),
    INDEX idx_last_message_at (last_message_at),
    INDEX idx_model_name (model_name)
);

-- جدول پیام‌ها
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    conversation_id INT NOT NULL,
    
    -- محتوای پیام
    role ENUM('user', 'assistant', 'system') NOT NULL,
    content TEXT NOT NULL,
    content_type ENUM('text', 'image', 'audio', 'file') DEFAULT 'text',
    
    -- فایل‌های ضمیمه
    attachments JSON,
    
    -- آمار
    token_count INT DEFAULT 0,
    cost DECIMAL(8,4) DEFAULT 0.0000,
    response_time_ms INT DEFAULT 0,
    
    -- متادیتا
    model_used VARCHAR(100),
    api_key_used INT,
    request_id VARCHAR(100),
    
    -- وضعیت
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    parent_message_id INT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_used) REFERENCES api_keys(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_uuid (uuid),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    INDEX idx_content_type (content_type)
);

-- جدول فایل‌ها
CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    
    -- اطلاعات فایل
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- نوع فایل
    file_type ENUM('image', 'audio', 'video', 'document', 'other') NOT NULL,
    
    -- متادیتا
    width INT NULL,
    height INT NULL,
    duration INT NULL,
    
    -- وضعیت پردازش
    is_processed BOOLEAN DEFAULT FALSE,
    processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processed_data JSON,
    
    -- OCR و تحلیل
    extracted_text TEXT,
    analysis_result JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_uuid (uuid),
    INDEX idx_file_type (file_type),
    INDEX idx_mime_type (mime_type),
    INDEX idx_created_at (created_at)
);

-- جدول برچسب‌ها
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- HEX color
    icon VARCHAR(50) DEFAULT 'tag',
    description TEXT,
    
    -- آمار استفاده
    usage_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tag (user_id, name),
    INDEX idx_user_id (user_id),
    INDEX idx_name (name)
);

-- جدول ارتباط برچسب‌ها با آیتم‌ها
CREATE TABLE taggables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_id INT NOT NULL,
    taggable_type ENUM('conversation', 'message', 'file') NOT NULL,
    taggable_id INT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag_item (tag_id, taggable_type, taggable_id),
    INDEX idx_tag_id (tag_id),
    INDEX idx_taggable (taggable_type, taggable_id)
);

-- جدول آمار استفاده
CREATE TABLE usage_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    api_key_id INT,
    
    -- نوع عملیات
    operation_type ENUM('chat', 'text_generation', 'image_analysis', 'audio_processing', 'ocr') NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    
    -- آمار
    tokens_input INT DEFAULT 0,
    tokens_output INT DEFAULT 0,
    cost DECIMAL(8,4) DEFAULT 0.0000,
    response_time_ms INT DEFAULT 0,
    
    -- وضعیت
    status ENUM('success', 'error', 'timeout') DEFAULT 'success',
    error_message TEXT NULL,
    
    -- زمان‌بندی
    date DATE NOT NULL,
    hour TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_operation_type (operation_type),
    INDEX idx_model_used (model_used),
    INDEX idx_created_at (created_at)
);

-- جدول تنظیمات
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_setting (user_id, category, key_name),
    INDEX idx_user_id (user_id),
    INDEX idx_category (category)
);

-- جدول قالب‌های آماده
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    
    -- محتوای قالب
    prompt_template TEXT NOT NULL,
    variables JSON, -- متغیرهای قابل تعویض
    
    -- تنظیمات
    model_settings JSON,
    
    -- وضعیت
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public),
    INDEX idx_usage_count (usage_count)
);

-- جدول نشست‌ها (Sessions)
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    data JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- جدول لاگ‌ها
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    INDEX idx_entity (entity_type, entity_id)
);

-- ===========================
-- دیتای اولیه (Seed Data)
-- ===========================

-- کاربر پیش‌فرض admin
INSERT INTO users (
    uuid, email, username, password_hash, first_name, last_name,
    is_active, is_premium, api_usage_limit
) VALUES (
    UUID(), 'admin@gemini-studio.com', 'admin',
    '$2b$10$rGOFvAH7Dp0.eRILV1D4uO1sJT9.TcGvCNp8St1gyN6P8zx8VZBGW', -- password: admin123
    'مدیر', 'سیستم',
    TRUE, TRUE, 10000
);

-- برچسب‌های پیش‌فرض
INSERT INTO tags (user_id, name, color, icon, description) VALUES
(1, 'مهم', '#ff4444', 'priority_high', 'مکالمات مهم و اولویت‌دار'),
(1, 'کار', '#2196f3', 'work', 'مکالمات مربوط به کار'),
(1, 'شخصی', '#4caf50', 'person', 'مکالمات شخصی'),
(1, 'تحقیق', '#ff9800', 'search', 'تحقیق و مطالعه'),
(1, 'برنامه‌نویسی', '#9c27b0', 'code', 'کدنویسی و برنامه‌نویسی');

-- قالب‌های آماده
INSERT INTO templates (name, description, category, prompt_template, variables, model_settings, is_public, is_featured) VALUES
('نوشتن مقاله', 'قالب نوشتن مقاله تخصصی', 'content', 
 'یک مقاله جامع و تخصصی درباره {{topic}} بنویس. مقاله باید شامل مقدمه، بدنه اصلی با زیرعناوین و نتیجه‌گیری باشد.',
 '{"topic": "موضوع مقاله"}',
 '{"temperature": 0.7, "maxTokens": 2000}',
 TRUE, TRUE),

('ترجمه حرفه‌ای', 'ترجمه متن با حفظ معنا و بافت', 'translation',
 'متن زیر را از {{source_lang}} به {{target_lang}} ترجمه کن:\n\n{{text}}',
 '{"source_lang": "زبان مبدا", "target_lang": "زبان مقصد", "text": "متن"}',
 '{"temperature": 0.3, "maxTokens": 1500}',
 TRUE, TRUE),

('کد ریویو', 'بررسی و بهبود کد برنامه‌نویسی', 'programming',
 'کد زیر را بررسی کن و پیشنهادات بهبود ارائه بده:\n\n```{{language}}\n{{code}}\n```',
 '{"language": "زبان برنامه‌نویسی", "code": "کد برنامه"}',
 '{"temperature": 0.4, "maxTokens": 1500}',
 TRUE, TRUE);

-- تنظیمات پیش‌فرض سیستم
INSERT INTO settings (user_id, category, key_name, value, data_type) VALUES
(1, 'general', 'default_model', 'gemini-pro', 'string'),
(1, 'general', 'default_temperature', '0.7', 'number'),
(1, 'general', 'default_max_tokens', '1000', 'number'),
(1, 'ui', 'items_per_page', '20', 'number'),
(1, 'ui', 'auto_save_interval', '30000', 'number'),
(1, 'security', 'session_timeout', '86400', 'number');

-- ===========================
-- ایجاد ویو‌ها (Views)
-- ===========================

-- ویو آمار کلی کاربر
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT m.id) as total_messages,
    COALESCE(SUM(us.tokens_input), 0) as total_input_tokens,
    COALESCE(SUM(us.tokens_output), 0) as total_output_tokens,
    COALESCE(SUM(us.cost), 0) as total_cost,
    u.created_at as joined_at,
    u.last_login
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
LEFT JOIN messages m ON c.id = m.conversation_id
LEFT JOIN usage_stats us ON u.id = us.user_id
GROUP BY u.id;

-- ویو مکالمات با برچسب‌ها
CREATE VIEW conversations_with_tags AS
SELECT 
    c.*,
    GROUP_CONCAT(t.name) as tag_names,
    GROUP_CONCAT(t.color) as tag_colors
FROM conversations c
LEFT JOIN taggables tg ON c.id = tg.taggable_id AND tg.taggable_type = 'conversation'
LEFT JOIN tags t ON tg.tag_id = t.id
GROUP BY c.id;

COMMIT;