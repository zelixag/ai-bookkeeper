import React from 'react';
import type { Bill } from '../api';

const CATEGORY_ICONS: Record<string, string> = {
  '餐饮': '🍜', '外卖': '🥡', '交通': '🚇', '购物': '🛒',
  '娱乐': '🎮', '住房': '🏠', '通讯': '📱', '医疗': '💊',
  '教育': '📚', '工资': '💰', '转账': '💸', '其他': '📦',
};

interface Props {
  bill: Bill;
  onDelete: (id: string) => void;
}

export default function BillCard({ bill, onDelete }: Props) {
  const icon = CATEGORY_ICONS[bill.category] || '📦';
  const isExpense = bill.type === 'expense';

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium truncate">{bill.note || bill.category}</span>
          <span className={`text-sm font-bold ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
            {isExpense ? '-' : '+'}{bill.amount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-xs text-slate-500">{bill.category} · {bill.date}</span>
          <button
            onClick={() => onDelete(bill.id)}
            className="text-xs text-slate-600 hover:text-red-400 transition-colors"
          >
            删除
          </button>
        </div>
        {bill.raw_text && (
          <p className="text-xs text-slate-600 mt-1 truncate">"{bill.raw_text}"</p>
        )}
      </div>
    </div>
  );
}
