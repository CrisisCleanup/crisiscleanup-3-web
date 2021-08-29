
# Workspace Setup

Github Codespaces allow volunteers to quickly create and setup development workspaces to utilize in contributing to Crisis Cleanup (CCU) code repositories.  A new Codespace will automatically generate a container with a shallow clone of the targeted CCU repository, along with any other required development tools pre-installed.  The Codespace container runs on Github servers and can automatically detect and open HTTP ports that will be fowarded to a local browser for direct ad-hoc testing.

## Launch a Github Codespace

1. Navigate to the [crisiscleanup-3-web Github Page](https://github.com/CrisisCleanup/crisiscleanup-3-web)
1. Click the green "Code" drop-down button and then click "New Codespace".
1. Allow the new Codespace to load up in the web browser for the first time. `yarn install` will automatically execute to install Node dependencies for the first time.
1. (Optionally, select to open the codespace in a local installation of VS Code. Remote connectivity will automatically be established to the Codespace running on Github )

### Staging Environment
1. Request the appropriate `.env.staging` environment file properties from CCU team leads.
1. Create a new file named `.env.staging` in the root of the workspace with the properties.
1. `npx cross-env NODE_ENV=staging NODE_IS_WATCH=1 vue-cli-service serve --mode production`