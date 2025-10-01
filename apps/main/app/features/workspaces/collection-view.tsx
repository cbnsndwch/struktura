/**
 * Collection view - displays collection data in different views
 */
import { useState } from 'react';
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { Database, FileText } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@cbnsndwch/struktura-shared-ui';

import { ViewSwitcher, type ViewType } from '../../components/view-switcher.js';
import { WorkspaceLayout } from '../../components/workspace-layout.js';
import { workspaceApi } from '../../lib/api/index.js';
import { requireServerAuth } from '../../lib/auth.server.js';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    const collectionName = data?.collection?.name || 'Collection';
    return [
        { title: `${collectionName} • Struktura` },
        {
            name: 'description',
            content: `View and manage data in the ${collectionName} collection.`
        }
    ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    // Check authentication
    requireServerAuth(request);

    const { workspaceId, collectionId } = params;

    if (!workspaceId || !collectionId) {
        throw new Response('Workspace ID and Collection ID are required', {
            status: 400
        });
    }

    try {
        // Fetch workspace data and all collections
        const [workspace, collections] = await Promise.all([
            workspaceApi.getWorkspace(workspaceId),
            workspaceApi.getWorkspaceCollections(workspaceId)
        ]);

        // Find the specific collection
        const collection = collections.find(c => c.id === collectionId);

        if (!collection) {
            throw new Response('Collection not found', { status: 404 });
        }

        return {
            collection,
            workspace: {
                id: workspace.id,
                name: workspace.name
            },
            collections,
            error: null
        };
    } catch (error) {
        console.error('Failed to load collection:', error);
        return {
            collection: null,
            workspace: null,
            collections: [],
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to load collection'
        };
    }
}

export default function CollectionView() {
    const { collection, workspace, collections, error } =
        useLoaderData<typeof loader>();
    const [currentView, setCurrentView] = useState<ViewType>('grid');

    if (error || !collection || !workspace) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="max-w-md text-center">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-xl font-semibold mb-2">
                        Unable to load collection
                    </h1>
                    <p className="text-muted-foreground">
                        {error || 'Collection not found'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <WorkspaceLayout
            workspaceId={workspace.id}
            workspaceName={workspace.name}
            collections={collections}
            currentCollectionId={collection.id}
            breadcrumbSegments={[
                {
                    label: collection.name,
                    href: `/workspaces/${workspace.id}/collections/${collection.id}`
                }
            ]}
        >
            {/* Collection Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-muted-foreground mt-2">
                            {collection.description}
                        </p>
                    )}
                </div>
                <ViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    availableViews={['grid', 'list', 'kanban', 'calendar']}
                />
            </div>

            {/* Collection Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Records
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {collection.recordCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {collection.recordCount === 1
                                ? 'record'
                                : 'records'}{' '}
                            in collection
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Last Updated
                        </CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Date(
                                collection.lastUpdated
                            ).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {new Date(
                                collection.lastUpdated
                            ).toLocaleTimeString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Collection View Content */}
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>
                        {currentView === 'grid' && 'Grid View'}
                        {currentView === 'list' && 'List View'}
                        {currentView === 'kanban' && 'Kanban View'}
                        {currentView === 'calendar' && 'Calendar View'}
                    </CardTitle>
                    <CardDescription>
                        View and manage your collection data in {currentView}{' '}
                        format
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Database className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            Collection view coming soon
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                            The {currentView} view for displaying and managing
                            collection records will be implemented in a future
                            update.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </WorkspaceLayout>
    );
}
