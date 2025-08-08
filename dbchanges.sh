
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
     "createdAt" TIMESTAMP DEFAULT NOW(),           -- Record creation timestamp
    "updatedAt" TIMESTAMP DEFAULT NOW() ON UPDATE NOW()  -- Record update timestamp
);

CREATE TABLE user_address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address_line_1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
     "createdAt" TIMESTAMP DEFAULT NOW(),           -- Record creation timestamp
    "updatedAt" TIMESTAMP DEFAULT NOW())
CREATE TABLE specialities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
     "createdAt" TIMESTAMP DEFAULT NOW(),           -- Record creation timestamp
    "updatedAt" TIMESTAMP DEFAULT NOW() ON UPDATE NOW()  -- Record update timestamp
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,              
    email VARCHAR(100) UNIQUE NOT NULL,           -- User's email (must be unique)
    phone_number VARCHAR(20) UNIQUE NOT NULL,     -- User's phone number (must be unique)
    password TEXT NOT NULL,                       -- Hashed password for security
    parent_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Refers to another user as a parent (e.g., hospital owner)
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,  -- User role reference (admin, doctor, customer, etc.)
    address_id UUID REFERENCES user_address(id) ON DELETE SET NULL,  -- Address reference
    specialities_id UUID REFERENCES specialities(id) ON DELETE SET NULL,  -- Specialities reference (for doctors)
    city VARCHAR(100) NOT NULL,                   -- User's city
    is_active BOOLEAN DEFAULT TRUE,               -- User's active status
    image TEXT,                                   -- Profile picture URL
    details TEXT,                                 -- Additional user details
    "createdAt" TIMESTAMP DEFAULT NOW(),           -- Record creation timestamp
    "updatedAt" TIMESTAMP DEFAULT NOW() ON UPDATE NOW()  -- Record update timestamp
);



CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,      -- Location name (e.g., "New York", "Mumbai")
    latitude DECIMAL(9,6),          -- Optional: Store latitude
    longitude DECIMAL(9,6),         -- Optional: Store longitude
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


ALTER TABLE users ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

ALTER TABLE appointments ADD COLUMN name VARCHAR(255) NOT NULL;
ALTER TABLE appointments ADD COLUMN location VARCHAR(255) NOT NULL;
ALTER TABLE appointments ADD COLUMN consultationType VARCHAR(255) NOT NULL;
ALTER TABLE appointments ADD COLUMN healthConcern VARCHAR(255) NOT NULL;
ALTER TABLE appointments ADD COLUMN fee FLOAT NOT NULL;
