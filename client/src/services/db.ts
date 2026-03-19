import type { Bill } from '@/types/bill'

const DB_NAME = 'ai-bookkeeper'
const DB_VERSION = 1
const STORE = 'bills'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('date', 'date')
        store.createIndex('category', 'category')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return open().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const req = fn(tx.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        tx.onerror = () => reject(tx.error)
      }),
  )
}

export function saveBill(bill: Bill): Promise<IDBValidKey> {
  return withStore('readwrite', (s) => s.put(bill))
}

export function deleteBill(id: string): Promise<undefined> {
  return withStore('readwrite', (s) => s.delete(id))
}

export async function getAllBills(): Promise<Bill[]> {
  const bills = await withStore<Bill[]>('readonly', (s) => s.getAll())
  return bills.sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt))
}
