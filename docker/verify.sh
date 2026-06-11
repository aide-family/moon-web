#!/bin/sh
# 构建完成后对镜像做 HTTP 冒烟检查（需先执行 pnpm run docker:build）
set -eu

verify_image() {
  name=$1
  image=$2
  port=$3

  if ! docker image inspect "$image" >/dev/null 2>&1; then
    echo "[SKIP] $name — image not found: $image (run pnpm run docker:build first)" >&2
    return 1
  fi

  cid=$(docker run --rm -d -p "127.0.0.1:${port}:80" "$image")
  cleanup() {
    docker stop "$cid" >/dev/null 2>&1 || true
  }
  trap cleanup EXIT INT TERM

  sleep 2
  if curl -sf "http://127.0.0.1:${port}/" | grep -qi '<html'; then
    echo "[OK] $name — http://127.0.0.1:${port}/"
  else
    echo "[FAIL] $name — no HTML response from http://127.0.0.1:${port}/" >&2
    exit 1
  fi

  cleanup
  trap - EXIT INT TERM
}

failed=0
verify_image integrated moon-web:integrated 18080 || failed=1
verify_image 'all:micro' moon-web:all 18081 || failed=1
verify_image main moon-web:main 18082 || failed=1
verify_image rabbit moon-web:rabbit 18083 || failed=1

if [ "$failed" -ne 0 ]; then
  exit 1
fi

echo ""
echo "Docker smoke checks passed (integrated, all:micro, main, rabbit)."
