/**
 * Author a realistic session on disk.
 *
 * The transcript, the Trajectory table and the right-hand file panel cannot be
 * audited against an empty app, and the product offers no headless way to
 * author one: "Add workspace" opens a **native OS directory picker**, which a
 * headless browser cannot answer. So this script writes the two durable
 * artifacts the product itself writes, in the product's own format:
 *
 *   ~/.dsh/storages/workspace.json                        the workspace registry
 *   ~/.dsh/sessions/--<cwd>--/<id>/session.v3.jsonl.zstd  the session log
 *
 * The log is read back through the product's *own* format restorer before this
 * script reports success, so a mistake surfaces here as a refusal rather than
 * later as a silently wrong UI.
 *
 * ## Physical encoding
 *
 * The backend's default compression is `zstd`, and a root belongs to exactly
 * one encoding — it refuses to start at all if it finds a `.jsonl` generation
 * under a `zstd`-configured root, and vice versa. So the log is not plain text:
 * it is a *concatenation of independent checksummed Zstandard frames*, one
 * frame holding the newline-terminated header line and one frame per durable
 * append batch. Both facts are load-bearing and neither is guessable:
 *
 *   - `assertZstdHeaderFrame` requires the first frame's plaintext to be
 *     `...\n` with the LF as its **last** byte — exactly one header line.
 *   - `scanZstdFrames` walks the container from byte `0` and throws on the
 *     first non-magic word, so nothing may precede the first frame.
 *   - the frame descriptor must set the checksum bit, because
 *     `decompressZstdFrame` validates it and a frame without one is only
 *     readable through the separate incomplete-frame path.
 *
 * Events are then split across frames to mimic real write batching: an append
 * is durable only when its frame is complete, so a torn tail costs at most one
 * batch. Node's `zstdCompressSync` / `createZstdCompress` with
 * `ZSTD_c_checksumFlag` produces byte-identical options to the backend's own
 * `compressZstdFrame`.
 *
 * ## The rules the format actually enforces
 *
 * Discovered by being refused five times, and worth writing down because none
 * of them are guessable:
 *
 *   1. `seq` is **dense and zero-based** — the validator compares it to the
 *      event's array index, so the first event is 0.
 *   2. Surface events (`user/message`, `assistant/message`, `tool/result`,
 *      `system/message`) require an explicit `surfaceOp`; `'append'` for a
 *      message that extends the transcript.
 *   3. `turn/start` opens turn *n*, then `step/start` opens step 1, **and only
 *      then** may `request/header` appear — it must be inside an open turn.
 *      Its `data.reason` must be one of `initial` / `resume` / `change` /
 *      `series`; anything else (including omitting it) makes the whole session
 *      unloadable, and the app reports it as *"has an invalid reason"* at the
 *      event's index.
 *   4. A tool call is a *pair*: an `assistant/message` advertising a
 *      `tool-call` block **must** be followed by a matching `tool/call` event
 *      with byte-identical `arguments`, before the `tool/result`.
 *   5. `session/title` cites earlier **human** `user/message` events by index,
 *      and its `source` is an object: `{kind:'user'}` (empty messageSeqs) or
 *      `{kind:'fallback'}` (citing them).
 *   6. Retired event types are rejected outright — `assistant/chunk` and a
 *      `header.system` field are both gone.
 *   7. The header carries `type: 'session'`. Its absence is **silent**: the
 *      file is not recognised as a generation, so the session never appears in
 *      `session/list`, the sidebar simply stays empty, and no error is printed
 *      anywhere. This cost more debugging time than every other rule combined.
 *   8. Every frame must carry a checksum, and the header frame's plaintext must
 *      be exactly one line ending in LF.
 *
 * Nothing here is part of the skin.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'

const HOME = process.env.DSH_HOME ?? path.join(os.homedir(), '.dsh')
const CWD = process.argv[2] ?? '/home/hhg/AviumUI'
const SESSION_ID = 'ses_frutiger_mobile_audit'
const WORKSPACE_ID = 'ws_frutiger_mobile_audit'
const TITLE = 'Frutiger Aero on a phone — mobile audit'

/** Encode a session id the way the backend escapes it: one safe path segment. */
const encodeId = (id) => id.replace(/[^A-Za-z0-9_.-]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)

