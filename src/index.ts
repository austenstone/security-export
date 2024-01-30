import { endGroup, getBooleanInput, getInput, group, setOutput, startGroup } from "@actions/core";
import { getSecretScanningAlerts, getCodeScanningAlerts, getDependabotAlerts, getOctokit } from "./github-security";
import { info } from "console";

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
  result.dependabot = getBooleanInput("dependabot");
  result.codeScanning = getBooleanInput("code-scanning");
  result.secretScanning = getBooleanInput("secret-scanning");
  if (!result.dependabot && !result.codeScanning && !result.secretScanning) {
    throw new Error("dependabot, code-scanning, or secret-scanning is required");
  }
  return result;
}

export const run = async (): Promise<void> => {
  const input = getInputs();
  const octokit = getOctokit(input.token);

  startGroup('Getting GitHub Security Alerts');
  info(`Settings: ${JSON.stringify(input)}`);
  endGroup();

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
