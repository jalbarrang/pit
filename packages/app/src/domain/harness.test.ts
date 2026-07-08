import assert from 'node:assert/strict';
import test from 'node:test';

test('@pit/app domain tests run under node:test', () => {
  assert.equal('conversation'.includes('turn'), false);
});
