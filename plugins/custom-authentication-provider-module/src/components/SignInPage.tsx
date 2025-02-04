import React from 'react';
import { SignInPage } from '@backstage/core-components';
import { microsoftAuthApiRef } from '@backstage/core-plugin-api';

const providers = [
 {
  id: 'microsoft',
  title: 'Microsoft',
  message: 'Sign in using Azure AD',
  apiRef: microsoftAuthApiRef
 }
];

export function CustomSignInPage(props: any): React.JSX.Element {
  return <SignInPage {...props} providers={[...providers, 'guest']} />;
}
