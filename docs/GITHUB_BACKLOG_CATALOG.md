# GitHub Backlog Catalog - Struktura Project Issue Management

This file serves as the source of truth for all GitHub issues, epics, and milestones in the Struktura project. It synchronizes between repository documentation and GitHub Issues using the `gh` CLI.

## Catalog Metadata

- **Last Updated**: 2025-09-28
- **GitHub Repository**: cbnsndwch/struktura
- **Total Issues Planned**: 35 (7 new issues added to Epic 3)
- **Total Epics Completed**: 2 of 8 (Epic 1 & 2 ✅)
- **Active Milestones**: 3

## Epic & Issue Tracking

### Legend
- 🎯 **Epic** - Large feature spanning multiple issues
- 📋 **Story** - User-facing functionality
- 🔧 **Task** - Technical implementation work
- 🐛 **Bug** - Defect or issue
- 📚 **Docs** - Documentation work

### Issue Status
- ⏳ **Planned** - Not yet created in GitHub
- 🔄 **Synced** - Created in GitHub, tracked here
- ✅ **Complete** - Closed in GitHub
- 🚫 **Cancelled** - Closed without completion

---

## Milestone Structure

### 🎯 Milestone 1: MVP Foundation (Month 1-3)
**GitHub Milestone**: `v0.1.0-mvp`  
**Due Date**: 2025-12-26  
**Description**: Core platform functionality with basic document management

### 🎯 Milestone 2: Beta Release (Month 4-6) 
**GitHub Milestone**: `v0.2.0-beta`  
**Due Date**: 2026-03-26  
**Description**: Advanced features, collaboration, and multiple views

### 🎯 Milestone 3: Production Ready (Month 7-9)
**GitHub Milestone**: `v1.0.0-production`  
**Due Date**: 2026-06-26  
**Description**: Enterprise features, optimization, and scalability

---

## Epic 1: Project Foundation Setup 🎯 ✅ **COMPLETED**
**Milestone**: v0.1.0-mvp  
**Priority**: Critical  
**Estimated Duration**: 2 weeks  
**GitHub Label**: `epic:foundation`  
**Status**: ✅ **Completed on September 28, 2025**

### Epic Description
Establish the fundamental project infrastructure including development environment, CI/CD, and team workflows.

### Issues

#### 1.1 Repository Structure & Monorepo Setup 🔧
**Status**: ✅ Complete  
**GitHub Issue**: #1 (Closed)  
**Assignee**: Technical Lead  
**Estimate**: 3 days  
**Priority**: Critical

**Description**: Set up Turborepo monorepo structure with proper workspace configuration, package.json setup, and dependency management.

**Acceptance Criteria**:
- [x] Turborepo configuration with all workspaces defined
- [x] PNPM workspace configuration
- [x] Shared ESLint, TypeScript, and Prettier configs
- [x] Proper import/export structure between packages
- [x] Build system working with `pnpm build`

**Labels**: `type:task`, `priority:critical`, `epic:foundation`

---

#### 1.2 Development Environment Setup 🔧
**Status**: ✅ Complete  
**GitHub Issue**: #2 (Closed)  
**Assignee**: DevOps Specialist  
**Estimate**: 5 days  
**Priority**: Critical

**Description**: Create Docker Compose setup for MongoDB, Redis, and application services to enable consistent local development.

**Acceptance Criteria**:
- [x] Docker Compose file with MongoDB, Redis, and app services
- [x] Environment variable configuration
- [x] Health checks for all services
- [x] Data persistence configuration
- [x] Development hot-reload setup
- [x] Documentation for setup process

**Labels**: `type:task`, `priority:critical`, `epic:foundation`, `component:infrastructure`

---

#### 1.3 CI/CD Pipeline Setup 🔧
**Status**: ✅ Complete  
**GitHub Issue**: #3 (Closed)  
**Assignee**: DevOps Specialist  
**Estimate**: 4 days  
**Priority**: High

**Description**: Implement GitHub Actions for automated testing, building, and deployment workflows.

**Acceptance Criteria**:
- [x] GitHub Actions workflow for PR validation
- [x] Automated testing on push/PR
- [x] Build verification for all packages
- [x] Lint and format checking
- [x] Dependency security scanning
- [x] Deployment workflow for staging

**Labels**: `type:task`, `priority:high`, `epic:foundation`, `component:cicd`

---

