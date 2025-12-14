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

import type {
    IUser,
    IUserPreferences
} from '@cbnsndwch/struktura-auth-contracts';

import { UserId } from '../decorators/index.js';
import { UpdatePreferencesDto } from '../dto/index.js';
import { BetterAuthGuard } from '../guards/index.js';
import { PreferencesService } from '../services/index.js';

/**
 * User Preferences Controller
 *
 * Handles custom user preferences stored as additional fields in Better Auth's user model.
 * Better Auth handles core authentication (sign-up, sign-in, sign-out, password reset).
 *
 * Preferences are stored in the ba_user collection as a JSON-stringified field.
 */
@Controller('api/user')
@UseGuards(ThrottlerGuard, BetterAuthGuard)
export class PreferencesController {
    constructor(private preferencesService: PreferencesService) {}

    /**
     * Get user preferences
     */
    @Get('preferences')
    async getPreferences(@UserId() userId: string): Promise<IUserPreferences> {
        return this.preferencesService.getPreferences(userId);
    }

    /**
     * Update user preferences
     */
    @Put('preferences')
    @HttpCode(HttpStatus.OK)
    async updatePreferences(
        @UserId() userId: string,
        @Body() dto: UpdatePreferencesDto
    ): Promise<IUser> {
        return this.preferencesService.updatePreferences(userId, dto);
    }
}
