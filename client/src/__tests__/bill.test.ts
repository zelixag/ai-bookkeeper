import { describe, it, expect } from 'vitest'
import { isValidCategory, toCategory, CATEGORIES } from '@/types/bill'

describe('bill types', () => {
  it('CATEGORIES 包含 15 个分类', () => {
    expect(CATEGORIES).toHaveLength(15)
  })

  it('isValidCategory 识别合法分类', () => {
    expect(isValidCategory('餐饮')).toBe(true)
    expect(isValidCategory('外卖')).toBe(true)
    expect(isValidCategory('工资')).toBe(true)
  })

  it('isValidCategory 拒绝非法分类', () => {
    expect(isValidCategory('吃饭')).toBe(false)
    expect(isValidCategory('')).toBe(false)
    expect(isValidCategory('abc')).toBe(false)
  })

  it('toCategory 合法分类原样返回', () => {
    expect(toCategory('交通')).toBe('交通')
    expect(toCategory('红包')).toBe('红包')
  })

  it('toCategory 非法分类返回其他', () => {
    expect(toCategory('吃饭')).toBe('其他')
    expect(toCategory('')).toBe('其他')
  })
})