## Epic 2: Core Platform Foundation 🎯 ✅ **COMPLETED**
**Milestone**: v0.1.0-mvp  
**Priority**: Critical  
**Estimated Duration**: 4 weeks  
**GitHub Label**: `epic:platform-foundation`  
**Status**: ✅ **Completed on September 28, 2025**

### Epic Description
Build the core NestJS application structure with authentication, workspace management, and basic data operations.

### Issues

#### 2.1 NestJS Application Bootstrap 🔧
**Status**: ✅ Complete  
**GitHub Issue**: #4 (Closed)  
**Assignee**: Senior Backend Developer  
**Estimate**: 3 days  
**Priority**: Critical

**Description**: Set up the main NestJS application with GraphQL, MongoDB connection, and basic module structure.

**Acceptance Criteria**:
- [x] NestJS application with GraphQL endpoint
- [x] MongoDB connection with Mongoose
- [x] Environment configuration management
- [x] Health check endpoints
- [x] Basic error handling and logging
- [x] OpenAPI/GraphQL documentation setup

**Labels**: `type:task`, `priority:critical`, `epic:platform-foundation`, `component:backend`

---

#### 2.2 User Authentication System 📋
**Status**: ✅ Complete  
**GitHub Issue**: #5, #15 (Closed)  
**Assignee**: Backend Developer  
**Estimate**: 5 days  
**Priority**: Critical

**Description**: Implement comprehensive user authentication with JWT tokens, email verification, and OAuth integration.

**User Story**: As a new user, I want to create an account and securely access the platform so that I can start managing my data.

**Acceptance Criteria**:
- [x] User registration with email/password
- [x] Email verification process
- [x] Login/logout with JWT tokens
- [x] Password reset functionality
- [x] OAuth integration (Google, GitHub)
- [x] Session management with refresh tokens
- [x] Rate limiting for auth endpoints

**Labels**: `type:story`, `priority:critical`, `epic:platform-foundation`, `component:auth`

---

#### 2.3 Workspace Management 📋
**Status**: ✅ Complete  
**GitHub Issue**: #6, #16 (Closed)  
**Assignee**: Backend Developer  
**Estimate**: 4 days  
**Priority**: Critical

**Description**: Enable users to create and manage workspaces for organizing their projects and data.

**User Story**: As a user, I want to create and manage workspaces so that I can organize my projects and collaborate with teams.

**Acceptance Criteria**:
- [x] Create new workspace with name and description
- [x] Edit workspace settings
- [x] Delete workspace (with confirmation)
- [x] List user workspaces
- [x] Switch between workspaces
- [x] Basic member invitation system
- [x] Role-based access control (owner, admin, member, viewer)

**Labels**: `type:story`, `priority:critical`, `epic:platform-foundation`, `component:workspaces`

---

## Epic 3: Data Management Interface 🎯
**Milestone**: v0.1.0-mvp  
**Priority**: High  
**Estimated Duration**: 12-14 weeks (extended for design system foundation)  
**GitHub Label**: `epic:epic-3`  
**GitHub Issue**: #10

### Epic Description
Create intuitive interfaces for data entry, editing, and management that feel familiar to spreadsheet users while supporting MongoDB's document flexibility. This epic includes foundational design system work that must be completed before building specific UI features.

### Foundation & Design System Issues (Complete First)

#### 3.1 Initialize shadcn/ui Design System in Shared UI Workspace 🔧
**Status**: 🔄 Synced  
**GitHub Issue**: #46  
**Assignee**: Frontend Developer  
**Estimate**: 3 days  
**Priority**: High

**Description**: Set up shadcn/ui in the features/shared/ui workspace for centralized component management across the monorepo.

**Acceptance Criteria**:
- [ ] shadcn/ui CLI initialized in features/shared/ui workspace
- [ ] All registry components installed except legacy toaster (use sonner)
- [ ] TypeScript configuration and build outputs configured
- [ ] Component export structure for workspace consumption
- [ ] Sonner toast system integrated

**Labels**: `type:task`, `priority:high`, `epic:epic-3`, `component:frontend`

---

#### 3.2 Integrate Main App with Shared UI Component Workspace 🔧
**Status**: 🔄 Synced  
**GitHub Issue**: #47  
**Assignee**: Frontend Developer  
**Estimate**: 2 days  
**Priority**: High

**Description**: Configure the main application to properly consume UI components from the shared workspace.

**Acceptance Criteria**:
- [ ] Workspace dependency added to main app package.json
- [ ] TypeScript path mapping configured for shared UI imports
- [ ] Vite configuration supports workspace dependencies
- [ ] Hot reload works for shared component changes
- [ ] Example components integrated and functional

