import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/challenge — returns challenge and transaction', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/challenge')
      .send({ publicKey: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37' })
      .expect(201);

    expect(res.body.challenge).toBeDefined();
  });

  it('POST /api/auth/challenge — rejects missing publicKey', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/challenge')
      .send({})
      .expect(400);
  });

  it('GET /api/farmers/me — rejects unauthenticated', async () => {
    await request(app.getHttpServer())
      .get('/api/farmers/me')
      .expect(401);
  });

  it('GET /api/marketplace — public endpoint returns 200', async () => {
    await request(app.getHttpServer())
      .get('/api/marketplace')
      .expect(200);
  });
});