const ZSTD_MAGIC = 4247762216

/**
 * Walk a concatenated Zstandard container exactly the way the backend's
 * `scanZstdFrames` does — without decompressing — so a structurally wrong frame
 * is caught here rather than reported later as a corrupt session log.
 * @param {Buffer} buffer - complete artifact bytes.
 * @returns {number[]} the exclusive end offset of every complete frame.
 * @throws {Error} when the structure is not a valid frame concatenation.
 */
function scanFrameEnds(buffer) {
  const ends = []
  let offset = 0
  while (offset < buffer.length) {
    const start = offset
    if (buffer.length - offset < 4 || buffer.readUInt32LE(offset) !== ZSTD_MAGIC) {
      throw new Error(`invalid frame magic at byte ${offset}`)
    }
    offset += 4
    const descriptor = buffer.readUInt8(offset)
    offset += 1
    if ((descriptor & 24) !== 0) throw new Error(`reserved frame-header bit at byte ${offset - 1}`)
    const contentSizeFlag = descriptor >>> 6
    const singleSegment = (descriptor & 32) !== 0
    const checksum = (descriptor & 4) !== 0
    const dictionaryFlag = descriptor & 3
    const dictionaryBytes = dictionaryFlag === 3 ? 4 : dictionaryFlag
    const contentSizeBytes = contentSizeFlag === 0 ? (singleSegment ? 1 : 0) : 1 << contentSizeFlag
    offset += (singleSegment ? 0 : 1) + dictionaryBytes + contentSizeBytes
    for (;;) {
      if (buffer.length - offset < 3) throw new Error(`truncated block header at byte ${offset}`)
      const blockHeader = buffer.readUIntLE(offset, 3)
      offset += 3
      const lastBlock = (blockHeader & 1) !== 0
      const blockType = (blockHeader >>> 1) & 3
      const blockSize = blockHeader >>> 3
      if (blockType === 3) throw new Error(`reserved block type at byte ${offset - 3}`)
      offset += blockType === 1 ? 1 : blockSize
      if (offset > buffer.length) throw new Error(`truncated block payload at byte ${offset}`)
      if (lastBlock) break
    }
    // Every frame this script writes carries a checksum, including the header
    // frame the reader validates through the checksummed decode path.
    if (!checksum) throw new Error(`frame at byte ${String(start)} does not carry a checksum`)
    offset += 4
    ends.push(offset)
  }
  return ends
}

/**
 * The exclusive end offset of the frame beginning at `start`.
 * @param {Buffer} buffer - the full artifact.
 * @param {number} start - frame start offset.
 * @returns {number} exclusive frame end.
 */
function nextFrameEnd(buffer, start) {
  return scanFrameEnds(buffer.subarray(start))[0] + start
}

/** `--<normalized-cwd>--`, with separators collapsed the way the backend does. */
const projectDir = (cwd) => `--${cwd.replace(/^\/+|\/+$/g, '').replace(/\//g, '-')}--`

const now = Date.now()
const events = []

/** The four event types the current format treats as conversation surface. */
const SURFACE = new Set(['system/message', 'user/message', 'assistant/message', 'tool/result'])

/** Append one event; `seq` is assigned from the current length, so it is dense. */
function push(type, data) {
  const index = events.length
  const surface = SURFACE.has(type) ? { surfaceOp: 'append' } : {}
  events.push({ type, seq: index, time: now - (400 - index) * 1000, data, ...surface })
  return index
}

