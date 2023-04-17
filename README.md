<img src=".github/img/ccu-ballons.png" align="right" width="20%"  />

# Crisis Cleanup

Crisis Cleanup is a collaboratative disaster relief platform that connects relief organization volunteers with people who need help. The Crisis Cleanup platform has been used to connected 600,000+ volunteers from 2,500+ organizations with 140,000+ households in 55 states/provinces and 207 disasters in 7 countries; a new disaster every two weeks.

Crisis Cleanup works best in a collaborative environment where multiple voluntary organizations and agencies work together and coordinate efforts. Because these organizations do not take orders from one another, Crisis Cleanup is designed to facilitate Collaborative Accountability models of inter-agency interaction, rather than command-and-control operations, or or heirarchical accountability models of interaction.

## Other Project Stats (As of 2023-03-13)

- 25%: Increase in volunteer efficiency through re-engagement and elimination of time spent on travel, coordination, collaboration, and management.
- 35,000+: Households that could not have been helped without Crisis Cleanup.
- 5.6 Million: Number of volunteer hours facilitated.
- 1.4 Million: Volunteer hours that would have otherwise been wasted in management, travel, and overhead without Crisis Cleanup.
- $1.695 Billion: Minimum total market value of services to survivors.
- $1,741: Value of each cleanup volunteer to his/her community.
- $183.3 Million: Market value of services to survivors that would have otherwise been wasted in travel, management, overhead, and standing in lines.
- $60,839: Money Crisis Cleanup has saved survivors every single day since July 18, 2012.
- $9,052: Average commercial value of service to each homeowner.
  How we calculate these statistics: http://blog.crisiscleanup.org/2017/10/how-we-calculate-value-of-services.html

# Contributing

To preserve our ability to provide open source humanitarian disaster software, all contributions are subject to the terms of the relevant [Contributor License Agreement (CLA)](http://en.wikipedia.org/wiki/Contributor_License_Agreement) downloadable at [crisiscleanup.org/contributions](https://www.crisiscleanup.org/contributions).

Please read [CONTRIBUTING.md](https://github.com/CrisisCleanup/crisiscleanup-3-web/blob/master/CONTRIBUTING.md) for important details.

# Getting Started

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

Setup the project environment by creating a `.env` file. See [`.env.sample`](.env.sample) for an example.
