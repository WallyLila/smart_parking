/*
 * ==============================================================================
 * SMART PARKING IOT — ESP32 CONTROLLER WITH SUPABASE CLOUD INTEGRATION
 * ==============================================================================
 * 
 * Hardware Requirements:
 * - 1x ESP32 Development Board (ESP-WROOM-32 / DevKit v1)
 * - 2x HC-SR04 Ultrasonic Distance Sensors
 * - 2x LEDs (or Relay Modules) for Parking Slot 1 & 2 Indicator Lights
 * - Jumper wires & Breadboard / PCB
 * 
 * Required Arduino Libraries (Install via Arduino Library Manager):
 * 1. ArduinoJson by Benoit Blanchon (Version 6.x or 7.x)
 * 2. WiFi, HTTPClient, WiFiClientSecure (Built into ESP32 Arduino Core)
 * 
 * Pin Configuration:
 * - HC-SR04 Sensor 1 (Slot 1): TRIG = GPIO 5,  ECHO = GPIO 18
 * - HC-SR04 Sensor 2 (Slot 2): TRIG = GPIO 19, ECHO = GPIO 21
 * - Parking Light 1  (Slot 1): LED  = GPIO 2
 * - Parking Light 2  (Slot 2): LED  = GPIO 4
 * ==============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==============================================================================
// 1. NETWORK & SUPABASE CREDENTIALS (CHANGE THESE)
// ==============================================================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Supabase Project URL & Anon Key (Get from Supabase -> Project Settings -> API)
// Example: "https://abcdefghijklm.supabase.co" (DO NOT include trailing slash)
const char* SUPABASE_URL      = "https://YOUR_PROJECT_ID.supabase.co";
const char* SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// ==============================================================================
// 2. PIN DEFINITIONS & CONSTANTS
// ==============================================================================
// Slot 01 Pins
const int TRIG_PIN_1  = 5;
const int ECHO_PIN_1  = 18;
const int LIGHT_PIN_1 = 2;

// Slot 02 Pins
const int TRIG_PIN_2  = 19;
const int ECHO_PIN_2  = 21;
const int LIGHT_PIN_2 = 4;

// Distance Threshold in centimeters (Under 50cm means car is parked)
const int DISTANCE_THRESHOLD = 50;

// Maximum valid sensor range (cm)
const int MAX_SENSOR_DISTANCE = 400;

// Timing configuration (non-blocking with millis)
const unsigned long SENSOR_READ_INTERVAL = 2500;  // Read sensors every 2.5s
const unsigned long SYNC_LIGHT_INTERVAL  = 3000;  // Poll light toggles every 3.0s

unsigned long lastSensorReadTime = 0;
unsigned long lastLightSyncTime  = 0;

// Internal Slot State Tracking
struct SlotState {
  int id;
  int distance;
  String status;
  bool light;
  String previousStatus;
};

SlotState slot1 = { 1, 185, "available", false, "available" };
SlotState slot2 = { 2, 42,  "occupied",  false, "occupied"  };

// ==============================================================================
// 3. HELPER: MEASURE ULTRASONIC DISTANCE (HC-SR04)
// ==============================================================================
int readUltrasonicDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure pulse duration (timeout after 30ms ~ 5 meters)
  long duration = pulseIn(echoPin, HIGH, 30000);
  
  if (duration == 0) {
    return MAX_SENSOR_DISTANCE; // No echo received, assume empty bay
  }

  // Speed of sound: 343 m/s -> 0.0343 cm/microsecond -> divide by 2 for round-trip
  int distance = duration * 0.0343 / 2;

  if (distance > MAX_SENSOR_DISTANCE || distance <= 0) {
    return MAX_SENSOR_DISTANCE;
  }

  return distance;
}

// ==============================================================================
// 4. SUPABASE HTTP API FUNCTIONS
// ==============================================================================

// Update distance & status in Supabase (PATCH /rest/v1/parking_slots?id=eq.X)
void updateSlotInSupabase(SlotState &slot) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure(); // Skip certificate verification for ESP32 simplicity
  HTTPClient http;

  String endpoint = String(SUPABASE_URL) + "/rest/v1/parking_slots?id=eq." + String(slot.id);

  if (http.begin(client, endpoint)) {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
    http.addHeader("Prefer", "return=minimal");

    // Build JSON payload
    StaticJsonDocument<200> doc;
    doc["distance"] = slot.distance;
    doc["status"] = slot.status;
    doc["sensor"] = "online";

    String requestBody;
    serializeJson(doc, requestBody);

    int httpCode = http.PATCH(requestBody);

    if (httpCode >= 200 && httpCode < 300) {
      Serial.printf("[Supabase] Slot %d updated -> Status: %s, Distance: %d cm\n", slot.id, slot.status.c_str(), slot.distance);
    } else {
      Serial.printf("[Supabase] Failed to update Slot %d! HTTP code: %d\n", slot.id, httpCode);
    }

    http.end();
  }

  // If status changed, log to parking_activities table
  if (slot.status != slot.previousStatus) {
    logActivityToSupabase(slot.id, slot.status);
    slot.previousStatus = slot.status;
  }
}

// Log event to parking_activities table (POST /rest/v1/parking_activities)
void logActivityToSupabase(int slotId, String newStatus) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  String endpoint = String(SUPABASE_URL) + "/rest/v1/parking_activities";

  if (http.begin(client, endpoint)) {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
    http.addHeader("Prefer", "return=minimal");

    StaticJsonDocument<200> doc;
    doc["slot_id"] = slotId;
    doc["text"] = String("Slot 0") + String(slotId) + " became " + newStatus;
    doc["status"] = newStatus;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpCode = http.POST(requestBody);
    if (httpCode >= 200 && httpCode < 300) {
      Serial.printf("[Supabase] Activity logged for Slot %d (%s)\n", slotId, newStatus.c_str());
    }

    http.end();
  }
}

// Fetch parking light state from dashboard (GET /rest/v1/parking_slots?select=id,light)
void syncLightsFromSupabase() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  String endpoint = String(SUPABASE_URL) + "/rest/v1/parking_slots?select=id,light&order=id.asc";

  if (http.begin(client, endpoint)) {
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
      String response = http.getString();
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, response);

      if (!error && doc.is<JsonArray>()) {
        JsonArray array = doc.as<JsonArray>();
        for (JsonObject item : array) {
          int id = item["id"];
          bool light = item["light"];

          if (id == 1) {
            slot1.light = light;
            digitalWrite(LIGHT_PIN_1, light ? HIGH : LOW);
          } else if (id == 2) {
            slot2.light = light;
            digitalWrite(LIGHT_PIN_2, light ? HIGH : LOW);
          }
        }
      }
    }
    http.end();
  }
}

// ==============================================================================
// 5. SETUP
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=============================================");
  Serial.println("   SMART PARKING IOT — ESP32 INITIALIZING    ");
  Serial.println("=============================================");

  // Setup Pin Modes
  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);
  pinMode(LIGHT_PIN_1, OUTPUT);
  digitalWrite(LIGHT_PIN_1, LOW);

  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);
  pinMode(LIGHT_PIN_2, OUTPUT);
  digitalWrite(LIGHT_PIN_2, LOW);

  // Connect to Wi-Fi
  Serial.printf("Connecting to Wi-Fi SSID: %s ", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection failed. Will retry in loop.");
  }
}

// ==============================================================================
// 6. MAIN LOOP
// ==============================================================================
void loop() {
  // Ensure Wi-Fi stays connected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Disconnected! Reconnecting...");
    WiFi.reconnect();
    delay(2000);
    return;
  }

  unsigned long currentMillis = millis();

  // Task 1: Read Ultrasonic Sensors & Send to Supabase
  if (currentMillis - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    lastSensorReadTime = currentMillis;

    // --- Read Slot 01 ---
    int dist1 = readUltrasonicDistance(TRIG_PIN_1, ECHO_PIN_1);
    slot1.distance = dist1;
    slot1.status = (dist1 < DISTANCE_THRESHOLD) ? "occupied" : "available";
    updateSlotInSupabase(slot1);

    delay(60); // Small pause to prevent ultrasonic acoustic cross-talk

    // --- Read Slot 02 ---
    int dist2 = readUltrasonicDistance(TRIG_PIN_2, ECHO_PIN_2);
    slot2.distance = dist2;
    slot2.status = (dist2 < DISTANCE_THRESHOLD) ? "occupied" : "available";
    updateSlotInSupabase(slot2);
  }

  // Task 2: Poll Supabase for Parking Light Toggle commands from Dashboard
  if (currentMillis - lastLightSyncTime >= SYNC_LIGHT_INTERVAL) {
    lastLightSyncTime = currentMillis;
    syncLightsFromSupabase();
  }
}
