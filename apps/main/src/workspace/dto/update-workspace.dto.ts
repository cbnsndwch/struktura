import { PartialType, OmitType } from '@nestjs/mapped-types';

import { CreateWorkspaceDto } from './create-workspace.dto.js';

export class UpdateWorkspaceDto extends PartialType(
    OmitType(CreateWorkspaceDto, ['slug'] as const)
) {}

export class UpdateWorkspaceSettingsDto {
    timezone?: string;
    dateFormat?: string;
    numberFormat?: string;
}
