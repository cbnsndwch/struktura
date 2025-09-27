export interface IRegisterInput {
    email: string;
    name: string;
    password: string;
    timezone?: string;
    language?: string;
}

export interface IVerifyEmailInput {
    token: string;
}
