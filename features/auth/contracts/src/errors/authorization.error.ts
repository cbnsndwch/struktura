export class AuthorizationError extends Error {
    constructor(
        message: string,
        public readonly requiredPermission?: string
    ) {
        super(message);
        this.name = 'AuthorizationError';
    }
}
