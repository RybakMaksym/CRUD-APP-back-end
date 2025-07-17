import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { disconnect } from 'mongoose';
import * as request from 'supertest';

import { AppModule } from '@/app/app.module';

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let dbConnection: Connection;

  let accessToken: string;
  let profileId: string;

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

    await request(server).post('/auth/register').send({
      email: 'test@example.com',
      username: 'TestUser',
      password: 'Password123!',
    });

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

  it('/profile/create (POST) - create profile', async () => {
    const res = await request(server)
      .post('/profile/create')
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

  it('/profile/my-profiles (GET) - get user profiles', async () => {
    const res = await request(server)
      .get('/profile/my-profiles')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/profile/update/:id (PATCH) - update profile', async () => {
    const res = await request(server)
      .patch(`/profile/update/${profileId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
        city: 'Lviv',
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.city).toBe('Lviv');
  });

  it('/profile/:id (DELETE) - delete profile', async () => {
    const res = await request(server)
      .delete(`/profile/${profileId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Profile deleted successfuly' });
  });

  it('/profile/my-profiles (GET) - should return empty after delete', async () => {
    const res = await request(server)
      .get('/profile/my-profiles')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
