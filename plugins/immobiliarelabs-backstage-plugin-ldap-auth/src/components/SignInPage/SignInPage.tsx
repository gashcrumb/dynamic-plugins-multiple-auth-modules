import React from 'react';
import { SignInPageProps } from '@backstage/core-plugin-api';
import { LdapAuthFrontendPage } from '@immobiliarelabs/backstage-plugin-ldap-auth';

export function SignInPage(props: SignInPageProps): React.JSX.Element {
  return <LdapAuthFrontendPage {...props} provider="ldap" />;
}
