# Technical Standards & Guidelines
# Struktura Project

## 1. Development Environment

### 1.1 Required Software
- **Node.js**: v22.13.1 or higher (LTS recommended)
- **pnpm**: v10.13.1 or higher (package manager)
- **MongoDB**: v7.0 or higher
- **Redis**: v7.0 or higher
- **Docker**: v24.0 or higher
- **Git**: v2.40 or higher

### 1.2 Development Stack Versions (Locked)
- **TypeScript**: 5.7.2
- **React**: 18.3.1
- **NestJS**: 11.0.0
- **Vite**: 6.0.0
- **React Router**: 7.0.0

### 1.2 IDE Configuration
**Recommended**: Visual Studio Code with extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- MongoDB for VS Code
- Thunder Client (for API testing)
- GitLens
- Auto Rename Tag
- Bracket Pair Colorizer

### 1.3 Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd struktura

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development services
docker-compose up -d mongodb redis

# Run the application
pnpm dev
```

## 2. Code Standards

### 2.1 TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2.2 Naming Conventions
```typescript
// Files and directories: kebab-case
user-service.ts
schema-builder/

// Variables and functions: camelCase
const userName = 'john';
function getUserById() {}

// Classes and interfaces: PascalCase
class UserService {}
interface DatabaseConfig {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Enums: PascalCase with descriptive prefix
enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor'
}
```

### 2.3 Code Structure
```typescript
// File organization template
import { /* external libraries */ } from 'library';
import { /* internal shared */ } from '@shared/module';
import { /* relative imports */ } from './local-module';

// Type definitions first
interface UserData {
  id: string;
  email: string;
  role: UserRole;
}

// Constants
const DEFAULT_PAGE_SIZE = 25;

// Main implementation
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userData: CreateUserData): Promise<User> {
    // Implementation
  }
}

// Default export last
export default UserService;
```

### 2.4 Error Handling
```typescript
// Use custom error classes
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Always include error context
throw new ValidationError(
  'Email address is required',
  'email',
  'FIELD_REQUIRED'
);

// Use Result pattern for functions that can fail
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function validateUser(userData: unknown): Promise<Result<User, ValidationError>> {
  try {
    const user = await userSchema.parse(userData);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: new ValidationError('Invalid user data') };
  }
}
```

## 3. Frontend Standards

### 3.1 React Component Structure
```typescript
// Component file organization
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input } from '@/components/ui';
import { useWorkspace } from '@/hooks';
import { validateEmail } from '@/utils';
import type { User } from '@/types';

// Props interface
interface UserFormProps {
  user?: User;
  onSubmit: (user: User) => void;
  onCancel: () => void;
}

// Component implementation
export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { currentWorkspace } = useWorkspace();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        required
      />
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

### 3.2 Custom Hooks Pattern
```typescript
// hooks/use-collection.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService } from '@/services';
import type { Collection, CreateCollectionData } from '@/types';

export function useCollection(collectionId: string) {
  return useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => collectionService.getById(collectionId),
    enabled: !!collectionId,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionData) => collectionService.create(data),
    onSuccess: (newCollection) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.setQueryData(['collection', newCollection.id], newCollection);
    },
  });
}
```

### 3.3 State Management
```typescript
// stores/workspace-store.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Workspace, User } from '@/types';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  members: User[];
  isLoading: boolean;
  error: string | null;
}

interface WorkspaceActions {
  setCurrentWorkspace: (workspace: Workspace) => void;
  loadMembers: () => Promise<void>;
  addMember: (user: User) => void;
  removeMember: (userId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    currentWorkspace: null,
    members: [],
    isLoading: false,
    error: null,

    // Actions
    setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

    loadMembers: async () => {
      const { currentWorkspace } = get();
      if (!currentWorkspace) return;

      set({ isLoading: true, error: null });
      try {
        const members = await workspaceService.getMembers(currentWorkspace.id);
        set({ members, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },

    addMember: (user) => set((state) => ({ 
      members: [...state.members, user] 
    })),

    removeMember: (userId) => set((state) => ({
      members: state.members.filter(member => member.id !== userId)
    })),
  }))
);
```

### 3.4 Emoji Component Development Standards

When developing components that include emoji functionality, follow these guidelines to ensure consistency, performance, and accessibility:

#### Emoji Picker Integration

```typescript
// ✅ Good: Use lazy loading for emoji pickers
import { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const EmojiPicker = lazy(() => import('./emoji-picker'));

const LazyEmojiPicker = ({ onEmojiSelect }) => (
  <Suspense fallback={<Skeleton className="h-96 w-80" />}>
    <EmojiPicker onEmojiSelect={onEmojiSelect} />
  </Suspense>
);

// ❌ Bad: Direct import increases bundle size
import { EmojiPicker } from 'frimousse';
```

