# API & Integration Readiness — The Catalyst

**Owner:** The Catalyst
**Estimated effort:** 2-3 days
**Phase:** 5 (Days 4-5)
**Goal:** Webhook infrastructure, CRM connectors, lead storage, Zapier-ready APIs.

---

## Overview

Current state: Client-side scoring only. No backend APIs. No lead persistence.

Target state: Lead storage, webhook endpoints, CRM integration adapters, Zapier integration template.

---

## 1. Lead Storage API

**File:** `src/app/api/leads/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateResultQuery } from '@/lib/validation';
import { z } from 'zod';

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const LeadSchema = z.object({
      score: z.number().min(0).max(100),
      qualified: z.boolean(),
      breakdown: z.record(z.number()),
      answers: z.record(z.string()),
      profile: z.object({
        size: z.string(),
        urgency: z.string(),
      }).optional(),
      email: z.string().email().optional(),
      company: z.string().optional(),
      source: z.string().optional(),
    });

    const validationResult = LeadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        score: validationResult.data.score,
        qualified: validationResult.data.qualified,
        breakdown: validationResult.data.breakdown,
        answers: validationResult.data.answers,
        profile: validationResult.data.profile || {},
        email: validationResult.data.email,
        company: validationResult.data.company,
        source: validationResult.data.source,
      },
    });

    // Trigger webhooks asynchronously
    triggerWebhooks(lead).catch(console.error);

    return NextResponse.json(
      { id: lead.id, qualified: lead.qualified },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// GET /api/leads - List leads (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check auth (implement basic token auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !verifyApiToken(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const qualified = searchParams.get('qualified');

    const where = qualified !== null ? { qualified: qualified === 'true' } : {};

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          score: true,
          qualified: true,
          email: true,
          company: true,
          createdAt: true,
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/:id - Delete a lead (admin only)
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !verifyApiToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Missing lead ID' }, { status: 400 });
    }

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

// Helper: Verify API token
function verifyApiToken(authHeader: string): boolean {
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_API_TOKEN;
}

// Helper: Trigger webhooks
async function triggerWebhooks(lead: any) {
  // Find all registered webhooks for qualified leads
  const webhooks = await prisma.webhook.findMany({
    where: {
      lead: { qualified: true },
      status: 'pending',
    },
  });

  for (const webhook of webhooks) {
    try {
      const response = await fetch(webhook.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': generateSignature(JSON.stringify(lead)),
        },
        body: JSON.stringify({
          event: 'lead.qualified',
          data: lead,
          timestamp: new Date().toISOString(),
        }),
      });

      // Update webhook status
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          status: response.ok ? 'sent' : 'failed',
          response: await response.text(),
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Failed to trigger webhook ${webhook.id}:`, error);

      await prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          status: 'failed',
          response: String(error),
        },
      });
    }
  }
}

// Helper: Generate webhook signature (HMAC-SHA256)
function generateSignature(payload: string): string {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET || 'secret')
    .update(payload)
    .digest('hex');
}
```

---

## 2. Webhook Endpoints

**File:** `src/app/api/webhooks/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// POST /api/webhooks - Register a webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !verifyApiToken(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const WebhookSchema = z.object({
      leadId: z.string(),
      endpoint: z.string().url(),
      event: z.enum(['lead.qualified', 'lead.created', 'lead.updated']),
    });

    const validation = WebhookSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    const webhook = await prisma.webhook.create({
      data: {
        leadId: validation.data.leadId,
        endpoint: validation.data.endpoint,
      },
    });

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}

// GET /api/webhooks/:id - Get webhook status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    const webhook = await prisma.webhook.findUnique({
      where: { id },
      include: { lead: true },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook' },
      { status: 500 }
    );
  }
}

// DELETE /api/webhooks/:id - Unregister webhook
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !verifyApiToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    await prisma.webhook.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}

