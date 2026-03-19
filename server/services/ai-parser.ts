const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 分类与前端 types/bill.ts 保持一致
const CATEGORIES = '餐饮|外卖|交通|购物|娱乐|住房|通讯|医疗|教育|日用|工资|转账|红包|理财|其他';

const SYSTEM_PROMPT = [
  '你是记账助手。用户说一句话，你只返回一个JSON对象，不要返回任何其他文字。',
  `格式：{"amount":数字,"category":"${CATEGORIES}","note":"简短备注","type":"expense"|"income","date":"TODAY"}`,
  '规则：金额为正数；没说日期就用TODAY；收入类用income，支出类用expense。',
].join('');

interface ParseResult {
  amount: number;
  category: string;
  note: string;
  type: 'expense' | 'income';
  date: string;
}

export async function parseExpenseText(text: string): Promise<ParseResult> {
  const today = new Date().toISOString().slice(0, 10);
  const apiKey = process.env.DOUBAO_API_KEY || '';
  const model = process.env.DOUBAO_MODEL || 'doubao-1-5-pro-32k-250115';

  if (!apiKey) throw new Error('DOUBAO_API_KEY 未配置');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT.replace(/TODAY/g, today) },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`AI API ${res.status}: ${body.slice(0, 100)}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content || '';

  const match = content.match(/\{[^}]+\}/);
  if (!match) {
    throw new Error('AI 未返回 JSON: ' + content.slice(0, 80));
  }

  const parsed = JSON.parse(match[0]);

  return {
    amount: Math.abs(Number(parsed.amount) || 0),
    category: parsed.category || '其他',
    note: parsed.note || text,
    type: parsed.type === 'income' ? 'income' : 'expense',
    date: parsed.date || today,
  };
}
