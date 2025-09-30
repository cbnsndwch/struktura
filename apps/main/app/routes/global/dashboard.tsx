import { redirect } from 'react-router';

/**
 * Dashboard route - redirects authenticated users to their workspaces
 * This provides a consistent entry point after login
 */
export async function loader() {
    // TODO: Add authentication check
    // For now, redirect to workspaces page
    // In the future, this could:
    // 1. Check if user has a default workspace and redirect there
    // 2. Show a dashboard with recent activity across all workspaces
    // 3. Show workspace selection if user has multiple workspaces

    return redirect('/workspaces');
}

// This component should never render since we always redirect
export default function Dashboard() {
    return null;
}
