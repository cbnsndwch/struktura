export interface IAuthEvent {
    type: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_RESET' | 'EMAIL_VERIFIED';
    userId: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
