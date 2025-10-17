-- Insert or update store items
-- Delete existing store items by type, then insert new ones
-- Each type has 5 instances available for purchase

BEGIN TRANSACTION;

-- Alpha (type: alpha)
DELETE FROM assets WHERE type = 'alpha' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'alpha', 'alpha', '/src/assets/store/alpha.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'alpha', 'alpha', '/src/assets/store/alpha.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'alpha', 'alpha', '/src/assets/store/alpha.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'alpha', 'alpha', '/src/assets/store/alpha.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'alpha', 'alpha', '/src/assets/store/alpha.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100);

-- Beta (type: beta)
DELETE FROM assets WHERE type = 'beta' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'beta', 'beta', '/src/assets/store/beta.webp', 43, 21, 27, 0, 37, 1, 5, 200, '', 100, 100),
  (NULL, 'store', 'beta', 'beta', '/src/assets/store/beta.webp', 43, 21, 27, 0, 37, 1, 5, 200, '', 100, 100),
  (NULL, 'store', 'beta', 'beta', '/src/assets/store/beta.webp', 43, 21, 27, 0, 37, 1, 5, 200, '', 100, 100),
  (NULL, 'store', 'beta', 'beta', '/src/assets/store/beta.webp', 43, 21, 27, 0, 37, 1, 5, 200, '', 100, 100),
  (NULL, 'store', 'beta', 'beta', '/src/assets/store/beta.webp', 43, 21, 27, 0, 37, 1, 5, 200, '', 100, 100);

-- Gamma (type: gamma)
DELETE FROM assets WHERE type = 'gamma' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'gamma', 'gamma', '/src/assets/store/gamma.webp', 4, 10, 25, 0, 16, 1, 1, 85, '', 100, 100),
  (NULL, 'store', 'gamma', 'gamma', '/src/assets/store/gamma.webp', 4, 10, 25, 0, 16, 1, 1, 85, '', 100, 100),
  (NULL, 'store', 'gamma', 'gamma', '/src/assets/store/gamma.webp', 4, 10, 25, 0, 16, 1, 1, 85, '', 100, 100),
  (NULL, 'store', 'gamma', 'gamma', '/src/assets/store/gamma.webp', 4, 10, 25, 0, 16, 1, 1, 85, '', 100, 100),
  (NULL, 'store', 'gamma', 'gamma', '/src/assets/store/gamma.webp', 4, 10, 25, 0, 16, 1, 1, 85, '', 100, 100);

-- Delta (type: delta)
DELETE FROM assets WHERE type = 'delta' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'delta', 'delta', '/src/assets/store/delta.webp', 17, 11, 9, 0, 13, 1, 1, 70, '', 100, 100),
  (NULL, 'store', 'delta', 'delta', '/src/assets/store/delta.webp', 17, 11, 9, 0, 13, 1, 1, 70, '', 100, 100),
  (NULL, 'store', 'delta', 'delta', '/src/assets/store/delta.webp', 17, 11, 9, 0, 13, 1, 1, 70, '', 100, 100),
  (NULL, 'store', 'delta', 'delta', '/src/assets/store/delta.webp', 17, 11, 9, 0, 13, 1, 1, 70, '', 100, 100),
  (NULL, 'store', 'delta', 'delta', '/src/assets/store/delta.webp', 17, 11, 9, 0, 13, 1, 1, 70, '', 100, 100);

-- Epsilon (type: epsilon)
DELETE FROM assets WHERE type = 'epsilon' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'epsilon', 'epsilon', '/src/assets/store/epsilon.webp', 47, 33, 16, 0, 11, 1, 4, 175, '', 100, 100),
  (NULL, 'store', 'epsilon', 'epsilon', '/src/assets/store/epsilon.webp', 47, 33, 16, 0, 11, 1, 4, 175, '', 100, 100),
  (NULL, 'store', 'epsilon', 'epsilon', '/src/assets/store/epsilon.webp', 47, 33, 16, 0, 11, 1, 4, 175, '', 100, 100),
  (NULL, 'store', 'epsilon', 'epsilon', '/src/assets/store/epsilon.webp', 47, 33, 16, 0, 11, 1, 4, 175, '', 100, 100),
  (NULL, 'store', 'epsilon', 'epsilon', '/src/assets/store/epsilon.webp', 47, 33, 16, 0, 11, 1, 4, 175, '', 100, 100);

