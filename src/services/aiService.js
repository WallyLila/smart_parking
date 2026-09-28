/**
 * AI Assistant Service for Smart Parking IoT
 * Exclusively 100% Local:
 * 1. Ollama Local LLM (Running directly on your machine e.g. deepseek-r1:1.5b, qwen2.5:3b)
 * 2. In-Browser Intelligent Rule-based NLP Engine (Instant, Offline, 0 dependencies)
 * NO external cloud API keys required!
 */

export const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
export const DEFAULT_OLLAMA_MODEL = 'qwen2.5:3b';

/**
 * Sanitize host URL:
 * - Auto-prepends https:// (or http:// for localhost) if omitted
 * - Strips :11434 if accidentally appended to trycloudflare domain
 * - Strips trailing slashes
 */
export const sanitizeHost = (host) => {
  if (!host) return DEFAULT_OLLAMA_HOST;
  // Remove all whitespace characters (spaces, line breaks, tabs) from any part of URL
  let clean = host.replace(/\s+/g, '');

  // Strip :11434 if accidentally pasted on cloudflare tunnel URL
  if (clean.includes('trycloudflare.com:11434')) {
    clean = clean.replace(':11434', '');
  }

  // Auto-prepend protocol if missing
  if (!/^https?:\/\//i.test(clean)) {
    if (clean.includes('localhost') || clean.startsWith('127.0.0.1')) {
      clean = `http://${clean}`;
    } else {
      clean = `https://${clean}`;
    }
  }

  return clean.replace(/\/+$/, '');
};

export const getOllamaHost = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ollama_host');
    if (saved) return sanitizeHost(saved);
  }
  return DEFAULT_OLLAMA_HOST;
};

export const setOllamaHost = (host) => {
  if (typeof window !== 'undefined') {
    const cleaned = sanitizeHost(host);
    localStorage.setItem('ollama_host', cleaned);
  }
};

export const getOllamaModel = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ollama_model') || DEFAULT_OLLAMA_MODEL;
  }
  return DEFAULT_OLLAMA_MODEL;
};

export const setOllamaModel = (model) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ollama_model', model.trim() || DEFAULT_OLLAMA_MODEL);
  }
};

/**
 * Test connection to local Ollama instance and list installed models
 */
export const checkOllamaConnection = async (host = getOllamaHost()) => {
  const cleanHost = sanitizeHost(host);
  const isRemote = !cleanHost.includes('localhost') && !cleanHost.includes('127.0.0.1');
  const endpoints = isRemote
    ? [`${cleanHost}/api/tags`]
    : [`${cleanHost}/api/tags`, `/ollama/api/tags`];

  let lastErrorDetail = '';

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const models = (data.models || []).map((m) => m.name);
        return {
          success: true,
          models: models.length > 0 ? models : [getOllamaModel()],
          activeHost: url.startsWith('/ollama') ? '/ollama' : cleanHost,
        };
      } else {
        lastErrorDetail = `HTTP ${res.status} (${res.statusText || 'Error'})`;
      }
    } catch (e) {
      lastErrorDetail = e.message || 'Network connection failed';
    }
  }

  return {
    success: false,
    error: `เชื่อมต่อไม่สำเร็จ: ${lastErrorDetail} ที่ [${cleanHost}/api/tags]`,
    models: [],
  };
};

/**
 * Build rich system prompt context for Ollama
 */
