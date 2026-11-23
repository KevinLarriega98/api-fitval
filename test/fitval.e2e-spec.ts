import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request from 'supertest';
import type { App } from 'supertest/types';
import { configureApp } from '../src/app.config';
import { AppModule } from '../src/app.module';

describe('API de FitVal', () => {
  let app: INestApplication<App>;
  let memberToken: string;
  let memberEmail: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    memberEmail = `test-${Date.now()}@fitval.com`;
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: memberEmail, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: memberEmail, password })
      .expect(200);

    const loginBody = loginResponse.body as { accessToken: string };
    expect(loginBody.accessToken).toEqual(expect.any(String));
    memberToken = loginBody.accessToken;
  });

  afterAll(async () => {
    await app.get(Pool).end();
    await app.close();
  });

  it('GET /api/v1/health responde 200', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'fitval' });
  });

  it('GET /api/v1/classes responde 200 y un array', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/classes');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/v1/classes/abc responde 400', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/classes/abc',
    );

    expect(response.status).toBe(400);
  });

  it('GET /api/v1/classes/999999 responde 404', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/classes/999999',
    );

    expect(response.status).toBe(404);
  });

  it('POST /api/v1/classes sin token responde 401', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/classes');

    expect(response.status).toBe(401);
  });

  it('POST /api/v1/auth/login con contraseña incorrecta responde 401', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: memberEmail, password: 'noexiste' });

    expect(response.status).toBe(401);
  });

  it('POST /api/v1/classes con token de socio responde 403', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/classes')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(403);
  });

  it('GET /api/v2/classes devuelve una página con 3 clases', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v2/classes?page=1&limit=3')
      .expect(200);

    const body = response.body as {
      data: unknown[];
      page: number;
      limit: number;
    };

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(3);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(3);
  });

  it('GET /api/v2/classes con limit=100 responde 400', async () => {
    await request(app.getHttpServer())
      .get('/api/v2/classes?limit=100')
      .expect(400);
  });

  it('los errores 404 incluyen path y timestamp', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/classes/999999')
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('path', '/api/v1/classes/999999');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('las respuestas no incluyen x-powered-by', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/plans')
      .expect(200);

    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('GET /api/v1/trainers/1 devuelve sus especialidades', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/trainers/1')
      .expect(200);

    expect(response.body).toHaveProperty('specialties', [
      'Ciclo indoor',
      'Fuerza',
    ]);
  });
});
