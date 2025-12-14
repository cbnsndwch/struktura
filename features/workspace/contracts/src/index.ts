// Workspace core interfaces and types

export interface IWorkspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
    settings: IWorkspaceSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWorkspaceSettings {
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

export interface IWorkspaceMember {
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
    settings?: Partial<IWorkspaceSettings>;
}

export interface UpdateWorkspaceData {
    name?: string;
    description?: string;
    settings?: Partial<IWorkspaceSettings>;
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
    create(data: CreateWorkspaceData, ownerId: string): Promise<IWorkspace>;
    findById(id: string): Promise<IWorkspace | null>;
    findBySlug(slug: string): Promise<IWorkspace | null>;
    findByOwner(ownerId: string): Promise<IWorkspace[]>;
    findByMember(userId: string): Promise<IWorkspace[]>;
    update(id: string, data: UpdateWorkspaceData): Promise<IWorkspace>;
    delete(id: string): Promise<void>;

    // Member management
    inviteMember(
        workspaceId: string,
        data: InviteMemberData,
        invitedBy: string
    ): Promise<IWorkspaceMember>;
    getMember(
        workspaceId: string,
        userId: string
    ): Promise<IWorkspaceMember | null>;
    getMembers(workspaceId: string): Promise<IWorkspaceMember[]>;
    updateMember(
        workspaceId: string,
        userId: string,
        data: UpdateMemberData
    ): Promise<IWorkspaceMember>;
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
    findById(id: string): Promise<IWorkspace | null>;
    findBySlug(slug: string): Promise<IWorkspace | null>;
    findByOwnerId(ownerId: string): Promise<IWorkspace[]>;
    create(
        workspace: Omit<IWorkspace, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<IWorkspace>;
    update(id: string, updates: Partial<IWorkspace>): Promise<IWorkspace>;
    delete(id: string): Promise<void>;
}

export interface WorkspaceMemberRepositoryContract {
    findByWorkspaceId(workspaceId: string): Promise<IWorkspaceMember[]>;
    findByUserId(userId: string): Promise<IWorkspaceMember[]>;
    findByWorkspaceAndUser(
        workspaceId: string,
        userId: string
    ): Promise<IWorkspaceMember | null>;
    create(member: Omit<IWorkspaceMember, 'id'>): Promise<IWorkspaceMember>;
    update(
        id: string,
        updates: Partial<IWorkspaceMember>
    ): Promise<IWorkspaceMember>;
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

// =============================================================================
// React Router Loader Interfaces (Interface Segregation Principle)
// These minimal interfaces are used by RR7 loaders to avoid bundling Nest code
// =============================================================================

/**
 * Workspace data returned by loader interface.
 * This is a plain JSON object suitable for RR7 serialization.
 */
export interface WorkspaceLoaderData {
    id: string;
    name: string;
    slug: string;
    description?: string;
    owner: string;
    members: Array<{
        user: string;
        role: 'owner' | 'admin' | 'editor' | 'viewer';
        invitedAt: string;
        joinedAt?: string;
    }>;
    settings: {
        timezone: string;
        dateFormat: string;
        numberFormat: string;
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
    };
    createdAt: string;
    updatedAt: string;
}

/**
 * Create workspace input for loader interface.
 */
export interface CreateWorkspaceLoaderInput {
    name: string;
    description?: string;
    slug?: string;
}

/**
 * Minimal interface for workspace operations in React Router loaders.
 * This follows the Interface Segregation Principle - RR7 loaders only need
 * these methods and should not import the full WorkspaceService class.
 *
 * The implementation is provided by the Nest side via getLoadContext().
 */
export interface IWorkspaceLoader {
    /**
     * Get all workspaces for a user.
     * Returns plain JSON objects ready for RR7 serialization.
     */
    findAllForUser(userId: string): Promise<WorkspaceLoaderData[]>;

    /**
     * Create a new workspace.
     * Returns plain JSON object ready for RR7 serialization.
     */
    create(
        input: CreateWorkspaceLoaderInput,
        ownerId: string
    ): Promise<WorkspaceLoaderData>;
}
