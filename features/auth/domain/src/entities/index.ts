import type { ModelDefinition } from '@nestjs/mongoose';

import { User, UserSchema } from './user.entity.js';

export const authEntities: ModelDefinition[] = [
    { name: User.name, schema: UserSchema }
];

export * from './user.entity.js';
