CREATE TABLE blog_redirects (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  from_slug VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  to_slug VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status_code SMALLINT UNSIGNED NOT NULL DEFAULT 301,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_redirect_from (from_slug),
  KEY idx_redirect_to (to_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
