/**
 * User menu dropdown component
 * Displays user profile and quick access to settings and logout
 */
import { useState } from 'react';
import { LogOut, Settings, User as UserIcon, ChevronDown } from 'lucide-react';
import { Link } from 'react-router';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Button,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@cbnsndwch/struktura-shared-ui';

import { useAuth } from '../lib/auth-context.js';

interface UserMenuProps {
    /** Optional className for styling */
    className?: string;
}

/**
 * Get initials from user name
 */
function getInitials(name?: string | null): string {
    if (!name) return 'U';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function UserMenu({ className }: UserMenuProps) {
    const { user, logout } = useAuth();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    if (!user) {
        return null;
    }

    const initials = getInitials(user.name);
    const displayName = user.name || user.email;

    const handleLogout = async () => {
        setShowLogoutDialog(false);
        await logout();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={`flex items-center gap-2 ${className || ''}`}
                    >
                        <Avatar size="sm">
                            {user.image && (
                                <AvatarImage
                                    src={user.image}
                                    alt={displayName || 'User avatar'}
                                />
                            )}
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="hidden md:inline-block text-sm font-medium">
                            {displayName}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {displayName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link to="/settings">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link to="/settings/appearance">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowLogoutDialog(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout confirmation dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be redirected to the login page and will need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>
                            Log out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
