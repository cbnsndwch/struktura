import {
    IsString,
    IsOptional,
    MaxLength,
    MinLength,
    Matches
} from 'class-validator';

import { InputType, Field } from '@nestjs/graphql';

export class CreateWorkspaceDto {
    @IsString()
    @MinLength(1, { message: 'Name is required' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    description?: string;

    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Slug must be at least 3 characters long' })
    @MaxLength(50, { message: 'Slug cannot exceed 50 characters' })
    @Matches(/^[a-z0-9-]+$/, {
        message:
            'Slug must contain only lowercase letters, numbers, and hyphens'
    })
    slug?: string;
}

@InputType()
export class CreateWorkspaceInput {
    @Field()
    @IsString()
    @MinLength(1, { message: 'Name is required' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    name!: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Slug must be at least 3 characters long' })
    @MaxLength(50, { message: 'Slug cannot exceed 50 characters' })
    @Matches(/^[a-z0-9-]+$/, {
        message:
            'Slug must contain only lowercase letters, numbers, and hyphens'
    })
    slug?: string;
}
