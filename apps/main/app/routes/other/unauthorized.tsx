import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { MetaFunction } from 'react-router';

import { Button } from '@cbnsndwch/struktura-shared-ui';

export const meta: MetaFunction = () => {
    return [
        { title: 'Unauthorized • Struktura' },
        {
            name: 'description',
            content: 'You do not have permission to access this resource.'
        }
    ];
};

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center max-w-md px-4">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-2">Unauthorized</h1>
                <p className="text-muted-foreground mb-8">
                    You do not have permission to access this resource. If you
                    believe this is an error, please contact your workspace
                    administrator.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                    <Button onClick={() => navigate('/workspaces')}>
                        Back to Workspaces
                    </Button>
                </div>
            </div>
        </div>
    );
}
