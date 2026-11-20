import assert from 'node:assert/strict';
import { applicationName } from '../src/core/environment.js';

assert.equal(applicationName, 'Đảo Đèn Lồng');
assert.equal(typeof globalThis.window, 'undefined');
assert.equal(typeof globalThis.document, 'undefined');
console.log('PASS: Node ESM imports core without DOM. Infrastructure only; no contract runner.');
