#!/usr/bin/env bash
# Create the GitHub repo (if needed), push the current commit, and publish the
# release that Obsidian's directory expects: tag == manifest.version, with
# main.js and manifest.json attached as release assets.
#
# Usage: ./publish.sh [owner/repo]     (default: <your gh login>/hide-sidebars-thino)
set -euo pipefail
cd "$(dirname "$0")"

GH="${GH:-$HOME/.local/bin/gh}"
PROXY="${PROXY:-http://127.0.0.1:7892}"

command -v "$GH" >/dev/null || { echo "gh not found at $GH" >&2; exit 1; }
"$GH" auth status >/dev/null || { echo "not logged in — run: gh auth login" >&2; exit 1; }

owner="$("$GH" api user --jq .login)"
repo="${1:-$owner/hide-sidebars-thino}"
version="$(grep -o '"version": *"[^"]*"' manifest.json | head -1 | cut -d'"' -f4)"

[ -z "$(git status --porcelain)" ] || { echo "working tree not clean — commit first" >&2; exit 1; }

echo "== build"
npm run build

echo "== repo: $repo (version $version)"
if ! "$GH" repo view "$repo" >/dev/null 2>&1; then
	"$GH" repo create "$repo" --public --source=. --remote=origin --push \
		--description "Hide both sidebars while a Thino view is active in Obsidian."
else
	git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$repo.git"
	git push -u origin HEAD || { echo "push failed, retrying through proxy"; git -c "http.proxy=$PROXY" push -u origin HEAD; }
fi

echo "== release $version"
if "$GH" release view "$version" >/dev/null 2>&1; then
	"$GH" release upload "$version" main.js manifest.json --clobber
else
	"$GH" release create "$version" main.js manifest.json \
		--title "$version" \
		--notes "Initial release: collapses both sidebars while a Thino view is the active tab and expands them again on any other tab."
fi

"$GH" release view "$version" --json tagName,assets --jq '{tag:.tagName, assets:[.assets[].name]}'
echo "== done: https://github.com/$repo/releases/tag/$version"
