# Crisis Cleanup

> NOTE: This README needs more work once project is in a stable state.

Crisis Cleanup repo with vue 3.

## Project Setup

### Tools

#### ASDF VM

Install [asdf](https://asdf-vm.com/#/) version manager.

After installing `asdf`, add all the plugins found in
the [.tool-versions](.tool-versions) file.

```bash
# Add all the plugins to asdf.
$ cat .tool-versions | awk '{print $1}' | xargs -I _ asdf plugin add _
# Install all according to .tool-versions.
$ asdf install
```

Performing this step should install all tools required to run this project.

#### Direnv

[`direnv`](https://direnv.net/) is an extension for your shell. It augments existing shells with a new feature that can load and unload environment variables depending on the current directory.

- Install: https://direnv.net/docs/installation.html
- Hook with your shell: https://direnv.net/docs/hook.html
- Install [asdf-plugin](https://github.com/asdf-community/asdf-direnv) for direnv

> For more detailed instructions on asdf + direnv setup, please refer to [this guide](https://docs.arroyodev.com/setups/setup-asdf-direnv/)

Setup the project with `direnv` by creating a `.envrc.local` file with the following:

```bash
#!/usr/bin/env bash

# dotenv .env

# Staging
dotenv .env.staging

# Dev
#dotenv .env.dev

# Proxy
# dotenv .env.proxy

# Prod
# dotenv .env.prod
```

#### Dependencies

Clone the repository and install dependencies via:

```bash
$ pnpm install
```

Run dev server:

```bash
$ pnpm dev
```

#### Build

```bash
pnpm run build
```

#### Test

```bash
pnpm run test

# Show coverage
pnpm run test:cov
```

#### Environment Variables

Setup the project environment by creating a `.env` file with (at least) the following:

```bash
VITE_APP_TITLE=
VITE_APP_WHAT_3_WORDS_API_KEY=
VITE_APP_GOOGLE_MAPS_API_KEY=
VITE_APP_GOOGLE_TRANSLATE_API_KEY=
VITE_APP_PITNEYBOWES_API_KEY=
VITE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN=
VITE_APP_S3D_BUCKET=
VITE_APP_API_BASE_URL=
VITE_APP_PORTAL_KEY=

# CCP
VITE_APP_CCP_URL=
VITE_APP_WS_URL=
VITE_APP_AWS_CCP_REGION=
VITE_APP_CCP_PRINCIPAL=
VITE_APP_CCP_ROLE=
VITE_APP_CCP_INSTANCE=
VITE_APP_STAGE=
```


