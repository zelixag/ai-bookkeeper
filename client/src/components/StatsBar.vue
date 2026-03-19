<script setup lang="ts">
defineProps<{
  todayTotal: number
  monthTotal: number
  count: number
}>()
</script>

<template>
  <div class="flex gap-3 px-4">
    <div class="flex-1 bg-slate-800/50 rounded-xl p-3 text-center">
      <p class="text-xs text-slate-500">今日支出</p>
      <p class="text-lg font-bold text-red-400">¥{{ todayTotal.toFixed(2) }}</p>
    </div>
    <div class="flex-1 bg-slate-800/50 rounded-xl p-3 text-center">
      <p class="text-xs text-slate-500">本月支出</p>
      <p class="text-lg font-bold text-orange-400">¥{{ monthTotal.toFixed(2) }}</p>
    </div>
    <div class="flex-1 bg-slate-800/50 rounded-xl p-3 text-center">
      <p class="text-xs text-slate-500">总笔数</p>
      <p class="text-lg font-bold text-emerald-400">{{ count }}</p>
    </div>
  </div>
</template>
