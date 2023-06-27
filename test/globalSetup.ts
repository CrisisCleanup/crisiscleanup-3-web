import process from 'node:process';

// src/test-globals.ts
export async function setup() {
  process.env.TZ = 'UTC';
}

export async function teardown() {
  console.info('Tearing down setup');
}
