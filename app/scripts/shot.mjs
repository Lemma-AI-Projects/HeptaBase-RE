/**
 * 截图脚本：1440×900 视口，1x DPR，页面加载后等 900ms 再拍。
 * 用法：node scripts/shot.mjs <url> <out.png> [width] [height]
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9333
const [, , url, out, w = '1440', h = '900', dsf = '1'] = process.argv
if (!url || !out) {
  console.error('usage: node scripts/shot.mjs <url> <out.png> [w] [h]')
  process.exit(1)
}

const profile = resolve('.chrome-shot/cdp')
mkdirSync(profile, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-breakpad',
    '--hide-scrollbars',
    '--no-first-run',
    '--allow-file-access-from-files',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getWsUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      const json = await res.json()
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl
    } catch {
      /* not up yet */
    }
    await sleep(200)
  }
  throw new Error('chrome did not start')
}

const ws = new WebSocket(await getWsUrl())
await new Promise((r) => (ws.onopen = r))

let seq = 0
const pending = new Map()
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
  }
}

const send = (method, params = {}, sessionId) =>
  new Promise((resolve_, reject) => {
    const id = ++seq
    pending.set(id, { resolve: resolve_, reject })
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
  })

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })

await send('Page.enable', {}, sessionId)
await send('Emulation.setDeviceMetricsOverride', {
  width: Number(w),
  height: Number(h),
  deviceScaleFactor: Number(dsf),
  mobile: false,
}, sessionId)
await send('Page.navigate', { url }, sessionId)
await sleep(1400)

const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
mkdirSync(dirname(resolve(out)), { recursive: true })
writeFileSync(resolve(out), Buffer.from(data, 'base64'))
console.log(`saved ${out}`)

ws.close()
chrome.kill()
process.exit(0)
