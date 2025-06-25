# Extended Thinking Commands Guide

## Overview

Extended Thinking Commands are a revolutionary feature in Flow State Dev v0.13.0 that enable deep, systematic analysis of complex technical challenges. These commands leverage explicit extended thinking mode to provide comprehensive insights, multi-perspective analysis, and actionable recommendations.

## What is Extended Thinking?

Extended thinking is a cognitive approach where complex problems are analyzed from multiple angles, considering various perspectives, implications, and trade-offs. In Flow State Dev, these commands:

1. **Demonstrate thinking processes** - Show how decisions are made
2. **Generate comprehensive reports** - Create detailed markdown documentation
3. **Produce Architecture Decision Records (ADRs)** - Document important decisions
4. **Provide actionable insights** - Deliver practical recommendations

## Available Commands

### 1. `/plan` - Comprehensive Planning

The `/plan` command helps you think through complex features or architectural changes systematically.

**Usage:**
```bash
fsd slash "/plan --topic 'microservices migration' --create-adr"
fsd slash "/pl --topic 'authentication system' --depth deep"
```

**What it analyzes:**
- Multiple implementation approaches
- Risk assessment and mitigation strategies
- Resource requirements and timeline
- Technical dependencies
- Success criteria and metrics

**Output includes:**
- Executive summary
- Detailed implementation roadmap
- Risk matrix with mitigation plans
- Resource allocation recommendations
- Optional ADR generation

### 2. `/investigate` - Deep Technical Investigation

The `/investigate` command performs multi-source analysis of technical issues or questions.

**Usage:**
```bash
fsd slash "/investigate --question 'memory leak in production'"
fsd slash "/inv --question 'API performance degradation' --sources performance,code"
```

**Investigation process:**
- Evidence gathering from multiple sources
- Pattern recognition and correlation
- Root cause analysis
- Solution hypothesis generation
- Verification approach

**Output includes:**
- Investigation summary
- Evidence compilation
- Identified patterns
- Recommended solutions
- Further investigation paths

### 3. `/decide` - Structured Decision Making

The `/decide` command helps make informed technical decisions through systematic evaluation.

**Usage:**
```bash
fsd slash "/decide --decision 'database technology' --alternatives 5 --create-adr"
fsd slash "/dec --decision 'frontend framework' --criteria performance,learning-curve"
```

**Decision process:**
- Alternative generation
- Criteria definition and weighting
- Trade-off analysis
- Risk assessment
- Recommendation formulation

**Output includes:**
- Decision matrix
- Comparative analysis
- Risk/benefit assessment
- Final recommendation with rationale
- Optional ADR with full context

### 4. `/estimate` - Complex Work Estimation

The `/estimate` command provides multi-method estimation with confidence intervals.

**Usage:**
```bash
fsd slash "/estimate --work 'complete user dashboard' --confidence"
fsd slash "/est --work 'API migration' --method story-points"
```

**Estimation methods:**
- Story point estimation
- Time-based estimation
- Complexity analysis
- Risk factor adjustment
- Historical comparison

**Output includes:**
- Multiple estimation scenarios
- Confidence intervals
- Risk factors and adjustments
- Breakdown of work items
- Recommended buffer time

### 5. `/debug:strategy` - Strategic Debugging

The `/debug:strategy` command creates systematic debugging approaches for complex issues.

**Usage:**
```bash
fsd slash "/debug:strategy --problem 'intermittent crashes' --urgency high"
fsd slash "/debug:strategy --problem 'data corruption' --symptoms 'inconsistent state'"
```

**Strategy includes:**
- Systematic investigation steps
- Hypothesis generation
- Testing approach
- Tool recommendations
- Escalation paths

### 6. `/optimize:plan` - Performance Optimization

The `/optimize:plan` command develops comprehensive optimization strategies.

**Usage:**
```bash
fsd slash "/optimize:plan --target 'page load time' --metrics 'LCP,FID,CLS'"
fsd slash "/optimize:plan --target 'database queries' --constraints 'read-heavy'"
```

**Planning includes:**
- Current state analysis
- Bottleneck identification
- Optimization strategies
- Implementation prioritization
- Measurement framework

### 7. `/refactor:plan` - Refactoring Strategy

The `/refactor:plan` command creates safe, systematic refactoring approaches.

**Usage:**
```bash
fsd slash "/refactor:plan --scope 'authentication module' --goals 'testability,security'"
fsd slash "/refactor:plan --scope 'legacy API' --preserve 'backward-compatibility'"
```

**Strategy includes:**
- Risk assessment
- Step-by-step approach
- Testing strategy
- Rollback planning
- Success metrics

### 8. `/research` - Technical Research

The `/research` command conducts in-depth technical research on topics.

**Usage:**
```bash
fsd slash "/research --topic 'event sourcing' --depth deep"
fsd slash "/res --topic 'WebAssembly applications' --output detailed"
```

