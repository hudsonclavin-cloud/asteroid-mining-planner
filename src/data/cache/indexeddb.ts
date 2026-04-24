/**
 * src/data/cache/indexeddb.ts
 *
 * IndexedDB persistence helpers for the aster_catalog_v7 cache.
 * Owns: openAsterDB(), getFromIndexedDB(key), saveToIndexedDB(key, value)
 *
 * The AsterDB database exposes a single 'catalog' object store used to
 * persist the full asteroid catalog between sessions, avoiding a network
 * fetch on every page load.  All three functions are extracted verbatim
 * from index.html (lines ~2486–2512).
 */

export function openAsterDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('AsterDB', 1);
    req.onupgradeneeded = e => (e.target as IDBOpenDBRequest).result.createObjectStore('catalog');
    req.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

export async function getFromIndexedDB(key: string): Promise<any> {
  const db = await openAsterDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalog', 'readonly');
    const req = tx.objectStore('catalog').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveToIndexedDB(key: string, value: any): Promise<void> {
  const db = await openAsterDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalog', 'readwrite');
    tx.objectStore('catalog').put(value, key);
    tx.oncomplete = resolve as any;
    tx.onerror = () => reject(tx.error);
  });
}
