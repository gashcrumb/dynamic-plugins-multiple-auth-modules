# Using an Authentication Provider from a Dynamic Plugin in Red Hat Developer Hub

## Overview

Out of the box Red Hat Developer Hub contains support for many authentication providers that are built into the Backstage framework as an opinionated setup. However it's possible to disable this authentication provider module and supply a set of frontend and backend dynamic plugins to provide this functionality.  This example repository shows how this can be done by wrapping an existing third-party authentication provider as dynamic plugins.  A simple example ldap setup is provided to make it easy to stand up this example and run it.

## Prerequisites

To build and run the example locally the following will be needed:

- node 20.x
- yarn 3.x (3.8.6 was used to develop this)
- [rhdh-local](https://github.com/redhat-developer/rhdh-local) set up *temporarily* to use [this PR image](https://github.com/redhat-developer/rhdh/pull/2167#issuecomment-2583806269)
- [glauth](https://github.com/glauth/glauth#glauth-ldap-authentication-server-for-developers) as well as [this configuration file](https://gist.github.com/gashcrumb/37379e5d6384d236fd1b3af0dd42a9c6).

## About the example

This example consists of two wrapper projects for some existing LDAP authentication provider plugins:

- [backstage-plugin-ldap-auth-backend](https://github.com/immobiliare/backstage-plugin-ldap-auth/tree/main/packages/ldap-auth-backend) - provides an authentication provider API and bridges authentication to an LDAP server.
- [backstage-plugin-ldap-auth](https://github.com/immobiliare/backstage-plugin-ldap-auth/tree/main/packages/ldap-auth) - Provides a custom SignInPage as well as API client for the backend authentication provider service.

which work in conjunction with the [LDAP catalog provider](https://github.com/backstage/backstage/tree/master/plugins/catalog-backend-module-ldap) backend module which synchronizes an LDAP to users and groups in the Backstage catalog.

The example brings these three modules together as dynamic plugins in Developer Hub using [rhdh-local](https://github.com/redhat-developer/rhdh-local), as Developer Hub already includes the LDAP catalog provider.

### About the wrapper code

The [backend wrapper](plugins/immobiliarelabs-backstage-plugin-ldap-auth-backend/) simply re-exports the original plugin's default module.  It also includes the [example backend configuration](./plugins/immobiliarelabs-backstage-plugin-ldap-auth-backend/app-config.yaml).

The [frontend wrapper](plugins/immobiliarelabs-backstage-plugin-ldap-auth/) also re-exports all of the modules from the original plugin, however it also includes a [custom SignInPage wrapper](./plugins/immobiliarelabs-backstage-plugin-ldap-auth/src/components/SignInPage/SignInPage.tsx).  The `SignInPage` component is the place in a Backstage app where the frontend API reference is connected to the appropriate backend authentication provider API service.  For this example the exported `SignInPage` component simply delegates to the `LDAPSignInPage` component that is provided by the [backstage-plugin-ldap-auth](https://github.com/immobiliare/backstage-plugin-ldap-auth/tree/main/packages/ldap-auth) package.

## Building the Example

After cloning this repo you can build the code using the following sequence of commands:

`yarn install && yarn tsc && yarn build`

Once built the next step is to export the built wrapper packages as dynamic plugins.

### Exporting the wrappers as dynamic plugins

The wrappers can either be exported into a container image or directly to `rhdh-local`'s `local-plugins` directory.  In either case the export command will output an example `rhdh-local` configuration to the terminal.  Copy this output as it will be needed when running the example.

#### Exporting the plugins to a container image

To build a container image run:

```bash
yarn package-dynamic-plugins
```

Use the environment variable `PLUGIN_IMAGE_TAG` to change the image tag as needed.

#### Exporting the plugins to a local directory

To export the plugins to the `./deploy` directory run:

```bash
yarn export-local
```

Use the environment variable `DYNAMIC_PLUGINS_ROOT` to change the output directory to the `local-plugins` directory of `rhdh-local`.

## Running the Example

Download the example configuration for glauth from [here](https://gist.github.com/gashcrumb/37379e5d6384d236fd1b3af0dd42a9c6) as `sample-simple.cfg` and run `glauth`:

```bash
glauth --ldap 0.0.0.0:3893 -c ./sample-simple.cfg
```

It's startup will look something like this:

```text
Mon, 13 Jan 2025 06:01:37 -0500 INF Debugging enabled
Mon, 13 Jan 2025 06:01:37 -0500 INF AP start
Mon, 13 Jan 2025 06:01:37 -0500 INF Web API enabled
Mon, 13 Jan 2025 06:01:37 -0500 INF Loading backend datastore=config position=0
Mon, 13 Jan 2025 06:01:37 -0500 INF Starting HTTP server address=0.0.0.0:5555
Mon, 13 Jan 2025 06:01:37 -0500 INF LDAP server listening address=0.0.0.0:3893
```

> [!NOTE]
> You may need to run glauth on another host from `rhdh-local` or otherwise muck with your networking configuration

Add the following to the `.env` file of `rhdh-local`

```bash
# update the ldap host to where glauth is running
LDAP_URL=ldap://some-ldap-host:3893
LDAP_BIND_DN=cn=serviceuser,ou=svcaccts,dc=glauth,dc=com
LDAP_BIND_PASSWORD=mysecret
ENABLE_AUTH_PROVIDER_MODULE_OVERRIDE=true
```

Add the following `plugins` configuration to `config/dynamic-plugins.yaml` in `rhdh-local` for the ldap catalog support

```yaml
plugins:
  - package: ./dynamic-plugins/dist/backstage-plugin-catalog-backend-module-ldap-dynamic
    disabled: false
    pluginConfig:
      catalog:
        providers:
          ldapOrg:
            default:
              target: ${LDAP_URL}
              bind:
                dn: ${LDAP_BIND_DN}
                secret: ${LDAP_BIND_PASSWORD}
              users:
                - dn: ou=users,dc=glauth,dc=com
                  options:
                    scope: sub
                    filter: (accountStatus=active)
                    attributes: ['*', '+']
                    paged: false
                  map:
                    rdn: uid
                    name: uid
                    description: description
                    displayName: uid
                    email: mail
                    picture: <nothing, left out>
                    memberOf: memberOf              
              groups:
                - dn: ou=groups,dc=glauth,dc=com
                  options:
                    scope: sub
                    filter: (gidNumber=*)
                    attributes: ['*', '+']
                    paged: false
                  map:
                    rdn: uid
                    name: uid
                    uid: uid
                    displayName: uid
                    description: description
                    type: groupType
                    email: <nothing, left out>
                    picture: <nothing, left out>
                    memberOf: memberOf
                    members: member
              schedule:
                frequency: PT10M
                timeout: PT10M
# optional, this is just to suppress any examples                
        import: {}
        rules:
          - allow: [Component, System, Group, Resource, Location, Template, API, User]
        locations: []
  - package: ./local-plugins/immobiliarelabs-backstage-plugin-ldap-auth
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          immobiliarelabs-backstage-plugin-ldap-auth:
            components:
              - name: SignInPage
                module: PluginRoot
                importName: SignInPage
```

Add the configuration that was printed out by either `export-local` or `package-dynamic-plugins` to `config/dynamic-plugins.yaml` file in `rhdh-local`, for example when using export-local:

```yaml
  - package: ./local-plugins/immobiliarelabs-backstage-plugin-ldap-auth
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          immobiliarelabs-backstage-plugin-ldap-auth:
            components:
              - name: SignInPage
                module: PluginRoot
                importName: SignInPage
  - package: ./local-plugins/immobiliarelabs-backstage-plugin-ldap-auth-backend-dynamic
    disabled: false
    pluginConfig:
      auth:
        environment: development
        providers:
          ldap:
            development:
              ldapAuthenticationOptions:
                userSearchBase: ou=users,dc=glauth,dc=com
                usernameAttribute: uid
                adminDn: ${LDAP_BIND_DN}
                adminPassword: ${LDAP_BIND_PASSWORD}
                ldapOpts:
                  url:
                    - ${LDAP_URL}
```

Finally start up `rhdh-local`.  Once the dynamic plugins have been installed and the application is started, access the application at [http://localhost:7007](http://localhost:7007), or at the appropriate location where `rhdh-local` is running.

## Navigating the running example

Accessing the Developer Hub instance at [http://localhost:7007](http://localhost:7007) should lead to the LDAP login page

![Screenshot of a web page containing a LDAP Name and Password input field as well as a button titled "Login"](./screenshots/login-page.png)

The LDAP example configuration defines a few users, try the following:

```text
LDAP Name: johndoe
Password: dogood
```

After logging in, click on "Settings" in the side-navigation and note that the current user is johndoe and has a user defined in the catalog

![Screenshot of a web page titled "Settings" which contains among other things a box entitled "Profile" with the name "johndoe"](./screenshots/logged-in.png)

![Screenshot of a web page titled "johndoe" which has several boxes containing information about the johndoe user](./screenshots/user-page.png)
