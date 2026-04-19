#!/bin/sh
set -e

export NEXTAUTH_SECRET=$(cat /run/secrets/nextauth_secret)
export GOOGLE_CLIENT_ID=$(cat /run/secrets/google_client_id)
export GOOGLE_CLIENT_SECRET=$(cat /run/secrets/google_client_secret)
export RESEND_API_KEY=$(cat /run/secrets/resend_api_key)

exec node node_modules/.bin/next start
