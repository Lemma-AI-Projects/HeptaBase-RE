/** 在页面里执行一段 JS 并打印结果（用于交互冒烟测试） */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9334
const [, , url, expression, mode] = process.argv
const profile = resolve('.chrome-shot/probe')
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--disable-breakpad','--hide-scrollbars','--no-first-run',`--remote-debugging-port=${PORT}`,`--user-data-dir=${profile}`,'--window-size=1440,900','about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let wsUrl = null
for (let i = 0; i < 50 && !wsUrl; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
    wsUrl = (await r.json()).webSocketDebuggerUrl
  } catch { await sleep(200) }
}
const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let seq = 0
const pending = new Map()
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    const { resolve: res, reject } = pending.get(m.id)
    pending.delete(m.id)
    m.error ? reject(new Error(JSON.stringify(m.error))) : res(m.result)
  }
}
const send = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const id = ++seq
    pending.set(id, { resolve: res, reject: rej })
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
  })

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId)
await send('Page.navigate', { url }, sessionId)
await sleep(1500)
if (mode === 'reload') {
  // 同一次进程内刷新，用来验证 localStorage 恢复（跨进程时 Chrome 被 kill 可能来不及落盘）
  await send('Page.reload', { ignoreCache: false }, sessionId)
  await sleep(1600)
}
const out = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId)
console.log(JSON.stringify(out.result?.value ?? out.result, null, 2))
ws.close()
chrome.kill()
process.exit(0)
