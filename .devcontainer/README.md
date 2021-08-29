
# Workspace Setup

Github Codespaces allow volunteers to quickly create and setup development workspaces to utilize in contributing to Crisis Cleanup (CCU) code repositories.  A new Codespace will automatically generate a container with a shallow clone of the targeted CCU repository, along with any other required development tools pre-installed.  The Codespace container runs on Github servers and can automatically detect and open HTTP ports that will be fowarded to a local browser for direct ad-hoc testing.

## Launch a Github Codespace

1. Navigate to the [crisiscleanup-3-web Github Page](https://github.com/CrisisCleanup/crisiscleanup-3-web)
1. Click the green "Code" drop-down button and then click "New Codespace".
1. Allow the new Codespace to load up in the web browser for the first time. `yarn install` will automatically execute to install Node dependencies for the first time.
1. (Optionally, select to open the codespace in a local installation of VS Code. Remote connectivity will automatically be established to the Codespace running on Github )

### Staging Environment Testing
1. Request the appropriate `.env` and `.env.staging` environment variables from development team leads.
1. Create `.env` and `.env.staging` files in the root of the workspace with populate with the environment variables.
1. Execute app locally `npx cross-env NODE_ENV=staging NODE_IS_WATCH=1 vue-cli-service serve --mode production`
1. When prompted by VS Code, allow port 8080 to be forwarded to your local browser.  Navigate to `http://localhost:8080`. (ensure that the url is using `localhost:8080` and NOT `127.0.0.1:8080`)