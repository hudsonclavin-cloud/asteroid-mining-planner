import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
    stdio: 'ignore',
  });
  process.stdout.write('setup-hooks: configured core.hooksPath = .githooks\n');
} catch {
  // npm prepare also runs outside a checkout; installation must remain successful.
}
