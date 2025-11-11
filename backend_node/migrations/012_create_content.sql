CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO content (key, value) VALUES 
  ('welcome_message', 'Welcome to Bibleway Fellowship Tabernacle'),
  ('about_us', 'We are a community of believers dedicated to spreading the Gospel'),
  ('service_times', '{"sunday": "10:00 AM", "wednesday": "7:00 PM"}')
ON CONFLICT (key) DO NOTHING;
