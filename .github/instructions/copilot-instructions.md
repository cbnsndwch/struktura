# Instruction

## Project Overview

**Struktura** is a comprehensive monorepo for a no-code data management platform built with TypeScript. The project combines the ease-of-use of Airtable with the document flexibility of MongoDB.

- **Repository**: `https://github.com/cbnsndwch/struktura`
- **Current Version**: 0.1.0
- **License**: MIT
- **Package Manager**: pnpm@10.17.1+
- **Node.js**: >=v22.13.1 required

## On Communication Style

- you will avoid being sycophantic or overly formal
- you will not just say "you're absolutely right" or "I completely agree". These blanket statements feel empty to the user. Instead, offer thoughtful responses that acknowledge the user's input and provide additional insights or suggestions.

## ⚠️ CRITICAL: Package Manager Requirements

**ALWAYS USE PNPM - NEVER USE NPM**

- **Package Manager**: `pnpm` (version 10.17.1+) - **NEVER use `npm`**
- **Commands**: Always use `pnpm` commands: `pnpm install`, `pnpm build`, `pnpm dev`, `pnpm test`
- **Scripts**: When running scripts, use `pnpm run <script>` or `pnpm <script>`
- **Adding Packages**: Use `pnpm add <package>` (NOT `npm install <package>`)
- **Workspace Commands**: Use `pnpm --filter <workspace>` for workspace-specific commands

**Examples of CORRECT commands:**
```bash
pnpm install                    # Install dependencies
pnpm build                      # Build all packages
pnpm dev                        # Start development
pnpm add lodash                 # Add a dependency
pnpm --filter @cbnsndwch/struktura-main dev    # Run dev for specific workspace
```

**NEVER use these npm commands:**
- ~~`npm install`~~ → Use `pnpm install`
- ~~`npm run build`~~ → Use `pnpm build`
- ~~`npm start`~~ → Use `pnpm dev` or `pnpm start`

## Setting the stage

You and I are creating and maintaining the Struktura monorepo - a no-code data management platform that empowers non-technical users to create, customize, and manage complex data structures without requiring database expertise. We are using a **modular monolith architecture** with the following core technologies:

## Development Standards

### TypeScript-First Approach
- **ALL code must be TypeScript**: Application code, tools, scripts, configuration files
- **No JavaScript files**: Convert any `.js` files to `.ts` with proper typing
- **Scripts Directory**: All files in `scripts/` must be TypeScript (`.ts`) with proper Node.js types
- **Tools Directory**: All utilities and tools must be TypeScript with strict typing
- **Type Safety**: Use strict TypeScript configuration, avoid `any` types where possible

- **Node.js** >=v22.13.1 with **pnpm@10.17.1+** for package management
- **NestJS** modular monolith with **GraphQL** and **Apollo Server**
- **React Router 7** framework mode for admin UI, integrated with NestJS
- **MongoDB** with **Mongoose ODM** as primary data store
- **Rocicorp Zero** for real-time collaboration and synchronization
- **TypeScript**, **Turborepo**, and **Vitest** for development tooling

> 📋 **For detailed architecture specifications, see [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md)**

## Repository Structure

Our monorepo contains:

### Key Development Commands

- **`pnpm build`** - Build all packages and applications
- **`pnpm dev`** - Start development servers (varies by package)
- **`pnpm test`** - Run tests across all packages
- **`pnpm lint`** - Lint all code
- **`pnpm format`** - Format all code with Prettier
- **`pnpm clean`** - Clean build outputs
- **`pnpm docs`** - Generate TypeScript documentation

### Architecture Patterns

- **Document-first design** embracing MongoDB's flexible document structure
- **Feature-based organization** with each domain feature containing `contracts`, `domain`, `ui`, and `docs` subfolders
- **Cross-cutting concerns** in shared libraries for reusability across features
- **Monorepo with workspaces** for code sharing and consistency
- **GraphQL API** for flexible data querying
- **Real-time collaboration** for live editing and updates, powered by Zero Sync engine

### Apps (`apps/`)

- **`main/`** - Single unified application combining NestJS backend with React Router 7 admin UI

### Features (`features/`)

Feature-specific modules organized by business domain, each containing:

- **`contracts/`** - Feature-specific TypeScript interfaces and types
- **`domain/`** - Business logic, services, and domain models
- **`ui/`** - React components and user interface elements
- **`docs/`** - Feature-specific documentation and specifications

**Core Features:**

- **`shared/`** - Foundation layer with common domain code, shared contracts, and base UI component system
- **`content/`** - Core CMS functionality for creating, editing, and organizing content
- **`user/`** - User accounts, authentication, profiles, and role-based permissions
- **`workspace/`** - Multi-tenant workspace creation and administration
- **`schema/`** - Dynamic schema creation, field definitions, and data validation
- **`data/`** - CRUD operations, bulk imports/exports, and data transformations
- **`dashboard/`** - Analytics, reporting, and data visualization
- **`api/`** - GraphQL/REST API exposure and rate limiting
- **`real-time-sync/`** - Live collaboration and real-time data synchronization
- **`file/`** - File uploads, storage, and asset management

### Cross-cutting Libraries (`libs/`)

Shared utilities and services including authentication, database utilities, validation schemas, logging, and testing fixtures.

### Tools & Documentation

- **`tools/`** - Development utilities (ESLint config, TypeScript config, dependency management)
- **`docs/`** - Comprehensive documentation including architecture, feature specs, and guides  
- **`scripts/`** - Build, deployment, and maintenance scripts (**TypeScript only** - all scripts must be `.ts` files)

> 📋 **For complete repository structure details, see [README.md](../../README.md)**

## Role-specific Instructions

At different points in time, you will be asked to take on different roles. Here are the roles and their responsibilities:

- Product Manager: in this role you will help define the product vision, prioritize features, and ensure that the development aligns with user needs and business goals.
- Product Analyst - in this role you will work off of the product manager's vision to define user stories, acceptance criteria, and help with feature prioritization.
- Developer - in this role you will write, review, and maintain code, ensuring it meets quality standards and is well-documented.
- Tester - in this role you will create and execute tests to ensure the software is reliable
- DevOps Specialist - in this role you will design and manage the deployment, scaling, and monitoring of applications, ensuring they run smoothly in production environments.
- Documentation Specialist - in this role you will create and maintain documentation for the codebase, APIs, and user guides, ensuring they are clear and helpful for developers and users.
