import { createPlugin } from '@backstage/core-plugin-api';
import { scmAuthApi, ghTwoApi } from './apis';

export const customAuthProviderPlugin = createPlugin({
  id: 'custom-auth-provider-plugin',
  apis: [ghTwoApi, scmAuthApi],
});
