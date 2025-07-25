# HubSpot Integration Up - Claude Development Notes

## Project Overview
Next.js application with HubSpot workflow actions for date formatting and other utilities.

## Development Preferences

### Communication Style
- **Proposal-first approach**: Always provide proposal/plan before implementation
- **Ask clarifying questions**: Use yes/no questions to gather context until 95% confidence
- **Concise responses**: Keep explanations brief and to-the-point
- **Use sub-agents**: Delegate independent tasks to sub-agents when possible

### Code Standards
- **JSON naming**: Use camelCase for all JSON object keys in API responses/requests
- **No premature implementation**: Don't make changes without clear requirements
- **Industry best practices**: Follow established patterns and conventions
- **Config-driven architecture**: Separate configuration from business logic

### Git Workflow
- **Clean commit messages**: Write main description + 2-5 detailed points
- **No auto-generated signatures**: Never add Claude Code co-author tags
- **Meaningful commits**: Focus on the "why" rather than just the "what"

### HubSpot Development
- **Test thoroughly**: Always test in fresh workflows after updates
- **Debug comprehensively**: Add detailed logging for troubleshooting
- **Handle edge cases**: Support 2-digit years, empty values, format variations
- **User-friendly UX**: Clear labels, helpful descriptions, logical field ordering

### Project Management
- **Multi-app architecture**: Design for scalability (date-formatter, url-shortener, etc.)
- **Environment awareness**: Different behavior for dev vs production
- **Versioning strategy**: Auto-append version numbers, timestamps only in dev

## Key Learnings & Configurations

### HubSpot Workflow Actions
- **inputFieldDependencies**: Correct property for conditional field display:
  ```json
  "inputFieldDependencies": [
    {
      "dependencyType": "CONDITIONAL_SINGLE_FIELD",
      "controllingFieldName": "targetFormat",
      "controllingFieldValue": "CUSTOM",
      "dependentFieldNames": ["customTargetFormat"]
    }
  ]
  ```
- **dependencyType options**:
  - `SINGLE_FIELD`: Gray out fields until conditions met
  - `CONDITIONAL_SINGLE_FIELD`: Show/hide fields based on conditions
- **No defaultValue support**: HubSpot doesn't support `defaultValue` in workflow action fields
- **First option = default**: UI treats first enumeration option as default
- **UI caching issues**: Test in fresh workflows after updates, clear browser cache

### Date Formatter Implementation
- **2-digit year support**: 00-49 → 2000-2049, 50-99 → 1950-1999
- **Pre-resolved values**: HubSpot sends resolved values in `inputFields`, not dynamic tokens
- **Payload structure**: `portalId` is in `origin.portalId`, not root level
- **Custom format tokens**: Date-only (YYYY, MM, DD, etc.) - no time tokens

### Webhook Payload Structure
```json
{
  "callbackId": "string",
  "origin": {
    "portalId": 243404981,
    "actionDefinitionId": 218240898
  },
  "inputFields": {
    "sourceDateField": "7/24/25",
    "sourceFormat": "AUTO",
    "targetFormat": "TAIWAN_STANDARD"
  }
}
```

### NPM Commands
- `npm run hubspot:date-formatter:register` - Register new action
- `npm run hubspot:date-formatter:update` - Update latest action
- `npm run hubspot:date-formatter:list` - List all actions
- `npm run hubspot:date-formatter:delete <id>` - Delete specific action

### File Structure
- `config/apps.json` - Multi-app configuration
- `config/workflow-actions/` - Action definitions
- `scripts/` - Management scripts for workflow actions
- `src/app/api/webhook/` - Webhook endpoints
- `src/lib/services/` - Business logic services

### Development Notes
- Always test conditional fields in completely new workflows
- Update script automatically increments revision numbers
- Environment detection: localhost/ngrok = dev, vercel = prod
- Debug logging enabled in webhook endpoints for troubleshooting