**Labels**: `type:task`, `priority:high`, `epic:epic-3`, `component:frontend`

---

#### 3.3 Refactor UI Theme System with shadcn/ui CSS Variables and Dark Mode 🔧
**Status**: 🔄 Synced  
**GitHub Issue**: #48  
**Assignee**: Frontend Developer  
**Estimate**: 4 days  
**Priority**: High

**Description**: Implement comprehensive theme system using shadcn/ui CSS variables with light and dark mode support.

**Acceptance Criteria**:
- [ ] CSS custom properties defined for all theme tokens
- [ ] Light and dark mode themes configured
- [ ] Theme toggle functionality implemented
- [ ] Smooth transitions between modes
- [ ] Theme persistence across sessions

**Labels**: `type:task`, `priority:high`, `epic:epic-3`, `component:frontend`

---

#### 3.4 Browser Theme Detection with User Override Capability 🔧
**Status**: 🔄 Synced  
**GitHub Issue**: #49  
**Assignee**: Frontend Developer  
**Estimate**: 2 days  
**Priority**: Medium

**Description**: Implement automatic system theme detection with user override capabilities.

**Acceptance Criteria**:
- [ ] Automatic prefers-color-scheme detection
- [ ] Three-state system (light/dark/auto)
- [ ] User preferences stored in localStorage
- [ ] Real-time updates for system preference changes
- [ ] SSR-safe implementation

**Labels**: `type:task`, `priority:medium`, `epic:epic-3`, `component:frontend`

---

#### 3.5 Add User Preferences Dictionary to Database for Theme Storage �
**Status**: 🔄 Synced  
**GitHub Issue**: #50  
**Assignee**: Backend Developer  
**Estimate**: 3 days  
**Priority**: Medium

**Description**: Extend user model with preferences dictionary for cross-device theme synchronization.

**Acceptance Criteria**:
- [ ] User model extended with preferences dictionary
- [ ] API endpoints for reading/updating preferences
- [ ] SSR applies user's stored theme preference
- [ ] Client synchronizes local theme with database
- [ ] Migration script for existing users

**Labels**: `type:task`, `priority:medium`, `epic:epic-3`, `component:backend`

---

#### 3.6 Document Frimousse Emoji Picker Integration Strategy 📚
**Status**: 🔄 Synced  
**GitHub Issue**: #51  
**Assignee**: Documentation Specialist  
**Estimate**: 1 day  
**Priority**: Low

**Description**: Create documentation for frimousse emoji picker integration for future rich content features.

**Acceptance Criteria**:
- [ ] Frimousse integration guide created
- [ ] Installation and setup instructions
- [ ] TypeScript integration examples
- [ ] Theme integration documented
- [ ] Performance and accessibility guidelines

**Labels**: `type:docs`, `priority:low`, `epic:epic-3`

---

#### 3.7 Build Data Visualization Components Based on Tablecn (Vendor Implementation) 🔧
**Status**: 🔄 Synced  
**GitHub Issue**: #52  
**Assignee**: Frontend Developer  
**Estimate**: 5 days  
**Priority**: High

**Description**: Vendor and adapt tablecn components for robust data table functionality without external dependencies.

**Acceptance Criteria**:
- [ ] Tablecn source code vendored and adapted
- [ ] DiceUI dependencies removed
- [ ] NUQS dependency avoided
- [ ] Core table with sorting, filtering, pagination
- [ ] Theme integration with shadcn/ui
- [ ] TypeScript types comprehensive

**Labels**: `type:task`, `priority:high`, `epic:epic-3`, `component:frontend`

---

### Core Data Management Features (Complete After Foundation)

#### 3.8 Grid View for Data Management 📋
**Status**: 🔄 Synced  
**GitHub Issue**: #19  
**Assignee**: Frontend Developer  
**Estimate**: 7 days  
**Priority**: High

**Description**: Create spreadsheet-like grid interface for viewing and editing records.

**User Story**: As a user familiar with spreadsheets, I want a grid interface for managing my data so that I can efficiently enter and edit records.

**Acceptance Criteria**:
- [ ] Spreadsheet-like grid interface
- [ ] Inline editing with type validation
- [ ] Column sorting and filtering
- [ ] Row selection and bulk operations
- [ ] Keyboard navigation (arrow keys, tab)
- [ ] Column resizing and reordering
- [ ] Frozen columns for large datasets

**Labels**: `type:story`, `priority:high`, `epic:epic-3`, `component:frontend`

---

