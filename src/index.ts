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
  createArtifact?: boolean;
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
  result.createArtifact = getBooleanInput("create-artifact");

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
    requests[0] = getDependabotAlerts(octokit, { ...owner, queryParams: input.dependabotQueryParams }).then((results) => {
      startGroup('Dependabot');
      info(JSON.stringify(results, null, 2));
      setOutput('dependabot', JSON.stringify(results));
      endGroup();
    })
  }

  if (input.codeScanning) {
    requests[1] = getCodeScanningAlerts(octokit, { ...owner, queryParams: input.codeScanningQueryParams }).then((results) => {
      startGroup('Code Scanning');
      info(JSON.stringify(results, null, 2));
      setOutput('code-scanning', JSON.stringify(results));
      endGroup();
    })
  }

  if (input.secretScanning) {
    requests[2] = getSecretScanningAlerts(octokit, { ...owner, queryParams: input.secretScanningQueryParams }).then((results) => {
      startGroup('Secret Scanning');
      info(JSON.stringify(results, null, 2));
      setOutput('secret-scanning', JSON.stringify(results));
      endGroup();
    });
  }

  const [
    dependabotResults,
    codeScanningResults,
    secretScanningResults
  ] = await Promise.all(requests);
  info('GitHub Security Alerts retrieved successfully');

  if (input.createArtifact) {
    startGroup('Creating GitHub Security Alerts artifact');
    const artifact = new DefaultArtifactClient();
    const files = [
      {
        file: 'dependabot.json',
        data: JSON.stringify(dependabotResults, null, 2)
      },
      {
        file: 'code-scanning.json',
        data: JSON.stringify(codeScanningResults, null, 2)
      },
      {
        file: 'secret-scanning.json',
        data: JSON.stringify(secretScanningResults, null, 2)
      }
    ];
    await Promise.all(files.map(({ file, data }) => {
      return new Promise<void>((resolve, reject) => writeFile(file, data, (err) => err ? reject(err) : resolve()));
    }));
    await Promise.all(files.map(({ file }) => {
      return artifact.uploadArtifact(file, [file], '.', {
        compressionLevel: 0
      });
    }));
    endGroup();
  }
};

run();
