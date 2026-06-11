#!/bin/sh
set -eu

# 多后端 upstream 默认值（与 .env.production / vite 开发代理一致）
: "${API_UPSTREAM_MAIN:=${API_UPSTREAM:-http://host.docker.internal:8000}}"
: "${API_UPSTREAM_RABBIT:=http://host.docker.internal:8001}"
: "${API_UPSTREAM_MARKSMAN:=http://host.docker.internal:8003}"
: "${API_UPSTREAM_JADE_TREE:=http://host.docker.internal:8004}"

# 独立子应用镜像：按 MOON_APP_NAME 选择默认单 upstream（可被 API_UPSTREAM 覆盖）
if [ -n "${MOON_APP_NAME:-}" ]; then
  case "$MOON_APP_NAME" in
    rabbit)
      : "${API_UPSTREAM:=${API_UPSTREAM_RABBIT}}"
      ;;
    marksman)
      : "${API_UPSTREAM:=${API_UPSTREAM_MARKSMAN}}"
      ;;
    jade_tree)
      : "${API_UPSTREAM:=${API_UPSTREAM_JADE_TREE}}"
      ;;
    goddess|main|*)
      : "${API_UPSTREAM:=${API_UPSTREAM_MAIN}}"
      ;;
  esac
else
  : "${API_UPSTREAM:=${API_UPSTREAM_MAIN}}"
fi

export API_UPSTREAM API_UPSTREAM_MAIN
export API_UPSTREAM_RABBIT API_UPSTREAM_MARKSMAN API_UPSTREAM_JADE_TREE

API_PROXY_MULTI_TEMPLATE="/etc/nginx/templates/api-proxy-multi.inc.template"
API_PROXY_INC="/etc/nginx/conf.d/api-proxy.inc"
TEMPLATE="${NGINX_CONF_TEMPLATE:-/etc/nginx/templates/default.conf.template}"
OUTPUT="/etc/nginx/conf.d/default.conf"

ENVSUBST_VARS='${API_UPSTREAM} ${API_UPSTREAM_MAIN} ${API_UPSTREAM_RABBIT} ${API_UPSTREAM_MARKSMAN} ${API_UPSTREAM_JADE_TREE}'

if [ ! -f "$TEMPLATE" ]; then
  echo "nginx template not found: $TEMPLATE" >&2
  exit 1
fi

if [ -f "$API_PROXY_MULTI_TEMPLATE" ]; then
  envsubst "$ENVSUBST_VARS" < "$API_PROXY_MULTI_TEMPLATE" > "$API_PROXY_INC"
fi

envsubst "$ENVSUBST_VARS" < "$TEMPLATE" > "$OUTPUT"
exec nginx -g 'daemon off;'
