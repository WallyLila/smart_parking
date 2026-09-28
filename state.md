# สถานะล่าสุดของโปรเจกต์ (Project State)

**บันทึกเมื่อเวลา:** 29 กันยายน 2026 เวลา 02:15:00 น. (+07:00)  
**ชื่อโปรเจกต์:** Smart Parking IoT Dashboard (`smart-parking-iot`)  
**โฟลเดอร์โปรเจกต์:** `E:\smart_parking`  
**Git Branch ล่าสุด:** `feature/add_ai`  
**สถานะ Commit:** `final`  
**แหล่งอ้างอิงหลัก (Source of Truth):** [parking.txt](file:///E:/smart_parking/parking.txt) และแบบอ้างอิงดีไซน์ [ref/ref.png](file:///E:/smart_parking/ref/ref.png) ตามข้อกำหนดใน [ref/ref.txt](file:///E:/smart_parking/ref/ref.txt)

---

## 1. ภาพรวมของระบบ (Project Overview)
โปรเจกต์นี้เป็นระบบ **Smart Parking IoT Dashboard** แบบ Full-Stack IoT ทำงานร่วมกันระหว่าง:
1. **Frontend Web Dashboard:** พัฒนาด้วย React 19 + Vite + Tailwind CSS สไตล์ Apple-like Minimalist Light Mode และรองรับ Dark Mode เต็มรูปแบบ
2. **Backend & Realtime Database:** ขับเคลื่อนด้วย [Supabase](https://supabase.com/) (PostgreSQL) ผ่านระบบ Realtime WebSocket ช่วยให้อัปเดตสถานะช่องจอดทันทีโดยไม่ต้องรีเฟรชหน้าจอ
3. **IoT Controller:** ซอร์สโค้ดสำหรับ ESP32 รองรับเซนเซอร์วัดระยะ Ultrasonic (HC-SR04) และไฟ LED แสดงสถานะประจำช่องจอด
4. **Local AI Assistant (100% On-Device):** ผู้ช่วยสั่งการฮาร์ดแวร์ด้วยเสียงและข้อความ ทำงานบนเครื่องของผู้ใช้ 100% ผ่าน **Ollama** (`deepseek-r1:1.5b` หรือโมเดลอื่นๆ) พร้อมระบบ **In-Browser Local NLP Engine** สำรองทันทีเมื่อไม่มี Ollama โดยไม่ต้องพึ่งพาคลาวด์ API ภายนอก

---

## 2. ข้อมูลทางเทคนิคและสภาพแวดล้อม (Tech Stack & Environment)
- **Frontend Framework:** React 19
- **Bundler / Build Tool:** Vite 6.4.3 (พร้อม Vite Proxy `/ollama` ไปยัง `http://127.0.0.1:11434` แก้ปัญหา CORS ในเบราว์เซอร์)
- **CSS Framework:** Tailwind CSS 3.4 + PostCSS
- **Icon Library:** Lucide React
- **Backend / Database:** Supabase (`@supabase/supabase-js` v2.97.0)
  - PostgreSQL Table: `parking_slots`, `parking_activities`
  - Realtime Replication: Postgres Changes Broadcast ผ่าน WebSocket
- **IoT Firmware:** Arduino C++ (ESP32 Dev Module)
- **AI Core:**
  - **Local LLM Engine:** Ollama (`http://localhost:11434`), แนะนำโมเดล `deepseek-r1:1.5b` หรือ `qwen2.5:3b`
  - **Local Rule-based NLP Engine:** รันตรงในเบราว์เซอร์ 0-latency ไร้ข้อผิดพลาด ตอบสนองภาษาไทยและอังกฤษ
- **Local Dev Server:** พอร์ต 3000 (`http://localhost:3000` และ `http://192.168.1.176:3000`)

---

## 3. โครงสร้างไฟล์ในโปรเจกต์ (File Structure)

```text
E:/smart_parking/
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # โครงหน้าเว็บหลัก ควบคุมความกว้างและ Padding
│   │   ├── BottomNavigation.jsx    # แถบนำทางด้านล่างสำหรับมือถือ (ซ่อนบนจอคอมด้วย md:hidden)
│   │   ├── Header.jsx              # ส่วนหัวของเว็บ เมนูนำทางบนจอคอม และปุ่มสลับ Dark/Light Mode
│   │   ├── ParkingOverview.jsx     # สรุปภาพรวมช่องจอด (Total, Available, Occupied) พร้อม Progress Bar
│   │   ├── ParkingSlotCard.jsx     # การ์ดแสดงช่องจอด 2 ช่อง แสดงระยะ cm และสวิตช์ไฟ
│   │   ├── SensorStatus.jsx        # คอมโพเนนต์แสดงสถานะเซนเซอร์แบบกะทัดรัด
│   │   ├── SystemStatus.jsx        # แสดงสถานะระบบ (ESP32, Sensor 01, Sensor 02, Last Update)
│   │   ├── ActivityList.jsx        # ประวัติเหตุการณ์ล่าสุด (Recent Activity Feed)
│   │   ├── UsageChart.jsx          # กราฟสถิติการใช้งาน SVG คำนวณจากประวัติจริงใน Supabase
│   │   ├── DeviceList.jsx          # รายการอุปกรณ์ฮาร์ดแวร์ Telemetry สดตามสถานะบอร์ดและเซนเซอร์
│   │   ├── ActivityTimeline.jsx    # ไทม์ไลน์ประวัติรถเข้า-ออก พร้อมค้นหา ฟิลเตอร์ คำนวณเวลาจอด และ Export CSV
│   │   ├── Toggle.jsx              # สวิตช์ Toggle UI สวยงามสำหรับสลับสถานะ
│   │   └── AiAssistant.jsx         # Floating Chat Assistant "AI Assistant" สั่งการฮาร์ดแวร์ด้วยเสียงและโมเดล Local AI
│   ├── pages/
│   │   ├── Dashboard.jsx           # หน้าหลัก (View 1): จัดวาง Multi-column พอดีกับหน้าจอคอมพิวเตอร์
│   │   ├── Usage.jsx               # หน้าสถิติ (View 2): ดูกราฟแนวโน้มและรายละเอียดอุปกรณ์ (ตามแนวทางแบบที่ 2)
│   │   └── Account.jsx             # หน้าระบบ (View 3): ข้อมูลระบบและการตั้งค่า Toggle + สถานะ Supabase
│   ├── services/
│   │   ├── supabase.js             # Supabase Client Init พร้อมระบบ Auto-Sanitize URL ป้องกันบั๊ก /rest/v1/
│   │   ├── parkingService.js       # ฟังก์ชันดึงข้อมูล ซิงค์สถานะ และ Realtime Subscriptions
│   │   └── aiService.js            # Ollama Client + In-Browser Local NLP Engine (ปลอดคลาวด์ API Key 100%)
│   ├── data/
│   │   └── mockData.js             # ข้อมูล Mock Data สำรองเมื่อไม่ได้เชื่อมต่อฐานข้อมูล
│   ├── App.jsx                     # จุดควบคุม State, Type-Safe ID Matching, Realtime Listeners, AI Handlers
│   ├── index.css                   # การตั้งค่าฟอนต์และการรองรับ Dark/Light Mode
│   └── main.jsx                    # จุดเริ่มต้นการ Render ของ React DOM
├── arduino/
│   ├── smart_parking_esp32/
│   │   └── smart_parking_esp32.ino # โค้ด Arduino IDE สำหรับ ESP32 + HC-SR04 + Supabase REST API
│   └── README.md                   # แผนผังการต่อขา (Wiring Diagram) และคู่มือฮาร์ดแวร์
├── .gitignore                      # ป้องกัน node_modules, .env, dist หลุดขึ้น GitHub
├── .env                            # ไฟล์ใส่ API Key จริงของ Supabase (ห้ามอัปโหลดขึ้น GitHub)
├── .env.example                    # ตัวอย่างตัวแปร Environment Variables สำหรับผู้ใช้อื่น
├── README.md                       # คู่มือภาพรวมโปรเจกต์ วิธีติดตั้ง และวิธีต่อวงจร
├── supabase_schema.sql             # SQL Script สำหรับสร้างตาราง, RLS และเปิด Realtime ใน Supabase
├── index.html                      # หน้า HTML หลัก
├── tailwind.config.js              # กำหนดโทนสีและเงา
├── postcss.config.js               # การตั้งค่า PostCSS
├── vite.config.js                  # ตั้งค่าโฮสต์ 0.0.0.0, พอร์ต 3000 และ Proxy ไปยัง Ollama (/ollama -> 11434)
├── package.json                    # รายการ Dependencies
├── state.md                        # บันทึกสถานะล่าสุดของโปรเจกต์
└── parking.txt                     # เอกสารสเปกหลัก (Single Source of Truth)
```

---

## 4. สถานะระบบ Realtime & เกณฑ์การตรวจจับ (Logic & Thresholds)

### 4.1 เกณฑ์ระยะทางตรวจจับช่องจอด (Distance Threshold)
- **Threshold ล่าสุดปรับเป็น:** `15 cm` (เดิม `50 cm` ในไฟล์ `smart_parking_esp32.ino`)
- **เงื่อนไข:**
  - 🔴 **ไม่ว่าง (`occupied`):** ระยะเซนเซอร์ **< 15 cm** (ตรวจพบรถจอดในระยะประชิด)
  - 🟢 **ว่าง (`available`):** ระยะเซนเซอร์ **≥ 15 cm** (ไม่มีรถจอด / ช่องจอดว่าง)
- **สูตรในโค้ด:**
  ```cpp
  // Under 15cm means car is parked
  slot1.status = (dist1 < DISTANCE_THRESHOLD) ? "occupied" : "available";
  ```

### 4.2 ไฟ LED แสดงสถานะประจำช่องจอด Slot 1 & Slot 2 (Status LEDs & Web Light Control)
- **ช่องจอด 1 (Slot 1):**
  - 🟢 **Green LED (`GPIO 16`):** ติดสว่างเมื่อสถานะเป็น `available` (ว่าง)
  - 🔴 **Red LED (`GPIO 15`):** ติดสว่างเมื่อสถานะเป็น `occupied` (ไม่ว่าง)
- **ช่องจอด 2 (Slot 2):**
  - 🟢 **Green LED (`GPIO 22`):** ติดสว่างเมื่อสถานะเป็น `available` (ว่าง)
  - 🔴 **Red LED (`GPIO 23`):** ติดสว่างเมื่อสถานะเป็น `occupied` (ไม่ว่าง)
- **การสั่งการร่วมกับปุ่มปิดไฟบนหน้าเว็บ (Web Dashboard Light Control):**
  - เมื่อ **ปิดไฟ** บนหน้าเว็บ (`slot.light == false`): ทั้งไฟส่องสว่างหลักและไฟสถานะสีเขียวกับสีแดงของช่องนั้นๆ จะดับลงทั้งหมด (`LOW`)
  - เมื่อ **เปิดไฟ** บนหน้าเว็บ (`slot.light == true`): ไฟส่องสว่างหลักจะเปิด (`HIGH`) และไฟสถานะเขียว/แดงจะกลับมาทำงานตามความว่างของช่องจอดปกติ
  - ซิงค์สถานะทันทีใน `syncLightsFromSupabase()` และ `setup()` โดยไม่ต้องรอรอบคำนวณถัดไป

### 4.3 การปรับแต่งพินและสถานะฮาร์ดแวร์ (Hardware Pinouts & Modes)
- **ไฟส่องสว่างหลัก:**
  - `LIGHT_PIN_1`: `GPIO 2`
  - `LIGHT_PIN_2`: `GPIO 4`
- **ไฟสถานะประจำช่องจอด:**
  - Slot 1: Green = `GPIO 16`, Red = `GPIO 15`
  - Slot 2: Green = `GPIO 22`, Red = `GPIO 23`
- **การอ่านค่าช่องจอด Slot 1 & Slot 2:** รองรับการตรวจวัดระยะและคุมไฟ LED ของทั้ง 2 ช่องแบบแยกอิสระ พร้อมระบบตรวจสอบสถานะ `sensor != "disabled"`

### 4.4 สถาปัตยกรรมตรวจจับ Real-Time & ซิงค์คลาวด์แบบ Event-Driven
- **ความถี่ตรวจจับเซนเซอร์ (`SENSOR_READ_INTERVAL`):** ปรับเป็น `200 ms` อ่านค่าไวและตอบสนองทันที
- **ระบบกรองสัญญาณรบกวน (Debounce Filter):** ตรวจจับสถานะคงที่ติดต่อกัน 2 ครั้ง (`DEBOUNCE_THRESHOLD = 2`, ~400 ms) ป้องกันคลื่นสะท้อนหลอก
- **การคุมไฟ LED ทันที (Zero Lag):** สั่งเปิด/ปิดไฟ LED ประจำช่องทันทีในระดับฮาร์ดแวร์โดยไม่ต้องรอคำขอเน็ตเวิร์ก
- **การส่งข้อมูลขึ้น Supabase แบบ Event-Driven:**
  - **เมื่อสถานะเปลี่ยน (On State Change):** ส่งข้อมูล PATCH และบันทึกประวัติ Activity ทันทีที่รถเข้าหรือออก
  - **Heartbeat Sync (`HEARTBEAT_INTERVAL = 30000`):** ส่งอัปเดตระยะทางและสถานะทุกๆ 30 วินาที เพื่อรักษาสถานะออนไลน์บน Dashboard โดยไม่รบกวน Main Loop
  - **การทำงานเมื่อเน็ตหลุด (Non-blocking Wi-Fi Reconnect):** เซนเซอร์และไฟ LED ทำงานออฟไลน์ได้ตามปกติ 100% ไม่ค้าง ไม่ติด delay และจะซิงค์ขึ้น Supabase อัตโนมัติเมื่อเน็ตกลับมา

### 4.5 ระบบตรวจจับการเชื่อมต่อฮาร์ดแวร์แบบเรียลไทม์ (Heartbeat Watchdog System)
- **ESP32 Firmware:**
  - เพิ่มการซิงค์เวลาโลกผ่าน **NTP** (`pool.ntp.org`, `time.google.com`) ใน `setup()`
  - ทุกครั้งที่ส่งข้อมูลหรือเกิด Heartbeat (ทุก 30 วินาที) บอร์ดจะแนบฟิลด์ `updated_at` (ISO8601 UTC) ขึ้นตาราง `parking_slots` ใน Supabase
  - มี Serial Log แจ้งเตือน: `[Watchdog] 💓 Sending periodic hardware heartbeat to Supabase...`
- **Frontend Realtime Watchdog Timer (ใน `App.jsx`):**
  - กำหนดเวลา Timeout ไว้ที่ **50 วินาที** (`WATCHDOG_TIMEOUT_MS = 50000`, 30s Heartbeat + 20s Network Buffer)
  - ทุกครั้งที่เบราว์เซอร์ได้รับสัญญาณ WebSocket Realtime จาก Supabase ตัวจับเวลา Watchdog จะรีเซ็ตเป็น 0 วินาที และยืนยันสถานะ **`Online` (ไฟเขียว)** ทันที
  - หากบอร์ด ESP32 ถูกถอดปลั๊ก หลุด Wi-Fi หรือไม่มีสัญญาณส่งมาเกิน 50 วินาที ระบบ Watchdog จะสลับสถานะของบอร์ดและเซนเซอร์เป็น **`Offline` (ไฟแดงกระพริบเตือน)** อัตโนมัติ
  - ค่า "Last Update" จะนับถอยหลังบอกระยะเวลาจริง เช่น `Just now`, `15s ago`, `2m ago (Offline)`
- **การสะท้อนสถานะไปยัง UI ทุกจุด:**
  - **Header:** แสดง Badge `Hardware Live` (ไฟเขียว) เมื่อบอร์ดต่ออยู่ และ `ESP32 Offline` (ไฟแดง) เมื่อขาดการเชื่อมต่อ
  - **System Status (Dashboard):** กล่อง Diagnostic 4 ช่องแสดงสถานะ `Online` / `Offline` / `Paused` พร้อมสีไฟตามสถานะจริง
  - **Hardware Telemetry (Usage):** ตารางอุปกรณ์ `DeviceList` แสดงสถานะของ ESP32 และเซนเซอร์ทั้งสองช่องตามผลตรวจจับจริงของ Watchdog ไม่มีการค้างค่าหลอก

---

## 5. ระบบผู้ช่วยอัจฉริยะในเครื่อง (AI Assistant & Voice Controller)

### 5.1 การปรับเปลี่ยนสถาปัตยกรรม AI เป็น Local 100%
- **ยกเลิกการใช้คลาวด์ API ทั้งหมด:** ปลดภาระเรื่อง API Key, ปัญหาโมเดลหมดอายุ (เช่น Gemini 2.0/2.5 deprecation) และปัญหาเครือข่ายอินเทอร์เน็ต
- **สถาปัตยกรรม Local Dual-Engine:**
  1. **Ollama LLM Engine:** รันโมเดล AI ในเครื่องผ่าน Port 11434 รองรับโมเดลเช่น `deepseek-r1:1.5b`, `qwen2.5:3b`
     - มีระบบกรองแท็ก `<think>...</think>` อัตโนมัติสำหรับโมเดลประเภท Reasoning
     - สื่อสารผ่าน Action Tags: `[ACTION:LIGHT:1:ON]`, `[ACTION:LIGHT:ALL:OFF]`, `[ACTION:SENSOR:1:DISABLED]`, ฯลฯ
     - ตรวจจับรายชื่อโมเดลที่ติดตั้งไว้ในเครื่องอัตโนมัติผ่าน Endpoint `/api/tags`
  2. **In-Browser Local NLP Engine (Zero-Latency Fallback):**
     - หากไม่ได้เปิดโปรแกรม Ollama หรือยังไม่ได้ติดตั้งโมเดล ระบบจะสลับมาประมวลผลด้วยกฎไวยากรณ์อัจฉริยะในเบราว์เซอร์ทันที ทำงานได้ 100% ไม่มีข้อผิดพลาด
- **การแก้ปัญหา CORS:** มีการกำหนด Proxy ใน `vite.config.js` ให้เส้นทาง `/ollama` ชี้ไปยัง `http://127.0.0.1:11434` ทำให้เว็บส่งคำขอได้ลื่นไหลโดยไม่ติดข้อจำกัดด้านความปลอดภัยของเบราว์เซอร์
- **UI & UX:**
  - ใช้ชื่อปุ่มและหน้าต่างแชตว่า **"AI Assistant"**
  - รองรับการสั่งการด้วยเสียงภาษาไทย (`th-TH`) ผ่าน Web Speech API

---

## 6. ระบบวิเคราะห์และประวัติการเข้าจอด (Usage Analytics, Timeline & Excel/CSV Export)
- **การดึงข้อมูลจริง:** ดึงข้อมูลประวัติย้อนหลังจากตาราง `parking_activities` ใน Supabase พร้อม Realtime Listener อัปเดตทันทีเมื่อมีรถเข้าหรือออก
- **บัตรสรุปตัวชี้วัด (KPI Cards):**
  - จำนวนรถเข้าจอดทั้งหมด (Total Parkings) และสถิติของวันนี้
  - ระยะเวลาจอดเฉลี่ย (Avg. Stay Duration) คำนวณจากช่วงเวลาตั้งแต่รถเข้า (`occupied`) จนถึงรถออก (`available`)
  - ช่องจอดที่มีการใช้งานสูงสุด (Most Active Bay) และสัดส่วนร้อยละ
  - จำนวนกิจกรรมทั้งหมดที่บันทึกไว้ในฐานข้อมูล (Total Logged Events)
- **กราฟวิเคราะห์ตามเวลาจริง (Usage Chart):**
  - วาดกราฟเส้นและพื้นที่ SVG ตามข้อมูลจริง แบ่งได้ทั้งแบบ 24 ชั่วโมง (`1D`), 7 วันล่าสุด (`1W`), 30 วันล่าสุด (`1M`), และรายเดือน (`3M` / `1Y`)
  - รองรับ Interactive Tooltip แสดงจำนวนรถที่เข้าจอดในแต่ละช่วงเวลา
- **ไทม์ไลน์ประวัติรถเข้า-ออก (Activity Timeline):**
  - แสดงรายการประวัติพร้อมระบุเวลาแบบละเอียด (วัน/เดือน/ปี และเวลา) และ Relative Time (เช่น '5 นาทีที่แล้ว')
  - ป้ายระบุช่องจอด (`Slot 01` / `Slot 02`) และป้ายสถานะ (Occupied / Available / Telemetry)
  - แสดงระยะเวลาจอดจริงของแต่ละคัน (เช่น `จอดนาน 15 นาที 4 วินาที`)
  - ระบบค้นหาด่วน (Search Box) ค้นหาตามคำ เหตุการณ์ หรือช่องจอด
  - ระบบฟิลเตอร์แบบหลายมิติ: เลือกตามช่องจอด, เลือกตามสถานะ, และเลือกตามช่วงเวลา
  - ระบบแบ่งหน้า (Pagination) แสดงผลครั้งละ 10 รายการเพื่อความรวดเร็ว
- **การส่งออกข้อมูล (Export to Excel / CSV):**
  - ปุ่ม Export CSV สำหรับดาวน์โหลดข้อมูลที่กำลังกรองอยู่หรือข้อมูลทั้งหมด
  - ฝังรหัส **UTF-8 Byte Order Mark (`\uFEFF`)** ไว้ที่หัวไฟล์ เพื่อให้เปิดไฟล์ใน Microsoft Excel บน Windows และ Mac ได้ภาษาไทยถูกต้อง 100% ไม่เกิดปัญหาภาษาต่างดาว (Mojibake)

---

## 7. คู่มือและข้อกำหนดสำหรับการนำขึ้น GitHub (GitHub Guidelines)

### 7.1 ไฟล์ที่ต้องอัปโหลดขึ้น GitHub (Whitelisted)
- โฟลเดอร์ `src/` (โค้ดเว็บทั้งหมด)
- ไฟล์ Config: `package.json`, `package-lock.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- โฟลเดอร์ `arduino/` (โค้ด ESP32 ทั้งหมด)
- ไฟล์ฐานข้อมูล: `supabase_schema.sql`
- ไฟล์เอกสาร: `README.md`, `state.md`, `parking.txt`, โฟลเดอร์ `ref/`
- ไฟล์ตัวอย่าง Config: `.env.example`, `.gitignore`

### 7.2 ไฟล์ที่ "ห้าม" อัปโหลดขึ้น GitHub เด็ดขาด (Blacklisted)
1. ❌ **`node_modules/`** : ไม่ต้องอัปโหลดเพราะมีขนาดใหญ่มาก ผู้อื่นสามารถรัน `npm install` เพื่อดาวน์โหลดได้ทันที
2. ❌ **`.env`** : **ห้ามอัปโหลดเด็ดขาด** เนื่องจากมี Supabase Project URL และ Anon Key จริง หากหลุดขึ้น Public Repo จะทำให้ฐานข้อมูลไม่ปลอดภัย
3. ❌ **`dist/`** : โฟลเดอร์ผลลัพธ์จากการ Build ซึ่งสร้างใหม่ได้เสมอด้วยคำสั่ง `npm run build`

---

## 8. ขั้นตอนการนำโปรเจกต์ขึ้น GitHub (Step-by-Step)

```bash
# 1. ตรวจสอบสถานะไฟล์
git status

# 2. เพิ่มไฟล์ที่แก้ไขเข้าสู่ Staging
git add .

# 3. บันทึก Commit
git commit -m "final"

# 4. Push ขึ้น GitHub (เมื่อเชื่อมต่อ Remote เรียบร้อย)
git push
```
