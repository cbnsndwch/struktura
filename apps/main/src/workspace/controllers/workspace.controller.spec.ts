import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

import type { WorkspaceService } from '../services/workspace.service.js';
import { CreateWorkspaceDto, WorkspaceRole } from '../dto/index.js';

import { WorkspaceController } from './workspace.controller.js';

describe('WorkspaceController', () => {
    let controller: WorkspaceController;
    let mockWorkspaceService: {
        create: ReturnType<typeof vi.fn>;
        findAllForUser: ReturnType<typeof vi.fn>;
        findOne: ReturnType<typeof vi.fn>;
        findBySlug: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        updateSettings: ReturnType<typeof vi.fn>;
        remove: ReturnType<typeof vi.fn>;
        inviteMember: ReturnType<typeof vi.fn>;
        updateMemberRole: ReturnType<typeof vi.fn>;
        removeMember: ReturnType<typeof vi.fn>;
        getUserRole: ReturnType<typeof vi.fn>;
    };

    const mockWorkspace = {
        id: 'workspace-id',
        name: 'Test Workspace',
        slug: 'test-workspace',
        description: 'Test Description',
        owner: 'user-id',
        members: [],
        settings: {
            timezone: 'UTC',
            dateFormat: 'YYYY-MM-DD',
            numberFormat: 'en-US'
        }
    };

    const mockRequest = {
        user: {
            sub: 'user-id',
            email: 'test@example.com'
        }
    };

    beforeEach(() => {
        mockWorkspaceService = {
            create: vi.fn(),
            findAllForUser: vi.fn(),
            findOne: vi.fn(),
            findBySlug: vi.fn(),
            update: vi.fn(),
            updateSettings: vi.fn(),
            remove: vi.fn(),
            inviteMember: vi.fn(),
            updateMemberRole: vi.fn(),
            removeMember: vi.fn(),
            getUserRole: vi.fn()
        };

        // Create the controller with the mocked service
        controller = new WorkspaceController(
            mockWorkspaceService as unknown as WorkspaceService
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new workspace', async () => {
            const createWorkspaceDto: CreateWorkspaceDto = {
                name: 'Test Workspace',
                description: 'Test Description'
            };

            mockWorkspaceService.create.mockResolvedValue(mockWorkspace);

            const result = await controller.create(
                createWorkspaceDto,
                mockRequest
            );

            expect(mockWorkspaceService.create).toHaveBeenCalledWith(
                createWorkspaceDto,
                mockRequest.user.sub
            );
            expect(result).toEqual(mockWorkspace);
        });
    });

    describe('findAll', () => {
        it('should return all workspaces for the user', async () => {
            const workspaces = [mockWorkspace];
            mockWorkspaceService.findAllForUser.mockResolvedValue(workspaces);

            const result = await controller.findAll(mockRequest);

            expect(mockWorkspaceService.findAllForUser).toHaveBeenCalledWith(
                mockRequest.user.sub
            );
            expect(result).toEqual(workspaces);
        });
    });

    describe('findOne', () => {
        it('should return a workspace by ID', async () => {
            const workspaceId = 'workspace-id';
            mockWorkspaceService.findOne.mockResolvedValue(mockWorkspace);

            const result = await controller.findOne(workspaceId);

            expect(mockWorkspaceService.findOne).toHaveBeenCalledWith(workspaceId);
            expect(result).toEqual(mockWorkspace);
        });
    });

    describe('getUserRole', () => {
        it('should return user role in workspace', async () => {
            const workspaceId = 'workspace-id';
            mockWorkspaceService.getUserRole.mockResolvedValue(
                WorkspaceRole.OWNER
            );

            const result = await controller.getUserRole(
                workspaceId,
                mockRequest
            );

            expect(mockWorkspaceService.getUserRole).toHaveBeenCalledWith(
                workspaceId,
                mockRequest.user.sub
            );
            expect(result).toEqual(WorkspaceRole.OWNER);
        });
    });
});
