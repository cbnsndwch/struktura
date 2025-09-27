# Testing Roadmap 🗺️

## Next Immediate Action ✅

### Option A: Enable Current E2E Tests (Quick)
Remove `.skip` from `auth.e2e.spec.ts`, then run:
```bash
pnpm test auth.e2e.spec.ts
```

### Option B: Switch to Local Test Database (Recommended)

**Problem with MongoDB Memory Server:** Slow startup, binary downloads, CI/CD resource constraints

**Solution:** Use local test database for faster, more reliable E2E tests:

```bash
# Set up dedicated test database
docker run -d --name struktura-test-db -p 27118:27017 mongo:7.0
```

**Update E2E setup:**
```typescript
beforeAll(async () => {
    process.env.DATABASE_URL = 'mongodb://localhost:27118/struktura-test-e2e';
    // Skip MongoDB Memory Server setup
    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule]
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Clean database before tests
    const mongoose = app.get('DatabaseConnection');
    await mongoose.connection.db.dropDatabase();
});
```

**Benefits:** ✅ Fast startup ✅ Real MongoDB ✅ Reliable CI/CD ✅ Full workflow testing

## Short Term: Expand Coverage

### 1. More Unit Tests
- Edge cases (malformed emails, concurrent registrations)
- Security scenarios (timing attacks, token expiration)

### 2. Controller Tests  
- HTTP layer validation
- Rate limiting behavior
- Guard failure handling

### 3. Integration Tests
- Database connection failures
- Transaction integrity

## Medium Term: Production Readiness

### 1. Performance & Security
- Load testing (concurrent users, memory profiling)
- Security testing (brute force prevention, token manipulation)
- Error recovery (database failures, service resilience)

### 2. Monitoring & Observability  
- Metrics for success/failure rates
- Security event logging
- Request tracing for debugging

## Alternative E2E Approaches

### GitHub Actions (CI/CD)
```yaml
services:
  mongodb:
    image: mongo:7.0
    ports:
      - 27118:27017
```

### Testcontainers (Advanced)
```typescript
import { MongoDBContainer } from '@testcontainers/mongodb';
const mongoContainer = await new MongoDBContainer('mongo:7.0').start();
```

## Success Metrics Checklist

- [ ] All E2E workflow tests passing
- [ ] 90%+ code coverage on auth module  
- [ ] Performance benchmarks established
- [ ] Production monitoring in place