const text = (value) => [{ type: 'text', text: value }]
/** A message envelope. `source` is validated by the product, so it must be exact. */
const message = (id, role, content, source) => ({ id, role, content, source })
const model = { kind: 'model', provider: 'deepseek', model: 'deepseek-chat' }

/**
 * The compact provider stream a settled Assistant message embeds.
 *
 * An `assistant/message` is not just its rendered content — it carries the
 * **exact provider stream** it settled from, and the loader refuses a message
 * without one ("has invalid settlement fields"). A stream is a list of records
 * in one of two shapes:
 *
 *   `{ type: 'chunk', time, chunk: { type: 'text' | 'reasoning' | 'usage' |
 *      'finish' | 'block-start' | 'block-end', ... } }`
 *   `{ type: 'tool-call-chunks', time0, index, dt, id, name, args, lastTime }`
 *
 * Reasoning and text deltas are accumulated into `texts` with a `dt` gap list,
 * mirroring the `AssistantStreamAccumulator` the product uses. `usage` and
 * `finish` are ordinary chunks; a reader scans backwards for the **last** one,
 * which is why they go at the end.
 *
 * @param parts - `{reasoning}`, `{text}`, and `{toolCall}` entries, in order.
 * @param usage - the token counts the message reports.
 * @returns the compact stream records.
 */
function stream(parts, usage) {
  const records = []
  let time = 0
  const step = () => (time += 40)
  for (const part of parts) {
    if (part.reasoning !== undefined) {
      records.push({
        type: 'reasoning-chunks',
        time0: step(),
        dt: [],
        texts: [part.reasoning],
        lastTime: time,
      })
    }
    if (part.text !== undefined) {
      records.push({ type: 'text-chunks', time0: step(), dt: [], texts: [part.text], lastTime: time })
    }
    if (part.toolCall !== undefined) {
      records.push({
        type: 'tool-call-chunks',
        time0: step(),
        index: part.toolCall.index ?? 0,
        dt: [],
        id: part.toolCall.id,
        name: part.toolCall.name,
        args: [part.toolCall.arguments],
        lastTime: time,
      })
    }
  }
  records.push({ type: 'chunk', time: step(), chunk: { type: 'usage', usage } })
  records.push({ type: 'chunk', time: step(), chunk: { type: 'finish', reason: 'stop' } })
  return records
}

// ── turn 1: a plain exchange, with a thinking block ───────────────────────
push('model/selection', { provider: 'deepseek', model: 'deepseek-chat' })
push('turn/start', { turn: 1 })
push('step/start', { turn: 1, step: 1 })
push('request/header', {
  reason: 'initial',
  header: { model: 'deepseek-chat', config: { provider: 'deepseek', model: 'deepseek-chat' } },
})
const firstUser = push('user/message', {
  role: 'user',
  id: 'msg_u1',
  content: text('移动端 390px 下侧边栏把会话挤成 108px 宽，怎么改？'),
  source: { kind: 'user' },
})
const REASONING_1 =
  'The sidebar is a grid column, so the transcript is measured against whatever is left over.\n\nAt 390px the stock frame still reserves the 56px rail as a grid track, and the conversation declares a `clamp(680px, …)` reading measure whose *floor* is wider than the viewport — so rows are laid out at 680px inside roughly 330px and clipped to slivers.'
const ANSWER_1 =
  '两个独立的问题叠在一起：\n\n1. **栅格还在给侧栏分列。** 窄屏下它仍然占一格，会话拿到的是 `390 - 56 = 334px`。\n2. **阅读宽度有下限。** 会话声明的是 `--dsh-chat-content-width: clamp(680px, …)`，`680px` 是**地板**而不是上限，所以在 334px 的盒子里按 680px 排版，超出部分被裁掉。\n\n改法是把栅格塌成单列、侧栏改为覆盖式抽屉，再把阅读宽度重写成 `min(100%, 680px)`。'
