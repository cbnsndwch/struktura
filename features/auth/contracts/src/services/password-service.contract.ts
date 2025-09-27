export interface IPasswordService {
    verify(plainPassword: string, userId: string): Promise<boolean>;
    generateResetToken(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}
