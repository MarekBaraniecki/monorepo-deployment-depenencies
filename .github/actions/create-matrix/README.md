# Terraform job matrix

This is a private GitHub action, callable from workflows within this repository.

Based on the git diff of the current (event trigger) commit and either last ocmmit on the base branch (pull requests) or the previous commit on the branch that was pushed, it provides relative paths of packages that need to be deployed.

The directories are grouped into steps (arrays) of packages that can be deployed simultaneously.
First steps are packages that have no deployment dependencies, second step is packages that depended on packages from step one and so on.

## Inputs

### `github-base-ref`

**Required** Base ref (name of the branch the pull request aims to merge to), used in case of pull requests.

### `github-sha`

**Required** SHA of the current commit being processed.

> **Info:** `github-base-ref` must be always passed. In case of push events it is an empty strinng

## Constants

In `src/getMatrix.ts` there is the apps directory of the monorepo (workspace that contains services meant ot be deployed) defined as a string.

## Outputs

### `job-matrix`

Jobs matrix array composed of package directories (packages workspace subdirectories)

### Example output

```json
"[[\"boilerplate\",\"product-feed-export\"], [\"backend-for-frontend\", \"storefront\"]"
```

Where `boilerplate` and `product-feed-export` would be deployed immidiately and simultaneously and after those packages are both finished,
`backend-for-frontend` and `storefront` would be deployed simultaneously.

## Example usage

```yaml
- uses: ./.github/actions/create-matrix
  with:
    github-base-ref: ${{ github.base_ref }}
    github-sha: ${{ github.sha }}
  name: Build matrix action
  id: run-action
```

## Special package.json fields

This script parses the packages in the repository for additional deployment information. In every package.json deployment depenencies can be defined in the following way:

```
"deploymentDependencies": [
  "apps/backend-for-frontend"
]
```

`deploymentDependencies` needs to be an array of relative paths of services that need to be deployed before that service. This ensures correct order of deployment in the CD pipeline.

# Development

Github requires a bundled dist to be committed to the repo and runs that in the CI/CD environment. That is why this package does not contain a build script (it's build is skipped by Turborepo).

After applying your changes, run

```
node esbuild.config.js
```

and **THEN** commit the changes and check if the pipeline went through :)
