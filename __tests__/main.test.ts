import { test } from '@jest/globals';
import 'dotenv/config';
import { getOctokit, getDependabotAlerts, getCodeScanningAlerts, getSecretScanningAlerts } from '../src/github-security';
import { writeFile } from 'fs';

const TIMEOUT = (1000 * 60) * 30;
const mockInput = {
  // enterprise: 'austenstone-enterprise',
  // organization: 'octodemo',
  repository: 'octodemo/vulnerable-node',
} as {
  enterprise?: string;
  organization?: string;
  repository?: string;
};
const input = {
  token: process.env.GITHUB_TOKEN,
}

if (!input.token) throw new Error('GITHUB_TOKEN is required');

const octokit = getOctokit(input.token);

if (mockInput.enterprise) {
  test('getDependabotAlerts with enterprise', async () => {
    const alerts = await getDependabotAlerts(octokit, { enterprise: 'octodemo' });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  }, TIMEOUT);
  test('getCodeScanningAlerts with enterprise', async () => {
    const alerts = await getCodeScanningAlerts(octokit, { enterprise: 'octodemo' });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  }, TIMEOUT);
  test('getSecretScanningAlerts with enterprise', async () => {
    const alerts = await getSecretScanningAlerts(octokit, { enterprise: 'octodemo' });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  }, TIMEOUT);
}

if (mockInput.organization) {
  test('getDependabotAlerts with organization', async () => {
    const alerts = await getDependabotAlerts(octokit, { organization: mockInput.organization });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  }, TIMEOUT);
  test('getCodeScanningAlerts with organization', async () => {
    const alerts = await getCodeScanningAlerts(octokit, { organization: mockInput.organization });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  }, TIMEOUT);
  test('getSecretScanningAlerts with organization', async () => {
    const alerts = await getSecretScanningAlerts(octokit, { organization: mockInput.organization });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  }, TIMEOUT);
}

if (mockInput.repository) {
  test('getDependabotAlerts with repository', async () => {
    const alerts = await getDependabotAlerts(octokit, { repository: mockInput.repository });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  });
  test('getCodeScanningAlerts with repository', async () => {
    const alerts = await getCodeScanningAlerts(octokit, { repository: mockInput.repository });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  });
  test('getSecretScanningAlerts with repository', async () => {
    const alerts = await getSecretScanningAlerts(octokit, { repository: mockInput.repository });
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts)).toBeTruthy();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  });
}

if (0) {
  test('Write to file', async () => {
    const requests = {} as { [type: string]: Promise<any> }
    requests['secret-scanning'] = getSecretScanningAlerts(octokit, { repository: mockInput.repository });
    requests['code-scanning'] = getCodeScanningAlerts(octokit, { repository: mockInput.repository });
    requests['dependabot'] = getDependabotAlerts(octokit, { repository: mockInput.repository });
    const results: {
      [type: string]: any;
    } = Object.fromEntries(await Promise.all(
      await Object.entries(requests).map(async ([type, request]) => {
        const data = await request;
        return [type, data];
      })
    ));
    await Promise.all(Object.entries(results).map(async ([type, data]) => {
      const fileName = `${type}.json`;
      return new Promise<void>((resolve, reject) => {
        writeFile(fileName, JSON.stringify(data, null, 2), (err) => err ? reject(err) : resolve());
      });
    }));
  });
}
