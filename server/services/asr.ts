import crypto from 'crypto';

const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';
const APP_ID = Number(process.env.TENCENT_APP_ID) || 0;

// 腾讯云一句话识别 API
const ASR_URL = 'https://asr.tencentcloudapi.com';

function sha256(data: string | Buffer, key?: string): Buffer {
  if (key) return crypto.createHmac('sha256', key).update(data).digest();
  return crypto.createHash('sha256').update(data).digest();
}

function getSignature(params: {
  action: string;
  payload: string;
  timestamp: number;
  service: string;
}): string {
  const { action, payload, timestamp, service } = params;
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
  const host = 'asr.tencentcloudapi.com';

  // Step 1: CanonicalRequest
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\nx-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders = 'content-type;host;x-tc-action';
  const hashedPayload = sha256(payload).toString('hex');
  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`;

  // Step 2: StringToSign
  const algorithm = 'TC3-HMAC-SHA256';
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = sha256(canonicalRequest).toString('hex');
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // Step 3: Signature
  const secretDate = sha256(date, 'TC3' + SECRET_KEY);
  const secretService = sha256(service, secretDate as any);
  const secretSigning = sha256('tc3_request', secretService as any);
  const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');

  // Step 4: Authorization
  return `${algorithm} Credential=${SECRET_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

export async function recognizeAudio(audioBuffer: Buffer): Promise<string> {
  const base64Audio = audioBuffer.toString('base64');
  const timestamp = Math.floor(Date.now() / 1000);

  const payload = JSON.stringify({
    ProjectId: 0,
    SubServiceType: 2,
    EngSerViceType: '16k_zh',
    SourceType: 1,
    VoiceFormat: 'webm',
    Data: base64Audio,
    DataLen: audioBuffer.length,
  });

  const authorization = getSignature({
    action: 'SentenceRecognition',
    payload,
    timestamp,
    service: 'asr',
  });

  const res = await fetch(ASR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': 'asr.tencentcloudapi.com',
      'X-TC-Action': 'SentenceRecognition',
      'X-TC-Version': '2019-06-14',
      'X-TC-Timestamp': String(timestamp),
      'X-TC-Region': 'ap-shanghai',
      'Authorization': authorization,
    },
    body: payload,
  });

  const data = await res.json();

  if (data.Response?.Error) {
    console.error('[ASR] Error:', data.Response.Error);
    throw new Error('ASR 失败: ' + data.Response.Error.Message);
  }

  return data.Response?.Result || '';
}
