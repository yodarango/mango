#!/usr/bin/env bash
# insert_assets.sh
# Usage:
#   ./insert_assets.sh \
#     --files '["air_aguila.webp","farm_vaca.webp"]' \
#     --type "animals - feline" \
#     --folder "animals" \
#     --adh-from 20 \
#     --adh-plus 26 \
#     --is-locked 1 \
#     --cost 11

set -euo pipefail

# --- Fixed database path (relative to this script) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_PATH="$SCRIPT_DIR/data.db"

# --- Parse CLI flags ---
FILES_JSON=""
TYPE=""
FOLDER=""
ADH_FROM=""
ADH_PLUS=""
IS_LOCKED=""
COST_VAR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --files) FILES_JSON="$2"; shift 2 ;;
    --type) TYPE="$2"; shift 2 ;;
    --folder) FOLDER="$2"; shift 2 ;;
    --adh-from) ADH_FROM="$2"; shift 2 ;;
    --adh-plus) ADH_PLUS="$2"; shift 2 ;;
    --is-locked) IS_LOCKED="$2"; shift 2 ;;
    --cost) COST_VAR="$2"; shift 2 ;;
    -h|--help)
      echo "See header for usage."
      exit 0
      ;;
    *)
      echo "Unknown option: $1"; exit 1 ;;
  esac
done

# --- Validate required args ---
missing=()
[[ -z "$FILES_JSON" ]] && missing+=("--files")
[[ -z "$TYPE" ]] && missing+=("--type")
[[ -z "$FOLDER" ]] && missing+=("--folder")
[[ -z "$ADH_FROM" ]] && missing+=("--adh-from")
[[ -z "$ADH_PLUS" ]] && missing+=("--adh-plus")
[[ -z "$IS_LOCKED" ]] && missing+=("--is-locked")
[[ -z "$COST_VAR" ]] && missing+=("--cost")

if (( ${#missing[@]} > 0 )); then
  echo "Missing required options: ${missing[*]}"
  exit 1
fi

# --- Check dependencies ---
command -v sqlite3 >/dev/null 2>&1 || { echo "sqlite3 not found"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not found (required to parse --files JSON)"; exit 1; }

# --- Helpers ---
sql_escape() {
  local s="$1"
  s="${s//\'/\'\'}"
  printf "%s" "$s"
}

# Build VALUES list from JSON array: ['file1.webp','file2.webp'] -> ('file1.webp'),('file2.webp')
FILES_VALUES="$(echo "$FILES_JSON" | jq -r '
  if type=="array" then
    [.[] | "(" + (@sh) + ")" ] | join(",")
  else
    halt_error(1; " --files must be a JSON array")
  end
')"

# Escape strings for SQL
TYPE_ESCAPED="$(sql_escape "$TYPE")"
FOLDER_ESCAPED="$(sql_escape "$FOLDER")"

# --- Compose SQL ---
SQL=$(cat <<SQL
WITH filenames(f) AS (
  VALUES ${FILES_VALUES}
),
rows AS (
  SELECT
    NULL AS avatar_id,
    'store' AS status,
    '${TYPE_ESCAPED}' AS type,
    replace(replace(f, '_', ' '), '.webp', '') AS name,
    '/src/assets/store/warriors/${FOLDER_ESCAPED}/' || f AS thumbnail,
    (${ADH_FROM} + (ABS(RANDOM()) % ${ADH_PLUS})) AS attack,
    (${ADH_FROM} + (ABS(RANDOM()) % ${ADH_PLUS})) AS defense,
    (${ADH_FROM} + (ABS(RANDOM()) % ${ADH_PLUS})) AS healing,
    0 AS power,
    5 AS endurance,
    1 AS level,
    1 AS required_level,
    '' AS ability,
    100 AS health,
    100 AS stamina,
    '' AS description,
    0 AS xp,
    100 AS xp_required,
    ${IS_LOCKED} AS is_locked
  FROM filenames
)
INSERT INTO assets (
  avatar_id, status, type, name, thumbnail,
  attack, defense, healing, power, endurance, level, required_level,
  cost, ability, health, stamina, description, xp, xp_required, is_locked
)
SELECT
  avatar_id, status, type, name, thumbnail,
  attack, defense, healing, power, endurance, level, required_level,
  CAST(((attack + defense + healing) / 3.0) * ${COST_VAR} AS INTEGER) AS cost,
  ability, health, stamina, description, xp, xp_required, is_locked
FROM rows;
SQL
)

sqlite3 "$DB_PATH" "$SQL"
echo "✅ Inserted assets into $DB_PATH"
