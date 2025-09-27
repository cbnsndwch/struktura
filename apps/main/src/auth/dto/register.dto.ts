import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional
} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password!: string;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsString()
    language?: string;
}
