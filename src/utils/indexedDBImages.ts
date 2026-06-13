// Minimal IndexedDB helper for storing recipe images as blobs
const DB_NAME = 'receitas-images-db';
const STORE_NAME = 'images';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFile(file: File): Promise<string> {
  const db = await openDB();
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const reader = new FileReader();
    reader.onloadend = () => {
      const blob = new Blob([reader.result as ArrayBufferLike], { type: file.type });
      const req = store.add({ id, blob, type: file.type });
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export async function saveBlobDataURL(dataUrl: string, type = 'image/png'): Promise<string> {
  // convert dataURL to blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const db = await openDB();
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({ id, blob, type });
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

export async function getBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      const result = req.result;
      if (!result) return resolve(null);
      resolve(result.blob as Blob);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getImageURL(id: string): Promise<string | null> {
  const blob = await getBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteImage(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export default {};
