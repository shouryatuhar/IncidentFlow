import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api';
const WEBHOOK_SECRET = 'incidentflow-whsec-supersecretkey123';

interface AuditResult {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details?: any;
}

const results: AuditResult[] = [];

function record(category: string, name: string, pass: boolean, details?: any) {
  const item: AuditResult = { category, name, status: pass ? 'PASS' : 'FAIL', details };
  results.push(item);
  console.log(`[${item.status}] [${category}] ${name}`);
  if (!pass && details) {
    console.error('   Failure Details:', details);
  }
}

async function request(endpoint: string, options: any = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, ok: res.ok, data };
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPLETE INCIDENTFLOW END-TO-END AUDIT');
  console.log('====================================================\n');

  // 1. HEALTH CHECK
  const health = await request('/health');
  record('1. Server Health', 'GET /api/health returns 200 and status ok', health.status === 200 && health.data.status === 'ok', health.data);

  // 2. AUTHENTICATION & SESSIONS
  // 2.1 Admin login
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@incidentflow.dev', password: 'Password123!' },
  });
  record('2. Authentication', 'Admin login with valid credentials returns 200 & JWT', adminLogin.status === 200 && Boolean(adminLogin.data?.data?.token));
  const adminToken = adminLogin.data?.data?.token;

  // 2.2 Verify session /auth/me
  const adminMe = await request('/auth/me', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  record('2. Authentication', 'Session verification /auth/me returns admin profile and role ADMIN', adminMe.status === 200 && adminMe.data?.data?.role === 'ADMIN');

  // 2.3 Engineer login
  const engLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'engineer@incidentflow.dev', password: 'Password123!' },
  });
  record('2. Authentication', 'Engineer login with valid credentials returns 200 & role ENGINEER', engLogin.status === 200 && engLogin.data?.data?.user?.role === 'ENGINEER');
  const engToken = engLogin.data?.data?.token;

  // 2.4 Invalid password
  const badPass = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@incidentflow.dev', password: 'WrongPassword!' },
  });
  record('2. Authentication', 'Login with wrong password rejected with 401', badPass.status === 401 && badPass.data?.success === false);

  // 2.5 Invalid email
  const badEmail = await request('/auth/login', {
    method: 'POST',
    body: { email: 'nonexistent@incidentflow.dev', password: 'Password123!' },
  });
  record('2. Authentication', 'Login with nonexistent email rejected with 401', badEmail.status === 401 && badEmail.data?.success === false);

  // 2.6 Registration
  const testRegEmail = `test_operator_${Date.now()}@incidentflow.dev`;
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: { name: 'Audit Operator', email: testRegEmail, password: 'Password123!', role: 'ENGINEER' },
  });
  record('2. Authentication', 'Registration creates user and issues JWT token', regRes.status === 201 && Boolean(regRes.data?.data?.token));

  // 3. ADMIN SERVICE CRUD
  // 3.1 Create Service
  const testServiceName = `Audit Microservice ${Date.now()}`;
  const createServiceRes = await request('/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: testServiceName,
      description: 'Temporary microservice for verifying end-to-end admin workflow',
      status: 'OPERATIONAL',
    },
  });
  const createdService = createServiceRes.data?.data;
  record('3. Admin Services', 'Admin can create new service (201 Created)', createServiceRes.status === 201 && Boolean(createdService?.id));

  // 3.2 Verify persistence in PostgreSQL
  const dbServiceCheck = await prisma.service.findUnique({ where: { id: createdService?.id } });
  record('3. Admin Services', 'Created service is persisted in PostgreSQL table "services"', Boolean(dbServiceCheck && dbServiceCheck.name === testServiceName));

  // 3.3 Edit Service
  const updateServiceRes = await request(`/services/${createdService.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      description: 'Updated operational description with degraded status',
      status: 'DEGRADED',
    },
  });
  record('3. Admin Services', 'Admin can update service status and description (200 OK)', updateServiceRes.status === 200 && updateServiceRes.data?.data?.status === 'DEGRADED');

  // Verify DB updated
  const dbUpdatedService = await prisma.service.findUnique({ where: { id: createdService.id } });
  record('3. Admin Services', 'Service updates verified directly in PostgreSQL', dbUpdatedService?.status === 'DEGRADED');

  // 4. INCIDENT LIFECYCLE & AUDIT TIMELINE
  // 4.1 Create Incident
  const createIncRes = await request('/incidents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'E2E Cache Cluster Memory Pressure',
      description: 'Redis cluster memory saturation resulting in evictions and DB connection spikes',
      severity: 'SEV_2',
      serviceId: createdService.id,
      assigneeId: engLogin.data?.data?.user?.id,
    },
  });
  const createdInc = createIncRes.data?.data;
  record('4. Incident Lifecycle', 'Admin can declare incident with service, severity, assignee', createIncRes.status === 201 && createdInc?.status === 'INVESTIGATING');

  // 4.2 Verify initial timeline events in DB
  const initialTimeline = await request(`/incidents/${createdInc.id}/timeline`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const eventTypes1 = initialTimeline.data?.data?.map((e: any) => e.type) || [];
  record('4. Incident Timeline', 'Timeline records initial CREATED and ASSIGNED events', eventTypes1.includes('CREATED') && eventTypes1.includes('ASSIGNED'));

  // 4.3 Change Severity
  const updateSev = await request(`/incidents/${createdInc.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { severity: 'SEV_1' },
  });
  record('4. Incident Lifecycle', 'Incident severity updated to SEV_1', updateSev.status === 200 && updateSev.data?.data?.severity === 'SEV_1');

  // 4.4 Change Status to IDENTIFIED
  const updateStat = await request(`/incidents/${createdInc.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'IDENTIFIED' },
  });
  record('4. Incident Lifecycle', 'Incident status updated to IDENTIFIED', updateStat.status === 200 && updateStat.data?.data?.status === 'IDENTIFIED');

  // 4.5 Add Comment
  const addCommentRes = await request(`/incidents/${createdInc.id}/comments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${engToken}` },
    body: { content: 'Engineer added investigation finding: rogue cron script caused cache flooding.' },
  });
  record('4. Incident Comments', 'Engineer can post comment to incident investigation thread', addCommentRes.status === 201 && Boolean(addCommentRes.data?.data?.id));

  // 4.6 Resolve Incident
  const resolveRes = await request(`/incidents/${createdInc.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'RESOLVED' },
  });
  record('4. Incident Lifecycle', 'Incident resolved, setting resolvedAt timestamp', resolveRes.status === 200 && resolveRes.data?.data?.status === 'RESOLVED' && Boolean(resolveRes.data?.data?.resolvedAt));

  // 4.7 Verify full timeline in PostgreSQL
  const fullTimelineRes = await request(`/incidents/${createdInc.id}/timeline`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const allEvents = fullTimelineRes.data?.data || [];
  const allTypes = allEvents.map((e: any) => e.type);
  const hasAllEvents =
    allTypes.includes('CREATED') &&
    allTypes.includes('ASSIGNED') &&
    allTypes.includes('SEVERITY_CHANGED') &&
    allTypes.includes('STATUS_CHANGED') &&
    allTypes.includes('COMMENT_ADDED') &&
    allTypes.includes('RESOLVED');

  record('4. Incident Timeline', 'Timeline contains all 6 audit events (CREATED, ASSIGNED, SEVERITY_CHANGED, STATUS_CHANGED, COMMENT_ADDED, RESOLVED)', hasAllEvents, allTypes);

  // 5. SEARCH AND FILTERS
  // 5.1 Search by title
  const searchRes = await request('/incidents?search=Memory%20Pressure', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  record('5. Search & Filters', 'Search by keyword returns matching incident from backend database', searchRes.status === 200 && searchRes.data?.data?.incidents?.some((i: any) => i.id === createdInc.id));

  // 5.2 Filter by Severity
  const filterSev = await request('/incidents?severity=SEV_1', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const allSev1 = filterSev.data?.data?.incidents?.every((i: any) => i.severity === 'SEV_1');
  record('5. Search & Filters', 'Filter by severity=SEV_1 returns only SEV_1 incidents', filterSev.status === 200 && allSev1 && filterSev.data?.data?.incidents?.length > 0);

  // 5.3 Filter by Status
  const filterStat = await request('/incidents?status=RESOLVED', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const allResolved = filterStat.data?.data?.incidents?.every((i: any) => i.status === 'RESOLVED');
  record('5. Search & Filters', 'Filter by status=RESOLVED returns only RESOLVED incidents', filterStat.status === 200 && allResolved && filterStat.data?.data?.incidents?.length > 0);

  // 5.4 Filter by Service
  const filterSvc = await request(`/incidents?serviceId=${createdService.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  record('5. Search & Filters', 'Filter by serviceId returns incidents for that specific service', filterSvc.status === 200 && filterSvc.data?.data?.incidents?.length === 1);

  // 6. ANALYTICS
  const overviewRes = await request('/analytics/overview', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const ov = overviewRes.data?.data;
  record('6. Analytics', 'Overview returns totalIncidents, activeIncidents, criticalIncidents, and MTTR', Boolean(ov && typeof ov.totalIncidents === 'number' && typeof ov.averageResolutionMinutes === 'number'));

  // Verify MTTR against database query
  const resolvedInDb = await prisma.incident.findMany({
    where: { status: 'RESOLVED', resolvedAt: { not: null } },
    select: { startedAt: true, resolvedAt: true },
  });
  let expectedTotalMins = 0;
  for (const r of resolvedInDb) {
    if (r.resolvedAt && r.startedAt) {
      expectedTotalMins += Math.max(0, Math.round((r.resolvedAt.getTime() - r.startedAt.getTime()) / (1000 * 60)));
    }
  }
  const expectedAvgMins = resolvedInDb.length > 0 ? Math.round(expectedTotalMins / resolvedInDb.length) : 0;
  record('6. Analytics', 'Calculated MTTR matches exact PostgreSQL date math', ov?.averageResolutionMinutes === expectedAvgMins, { apiMTTR: ov?.averageResolutionMinutes, expectedAvgMins });

  // 7. RBAC (ENGINEER RESTRICTIONS)
  // 7.1 Engineer can view services
  const engViewServices = await request('/services', {
    headers: { Authorization: `Bearer ${engToken}` },
  });
  record('7. Authorization (RBAC)', 'Engineer can view service catalog (200 OK)', engViewServices.status === 200);

  // 7.2 Engineer CANNOT create service
  const engCreateService = await request('/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${engToken}` },
    body: { name: 'Unauthorized Service', description: 'Should fail' },
  });
  record('7. Authorization (RBAC)', 'Engineer service creation rejected with 403 Forbidden', engCreateService.status === 403);

  // 7.3 Engineer CANNOT delete service
  const engDeleteService = await request(`/services/${createdService.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${engToken}` },
  });
  record('7. Authorization (RBAC)', 'Engineer service deletion rejected with 403 Forbidden', engDeleteService.status === 403);

  // 7.4 Engineer CANNOT delete incident
  const engDeleteIncident = await request(`/incidents/${createdInc.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${engToken}` },
  });
  record('7. Authorization (RBAC)', 'Engineer incident deletion rejected with 403 Forbidden', engDeleteIncident.status === 403);

  // 8. WEBHOOK INTEGRATION
  // 8.1 Valid webhook
  const whValid = await request('/webhooks/incidents', {
    method: 'POST',
    headers: { 'x-webhook-secret': WEBHOOK_SECRET },
    body: {
      service: testServiceName,
      title: 'Automated Webhook Latency Alert',
      description: 'Webhook ingress detected latency threshold crossed',
      severity: 'SEV_2',
    },
  });
  record('8. Webhook Ingress', 'Valid webhook creates incident with 201 Created', whValid.status === 201 && Boolean(whValid.data?.data?.id));
  const webhookIncId = whValid.data?.data?.id;

  // 8.2 Missing webhook secret
  const whMissingSecret = await request('/webhooks/incidents', {
    method: 'POST',
    body: { service: testServiceName, title: 'Alert', description: 'Alert desc', severity: 'SEV_2' },
  });
  record('8. Webhook Ingress', 'Missing webhook secret rejected with 401 Unauthorized', whMissingSecret.status === 401);

  // 8.3 Wrong webhook secret
  const whWrongSecret = await request('/webhooks/incidents', {
    method: 'POST',
    headers: { 'x-webhook-secret': 'invalid-secret-key-xyz' },
    body: { service: testServiceName, title: 'Alert', description: 'Alert desc', severity: 'SEV_2' },
  });
  record('8. Webhook Ingress', 'Invalid webhook secret rejected with 401 Unauthorized', whWrongSecret.status === 401);

  // 8.4 Malformed payload
  const whMalformed = await request('/webhooks/incidents', {
    method: 'POST',
    headers: { 'x-webhook-secret': WEBHOOK_SECRET },
    body: { service: '', title: 'Hi', severity: 'INVALID' },
  });
  record('8. Webhook Ingress', 'Malformed webhook payload rejected with 400 Bad Request', whMalformed.status === 400);

  // 8.5 Nonexistent service
  const whUnknownService = await request('/webhooks/incidents', {
    method: 'POST',
    headers: { 'x-webhook-secret': WEBHOOK_SECRET },
    body: {
      service: 'FakeServiceDoesNotExist',
      title: 'Latency alert',
      description: 'Detailed description exceeding five characters',
      severity: 'SEV_2',
    },
  });
  record('8. Webhook Ingress', 'Webhook targeting nonexistent service rejected with 404 Not Found', whUnknownService.status === 404);

  // 9. API ERROR HANDLING & EDGE CASES
  // 9.1 Nonexistent incident 404
  const notFoundInc = await request('/incidents/00000000-0000-0000-0000-000000000000', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  record('9. Error Handling', 'Nonexistent incident returns 404 Not Found with clean JSON error', notFoundInc.status === 404 && notFoundInc.data?.success === false);

  // 9.2 Nonexistent service 404
  const notFoundSvc = await request('/services/00000000-0000-0000-0000-000000000000', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  record('9. Error Handling', 'Nonexistent service returns 404 Not Found', notFoundSvc.status === 404);

  // 9.3 Invalid JWT token
  const badJwt = await request('/auth/me', {
    headers: { Authorization: 'Bearer this-is-not-a-valid-jwt-token' },
  });
  record('9. Error Handling', 'Malformed JWT token returns 401 Unauthorized without crashing', badJwt.status === 401);

  // Clean up created test incidents and test service
  if (webhookIncId) {
    await prisma.incident.deleteMany({ where: { id: webhookIncId } });
  }
  if (createdInc?.id) {
    await prisma.incident.deleteMany({ where: { id: createdInc.id } });
  }
  if (createdService?.id) {
    await prisma.service.deleteMany({ where: { id: createdService.id } });
  }
  await prisma.user.deleteMany({ where: { email: testRegEmail } });

  console.log('\n====================================================');
  const passedCount = results.filter((r) => r.status === 'PASS').length;
  const failedCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`AUDIT FINISHED: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log('====================================================\n');

  await prisma.$disconnect();

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
