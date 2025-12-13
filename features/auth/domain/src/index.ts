// Better Auth instance and utilities
export { createBetterAuth, getAuth } from './better-auth/index.js';
export type {
    Auth,
    Session as BetterAuthSessionType,
    User as BetterAuthUserType
} from './better-auth/index.js';

// Entities (consolidated Entity/GraphQL Type/API Schema classes)
// Note: User entity is deprecated for new code - use BetterAuthUser type instead
// Kept for backward compatibility with existing code (e.g., workspace service)
export * from './entities/index.js';

// Services
export {
    PreferencesService,
    MONGODB_DATABASE,
    type PreferencesUser
} from './services/preferences.service.js';

// Module
export { AuthModule } from './auth.module.js';

// Controllers
export { PreferencesController } from './controllers/preferences.controller.js';

// Resolvers
export { UserResolver, UserType } from './resolvers/user.resolver.js';

// Guards
export { BetterAuthGuard } from './guards/better-auth.guard.js';
export type {
    BetterAuthUser,
    BetterAuthSession,
    BetterAuthRequest
} from './guards/better-auth.guard.js';
export { RolesGuard } from './guards/roles.guard.js';

// Decorators
export {
    CurrentUser,
    CurrentUserId
} from './decorators/current-user.decorator.js';
export {
    BetterAuthCurrentUser,
    BetterAuthUserId,
    BetterAuthCurrentSession
} from './decorators/better-auth-user.decorator.js';
export { Public } from './decorators/public.decorator.js';
export { Roles } from './decorators/roles.decorator.js';

// DTOs
export { UpdatePreferencesDto } from './dto/index.js';
