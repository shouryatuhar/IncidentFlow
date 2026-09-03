import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';

const app = createApp();

describe('Role-Based Access Control (RBAC)', () => {
  let adminToken: string;
  let engineerToken: string;
  let adminId: string;
  let engineerId: string;
  let createdServiceId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const ts = Date.now();

    const admin = await prisma.user.create({
      data: {
        name: 'RBAC Admin',
        email: `admin_${ts}@incidentflow.dev`,
        passwordHash,
        role: 'ADMIN',
      },
    });
    adminId = admin.id;

    const engineer = await prisma.user.create({
      data: {
        name: 'RBAC Engineer',
        email: `engineer_${ts}@incidentflow.dev`,
        passwordHash,
        role: 'ENGINEER',
      },
    });
    engineerId = engineer.id;

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: admin.email,
      password: 'Password123!',
    });
    adminToken = adminLogin.body.data.token;

    const engLogin = await request(app).post('/api/auth/login').send({
      email: engineer.email,
      password: 'Password123!',
    });
    engineerToken = engLogin.body.data.token;
  });

  afterAll(async () => {
    if (createdServiceId) {
      await prisma.service.deleteMany({ where: { id: createdServiceId } });
    }
    await prisma.user.deleteMany({
      where: { id: { in: [adminId, engineerId] } },
    });
    await prisma.$disconnect();
  });

  it('should reject unauthenticated request to /api/services', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(401);
  });

  it('should allow both Engineer and Admin to view services list', async () => {
    const engRes = await request(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${engineerToken}`);
    expect(engRes.status).toBe(200);
    expect(engRes.body.success).toBe(true);

    const adminRes = await request(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
  });

  it('should REJECT service creation by an Engineer with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        name: `Engineer Service ${Date.now()}`,
        description: 'Should not be allowed to create',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should ALLOW service creation by an Admin', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Admin Managed Service ${Date.now()}`,
        description: 'Authorized creation by platform admin',
        status: 'OPERATIONAL',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdServiceId = res.body.data.id;
  });

  it('should REJECT service deletion by an Engineer with 403 Forbidden', async () => {
    const res = await request(app)
      .delete(`/api/services/${createdServiceId}`)
      .set('Authorization', `Bearer ${engineerToken}`);

    expect(res.status).toBe(403);
  });

  it('should ALLOW service deletion by an Admin', async () => {
    const res = await request(app)
      .delete(`/api/services/${createdServiceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    createdServiceId = '';
  });
});