-- Zeta (type: zeta)
DELETE FROM assets WHERE type = 'zeta' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'zeta', 'zeta', '/src/assets/store/zeta.webp', 51, 44, 26, 0, 17, 1, 5, 190, '', 100, 100),
  (NULL, 'store', 'zeta', 'zeta', '/src/assets/store/zeta.webp', 51, 44, 26, 0, 17, 1, 5, 190, '', 100, 100),
  (NULL, 'store', 'zeta', 'zeta', '/src/assets/store/zeta.webp', 51, 44, 26, 0, 17, 1, 5, 190, '', 100, 100),
  (NULL, 'store', 'zeta', 'zeta', '/src/assets/store/zeta.webp', 51, 44, 26, 0, 17, 1, 5, 190, '', 100, 100),
  (NULL, 'store', 'zeta', 'zeta', '/src/assets/store/zeta.webp', 51, 44, 26, 0, 17, 1, 5, 190, '', 100, 100);

-- Eta (type: eta)
DELETE FROM assets WHERE type = 'eta' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'eta', 'eta', '/src/assets/store/eta.webp', 38, 22, 30, 0, 25, 1, 4, 150, '', 100, 100),
  (NULL, 'store', 'eta', 'eta', '/src/assets/store/eta.webp', 38, 22, 30, 0, 25, 1, 4, 150, '', 100, 100),
  (NULL, 'store', 'eta', 'eta', '/src/assets/store/eta.webp', 38, 22, 30, 0, 25, 1, 4, 150, '', 100, 100),
  (NULL, 'store', 'eta', 'eta', '/src/assets/store/eta.webp', 38, 22, 30, 0, 25, 1, 4, 150, '', 100, 100),
  (NULL, 'store', 'eta', 'eta', '/src/assets/store/eta.webp', 38, 22, 30, 0, 25, 1, 4, 150, '', 100, 100);

-- Theta (type: theta)
DELETE FROM assets WHERE type = 'theta' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'theta', 'theta', '/src/assets/store/theta.webp', 29, 21, 24, 0, 29, 1, 3, 135, '', 100, 100),
  (NULL, 'store', 'theta', 'theta', '/src/assets/store/theta.webp', 29, 21, 24, 0, 29, 1, 3, 135, '', 100, 100),
  (NULL, 'store', 'theta', 'theta', '/src/assets/store/theta.webp', 29, 21, 24, 0, 29, 1, 3, 135, '', 100, 100),
  (NULL, 'store', 'theta', 'theta', '/src/assets/store/theta.webp', 29, 21, 24, 0, 29, 1, 3, 135, '', 100, 100),
  (NULL, 'store', 'theta', 'theta', '/src/assets/store/theta.webp', 29, 21, 24, 0, 29, 1, 3, 135, '', 100, 100);

-- Iota (type: iota)
DELETE FROM assets WHERE type = 'iota' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'iota', 'iota', '/src/assets/store/iota.webp', 19, 8, 13, 0, 17, 1, 1, 95, '', 100, 100),
  (NULL, 'store', 'iota', 'iota', '/src/assets/store/iota.webp', 19, 8, 13, 0, 17, 1, 1, 95, '', 100, 100),
  (NULL, 'store', 'iota', 'iota', '/src/assets/store/iota.webp', 19, 8, 13, 0, 17, 1, 1, 95, '', 100, 100),
  (NULL, 'store', 'iota', 'iota', '/src/assets/store/iota.webp', 19, 8, 13, 0, 17, 1, 1, 95, '', 100, 100),
  (NULL, 'store', 'iota', 'iota', '/src/assets/store/iota.webp', 19, 8, 13, 0, 17, 1, 1, 95, '', 100, 100);

