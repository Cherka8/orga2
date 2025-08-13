#!/usr/bin/env bash
set -euo pipefail

# Usage examples:
# MYSQL_USER=org_user MYSQL_PASSWORD=CHANGE_ME MYSQL_DB=organaizer \
# MONGO_DB=organaizer_preferences ./generate_exports_ubuntu.sh
#
# With Mongo Atlas:
# MYSQL_USER=org_user MYSQL_PASSWORD=CHANGE_ME MYSQL_DB=organaizer \
# MONGO_DB=organaizer_preferences MONGO_URI="mongodb+srv://USER:PASS@cluster.example.mongodb.net/organaizer_preferences" \
# ./generate_exports_ubuntu.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Required env vars
: "${MYSQL_USER:?MYSQL_USER is required}"
: "${MYSQL_DB:?MYSQL_DB is required}"
: "${MONGO_DB:?MONGO_DB is required}"

MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
MONGO_URI="${MONGO_URI:-}"

DDL_OUT="$SCRIPT_DIR/orga_mysql_schema.sql"
MONGO_OUT_DIR="$SCRIPT_DIR/mongo_dump"

command -v mysqldump >/dev/null 2>&1 || { echo >&2 "mysqldump not found. Install MySQL client tools."; exit 1; }

echo "[MySQL] Exporting structure only to $DDL_OUT"
if [[ -n "$MYSQL_PASSWORD" ]]; then
  mysqldump -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" --no-data --routines --triggers "$MYSQL_DB" > "$DDL_OUT"
else
  mysqldump -u "$MYSQL_USER" --password --no-data --routines --triggers "$MYSQL_DB" > "$DDL_OUT"
fi

echo "[MongoDB] Preparing dump directory $MONGO_OUT_DIR"
mkdir -p "$MONGO_OUT_DIR"

if ! command -v mongodump >/dev/null 2>&1; then
  echo "[MongoDB] WARNING: mongodump not found in PATH. Install MongoDB Database Tools to generate dump." >&2
else
  echo "[MongoDB] Dumping database $MONGO_DB to $MONGO_OUT_DIR"
  if [[ -n "$MONGO_URI" ]]; then
    mongodump --uri "$MONGO_URI" --db "$MONGO_DB" --out "$MONGO_OUT_DIR"
  else
    mongodump --db "$MONGO_DB" --out "$MONGO_OUT_DIR"
  fi
fi

echo "Done. Generated:"
echo " - $DDL_OUT"
echo " - $MONGO_OUT_DIR"
