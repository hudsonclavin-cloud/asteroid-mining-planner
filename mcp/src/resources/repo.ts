import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(fileURLToPath(new URL('../../../../..', import.meta.url)));

export function repoPath(relativePath: string): string {
  return resolve(REPO_ROOT, relativePath);
}

export async function readRepoJson<T>(relativePath: string): Promise<T> {
  const text = await readFile(repoPath(relativePath), 'utf8');
  return JSON.parse(text) as T;
}

export function gitCommitForPath(relativePath: string): string {
  return execFileSync('git', ['log', '-1', '--format=%H', '--', relativePath], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  }).trim();
}
