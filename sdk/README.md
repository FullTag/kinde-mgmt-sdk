# Kinde Management API SDK

Note: this is an automatically generated package.

You can find more information about the Kinde management API on [https://kinde.com/api/docs/](https://kinde.com/api/docs/)

## Installation
npm:
```shell
npm i @fulltag/kinde-mgmt-sdk
```
Yarn:
```shell
yarn add @fulltag/kinde-mgmt-sdk
```
pNpm:
```shell
pnpm i @fulltag/kinde-mgmt-sdk
```


## Example usage
```typescript
// https://kinde.com/api/docs/#create-user
import { UsersApi, Configuration } from '@fulltag/kinde-mgmt-sdk'

const usersApi = new UsersApi(new Configuration({
  // replace {businessName} with your own business name from Kinde
  basePath: 'https://{businessName}.kinde.com',
}))

const result = usersApi.createUser({
  createUserRequest: {
    profile: {
      givenName: 'John',
      familyName: 'Doe',
    },
    identities: [{
      type: 'email',
      details: {
        email: 'john.doe@example.com',
      },
    }],
    organizationCode: 'example',
  },
})

console.log(`Created user with id: ${result.id}`)
```

## Available API's
- APIsApi
- ApplicationsApi
- BusinessApi
- CallbacksApi
- ConnectedAppsApi
- EnvironmentsApi
- FeatureFlagsApi
- IndustriesApi
- OAuthApi
- OrganizationsApi
- PermissionsApi
- PropertiesApi
- PropertyCategoriesApi
- RolesApi
- SubscribersApi
- TimezonesApi
- UsersApi
