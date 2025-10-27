-- Migration: Rename required_level to required_knowledge and change type from INTEGER to REAL
-- This migration updates the assets table to use required_knowledge with decimal support

BEGIN TRANSACTION;

-- Step 1: Create new assets table with required_knowledge
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
    required_knowledge REAL DEFAULT 0 CHECK(required_knowledge >= 0 AND required_knowledge <= 99.99),
    cost INTEGER NOT NULL,
    ability TEXT NOT NULL,
    health INTEGER NOT NULL,
    stamina INTEGER NOT NULL,
    description TEXT,
    FOREIGN KEY (avatar_id) REFERENCES avatars(id)
);

-- Step 2: Copy data from old table to new table
-- Convert required_level INTEGER to required_knowledge REAL
INSERT INTO assets_new (id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_knowledge, cost, ability, health, stamina, description)
SELECT id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, CAST(required_level AS REAL), cost, ability, health, stamina, description FROM assets;

-- Step 3: Drop old table
DROP TABLE assets;

-- Step 4: Rename new table to assets
ALTER TABLE assets_new RENAME TO assets;

COMMIT;

