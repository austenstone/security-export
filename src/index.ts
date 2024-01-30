import { getInput, group, setOutput } from "@actions/core";
import { getSecretScanningAlerts, getCodeScanningAlerts, getDependabotAlerts, getOctokit } from "./github-security";

interface Input {
  token: string;
  organization?: string;
  enterprise?: string;
  repository?: string;
  dependabot?: boolean;
  codeScanning?: boolean;
  secretScanning?: boolean;
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
  return result;
}


export const run = async (): Promise<void> => {
  const input = getInputs();
  const octokit = getOctokit(input.token);

  if (input.dependabot) {
    const dependabotAlerts = group('Dependabot Alerts', async () => {
      return getDependabotAlerts(octokit, input);
    });
    setOutput('dependabot', JSON.stringify(dependabotAlerts));
  }

  if (input.codeScanning) {
    const codeScanningAlerts = await group('Code Scanning Alerts', async () => {
      return getCodeScanningAlerts(octokit, input);
    });
    setOutput('code-scanning', JSON.stringify(codeScanningAlerts));
  }

  if (input.secretScanning) {
    const secretScanningAlerts = await group('Secret Scanning Alerts', async () => {
      return getSecretScanningAlerts(octokit, input);
    });
    setOutput('secret-scanning', JSON.stringify(secretScanningAlerts));
  }
};

run();