const buildSystemPrompt = (systemContext) => {
  const { slots = [], activities = [] } = systemContext;

  const currentSlotsSummary = (slots || []).map((s) => ({
    slot_id: s.id,
    name: s.name,
    status: s.status, // 'available' or 'occupied'
    distance_cm: s.distance,
    light_on: s.light,
    sensor_status: s.sensor || 'online',
  }));

  const recentActivitiesSummary = (activities || []).slice(0, 8).map((a) => ({
    event: a.text,
    time: a.time,
    status: a.status,
  }));

  return `คุณคือ "Smart Parking AI Assistant" ผู้ช่วยอัจฉริยะลานจอดรถ IoT รันบนเครื่องคอมพิวเตอร์ผ่าน Ollama ควบคุมฮาร์ดแวร์ ESP32 และฐานข้อมูล Supabase

ข้อมูลสถานะช่องจอดในปัจจุบัน:
${JSON.stringify(currentSlotsSummary, null, 2)}

ประวัติกิจกรรมรถเข้า-ออกล่าสุด:
${JSON.stringify(recentActivitiesSummary, null, 2)}

คำสั่งสำคัญสำหรับการควบคุมฮาร์ดแวร์:
1. หากผู้ใช้สั่งเปิด/ปิดไฟ ให้ตอบรับสุภาพภาษาไทย และแทรกแท็กคำสั่งในข้อความดังนี้:
   - เปิดไฟช่อง 1: [ACTION:LIGHT:1:ON]
   - ปิดไฟช่อง 1: [ACTION:LIGHT:1:OFF]
   - เปิดไฟช่อง 2: [ACTION:LIGHT:2:ON]
   - ปิดไฟช่อง 2: [ACTION:LIGHT:2:OFF]
   - เปิดไฟทุกช่อง: [ACTION:LIGHT:ALL:ON]
   - ปิดไฟทุกช่อง: [ACTION:LIGHT:ALL:OFF]
2. หากผู้ใช้สั่งเปิด/ปิดเซนเซอร์ Ultrasonic ให้แทรกแท็กคำสั่ง:
   - ปิดเซนเซอร์ช่อง 1: [ACTION:SENSOR:1:DISABLED]
   - เปิดเซนเซอร์ช่อง 1: [ACTION:SENSOR:1:ONLINE]
   - ปิดเซนเซอร์ทุกช่อง: [ACTION:SENSOR:ALL:DISABLED]
   - เปิดเซนเซอร์ทุกช่อง: [ACTION:SENSOR:ALL:ONLINE]
3. หากผู้ใช้ถามสถานะ ความว่าง ระยะ หรือสถิติ ให้ตอบภาษาไทยกระชับ อบอุ่น ถูกต้องตามข้อมูลจริงด้านบน
4. ตอบเฉพาะภาษาไทยเท่านั้น`;
};

/**
 * Call local Ollama chat API
 */
async function callOllama(prompt, systemContext, executeAction) {
  const host = getOllamaHost().trim().replace(/\/+$/, '');
  const model = getOllamaModel();
  const systemInstruction = buildSystemPrompt(systemContext);

  const requestBody = {
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt },
    ],
    stream: false,
    options: {
      temperature: 0.3,
    },
  };

  const isRemote = !host.includes('localhost') && !host.includes('127.0.0.1');
  const endpoints = isRemote
    ? [`${host}/api/chat`, `${host}/v1/chat/completions`]
    : [
        `${host}/api/chat`,
        `/ollama/api/chat`,
        `${host}/v1/chat/completions`,
        `/ollama/v1/chat/completions`,
      ];

  let res = null;
  let rawData = null;
  let lastErr = '';

  for (const url of endpoints) {
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        rawData = await res.json();
        break;
      } else {
        const errObj = await res.json().catch(() => ({}));
        lastErr = errObj?.error || `HTTP ${res.status}`;
      }
    } catch (e) {
      lastErr = e.message;
    }
  }

  if (!rawData) {
    throw new Error(lastErr || 'ไม่สามารถติดต่อ Ollama ในเครื่องได้');
  }

  // Support both /api/chat (message.content) and /v1/chat/completions (choices[0].message.content)
  let textResponse =
    rawData.message?.content ||
    rawData.choices?.[0]?.message?.content ||
    '';

  // Filter out thinking tags from reasoning models (like deepseek-r1 <think>...</think>)
  textResponse = textResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const actionsTaken = [];

  // Parse Action tags for lights: e.g. [ACTION:LIGHT:1:ON]
  const lightMatches = textResponse.matchAll(/\[ACTION:LIGHT:(all|\d+):(ON|OFF)\]/gi);
  for (const m of lightMatches) {
    const slotId = m[1].toLowerCase() === 'all' ? 'all' : Number(m[1]);
    const state = m[2].toUpperCase() === 'ON';
    await executeAction({ type: 'light', slotId, value: state });
    actionsTaken.push({
      type: 'light',
      target: slotId,
      status: state ? 'on' : 'off',
      label: `Light ${slotId === 'all' ? 'All' : `0${slotId}`}: ${state ? 'ON' : 'OFF'}`,
    });
  }

  // Parse Action tags for sensors: e.g. [ACTION:SENSOR:1:DISABLED]
  const sensorMatches = textResponse.matchAll(/\[ACTION:SENSOR:(all|\d+):(ONLINE|DISABLED)\]/gi);
  for (const m of sensorMatches) {
    const slotId = m[1].toLowerCase() === 'all' ? 'all' : Number(m[1]);
    const status = m[2].toLowerCase() === 'online' ? 'online' : 'disabled';
    await executeAction({ type: 'sensor', slotId, value: status });
    actionsTaken.push({
      type: 'sensor',
      target: slotId,
      status,
      label: `Ultrasonic ${slotId === 'all' ? 'All' : `0${slotId}`}: ${status.toUpperCase()}`,
    });
  }

  // Clean action tags from user-facing response
  textResponse = textResponse.replace(/\[ACTION:[^\]]+\]/g, '').trim();

  if (actionsTaken.length > 0 && !textResponse) {
    textResponse = 'ดำเนินการตามคำสั่งของคุณเรียบร้อยแล้วครับ ระบบได้ส่งสัญญาณอัปเดตไปยัง ESP32 ฮาร์ดแวร์แล้ว';
  }

  return {
    text: textResponse || 'รับทราบคำสั่งเรียบร้อยครับ',
    actions: actionsTaken,
  };
}

