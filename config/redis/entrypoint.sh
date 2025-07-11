#!/bin/sh

set -e

TEMPLATE_FILE="/redis.conf.tpl"
CONFIG_FILE="/usr/local/etc/redis/redis.conf"

mkdir -p /usr/local/etc/redis

if [ -z "${REDIS_USER_NAME}" ] || [ -z "${REDIS_USER_PASSWORD}" ]; then
  echo "Error: vars REDIS_USER_NAME & REDIS_USER_PASSWORD is required" >&2
  exit 1
fi

sed "s/USERNAME_PLACEHOLDER/${REDIS_USER_NAME}/g" ${TEMPLATE_FILE} | \
sed "s/PASSWORD_PLACEHOLDER/${REDIS_USER_PASSWORD}/g" > ${CONFIG_FILE}

echo "Config for Redis generated ${CONFIG_FILE}"

exec redis-server ${CONFIG_FILE} "$@"