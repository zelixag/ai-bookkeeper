<script setup lang="ts">
import { showToast } from 'vant'
import { useBills } from '@/composables/useBills'
import StatsBar from '@/components/StatsBar.vue'
import TextInput from '@/components/TextInput.vue'
import BillCard from '@/components/BillCard.vue'

const { bills, loading, todayTotal, monthTotal, addFromText, remove } = useBills()

async function handleSubmit(text: string) {
  try {
    const bill = await addFromText(text)
    showToast({ message: `已记录: ${bill.category} ¥${bill.amount}`, position: 'top' })
  } catch (e) {
    showToast({ message: e instanceof Error ? e.message : '记账失败', position: 'top' })
  }
}

async function handleDelete(id: string) {
  await remove(id)
  showToast({ message: '已删除', position: 'top' })
}
</script>

<template>
  <div class="h-full flex flex-col max-w-md mx-auto">
    <!-- Header -->
    <div class="p-4 pt-8 text-center">
      <h1 class="text-xl font-bold">AI 记账</h1>
      <p class="text-xs text-slate-500 mt-1">说一句话，自动记账</p>
    </div>

    <!-- Stats -->
    <StatsBar
      :today-total="todayTotal"
      :month-total="monthTotal"
      :count="bills.length"
      class="mb-4"
    />

    <!-- Input -->
    <TextInput :loading="loading" class="mb-4" @submit="handleSubmit" />

    <!-- Bill List -->
    <div class="flex-1 overflow-y-auto px-4 pb-6">
      <h2 class="text-sm font-medium text-slate-400 mb-2">账单记录</h2>
      <p v-if="bills.length === 0" class="text-center text-slate-600 text-sm mt-8">
        还没有记录，试试输入"午饭 35 元"
      </p>
      <div v-else class="flex flex-col gap-2">
        <BillCard
          v-for="bill in bills"
          :key="bill.id"
          :bill="bill"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>
