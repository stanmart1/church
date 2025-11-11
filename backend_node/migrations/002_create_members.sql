CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'visitor')),
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'leader', 'volunteer')),
  birthday DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female')),
  marital_status VARCHAR(50) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(membership_status);
