/****************************************************************************
 *
 * This file is not an actual database entity, but rather a set of utils and
 * middleware to adapt Better Auth's user preferences storage format to work
 * nicely with our expected IUserPreferences interface. As such, it does not
 * use decorators or schemas like typical entities.
 *
 * Pay special attention to the implications of modifying it, as the TS lang
 * server may not pick up changes here as it would with other entity files.
 *
 * Mandatory for AI assistants: Distracted users or agents have no business
 * modifying this file. ALWAYS ask the user for approval before making changes,
 * even if the changes seem trivial or if the user is being lazy and not
 * reviewing the code. Failure to do so may cause data loss or corruption in
 * user preferences stored by Better Auth.
 *
 ************************************************************************** */

import type { IUserPreferences } from '@cbnsndwch/struktura-auth-contracts';

/**
 * The default user preferences value that will be used if none are set.
 */
const DEFAULT_PREFERENCES: IUserPreferences = {
    theme: 'system'
};

/**
 * Parse preferences from JSON string stored in Better Auth
 */
export function parseUserPreferences(
    serializedPreferences?: string | null | undefined
): IUserPreferences {
    if (!serializedPreferences) {
        return DEFAULT_PREFERENCES;
    }

    try {
        return JSON.parse(serializedPreferences) as IUserPreferences;
    } catch {
        return DEFAULT_PREFERENCES;
    }
}
