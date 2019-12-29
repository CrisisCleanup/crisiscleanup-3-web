#!/usr/bin/env node
/* eslint-disable  */
const Handlebars = require('handlebars');

const colors = {
  open_unassigned_unclaimed: {
    fillColor: '#d0021b',
    strokeColor: '#e30001',
  },
  open_unassigned_claimed: {
    fillColor: '#fab92e',
    strokeColor: '#f79820',
  },
  open_assigned_unclaimed: {
    fillColor: '#d0021b',
    strokeColor: '#e30001',
  },
  open_assigned_claimed: {
    fillColor: '#f0f032',
    strokeColor: '#85863f',
  },
  'open_partially-completed_unclaimed': {
    fillColor: '#d0021b',
    strokeColor: '#e30001',
  },
  'open_partially-completed_claimed': {
    fillColor: '#0054bb',
    strokeColor: '#0054bb',
  },
  'open_needs-follow-up_unclaimed': {
    fillColor: '#d0021b',
    strokeColor: '#e30001',
  },
  'open_needs-follow-up_claimed': {
    fillColor: '#ea51eb',
    strokeColor: '#e018e1',
  },
  open_unresponsive_unclaimed: {
    fillColor: '#787878',
    strokeColor: '#5d5d5d',
  },
  open_unresponsive_claimed: {
    fillColor: '#787878',
    strokeColor: '#5d5d5d',
  },
  closed_completed_unclaimed: {
    fillColor: '#82d78c',
    strokeColor: '#51ac7c',
  },
  closed_completed_claimed: {
    fillColor: '#82d78c',
    strokeColor: '#51ac7c',
  },
  closed_incomplete_unclaimed: {
    fillColor: '#1d1d1d',
    strokeColor: '#1d1d1d',
  },
  closed_incomplete_claimed: {
    fillColor: '#1d1d1d',
    strokeColor: '#1d1d1d',
  },
  'closed_out-of-scope_unclaimed': {
    fillColor: '#787878',
    strokeColor: '#787878',
  },
  'closed_out-of-scope_claimed': {
    fillColor: '#787878',
    strokeColor: '#787878',
  },
  'closed_done-by-others_unclaimed': {
    fillColor: '#0fa355',
    strokeColor: '#0fa355',
  },
  'closed_done-by-others_claimed': {
    fillColor: '#0fa355',
    strokeColor: '#0fa355',
  },
};

const fs = require('fs');

try {
  const path = `${__dirname}/icon_templates`;
  const files = fs.readdirSync(path);

  for (const file of files) {
    const data = fs.readFileSync(`${path}/${file}`, 'utf8');
    const template = Handlebars.compile(data);
    for (const [key, value] of Object.entries(colors)) {
      const svg = template({
        fillColor: value.fillColor,
        strokeColor: value.strokeColor,
      });
      fs.writeFile(
        `${__dirname}/public/map_icons/${file.replace('.hbs', '')}_${key}.svg`,
        svg,
        err => {
          if (err) throw err;
        },
      );
    }
  }
} catch (err) {
  console.error(err);
}
