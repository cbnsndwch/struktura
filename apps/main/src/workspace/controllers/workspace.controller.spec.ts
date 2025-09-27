import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

import { WorkspaceService } from '../services/workspace.service.js';
import { CreateWorkspaceDto, WorkspaceRole } from '../dto/index.js';

import { WorkspaceController } from './workspace.controller.js';

describe('WorkspaceController', () => {
    let controller: WorkspaceController;
    let service: WorkspaceService;

    const mockWorkspaceService = {
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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WorkspaceController],
            providers: [
                {
                    provide: WorkspaceService,
                    useValue: mockWorkspaceService
                }
            ]
        }).compile();

        controller = module.get<WorkspaceController>(WorkspaceController);
        service = module.get<WorkspaceService>(WorkspaceService);
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

            expect(service.create).toHaveBeenCalledWith(
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

            expect(service.findAllForUser).toHaveBeenCalledWith(
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

            expect(service.findOne).toHaveBeenCalledWith(workspaceId);
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

            expect(service.getUserRole).toHaveBeenCalledWith(
                workspaceId,
                mockRequest.user.sub
            );
            expect(result).toEqual(WorkspaceRole.OWNER);
        });
    });
});
