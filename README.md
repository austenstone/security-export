# GitHub Security Export
This project exports GitHub code scanning, secret scanning, and dependabot security alerts to JSON.

## Usage
Create a workflow (eg: `.github/workflows/security-export.yml`). See [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### PAT(Personal Access Token)
You will need to [create a PAT(Personal Access Token)](https://github.com/settings/tokens/new?scopes=admin:org) that has the appropriate scope.

Add this PAT as a secret so we can use it as input `github-token`, see [Creating encrypted secrets for a repository](https://docs.github.com/en/enterprise-cloud@latest/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). 

### Organizations
If your organization has SAML enabled you must authorize the PAT, see [Authorizing a personal access token for use with SAML single sign-on](https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on).

#### Basic Usage
You can pass `enterprise`, `organization`, or `repository` to scope the export.

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
          organization: octodemo
      - run: |
          echo "$DEPENDABOT"
          echo "$CODE_SCANNING"
          echo "$SECRET_SCANNING"
        env:
          DEPENDABOT: ${{ steps.export.outputs.dependabot }}
          CODE_SCANNING: ${{ steps.export.outputs.code-scanning }}
          SECRET_SCANNING: ${{ steps.export.outputs.secret-scanning }}
```

#### CSV Format Example
You can export to CSV using the [austenstone/json-to-csv](https://github.com/austenstone/json-to-csv) action.

> [!NOTE]  
> The output of this action might exceed the maximum size of inputs/outputs. In that case leverage the generated artifact as shown in the example.

```yml
name: Export Security Alerts
on:
  workflow_dispatch:

jobs:
  run:
    name: Export
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./
        id: export
        with:
          github-token: ${{ secrets.PAT }}
          repository: octodemo/vulnerable-node
      - uses: austenstone/json-to-csv@main
        with:
          json-artifact-name: ${{ steps.export.outputs.artifact-name }}
          create-artifact: true
          artifact-name: "GitHub Security Alerts CSV"

```

#### Query Parameters Example
```yml
          code-scanning-query-parameters: '{ "severity": "critical", "state": "open" }'
          secret-scanning-query-parameters: '{ "state": "open" }'
          dependabot-query-parameters: '{ "severity": "critical", "state": "open" }'
```

#### Artifact
We create an artifact by default, you can disable this by setting `create-artifact` to `false`. Modify the `artifact-name` to change the name of the artifact.

```yml
          create-artifact: true
          artifact-name: "GitHub Security Alerts"
```

Access the artifact via the output variable `${{ steps[*].export.outputs.artifact-name }}`.

## ➡️ Inputs
Various inputs are defined in [`action.yml`](action.yml):

| Name | Description | Default |
| --- | - | - |
| github&#x2011;token | Token to use to authorize. | ${{&nbsp;github.token&nbsp;}} |
| enterprise | The GitHub Enterprise | N/A |
| organization | The GitHub organization | N/A |
| repository | The GitHub repository | ${{ github.repository }} |
| code-scanning | Whether to export code scanning alerts | true |
| code-scanning-query-parameters | Query parameters as JSON Ex: {"state": dismissed} | N/A |
| secret-scanning | Whether to export secret scanning alerts | true |
| secret-scanning-query-parameters | Query parameters as JSON | N/A |
| dependabot | Whether to export dependabot alerts | true |
| dependabot-query-parameters | Query parameters as JSON Ex: {"state": dismissed} | N/A |
| create-artifact | Whether to create an artifact | true |

## ⬅️ Outputs

| Name | Description |
| --- | --- |
| dependabot | Dependabot alerts as a JSON string |
| code-scanning | Code scanning alerts as a JSON string |
| secret-scanning | Secret scanning alerts as a JSON string |
| artifact-name | The name of the artifact |


## Further help
To get more help on the Actions see [documentation](https://docs.github.com/en/actions).
