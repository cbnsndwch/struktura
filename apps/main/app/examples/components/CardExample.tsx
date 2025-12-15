import { PlusIcon, BluetoothIcon } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
    Badge,
    Button,
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@cbnsndwch/struktura-shared-ui';

import { Example } from './ExampleWrapper.js';

export default function CardExample() {
    return (
        <Example title="Card" className="items-center justify-center">
            <Card className="relative w-full max-w-sm overflow-hidden pt-0">
                <div className="bg-primary absolute inset-0 z-30 aspect-video opacity-50 mix-blend-color" />
                <img
                    src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Photo by mymind on Unsplash"
                    title="Photo by mymind on Unsplash"
                    className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
                />
                <CardHeader>
                    <CardTitle>
                        Observability Plus is replacing Monitoring
                    </CardTitle>
                    <CardDescription>
                        Switch to the improved way to explore your data, with
                        natural language. Monitoring will no longer be available
                        on the Pro plan in November, 2025
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button>
                                <PlusIcon data-icon="inline-start" />
                                Show Dialog
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogMedia>
                                    <BluetoothIcon />
                                </AlertDialogMedia>
                                <AlertDialogTitle>
                                    Allow accessory to connect?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Do you want to allow the USB accessory to
                                    connect to this device?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Don&apos;t allow
                                </AlertDialogCancel>
                                <AlertDialogAction>Allow</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Badge variant="secondary" className="ml-auto">
                        Warning
                    </Badge>
                </CardFooter>
            </Card>
        </Example>
    );
}
