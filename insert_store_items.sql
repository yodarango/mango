-- Insert or update store items
-- Delete existing store items with the same name, then insert new ones

BEGIN TRANSACTION;

-- Alpha
DELETE FROM assets WHERE name = 'alpha' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'alpha', '/src/assets/store/alpha.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100);

-- Beta
DELETE FROM assets WHERE name = 'beta' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'beta', '/src/assets/store/beta.webp', 43, 21, 27, 0, 37, 1, 5, 200, '', 100, 100);

-- Gamma
DELETE FROM assets WHERE name = 'gamma' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'gamma', '/src/assets/store/gamma.webp', 4, 10, 25, 0, 16, 1, 1, 85, '', 100, 100);

-- Delta
DELETE FROM assets WHERE name = 'delta' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'delta', '/src/assets/store/delta.webp', 17, 11, 9, 0, 13, 1, 1, 70, '', 100, 100);

-- Epsilon
DELETE FROM assets WHERE name = 'epsilon' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'epsilon', '/src/assets/store/epsilon.webp', 47, 33, 16, 0, 11, 1, 4, 175, '', 100, 100);

-- Zeta
DELETE FROM assets WHERE name = 'zeta' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'zeta', '/src/assets/store/zeta.webp', 51, 44, 26, 0, 17, 1, 5, 190, '', 100, 100);

-- Eta
DELETE FROM assets WHERE name = 'eta' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'eta', '/src/assets/store/eta.webp', 38, 22, 30, 0, 25, 1, 4, 150, '', 100, 100);

-- Theta
DELETE FROM assets WHERE name = 'theta' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'theta', '/src/assets/store/theta.webp', 29, 21, 24, 0, 29, 1, 3, 135, '', 100, 100);

-- Iota
DELETE FROM assets WHERE name = 'iota' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'iota', '/src/assets/store/iota.webp', 19, 8, 13, 0, 17, 1, 1, 95, '', 100, 100);

-- Kappa
DELETE FROM assets WHERE name = 'kappa' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'kappa', '/src/assets/store/kappa.webp', 23, 19, 21, 0, 13, 1, 2, 110, '', 100, 100);

-- Lambda
DELETE FROM assets WHERE name = 'lambda' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'lambda', '/src/assets/store/lambda.webp', 55, 47, 39, 0, 31, 1, 5, 215, '', 100, 100);

-- Mu
DELETE FROM assets WHERE name = 'mu' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'mu', '/src/assets/store/mu.webp', 20, 23, 21, 0, 29, 1, 2, 120, '', 100, 100);

-- Nu
DELETE FROM assets WHERE name = 'nu' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'nu', '/src/assets/store/nu.webp', 25, 25, 19, 0, 17, 1, 2, 115, '', 100, 100);

-- Xi
DELETE FROM assets WHERE name = 'xi' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'xi', '/src/assets/store/xi.webp', 50, 40, 47, 0, 58, 1, 5, 210, '', 100, 100);

-- Sigma
DELETE FROM assets WHERE name = 'sigma' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'sigma', '/src/assets/store/sigma.webp', 31, 39, 30, 0, 39, 1, 3, 145, '', 100, 100);

-- Pi
DELETE FROM assets WHERE name = 'pi' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'pi', '/src/assets/store/pi.webp', 47, 40, 41, 0, 33, 1, 4, 160, '', 100, 100);

-- Rho
DELETE FROM assets WHERE name = 'rho' AND asset_type = 'store';
INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES (NULL, 'store', 'rho', '/src/assets/store/rho.webp', 42, 39, 44, 0, 34, 1, 4, 155, '', 100, 100);

COMMIT;

