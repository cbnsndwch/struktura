# Developer Instructions

## Role Overview

As a **Developer** in the Struktura project, you are responsible for implementing features, maintaining code quality, and ensuring the technical integrity of our TypeScript-based monorepo. You work within our document-first architecture to build scalable, maintainable solutions that serve our no-code data management platform.

## Core Responsibilities

### 1. Code Implementation

- **Feature Development**: Implement user stories and technical requirements according to specifications
- **Bug Fixes**: Diagnose and resolve defects in existing functionality
- **Code Reviews**: Review pull requests from other team members and provide constructive feedback
- **Refactoring**: Improve code structure and maintainability while preserving functionality

### 2. Technical Design & Architecture

- **Document-First Design**: Follow MongoDB's document model and embrace flexible schemas
- **API Design**: Create and maintain GraphQL schemas, resolvers, and REST endpoints
- **Database Design**: Design MongoDB schemas and data access patterns using Mongoose
- **UI Components**: Build reusable React components for data visualization and editing

### 3. Code Quality & Standards

- **Testing**: Write comprehensive unit, integration, and end-to-end tests using Vitest
- **Type Safety**: Leverage TypeScript effectively for type safety across the codebase
- **Documentation**: Document code, APIs, and architectural decisions
- **Performance**: Optimize code for performance and scalability

## Repository Technical Context

### Monorepo Structure

Our codebase is organized as a Turborepo monorepo with pnpm workspaces:

```
├── apps/                   # Applications
├── libs/                   # Shared libraries
├── tools/                  # Development utilities
└── scripts/                # Build and deployment scripts
```

### Technology Stack

**Frontend:**

- React with modern build tooling
- Vite for build tooling and development
- TypeScript for type safety
- Rocicorp Zero for real-time synchronization

**Backend:**

- NestJS with GraphQL federation
- MongoDB with Mongoose ODM
- Apollo Server for GraphQL
- WebSocket support for real-time features

**Development:**

- Turborepo for build caching and task orchestration
- pnpm for package management
- Vitest for testing
- ESLint and Prettier for code quality

### Feature-based Architecture

Follow these patterns when working with our feature-based architecture:

1. **Feature Modules**: Each feature in `features/` contains `contracts/`, `domain/`, `ui/`, and `docs/` subfolders
2. **Cross-cutting Concerns**: Shared utilities like auth, logging, telemetry in `libs/` folder
3. **Shared Foundation**: Common code, contracts, and base UI components in `features/shared/`
4. **Separation of Concerns**: Business logic in `domain/`, interfaces in `contracts/`, UI in `ui/`, docs in `docs/`

### Domain Layer Structure (Standard Pattern)

**CRITICAL**: All feature domain layers MUST follow this exact structure for consistency and maintainability:

```
features/[feature-name]/domain/src/
├── entities/                           # Entity/GraphQL Type/API Schema classes
│   ├── [main].entity.ts               # Consolidated @Schema + @ObjectType + validation
│   ├── [other].entity.ts              # Additional entities as needed
│   └── index.ts                       # Export { Entity, EntitySchema, type EntityDocument }
├── services/                          # Business logic services
│   ├── [main].service.ts              # Primary business logic (@Injectable)
│   ├── [main].service.spec.ts         # Tests for main service
│   ├── [utility].service.ts           # Helper services (e.g., hash, email)
│   └── index.ts                       # Export all services
├── controllers/                       # HTTP endpoints  
│   ├── [feature].controller.ts        # REST API endpoints (@Controller)
│   └── index.ts                       # Export controllers
├── dto/                               # Data Transfer Objects
│   ├── [feature].dto.ts               # Input DTOs extending entities with @InputType
│   └── index.ts                       # Export DTOs
├── guards/                            # Authentication & authorization
│   ├── [feature].guard.ts             # Custom guards (@Injectable, CanActivate)
│   └── index.ts                       # Export guards
├── strategies/                        # Authentication strategies
│   ├── jwt.strategy.ts                # Passport strategies
│   └── index.ts                       # Export strategies
├── decorators/                        # Custom decorators
│   ├── [custom].decorator.ts          # Parameter/method decorators
│   └── index.ts                       # Export decorators
├── resolvers/                         # GraphQL resolvers
│   ├── [feature].resolver.ts          # GraphQL queries/mutations (@Resolver)
│   └── index.ts                       # Export resolvers
├── [feature].module.ts                # NestJS module configuration (@Module)
└── index.ts                           # Main exports (entities, services, module, etc.)
```

