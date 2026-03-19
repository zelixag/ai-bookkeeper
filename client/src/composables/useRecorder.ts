import { ref } from 'vue'

export type RecorderState = 'idle' | 'recording' | 'processing'

export function useRecorder(onResult: (text: string) => void) {
  const state = ref<RecorderState>('idle')
  const error = ref('')
  const supported = ref(!!navigator.mediaDevices?.getUserMedia)

  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let stream: MediaStream | null = null

  async function start() {
    if (state.value !== 'idle') return
    error.value = ''

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })
      chunks = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        cleanup()
        if (chunks.length === 0) return

        state.value = 'processing'
        const blob = new Blob(chunks, { type: 'audio/webm' })

        try {
          const form = new FormData()
          form.append('audio', blob, 'recording.webm')

          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 10_000)
          const res = await fetch('/api/asr/recognize', {
            method: 'POST',
            body: form,
            signal: ctrl.signal,
          }).finally(() => clearTimeout(timer))

          if (!res.ok) throw new Error('语音识别失败')

          const data = await res.json()
          if (!data.text?.trim()) throw new Error('未识别到语音')

          onResult(data.text.trim())
        } catch (e) {
          error.value = e instanceof Error ? e.message : '识别失败'
        } finally {
          state.value = 'idle'
        }
      }

      mediaRecorder.start(100)
      state.value = 'recording'
    } catch {
      error.value = '无法访问麦克风，请检查权限'
      state.value = 'idle'
    }
  }

  function stop() {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop()
    }
  }

  function cleanup() {
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
    mediaRecorder = null
  }

  return { state, error, supported, start, stop }
}
