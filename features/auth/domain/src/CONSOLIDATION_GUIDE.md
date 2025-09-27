# Consolidated User Model Architecture

## Overview

This project demonstrates a **consolidated approach** to defining user models that eliminates redundancy between entities, DTOs, GraphQL types, and database schemas. Instead of maintaining separate files for each concern, we use a **single User class** with multiple decorators that serves all purposes.

## Architecture Benefits

### ✅ Before: Redundant Definitions

```typescript
// schemas/user.schema.ts - MongoDB schema
@Schema()
class User {
    @Prop() email: string;
}

// entities/user.entity.ts - Domain entity
class UserEntity {
    email: string;
}

// dto/register.dto.ts - Validation DTO
class RegisterDto {
    @IsEmail() email: string;
}

// graphql/user.type.ts - GraphQL type
@ObjectType()
class UserType {
    @Field() email: string;
}
```

### ✅ After: Single Source of Truth

```typescript
// models/user.model.ts - Everything in one place!
@Schema()
@ObjectType('User')
export class User implements IUser {
    @Prop({ required: true })
    @Field()
    @IsEmail()
    email!: string;
}
```

## How It Works

### 1. Multi-Decorator Pattern

Our `User` class uses multiple decorators simultaneously:

```typescript
@Schema({ timestamps: true }) // 🍃 Mongoose Schema
@ObjectType('User') // 🎯 GraphQL ObjectType
export class User implements IUser {
    // 🎭 Domain Contract

    @Prop({ required: true, unique: true }) // 🍃 MongoDB Property
    @Field() // 🎯 GraphQL Field
    @IsEmail() // ✅ Validation Rule
    email!: string;

    // Internal fields - NOT exposed in GraphQL (no @Field decorator)
    @Prop({ required: true })
    passwordHash!: string; // 🔒 Never exposed to API
}
```

### 2. Selective Field Exposure

**Key Pattern**: Control visibility by choosing which decorators to apply:

- **Public Fields**: `@Prop() + @Field() + @IsEmail()`
- **Internal Fields**: `@Prop()` only (no GraphQL exposure)
- **Computed Fields**: `@Field()` only (no database storage)

### 3. Specialized DTOs via Inheritance

Create focused DTOs that extend the base model:

```typescript
@InputType('RegisterInput')
export class RegisterDto extends PickType(User, ['email', 'name', 'timezone']) {
    @Field()
    @IsString()
    @MinLength(8)
    password!: string; // Only for registration
}
```

## Usage Examples

### GraphQL Resolver

```typescript
@Resolver(() => User)
export class UserResolver {
    @Query(() => User)
    async me(@CurrentUser() user: User): Promise<User> {
        return user; // Automatically maps to GraphQL schema
    }

    @Mutation(() => User)
    async register(@Args('input') input: RegisterDto): Promise<User> {
        // RegisterDto validates input, User defines output
        return this.authService.register(input);
    }
}
```

### Service Layer

```typescript
@Injectable()
export class AuthService {
    async findUser(email: string): Promise<User | null> {
        // Works as Mongoose model
        return this.userModel.findOne({ email }).lean();
    }

    createUser(data: RegisterDto): Promise<User> {
        // Validates with RegisterDto, stores as User schema
        const user = new this.userModel(data);
        return user.save();
    }
}
```

### REST Controller

```typescript
@Controller('users')
export class UserController {
    @Get('profile')
    async getProfile(@CurrentUser() user: User): Promise<User> {
        // User class provides both input validation and output serialization
        return user.toPublicData(); // Custom method for safe API responses
    }
}
```

## Migration Guide

### Step 1: Replace Schema References

```typescript
// ❌ Old way
import { User } from './schemas/user.schema';
import { UserEntity } from './entities/user.entity';

// ✅ New way
import { User } from './models/user.model';
```

### Step 2: Update DTO Imports

```typescript
// ❌ Old way
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// ✅ New way
import { RegisterDto, LoginDto } from './dto/auth.dto';
```

### Step 3: Simplify GraphQL Schema

```typescript
// ❌ Old way - separate GraphQL type definition needed

// ✅ New way - User class IS the GraphQL type
@Resolver(() => User)  // Points directly to consolidated User class
```

## Best Practices

### 1. Field Visibility Control

```typescript
export class User {
    // ✅ Public API field
    @Prop()
    @Field()
    @IsEmail()
    email!: string;

    // ✅ Internal only field
    @Prop() // No @Field() = not exposed in GraphQL
    passwordHash!: string;

    // ✅ GraphQL computed field
    @Field() // No @Prop() = not stored in DB
    get displayName(): string {
        return this.name || this.email;
    }
}
```

### 2. Validation Layers

```typescript
export class User {
    @Prop({ required: true })
    @Field()
    @IsEmail({}, { message: 'Invalid email format' }) // Client validation
    @Transform(({ value }) => value.toLowerCase()) // Data transformation
    email!: string;
}
```

### 3. Custom Methods

```typescript
export class User {
    // Domain methods
    toPublicData() {
        return { id: this.id, email: this.email, name: this.name };
    }

    static fromData(data: IUser): User {
        // Factory method for creating instances
    }
}
```

## Advanced Patterns

### Conditional GraphQL Fields

```typescript
@Field({ nullable: true })
@IsOptional()
timezone?: string;
```

### Role-Based Field Access

```typescript
@Field(() => [String])
@Authorized(['admin'])  // Only admins can query roles
roles!: string[];
```

### Custom Validation Groups

```typescript
@IsString({ groups: ['create'] })
@MinLength(8, { groups: ['create', 'update'] })
password!: string;
```

## File Structure

```
features/auth/domain/src/
├── models/
│   └── user.model.ts           # 🎯 Single source of truth
├── dto/
│   └── auth.dto.ts             # Specialized DTOs extending User
├── resolvers/
│   └── user.resolver.ts        # GraphQL resolvers using User directly
├── entities/                   # 📦 Legacy (can be removed)
├── schemas/                    # 📦 Legacy (can be removed)
└── index.ts                    # Exports consolidated User
```

## Testing Benefits

### Single Test Suite

```typescript
describe('User Model', () => {
    it('validates as DTO', () => {
        // Test class-validator decorators
    });

    it('maps to GraphQL', () => {
        // Test @Field decorators
    });

    it('saves to MongoDB', () => {
        // Test @Prop decorators
    });
});
```

This consolidated approach reduces maintenance overhead, eliminates sync issues between layers, and provides a single source of truth for your user data model across the entire application stack.
