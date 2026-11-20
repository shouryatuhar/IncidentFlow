import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

const app = createApp();

describe('Demo Lab API', () => {
  let demoToken: string;
  let regularToken: string;
  let regularUserId: string;
  let serviceName: string;
  const demoIncidentIds: string[] = [];
  let resetFixtureIds: string[] = [];
  const keyPrefix = `demo-api-test-${Date.now()}`;

  beforeAll(async () => {
    const demoLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@incidentflow.dev',
      password: 'Password123!',
    });
    demoToken = demoLogin.body.data.token;

    const regularPasswordHash = await bcrypt.hash('Password123!', 10);
    const regularUser = await prisma.user.create({
      data: {
        name: 'Regular Demo API Test User',
        email: `regular-demo-api-${Date.now()}@example.test`,
        passwordHash: regularPasswordHash,
        role: 'ENGINEER',
      },
    });
    regularUserId = regularUser.id;
    const regularLogin = await request(app).post('/api/auth/login').send({
      email: regularUser.email,
      password: 'Password123!',
    });
    regularToken = regularLogin.body.data.token;

    const service = await prisma.service.findUnique({ where: { name: 'Payment API' } });
    if (!service) throw new Error('Seeded Payment API service is required for Demo Lab tests');
    serviceName = service.name;
  });

  afterAll(async () => {
    if (demoIncidentIds.length) {
      await prisma.incident.deleteMany({ where: { id: { in: demoIncidentIds } } });
    }
    if (resetFixtureIds.length) {
      await prisma.incident.deleteMany({ where: { id: { in: resetFixtureIds } } });
    }
    if (regularUserId) await prisma.user.delete({ where: { id: regularUserId } });
    await prisma.$disconnect();
  });

  const alert = (idempotencyKey: string) => ({
    idempotencyKey,
    service: serviceName,
    severity: 'SEV_2',
  });

  it('requires authentication and rejects non-seeded accounts', async () => {
    const missingAuth = await request(app).post('/api/demo/alert').send(alert(`${keyPrefix}-auth`));
    expect(missingAuth.status).toBe(401);

    const regularAccount = await request(app)
      .post('/api/demo/alert')
      .set('Authorization', `Bearer ${regularToken}`)
      .send(alert(`${keyPrefix}-regular`));
    expect(regularAccount.status).toBe(403);
  });

  it('validates alert fields before invoking the webhook path', async () => {
    const response = await request(app)
      .post('/api/demo/alert')
      .set('Authorization', `Bearer ${demoToken}`)
      .send({ idempotencyKey: '', service: serviceName, severity: 'INVALID' });

    expect(response.status).toBe(400);
  });

  it('creates a demo incident, returns its request ID, and deduplicates a repeated key', async () => {
    const key = `${keyPrefix}-duplicate`;
    const first = await request(app)
      .post('/api/demo/alert')
      .set('Authorization', `Bearer ${demoToken}`)
      .send(alert(key));
    const second = await request(app)
      .post('/api/demo/alert')
      .set('Authorization', `Bearer ${demoToken}`)
      .send(alert(key));

    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ duplicate: false });
    expect(first.body.incidentId).toBeTruthy();
    expect(first.headers['x-request-id']).toBeTruthy();
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({
      incidentId: first.body.incidentId,
      duplicate: true,
    });

    demoIncidentIds.push(first.body.incidentId);
    const saved = await prisma.incident.findUnique({ where: { id: first.body.incidentId } });
    expect(saved?.isDemo).toBe(true);
    expect(saved?.sourceEventId).toContain(key);
  });

  it('creates exactly one demo incident for 50 concurrent retries sharing a key', async () => {
    const key = `${keyPrefix}-storm`;
    const responses = await Promise.all(
      Array.from({ length: 50 }, () => request(app)
        .post('/api/demo/alert')
        .set('Authorization', `Bearer ${demoToken}`)
        .send(alert(key)))
    );

    expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
    expect(responses.filter((response) => response.status === 200)).toHaveLength(49);
    const ids = new Set(responses.map((response) => response.body.incidentId));
    expect(ids.size).toBe(1);
    const [incidentId] = ids;
    demoIncidentIds.push(incidentId);
    expect(await prisma.incident.count({ where: { sourceEventId: `demo:${(await prisma.user.findUnique({ where: { email: 'admin@incidentflow.dev' } }))?.id}:${key}` } })).toBe(1);
  }, 30000);

  it('reset deletes demo incidents and preserves ordinary incidents', async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@incidentflow.dev' } });
    const service = await prisma.service.findUniqueOrThrow({ where: { name: serviceName } });
    const [demoFixture, regularFixture] = await Promise.all([
      prisma.incident.create({
        data: {
          title: 'Demo reset fixture', description: 'Created by Demo Lab reset test.', severity: 'SEV_4',
          serviceId: service.id, reporterId: user.id, isDemo: true,
        },
      }),
      prisma.incident.create({
        data: {
          title: 'Ordinary reset fixture', description: 'Must survive Demo Lab reset.', severity: 'SEV_4',
          serviceId: service.id, reporterId: user.id,
        },
      }),
    ]);
    resetFixtureIds = [demoFixture.id, regularFixture.id];

    const response = await request(app)
      .post('/api/demo/reset')
      .set('Authorization', `Bearer ${demoToken}`);

    expect(response.status).toBe(200);
    expect(response.body.deleted).toBeGreaterThanOrEqual(1);
    expect(await prisma.incident.findUnique({ where: { id: demoFixture.id } })).toBeNull();
    expect(await prisma.incident.findUnique({ where: { id: regularFixture.id } })).not.toBeNull();
  });
});
