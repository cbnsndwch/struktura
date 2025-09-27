// Workspace domain entities, services, and value objects

import {
    type Workspace,
    type WorkspaceMember,
    type WorkspaceSettings,
    WorkspaceRole,
    WorkspacePermission,
    MemberStatus,
    type CreateWorkspaceData,
    type UpdateWorkspaceData,
    type InviteMemberData,
    type UpdateMemberData,
    type WorkspaceServiceContract,
    type WorkspaceRepositoryContract,
    type WorkspaceMemberRepositoryContract,
    WorkspaceNotFoundError,
    WorkspaceAccessDeniedError,
    WorkspaceSlugConflictError
} from '@cbnsndwch/struktura-workspace-contracts';

// Domain entities
export class WorkspaceEntity {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly ownerId: string,
        public readonly settings: WorkspaceSettings,
        public readonly description?: string,
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) {}

    static create(data: CreateWorkspaceData, ownerId: string): Workspace {
        const slug = data.slug || slugify(data.name);

        return {
            id: generateId(),
            name: data.name,
            slug,
            description: data.description,
            ownerId,
            settings: {
                defaultTimezone: 'UTC',
                defaultLanguage: 'en',
                features: {
                    apiAccess: true,
                    realTimeSync: false,
                    advancedPermissions: false
                },
                ...data.settings
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    update(data: UpdateWorkspaceData): Workspace {
        return {
            ...this,
            ...data,
            updatedAt: new Date()
        };
    }

    canUserAccess(userId: string): boolean {
        return this.ownerId === userId;
    }
}

export class WorkspaceMemberEntity {
    constructor(
        public readonly id: string,
        public readonly workspaceId: string,
        public readonly userId: string,
        public readonly role: WorkspaceRole,
        public readonly permissions: WorkspacePermission[],
        public readonly status: MemberStatus = MemberStatus.ACTIVE,
        public readonly invitedAt?: Date,
        public readonly joinedAt?: Date,
        public readonly invitedBy?: string
    ) {}

    hasPermission(permission: WorkspacePermission): boolean {
        // Owner and admin have all permissions
        if (
            this.role === WorkspaceRole.OWNER ||
            this.role === WorkspaceRole.ADMIN
        ) {
            return true;
        }

        // Check explicit permissions
        return this.permissions.includes(permission);
    }

    canManageMembers(): boolean {
        return this.hasPermission(WorkspacePermission.MANAGE_MEMBERS);
    }

    canEditCollections(): boolean {
        return this.hasPermission(WorkspacePermission.EDIT_COLLECTIONS);
    }
}

// Value objects
export class WorkspaceSlug {
    private readonly value: string;

    constructor(input: string) {
        const slug = slugify(input);
        if (!slug || slug.length < 3 || slug.length > 50) {
            throw new Error('Invalid workspace slug: must be 3-50 characters');
        }
        this.value = slug;
    }

    toString(): string {
        return this.value;
    }

    equals(other: WorkspaceSlug): boolean {
        return this.value === other.value;
    }
}

export class WorkspaceName {
    private readonly value: string;

    constructor(name: string) {
        const trimmed = name.trim();
        if (!trimmed || trimmed.length < 2 || trimmed.length > 100) {
            throw new Error('Invalid workspace name: must be 2-100 characters');
        }
        this.value = trimmed;
    }

    toString(): string {
        return this.value;
    }

    toSlug(): WorkspaceSlug {
        return new WorkspaceSlug(this.value);
    }
}

// Domain services
export class WorkspaceDomainService implements WorkspaceServiceContract {
    constructor(
        private readonly workspaceRepository: WorkspaceRepositoryContract,
        private readonly memberRepository: WorkspaceMemberRepositoryContract
    ) {}

    async create(
        data: CreateWorkspaceData,
        ownerId: string
    ): Promise<Workspace> {
        // Validate name
        const name = new WorkspaceName(data.name);

        // Generate or validate slug
        const slug = data.slug ? new WorkspaceSlug(data.slug) : name.toSlug();

        // Check for slug conflicts
        const existing = await this.workspaceRepository.findBySlug(
            slug.toString()
        );
        if (existing) {
            throw new WorkspaceSlugConflictError(slug.toString());
        }

        // Create workspace
        const workspace = WorkspaceEntity.create(data, ownerId);
        const created = await this.workspaceRepository.create(workspace);

        // Create owner membership
        await this.memberRepository.create({
            workspaceId: created.id,
            userId: ownerId,
            role: WorkspaceRole.OWNER,
            permissions: Object.values(WorkspacePermission),
            status: MemberStatus.ACTIVE,
            joinedAt: new Date()
        });

        return created;
    }

    async findById(id: string): Promise<Workspace | null> {
        return this.workspaceRepository.findById(id);
    }

    async findBySlug(slug: string): Promise<Workspace | null> {
        return this.workspaceRepository.findBySlug(slug);
    }

    async findByOwner(ownerId: string): Promise<Workspace[]> {
        return this.workspaceRepository.findByOwnerId(ownerId);
    }

    async findByMember(userId: string): Promise<Workspace[]> {
        const members = await this.memberRepository.findByUserId(userId);
        const workspaceIds = members.map(m => m.workspaceId);

        const workspaces = await Promise.all(
            workspaceIds.map(id => this.workspaceRepository.findById(id))
        );

        return workspaces.filter(w => w !== null) as Workspace[];
    }

    async update(id: string, data: UpdateWorkspaceData): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findById(id);
        if (!workspace) {
            throw new WorkspaceNotFoundError(id);
        }

        const updateData: Partial<Workspace> = {
            name: data.name,
            description: data.description,
            updatedAt: new Date()
        };

        // Merge settings properly if provided
        if (data.settings) {
            updateData.settings = {
                ...workspace.settings,
                ...data.settings
            };
        }

        return this.workspaceRepository.update(id, updateData);
    }

    async delete(id: string): Promise<void> {
        const workspace = await this.workspaceRepository.findById(id);
        if (!workspace) {
            throw new WorkspaceNotFoundError(id);
        }

        await this.workspaceRepository.delete(id);
    }

    async inviteMember(
        workspaceId: string,
        data: InviteMemberData,
        invitedBy: string
    ): Promise<WorkspaceMember> {
        // Verify workspace exists
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new WorkspaceNotFoundError(workspaceId);
        }

        // Verify inviter has permission
        const inviter = await this.memberRepository.findByWorkspaceAndUser(
            workspaceId,
            invitedBy
        );
        const inviterEntity = inviter
            ? new WorkspaceMemberEntity(
                  inviter.id,
                  inviter.workspaceId,
                  inviter.userId,
                  inviter.role,
                  inviter.permissions,
                  inviter.status,
                  inviter.invitedAt,
                  inviter.joinedAt,
                  inviter.invitedBy
              )
            : null;

        if (
            !inviterEntity ||
            !inviterEntity.hasPermission(WorkspacePermission.MANAGE_MEMBERS)
        ) {
            throw new WorkspaceAccessDeniedError(workspaceId, invitedBy);
        }

        // Create invitation
        const member = await this.memberRepository.create({
            workspaceId,
            userId: data.email, // This would need user ID resolution
            role: data.role,
            permissions: data.permissions || getDefaultPermissions(data.role),
            status: MemberStatus.PENDING,
            invitedAt: new Date(),
            invitedBy
        });

        return member;
    }

    async getMember(
        workspaceId: string,
        userId: string
    ): Promise<WorkspaceMember | null> {
        return this.memberRepository.findByWorkspaceAndUser(
            workspaceId,
            userId
        );
    }

    async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
        return this.memberRepository.findByWorkspaceId(workspaceId);
    }

    async updateMember(
        workspaceId: string,
        userId: string,
        data: UpdateMemberData
    ): Promise<WorkspaceMember> {
        const member = await this.memberRepository.findByWorkspaceAndUser(
            workspaceId,
            userId
        );
        if (!member) {
            throw new Error('Member not found');
        }

        return this.memberRepository.update(member.id, data);
    }

    async removeMember(workspaceId: string, userId: string): Promise<void> {
        const member = await this.memberRepository.findByWorkspaceAndUser(
            workspaceId,
            userId
        );
        if (!member) {
            throw new Error('Member not found');
        }

        await this.memberRepository.delete(member.id);
    }

    async hasPermission(
        workspaceId: string,
        userId: string,
        permission: WorkspacePermission
    ): Promise<boolean> {
        const member = await this.memberRepository.findByWorkspaceAndUser(
            workspaceId,
            userId
        );

        if (!member) return false;

        const memberEntity = new WorkspaceMemberEntity(
            member.id,
            member.workspaceId,
            member.userId,
            member.role,
            member.permissions,
            member.status,
            member.invitedAt,
            member.joinedAt,
            member.invitedBy
        );

        return memberEntity.hasPermission(permission);
    }

    async getUserRole(
        workspaceId: string,
        userId: string
    ): Promise<WorkspaceRole | null> {
        const member = await this.memberRepository.findByWorkspaceAndUser(
            workspaceId,
            userId
        );

        return member ? member.role : null;
    }
}

// Utility functions
function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generateId(): string {
    return crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
}

function getDefaultPermissions(role: WorkspaceRole): WorkspacePermission[] {
    switch (role) {
        case WorkspaceRole.OWNER:
        case WorkspaceRole.ADMIN:
            return Object.values(WorkspacePermission);
        case WorkspaceRole.EDITOR:
            return [
                WorkspacePermission.CREATE_COLLECTIONS,
                WorkspacePermission.EDIT_COLLECTIONS,
                WorkspacePermission.EXPORT_DATA,
                WorkspacePermission.IMPORT_DATA
            ];
        case WorkspaceRole.VIEWER:
            return [WorkspacePermission.EXPORT_DATA];
        default:
            return [];
    }
}

// Re-export contracts for convenience
export * from '@cbnsndwch/struktura-workspace-contracts';
