import {
    Building2,
    Rocket,
    Users,
    Database,
    BarChart3,
    Zap
} from 'lucide-react';

// Collection templates
export const collectionTemplates = [
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

// Feature tour points
export const tourFeatures = [
    {
        title: 'Flexible Data Views',
        description:
            'Switch between grid, card, calendar, and kanban views to visualize your data the way that works best.',
        icon: BarChart3
    },
    {
        title: 'Real-time Collaboration',
        description:
            'Work together with your team in real-time. See changes instantly as they happen.',
        icon: Users
    },
    {
        title: 'Powerful API Access',
        description:
            'Connect your data to other tools with our GraphQL API and webhook integrations.',
        icon: Zap
    },
    {
        title: 'Smart Automation',
        description:
            'Set up automated workflows and triggers to save time on repetitive tasks.',
        icon: Rocket
    }
];
