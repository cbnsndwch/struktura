/**
 * Workspace API client
 */
import { apiClient } from './client.js';

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
     */
    async getUserWorkspaces(): Promise<Workspace[]> {
        return apiClient.get<Workspace[]>('/workspaces');
    }

    /**
     * Get a specific workspace by ID
     */
    async getWorkspace(id: string): Promise<Workspace> {
        return apiClient.get<Workspace>(`/workspaces/${id}`);
    }

    /**
     * Get a workspace by slug
     */
    async getWorkspaceBySlug(slug: string): Promise<Workspace> {
        return apiClient.get<Workspace>(`/workspaces/slug/${slug}`);
    }

    /**
     * Create a new workspace
     */
    async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
        return apiClient.post<Workspace>('/workspaces', data);
    }

    /**
     * Update a workspace
     */
    async updateWorkspace(
        id: string,
        data: UpdateWorkspaceData
    ): Promise<Workspace> {
        return apiClient.patch<Workspace>(`/workspaces/${id}`, data);
    }

    /**
     * Delete a workspace
     */
    async deleteWorkspace(id: string): Promise<void> {
        return apiClient.delete<void>(`/workspaces/${id}`);
    }

    /**
     * Get workspace dashboard data (collections, activity, stats)
     */
    async getWorkspaceDashboard(
        workspaceId: string
    ): Promise<WorkspaceDashboardData> {
        // For now, we'll simulate the dashboard data by making separate calls
        // In the future, this could be a single optimized endpoint
        const [workspace, collections, recentActivity] = await Promise.all([
            this.getWorkspace(workspaceId),
            this.getWorkspaceCollections(workspaceId),
            this.getWorkspaceActivity(workspaceId)
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
     */
    async getWorkspaceCollections(
        workspaceId: string
    ): Promise<CollectionSummary[]> {
        // This endpoint might not exist yet, so we'll return empty array for now
        // In a real implementation, this would be `/workspaces/${workspaceId}/collections`
        try {
            return apiClient.get<CollectionSummary[]>(
                `/workspaces/${workspaceId}/collections`
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
     */
    async getWorkspaceActivity(workspaceId: string): Promise<RecentActivity[]> {
        // This endpoint might not exist yet, so we'll return mock data for now
        try {
            return apiClient.get<RecentActivity[]>(
                `/workspaces/${workspaceId}/activity`
            );
        } catch (error) {
            console.error('Error fetching activity:', error);

            // Fallback to mock data if endpoint doesn't exist
            console.warn(
                'Activity endpoint not available, returning mock data'
            );
            return [];
        }
    }
}

// Default workspace API instance
export const workspaceApi = new WorkspaceApi();
