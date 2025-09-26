# GitHub Backlog Sync Script
# PowerShell version for Windows environment

param(
    [switch]$DryRun = $false,
    [switch]$LabelsOnly = $false,
    [switch]$MilestonesOnly = $false,
    [switch]$IssuesOnly = $false
)

$ErrorActionPreference = "Continue"

# Configuration
$REPO = "cbnsndwch/struktura"

Write-Host "🚀 Starting GitHub backlog sync for $REPO" -ForegroundColor Green
Write-Host ""

# Check GitHub CLI authentication
Write-Host "🔐 Checking GitHub authentication..." -ForegroundColor Blue
$authResult = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ GitHub CLI is not authenticated. Please run: gh auth login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ GitHub CLI authenticated" -ForegroundColor Green
Write-Host ""

# Function to create labels
function Create-Labels {
    Write-Host "🏷️  Creating GitHub labels..." -ForegroundColor Blue
    
    $labels = @(
        @{name="type:epic"; description="Large feature spanning multiple issues"; color="8B5CF6"},
        @{name="type:story"; description="User-facing functionality"; color="3B82F6"},
        @{name="type:task"; description="Technical implementation work"; color="6B7280"},
        @{name="type:bug"; description="Defect or issue"; color="EF4444"},
        @{name="type:docs"; description="Documentation work"; color="10B981"},
        @{name="priority:critical"; description="Must be completed for release"; color="DC2626"},
        @{name="priority:high"; description="Important for release"; color="EA580C"},
        @{name="priority:medium"; description="Standard priority"; color="D97706"},
        @{name="priority:low"; description="Nice to have"; color="65A30D"},
        @{name="epic:foundation"; description="Project Foundation Setup"; color="7C3AED"},
        @{name="epic:platform-foundation"; description="Core Platform Foundation"; color="7C3AED"},
        @{name="epic:schema-management"; description="Schema Management System"; color="7C3AED"},
        @{name="epic:data-management"; description="Data Management Foundation"; color="7C3AED"},
        @{name="epic:admin-interface"; description="React Router 7 Admin Interface"; color="7C3AED"},
        @{name="epic:real-time"; description="Real-time Collaboration"; color="7C3AED"},
        @{name="epic:views"; description="Advanced Views & Visualization"; color="7C3AED"},
        @{name="epic:enterprise"; description="Enterprise Features"; color="7C3AED"},
        @{name="component:frontend"; description="Frontend/UI related work"; color="06B6D4"},
        @{name="component:backend"; description="Backend/API related work"; color="8B5A2B"},
        @{name="component:infrastructure"; description="DevOps, deployment, infrastructure"; color="4B5563"},
        @{name="component:auth"; description="Authentication and authorization"; color="F59E0B"},
        @{name="component:ui"; description="User interface components"; color="EC4899"},
        @{name="component:api"; description="API endpoints and services"; color="14B8A6"},
        @{name="component:schema"; description="Schema and data modeling"; color="A855F7"},
        @{name="component:sync"; description="Real-time synchronization"; color="84CC16"},
        @{name="component:cicd"; description="CI/CD and automation"; color="64748B"},
        @{name="component:workspaces"; description="Workspace management"; color="F97316"}
    )
    
    foreach ($label in $labels) {
        if ($DryRun) {
            Write-Host "🔄 [DRY RUN] Would create label: $($label.name)" -ForegroundColor Yellow
        } else {
            $result = gh label create $label.name --description $label.description --color $label.color --repo $REPO 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Created label: $($label.name)" -ForegroundColor Green
            } elseif ($result -match "already exists") {
                Write-Host "⏭️  Label already exists: $($label.name)" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Failed to create label $($label.name): $result" -ForegroundColor Red
            }
        }
    }
    Write-Host ""
}

# Function to create milestones
function Create-Milestones {
    Write-Host "🎯 Creating GitHub milestones..." -ForegroundColor Blue
    
    $milestones = @(
        @{title="v0.1.0-mvp"; description="MVP Foundation - Core platform functionality with basic document management"; due_on="2025-12-26T23:59:59Z"},
        @{title="v0.2.0-beta"; description="Beta Release - Advanced features, collaboration, and multiple views"; due_on="2026-03-26T23:59:59Z"},
        @{title="v1.0.0-production"; description="Production Ready - Enterprise features, optimization, and scalability"; due_on="2026-06-26T23:59:59Z"}
    )
    
    foreach ($milestone in $milestones) {
        if ($DryRun) {
            Write-Host "🔄 [DRY RUN] Would create milestone: $($milestone.title)" -ForegroundColor Yellow
        } else {
            $body = @{
                title = $milestone.title
                description = $milestone.description
                due_on = $milestone.due_on
                state = "open"
            } | ConvertTo-Json
            
            $result = gh api repos/$REPO/milestones --input - 2>&1 <<< $body
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Created milestone: $($milestone.title)" -ForegroundColor Green
            } elseif ($result -match "already_exists") {
                Write-Host "⏭️  Milestone already exists: $($milestone.title)" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Failed to create milestone $($milestone.title): $result" -ForegroundColor Red
            }
        }
    }
    Write-Host ""
}

