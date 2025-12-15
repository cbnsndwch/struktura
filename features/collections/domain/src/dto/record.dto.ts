import { IsNotEmpty, IsObject, IsOptional, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecordDto {
    @IsNotEmpty()
    @IsObject()
    data!: Record<string, unknown>;
}

export class UpdateRecordDto {
    @IsNotEmpty()
    @IsObject()
    data!: Partial<Record<string, unknown>>;
}

export class BulkCreateRecordsDto {
    @IsArray()
    @IsNotEmpty()
    records!: CreateRecordDto[];
}

export class BulkUpdateItemDto {
    @IsString()
    @IsNotEmpty()
    id!: string;

    @IsObject()
    @IsNotEmpty()
    data!: Partial<Record<string, unknown>>;
}

export class BulkUpdateRecordsDto {
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => BulkUpdateItemDto)
    updates!: BulkUpdateItemDto[];
}

export class BulkDeleteRecordsDto {
    @IsArray()
    @IsNotEmpty()
    @IsString({ each: true })
    ids!: string[];
}

export class QueryRecordsDto {
    @IsOptional()
    @IsObject()
    filter?: Record<string, unknown>;

    @IsOptional()
    @IsObject()
    sort?: Record<string, 1 | -1>;

    @IsOptional()
    limit?: number;

    @IsOptional()
    skip?: number;

    @IsOptional()
    @IsString({ each: true })
    select?: string[];
}
