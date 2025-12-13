// Main NestJS services - Preferences uses Better Auth's ba_user collection
export {
    PreferencesService,
    MONGODB_DATABASE,
    type PreferencesUser
} from './preferences.service.js';

// Hash service for password operations
export * from './hash.service.js';

// Contract-based services (alternative implementations)
export { AuthContractService } from './auth.contract.service.js';

// External contracts
export * from '../../../contracts/src/services/password-service.contract.js';

// Legacy auth service is deprecated - use Better Auth instead
// Files renamed to *.deprecated.ts and preserved for reference
