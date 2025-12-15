/**
 * Workspace API client
 */
import { apiClient, type ServerRequestOptions } from './client.js';

// Types based on the workspace domain entities
export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    owner: string;
    members: WorkspaceMember[];
    settings: WorkspaceSettings;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceMember {
    user: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    invitedAt: string;
    joinedAt?: string;
}

export interface WorkspaceSettings {
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
}

export interface CreateWorkspaceData {
    name: string;
    description?: string;
    slug?: string;
}

export interface UpdateWorkspaceData {
    name?: string;
    description?: string;
    slug?: string;
}

// Recent Activity Types
export interface RecentActivity {
    id: string;
    type:
        | 'collection_created'
        | 'collection_updated'
        | 'record_created'
        | 'record_updated'
        | 'member_joined';
    description: string;
    timestamp: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    metadata?: {
        collectionId?: string;
        collectionName?: string;
        recordId?: string;
        recordTitle?: string;
    };
}

// Collections Summary for Dashboard
export interface CollectionSummary {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    recordCount: number;
    lastUpdated: string;
}

export interface WorkspaceDashboardData {
    workspace: Workspace;
    collections: CollectionSummary[];
    recentActivity: RecentActivity[];
    stats: {
        totalCollections: number;
        totalRecords: number;
        activeMembers: number;
    };
}

/**
 * Workspace API client
 */
export class WorkspaceApi {
    /**
     * Get all workspaces for the current user
     * @param options - Optional request options including cookieHeader for server-side calls
     */
    async getUserWorkspaces(options?: ServerRequestOptions): Promise<Workspace[]> {
        return apiClient.get<Workspace[]>('/workspaces', options);
    }

    /**
     * Get a specific workspace by ID
     * @param options - Optional request options including cookieHeader for server-side calls
     */
    async getWorkspace(id: string, options?: ServerRequestOptions): Promise<Workspace> {
        return apiClient.get<Workspace>(`/workspaces/${id}`, options);
    }

    /**
     * Get a workspace by slug
     * @param options - Optional request options including cookieHeader for server-side calls
     */
    async getWorkspaceBySlug(slug: string, options?: ServerRequestOptions): Promise<Workspace> {
        return apiClient.get<Workspace>(`/workspaces/slug/${slug}`, options);
    }

    /**
     * Create a new workspace
     * @param options - Optional request options including cookieHeader for server-side calls
     */
    async createWorkspace(data: CreateWorkspaceData, options?: ServerRequestOptions): Promise<Workspace> {
        return apiClient.post<Workspace>('/workspaces', data, options);
    }

    /**
     * Update a workspace
     * @param options - Optional request options including cookieHeader for server-side calls
     */
    async updateWorkspace(
        id: string,
        data: UpdateWorkspaceData,
        options?: ServerRequestOptions
    ): Promise<Workspace> {
        return apiClient.patch<Workspace>(`/workspaces/${id}`, data, options);
    }

    /**
     * Delete a workspace
     * @param options - Optional request options including cookieHeader for server-side calls
     */
    async deleteWorkspace(id: string, options?: ServerRequestOptions): Promise<void> {
        return apiClient.delete<void>(`/workspaces/${id}`, options);
    }

    /**
     * Get workspace dashboard data (collections, activity, stats)
     * @param options - Optional request options including cookieHeader for server-side calls
     */
    async getWorkspaceDashboard(
        workspaceId: string,
        options?: ServerRequestOptions
    ): Promise<WorkspaceDashboardData> {
        // For now, we'll simulate the dashboard data by making separate calls
        // In the future, this could be a single optimized endpoint
        const [workspace, collections, recentActivity] = await Promise.all([
            this.getWorkspace(workspaceId, options),
            this.getWorkspaceCollections(workspaceId, options),
            this.getWorkspaceActivity(workspaceId, options)
        ]);

        const stats = {
            totalCollections: collections.length,
            totalRecords: collections.reduce(
                (sum, col) => sum + col.recordCount,
                0
            ),
            activeMembers: workspace.members.filter(m => m.joinedAt).length
        };

        return {
            workspace,
            collections,
            recentActivity,
            stats
        };
    }

    /**
     * Get collections for a workspace (summary for dashboard)
     * @param options - Optional request options including cookieHeader for server-side calls
     */
    async getWorkspaceCollections(
        workspaceId: string,
        options?: ServerRequestOptions
    ): Promise<CollectionSummary[]> {
        // Use the collections endpoint with workspaceId as a query parameter
        try {
            return await apiClient.get<CollectionSummary[]>(
                `/collections?workspaceId=${workspaceId}`,
                options
            );
        } catch (error) {
            console.error('Error fetching collections:', error);

            // Fallback to empty array if endpoint doesn't exist
            console.warn(
                'Collections endpoint not available, returning empty array:'
            );
            return [];
        }
    }

    /**
     * Get recent activity for a workspace
     * @param workspaceId - The workspace ID (unused until backend endpoint is implemented)
     * @param options - Optional request options (unused until backend endpoint is implemented)
     */
    async getWorkspaceActivity(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        workspaceId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        options?: ServerRequestOptions
    ): Promise<RecentActivity[]> {
        // TODO: Implement activity endpoint on the backend
        // For now, return an empty array since the endpoint doesn't exist yet
        return [];
    }
}

// Default workspace API instance
export const workspaceApi = new WorkspaceApi();
