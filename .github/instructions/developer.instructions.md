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
