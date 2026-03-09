# Security Hardening Test Plan

## Quick Start Testing

### 1. Verify Security Headers

```bash
# Check Content-Security-Policy header
curl -I https://localhost:3000 | grep -i content-security-policy

# Check all security headers
curl -I https://localhost:3000 | grep -i "x-\|strict-\|referrer-\|permissions-\|content-security"
```

**Expected**: All 7 security headers present in response

### 2. Test Result Page Validation

#### Valid Request

```
Visit: http://localhost:3000/result?score=75&qualified=true&breakdown=%7B%22budget%22%3A80%2C%22authority%22%3A70%2C%22need%22%3A85%2C%22timeline%22%3A60%7D
Expected: Results page renders with score 75
```

#### Invalid Score (too high)

```
Visit: http://localhost:3000/result?score=150&qualified=true&breakdown=%7B%22budget%22%3A80%7D
Expected: Redirects to /
```

#### Invalid Score (non-numeric)

```
Visit: http://localhost:3000/result?score=abc&qualified=true&breakdown=%7B%22budget%22%3A80%7D
Expected: Redirects to /
```

#### Invalid Qualified (wrong value)

```
Visit: http://localhost:3000/result?score=75&qualified=maybe&breakdown=%7B%22budget%22%3A80%7D
Expected: Redirects to /
```

#### Invalid Breakdown (uppercase keys)

```
Visit: http://localhost:3000/result?score=75&qualified=true&breakdown=%7B%22BUDGET%22%3A80%7D
Expected: Redirects to /
```

#### Invalid Breakdown (values > 100)

```
Visit: http://localhost:3000/result?score=75&qualified=true&breakdown=%7B%22budget%22%3A150%7D
Expected: Redirects to /
```

#### Missing Breakdown

```
Visit: http://localhost:3000/result?score=75&qualified=true
Expected: Redirects to /
```

### 3. Test Server-Side Score API

#### Valid Request

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "budget-range": "large",
      "budget-approval": "approved",
      "decision-role": "decision_maker",
      "buying-process": "agile",
      "pain-points": "critical",
      "urgency": "immediate",
      "implementation": "quick"
    }
  }'
```

**Expected Response (200 OK)**:

```json
{
  "totalScore": 100,
  "qualified": true,
  "breakdown": {
    "budget": 100,
    "authority": 100,
    "need": 100,
    "timeline": 100
  }
}
```

#### Invalid JSON

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d 'not valid json'
```

**Expected**: 400 Bad Request with error message

#### Invalid Answers (too long value)

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "budget-range": "this value is way too long and exceeds fifty characters which is the maximum allowed"
    }
  }'
```

**Expected**: 400 Bad Request

#### Invalid Answers (too many answers)

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "q1": "a", "q2": "a", "q3": "a", "q4": "a", "q5": "a",
      "q6": "a", "q7": "a", "q8": "a", "q9": "a", "q10": "a",
      "q11": "a", "q12": "a", "q13": "a", "q14": "a", "q15": "a",
      "q16": "a", "q17": "a", "q18": "a", "q19": "a", "q20": "a",
      "q21": "a", "q22": "a", "q23": "a", "q24": "a", "q25": "a",
      "q26": "a", "q27": "a", "q28": "a", "q29": "a", "q30": "a",
      "q31": "a", "q32": "a", "q33": "a", "q34": "a", "q35": "a",
      "q36": "a", "q37": "a", "q38": "a", "q39": "a", "q40": "a",
      "q41": "a", "q42": "a", "q43": "a", "q44": "a", "q45": "a",
      "q46": "a", "q47": "a", "q48": "a", "q49": "a", "q50": "a",
      "q51": "a"
    }
  }'
```

**Expected**: 400 Bad Request

#### Invalid Answers (invalid key characters)

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "budget@range": "large"
    }
  }'
```

**Expected**: 400 Bad Request

### 4. Test Rate Limiting

```bash
# Make 21 requests in rapid succession to /api/score
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/score \
    -H "Content-Type: application/json" \
    -d '{"answers":{"budget-range":"large"}}' 2>/dev/null | jq '.error' 2>/dev/null || echo "Request $i"
done
```

**Expected**: Requests 1-20 process normally, request 21+ returns 429 with "Rate limit exceeded"

### 5. Test X-Request-ID Header

```bash
# Check that X-Request-ID is present and unique
curl -I http://localhost:3000/ | grep x-request-id
curl -I http://localhost:3000/ | grep x-request-id
curl -I http://localhost:3000/ | grep x-request-id
```

**Expected**: Three different UUID values in X-Request-ID headers

## Unit Test Examples

### Validation Functions

```typescript
import {
  isValidScore,
  isValidQualified,
  isValidBreakdown,
  isValidAnswers,
  sanitizeString,
} from "@/lib/validation";

describe("isValidScore", () => {
  test("accepts valid scores 0-100", () => {
    expect(isValidScore("0")).toBe(true);
    expect(isValidScore("50")).toBe(true);
    expect(isValidScore("100")).toBe(true);
  });

  test("rejects invalid scores", () => {
    expect(isValidScore("150")).toBe(false);
    expect(isValidScore("-1")).toBe(false);
    expect(isValidScore("abc")).toBe(false);
    expect(isValidScore(null)).toBe(false);
    expect(isValidScore("")).toBe(false);
  });
});