# Function to create initial epic issues
function Create-EpicIssues {
    Write-Host "📋 Creating GitHub epic issues..." -ForegroundColor Blue
    
    $epics = @(
        @{
            title = "[EPIC] Project Foundation Setup"
            body = @"
## Epic Overview
Establish the fundamental project infrastructure including development environment, CI/CD, and team workflows.

## Success Criteria
- [ ] Development environment setup complete
- [ ] CI/CD pipeline functional
- [ ] Code quality standards enforced
- [ ] Team workflows established

## Epic Duration
**Estimated**: 2 weeks  
**Priority**: Critical

## Child Issues
This epic will contain the following issues:
- Repository Structure & Monorepo Setup
- Development Environment Setup  
- CI/CD Pipeline Setup
- Code Quality Tools Configuration

## Dependencies
- None (foundational work)

## Technical Requirements
- Turborepo monorepo structure
- Docker Compose for local development
- GitHub Actions for CI/CD
- ESLint, Prettier, Husky configuration

## Definition of Done
- [ ] All child issues completed
- [ ] Development environment tested by team
- [ ] CI/CD pipeline verified
- [ ] Documentation updated
"@
            labels = @("type:epic", "priority:critical", "epic:foundation")
            milestone = "v0.1.0-mvp"
        },
        @{
            title = "[EPIC] Core Platform Foundation"
            body = @"
## Epic Overview
Build the core NestJS application structure with authentication, workspace management, and basic data operations.

## Success Criteria
- [ ] NestJS application running with GraphQL
- [ ] User authentication system complete
- [ ] Workspace management functional
- [ ] MongoDB integration working

## Epic Duration  
**Estimated**: 4 weeks  
**Priority**: Critical

## Child Issues
This epic will contain the following issues:
- NestJS Application Bootstrap
- User Authentication System
- Workspace Management
- MongoDB Integration & Schemas

## Dependencies
- Epic 1: Project Foundation Setup

## Technical Requirements
- NestJS with GraphQL integration
- JWT-based authentication
- MongoDB with Mongoose ODM
- Role-based access control

## Definition of Done
- [ ] All child issues completed
- [ ] Authentication flows tested
- [ ] Workspace CRUD operations working
- [ ] API documentation generated
"@
            labels = @("type:epic", "priority:critical", "epic:platform-foundation")
            milestone = "v0.1.0-mvp"
        },
        @{
            title = "[EPIC] Schema Management System"
            body = @"
## Epic Overview
Create a flexible schema management system that allows users to define collections with various field types and validation rules.

## Success Criteria
- [ ] Field type system implemented
- [ ] Schema builder UI complete
- [ ] Data validation working
- [ ] Schema migration support

## Epic Duration
**Estimated**: 3 weeks  
**Priority**: Critical

## Child Issues
This epic will contain the following issues:
- Basic Field Types Implementation
- Collection Schema Builder UI
- Data Validation Engine
- Schema Migration System

## Dependencies
- Epic 2: Core Platform Foundation

## Technical Requirements
- Flexible field type system
- Schema validation engine
- UI for schema building
- Database schema management

## Definition of Done
- [ ] All child issues completed
- [ ] Schema CRUD operations working
- [ ] Field validation functional
- [ ] UI tested and responsive
"@
            labels = @("type:epic", "priority:critical", "epic:schema-management")
            milestone = "v0.1.0-mvp"
        }
    )
    
    foreach ($epic in $epics) {
        if ($DryRun) {
            Write-Host "🔄 [DRY RUN] Would create epic: $($epic.title)" -ForegroundColor Yellow
        } else {
            $labelArgs = $epic.labels -join ","
            $result = gh issue create --repo $REPO --title $epic.title --body $epic.body --label $labelArgs --milestone $epic.milestone 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Created epic: $($epic.title)" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to create epic $($epic.title): $result" -ForegroundColor Red
            }
        }
    }
    Write-Host ""
}

# Main execution logic
if (-not $LabelsOnly -and -not $MilestonesOnly -and -not $IssuesOnly) {
    # Run all by default
    Create-Labels
    Create-Milestones
    Create-EpicIssues
} else {
    if ($LabelsOnly) {
        Create-Labels
    }
    if ($MilestonesOnly) {
        Create-Milestones  
    }
    if ($IssuesOnly) {
        Create-EpicIssues
    }
}

Write-Host "🎉 GitHub backlog sync completed!" -ForegroundColor Green
Write-Host "🔗 View the project: https://github.com/$REPO/issues" -ForegroundColor Cyan
Write-Host ""