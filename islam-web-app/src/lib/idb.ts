/**
 * تخزين التلاوات المحفوظة على الجهاز (IndexedDB) — لتعمل دون اتصال بالإنترنت.
 */

const DB_NAME = "sakina-audio";
const STORE = "tracks";

/** بيانات وصفية لتلاوة محفوظة على الجهاز */
export interface DownloadMeta {
  key: string;
  reciterId: string;
  reciterName: string;
  surah: number;
  size: number;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("no idb"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb error"));
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export function trackKey(reciterId: string, surah: number): string {
  return `${reciterId}::${String(surah).padStart(3, "0")}`;
}

export async function putTrack(key: string, blob: Blob): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").put(blob, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("put failed"));
  });
}

export async function getTrack(key: string): Promise<Blob | null> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readonly").get(key);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("get failed"));
  });
}

export async function deleteTrack(key: string): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("delete failed"));
  });
}

export function formatSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
