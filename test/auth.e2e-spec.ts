import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { disconnect } from 'mongoose';
import * as request from 'supertest';

import { AppModule } from '@/app/app.module';

describe('Authorization flow', () => {
  let app: INestApplication;
  let server: any;
  let dbConnection: Connection;

  beforeEach(async () => {
    process.env.DB_CONNECTION_URI =
      'mongodb://localhost:27017/crud-db-auth-tests';

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
  const email = 'test1@example.com';
  const password = '12345678';

  it('/auth/register (POST) - bad request: invalid password', async () => {
    const res = await request(server)
      .post('/auth/register')
      .field('email', email)
      .field('password', '123456')
      .field('username', 'TestUser')
      .field('isAdmin', false)
      .expect(400);

    expect(res.body).toHaveProperty('message');
  });

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

  it('/auth/log-in (POST) - success', async () => {
    const res = await request(server)
      .post('/auth/log-in')
      .send({
        email,
        password,
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');

    refreshToken = res.body.refreshToken;
  });

  it('/auth/log-out (POST) - success', async () => {
    const res = await request(server)
      .post('/auth/log-out')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(201);

    expect(res.body).toEqual({ message: 'Logged out successfully' });
  });
});
