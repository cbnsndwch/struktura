import { IsString, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateWorkspaceDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    })
    slug?: string;
}