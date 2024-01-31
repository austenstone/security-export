import { info, endGroup, getBooleanInput, getInput, setOutput, startGroup, group } from "@actions/core";
import { getSecretScanningAlerts, getCodeScanningAlerts, getDependabotAlerts, getOctokit } from "./github-security";

interface Input {
  token: string;
  organization?: string;
  enterprise?: string;
  repository?: string;
  dependabot?: boolean;
  dependabotQueryParams: { [key: string]: string };
  codeScanning?: boolean;
  codeScanningQueryParams: { [key: string]: string };
  secretScanning?: boolean;
  secretScanningQueryParams: { [key: string]: string };
}

export function getInputs(): Input {
  const result = {} as Input;
  result.token = getInput("github-token");
  if (!result.token || result.token === "") {
    throw new Error("github-token is required");
  }
  result.repository = getInput("repository");
  result.organization = getInput("organization");
  result.enterprise = getInput("enterprise");
  if (!result.repository && !result.organization && !result.enterprise) {
    throw new Error("organization, enterprise, or repository is required");
  }
  result.dependabot = getBooleanInput("dependabot");
  result.codeScanning = getBooleanInput("code-scanning");
  result.secretScanning = getBooleanInput("secret-scanning");
  if (!result.dependabot && !result.codeScanning && !result.secretScanning) {
    throw new Error("dependabot, code-scanning, or secret-scanning is required");
  }
  const dependabotQueryParams = getInput("dependabot-query-params");
  result.dependabotQueryParams = dependabotQueryParams ? JSON.parse(dependabotQueryParams) : dependabotQueryParams;
  const codeScanningQueryParams = getInput("code-scanning-query-params");
  result.codeScanningQueryParams = codeScanningQueryParams ? JSON.parse(codeScanningQueryParams) : codeScanningQueryParams;
  const secretScanningQueryParams = getInput("secret-scanning-query-params");
  result.secretScanningQueryParams = secretScanningQueryParams ? JSON.parse(secretScanningQueryParams) : secretScanningQueryParams;

  return result;
}

export const run = async (): Promise<void> => {
  const input = getInputs();
  const octokit = getOctokit(input.token);
  const owner = {
    organization: input.organization,
    enterprise: input.enterprise,
    repository: input.repository,
  };

  startGroup('Getting GitHub Security Alerts');
  info(`Input: ${JSON.stringify(input, null, 2)}`);
  endGroup();

  const requests = [] as Promise<any>[];

  if (input.dependabot) {
    requests.push(
      group('Dependabot', async () => {
        const alerts = await getDependabotAlerts(octokit, { ...owner, queryParams: input.dependabotQueryParams });
        info(JSON.stringify(alerts, null, 2));
        setOutput('dependabot', JSON.stringify(alerts));
      })
    );
  }

  if (input.codeScanning) {
    requests.push(
      group('Code Scanning', async () => {
        const alerts = await getCodeScanningAlerts(octokit, { ...owner, queryParams: input.codeScanningQueryParams });
        info(JSON.stringify(alerts, null, 2));
        setOutput('code-scanning', JSON.stringify(alerts));
      })
    );
  }

  if (input.secretScanning) {
    requests.push(
      group('Secret Scanning', async () => {
        const alerts = await getSecretScanningAlerts(octokit, { ...owner, queryParams: input.secretScanningQueryParams });
        info(JSON.stringify(alerts, null, 2));
        setOutput('secret-scanning', JSON.stringify(alerts));
      })
    );
  }

  await Promise.all(requests);
  info('GitHub Security Alerts retrieved successfully');
};

run();
