#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:3000/api/v1"
COOKIE="/tmp/mps_cookies.txt"

login() {
  echo "==> Logging in as admin@dev.com"
  curl -s -i -c "$COOKIE" -H 'Content-Type: application/json' \
    -d '{"email":"admin@dev.com","password":"admin123"}' \
    "$BASE/auth/login" > /dev/null
}

probe() {
  local ep="$1"
  printf "%-40s" "==> $ep"
  curl -s -o /dev/null -w "code=%{http_code} time=%{time_total}\n" -b "$COOKIE" "$BASE$ep"
}

login
probe "/auth/profile"
probe "/dashboards/admin"
probe "/users?limit=50"
probe "/classes?limit=100"
probe "/action-presets"
probe "/teacher-reports?limit=20"
probe "/appeals?limit=20"
probe "/audit-logs?limit=20"
probe "/notifications"
