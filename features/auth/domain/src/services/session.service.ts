import type { IncomingHttpHeaders } from 'node:http';

import { Inject, Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';

import { type Auth, TOKEN_AUTH_SERVICE } from './auth.service.js';

@Injectable()
export class SessionService {
    /**
     *
     */
    constructor(
        @Inject(TOKEN_AUTH_SERVICE)
        private readonly auth: Auth
    ) {}

    async getSession(headers: IncomingHttpHeaders) {
        try {
            const webHeaders = fromNodeHeaders(headers);
            const session = await this.auth.api.getSession({
                headers: webHeaders
            });

            return session;
        } catch {
            return null;
        }
    }
}
