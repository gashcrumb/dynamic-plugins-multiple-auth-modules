# An example collection of authentication providers set up to load from dynamic plugins

This example combines the microsoft, github and guest providers into a configuration that can be set up in RHDH, where the microsoft provider is set up for user login and the github provider is set up to authenticate against a couple different github organizations.  The guest provider is also available to log into the app and examine the user login state.

## Prerequisites

To build and run the example locally the following will be needed:

- node 20.x
- yarn 3.x (3.8.6 was used to develop this)
- podman

## About the example

This example consists of a number of dynamic plugin projects:

- custom-authentication-provider-module-backend: An authentication provider that sets up an alternate github authentication provider endpoint and configuration.
- custom-authentication-provider-module: A frontend dynamic plugin that contains an exported SignInPage component and API factory for the alternate github authentication provider, including a custom ScmAuth API factory setup.
- github-auth-provider-wrapper: A dynamic plugin wrapper project for the github authentication provider extension
- microsoft-auth-provider-wrapper: A dynamic plugin wrapper project for the microsoft authentication provider extension

The configuration supporting this setup is all in `app-config.yaml` but it's important to know which sections affect the above plugins:

### github and guest authentication provider config

```yaml
auth:
  environment: development  
  providers:
    guest:
      dangerouslyAllowOutsideDevelopment: true
    github:
      development:
        clientId: ${GITHUB_APP_CLIENT_ID}
        clientSecret: ${GITHUB_APP_CLIENT_SECRET}
```

### microsoft authentication provider config

```yaml
    microsoft:
      development:
        clientId: ${AZURE_CLIENT_ID}
        clientSecret: ${AZURE_CLIENT_SECRET}
        tenantId: ${AZURE_TENANT_ID}
        signIn:
          resolvers:
            - resolver: userIdMatchingUserEntityAnnotation
```

### Alternate github authentication provider config

```yaml
    github-two:
      development:
        clientId: ${GITHUB_APP_TWO_CLIENT_ID}
        clientSecret: ${GITHUB_APP_TWO_CLIENT_SECRET}
```

### Frontend wiring configuration

```yaml
dynamicPlugins:
  rootDirectory: dynamic-plugins-root
  frontend:
    custom-authentication-provider-module:
      signInPage:
        importName: CustomSignInPage
      providerSettings:
        - title: Github Two
          description: Sign in with GitHub Org Two
          provider: core.auth.github-two
```

## Building the Example

After cloning this repo you can build the code using the following sequence of commands:

`yarn install && yarn tsc && yarn build`

Once built the next step is to export the built packages as dynamic plugins.

### Exporting the plugins to a local directory

To export the plugins to the `./deploy` directory run:

```bash
yarn export-local
```

Use the environment variable `PLUGIN_IMAGE_TAG` to change the image tag as needed.

## Running the Example

This example needs a number of environment variables to run properly:

```text
GITHUB_APP_CLIENT_ID
GITHUB_APP_CLIENT_SECRET
GITHUB_APP_TWO_CLIENT_ID
GITHUB_APP_TWO_CLIENT_SECRET
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
AZURE_TENANT_ID
```

The `run-with-podman.sh` script is set up to substitute a dummy value for any of the above variables.  To see the example in action, set the above variables to the appropriate values for your envrionment and run:

```bash
./run-with-podman.sh
```
