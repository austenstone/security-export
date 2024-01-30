# Security Export
This project exports GitHub code scanning, secret scanning, and dependabot security alerts to JSON.

## Usage
Create a workflow (eg: `.github/workflows/seat-count.yml`). See [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).


### PAT(Personal Access Token)
You will need to [create a PAT(Personal Access Token)](https://github.com/settings/tokens/new?scopes=admin:org) that has `admin:org` access.

Add this PAT as a secret so we can use it as input `github-token`, see [Creating encrypted secrets for a repository](https://docs.github.com/en/enterprise-cloud@latest/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). 

### Organizations
If your organization has SAML enabled you must authorize the PAT, see [Authorizing a personal access token for use with SAML single sign-on](https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on).


#### Example
```yml
name: Export Security Alerts
on:
  workflow_dispatch:

jobs:
  run:
    name: Export
    runs-on: ubuntu-latest
    steps:
      - uses: austenstone/security-export@main
        id: export
        with:
          github-token: ${{ secrets.PAT }}
          enterprise: ${{ vars.enterprise }}
      - run: echo "${{ steps.export.outputs.dependabot }}" > dependabot.json
      - run: echo "${{ steps.export.outputs.code-scanning }}" > code-scanning.json
      - run: echo "${{ steps.export.outputs.secret-scanning }}" > secret-scanning.json
      
```

## ➡️ Inputs
Various inputs are defined in [`action.yml`](action.yml):

| Name | Description | Default |
| --- | - | - |
| github&#x2011;token | Token to use to authorize. | ${{&nbsp;github.token&nbsp;}} |
| organization | The GitHub organization | ${{ github.repository_owner }} |
| repository | The GitHub repository | ${{ github.repository }} |
| enterprise | The GitHub Enterprise | None |
| code-scanning | Whether to export code scanning alerts | true |
| secret-scanning | Whether to export secret scanning alerts | true |
| dependabot | Whether to export dependabot alerts | true |

## ⬅️ Outputs

| Name | Description |
| --- | --- |
| dependabot | Dependabot alerts as a JSON string |
| code-scanning | Code scanning alerts as a JSON string |
| secret-scanning | Secret scanning alerts as a JSON string |


## Further help
To get more help on the Actions see [documentation](https://docs.github.com/en/actions).
