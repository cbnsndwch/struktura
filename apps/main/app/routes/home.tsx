import type { MetaFunction } from 'react-router';

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
                    <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-6 bg-blue-50 text-blue-700 border-blue-200">
                        🚀 Now in Beta
                    </div>
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
                        <button className="inline-flex items-center justify-center rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 text-lg">
                            Get Started Free
                        </button>
                        <button className="inline-flex items-center justify-center rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-11 px-8 text-lg">
                            View Demo
                        </button>
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
                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            📄
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Document-First Design
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Store complex, nested data naturally with MongoDB's
                            flexible document model
                        </p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li>• Nested objects and arrays</li>
                            <li>• Dynamic schemas that evolve</li>
                            <li>• No artificial data flattening</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            🎨
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Visual Schema Builder
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Design your data structure with an intuitive
                            drag-and-drop interface
                        </p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li>• No database expertise required</li>
                            <li>• Real-time schema validation</li>
                            <li>• Progressive complexity</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            👥
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Real-Time Collaboration
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Work together with live editing, comments, and
                            instant notifications
                        </p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li>• Live editing with conflict resolution</li>
                            <li>• Permission controls</li>
                            <li>• Activity tracking</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            📊
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Multiple Views
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Switch between grid, calendar, kanban, and gallery
                            views for different workflows
                        </p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li>• Grid view for data entry</li>
                            <li>• Calendar for time-based data</li>
                            <li>• Kanban for project tracking</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            🔌
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            API & Integrations
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Connect with your favorite tools through our GraphQL
                            API and webhooks
                        </p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li>• RESTful and GraphQL APIs</li>
                            <li>• Webhook notifications</li>
                            <li>• Third-party integrations</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            🏠
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Self-Hosted Option
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Deploy on your infrastructure for complete data
                            control and privacy
                        </p>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li>• Docker-based deployment</li>
                            <li>• Complete data sovereignty</li>
                            <li>• Enterprise security</li>
                        </ul>
                    </div>
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
                    <div className="bg-white rounded-xl border p-8 shadow-sm text-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Explore the API
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">
                            Ready to integrate? Test our GraphQL API in the
                            interactive playground
                        </p>
                        <a
                            href="/graphql"
                            className="inline-flex items-center justify-center rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 text-lg"
                        >
                            Open GraphQL Playground →
                        </a>
                    </div>
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
                        <button className="inline-flex items-center justify-center rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 text-lg">
                            Start Your Free Trial
                        </button>
                        <button className="inline-flex items-center justify-center rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-11 px-8 text-lg">
                            Schedule a Demo
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