#### Key Architectural Principles

1. **Consolidated Entities**: Use single classes with multiple decorators
   ```typescript
   @Schema({ timestamps: true })           // Mongoose schema
   @ObjectType('User')                     // GraphQL type
   export class User implements IUser {    // Domain contract
       @Prop() @Field() @IsEmail()         // All decorators together
       email!: string;
       
       @Prop()                             // Internal field (no @Field = not in GraphQL)
       passwordHash!: string;
   }
   ```

2. **Service Organization**: All business logic in `services/`
   ```typescript
   @Injectable()
   export class UserService {
       constructor(
           @InjectModel(User.name) private userModel: Model<UserDocument>
       ) {}
       
       async create(dto: CreateUserDto): Promise<User> { ... }
   }
   ```

3. **Controller Separation**: Pure HTTP layer in `controllers/`
   ```typescript
   @Controller('users')
   export class UserController {
       constructor(private userService: UserService) {}
       
       @Post()
       create(@Body() dto: CreateUserDto) {
           return this.userService.create(dto);
       }
   }
   ```

4. **Clean Imports**: Folder-based imports for organization
   ```typescript
   // ✅ Good - organized by concern
   import { User } from '../entities/user.entity.js';
   import { UserService } from '../services/user.service.js';
   import { CreateUserDto } from '../dto/user.dto.js';
   
   // ❌ Bad - everything from root
   import { User, UserService, CreateUserDto } from '../index.js';
   ```

5. **Export Structure**: Logical grouping in index files
   ```typescript
   // entities/index.ts
   export { User, UserSchema, type UserDocument } from './user.entity.js';
   
   // services/index.ts  
   export * from './user.service.js';
   
   // Main index.ts
   export * from './entities/index.js';
   export * from './services/index.js';
   export { UserModule } from './user.module.js';
   ```

## Development Workflows

### Getting Started

1. **Environment Setup**:

    ```bash
    # Install dependencies
    pnpm install

    # Set up environment variables
    cp .env.example .env
    # Edit .env file with your configuration

    # Start development
    pnpm dev
    ```

2. **Development Commands**:

    ```bash
    # Build everything
    pnpm build

    # Testing
    pnpm test               # Run all tests
    pnpm lint               # Lint code
    pnpm format             # Format code
    ```

### Feature Development Process

1. **Branch Creation**: Create feature branches from `main`
2. **Implementation**: Follow feature-based architecture principles
3. **Testing**: Write tests before or alongside implementation
4. **Code Review**: Submit PR for team review
5. **Integration**: Ensure CI/CD pipeline passes
6. **Deployment**: Coordinate with DevOps for deployment

### Testing Strategy

**Unit Tests:**

- Test individual functions and classes
- Mock external dependencies
- Aim for high code coverage on business logic

**Integration Tests:**

- Test component interactions
- Test database operations
- Test API endpoints

**End-to-End Tests:**

- Test complete user workflows
- Use Playwright for browser automation
- Focus on critical user paths

### Feature Implementation Checklist

When creating or modifying a feature domain, ensure you follow this checklist:

#### ✅ Entities Layer
- [ ] Create consolidated entity classes with `@Schema`, `@ObjectType`, and validation decorators
- [ ] Implement domain contracts (e.g., `implements IUser`)
- [ ] Add domain methods (`fromData()`, `toData()`, helper methods)
- [ ] Export entities, schemas, and types from `entities/index.ts`
- [ ] Add appropriate MongoDB indexes in schema definition

#### ✅ Services Layer  
- [ ] Implement business logic in `@Injectable` services
- [ ] Use dependency injection for repositories and utilities
- [ ] Keep services focused on single responsibility
- [ ] Write unit tests for all service methods
- [ ] Export services from `services/index.ts`

