-- Update users table role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'pastor', 'minister', 'staff', 'member'));

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, permission_id)
);

-- Insert permissions
INSERT INTO permissions (name, description) VALUES
  ('manage_users', 'Create, update, and delete users'),
  ('manage_members', 'Manage church members'),
  ('manage_sermons', 'Upload and manage sermons'),
  ('manage_events', 'Create and manage events'),
  ('manage_announcements', 'Create and manage announcements'),
  ('manage_forms', 'Create and manage forms'),
  ('manage_giving', 'View and manage giving records'),
  ('manage_livestream', 'Control livestream settings'),
  ('manage_content', 'Edit website content'),
  ('manage_settings', 'Modify system settings'),
  ('view_reports', 'Access reports and analytics'),
  ('view_members', 'View member information'),
  ('view_sermons', 'Access sermon library'),
  ('view_events', 'View events'),
  ('register_events', 'Register for events')
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Assign permissions to pastor role
INSERT INTO role_permissions (role, permission_id)
SELECT 'pastor', id FROM permissions 
WHERE name IN ('manage_members', 'manage_sermons', 'manage_events', 'manage_announcements', 'manage_forms', 'manage_giving', 'manage_livestream', 'manage_content', 'view_reports', 'view_members', 'view_sermons', 'view_events')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Assign permissions to minister role
INSERT INTO role_permissions (role, permission_id)
SELECT 'minister', id FROM permissions 
WHERE name IN ('manage_sermons', 'manage_events', 'manage_announcements', 'view_members', 'view_sermons', 'view_events', 'view_reports')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Assign permissions to staff role
INSERT INTO role_permissions (role, permission_id)
SELECT 'staff', id FROM permissions 
WHERE name IN ('manage_members', 'manage_events', 'manage_forms', 'view_members', 'view_sermons', 'view_events')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Assign permissions to member role
INSERT INTO role_permissions (role, permission_id)
SELECT 'member', id FROM permissions 
WHERE name IN ('view_sermons', 'view_events', 'register_events')
ON CONFLICT (role, permission_id) DO NOTHING;

CREATE INDEX idx_role_permissions_role ON role_permissions(role);
