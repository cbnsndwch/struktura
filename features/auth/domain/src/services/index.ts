import type { Provider } from '@nestjs/common';

import { authProvider } from './auth.service.js';
import { PreferencesService } from './preferences.service.js';
import { SessionService } from './session.service.js';

export const authServices: Provider[] = [
    PreferencesService,
    SessionService,
    authProvider
];

export * from './auth.service.js';
export * from './preferences.service.js';
export * from './session.service.js';
