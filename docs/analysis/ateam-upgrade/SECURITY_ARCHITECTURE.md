# Security Architecture

## Threat Model

### Assets at Risk

- User input data (qualification responses)
- Qualification results and scores
- Application availability
- System reputation

### Threat Actors

- External attackers
- Malicious users
- Accidental misuse

### Attack Vectors

#### 1. Parameter Tampering (Result Page)

**Vector**: Modify URL parameters to show false qualification results

- Example: `/result?score=100&qualified=true` (unqualified user shows as qualified)

**Likelihood**: High (easy to attempt)
**Impact**: Medium (false lead qualification, wasted sales time)

**Mitigation**:

- Server-side validation of all parameters
- Type-safe validation functions with strict rules
- Redirect to home on invalid input (no error messages)
- Future: Server-side result page generation

#### 2. API Abuse / Scoring Manipulation

**Vector**: Craft invalid answers to game the scoring system

- Example: Send extremely high or low point values
- Example: Send hundreds of fake answers

**Likelihood**: Medium (requires understanding of system)
**Impact**: High (can produce fake leads)

**Mitigation**:

- Input validation on API (max 50 answers, values < 50 chars)
- Server-side scoring calculation
- Rate limiting (20 requests/hour)
- Answer validation against known question IDs (future)

#### 3. Denial of Service (DoS)

**Vector**: Flood API with requests to make service unavailable

- Example: 1000 requests/second to `/api/score`

**Likelihood**: Low (cost/benefit, distributed service)
**Impact**: High (service unavailable)

**Mitigation**:

- Middleware rate limiting (20 requests/hour per IP)
- In-memory store with automatic cleanup
- Future: Implement Cloudflare/WAF rate limiting
- Future: Distributed rate limiting with Redis

#### 4. Cross-Site Scripting (XSS)

**Vector**: Inject JavaScript through unsanitized parameters

- Example: `?score=<script>alert('xss')</script>`

**Likelihood**: Low (validation + CSP)
**Impact**: High (session hijacking, data theft)

**Mitigation**:

- Content-Security-Policy header prevents inline scripts
- Input validation rejects non-numeric score
- React escapes output by default
- X-XSS-Protection header as fallback

#### 5. Clickjacking

**Vector**: Embed result page in malicious iframe

- Example: Attacker shows fake results in their iframe

**Likelihood**: Low (niche attack)
**Impact**: Medium (confusion, brand damage)

**Mitigation**:

- X-Frame-Options: DENY prevents embedding
- Frame-ancestors CSP directive

#### 6. MIME Sniffing

**Vector**: Serve HTML as different content type

- Example: Browser interprets JSON as HTML/JavaScript

**Likelihood**: Low (browser-specific)
**Impact**: Medium (XSS via MIME sniffing)

**Mitigation**:

- X-Content-Type-Options: nosniff header
- Explicit Content-Type on all responses

#### 7. Man-in-the-Middle (MITM)

**Vector**: Intercept unencrypted traffic

- Example: Attacker modifies responses or steals data

**Likelihood**: Medium (depends on network)
**Impact**: Critical (data theft, session hijacking)

**Mitigation**:

- Strict-Transport-Security header enforces HTTPS
- 1-year max age + subdomains
- Future: HSTS preload list submission

## Security Controls

### Layer 1: Network / HTTP Headers (next.config.ts)

| Header                    | Value                                    | Purpose                        |
| ------------------------- | ---------------------------------------- | ------------------------------ |
| Content-Security-Policy   | Strict source whitelist                  | Prevent XSS, data exfiltration |
| X-Content-Type-Options    | nosniff                                  | Prevent MIME sniffing          |
| X-Frame-Options           | DENY                                     | Prevent clickjacking           |
| X-XSS-Protection          | 1; mode=block                            | Enable browser XSS filtering   |
| Referrer-Policy           | strict-origin-when-cross-origin          | Limit referer leakage          |
| Permissions-Policy        | camera=(), microphone=(), geolocation=() | Disable sensors                |
| Strict-Transport-Security | max-age=31536000; includeSubDomains      | Enforce HTTPS                  |

### Layer 2: Request Processing (middleware.ts)

**Request ID**: Unique UUID per request

- Purpose: Audit trail, debugging, correlation
- Header: X-Request-ID
- Location: All responses

**Rate Limiting**: IP-based request throttling

- Limit: 20 requests/hour per IP
- Window: 1 hour (3600 seconds)
- Scope: `/api/*` routes only
- Storage: In-memory Map with automatic cleanup
- Response: HTTP 429 (Too Many Requests)

**Scope**: All routes (via matcher pattern)
**Exclusions**: Static assets (\_next/static, \_next/image, favicon.ico)

### Layer 3: Input Validation (lib/validation.ts)

#### Score Parameter

```
Input: String
Validation:
  - Not null/empty
  - Parses to integer
  - Value 0-100
Output: Boolean (valid/invalid)
```

#### Qualified Parameter

```
Input: String
Validation:
  - Must be exactly "true" or "false"
Output: Boolean (valid/invalid)
```

#### Breakdown Parameter

```
Input: JSON string (URL-encoded)
Validation:
  - Parses valid JSON
  - Is object (not array, null, etc.)
  - Max 10 keys
  - Keys match /^[a-z_]{1,20}$/
  - Values are numbers 0-100
Output: Type guard (Record<string, number> or false)
```

#### Answers (API)

```
Input: Object
Validation:
  - Is object (not array, null, etc.)
  - Max 50 key-value pairs
  - Keys match /^[a-zA-Z0-9_-]+$/
  - Values are strings < 50 chars
Output: Type guard (Record<string, string> or false)
```

