# Smart Parking IoT — ESP32 Hardware & Wiring Guide

คู่มือการต่อวงจรและการอัปโหลดโค้ด ESP32 สำหรับระบบ Smart Parking IoT 2 ช่องจอด เชื่อมต่อกับ Supabase Cloud

---

## 1. รายการอุปกรณ์ (Hardware BOM)
1. **บอร์ด ESP32:** NodeMCU-32S / ESP-WROOM-32 / ESP32 DevKit v1 (1 บอร์ด)
2. **เซนเซอร์ Ultrasonic (HC-SR04 หรือ HC-SR04P 3.3V-5V):** 2 ตัว
3. **หลอดไฟ LED หรือโมดูล Relay:** 2 ตัว (สำหรับไฟส่องสว่างช่องจอด 1 และ 2)
4. **ตัวต้านทาน 220Ω - 330Ω:** 2 ตัว (ต่ออนุกรมกับ LED)
5. **สายจัมเปอร์ (Jumper Wires) & Breadboard**

---

## 2. แผนผังการต่อขา (Wiring Pinout)

### ช่องจอดที่ 1 (Parking Slot 01)
| อุปกรณ์ | ขาของอุปกรณ์ | ต่อเข้าขา ESP32 | หมายเหตุ |
| :--- | :--- | :--- | :--- |
| **HC-SR04 #1** | VCC | 5V (หรือ VIN) | แนะนำใช้ไฟ 5V |
| | GND | GND | กราวด์ร่วม |
| | TRIG | **GPIO 5** | Trigger ส่งคลื่น |
| | ECHO | **GPIO 18** | Echo รับคลื่น |
| **LED ส่องสว่าง #1** | Anode (+) | **GPIO 2** | ไฟจอด Slot 1 |
| | Cathode (-) | GND (ผ่าน R 220Ω) | |
| **Green LED #1** | Anode (+) | **GPIO 16** | ไฟสถานะว่าง (Available) |
| | Cathode (-) | GND (ผ่าน R 220Ω) | |
| **Red LED #1** | Anode (+) | **GPIO 15** | ไฟสถานะไม่ว่าง (Occupied) |
| | Cathode (-) | GND (ผ่าน R 220Ω) | |

### ช่องจอดที่ 2 (Parking Slot 02)
| อุปกรณ์ | ขาของอุปกรณ์ | ต่อเข้าขา ESP32 | หมายเหตุ |
| :--- | :--- | :--- | :--- |
| **HC-SR04 #2** | VCC | 5V (หรือ VIN) | แนะนำใช้ไฟ 5V |
| | GND | GND | กราวด์ร่วม |
| | TRIG | **GPIO 19** | Trigger ส่งคลื่น |
| | ECHO | **GPIO 21** | Echo รับคลื่น |
| **LED ส่องสว่าง #2** | Anode (+) | **GPIO 4** | ไฟจอด Slot 2 |
| | Cathode (-) | GND (ผ่าน R 220Ω) | |
| **Green LED #2** | Anode (+) | **GPIO 22** | ไฟสถานะว่าง (Available) |
| | Cathode (-) | GND (ผ่าน R 220Ω) | |
| **Red LED #2** | Anode (+) | **GPIO 23** | ไฟสถานะไม่ว่าง (Occupied) |
| | Cathode (-) | GND (ผ่าน R 220Ω) | |

---

## 3. ไลบรารีที่ต้องติดตั้งใน Arduino IDE
1. เปิด **Arduino IDE**
2. ไปที่เมนู **Tools -> Manage Libraries...** (หรือกด `Ctrl + Shift + I`)
3. ค้นหาคำว่า **`ArduinoJson`** โดย **Benoit Blanchon**
4. กดคลิก **Install** (แนะนำเวอร์ชัน 6.x หรือ 7.x)

---

## 4. วิธีแก้ไขโค้ดและอัปโหลด
1. เปิดไฟล์ `smart_parking_esp32.ino` ใน Arduino IDE
2. แก้ไขชื่อและรหัสผ่าน Wi-Fi:
   ```cpp
   const char* WIFI_SSID     = "ชื่อไวไฟของคุณ";
   const char* WIFI_PASSWORD = "รหัสไวไฟของคุณ";
   ```
3. ใส่ Supabase URL และ Anon Key:
   ```cpp
   const char* SUPABASE_URL      = "https://your-project.supabase.co";
   const char* SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```
4. เลือก Board เป็น **DOIT ESP32 DEVKIT V1** (หรือรุ่นที่ใช้งาน) และเลือก Port ให้ถูกต้อง
5. กดปุ่ม **Upload** (ลูกศรขวา)
6. เปิด **Serial Monitor** ที่ความเร็ว **115200 baud** เพื่อดูสถานะการเชื่อมต่อและข้อมูลการส่งค่าไปยัง Supabase Realtime
