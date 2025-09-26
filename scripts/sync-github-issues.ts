#!/usr/bin/env node

/**
 * GitHub Issues Sync Script
 *
 * This script synchronizes issues between the backlog catalog and GitHub Issues.
 * It creates milestones, labels, and issues based on the catalog configuration.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPO = 'cbnsndwch/struktura';
const CATALOG_PATH = '../docs/GITHUB_BACKLOG_CATALOG.md';

// Types
interface Label {
    name: string;
    description: string;
    color: string;
}

interface Milestone {
    title: string;
    description: string;
    due_on: string;
}

interface Issue {
    title: string;
    body: string;
    labels: string[];
    milestone: string;
    assignees: string[];
}

interface CommandResult {
    success: boolean;
    output?: string;
    error?: string;
}

// Labels configuration
const LABELS: Label[] = [
    // Type labels
    {
        name: 'type:epic',
        description: 'Large feature spanning multiple issues',
        color: '8B5CF6'
    },
    {
        name: 'type:story',
        description: 'User-facing functionality',
        color: '3B82F6'
    },
    {
        name: 'type:task',
        description: 'Technical implementation work',
        color: '6B7280'
    },
    { name: 'type:bug', description: 'Defect or issue', color: 'EF4444' },
    { name: 'type:docs', description: 'Documentation work', color: '10B981' },

    // Priority labels
    {
        name: 'priority:critical',
        description: 'Must be completed for release',
        color: 'DC2626'
    },
    {
        name: 'priority:high',
        description: 'Important for release',
        color: 'EA580C'
    },
    {
        name: 'priority:medium',
        description: 'Standard priority',
        color: 'D97706'
    },
    { name: 'priority:low', description: 'Nice to have', color: '65A30D' },

    // Epic labels
    {
        name: 'epic:foundation',
        description: 'Project Foundation Setup',
        color: '7C3AED'
    },
    {
        name: 'epic:platform-foundation',
        description: 'Core Platform Foundation',
        color: '7C3AED'
    },
    {
        name: 'epic:schema-management',
        description: 'Schema Management System',
        color: '7C3AED'
    },
    {
        name: 'epic:data-management',
        description: 'Data Management Foundation',
        color: '7C3AED'
    },
    {
        name: 'epic:admin-interface',
        description: 'React Router 7 Admin Interface',
        color: '7C3AED'
    },
    {
        name: 'epic:real-time',
        description: 'Real-time Collaboration',
        color: '7C3AED'
    },
    {
        name: 'epic:views',
        description: 'Advanced Views & Visualization',
        color: '7C3AED'
    },
    {
        name: 'epic:enterprise',
        description: 'Enterprise Features',
        color: '7C3AED'
    },

    // Component labels
    {
        name: 'component:frontend',
        description: 'Frontend/UI related work',
        color: '06B6D4'
    },
    {
        name: 'component:backend',
        description: 'Backend/API related work',
        color: '8B5A2B'
    },
    {
        name: 'component:infrastructure',
        description: 'DevOps, deployment, infrastructure',
        color: '4B5563'
    },
    {
        name: 'component:auth',
        description: 'Authentication and authorization',
        color: 'F59E0B'
    },
    {
        name: 'component:ui',
        description: 'User interface components',
        color: 'EC4899'
    },
    {
        name: 'component:api',
        description: 'API endpoints and services',
        color: '14B8A6'
    },
    {
        name: 'component:schema',
        description: 'Schema and data modeling',
        color: 'A855F7'
    },
    {
        name: 'component:sync',
        description: 'Real-time synchronization',
        color: '84CC16'
    },
    {
        name: 'component:cicd',
        description: 'CI/CD and automation',
        color: '64748B'
    },
    {
        name: 'component:workspaces',
        description: 'Workspace management',
        color: 'F97316'
    }
];

// Milestones configuration
const MILESTONES: Milestone[] = [
    {
        title: 'v0.1.0-mvp',
        description:
            'MVP Foundation - Core platform functionality with basic document management',
        due_on: '2025-12-26T23:59:59Z'
    },
    {
        title: 'v0.2.0-beta',
        description:
            'Beta Release - Advanced features, collaboration, and multiple views',
        due_on: '2026-03-26T23:59:59Z'
    },
    {
        title: 'v1.0.0-production',
        description:
            'Production Ready - Enterprise features, optimization, and scalability',
        due_on: '2026-06-26T23:59:59Z'
    }
];

// Issues configuration (extracted from the catalog)
const ISSUES: Issue[] = [
    {
        title: 'Repository Structure & Monorepo Setup',
        body: `## Description
Set up Turborepo monorepo structure with proper workspace configuration, package.json setup, and dependency management.

## Acceptance Criteria
- [ ] Turborepo configuration with all workspaces defined
- [ ] PNPM workspace configuration  
- [ ] Shared ESLint, TypeScript, and Prettier configs
- [ ] Proper import/export structure between packages
- [ ] Build system working with \`pnpm build\`

## Epic
Part of Epic 1: Project Foundation Setup

## Definition of Done
- [ ] Code review completed and approved
- [ ] All acceptance criteria verified
- [ ] Documentation updated
- [ ] Build system tested and working`,
        labels: ['type:task', 'priority:critical', 'epic:foundation'],
        milestone: 'v0.1.0-mvp',
        assignees: []
    },

    {
        title: 'Development Environment Setup',
        body: `## Description
Create Docker Compose setup for MongoDB, Redis, and application services to enable consistent local development.

## Acceptance Criteria
- [ ] Docker Compose file with MongoDB, Redis, and app services
- [ ] Environment variable configuration
- [ ] Health checks for all services
- [ ] Data persistence configuration  
- [ ] Development hot-reload setup
- [ ] Documentation for setup process

## Epic
Part of Epic 1: Project Foundation Setup

## Definition of Done
- [ ] Code review completed and approved
- [ ] All acceptance criteria verified
- [ ] Local development environment tested
- [ ] Documentation created and reviewed`,
        labels: [
            'type:task',
            'priority:critical',
            'epic:foundation',
            'component:infrastructure'
        ],
        milestone: 'v0.1.0-mvp',
        assignees: []
    },

    {
        title: 'CI/CD Pipeline Setup',
        body: `## Description  
Implement GitHub Actions for automated testing, building, and deployment workflows.

## Acceptance Criteria
- [ ] GitHub Actions workflow for PR validation
- [ ] Automated testing on push/PR
- [ ] Build verification for all packages
- [ ] Lint and format checking
- [ ] Dependency security scanning
- [ ] Deployment workflow for staging

## Epic
Part of Epic 1: Project Foundation Setup

## Definition of Done
- [ ] All workflows tested and working
- [ ] Security scanning configured
- [ ] Deployment pipeline verified
- [ ] Team trained on CI/CD process`,
        labels: [
            'type:task',
            'priority:high',
            'epic:foundation',
            'component:cicd'
        ],
        milestone: 'v0.1.0-mvp',
        assignees: []
    },

    {
        title: 'NestJS Application Bootstrap',
        body: `## Description
Set up the main NestJS application with GraphQL, MongoDB connection, and basic module structure.

## Acceptance Criteria
- [ ] NestJS application with GraphQL endpoint
- [ ] MongoDB connection with Mongoose
- [ ] Environment configuration management
- [ ] Health check endpoints
- [ ] Basic error handling and logging
- [ ] OpenAPI/GraphQL documentation setup

## Epic  
Part of Epic 2: Core Platform Foundation

## Definition of Done
- [ ] Application starts and responds to health checks
- [ ] GraphQL playground accessible
- [ ] MongoDB connection verified
- [ ] API documentation generated`,
        labels: [
            'type:task',
            'priority:critical',
            'epic:platform-foundation',
            'component:backend'
        ],
        milestone: 'v0.1.0-mvp',
        assignees: []
    },

    {
        title: 'User Authentication System',
        body: `## User Story
As a new user, I want to create an account and securely access the platform so that I can start managing my data.

## Description
Implement comprehensive user authentication with JWT tokens, email verification, and OAuth integration.

## Acceptance Criteria
- [ ] User registration with email/password
- [ ] Email verification process
- [ ] Login/logout with JWT tokens
- [ ] Password reset functionality
- [ ] OAuth integration (Google, GitHub)
- [ ] Session management with refresh tokens
- [ ] Rate limiting for auth endpoints

## Epic
Part of Epic 2: Core Platform Foundation

## Definition of Done
- [ ] All authentication flows tested
- [ ] Security review completed
- [ ] Integration tests passing
- [ ] API documentation updated`,
        labels: [
            'type:story',
            'priority:critical',
            'epic:platform-foundation',
            'component:auth'
        ],
        milestone: 'v0.1.0-mvp',
        assignees: []
    },

    {
        title: 'Workspace Management',
        body: `## User Story
As a user, I want to create and manage workspaces so that I can organize my projects and collaborate with teams.

## Description
Enable users to create and manage workspaces for organizing their projects and data.

## Acceptance Criteria
- [ ] Create new workspace with name and description
- [ ] Edit workspace settings
- [ ] Delete workspace (with confirmation)
- [ ] List user workspaces
- [ ] Switch between workspaces
- [ ] Basic member invitation system
- [ ] Role-based access control (owner, admin, member, viewer)

## Epic
Part of Epic 2: Core Platform Foundation

## Definition of Done
- [ ] All workspace CRUD operations working
- [ ] Permission system tested
- [ ] UI flows completed
- [ ] API documentation updated`,
        labels: [
            'type:story',
            'priority:critical',
            'epic:platform-foundation',
            'component:workspaces'
        ],
        milestone: 'v0.1.0-mvp',
        assignees: []
    }

    // Additional issues would be added here...
];

/**
 * Execute a shell command and return the output
 */
