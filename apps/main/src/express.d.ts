import type { Dict } from '@cbnsndwch/struktura-shared-contracts';

declare global {
    interface AuthenticatedRequest extends Request {
        user: Express.User;
    }

    namespace Express {
        interface User extends Dict {
            sub: string;
            email: string;
            roles?: string[];
        }
    }
}