-- Kappa (type: kappa)
DELETE FROM assets WHERE type = 'kappa' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'kappa', 'kappa', '/src/assets/store/kappa.webp', 23, 19, 21, 0, 13, 1, 2, 110, '', 100, 100),
  (NULL, 'store', 'kappa', 'kappa', '/src/assets/store/kappa.webp', 23, 19, 21, 0, 13, 1, 2, 110, '', 100, 100),
  (NULL, 'store', 'kappa', 'kappa', '/src/assets/store/kappa.webp', 23, 19, 21, 0, 13, 1, 2, 110, '', 100, 100),
  (NULL, 'store', 'kappa', 'kappa', '/src/assets/store/kappa.webp', 23, 19, 21, 0, 13, 1, 2, 110, '', 100, 100),
  (NULL, 'store', 'kappa', 'kappa', '/src/assets/store/kappa.webp', 23, 19, 21, 0, 13, 1, 2, 110, '', 100, 100);

-- Lambda (type: lambda)
DELETE FROM assets WHERE type = 'lambda' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'lambda', 'lambda', '/src/assets/store/lambda.webp', 55, 47, 39, 0, 31, 1, 5, 215, '', 100, 100),
  (NULL, 'store', 'lambda', 'lambda', '/src/assets/store/lambda.webp', 55, 47, 39, 0, 31, 1, 5, 215, '', 100, 100),
  (NULL, 'store', 'lambda', 'lambda', '/src/assets/store/lambda.webp', 55, 47, 39, 0, 31, 1, 5, 215, '', 100, 100),
  (NULL, 'store', 'lambda', 'lambda', '/src/assets/store/lambda.webp', 55, 47, 39, 0, 31, 1, 5, 215, '', 100, 100),
  (NULL, 'store', 'lambda', 'lambda', '/src/assets/store/lambda.webp', 55, 47, 39, 0, 31, 1, 5, 215, '', 100, 100);

-- Mu (type: mu)
DELETE FROM assets WHERE type = 'mu' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'mu', 'mu', '/src/assets/store/mu.webp', 20, 23, 21, 0, 29, 1, 2, 120, '', 100, 100),
  (NULL, 'store', 'mu', 'mu', '/src/assets/store/mu.webp', 20, 23, 21, 0, 29, 1, 2, 120, '', 100, 100),
  (NULL, 'store', 'mu', 'mu', '/src/assets/store/mu.webp', 20, 23, 21, 0, 29, 1, 2, 120, '', 100, 100),
  (NULL, 'store', 'mu', 'mu', '/src/assets/store/mu.webp', 20, 23, 21, 0, 29, 1, 2, 120, '', 100, 100),
  (NULL, 'store', 'mu', 'mu', '/src/assets/store/mu.webp', 20, 23, 21, 0, 29, 1, 2, 120, '', 100, 100);

-- Nu (type: nu)
DELETE FROM assets WHERE type = 'nu' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'nu', 'nu', '/src/assets/store/nu.webp', 25, 25, 19, 0, 17, 1, 2, 115, '', 100, 100),
  (NULL, 'store', 'nu', 'nu', '/src/assets/store/nu.webp', 25, 25, 19, 0, 17, 1, 2, 115, '', 100, 100),
  (NULL, 'store', 'nu', 'nu', '/src/assets/store/nu.webp', 25, 25, 19, 0, 17, 1, 2, 115, '', 100, 100),
  (NULL, 'store', 'nu', 'nu', '/src/assets/store/nu.webp', 25, 25, 19, 0, 17, 1, 2, 115, '', 100, 100),
  (NULL, 'store', 'nu', 'nu', '/src/assets/store/nu.webp', 25, 25, 19, 0, 17, 1, 2, 115, '', 100, 100);