**Research includes:**
- Literature review
- Technology comparison
- Best practices compilation
- Implementation examples
- Recommendations

### 9. `/alternatives` - Alternative Generation

The `/alternatives` command generates and evaluates multiple options.

**Usage:**
```bash
fsd slash "/alternatives --for 'state management' --criteria 'bundle-size,developer-experience'"
fsd slash "/alt --for 'cloud provider' --count 7"
```

**Analysis includes:**
- Alternative generation
- Comparison matrix
- Pros/cons analysis
- Criteria-based scoring
- Recommendations

## Best Practices

### 1. Be Specific with Topics
```bash
# Good
fsd slash "/plan --topic 'migrate user authentication from Firebase to Supabase'"

# Too vague
fsd slash "/plan --topic 'improve auth'"
```

### 2. Use Appropriate Depth
- **Quick**: High-level overview (5-10 minutes)
- **Normal**: Balanced analysis (15-20 minutes)
- **Deep**: Comprehensive investigation (30+ minutes)

### 3. Leverage ADR Generation
When making important decisions, always use `--create-adr`:
```bash
fsd slash "/decide --decision 'API versioning strategy' --create-adr"
```

### 4. Combine with Version Control
Extended thinking commands generate markdown files. Commit these for team reference:
```bash
fsd slash "/plan --topic 'new feature' --create-adr"
git add docs/architecture/decisions/
git commit -m "Add ADR for new feature planning"
```

### 5. Use for Code Reviews
Before major PRs, run relevant analysis:
```bash
fsd slash "/investigate --question 'potential performance impact of new feature'"
```

## Output Files

Extended thinking commands create files in your project:

### ADRs (Architecture Decision Records)
- Location: `docs/architecture/decisions/`
- Format: `YYYY-MM-DD-title.md`
- Contains: Context, decision, consequences

### Analysis Reports
- Location: Project root or specified directory
- Format: `analysis-command-timestamp.md`
- Contains: Full analysis with all sections

### Planning Documents
- Location: Project root or `docs/planning/`
- Format: `plan-topic-timestamp.md`
- Contains: Roadmaps, timelines, resources

## Integration with Development Workflow

### 1. Sprint Planning
```bash
# Analyze epic before breaking down
fsd slash "/plan --topic 'user dashboard epic' --depth deep"

# Then create sprint items
fsd slash "/sprint:plan --capacity 40"
```

### 2. Technical Debt
```bash
# Investigate technical debt
fsd slash "/investigate --question 'areas of high technical debt'"

# Plan refactoring
fsd slash "/refactor:plan --scope 'identified-debt-areas'"
```

### 3. Performance Issues
```bash
# Debug performance
fsd slash "/debug:strategy --problem 'slow API responses' --urgency high"

# Plan optimization
fsd slash "/optimize:plan --target 'API response time'"
```

### 4. Architecture Changes
```bash
# Research options
fsd slash "/research --topic 'microservices patterns' --depth deep"

# Make decision
fsd slash "/decide --decision 'service architecture' --create-adr"

# Plan implementation
fsd slash "/plan --topic 'microservices migration' --create-adr"
```

## Tips for Maximum Value

1. **Start broad, then narrow**: Use investigation before planning
2. **Document decisions**: Always create ADRs for important choices
3. **Share with team**: Commit analysis files for team visibility
4. **Iterate**: Run commands multiple times as understanding deepens
5. **Combine commands**: Use multiple commands for complex challenges

## Example Workflow

Here's how to approach a complex technical challenge:

```bash
# 1. Investigate the problem space
fsd slash "/investigate --question 'current authentication pain points'"

# 2. Research potential solutions
fsd slash "/research --topic 'modern authentication patterns' --depth deep"

# 3. Generate alternatives
fsd slash "/alternatives --for 'authentication solution' --criteria 'security,user-experience,cost'"

# 4. Make a decision
fsd slash "/decide --decision 'authentication architecture' --alternatives 5 --create-adr"

# 5. Plan implementation
fsd slash "/plan --topic 'implement new authentication' --depth deep --create-adr"

# 6. Estimate effort
fsd slash "/estimate --work 'authentication implementation' --confidence"
```

## Troubleshooting

### Command Takes Too Long
- Use `--depth quick` for faster results
- Be more specific with your topic/question
- Break complex topics into smaller parts

### Output Too Generic
- Provide more context in your prompts
- Use specific technical terms
- Include constraints or requirements

### Can't Find Output Files
- Check the project root directory
- Look in `docs/architecture/decisions/` for ADRs
- Use `ls -la *.md | grep -E "(plan|analysis|research)"` to find recent files

---

Extended Thinking Commands represent a new paradigm in AI-assisted development, providing the deep analysis and systematic thinking needed for complex technical challenges. Use them to elevate your technical decision-making and create comprehensive documentation for your team.