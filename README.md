<img src=".github/img/ccu-ballons.png" align="right" width="20%"  />

# Crisis Cleanup

Crisis Cleanup is a collaboration platform that connects disaster recovery organization volunteers with people who need help after a disaster. The Crisis Cleanup platform has been used to connected 631,620 volunteers from 1,704 organizations with 80,905 households in 48 states/provinces and 143 disasters in 7 countries; a new disaster every two weeks.

Crisis Cleanup works best in a collaborative environment where multiple voluntary organizations and agencies work together and coordinate efforts. Because these organizations do not take orders from one another, Crisis Cleanup is designed to facilitate Collaborative Accountability models of inter-agency interaction, rather than command-and-control operations, or or heirarchical accountability models of interaction. 

Other Project Stats (As of 2020-03-22)
-------------

 - 25%: Increase in volunteer efficiency through re-engagement and elimination of time spent on travel, coordination, collaboration, and management.
 - 20,226: Households that could not have been helped without Crisis Cleanup.
 - 4.9 Million: Number of volunteer hours facilitated.
 - 1,210,000: Volunteer hours that would have otherwise been wasted in management, travel, and overhead without Crisis Cleanup.
 - $526.4 Million: Minimum total market value of services to survivors.
 - $833: Value of each cleanup volunteer to his/her community.
 - $131.6 Million: Market value of services to survivors that would have otherwise been wasted in travel, management, overhead, and standing in lines.
 - $46,929: Money Crisis Cleanup has saved survivors every single day since July 18, 2012.
 - $9,586: Average commercial value of service to each homeowner.
 - $187: Return on investment to survivors, for every $1 invested in Crisis Cleanup.
How we calculate these statistics: http://blog.crisiscleanup.org/2017/10/how-we-calculate-value-of-services.html

# Getting Started

## Project Setup

Clone the repository to your machine and install the dependencies via:

```sh
 $ git clone https://github.com/CrisisCleanup/crisiscleanup-3-web.git
 $ cd ./crisiscleanup-3-web
 $ yarn install
```

## Configuration

To enable all of Crisis Cleanup's features, you must create and populate a `.env` file.

A sample of what this should look like can be found [here](.env.sample).

## Running Locally

When modifying Crisis Cleanup, you can begin serving it via:

```sh
  $ yarn serve-dev
  $ sensible-browser http://localhost:8080 # defaults to port 8080
```

> You can also serve the site via a docker service:
> ```sh
>  $ docker-compose build
>  $ docker-compose up dev # or prod for production
> ```

This will enable hot module reloading among other developer tools to aid you.

To preview a production build locally, execute:
```sh
 $ yarn serve
 $ sensible-browser http://localhost:8080 # default port
```

This will enable the code optimizations that would be present in a live environment.

Finally, you can compile a production-ready, minified version via:
```sh
  $ yarn build
  $ npx http-server ./dist
  $ sensible-browser http://localhost:8080
```

### Testing

For unit tests, Crisis Cleanup uses [Jest](https://jestjs.io/). You can run the full test suite via:

```sh
  $ yarn test:unit
```

For end-to-end testing, Cypress is utilized. You can run all e2e specs via:

```sh
  $ yarn serve
  $ yarn test:e2e  # or test:e2e:hl to run headlessly
```

Any recorded e2e test sessions can be found at: http://cypress.crisiscleanup.io

### Linting

Utilizing [prettier](https://prettier.io/) and [ESLint](https://eslint.org/), CrisisCleanup enforces strict code style guidelines.

You can automagically format your code to comply with:

```sh
  $ yarn format  # executes eslint --fix and prettier --write
```

### Storybook

We use [Storybook](https://storybook.js.org/) for building our components in isolation and for documentation.

You can run our storybook locally and add additional ones via:

```sh
  $ yarn storybook
  $ sensible-browser http://localhost:6006 # port defaults to 6006
```

The live storybook can be found at: https://storybook.crisiscleanup.io
