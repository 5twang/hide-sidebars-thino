#!/usr/bin/env bash
# Copy the built plugin into the local Obsidian vault so it can be tested.
# Usage: ./install-to-vault.sh [vault-path]
set -euo pipefail

cd "$(dirname "$0")"
vault="${1:-${OBSIDIAN_VAULT:-$HOME/Obsidian}}"
dest="$vault/.obsidian/plugins/hide-sidebars-thino"

[ -f main.js ] || { echo "main.js missing — run: npm run build" >&2; exit 1; }
[ -d "$vault/.obsidian" ] || { echo "not an Obsidian vault: $vault" >&2; exit 1; }

mkdir -p "$dest"
cp main.js manifest.json "$dest/"
echo "installed to $dest"
echo "reload in Obsidian: Settings -> Community plugins -> toggle the plugin off and on"
