// Authentication errors

export class AuthenticationError extends Error {
    constructor(
        message: string,
        public readonly code: string
    ) {
        super(message);
        this.name = 'AuthenticationError';
    }
}
