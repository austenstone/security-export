import { getInput, info } from "@actions/core";
import { getOctokit } from "@actions/github";

interface Input {
  token: string;
  organization?: string;
  enterprise?: string;
  repository?: string;
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
  return result;
}


const run = async (): Promise<void> => {
  const input = getInputs();
  const octokit = getOctokit(input.token, {
    throttle: {
      onRateLimit: (retryAfter, options, octokit, retryCount) => {
        octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`,);

        if (retryCount < 1) {
          octokit.log.info(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
        return false;
      },
      onSecondaryRateLimit: (_, options, octokit) => {
        octokit.log.warn(
          `SecondaryRateLimit detected for request ${options.method} ${options.url}`,
        );
      },
    },
  });

  const dependabotAlerts = await octokit.paginate({
    method: 'GET',
    url: input.organization ? `/orgs/${input.organization}/dependabot/alerts` : `/enterprises/${input.enterprise}/dependabot/alerts`,
  });

  console.log(dependabotAlerts);

  const orgs = input.organization ? [input.organization] : await octokit.paginate({
    method: 'GET',
    url: '/user/orgs',
  });

  const repos = orgs.map(async (org) => {
    return await octokit.paginate({
      method: 'GET',
      url: `/orgs/${org}/repos`,
    });
  }).flat();
  
  const codeScanningAlerts = repos.map(async (repo) => {
    return await octokit.paginate({
      method: 'GET',
      url: `/repos/${repo.full_name}/code-scanning/alerts`,
    });
  });

  console.log(codeScanningAlerts);

  const secretScanningAlerts = await octokit.paginate({
    method: 'GET',
    url: input.organization ? `/orgs/${input.organization}/secret-scanning/alerts` : `/enterprises/${input.enterprise}/secret-scanning/alerts`,
  });

  console.log(secretScanningAlerts);
};

run();
