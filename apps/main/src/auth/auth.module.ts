import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

// Schemas
import { User, UserSchema } from './schemas/user.schema.js';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema.js';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { GitHubStrategy } from './strategies/github.strategy.js';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
    imports: [
        // MongoDB schemas
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: RefreshToken.name, schema: RefreshTokenSchema },
        ]),
        
        // Passport
        PassportModule,
        
        // JWT configuration
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '15m' },
        }),
        
        // Rate limiting
        ThrottlerModule.forRoot([{
            name: 'short',
            ttl: 1000, // 1 second
            limit: 3, // 3 requests per second
        }, {
            name: 'medium',
            ttl: 60000, // 1 minute
            limit: 20, // 20 requests per minute for auth endpoints
        }]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        GoogleStrategy,
        GitHubStrategy,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}