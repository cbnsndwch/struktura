import type { MetaFunction } from 'react-router';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@cbnsndwch/struktura-shared-ui';

export const meta: MetaFunction = () => {
    return [
        { title: 'Sign Up • Struktura' },
        {
            name: 'description',
            content:
                'Create your free Struktura account and start building better data workflows today.'
        }
    ];
};

export default function Signup() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Create Account
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Start your free Struktura account
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                            Registration form will be implemented in the next
                            story.
                        </p>
                        <Button asChild variant="outline">
                            <a href="/">← Back to Home</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
