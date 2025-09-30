import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@cbnsndwch/struktura-shared-ui';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface SuccessStateProps {
    message?: string;
    onNavigateToLogin: () => void;
}

export function SuccessState({
    message,
    onNavigateToLogin
}: SuccessStateProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Password Reset Complete
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-green-700 font-medium">{message}</p>
                        <p className="text-sm text-muted-foreground">
                            Redirecting you to sign in with your new password...
                        </p>
                    </div>

                    <Button onClick={onNavigateToLogin} className="w-full">
                        Go to Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
