import { test } from '@jest/globals';
import 'dotenv/config';
import { getOctokit, getDependabotAlerts, getCodeScanningAlerts, getSecretScanningAlerts } from '../src/github-security';

const TIMEOUT = (1000 * 60) * 30;
const mockInput = {
  enterprise: 'austenstone-enterprise',
  organization: 'octoaustenstone',
  // organization: 'octodemo',
  repository: 'octoaustenstone/.github',
  // repository: 'austenstone/security-export',
}
const input = {
  token: process.env.GITHUB_TOKEN,
}

if (!input.token) throw new Error('GITHUB_TOKEN is required');

const octokit = getOctokit(input.token);

test('getDependabotAlerts with organization', async () => {
  const alerts = await getDependabotAlerts(octokit, { organization: mockInput.organization });
  expect(alerts).toBeDefined();
  expect(Array.isArray(alerts)).toBeTruthy();
  expect(alerts.length).toBeGreaterThanOrEqual(0);
}, TIMEOUT);

test('getDependabotAlerts with enterprise', async () => {
  const alerts = await getDependabotAlerts(octokit, { enterprise: 'octodemo' });
  expect(alerts).toBeDefined();
  expect(Array.isArray(alerts)).toBeTruthy();
  expect(alerts.length).toBeGreaterThanOrEqual(0);
}, TIMEOUT);

test('getDependabotAlerts with repository', async () => {
  const alerts = await getDependabotAlerts(octokit, { repository: mockInput.repository });
  expect(alerts).toBeDefined();
  expect(Array.isArray(alerts)).toBeTruthy();
  expect(alerts.length).toBeGreaterThanOrEqual(0);
});

test('getCodeScanningAlerts with organization', async () => {
  const alerts = await getCodeScanningAlerts(octokit, { organization: mockInput.organization });
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

test('getCodeScanningAlerts with repository', async () => {
  const alerts = await getCodeScanningAlerts(octokit, { repository: mockInput.repository });
  expect(alerts).toBeDefined();
  expect(Array.isArray(alerts)).toBeTruthy();
  expect(alerts.length).toBeGreaterThanOrEqual(0);
});

test('getSecretScanningAlerts with organization', async () => {
  const alerts = await getSecretScanningAlerts(octokit, { organization: mockInput.organization });
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

test('getSecretScanningAlerts with repository', async () => {
  const alerts = await getSecretScanningAlerts(octokit, { repository: mockInput.repository });
  expect(alerts).toBeDefined();
  expect(Array.isArray(alerts)).toBeTruthy();
  expect(alerts.length).toBeGreaterThanOrEqual(0);
});
