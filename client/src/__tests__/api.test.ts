import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseText } from '@/services/api'

describe('api.parseText', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('成功解析返回 ParsedBill', async () => {
    const mockResponse = {
      amount: 35,
      category: '外卖',
      note: '午饭',
      type: 'expense',
      date: '2026-03-19',
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await parseText('午饭外卖35元')
    expect(result.amount).toBe(35)
    expect(result.category).toBe('外卖')
    expect(result.type).toBe('expense')
  })

  it('服务端 500 抛出错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: '解析失败' }),
    } as Response)

    await expect(parseText('xxx')).rejects.toThrow('解析失败')
  })

  it('超时时 abort', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new DOMException('aborted')), 100)),
    )

    await expect(parseText('test')).rejects.toThrow()
  })
})
