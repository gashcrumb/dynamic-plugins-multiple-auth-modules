import { ScmAuth, scmAuthApiRef } from '@backstage/integration-react';
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

export const ghTwoAuthApiRef: ApiRef<
  OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionApi
> = createApiRef({
  id: 'core.auth.github.two',
});

export const ghTwoApi:any = createApiFactory({
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

export const customScmAuthApiFactory = createApiFactory({
  api: scmAuthApiRef,
  deps: { githubAuthApi: githubAuthApiRef, ghTwoAuthApi: ghTwoAuthApiRef },
  factory: ({ githubAuthApi, ghTwoAuthApi }) =>
    ScmAuth.merge(
      ScmAuth.forGithub(githubAuthApi),
      ScmAuth.forGithub(ghTwoAuthApi),
    ),
});
