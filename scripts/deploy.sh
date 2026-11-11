#!/usr/bin/env bash
# Build the static site and publish it to the gh-pages branch (GitHub Pages).
set -euo pipefail
cd "$(dirname "$0")/.."

REPO_NAME="$(basename -s .git "$(git config --get remote.origin.url)")"
export NEXT_PUBLIC_BASE_PATH="/${REPO_NAME}"

npm run build
touch out/.nojekyll

TMP="$(mktemp -d)"
cp -R out/. "$TMP"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" \
  commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -q -f "$(git -C "$OLDPWD" config --get remote.origin.url)" gh-pages
cd - >/dev/null
rm -rf "$TMP"
echo "Deployed: https://$(git config --get remote.origin.url | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#' | tr 'A-Z' 'a-z').github.io/${REPO_NAME}/"
