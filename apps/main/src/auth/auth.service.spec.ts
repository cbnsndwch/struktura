/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock bcrypt module
vi.mock('bcrypt', () => ({
    compare: vi.fn(),
    hash: vi.fn(),
    genSalt: vi.fn()
}));

import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service.js';
import { RefreshToken } from './schemas/refresh-token.schema.js';
import { User } from './schemas/user.schema.js';

describe('AuthService', () => {
    let service: AuthService;
    let mockUserModel: any;
    let mockRefreshTokenModel: any;
    let mockJwtService: any;

    const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedPassword',
        emailVerified: true,
        roles: ['editor'],
        save: vi.fn()
    };

    beforeEach(async () => {
        mockUserModel = vi.fn().mockImplementation(() => ({
            save: vi.fn().mockResolvedValue({})
        }));

        mockUserModel.findOne = vi.fn();
        mockUserModel.findById = vi.fn();
        mockUserModel.updateMany = vi.fn();
        mockUserModel.create = vi.fn();

        mockRefreshTokenModel = vi.fn().mockImplementation(() => ({
            save: vi.fn().mockResolvedValue({})
        }));
        mockRefreshTokenModel.findOne = vi.fn();
        mockRefreshTokenModel.updateOne = vi.fn();
        mockRefreshTokenModel.updateMany = vi.fn();
        mockRefreshTokenModel.create = vi.fn();

        mockJwtService = {
            sign: vi.fn().mockReturnValue('mock-token')
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel
                },
                {
                    provide: getModelToken(RefreshToken.name),
                    useValue: mockRefreshTokenModel
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                }
            ]
        }).compile();

        service = module.get<AuthService>(AuthService);

        // Setup bcrypt mocks
        vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123'
            };

            mockUserModel.findOne.mockReturnValue({
                lean: vi.fn().mockResolvedValue(null)
            });

            const mockSave = vi.fn().mockResolvedValue({
                _id: 'newUserId',
                ...registerDto
            });

            // Mock the constructor call
            mockUserModel.mockImplementation(() => ({
                _id: 'newUserId',
                save: mockSave
            }));

            const result = await service.register(registerDto);

            expect(result).toEqual({
                message:
                    'Registration successful. Please check your email to verify your account.',
                userId: 'newUserId'
            });
            expect(mockUserModel.findOne).toHaveBeenCalledWith({
                email: registerDto.email
            });
        });

        it('should throw ConflictException if user already exists', async () => {
            const registerDto = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123'
            };

            mockUserModel.findOne.mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockUser)
            }); // User exists

            await expect(service.register(registerDto)).rejects.toThrow(
                ConflictException
            );
        });
    });

    describe('login', () => {
        it.skip('should login user with valid credentials (TODO: fix JWT service mock)', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123'
            };

            const userWithSave = {
                ...mockUser,
                emailVerified: true,
                save: vi.fn().mockResolvedValue(mockUser),
                lastLoginAt: new Date()
            };

            // Reset and setup mocks for this test specifically
            mockUserModel.findOne.mockResolvedValue(userWithSave);
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

            // Ensure JWT service has a clean mock
            mockJwtService.sign = vi.fn().mockReturnValue('mock-access-token');

            // Mock refresh token creation
            const mockRefreshTokenSave = vi.fn().mockResolvedValue({});
            mockRefreshTokenModel.mockImplementation(() => ({
                save: mockRefreshTokenSave
            }));

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(result.user.email).toBe(loginDto.email);
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
        });

        it('should throw UnauthorizedException for invalid credentials', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'wrong_password'
            };

            mockUserModel.findOne.mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });

        it('should throw UnauthorizedException if user not found', async () => {
            const loginDto = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            mockUserModel.findOne.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });

        it('should throw UnauthorizedException if email not verified', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123'
            };

            const unverifiedUser = {
                ...mockUser,
                emailVerified: false
            };

            mockUserModel.findOne.mockResolvedValue(unverifiedUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });

    describe('validateUser', () => {
        it('should return user if found', async () => {
            const userId = 'testUserId';
            mockUserModel.findById.mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockUser)
            });

            const result = await service.validateUser(userId);

            expect(result).toEqual(mockUser);
            expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
        });

        it('should return null if user not found', async () => {
            const userId = 'nonexistentUserId';
            mockUserModel.findById.mockReturnValue({
                lean: vi.fn().mockResolvedValue(null)
            });

            const result = await service.validateUser(userId);

            expect(result).toBeNull();
        });
    });
});
