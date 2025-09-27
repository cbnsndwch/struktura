import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema.js';
import { User, UserDocument } from '../../auth/schemas/user.schema.js';
import {
    CreateWorkspaceDto,
    UpdateWorkspaceDto,
    UpdateWorkspaceSettingsDto,
    InviteMemberDto,
    UpdateMemberRoleDto,
    WorkspaceRole
} from '../dto/index.js';

@Injectable()
export class WorkspaceService {
    constructor(
        @InjectModel(Workspace.name)
        private workspaceModel: Model<WorkspaceDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>
    ) {}

    /**
     * Create a new workspace
     */
    async create(
        createWorkspaceDto: CreateWorkspaceDto,
        ownerId: string
    ): Promise<WorkspaceDocument> {
        const { name, description, slug } = createWorkspaceDto;

        // Generate slug if not provided
        const workspaceSlug = slug || this.generateSlug(name);

        // Check if slug already exists
        const existingWorkspace = await this.workspaceModel
            .findOne({ slug: workspaceSlug })
            .exec();

        if (existingWorkspace) {
            throw new ConflictException('Workspace slug already exists');
        }

        // Create workspace with owner as the first member
        const workspace = new this.workspaceModel({
            name,
            description,
            slug: workspaceSlug,
            owner: new Types.ObjectId(ownerId),
            members: [
                {
                    user: new Types.ObjectId(ownerId),
                    role: WorkspaceRole.OWNER,
                    invitedAt: new Date(),
                    joinedAt: new Date()
                }
            ],
            settings: {
                timezone: 'UTC',
                dateFormat: 'YYYY-MM-DD',
                numberFormat: 'en-US'
            }
        });

        return workspace.save();
    }

    /**
     * Get all workspaces for a user
     */
    async findAllForUser(userId: string): Promise<WorkspaceDocument[]> {
        return this.workspaceModel
            .find({
                'members.user': new Types.ObjectId(userId)
            })
            .populate('owner', 'name email')
            .populate('members.user', 'name email')
            .sort({ updatedAt: -1 })
            .exec();
    }

    /**
     * Get workspace by ID
     */
    async findOne(id: string): Promise<WorkspaceDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid workspace ID');
        }

        const workspace = await this.workspaceModel
            .findById(id)
            .populate('owner', 'name email')
            .populate('members.user', 'name email')
            .exec();

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        return workspace;
    }

    /**
     * Get workspace by slug
     */
    async findBySlug(slug: string): Promise<WorkspaceDocument> {
        const workspace = await this.workspaceModel
            .findOne({ slug })
            .populate('owner', 'name email')
            .populate('members.user', 'name email')
            .exec();

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        return workspace;
    }

    /**
     * Update workspace
     */
    async update(
        id: string,
        updateWorkspaceDto: UpdateWorkspaceDto,
        userId: string
    ): Promise<WorkspaceDocument> {
        const workspace = await this.findOne(id);

        // Check if user has permission to update workspace
        await this.checkPermission(workspace, userId, [
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN
        ]);

        Object.assign(workspace, updateWorkspaceDto);
        return workspace.save();
    }

    /**
     * Update workspace settings
     */
    async updateSettings(
        id: string,
        settingsDto: UpdateWorkspaceSettingsDto,
        userId: string
    ): Promise<WorkspaceDocument> {
        const workspace = await this.findOne(id);

        await this.checkPermission(workspace, userId, [
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN
        ]);

        workspace.settings = { ...workspace.settings, ...settingsDto };
        return workspace.save();
    }

    /**
     * Delete workspace
     */
    async remove(id: string, userId: string): Promise<void> {
        const workspace = await this.findOne(id);

        // Only workspace owner can delete
        if (workspace.owner.toString() !== userId) {
            throw new ForbiddenException(
                'Only workspace owner can delete the workspace'
            );
        }

        await this.workspaceModel.findByIdAndDelete(id).exec();
    }

    /**
     * Invite member to workspace
     */
    async inviteMember(
        workspaceId: string,
        inviteMemberDto: InviteMemberDto,
        inviterId: string
    ): Promise<WorkspaceDocument> {
        const workspace = await this.findOne(workspaceId);

        // Check permission
        await this.checkPermission(workspace, inviterId, [
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN
        ]);

        // Find user by email
        const user = await this.userModel
            .findOne({ email: inviteMemberDto.email })
            .exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user is already a member
        const existingMember = workspace.members.find(
            member => member.user.toString() === user._id?.toString()
        );

        if (existingMember) {
            throw new ConflictException('User is already a member');
        }

        // Add member
        workspace.members.push({
            user: user._id as Types.ObjectId,
            role: inviteMemberDto.role,
            invitedAt: new Date()
        });

        return workspace.save();
    }

    /**
     * Update member role
     */
    async updateMemberRole(
        workspaceId: string,
        memberId: string,
        updateRoleDto: UpdateMemberRoleDto,
        requesterId: string
    ): Promise<WorkspaceDocument> {
        const workspace = await this.findOne(workspaceId);

        // Check permission
        await this.checkPermission(workspace, requesterId, [
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN
        ]);

        // Find member
        const member = workspace.members.find(
            m => m.user.toString() === memberId
        );

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        // Can't change owner role
        if (member.role === WorkspaceRole.OWNER) {
            throw new ForbiddenException('Cannot change owner role');
        }

        // Only owner can assign admin role
        if (
            updateRoleDto.role === WorkspaceRole.ADMIN &&
            workspace.owner.toString() !== requesterId
        ) {
            throw new ForbiddenException(
                'Only workspace owner can assign admin role'
            );
        }

        member.role = updateRoleDto.role;
        return workspace.save();
    }

    /**
     * Remove member from workspace
     */
    async removeMember(
        workspaceId: string,
        memberId: string,
        requesterId: string
    ): Promise<WorkspaceDocument> {
        const workspace = await this.findOne(workspaceId);

        // Check permission
        await this.checkPermission(workspace, requesterId, [
            WorkspaceRole.OWNER,
            WorkspaceRole.ADMIN
        ]);

        // Can't remove owner
        if (workspace.owner.toString() === memberId) {
            throw new ForbiddenException('Cannot remove workspace owner');
        }

        // Remove member
        workspace.members = workspace.members.filter(
            member => member.user.toString() !== memberId
        );

        return workspace.save();
    }

    /**
     * Get user role in workspace
     */
    async getUserRole(
        workspaceId: string,
        userId: string
    ): Promise<WorkspaceRole | null> {
        const workspace = await this.workspaceModel
            .findById(workspaceId)
            .select('members owner')
            .exec();

        if (!workspace) {
            return null;
        }

        // Check if user is owner
        if (workspace.owner.toString() === userId) {
            return WorkspaceRole.OWNER;
        }

        // Find user in members
        const member = workspace.members.find(
            m => m.user.toString() === userId
        );

        return member ? (member.role as WorkspaceRole) : null;
    }

    /**
     * Check if user has permission in workspace
     */
    private async checkPermission(
        workspace: WorkspaceDocument,
        userId: string,
        requiredRoles: WorkspaceRole[]
    ): Promise<void> {
        const userRole = await this.getUserRole(workspace.id, userId);

        if (!userRole || !requiredRoles.includes(userRole)) {
            throw new ForbiddenException('Insufficient permissions');
        }
    }

    /**
     * Generate slug from name
     */
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
