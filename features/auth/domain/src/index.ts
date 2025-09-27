// Entities (consolidated Entity/GraphQL Type/API Schema classes)
export * from './entities/index.js';

// Services
export * from './services/index.js';

// Module
export { AuthModule } from './auth.module.js';

// Controllers
export { AuthController } from './controllers/auth.controller.js';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard.js';
export { RolesGuard } from './guards/roles.guard.js';

// Decorators
export {
    CurrentUser,
    CurrentUserId
} from './decorators/current-user.decorator.js';
export { Public } from './decorators/public.decorator.js';
export { Roles } from './decorators/roles.decorator.js';

// DTOs
export * from './dto/index.js';

// Schemas (now consolidated in models)
// Legacy exports - use models/user.model.js instead
// export { User, UserSchema } from './schemas/user.schema.js';
// export type { UserDocument } from './schemas/user.schema.js';
export {
    RefreshToken,
    RefreshTokenSchema
} from './entities/refresh-token.entity.js';
export type { RefreshTokenDocument } from './entities/refresh-token.entity.js';

// Strategies
export { JwtStrategy } from './strategies/jwt.strategy.js';