#### ✅ Controllers Layer
- [ ] Create thin controllers that delegate to services  
- [ ] Use proper HTTP status codes and response formats
- [ ] Apply appropriate guards and decorators
- [ ] Validate inputs with DTOs
- [ ] Export controllers from `controllers/index.ts`

#### ✅ DTOs Layer
- [ ] Create input DTOs using `@InputType` for GraphQL
- [ ] Extend or pick from entities using `PickType`, `OmitType`
- [ ] Add appropriate validation decorators
- [ ] Export DTOs from `dto/index.ts`

#### ✅ Module Configuration
- [ ] Configure `@Module` with proper imports, providers, exports
- [ ] Register Mongoose schemas in `MongooseModule.forFeature()`
- [ ] Export module from main feature index
- [ ] Ensure proper dependency injection setup

#### ✅ GraphQL Integration (if applicable)
- [ ] Create resolvers using `@Resolver`, `@Query`, `@Mutation`
- [ ] Use entity classes directly as GraphQL types  
- [ ] Implement proper error handling
- [ ] Export resolvers from `resolvers/index.ts`

### Quick Start: Creating a New Feature Domain

```bash
# 1. Create feature structure
mkdir -p features/[feature-name]/domain/src/{entities,services,controllers,dto,guards,strategies,decorators,resolvers}

# 2. Create index files  
touch features/[feature-name]/domain/src/{entities,services,controllers,dto,guards,strategies,decorators,resolvers}/index.ts

# 3. Copy and adapt from features/auth/domain/src/ structure (GOLD STANDARD)
```

#### At a Glance - Key Patterns

**Consolidated Entity**: `@Schema() @ObjectType() export class User { @Prop() @Field() @IsEmail() email!: string; }`
**Service**: `@Injectable() export class UserService { async create(dto) { /* business logic */ } }`  
**Controller**: `@Controller() export class UserController { constructor(private service: UserService) {} }`
**Imports**: `import { User } from '../entities/user.entity.js'` (folder-based)
**Exports**: `entities/index.ts` exports entities, `services/index.ts` exports services, etc.

### Common Patterns

#### Entity Pattern (Consolidated Model)
```typescript
// entities/example.entity.ts
@Schema({ timestamps: true })
@ObjectType('Example')
export class Example implements IExample {
    @Prop({ unique: true }) @Field() @IsEmail()  // unique: true creates index
    email!: string;
    
    @Prop() @Field() @IsString()
    name!: string;
    
    @Prop() // Internal only - no @Field  
    internalData!: string;
    
    static fromData(data: IExample): Example { ... }
    toData(): IExample { ... }
}

export const ExampleSchema = SchemaFactory.createForClass(Example);

// Add additional indexes (avoid duplicating @Prop indexes)
// Note: Don't add .index() for fields that already have unique: true or index: true
ExampleSchema.index({ createdAt: -1 }); // Additional indexes only
```

**⚠️ Important**: Avoid duplicate indexes! If you use `unique: true` or `index: true` in `@Prop()`, don't add the same index with `schema.index()`.

#### Service Pattern (Business Logic)
```typescript  
// services/example.service.ts
@Injectable()
export class ExampleService {
    constructor(
        @InjectModel(Example.name) private model: Model<ExampleDocument>
    ) {}
    
    async create(dto: CreateExampleDto): Promise<Example> { ... }
}
```

#### Controller Pattern (HTTP Layer)
```typescript
// controllers/example.controller.ts  
@Controller('examples')
export class ExampleController {
    constructor(private service: ExampleService) {}
    
    @Post()
    create(@Body() dto: CreateExampleDto) {
        return this.service.create(dto);
    }
}
```

## Code Standards & Best Practices

### UI Component Standards

**shadcn/ui Component Library**: The workspace uses a standardized component library based on shadcn/ui. This ensures consistency, better performance, and alignment with our Tailwind CSS design system.

### TypeScript Guidelines

