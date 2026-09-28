/**
 * AI Assistant Service for Smart Parking IoT
 * Supports:
 * 1. Google Gemini Flash Model (via REST API + Function Calling) when API key is provided
 * 2. Intelligent Thai & English Natural Language Rule Engine (Instant, Offline, Zero-delay fallback)
 */

export const getGeminiApiKey = () => {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('gemini_api_key') ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      ''
    );
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const setGeminiApiKey = (key) => {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }
};

/**
 * Gemini Tools / Function Declarations
 */
const geminiTools = [
  {
    function_declarations: [
      {
        name: 'control_parking_light',
        description: 'ควบคุมการเปิดหรือปิดไฟส่องสว่างของช่องจอดรถ (Parking Light) บน ESP32',
        parameters: {
          type: 'OBJECT',
          properties: {
            slot_id: {
              type: 'STRING',
              description: "หมายเลขช่องจอด เช่น '1', '2', หรือ 'all'",
            },
            state: {
              type: 'BOOLEAN',
              description: 'true สำหรับเปิดไฟ (ON), false สำหรับปิดไฟ (OFF)',
            },
          },
          required: ['slot_id', 'state'],
        },
      },
      {
        name: 'control_ultrasonic_sensor',
        description: 'ควบคุมการเปิดหรือปิดการทำงานของเซนเซอร์ Ultrasonic (HC-SR04) ตรวจจับระยะ',
        parameters: {
          type: 'OBJECT',
          properties: {
            slot_id: {
              type: 'STRING',
              description: "หมายเลขช่องจอด เช่น '1', '2', หรือ 'all'",
            },
            enabled: {
              type: 'BOOLEAN',
              description: 'true สำหรับเปิดใช้งาน (ONLINE), false สำหรับปิด/หยุดทำงาน (DISABLED)',
            },
          },
          required: ['slot_id', 'enabled'],
        },
      },
      {
        name: 'get_parking_status',
        description: 'ดึงข้อมูลสถานะช่องจอดรถ ความว่าง ระยะทาง และสถานะของไฟกับเซนเซอร์ในปัจจุบัน',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
    ],
  },
];

/**
 * Local Intelligent Rule-based NLP Engine
 * Accurately parses Thai and English instructions without requiring external API
 */
const processWithLocalNlp = async (prompt, systemContext, executeAction) => {
  const p = prompt.toLowerCase().trim();
  const { slots } = systemContext;

  // 1. LIGHT CONTROL INTENTS
  const isLightCommand =
    p.includes('ไฟ') ||
    p.includes('light') ||
    p.includes('หลอดไฟ') ||
    p.includes('led');

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

  // Handle Ultrasonic Sensor control first if sensor is explicitly mentioned
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
      text: `${statusWord} **${targetWord}** เรียบร้อยแล้วครับ ระบบได้ส่งสัญญาณอัปเดตไปยังฮาร์ดแวร์และแดชบอร์ดทันที`,
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

  // 4. GREETING & HELP
  const isGreeting =
    p.includes('หวัดดี') ||
    p.includes('สวัสดี') ||
    p.includes('hello') ||
    p.includes('hi') ||
    p.includes('ทำอะไรได้') ||
    p.includes('ช่วยอะไร') ||
    p.includes('help');

  if (isGreeting) {
    return {
      text: `👋 สวัสดีครับ! ผมคือ **Smart Parking AI Assistant** ผู้ช่วยสั่งการฮาร์ดแวร์และดูแลระบบช่องจอด\n\nสิ่งที่ผมสามารถสั่งการได้ทันที:\n• 💡 **ควบคุมไฟ:** *"เปิดไฟช่อง 1"*, *"ปิดไฟช่อง 2"*, *"ปิดไฟทุกช่อง"*\n• 📡 **ควบคุมเซนเซอร์:** *"ปิด Ultrasonic ช่อง 1"*, *"เปิดเซนเซอร์ทั้งหมด"*\n• 🚗 **ตรวจสอบระบบ:** *"มีที่จอดว่างไหม"*, *"ระยะเซนเซอร์ตอนนี้เท่าไหร่"*\n\nสามารถพิมพ์สั่งงานหรือกดปุ่มไมค์เพื่อสั่งด้วยเสียงได้เลยครับ!`,
    };
  }

  // 5. DEFAULT FALLBACK
  return {
    text: `ขออภัยครับ ผมยังไม่เข้าใจคำสั่ง "${prompt}" อย่างแน่ชัด 🤔\n\nคุณสามารถลองสั่งงานด้วยรูปแบบดังนี้ได้ครับ:\n- *"เปิดไฟช่อง 1"* หรือ *"ปิดไฟทุกช่อง"*\n- *"ปิดการทำงาน Ultrasonic ช่อง 1"*\n- *"ตอนนี้มีช่องว่างไหม"*`,
  };
};

/**
 * Main Service: Process user message
 * Tries Gemini first if key exists, otherwise uses Local Intelligent NLP
 */
export const processAiMessage = async (
  prompt,
  systemContext,
  executeAction
) => {
  const apiKey = getGeminiApiKey();

  // If Gemini API Key is configured, attempt call
  if (apiKey) {
    try {
      const response = await callGeminiWithTools(
        prompt,
        apiKey,
        systemContext,
        executeAction
      );
      if (response) return response;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local NLP engine:', err);
    }
  }

  // Use local NLP engine
  return await processWithLocalNlp(prompt, systemContext, executeAction);
};

/**
 * Call Gemini 2.0 Flash / 1.5 Flash via REST with Function Calling
 */
async function callGeminiWithTools(
  prompt,
  apiKey,
  systemContext,
  executeAction
) {
  const { slots } = systemContext;
  const currentStatusSummary = JSON.stringify(
    (slots || []).map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      distance_cm: s.distance,
      light_is_on: s.light,
      sensor_state: s.sensor || 'online',
    }))
  );

  const systemInstruction = `You are a helpful and polite Thai Smart Parking AI Assistant. You control physical IoT hardware connected to an ESP32 microcontroller via Supabase.
Current slots status: ${currentStatusSummary}.
When the user asks to turn on/off lights, call the 'control_parking_light' function.
When the user asks to turn on/off ultrasonic sensors, call the 'control_ultrasonic_sensor' function.
When the user asks about availability or distance, call 'get_parking_status' or answer clearly in Thai.
Always respond warmly, concisely, and professionally in Thai.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    tools: geminiTools,
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    throw new Error(`Gemini HTTP Error ${res.status}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts || [];

  let textResponse = '';
  const actionsTaken = [];

  for (const part of parts) {
    if (part.text) {
      textResponse += part.text;
    }
    if (part.functionCall) {
      const { name, args } = part.functionCall;

      if (name === 'control_parking_light') {
        const slotId = args.slot_id === 'all' ? 'all' : Number(args.slot_id);
        const state = Boolean(args.state);
        await executeAction({ type: 'light', slotId, value: state });
        actionsTaken.push({
          type: 'light',
          target: slotId,
          status: state ? 'on' : 'off',
          label: `Light ${slotId === 'all' ? 'All' : `0${slotId}`}: ${state ? 'ON' : 'OFF'}`,
        });
      }

      if (name === 'control_ultrasonic_sensor') {
        const slotId = args.slot_id === 'all' ? 'all' : Number(args.slot_id);
        const enabled = Boolean(args.enabled);
        const sensorStatus = enabled ? 'online' : 'disabled';
        await executeAction({ type: 'sensor', slotId, value: sensorStatus });
        actionsTaken.push({
          type: 'sensor',
          target: slotId,
          status: sensorStatus,
          label: `Ultrasonic ${slotId === 'all' ? 'All' : `0${slotId}`}: ${
            enabled ? 'ONLINE' : 'DISABLED'
          }`,
        });
      }
    }
  }

  if (actionsTaken.length > 0 && !textResponse) {
    textResponse = `ดำเนินการตามคำสั่งของคุณเรียบร้อยแล้วครับ ระบบได้ซิงค์สถานะไปยัง ESP32 ฮาร์ดแวร์แล้ว`;
  }

  return {
    text: textResponse || 'รับทราบคำสั่งเรียบร้อยครับ',
    actions: actionsTaken,
  };
}
