#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-${SMOKE_ADMIN_EMAIL:-admin@mps.com}}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-${SMOKE_ADMIN_PASSWORD:-admin123}}"
TEACHER_EMAIL="${TEACHER_EMAIL:-${SMOKE_TEACHER_EMAIL:-test@mps.com}}"
TEACHER_PASSWORD="${TEACHER_PASSWORD:-${SMOKE_TEACHER_PASSWORD:-test123}}"

PASS_COUNT=0
FAIL_COUNT=0

log() { printf "[rbac-smoke] %s\n" "$*"; }
fail() { log "FAIL: $*"; FAIL_COUNT=$((FAIL_COUNT+1)); }
pass() { log "PASS: $*"; PASS_COUNT=$((PASS_COUNT+1)); }

prime_csrf() {
  local jar="$1"
  curl -sS -c "$jar" "$BASE_URL/api/v1/health" > /dev/null
  awk '$6=="csrf_token"{print $7}' "$jar" | tail -n1
}

login_with_csrf() {
  local jar="$1" email="$2" password="$3" csrf="$4"
  curl -sS -b "$jar" -c "$jar" \
    -H "Content-Type: application/json" -H "X-CSRF-Token: ${csrf}" \
    -X POST "$BASE_URL/api/v1/auth/login" \
    --data "{\"email\":\"${email}\",\"password\":\"${password}\"}" > /dev/null
}

expect_status() {
  local jar="$1" method="$2" url="$3" expected="$4" out_file
  out_file=$(mktemp)
  local code
  if [[ "$method" == "GET" ]]; then
    code=$(curl -sS -o "$out_file" -w "%{http_code}\n" -b "$jar" "$url")
  else
    code=$(curl -sS -o "$out_file" -w "%{http_code}\n" -b "$jar" -X "$method" "$url")
  fi
  if [[ "$code" == "$expected" ]]; then
    pass "$method $url -> $code"
  else
    fail "$method $url -> $code (expected $expected). Body: $(head -c 300 "$out_file")"
  fi
  rm -f "$out_file"
}

run_admin_flow() {
  local jar="/tmp/rbac_admin.cookies"
  rm -f "$jar"
  log "Admin: priming CSRF cookie"
  local csrf; csrf=$(prime_csrf "$jar")
  if [[ -z "$csrf" ]]; then fail "Admin CSRF not set"; return; fi
  log "Admin: logging in"
  login_with_csrf "$jar" "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$csrf"
  expect_status "$jar" GET "$BASE_URL/api/v1/auth/profile" 200
  expect_status "$jar" GET "$BASE_URL/api/v1/users?limit=1" 200
}

run_teacher_flow() {
  local jar="/tmp/rbac_teacher.cookies"
  rm -f "$jar"
  log "Teacher: priming CSRF cookie"
  local csrf; csrf=$(prime_csrf "$jar")
  if [[ -z "$csrf" ]]; then fail "Teacher CSRF not set"; return; fi
  log "Teacher: logging in"
  login_with_csrf "$jar" "$TEACHER_EMAIL" "$TEACHER_PASSWORD" "$csrf"
  expect_status "$jar" GET "$BASE_URL/api/v1/auth/profile" 200
  expect_status "$jar" GET "$BASE_URL/api/v1/users?limit=1" 403
}

main() {
  log "Starting RBAC smoke against ${BASE_URL}"
  run_admin_flow
  run_teacher_flow
  log "Summary: ${PASS_COUNT} passed, ${FAIL_COUNT} failed"
  if [[ "$FAIL_COUNT" -gt 0 ]]; then exit 1; fi
}

main "$@"