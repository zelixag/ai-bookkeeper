const CATEGORIES = '餐饮|外卖|交通|购物|娱乐|住房|通讯|医疗|教育|日用|工资|转账|红包|理财|其他'

const SYSTEM_PROMPT = [
  '你是记账助手。用户说一句话，你只返回一个JSON对象，不要返回任何其他文字。',
  `格式：{"amount":数字,"category":"${CATEGORIES}","note":"简短备注","type":"expense"|"income","date":"TODAY"}`,
  '规则：金额为正数；没说日期就用TODAY；收入类用income，支出类用expense。',
].join('')

export interface ParseResult {
  amount: number
  category: string
  note: string
  type: 'expense' | 'income'
  date: string
}

export async function parseText(text: string): Promise<ParseResult> {
  const today = new Date().toISOString().slice(0, 10)
  const apiUrl = process.env.AI_API_URL
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL

  if (!apiUrl || !apiKey || !model) {
    throw new Error('AI_API_URL / AI_API_KEY / AI_MODEL 未配置')
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT.replaceAll('TODAY', today) },
        { role: 'user', content: text },
      ],
      max_tokens: 200,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`AI API ${res.status}: ${body.slice(0, 80)}`)
  }

  const data = await res.json()
  const content: string = data.choices?.[0]?.message?.content || ''

  // 提取 JSON（可能被 markdown 代码块包裹）
  const cleaned = content.replace(/```json\s*|\s*```/g, '').trim()
  const match = cleaned.match(/\{[^}]+\}/)
  if (!match) throw new Error('AI 未返回 JSON: ' + content.slice(0, 80))

  const parsed = JSON.parse(match[0])

  return {
    amount: Math.abs(Number(parsed.amount) || 0),
    category: parsed.category || '其他',
    note: parsed.note || text,
    type: parsed.type === 'income' ? 'income' : 'expense',
    date: parsed.date || today,
  }
}
