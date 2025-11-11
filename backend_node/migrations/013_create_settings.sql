CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value, category) VALUES 
  ('church_name', 'Bibleway Fellowship Tabernacle', 'general'),
  ('church_email', 'info@bibleway.org', 'general'),
  ('church_phone', '+1 (555) 123-4567', 'general'),
  ('church_address', '123 Church Street, City, State 12345', 'general'),
  ('enable_notifications', 'true', 'notifications'),
  ('enable_email_alerts', 'true', 'notifications')
ON CONFLICT (key) DO NOTHING;
