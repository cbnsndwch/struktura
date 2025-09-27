import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

import { CreateWorkspaceDto, CreateWorkspaceInput } from './create-workspace.dto.js';

export class UpdateWorkspaceDto extends PartialType(
    OmitType(CreateWorkspaceDto, ['slug'] as const)
) {}

@InputType()
export class UpdateWorkspaceInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(1, { message: 'Name is required' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    description?: string;
}

@InputType()
export class UpdateWorkspaceSettingsDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    defaultTimezone?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    defaultLanguage?: string;
}

@InputType()
export class UpdateWorkspaceSettingsInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    defaultTimezone?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    defaultLanguage?: string;
}
