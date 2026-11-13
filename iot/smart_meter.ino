/*
 * Blockchain-Enabled Energy Trading System
 * IoT Smart Meter Firmware — Arduino / ESP32
 *
 * Reads energy production/consumption from sensors, publishes data to an
 * MQTT broker, and can trigger on-chain minting via a relay server.
 *
 * Hardware:
 *   - ESP32 DevKit v1
 *   - ACS712 Current Sensor (analog pin)
 *   - DHT22 Temperature & Humidity Sensor
 *   - BH1750 Light Sensor (I2C)
 *
 * Dependencies (install via Arduino Library Manager):
 *   - WiFi (built-in for ESP32)
 *   - PubSubClient (MQTT)
 *   - DHT sensor library
 *   - BH1750
 *   - ArduinoJson
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include <ArduinoJson.h>

// ──────────────────────────────────────────────
//  Configuration — edit these for your setup
// ──────────────────────────────────────────────

// Wi-Fi
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT Broker
const char* MQTT_SERVER   = "YOUR_MQTT_BROKER_IP";
const int   MQTT_PORT     = 1883;
const char* MQTT_USER     = "YOUR_MQTT_USER";
const char* MQTT_PASS     = "YOUR_MQTT_PASS";
const char* MQTT_TOPIC    = "energy/meter/data";

// Sensor Pins
#define DHT_PIN       4
#define DHT_TYPE      DHT22
#define ACS712_PIN    34    // Analog input for current sensor
#define VOLTAGE       230.0 // Grid voltage (V)

// Meter identity
const char* METER_ID = "METER_001";

// Publish interval (ms)
const unsigned long PUBLISH_INTERVAL = 5000; // 5 seconds

// ──────────────────────────────────────────────
//  Globals
// ──────────────────────────────────────────────

WiFiClient   wifiClient;
PubSubClient mqttClient(wifiClient);
DHT          dht(DHT_PIN, DHT_TYPE);
BH1750       lightMeter;

unsigned long lastPublish = 0;
float         cumulativeEnergy_kWh = 0.0;

// ──────────────────────────────────────────────
//  Setup
// ──────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  Serial.println("\n═══════════════════════════════════════");
  Serial.println("  Energy Trading — Smart Meter v1.0");
  Serial.println("═══════════════════════════════════════\n");

  // Initialize sensors
  dht.begin();
  Wire.begin();
  lightMeter.begin();
  analogReadResolution(12); // 12-bit ADC on ESP32

  // Connect to Wi-Fi
  connectWiFi();

  // Configure MQTT
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  connectMQTT();
}

// ──────────────────────────────────────────────
//  Main Loop
// ──────────────────────────────────────────────

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastPublish >= PUBLISH_INTERVAL) {
    lastPublish = now;
    readAndPublish();
  }
}

// ──────────────────────────────────────────────
//  Sensor Reading & MQTT Publishing
// ──────────────────────────────────────────────

void readAndPublish() {
  // --- Current (ACS712) ---
  int rawADC = analogRead(ACS712_PIN);
  float voltageSensor = (rawADC / 4095.0) * 3.3;
  float current_A = (voltageSensor - 1.65) / 0.066; // ACS712-30A sensitivity
  if (current_A < 0) current_A = 0;

  // --- Power ---
  float power_W = current_A * VOLTAGE;
  float power_kW = power_W / 1000.0;

  // --- Cumulative energy ---
  float hours = PUBLISH_INTERVAL / 3600000.0;
  cumulativeEnergy_kWh += power_kW * hours;

  // --- Temperature & Humidity (DHT22) ---
  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();

  // --- Light Intensity (BH1750) ---
  float lux = lightMeter.readLightLevel();

  // --- Build JSON payload ---
  StaticJsonDocument<512> doc;
  doc["meter_id"]        = METER_ID;
  doc["timestamp"]       = millis();
  doc["current_A"]       = round2(current_A);
  doc["voltage_V"]       = VOLTAGE;
  doc["power_W"]         = round2(power_W);
  doc["power_kW"]        = round2(power_kW);
  doc["energy_kWh"]      = round2(cumulativeEnergy_kWh);
  doc["temperature_C"]   = isnan(temperature) ? 0 : round2(temperature);
  doc["humidity_pct"]    = isnan(humidity) ? 0 : round2(humidity);
  doc["light_lux"]       = round2(lux);

  char payload[512];
  serializeJson(doc, payload);

  // --- Publish ---
  if (mqttClient.publish(MQTT_TOPIC, payload)) {
    Serial.print("[MQTT] Published: ");
    Serial.println(payload);
  } else {
    Serial.println("[MQTT] Publish failed!");
  }
}

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

void connectWiFi() {
  Serial.print("[WiFi] Connecting to ");
  Serial.print(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println(" connected!");
  Serial.print("[WiFi] IP: ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Connecting to broker...");
    String clientId = "EnergyMeter-" + String(METER_ID);

    if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println(" connected!");
    } else {
      Serial.print(" failed (rc=");
      Serial.print(mqttClient.state());
      Serial.println("). Retrying in 5s...");
      delay(5000);
    }
  }
}

float round2(float value) {
  return (int)(value * 100 + 0.5) / 100.0;
}
