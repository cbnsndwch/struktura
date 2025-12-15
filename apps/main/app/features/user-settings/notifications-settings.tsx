/**
 * Notification preferences settings page
 */
import { useState } from 'react';
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

interface NotificationPreferences {
    emailNotifications: boolean;
    workspaceUpdates: boolean;
    collaborationNotifications: boolean;
    marketingEmails: boolean;
}

export function NotificationsSettings() {
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailNotifications: true,
        workspaceUpdates: true,
        collaborationNotifications: true,
        marketingEmails: false
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (key: keyof NotificationPreferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: Implement API call to save notification preferences
            // await updateNotificationPreferences(preferences);
            await new Promise(resolve => setTimeout(resolve, 500));
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
                            <p className="text-sm text-muted-foreground">
                                Get notified about changes in your workspaces
                            </p>
                        </div>
                        <Switch
                            id="workspace-updates"
                            checked={preferences.workspaceUpdates}
                            onCheckedChange={() => handleToggle('workspaceUpdates')}
                            disabled={!preferences.emailNotifications}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="collaboration-notifications" className="text-base">
                                Collaboration Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications when someone mentions or shares with you
                            </p>
                        </div>
                        <Switch
                            id="collaboration-notifications"
                            checked={preferences.collaborationNotifications}
                            onCheckedChange={() =>
                                handleToggle('collaborationNotifications')
                            }
                            disabled={!preferences.emailNotifications}
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
