import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';

const app = createApp();

describe('Analytics API', () => {
  let adminToken: string;
  let adminUser: any;
  let serviceA: any;
  let serviceB: any;
  const createdIncidentIds: string[] = [];

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const ts = Date.now();

    adminUser = await prisma.user.create({
      data: {
        name: 'Analytics Admin',
        email: `analytics_${ts}@incidentflow.dev`,
        passwordHash,
        role: 'ADMIN',
      },
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: adminUser.email,
      password: 'Password123!',
    });
    adminToken = loginRes.body.data.token;

    serviceA = await prisma.service.create({
      data: {
        name: `Analytics Svc A ${ts}`,
        description: 'Test svc A',
        ownerId: adminUser.id,
      },
    });

    serviceB = await prisma.service.create({
      data: {
        name: `Analytics Svc B ${ts}`,
        description: 'Test svc B',
        ownerId: adminUser.id,
      },
    });

    const past = new Date(Date.now() - 60 * 60 * 1000); // 60 mins ago
    const resolvedTime = new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago -> took 30 mins

    const inc1 = await prisma.incident.create({
      data: {
        title: 'Active Sev 1 Test Inc',
        description: 'Test description',
        severity: 'SEV_1',
        status: 'INVESTIGATING',
        serviceId: serviceA.id,
        reporterId: adminUser.id,
      },
    });
    createdIncidentIds.push(inc1.id);

    const inc2 = await prisma.incident.create({
      data: {
        title: 'Resolved Sev 3 Test Inc',
        description: 'Test description',
        severity: 'SEV_3',
        status: 'RESOLVED',
        serviceId: serviceB.id,
        reporterId: adminUser.id,
        startedAt: past,
        resolvedAt: resolvedTime,
      },
    });
    createdIncidentIds.push(inc2.id);
  });

  afterAll(async () => {
    await prisma.incident.deleteMany({
      where: { id: { in: createdIncidentIds } },
    });
    await prisma.service.deleteMany({
      where: { id: { in: [serviceA.id, serviceB.id] } },
    });
    await prisma.user.deleteMany({ where: { id: adminUser.id } });
    await prisma.$disconnect();
  });

  it('should return overview analytics with accurate numbers', async () => {
    const res = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalIncidents).toBeGreaterThanOrEqual(2);
    expect(res.body.data.activeIncidents).toBeGreaterThanOrEqual(1);
    expect(res.body.data.criticalIncidents).toBeGreaterThanOrEqual(1);
    expect(res.body.data.servicesAffected).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.data.averageResolutionMinutes).toBe('number');
  });

  it('should return breakdowns by severity, status, and service', async () => {
    const res = await request(app)
      .get('/api/analytics/incidents')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bySeverity).toBeDefined();
    expect(res.body.data.bySeverity.SEV_1).toBeGreaterThanOrEqual(1);
    expect(res.body.data.byStatus).toBeDefined();
    expect(res.body.data.byStatus.INVESTIGATING).toBeGreaterThanOrEqual(1);
    expect(res.body.data.byStatus.RESOLVED).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data.byService)).toBe(true);
    expect(Array.isArray(res.body.data.volumeOverTime)).toBe(true);
  });
});
