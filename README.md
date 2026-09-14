# 🚗 Smart Parking IoT Dashboard

A modern, responsive, and real-time Smart Parking management web application paired with ESP32 IoT ultrasonic distance sensors and Supabase.

---

## 🌟 Features

- **Real-Time Bay Monitoring:** Instant occupancy updates via Supabase Realtime WebSocket when a vehicle enters or leaves.
- **Hardware Integration:** Compatible with ESP32 and HC-SR04 ultrasonic distance sensors.
- **Lighting Control:** Toggle individual parking bay LED lights directly from the dashboard.
- **Dark Mode Support:** Clean light / dark mode toggle with persistent local storage.
- **Occupancy & Usage Analytics:** Interactive telemetry and historical charts.
- **Live Activity Feed:** Chronological log of bay status transitions.

---

## 🏗️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Realtime replication)
- **IoT Hardware:** ESP32 NodeMCU, HC-SR04 Ultrasonic Sensors, LEDs

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-username/smart-parking-iot.git
cd smart-parking-iot

# Install dependencies
npm install
```

### 3. Configure Supabase
1. Create a project at [supabase.com](https://supabase.com/).
2. In the Supabase **SQL Editor**, run the script from `supabase_schema.sql` to create the tables and default slots.
3. Make sure Realtime is enabled for `parking_slots` and `parking_activities` in **Database -> Replication**.
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Fill in your project URL and Anon key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 Hardware Setup (ESP32)

Open `arduino/smart_parking_esp32/smart_parking_esp32.ino` in Arduino IDE.

### Wiring Diagram
| Component | Pin on ESP32 |
| :--- | :--- |
| **Slot 1 Trig** | GPIO 5 |
| **Slot 1 Echo** | GPIO 18 |
| **Slot 1 LED** | GPIO 2 |
| **Slot 2 Trig** | GPIO 19 |
| **Slot 2 Echo** | GPIO 21 |
| **Slot 2 LED** | GPIO 4 |

Update your WiFi credentials and Supabase keys in `smart_parking_esp32.ino`, then flash the code to your ESP32.
