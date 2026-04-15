#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

rsync -av --delete --exclude='.DS_Store' \
  "$SCRIPT_DIR/plugin/skills/" \
  "$SCRIPT_DIR/.agents/skills/"