1. **Strict Type Safety**: Use strict TypeScript configuration
2. **Interface Segregation**: Create focused, cohesive interfaces
3. **Generic Types**: Leverage generics for reusable components
4. **Utility Types**: Use TypeScript utility types effectively

```typescript
// Good: Strict typing with clear interfaces
interface UserRepository {
    findById(id: string): Promise<User | null>;
    create(userData: CreateUserDto): Promise<User>;
    update(id: string, updates: Partial<User>): Promise<User>;
}

// Good: Generic types for reusability
interface ApiResponse<T> {
    data: T;
    meta: {
        total: number;
        page: number;
    };
}
```

### React/Frontend Guidelines

1. **Component Structure**: Use functional components with hooks
2. **State Management**: Use React Router 7 loaders/actions for data
3. **Real-time Updates**: Integrate Rocicorp Zero for live data
4. **Error Boundaries**: Implement proper error handling

```typescript
// Good: Functional component with proper typing
interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const user = useZero(queries.user.byId(userId));

  if (!user) return <LoadingSpinner />;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### UI Component Guidelines

**Available shadcn/ui Components in support-ui:**

### Backend/NestJS Guidelines

1. **Module Organization**: Organize code into focused modules
2. **Dependency Injection**: Use NestJS DI container effectively
3. **GraphQL Federation**: Structure subgraphs appropriately
4. **Database Patterns**: Use repository pattern with Mongoose

```typescript
// Good: NestJS service with proper DI
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private readonly logger: Logger
    ) {}

    async findById(id: string): Promise<User | null> {
        try {
            return await this.userModel.findById(id).exec();
        } catch (error) {
            this.logger.error(`Failed to find user ${id}`, error);
            throw new NotFoundException('User not found');
        }
    }
}
```

### Database Guidelines

1. **Schema Design**: Design flexible, scalable MongoDB schemas
2. **Indexing**: Create appropriate indexes for query performance
3. **Validation**: Use Mongoose schema validation
4. **Migrations**: Handle schema changes gracefully

```typescript
// Good: Well-structured Mongoose schema
@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
    organizationId: mongoose.Types.ObjectId;

    @Prop({ type: Map, of: mongoose.Schema.Types.Mixed })
    settings: Map<string, any>;
}
```

## Security Considerations

### Authentication & Authorization

1. **JWT Tokens**: Implement secure token handling
2. **Role-Based Access**: Use CASL for permissions
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement appropriate rate limits

### Data Protection

1. **Sensitive Data**: Never log sensitive information
2. **Environment Variables**: Use .env files for environment-specific configuration (never commit .env files)
3. **HTTPS**: Ensure all communications are encrypted
4. **Database Security**: Use MongoDB security best practices

## Performance Guidelines

### Frontend Performance

1. **Code Splitting**: Use dynamic imports for large components
2. **Lazy Loading**: Load data and components as needed
3. **Caching**: Leverage Rocicorp Zero's caching capabilities
4. **Bundle Size**: Monitor and optimize bundle sizes

### Backend Performance

1. **Database Queries**: Optimize MongoDB queries and aggregations
2. **Caching**: Implement appropriate caching strategies
3. **GraphQL**: Use DataLoader for N+1 query prevention
4. **Background Jobs**: Use queues for heavy processing

## Error Handling & Monitoring

### Error Handling

1. **Graceful Degradation**: Handle errors without breaking user experience
2. **Error Boundaries**: Implement React error boundaries
3. **API Errors**: Return consistent error responses
4. **Logging**: Log errors with appropriate context

### Monitoring & Observability

1. **Telemetry**: Use our telemetry API for metrics collection
2. **Performance Monitoring**: Track key performance metrics
3. **Error Tracking**: Monitor and alert on application errors
4. **Health Checks**: Implement service health endpoints

## Deployment & DevOps Integration

### CI/CD Pipeline

1. **Build Process**: Ensure builds pass in CI
2. **Test Automation**: All tests must pass before merge
3. **Code Quality**: Meet linting and formatting standards
4. **Security Scanning**: Pass security vulnerability scans

### Environment Management

1. **Environment Parity**: Maintain consistency across environments
2. **Configuration**: Use environment variables for environment-specific config
3. **Database Migrations**: Handle data migrations safely
4. **Feature Flags**: Implement feature flags as needed

## Communication & Collaboration

### Code Reviews

1. **Constructive Feedback**: Provide helpful, specific feedback
2. **Knowledge Sharing**: Share learnings and best practices
3. **Security Focus**: Review for security vulnerabilities
4. **Performance Impact**: Consider performance implications

### Documentation

1. **Code Comments**: Comment complex business logic
2. **API Documentation**: Keep GraphQL schema documentation current
3. **Architecture Decisions**: Document significant technical decisions
4. **Changelog**: Update changelogs for significant changes

### Architectural Consistency Guidelines

#### 🎯 Reference Implementation
- **Use `features/auth/domain/` as the gold standard** for all feature implementations
- Follow the exact folder structure and naming conventions established
- Study the auth implementation before creating new features

#### 🔍 Code Review Focus Areas
When reviewing code, pay special attention to:

1. **Structure Compliance**: Does the feature follow the standard domain structure?
2. **Entity Consolidation**: Are entities using the consolidated decorator pattern?
3. **Service Organization**: Is business logic properly separated in services?
4. **Import Patterns**: Are imports organized by folder/concern?
5. **Export Consistency**: Do index files follow the established export patterns?

#### 🚫 Anti-Patterns to Avoid

```typescript
// ❌ Bad: Separate schema/entity/GraphQL files
// Don't create: user.schema.ts, user.entity.ts, user.type.ts