### Layer 4: Application Logic (result/page.tsx, api/score/route.ts)

**Result Page**:

- Validates all three parameters before rendering
- Redirects to "/" on validation failure
- No error messages leaked (privacy)
- Server-side qualified flag use (cannot be overridden by user)

**Score API**:

- Validates answers object
- Calculates score server-side (not client)
- Returns percentages only (not raw scores to avoid reverse engineering)
- Proper HTTP status codes (400 for input, 500 for server error)
- Error messages don't leak internal details

## Data Flow Security

```
User Input (URL/JSON)
    ↓
Middleware (Rate limit + Request ID)
    ↓
Application Handler
    ↓
Input Validation (Type guard functions)
    ↓
(Invalid? → Redirect or 400 Error)
    ↓
Business Logic (calculateScore)
    ↓
HTTP Response + Security Headers
    ↓
Client Browser (CSP enforced)
```

## Security Assumptions

### In Scope

- Protection against common web attacks (XSS, CSRF, clickjacking)
- Input validation and injection prevention
- Rate limiting and availability
- Basic request tracking

### Out of Scope (Would require additional measures)

- Authentication/authorization (no user accounts currently)
- Database security (no database in scope)
- Encryption at rest (not applicable currently)
- Physical security
- Supply chain security
- Advanced persistent threats (APT)

## Defense in Depth

### Multiple Layers of Protection

```
Attack Vector 1: URL Parameter Tampering
  Defense 1: Client-side validation (basic UX)
  Defense 2: Middleware rate limiting
  Defense 3: Server-side strict validation
  Defense 4: Application-level checks
  Result: Cannot bypass all layers

Attack Vector 2: XSS via parameters
  Defense 1: CSP header (Content-Security-Policy)
  Defense 2: Input validation rejects HTML
  Defense 3: React auto-escaping
  Defense 4: X-XSS-Protection header
  Result: Multiple escape hatches needed

Attack Vector 3: DoS via API
  Defense 1: Rate limiting per IP
  Defense 2: Input validation (reject > 50 answers)
  Defense 3: Future: Cloudflare/WAF rules
  Defense 4: Future: Request signing
  Result: Cost-prohibitive for attackers
```

## Compliance & Standards

### OWASP Top 10 (2021) Coverage

1. **Broken Access Control**: N/A (no user system)
2. **Cryptographic Failures**: HSTS + HTTPS enforcement
3. **Injection**: Input validation on all parameters + type guards
4. **Insecure Design**: Security headers + rate limiting by design
5. **Security Misconfiguration**: Secure defaults in next.config.ts
6. **Vulnerable Components**: No external security dependencies
7. **Authentication Failures**: N/A (no authentication required)
8. **Data Integrity Failures**: Server-side scoring (source of truth)
9. **Logging & Monitoring**: X-Request-ID for audit trail
10. **SSRF**: N/A (no external requests in scope)

### CWE Coverage

- **CWE-20** (Improper Input Validation): ✓ Addressed
- **CWE-94** (Code Injection): ✓ Prevented via validation
- **CWE-95** (Improper Neutralization of Directives): ✓ CSP + validation
- **CWE-189** (Numeric Errors): ✓ Type validation
- **CWE-400** (Uncontrolled Resource Consumption): ✓ Rate limiting
- **CWE-611** (Improper XML Processing): N/A
- **CWE-639** (Authorization Bypass): ✓ Server-side validation
- **CWE-942** (Permissive Cross-domain Policy): ✓ CORS not enabled

## Security Testing Strategy

### Automated Testing

- Unit tests for validation functions
- Integration tests for API endpoints
- Security header verification
- Rate limiting verification

### Manual Testing

- Parameter tampering attempts
- XSS payload testing
- API endpoint probing
- Rate limit threshold testing

### Code Review

- Input validation completeness
- Error message information leakage
- Rate limiting algorithm correctness
- Dependency security

## Incident Response

### If Attack Detected

1. **Immediate** (0-15 min)
   - Rate limiting blocks malicious IP
   - Request ID logs all activity
   - No data breach possible (server-side validation)

2. **Short Term** (15-60 min)
   - Review request logs (X-Request-ID)
   - Identify attack pattern
   - Consider additional rate limit adjustment
   - Contact security team

3. **Long Term** (1-7 days)
   - Root cause analysis
   - Implement additional controls if needed
   - Update SECURITY_HARDENING.md
   - Communicate with team
   - Monitor for similar attacks

## Future Enhancements

### High Priority

- [ ] Implement distributed rate limiting (Redis)
- [ ] Add request logging to persistent storage
- [ ] Set up security monitoring/alerting
- [ ] Answer validation against known question IDs
- [ ] Server-side result page generation (remove URL params)

### Medium Priority

- [ ] Implement request signing for sensitive operations
- [ ] Add CSRF protection tokens
- [ ] Implement WAF rules (Cloudflare/AWS WAF)
- [ ] Add encryption for sensitive data in transit
- [ ] Set up security scanning in CI/CD

### Low Priority

- [ ] API authentication (if multi-tenant)
- [ ] Database encryption at rest (if database added)
- [ ] Hardware security module (HSM) integration
- [ ] Penetration testing service
- [ ] Bug bounty program

## Security Contacts

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email: [security contact] with details
3. Include: Description, reproduction steps, impact assessment
4. Timeline: We aim to respond within 24 hours

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Next.js Security Best Practices](https://nextjs.org/docs/deployment#security-headers)
- [Content-Security-Policy MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HSTS Preload List](https://hstspreload.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
