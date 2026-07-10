import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(fileURLToPath(new URL('../../../../..', import.meta.url)));
const GENERATED_ROOT = resolve(fileURLToPath(new URL('../generated', import.meta.url)));
const BAKED_PROVENANCE_PATH = resolve(GENERATED_ROOT, 'baked-provenance.json');
const BAKED_ASSET_ROOT = resolve(GENERATED_ROOT, 'repo-assets');

type BakedProvenance = {
  commit: string;
  bakedAt: string;
  dirty: boolean;
};

let bakedProvenance: BakedProvenance | null | undefined;

export function repoPath(relativePath: string): string {
  return resolve(REPO_ROOT, relativePath);
}

export async function readRepoJson<T>(relativePath: string): Promise<T> {
  const text = await readRepoText(relativePath);
  return JSON.parse(text) as T;
}

export async function readRepoText(relativePath: string): Promise<string> {
  try {
    return await readFile(repoPath(relativePath), 'utf8');
  } catch {
    return readFile(bakedAssetPath(relativePath), 'utf8');
  }
}

export function gitCommitForPath(relativePath: string): string {
  try {
    return execFileSync('git', ['log', '-1', '--format=%H', '--', relativePath], {
      cwd: REPO_ROOT,
      encoding: 'utf8'
    }).trim();
  } catch {
    const baked = readBakedProvenance();
    if (baked === null) {
      return 'provenance-unavailable';
    }

    return `${baked.commit} (build-baked package commit; per-path granularity unavailable outside a git checkout; baked ${baked.bakedAt})`;
  }
}

function bakedAssetPath(relativePath: string): string {
  return resolve(BAKED_ASSET_ROOT, relativePath);
}

function readBakedProvenance(): BakedProvenance | null {
  if (bakedProvenance !== undefined) {
    return bakedProvenance;
  }

  try {
    const parsed = JSON.parse(readFileSync(BAKED_PROVENANCE_PATH, 'utf8')) as BakedProvenance;
    bakedProvenance = parsed;
    return bakedProvenance;
  } catch {
    bakedProvenance = null;
    return bakedProvenance;
  }
}
