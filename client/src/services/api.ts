import type { ParsedBill } from '@/types/bill'

const TIMEOUT = 15_000

function fetchTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT)
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer))
}

export async function parseText(text: string): Promise<ParsedBill> {
  const res = await fetchTimeout('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: '解析失败' }))
    throw new Error(body.error || '解析失败')
  }

  return res.json()
}