#### Accessibility Requirements

```typescript
// ✅ Good: Proper accessibility implementation
export const AccessibleEmojiPicker = ({ onEmojiSelect }) => (
  <div 
    role="dialog"
    aria-label="Emoji picker"
    aria-describedby="emoji-instructions"
  >
    <div id="emoji-instructions" className="sr-only">
      Use arrow keys to navigate, Enter to select, Escape to close
    </div>
    <EmojiPicker onEmojiSelect={onEmojiSelect} />
  </div>
);

// ❌ Bad: Missing accessibility features
export const BadEmojiPicker = ({ onEmojiSelect }) => (
  <EmojiPicker onEmojiSelect={onEmojiSelect} />
);
```

#### Theme Integration

```typescript
// ✅ Good: Theme-aware emoji picker
import { useTheme } from '@/hooks/use-theme';

export const ThemedEmojiPicker = (props) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <EmojiPicker
      {...props}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      className="border border-border bg-background"
    />
  );
};
```

#### SSR Compatibility

```typescript
// ✅ Good: SSR-safe implementation
import { useEffect, useState } from 'react';

export const SSRSafeEmojiPicker = (props) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div className="h-96 w-80 animate-pulse bg-muted rounded" />;
  }
  
  return <LazyEmojiPicker {...props} />;
};
```

#### Code Review Checklist for Emoji Components

- [ ] Lazy loading implemented for performance
- [ ] Accessibility features properly implemented (ARIA labels, keyboard navigation)
- [ ] Theme integration follows shadcn/ui patterns
- [ ] SSR compatibility ensured
- [ ] TypeScript types properly defined
- [ ] Loading states provided
- [ ] Focus management implemented (for modal usage)
- [ ] Bundle size impact documented

For detailed emoji picker integration guidelines, see [Frimousse Emoji Picker Integration](./FRIMOUSSE_EMOJI_PICKER_INTEGRATION.md).

## 4. Backend Standards

### 4.1 NestJS Module Structure
```typescript
// modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User, UserSchema } from './schemas/user.schema';
import { EmailModule } from '@/modules/email';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

### 4.2 Service Layer Pattern
```typescript
// modules/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { EmailService } from '@/modules/email';
import type { CreateUserData, UpdateUserData, User } from './types';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async createUser(data: CreateUserData): Promise<User> {
    // Validate input data
    const validationResult = await this.validateUserData(data);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.error);
    }

    // Create user
    const user = await this.userRepository.create({
      ...data,
      id: generateId(),
      createdAt: new Date(),
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  private async validateUserData(data: CreateUserData): Promise<ValidationResult> {
    // Validation logic
  }
}
```

### 4.3 Repository Pattern
```typescript
// modules/user/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import type { CreateUserData, UpdateUserData, UserFilters } from './types';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(data: CreateUserData): Promise<User> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).lean().exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }

  async find(filters: UserFilters = {}): Promise<User[]> {
    const query = this.userModel.find();

    if (filters.workspaceId) {
      query.where('workspaces').in([filters.workspaceId]);
    }

    if (filters.role) {
      query.where('role').equals(filters.role);
    }

    return query.lean().exec();
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
```

### 4.4 GraphQL Schema
```typescript
// modules/user/user.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@/guards/auth.guard';
import { User, CreateUserInput, UpdateUserInput } from './dto';
import type { GraphQLContext } from '@/types';

@Resolver(() => User)
@UseGuards(AuthGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async user(
    @Args('id') id: string,
    @Context() context: GraphQLContext
  ): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Mutation(() => User)
  async createUser(
    @Args('input') input: CreateUserInput,
    @Context() context: GraphQLContext
  ): Promise<User> {
    return this.userService.createUser(input);
  }
}
```

## 5. Database Standards

### 5.1 MongoDB Schema Design
```typescript
// schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({
    type: [String],
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: ['editor'],
  })
  roles: string[];

  @Prop({ type: Object })
  profile?: {
    avatar?: string;
    timezone?: string;
    language?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ 'profile.timezone': 1 });