function execCommand(command: string): CommandResult {
    try {
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        return { success: true, output: output.trim() };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            output: error.stdout?.toString().trim()
        };
    }
}

/**
 * Check if GitHub CLI is authenticated
 */
function checkGithubAuth(): void {
    console.log('🔐 Checking GitHub authentication...');
    const result = execCommand('gh auth status');
    if (!result.success) {
        console.error(
            '❌ GitHub CLI is not authenticated. Please run: gh auth login'
        );
        process.exit(1);
    }
    console.log('✅ GitHub CLI authenticated');
}

/**
 * Create GitHub labels if they don't exist
 */
async function createLabels(): Promise<void> {
    console.log('🏷️  Creating GitHub labels...');

    for (const label of LABELS) {
        const command = `gh label create "${label.name}" --description "${label.description}" --color "${label.color}" --repo "${REPO}"`;
        const result = execCommand(command);

        if (result.success) {
            console.log(`✅ Created label: ${label.name}`);
        } else if (result.error?.includes('already exists')) {
            console.log(`⏭️  Label already exists: ${label.name}`);
        } else {
            console.error(
                `❌ Failed to create label ${label.name}:`,
                result.error
            );
        }
    }
}

/**
 * Create GitHub milestones if they don't exist
 */
async function createMilestones(): Promise<void> {
    console.log('🎯 Creating GitHub milestones...');

    for (const milestone of MILESTONES) {
        const command = `gh api repos/${REPO}/milestones -f title="${milestone.title}" -f description="${milestone.description}" -f due_on="${milestone.due_on}" -f state="open"`;
        const result = execCommand(command);

        if (result.success) {
            console.log(`✅ Created milestone: ${milestone.title}`);
        } else if (result.error?.includes('already_exists')) {
            console.log(`⏭️  Milestone already exists: ${milestone.title}`);
        } else {
            console.error(
                `❌ Failed to create milestone ${milestone.title}:`,
                result.error
            );
        }
    }
}

