import { test, expect } from '@playwright/test';

test.describe('Company Profile Setup Demo', () => {
  test('should fill out complete company profile', async ({ page }) => {
    // Navigate to the settings page
    await page.goto('/company-profile');

    // Wait for the page to load
    await expect(page.locator('h2')).toContainText('Settings');

    // Add contract vehicles
    await page.locator('select').filter({ hasText: 'Select contract vehicle' }).selectOption('GSA MAS');
    await page.locator('button').filter({ hasText: 'Add Vehicle' }).click();
    await page.waitForTimeout(600);

    await page.locator('select').filter({ hasText: 'Select contract vehicle' }).selectOption('Other');
    await page.locator('input[placeholder="Enter contract vehicle"]').fill('NASA SEWP');
    await page.locator('button').filter({ hasText: 'Add Vehicle' }).click();
    await page.waitForTimeout(600);

    await page.locator('select').filter({ hasText: 'Select contract vehicle' }).selectOption('OASIS+');
    await page.locator('button').filter({ hasText: 'Add Vehicle' }).click();
    await page.waitForTimeout(800);

    // Add set-aside designations
    await page.locator('select').filter({ hasText: 'Select set-aside' }).selectOption('SDVOSB');
    await page.locator('button').filter({ hasText: 'Add Set-Aside' }).click();
    await page.waitForTimeout(600);

    await page.locator('select').filter({ hasText: 'Select set-aside' }).selectOption('8(a)');
    await page.locator('button').filter({ hasText: 'Add Set-Aside' }).click();
    await page.waitForTimeout(800);

    // Add core capabilities
    await page.locator('input[placeholder*="Cloud Infrastructure"]').fill('Cloud Infrastructure & Migration');
    await page.locator('button').filter({ hasText: 'Add Capability' }).click();
    await page.waitForTimeout(600);

    await page.locator('input[placeholder*="Cloud Infrastructure"]').fill('Cybersecurity & Zero Trust');
    await page.locator('button').filter({ hasText: 'Add Capability' }).click();
    await page.waitForTimeout(600);

    await page.locator('input[placeholder*="Cloud Infrastructure"]').fill('Data Analytics & AI/ML');
    await page.locator('button').filter({ hasText: 'Add Capability' }).click();
    await page.waitForTimeout(600);

    await page.locator('input[placeholder*="Cloud Infrastructure"]').fill('DevSecOps & CI/CD');
    await page.locator('button').filter({ hasText: 'Add Capability' }).click();
    await page.waitForTimeout(600);

    await page.locator('input[placeholder*="Cloud Infrastructure"]').fill('Digital Transformation Consulting');
    await page.locator('button').filter({ hasText: 'Add Capability' }).click();
    await page.waitForTimeout(1000);

    // Add team members
    await page.locator('input[placeholder="Name"]').fill('Jennifer Martinez');
    await page.locator('input[placeholder="Role (optional)"]').fill('VP of Capture Management');
    await page.locator('input[placeholder="Years"]').fill('12');
    await page.locator('input[placeholder="Skills (comma-separated)"]').fill('Federal capture; DoD relationships; Proposal writing');
    await page.locator('button').filter({ hasText: 'Add Person' }).click();
    await page.waitForTimeout(1000);

    await page.locator('input[placeholder="Name"]').fill('David Kim');
    await page.locator('input[placeholder="Role (optional)"]').fill('Chief Technology Officer');
    await page.locator('input[placeholder="Years"]').fill('15');
    await page.locator('input[placeholder="Skills (comma-separated)"]').fill('Cloud architecture; FedRAMP; Zero Trust; DevSecOps');
    await page.locator('button').filter({ hasText: 'Add Person' }).click();
    await page.waitForTimeout(1000);

    await page.locator('input[placeholder="Name"]').fill('Sarah Johnson');
    await page.locator('input[placeholder="Role (optional)"]').fill('Director of Cybersecurity');
    await page.locator('input[placeholder="Years"]').fill('10');
    await page.locator('input[placeholder="Skills (comma-separated)"]').fill('NIST frameworks; CMMC; Risk management; Compliance');
    await page.locator('button').filter({ hasText: 'Add Person' }).click();
    await page.waitForTimeout(1000);

    await page.locator('input[placeholder="Name"]').fill('Michael Rodriguez');
    await page.locator('input[placeholder="Role (optional)"]').fill('Senior Solutions Architect');
    await page.locator('input[placeholder="Years"]').fill('8');
    await page.locator('input[placeholder="Skills (comma-separated)"]').fill('AWS; Azure; GCP; Kubernetes; Microservices');
    await page.locator('button').filter({ hasText: 'Add Person' }).click();
    await page.waitForTimeout(1000);

    await page.locator('input[placeholder="Name"]').fill('Emily Chen');
    await page.locator('input[placeholder="Role (optional)"]').fill('Data Scientist');
    await page.locator('input[placeholder="Years"]').fill('6');
    await page.locator('input[placeholder="Skills (comma-separated)"]').fill('Machine learning; Python; R; Data visualization; AI ethics');
    await page.locator('button').filter({ hasText: 'Add Person' }).click();
    await page.waitForTimeout(1000);

    // Add key relationships
    await page.locator('select').filter({ hasText: 'Select agency' }).selectOption('Department of Defense');
    await page.locator('select').filter({ hasText: 'Strength (default: Moderate)' }).selectOption('strong');
    await page.locator('button').filter({ hasText: 'Add Relationship' }).click();
    await page.waitForTimeout(800);

    await page.locator('select').filter({ hasText: 'Select agency' }).selectOption('Department of Veterans Affairs');
    await page.locator('select').filter({ hasText: 'Strength (default: Moderate)' }).selectOption('strong');
    await page.locator('button').filter({ hasText: 'Add Relationship' }).click();
    await page.waitForTimeout(800);

    await page.locator('select').filter({ hasText: 'Select agency' }).selectOption('Centers for Medicare & Medicaid Services (CMS)');
    await page.locator('select').filter({ hasText: 'Strength (default: Moderate)' }).selectOption('moderate');
    await page.locator('button').filter({ hasText: 'Add Relationship' }).click();
    await page.waitForTimeout(1000);

    // Add known gaps
    await page.locator('input[placeholder*="FedRAMP certification"]').fill('CMMC Level 3 Certification (in progress)');
    await page.locator('button').filter({ hasText: 'Add Gap' }).click();
    await page.waitForTimeout(800);

    await page.locator('input[placeholder*="FedRAMP certification"]').fill('Expanded international presence');
    await page.locator('button').filter({ hasText: 'Add Gap' }).click();
    await page.waitForTimeout(800);

    await page.locator('input[placeholder*="FedRAMP certification"]').fill('Additional cleared personnel for classified work');
    await page.locator('button').filter({ hasText: 'Add Gap' }).click();
    await page.waitForTimeout(1000);

    // Save the company profile
    await page.locator('button').filter({ hasText: 'Save Profile' }).click();
    await page.waitForTimeout(2000);

    // Wait for success message
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText('Company profile saved successfully!');

    // Now configure AI settings
    await page.locator('input[placeholder*="Paste API key"]').fill('sk-test12345678901234567890123456789012');
    await page.waitForTimeout(800);

    await page.locator('input[placeholder*="e.g., gpt-4o-mini"]').fill('gpt-4o-mini');
    await page.waitForTimeout(600);

    await page.locator('input[placeholder*="https://api.openai.com"]').fill('https://api.openai.com/v1');
    await page.waitForTimeout(600);

    // Save AI settings
    await page.locator('button').filter({ hasText: 'Save Settings' }).click();

    // Wait for success message to appear
    await expect(page.locator('.message.success')).toBeVisible();
    await expect(page.locator('.message.success')).toContainText('Settings saved');
  });
});