/**
 * Notification preferences settings page
 */
import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Label,
    Switch,
    Button
} from '@cbnsndwch/struktura-shared-ui';
import { toast } from 'sonner';
import type { INotificationPreferences } from '@cbnsndwch/struktura-auth-contracts';
import { useAuth } from '../../lib/auth-context.js';

export function NotificationsSettings() {
    const { user } = useAuth();
    
    const [preferences, setPreferences] = useState<INotificationPreferences>({
        emailNotifications: true,
        workspaceUpdates: true,
        collaborationNotifications: true,
        marketingEmails: false
    });

    const [isSaving, setIsSaving] = useState(false);

    // Load user preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            if (!user) return;

            try {
                const response = await fetch('/api/user/preferences', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.notifications) {
                        setPreferences(data.notifications);
                    }
                }
            } catch (error) {
                console.error('Failed to load notification preferences:', error);
            }
        };

        loadPreferences();
    }, [user]);

    const handleToggle = (key: keyof INotificationPreferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    notifications: preferences
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save preferences');
            }

            toast.success('Preferences saved', {
                description: 'Your notification preferences have been updated.'
            });
        } catch (error) {
            console.error('Failed to save notification preferences:', error);
            toast.error('Failed to save preferences', {
                description: 'Please try again.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground">
                    Manage how you receive notifications
                </p>
            </div>

            {/* Email Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                        Control which emails you receive from Struktura
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifications" className="text-base">
                                Enable Email Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Receive email notifications for important updates
                            </p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={preferences.emailNotifications}
                            onCheckedChange={() => handleToggle('emailNotifications')}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="workspace-updates" className="text-base">
                                Workspace Updates
                            </Label>
                            <p 
                                className="text-sm text-muted-foreground"
                                id="workspace-updates-description"
                            >
                                Get notified about changes in your workspaces
                                {!preferences.emailNotifications && 
                                    ' (Enable email notifications first)'}
                            </p>
                        </div>
                        <Switch
                            id="workspace-updates"
                            checked={preferences.workspaceUpdates}
                            onCheckedChange={() => handleToggle('workspaceUpdates')}
                            disabled={!preferences.emailNotifications}
                            aria-describedby="workspace-updates-description"
                            className={!preferences.emailNotifications ? 'opacity-50' : ''}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="collaboration-notifications" className="text-base">
                                Collaboration Notifications
                            </Label>
                            <p 
                                className="text-sm text-muted-foreground"
                                id="collaboration-notifications-description"
                            >
                                Receive notifications when someone mentions or shares with you
                                {!preferences.emailNotifications && 
                                    ' (Enable email notifications first)'}
                            </p>
                        </div>
                        <Switch
                            id="collaboration-notifications"
                            checked={preferences.collaborationNotifications}
                            onCheckedChange={() =>
                                handleToggle('collaborationNotifications')
                            }
                            disabled={!preferences.emailNotifications}
                            aria-describedby="collaboration-notifications-description"
                            className={!preferences.emailNotifications ? 'opacity-50' : ''}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="marketing-emails" className="text-base">
                                Marketing Emails
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Receive emails about new features and product updates
                            </p>
                        </div>
                        <Switch
                            id="marketing-emails"
                            checked={preferences.marketingEmails}
                            onCheckedChange={() => handleToggle('marketingEmails')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
            </div>
        </div>
    );
}
