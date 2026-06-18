-- ============================================================
-- COLLEGE LMS — AUTH SUPPORT (password reset tokens)
-- ============================================================

USE college_lms;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id    INT           AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    token       VARCHAR(255)  NOT NULL UNIQUE,
    expires_at  DATETIME      NOT NULL,
    used        BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reset_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_reset_token (token),
    INDEX idx_reset_user (user_id)
) ENGINE=InnoDB;
