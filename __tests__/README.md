# Testing Guide

This document describes the comprehensive test suite for the Sales Lead Qualifier application.

## Overview

The project uses **Jest** as the test runner with **TypeScript** support via ts-jest. React components are tested using **React Testing Library**, which focuses on testing behavior rather than implementation details.

## Test Coverage

Current coverage metrics:
- **Overall**: 100% statement coverage, 95% branch coverage
- **Components**: 100% coverage (ProgressBar, QuestionCard)
- **Scoring Engine**: 100% coverage with 20 comprehensive tests
- **Configuration**: 100% coverage with validation tests
- **Integration**: Full qualification flow testing

### Coverage Breakdown

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| Components | 100% | 100% | 100% | 100% |
| Scoring | 100% | 90% | 100% | 100% |
| Config | 100% | 100% | 100% | 100% |
| **Total** | **100%** | **95%** | **100%** | **100%** |

## Test Structure

### 1. Unit Tests

#### Scoring Engine (`__tests__/scoring.test.ts`)
20 comprehensive tests covering:
- Basic functionality and return types
- Qualified vs. disqualified leads
- Threshold behavior (above, below, at threshold)
- Weight application and dimension calculations
- Partial and missing answers handling
- Breakdown metric accuracy
- Rounding precision
- Real-world scenarios

**Run individual test:**
```bash
npm test -- scoring.test.ts
```

#### Configuration Validation (`__tests__/config.test.ts`)
40+ tests ensuring configuration integrity:
- Dimension weights sum to 1.0
- All questions have required fields and IDs
- All options have 2+ answers with 0-100 point values
- Threshold is between 0-100
- Outcomes have required fields (headline, cta, ctaUrl)
- No duplicate question/option IDs
- Business rule validation (weight hierarchy)

**Run individual test:**
```bash
npm test -- config.test.ts
```

### 2. Component Tests

#### ProgressBar Component (`__tests__/components/ProgressBar.test.tsx`)
15 tests covering:
- Rendering all step labels and numbers
- Current step highlighting (visual indicators)
- Progress bar width updates based on current step
- Step counter text accuracy
- Edge cases (single step, many steps)

**Key test areas:**
- ✅ Renders correct step count
- ✅ Highlights current and completed steps
- ✅ Shows dimension names from labels
- ✅ Updates progress bar width proportionally

**Run individual test:**
```bash
npm test -- ProgressBar.test.tsx
```

#### QuestionCard Component (`__tests__/components/QuestionCard.test.tsx`)
35 tests covering:
- Question text and option rendering
- Selection callback handling
- Selected option visual highlighting (blue border, background)
- Radio button indicator state
- Checkmark SVG display
- Hover states for unselected options
- Accessibility (clickable buttons)
- Edge cases (long text, many options, undefined selection)

**Key test areas:**
- ✅ Renders question text
- ✅ Renders all options as buttons
- ✅ Calls onSelect with correct question ID and value
- ✅ Highlights selected option with blue styling
- ✅ Shows checkmark only in selected option

**Run individual test:**
```bash
npm test -- QuestionCard.test.tsx
```

### 3. Integration Tests

#### Qualification Flow (`__tests__/integration/qualification-flow.test.ts`)
25 tests covering end-to-end scenarios:
- Complete qualified lead flow (perfect answers)
- Complete disqualified lead flow (poor answers)
- Progressive answer submission with score updates
- Threshold boundary cases (exact, above, below)
- Config/scoring alignment verification
- Real-world scenarios:
  - Mid-market prospect with mixed signals
  - Enterprise prospect with high friction
  - Low-priority inquiry
  - Budget without urgency

**Key test areas:**
- ✅ Full flow: questions → answers → score → qualified
- ✅ Dimension breakdown matches config dimensions
- ✅ Weights are applied correctly
- ✅ Outcomes available for both qualified/disqualified states

