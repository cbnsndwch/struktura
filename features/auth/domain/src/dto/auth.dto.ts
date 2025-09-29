import { IsEmail, IsString, MinLength, MaxLength, IsIn, IsOptional } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { InputType, Field } from '@nestjs/graphql';

import { User } from '../entities/user.entity.js';

/**
 * DTO for user registration
 * Extends the base User model and adds password validation
 */
@InputType('RegisterInput')
export class RegisterDto extends PickType(User, [
    'email',
    'name',
    'timezone',
    'language'
] as const) {
    @Field()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
    password!: string;
}

/**
 * DTO for user login
 * Simple credentials validation
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
 * Allows updating only safe user fields
 */
@InputType('UpdateUserInput')
export class UpdateUserDto extends PickType(User, [
    'name',
    'timezone',
    'language'
] as const) {}

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
