// Workspace core interfaces and types

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
    settings: WorkspaceSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkspaceSettings {
    defaultTimezone: string;
    defaultLanguage: string;
    features: {
        apiAccess: boolean;
        realTimeSync: boolean;
        advancedPermissions: boolean;
    };
    branding?: {
        logo?: string;
        primaryColor?: string;
        customDomain?: string;
    };
}

export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
    permissions: WorkspacePermission[];
    invitedAt?: Date;
    joinedAt?: Date;
    invitedBy?: string;
    status: MemberStatus;
}

export enum WorkspaceRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer'
}

export enum WorkspacePermission {
    CREATE_COLLECTIONS = 'create_collections',
    EDIT_COLLECTIONS = 'edit_collections',
    DELETE_COLLECTIONS = 'delete_collections',
    MANAGE_MEMBERS = 'manage_members',
    MANAGE_SETTINGS = 'manage_settings',
    EXPORT_DATA = 'export_data',
    IMPORT_DATA = 'import_data',
    ACCESS_API = 'access_api'
}

export enum MemberStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    SUSPENDED = 'suspended'
}

// DTOs
export interface CreateWorkspaceData {
    name: string;
    description?: string;
    slug?: string;
    settings?: Partial<WorkspaceSettings>;
}

export interface UpdateWorkspaceData {
    name?: string;
    description?: string;
    settings?: Partial<WorkspaceSettings>;
}

export interface InviteMemberData {
    email: string;
    role: WorkspaceRole;
    permissions?: WorkspacePermission[];
}

export interface UpdateMemberData {
    role?: WorkspaceRole;
    permissions?: WorkspacePermission[];
    status?: MemberStatus;
}

// Service contracts
export interface WorkspaceServiceContract {
    create(data: CreateWorkspaceData, ownerId: string): Promise<Workspace>;
    findById(id: string): Promise<Workspace | null>;
    findBySlug(slug: string): Promise<Workspace | null>;
    findByOwner(ownerId: string): Promise<Workspace[]>;
    findByMember(userId: string): Promise<Workspace[]>;
    update(id: string, data: UpdateWorkspaceData): Promise<Workspace>;
    delete(id: string): Promise<void>;

    // Member management
    inviteMember(
        workspaceId: string,
        data: InviteMemberData,
        invitedBy: string
    ): Promise<WorkspaceMember>;
    getMember(
        workspaceId: string,
        userId: string
    ): Promise<WorkspaceMember | null>;
    getMembers(workspaceId: string): Promise<WorkspaceMember[]>;
    updateMember(
        workspaceId: string,
        userId: string,
        data: UpdateMemberData
    ): Promise<WorkspaceMember>;
    removeMember(workspaceId: string, userId: string): Promise<void>;

    // Permissions
    hasPermission(
        workspaceId: string,
        userId: string,
        permission: WorkspacePermission
    ): Promise<boolean>;
    getUserRole(
        workspaceId: string,
        userId: string
    ): Promise<WorkspaceRole | null>;
}

export interface WorkspaceRepositoryContract {
    findById(id: string): Promise<Workspace | null>;
    findBySlug(slug: string): Promise<Workspace | null>;
    findByOwnerId(ownerId: string): Promise<Workspace[]>;
    create(
        workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Workspace>;
    update(id: string, updates: Partial<Workspace>): Promise<Workspace>;
    delete(id: string): Promise<void>;
}

export interface WorkspaceMemberRepositoryContract {
    findByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]>;
    findByUserId(userId: string): Promise<WorkspaceMember[]>;
    findByWorkspaceAndUser(
        workspaceId: string,
        userId: string
    ): Promise<WorkspaceMember | null>;
    create(member: Omit<WorkspaceMember, 'id'>): Promise<WorkspaceMember>;
    update(
        id: string,
        updates: Partial<WorkspaceMember>
    ): Promise<WorkspaceMember>;
    delete(id: string): Promise<void>;
}

// Events
export interface WorkspaceEvent {
    type:
        | 'CREATED'
        | 'UPDATED'
        | 'DELETED'
        | 'MEMBER_INVITED'
        | 'MEMBER_JOINED'
        | 'MEMBER_LEFT';
    workspaceId: string;
    userId: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

// Errors
export class WorkspaceNotFoundError extends Error {
    constructor(identifier: string) {
        super(`Workspace not found: ${identifier}`);
        this.name = 'WorkspaceNotFoundError';
    }
}

export class WorkspaceAccessDeniedError extends Error {
    constructor(workspaceId: string, userId: string) {
        super(`Access denied to workspace ${workspaceId} for user ${userId}`);
        this.name = 'WorkspaceAccessDeniedError';
    }
}

export class WorkspaceSlugConflictError extends Error {
    constructor(slug: string) {
        super(`Workspace slug already exists: ${slug}`);
        this.name = 'WorkspaceSlugConflictError';
    }
}