#### 3.9 Record Detail Forms 📋
**Status**: 🔄 Synced  
**GitHub Issue**: #20  
**Assignee**: Frontend Developer  
**Estimate**: 6 days  
**Priority**: High

**Description**: Create detailed forms for complex record management with nested data support.

**User Story**: As a user, I want detailed forms for complex records so that I can manage nested data and relationships effectively.

**Acceptance Criteria**:
- [ ] Auto-generated forms from schema
- [ ] Nested object/array editing
- [ ] File upload with preview
- [ ] Relationship field selectors
- [ ] Form validation with error messages
- [ ] Conditional field display
- [ ] Form templates and customization

**Labels**: `type:story`, `priority:high`, `epic:epic-3`, `component:frontend`

---

## Epic 4: Multiple Views & Visualization 🎯
**Milestone**: v0.1.0-mvp  
**Priority**: Critical  
**Estimated Duration**: 3 weeks  
**GitHub Label**: `epic:data-management`

### Epic Description
Implement core CRUD operations for records within collections, including data validation and basic querying.

### Issues

#### 4.1 Record CRUD Operations 📋
**Status**: ⏳ Planned  
**GitHub Issue**: TBD  
**Assignee**: Backend Developer  
**Estimate**: 5 days  
**Priority**: Critical

**Description**: Implement create, read, update, delete operations for records with proper validation.

**User Story**: As a user, I want to add, edit, and delete records in my collections so that I can manage my data effectively.

**Acceptance Criteria**:
- [ ] Create records with field validation
- [ ] Read records with filtering and pagination
- [ ] Update records with conflict detection
- [ ] Delete records with confirmation
- [ ] Batch operations for multiple records
- [ ] Data validation based on field types
- [ ] Error handling for invalid data

**Labels**: `type:story`, `priority:critical`, `epic:data-management`, `component:api`

---

#### 4.2 Grid View Interface 📋
**Status**: ⏳ Planned  
**GitHub Issue**: TBD  
**Assignee**: Frontend Developer  
**Estimate**: 7 days  
**Priority**: Critical

**Description**: Create spreadsheet-like grid interface for viewing and editing records.

**User Story**: As a user, I want to view my data in a familiar grid format so that I can quickly browse and edit multiple records.

**Acceptance Criteria**:
- [ ] Responsive data grid component
- [ ] In-line cell editing
- [ ] Column sorting and filtering
- [ ] Row selection and bulk actions
- [ ] Pagination controls
- [ ] Column width adjustment
- [ ] Field type-specific cell renderers

**Labels**: `type:story`, `priority:critical`, `epic:data-management`, `component:ui`

---

## Epic 5: React Router 7 Admin Interface 🎯
**Milestone**: v0.1.0-mvp  
**Priority**: High  
**Estimated Duration**: 4 weeks  
**GitHub Label**: `epic:admin-interface`

### Epic Description
Build the React Router 7 admin interface integrated with NestJS for managing workspaces, collections, and data.

### Issues

#### 5.1 React Router 7 Integration 🔧
**Status**: ⏳ Planned  
**GitHub Issue**: TBD  
**Assignee**: Frontend Developer  
**Estimate**: 3 days  
**Priority**: High

**Description**: Set up React Router 7 in framework mode integrated with NestJS Express server.

**Acceptance Criteria**:
- [ ] React Router 7 framework mode setup
- [ ] Integration with NestJS Express router
- [ ] SSR configuration
- [ ] Client-side hydration
- [ ] Route-based code splitting
- [ ] Vite build integration

**Labels**: `type:task`, `priority:high`, `epic:admin-interface`, `component:frontend`

---

#### 5.2 Authentication UI Flow 📋
**Status**: ⏳ Planned  
**GitHub Issue**: TBD  
**Assignee**: Frontend Developer  
**Estimate**: 4 days  
**Priority**: High

**Description**: Create complete authentication user interface with forms and flow management.

**User Story**: As a user, I want a clean and intuitive login experience so that I can quickly access my workspaces.

**Acceptance Criteria**:
- [ ] Login form with validation
- [ ] Registration form with email verification
- [ ] Password reset flow
- [ ] OAuth login buttons
- [ ] Protected route handling
- [ ] Session state management
- [ ] Responsive design for mobile/desktop

**Labels**: `type:story`, `priority:high`, `epic:admin-interface`, `component:auth`, `component:ui`

---

## Epic 6: Real-time Collaboration Foundation 🎯
**Milestone**: v0.2.0-beta  
**Priority**: High  
**Estimated Duration**: 4 weeks  
**GitHub Label**: `epic:real-time`

