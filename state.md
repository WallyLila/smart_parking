# สถานะล่าสุดของโปรเจกต์ (Project State)

**บันทึกเมื่อเวลา:** 15 กันยายน 2026 เวลา 01:35:00 น. (+07:00)  
**ชื่อโปรเจกต์:** Smart Parking IoT Dashboard (`smart-parking-iot`)  
**โฟลเดอร์โปรเจกต์:** `E:\smart_parking`  
**แหล่งอ้างอิงหลัก (Source of Truth):** [parking.txt](file:///E:/smart_parking/parking.txt) และแบบอ้างอิงดีไซน์ [ref/ref.png](file:///E:/smart_parking/ref/ref.png) ตามข้อกำหนดใน [ref/ref.txt](file:///E:/smart_parking/ref/ref.txt)

---

## 1. ภาพรวมของระบบ (Project Overview)
โปรเจกต์นี้เป็นระบบ **Smart Parking IoT Dashboard** แบบ Full-Stack IoT ทำงานร่วมกันระหว่าง:
1. **Frontend Web Dashboard:** พัฒนาด้วย React 19 + Vite + Tailwind CSS สไตล์ Apple-like Minimalist Light Mode และรองรับ Dark Mode เต็มรูปแบบ
2. **Backend & Realtime Database:** ขับเคลื่อนด้วย [Supabase](https://supabase.com/) (PostgreSQL) ผ่านระบบ Realtime WebSocket ช่วยให้อัปเดตสถานะช่องจอดทันทีโดยไม่ต้องรีเฟรชหน้าจอ
3. **IoT Controller:** ซอร์สโค้ดสำหรับ ESP32 รองรับเซนเซอร์วัดระยะ Ultrasonic (HC-SR04) และไฟ LED แสดงสถานะประจำช่องจอด

---

## 2. ข้อมูลทางเทคนิคและสภาพแวดล้อม (Tech Stack & Environment)
- **Frontend Framework:** React 19
- **Bundler / Build Tool:** Vite 6.4.3
- **CSS Framework:** Tailwind CSS 3.4 + PostCSS
- **Icon Library:** Lucide React
- **Backend / Database:** Supabase (`@supabase/supabase-js` v2.97.0)
  - PostgreSQL Table: `parking_slots`, `parking_activities`
  - Realtime Replication: Postgres Changes Broadcast ผ่าน WebSocket
- **IoT Firmware:** Arduino C++ (ESP32 Dev Module)
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
│   │   ├── UsageChart.jsx          # กราฟสถิติการใช้งาน SVG แบบ Line Chart แท็บ 1D/1W/1M/3M/1Y
│   │   ├── DeviceList.jsx          # รายการอุปกรณ์ (Detail Device Telemetry)
│   │   └── Toggle.jsx              # สวิตช์ Toggle UI สวยงามสำหรับสลับสถานะ
│   ├── pages/
│   │   ├── Dashboard.jsx           # หน้าหลัก (View 1): จัดวาง Multi-column พอดีกับหน้าจอคอมพิวเตอร์
│   │   ├── Usage.jsx               # หน้าสถิติ (View 2): ดูกราฟแนวโน้มและรายละเอียดอุปกรณ์
│   │   ├── Account.jsx             # หน้าระบบ (View 3): ข้อมูลระบบและการตั้งค่า Toggle + สถานะ Supabase
│   │   └── Favorites.jsx           # หน้าช่องจอดที่บันทึกไว้ (Favorites)
│   ├── services/
│   │   ├── supabase.js             # Supabase Client Init พร้อมระบบ Auto-Sanitize URL ป้องกันบั๊ก /rest/v1/
│   │   └── parkingService.js       # ฟังก์ชันดึงข้อมูล ซิงค์สถานะ และ Realtime Subscriptions
│   ├── data/
│   │   └── mockData.js             # ข้อมูล Mock Data สำรองเมื่อไม่ได้เชื่อมต่อฐานข้อมูล
│   ├── App.jsx                     # จุดควบคุม State, Type-Safe ID Matching, Realtime Listeners
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
├── vite.config.js                  # ตั้งค่าโฮสต์ 0.0.0.0 และพอร์ต 3000
├── package.json                    # รายการ Dependencies
├── state.md                        # บันทึกสถานะล่าสุดของโปรเจกต์
└── parking.txt                     # เอกสารสเปกหลัก (Single Source of Truth)
```

---

## 4. สถานะระบบ Realtime & เกณฑ์การตรวจจับ (Logic & Thresholds)

### 4.1 เกณฑ์ระยะทางตรวจจับช่องจอด (Distance Threshold)
- **Threshold กำหนดไว้ที่:** `50 cm` (ในไฟล์ `smart_parking_esp32.ino`)
- **เงื่อนไข:**
  - 🔴 **ไม่ว่าง (`occupied`):** ระยะเซนเซอร์ **< 50 cm** (เช่น มีรถจอด วัดได้ ~42 cm)
  - 🟢 **ว่าง (`available`):** ระยะเซนเซอร์ **≥ 50 cm** (เช่น ไม่มีรถจอด วัดได้ ~185 cm)
- **สูตรในโค้ด:**
  ```cpp
  slot1.status = (dist1 < DISTANCE_THRESHOLD) ? "occupied" : "available";
  ```

### 4.2 การเชื่อมต่อ Supabase Realtime
- **สถานะ:** ใช้งานได้จริง 100% (Subscribed เรียบร้อย)
- **การแก้ไข URL:** ใน `.env` ปรับให้เหลือเฉพาะ Root Project URL (`https://kskcwaxvwcsxzijweoah.supabase.co`) และมีระบบ Auto-Sanitize ใน `supabase.js` เพื่อตัด `/rest/v1/` หรือเครื่องหมาย `/` ส่วนเกินออกให้อัตโนมัติ

---

## 5. คู่มือและข้อกำหนดสำหรับการนำขึ้น GitHub (GitHub Guidelines)

### 5.1 ไฟล์ที่ต้องอัปโหลดขึ้น GitHub (Whitelisted)
- โฟลเดอร์ `src/` (โค้ดเว็บทั้งหมด)
- ไฟล์ Config: `package.json`, `package-lock.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- โฟลเดอร์ `arduino/` (โค้ด ESP32 ทั้งหมด)
- ไฟล์ฐานข้อมูล: `supabase_schema.sql`
- ไฟล์เอกสาร: `README.md`, `state.md`, `parking.txt`, โฟลเดอร์ `ref/`
- ไฟล์ตัวอย่าง Config: `.env.example`, `.gitignore`

### 5.2 ไฟล์ที่ "ห้าม" อัปโหลดขึ้น GitHub เด็ดขาด (Blacklisted)
1. ❌ **`node_modules/`** : ไม่ต้องอัปโหลดเพราะมีขนาดใหญ่มาก ผู้อื่นสามารถรัน `npm install` เพื่อดาวน์โหลดได้ทันที
2. ❌ **`.env`** : **ห้ามอัปโหลดเด็ดขาด** เนื่องจากมี Supabase Project URL และ Anon Key จริง หากหลุดขึ้น Public Repo จะทำให้ฐานข้อมูลไม่ปลอดภัย
3. ❌ **`dist/`** : โฟลเดอร์ผลลัพธ์จากการ Build ซึ่งสร้างใหม่ได้เสมอด้วยคำสั่ง `npm run build`

> **หมายเหตุ:** Repository ในเครื่องได้รับการกำหนดค่า `.gitignore` และสั่ง `git rm -r --cached` เคลียร์ไฟล์ต้องห้ามข้างต้นออกจาก Git Tracking เรียบร้อยแล้ว (ไฟล์ในเครื่องยังอยู่ครบถ้วน)

---

## 6. ขั้นตอนการนำโปรเจกต์ขึ้น GitHub (Step-by-Step)

### วิธีการนำขึ้นครั้งแรก (Initial Push)

1. **สร้าง Repository ใหม่บน GitHub:**
   - ไปที่ [github.com/new](https://github.com/new)
   - ตั้งชื่อ Repository: เช่น `smart-parking-iot`
   - ตั้งค่าเป็น **Public** หรือ **Private** ตามต้องการ
   - **ไม่ต้องติ๊ก** "Add a README file" หรือ ".gitignore"
   - กดปุ่ม **Create repository**

2. **เปิด Terminal (PowerShell) ที่โฟลเดอร์ `E:\smart_parking` แล้วรันคำสั่ง:**

```bash
# 1. เปลี่ยนชื่อ Branch หลักให้เป็น main
git branch -M main

# 2. เชื่อมต่อไปยัง Repository ของคุณบน GitHub (แทนที่ USERNAME และ REPO_NAME ด้วยค่าจริงของคุณ)
git remote add origin https://github.com/<USERNAME>/<REPO_NAME>.git

# 3. อัปโหลดไฟล์ขึ้น GitHub
git push -u origin main
```

---

### ขั้นตอนการอัปเดตโค้ดขึ้น GitHub ในครั้งถัดไป (Subsequent Updates)

เมื่อมีการแก้ไขโค้ดและต้องการส่งการเปลี่ยนแปลงขึ้น GitHub:

```bash
# 1. ตรวจสอบไฟล์ที่เปลี่ยนแปลง
git status

# 2. เพิ่มไฟล์ที่แก้ไขเข้าสู่ Staging
git add .

# 3. บันทึก Commit พร้อมข้อความอธิบาย
git commit -m "feat: อธิบายสิ่งที่มีการเปลี่ยนแปลง"

# 4. Push ขึ้น GitHub
git push
```

---

## 7. ขั้นตอนสำหรับผู้ที่จะนำโปรเจกต์ไปรันต่อ (For Other Developers)

1. Clone โปรเจกต์ลงเครื่อง:
   ```bash
   git clone https://github.com/<USERNAME>/<REPO_NAME>.git
   cd <REPO_NAME>
   ```
2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
3. สร้างไฟล์ `.env` จาก `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. ใส่ URL และ Anon Key ของ Supabase ใน `.env`
5. เริ่มรันเว็บ:
   ```bash
   npm run dev
   ```
