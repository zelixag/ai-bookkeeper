import type { Bill } from '../types/bill';

const DB_NAME = 'ai-bookkeeper';
const DB_VERSION = 1;
const STORE = 'bills';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    t.onerror = () => reject(t.error);
  }));
}

export function saveBill(bill: Bill): Promise<IDBValidKey> {
  return tx('readwrite', store => store.put(bill));
}

export function deleteBill(id: string): Promise<undefined> {
  return tx('readwrite', store => store.delete(id));
}

export async function getAllBills(): Promise<Bill[]> {
  const bills = await tx<Bill[]>('readonly', store => store.getAll());
  return bills.sort((a, b) => (b.date + b.created_at).localeCompare(a.date + a.created_at));
}

export async function exportBills(): Promise<string> {
  const bills = await getAllBills();
  return JSON.stringify(bills, null, 2);
}
