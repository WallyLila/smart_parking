/*
 * ==============================================================================
 * SMART PARKING IOT — ESP32 CONTROLLER WITH SUPABASE CLOUD INTEGRATION
 * REDUCED DELAY / NON-BLOCKING IMPROVEMENTS
 * ==============================================================================
 *
 * Hardware Requirements:
 * - 1x ESP32 Development Board
 * - 2x HC-SR04 Ultrasonic Distance Sensors
 * - 2x Parking Light LEDs
 * - 2x LEDs for Slot 1 Status: Green / Red
 * - 2x LEDs for Slot 2 Status: Green / Red
 *
 * Pin Configuration:
 * - HC-SR04 Sensor 1: TRIG = GPIO 5,  ECHO = GPIO 18
 * - HC-SR04 Sensor 2: TRIG = GPIO 19, ECHO = GPIO 21
 *
 * - Parking Light 1: GPIO 2
 * - Parking Light 2: GPIO 4
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
// 2. PIN DEFINITIONS
// ==============================================================================

// Slot 1
const int TRIG_PIN_1      = 5;
const int ECHO_PIN_1      = 18;
const int LIGHT_PIN_1     = 2;
const int GREEN_LED_PIN_1 = 16;
const int RED_LED_PIN_1   = 15;

// Slot 2
const int TRIG_PIN_2      = 19;
const int ECHO_PIN_2      = 21;
const int LIGHT_PIN_2     = 4;
const int GREEN_LED_PIN_2 = 22;
const int RED_LED_PIN_2   = 23;

// ==============================================================================
// 3. CONSTANTS
// ==============================================================================

// Under this distance = occupied
const int DISTANCE_THRESHOLD = 15;

// Maximum valid HC-SR04 distance
const int MAX_SENSOR_DISTANCE = 400;

// Sensor interval
const unsigned long SENSOR_READ_INTERVAL = 2500;

// Dashboard light sync interval
const unsigned long SYNC_LIGHT_INTERVAL = 3000;

// HC-SR04 timeout
// Reduced from 30ms to 20ms
const unsigned long ULTRASONIC_TIMEOUT = 20000;

// HTTP timeout
// Prevent ESP32 from waiting too long for Supabase
const unsigned long HTTP_TIMEOUT = 1500;

// ==============================================================================
// 4. TIMERS
// ==============================================================================

unsigned long lastSensorReadTime = 0;
unsigned long lastLightSyncTime  = 0;

// ==============================================================================
// 5. SLOT STATE
// ==============================================================================

struct SlotState {

  int id;

  int distance;

  String status;

  bool light;

  String previousStatus;
};

SlotState slot1 = {
  1,
  185,
  "available",
  false,
  "available"
};

SlotState slot2 = {
  2,
  42,
  "occupied",
  false,
  "occupied"
};

// ==============================================================================
// 6. ULTRASONIC SENSOR
// ==============================================================================

int readUltrasonicDistance(int trigPin, int echoPin) {

  // Make sure trigger starts LOW
  digitalWrite(trigPin, LOW);

  delayMicroseconds(2);

  // Send 10us trigger pulse
  digitalWrite(trigPin, HIGH);

  delayMicroseconds(10);

  digitalWrite(trigPin, LOW);

  // Wait for echo
  unsigned long duration =
    pulseIn(
      echoPin,
      HIGH,
      ULTRASONIC_TIMEOUT
    );

  // No echo received
  if (duration == 0) {

    Serial.println("[Sensor] No echo received");

    return MAX_SENSOR_DISTANCE;
  }

  // Calculate distance
  int distance =
    duration * 0.0343 / 2;

  // Validate distance
  if (
    distance <= 0 ||
    distance > MAX_SENSOR_DISTANCE
  ) {

    return MAX_SENSOR_DISTANCE;
  }

  return distance;
}

// ==============================================================================
// 7. SLOT 1 STATUS LED
// ==============================================================================

void updateSlot1StatusLEDs() {

  // Dashboard turned parking light OFF
  if (!slot1.light) {

    digitalWrite(
      GREEN_LED_PIN_1,
      LOW
    );

    digitalWrite(
      RED_LED_PIN_1,
      LOW
    );

    return;
  }

  // Slot available
  if (slot1.status == "available") {

    digitalWrite(
      GREEN_LED_PIN_1,
      HIGH
    );

    digitalWrite(
      RED_LED_PIN_1,
      LOW
    );
  }

  // Slot occupied
  else if (slot1.status == "occupied") {

    digitalWrite(
      GREEN_LED_PIN_1,
      LOW
    );

    digitalWrite(
      RED_LED_PIN_1,
      HIGH
    );
  }
}

// ==============================================================================
// 8. SLOT 2 STATUS LED
// ==============================================================================

void updateSlot2StatusLEDs() {

  // Dashboard turned parking light OFF
  if (!slot2.light) {

    digitalWrite(
      GREEN_LED_PIN_2,
      LOW
    );

    digitalWrite(
      RED_LED_PIN_2,
      LOW
    );

    return;
  }

  // Slot available
  if (slot2.status == "available") {

    digitalWrite(
      GREEN_LED_PIN_2,
      HIGH
    );

    digitalWrite(
      RED_LED_PIN_2,
      LOW
    );
  }

  // Slot occupied
  else if (slot2.status == "occupied") {

    digitalWrite(
      GREEN_LED_PIN_2,
      LOW
    );

    digitalWrite(
      RED_LED_PIN_2,
      HIGH
    );
  }
}

// ==============================================================================
// 9. LOG ACTIVITY TO SUPABASE
// ==============================================================================

void logActivityToSupabase(
  int slotId,
  String newStatus
) {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println(
      "[Activity] WiFi not connected"
    );

    return;
  }

  WiFiClientSecure client;

  client.setInsecure();

  HTTPClient http;

  String endpoint =
    String(SUPABASE_URL) +
    "/rest/v1/parking_activities";

  if (!http.begin(client, endpoint)) {

    Serial.println(
      "[Activity] HTTP begin failed"
    );

    return;
  }

  // IMPORTANT:
  // Prevent long blocking network requests
  http.setTimeout(HTTP_TIMEOUT);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  http.addHeader(
    "apikey",
    SUPABASE_ANON_KEY
  );

  http.addHeader(
    "Authorization",
    String("Bearer ") +
    SUPABASE_ANON_KEY
  );

  http.addHeader(
    "Prefer",
    "return=minimal"
  );

  StaticJsonDocument<200> doc;

  doc["slot_id"] = slotId;

  doc["text"] =
    String("Slot 0") +
    String(slotId) +
    " became " +
    newStatus;

  doc["status"] = newStatus;

  String requestBody;

  serializeJson(
    doc,
    requestBody
  );

  Serial.printf(
    "[Activity] Sending Slot %d activity...\n",
    slotId
  );

  int httpCode =
    http.POST(requestBody);

  if (
    httpCode >= 200 &&
    httpCode < 300
  ) {

    Serial.printf(
      "[Activity] Slot %d logged successfully\n",
      slotId
    );
  }
  else {

    Serial.printf(
      "[Activity] Failed. HTTP code: %d\n",
      httpCode
    );
  }

  http.end();
}

// ==============================================================================
// 10. UPDATE SLOT DATA TO SUPABASE
// ==============================================================================

void updateSlotInSupabase(
  SlotState &slot
) {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println(
      "[Supabase] WiFi not connected"
    );

    return;
  }

  WiFiClientSecure client;

  client.setInsecure();

  HTTPClient http;

  String endpoint =
    String(SUPABASE_URL) +
    "/rest/v1/parking_slots?id=eq." +
    String(slot.id);

  if (!http.begin(client, endpoint)) {

    Serial.printf(
      "[Supabase] HTTP begin failed for Slot %d\n",
      slot.id
    );

    return;
  }

  // IMPORTANT
  // Limit network waiting time
  http.setTimeout(HTTP_TIMEOUT);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  http.addHeader(
    "apikey",
    SUPABASE_ANON_KEY
  );

  http.addHeader(
    "Authorization",
    String("Bearer ") +
    SUPABASE_ANON_KEY
  );

  http.addHeader(
    "Prefer",
    "return=minimal"
  );

  StaticJsonDocument<200> doc;

  doc["distance"] = slot.distance;

  doc["status"] = slot.status;

  doc["sensor"] = "online";

  String requestBody;

  serializeJson(
    doc,
    requestBody
  );

  Serial.printf(
    "[Supabase] Updating Slot %d...\n",
    slot.id
  );

  int httpCode =
    http.PATCH(requestBody);

  if (
    httpCode >= 200 &&
    httpCode < 300
  ) {

    Serial.printf(
      "[Supabase] Slot %d updated -> %s, %d cm\n",
      slot.id,
      slot.status.c_str(),
      slot.distance
    );
  }
  else {

    Serial.printf(
      "[Supabase] Slot %d update failed. HTTP: %d\n",
      slot.id,
      httpCode
    );
  }

  http.end();

  // ============================================================================
  // LOG STATUS CHANGE
  // ============================================================================

  if (
    slot.status !=
    slot.previousStatus
  ) {

    logActivityToSupabase(
      slot.id,
      slot.status
    );

    slot.previousStatus =
      slot.status;
  }
}

// ==============================================================================
// 11. SYNC LIGHT COMMANDS FROM SUPABASE
// ==============================================================================

void syncLightsFromSupabase() {

  if (WiFi.status() != WL_CONNECTED) {

    return;
  }

  WiFiClientSecure client;

  client.setInsecure();

  HTTPClient http;

  String endpoint =
    String(SUPABASE_URL) +
    "/rest/v1/parking_slots?select=id,light&order=id.asc";

  if (!http.begin(client, endpoint)) {

    Serial.println(
      "[Light Sync] HTTP begin failed"
    );

    return;
  }

  // IMPORTANT
  // Prevent GET from blocking too long
  http.setTimeout(HTTP_TIMEOUT);

  http.addHeader(
    "apikey",
    SUPABASE_ANON_KEY
  );

  http.addHeader(
    "Authorization",
    String("Bearer ") +
    SUPABASE_ANON_KEY
  );

  Serial.println(
    "[Light Sync] Checking dashboard..."
  );

  int httpCode =
    http.GET();

  if (httpCode == HTTP_CODE_OK) {

    String response =
      http.getString();

    StaticJsonDocument<512> doc;

    DeserializationError error =
      deserializeJson(
        doc,
        response
      );

    if (!error && doc.is<JsonArray>()) {

      JsonArray array =
        doc.as<JsonArray>();

      for (
        JsonObject item :
        array
      ) {

        int id =
          item["id"];

        bool light =
          item["light"];

        // ======================================================================
        // SLOT 1
        // ======================================================================

        if (id == 1) {

          // Only update if changed
          if (slot1.light != light) {

            slot1.light =
              light;

            digitalWrite(
              LIGHT_PIN_1,
              light ? HIGH : LOW
            );

            updateSlot1StatusLEDs();

            Serial.printf(
              "[Light] Slot 1 -> %s\n",
              light ? "ON" : "OFF"
            );
          }
        }

        // ======================================================================
        // SLOT 2
        // ======================================================================

        else if (id == 2) {

          // Only update if changed
          if (slot2.light != light) {

            slot2.light =
              light;

            digitalWrite(
              LIGHT_PIN_2,
              light ? HIGH : LOW
            );

            updateSlot2StatusLEDs();

            Serial.printf(
              "[Light] Slot 2 -> %s\n",
              light ? "ON" : "OFF"
            );
          }
        }
      }
    }
    else {

      Serial.println(
        "[Light Sync] JSON parse failed"
      );
    }
  }
  else {

    Serial.printf(
      "[Light Sync] HTTP error: %d\n",
      httpCode
    );
  }

  http.end();
}

// ==============================================================================
// 12. SETUP
// ==============================================================================

void setup() {

  Serial.begin(115200);

  delay(500);

  Serial.println();
  Serial.println(
    "============================================="
  );

  Serial.println(
    " SMART PARKING IoT — ESP32"
  );

  Serial.println(
    " Reduced Delay Version"
  );

  Serial.println(
    "============================================="
  );

  // ============================================================================
  // SENSOR 1
  // ============================================================================

  pinMode(
    TRIG_PIN_1,
    OUTPUT
  );

  pinMode(
    ECHO_PIN_1,
    INPUT
  );

  // ============================================================================
  // LIGHT 1
  // ============================================================================

  pinMode(
    LIGHT_PIN_1,
    OUTPUT
  );

  digitalWrite(
    LIGHT_PIN_1,
    LOW
  );

  // ============================================================================
  // STATUS LED 1
  // ============================================================================

  pinMode(
    GREEN_LED_PIN_1,
    OUTPUT
  );

  pinMode(
    RED_LED_PIN_1,
    OUTPUT
  );

  digitalWrite(
    GREEN_LED_PIN_1,
    LOW
  );

  digitalWrite(
    RED_LED_PIN_1,
    LOW
  );

  // ============================================================================
  // SENSOR 2
  // ============================================================================

  pinMode(
    TRIG_PIN_2,
    OUTPUT
  );

  pinMode(
    ECHO_PIN_2,
    INPUT
  );

  // ============================================================================
  // LIGHT 2
  // ============================================================================

  pinMode(
    LIGHT_PIN_2,
    OUTPUT
  );

  digitalWrite(
    LIGHT_PIN_2,
    LOW
  );

  // ============================================================================
  // STATUS LED 2
  // ============================================================================

  pinMode(
    GREEN_LED_PIN_2,
    OUTPUT
  );

  pinMode(
    RED_LED_PIN_2,
    OUTPUT
  );

  digitalWrite(
    GREEN_LED_PIN_2,
    LOW
  );

  digitalWrite(
    RED_LED_PIN_2,
    LOW
  );

  // ============================================================================
  // WIFI
  // ============================================================================

  Serial.printf(
    "Connecting to Wi-Fi: %s ",
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

  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    Serial.println();

    Serial.println(
      "[WiFi] Connected!"
    );

    Serial.print(
      "[WiFi] IP: "
    );

    Serial.println(
      WiFi.localIP()
    );

    // Initial dashboard sync
    syncLightsFromSupabase();
  }
  else {

    Serial.println();

    Serial.println(
      "[WiFi] Initial connection failed"
    );
  }

  // Start timers immediately
  lastSensorReadTime =
    millis();

  lastLightSyncTime =
    millis();
}

// ==============================================================================
// 13. MAIN LOOP
// ==============================================================================

void loop() {

  // ============================================================================
  // WIFI CONNECTION CHECK
  // ============================================================================

  if (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    Serial.println(
      "[WiFi] Disconnected! Reconnecting..."
    );

    WiFi.reconnect();

    // Do NOT wait 2 seconds here
    // Keep loop responsive

    return;
  }

  unsigned long currentMillis =
    millis();

  // ============================================================================
  // TASK 1
  // READ BOTH ULTRASONIC SENSORS
  // ============================================================================

  if (
    currentMillis -
    lastSensorReadTime
    >= SENSOR_READ_INTERVAL
  ) {

    lastSensorReadTime =
      currentMillis;

    Serial.println();
    Serial.println(
      "----------- SENSOR UPDATE -----------"
    );

    // ========================================================================
    // SLOT 1 SENSOR
    // ========================================================================

    int dist1 =
      readUltrasonicDistance(
        TRIG_PIN_1,
        ECHO_PIN_1
      );

    slot1.distance =
      dist1;

    slot1.status =
      (
        dist1 < DISTANCE_THRESHOLD
      )
      ? "occupied"
      : "available";

    // LED reacts immediately
    updateSlot1StatusLEDs();

    Serial.printf(
      "[Slot 1] %d cm -> %s\n",
      dist1,
      slot1.status.c_str()
    );

    // ========================================================================
    // Small separation between ultrasonic sensors
    // ========================================================================

    delay(40);

    // ========================================================================
    // SLOT 2 SENSOR
    // ========================================================================

    int dist2 =
      readUltrasonicDistance(
        TRIG_PIN_2,
        ECHO_PIN_2
      );

    slot2.distance =
      dist2;

    slot2.status =
      (
        dist2 < DISTANCE_THRESHOLD
      )
      ? "occupied"
      : "available";

    // LED reacts immediately
    updateSlot2StatusLEDs();

    Serial.printf(
      "[Slot 2] %d cm -> %s\n",
      dist2,
      slot2.status.c_str()
    );

    // ========================================================================
    // SEND DATA TO SUPABASE
    // ========================================================================

    updateSlotInSupabase(
      slot1
    );

    updateSlotInSupabase(
      slot2
    );

    Serial.println(
      "-------------------------------------"
    );
  }

  // ============================================================================
  // TASK 2
  // SYNC LIGHT STATE FROM DASHBOARD
  // ============================================================================

  if (
    currentMillis -
    lastLightSyncTime
    >= SYNC_LIGHT_INTERVAL
  ) {

    lastLightSyncTime =
      currentMillis;

    syncLightsFromSupabase();
  }
}
