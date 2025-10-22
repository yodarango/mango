-- Create the assets from the beggining

BEGIN TRANSACTION;

-- Colors (type: colors)

DELETE FROM assets WHERE type = 'colors' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'colors', 'morado', '/src/assets/store/warriors/colors/morado.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'rojo', '/src/assets/store/warriors/colors/rojo.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'blanco', '/src/assets/store/warriors/colors/blanco.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'negro', '/src/assets/store/warriors/colors/negro.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'azul', '/src/assets/store/warriors/colors/azul.webp', 11, 14, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'verde', '/src/assets/store/warriors/colors/verde.webp', 14, 11, 19, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'amarillo', '/src/assets/store/warriors/colors/amarillo.webp', 20, 12, 13, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'rosa', '/src/assets/store/warriors/colors/rosa.webp', 20, 20, 20, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'cafe', '/src/assets/store/warriors/colors/cafe.webp', 15, 12, 18, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'gris', '/src/assets/store/warriors/colors/gris.webp', 13, 17, 11, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'colors', 'anaranjado', '/src/assets/store/warriors/colors/anaranjado.webp', 19, 14, 16, 0, 5, 1, 1, 100, '', 100, 100);

  
  DELETE FROM assets WHERE type = 'week_days' AND status = 'store';
  INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
  VALUES
  (NULL, 'store', 'week_days', 'lunes', '/src/assets/store/warriors/week_days/lunes.webp', 23, 26, 21, 0, 5, 1, 2, 100, '', 100, 100),
  (NULL, 'store', 'week_days', 'martes', '/src/assets/store/warriors/week_days/martes.webp', 27, 22, 25, 0, 5, 1, 2, 100, '', 100, 100),
  (NULL, 'store', 'week_days', 'miercoles', '/src/assets/store/warriors/week_days/miercoles.webp', 21, 28, 24, 0, 5, 1, 2, 100, '', 100, 100),
  (NULL, 'store', 'week_days', 'jueves', '/src/assets/store/warriors/week_days/jueves.webp', 29, 23, 27, 0, 5, 1, 2, 100, '', 100, 100),
  (NULL, 'store', 'week_days', 'viernes', '/src/assets/store/warriors/week_days/viernes.webp', 24, 29, 22, 0, 5, 1, 2, 100, '', 100, 100),
  (NULL, 'store', 'week_days', 'sabado', '/src/assets/store/warriors/week_days/sabado.webp', 26, 21, 28, 0, 5, 1, 2, 100, '', 100, 100),
  (NULL, 'store', 'week_days', 'domingo', '/src/assets/store/warriors/week_days/domingo.webp', 22, 25, 29, 0, 5, 1, 2, 100, '', 100, 100);

DELETE FROM assets WHERE type = 'months' AND status = 'store';
INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina)
VALUES
  (NULL, 'store', 'months', 'enero', '/src/assets/store/warriors/months/enero.webp', 34, 31, 37, 0, 5, 1, 3, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'febrero', '/src/assets/store/warriors/febrero.webp', 32, 38, 35, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'marzo', '/src/assets/store/warriors/marzo.webp', 39, 33, 31, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'abril', '/src/assets/store/warriors/abril.webp', 36, 35, 39, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'mayo', '/src/assets/store/warriors/mayo.webp', 31, 37, 34, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'junio', '/src/assets/store/warriors/junio.webp', 38, 32, 36, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'julio', '/src/assets/store/warriors/julio.webp', 35, 39, 32, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'agosto', '/src/assets/store/warriors/agosto.webp', 33, 34, 38, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'septiembre', '/src/assets/store/warriors/septiembre.webp', 37, 36, 33, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'octubre', '/src/assets/store/warriors/octubre.webp', 30, 39, 37, 0, 5, 1, 1, 100, '', 100, 100),
  -- (NULL, 'store', 'months', 'noviembre', '/src/assets/store/warriors/noviembre.webp', 39, 31, 35, 0, 5, 1, 1, 100, '', 100, 100),
  (NULL, 'store', 'months', 'diciembre', '/src/assets/store/warriors/months/diciembre.webp', 36, 38, 30, 0, 5, 1, 3, 100, '', 100, 100);
