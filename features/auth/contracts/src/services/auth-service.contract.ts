import type { ILoginWithCredentialsInput } from '../models/login.contracts.js';
import type {
    IConfirmPasswordResetInput,
    IRequestPasswordResetInput
} from '../models/password-reset.contracts.js';
import type { ISession, IUserTokens } from '../models/session.contracts.js';
import type {
    IRegisterInput,
    IVerifyEmailInput
} from '../models/signup.contracts.js';
import type {
    IRefreshTokenInput,
    ITokenPayload
} from '../models/tokens.contracts.js';

/**
 * Contract interface for authentication service operations.
 *
 * Defines the standard set of authentication methods including user
 * registration, email verification, login/logout operations, password reset
 * functionality, and token management.
 */
export interface IAuthService {
    //#region Signup

    /**
     * Registers a new user with the provided data.
     *
     * @param data Registration data including email, password, and optional name.
     * @returns A promise that resolves to a session object containing user info and tokens.
     */
    register(data: IRegisterInput): Promise<ISession>;

    /**
     * Verifies the user's email address.
     *
     * @param data Email verification data including user ID and verification token.
     * @returns A promise that resolves when the email is successfully verified.
     */
    verifyEmail(data: IVerifyEmailInput): Promise<void>;

    //#endregion Signup

    //#region Login

    /**
     * Logs in a user using their credentials.
     *
     * @param credentials User login credentials including email and password.
     * @returns A promise that resolves to a session object containing user info and tokens.
     */
    login(credentials: ILoginWithCredentialsInput): Promise<ISession>;

    //#endregion Login

    //#region Logout

    /**
     * Logs out the user by revoking their tokens.
     *
     * @param userId The ID of the user to log out.
     * @returns A promise that resolves when the user is successfully logged out.
     */
    logout(userId: string): Promise<void>;

    //#endregion Logout

    //#region Password Reset

    /**
     * Requests a password reset for the user.
     *
     * @param data Password reset request data including email.
     * @returns A promise that resolves when the password reset request is successfully sent.
     */
    requestPasswordReset(data: IRequestPasswordResetInput): Promise<void>;

    /**
     * Resets the user's password.
     *
     * @param data Password reset data including new password and reset token.
     * @returns A promise that resolves when the password is successfully reset.
     */
    resetPassword(data: IConfirmPasswordResetInput): Promise<void>;

    //#endregion Password Reset

    //#region Tokens

    /**
     * Validates a JWT token and returns its payload.
     *
     * @param token The JWT token to validate.
     * @returns A promise that resolves to the token payload if valid.
     */
    validateToken(token: string): Promise<ITokenPayload>;

    /**
     * Refreshes the user's access token.
     *
     * @param data Refresh token data including the old refresh token.
     * @returns A promise that resolves to a new set of user tokens.
     */
    refreshToken(data: IRefreshTokenInput): Promise<IUserTokens>;

    //#endregion Tokens
}
