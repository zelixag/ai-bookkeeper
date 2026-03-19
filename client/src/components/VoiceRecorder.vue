<script setup lang="ts">
import { useRecorder } from '@/composables/useRecorder'

const emit = defineEmits<{ result: [text: string] }>()
defineProps<{ disabled?: boolean }>()

const { state, error, supported, start, stop } = useRecorder((text) => {
  emit('result', text)
})
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <p v-if="!supported" class="text-xs text-red-400">
      当前浏览器不支持录音
    </p>
    <button
      v-else
      :disabled="disabled || state === 'processing'"
      class="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all active:scale-95"
      :class="{
        'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse': state === 'recording',
        'bg-slate-600 animate-pulse': state === 'processing',
        'bg-emerald-500 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400': state === 'idle',
        'opacity-50': disabled,
      }"
      @touchstart.prevent="start"
      @touchend.prevent="stop"
      @mousedown="start"
      @mouseup="stop"
    >
      <span v-if="state === 'recording'">🔴</span>
      <span v-else-if="state === 'processing'">⏳</span>
      <span v-else>🎤</span>
    </button>
    <p class="text-xs text-slate-400 text-center min-h-[1rem]">
      <span v-if="state === 'recording'">松开结束</span>
      <span v-else-if="state === 'processing'">识别中...</span>
      <span v-else-if="error" class="text-red-400">{{ error }}</span>
      <span v-else>按住说话</span>
    </p>
  </div>
</template>
