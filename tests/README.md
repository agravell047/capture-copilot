# Playwright Demo Tests

This directory contains Playwright tests designed for live demonstrations of the Bid Project application. These tests automate the process of filling out forms while you narrate the functionality.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Start the backend server:
   ```bash
   cd backend && node server.js
   ```

## Running the Tests

### For Demos (Headed Mode - Shows Browser)
Run tests with the browser visible so you can narrate while the forms are filled:

```bash
# Run all demo tests
npm run test:headed

# Run specific test
npx playwright test opportunity-capture-demo.spec.js --headed

# Run company profile test
npx playwright test company-profile-demo.spec.js --headed
```

### For Development (Headless Mode)
Run tests in headless mode for faster execution:

```bash
# Run all tests
npm run test

# Run specific test
npx playwright test opportunity-capture-demo.spec.js
```

### Interactive UI Mode
Use Playwright's UI mode for debugging and step-through execution:

```bash
npm run test:ui
```

## Test Descriptions

### Opportunity Capture Demo (`opportunity-capture-demo.spec.js`)
This test demonstrates the complete opportunity capture workflow:

1. **Basic Information**: Fills out opportunity name, agency, contract value, vehicle, set-aside, gate, timeline
2. **Description**: Adds a comprehensive opportunity description
3. **Evaluation Criteria**: Expands the evaluation section and adds multiple criteria with notes
4. **Stakeholders**: Adds key stakeholders with roles, relationships, and contact information
5. **Evidence**: Adds sources and evidence links
6. **Relationships**: Documents known relationships and access signals
7. **Internal Notes**: Adds team notes and context
8. **Submission**: Submits the form and verifies the analysis completes

### Company Profile Demo (`company-profile-demo.spec.js`)
This test demonstrates setting up the complete company profile:

1. **Contract Vehicles**: Adds multiple contract vehicles including custom entries
2. **Set-Aside Designations**: Adds SDVOSB and 8(a) certifications
3. **Core Capabilities**: Adds technical capabilities and services
4. **Team Directory**: Adds team members with roles, experience, and skills
5. **Key Relationships**: Documents agency relationships and relationship strength
6. **Known Gaps**: Identifies areas for improvement or missing certifications
7. **AI Settings**: Configures OpenAI API key, model, and base URL

## Tips for Presentations

1. **Slow Down the Test**: The tests are designed to run at a natural pace, but you can add `await page.waitForTimeout(1000)` between steps if you want more time to explain each section.

2. **Narrate as You Go**: Use the visible browser to explain what each field represents and why it's important for opportunity analysis.

3. **Point Out AI Integration**: Highlight how the company profile data feeds into the AI analysis engine.

4. **Show Real-Time Analysis**: After submitting the opportunity form, show how the AI immediately provides fit assessment, gap analysis, and recommendations.

5. **Demonstrate Edit Flow**: After the initial creation, you can manually edit the opportunity to show the update workflow.

## Troubleshooting

- **Backend Not Running**: Make sure the backend server is running on port 3001
- **Tests Failing**: Check that the application is accessible at http://localhost:5174
- **Slow Performance**: The tests include realistic delays to simulate human interaction

## Customizing Tests

You can modify the test data in the spec files to match your specific demo scenarios. The tests are written to be maintainable and easy to update as the application evolves.