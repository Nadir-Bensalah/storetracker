#!/usr/bin/env bash
# Interview preparation notes live outside this repository. Fails if any of
# them, or a local env file, ever ends up tracked by Git.
set -euo pipefail

tracked="$(git ls-files | grep -E '(^|/)(TECHNICAL-DEFENSE|CANDIDATE-PREP|GATE-)[^/]*$|(^|/)01-prep/|(^|/)\.env($|\.)' | grep -v '\.env\.example$' || true)"
if [ -n "$tracked" ]; then
  echo "Private files are tracked by Git:" >&2
  echo "$tracked" >&2
  exit 1
fi
