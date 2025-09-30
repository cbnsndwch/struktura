import { ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Textarea
} from '@cbnsndwch/struktura-shared-ui';

import { type WorkspaceFormData, workspaceSchema } from '../contracts.js';

interface WorkspaceStepProps {
    initialData: WorkspaceFormData | null;
    isLoading: boolean;
    onSubmit: (data: WorkspaceFormData) => Promise<void>;
    onBack: () => void;
}

export default function WorkspaceStep({
    initialData,
    isLoading,
    onSubmit,
    onBack
}: WorkspaceStepProps) {
    const form = useForm<WorkspaceFormData>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: initialData || {
            name: '',
            description: ''
        }
    });

    return (
        <div className="space-y-6">
            <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Create Your Workspace</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    A workspace is where you'll manage your data, collaborate
                    with your team, and organize your projects.
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Workspace Name *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Acme Inc, Marketing Team, Personal Projects"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Briefly describe what this workspace is for..."
                                        {...field}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                                    Creating Workspace...
                                </>
                            ) : (
                                <>
                                    Create Workspace
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
