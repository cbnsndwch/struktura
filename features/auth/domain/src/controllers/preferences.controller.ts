/**
 * User Preferences Controller
 *
 * Handles custom user preferences stored as additional fields in Better Auth's user model.
 * Better Auth handles core authentication (sign-up, sign-in, sign-out, password reset).
 *
 * Preferences are stored in the ba_user collection as a JSON-stringified field.
 */
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Put,
    UseGuards
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import type { UserPreferences } from '@cbnsndwch/struktura-auth-contracts';

import {
    BetterAuthCurrentUser,
    BetterAuthUserId
} from '../decorators/better-auth-user.decorator.js';
import { UpdatePreferencesDto } from '../dto/index.js';
import {
    BetterAuthGuard,
    type BetterAuthUser
} from '../guards/better-auth.guard.js';
import {
    PreferencesService,
    type PreferencesUser
} from '../services/preferences.service.js';

@Controller('api/user')
@UseGuards(ThrottlerGuard, BetterAuthGuard)
export class PreferencesController {
    constructor(private preferencesService: PreferencesService) {}

    /**
     * Get user preferences
     */
    @Get('preferences')
    async getPreferences(
        @BetterAuthUserId() userId: string
    ): Promise<UserPreferences> {
        return this.preferencesService.getPreferences(userId);
    }

    /**
     * Update user preferences
     */
    @Put('preferences')
    @HttpCode(HttpStatus.OK)
    async updatePreferences(
        @BetterAuthUserId() userId: string,
        @Body() dto: UpdatePreferencesDto
    ): Promise<PreferencesUser> {
        return this.preferencesService.updatePreferences(userId, dto);
    }
}
