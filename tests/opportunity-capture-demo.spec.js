import { test, expect } from '@playwright/test';

test.describe('Opportunity Capture Form Demo', () => {
  test('should fill out complete opportunity capture form', async ({ page }) => {
    // Navigate to the new capture page
    await page.goto('/');

    // Wait for the form to load
    await expect(page.locator('h1')).toContainText('New Capture');

    // Fill out basic opportunity information
    await page.locator('#opportunityName').fill('DoD Cloud Migration Platform');
    await page.waitForTimeout(800);

    // Select agency
    await page.locator('#agency').selectOption('Department of Defense');
    await page.waitForTimeout(600);

    // Select contract value
    await page.locator('#contractValue').selectOption('50-200M');
    await page.waitForTimeout(600);

    // Select vehicle
    await page.locator('#vehicle').selectOption('GSA MAS');
    await page.waitForTimeout(600);

    // Select set-aside
    await page.locator('#setAside').selectOption('SDVOSB');
    await page.waitForTimeout(600);

    // Select gate
    await page.locator('#gate').selectOption('1');
    await page.waitForTimeout(600);

    // Fill timeline
    await page.locator('#timeline').fill('RFP expected Q2 2025, Proposal due 60 days after release');
    await page.waitForTimeout(800);

    // Fill description
    await page.locator('#description').fill(`The Department of Defense is seeking a comprehensive cloud migration solution to modernize their legacy infrastructure. The project involves migrating critical applications and data to a secure cloud environment while maintaining compliance with DoD security standards.

Key requirements include:
- FedRAMP High authorization
- Zero Trust Architecture implementation
- Multi-cloud deployment capabilities
- 24/7 support and monitoring
- Data encryption and compliance tools`);
    await page.waitForTimeout(1200);

    // Expand evaluation section
    await page.locator('button').filter({ hasText: 'Evaluation Criteria' }).click();
    await page.waitForTimeout(800);

    // Fill evaluation details
    await page.locator('#evaluationType').selectOption('Best Value');
    await page.waitForTimeout(600);

    // Add evaluation criteria
    await page.locator('input[placeholder*="evaluation criterion"]').fill('Technical Approach');
    await page.locator('button').filter({ hasText: 'Add Criterion' }).click();
    await page.waitForTimeout(600);

    await page.locator('input[placeholder*="evaluation criterion"]').fill('Past Performance');
    await page.locator('button').filter({ hasText: 'Add Criterion' }).click();
    await page.waitForTimeout(600);

    await page.locator('input[placeholder*="evaluation criterion"]').fill('Price');
    await page.locator('button').filter({ hasText: 'Add Criterion' }).click();
    await page.waitForTimeout(600);

    await page.locator('#evaluationNotes').fill('Evaluation will be weighted 40% technical, 30% past performance, 30% price. Technical approach includes demonstration of cloud migration expertise.');
    await page.waitForTimeout(1000);

    // Expand stakeholders section
    await page.locator('button').filter({ hasText: 'Key Stakeholders' }).click();
    await page.waitForTimeout(800);

    // Search for and select Sarah Johnson from the contact book
    await page.locator('.contact-picker-search').fill('Sarah');
    await page.waitForTimeout(600);
    await page.locator('.contact-picker-item').filter({ hasText: 'Sarah Johnson' }).locator('input[type="checkbox"]').check();
    await page.waitForTimeout(600);

    // Search for and select Mike Chen
    await page.locator('.contact-picker-search').fill('Mike');
    await page.waitForTimeout(600);
    await page.locator('.contact-picker-item').filter({ hasText: 'Mike Chen' }).locator('input[type="checkbox"]').check();
    await page.waitForTimeout(600);

    // Clear search to show all selected contacts
    await page.locator('.contact-picker-search').fill('');
    await page.waitForTimeout(600);

    // Expand evidence section
    await page.locator('button').filter({ hasText: 'Sources & Evidence' }).click();
    await page.waitForTimeout(800);

    // Add evidence
    await page.locator('input[placeholder="URL"]').fill('https://sam.gov/opp/123456789');
    await page.locator('input[placeholder="Note (optional)"]').fill('Official RFP posting on SAM.gov');
    await page.locator('button').filter({ hasText: 'Add Evidence' }).click();
    await page.waitForTimeout(800);

    await page.locator('select').filter({ hasText: 'SAM.gov' }).selectOption('Other');
    await page.locator('input[placeholder="URL"]').fill('https://www.defense.gov/News/Contracts/');
    await page.locator('input[placeholder="Note (optional)"]').fill('Related DoD contract announcements');
    await page.locator('button').filter({ hasText: 'Add Evidence' }).click();
    await page.waitForTimeout(800);

    // Expand known relationships section
    await page.locator('button').filter({ hasText: 'Known Relationships' }).click();
    await page.waitForTimeout(800);

    await page.locator('#knownRelationships').fill(`Strong relationship with DISA through previous cloud migration project.
Established contacts at DoD CIO office from JEDI program support.
Existing GSA MAS holder with demonstrated cloud capabilities.`);
    await page.waitForTimeout(1000);

    // Expand internal notes section
    await page.locator('button').filter({ hasText: 'Internal Notes' }).click();
    await page.waitForTimeout(800);

    await page.locator('#notes').fill(`Internal team notes:
- We have existing FedRAMP High authorization
- Team has 5+ years cloud migration experience
- Current utilization on GSA MAS is 60%
- Need to coordinate with legal for contract terms
- Prepare for oral presentation requirement`);
    await page.waitForTimeout(1000);

    // Submit the form
    await page.locator('button').filter({ hasText: 'Create & Analyze Opportunity' }).click();

    // Wait for the analysis to complete and redirect to detail page
    await expect(page.locator('h2')).toContainText('DoD Cloud Migration Platform');

    // Verify the opportunity was created successfully
    await expect(page.locator('.opportunity-snapshot')).toBeVisible();
  });
});