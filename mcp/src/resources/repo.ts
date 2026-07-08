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

export async function readRepoText(relativePath: string): Promise<string> {
  return readFile(repoPath(relativePath), 'utf8');
}

export function gitCommitForPath(relativePath: string): string {
  // Phase D note: this is truthful on the canonical repo/dev box. Phase G needs
  // a build-time baked fallback for published npm runs where .git is absent.
  return execFileSync('git', ['log', '-1', '--format=%H', '--', relativePath], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  }).trim();
}