/**
 * Get milestone number by title
 */
function getMilestoneNumber(title: string): number | null {
    const result = execCommand(`gh api repos/${REPO}/milestones`);
    if (result.success && result.output) {
        const milestones = JSON.parse(result.output);
        const milestone = milestones.find((m: any) => m.title === title);
        return milestone ? milestone.number : null;
    }
    return null;
}

/**
 * Create GitHub issues if they don't exist
 */
async function createIssues(): Promise<void> {
    console.log('📋 Creating GitHub issues...');

    for (const issue of ISSUES) {
        // Get milestone number
        const milestoneNumber = getMilestoneNumber(issue.milestone);

        // Build the gh issue create command
        let command = `gh issue create --repo "${REPO}" --title "${issue.title}" --body "${issue.body.replace(/"/g, '\\"')}"`;

        // Add labels
        if (issue.labels.length > 0) {
            command += ` --label "${issue.labels.join(',')}"`;
        }

        // Add milestone
        if (milestoneNumber) {
            command += ` --milestone ${milestoneNumber}`;
        }

        // Add assignees
        if (issue.assignees.length > 0) {
            command += ` --assignee "${issue.assignees.join(',')}"`;
        }

        const result = execCommand(command);

        if (result.success) {
            console.log(`✅ Created issue: ${issue.title}`);
        } else {
            console.error(
                `❌ Failed to create issue ${issue.title}:`,
                result.error
            );
        }
    }
}

/**
 * Update the catalog file with sync status
 */
async function updateCatalogStatus(): Promise<void> {
    console.log('📝 Updating catalog sync status...');

    try {
        const catalogPath = path.resolve(__dirname, CATALOG_PATH);
        let content = await fs.readFile(catalogPath, 'utf8');

        const now = new Date().toISOString().split('T')[0];
        content = content.replace(
            /\*\*Last GitHub Sync\*\*: Never/,
            `**Last GitHub Sync**: ${now}`
        );
        content = content.replace(
            /\*\*Issues Created\*\*: 0\/22/,
            `**Issues Created**: ${ISSUES.length}/${ISSUES.length}`
        );
        content = content.replace(
            /\*\*Milestones Created\*\*: 0\/3/,
            `**Milestones Created**: ${MILESTONES.length}/${MILESTONES.length}`
        );
        content = content.replace(
            /\*\*Labels Created\*\*: 0\/15/,
            `**Labels Created**: ${LABELS.length}/${LABELS.length}`
        );

        await fs.writeFile(catalogPath, content, 'utf8');
        console.log('✅ Catalog status updated');
    } catch (error: any) {
        console.error('❌ Failed to update catalog:', error.message);
    }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
    console.log('🚀 Starting GitHub backlog sync...\n');

    try {
        checkGithubAuth();
        await createLabels();
        await createMilestones();
        await createIssues();
        await updateCatalogStatus();

        console.log('\n🎉 GitHub backlog sync completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   • Labels: ${LABELS.length}`);
        console.log(`   • Milestones: ${MILESTONES.length}`);
        console.log(`   • Issues: ${ISSUES.length}`);
        console.log(`\n🔗 View the project: https://github.com/${REPO}/issues`);
    } catch (error: any) {
        console.error('\n❌ Sync failed:', error.message);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { createLabels, createMilestones, createIssues };