push('assistant/message', {
  turn: 1,
  step: 1,
  message: message(
    'msg_a1',
    'assistant',
    [
      { type: 'reasoning', text: REASONING_1 },
      { type: 'text', text: ANSWER_1 },
    ],
    model,
  ),
  stream: stream([{ reasoning: REASONING_1 }, { text: ANSWER_1 }], { inputTokens: 812, outputTokens: 226 }),
  usage: { inputTokens: 812, outputTokens: 226 },
})
push('step/end', { turn: 1, step: 1 })
push('turn/end', { turn: 1, reason: 'completed' })

// ── turn 2: a tool call, so the Trajectory table has rows ─────────────────
const AUDIT_ARGS = JSON.stringify({
  command: 'node .devtools/hitaudit.mjs "$URL" /tmp/fa-hit 390 844',
  description: 'Audit reachable touch targets at phone width',
})
push('turn/start', { turn: 2 })
push('step/start', { turn: 2, step: 1 })
const secondUser = push('user/message', {
  role: 'user',
  id: 'msg_u2',
  content: text('跑一下 390x844 的布局审计，把不足 44px 的触摸目标列出来。'),
  source: { kind: 'user' },
})
const PREAMBLE_2 = '先量一遍真实命中面积。'
push('assistant/message', {
  turn: 2,
  step: 1,
  message: message(
    'msg_a2',
    'assistant',
    [
      { type: 'text', text: PREAMBLE_2 },
      { type: 'tool-call', id: 'call_audit_1', name: 'bash', arguments: AUDIT_ARGS },
    ],
    model,
  ),
  stream: stream(
    [{ text: PREAMBLE_2 }, { toolCall: { index: 0, id: 'call_audit_1', name: 'bash', arguments: AUDIT_ARGS } }],
    { inputTokens: 1044, outputTokens: 118 },
  ),
  usage: { inputTokens: 1044, outputTokens: 118 },
})
push('tool/call', { turn: 2, step: 1, callId: 'call_audit_1', name: 'bash', arguments: AUDIT_ARGS })
push('tool/result', {
  turn: 2,
  step: 1,
  message: message(
    'msg_t1',
    'user',
    [
      {
        type: 'tool-result',
        toolCallId: 'call_audit_1',
        content: text(
          'viewport=390x844 overflowX=0\ncontrols=10 small=0 occluded=0\nSend message reach=44x44 ok\nAdd attachment reach=44x44 ok',
        ),
      },
    ],
    { kind: 'tool', callId: 'call_audit_1' },
  ),
})
push('step/end', { turn: 2, step: 1 })
push('turn/end', { turn: 2, reason: 'completed' })

