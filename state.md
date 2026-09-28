# สถานะล่าสุดของโปรเจกต์ (Project State)

**บันทึกเมื่อเวลา:** 29 กันยายน 2026 เวลา 04:10:00 น. (+07:00)  
**ชื่อโปรเจกต์:** Smart Parking IoT Dashboard (`smart-parking-iot`)  
**โฟลเดอร์โปรเจกต์:** `E:\smart_parking`  
**Git Branch ล่าสุด:** `master`  
**สถานะ Commit:** `6205073` (fix: strip all whitespace from Ollama host and prevent misleading 404 fallback on remote endpoints)  
**GitHub Pages URL:** [https://wallylila.github.io/smart_parking/](https://wallylila.github.io/smart_parking/)  
**แหล่งอ้างอิงหลัก (Source of Truth):** [parking.txt](file:///E:/smart_parking/parking.txt) และแบบอ้างอิงดีไซน์ [ref/ref.png](file:///E:/smart_parking/ref/ref.png) ตามข้อกำหนดใน [ref/ref.txt](file:///E:/smart_parking/ref/ref.txt)

---

## 1. ภาพรวมของระบบ (Project Overview)
โปรเจกต์นี้เป็นระบบ **Smart Parking IoT Dashboard** แบบ Full-Stack IoT ทำงานร่วมกันระหว่าง:
1. **Frontend Web Dashboard:** พัฒนาด้วย React 19 + Vite + Tailwind CSS สไตล์ Apple-like Minimalist Light Mode และรองรับ Dark Mode เต็มรูปแบบ ปรับปรุงสำหรับ Production Deployment บน GitHub Pages
2. **Backend & Realtime Database:** ขับเคลื่อนด้วย [Supabase](https://supabase.com/) (PostgreSQL) ผ่านระบบ Realtime WebSocket ช่วยให้อัปเดตสถานะช่องจอดทันทีโดยไม่ต้องรีเฟรชหน้าจอ
3. **IoT Controller:** ซอร์สโค้ดสำหรับ ESP32 รองรับเซนเซอร์วัดระยะ Ultrasonic (HC-SR04) และไฟ LED แสดงสถานะประจำช่องจอด พร้อมระบบ Heartbeat Watchdog ซิงค์เวลาโลก NTP
4. **Local AI Assistant (100% On-Device & HTTPS Tunnel Integration):** ผู้ช่วยสั่งการฮาร์ดแวร์ด้วยเสียงและข้อความ ทำงานบนเครื่องของผู้ใช้ผ่าน **Ollama** (`qwen2.5:3b`) โดยเชื่อมต่อไปยังหน้าเว็บออนไลน์ผ่าน **Cloudflare HTTPS Tunnel** พร้อมระบบ **In-Browser Local NLP Engine** สำรองทันทีเมื่อไม่ได้เปิดคอมพิวเตอร์

---

## 2. ข้อมูลทางเทคนิคและสภาพแวดล้อม (Tech Stack & Environment)
- **Frontend Framework:** React 19
- **Bundler / Build Tool:** Vite 6.4.3
- **CSS Framework:** Tailwind CSS 3.4 + PostCSS
- **Icon Library:** Lucide React
- **Backend / Database:** Supabase (`@supabase/supabase-js` v2.116.0)
  - PostgreSQL Table: `parking_slots`, `parking_activities`
  - Realtime Replication: Postgres Changes Broadcast ผ่าน WebSocket
- **IoT Firmware:** Arduino C++ (ESP32 Dev Module)
- **AI Core & Engine:**
  - **Local LLM Engine:** Ollama (`qwen2.5:3b`), รันพอร์ต `11434`
  - **Environment Variables:** `OLLAMA_ORIGINS="*"` และ `OLLAMA_HOST="0.0.0.0:11434"` บันทึกลง Windows User Environment ถาวร
  - **Secure Tunnel:** Cloudflare Quick Tunnel (`cloudflared`) แปลงพอร์ต Local 11434 เป็น HTTPS เพื่อรองรับการยิง Request จาก GitHub Pages ป้องกันปัญหา Mixed Content
  - **In-Browser Local NLP Engine:** รันตรงในเบราว์เซอร์ 0-latency ไร้ข้อผิดพลาด ตอบสนองภาษาไทยและอังกฤษ ทำงานได้แม้ออฟไลน์
- **Automation / Scripts:**
  - `Start-Ollama-Tunnel.bat`: สคริปต์ 1-Click บน Desktop สำหรับตรวจสอบ/เปิด Ollama และรัน Cloudflare Tunnel อัตโนมัติ
- **CI/CD & Hosting:**
  - GitHub Actions Workflow (`.github/workflows/deploy.yml`) ทำการ Build และ Deploy อัตโนมัติเมื่อ Push ขึ้น Branch `master`

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
│   │   └── AiAssistant.jsx         # Floating Chat Assistant สั่งการด้วยเสียง พร้อมกล่อง Settings เชื่อมต่อ Ollama
│   ├── pages/
│   │   ├── Dashboard.jsx           # หน้าหลัก (View 1): จัดวาง Multi-column พอดีกับหน้าจอคอมพิวเตอร์
│   │   ├── Usage.jsx               # หน้าสถิติ (View 2): ดูกราฟแนวโน้มและรายละเอียดอุปกรณ์
│   │   └── Account.jsx             # หน้าระบบ (View 3): System Diagnostic สดตาม Watchdog + Settings
│   ├── services/
│   │   ├── supabase.js             # Supabase Client Init พร้อมระบบ Auto-Sanitize URL
│   │   ├── parkingService.js       # ฟังก์ชันดึงข้อมูล ซิงค์สถานะ และ Realtime Subscriptions
│   │   └── aiService.js            # Ollama Client พร้อม Auto-Sanitize Host, Remote Fallback & Local NLP Engine
│   ├── data/
│   │   └── mockData.js             # ข้อมูล Mock Data สำรองเมื่อไม่ได้เชื่อมต่อฐานข้อมูล
│   ├── App.jsx                     # จุดควบคุม State, Type-Safe ID Matching, Realtime Listeners, AI Handlers
│   ├── index.css                   # การตั้งค่าฟอนต์และการรองรับ Dark/Light Mode
│   └── main.jsx                    # จุดเริ่มต้นการ Render ของ React DOM
├── arduino/
│   ├── smart_parking_esp32/
│   │   └── smart_parking_esp32.ino # โค้ด Arduino IDE สำหรับ ESP32 + HC-SR04 + Supabase REST API + NTP Watchdog
│   └── README.md                   # แผนผังการต่อขา (Wiring Diagram) และคู่มือฮาร์ดแวร์
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD สำหรับ deploy ขึ้น GitHub Pages อัตโนมัติ
├── Start-Ollama-Tunnel.bat         # สคริปต์ 1-Click รัน Ollama & Cloudflare Tunnel
├── .gitignore                      # ป้องกัน node_modules, .env, dist, *.bat หลุดขึ้น GitHub
├── .env                            # ไฟล์ใส่ API Key จริงของ Supabase (ห้ามอัปโหลดขึ้น GitHub)
├── .env.example                    # ตัวอย่างตัวแปร Environment Variables สำหรับผู้ใช้อื่น
├── README.md                       # คู่มือภาพรวมโปรเจกต์ วิธีติดตั้ง และวิธีต่อวงจร
├── supabase_schema.sql             # SQL Script สำหรับสร้างตาราง, RLS และเปิด Realtime ใน Supabase
├── index.html                      # หน้า HTML หลัก
├── tailwind.config.js              # กำหนดโทนสีและเงา
├── postcss.config.js               # การตั้งค่า PostCSS
├── vite.config.js                  # ตั้งค่า Base URL, Host 0.0.0.0, พอร์ต 3000 และ Proxy สำหรับ Local Dev
├── package.json                    # รายการ Dependencies และ Scripts
├── state.md                        # บันทึกสถานะล่าสุดของโปรเจกต์ (เอกสารนี้)
└── parking.txt                     # เอกสารสเปกหลัก (Single Source of Truth)
```

---

## 4. สถานะระบบ Realtime & เกณฑ์การตรวจจับ (Logic & Thresholds)

### 4.1 เกณฑ์ระยะทางตรวจจับช่องจอด (Distance Threshold)
- **Threshold ล่าสุด:** `15 cm`
- **เงื่อนไข:**
  - 🔴 **ไม่ว่าง (`occupied`):** ระยะเซนเซอร์ **< 15 cm** (ตรวจพบรถจอดในระยะประชิด)
  - 🟢 **ว่าง (`available`):** ระยะเซนเซอร์ **≥ 15 cm** (ไม่มีรถจอด / ช่องจอดว่าง)

### 4.2 ไฟ LED แสดงสถานะประจำช่องจอด Slot 1 & Slot 2
- **ช่องจอด 1 (Slot 1):**
  - 🟢 Green LED: `GPIO 16` (ติดเมื่อ `available`)
  - 🔴 Red LED: `GPIO 15` (ติดเมื่อ `occupied`)
- **ช่องจอด 2 (Slot 2):**
  - 🟢 Green LED: `GPIO 22` (ติดเมื่อ `available`)
  - 🔴 Red LED: `GPIO 23` (ติดเมื่อ `occupied`)
- **การสั่งการร่วมกับปุ่มปิดไฟบนหน้าเว็บ (Web Dashboard Light Control):**
  - เมื่อ **ปิดไฟ** บนหน้าเว็บ (`slot.light == false`): ทั้งไฟส่องสว่างหลักและไฟสถานะสีเขียวกับสีแดงของช่องนั้นๆ จะดับลงทั้งหมด (`LOW`)
  - เมื่อ **เปิดไฟ** บนหน้าเว็บ (`slot.light == true`): ไฟส่องสว่างหลักจะเปิด (`HIGH`) และไฟสถานะเขียว/แดงจะกลับมาทำงานตามความว่างของช่องจอดปกติ
- **ไฟส่องสว่างหลัก:** Slot 1 = `GPIO 2`, Slot 2 = `GPIO 4`

### 4.3 ระบบตรวจจับการเชื่อมต่อฮาร์ดแวร์แบบเรียลไทม์ (Heartbeat Watchdog System)
- **ESP32:** ซิงค์เวลาโลกผ่าน **NTP** (`pool.ntp.org`) และส่ง Heartbeat พร้อมฟิลด์ `updated_at` (ISO8601 UTC) ขึ้น Supabase ทุกๆ 30 วินาที
- **Frontend Watchdog Timer:**
  - กำหนดเวลา Timeout ไว้ที่ **50 วินาที** (`WATCHDOG_TIMEOUT_MS = 50000`)
  - เมื่อได้รับ WebSocket Realtime ตัวจับเวลาจะรีเซ็ต และแสดงสถานะ **`Online` (ไฟเขียว)**
  - หากบอร์ดหลุดการเชื่อมต่อเกิน 50 วินาที ระบบจะสลับเป็น **`Offline` (ไฟแดงกระพริบเตือน)** อัตโนมัติ

---

## 5. สถาปัตยกรรม Local AI & การเชื่อมต่อ GitHub Pages (Cloudflare Tunnel)

### 5.1 การแก้ไขปัญหาการเชื่อมต่อเมื่อนำโค้ดขึ้น GitHub Pages
- **ปัญหา Mixed Content:** GitHub Pages รันบน HTTPS บล็อกการเรียก `http://localhost:11434` ของ Ollama
- **ปัญหา Vite Proxy:** Proxy `/ollama` ใช้งานได้เฉพาะในโหมด Dev (`npm run dev`) ไม่มีอยู่จริงบน Static Web ของ GitHub Pages
- **การแก้ไข:** ใช้ **Cloudflare Quick Tunnel (`cloudflared`)** สร้าง URL แบบ HTTPS ส่งต่อคำขอเข้าสู่พอร์ต 11434 ของ Ollama ในเครื่องคอมพิวเตอร์ของผู้ใช้

### 5.2 การกำหนดสิทธิ์ถาวรใน Windows (Permanent Permissions)
- ตั้งค่า Environment Variables ถาวรผ่าน Windows User Scope:
  - `OLLAMA_ORIGINS = "*"`: อนุญาตให้รับคำขอข้ามโดเมน (CORS) จาก GitHub Pages
  - `OLLAMA_HOST = "0.0.0.0:11434"`: เปิดรับการเชื่อมต่อจากภายนอกและผ่าน Tunnel

### 5.3 การปรับแต่งความเสถียรใน Frontend (`aiService.js` & `AiAssistant.jsx`)
- **ระบบ Auto-Sanitize URL:**
  - ลบช่องว่าง (Whitespace/Newlines) ทั้งหมดออกจาก URL ป้องกันปัญหาการ Copy ที่มีเว้นวรรค เช่น `trycloudflare. com`
  - ตรวจจับและเติม `https://` อัตโนมัติหากผู้ใช้พิมพ์แค่ชื่อโดเมน
  - ตัดพอร์ต `:11434` ออกโดยอัตโนมัติหากผู้ใช้เผลอพิมพ์ต่อท้ายโดเมน Cloudflare
- **ระบบ Smart Endpoints:**
  - เมื่อใช้โดเมน Remote (เช่น Cloudflare Tunnel) ระบบจะยิงตรงไปยัง Remote Endpoint โดยไม่ Fallback กลับไปหา `/ollama/api/tags` บน GitHub Pages เพื่อป้องกันการเกิด Error 404 หลอก
- **การแสดงข้อผิดพลาดที่แท้จริง (Detailed Diagnostic):**
  - ปรับปรุงให้หน้าต่าง Settings แสดง Error ที่แท้จริง (เช่น `HTTP 404`, `Network Error`) พร้อมระบุ URL ปลายทาง แทนการขึ้นข้อความเหมารวม
- **โมเดลเริ่มต้น:** ปรับค่าเริ่มต้นเป็น `qwen2.5:3b` ซึ่งตรงกับโมเดลที่มีในเครื่องของผู้ใช้

### 5.4 สคริปต์ 1-Click Startup (`Start-Ollama-Tunnel.bat`)
- สร้างไฟล์ทางลัดไว้ที่หน้าจอ Desktop (`C:\Users\kanta\OneDrive\Desktop\Start-Ollama-Tunnel.bat`)
- **การทำงาน:**
  1. ตรวจสอบพอร์ต 11434 หากยังไม่ได้เปิด Ollama จะสั่งเปิด Ollama ให้อัตโนมัติ
  2. รัน Cloudflare Tunnel ให้ทันที พร้อมแสดงลิงก์ `https://xxxx.trycloudflare.com` ให้คัดลอกไปวางบนหน้าเว็บ

---

## 6. ระบบวิเคราะห์และประวัติการเข้าจอด (Usage Analytics, Timeline & Excel Export)
- ดึงข้อมูลจริงจากตาราง `parking_activities` พร้อม Realtime WebSocket
- **KPI Cards:** จำนวนรถเข้าจอดทั้งหมด, ระยะเวลาจอดเฉลี่ย, ช่องจอดที่มีการใช้งานสูงสุด, จำนวนกิจกรรมทั้งหมด
- **Usage Chart:** กราฟ SVG แสดงแนวโน้มการใช้งานตามช่วงเวลาจริง (1D, 1W, 1M, 3M, 1Y)
- **Activity Timeline:** ไทม์ไลน์บันทึกประวัติการจอด พร้อมระยะเวลาจอดจริงของแต่ละคัน (เช่น `จอดนาน 15 นาที 4 วินาที`), ระบบค้นหา, ระบบฟิลเตอร์หลายมิติ และ Pagination
- **Excel/CSV Export:** ดาวน์โหลดประวัติเป็นไฟล์ CSV พร้อมฝังรหัส **UTF-8 Byte Order Mark (`\uFEFF`)** เปิดใน Microsoft Excel บน Windows และ Mac ได้ภาษาไทยถูกต้อง 100%

---

## 7. ขั้นตอนการเปิดใช้งานระบบเมื่อเปิดคอมใหม่ (Reboot Checklist)

```text
1. ดับเบิ้ลคลิกไฟล์ "Start-Ollama-Tunnel.bat" บนหน้าจอ Desktop
2. รอ 3-5 วินาที แล้วคัดลอกลิงก์ "https://xxxx.trycloudflare.com" ที่ปรากฏในหน้าต่าง
3. เปิดหน้าเว็บ GitHub Pages (https://wallylila.github.io/smart_parking/)
4. เปิด AI Assistant > ⚙️ Settings > นำลิงก์ไปวางในช่อง "Ollama Host URL"
5. กดปุ่ม "🔍 ตรวจสอบการเชื่อมต่อ Ollama" (จะขึ้นสีเขียวและตรวจพบ qwen2.5:3b)
6. กดปุ่ม "บันทึก" แล้วเริ่มใช้งานได้ทันที!
```
*(หมายเหตุ: หากไม่ได้เปิดคอมหรือไม่ได้รัน Tunnel หน้าเว็บจะสลับไปใช้ In-Browser Local NLP Engine อัตโนมัติ สามารถสั่งเปิด/ปิดไฟและเช็คความว่างได้ตามปกติ)*
