/**
 * User profile settings page
 */
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Input,
    Label
} from '@cbnsndwch/struktura-shared-ui';
import { useAuth } from '../../lib/auth-context.js';
import { getInitials } from '../../lib/user-utils.js';

export function ProfileSettings() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.name || '');

    if (!user) {
        return null;
    }

    const initials = getInitials(user.name);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">
                    Manage your profile information
                </p>
            </div>

            {/* Avatar Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>
                        Your profile picture is synced from your authentication provider
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Avatar size="lg">
                        {user.image && (
                            <AvatarImage
                                src={user.image}
                                alt={user.name || 'User avatar'}
                            />
                        )}
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-muted-foreground">
                        <p>Connected via {user.image ? 'OAuth provider' : 'email'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                        Your basic account information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                            id="display-name"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="Your display name"
                        />
                        <p className="text-xs text-muted-foreground">
                            This is how your name will appear across the platform
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed. Contact support if you need to update it.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button disabled>
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
