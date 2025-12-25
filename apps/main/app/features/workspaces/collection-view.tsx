/**
 * Collection view - displays collection data in different views
 */
import { useState, useCallback } from 'react';
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { Database, FileText } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@cbnsndwch/struktura-shared-ui';

import type { CollectionRecord } from '@cbnsndwch/struktura-schema-contracts';

import type { Collection } from '@cbnsndwch/struktura-collections-contracts';

import { ViewSwitcher, type ViewType } from '../../components/view-switcher.js';
import { WorkspaceLayout } from '../../components/workspace-layout.js';
import { workspaceApi, recordsApi, apiClient } from '../../lib/api/index.js';
import { requireServerAuth, getCookieHeader } from '../../lib/auth.server.js';
import { DataGrid } from '../data-grid/index.js';

import type { Route } from './+types/collection-view.js';

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

export async function loader(args: LoaderFunctionArgs) {
    // Check authentication
    await requireServerAuth(args);

    const { params } = args;
    const cookieHeader = getCookieHeader(args);

    const { workspaceId, collectionId } = params;

    if (!workspaceId || !collectionId) {
        throw new Response('Workspace ID and Collection ID are required', {
            status: 400
        });
    }

    try {
        // Fetch workspace data, collections, full collection details, and records
        const [workspace, collections, collection, records] = await Promise.all(
            [
                workspaceApi.getWorkspace(workspaceId, { cookieHeader }),
                workspaceApi.getWorkspaceCollections(workspaceId, {
                    cookieHeader
                }),
                apiClient.get<Collection>(`/collections/${collectionId}`, {
                    cookieHeader
                }),
                recordsApi.getRecords(
                    collectionId,
                    { limit: 100 },
                    { cookieHeader }
                )
            ]
        );

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
            records,
            error: null
        };
    } catch (error) {
        console.error('Failed to load collection:', error);
        return {
            collection: null,
            workspace: null,
            collections: [],
            records: [],
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to load collection'
        };
    }
}

export default function CollectionView({ loaderData }: Route.ComponentProps) {
    const { collection, workspace, collections, records, error } = loaderData;
    const [currentView, setCurrentView] = useState<ViewType>('grid');
    const [localRecords, setLocalRecords] = useState<CollectionRecord[]>(
        records || []
    );

    // Handle record updates
    const handleUpdateRecord = useCallback(
        async (recordId: string, data: Record<string, unknown>) => {
            try {
                const updatedRecord = await recordsApi.updateRecord(
                    collection!.id,
                    recordId,
                    { data }
                );

                // Update local state optimistically
                setLocalRecords(prev =>
                    prev.map(r => (r.id === recordId ? updatedRecord : r))
                );
            } catch (error) {
                console.error('Failed to update record:', error);
                throw error;
            }
        },
        [collection]
    );

    // Handle bulk delete
    const handleDeleteRecords = useCallback(
        async (recordIds: string[]) => {
            try {
                await recordsApi.bulkDeleteRecords(collection!.id, recordIds);

                // Update local state
                setLocalRecords(prev =>
                    prev.filter(r => !recordIds.includes(r.id))
                );
            } catch (error) {
                console.error('Failed to delete records:', error);
                throw error;
            }
        },
        [collection]
    );

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
                            {localRecords.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {localRecords.length === 1 ? 'record' : 'records'}{' '}
                            loaded
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Fields
                        </CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {collection.fields.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {collection.fields.length === 1
                                ? 'field'
                                : 'fields'}{' '}
                            defined
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
                    {currentView === 'grid' ? (
                        <DataGrid
                            collectionId={collection.id}
                            fields={collection.fields}
                            records={localRecords}
                            onUpdateRecord={handleUpdateRecord}
                            onDeleteRecords={handleDeleteRecords}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Database className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {currentView} view coming soon
                            </h3>
                            <p className="text-muted-foreground max-w-md">
                                The {currentView} view for displaying and
                                managing collection records will be implemented
                                in a future update.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </WorkspaceLayout>
    );
}
