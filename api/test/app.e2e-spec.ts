import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('SUPSTAR API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const email =
    `supstar-test-${Date.now()}@example.com`;

  const password =
    'TestPassword123!';

  let accessToken = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [
          AppModule,
        ],
      }).compile();

    app =
      moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource =
      app.get(DataSource);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.query(
        'DELETE FROM "users" WHERE "email" = $1',
        [email],
      );
    }

    await app.close();
  });

  it('GET /api/health', async () => {
    const response =
      await request(
        app.getHttpServer(),
      )
        .get('/api/health')
        .expect(200);

    expect(
      response.body,
    ).toEqual(
      expect.objectContaining({
        status: 'ok',
      }),
    );
  });

  it('refuse une route protégée sans JWT', async () => {
    await request(
      app.getHttpServer(),
    )
      .get('/api/auth/me')
      .expect(401);
  });

  it('POST /api/auth/register', async () => {
    const response =
      await request(
        app.getHttpServer(),
      )
        .post('/api/auth/register')
        .send({
          email,
          password,
          displayName:
            'Utilisateur Test',
        })
        .expect(201);

    expect(
      response.body.accessToken,
    ).toEqual(
      expect.any(String),
    );

    expect(
      response.body.user.email,
    ).toBe(email);

    accessToken =
      response.body.accessToken;
  });

  it('POST /api/auth/login', async () => {
    const response =
      await request(
        app.getHttpServer(),
      )
        .post('/api/auth/login')
        .send({
          email,
          password,
        })
        .expect(200);

    expect(
      response.body.accessToken,
    ).toEqual(
      expect.any(String),
    );

    accessToken =
      response.body.accessToken;
  });

  it('GET /api/auth/me avec JWT', async () => {
    const response =
      await request(
        app.getHttpServer(),
      )
        .get('/api/auth/me')
        .set(
          'Authorization',
          `Bearer ${accessToken}`,
        )
        .expect(200);

    expect(
      response.body.email,
    ).toBe(email);

    expect(
      response.body.displayName,
    ).toBe(
      'Utilisateur Test',
    );
  });
});
