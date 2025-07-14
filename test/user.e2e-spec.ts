import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, disconnect } from 'mongoose';
import * as request from 'supertest';

import { AppModule } from '@/app/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let dbConnection: Connection;

  beforeEach(async () => {
    process.env.DB_CONNECTION_URI = 'mongodb://localhost:27017/crud-db-tests';

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

  let accessToken: string;
  let createdUserId: string;

  const email = 'admin@example.com';
  const password = '12345678';

  it('/auth/register (POST) - register an admin', async () => {
    const res = await request(server)
      .post('/auth/register')
      .field('email', email)
      .field('password', password)
      .field('username', 'AdminUser')
      .field('isAdmin', true)
      .expect(201);

    accessToken = res.body.accessToken;
    expect(accessToken).toBeDefined();
  });

  it('/user/total (GET) - total count', async () => {
    const res = await request(server)
      .get('/user/total')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('total');
    expect(typeof res.body.total).toBe('number');
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('/user/list (GET) - get all users', async () => {
    const res = await request(server)
      .get('/user/list?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    createdUserId = res.body[0].id;
  });

  it('/user/profile (GET) - get me by access token', async () => {
    const res = await request(server)
      .get('/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', email);
    expect(res.body).toHaveProperty('role', 'admin');
  });

  it('/user/:id - (GET)', async () => {
    const res = await request(server)
      .get(`/user/${createdUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', createdUserId);
  });

  it('/user/update/:id (PATCH) - updates user by id', async () => {
    const res = await request(server)
      .patch(`/user/update/${createdUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('username', 'UpdatedAdmin')
      .expect(200);

    expect(res.body).toHaveProperty('username', 'UpdatedAdmin');
  });

  it('/user/:id (DELETE) - deletes user by id', async () => {
    const res = await request(server)
      .delete(`/user/${createdUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toEqual({ message: 'User deleted successfuly' });
  });

  it("/user/total (GET) - don't have rights", async () => {
    const res = await request(server)
      .post('/auth/register')
      .field('email', 'user@example.com')
      .field('password', password)
      .field('username', 'NormalUser')
      .field('isAdmin', false)
      .expect(201);

    const userToken = res.body.accessToken;

    await request(server)
      .get('/user/total')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('/user/total (GET) - no token provided', async () => {
    await request(server).get('/user/total').expect(401);
  });
});
