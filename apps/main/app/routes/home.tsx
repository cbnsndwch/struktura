import type { MetaFunction } from 'react-router';

import {
    Button,
    Badge,
    Card,
    CardContent,
    CardTitle,
    CardDescription,
    ThemeToggle
} from '@cbnsndwch/struktura-shared-ui';

export const meta: MetaFunction = () => {
    const title = 'Struktura • No-Code Data Management Platform';
    const description =
        'Struktura combines the ease-of-use of apps like Airtable with the schema flexibility of MongoDB. Create, manage, and collaborate on complex data structures without coding.';

    return [
        { title },
        { name: 'description', content: description },

        // Open Graph
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://struktura.cbnsndwch.dev' },
        { property: 'og:site_name', content: 'Struktura' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:site', content: '@cbnsndwch' },

        // Additional SEO
        {
            name: 'keywords',
            content:
                'no-code, data management, MongoDB, Airtable alternative, database, schema builder, real-time collaboration'
        },
        { name: 'author', content: 'cbnsndwch LLC' },
        { name: 'robots', content: 'index, follow' },

        // Schema.org structured data
        {
            'script:ld+json': {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Struktura',
                description,
                url: 'https://struktura.cbnsndwch.dev',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    description: 'Free tier available'
                },
                publisher: {
                    '@type': 'Organization',
                    name: 'cbnsndwch LLC'
                }
            }
        }
    ];
};

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Navigation Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-xl">Struktura</div>
                        <Badge variant="secondary" className="text-xs">
                            Beta
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <a href="/auth/login">Log In</a>
                            </Button>
                            <Button asChild>
                                <a href="/auth/signup">Sign Up</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 pt-16 pb-16">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
                        No-Code Data Management
                        <br />
                        <span className="text-primary">Made Simple</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                        Combine the ease-of-use of Airtable with the flexibility
                        of MongoDB. Create and manage complex data structures
                        without writing a single line of code.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="px-8 text-lg" asChild>
                            <a href="/auth/signup">Get Started Free</a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 text-lg"
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
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-lg">
                                    {f.icon}
                                </div>
                                <CardTitle className="text-xl font-semibold mb-2">
                                    {f.title}
                                </CardTitle>
                                <CardDescription className="mb-4 text-base leading-relaxed">
                                    {f.desc}
                                </CardDescription>
                                <ul className="text-sm text-muted-foreground space-y-2">
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
            <section className="bg-muted/50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Perfect For
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                🏢
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Small Businesses
                            </h3>
                            <p className="text-muted-foreground">
                                Manage customers, inventory, orders, and
                                projects without complex database setup
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                👨‍💻
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Development Teams
                            </h3>
                            <p className="text-muted-foreground">
                                Rapid prototyping and MVP development with
                                flexible data modeling
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                📋
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Project Managers
                            </h3>
                            <p className="text-muted-foreground">
                                Track complex projects with nested tasks,
                                resources, and stakeholder data
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Trusted by Teams Worldwide
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Join hundreds of teams already building better data
                        workflows with Struktura
                    </p>
                </div>

                {/* Testimonials */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="mb-4">
                                <div className="flex text-yellow-400 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i}>★</span>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    "Struktura finally bridges the gap between
                                    simple spreadsheets and complex databases.
                                    Perfect for our growing startup's data
                                    needs."
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    👨‍💼
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">
                                        Alex Chen
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        CTO, TechFlow
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="mb-4">
                                <div className="flex text-yellow-400 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i}>★</span>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    "The real-time collaboration features are
                                    game-changing. Our team can work
                                    simultaneously without any conflicts."
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    👩‍💻
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">
                                        Sarah Johnson
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Product Manager, InnovateCorp
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="mb-4">
                                <div className="flex text-yellow-400 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i}>★</span>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    "Finally, a no-code solution that doesn't
                                    limit our data structure complexity. Highly
                                    recommended!"
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    👨‍🎨
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">
                                        Mike Rodriguez
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Lead Designer, CreativeHub
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                            500+
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Active Teams
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                            10K+
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Collections Created
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                            99.9%
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Uptime
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                            24/7
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Support
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
                            <CardDescription className="text-lg text-muted-foreground mb-6">
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
                    <p className="text-xl text-muted-foreground mb-8">
                        Join hundreds of teams already using Struktura to build
                        better data workflows
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="px-8 text-lg" asChild>
                            <a href="/auth/signup">Start Your Free Trial</a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 text-lg"
                        >
                            Schedule a Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-muted/30 border-t mt-20">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Brand Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="font-bold text-lg">
                                    Struktura
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    Beta
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                No-code data management platform that combines
                                the simplicity of Airtable with the flexibility
                                of MongoDB.
                            </p>
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://github.com/cbnsndwch/struktura"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub
                                </a>
                                <a
                                    href="https://twitter.com/cbnsndwch"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Twitter
                                </a>
                            </div>
                        </div>

                        {/* Product Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Product</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="/ui-demo"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        UI Demo
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/graphql"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        GraphQL Playground
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#features"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#pricing"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Pricing
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Resources Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Resources</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="#documentation"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#api"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        API Reference
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#guides"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Guides
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#support"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Support
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Company</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="#about"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#blog"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#careers"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#contact"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2024 cbnsndwch LLC. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                            <a
                                href="#privacy"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#terms"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="#cookies"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
