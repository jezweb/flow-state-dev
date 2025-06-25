# Integration Test Result: [Integration Name]

## Test Information
- **Date**: YYYY-MM-DD
- **Tester**: [Name]
- **Version**: [Flow State Dev version]
- **Systems Tested**: [List of integrated systems]
- **Environment**: [Test environment details]

## Integration Scenario
**Integration Focus**: [What systems are being integrated]
**Test Objective**: [What integration behavior is being validated]
**Dependencies**: [External systems or services required]

## System Configuration
```yaml
flow_state_dev: [version]
external_systems:
  - github: [version/status]
  - node: [version]
  - npm: [version]
  - git: [version]
environment_variables:
  - [Any required env vars]
```

## Test Steps
### Pre-Integration Setup
1. [Setup step 1]
2. [Setup step 2]

### Integration Testing
1. [Integration test step 1]
2. [Integration test step 2]
3. [Integration test step 3]

### Validation
1. [Validation step 1]
2. [Validation step 2]

## Results
**Status**: ✅ Pass / ❌ Fail / ⚠️ Issues Found

### Integration Points Tested
#### [System A] ↔ [System B]
- **Status**: [Pass/Fail]
- **Behavior**: [What happened]
- **Performance**: [Speed/reliability]
- **Issues**: [Any problems]

#### [System B] ↔ [System C]
- **Status**: [Pass/Fail]
- **Behavior**: [What happened]
- **Performance**: [Speed/reliability]
- **Issues**: [Any problems]

### Data Flow Validation
- **Input**: [What went in]
- **Processing**: [How it was handled]
- **Output**: [What came out]
- **Integrity**: [Data remained intact]

### Error Handling
- **Error Scenarios Tested**: [List scenarios]
- **Error Recovery**: [How system recovered]
- **Error Messages**: [Quality of error communication]

## Performance Metrics
- **Response Time**: [Time measurements]
- **Throughput**: [Volume handling]
- **Resource Usage**: [CPU/Memory]
- **Reliability**: [Success rate]

## Evidence
### System Outputs
```bash
# Command outputs, API responses, logs
```

### Configuration Files
```json
// Generated or modified configurations
```

### Network/API Calls
```http
# HTTP requests/responses if applicable
```

## Analysis
### Integration Quality
[Assessment of how well systems work together]

### Failure Points
[Where integration is most likely to break]

### Performance Characteristics
[How integration performs under load]

## Follow-up Actions
- [ ] [Performance optimization needed]
- [ ] [Error handling improvement]
- [ ] [Documentation update required]

## Related
- **GitHub Issues**: [Links to related issues]
- **API Documentation**: [Links to external API docs]
- **Previous Integration Tests**: [Links to related tests]

---
*Integration test documented as part of Flow State Dev system integration validation*