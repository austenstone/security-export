import { getOctokit as _getOctokit } from "@actions/github";

export interface Input {
  organization?: string;
  enterprise?: string;
  repository?: string;
}

const getCodeScanningAlerts = async (
  octokit: (ReturnType<typeof getOctokit>),
  input: Input
) => {
  if (input.organization) {
    return octokit.paginate(
      "GET /orgs/{org}/code-scanning/alerts",
      {
        org: input.organization,
      },
      (response) => response.data
    );
  } else if (input.enterprise) {
    return octokit.paginate(
      "GET /orgs/{org}/code-scanning/alerts",
      // "GET /orgs/{enterprise}/code-scanning/alerts",
      {
        org: input.enterprise,
        // enterprise: input.enterprise,
      },
      (response) => response.data
    );
  } else if (input.repository) {
    return octokit.paginate(
      "GET /repos/{owner}/{repo}/code-scanning/alerts",
      {
        owner: input.repository.split("/")[0],
        repo: input.repository.split("/")[1],
      },
      (response) => response.data
    );
  } else {
    throw new Error("Organization, enterprise, or repository is required");
  }
};

const getDependabotAlerts = async (
  octokit: (ReturnType<typeof getOctokit>),
  input: Input
) => {
  if (input.organization) {
    return octokit.paginate(
      "GET /orgs/{org}/dependabot/alerts",
      {
        org: input.organization,
      },
      (response) => response.data
    );
  } else if (input.enterprise) {
    return octokit.paginate(
      "GET /enterprises/{enterprise}/dependabot/alerts",
      {
        enterprise: input.enterprise,
      },
      (response) => response.data
    );
  } else if (input.repository) {
    return octokit.paginate(
      "GET /repos/{owner}/{repo}/dependabot/alerts",
      {
        owner: input.repository.split("/")[0],
        repo: input.repository.split("/")[1],
      },
      (response) => response.data
    );
  } else {
    throw new Error("Organization, enterprise, or repository is required");
  }
};

const getSecretScanningAlerts = async (
  octokit: ReturnType<typeof getOctokit>,
  input: Input
) => {
  if (input.organization) {
    return octokit.paginate(
      "GET /orgs/{org}/secret-scanning/alerts",
      {
        org: input.organization,
      },
      (response) => response.data
    );
  } else if (input.enterprise) {
    return octokit.paginate(
      "GET /enterprises/{enterprise}/secret-scanning/alerts",
      {
        enterprise: input.enterprise,
      },
      (response) => response.data
    );
  } else if (input.repository) {
    return octokit.paginate(
      "GET /repos/{owner}/{repo}/secret-scanning/alerts",
      {
        owner: input.repository.split("/")[0],
        repo: input.repository.split("/")[1],
      },
      (response) => response.data
    );
  } else {
    throw new Error("Organization, enterprise, or repository is required");
  }
};

const getOctokit = (token: string): (ReturnType<typeof _getOctokit>) => {
  return _getOctokit(token, {
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
};

export { getOctokit, getDependabotAlerts, getCodeScanningAlerts, getSecretScanningAlerts }
