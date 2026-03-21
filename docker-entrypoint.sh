#!/bin/sh
set -e

if [ $# -gt 0 ]; then
  exec "$@"
else
  if [ -z "$HOST" ]; then
    echo "ERROR: Environment variable HOST is required!"
    exit 1
  else
    exec node --enable-source-maps /usr/app/dist/main --host "$HOST"
  fi
fi