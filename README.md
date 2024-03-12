# Kinde Management API JavaScript / Typescript SDK

This repo automatically generates an SDK of the Kinde Management API based on it's OpenAPI spec.

## Steps

- Every 24 hours
  1. Download the spec file to the repo
  2. If changed, automatically commit and push the file
- On push of the file
  1. Generate new SDK
  2. Push to repo
- On push of the SDK
  1. Publish to NPM
