#!/bin/bash

PLUGIN_IMAGE_TAG=${PLUGIN_IMAGE_TAG:-localhost:5000/${USER}/example-root-http-middleware:latest}
# for now use the PR image that supports this
APP_IMAGE=quay.io/rhdh-community/rhdh:pr-2167
#APP_IMAGE=quay.io/janus-idp/backstage-showcase:next

# Uncomment the following to use an RHDH image
# APP_IMAGE=quay.io/rhdh/rhdh-hub-rhel9:next

#PLUGIN_MOUNT="--mount=type=image,src=${PLUGIN_IMAGE_TAG},dst=/opt/app-root/src/dynamic-plugins-root"
# Uncomment the following to load the plugins from the deploy directory
PLUGIN_MOUNT="-v ./deploy:/opt/app-root/src/dynamic-plugins-root:Z"

# podman pull ${APP_IMAGE}
podman run \
    -e LOG_LEVEL=info \
    -e HOSTNAME=${HOSTNAME:-localhost} \
    -e GITHUB_APP_CLIENT_ID=${GITHUB_APP_CLIENT_ID:-blank} \
    -e GITHUB_APP_CLIENT_SECRET=${GITHUB_APP_CLIENT_SECRET:-blank} \
    -e GITHUB_APP_TWO_CLIENT_ID=${GITHUB_APP_TWO_CLIENT_ID:-blank} \
    -e GITHUB_APP_TWO_CLIENT_SECRET=${GITHUB_APP_TWO_CLIENT_SECRET:-blank} \
    -e AZURE_CLIENT_ID=${AZURE_CLIENT_ID:-blank} \
    -e AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET:-blank} \
    -e AZURE_TENANT_ID=${AZURE_TENANT_ID:-blank} \
    -e ENABLE_AUTH_PROVIDER_MODULE_OVERRIDE=true \
    ${PLUGIN_MOUNT} \
    -v ./app-config.yaml:/opt/app-root/src/app-config.yaml:Z \
    -p 7007:7007 \
    --entrypoint='["node", "packages/backend", "--config", "app-config.yaml"]' \
    ${APP_IMAGE}