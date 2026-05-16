const STAR_CATALOG_MAGIC = 'TYC2BIN0';
const STAR_CATALOG_VERSION = 1;
const STAR_CATALOG_HEADER_BYTES = 16;
const STAR_CATALOG_RECORD_BYTES = 28;

export interface StarCatalog {
  readonly count: number;
  readonly positions: Float32Array;
  readonly magnitudes: Float32Array;
  readonly colors: Float32Array;
}

const starCatalogFixtureUrl = new URL(
  '../../../tests/fixtures/v2/star-catalog-tycho2-mag75.bin',
  import.meta.url,
);

export function parseStarCatalog(arrayBuffer: ArrayBuffer): StarCatalog {
  if (arrayBuffer.byteLength < STAR_CATALOG_HEADER_BYTES) {
    throw new Error(`Star catalog binary too small: ${arrayBuffer.byteLength} bytes`);
  }

  const headerView = new DataView(arrayBuffer, 0, STAR_CATALOG_HEADER_BYTES);
  const magic = new TextDecoder('ascii').decode(new Uint8Array(arrayBuffer, 0, 8));
  if (magic !== STAR_CATALOG_MAGIC) {
    throw new Error(`Star catalog magic mismatch: expected ${STAR_CATALOG_MAGIC}, received ${magic}`);
  }

  const version = headerView.getUint32(8, true);
  if (version !== STAR_CATALOG_VERSION) {
    throw new Error(`Unsupported star catalog version ${version}`);
  }

  const count = headerView.getUint32(12, true);
  const expectedByteLength = STAR_CATALOG_HEADER_BYTES + count * STAR_CATALOG_RECORD_BYTES;
  if (arrayBuffer.byteLength !== expectedByteLength) {
    throw new Error(
      `Star catalog byte length mismatch: expected ${expectedByteLength}, received ${arrayBuffer.byteLength}`,
    );
  }

  const positions = new Float32Array(count * 3);
  const magnitudes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const recordView = new DataView(arrayBuffer, STAR_CATALOG_HEADER_BYTES);

  for (let index = 0; index < count; index += 1) {
    const recordOffset = index * STAR_CATALOG_RECORD_BYTES;
    const positionOffset = index * 3;

    positions[positionOffset] = recordView.getFloat32(recordOffset + 0, true);
    positions[positionOffset + 1] = recordView.getFloat32(recordOffset + 4, true);
    positions[positionOffset + 2] = recordView.getFloat32(recordOffset + 8, true);
    magnitudes[index] = recordView.getFloat32(recordOffset + 12, true);
    colors[positionOffset] = recordView.getFloat32(recordOffset + 16, true);
    colors[positionOffset + 1] = recordView.getFloat32(recordOffset + 20, true);
    colors[positionOffset + 2] = recordView.getFloat32(recordOffset + 24, true);
  }

  return { count, positions, magnitudes, colors };
}

export async function loadStarCatalog(): Promise<StarCatalog> {
  const response = await fetch(starCatalogFixtureUrl);
  if (!response.ok) {
    throw new Error(`Failed to load star catalog fixture: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return parseStarCatalog(arrayBuffer);
}