// ── turn 3: a deliberately long argument line ─────────────────────────────
// The Trajectory cell is `white-space: nowrap; overflow: hidden`, so a wide
// argument is what exercises the horizontal scroller the skin adds on a phone.
const PANEL_ARGS = JSON.stringify({
  command: "grep -rn 'data-sidebar-right-panel' packages/frutiger-aero/src/css/*.css | sed -n '1,40p'",
  description:
    'Find every right-panel rule and print its selector, plus the line it sits on, so the panel padding can be traced back to the breakpoint that introduced it',
})
push('turn/start', { turn: 3 })
push('step/start', { turn: 3, step: 1 })
push('user/message', {
  role: 'user',
  id: 'msg_u3',
  content: text('把 panel 的定位也确认一下。'),
  source: { kind: 'user' },
})
push('assistant/message', {
  turn: 3,
  step: 1,
  message: message(
    'msg_a3',
    'assistant',
    [{ type: 'tool-call', id: 'call_audit_2', name: 'bash', arguments: PANEL_ARGS }],
    model,
  ),
  stream: stream(
    [{ toolCall: { index: 0, id: 'call_audit_2', name: 'bash', arguments: PANEL_ARGS } }],
    { inputTokens: 1201, outputTokens: 96 },
  ),
  usage: { inputTokens: 1201, outputTokens: 96 },
})
push('tool/call', { turn: 3, step: 1, callId: 'call_audit_2', name: 'bash', arguments: PANEL_ARGS })
push('tool/result', {
  turn: 3,
  step: 1,
  message: message(
    'msg_t2',
    'user',
    [
      {
        type: 'tool-result',
        toolCallId: 'call_audit_2',
        content: text(
          'material.css:12:[data-sidebar-right-panel]\nmobile.css:189:[data-fa-col="rightbar"] [data-sidebar-right-panel]',
        ),
      },
    ],
    { kind: 'tool', callId: 'call_audit_2' },
  ),
})
push('assistant/message', {
  turn: 3,
  step: 1,
  message: message(
    'msg_a4',
    'assistant',
    text('面板只在 `≤640px` 会有底部内边距，桌面端不变。'),
    model,
  ),
  stream: stream([{ text: '面板只在 `≤640px` 会有底部内边距，桌面端不变。' }], {
    inputTokens: 1360,
    outputTokens: 42,
  }),
  usage: { inputTokens: 1360, outputTokens: 42 },
})
push('step/end', { turn: 3, step: 1 })
push('turn/end', { turn: 3, reason: 'completed' })
// `fallback` may cite the human messages it was derived from; `user` may not.
push('session/title', {
  title: TITLE,
  messageSeqs: [firstUser, secondUser],
  source: { kind: 'fallback' },
})

// ── write the log ─────────────────────────────────────────────────────────
const sessionDir = path.join(HOME, 'sessions', projectDir(CWD), encodeId(SESSION_ID))
fs.mkdirSync(sessionDir, { recursive: true })
/**
 * The **physical** header record, in the exact shape `toHeaderLine` produces.
 *
 * `type: 'session'` is the record tag every generation carries, and omitting it
 * is both silent and fatal: the backend does not recognise the file as a
 * generation at all, so the session is absent from `list()` — the sidebar
 * stays empty and no error is printed anywhere. This cost more debugging time
 * than every other rule in this file combined.
 *
 * The tag is a *physical* concern only. The format restorer below validates the
 * **logical** header, whose field whitelist is
 * `{version, id, createdAt, isSeeded, delegationDepth}` plus the optional
 * `{cwd, parentSession, origin, agentPreset}` — and it rejects an unexpected
 * `type`. So the two spellings are kept separate rather than shared.
 */
const header = {
  type: 'session',
  version: 3,
  id: SESSION_ID,
  createdAt: now - 3_600_000,
  cwd: CWD,
  isSeeded: false,
  delegationDepth: 0,
  agentPreset: 'standard',
}

/** The same header without the physical record tag, for the format restorer. */
const { type: _tag, ...logicalHeader } = header

/**
 * Compress one independently decodable, checksummed Zstandard frame — the
 * backend's `compressZstdFrame`, byte for byte: checksum on, default level.
 * @param {string} input - one newline-terminated header line or event batch.
 * @returns {Buffer} a complete frame.
 */
function frame(input) {
  return zlib.zstdCompressSync(Buffer.from(input, 'utf8'), {
    params: { [zlib.constants.ZSTD_c_checksumFlag]: 1 },
  })
}

/**
 * The container the backend expects: a header frame, then one frame per append
 * batch. Frame boundaries are the durability boundaries, so splitting on a few
 * events is not cosmetic — it is the shape a real session has.
 * @returns {Buffer} the concatenated frames.
 */
function encodeLog() {
  const lines = events.map((e) => `${JSON.stringify(e)}\n`)
  const batches = []
  for (let i = 0; i < lines.length; i += 6) batches.push(lines.slice(i, i + 6).join(''))
  return Buffer.concat([frame(`${JSON.stringify(header)}\n`), ...batches.map(frame)])
}

