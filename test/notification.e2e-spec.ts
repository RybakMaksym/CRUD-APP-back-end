import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { disconnect } from 'mongoose';
import * as request from 'supertest';

import { AppModule } from '@/app/app.module';
import { NotificationType } from '@/enums/notification.enums';

describe('Notification flow', () => {
  let app: INestApplication;
  let server: any;
  let dbConnection: Connection;

  let userAccessToken: string;
  let userId: string;
  let profileId: string;

  let adminAccessToken: string;

  beforeAll(async () => {
    process.env.DB_CONNECTION_URI =
      'mongodb://localhost:27017/test-notifications-e2e';

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

  it('Register user and check notifications (should be empty)', async () => {
    const res = await request(server).post('/auth/register').send({
      email: 'user@example.com',
      username: 'User',
      password: 'Password123!',
    });
    userId = res.body.user.id;
    userAccessToken = res.body.accessToken;

    const notifRes = await request(server)
      .get('/notification')
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.data).toEqual([]);
  });

  it('Create profile for user', async () => {
    const res = await request(server)
      .post(`/profile/create/${userId}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: 'John',
        gender: 'male',
        birthDate: '1990-01-01',
        country: 'Ukraine',
        city: 'Kyiv',
      });

    expect(res.status).toBe(201);
    profileId = res.body.id;
  });

  it('Register admin and update user profile', async () => {
    const res = await request(server).post('/auth/register').send({
      email: 'admin@example.com',
      username: 'AdminUser',
      password: 'Password123!',
      isAdmin: true,
    });
    adminAccessToken = res.body.accessToken;

    const patchRes = await request(server)
      .patch(`/profile/update/${profileId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'EditedByAdmin',
        city: 'Lviv',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.name).toBe('EditedByAdmin');
  });

  it('User should now have 1 notification', async () => {
    const notifRes = await request(server)
      .get('/notification')
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(notifRes.status).toBe(200);
    expect(Array.isArray(notifRes.body.data)).toBe(true);
    expect(notifRes.body.data.length).toBe(1);
    expect(notifRes.body.data[0]).toMatchObject({
      message: expect.stringContaining('was edited by AdminUser'),
      type: NotificationType.PROFILE_EDIT,
    });
  });
});
