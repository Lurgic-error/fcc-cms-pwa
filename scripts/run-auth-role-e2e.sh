#!/usr/bin/env sh
set -eu

if [ -f ./.env.cypress ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.cypress
  set +a
fi

: "${CYPRESS_ENABLE_SERVER_E2E:=1}"
: "${CYPRESS_API_BASE_URL:=http://127.0.0.1:4000/api/v1}"
: "${TOKENSECRET:=local-e2e-secret}"
: "${ENABLE_SCHEDULER:=false}"

required_vars="CYPRESS_CMS_ADMIN_EMAIL CYPRESS_CMS_ADMIN_PASSWORD CYPRESS_CMS_EDITOR_EMAIL CYPRESS_CMS_EDITOR_PASSWORD CYPRESS_CMS_REVIEWER_EMAIL CYPRESS_CMS_REVIEWER_PASSWORD"

missing=0
for name in $required_vars; do
  eval "value=\${$name-}"
  if [ -z "${value}" ]; then
    echo "Missing required env var: ${name}" >&2
    missing=1
  fi
done

if [ "$missing" -ne 0 ]; then
  echo "Populate .env.cypress (or shell env) and rerun." >&2
  exit 1
fi

node ../fcc-cms-server/src/utils/ensureE2EUsers.js

npx start-server-and-test \
  "cd ../fcc-cms-server && TOKENSECRET=${TOKENSECRET} ENABLE_SCHEDULER=${ENABLE_SCHEDULER} npm run start" \
  http://127.0.0.1:4000/content/v1/visitors/summary \
  "npx start-server-and-test preview http://localhost:4173 \"cypress run --e2e --spec cypress/e2e/auth-role-access.cy.js\""
