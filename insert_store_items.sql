
INSERT INTO assets (
  status, type, name, thumbnail,
  attack, defense, healing,
  power, endurance, level, required_level,
  cost, ability, health, stamina
)
-- or
SELECT
  'store', 'similar_endings', 'doctor (OR)', '/src/assets/store/warriors/similar_endings/doctor.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v
UNION ALL
-- ist
SELECT
  'store', 'similar_endings', 'artista (IST)', '/src/assets/store/warriors/similar_endings/artista.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v
UNION ALL
-- ic
SELECT
  'store', 'similar_endings', 'magico (IC)', '/src/assets/store/warriors/similar_endings/magico.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v
UNION ALL
-- ous
SELECT
  'store', 'similar_endings', 'delicioso (ous)', '/src/assets/store/warriors/similar_endings/delicioso.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v
UNION ALL
-- ble
SELECT
  'store', 'similar_endings', 'horrible (BLE)', '/src/assets/store/warriors/similar_endings/horrible.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v
UNION ALL
-- ent
SELECT
  'store', 'similar_endings', 'preseidente (ENT)', '/src/assets/store/warriors/similar_endings/presidente.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v
UNION ALL
-- ant
SELECT
  'store', 'similar_endings', 'restaurante (ANT)', '/src/assets/store/warriors/similar_endings/restaurante.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v
UNION ALL
-- al
SELECT
  'store', 'similar_endings', 'animal (AL)', '/src/assets/store/warriors/similar_endings/animal.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v
UNION ALL
-- ion
SELECT
  'store', 'similar_endings', 'nacion (ION)', '/src/assets/store/warriors/similar_endings/nacion.webp',
  v.attack, v.defense, v.healing,
  0, 5, 1, 1,
  CAST(((v.attack + v.defense + v.healing) / 3.0) * 11 AS INTEGER),
  '', 100, 100
FROM (SELECT
        (ABS(RANDOM()) % 6) + 5 AS attack,
        (ABS(RANDOM()) % 6) + 5 AS defense,
        (ABS(RANDOM()) % 6) + 5 AS healing
     ) AS v;
