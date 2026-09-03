export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'IncidentFlow API',
    version: '1.0.0',
    description:
      'A modern full-stack DevOps incident management platform API for engineering teams. Manage microservices, declare production incidents, record persistent audit timelines, and query reliability metrics.',
    contact: {
      name: 'IncidentFlow Engineering',
      email: 'admin@incidentflow.dev',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Current Environment API Base',
    },
    {
      url: 'http://localhost:4000/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your signed JWT session token issued by /api/auth/login',
      },
      WebhookSecretAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-webhook-secret',
        description: 'Pre-shared webhook ingress secret for automated monitoring alerts',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Alex Rivera' },
          email: { type: 'string', format: 'email', example: 'admin@incidentflow.dev' },
          role: { type: 'string', enum: ['ADMIN', 'ENGINEER'], example: 'ADMIN' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Service: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Payment API' },
          description: { type: 'string', example: 'Stripe card processing and subscription billing gateway' },
          status: { type: 'string', enum: ['OPERATIONAL', 'DEGRADED', 'DOWN'], example: 'OPERATIONAL' },
          ownerId: { type: 'string', format: 'uuid' },
          totalIncidents: { type: 'integer', example: 3 },
          activeIncidentsCount: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Incident: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Payment Gateway 504 Timeouts' },
          description: { type: 'string', example: 'Drop in customer transactions observed in checkout funnel.' },
          severity: { type: 'string', enum: ['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4'], example: 'SEV_1' },
          status: { type: 'string', enum: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED'], example: 'INVESTIGATING' },
          serviceId: { type: 'string', format: 'uuid' },
          reporterId: { type: 'string', format: 'uuid' },
          assigneeId: { type: 'string', format: 'uuid', nullable: true },
          startedAt: { type: 'string', format: 'date-time' },
          resolvedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      IncidentComment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          incidentId: { type: 'string', format: 'uuid' },
          authorId: { type: 'string', format: 'uuid' },
          content: { type: 'string', example: 'Identified connection pool limit reached. Scaling pool from 50 to 200.' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      TimelineEvent: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          incidentId: { type: 'string', format: 'uuid' },
          actorId: { type: 'string', format: 'uuid', nullable: true },
          type: { type: 'string', example: 'STATUS_CHANGED' },
          message: { type: 'string', example: 'Status changed from Investigating to Identified' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AnalyticsOverview: {
        type: 'object',
        properties: {
          totalIncidents: { type: 'integer', example: 12 },
          activeIncidents: { type: 'integer', example: 3 },
          criticalIncidents: { type: 'integer', example: 1 },
          servicesAffected: { type: 'integer', example: 2 },
          totalServices: { type: 'integer', example: 6 },
          averageResolutionMinutes: { type: 'integer', example: 64 },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Resource not found' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'System health probe',
        tags: ['System'],
        responses: {
          200: {
            description: 'Backend server is healthy and accepting traffic',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new operator account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Elena Rostova' },
                  email: { type: 'string', format: 'email', example: 'elena@incidentflow.dev' },
                  password: { type: 'string', minLength: 6, example: 'Password123!' },
                  role: { type: 'string', enum: ['ADMIN', 'ENGINEER'], default: 'ENGINEER' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered and JWT issued' },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate with email and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@incidentflow.dev' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful, returns JWT token and safe user profile' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Retrieve authenticated user session profile',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile details' },
          401: { description: 'Unauthorized / token expired' },
        },
      },
    },
    '/services': {
      get: {
        summary: 'List all registered microservices and health statuses',
        tags: ['Services'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Array of services with operational statuses' },
        },
      },
      post: {
        summary: 'Register a new microservice (ADMIN only)',
        tags: ['Services'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description'],
                properties: {
                  name: { type: 'string', example: 'Search API' },
                  description: { type: 'string', example: 'Elasticsearch cluster powering product queries' },
                  status: { type: 'string', enum: ['OPERATIONAL', 'DEGRADED', 'DOWN'], default: 'OPERATIONAL' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Service registered successfully' },
          403: { description: 'Forbidden: Requires ADMIN role' },
        },
      },
    },
    '/services/{id}': {
      get: {
        summary: 'Get single service by ID',
        tags: ['Services'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Service details' }, 404: { description: 'Service not found' } },
      },
      patch: {
        summary: 'Update service details or status (ADMIN only)',
        tags: ['Services'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['OPERATIONAL', 'DEGRADED', 'DOWN'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Service updated' }, 403: { description: 'Forbidden: Requires ADMIN' } },
      },
      delete: {
        summary: 'Delete service from registry (ADMIN only)',
        tags: ['Services'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Service deleted' }, 403: { description: 'Forbidden: Requires ADMIN' } },
      },
    },
    '/incidents': {
      get: {
        summary: 'Query incidents with live search, filtering, and pagination',
        tags: ['Incidents'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search title and description' },
          { in: 'query', name: 'severity', schema: { type: 'string', enum: ['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4'] } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED'] } },
          { in: 'query', name: 'serviceId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated incidents list' } },
      },
      post: {
        summary: 'Declare a new production incident',
        tags: ['Incidents'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'severity', 'serviceId'],
                properties: {
                  title: { type: 'string', example: 'Payment API Latency Spike' },
                  description: { type: 'string', example: 'P99 latency exceeding 2500ms' },
                  severity: { type: 'string', enum: ['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4'] },
                  serviceId: { type: 'string', format: 'uuid' },
                  assigneeId: { type: 'string', format: 'uuid', nullable: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Incident declared and timeline initialized' } },
      },
    },
    '/incidents/{id}': {
      get: {
        summary: 'Get incident investigation file by ID',
        tags: ['Incidents'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Incident with service, reporter, comments, and timeline' } },
      },
      patch: {
        summary: 'Update incident status, severity, assignee, or details',
        tags: ['Incidents'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  severity: { type: 'string', enum: ['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4'] },
                  status: { type: 'string', enum: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED'] },
                  assigneeId: { type: 'string', format: 'uuid', nullable: true },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Incident updated and timeline audit event appended' } },
      },
      delete: {
        summary: 'Delete incident record (ADMIN only)',
        tags: ['Incidents'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Incident deleted' }, 403: { description: 'Forbidden: Requires ADMIN' } },
      },
    },
    '/incidents/{id}/comments': {
      get: {
        summary: 'List threaded investigation notes for an incident',
        tags: ['Comments'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Array of comments ordered by timestamp' } },
      },
      post: {
        summary: 'Post investigation note to an incident',
        tags: ['Comments'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'Root cause confirmed: connection pool starvation.' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Comment saved and timeline event logged' } },
      },
    },
    '/incidents/{id}/timeline': {
      get: {
        summary: 'Retrieve persistent database audit timeline for an incident',
        tags: ['Timeline'],
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Chronological list of audit events from PostgreSQL' } },
      },
    },
    '/analytics/overview': {
      get: {
        summary: 'Retrieve operational KPIs (active, critical, affected services, MTTR)',
        tags: ['Analytics'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Calculated metrics from PostgreSQL' } },
      },
    },
    '/analytics/incidents': {
      get: {
        summary: 'Retrieve incident aggregations (by severity, status, service, volume over time)',
        tags: ['Analytics'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Categorized incident distributions' } },
      },
    },
    '/webhooks/incidents': {
      post: {
        summary: 'Automated monitoring webhook ingress (Datadog, Prometheus, Grafana, CloudWatch)',
        tags: ['Webhooks'],
        security: [{ WebhookSecretAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['service', 'title', 'description', 'severity'],
                properties: {
                  service: { type: 'string', example: 'Payment API' },
                  title: { type: 'string', example: 'Payment API latency above threshold' },
                  description: { type: 'string', example: 'Average latency exceeded 2 seconds' },
                  severity: { type: 'string', enum: ['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4'], example: 'SEV_2' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Incident created via webhook, auto-assigned to service owner' },
          401: { description: 'Unauthorized: Missing or invalid x-webhook-secret header' },
          404: { description: 'Service not found in catalog' },
        },
      },
    },
  },
};