-- Xi (type: xi)
DELETE FROM assets WHERE type = 'xi' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'xi', 'xi', '/src/assets/store/xi.webp', 50, 40, 47, 0, 58, 1, 5, 210, '', 100, 100),
  (NULL, 'store', 'xi', 'xi', '/src/assets/store/xi.webp', 50, 40, 47, 0, 58, 1, 5, 210, '', 100, 100),
  (NULL, 'store', 'xi', 'xi', '/src/assets/store/xi.webp', 50, 40, 47, 0, 58, 1, 5, 210, '', 100, 100),
  (NULL, 'store', 'xi', 'xi', '/src/assets/store/xi.webp', 50, 40, 47, 0, 58, 1, 5, 210, '', 100, 100),
  (NULL, 'store', 'xi', 'xi', '/src/assets/store/xi.webp', 50, 40, 47, 0, 58, 1, 5, 210, '', 100, 100);

-- Sigma (type: sigma)
DELETE FROM assets WHERE type = 'sigma' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'sigma', 'sigma', '/src/assets/store/sigma.webp', 31, 39, 30, 0, 39, 1, 3, 145, '', 100, 100),
  (NULL, 'store', 'sigma', 'sigma', '/src/assets/store/sigma.webp', 31, 39, 30, 0, 39, 1, 3, 145, '', 100, 100),
  (NULL, 'store', 'sigma', 'sigma', '/src/assets/store/sigma.webp', 31, 39, 30, 0, 39, 1, 3, 145, '', 100, 100),
  (NULL, 'store', 'sigma', 'sigma', '/src/assets/store/sigma.webp', 31, 39, 30, 0, 39, 1, 3, 145, '', 100, 100),
  (NULL, 'store', 'sigma', 'sigma', '/src/assets/store/sigma.webp', 31, 39, 30, 0, 39, 1, 3, 145, '', 100, 100);

-- Pi (type: pi)
DELETE FROM assets WHERE type = 'pi' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'pi', 'pi', '/src/assets/store/pi.webp', 47, 40, 41, 0, 33, 1, 4, 160, '', 100, 100),
  (NULL, 'store', 'pi', 'pi', '/src/assets/store/pi.webp', 47, 40, 41, 0, 33, 1, 4, 160, '', 100, 100),
  (NULL, 'store', 'pi', 'pi', '/src/assets/store/pi.webp', 47, 40, 41, 0, 33, 1, 4, 160, '', 100, 100),
  (NULL, 'store', 'pi', 'pi', '/src/assets/store/pi.webp', 47, 40, 41, 0, 33, 1, 4, 160, '', 100, 100),
  (NULL, 'store', 'pi', 'pi', '/src/assets/store/pi.webp', 47, 40, 41, 0, 33, 1, 4, 160, '', 100, 100);

-- Rho (type: rho)
DELETE FROM assets WHERE type = 'rho' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'rho', 'rho', '/src/assets/store/rho.webp', 42, 39, 44, 0, 34, 1, 4, 155, '', 100, 100),
  (NULL, 'store', 'rho', 'rho', '/src/assets/store/rho.webp', 42, 39, 44, 0, 34, 1, 4, 155, '', 100, 100),
  (NULL, 'store', 'rho', 'rho', '/src/assets/store/rho.webp', 42, 39, 44, 0, 34, 1, 4, 155, '', 100, 100),
  (NULL, 'store', 'rho', 'rho', '/src/assets/store/rho.webp', 42, 39, 44, 0, 34, 1, 4, 155, '', 100, 100),
  (NULL, 'store', 'rho', 'rho', '/src/assets/store/rho.webp', 42, 39, 44, 0, 34, 1, 4, 155, '', 100, 100);

COMMIT;

