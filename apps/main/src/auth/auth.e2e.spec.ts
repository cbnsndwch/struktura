import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AuthModule } from './auth.module.js';
import { User, UserSchema } from './schemas/user.schema.js';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema.js';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let mongoServer: MongoMemoryServer;
    let authToken: string;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUri),
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                    { name: RefreshToken.name, schema: RefreshTokenSchema },
                ]),
                PassportModule,
                JwtModule.register({
                    secret: 'test-secret',
                    signOptions: { expiresIn: '15m' },
                }),
                ThrottlerModule.forRoot([{
                    name: 'default',
                    ttl: 60000,
                    limit: 100,
                }]),
                AuthModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongoServer.stop();
    });

    describe('/auth/register (POST)', () => {
        it('should register a new user', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'password123',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.message).toContain('Registration successful');
                    expect(res.body.userId).toBeDefined();
                });
        });

        it('should fail with invalid email', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'invalid-email',
                    name: 'Test User',
                    password: 'password123',
                })
                .expect(400);
        });

        it('should fail with short password', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test2@example.com',
                    name: 'Test User',
                    password: '123',
                })
                .expect(400);
        });

        it('should fail if user already exists', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'password123',
                })
                .expect(409);
        });
    });

    describe('/auth/login (POST)', () => {
        beforeAll(async () => {
            // First verify the email (in a real scenario this would be done via email link)
            // For now, we'll manually verify the user in the database
            const mongoose = require('mongoose');
            const userModel = mongoose.model('User');
            await userModel.updateOne(
                { email: 'test@example.com' },
                { emailVerified: true }
            );
        });

        it('should login with valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                })
                .expect(200);

            expect(response.body.user).toBeDefined();
            expect(response.body.tokens.accessToken).toBeDefined();
            expect(response.body.tokens.refreshToken).toBeDefined();
            expect(response.body.user.email).toBe('test@example.com');

            // Store token for later tests
            authToken = response.body.tokens.accessToken;
        });

        it('should fail with invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                })
                .expect(401);
        });

        it('should fail with nonexistent user', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
                .expect(401);
        });
    });

    describe('/auth/profile (GET)', () => {
        it('should get user profile with valid token', () => {
            return request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.email).toBe('test@example.com');
                    expect(res.body.id).toBeDefined();
                });
        });

        it('should fail without token', () => {
            return request(app.getHttpServer())
                .get('/auth/profile')
                .expect(401);
        });

        it('should fail with invalid token', () => {
            return request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });

    describe('/auth/request-password-reset (POST)', () => {
        it('should request password reset', () => {
            return request(app.getHttpServer())
                .post('/auth/request-password-reset')
                .send({
                    email: 'test@example.com',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toContain('password reset link');
                });
        });

        it('should not reveal if email exists', () => {
            return request(app.getHttpServer())
                .post('/auth/request-password-reset')
                .send({
                    email: 'nonexistent@example.com',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toContain('password reset link');
                });
        });
    });
});