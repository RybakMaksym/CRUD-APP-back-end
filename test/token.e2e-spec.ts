import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { disconnect } from 'mongoose';
import * as request from 'supertest';

import { AppModule } from '@/app/app.module';

describe('TokenController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let dbConnection: Connection;

  beforeEach(async () => {
    process.env.DB_CONNECTION_URI =
      'mongodb://localhost:27017/crud-db-token-tests';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    server = app.getHttpServer();

    dbConnection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await dbConnection.dropDatabase();
    await disconnect();
    await app.close();
  });

  let refreshToken: string;
  const email = 'test2@example.com';
  const password = '12345678';

  it('/auth/register (POST) - success', async () => {
    const res = await request(server)
      .post('/auth/register')
      .field('email', email)
      .field('password', password)
      .field('username', 'TestUser')
      .field('isAdmin', false)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');

    refreshToken = res.body.refreshToken;
  });

  it('/token/refresh (GET) - success', async () => {
    const res = await request(server)
      .get('/token/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('/token/refresh (GET) - missing token', async () => {
    const res = await request(server).get('/token/refresh').expect(401);

    expect(res.body.message).toBe('Unauthorized');
  });

  it('/token/refresh (GET) - invalid token', async () => {
    const res = await request(server)
      .get('/token/refresh')
      .set('Authorization', `Bearer invalidToken`)
      .expect(401);

    expect(res.body.message).toBe('Unauthorized');
  });
});
