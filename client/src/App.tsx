import React, { useState, useEffect, useCallback } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import BillCard from './components/BillCard';
import { getBills, parseBill, deleteBill, type Bill } from './api';

export default function App() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const loadBills = useCallback(async () => {
    try {
      const data = await getBills();
      setBills(data);
    } catch {}
  }, []);

  useEffect(() => { loadBills(); }, [loadBills]);

  const handleParse = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const bill = await parseBill(text);
      setBills(prev => [bill, ...prev]);
      showToast(`已记录: ${bill.category} ¥${bill.amount}`);
      setTextInput('');
    } catch {
      showToast('记账失败，请重试');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteBill(id);
    setBills(prev => prev.filter(b => b.id !== id));
    showToast('已删除');
  };

  const todayTotal = bills
    .filter(b => b.type === 'expense' && b.date === new Date().toISOString().slice(0, 10))
    .reduce((sum, b) => sum + b.amount, 0);

  const monthTotal = bills
    .filter(b => b.type === 'expense' && b.date?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="h-full flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="p-4 pt-8 text-center">
        <h1 className="text-xl font-bold">AI 记账</h1>
        <p className="text-xs text-slate-500 mt-1">说一句话，自动记账</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 px-4 mb-4">
        <div className="flex-1 bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500">今日支出</p>
          <p className="text-lg font-bold text-red-400">¥{todayTotal.toFixed(2)}</p>
        </div>
        <div className="flex-1 bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500">本月支出</p>
          <p className="text-lg font-bold text-orange-400">¥{monthTotal.toFixed(2)}</p>
        </div>
        <div className="flex-1 bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500">总笔数</p>
          <p className="text-lg font-bold text-emerald-400">{bills.length}</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 mb-4">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-3 justify-center">
          <button
            onClick={() => setMode('voice')}
            className={`px-4 py-1.5 rounded-full text-xs ${mode === 'voice' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            语音记账
          </button>
          <button
            onClick={() => setMode('text')}
            className={`px-4 py-1.5 rounded-full text-xs ${mode === 'text' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            文字记账
          </button>
        </div>

        {mode === 'voice' ? (
          <VoiceRecorder onResult={handleParse} disabled={loading} />
        ) : (
          <div className="flex gap-2">
            <input
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleParse(textInput)}
              placeholder="例：午饭 35 元"
              className="flex-1 bg-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleParse(textInput)}
              disabled={loading || !textInput.trim()}
              className="bg-emerald-500 text-white px-4 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {loading ? '...' : '记'}
            </button>
          </div>
        )}
      </div>

      {/* Bill List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <h2 className="text-sm font-medium text-slate-400 mb-2">账单记录</h2>
        {bills.length === 0 ? (
          <p className="text-center text-slate-600 text-sm mt-8">还没有记录，试试说"午饭 35 元"</p>
        ) : (
          <div className="flex flex-col gap-2">
            {bills.map(bill => (
              <BillCard key={bill.id} bill={bill} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-700 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
