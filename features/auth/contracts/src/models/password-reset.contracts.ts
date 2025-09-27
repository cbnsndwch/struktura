export interface IRequestPasswordResetInput {
    email: string;
}

export interface IConfirmPasswordResetInput {
    token: string;
    newPassword: string;
}
