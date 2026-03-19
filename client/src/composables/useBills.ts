import { ref, computed, onMounted } from 'vue'
import type { Bill } from '@/types/bill'
import { toCategory } from '@/types/bill'
import { parseText } from '@/services/api'
import { saveBill, deleteBill as dbDelete, getAllBills } from '@/services/db'

export function useBills() {
  const bills = ref<Bill[]>([])
  const loading = ref(false)
  const error = ref('')

  const today = () => new Date().toISOString().slice(0, 10)
  const month = () => new Date().toISOString().slice(0, 7)

  const todayTotal = computed(() =>
    bills.value
      .filter((b) => b.type === 'expense' && b.date === today())
      .reduce((s, b) => s + b.amount, 0),
  )

  const monthTotal = computed(() =>
    bills.value
      .filter((b) => b.type === 'expense' && b.date.startsWith(month()))
      .reduce((s, b) => s + b.amount, 0),
  )

  async function load() {
    bills.value = await getAllBills()
  }

  async function addFromText(rawText: string) {
    loading.value = true
    error.value = ''
    try {
      const parsed = await parseText(rawText)
      if (!parsed.amount || parsed.amount <= 0) {
        throw new Error('未识别到有效金额')
      }
      const bill: Bill = {
        id: crypto.randomUUID(),
        amount: Math.abs(parsed.amount),
        category: toCategory(parsed.category),
        note: parsed.note || rawText,
        type: parsed.type === 'income' ? 'income' : 'expense',
        date: parsed.date || today(),
        createdAt: new Date().toISOString(),
        rawText,
      }
      await saveBill(bill)
      bills.value.unshift(bill)
      return bill
    } catch (e) {
      error.value = e instanceof Error ? e.message : '记账失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    await dbDelete(id)
    bills.value = bills.value.filter((b) => b.id !== id)
  }

  onMounted(load)

  return { bills, loading, error, todayTotal, monthTotal, addFromText, remove }
}
