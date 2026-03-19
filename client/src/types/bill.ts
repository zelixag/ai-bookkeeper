export const CATEGORIES = [
  '餐饮', '外卖', '交通', '购物', '娱乐',
  '住房', '通讯', '医疗', '教育', '日用',
  '工资', '转账', '红包', '理财', '其他',
] as const

export type BillCategory = (typeof CATEGORIES)[number]

export interface Bill {
  id: string
  amount: number
  category: BillCategory
  note: string
  type: 'expense' | 'income'
  date: string       // YYYY-MM-DD
  createdAt: string  // ISO 8601
  rawText: string    // 用户原始输入
}

/** AI 解析返回（不含 id/createdAt/rawText） */
export interface ParsedBill {
  amount: number
  category: string
  note: string
  type: 'expense' | 'income'
  date: string
}

export function isValidCategory(cat: string): cat is BillCategory {
  return (CATEGORIES as readonly string[]).includes(cat)
}

export function toCategory(cat: string): BillCategory {
  return isValidCategory(cat) ? cat : '其他'
}
