import { info, endGroup, getBooleanInput, getInput, setOutput, startGroup } from "@actions/core";
import { getSecretScanningAlerts, getCodeScanningAlerts, getDependabotAlerts, getOctokit } from "./github-security";
import { DefaultArtifactClient } from '@actions/artifact';
import { writeFile } from "fs";

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
  createArtifact: boolean;
  artifactName: string;
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
  const dependabotQueryParams = getInput("dependabot-query-parameters");
  result.dependabotQueryParams = dependabotQueryParams ? JSON.parse(dependabotQueryParams) : dependabotQueryParams;
  const codeScanningQueryParams = getInput("code-scanning-query-parameters");
  result.codeScanningQueryParams = codeScanningQueryParams ? JSON.parse(codeScanningQueryParams) : codeScanningQueryParams;
  const secretScanningQueryParams = getInput("secret-scanning-query-parameters");
  result.secretScanningQueryParams = secretScanningQueryParams ? JSON.parse(secretScanningQueryParams) : secretScanningQueryParams;
  result.createArtifact = getBooleanInput("create-artifact");
  result.artifactName = getInput("artifact-name");
  return result;
}

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

const requests = {} as { [type: string]: Promise<any> }

if (input.dependabot) {
  requests['dependabot'] = getDependabotAlerts(octokit, { ...owner, queryParams: input.dependabotQueryParams }).then((results) => {
    startGroup('Dependabot');
    info(JSON.stringify(results, null, 2));
    setOutput('dependabot', JSON.stringify(results));
    endGroup();
    return results;
  })
}

if (input.codeScanning) {
  requests['code-scanning'] = getCodeScanningAlerts(octokit, { ...owner, queryParams: input.codeScanningQueryParams }).then((results) => {
    startGroup('Code Scanning');
    info(JSON.stringify(results, null, 2));
    setOutput('code-scanning', JSON.stringify(results));
    endGroup();
    return results;
  })
}

if (input.secretScanning) {
  requests['secret-scanning'] = getSecretScanningAlerts(octokit, { ...owner, queryParams: input.secretScanningQueryParams }).then((results) => {
    startGroup('Secret Scanning');
    info(JSON.stringify(results, null, 2));
    setOutput('secret-scanning', JSON.stringify(results));
    endGroup();
    return results;
  });
}

const results: {
  [type: string]: any;
} = Object.fromEntries(await Promise.all(
  await Object.entries(requests).map(async ([type, request]) => [type, await request])
));
info('GitHub Security Alerts retrieved successfully');

if (input.createArtifact) {
  startGroup('Creating GitHub Security Alerts artifact');
  const artifact = new DefaultArtifactClient();
  const filenames = await Promise.all(Object.entries(results).map(async ([type, data]) => {
    const fileName = `${type}.json`;
    return new Promise<string>((resolve, reject) => {
      writeFile(fileName, JSON.stringify(data, null, 2), (err) => err ? reject(err) : resolve(fileName));
    })
  }));
  await artifact.uploadArtifact(input.artifactName, filenames, '.', { compressionLevel: 9 });
  setOutput('artifact-name', input.artifactName);
  info('GitHub Security Alerts artifact created successfully');
  endGroup();
}
