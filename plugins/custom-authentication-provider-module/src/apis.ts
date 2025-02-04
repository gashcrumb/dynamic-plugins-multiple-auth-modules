import {
  ScmAuth,
  scmAuthApiRef,
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';
import {
  ApiRef,
  BackstageIdentityApi,
  configApiRef,
  createApiFactory,
  createApiRef,
  discoveryApiRef,
  githubAuthApiRef,
  OAuthApi,
  oauthRequestApiRef,
  ProfileInfoApi,
  SessionApi,
} from '@backstage/core-plugin-api';
import { GithubAuth } from '@backstage/core-app-api';

export const scmIntegrationApi = createApiFactory({
  api: scmIntegrationsApiRef,
  deps: { configApi: configApiRef },
  factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
});

const ghTwoAuthApiRef: ApiRef<
  OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionApi
> = createApiRef({
  id: 'core.auth.github.two',
});

export const ghTwoApi: any = createApiFactory({
  api: ghTwoAuthApiRef,
  deps: {
    discoveryApi: discoveryApiRef,
    oauthRequestApi: oauthRequestApiRef,
    configApi: configApiRef,
  },
  factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
    GithubAuth.create({
      configApi,
      discoveryApi,
      oauthRequestApi,
      provider: { id: 'github-two', title: 'Github Two', icon: () => null },
      defaultScopes: ['read:user'],
      environment: configApi.getOptionalString('auth.environment'),
    }),
});

export const scmAuthApi = createApiFactory({
  api: scmAuthApiRef,
  deps: { githubAuthApi: githubAuthApiRef, ghTwoAuthApi: ghTwoAuthApiRef },
  factory: ({ githubAuthApi, ghTwoAuthApi }) => {
    console.log('Custom ScmAuth API factory function called');
    return ScmAuth.merge(
      ScmAuth.forGithub(ghTwoAuthApi),
      ScmAuth.forGithub(githubAuthApi, { host: 'my.enterprise.github' }),
    );
  },
});
