import React from 'react';
import { SignInPage } from '@backstage/core-components';
import {
  configApiRef,
  microsoftAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';

const providers = [
  {
    id: 'microsoft',
    title: 'Microsoft',
    message: 'Sign in using Azure AD',
    apiRef: microsoftAuthApiRef,
  },
];

export function CustomSignInPage(props: any): React.JSX.Element {
  const configApi = useApi(configApiRef);
  const isDevEnv = configApi.getString('auth.environment') === 'development';
  return (
    <SignInPage
      {...props}
      auto
      providers={isDevEnv ? [...providers, 'guest'] : providers}
    />
  );
}