**Run individual test:**
```bash
npm test -- qualification-flow.test.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Re-run on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

Generates HTML coverage report in `coverage/` directory. Open in browser:
```bash
open coverage/lcov-report/index.html
```

### Specific Test Suite
```bash
npm test -- scoring.test.ts
npm test -- ProgressBar.test.tsx
npm test -- config.test.ts
```

### Specific Test Case
```bash
npm test -- --testNamePattern="should calculate score"
```

### Watch Specific File
```bash
npm test -- --watch scoring.test.ts
```

## Test Environment Configuration

The project supports two Jest environments:

### Node Environment (Default)
Used for:
- Scoring calculations
- Configuration validation
- Integration tests

### jsdom Environment
Used for:
- Component tests (requires DOM)
- Configured via `/** @jest-environment jsdom */` doc block in each component test file

**jest.config.ts** is configured to:
- Use ts-jest preset for TypeScript support
- Map `@/` alias to `src/` directory
- Exclude page components from coverage (app/layout.tsx, app/page.tsx, app/result/page.tsx)

## Writing New Tests

### Component Test Template
```typescript
/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

### Unit Test Template
```typescript
import { myFunction } from '@/lib/mylib';

describe('myFunction', () => {
  it('should handle normal input', () => {
    const result = myFunction({ input: 'value' });
    expect(result).toBeDefined();
  });
});
```

### Testing Best Practices

1. **Test Behavior, Not Implementation**
   - ❌ Test that a function calls another internal function
   - ✅ Test the output matches expected behavior

2. **Descriptive Test Names**
   - ❌ `it('works', () => {})`
   - ✅ `it('should highlight the current step with blue background', () => {})`

3. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should update score when answer is selected', () => {
     // Arrange
     const mockOnSelect = jest.fn();
     render(<QuestionCard {...props} onSelect={mockOnSelect} />);

     // Act
     fireEvent.click(screen.getByText('Option'));

     // Assert
     expect(mockOnSelect).toHaveBeenCalledWith('question-id', 'value');
   });
   ```

4. **Use User-Centric Queries**
   ```typescript
   // ✅ Good - what users interact with
   screen.getByRole('button', { name: /submit/i })
   screen.getByText(/error message/)

   // ❌ Avoid - implementation details
   container.querySelector('.submit-button')
   wrapper.find({ className: 'error' })
   ```

5. **Mock External Dependencies**
   ```typescript
   jest.mock('@/lib/api');
   import * as api from '@/lib/api';
   // Configure mock
   api.fetchData.mockResolvedValue({ data: [] });
   ```

## Coverage Goals

- **New Code**: 100% coverage required before merge
- **Overall**: Maintain minimum 80% coverage
- **Critical Paths**: 95%+ coverage (scoring, qualification logic)
- **Components**: 100% coverage

## Troubleshooting

### Common Issues

**"ReferenceError: Cannot find module"**
- Ensure path aliases in jest.config.ts match tsconfig.json
- Verify imports use @/ alias: `import { x } from '@/lib/x'`

**"Cannot find jsdom environment"**
- Install: `npm install --save-dev jest-environment-jsdom`
- Add doc block: `/** @jest-environment jsdom */`

**Tests timeout**
- Increase timeout for async operations: `it('async test', async () => {}, 10000)`
- Mock API calls to avoid real requests

**Coverage not updating**
- Clear Jest cache: `npm test -- --clearCache`
- Ensure file is in collectCoverageFrom pattern

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```bash
# In CI environment
npm run test:coverage

# Will exit with code 1 if:
# - Any test fails
# - Coverage threshold not met
# - Errors occur
```

Suggested GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Test Data and Fixtures

### Reusable Test Questions
The QuestionCard and ProgressBar tests define mockQuestion and mockLabels locally for clarity and isolation.

### Config-Driven Tests
The scoring and config tests use the actual qualificationConfig to ensure tests validate real configuration.

### Answer Patterns
Integration tests demonstrate realistic answer patterns:
- All strong answers (qualified)
- All weak answers (disqualified)
- Mixed signals (mid-market)
- Progressive answering (step-by-step)

## Performance

Current test suite performance:
- **Total Runtime**: ~1.7 seconds
- **107 Tests**: Passes in single run
- **No Flakiness**: Deterministic, no timing dependencies

## Continuous Improvement

Areas for future enhancement:
1. **E2E Tests**: Add Playwright/Cypress tests for full user flows
2. **Performance Tests**: Benchmark scoring calculations
3. **Accessibility Tests**: Validate WCAG compliance
4. **Visual Regression Tests**: Catch unintended UI changes

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [TypeScript with Jest](https://jestjs.io/docs/getting-started#using-typescript)