function verifyApiToken(authHeader: string): boolean {
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_API_TOKEN;
}
```

---

## 3. CSV Export Endpoint

**File:** `src/app/api/export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/export?format=csv&qualified=true
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !verifyApiToken(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const format = searchParams.get('format') || 'csv';
    const qualified = searchParams.get('qualified');

    const where = qualified !== null ? { qualified: qualified === 'true' } : {};

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const csv = generateCsv(leads);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="leads.csv"',
        },
      });
    } else if (format === 'json') {
      return NextResponse.json(leads);
    } else {
      return NextResponse.json(
        { error: 'Unsupported format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}

function generateCsv(leads: any[]): string {
  const headers = [
    'ID',
    'Score',
    'Qualified',
    'Email',
    'Company',
    'Budget',
    'Authority',
    'Need',
    'Timeline',
    'Created',
  ];

  const rows = leads.map((lead) => [
    lead.id,
    lead.score,
    lead.qualified ? 'Yes' : 'No',
    lead.email || '',
    lead.company || '',
    (lead.breakdown?.budget || 0).toFixed(1),
    (lead.breakdown?.authority || 0).toFixed(1),
    (lead.breakdown?.need || 0).toFixed(1),
    (lead.breakdown?.timeline || 0).toFixed(1),
    lead.createdAt.toISOString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

function verifyApiToken(authHeader: string): boolean {
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_API_TOKEN;
}
```

---

## 4. CRM Integration Adapters

**File:** `src/lib/integrations/hubspot.ts`

```typescript
import type { Lead } from '@prisma/client';

interface HubSpotConfig {
  accessToken: string;
  portalId: string;
}

export class HubSpotAdapter {
  private config: HubSpotConfig;

  constructor(config: HubSpotConfig) {
    this.config = config;
  }

  /**
   * Create a contact in HubSpot
   */
  async createContact(lead: Lead): Promise<{ id: string; url: string }> {
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify({
          properties: {
            firstname: lead.company || 'Unknown',
            email: lead.email,
            company: lead.company,
            hs_lead_status: lead.qualified ? 'qualified' : 'disqualified',
            qualification_score: lead.score,
            bant_budget: lead.breakdown?.budget || 0,
            bant_authority: lead.breakdown?.authority || 0,
            bant_need: lead.breakdown?.need || 0,
            bant_timeline: lead.breakdown?.timeline || 0,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      url: `https://app.hubspot.com/contacts/${this.config.portalId}/contact/${data.id}`,
    };
  }

  /**
   * Create a deal in HubSpot for qualified leads
   */
  async createDeal(contactId: string, lead: Lead): Promise<string> {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.accessToken}`,
      },
      body: JSON.stringify({
        properties: {
          dealname: `${lead.company || 'Unknown'} - BANT Qualified`,
          dealstage: 'negotiation',
          amount: 0, // Will be filled in later
          qualification_score: lead.score,
        },
        associations: [
          {
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
            id: contactId,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }
}
```

**File:** `src/lib/integrations/salesforce.ts`

```typescript
import type { Lead } from '@prisma/client';

interface SalesforceConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
}

export class SalesforceAdapter {
  private config: SalesforceConfig;
  private accessToken?: string;

  constructor(config: SalesforceConfig) {
    this.config = config;
  }

  /**
   * Authenticate with Salesforce OAuth
   */
  private async authenticate(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const response = await fetch(`${this.config.instanceUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }).toString(),
    });

    const data = await response.json();
    this.accessToken = data.access_token;

    return this.accessToken;
  }

  /**
   * Create a lead in Salesforce
   */
  async createLead(lead: Lead): Promise<string> {
    const token = await this.authenticate();

    const response = await fetch(
      `${this.config.instanceUrl}/services/data/v60.0/sobjects/Lead/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Company: lead.company || 'Unknown',
          Email: lead.email,
          LeadSource: 'BANT Qualifier',
          Status: lead.qualified ? 'Open' : 'Disqualified',
          Rating: getRating(lead.score),
          Description: `BANT Score: ${lead.score}\nBudget: ${lead.breakdown?.budget}%\nAuthority: ${lead.breakdown?.authority}%\nNeed: ${lead.breakdown?.need}%\nTimeline: ${lead.breakdown?.timeline}%`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }
}

function getRating(score: number): string {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  return 'Cold';
}
```

---

## 5. Zapier Integration Template

**File:** `src/lib/integrations/zapier-template.json`

```json
{
  "name": "Sales Lead Qualifier",
  "description": "Automate workflows when leads qualify or disqualify",
  "triggers": [
    {
      "key": "lead_qualified",
      "name": "Lead Qualified",
      "description": "Triggers when a new lead qualifies (score >= 70)",
      "sample": {
        "id": "lead_123",
        "score": 75,
        "qualified": true,
        "email": "john@company.com",
        "company": "Acme Corp",
        "breakdown": {
          "budget": 85,
          "authority": 70,
          "need": 80,
          "timeline": 65
        },
        "createdAt": "2026-03-08T10:00:00Z"
      }
    },
    {
      "key": "lead_disqualified",
      "name": "Lead Disqualified",
      "description": "Triggers when a new lead does not qualify",
      "sample": {
        "id": "lead_124",
        "score": 45,
        "qualified": false,
        "email": "jane@startup.io",
        "company": "StartupIO",
        "breakdown": {
          "budget": 20,
          "authority": 50,
          "need": 75,
          "timeline": 30
        },
        "createdAt": "2026-03-08T11:00:00Z"
      }
    }
  ],
  "actions": [
    {
      "key": "create_lead",
      "name": "Create Lead",
      "description": "Create a new lead record with qualification data"
    }
  ]
}
```

**Zapier integration flow (example):**
```
Webhook (Sales Lead Qualifier) → Create HubSpot Contact → Add Tag (if qualified) → Send Email → Create Slack Message
```

---

## 6. Idempotency & Deduplication

**File:** `src/lib/idempotency.ts`

```typescript
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Check if request has already been processed (idempotency key)
 */
export async function checkIdempotency(
  idempotencyKey: string
): Promise<{ processed: boolean; result?: any }> {
  const cache = await prisma.idempotencyCache.findUnique({
    where: { key: idempotencyKey },
  });

  if (cache) {
    return { processed: true, result: cache.result };
  }

  return { processed: false };
}

/**
 * Store result of processing for idempotency
 */
export async function storeIdempotencyResult(
  idempotencyKey: string,
  result: any
): Promise<void> {
  await prisma.idempotencyCache.create({
    data: {
      key: idempotencyKey,
      result,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
}

/**
 * Generate idempotency key from request data
 */
export function generateIdempotencyKey(data: any): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}
```

**Add to Prisma schema:**
```prisma
model IdempotencyCache {
  key       String   @id
  result    Json
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([expiresAt])
}
```

---

## 7. API Documentation

**File:** `docs/API.md`

```markdown
# Sales Lead Qualifier API

## Base URL
```
https://qualifier.example.com/api
```

## Authentication
All endpoints (except webhooks) require an API token:
```
Authorization: Bearer YOUR_API_TOKEN
```

## Endpoints

### POST /leads
Create a new lead.

Request:
```json
{
  "score": 75,
  "qualified": true,
  "breakdown": { "budget": 85, "authority": 70, "need": 80, "timeline": 65 },
  "answers": { "budget-range": "large", ... },
  "email": "john@example.com",
  "company": "Acme Corp"
}
```

Response:
```json
{
  "id": "lead_123",
  "qualified": true
}
```

### GET /leads
List all leads.

Query params:
- `page` (default: 1)
- `limit` (default: 50)
- `qualified` (true|false)

Response:
```json
{
  "leads": [...],
  "pagination": { "page": 1, "limit": 50, "total": 100, "pages": 2 }
}
```

### GET /export?format=csv
Export leads as CSV or JSON.

### POST /webhooks
Register a webhook for lead events.

### DELETE /webhooks/:id
Unregister a webhook.
```

---

## 8. Rate Limiting for APIs

**File:** `src/middleware.ts` (additions)

```typescript
// Rate limit API endpoints
const API_RATE_LIMITS = {
  '/api/leads': { requests: 100, window: 3600 }, // 100 per hour
  '/api/webhooks': { requests: 50, window: 3600 }, // 50 per hour
  '/api/export': { requests: 10, window: 3600 }, // 10 per hour
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const limit = API_RATE_LIMITS[pathname as keyof typeof API_RATE_LIMITS];

  if (limit) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const key = `api-rate-limit:${ip}:${pathname}`;

    // Check against rate limit
    // TODO: Implement with Vercel KV
  }

  return NextResponse.next();
}
```

---

## 9. Environment Variables

```
# Admin API auth
ADMIN_API_TOKEN=your_secret_token_here
WEBHOOK_SECRET=your_webhook_secret_here

# CRM integrations (optional)
HUBSPOT_ACCESS_TOKEN=pat-...
HUBSPOT_PORTAL_ID=123456789

SALESFORCE_INSTANCE_URL=https://instance.salesforce.com
SALESFORCE_CLIENT_ID=...
SALESFORCE_CLIENT_SECRET=...

# Database (required)
DATABASE_URL=postgresql://...
```

---

## 10. Testing API Endpoints

**File:** `__tests__/api.test.ts`

```typescript
describe('API Endpoints', () => {
  describe('POST /api/leads', () => {
    it('creates a lead and triggers webhooks', async () => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          score: 75,
          qualified: true,
          breakdown: { budget: 85, authority: 70, need: 80, timeline: 65 },
          answers: {},
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
    });
  });

  describe('GET /api/leads', () => {
    it('requires authentication', async () => {
      const response = await fetch('/api/leads');
      expect(response.status).toBe(401);
    });

    it('returns paginated leads', async () => {
      const response = await fetch('/api/leads?page=1&limit=10', {
        headers: { Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('pagination');
    });
  });
});
```

---

## Deployment Checklist

- [ ] Database schema created (Prisma migrations run)
- [ ] API endpoints tested locally
- [ ] CRM integrations configured
- [ ] Webhook signature verification implemented
- [ ] Rate limiting enabled
- [ ] API documentation updated
- [ ] Zapier integration template tested
- [ ] Idempotency keys working
- [ ] Error handling for all integrations
- [ ] Webhook retry logic implemented
- [ ] API tokens securely stored
- [ ] CORS configured (if needed)
- [ ] API versioning planned
- [ ] Changelog updated

---

## Phase 2 Roadmap

- [ ] Stripe payment integration (if monetizing)
- [ ] Google Sheets integration
- [ ] Slack notifications
- [ ] Email digest reports
- [ ] Multi-user accounts & permissions
- [ ] API key management UI
- [ ] Webhook delivery logs

---

**Owner:** The Catalyst
**Next review:** After Phase 5 completion (Day 5)
