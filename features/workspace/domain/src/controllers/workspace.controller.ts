import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';

import { JwtAuthGuard } from '@cbnsndwch/struktura-auth-domain';

import { WorkspaceRole } from '../entities/index.js';
import {
    CreateWorkspaceDto,
    InviteMemberDto,
    UpdateMemberRoleDto,
    UpdateWorkspaceDto,
    UpdateWorkspaceSettingsDto
} from '../dto/index.js';
import { WorkspaceGuard, WorkspaceRoles } from '../guards/index.js';
import { WorkspaceService } from '../services/workspace.service.js';

// Type definition for authenticated request
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        email: string;
        roles?: string[];
    };
}

@Controller('api/workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Post()
    create(
        @Body() createWorkspaceDto: CreateWorkspaceDto,
        @Request() req: AuthenticatedRequest
    ) {
        return this.workspaceService.create(createWorkspaceDto, req.user.sub);
    }

    @Get()
    findAll(@Request() req: AuthenticatedRequest) {
        return this.workspaceService.findAllForUser(req.user.sub);
    }

    @Get(':id')
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    findOne(@Param('id') id: string) {
        return this.workspaceService.findOne(id);
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.workspaceService.findBySlug(slug);
    }

    @Patch(':id')
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    update(
        @Param('id') id: string,
        @Body() updateWorkspaceDto: UpdateWorkspaceDto,
        @Request() req: AuthenticatedRequest
    ) {
        return this.workspaceService.update(
            id,
            updateWorkspaceDto,
            req.user.sub
        );
    }

    @Patch(':id/settings')
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    updateSettings(
        @Param('id') id: string,
        @Body() settingsDto: UpdateWorkspaceSettingsDto,
        @Request() req: AuthenticatedRequest
    ) {
        return this.workspaceService.updateSettings(
            id,
            settingsDto,
            req.user.sub
        );
    }

    @Delete(':id')
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER])
    remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
        return this.workspaceService.remove(id, req.user.sub);
    }

    @Post(':id/members')
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    inviteMember(
        @Param('id') id: string,
        @Body() inviteMemberDto: InviteMemberDto,
        @Request() req: AuthenticatedRequest
    ) {
        return this.workspaceService.inviteMember(
            id,
            inviteMemberDto,
            req.user.sub
        );
    }

    @Patch(':id/members/:memberId/role')
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    updateMemberRole(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Body() updateRoleDto: UpdateMemberRoleDto,
        @Request() req: AuthenticatedRequest
    ) {
        return this.workspaceService.updateMemberRole(
            id,
            memberId,
            updateRoleDto,
            req.user.sub
        );
    }

    @Delete(':id/members/:memberId')
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([WorkspaceRole.OWNER, WorkspaceRole.ADMIN])
    removeMember(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Request() req: AuthenticatedRequest
    ) {
        return this.workspaceService.removeMember(id, memberId, req.user.sub);
    }

    @Get(':id/role')
    @UseGuards(WorkspaceGuard)
    @WorkspaceRoles([
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.EDITOR,
        WorkspaceRole.VIEWER
    ])
    getUserRole(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
        return this.workspaceService.getUserRole(id, req.user.sub);
    }
}
