/**
 * Main workspaces listing page - shows all workspaces for the current user
 */
import {
    Building2,
    Calendar,
    Database,
    Grid3X3,
    List,
    MoreVertical,
    Plus,
    Search,
    Settings,
    Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useNavigate } from 'react-router';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Input
} from '@cbnsndwch/struktura-shared-ui';

import { workspaceApi, type Workspace } from '../../lib/api/index.js';
import { requireAuth } from '../../lib/auth.js';
import {
    shouldShowOnboarding,
    startOnboarding,
    shouldTriggerOnboardingForNewUser
} from '../../lib/onboarding.js';

export const meta: MetaFunction = () => {
    return [
        { title: 'Workspaces • Struktura' },
        {
            name: 'description',
            content:
                'Manage your workspaces and collaborate with your team on data-driven projects.'
        }
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    // Check authentication - will redirect to login if not authenticated
    requireAuth(request);

    try {
        const workspaces = await workspaceApi.getUserWorkspaces();
        return {
            workspaces,
            error: null,
            shouldShowOnboardingFlow: shouldTriggerOnboardingForNewUser(
                workspaces.length
            )
        };
    } catch (error) {
        console.error('Failed to load workspaces:', error);

        // Handle authentication errors gracefully
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            // During SSR, this is expected if user isn't authenticated yet
            // The client will re-fetch with proper authentication headers
            if (typeof window === 'undefined') {
                return {
                    workspaces: [],
                    error: null, // Don't show error during SSR
                    needsAuth: true,
                    shouldShowOnboardingFlow: false
                };
            } else {
                // On client side, this means user needs to login
                return {
                    workspaces: [],
                    error: 'Please log in to view your workspaces',
                    needsAuth: true,
                    shouldShowOnboardingFlow: false
                };
            }
        }

        return {
            workspaces: [],
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to load workspaces',
            shouldShowOnboardingFlow: false
        };
    }
}

type ViewMode = 'grid' | 'list';

export default function WorkspacesPage() {
    const initialData = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [workspaces, setWorkspaces] = useState(initialData.workspaces);
    const [error, setError] = useState(initialData.error);
    const [isLoading, setIsLoading] = useState(false);

    // Client-side authentication check and redirect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('../../lib/auth.js').then(({ useAuthGuard }) => {
                useAuthGuard();
            });
        }
    }, []);

    // Check if onboarding should be shown for new users or if it's already active
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check if onboarding is already active
            const isOnboardingActive = shouldShowOnboarding();

            // If onboarding is active, redirect to onboarding
            if (isOnboardingActive) {
                navigate('/onboarding');
                return;
            }

            // If this is a new user (no workspaces), start onboarding automatically
            if (
                initialData.shouldShowOnboardingFlow &&
                workspaces.length === 0
            ) {
                startOnboarding(false); // false = not from workspace button
                navigate('/onboarding');
                return;
            }
        }
    }, [initialData.shouldShowOnboardingFlow, workspaces.length, navigate]);

    // Client-side re-fetch if authentication is needed
    useEffect(() => {
        if (initialData.needsAuth && typeof window !== 'undefined') {
            // Check if we have auth token on client side
            const hasToken = localStorage.getItem('access_token');
            if (hasToken) {
                // Re-fetch workspaces with authentication
                const refetchWorkspaces = async () => {
                    setIsLoading(true);
                    try {
                        const fetchedWorkspaces =
                            await workspaceApi.getUserWorkspaces();
                        setWorkspaces(fetchedWorkspaces);
                        setError(null);
                    } catch (fetchError) {
                        console.error(
                            'Failed to refetch workspaces:',
                            fetchError
                        );
                        if (
                            fetchError instanceof Error &&
                            fetchError.message.includes('Unauthorized')
                        ) {
                            setError('Please log in to view your workspaces');
                            // Optionally redirect to login
                            // navigate('/auth/login');
                        } else {
                            setError(
                                fetchError instanceof Error
                                    ? fetchError.message
                                    : 'Failed to load workspaces'
                            );
                        }
                    } finally {
                        setIsLoading(false);
                    }
                };
                refetchWorkspaces();
            } else {
                setError('Please log in to view your workspaces');
            }
        }
    }, [initialData.needsAuth]);

    // Filter workspaces based on search query
    const filteredWorkspaces = workspaces.filter(
        (workspace: Workspace) =>
            workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            workspace.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const handleCreateWorkspace = () => {
        // Start onboarding flow when user clicks "Create Workspace"
        startOnboarding(true); // true = triggered from workspace button
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
        const activeMembers = members.filter(m => m.joinedAt).length;
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
                        <h1 className="text-xl font-semibold mb-2">
                            Unable to load workspaces
                        </h1>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-4">
                            <Database className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
                        </div>
                        <h1 className="text-xl font-semibold mb-2">
                            Loading workspaces...
                        </h1>
                        <p className="text-muted-foreground">
                            Please wait while we fetch your workspaces
                        </p>
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
                                Manage your workspaces and collaborate with your
                                team
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
                            onChange={e => setSearchQuery(e.target.value)}
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
                                <h3 className="text-lg font-semibold mb-2">
                                    No workspaces found
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
                                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    No workspaces yet
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first workspace to get started
                                    with Struktura
                                </p>
                                <Button onClick={handleCreateWorkspace}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Workspace
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-4'
                        }
                    >
                        {filteredWorkspaces.map((workspace: Workspace) => (
                            <Card
                                key={workspace.id}
                                className={`cursor-pointer hover:shadow-md transition-shadow ${
                                    viewMode === 'list'
                                        ? 'flex items-center'
                                        : ''
                                }`}
                                onClick={() =>
                                    navigate(`/workspaces/${workspace.id}`)
                                }
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage
                                                            src={
                                                                workspace
                                                                    .settings
                                                                    .branding
                                                                    ?.logo
                                                            }
                                                            alt={workspace.name}
                                                        />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                            {getWorkspaceInitials(
                                                                workspace.name
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-lg">
                                                            {workspace.name}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {workspace.description ||
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
                                                        {formatMemberCount(
                                                            workspace.members
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(
                                                            workspace.createdAt
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">
                                                    {workspace.members.find(
                                                        m => m.role === 'owner'
                                                    )
                                                        ? 'Owner'
                                                        : 'Member'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={
                                                        workspace.settings
                                                            .branding?.logo
                                                    }
                                                    alt={workspace.name}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {getWorkspaceInitials(
                                                        workspace.name
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {workspace.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {workspace.description ||
                                                        'No description'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-muted-foreground">
                                                {formatMemberCount(
                                                    workspace.members
                                                )}
                                            </div>
                                            <Badge variant="secondary">
                                                {workspace.members.find(
                                                    m => m.role === 'owner'
                                                )
                                                    ? 'Owner'
                                                    : 'Member'}
                                            </Badge>
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
