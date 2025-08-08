import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { disconnect } from 'mongoose';
import * as request from 'supertest';

import { AppModule } from '@/app/app.module';

describe('Profiles flow', () => {
  let app: INestApplication;
  let server: any;
  let dbConnection: Connection;

  let accessToken: string;
  let profileId: string;
  let userId: string;

  beforeAll(async () => {
    process.env.DB_CONNECTION_URI =
      'mongodb://localhost:27017/test-e2e-profile';

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

    const registerRes = await request(server).post('/auth/register').send({
      email: 'test@example.com',
      username: 'TestUser',
      password: 'Password123!',
    });
    userId = registerRes.body.user.id;

    const loginResponse = await request(server).post('/auth/log-in').send({
      email: 'test@example.com',
      password: 'Password123!',
    });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await dbConnection.dropDatabase();
    await disconnect();
    await app.close();
  });

  it('/profile/create/:id (POST) - create profile', async () => {
    const res = await request(server)
      .post(`/profile/create/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John',
        gender: 'male',
        birthDate: '1990-01-01',
        country: 'Ukraine',
        city: 'Kyiv',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('John');

    profileId = res.body.id;
  });

  it('/profile/my-profiles (GET)', async () => {
    const res = await request(server)
      .get('/profile/my-profiles')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('/profile/profiles/:id (GET) - get profiles by user id', async () => {
    const res = await request(server)
      .get(`/profile/profiles/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('/profile/update/:id (PATCH)', async () => {
    const res = await request(server)
      .patch(`/profile/update/${profileId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'UpdatedName',
        city: 'Lviv',
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('UpdatedName');
    expect(res.body.city).toBe('Lviv');
  });

  it('/profile/search (GET)', async () => {
    const res = await request(server)
      .get(`/profile/search?query=Updated`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/profile/suggestions (GET)', async () => {
    const res = await request(server)
      .get('/profile/suggestions?field=city&query=L')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/profile/filter (GET)', async () => {
    const res = await request(server)
      .get('/profile/filter?field=city&query=Lviv')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/profile/stats (GET)', async () => {
    const res = await request(server)
      .get('/profile/stats')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalUsers');
    expect(res.body).toHaveProperty('totalProfiles');
    expect(res.body).toHaveProperty('totalAdults');
  });

  it('/profile/:id (DELETE)', async () => {
    const res = await request(server)
      .delete(`/profile/${profileId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Profile deleted successfuly' });
  });

  it('/profile/my-profiles (GET) - should be empty', async () => {
    const res = await request(server)
      .get('/profile/my-profiles')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});
