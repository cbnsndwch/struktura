import type {
    IWorkspaceLoader,
    WorkspaceLoaderData,
    CreateWorkspaceLoaderInput
} from '@cbnsndwch/struktura-workspace-contracts';

import type { WorkspaceService } from './workspace.service.js';

/**
 * Converts a Mongoose workspace document to a plain JSON object for RR7 serialization.
 */
export function toWorkspaceLoaderData(doc: {
    toJSON(): Record<string, unknown>;
}): WorkspaceLoaderData {
    const json = doc.toJSON();
    return {
        id:
            (json._id as { toString(): string })?.toString() ??
            (json.id as string),
        name: json.name as string,
        slug: json.slug as string,
        description: json.description as string | undefined,
        owner:
            (json.owner as { _id?: { toString(): string } })?._id?.toString() ??
            (json.owner as { toString(): string })?.toString() ??
            '',
        members:
            (
                json.members as Array<{
                    user?: { _id?: { toString(): string } };
                    role: string;
                    invitedAt: Date | string;
                    joinedAt?: Date | string;
                }>
            )?.map(m => ({
                user: m.user?._id?.toString() ?? '',
                role: m.role as 'owner' | 'admin' | 'editor' | 'viewer',
                invitedAt:
                    m.invitedAt instanceof Date
                        ? m.invitedAt.toISOString()
                        : (m.invitedAt as string),
                joinedAt:
                    m.joinedAt instanceof Date
                        ? m.joinedAt.toISOString()
                        : (m.joinedAt as string | undefined)
            })) ?? [],
        settings: {
            timezone:
                (json.settings as { defaultTimezone?: string })
                    ?.defaultTimezone ?? 'UTC',
            dateFormat: 'YYYY-MM-DD',
            numberFormat: 'en-US',
            defaultLanguage:
                (json.settings as { defaultLanguage?: string })
                    ?.defaultLanguage ?? 'en',
            features: {
                apiAccess:
                    (
                        json.settings as {
                            features?: { apiAccess?: boolean };
                        }
                    )?.features?.apiAccess ?? false,
                realTimeSync:
                    (
                        json.settings as {
                            features?: { realTimeSync?: boolean };
                        }
                    )?.features?.realTimeSync ?? true,
                advancedPermissions:
                    (
                        json.settings as {
                            features?: { advancedPermissions?: boolean };
                        }
                    )?.features?.advancedPermissions ?? false
            },
            branding: (json.settings as { branding?: object })?.branding as
                | {
                      logo?: string;
                      primaryColor?: string;
                      customDomain?: string;
                  }
                | undefined
        },
        createdAt:
            json.createdAt instanceof Date
                ? json.createdAt.toISOString()
                : (json.createdAt as string),
        updatedAt:
            json.updatedAt instanceof Date
                ? json.updatedAt.toISOString()
                : (json.updatedAt as string)
    };
}

/**
 * Creates an IWorkspaceLoader adapter from the NestJS WorkspaceService.
 * This bridges the boundary between Nest (SWC-built) and React Router (Vite-built).
 */
export function createWorkspaceLoader(
    workspaceService: WorkspaceService
): IWorkspaceLoader {
    return {
        async findAllForUser(userId: string): Promise<WorkspaceLoaderData[]> {
            const docs = await workspaceService.findAllForUser(userId);
            return docs.map(toWorkspaceLoaderData);
        },
        async create(
            input: CreateWorkspaceLoaderInput,
            ownerId: string
        ): Promise<WorkspaceLoaderData> {
            const doc = await workspaceService.create(input, ownerId);
            return toWorkspaceLoaderData(doc);
        }
    };
}