describe("isValidQualified", () => {
  test("accepts true and false strings", () => {
    expect(isValidQualified("true")).toBe(true);
    expect(isValidQualified("false")).toBe(true);
  });

  test("rejects other values", () => {
    expect(isValidQualified("True")).toBe(false);
    expect(isValidQualified("1")).toBe(false);
    expect(isValidQualified("yes")).toBe(false);
    expect(isValidQualified(null)).toBe(false);
  });
});

describe("isValidBreakdown", () => {
  test("accepts valid breakdown objects", () => {
    expect(
      isValidBreakdown({
        budget: 80,
        authority: 70,
        need: 85,
        timeline: 60,
      }),
    ).toBe(true);
  });

  test("rejects uppercase keys", () => {
    expect(isValidBreakdown({ BUDGET: 80 })).toBe(false);
  });

  test("rejects values outside 0-100", () => {
    expect(isValidBreakdown({ budget: 150 })).toBe(false);
    expect(isValidBreakdown({ budget: -10 })).toBe(false);
  });

  test("rejects too many keys", () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 11; i++) {
      obj[`key_${i}`] = 50;
    }
    expect(isValidBreakdown(obj)).toBe(false);
  });

  test("rejects non-object values", () => {
    expect(isValidBreakdown(null)).toBe(false);
    expect(isValidBreakdown(undefined)).toBe(false);
    expect(isValidBreakdown([])).toBe(false);
    expect(isValidBreakdown("string")).toBe(false);
  });
});

describe("isValidAnswers", () => {
  test("accepts valid answers", () => {
    expect(
      isValidAnswers({
        "budget-range": "large",
        "budget-approval": "approved",
      }),
    ).toBe(true);
  });

  test("rejects non-string values", () => {
    expect(
      isValidAnswers({
        "budget-range": 123,
      }),
    ).toBe(false);
  });

  test("rejects values > 50 chars", () => {
    expect(
      isValidAnswers({
        "budget-range": "a".repeat(51),
      }),
    ).toBe(false);
  });

  test("rejects invalid key names", () => {
    expect(
      isValidAnswers({
        "budget@range": "large",
      }),
    ).toBe(false);
  });

  test("rejects too many answers", () => {
    const answers: Record<string, string> = {};
    for (let i = 0; i < 51; i++) {
      answers[`q${i}`] = "answer";
    }
    expect(isValidAnswers(answers)).toBe(false);
  });
});

describe("sanitizeString", () => {
  test("removes HTML tags", () => {
    expect(sanitizeString("<script>alert('xss')</script>")).toBe("alert('xss')");
    expect(sanitizeString("<img src=x onerror='alert(1)'>")).toBe("");
  });

  test("respects maxLength", () => {
    const long = "a".repeat(100);
    expect(sanitizeString(long, 50).length).toBe(50);
  });

  test("handles non-strings", () => {
    expect(sanitizeString(null as any)).toBe("");
    expect(sanitizeString(undefined as any)).toBe("");
  });
});
```

## Security Scanning

### Manual Security Checklist

- [ ] No hardcoded credentials in code
- [ ] No sensitive data in error messages
- [ ] No sensitive data in logs
- [ ] API keys use environment variables only
- [ ] HTTPS enforced via HSTS header
- [ ] XSS prevention via CSP header
- [ ] Clickjacking prevention via X-Frame-Options
- [ ] MIME sniffing prevention via X-Content-Type-Options
- [ ] Input validation on all user-controlled parameters
- [ ] SQL injection not possible (no database in scope, but patterns correct)
- [ ] Command injection not possible
- [ ] Proper error handling without information leakage

### Automated Scanning Commands

```bash
# Check for hardcoded credentials
grep -r "password\|secret\|api.key\|token" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "apiKey\|API_KEY" # exclude variable names

# Check for console.log in production code
grep -r "console\." src/app/api --include="*.ts" | grep -v "console.error"

# Check for eval or Function constructor
grep -r "eval\|Function(" src/ --include="*.ts" --include="*.tsx"

# Check for unencrypted storage
grep -r "localStorage\|sessionStorage" src/ --include="*.ts" --include="*.tsx" | grep -v "test"
```

## Performance Testing

### Rate Limit Performance

```bash
# Measure response time with rate limiting active
time curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{"answers":{"budget-range":"large"}}'
```

**Expected**: Response time < 100ms for valid requests

### Concurrent Requests

```bash
# Test 10 concurrent valid requests
for i in {1..10}; do
  (curl -X POST http://localhost:3000/api/score \
    -H "Content-Type: application/json" \
    -d '{"answers":{"budget-range":"large"}}' &)
done
wait
```

**Expected**: All requests succeed (all under the 20-request limit)

## Production Checklist

Before deploying to production:

- [ ] Run full test suite
- [ ] Test security headers in production environment
- [ ] Enable HTTPS/TLS
- [ ] Configure HSTS with preload list
- [ ] Set up security monitoring/alerting
- [ ] Review rate limiting window for production traffic
- [ ] Consider using Redis for distributed rate limiting
- [ ] Set up request logging for audit trail
- [ ] Document security features for team
- [ ] Run security vulnerability scan
- [ ] Set up regular security updates for dependencies
