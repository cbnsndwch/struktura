import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@cbnsndwch/struktura-shared-ui';
import { ArrowRight, XCircle } from 'lucide-react';

interface InvalidTokenStateProps {
    message?: string;
    onNavigateToLogin: () => void;
}

export function InvalidTokenState({
    message,
    onNavigateToLogin
}: InvalidTokenStateProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Invalid Reset Link
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-red-700 font-medium">{message}</p>
                        <p className="text-sm text-muted-foreground">
                            The reset link may have expired or is invalid.
                            Please request a new password reset.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button onClick={onNavigateToLogin} className="w-full">
                            Back to Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">
                                Need help?{' '}
                            </span>
                            <a
                                href="/support"
                                className="text-primary underline underline-offset-4 hover:no-underline"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
