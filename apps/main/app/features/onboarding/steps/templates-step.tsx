import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Building2,
    Users,
    Database,
    BarChart3
} from 'lucide-react';

import {
    Button,
    Card,
    CardContent,
    Badge
} from '@cbnsndwch/struktura-shared-ui';

// Collection templates
// TODO: read these from DB in a loader
const collectionTemplates = [
    {
        id: 'team-directory',
        name: 'Team Directory',
        description: 'Manage team members, roles, and contact information',
        icon: Users,
        fields: ['Name', 'Role', 'Email', 'Department', 'Start Date']
    },
    {
        id: 'project-tracker',
        name: 'Project Tracker',
        description: 'Track project progress, tasks, and deadlines',
        icon: BarChart3,
        fields: ['Project Name', 'Status', 'Owner', 'Due Date', 'Priority']
    },
    {
        id: 'inventory-management',
        name: 'Inventory Management',
        description: 'Track products, stock levels, and supplier information',
        icon: Database,
        fields: ['Product Name', 'SKU', 'Quantity', 'Supplier', 'Reorder Level']
    },
    {
        id: 'customer-database',
        name: 'Customer Database',
        description: 'Organize customer information and communication history',
        icon: Building2,
        fields: ['Customer Name', 'Email', 'Phone', 'Company', 'Last Contact']
    }
];

interface TemplatesStepProps {
    selectedTemplate: string | null;
    onTemplateSelect: (templateId: string | null) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function TemplatesStep({
    selectedTemplate,
    onTemplateSelect,
    onNext,
    onBack
}: TemplatesStepProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Database className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Choose a Template</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Get started quickly with a pre-built collection template, or
                    create your own from scratch later.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collectionTemplates.map(template => {
                    const Icon = template.icon;
                    const isSelected = selectedTemplate === template.id;

                    return (
                        <Card
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                isSelected
                                    ? 'ring-2 ring-primary border-primary'
                                    : ''
                            }`}
                            onClick={() => onTemplateSelect(template.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h3 className="font-semibold">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {template.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {template.fields
                                                .slice(0, 3)
                                                .map(field => (
                                                    <Badge
                                                        key={field}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {field}
                                                    </Badge>
                                                ))}
                                            {template.fields.length > 3 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    +
                                                    {template.fields.length - 3}{' '}
                                                    more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="text-center">
                <Button
                    variant="ghost"
                    onClick={() => onTemplateSelect(null)}
                    className={
                        selectedTemplate === null ? 'ring-2 ring-primary' : ''
                    }
                >
                    I'll create my own collection later
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={onNext} className="flex-1">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
        </div>
    );
}
