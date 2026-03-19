import crypto from 'crypto'

const ASR_URL = 'https://asr.tencentcloudapi.com'

function hmacSha256(data: string, key: string | Buffer): Buffer {
  return crypto.createHmac('sha256', key).update(data).digest()
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function getAuthorization(payload: string, timestamp: number): string {
  const secretId = process.env.TENCENT_SECRET_ID || ''
  const secretKey = process.env.TENCENT_SECRET_KEY || ''
  const service = 'asr'
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10)
  const host = 'asr.tencentcloudapi.com'

  const canonicalRequest = [
    'POST',
    '/',
    '',
    `content-type:application/json; charset=utf-8\nhost:${host}\nx-tc-action:sentencerecognition\n`,
    'content-type;host;x-tc-action',
    sha256Hex(payload),
  ].join('\n')

  const credentialScope = `${date}/${service}/tc3_request`
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${sha256Hex(canonicalRequest)}`

  const secretDate = hmacSha256(date, 'TC3' + secretKey)
  const secretService = hmacSha256(service, secretDate)
  const secretSigning = hmacSha256('tc3_request', secretService)
  const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex')

  return `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=content-type;host;x-tc-action, Signature=${signature}`
}

export async function recognizeAudio(audioBuffer: Buffer): Promise<string> {
  if (!process.env.TENCENT_SECRET_ID || !process.env.TENCENT_SECRET_KEY) {
    throw new Error('TENCENT_SECRET_ID / TENCENT_SECRET_KEY 未配置')
  }

  const timestamp = Math.floor(Date.now() / 1000)

  const payload = JSON.stringify({
    ProjectId: 0,
    SubServiceType: 2,
    EngSerViceType: '16k_zh',
    SourceType: 1,
    VoiceFormat: 'webm',
    Data: audioBuffer.toString('base64'),
    DataLen: audioBuffer.length,
  })

  const authorization = getAuthorization(payload, timestamp)

  const res = await fetch(ASR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Host: 'asr.tencentcloudapi.com',
      'X-TC-Action': 'SentenceRecognition',
      'X-TC-Version': '2019-06-14',
      'X-TC-Timestamp': String(timestamp),
      'X-TC-Region': 'ap-shanghai',
      Authorization: authorization,
    },
    body: payload,
  })

  const data = await res.json()

  if (data.Response?.Error) {
    throw new Error('ASR: ' + data.Response.Error.Message)
  }

  return data.Response?.Result || ''
}
