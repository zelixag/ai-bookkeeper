import type { Bill, ParsedBill } from '../types/bill';
import { validateCategory } from '../types/bill';
import { saveBill, getAllBills, deleteBill as dbDelete } from './db';

const PARSE_TIMEOUT = 15_000;
const ASR_TIMEOUT = 10_000;

function fetchWithTimeout(url: string, init: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

/** 语音识别：音频 Blob → 文字 */
export async function recognizeAudio(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append('audio', blob, 'recording.webm');
  const res = await fetchWithTimeout('/api/asr/recognize', { method: 'POST', body: form }, ASR_TIMEOUT);
  if (!res.ok) throw new Error('语音识别失败');
  const data = await res.json();
  if (!data.text) throw new Error('未识别到语音');
  return data.text;
}

/** AI 解析：文字 → 结构化账单 */
export async function parseText(text: string): Promise<ParsedBill> {
  const res = await fetchWithTimeout('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }, PARSE_TIMEOUT);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '解析失败' }));
    throw new Error(err.error || '解析失败');
  }
  return res.json();
}

/** 完整流程：文字 → AI 解析 → 校验 → 存 IndexedDB → 返回 Bill */
export async function createBill(rawText: string): Promise<Bill> {
  const parsed = await parseText(rawText);

  if (!parsed.amount || parsed.amount <= 0) {
    throw new Error('未识别到有效金额');
  }

  const bill: Bill = {
    id: crypto.randomUUID(),
    amount: Math.abs(parsed.amount),
    category: validateCategory(parsed.category),
    note: parsed.note || rawText,
    type: parsed.type === 'income' ? 'income' : 'expense',
    date: parsed.date || new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    raw_text: rawText,
  };

  await saveBill(bill);
  return bill;
}

export { getAllBills, dbDelete as deleteBill };
