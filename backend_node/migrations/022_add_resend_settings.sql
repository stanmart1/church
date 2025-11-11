INSERT INTO settings (key, value, category) VALUES 
  ('resend_api_key', '', 'notifications'),
  ('resend_from_email', '', 'notifications')
ON CONFLICT (key) DO NOTHING;
