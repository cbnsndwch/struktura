/**
 * Workspace-specific route protection
 * Ensures user has access to the requested workspace
 */
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Loader2, Lock } from 'lucide-react';

import { Button } from '@cbnsndwch/struktura-shared-ui';

import { useAuth } from '../lib/auth-context.js';
import { workspaceApi } from '../lib/api/index.js';

interface WorkspaceGuardProps {
    children: ReactNode;
    /** Required workspace role (defaults to any member) */
    requiredRole?: 'owner' | 'admin' | 'editor' | 'viewer';
}

/**
 * WorkspaceGuard component
 *
 * Validates that the authenticated user has access to the workspace
 * specified in the route params (workspaceId)
 *
 * Usage:
 * ```tsx
 * <WorkspaceGuard requiredRole="admin">
 *   <WorkspaceSettings />
 * </WorkspaceGuard>
 * ```
 */
export function WorkspaceGuard({
    children,
    requiredRole
}: WorkspaceGuardProps) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            navigate('/auth/login', { replace: true });
            return;
        }

        if (!workspaceId) {
            setError('Workspace ID is required');
            setIsChecking(false);
            return;
        }

        checkWorkspaceAccess();
    }, [isAuthenticated, authLoading, workspaceId]);

    const checkWorkspaceAccess = async () => {
        if (!workspaceId) return;

        setIsChecking(true);
        setError(null);

        try {
            // Fetch workspace to check if user has access
            const workspace = await workspaceApi.getWorkspace(workspaceId);

            // If we got the workspace, user has at least viewer access
            // (API should return 403 if user doesn't have access)
            if (workspace) {
                // If a specific role is required, check it
                if (requiredRole) {
                    // Get user's role in workspace from members array
                    const response = await fetch('/api/auth/me', {
                        credentials: 'include',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('access_token')}`
                        }
                    });
                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch current user: ${response.status} ${response.statusText}`
                        );
                    }
                    const currentUser = await response.json();

                    const member = workspace.members?.find(
                        (m: { user: string }) => m.user === currentUser.id
                    );

                    if (!member) {
                        setError('You are not a member of this workspace');
                        setHasAccess(false);
                        setIsChecking(false);
                        return;
                    }

                    // Check role hierarchy: owner > admin > editor > viewer
                    const roleHierarchy = [
                        'viewer',
                        'editor',
                        'admin',
                        'owner'
                    ];
                    const userRoleIndex = roleHierarchy.indexOf(member.role);
                    const requiredRoleIndex =
                        roleHierarchy.indexOf(requiredRole);

                    if (userRoleIndex < requiredRoleIndex) {
                        setError(
                            `This action requires ${requiredRole} role or higher`
                        );
                        setHasAccess(false);
                        setIsChecking(false);
                        return;
                    }
                }

                setHasAccess(true);
            }
        } catch (err) {
            console.error('Workspace access check failed:', err);
            if (err instanceof Error) {
                if (
                    err.message.includes('403') ||
                    err.message.includes('Forbidden')
                ) {
                    setError('You do not have access to this workspace');
                } else if (
                    err.message.includes('404') ||
                    err.message.includes('Not found')
                ) {
                    setError('Workspace not found');
                } else {
                    setError('Failed to verify workspace access');
                }
            } else {
                setError('Failed to verify workspace access');
            }
            setHasAccess(false);
        } finally {
            setIsChecking(false);
        }
    };

    // Show loading state while checking workspace access
    if (authLoading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Verifying workspace access...
                    </p>
                </div>
            </div>
        );
    }

    // Show error state if access check failed
    if (error || !hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center max-w-md">
                    <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold mb-2">
                        Access Denied
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        {error || 'You do not have access to this workspace'}
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/workspaces')}
                        >
                            Back to Workspaces
                        </Button>
                        <Button onClick={() => checkWorkspaceAccess()}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Render children if user has access
    return <>{children}</>;
}
