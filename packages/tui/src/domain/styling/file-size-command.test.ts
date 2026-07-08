import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import test from 'node:test';

const fixture = 'packages/tui/src/domain/styling/too-large.tmp.ts';

test('file-size command reports authored files over 100 lines', () => {
  mkdirSync(dirname(fixture), { recursive: true });
  writeFileSync(fixture, Array.from({ length: 101 }, () => '// x').join('\n'));

  try {
    assert.throws(
      () => execFileSync('bash', ['scripts/check-file-size.sh'], { encoding: 'utf8' }),
      error => {
        const output = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message}`;
        return output.includes(fixture);
      },
    );
  } finally {
    rmSync(fixture, { force: true });
  }
});
