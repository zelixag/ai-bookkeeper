export const EXPENSE_CATEGORIES = [
  '餐饮', '外卖', '交通', '购物', '娱乐',
  '住房', '通讯', '医疗', '教育', '日用', '其他',
] as const;

export const INCOME_CATEGORIES = [
  '工资', '转账', '红包', '理财', '其他',
] as const;

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;

export type BillCategory = (typeof ALL_CATEGORIES)[number];

export interface Bill {
  id: string;
  amount: number;
  category: BillCategory;
  note: string;
  type: 'expense' | 'income';
  date: string;       // "YYYY-MM-DD"
  created_at: string;  // ISO 8601
  raw_text: string;
}

/** AI 解析返回的结构（不含 id/created_at/raw_text） */
export interface ParsedBill {
  amount: number;
  category: string;
  note: string;
  type: 'expense' | 'income';
  date: string;
}

/** 校验 AI 返回的分类是否合法，不合法则归为"其他" */
export function validateCategory(cat: string): BillCategory {
  return (ALL_CATEGORIES as readonly string[]).includes(cat)
    ? (cat as BillCategory)
    : '其他';
}
