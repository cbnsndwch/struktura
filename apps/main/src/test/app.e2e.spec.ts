import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppTestModule } from './app-test.module.js';

describe('AppController (e2e)', () => {
    let app: INestApplication | undefined;
    let moduleFixture: TestingModule | undefined;

    beforeEach(async () => {
        try {
            moduleFixture = await Test.createTestingModule({
                imports: [AppTestModule]
            }).compile();

            app = moduleFixture.createNestApplication();
            await app.init();
        } catch (error) {
            console.error('Failed to initialize test app:', error);
            throw error;
        }
    }, 60000); // 60 second timeout for initialization

    afterEach(async () => {
        try {
            if (app) {
                await app.close();
            }
            if (moduleFixture) {
                await moduleFixture.close();
            }
        } catch (error) {
            console.error('Failed to cleanup test app:', error);
        } finally {
            app = undefined;
            moduleFixture = undefined;
        }
    }, 30000); // 30 second timeout for cleanup

    it('/ (GET)', () => {
        if (!app) {
            throw new Error('App not initialized');
        }

        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect(res => {
                expect(res.text).toContain('Welcome to Struktura');
                expect(res.text).toContain('test-123');
            });
    });

    it('/health (GET)', () => {
        if (!app) {
            throw new Error('App not initialized');
        }

        return request(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect(res => {
                expect(res.body).toHaveProperty('status', 'ok');
                expect(res.body).toHaveProperty('service', 'struktura-main');
                expect(res.body).toHaveProperty('database');
                expect(res.body.database).toHaveProperty('status');
                expect(res.body.database).toHaveProperty('readyState');
            });
    });

    it('/graphql (POST) - hello query', () => {
        if (!app) {
            throw new Error('App not initialized');
        }

        const query = `
            query {
                hello
            }
        `;

        return request(app.getHttpServer())
            .post('/graphql')
            .send({ query })
            .expect(200)
            .expect(res => {
                expect(res.body.data).toHaveProperty('hello');
                expect(res.body.data.hello).toBe(
                    'Hello from Struktura GraphQL API!'
                );
            });
    });

    it('/graphql (POST) - health query', () => {
        if (!app) {
            throw new Error('App not initialized');
        }

        const query = `
            query {
                health
            }
        `;

        return request(app.getHttpServer())
            .post('/graphql')
            .send({ query })
            .expect(200)
            .expect(res => {
                expect(res.body.data).toHaveProperty('health');
                expect(res.body.data.health).toBe('OK');
            });
    });
});