// ✅ Good: Consolidated entity file
// Create: user.entity.ts with all decorators

// ❌ Bad: Business logic in controllers
@Controller('users')
export class UserController {
    @Post()
    create(@Body() dto: CreateUserDto) {
        // ❌ Don't put business logic here
        const user = new User();
        user.email = dto.email.toLowerCase();
        return this.userModel.save(user);
    }
}

// ✅ Good: Thin controllers delegating to services  
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}
    
    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto); // ✅ Delegate to service
    }
}

// ❌ Bad: Scattered imports from various files
import { User } from '../user.entity.js';
import { UserService } from '../user.service.js';
import { CreateUserDto } from '../create-user.dto.js';

// ✅ Good: Organized folder-based imports
import { User } from '../entities/user.entity.js';  
import { UserService } from '../services/user.service.js';
import { CreateUserDto } from '../dto/user.dto.js';
```

#### 📋 Migration Strategy for Existing Features
When updating existing features to match the new structure:

1. **Assess Current State**: Identify what exists and what needs reorganization
2. **Create Folders**: Set up the standard folder structure  
3. **Consolidate Entities**: Merge schema/entity/GraphQL into single files
4. **Reorganize Services**: Move business logic to services folder
5. **Update Imports**: Fix all import paths to match new structure
6. **Test Thoroughly**: Ensure no functionality is broken
7. **Update Exports**: Standardize index.ts files

#### 🎯 Quality Gates
Before merging any feature:

- [ ] Follows exact folder structure from auth domain
- [ ] Uses consolidated entities with multiple decorators
- [ ] Has business logic properly organized in services  
- [ ] Controllers are thin and delegate to services
- [ ] All imports use folder-based organization
- [ ] Index files follow standard export patterns
- [ ] Tests are co-located with implementation files
- [ ] Build passes without warnings

## Success Metrics

Your effectiveness as a Developer will be measured by:

1. **Code Quality**: Maintainable, well-tested, secure code
2. **Feature Delivery**: Timely delivery of working features
3. **Bug Resolution**: Quick resolution of defects
4. **Team Collaboration**: Effective code reviews and knowledge sharing
5. **Technical Excellence**: Following best practices and improving system architecture
6. **User Impact**: Features that provide real value to end users

## Continuous Learning

Stay current with:

- TypeScript and React Router 7 updates
- NestJS and GraphQL federation best practices
- MongoDB and Mongoose optimization techniques
- Rocicorp Zero capabilities and patterns
- Security best practices for web applications
- Performance optimization techniques
