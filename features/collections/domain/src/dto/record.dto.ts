import { IsNotEmpty, IsObject, IsOptional, IsArray, IsString } from 'class-validator';

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

export class BulkUpdateRecordsDto {
    @IsArray()
    @IsNotEmpty()
    updates!: Array<{ id: string; data: Partial<Record<string, unknown>> }>;
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
