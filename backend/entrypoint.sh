#!/bin/sh
set -e

DB_NAME=$(cat /run/secrets/db_name)
DB_USER=$(cat /run/secrets/db_user)

export SPRING_DATASOURCE_URL="jdbc:postgresql://db:5432/$DB_NAME"
export SPRING_DATASOURCE_USERNAME="$DB_USER"
export SPRING_DATASOURCE_PASSWORD=$(cat /run/secrets/db_password)
export JWT_SECRET=$(cat /run/secrets/jwt_secret)
export VOTE_HASH_PEPPER=$(cat /run/secrets/vote_hash_pepper)
export ANTHROPIC_API_KEY=$(cat /run/secrets/anthropic_api_key)
export GOOGLE_CLIENT_ID=$(cat /run/secrets/google_client_id)

exec java -jar app.jar
