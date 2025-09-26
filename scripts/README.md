# GitHub Backlog Management Scripts

This directory contains scripts for managing the Struktura project backlog and synchronizing between repository documentation and GitHub Issues.

## 📁 Files Overview

### Core Scripts

- **`sync-github-backlog.ps1`** - Main PowerShell script for syncing backlog with GitHub
- **`setup-project-board.ps1`** - Creates and configures GitHub Project boards
- **`sync-github-issues.js`** - Node.js version (alternative implementation)

### Documentation

- **`../docs/GITHUB_BACKLOG_CATALOG.md`** - Central catalog tracking all issues and epics

## 🚀 Quick Start

### Prerequisites

1. **GitHub CLI installed and authenticated**:
   ```powershell
   # Install GitHub CLI (if not already installed)
   winget install GitHub.cli
   
   # Authenticate with GitHub
   gh auth login
   ```

2. **Proper repository permissions**:
   - Admin access to create labels and milestones
   - Write access to create issues
   - Projects access for board management

### Initial Setup

1. **Sync the complete backlog**:
   ```powershell
   .\scripts\sync-github-backlog.ps1
   ```

2. **Create project board** (optional):
   ```powershell
   .\scripts\setup-project-board.ps1
   ```

## 📋 Available Scripts

### sync-github-backlog.ps1

Main script for creating GitHub issues, labels, and milestones from the catalog.

**Usage:**
```powershell
# Full sync (labels + milestones + epics)
.\scripts\sync-github-backlog.ps1

# Dry run (see what would be created without making changes)
.\scripts\sync-github-backlog.ps1 -DryRun

# Sync only labels
.\scripts\sync-github-backlog.ps1 -LabelsOnly

# Sync only milestones
.\scripts\sync-github-backlog.ps1 -MilestonesOnly

# Sync only epic issues
.\scripts\sync-github-backlog.ps1 -IssuesOnly
```

**Features:**
- ✅ Creates GitHub labels with proper colors and descriptions
- ✅ Creates milestones with due dates
- ✅ Creates epic issues with proper formatting
- ✅ Handles existing items gracefully (no duplicates)
- ✅ Supports dry-run mode for testing

### setup-project-board.ps1

Creates and configures GitHub Project boards for visual project management.

**Usage:**
```powershell
# Create project board with all configurations
.\scripts\setup-project-board.ps1

# Dry run mode
.\scripts\setup-project-board.ps1 -DryRun
```

**Features:**
- ✅ Creates GitHub Project (beta) board
- ✅ Adds custom fields (Epic, Priority, Component, Story Points)
- ✅ Creates multiple views (Board, Table, Priority-based)
- ✅ Adds existing issues to the project

## 🏷️ Label System

The scripts create a comprehensive labeling system:

### Type Labels
- `type:epic` - Large feature spanning multiple issues (Purple)
- `type:story` - User-facing functionality (Blue)  
- `type:task` - Technical implementation work (Gray)
- `type:bug` - Defect or issue (Red)
- `type:docs` - Documentation work (Green)

### Priority Labels  
- `priority:critical` - Must be completed for release (Red)
- `priority:high` - Important for release (Orange)
- `priority:medium` - Standard priority (Yellow)
- `priority:low` - Nice to have (Light Green)

### Epic Labels
- `epic:foundation` - Project Foundation Setup
- `epic:platform-foundation` - Core Platform Foundation
- `epic:schema-management` - Schema Management System
- `epic:data-management` - Data Management Foundation
- `epic:admin-interface` - React Router 7 Admin Interface
- `epic:real-time` - Real-time Collaboration
- `epic:views` - Advanced Views & Visualization
- `epic:enterprise` - Enterprise Features

### Component Labels
- `component:frontend` - Frontend/UI work (Cyan)
- `component:backend` - Backend/API work (Brown)
- `component:infrastructure` - DevOps work (Dark Gray)
- `component:auth` - Authentication (Amber)
- `component:ui` - UI components (Pink)
- `component:api` - API endpoints (Teal)
- `component:schema` - Schema modeling (Purple)
- `component:sync` - Real-time sync (Lime)
- `component:cicd` - CI/CD automation (Slate)
- `component:workspaces` - Workspace management (Orange)

## 🎯 Milestone Structure

Three main development phases:

1. **v0.1.0-mvp** (Due: Dec 26, 2025)
   - MVP Foundation
   - Core platform functionality with basic document management

2. **v0.2.0-beta** (Due: Mar 26, 2026)  
   - Beta Release
   - Advanced features, collaboration, and multiple views

3. **v1.0.0-production** (Due: Jun 26, 2026)
   - Production Ready  
   - Enterprise features, optimization, and scalability

## 📊 Project Board Features

The project board includes:

### Views
- **Epic Overview** - Board view grouped by epic
- **Sprint Planning** - Table view with priority, epic, story points
- **By Priority** - Board view grouped by priority level

### Custom Fields
- **Epic** - Single select field mapping to epic categories
- **Story Points** - Number field for estimation
- **Priority** - Single select field (Critical/High/Medium/Low)
- **Component** - Single select field for technical area

## 🔄 Workflow Integration

### Daily Usage

1. **Check sync status** in `GITHUB_BACKLOG_CATALOG.md`
2. **Create new issues** using GitHub issue templates
3. **Update project board** fields and status
4. **Review epics** and child issue progress

### Weekly Maintenance

1. **Review milestone progress** and adjust due dates if needed
2. **Update catalog** with any manual changes made in GitHub
3. **Re-sync** if major changes to issue structure

### Release Preparation

1. **Close completed milestones**
2. **Create new milestones** for next iteration
3. **Update catalog** with lessons learned and process improvements

## 🛠️ Troubleshooting

### Common Issues

**GitHub CLI not authenticated:**
```powershell
gh auth login
gh auth status  # Verify authentication
```

**Permission denied errors:**
- Ensure you have admin access to the repository
- Check that your GitHub token has the required scopes

**Labels already exist errors:**
- These are normal and can be ignored
- The script handles existing labels gracefully

**Project creation fails:**
- Ensure the GitHub CLI projects extension is installed
- Check that you have projects beta access enabled

### Debug Mode

Use dry-run mode to test scripts without making changes:
```powershell
.\scripts\sync-github-backlog.ps1 -DryRun
.\scripts\setup-project-board.ps1 -DryRun
```

## 📚 Best Practices

### Issue Management
1. **Use issue templates** for consistency
2. **Link child issues** to parent epics
3. **Update progress** regularly in issue comments
4. **Close issues** only when fully complete and reviewed

### Project Board Usage  
1. **Update status** as work progresses
2. **Set story point estimates** for planning
3. **Use priority** field for sprint planning
4. **Tag components** for team coordination

### Catalog Maintenance
1. **Keep catalog in sync** with GitHub changes
2. **Document decisions** in issue comments
3. **Update estimates** based on actual effort
4. **Review and refine** process regularly

---

*For questions or issues with these scripts, please create an issue using the appropriate template or contact the development team.*