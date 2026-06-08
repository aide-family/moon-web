#!/bin/sh
set -eu

: "${API_UPSTREAM:=http://host.docker.internal:8000}"
export API_UPSTREAM

TEMPLATE="${NGINX_CONF_TEMPLATE:-/etc/nginx/templates/default.conf.template}"
OUTPUT="/etc/nginx/conf.d/default.conf"

if [ ! -f "$TEMPLATE" ]; then
  echo "nginx template not found: $TEMPLATE" >&2
  exit 1
fi

envsubst '${API_UPSTREAM}' < "$TEMPLATE" > "$OUTPUT"
exec nginx -g 'daemon off;'
