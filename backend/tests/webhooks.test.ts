import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { ENV } from '../src/config/env';
import bcrypt from 'bcryptjs';

const app = createApp();

describe('Webhook Ingress API', () => {
  let adminUser: any;
  let paymentService: any;
  let createdIncidentId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const ts = Date.now();

    adminUser = await prisma.user.create({
      data: {
        name: 'Webhook Test Admin',
        email: `webhook_admin_${ts}@incidentflow.dev`,
        passwordHash,
        role: 'ADMIN',
      },
    });

    paymentService = await prisma.service.create({
      data: {
        name: `Billing Gateway ${ts}`,
        description: 'Payment microservice under webhook tests',
        status: 'OPERATIONAL',
        ownerId: adminUser.id,
      },
    });
  });

  afterAll(async () => {
    if (createdIncidentId) {
      await prisma.incident.deleteMany({ where: { id: createdIncidentId } });
    }
    if (paymentService) {
      await prisma.service.deleteMany({ where: { id: paymentService.id } });
    }
    await prisma.user.deleteMany({ where: { id: adminUser.id } });
    await prisma.$disconnect();
  });

  it('should reject webhook request missing secret header with 401', async () => {
    const res = await request(app)
      .post('/api/webhooks/incidents')
      .send({
        service: paymentService.name,
        title: 'Payment gateway timeout',
        description: 'Latency exceeded threshold',
        severity: 'SEV_2',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject webhook request with wrong secret header with 401', async () => {
    const res = await request(app)
      .post('/api/webhooks/incidents')
      .set('x-webhook-secret', 'wrong-secret-token')
      .send({
        service: paymentService.name,
        title: 'Payment gateway timeout',
        description: 'Latency exceeded threshold',
        severity: 'SEV_2',
      });

    expect(res.status).toBe(401);
  });

  it('should reject invalid payload schema with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/webhooks/incidents')
      .set('x-webhook-secret', ENV.WEBHOOK_SECRET)
      .send({
        service: '', // empty
        title: 'Hi', // too short (< 3)
        severity: 'INVALID_SEV',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 if targeted service name does not exist', async () => {
    const res = await request(app)
      .post('/api/webhooks/incidents')
      .set('x-webhook-secret', ENV.WEBHOOK_SECRET)
      .send({
        service: 'NonExistentService12345',
        title: 'Random crash',
        description: 'Memory limit exceeded',
        severity: 'SEV_2',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should successfully create an incident and timeline event with valid webhook', async () => {
    const res = await request(app)
      .post('/api/webhooks/incidents')
      .set('x-webhook-secret', ENV.WEBHOOK_SECRET)
      .send({
        service: paymentService.name,
        title: 'Payment API latency above threshold',
        description: 'Average latency exceeded 2 seconds',
        severity: 'SEV_2',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Payment API latency above threshold');
    expect(res.body.data.service.id).toBe(paymentService.id);
    createdIncidentId = res.body.data.id;

    // Verify timeline event was persisted in PostgreSQL
    const timelineEvents = await prisma.timelineEvent.findMany({
      where: { incidentId: createdIncidentId },
    });
    expect(timelineEvents.length).toBeGreaterThanOrEqual(1);
    expect(timelineEvents[0].type).toBe('CREATED');
  });
});
