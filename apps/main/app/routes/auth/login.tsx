import type { MetaFunction } from 'react-router';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@cbnsndwch/struktura-shared-ui';

export const meta: MetaFunction = () => {
    return [
        { title: 'Sign In • Struktura' },
        {
            name: 'description',
            content: 'Sign in to your Struktura account to access your workspaces and collections.'
        }
    ];
};

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <p className="text-muted-foreground">Sign in to your Struktura account</p>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Login form will be implemented in the next story.</p>
                        <Button asChild variant="outline">
                            <a href="/">← Back to Home</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}