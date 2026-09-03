import { PrismaClient, Role, ServiceStatus, Severity, IncidentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_SEED !== 'true') {
    console.warn(
      '⚠️  SKIPPING SEED: Database seeding is restricted to development/demo environments. Set FORCE_SEED=true to override.'
    );
    return;
  }

  console.log('=====================================================');
  console.log('🌱 POPULATING DEVELOPMENT / DEMO INCIDENTFLOW DATASET');
  console.log('   All seeded records are strictly isolated for local');
  console.log('   testing and demonstration purposes.');
  console.log('=====================================================');

  // Clean up existing data in reverse order of dependencies
  await prisma.timelineEvent.deleteMany();
  await prisma.incidentComment.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@incidentflow.dev',
      name: 'Alex Rivera (Admin)',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const engineerUser = await prisma.user.create({
    data: {
      email: 'engineer@incidentflow.dev',
      name: 'Elena Rostova (Engineer)',
      passwordHash,
      role: Role.ENGINEER,
    },
  });

  const sreUser = await prisma.user.create({
    data: {
      email: 'sre@incidentflow.dev',
      name: 'Marcus Chen (SRE)',
      passwordHash,
      role: Role.ENGINEER,
    },
  });

  const devopsUser = await prisma.user.create({
    data: {
      email: 'devops@incidentflow.dev',
      name: 'Sarah Connor (DevOps)',
      passwordHash,
      role: Role.ENGINEER,
    },
  });

  console.log('Users created successfully.');

  // 2. Create Services
  const authService = await prisma.service.create({
    data: {
      name: 'Authentication API',
      description: 'Central OAuth2 and session token issuing service',
      status: ServiceStatus.OPERATIONAL,
      ownerId: adminUser.id,
    },
  });

  const paymentService = await prisma.service.create({
    data: {
      name: 'Payment API',
      description: 'Stripe card processing and subscription billing gateway',
      status: ServiceStatus.DEGRADED,
      ownerId: engineerUser.id,
    },
  });

  const dbService = await prisma.service.create({
    data: {
      name: 'User Database',
      description: 'Primary PostgreSQL cluster for customer accounts & profiles',
      status: ServiceStatus.OPERATIONAL,
      ownerId: sreUser.id,
    },
  });

  const notifService = await prisma.service.create({
    data: {
      name: 'Notification Service',
      description: 'Transactional email, SMS, and push notification dispatch workers',
      status: ServiceStatus.OPERATIONAL,
      ownerId: devopsUser.id,
    },
  });

  const searchService = await prisma.service.create({
    data: {
      name: 'Search API',
      description: 'Elasticsearch cluster powering catalog search and autocomplete',
      status: ServiceStatus.OPERATIONAL,
      ownerId: engineerUser.id,
    },
  });

  const webService = await prisma.service.create({
    data: {
      name: 'Web Frontend',
      description: 'Next.js/React customer web dashboard and Cloudflare CDN',
      status: ServiceStatus.OPERATIONAL,
      ownerId: adminUser.id,
    },
  });

  console.log('Services created successfully.');

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);

  // 3. Create Realistic Incidents

  // Incident 1: Active SEV_1 - Payment Gateway Outage
  const inc1 = await prisma.incident.create({
    data: {
      title: 'Payment Gateway 504 Gateway Timeouts during checkout',
      description: 'Checkout funnel is dropping ~35% of customer transactions. Webhook workers are timing out when calling Stripe API.',
      severity: Severity.SEV_1,
      status: IncidentStatus.IDENTIFIED,
      serviceId: paymentService.id,
      reporterId: engineerUser.id,
      assigneeId: sreUser.id,
      startedAt: minutesAgo(85),
      createdAt: minutesAgo(85),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc1.id, actorId: engineerUser.id, type: 'CREATED', message: 'Incident created with severity SEV_1', createdAt: minutesAgo(85) },
      { incidentId: inc1.id, actorId: engineerUser.id, type: 'ASSIGNED', message: 'Assigned to Marcus Chen (SRE)', createdAt: minutesAgo(80) },
      { incidentId: inc1.id, actorId: sreUser.id, type: 'STATUS_CHANGED', message: 'Status changed from Investigating to Identified', createdAt: minutesAgo(40) },
    ],
  });
  await prisma.incidentComment.createMany({
    data: [
      { incidentId: inc1.id, authorId: engineerUser.id, content: 'Spike in HTTP 504 errors detected in us-east-1 payment workers.', createdAt: minutesAgo(82) },
      { incidentId: inc1.id, authorId: sreUser.id, content: 'Identified root cause: Connection pooling limit was reached following recent traffic surge. Increasing max pool size from 50 to 200.', createdAt: minutesAgo(38) },
    ],
  });

  // Incident 2: Active SEV_2 - Auth API elevated latency
  const inc2 = await prisma.incident.create({
    data: {
      title: 'Authentication API P99 latency exceeding 2500ms',
      description: 'Token validation endpoint latency jumped from 45ms to 2.8s. Downstream mobile apps reporting session renewal timeouts.',
      severity: Severity.SEV_2,
      status: IncidentStatus.INVESTIGATING,
      serviceId: authService.id,
      reporterId: devopsUser.id,
      assigneeId: engineerUser.id,
      startedAt: minutesAgo(45),
      createdAt: minutesAgo(45),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc2.id, actorId: devopsUser.id, type: 'CREATED', message: 'Incident created via alert monitor', createdAt: minutesAgo(45) },
      { incidentId: inc2.id, actorId: devopsUser.id, type: 'ASSIGNED', message: 'Assigned to Elena Rostova (Engineer)', createdAt: minutesAgo(40) },
    ],
  });
  await prisma.incidentComment.create({
    data: {
      incidentId: inc2.id,
      authorId: engineerUser.id,
      content: 'Investigating Redis cache cluster memory pressure. Looks like evicted session keys are hammering the DB.',
      createdAt: minutesAgo(25),
    },
  });

  // Incident 3: Active SEV_3 - Search Index Rebuild Degraded
  const inc3 = await prisma.incident.create({
    data: {
      title: 'Search API product index sync delay of 15 minutes',
      description: 'Newly created product items are taking up to 15 minutes to appear in public search index. Queries are completing fine.',
      severity: Severity.SEV_3,
      status: IncidentStatus.MONITORING,
      serviceId: searchService.id,
      reporterId: adminUser.id,
      assigneeId: devopsUser.id,
      startedAt: hoursAgo(4),
      createdAt: hoursAgo(4),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc3.id, actorId: adminUser.id, type: 'CREATED', message: 'Incident created with severity SEV_3', createdAt: hoursAgo(4) },
      { incidentId: inc3.id, actorId: adminUser.id, type: 'ASSIGNED', message: 'Assigned to Sarah Connor (DevOps)', createdAt: hoursAgo(3) },
      { incidentId: inc3.id, actorId: devopsUser.id, type: 'STATUS_CHANGED', message: 'Status changed to Monitoring after scaling Kafka consumer group', createdAt: hoursAgo(1) },
    ],
  });

  // Incident 4: Resolved SEV_1 - Database Connection Pool Exhausted
  const inc4 = await prisma.incident.create({
    data: {
      title: 'Database connection pool exhausted during morning peak',
      description: 'Primary PostgreSQL host reached max_connections (500). All microservices failed health check probes.',
      severity: Severity.SEV_1,
      status: IncidentStatus.RESOLVED,
      serviceId: dbService.id,
      reporterId: sreUser.id,
      assigneeId: sreUser.id,
      startedAt: hoursAgo(14),
      resolvedAt: hoursAgo(12.5), // took 1.5 hours (90 mins)
      createdAt: hoursAgo(14),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc4.id, actorId: sreUser.id, type: 'CREATED', message: 'Incident created with severity SEV_1', createdAt: hoursAgo(14) },
      { incidentId: inc4.id, actorId: sreUser.id, type: 'STATUS_CHANGED', message: 'Status changed from Investigating to Identified: rogue report query hanging', createdAt: hoursAgo(13.5) },
      { incidentId: inc4.id, actorId: sreUser.id, type: 'RESOLVED', message: 'Incident resolved. PgBouncer pooler deployed in front of replica pool.', createdAt: hoursAgo(12.5) },
    ],
  });

  // Incident 5: Resolved SEV_2 - Notification SMS Delivery Delays
  const inc5 = await prisma.incident.create({
    data: {
      title: 'Notification Service SMS deliveries queued for >30 minutes',
      description: 'Twilio provider throttling rate limits hit on OTP code dispatches.',
      severity: Severity.SEV_2,
      status: IncidentStatus.RESOLVED,
      serviceId: notifService.id,
      reporterId: engineerUser.id,
      assigneeId: devopsUser.id,
      startedAt: hoursAgo(24),
      resolvedAt: hoursAgo(22.8), // took 72 mins
      createdAt: hoursAgo(24),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc5.id, actorId: engineerUser.id, type: 'CREATED', message: 'Incident created', createdAt: hoursAgo(24) },
      { incidentId: inc5.id, actorId: devopsUser.id, type: 'STATUS_CHANGED', message: 'Switched outbound gateway to fallback provider AWS SNS', createdAt: hoursAgo(23.2) },
      { incidentId: inc5.id, actorId: devopsUser.id, type: 'RESOLVED', message: 'Incident resolved. Backlog drained completely.', createdAt: hoursAgo(22.8) },
    ],
  });

  // Incident 6: Resolved SEV_3 - Web Frontend CSS Asset 404
  const inc6 = await prisma.incident.create({
    data: {
      title: 'Web Frontend CDN caching stale manifest after deployment',
      description: 'Users on specific edge regions were receiving HTTP 404 for chunk-vendor.js after release v2.4.1.',
      severity: Severity.SEV_3,
      status: IncidentStatus.RESOLVED,
      serviceId: webService.id,
      reporterId: adminUser.id,
      assigneeId: engineerUser.id,
      startedAt: hoursAgo(36),
      resolvedAt: hoursAgo(35.2), // took 48 mins
      createdAt: hoursAgo(36),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc6.id, actorId: adminUser.id, type: 'CREATED', message: 'Incident created', createdAt: hoursAgo(36) },
      { incidentId: inc6.id, actorId: engineerUser.id, type: 'RESOLVED', message: 'Purged Cloudflare edge cache and redeployed release tags.', createdAt: hoursAgo(35.2) },
    ],
  });

  // Incident 7: Resolved SEV_4 - Internal Analytics Job Missed Schedule
  const inc7 = await prisma.incident.create({
    data: {
      title: 'Nightly analytics rollups delayed due to lock contention',
      description: 'Table lock on user_metrics prevented the 02:00 UTC cron aggregation from completing.',
      severity: Severity.SEV_4,
      status: IncidentStatus.RESOLVED,
      serviceId: dbService.id,
      reporterId: devopsUser.id,
      assigneeId: sreUser.id,
      startedAt: hoursAgo(48),
      resolvedAt: hoursAgo(47.3), // took 42 mins
      createdAt: hoursAgo(48),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc7.id, actorId: devopsUser.id, type: 'CREATED', message: 'Incident created', createdAt: hoursAgo(48) },
      { incidentId: inc7.id, actorId: sreUser.id, type: 'RESOLVED', message: 'Ran manual backfill and tuned lock timeout to 15s.', createdAt: hoursAgo(47.3) },
    ],
  });

  // Incident 8: Active SEV_4 - Minor SSL Certificate Warning on Staging
  const inc8 = await prisma.incident.create({
    data: {
      title: 'Staging webhook test endpoint certificate renewal pending',
      description: 'Let’s Encrypt certbot auto-renew cron failed on sandbox ingress. Production is unaffected.',
      severity: Severity.SEV_4,
      status: IncidentStatus.INVESTIGATING,
      serviceId: authService.id,
      reporterId: adminUser.id,
      assigneeId: devopsUser.id,
      startedAt: hoursAgo(5),
      createdAt: hoursAgo(5),
    },
  });
  await prisma.timelineEvent.create({
    data: { incidentId: inc8.id, actorId: adminUser.id, type: 'CREATED', message: 'Incident logged during staging smoke testing', createdAt: hoursAgo(5) },
  });

  // Incident 9: Resolved SEV_2 - Third-Party Payment Webhook Failures
  const inc9 = await prisma.incident.create({
    data: {
      title: 'Stripe webhook signature validation failing intermittently',
      description: 'Clock drift on two EC2 worker instances caused HMAC timestamp window validation to fail.',
      severity: Severity.SEV_2,
      status: IncidentStatus.RESOLVED,
      serviceId: paymentService.id,
      reporterId: sreUser.id,
      assigneeId: sreUser.id,
      startedAt: hoursAgo(60),
      resolvedAt: hoursAgo(58.8), // took 72 mins
      createdAt: hoursAgo(60),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc9.id, actorId: sreUser.id, type: 'CREATED', message: 'Incident created with severity SEV_2', createdAt: hoursAgo(60) },
      { incidentId: inc9.id, actorId: sreUser.id, type: 'RESOLVED', message: 'Synced NTP daemon chrony across all app nodes.', createdAt: hoursAgo(58.8) },
    ],
  });

  // Incident 10: Resolved SEV_1 - Search Cluster Split-Brain Condition
  const inc10 = await prisma.incident.create({
    data: {
      title: 'Elasticsearch master node disconnect causing query rejection',
      description: 'Dedicated master node in zone us-east-1b suffered network partition. Cluster entered RED health state.',
      severity: Severity.SEV_1,
      status: IncidentStatus.RESOLVED,
      serviceId: searchService.id,
      reporterId: devopsUser.id,
      assigneeId: engineerUser.id,
      startedAt: hoursAgo(72),
      resolvedAt: hoursAgo(70.5), // took 90 mins
      createdAt: hoursAgo(72),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc10.id, actorId: devopsUser.id, type: 'CREATED', message: 'Incident created with severity SEV_1', createdAt: hoursAgo(72) },
      { incidentId: inc10.id, actorId: engineerUser.id, type: 'RESOLVED', message: 'Promoted backup master and stabilized quorum voting configuration.', createdAt: hoursAgo(70.5) },
    ],
  });

  // Incident 11: Resolved SEV_3 - Email Delivery Throttling on Hotmail/Outlook
  const inc11 = await prisma.incident.create({
    data: {
      title: 'Transactional emails to Microsoft domains deferred',
      description: 'Spike in marketing campaigns led to temporary IP reputation drop on SendGrid outbound pool.',
      severity: Severity.SEV_3,
      status: IncidentStatus.RESOLVED,
      serviceId: notifService.id,
      reporterId: adminUser.id,
      assigneeId: engineerUser.id,
      startedAt: hoursAgo(90),
      resolvedAt: hoursAgo(88.5), // took 90 mins
      createdAt: hoursAgo(90),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc11.id, actorId: adminUser.id, type: 'CREATED', message: 'Incident created', createdAt: hoursAgo(90) },
      { incidentId: inc11.id, actorId: engineerUser.id, type: 'RESOLVED', message: 'Separated transactional and marketing IP pools.', createdAt: hoursAgo(88.5) },
    ],
  });

  // Incident 12: Resolved SEV_2 - Frontend Memory Leak on Dashboard Re-render
  const inc12 = await prisma.incident.create({
    data: {
      title: 'Browser tab crash on high-frequency live dashboard view',
      description: 'Unsubscribed WebSocket event listeners caused heap accumulation up to 1.8GB in long-lived browser sessions.',
      severity: Severity.SEV_2,
      status: IncidentStatus.RESOLVED,
      serviceId: webService.id,
      reporterId: engineerUser.id,
      assigneeId: engineerUser.id,
      startedAt: hoursAgo(110),
      resolvedAt: hoursAgo(108.8), // took 72 mins
      createdAt: hoursAgo(110),
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      { incidentId: inc12.id, actorId: engineerUser.id, type: 'CREATED', message: 'Incident created', createdAt: hoursAgo(110) },
      { incidentId: inc12.id, actorId: engineerUser.id, type: 'RESOLVED', message: 'Fixed useEffect teardown cleanup function in telemetry hook.', createdAt: hoursAgo(108.8) },
    ],
  });

  console.log('Seeded 12 realistic incidents with timeline events and comments.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
