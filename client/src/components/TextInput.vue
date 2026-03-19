<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ submit: [text: string] }>()
defineProps<{ loading: boolean }>()

const text = ref('')

function handleSubmit() {
  const val = text.value.trim()
  if (!val) return
  emit('submit', val)
  text.value = ''
}
</script>

<template>
  <div class="flex gap-2 px-4">
    <input
      v-model="text"
      :disabled="loading"
      placeholder="例：午饭外卖 35 元"
      class="flex-1 bg-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
      @keydown.enter="handleSubmit"
    />
    <button
      :disabled="loading || !text.trim()"
      class="bg-emerald-500 text-white px-4 rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
      @click="handleSubmit"
    >
      {{ loading ? '...' : '记' }}
    </button>
  </div>
</template>
