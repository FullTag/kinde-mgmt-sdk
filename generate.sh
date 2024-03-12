mkdir -p sdk/src && \
docker run --rm \
  -v $PWD:/repo openapitools/openapi-generator-cli generate \
  -i /repo/kinde-mgmt-api-specs.yaml \
  -g typescript-fetch \
  -o /repo/sdk/src && \
pnpm -C sdk build