const logPath = path.join(sessionDir, 'session.v3.jsonl.zstd')
const encoded = encodeLog()
fs.writeFileSync(logPath, encoded)

// Prove the container before the app ever sees it: scan the frames the way
// `scanZstdFrames` does, then decode each one. A wrong descriptor bit or a
// stray prefix byte fails here instead of as a boot error.
const frameCount = scanFrameEnds(encoded).length

// ── write the workspace registry ──────────────────────────────────────────
const workspacesPath = path.join(HOME, 'storages', 'workspace.json')
let registry
try {
  registry = JSON.parse(fs.readFileSync(workspacesPath, 'utf8'))
} catch {
  registry = { unit: { name: 'workspace', version: 2 }, global: {}, tables: { workspaces: {} } }
}
registry.global = { ...(registry.global ?? {}), initialized: true }
registry.global.workspaceIds = [WORKSPACE_ID]
registry.global.archivedSessionIds = []
registry.tables = { workspaces: {} }
registry.tables.workspaces = {
  [WORKSPACE_ID]: {
    path: CWD,
    title: path.basename(CWD),
    sessionIds: [SESSION_ID],
    createdAt: new Date(now - 3_600_000).toISOString(),
    updatedAt: new Date(now).toISOString(),
  },
}
fs.mkdirSync(path.dirname(workspacesPath), { recursive: true })
fs.writeFileSync(workspacesPath, `${JSON.stringify(registry, null, 2)}\n`)

// ── prove the log restores, through the product's own restorer ────────────
let verdict = 'not checked'
try {
  const mod = await import(
    path.join(HOME, 'profiles', 'node_modules', '@deepseek-ai/dsh-session-format-v2-to-v3/lib/index.js')
  )
  const restored = mod.restoreReleasedV3Artifact({ header: logicalHeader, inheritedEventCount: 0, events }, undefined)
  const count = restored.events?.length ?? events.length
  verdict = `restored ${String(count)} events`
} catch (error) {
  verdict = `RESTORE FAILED: ${String(error.message).slice(0, 300)}`
  if (process.env.FA_VERBOSE === '1') {
    for (const e of events) console.log(String(e.seq).padStart(3), e.type)
  }
}

// The frame container must round-trip to exactly the lines that were written,
// or the app reads a session that is not the one this script authored. Each
// frame is decoded on its own — that is the property the reader relies on.
try {
  const lines = []
  const batches = []
  for (let i = 0; i < events.length; i += 6) batches.push(events.slice(i, i + 6))
  const frames = [header, ...batches]
  let offset = 0
  while (offset < encoded.length) {
    const end = nextFrameEnd(encoded, offset)
    const plain = zlib.zstdDecompressSync(encoded.subarray(offset, end))
    lines.push(...plain.toString('utf8').split('\n').filter(Boolean))
    offset = end
  }
  const expected = events.length + 1
  if (lines.length !== expected) {
    verdict += ` | FRAME MISMATCH: ${String(lines.length)} lines, expected ${String(expected)}`
  } else if (frames.length !== frameCount) {
    verdict += ` | FRAME COUNT drifted from what was encoded`
  } else if (!lines[0].includes(`"version":3`)) {
    verdict += ' | HEADER FRAME does not carry the version-3 header'
  } else if (!zlib.zstdDecompressSync(encoded.subarray(0, nextFrameEnd(encoded, 0))).at(-1) === 10) {
    verdict += ' | HEADER FRAME does not end on the line feed the reader requires'
  }
} catch (error) {
  verdict += ` | FRAME DECODE FAILED: ${String(error.message).slice(0, 200)}`
}

console.log(`session  ${logPath}`)
console.log(`bytes    ${String(encoded.length)} in ${String(frameCount)} zstd frames`)
console.log(`events   ${String(events.length)}`)
console.log(`registry ${workspacesPath}`)
console.log(`verdict  ${verdict}`)
