# Automated Test Result: [Test Suite Name]

## Test Information
- **Date**: YYYY-MM-DD
- **Version**: [Flow State Dev version]
- **Test Runner**: [Jest/other]
- **Environment**: [Test environment]
- **Execution Time**: [Total time]

## Test Suite Overview
**Test Suite**: [Name of test suite]
**Coverage Area**: [What functionality is covered]
**Test Count**: [Number of tests]
**Test Types**: [Unit/Integration/E2E]

## Test Execution Summary
```
Test Results Summary:
├── Total Tests: [number]
├── Passed: [number]
├── Failed: [number]
├── Skipped: [number]
├── Coverage: [percentage]
└── Duration: [time]
```

## Results by Category

### Unit Tests
**Status**: ✅ [passed]/[total] | ❌ [failed]/[total]

#### Passing Tests
- [Test name 1] - [Brief description]
- [Test name 2] - [Brief description]

#### Failing Tests
- [Test name] - [Failure reason]
- [Test name] - [Failure reason]

### Integration Tests
**Status**: ✅ [passed]/[total] | ❌ [failed]/[total]

#### Passing Tests
- [Test name 1] - [Brief description]
- [Test name 2] - [Brief description]

#### Failing Tests
- [Test name] - [Failure reason]
- [Test name] - [Failure reason]

### Performance Tests
**Status**: ✅ [passed]/[total] | ❌ [failed]/[total]

#### Performance Metrics
- [Metric 1]: [value] ([pass/fail vs threshold])
- [Metric 2]: [value] ([pass/fail vs threshold])

## Coverage Report
```
Coverage Summary:
├── Statements: [percentage]
├── Branches: [percentage]
├── Functions: [percentage]
├── Lines: [percentage]
└── Uncovered Lines: [specific lines]
```

### Coverage by Module
- **Module 1**: [percentage] coverage
- **Module 2**: [percentage] coverage
- **Module 3**: [percentage] coverage

## Detailed Failure Analysis

### Test: [Failing Test Name]
**Error Message**: 
```
[Error output]
```
**Root Cause**: [Analysis of why it failed]
**Impact**: [How this affects functionality]
**Fix Needed**: [What needs to be done]

### Test: [Another Failing Test]
**Error Message**: 
```
[Error output]
```
**Root Cause**: [Analysis of why it failed]
**Impact**: [How this affects functionality]
**Fix Needed**: [What needs to be done]

## Performance Analysis
### Execution Times
- **Fastest Test**: [test name] - [time]
- **Slowest Test**: [test name] - [time]
- **Average Test Time**: [time]

### Resource Usage
- **Peak Memory**: [MB]
- **CPU Usage**: [percentage]
- **Disk I/O**: [if significant]

## Regression Analysis
### New Failures
- [Tests that started failing]

### Fixed Issues
- [Tests that started passing]

### Performance Changes
- [Tests that got faster/slower]

## Test Environment Details
```yaml
os: [operating system]
node_version: [version]
npm_version: [version]
dependencies:
  - [key dependency]: [version]
  - [key dependency]: [version]
```

## Raw Test Output
```bash
# Full test runner output (truncated if very long)
```

## Follow-up Actions
### Critical (Fix Before Release)
- [ ] [Critical failing test fix]
- [ ] [Security-related test failure]

### Important (Fix Soon)
- [ ] [Important failing test fix]
- [ ] [Performance regression fix]

### Nice to Have
- [ ] [Coverage improvement]
- [ ] [Test optimization]

## Related
- **GitHub Issues**: [Links to issues for failing tests]
- **Previous Test Runs**: [Links to recent test results]
- **CI/CD Pipeline**: [Link to automated run if applicable]

---
*Automated test results documented as part of Flow State Dev continuous testing*