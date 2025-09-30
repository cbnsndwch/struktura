/**
 * Individual workspace dashboard - shows collections, activity, and quick actions
 */
import { useState } from 'react';
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { useLoaderData, Link, useNavigate, useParams } from 'react-router';
import {
    Plus,
    Search,
    Grid3X3,
    List,
    Users,
    Settings,
    MoreVertical,
    Activity,
    Database,
    FileText,
    BarChart3,
    Clock,
    ArrowRight,
    Folder,
    Upload,
    Filter,
    SortAsc,
    Eye,
    Edit,
    Trash2,
    Star
} from 'lucide-react';

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Separator,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@cbnsndwch/struktura-shared-ui';

import {
    workspaceApi,
    type CollectionSummary,
    type RecentActivity
} from '../../lib/api/index.js';
import { requireAuth } from '../../lib/auth.js';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    const workspaceName = data?.dashboardData?.workspace?.name || 'Workspace';
    return [
        { title: `${workspaceName} • Struktura` },
        {
            name: 'description',
            content: `Manage collections and data in the ${workspaceName} workspace.`
        }
    ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    // Check authentication - will redirect to login if not authenticated
    requireAuth(request);

    const { workspaceId } = params;

    if (!workspaceId) {
        throw new Response('Workspace ID is required', { status: 400 });
    }

    try {
        const dashboardData =
            await workspaceApi.getWorkspaceDashboard(workspaceId);
        return { dashboardData, error: null };
    } catch (error) {
        console.error('Failed to load workspace dashboard:', error);
        return {
            dashboardData: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to load workspace'
        };
    }
}

type CollectionViewMode = 'grid' | 'list';

export default function WorkspaceDashboard() {
    const { dashboardData, error } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const params = useParams();
    const [collectionViewMode, setCollectionViewMode] =
        useState<CollectionViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-4">
                            <Database className="h-12 w-12 text-muted-foreground mx-auto" />
                        </div>
                        <h1 className="text-xl font-semibold mb-2">
                            Unable to load workspace
                        </h1>
                        <p className="text-muted-foreground mb-4">
                            {error || 'Workspace not found'}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/workspaces')}
                            >
                                Back to Workspaces
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { workspace, collections, recentActivity, stats } = dashboardData;

    // Filter collections based on search query
    const filteredCollections = collections.filter(
        (collection: CollectionSummary) =>
            collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            collection.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const getCollectionInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60)
        );

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'collection_created':
                return <Folder className="h-4 w-4" />;
            case 'collection_updated':
                return <Edit className="h-4 w-4" />;
            case 'record_created':
                return <Plus className="h-4 w-4" />;
            case 'record_updated':
                return <Edit className="h-4 w-4" />;
            case 'member_joined':
                return <Users className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src={workspace.settings.branding?.logo}
                                    alt={workspace.name}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                    {getCollectionInitials(workspace.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {workspace.name}
                                </h1>
                                <p className="text-muted-foreground">
                                    {workspace.description || 'No description'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Import Data
                            </Button>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Collection
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Workspace Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage Members
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Analytics
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Collections
                            </CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalCollections}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalCollections === 1
                                    ? 'collection'
                                    : 'collections'}{' '}
                                in workspace
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Records
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalRecords.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalRecords === 1
                                    ? 'record'
                                    : 'records'}{' '}
                                across all collections
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Members
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.activeMembers}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.activeMembers === 1
                                    ? 'active member'
                                    : 'active members'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="collections" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="collections">
                            Collections
                        </TabsTrigger>
                        <TabsTrigger value="activity">
                            Recent Activity
                        </TabsTrigger>
                    </TabsList>

                    {/* Collections Tab */}
                    <TabsContent value="collections" className="mt-6">
                        {/* Collections Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search collections..."
                                    value={searchQuery}
                                    onChange={e =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <SortAsc className="h-4 w-4 mr-2" />
                                    Sort
                                </Button>
                                <Separator
                                    orientation="vertical"
                                    className="h-6"
                                />
                                <Button
                                    variant={
                                        collectionViewMode === 'grid'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setCollectionViewMode('grid')
                                    }
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={
                                        collectionViewMode === 'list'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setCollectionViewMode('list')
                                    }
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Collections Grid/List */}
                        {filteredCollections.length === 0 ? (
                            <div className="text-center py-12">
                                {searchQuery ? (
                                    <>
                                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No collections found
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            Try adjusting your search terms
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            Clear Search
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No collections yet
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            Create your first collection to
                                            start organizing your data
                                        </p>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Collection
                                        </Button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div
                                className={
                                    collectionViewMode === 'grid'
                                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                        : 'space-y-4'
                                }
                            >
                                {filteredCollections.map(
                                    (collection: CollectionSummary) => (
                                        <Card
                                            key={collection.id}
                                            className={`cursor-pointer hover:shadow-md transition-shadow ${
                                                collectionViewMode === 'list'
                                                    ? 'flex items-center'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                navigate(
                                                    `/workspaces/${params.workspaceId}/collections/${collection.id}`
                                                )
                                            }
                                        >
                                            {collectionViewMode === 'grid' ? (
                                                <>
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                                                                    style={{
                                                                        backgroundColor:
                                                                            collection.color ||
                                                                            '#3b82f6'
                                                                    }}
                                                                >
                                                                    {collection.icon ||
                                                                        getCollectionInitials(
                                                                            collection.name
                                                                        )}
                                                                </div>
                                                                <div>
                                                                    <CardTitle className="text-lg">
                                                                        {
                                                                            collection.name
                                                                        }
                                                                    </CardTitle>
                                                                    <CardDescription>
                                                                        {collection.description ||
                                                                            'No description'}
                                                                    </CardDescription>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                    onClick={e =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                    >
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        View
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Star className="h-4 w-4 mr-2" />
                                                                        Add to
                                                                        Favorites
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-destructive">
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <FileText className="h-4 w-4" />
                                                                    {collection.recordCount.toLocaleString()}{' '}
                                                                    records
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4" />
                                                                    {formatTimeAgo(
                                                                        collection.lastUpdated
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-between p-6 w-full">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                                                            style={{
                                                                backgroundColor:
                                                                    collection.color ||
                                                                    '#3b82f6'
                                                            }}
                                                        >
                                                            {collection.icon ||
                                                                getCollectionInitials(
                                                                    collection.name
                                                                )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold">
                                                                {
                                                                    collection.name
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {collection.description ||
                                                                    'No description'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-sm text-muted-foreground">
                                                            {collection.recordCount.toLocaleString()}{' '}
                                                            records
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatTimeAgo(
                                                                collection.lastUpdated
                                                            )}
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                                onClick={e =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Star className="h-4 w-4 mr-2" />
                                                                    Add to
                                                                    Favorites
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    )
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>
                                    Stay up to date with what's happening in
                                    your workspace
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentActivity.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No recent activity
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Activity will appear here as you and
                                            your team work with collections
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentActivity.map(
                                            (activity: RecentActivity) => (
                                                <div
                                                    key={activity.id}
                                                    className="flex items-start gap-3 pb-4 border-b last:border-b-0"
                                                >
                                                    <div className="mt-1">
                                                        {getActivityIcon(
                                                            activity.type
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm">
                                                            {
                                                                activity.description
                                                            }
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                            <span>
                                                                {
                                                                    activity
                                                                        .user
                                                                        .name
                                                                }
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {formatTimeAgo(
                                                                    activity.timestamp
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {activity.metadata
                                                        ?.collectionId && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                to={`/workspaces/${params.workspaceId}/collections/${activity.metadata.collectionId}`}
                                                            >
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
