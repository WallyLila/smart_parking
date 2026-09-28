/*
 * ==============================================================================
 * SMART PARKING IOT — ESP32 CONTROLLER WITH SUPABASE CLOUD INTEGRATION
 * ==============================================================================
 *
 * Hardware Requirements:
 * - 1x ESP32 Development Board (ESP-WROOM-32 / DevKit v1)
 * - 2x HC-SR04 Ultrasonic Distance Sensors
 * - 2x LEDs (or Relay Modules) for Parking Slot 1 & 2 Indicator Lights
 * - 2x LEDs for Slot 1 Status: Green (GPIO 16) / Red (GPIO 15)
 * - 2x LEDs for Slot 2 Status: Green (GPIO 22) / Red (GPIO 23)
 * - Jumper wires & Breadboard / PCB
 *
 * Pin Configuration:
 * - HC-SR04 Sensor 1 (Slot 1): TRIG = GPIO 5,  ECHO = GPIO 18
 * - HC-SR04 Sensor 2 (Slot 2): TRIG = GPIO 19, ECHO = GPIO 21
 * - Parking Light 1  (Slot 1): LED = GPIO 2
 * - Parking Light 2  (Slot 2): LED = GPIO 4
 *
 * - Slot 1 Green LED: GPIO 16
 * - Slot 1 Red LED:   GPIO 15
 * - Slot 2 Green LED: GPIO 22
 * - Slot 2 Red LED:   GPIO 23
 * ==============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==============================================================================
// 1. NETWORK & SUPABASE CREDENTIALS
// ==============================================================================

const char* WIFI_SSID     = "A05s";
const char* WIFI_PASSWORD = "00000000";

const char* SUPABASE_URL =
  "https://kskcwaxvwcsxzijweoah.supabase.co";

const char* SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtza2N3YXh2d2NzeHppandlb2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTMyMDcsImV4cCI6MjEwMzg4OTIwN30.jshtsoSp0CizXN9hUdhzhVKrf3YpfG-vgBSAnLqAVaw";

// ==============================================================================
// 2. PIN DEFINITIONS & CONSTANTS
// ==============================================================================

// Slot 01 Pins
const int TRIG_PIN_1  = 5;
const int ECHO_PIN_1  = 18;
const int LIGHT_PIN_1 = 2;

// Slot 01 Status LEDs
const int GREEN_LED_PIN_1 = 16;
const int RED_LED_PIN_1   = 15;

// Slot 02 Pins
const int TRIG_PIN_2  = 19;
const int ECHO_PIN_2  = 21;
const int LIGHT_PIN_2 = 4;

// Slot 02 Status LEDs
const int GREEN_LED_PIN_2 = 22;
const int RED_LED_PIN_2   = 23;

// Distance Threshold in centimeters
// Under 15cm means car is parked
const int DISTANCE_THRESHOLD = 15;

// Maximum valid sensor range (cm)
const int MAX_SENSOR_DISTANCE = 400;

// Timing configuration
const unsigned long SENSOR_READ_INTERVAL = 200;    // Fast sensor read every 200ms (real-time responsiveness)
const unsigned long SYNC_LIGHT_INTERVAL  = 4000;   // Poll dashboard light switch every 4s
const unsigned long HEARTBEAT_INTERVAL   = 30000;  // Periodic cloud sync every 30s
const int DEBOUNCE_THRESHOLD             = 2;      // 2 consecutive reads to confirm state change (~400ms)

unsigned long lastSensorReadTime = 0;
unsigned long lastLightSyncTime  = 0;
unsigned long lastHeartbeatTime  = 0;

int slot1DebounceCounter = 0;
String slot1PendingStatus = "available";

int slot2DebounceCounter = 0;
String slot2PendingStatus = "occupied";

bool initialSyncDone = false;

// ==============================================================================
// 3. INTERNAL SLOT STATE TRACKING
// ==============================================================================

struct SlotState {
  int id;
  int distance;
  String status;
  bool light;
  String sensor;
  String previousStatus;
};

SlotState slot1 = {
  1,
  185,
  "available",
  false,
  "online",
  "available"
};

SlotState slot2 = {
  2,
  42,
  "occupied",
  false,
  "online",
  "occupied"
};

// ==============================================================================
// 4. HELPER: MEASURE ULTRASONIC DISTANCE (HC-SR04)
// ==============================================================================

int readUltrasonicDistance(int trigPin, int echoPin) {

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);

  digitalWrite(trigPin, LOW);

  // Measure pulse duration
  // Timeout after 30ms
  long duration = pulseIn(echoPin, HIGH, 30000);

  // No echo received
  if (duration == 0) {
    return MAX_SENSOR_DISTANCE;
  }

  // Calculate distance in centimeters
  int distance = duration * 0.0343 / 2;

  // Check valid range
  if (distance > MAX_SENSOR_DISTANCE || distance <= 0) {
    return MAX_SENSOR_DISTANCE;
  }

  return distance;
}

// ==============================================================================
// 5. SLOT 1 STATUS LED CONTROL
// ==============================================================================
//
// When Parking Light is ON (slot1.light == true):
// - available: Green ON (GPIO 16), Red OFF (GPIO 15)
// - occupied:  Green OFF (GPIO 16), Red ON (GPIO 15)
//
// When Parking Light is OFF (slot1.light == false, commanded from Dashboard):
// - Both Green and Red LEDs are turned OFF
//
// ==============================================================================

void updateSlot1StatusLEDs() {

  // If Parking Light is toggled OFF from Dashboard, turn OFF Green & Red LEDs as well
  if (!slot1.light) {
    digitalWrite(GREEN_LED_PIN_1, LOW);
    digitalWrite(RED_LED_PIN_1, LOW);
    Serial.println("[LED] Slot 1 Light is OFF (from Dashboard) -> GREEN & RED OFF");
    return;
  }

  // When Parking Light is ON, display vacancy status
  if (slot1.status == "available") {

    // Slot is empty
    digitalWrite(GREEN_LED_PIN_1, HIGH);
    digitalWrite(RED_LED_PIN_1, LOW);

    Serial.println("[LED] Slot 1 AVAILABLE -> GREEN ON, RED OFF");

  }
  else if (slot1.status == "occupied") {

    // Slot has a car
    digitalWrite(GREEN_LED_PIN_1, LOW);
    digitalWrite(RED_LED_PIN_1, HIGH);

    Serial.println("[LED] Slot 1 OCCUPIED -> GREEN OFF, RED ON");

  }
}

// ==============================================================================
// 5.1 SLOT 2 STATUS LED CONTROL
// ==============================================================================
//
// When Parking Light is ON (slot2.light == true):
// - available: Green ON (GPIO 22), Red OFF (GPIO 23)
// - occupied:  Green OFF (GPIO 22), Red ON (GPIO 23)
//
// When Parking Light is OFF (slot2.light == false, commanded from Dashboard):
// - Both Green and Red LEDs are turned OFF
//
// ==============================================================================

void updateSlot2StatusLEDs() {

  // If Parking Light is toggled OFF from Dashboard, turn OFF Green & Red LEDs as well
  if (!slot2.light) {
    digitalWrite(GREEN_LED_PIN_2, LOW);
    digitalWrite(RED_LED_PIN_2, LOW);
    Serial.println("[LED] Slot 2 Light is OFF (from Dashboard) -> GREEN & RED OFF");
    return;
  }

  // When Parking Light is ON, display vacancy status
  if (slot2.status == "available") {

    // Slot is empty
    digitalWrite(GREEN_LED_PIN_2, HIGH);
    digitalWrite(RED_LED_PIN_2, LOW);

    Serial.println("[LED] Slot 2 AVAILABLE -> GREEN ON, RED OFF");

  }
  else if (slot2.status == "occupied") {

    // Slot has a car
    digitalWrite(GREEN_LED_PIN_2, LOW);
    digitalWrite(RED_LED_PIN_2, HIGH);

    Serial.println("[LED] Slot 2 OCCUPIED -> GREEN OFF, RED ON");

  }
}

// ==============================================================================
// 6. SUPABASE HTTP API FUNCTIONS
// ==============================================================================

// Update distance & status in Supabase
// PATCH /rest/v1/parking_slots?id=eq.X

void updateSlotInSupabase(SlotState &slot) {

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  String endpoint =
    String(SUPABASE_URL) +
    "/rest/v1/parking_slots?id=eq." +
    String(slot.id);

  if (http.begin(client, endpoint)) {

    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader(
      "Authorization",
      String("Bearer ") + SUPABASE_ANON_KEY
    );
    http.addHeader("Prefer", "return=minimal");

    // Build JSON payload
    StaticJsonDocument<200> doc;

    doc["distance"] = slot.distance;
    doc["status"] = slot.status;
    doc["sensor"] = slot.sensor;

    String requestBody;

    serializeJson(doc, requestBody);

    int httpCode = http.PATCH(requestBody);

    if (httpCode >= 200 && httpCode < 300) {

      Serial.printf(
        "[Supabase] Slot %d updated -> Status: %s, Distance: %d cm\n",
        slot.id,
        slot.status.c_str(),
        slot.distance
      );

    }
    else {

      Serial.printf(
        "[Supabase] Failed to update Slot %d! HTTP code: %d\n",
        slot.id,
        httpCode
      );

    }

    http.end();
  }

  // If status changed, log to parking_activities table

  if (slot.status != slot.previousStatus) {

    logActivityToSupabase(
      slot.id,
      slot.status
    );

    slot.previousStatus = slot.status;
  }
}

// ==============================================================================
// 7. LOG ACTIVITY TO SUPABASE
// ==============================================================================

// POST /rest/v1/parking_activities

void logActivityToSupabase(int slotId, String newStatus) {

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  String endpoint =
    String(SUPABASE_URL) +
    "/rest/v1/parking_activities";

  if (http.begin(client, endpoint)) {

    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON_KEY);

    http.addHeader(
      "Authorization",
      String("Bearer ") + SUPABASE_ANON_KEY
    );

    http.addHeader("Prefer", "return=minimal");

    StaticJsonDocument<200> doc;

    doc["slot_id"] = slotId;

    doc["text"] =
      String("Slot 0") +
      String(slotId) +
      " became " +
      newStatus;

    doc["status"] = newStatus;

    String requestBody;

    serializeJson(doc, requestBody);

    int httpCode = http.POST(requestBody);

    if (httpCode >= 200 && httpCode < 300) {

      Serial.printf(
        "[Supabase] Activity logged for Slot %d (%s)\n",
        slotId,
        newStatus.c_str()
      );

    }

    http.end();
  }
}

// ==============================================================================
// 8. FETCH PARKING LIGHT STATE FROM DASHBOARD
// ==============================================================================

// GET /rest/v1/parking_slots?select=id,light

void syncLightsFromSupabase() {

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  String endpoint =
    String(SUPABASE_URL) +
    "/rest/v1/parking_slots?select=id,light,sensor&order=id.asc";

  if (http.begin(client, endpoint)) {

    http.addHeader("apikey", SUPABASE_ANON_KEY);

    http.addHeader(
      "Authorization",
      String("Bearer ") + SUPABASE_ANON_KEY
    );

    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {

      String response = http.getString();

      StaticJsonDocument<512> doc;

      DeserializationError error =
        deserializeJson(doc, response);

      if (!error && doc.is<JsonArray>()) {

        JsonArray array = doc.as<JsonArray>();

        for (JsonObject item : array) {

          int id = item["id"];
          bool light = item["light"];
          const char* sensorStr = item["sensor"] | "online";

          if (id == 1) {

            slot1.light = light;
            slot1.sensor = String(sensorStr);

            digitalWrite(
              LIGHT_PIN_1,
              light ? HIGH : LOW
            );

            // Immediately update green & red status LEDs based on light switch
            updateSlot1StatusLEDs();

          }

          else if (id == 2) {

            slot2.light = light;
            slot2.sensor = String(sensorStr);

            digitalWrite(
              LIGHT_PIN_2,
              light ? HIGH : LOW
            );

            // Immediately update green & red status LEDs based on light switch
            updateSlot2StatusLEDs();

          }
        }
      }
    }

    http.end();
  }
}

// ==============================================================================
// 9. SETUP
// ==============================================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println(
    "\n============================================="
  );

  Serial.println(
    "   SMART PARKING IOT — ESP32 INITIALIZING"
  );

  Serial.println(
    "============================================="
  );

  // --------------------------------------------------------------------------
  // Setup Ultrasonic Sensor 1
  // --------------------------------------------------------------------------

  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);

  // --------------------------------------------------------------------------
  // Setup Original Parking Light 1
  // --------------------------------------------------------------------------

  pinMode(LIGHT_PIN_1, OUTPUT);

  digitalWrite(
    LIGHT_PIN_1,
    LOW
  );

  // --------------------------------------------------------------------------
  // Setup Slot 1 Status LEDs
  // --------------------------------------------------------------------------

  pinMode(
    GREEN_LED_PIN_1,
    OUTPUT
  );

  pinMode(
    RED_LED_PIN_1,
    OUTPUT
  );

  // Initially turn both status LEDs OFF
  digitalWrite(
    GREEN_LED_PIN_1,
    LOW
  );

  digitalWrite(
    RED_LED_PIN_1,
    LOW
  );

  // --------------------------------------------------------------------------
  // Setup Ultrasonic Sensor 2
  // --------------------------------------------------------------------------

  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);

  // --------------------------------------------------------------------------
  // Setup Original Parking Light 2
  // --------------------------------------------------------------------------

  pinMode(LIGHT_PIN_2, OUTPUT);

  digitalWrite(
    LIGHT_PIN_2,
    LOW
  );

  // --------------------------------------------------------------------------
  // Setup Slot 2 Status LEDs
  // --------------------------------------------------------------------------

  pinMode(
    GREEN_LED_PIN_2,
    OUTPUT
  );

  pinMode(
    RED_LED_PIN_2,
    OUTPUT
  );

  // Initially turn both status LEDs OFF
  digitalWrite(
    GREEN_LED_PIN_2,
    LOW
  );

  digitalWrite(
    RED_LED_PIN_2,
    LOW
  );

  // --------------------------------------------------------------------------
  // Connect to Wi-Fi
  // --------------------------------------------------------------------------

  Serial.printf(
    "Connecting to Wi-Fi SSID: %s ",
    WIFI_SSID
  );

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  int attempts = 0;

  while (
    WiFi.status() != WL_CONNECTED &&
    attempts < 25
  ) {

    delay(500);

    Serial.print(".");

    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println(
      "\n[WiFi] Connected successfully!"
    );

    Serial.print(
      "[WiFi] IP Address: "
    );

    Serial.println(
      WiFi.localIP()
    );

    // Initial sync of light states from Supabase on startup
    syncLightsFromSupabase();

  }
  else {

    Serial.println(
      "\n[WiFi] Connection failed. Will retry in loop."
    );
  }
}

// ==============================================================================
// 10. MAIN LOOP
// ==============================================================================

void loop() {

  unsigned long currentMillis = millis();

  // --------------------------------------------------------------------------
  // Ensure Wi-Fi stays connected (Non-blocking: local sensors stay active)
  // --------------------------------------------------------------------------

  static unsigned long lastWifiReconnectAttempt = 0;
  if (WiFi.status() != WL_CONNECTED) {
    if (currentMillis - lastWifiReconnectAttempt >= 5000) {
      lastWifiReconnectAttempt = currentMillis;
      Serial.println("[WiFi] Disconnected! Attempting reconnect in background...");
      WiFi.reconnect();
    }
  }

  // ==========================================================================
  // TASK 1: FAST REAL-TIME SENSOR READING & IMMEDIATE LED FEEDBACK
  // ==========================================================================

  if (currentMillis - lastSensorReadTime >= SENSOR_READ_INTERVAL) {

    lastSensorReadTime = currentMillis;

    // ------------------------------------------------------------------------
    // Read Slot 01
    // ------------------------------------------------------------------------

    if (slot1.sensor != "disabled") {
      int dist1 = readUltrasonicDistance(TRIG_PIN_1, ECHO_PIN_1);
      slot1.distance = dist1;

      // Determine parking status with debounce
      String rawStatus1 = (dist1 < DISTANCE_THRESHOLD) ? "occupied" : "available";

      if (rawStatus1 != slot1.status) {
        if (rawStatus1 == slot1PendingStatus) {
          slot1DebounceCounter++;
          if (slot1DebounceCounter >= DEBOUNCE_THRESHOLD) {
            slot1.status = rawStatus1;
            slot1DebounceCounter = 0;
            // Update physical LED immediately (zero lag for drivers)
            updateSlot1StatusLEDs();
          }
        } else {
          slot1PendingStatus = rawStatus1;
          slot1DebounceCounter = 1;
        }
      } else {
        slot1PendingStatus = slot1.status;
        slot1DebounceCounter = 0;
      }
    } else if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
      Serial.println("[Sensor] Slot 1 Ultrasonic is DISABLED via AI command (monitoring paused)");
    }

    // Short pause between ultrasonic sensors to prevent acoustic echo interference
    delay(40);

    // ------------------------------------------------------------------------
    // Read Slot 02
    // ------------------------------------------------------------------------

    if (slot2.sensor != "disabled") {
      int dist2 = readUltrasonicDistance(TRIG_PIN_2, ECHO_PIN_2);
      slot2.distance = dist2;

      // Determine parking status with debounce
      String rawStatus2 = (dist2 < DISTANCE_THRESHOLD) ? "occupied" : "available";

      if (rawStatus2 != slot2.status) {
        if (rawStatus2 == slot2PendingStatus) {
          slot2DebounceCounter++;
          if (slot2DebounceCounter >= DEBOUNCE_THRESHOLD) {
            slot2.status = rawStatus2;
            slot2DebounceCounter = 0;
            // Update physical LED immediately (zero lag for drivers)
            updateSlot2StatusLEDs();
          }
        } else {
          slot2PendingStatus = rawStatus2;
          slot2DebounceCounter = 1;
        }
      } else {
        slot2PendingStatus = slot2.status;
        slot2DebounceCounter = 0;
      }
    } else if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
      Serial.println("[Sensor] Slot 2 Ultrasonic is DISABLED via AI command (monitoring paused)");
    }

    // ------------------------------------------------------------------------
    // CLOUD SYNC: Send to Supabase ONLY when Status Changes or on Heartbeat
    // ------------------------------------------------------------------------

    bool isHeartbeat = (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL) || !initialSyncDone;

    bool slot1Changed = (slot1.status != slot1.previousStatus);
    bool slot2Changed = (slot2.status != slot2.previousStatus);

    if (slot1Changed || isHeartbeat) {
      if (slot1.sensor != "disabled") {
        updateSlotInSupabase(slot1);
      }
    }

    if (slot2Changed || isHeartbeat) {
      if (slot2.sensor != "disabled") {
        updateSlotInSupabase(slot2);
      }
    }

    if (isHeartbeat) {
      lastHeartbeatTime = currentMillis;
      if (!initialSyncDone) {
        initialSyncDone = true;
        updateSlot1StatusLEDs();
        updateSlot2StatusLEDs();
      }
    }
  }

  // ==========================================================================
  // TASK 2: POLL SUPABASE FOR PARKING LIGHT TOGGLE COMMANDS
  // ==========================================================================

  if (currentMillis - lastLightSyncTime >= SYNC_LIGHT_INTERVAL) {

    lastLightSyncTime = currentMillis;

    syncLightsFromSupabase();
  }
}