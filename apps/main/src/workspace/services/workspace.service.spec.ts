import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema.js';
import { User, UserDocument } from '../../auth/schemas/user.schema.js';

import { WorkspaceService } from './workspace.service.js';

describe('WorkspaceService', () => {
    let service: WorkspaceService;

    const mockWorkspaceModel = {
        findOne: vi.fn(),
        findById: vi.fn(),
        find: vi.fn(),
        findByIdAndDelete: vi.fn()
    };

    const mockUserModel = {
        findOne: vi.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkspaceService,
                {
                    provide: getModelToken(Workspace.name),
                    useValue: mockWorkspaceModel
                },
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel
                }
            ]
        }).compile();

        service = module.get<WorkspaceService>(WorkspaceService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('findOne', () => {
        it('should throw BadRequestException for invalid ID', async () => {
            const invalidId = 'invalid-id';

            await expect(service.findOne(invalidId)).rejects.toThrow(
                BadRequestException
            );
        });

        it('should throw NotFoundException when workspace not found', async () => {
            const workspaceId = new Types.ObjectId().toString();

            mockWorkspaceModel.findById.mockReturnValue({
                populate: vi.fn().mockReturnValue({
                    populate: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(null)
                    })
                })
            });

            await expect(service.findOne(workspaceId)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('getUserRole', () => {
        it('should return null if workspace not found', async () => {
            const workspaceId = 'non-existent-workspace';
            const userId = 'user-id';

            mockWorkspaceModel.findById.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue(null)
                })
            });

            const result = await service.getUserRole(workspaceId, userId);

            expect(result).toBeNull();
        });
    });
});
