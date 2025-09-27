// Workspace domain - Clean exports following auth pattern

// Entities
export * from './entities/index.js';

// Services
export * from './services/index.js';

// Module
export { WorkspaceModule } from './workspace.module.js';

// Controllers
export { WorkspaceController } from './controllers/workspace.controller.js';

// Guards
export { WorkspaceGuard, WorkspaceRoles } from './guards/index.js';

// DTOs
export * from './dto/index.js';

// Resolvers
export { WorkspaceResolver } from './resolvers/workspace.resolver.js';
