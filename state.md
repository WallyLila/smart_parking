# สถานะล่าสุดของโปรเจกต์ (Project State)

**บันทึกเมื่อเวลา:** 14 กันยายน 2026 เวลา 21:58:30 น. (+07:00)  
**ชื่อโปรเจกต์:** Smart Parking IoT Dashboard (`smart-parking-iot`)  
**โฟลเดอร์โปรเจกต์:** `E:\smart_parking`  
**แหล่งอ้างอิงหลัก (Source of Truth):** [parking.txt](file:///E:/smart_parking/parking.txt) และแบบอ้างอิงดีไซน์ [ref/ref.png](file:///E:/smart_parking/ref/ref.png) ตามข้อกำหนดใน [ref/ref.txt](file:///E:/smart_parking/ref/ref.txt)

---

## 1. ภาพรวมของระบบ (Project Overview)
โปรเจกต์นี้เป็นเว็บแอปพลิเคชัน Frontend Prototype สำหรับระบบ **Smart Parking IoT** รองรับช่องจอดรถจริงจำนวน **2 ช่องจอด (Parking Slot 01 และ Parking Slot 02)** โดยพัฒนาขึ้นตามข้อกำหนด กฎเกณฑ์ และโครงสร้างใน `parking.txt` และได้รับการ Restyle ให้เข้ากับสไตล์ **Apple-like Minimalist Light Mode** ตามภาพอ้างอิง `ref/ref.png` และกติกาใน `ref/ref.txt` ทุกประการ โดยยังคง Logic, State, Hook, Event Handlers เดิมไว้อย่างครบถ้วน 100%

---

## 2. ข้อมูลทางเทคนิคและสภาพแวดล้อม (Tech Stack & Environment)
- **Framework:** React 19
- **Bundler / Build Tool:** Vite 6.2.0
- **CSS Framework:** Tailwind CSS 3.4
- **Icon Library:** Lucide React
- **Language:** JavaScript / JSX
- **Typography:** Plus Jakarta Sans & Inter
- **Design System:** Apple Minimalist Light Mode (Background: `#f7f8fa`, Surface Cards: Pure White `bg-white` with `rounded-3xl` / `rounded-[2.5rem]`, Diffuse Shadows `shadow-soft` & `shadow-float`, Pills `rounded-full`, Primary Text: `#111827`, Status: Emerald `#059669` / Charcoal `#1f2937`)
- **Server Status:** พอร์ต 3000 (`http://localhost:3000` และ `http://192.168.1.176:3000`)

---

## 3. โครงสร้างไฟล์ในโปรเจกต์ (File Structure)

```text
E:/smart_parking/
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # โครงหน้าเว็บหลัก ควบคุมความกว้าง max-w-7xl และ Padding
│   │   ├── BottomNavigation.jsx    # แถบนำทางด้านล่างสำหรับมือถือ (ซ่อนบนคอมพิวเตอร์ด้วย md:hidden)
│   │   ├── Header.jsx              # ส่วนหัวของหน้าเว็บ พร้อมแถบเมนูนำทางบนจอคอมและปุ่มสลับ Dark/Light Mode
│   │   ├── ParkingOverview.jsx     # การ์ดสรุปภาพรวมช่องจอด (Total: 2, Free: 1, Occupied: 1) พร้อม Progress Bar
│   │   ├── ParkingSlotCard.jsx     # การ์ดแสดงช่องจอดรถ 2 ช่อง พร้อมระยะเซนเซอร์และสวิตช์ไฟ
│   │   ├── SensorStatus.jsx        # คอมโพเนนต์แสดงสถานะเซนเซอร์แบบกะทัดรัด
│   │   ├── SystemStatus.jsx        # แสดงสถานะระบบ (ESP32, Sensor 01, Sensor 02, Last Update)
│   │   ├── ActivityList.jsx        # รายการเหตุการณ์ล่าสุด (Recent Activity)
│   │   ├── UsageChart.jsx          # กราฟสถิติการใช้งาน SVG แบบ Line Chart พร้อมแท็บ 1D/1W/1M/3M/1Y
│   │   ├── DeviceList.jsx          # รายการอุปกรณ์และเซนเซอร์ (Detail Device) พร้อมจำนวนการอัปเดต
│   │   └── Toggle.jsx              # สวิตช์ Toggle UI สำหรับควบคุมไฟช่องจอดและการตั้งค่า
│   ├── pages/
│   │   ├── Dashboard.jsx           # หน้าหลัก (View 1): จัดวางแบบ Multi-column พอดีกับหน้าจอคอมพิวเตอร์
│   │   ├── Usage.jsx               # หน้าสถิติ (View 2): ดูกราฟแนวโน้มและรายละเอียดอุปกรณ์
│   │   ├── Account.jsx             # หน้าระบบ (View 3): ข้อมูลระบบและการตั้งค่า Toggle + สถานะ Supabase
│   │   └── Favorites.jsx           # หน้าช่องจอดที่บันทึกไว้ (Favorites)
│   ├── services/
│   │   ├── supabase.js             # Supabase Client Initialization & Config Detection
│   │   └── parkingService.js       # Data Fetching & Supabase Realtime Subscriptions
│   ├── data/
│   │   └── mockData.js             # แหล่งรวม Mock Data กลางของช่องจอด อุปกรณ์ กราฟ และประวัติ
│   ├── App.jsx                     # จุดควบคุม State, Realtime Listener และ Routing
│   ├── index.css                   # การตั้งค่าฟอนต์และการรองรับ Dark/Light Mode
│   └── main.jsx                    # จุดเริ่มต้นการ Render ของ React DOM
├── arduino/
│   ├── smart_parking_esp32.ino         # โค้ด Arduino IDE สำหรับ ESP32 + HC-SR04 + Supabase REST API
│   └── README.md                       # แผนผังการต่อขา (Wiring Diagram) และคู่มือการติดตั้งไลบรารี
├── .env                            # ไฟล์ใส่ API Key ของ Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── .env.example                    # ตัวอย่างการกำหนดค่า Environment Variables
├── supabase_schema.sql             # SQL Script สำหรับสร้างตาราง, RLS และ Realtime ใน Supabase
├── index.html                      # หน้า HTML หลัก
├── tailwind.config.js              # กำหนดโทนสีและเงา
├── postcss.config.js               # การตั้งค่า PostCSS
├── vite.config.js                  # ตั้งค่าโฮสต์ 0.0.0.0 และพอร์ต 3000
├── package.json                    # รายการ Dependencies (ติดตั้ง @supabase/supabase-js แล้ว)
├── state.md                        # บันทึกสถานะล่าสุดของโปรเจกต์
└── parking.txt                     # เอกสารสเปกหลัก (Single Source of Truth)
```

---

## 4. รายละเอียดฟังก์ชันการทำงานล่าสุด (Implemented Features)

### 4.1 หน้า Dashboard (View 1)
- **Header:** แสดงชื่อ "Smart Parking", สโลแกน "Monitor your parking area" และไฟสถานะสีเขียว "● System Online"
- **Desktop Navigation:** แสดงปุ่มนำทาง Home, Usage, Favorites, Account ด้านบนเมื่อเปิดบนคอมพิวเตอร์
- **Parking Overview:** สรุปจำนวนช่องจอดทั้งหมด 2 ช่อง (ว่าง 1, จอดอยู่ 1) พร้อมแถบสีแบ่งสัดส่วน
- **Parking Slots (2 ช่องจอด):**
  - **Slot 01:** สถานะ `● AVAILABLE`, ระยะ Ultrasonic 185 cm, เซนเซอร์ Online, ไฟจอด ON
  - **Slot 02:** สถานะ `● OCCUPIED`, ระยะ Ultrasonic 42 cm, เซนเซอร์ Online, ไฟจอด OFF
  - รองรับการคลิกปุ่ม **"Switch state"** เพื่อทดสอบจำลองเปลี่ยนสถานะระหว่างว่าง/จอดได้แบบ Real-time
  - รองรับการสลับสวิตช์ไฟ Parking Light (เปิดสีฟ้า / ปิดสีเทา)
- **System Status:** การ์ด 4 ใบแสดงสถานะ ESP32 (Online), Sensor 01 (Online), Sensor 02 (Online), และ Last Update (Just now)
- **Recent Activity:** บันทึกประวัติการเข้า-ออกของช่องจอด พร้อมเวลาสัมพัทธ์ (Relative time)

### 4.2 หน้า Usage / Analytics (View 2)
- แท็บเลือกช่วงเวลา: `1D`, `1W`, `1M` (ค่าเริ่มต้นเป็นสีฟ้า), `3M`, `1Y`
- กราฟเส้น SVG "Parking Occupancy" แสดงแนวโน้มการจอดตลอดทั้งวัน (12 AM ถึง 8 PM) พร้อมจุดเน้น 12:00 PM และ Tooltip
- ส่วน "Detail Device" แสดง Ultrasonic Sensor 01, Ultrasonic Sensor 02 และ ESP32 Controller พร้อมไอคอนวงกลมสีฟ้าและยอดการอัปเดต

### 4.3 หน้า System / Account (View 3)
- ข้อมูลระบบ: ESP32 Controller (Online), Ultrasonic Sensors (2/2 Online), Parking Slots (2), System Status (Operational)
- การ์ด Settings พร้อมสวิตช์ Toggle ทำงานได้จริง:
  - **Notifications** และ **Auto Refresh**
  - **Dark Mode:** เชื่อมต่อกับระบบธีมจริง สลับระหว่าง Light Mode และ Dark Mode ได้ทันที พร้อมบันทึกสถานะลงใน `localStorage` ให้จดจำธีมที่เลือกไว้
- **Header Quick Dark Mode:** เพิ่มปุ่มสลับธีม พระอาทิตย์/พระจันทร์ บนแถบ Header ให้กดสลับได้ทันทีจากทุกหน้า

### 4.4 หน้า Favorites
- รวมช่องจอดที่ปักหมุดไว้ พร้อมสวิตช์ควบคุมไฟและทดสอบสลับสถานะ

---

## 5. การปรับปรุงความเข้ากันได้และการแสดงผล (Responsive & Device Fixes)
1. **แก้ไขปัญหาบนหน้าจอคอมพิวเตอร์:**
   - ซ่อน Bottom Navigation บนหน้าจอขนาดกลางขึ้นไป (`md:hidden`) เพื่อไม่ให้แถบลอยขึ้นมาบังเนื้อหาด้านล่าง ทำให้สามารถเลื่อนลงสุดและคลิก UI ได้อย่างสมบูรณ์
   - เพิ่มแถบเมนูด้านบน Header สำหรับหน้าจอคอมพิวเตอร์
   - จัดวาง Grid 12 คอลัมน์บนจอคอม (ฝั่งซ้าย 8 ส่วน: Overview + 2 Slots, ฝั่งขวา 4 ส่วน: Status + Activity) ทำให้เนื้อหากระชับ ฟิตกับความสูงของหน้าจอ ไม่ต้องเลื่อนยาว
2. **การเข้าถึงผ่านอุปกรณ์มือถือ:**
   - ตั้งค่า Vite ให้ Bind กับ IP `0.0.0.0`
   - สามารถเปิดดูผ่านเบราว์เซอร์ของมือถือที่เชื่อมต่อ Wi-Fi เดียวกันได้ที่ URL: `http://192.168.1.176:3000`

---

## 6. ผลการทดสอบ (Verification & Build Status)
- คำสั่ง `npm run build`: สำเร็จ 100% ไม่มี Error หรือ Warning ค้างคา
- Vite HMR (Hot Module Replacement): อัปเดตและทำงานได้อย่างราบรื่น
