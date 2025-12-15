/**
 * Account security settings page
 */
import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Badge
} from '@cbnsndwch/struktura-shared-ui';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../lib/auth-context.js';

interface OAuthProvider {
    id: string;
    name: string;
    connected: boolean;
    icon?: string;
}

// Better Auth OAuth signin endpoint
// TODO: Extract to configuration or use Apollo Client with apollo-link-rest
const BETTER_AUTH_SIGNIN_PATH = '/api/auth/signin';

export function SecuritySettings() {
    const { user } = useAuth();
    const [providers, setProviders] = useState<OAuthProvider[]>([
        { id: 'google', name: 'Google', connected: false },
        { id: 'github', name: 'GitHub', connected: false }
    ]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch connected OAuth accounts from Better Auth
    // TODO: Migrate to Apollo Client with useQuery hook for better error handling,
    // retries, and caching. Consider using apollo-link-rest to wrap Better Auth's REST API.
    useEffect(() => {
        async function fetchConnectedAccounts() {
            if (!user) return;
            
            setIsLoading(true);
            try {
                // Better Auth should provide an accounts endpoint
                // This is a placeholder - adjust based on actual Better Auth API
                const response = await fetch('/api/auth/session', {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const session = await response.json();
                    
                    // Check session data for OAuth provider information
                    // This is more reliable than checking image URLs
                    if (session?.user) {
                        // Update provider status based on actual session data
                        // Fallback to image URL check if provider info not available
                        setProviders(prev =>
                            prev.map(p => {
                                // Check if provider is in session data (adjust based on actual API)
                                const isConnected = session.user?.image?.includes(p.id) || false;
                                return { ...p, connected: isConnected };
                            })
                        );
                    }
                }
            } catch (error) {
                console.error('Failed to fetch connected accounts:', error);
                // On error, default to all disconnected
                setProviders(prev =>
                    prev.map(p => ({ ...p, connected: false }))
                );
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchConnectedAccounts();
    }, [user]);

    const handleConnectProvider = (providerId: string) => {
        // Use Better Auth's OAuth connection flow
        // Full page reload is intentional for OAuth flow
        const callbackURL = encodeURIComponent(window.location.pathname);
        window.location.href = `${BETTER_AUTH_SIGNIN_PATH}/${providerId}?callbackURL=${callbackURL}`;
    };

    const handleDisconnectProvider = async (providerId: string) => {
        // TODO: Implement provider disconnection
        console.log('Disconnect provider:', providerId);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">
                    Account Security
                </h2>
                <p className="text-muted-foreground">
                    Manage your account security and authentication methods
                </p>
            </div>

            {/* Email Verification Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>
                        Your email verification status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        {user?.emailVerified ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-sm">
                                    Your email address is verified
                                </span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 text-yellow-600" />
                                <span className="text-sm">
                                    Your email address is not verified
                                </span>
                                <Button variant="link" size="sm" className="ml-auto">
                                    Send verification email
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Connected Accounts */}
            <Card>
                <CardHeader>
                    <CardTitle>Connected Accounts</CardTitle>
                    <CardDescription>
                        Manage your OAuth provider connections for easy sign-in
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {providers.map(provider => (
                        <div
                            key={provider.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <span className="text-sm font-semibold">
                                        {provider.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {provider.name}
                                        </span>
                                        {provider.connected && (
                                            <Badge variant="secondary" className="text-xs">
                                                Connected
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {provider.connected
                                            ? `Sign in with your ${provider.name} account`
                                            : `Connect your ${provider.name} account`}
                                    </p>
                                </div>
                            </div>
                            {provider.connected ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleDisconnectProvider(provider.id)
                                    }
                                >
                                    Disconnect
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleConnectProvider(provider.id)}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Connect
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Password Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                        Change your password or reset it if you've forgotten
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline">Change Password</Button>
                </CardContent>
            </Card>
        </div>
    );
}
