import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceService } from '../services/workspace.service.js';
import { WorkspaceRole } from '../dto/index.js';

import { SetMetadata } from '@nestjs/common';

export const WORKSPACE_ROLES_KEY = 'workspaceRoles';
export const WorkspaceRoles = (roles: WorkspaceRole[]) =>
    SetMetadata(WORKSPACE_ROLES_KEY, roles);

@Injectable()
export class WorkspaceGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private workspaceService: WorkspaceService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
            WORKSPACE_ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const workspaceId = request.params.workspaceId || request.params.id;

        if (!user || !workspaceId) {
            throw new ForbiddenException('Access denied');
        }

        const userRole = await this.workspaceService.getUserRole(
            workspaceId,
            user.sub
        );

        if (!userRole || !requiredRoles.includes(userRole)) {
            throw new ForbiddenException('Insufficient workspace permissions');
        }

        return true;
    }
}