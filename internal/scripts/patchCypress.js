#!/usr/bin/env node

/*
 * Patch Cypress API Url
 *
 */

const shelljs = require('shelljs');
const path = require('path');

const getConfigPath = (cypBin) => {
  shelljs.env.DEBUG = 'cypress:*';
  const output = shelljs.exec(`${cypBin} version`, {
    silent: true,
    shell: shelljs.which('bash'),
  }).stderr;
  const searchStr = 'Reading binary package.json from: ';
  const pathStart = output.search(searchStr);
  const pathStdout = output.slice(pathStart + searchStr.length).split(' ')[0];
  return path.resolve(pathStdout, '../packages/server/config/app.yml');
};

// Paths
const rootDir = path.resolve(__dirname, '../../');
const cypressBin = path.resolve(rootDir, 'node_modules/.bin/cypress');
const apiCypress = 'https://api.cypress.io/';

// API Url to Set
const apiUrl = shelljs.env.SORRY_CYP_API_URL;

shelljs.echo(`Patching Cypress Api`);
shelljs.echo(`Found project root: ${rootDir}`);
shelljs.echo(`Cypress Binary: ${cypressBin}`);

const cypConfig = getConfigPath(cypressBin);
shelljs.echo(`Found Cypress Config: ${cypConfig}`);

shelljs.echo('\nPatching...');
shelljs.sed('-i', apiCypress, apiUrl, cypConfig);
shelljs.echo('Done!');
