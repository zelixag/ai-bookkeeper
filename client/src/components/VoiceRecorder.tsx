import React, { useState, useRef, useCallback } from 'react';

interface Props {
  onResult: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onResult, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // 发送到服务端 ASR
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res = await fetch('/api/asr/recognize', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.text) {
            setText(data.text);
            onResult(data.text);
          } else {
            setText('未识别到语音');
          }
        } catch {
          setText('识别失败');
        }
      };

      mediaRecorder.start(100);
      setRecording(true);
      setText('正在录音...');
    } catch (err) {
      setText('无法访问麦克风');
    }
  }, [onResult]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setText('识别中...');
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        disabled={disabled}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95 ${
          recording
            ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
            : 'bg-emerald-500 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        {recording ? '🔴' : '🎤'}
      </button>
      <p className="text-sm text-slate-400 text-center min-h-[1.5rem]">
        {recording ? '松开结束' : (text || '按住说话')}
      </p>
    </div>
  );
}