UserSchema.index({ roles: 1 });
```

### 5.2 Database Migrations
```typescript
// migrations/001-create-users.ts
export class CreateUsers001 {
  async up(db: Db): Promise<void> {
    await db.createCollection('users');
    
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { roles: 1 } },
      { key: { createdAt: -1 } }
    ]);
  }

  async down(db: Db): Promise<void> {
    await db.dropCollection('users');
  }
}
```

### 5.3 Query Optimization
```typescript
// Efficient aggregation pipelines
class CollectionService {
  async getCollectionsWithStats(workspaceId: string) {
    return this.collectionModel.aggregate([
      { $match: { workspace: new ObjectId(workspaceId) } },
      {
        $lookup: {
          from: 'records',
          localField: '_id',
          foreignField: 'collection',
          as: 'records',
        }
      },
      {
        $addFields: {
          recordCount: { $size: '$records' },
          lastUpdated: { $max: '$records.updatedAt' }
        }
      },
      {
        $project: {
          name: 1,
          schema: 1,
          recordCount: 1,
          lastUpdated: 1,
          createdAt: 1
        }
      }
    ]);
  }
}
```

## 6. Testing Standards

### 6.1 Unit Testing
```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { EmailService } from '@/modules/email';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
    emailService = module.get(EmailService);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };
      const expectedUser = { id: '1', ...userData };
      
      repository.create.mockResolvedValue(expectedUser);
      emailService.sendWelcomeEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          name: userData.name,
        })
      );
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        userData.email,
        userData.name
      );
    });
  });
});
```

### 6.2 Integration Testing
```typescript
// user.controller.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { DatabaseTestModule } from '@/test/database-test.module';

describe('UserController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        })
        .expect(201)
        .expect(res => {
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.name).toBe('Test User');
          expect(res.body.id).toBeDefined();
        });
    });
  });
});
```

### 6.3 Frontend Testing
```typescript
// components/UserForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserForm } from './UserForm';
import { userService } from '@/services';

// Mock the service
jest.mock('@/services', () => ({
  userService: {
    create: jest.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    renderWithProviders(
      <UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    renderWithProviders(
      <UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should submit valid form data', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    (userService.create as jest.Mock).mockResolvedValue(mockUser);

    renderWithProviders(
      <UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(mockUser);
    });
  });
});
```

## 7. Performance Standards

### 7.1 Performance Targets
- **API Response Time**: < 200ms for 95% of requests
- **Page Load Time**: < 2 seconds for initial load
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB for main bundle
- **Database Query Time**: < 100ms for simple queries

### 7.2 Optimization Techniques
```typescript
// Frontend optimizations
// 1. Code splitting
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// 2. Memoization
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});

// 3. Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

// 4. Debounced search
const debouncedSearch = useDebounce(searchTerm, 300);
```

```typescript
// Backend optimizations
// 1. Database indexing
UserSchema.index({ email: 1, workspace: 1 });

// 2. Caching
@Injectable()
export class CachedUserService {
  async getUserById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.userRepository.findById(id);
    await this.redis.setex(cacheKey, 300, JSON.stringify(user));
    
    return user;
  }
}

// 3. Connection pooling
MongooseModule.forRoot(connectionString, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

## 8. Security Standards

### 8.1 Authentication & Authorization
```typescript
// JWT token handling
@Injectable()
export class AuthService {
  generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = { sub: user.id, email: user.email };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}

// Permission guards
@Injectable()
export class WorkspaceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId;

    return this.userService.hasWorkspaceAccess(user.id, workspaceId);
  }
}
```

### 8.2 Input Validation
```typescript
// Data validation with Zod
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(128),
});

export type CreateUserData = z.infer<typeof CreateUserSchema>;

// Validation pipe
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}
```

### 8.3 Data Sanitization
```typescript
// HTML sanitization
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

// SQL injection prevention (for raw queries)
export function escapeString(str: string): string {
  return str.replace(/[\\"']/g, '\\$&');
}
```

## 9. Documentation Standards

### 9.1 Code Documentation
```typescript
/**
 * Creates a new user in the system.
 * 
 * @param userData - The user data to create
 * @param userData.email - User's email address (must be unique)
 * @param userData.name - User's full name
 * @param userData.password - User's password (will be hashed)
 * @returns Promise that resolves to the created user
 * 
 * @throws ValidationError When user data is invalid
 * @throws ConflictError When email already exists
 * 
 * @example
 * ```typescript
 * const user = await userService.createUser({
 *   email: 'john@example.com',
 *   name: 'John Doe',
 *   password: 'securePassword123'
 * });
 * ```
 */
async createUser(userData: CreateUserData): Promise<User> {
  // Implementation
}
```

### 9.2 API Documentation
```typescript
// OpenAPI decorators
@ApiOperation({ summary: 'Create a new user' })
@ApiResponse({ status: 201, description: 'User created successfully', type: User })
@ApiResponse({ status: 400, description: 'Invalid user data' })
@ApiResponse({ status: 409, description: 'Email already exists' })
@Post()
async createUser(@Body() userData: CreateUserData): Promise<User> {
  return this.userService.createUser(userData);
}
```

### 9.3 README Standards
Each module should include a README.md with:
- Purpose and responsibilities
- API documentation
- Usage examples
- Configuration options
- Testing instructions
- Troubleshooting guide

This comprehensive set of technical standards ensures consistency, quality, and maintainability across the Struktura project.