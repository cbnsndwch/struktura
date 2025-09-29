import type { MetaFunction } from 'react-router';

import { Button } from '@cbnsndwch/struktura-shared-ui/components/ui/button.js';
import { Badge } from '@cbnsndwch/struktura-shared-ui/components/ui/badge.js';
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription
} from '@cbnsndwch/struktura-shared-ui/components/ui/card.js';

export const meta: MetaFunction = () => {
    return [
        { title: 'Struktura • No-Code Document Management Platform' },
        {
            name: 'description',
            content:
                'Struktura combines the ease-of-use of apps like Airtable with the schema flexibility of MongoDB. Create, manage, and collaborate on complex data structures without coding.'
        }
    ];
};

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Hero Section */}
            <section className="container mx-auto px-4 pt-20 pb-16">
                <div className="text-center max-w-4xl mx-auto">
                    <Badge
                        variant="secondary"
                        className="mb-6 rounded-full px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200"
                    >
                        🚀 Now in Beta
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        No-Code Data Management
                        <br />
                        <span className="text-blue-600">Made Simple</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                        Combine the ease-of-use of Airtable with the flexibility
                        of MongoDB. Create and manage complex data structures
                        without writing a single line of code.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="px-8 text-lg">
                            Get Started Free
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 text-lg border-gray-300"
                            asChild
                        >
                            <a href="/ui-demo">View UI Demo</a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Why Choose Struktura?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Built for teams who need more than spreadsheets but less
                        complexity than databases
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            icon: '📄',
                            title: 'Document-First Design',
                            desc: "Store complex, nested data naturally with MongoDB's flexible document model",
                            bullets: [
                                'Nested objects and arrays',
                                'Dynamic schemas that evolve',
                                'No artificial data flattening'
                            ]
                        },
                        {
                            icon: '🎨',
                            title: 'Visual Schema Builder',
                            desc: 'Design your data structure with an intuitive drag-and-drop interface',
                            bullets: [
                                'No database expertise required',
                                'Real-time schema validation',
                                'Progressive complexity'
                            ]
                        },
                        {
                            icon: '👥',
                            title: 'Real-Time Collaboration',
                            desc: 'Work together with live editing, comments, and instant notifications',
                            bullets: [
                                'Live editing with conflict resolution',
                                'Permission controls',
                                'Activity tracking'
                            ]
                        },
                        {
                            icon: '📊',
                            title: 'Multiple Views',
                            desc: 'Switch between grid, calendar, kanban, and gallery views for different workflows',
                            bullets: [
                                'Grid view for data entry',
                                'Calendar for time-based data',
                                'Kanban for project tracking'
                            ]
                        },
                        {
                            icon: '🔌',
                            title: 'API & Integrations',
                            desc: 'Connect with your favorite tools through our GraphQL API and webhooks',
                            bullets: [
                                'RESTful and GraphQL APIs',
                                'Webhook notifications',
                                'Third-party integrations'
                            ]
                        },
                        {
                            icon: '🏠',
                            title: 'Self-Hosted Option',
                            desc: 'Deploy on your infrastructure for complete data control and privacy',
                            bullets: [
                                'Docker-based deployment',
                                'Complete data sovereignty',
                                'Enterprise security'
                            ]
                        }
                    ].map(f => (
                        <Card key={f.title} className="shadow-sm">
                            <CardContent className="pt-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-lg">
                                    {f.icon}
                                </div>
                                <CardTitle className="text-xl font-semibold mb-2">
                                    {f.title}
                                </CardTitle>
                                <CardDescription className="mb-4 text-base leading-relaxed">
                                    {f.desc}
                                </CardDescription>
                                <ul className="text-sm text-gray-500 space-y-2">
                                    {f.bullets.map(b => (
                                        <li key={b}>• {b}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Perfect For
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                🏢
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Small Businesses
                            </h3>
                            <p className="text-gray-600">
                                Manage customers, inventory, orders, and
                                projects without complex database setup
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                👨‍💻
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Development Teams
                            </h3>
                            <p className="text-gray-600">
                                Rapid prototyping and MVP development with
                                flexible data modeling
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                📋
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Project Managers
                            </h3>
                            <p className="text-gray-600">
                                Track complex projects with nested tasks,
                                resources, and stakeholder data
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developer Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <Card className="p-8 text-center">
                        <CardContent className="p-0">
                            <CardTitle className="text-2xl md:text-3xl font-bold mb-4">
                                Explore the API
                            </CardTitle>
                            <CardDescription className="text-lg text-gray-600 mb-6">
                                Ready to integrate? Test our GraphQL API in the
                                interactive playground
                            </CardDescription>
                            <Button asChild size="lg" className="px-8 text-lg">
                                <a href="/graphql">Open GraphQL Playground →</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Transform Your Data Management?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join hundreds of teams already using Struktura to build
                        better data workflows
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="px-8 text-lg">
                            Start Your Free Trial
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 text-lg border-gray-300"
                        >
                            Schedule a Demo
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
