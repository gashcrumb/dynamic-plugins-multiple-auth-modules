import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  commonSignInResolvers,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import {
  githubAuthenticator,
  githubSignInResolvers,
} from '@backstage/plugin-auth-backend-module-github-provider';

export const customAuthenticationProvidersModule = createBackendModule({
  pluginId: 'auth',
  moduleId: 'auth.providers',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        providers: authProvidersExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'github-two',
          factory: createOAuthProviderFactory({
            authenticator: githubAuthenticator as any, // TODO
            signInResolverFactories: {
              ...githubSignInResolvers,
              ...commonSignInResolvers,
            },
          }),
        });
      },
    });
  },
});
