import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsIn,
    IsOptional
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

/**
 * DTO for user registration
 * Used with Better Auth's signUp endpoint
 */
@InputType('RegisterInput')
export class RegisterDto {
    @Field()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @Field()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    name!: string;

    @Field()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
    password!: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    timezone?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    language?: string;
}

/**
 * DTO for user login
 * Used with Better Auth's signIn endpoint
 */
@InputType('LoginInput')
export class LoginDto {
    @Field()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @Field()
    @IsString()
    password!: string;
}

/**
 * DTO for user profile updates
 * Allows updating safe user fields via preferences
 */
@InputType('UpdateUserInput')
export class UpdateUserDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    timezone?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    language?: string;
}

/**
 * DTO for password reset request
 */
@InputType('PasswordResetRequestInput')
export class RequestPasswordResetDto {
    @Field()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;
}

/**
 * DTO for password reset
 */
@InputType('PasswordResetInput')
export class ResetPasswordDto {
    @Field()
    @IsString()
    token!: string;

    @Field()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
    newPassword!: string;
}

/**
 * DTO for refresh token operations
 */
@InputType('RefreshTokenInput')
export class RefreshTokenDto {
    @Field()
    @IsString()
    refreshToken!: string;
}

/**
 * DTO for updating user preferences
 */
@InputType('UpdatePreferencesInput')
export class UpdatePreferencesDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsIn(['light', 'dark', 'system'], {
        message: 'Theme must be one of: light, dark, system'
    })
    theme?: 'light' | 'dark' | 'system';
}
