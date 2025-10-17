-- Migration script to update assets table
-- 1. Rename asset_type to status
-- 2. Remove available_units column
-- 3. Ensure type column exists

BEGIN TRANSACTION;

-- Create new table with correct schema
CREATE TABLE assets_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar_id INTEGER,
    status TEXT NOT NULL,
    type TEXT CHECK(length(type) <= 10),
    name TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    attack INTEGER NOT NULL CHECK(attack <= 100),
    defense INTEGER NOT NULL CHECK(defense <= 100),
    healing INTEGER NOT NULL CHECK(healing <= 100),
    power INTEGER NOT NULL,
    endurance INTEGER NOT NULL CHECK(endurance <= 100),
    level INTEGER NOT NULL CHECK(level <= 100),
    required_level INTEGER DEFAULT 0,
    cost INTEGER NOT NULL,
    ability TEXT NOT NULL,
    health INTEGER NOT NULL,
    stamina INTEGER NOT NULL,
    description TEXT,
    FOREIGN KEY (avatar_id) REFERENCES avatars(id)
);

-- Copy data from old table to new table (asset_type -> status)
INSERT INTO assets_new (id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, description)
SELECT id, avatar_id, asset_type, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, description 
FROM assets;

-- Drop old table
DROP TABLE assets;

-- Rename new table to assets
ALTER TABLE assets_new RENAME TO assets;

COMMIT;

