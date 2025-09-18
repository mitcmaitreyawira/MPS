/// <reference types="jest" />
/* eslint-env jest */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/database/schemas/user.schema';
import cookieParser from 'cookie-parser';

// Force cookie domain to match supertest host (127.0.0.1) so cookies are accepted/sent
process.env.COOKIE_DOMAIN = '127.0.0.1';

function getCookieNameValue(setCookieLine?: string): string | undefined {
  if (!setCookieLine) return undefined;
  const semi = setCookieLine.indexOf(';');
  return semi === -1 ? setCookieLine : setCookieLine.slice(0, semi);
}

/**
 * Dashboards (e2e)
 *
 * This test verifies that the dashboards endpoints work with cookie-based auth
 * and that our CurrentUser decorator injection does not trigger validation
 * errors on the global ValidationPipe (regression protection for the issue
 * where using the full UserDocument in the controller parameter caused 400s).
 */
describe('Dashboards (e2e)', () => {
  let app: INestApplication;
  let userModel: any;

  const adminEmail = 'admin-e2e@example.com';
  const adminPassword = 'Admin@12345';
  const studentEmail = 'student-e2e@example.com';
  const studentPassword = 'Student@12345';
  const teacherEmail = 'teacher-e2e@example.com';
  const teacherPassword = 'Teacher@12345';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Register cookie parser so guards can read JWT from cookies
    app.use(cookieParser());
    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));

    await userModel.create({
      email: adminEmail,
      password: adminPassword,
      firstName: 'E2E',
      lastName: 'Admin',
      roles: ['admin'],
    });

    await userModel.create({
      email: studentEmail,
      password: studentPassword,
      firstName: 'E2E',
      lastName: 'Student',
      roles: ['student'],
    });
    await userModel.create({
      email: teacherEmail,
      password: teacherPassword,
      firstName: 'E2E',
      lastName: 'Teacher',
      roles: ['teacher'],
    });
  });

  afterAll(async () => {
    if (userModel) {
      await userModel.deleteMany({ email: { $in: [adminEmail, studentEmail, teacherEmail] } });
    }
    await app.close();
  });

  it('should reject unauthenticated access to /dashboards/admin', async () => {
    await request(app.getHttpServer())
      .get('/dashboards/admin')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should reject access with malformed access_token cookie', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards/admin')
      .set('Cookie', 'access_token=malformed.jwt.token')
      .expect(HttpStatus.UNAUTHORIZED);

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should allow admin to access /dashboards/admin via cookie-based auth (CSRF + JWT cookie)', async () => {
    const agent = request.agent(app.getHttpServer());

    const healthRes = await agent.get('/health').expect(HttpStatus.OK);
    const setCookie = healthRes.headers['set-cookie'] || [];
    const csrfCookie = (Array.isArray(setCookie) ? setCookie : [setCookie])
      .map((c: string) => c || '')
      .find((c: string) => c.startsWith('csrf_token=')) || '';
    const csrfToken = csrfCookie.replace(/^csrf_token=([^;]+).*$/, '$1');

    const loginRes = await agent
      .post('/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: adminEmail, password: adminPassword });

    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(loginRes.status);

    const loginSetCookie = loginRes.headers['set-cookie'] || [];
    const cookiesArray = (Array.isArray(loginSetCookie) ? loginSetCookie : [loginSetCookie]) as string[];
    const accessTokenSetCookie = cookiesArray.find((c) => typeof c === 'string' && c.startsWith('access_token='));
    const accessTokenCookie = getCookieNameValue(accessTokenSetCookie);
    expect(Boolean(accessTokenCookie)).toBe(true);

    const adminRes = await agent
      .get('/dashboards/admin')
      .set('Cookie', accessTokenCookie as string)
      .expect(HttpStatus.OK);

    expect(adminRes.body).toHaveProperty('success', true);
    expect(adminRes.body).toHaveProperty('data');
    const data = adminRes.body.data;
    expect(typeof data).toBe('object');
  });

  it('should allow student to access /dashboards/student via cookie-based auth (CSRF + JWT cookie)', async () => {
    const agent = request.agent(app.getHttpServer());

    const healthRes = await agent.get('/health').expect(HttpStatus.OK);
    const setCookie = healthRes.headers['set-cookie'] || [];
    const csrfCookie = (Array.isArray(setCookie) ? setCookie : [setCookie])
      .map((c: string) => c || '')
      .find((c: string) => c.startsWith('csrf_token=')) || '';
    const csrfToken = csrfCookie.replace(/^csrf_token=([^;]+).*$/, '$1');

    const loginRes = await agent
      .post('/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: studentEmail, password: studentPassword });

    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(loginRes.status);

    const loginSetCookie = loginRes.headers['set-cookie'] || [];
    const cookiesArray = (Array.isArray(loginSetCookie) ? loginSetCookie : [loginSetCookie]) as string[];
    const accessTokenSetCookie = cookiesArray.find((c) => typeof c === 'string' && c.startsWith('access_token='));
    const accessTokenCookie = getCookieNameValue(accessTokenSetCookie);
    expect(Boolean(accessTokenCookie)).toBe(true);

    const res = await agent
      .get('/dashboards/student')
      .set('Cookie', accessTokenCookie as string)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveProperty('success', true);
  });

  it('should forbid non-admin role from accessing /dashboards/admin', async () => {
    const agent = request.agent(app.getHttpServer());

    const healthRes = await agent.get('/health').expect(HttpStatus.OK);
    const setCookie = healthRes.headers['set-cookie'] || [];
    const csrfCookie = (Array.isArray(setCookie) ? setCookie : [setCookie])
      .map((c: string) => c || '')
      .find((c: string) => c.startsWith('csrf_token=')) || '';
    const csrfToken = csrfCookie.replace(/^csrf_token=([^;]+).*$/, '$1');

    const loginRes = await agent
      .post('/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: studentEmail, password: studentPassword });

    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(loginRes.status);

    const loginSetCookie = loginRes.headers['set-cookie'] || [];
    const cookiesArray = (Array.isArray(loginSetCookie) ? loginSetCookie : [loginSetCookie]) as string[];
    const accessTokenSetCookie = cookiesArray.find((c) => typeof c === 'string' && c.startsWith('access_token='));
    const accessTokenCookie = getCookieNameValue(accessTokenSetCookie);

    const res = await agent
      .get('/dashboards/admin')
      .set('Cookie', accessTokenCookie as string);

    expect([HttpStatus.FORBIDDEN, HttpStatus.UNAUTHORIZED]).toContain(res.status);
  });

  // Additional regression check for teacher route and CurrentUser injection
  it('should allow teacher to access /dashboards/teacher via cookie-based auth (CSRF + JWT cookie)', async () => {
    const agent = request.agent(app.getHttpServer());

    const healthRes = await agent.get('/health').expect(HttpStatus.OK);
    const setCookie = healthRes.headers['set-cookie'] || [];
    const csrfCookie = (Array.isArray(setCookie) ? setCookie : [setCookie])
      .map((c: string) => c || '')
      .find((c: string) => c.startsWith('csrf_token=')) || '';
    const csrfToken = csrfCookie.replace(/^csrf_token=([^;]+).*$/, '$1');

    const loginRes = await agent
      .post('/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: teacherEmail, password: teacherPassword });

    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(loginRes.status);

    const loginSetCookie = loginRes.headers['set-cookie'] || [];
    const cookiesArray = (Array.isArray(loginSetCookie) ? loginSetCookie : [loginSetCookie]) as string[];
    const accessTokenSetCookie = cookiesArray.find((c) => typeof c === 'string' && c.startsWith('access_token='));
    const accessTokenCookie = getCookieNameValue(accessTokenSetCookie);
    expect(Boolean(accessTokenCookie)).toBe(true);

    const res = await agent
      .get('/dashboards/teacher')
      .set('Cookie', accessTokenCookie as string)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveProperty('success', true);
    // Ensure no 400 Bad Request due to validation on CurrentUser parameter
    expect(res.status).not.toBe(HttpStatus.BAD_REQUEST);
  });
});