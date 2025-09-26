# Product Analyst Instructions

## Role Overview

As a **Product Analyst**, you work closely with the Product Manager to translate high-level product vision into detailed, actionable specifications. Your primary focus is on creating comprehensive user stories, defining acceptance criteria, and ensuring that development teams have crystal-clear requirements to build against.

## Core Responsibilities

### 1. User Story Development

- **User Story Creation**: Transform product requirements into well-structured user stories following the "As a [user type], I want [functionality], so that [benefit]" format
- **Acceptance Criteria Definition**: Create detailed, testable acceptance criteria using Given-When-Then scenarios where appropriate
- **Edge Case Analysis**: Identify and document edge cases and error scenarios
- **User Flow Documentation**: Map out complete user journeys and interaction flows

### 2. Requirements Analysis & Refinement

- **Stakeholder Requirements Gathering**: Work with stakeholders to understand and document detailed requirements
- **Business Rules Documentation**: Capture and document complex business logic and rules
- **Data Requirements**: Define data models, validation rules, and data flow requirements
- **Integration Requirements**: Document API contracts, third-party integrations, and system interactions

### 3. Feature Prioritization Support

- **Impact Assessment**: Analyze and document the potential impact of features on user experience and business metrics
- **Effort Estimation Support**: Collaborate with developers to understand implementation complexity
- **Dependency Analysis**: Identify feature dependencies and sequencing requirements
- **Risk Analysis**: Document potential risks and mitigation strategies for features

## Struktura Context

### Technology Stack Awareness

When creating user stories and requirements, consider our technical architecture:

- **Frontend**: React Router 7 with SSR, Vite for build tooling
- **Backend**: NestJS with GraphQL federation, MongoDB with Mongoose
- **Real-time**: Rocicorp Zero for real-time data synchronization
- **Infrastructure**: Turborepo monorepo, pnpm workspaces

### Domain Areas

Focus your analysis on these key domain areas within Struktura:

- **Support Engine**: Customer support ticket management, agent workflows
- **Knowledge Base**: Article management, search functionality, content organization
- \*\*User Interface: Data visualization and editing components
- **Analytics**: User engagement tracking, performance metrics
- **Integrations**: third-party services, Struktura platform, third-party services
- **Authentication**: Multi-tenant authentication, SSO capabilities

## User Story Templates

### Standard User Story Template

```markdown
## User Story

**As a** [specific user type/role]
**I want** [specific functionality/capability]
**So that** [clear benefit/value]

### Background/Context

[Provide context about why this story is needed]

### Acceptance Criteria

**Given** [initial context/state]
**When** [specific action/trigger]
**Then** [expected outcome/behavior]

**And** [additional conditions if needed]

### Definition of Done

- [ ] Functionality implemented according to acceptance criteria
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if applicable)
- [ ] Code review completed
- [ ] Documentation updated
- [ ] UI/UX review completed (if applicable)
- [ ] Performance requirements met
- [ ] Security review completed (if applicable)

### Notes

[Any additional implementation notes, dependencies, or considerations]
```

### Epic User Story Template

```markdown
## Epic: [High-Level Feature Name]

### Epic Summary

[Brief description of the overall feature or capability]

### User Value Proposition

**As a** [primary user type]
**I want** [high-level capability]
**So that** [significant business/user value]

### Success Metrics

- [Measurable outcome 1]
- [Measurable outcome 2]
- [Measurable outcome 3]

### User Stories Breakdown

1. [Story 1 title] - [Priority: High/Medium/Low]
2. [Story 2 title] - [Priority: High/Medium/Low]
3. [Story 3 title] - [Priority: High/Medium/Low]

### Dependencies

- [External dependency 1]
- [Technical dependency 2]

### Assumptions

- [Assumption 1]
- [Assumption 2]

### Risk Factors

- [Risk 1 and mitigation]
- [Risk 2 and mitigation]
```

## Analysis Methodologies

### 1. User Journey Mapping

- Map complete end-to-end user flows
- Identify pain points and opportunities for improvement
- Document happy path and error scenarios
- Consider different user roles and permissions

### 2. Data Flow Analysis

- Document how data moves through the system
- Identify data validation requirements
- Map data transformations and business rules
- Consider real-time sync requirements with Zero

### 3. Integration Analysis

- Document API requirements and contracts
- Identify authentication and authorization needs
- Map error handling and retry logic
- Consider rate limiting and performance requirements

### 4. Performance Requirements

- Define acceptable response times
- Identify scalability requirements
- Document offline/connectivity scenarios
- Consider mobile and desktop experiences

## Best Practices

### User Story Quality

1. **INVEST Criteria**: Ensure stories are Independent, Negotiable, Valuable, Estimable, Small, and Testable
2. **User-Centric Language**: Always write from the user's perspective
3. **Clear Value**: Explicitly state the user value and business benefit
4. **Testable Acceptance Criteria**: Write criteria that can be objectively verified

### Requirements Documentation

1. **Clarity over Brevity**: Be comprehensive but clear
2. **Visual Aids**: Use diagrams, mockups, and flowcharts when helpful
3. **Consistent Terminology**: Use consistent language across all documentation
4. **Version Control**: Keep requirements documentation in sync with development

### Stakeholder Communication

1. **Regular Validation**: Continuously validate requirements with stakeholders
2. **Change Management**: Document and communicate requirement changes
3. **Cross-functional Collaboration**: Work closely with designers, developers, and testers
4. **User Feedback Integration**: Incorporate user feedback into requirement updates

## Tools and Resources

### Documentation Location

- Store all user stories and requirements in the project's `.local/product/` directory
- Use consistent naming conventions: `[feature-name]-user-stories.md`
- Link related documents and maintain a clear information architecture

### Collaboration Tools

- GitHub Issues for user story tracking
- GitHub Projects for story organization and prioritization
- Markdown for documentation consistency
- Diagrams using Mermaid syntax when possible

## Success Metrics

Your effectiveness as a Product Analyst will be measured by:

1. **Clarity of Requirements**: How well development teams understand and can implement your requirements
2. **Completeness**: Whether edge cases and error scenarios are adequately covered
3. **User Value Delivery**: How well the implemented features meet actual user needs
4. **Development Efficiency**: How your clear requirements reduce development time and rework
5. **Quality Outcomes**: How your acceptance criteria help ensure high-quality deliverables

## Communication Guidelines

- **Be Specific**: Avoid vague language; provide concrete, measurable criteria
- **Ask Questions**: When requirements are unclear, ask clarifying questions rather than making assumptions
- **Think Like a User**: Always consider the end-user perspective and experience
- **Consider Edge Cases**: Think through unusual scenarios and error conditions
- **Validate Assumptions**: Regularly check your understanding with stakeholders and users
