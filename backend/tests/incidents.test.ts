import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';

const app = createApp();

describe('Incidents and Timeline API', () => {
  let adminToken: string;
  let engineerToken: string;
  let adminUser: any;
  let engineerUser: any;
  let testService: any;
  let createdIncidentId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const ts = Date.now();

    adminUser = await prisma.user.create({
      data: {
        name: 'IncAdmin',
        email: `incadmin_${ts}@incidentflow.dev`,
        passwordHash,
        role: 'ADMIN',
      },
    });

    engineerUser = await prisma.user.create({
      data: {
        name: 'IncEngineer',
        email: `inceng_${ts}@incidentflow.dev`,
        passwordHash,
        role: 'ENGINEER',
      },
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: adminUser.email,
      password: 'Password123!',
    });
    adminToken = adminLogin.body.data.token;

    const engLogin = await request(app).post('/api/auth/login').send({
      email: engineerUser.email,
      password: 'Password123!',
    });
    engineerToken = engLogin.body.data.token;

    testService = await prisma.service.create({
      data: {
        name: `Core Cluster ${ts}`,
        description: 'Primary test service for incident testing',
        status: 'OPERATIONAL',
        ownerId: adminUser.id,
      },
    });
  });

  afterAll(async () => {
    if (createdIncidentId) {
      await prisma.incident.deleteMany({ where: { id: createdIncidentId } });
    }
    if (testService) {
      await prisma.service.deleteMany({ where: { id: testService.id } });
    }
    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, engineerUser.id] } },
    });
    await prisma.$disconnect();
  });

  it('should create an incident and generate an initial timeline event', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        title: 'High CPU utilization on worker nodes',
        description: 'Worker queue backlog is growing rapidly due to node throttling.',
        severity: 'SEV_2',
        serviceId: testService.id,
        assigneeId: engineerUser.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('High CPU utilization on worker nodes');
    expect(res.body.data.status).toBe('INVESTIGATING');
    expect(res.body.data.severity).toBe('SEV_2');
    createdIncidentId = res.body.data.id;

    // Check timeline events
    const timelineRes = await request(app)
      .get(`/api/incidents/${createdIncidentId}/timeline`)
      .set('Authorization', `Bearer ${engineerToken}`);

    expect(timelineRes.status).toBe(200);
    expect(timelineRes.body.data.length).toBeGreaterThanOrEqual(1);
    const eventTypes = timelineRes.body.data.map((e: any) => e.type);
    expect(eventTypes).toContain('CREATED');
  });

  it('should retrieve the incident by ID with all relations', async () => {
    const res = await request(app)
      .get(`/api/incidents/${createdIncidentId}`)
      .set('Authorization', `Bearer ${engineerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdIncidentId);
    expect(res.body.data.service.name).toBe(testService.name);
    expect(res.body.data.reporter.name).toBe(engineerUser.name);
    expect(res.body.data.assignee.name).toBe(engineerUser.name);
  });

  it('should update status and severity, generating timeline events', async () => {
    const res = await request(app)
      .patch(`/api/incidents/${createdIncidentId}`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        severity: 'SEV_1',
        status: 'IDENTIFIED',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.severity).toBe('SEV_1');
    expect(res.body.data.status).toBe('IDENTIFIED');

    const timelineRes = await request(app)
      .get(`/api/incidents/${createdIncidentId}/timeline`)
      .set('Authorization', `Bearer ${engineerToken}`);

    const messages = timelineRes.body.data.map((e: any) => e.message);
    expect(messages.some((m: string) => m.includes('Severity changed'))).toBe(true);
    expect(messages.some((m: string) => m.includes('Status changed'))).toBe(true);
  });

  it('should add a comment and record a timeline event', async () => {
    const commentRes = await request(app)
      .post(`/api/incidents/${createdIncidentId}/comments`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        content: 'Investigated htop metrics; rogue cron job terminated.',
      });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.data.content).toBe('Investigated htop metrics; rogue cron job terminated.');

    const commentsList = await request(app)
      .get(`/api/incidents/${createdIncidentId}/comments`)
      .set('Authorization', `Bearer ${engineerToken}`);

    expect(commentsList.status).toBe(200);
    expect(commentsList.body.data.length).toBe(1);
    expect(commentsList.body.data[0].author.name).toBe(engineerUser.name);
  });

  it('should resolve the incident and set resolvedAt timestamp', async () => {
    const res = await request(app)
      .patch(`/api/incidents/${createdIncidentId}`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        status: 'RESOLVED',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
    expect(res.body.data.resolvedAt).not.toBeNull();

    const timelineRes = await request(app)
      .get(`/api/incidents/${createdIncidentId}/timeline`)
      .set('Authorization', `Bearer ${engineerToken}`);

    const eventTypes = timelineRes.body.data.map((e: any) => e.type);
    expect(eventTypes).toContain('RESOLVED');
  });

  it('should filter incidents by severity, status, search', async () => {
    const res = await request(app)
      .get('/api/incidents?severity=SEV_1&status=RESOLVED&search=CPU')
      .set('Authorization', `Bearer ${engineerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.incidents.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.incidents[0].id).toBe(createdIncidentId);
  });
});
