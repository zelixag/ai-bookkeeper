<script setup lang="ts">
import type { Bill } from '@/types/bill'

const ICONS: Record<string, string> = {
  '餐饮': '🍜', '外卖': '🥡', '交通': '🚇', '购物': '🛒',
  '娱乐': '🎮', '住房': '🏠', '通讯': '📱', '医疗': '💊',
  '教育': '📚', '日用': '🧹', '工资': '💰', '转账': '💸',
  '红包': '🧧', '理财': '📈', '其他': '📦',
}

defineProps<{ bill: Bill }>()
const emit = defineEmits<{ delete: [id: string] }>()
</script>

<template>
  <div class="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
    <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg shrink-0">
      {{ ICONS[bill.category] || '📦' }}
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium truncate">{{ bill.note }}</span>
        <span
          class="text-sm font-bold shrink-0"
          :class="bill.type === 'expense' ? 'text-red-400' : 'text-emerald-400'"
        >
          {{ bill.type === 'expense' ? '-' : '+' }}{{ bill.amount.toFixed(2) }}
        </span>
      </div>
      <div class="flex justify-between items-center mt-0.5">
        <span class="text-xs text-slate-500">{{ bill.category }} · {{ bill.date }}</span>
        <button
          class="text-xs text-slate-600 hover:text-red-400 transition-colors"
          @click="emit('delete', bill.id)"
        >
          删除
        </button>
      </div>
    </div>
  </div>
</template>