### Epic Description
Implement Rocicorp Zero integration for real-time data synchronization and collaborative editing.

### Issues

#### 6.1 Zero Sync Integration 🔧
**Status**: ⏳ Planned  
**GitHub Issue**: TBD  
**Assignee**: Senior Developer  
**Estimate**: 6 days  
**Priority**: High

**Description**: Integrate Rocicorp Zero for real-time data synchronization between client and server.

**Acceptance Criteria**:
- [ ] Zero client setup and configuration
- [ ] Server-side Zero integration
- [ ] Data model synchronization
- [ ] Conflict resolution strategy
- [ ] Offline capability
- [ ] Performance optimization

**Labels**: `type:task`, `priority:high`, `epic:real-time`, `component:sync`

---

## Epic 7: Advanced Views & Visualization 🎯
**Milestone**: v0.2.0-beta  
**Priority**: Medium  
**Estimated Duration**: 5 weeks  
**GitHub Label**: `epic:views`

### Epic Description
Implement multiple view types for data visualization including calendar, kanban, and gallery views.

### Issues

#### 7.1 View Management System 🔧
**Status**: ⏳ Planned  
**GitHub Issue**: TBD  
**Assignee**: Backend Developer  
**Estimate**: 3 days  
**Priority**: Medium

**Description**: Create backend system for managing different view configurations and sharing.

**Acceptance Criteria**:
- [ ] View model and API endpoints
- [ ] View configuration storage
- [ ] View sharing and permissions
- [ ] Default view creation
- [ ] View export/import

**Labels**: `type:task`, `priority:medium`, `epic:views`, `component:api`

---

## Epic 8: Enterprise Features 🎯
**Milestone**: v1.0.0-production  
**Priority**: Medium  
**Estimated Duration**: 6 weeks  
**GitHub Label**: `epic:enterprise`

### Epic Description
Implement enterprise-ready features including advanced permissions, audit logs, and API management.

### Issues

#### 8.1 Advanced Permission System 🔧
**Status**: ⏳ Planned  
**GitHub Issue**: TBD  
**Assignee**: Backend Developer  
**Estimate**: 5 days  
**Priority**: Medium

**Description**: Implement granular permissions at field, record, and view levels.

**Acceptance Criteria**:
- [ ] Field-level permissions
- [ ] Record-level permissions (row-level security)
- [ ] View-level permissions
- [ ] Permission inheritance
- [ ] Permission audit trail

**Labels**: `type:task`, `priority:medium`, `epic:enterprise`, `component:auth`

---

## GitHub Management Scripts

The following scripts are available for managing this catalog:

- `scripts/sync-github-issues.js` - Sync issues between this catalog and GitHub
- `scripts/create-milestones.js` - Create GitHub milestones from this catalog
- `scripts/generate-project-board.js` - Generate GitHub Project board from epics

## Sync Status

**Last GitHub Sync**: 2025-09-28  
**Issues Created**: 13/13 (7 new issues added for Epic 3 design system foundation)  
**Milestones Created**: 3/3  
**Labels Created**: 27/27  

## Recent Updates

### 2025-09-28: Epic 3 Design System Foundation Expansion
- Added 7 new foundational issues to Epic 3 (#46-52)
- Reordered Epic 3 to prioritize design system setup before UI features
- Updated Epic 3 scope and timeline (12-14 weeks vs 8-10 weeks)
- All new issues linked as sub-issues of Epic 3 (#10)
- Issues added:
  - #46: Initialize shadcn/ui Design System
  - #47: Integrate Main App with Shared UI
  - #48: Theme System with CSS Variables & Dark Mode  
  - #49: Browser Theme Detection with Override
  - #50: User Preferences Database Storage
  - #51: Frimousse Emoji Picker Documentation
  - #52: Data Visualization Components (Tablecn Vendor)

#### Key Technical Decisions Documented
- **Rich Text Editor**: Lexical (https://lexical.dev/) specified for all rich text editing features
- **Design System**: shadcn/ui with all components except legacy toaster (use sonner)
- **Theme System**: CSS variables, light/dark/auto modes, database persistence
- **Data Tables**: Vendored tablecn code, avoid NUQS dependency  
- **Emoji Picker**: frimousse integration when needed
- **Architecture**: Shared UI workspace for component reuse across features

---

*This catalog is automatically updated when issues are created or modified in GitHub. Use the provided scripts to maintain synchronization.*