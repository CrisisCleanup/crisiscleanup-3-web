#!/usr/bin/env bash

# Script for building and publishing docker image of ccu-web.
# Expects stage-appropriate environment variables to already be set.
# Additionally expects an `ECR_ACCOUNT_ID` variable to push.

set -e

do_fail() {
  echo 1>&2 "${@}"
  exit 1
}

build_tag() {
  printf "%s.dkr.ecr.us-east-1.amazonaws.com/crisiscleanup-web:%s" "${ECR_ACCOUNT_ID}" "${APP_STAGE}"
}

do_build() {
  root=$(git rev-parse --show-toplevel)
  docker_file="${root}/Dockerfile"
  img_tag=$(build_tag)
  docker build \
    --tag "$img_tag" \
    --file "$docker_file" \
    --build-arg="VUE_APP_API_BASE_URL=${VUE_APP_API_BASE_URL}" \
    --build-arg="VUE_APP_BASE_URL=${VUE_APP_BASE_URL}" \
    --build-arg="VUE_APP_WS_URL=${VUE_APP_WS_URL}" \
    --build-arg="VUE_APP_STAGE=${VUE_APP_STAGE}" \
    --build-arg="VUE_APP_AWS_CCP_URL=${VUE_APP_AWS_CCP_URL}" \
    --build-arg="VUE_APP_CCP_INSTANCE=${VUE_APP_CCP_INSTANCE}" \
    --build-arg="VUE_APP_PORTAL_KEY=${VUE_APP_PORTAL_KEY:-crisiscleanup_dev}" \
    --build-arg="VUE_APP_WHAT_3_WORDS_API_KEY=${VUE_APP_WHAT_3_WORDS_API_KEY}" \
    --build-arg="VUE_APP_GOOGLE_MAPS_API_KEY=${VUE_APP_GOOGLE_MAPS_API_KEY}" \
    --build-arg="VUE_APP_PITNEYBOWES_API_KEY=${VUE_APP_PITNEYBOWES_API_KEY}" \
    --build-arg="VUE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN=${VUE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN}" \
    --build-arg="SENTRY_DSN=${SENTRY_DSN}" \
    --build-arg="SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}" \
    --build-arg="SENTRY_PROPERTIES=${root}/${SENTRY_PROPERTIES:-'sentry.properties'}" \
    --build-arg="NODE_ENV=${NODE_ENV}" \
    "$root"
}

do_publish() {
  img_tag=$(build_tag)
  echo "\nPublishing ${img_tag}..."
  docker push "$img_tag"
}

APP_STAGE="${VUE_APP_STAGE}"

ECR_ACCOUNT_ID="${ECR_ACCOUNT_ID}"
NODE_ENV=production

case "${APP_STAGE}" in
development)
  NODE_ENV=development
  ;;
staging)
  :
  ;;
production)
  :
  ;;
*)
  do_fail "No 'VUE_APP_STAGE' found in env!"
  ;;
esac

if [[ -z ${ECR_ACCOUNT_ID} ]]; then
  do_fail "Failed to determine ECR_ACCOUNT_ID!"
fi

echo "Building image for ${APP_STAGE}..."

do_build
do_publish
