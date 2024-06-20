import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(TestService);
    logger = app.get(WINSTON_MODULE_PROVIDER);
  });

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteTestUser();
    });

    it('should rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: '',
          password: '',
          name: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should success to create user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data.username).toBe('test');
    });

    it('should failed to create user if username already exists', async () => {
      await testService.createTestUser();

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await testService.deleteTestUser();
      await testService.createTestUser();
    });

    it('should rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: '',
          password: '',
          name: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should success to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('GET /api/users/current', () => {
    beforeEach(async () => {
      await testService.deleteTestUser();
      await testService.createTestUser();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', 'wrong');

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
    });
  });

  describe('PATCH /api/users/current', () => {
    beforeEach(async () => {
      await testService.deleteTestUser();
      await testService.createTestUser();
    });

    it('should rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('Authorization', 'test')
        .send({
          name: '',
          password: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update username', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('Authorization', 'test')
        .send({
          name: 'test updated',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test updated');
    });

    it('should be able to update password', async () => {
      let response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('Authorization', 'test')
        .send({
          password: 'updated',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');

      response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'updated',
        });
      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('DELETE /api/users/current', () => {
    beforeEach(async () => {
      await testService.deleteTestUser();
      await testService.createTestUser();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/current')
        .set('Authorization', 'wrong');

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to logout', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/current')
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);

      const user = await testService.getUser();

      expect(user.token).toBeNull();
    });
  });
});
