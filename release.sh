#!/usr/bin/env bash
# Cut a release the way the Obsidian directory expects: bump the version, push
# the commit and tag, and let the release workflow build, attest and publish it.
#
# Usage: ./release.sh [patch|minor|major]     (default: patch)
set -euo pipefail
cd "$(dirname "$0")"

GH="${GH:-$HOME/.local/bin/gh}"
bump="${1:-patch}"

"$GH" auth status >/dev/null || { echo "not logged in — run: gh auth login" >&2; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "working tree not clean — commit your changes first" >&2; exit 1; }
[ "$(git branch --show-current)" = "main" ] || { echo "switch to main first" >&2; exit 1; }

# npm version runs version-bump.mjs (keeps manifest.json and versions.json in
# sync), commits, and creates the tag. .npmrc keeps the tag free of a "v".
npm version "$bump" >/dev/null
tag="$(node -p "require('./manifest.json').version")"
echo "== version $tag"
git push --follow-tags

echo "== waiting for the release workflow"
sleep 10
run_id="$("$GH" run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
if ! "$GH" run watch "$run_id" --exit-status; then
	echo "== workflow failed, last output:" >&2
	"$GH" run view "$run_id" --log-failed | tail -40 >&2
	exit 1
fi

repo="$(git remote get-url origin | sed -E 's#.*github\.com[:/](.+)\.git#\1#')"
"$GH" release view "$tag" --json tagName,assets --jq '{tag:.tagName, assets:[.assets[].name]}'

echo "== verifying the attestation on the released main.js"
tmp="$(mktemp -d)"
"$GH" release download "$tag" -p main.js -D "$tmp"
"$GH" attestation verify "$tmp/main.js" -R "$repo"

echo "== done: https://github.com/$repo/releases/tag/$tag"
