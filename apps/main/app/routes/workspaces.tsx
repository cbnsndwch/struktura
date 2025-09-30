/**
 * Main workspaces listing page - shows all workspaces for the current user
 */
import { useState } from 'react';
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { useLoaderData, Link, useNavigate } from 'react-router';
import { 
    Plus, 
    Search, 
    Grid3X3, 
    List, 
    Users, 
    Calendar,
    Settings,
    MoreVertical,
    Building2,
    Activity,
    Database
} from 'lucide-react';

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Skeleton
} from '@cbnsndwch/struktura-shared-ui';

import { workspaceApi, type Workspace } from '../lib/api/index.js';

export const meta: MetaFunction = () => {
    return [
        { title: 'Workspaces • Struktura' },
        {
            name: 'description',
            content: 'Manage your workspaces and collaborate with your team on data-driven projects.'
        }
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const workspaces = await workspaceApi.getUserWorkspaces();
        return { workspaces, error: null };
    } catch (error) {
        console.error('Failed to load workspaces:', error);
        return { 
            workspaces: [], 
            error: error instanceof Error ? error.message : 'Failed to load workspaces' 
        };
    }
}

type ViewMode = 'grid' | 'list';

export default function WorkspacesPage() {
    const { workspaces, error } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter workspaces based on search query
    const filteredWorkspaces = workspaces.filter((workspace: Workspace) =>
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateWorkspace = () => {
        // For now, redirect to onboarding to create a new workspace
        // In the future, this could open a modal or dedicated creation flow
        navigate('/onboarding');
    };

    const getWorkspaceInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatMemberCount = (members: Workspace['members']) => {
        const activeMembers = members.filter((m: any) => m.joinedAt).length;
        return activeMembers === 1 ? '1 member' : `${activeMembers} members`;
    };

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-4">
                            <Database className="h-12 w-12 text-muted-foreground mx-auto" />
                        </div>
                        <h1 className="text-xl font-semibold mb-2">Unable to load workspaces</h1>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Workspaces</h1>
                            <p className="text-muted-foreground">
                                Manage your workspaces and collaborate with your team
                            </p>
                        </div>
                        <Button onClick={handleCreateWorkspace}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Workspace
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Search and View Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search workspaces..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Workspaces Grid/List */}
                {filteredWorkspaces.length === 0 ? (
                    <div className="text-center py-12">
                        {searchQuery ? (
                            <>
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No workspaces found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Try adjusting your search terms
                                </p>
                                <Button variant="outline" onClick={() => setSearchQuery('')}>
                                    Clear Search
                                </Button>
                            </>
                        ) : (
                            <>
                                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first workspace to get started with Struktura
                                </p>
                                <Button onClick={handleCreateWorkspace}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Workspace
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={
                        viewMode === 'grid' 
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'space-y-4'
                    }>
                        {filteredWorkspaces.map((workspace: Workspace) => (
                            <Card 
                                key={workspace.id} 
                                className={`cursor-pointer hover:shadow-md transition-shadow ${
                                    viewMode === 'list' ? 'flex items-center' : ''
                                }`}
                                onClick={() => navigate(`/workspaces/${workspace.id}`)}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage 
                                                            src={workspace.settings.branding?.logo} 
                                                            alt={workspace.name} 
                                                        />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                            {getWorkspaceInitials(workspace.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-lg">{workspace.name}</CardTitle>
                                                        <CardDescription>
                                                            {workspace.description || 'No description'}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger 
                                                        asChild 
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Settings className="h-4 w-4 mr-2" />
                                                            Settings
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users className="h-4 w-4 mr-2" />
                                                            Manage Members
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            Delete Workspace
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {formatMemberCount(workspace.members)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(workspace.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">
                                                    {workspace.members.find((m: any) => m.role === 'owner') ? 'Owner' : 'Member'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage 
                                                    src={workspace.settings.branding?.logo} 
                                                    alt={workspace.name} 
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {getWorkspaceInitials(workspace.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{workspace.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {workspace.description || 'No description'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-muted-foreground">
                                                {formatMemberCount(workspace.members)}
                                            </div>
                                            <Badge variant="secondary">
                                                {workspace.members.find((m: any) => m.role === 'owner') ? 'Owner' : 'Member'}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger 
                                                    asChild 
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Settings className="h-4 w-4 mr-2" />
                                                        Settings
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Users className="h-4 w-4 mr-2" />
                                                        Manage Members
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        Delete Workspace
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}