/**
 * Supercharged Local Intelligent Rule-based NLP Engine
 * Accurately parses Thai and English instructions locally without requiring any external tools
 */
export const processWithLocalNlp = async (prompt, systemContext, executeAction) => {
  const p = prompt.toLowerCase().trim();
  const { slots = [], activities = [] } = systemContext;

  // 1. LIGHT CONTROL INTENTS
  const isLightCommand =
    p.includes('ไฟ') ||
    p.includes('light') ||
    p.includes('หลอดไฟ') ||
    p.includes('led') ||
    p.includes('ส่องสว่าง');

  const isTurnOn =
    p.includes('เปิด') ||
    p.includes('on') ||
    p.includes('start') ||
    p.includes('enable') ||
    p.includes('turn on');

  const isTurnOff =
    p.includes('ปิด') ||
    p.includes('off') ||
    p.includes('stop') ||
    p.includes('disable') ||
    p.includes('turn off');

  const mentionsSlot1 =
    p.includes('1') ||
    p.includes('หนึ่ง') ||
    p.includes('one') ||
    p.includes('slot 1') ||
    p.includes('ช่อง 1');

  const mentionsSlot2 =
    p.includes('2') ||
    p.includes('สอง') ||
    p.includes('two') ||
    p.includes('slot 2') ||
    p.includes('ช่อง 2');

  const mentionsAll =
    p.includes('ทุก') ||
    p.includes('ทั้งหมด') ||
    p.includes('all') ||
    p.includes('ทั้งสอง');

  // 2. ULTRASONIC SENSOR CONTROL INTENTS
  const isUltrasonicCommand =
    p.includes('ultrasonic') ||
    p.includes('อัลตร้า') ||
    p.includes('อัลตรา') ||
    p.includes('เซนเซอร์') ||
    p.includes('sensor') ||
    p.includes('ตรวจจับ');

  if (isUltrasonicCommand && (isTurnOn || isTurnOff)) {
    const enabled = isTurnOn && !isTurnOff;
    const targetSlot = mentionsAll
      ? 'all'
      : mentionsSlot2
      ? 2
      : mentionsSlot1
      ? 1
      : 'all';

    await executeAction({
      type: 'sensor',
      slotId: targetSlot,
      value: enabled ? 'online' : 'disabled',
    });

    const statusWord = enabled ? '🟢 เปิดการทำงาน' : '🔴 ปิดการทำงาน';
    const targetWord =
      targetSlot === 'all'
        ? 'เซนเซอร์ Ultrasonic ทุกช่อง'
        : `เซนเซอร์ Ultrasonic ของช่อง ${targetSlot}`;

    return {
      text: `${statusWord} **${targetWord}** เรียบร้อยแล้วครับ ระบบได้ส่งสัญญาณอัปเดตไปยังฮาร์ดแวร์ ESP32 ทันที`,
      actions: [
        {
          type: 'sensor',
          target: targetSlot,
          status: enabled ? 'online' : 'disabled',
          label: `Ultrasonic ${targetSlot === 'all' ? 'All' : `0${targetSlot}`}: ${
            enabled ? 'ONLINE' : 'DISABLED'
          }`,
        },
      ],
    };
  }

  // Handle Light Control
  if (isLightCommand && (isTurnOn || isTurnOff)) {
    const lightState = isTurnOn && !isTurnOff;
    const targetSlot = mentionsAll
      ? 'all'
      : mentionsSlot2
      ? 2
      : mentionsSlot1
      ? 1
      : 'all';

    await executeAction({
      type: 'light',
      slotId: targetSlot,
      value: lightState,
    });

    const statusWord = lightState ? '💡 เปิดไฟ' : '🌑 ปิดไฟ';
    const targetWord =
      targetSlot === 'all'
        ? 'ทุกช่องจอด (Slot 1 & Slot 2)'
        : `ช่องจอดที่ ${targetSlot}`;

    return {
      text: `${statusWord} **${targetWord}** สำเร็จแล้วครับ สัญญาณควบคุมได้ซิงค์ไปยัง ESP32 เรียบร้อยแล้ว`,
      actions: [
        {
          type: 'light',
          target: targetSlot,
          status: lightState ? 'on' : 'off',
          label: `Light ${targetSlot === 'all' ? 'All' : `0${targetSlot}`}: ${
            lightState ? 'ON' : 'OFF'
          }`,
        },
      ],
    };
  }

  // 3. PARKING STATUS & VACANCY QUERIES
  const isStatusQuery =
    p.includes('ว่าง') ||
    p.includes('จอด') ||
    p.includes('สถานะ') ||
    p.includes('status') ||
    p.includes('available') ||
    p.includes('เต็ม') ||
    p.includes('ระยะ') ||
    p.includes('กี่เซน') ||
    p.includes('distance');

  if (isStatusQuery) {
    const availableSlots = (slots || []).filter((s) => s.status === 'available');
    const occupiedSlots = (slots || []).filter((s) => s.status === 'occupied');

    let reply = `📊 **รายงานสถานะช่องจอดในขณะนี้:**\n\n`;
    if (availableSlots.length > 0) {
      const names = availableSlots.map((s) => `**${s.name}** (ระยะ ${s.distance} cm)`).join(', ');
      reply += `✅ มีช่องจอดว่าง **${availableSlots.length} ช่อง**: ${names}\n`;
    } else {
      reply += `❌ ขณะนี้ไม่มีช่องจอดว่าง (เต็มทุกช่อง)\n`;
    }

    if (occupiedSlots.length > 0) {
      const occNames = occupiedSlots.map((s) => `**${s.name}** (ระยะ ${s.distance} cm)`).join(', ');
      reply += `🚗 มีรถจอดอยู่: ${occNames}\n`;
    }

    reply += `\n💡 ไฟส่องสว่าง: Slot 1 (${slots?.[0]?.light ? 'เปิด' : 'ปิด'}), Slot 2 (${slots?.[1]?.light ? 'เปิด' : 'ปิด'})\n`;
    reply += `📡 เซนเซอร์: Slot 1 (${slots?.[0]?.sensor || 'online'}), Slot 2 (${slots?.[1]?.sensor || 'online'})`;

    return { text: reply };
  }

  // 4. ACTIVITY & HISTORY QUERIES
  const isActivityQuery =
    p.includes('ประวัติ') ||
    p.includes('เข้าออก') ||
    p.includes('กี่คัน') ||
    p.includes('มีรถเข้า') ||
    p.includes('ใครมา') ||
    p.includes('เมื่อกี้') ||
    p.includes('สถิติ');

  if (isActivityQuery) {
    if (!activities || activities.length === 0) {
      return {
        text: `📋 **ประวัติการใช้งาน:**\nขณะนี้ยังไม่มีบันทึกกิจกรรมการเข้า-ออกของรถในระบบครับ`,
      };
    }
    const recent = activities.slice(0, 5);
    const list = recent
      .map(
        (a, i) =>
          `${i + 1}. 🚗 **${a.text}** (${a.time || 'ล่าสุด'}) [${
            a.status === 'occupied' ? 'เข้าจอด' : 'ออกจากช่อง'
          }]`
      )
      .join('\n');

    return {
      text: `📋 **บันทึกกิจกรรมการจอดล่าสุด (${recent.length} รายการ):**\n\n${list}\n\nคุณสามารถดูรายงานกราฟและดาวน์โหลดไฟล์สรุปทั้งหมดได้ที่เมนู **Usage** ด้านล่างครับ`,
    };
  }

  // 5. GREETING & HELP
  const isGreeting =
    p.includes('หวัดดี') ||
    p.includes('สวัสดี') ||
    p.includes('hello') ||
    p.includes('hi') ||
    p.includes('ทำอะไรได้') ||
    p.includes('ช่วยอะไร') ||
    p.includes('help') ||
    p.includes('ขอบคุณ') ||
    p.includes('แต๊งกิ้ว');

  if (isGreeting) {
    return {
      text: `👋 สวัสดีครับ! ผมคือ **Smart Parking AI Assistant** ผู้ช่วยสั่งการฮาร์ดแวร์ในเครื่องของคุณ\n\nสิ่งที่ผมสามารถสั่งการได้ทันที (ทำงานในเครื่อง 100% ไม่ต้องต่อเน็ต):\n• 💡 **ควบคุมไฟ:** *"เปิดไฟช่อง 1"*, *"ปิดไฟทุกช่อง"*\n• 📡 **ควบคุมเซนเซอร์:** *"ปิด Ultrasonic ช่อง 1"*, *"เปิดเซนเซอร์ทั้งหมด"*\n• 🚗 **ตรวจสอบระบบ:** *"มีที่จอดว่างไหม"*, *"ระยะเซนเซอร์ตอนนี้เท่าไหร่"*\n• 📋 **ประวัติการใช้งาน:** *"มีรถเข้ากี่คัน"*, *"ประวัติล่าสุด"*\n\nสามารถพิมพ์สั่งงานหรือกดปุ่มไมค์เพื่อสั่งด้วยเสียงได้เลยครับ!`,
    };
  }

  // 6. DEFAULT FALLBACK
  return {
    text: `ขออภัยครับ ผมยังไม่เข้าใจคำสั่ง "${prompt}" 🤔\n\nคุณสามารถสั่งงานฮาร์ดแวร์ได้ง่ายๆ ดังนี้ครับ:\n- *"เปิดไฟช่อง 1"* หรือ *"ปิดไฟทุกช่อง"*\n- *"ปิด Ultrasonic ช่อง 1"*\n- *"ตอนนี้มีช่องว่างไหม"*\n- *"มีรถเข้ากี่คัน"*`,
  };
};

/**
 * Main AI Message Processing
 * 1. Attempts to run on local Ollama LLM
 * 2. If Ollama is offline or uninstalled, falls back smoothly to in-browser Local Engine
 */
export const processAiMessage = async (
  prompt,
  systemContext,
  executeAction
) => {
  try {
    const response = await callOllama(prompt, systemContext, executeAction);
    if (response) return response;
  } catch (err) {
    console.info('[AI Assistant] Ollama not available, using in-browser local engine:', err.message);
  }

  // Smooth fallback to local NLP engine
  return await processWithLocalNlp(prompt, systemContext, executeAction);
};
