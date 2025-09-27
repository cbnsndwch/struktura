import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
    Collection,
    CollectionDocument,
    FieldType
} from '../schemas/collection.schema.js';

import { CollectionService } from './collection.service.js';

describe('CollectionService', () => {
    let service: CollectionService;
    let model: Model<CollectionDocument>;

    const mockCollection = {
        _id: 'collection-123',
        name: 'Test Collection',
        slug: 'test-collection',
        description: 'A test collection',
        workspace: 'workspace-123',
        createdBy: 'user-123',
        fields: [
            {
                id: 'name',
                name: 'Name',
                type: FieldType.TEXT,
                required: true,
                unique: false,
                validation: [],
                options: {},
                order: 0
            }
        ],
        status: 'draft',
        settings: {},
        save: vi.fn().mockResolvedValue(this)
    };

    const mockCollectionModel = vi
        .fn()
        .mockImplementation(() => mockCollection);
    Object.assign(mockCollectionModel, {
        find: vi.fn(),
        findOne: vi.fn(),
        findById: vi.fn(),
        deleteOne: vi.fn()
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CollectionService,
                {
                    provide: getModelToken(Collection.name),
                    useValue: mockCollectionModel
                }
            ]
        }).compile();

        service = module.get<CollectionService>(CollectionService);
        model = module.get<Model<CollectionDocument>>(
            getModelToken(Collection.name)
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new collection', async () => {
            const createCollectionDto = {
                name: 'Test Collection',
                workspace: '507f1f77bcf86cd799439011' // Valid ObjectId
            };

            mockCollectionModel.findOne.mockResolvedValue(null);
            mockCollection.save.mockResolvedValue(mockCollection);

            const result = await service.create(
                createCollectionDto,
                '507f1f77bcf86cd799439012'
            ); // Valid ObjectId

            expect(mockCollectionModel.findOne).toHaveBeenCalledWith({
                workspace: expect.any(Object),
                slug: 'test-collection'
            });
            expect(result).toEqual(mockCollection);
        });

        it('should throw ConflictException when slug already exists', async () => {
            const createCollectionDto = {
                name: 'Test Collection',
                workspace: '507f1f77bcf86cd799439011' // Valid ObjectId
            };

            mockCollectionModel.findOne.mockResolvedValue(mockCollection);

            await expect(
                service.create(createCollectionDto, '507f1f77bcf86cd799439012')
            ) // Valid ObjectId
                .rejects.toThrow(ConflictException);
        });
    });

    describe('findByWorkspace', () => {
        it('should find collections by workspace ID', async () => {
            const workspaceId = '507f1f77bcf86cd799439011'; // Valid ObjectId
            const collections = [mockCollection];

            mockCollectionModel.find.mockReturnValue({
                populate: vi.fn().mockReturnValue({
                    sort: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(collections)
                    })
                })
            });

            const result = await service.findByWorkspace(workspaceId);

            expect(mockCollectionModel.find).toHaveBeenCalledWith({
                workspace: expect.any(Object)
            });
            expect(result).toEqual(collections);
        });
    });

    describe('findById', () => {
        it('should find collection by ID', async () => {
            const collectionId = 'collection-123';

            mockCollectionModel.findById.mockReturnValue({
                populate: vi.fn().mockReturnValue({
                    populate: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(mockCollection)
                    })
                })
            });

            const result = await service.findById(collectionId);

            expect(mockCollectionModel.findById).toHaveBeenCalledWith(
                collectionId
            );
            expect(result).toEqual(mockCollection);
        });

        it('should throw NotFoundException when collection not found', async () => {
            const collectionId = 'non-existent';

            mockCollectionModel.findById.mockReturnValue({
                populate: vi.fn().mockReturnValue({
                    populate: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(null)
                    })
                })
            });

            await expect(service.findById(collectionId)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('addField', () => {
        it('should add a field to collection', async () => {
            const collectionId = 'collection-123';
            const newField = {
                id: 'email',
                name: 'Email',
                type: FieldType.EMAIL,
                required: true,
                unique: true,
                validation: [],
                options: {},
                order: 1
            };

            const collection = {
                ...mockCollection,
                fields: [mockCollection.fields[0]]
            };

            vi.spyOn(service, 'findById').mockResolvedValue(collection as any);
            collection.save = vi.fn().mockResolvedValue(collection);

            const result = await service.addField(
                collectionId,
                newField as any
            );

            expect(collection.fields).toHaveLength(2);
            expect(collection.fields[1]).toEqual(newField);
            expect(collection.save).toHaveBeenCalled();
        });

        it('should throw ConflictException when field ID already exists', async () => {
            const collectionId = 'collection-123';
            const duplicateField = {
                id: 'name', // Same as existing field
                name: 'Duplicate Name',
                type: FieldType.TEXT,
                required: false,
                unique: false,
                validation: [],
                options: {},
                order: 1
            };

            vi.spyOn(service, 'findById').mockResolvedValue(
                mockCollection as any
            );

            await expect(
                service.addField(collectionId, duplicateField as any)
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('updateField', () => {
        it('should update a field in collection', async () => {
            const collectionId = 'collection-123';
            const fieldId = 'name';
            const fieldUpdate = { required: false };

            const collection = {
                ...mockCollection,
                fields: [
                    {
                        ...mockCollection.fields[0],
                        required: true
                    }
                ]
            };

            vi.spyOn(service, 'findById').mockResolvedValue(collection as any);
            collection.save = vi.fn().mockResolvedValue(collection);

            await service.updateField(collectionId, fieldId, fieldUpdate);

            expect(collection.fields[0].required).toBe(false);
            expect(collection.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when field not found', async () => {
            const collectionId = 'collection-123';
            const fieldId = 'non-existent';
            const fieldUpdate = { required: false };

            vi.spyOn(service, 'findById').mockResolvedValue(
                mockCollection as any
            );

            await expect(
                service.updateField(collectionId, fieldId, fieldUpdate)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTemplates', () => {
        it('should return predefined collection templates', async () => {
            const templates = await service.getTemplates();

            expect(templates).toBeDefined();
            expect(templates.length).toBeGreaterThan(0);
            expect(templates[0]).toHaveProperty('id');
            expect(templates[0]).toHaveProperty('name');
            expect(templates[0]).toHaveProperty('fields');
        });

        it('should include project management template', async () => {
            const templates = await service.getTemplates();

            const projectTemplate = templates.find(
                t => t.id === 'project-management'
            );
            expect(projectTemplate).toBeDefined();
            expect(projectTemplate?.name).toBe('Project Management');
            expect(projectTemplate?.fields.length).toBeGreaterThan(0);
        });
    });
});
