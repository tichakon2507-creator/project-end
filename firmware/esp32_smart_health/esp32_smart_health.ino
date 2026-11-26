// ============================================================================
// ไฟล์: firmware/esp32_smart_health/esp32_smart_health.ino
// เฟิร์มแวร์ ESP32 สำหรับ Smart Health & Emergency IoT Device
// พัฒนาให้ตรงกับสัญญาข้อมูลของ Backend ปัจจุบัน 100%
//   - backend/mqtt/topics.js      : รูปแบบ Topic
//   - backend/mqtt/validators.js  : รูปแบบ JSON Payload
//   - backend/mqtt/handlers.js    : ตัวรับข้อมูลและเหตุฉุกเฉิน
//   - backend/config/thresholds.js : ค่าเกณฑ์แจ้งเตือนเริ่มต้น
//   - backend/services/telegramService.js : ชื่อเหตุการณ์ฉุกเฉิน
// ============================================================================
//
// Topic ที่ใช้ (device_id ต้องตรงกับ device_code ในตาราง devices):
//   iot/health/{device_id}/vitals
//   iot/health/{device_id}/location
//   iot/health/{device_id}/emergency
//   iot/health/{device_id}/status
//
// LWT (Last Will and Testament): Backend จะได้ status = offline อัตโนมัติ
// เมื่อ ESP32 ตัดการเชื่อมต่อแบบผิดปกติ
// ============================================================================

// ----------------------------------------------------------------------------
// Library ที่ต้องติดตั้งใน Arduino IDE (Library Manager)
//   PubSubClient (Nick O'Leary), ArduinoJson (Benoit Blanchon)
//   Adafruit MLX90614 (หรือ OneWire + DallasTemperature ถ้าใช้ DS18B20)
//   MAX30102 (Library ชุมชน), TinyGPSPlus (Mikal Hart), MPU6050_tockn (tokn)
//   WiFi, Wire, SoftwareSerial, math.h (มากับ ESP32 Arduino Core)
// ----------------------------------------------------------------------------

#include <Arduino.h>
#include <WiFi.h>
#include <Wire.h>
#include <math.h>
#include <string.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <TinyGPSPlus.h>
#include <MPU6050_tockn.h>
#include <SoftwareSerial.h>

// เลือกเซนเซอร์อุณหภูมิ: เปิดตัวใดตัวหนึ่ง (ค่าเริ่มต้นคือ MLX90614)
#define USE_MLX90614
// #define USE_DS18B20

#if defined(USE_MLX90614)
  #include <Adafruit_MLX90614.h>
#elif defined(USE_DS18B20)
  #include <OneWire.h>
  #include <DallasTemperature.h>
#endif

// เซนเซอร์อัตราการเต้นหัวใจและ SpO2 (MAX30102)
#define USE_MAX30102
#if defined(USE_MAX30102)
  #include <MAX30102.h>
#endif

// ============================================================================
// ส่วนตั้งค่า : แก้ไขได้ง่ายที่นี่ทั้งหมด
// ============================================================================

// --- Wi-Fi: เลือกโปรไฟล์ 1 หรือ 2 แล้วกรอกชื่อ/รหัสผ่านให้ตรงกับโปรไฟล์ที่เลือก ---
#define WIFI_PROFILE 1
static const char *WIFI_SSID_1     = "YOUR_WIFI_SSID";
static const char *WIFI_PASSWORD_1 = "YOUR_WIFI_PASSWORD";
static const char *WIFI_SSID_2     = "YOUR_PHONE_HOTSPOT_SSID";
static const char *WIFI_PASSWORD_2 = "YOUR_PHONE_HOTSPOT_PASSWORD";

// --- MQTT Broker: 1 = Cloud (broker.emqx.io), 0 = Local (IP ใน LAN) ---
#define MQTT_TARGET_CLOUD 1
static const char *MQTT_HOST_CLOUD = "broker.emqx.io";
static const int   MQTT_PORT_CLOUD = 1883;
static const char *MQTT_HOST_LOCAL = "192.168.1.50";  // เปลี่ยนเป็น IP ของเครื่องรัน Backend
static const int   MQTT_PORT_LOCAL = 1883;

#if MQTT_TARGET_CLOUD
static const char *MQTT_SERVER = MQTT_HOST_CLOUD;
static const int   MQTT_PORT   = MQTT_PORT_CLOUD;
#else
static const char *MQTT_SERVER = MQTT_HOST_LOCAL;
static const int   MQTT_PORT   = MQTT_PORT_LOCAL;
#endif

// --- Device ID: ต้องตรงกับคอลัมน์ device_code (หรือ device_id) ในตาราง devices ---
static const char *DEVICE_ID = "ESP32-HEALTH-01";

// --- ค่าพิกัดสำรอง (เชียงใหม่) ใช้จนกว่า GPS จะได้สัญญาณจริง ---
static const double DEFAULT_LAT = 18.7874;
static const double DEFAULT_LON = 98.9892;

// --- เกณฑ์แจ้งเตือน: ตรงกับค่าเริ่มต้นใน backend/config/thresholds.js ---
static const float  TEMP_MAX_C   = 38.5f;  // อุณหภูมิสูงกว่า ค่านี้ -> HIGH_TEMP
static const int    HR_MIN_BPM   = 45;     // หัวใจเต้นช้ากว่า ค่านี้ -> ABNORMAL_HR
static const int    HR_MAX_BPM   = 120;    // หัวใจเต้นเร็วกว่า ค่านี้ -> ABNORMAL_HR
static const float  SPO2_MIN_PCT = 92.0f;  // SpO2 ต่ำกว่า ค่านี้ -> LOW_SPO2
static const unsigned long EMERGENCY_COOLDOWN_MS = 60000; // กันเหตุการณ์ซ้ำ 60 วินาที

// --- ความถี่ในการส่งข้อมูล ---
static const unsigned long SEND_INTERVAL_MS = 3000;  // ส่ง vitals และ location ทุก 3 วินาที

// --- ขา Pin รวมศูนย์: ใช้ I2C บัสเดียวกันสำหรับ MAX30102 และ MPU6050 ---
#define I2C_SDA_PIN        21   // ขา SDA ของบัส I2C (ต่อ SDA ของ MAX30102 และ MPU6050)
#define I2C_SCL_PIN        22   // ขา SCL ของบัส I2C (ต่อ SCL ของ MAX30102 และ MPU6050)

// --- ขา MAX30102 (วัดอัตราการเต้นหัวใจและ SpO2) ---
#define MAX30102_INT_PIN   27   // ขา Interrupt ของ MAX30102 (ไม่บังคับต้องต่อ)

// --- ขา MPU6050 (ตรวจจับการล้ม ใช้บัส I2C เดียวกับ MAX30102) ---
#define FALL_DETECT_THRESHOLD 3.0f  // ความเร่งเกิน 3g ถือเป็นจุดเริ่มต้นของการล้ม
#define FALL_CONFIRM_G        2.5f  // ความเร่งแกน Z หลังการล้ม
#define FALL_WINDOW_MS        2000  // หน้าต่างเวลายืนยันการล้ม
#define FALL_RESET_MS         5000  // รีเซ็ตสถานะถ้าไม่พบการล้มภายในเวลานี้

// --- ขา SOS Button (ปุ่มขอความช่วยเหลือ) ---
#define SOS_BUTTON_PIN     32   // ปุ่มกดต่อ GPIO 32 ใช้ INPUT_PULLUP (กดแล้วสัญญาณ LOW)
#define BUTTON_DEBOUNCE_MS 200

// --- ขา GPS NEO-6M (ระบุตำแหน่ง) ---
#define GPS_RX_PIN         16   // RX ของ ESP32 ต่อกับขา TX ของโมดูล GPS
#define GPS_TX_PIN         17   // TX ของ ESP32 ต่อกับขา RX ของโมดูล GPS

// --- ขา DS18B20 (ใช้แทน MLX90614 เมื่อเปิด USE_DS18B20) ---
#define DS18B20_DATA_PIN   23   // ขาข้อมูลของเซนเซอร์อุณหภูมิ DS18B20

// --- ขา Battery (อ่านระดับแบตเตอรี่ผ่าน ADC) ---
#define BATTERY_ADC_PIN    34   // ขา ADC สำหรับอ่านแรงดันแบตเตอรี่
#define BATTERY_FULL_MV    3300  // แรงดันเต็ม 3.3V
#define BATTERY_EMPTY_MV   2600  // แรงดันที่ถือว่าหมด
#define BATTERY_FULL_ADC   4095  // ค่า ADC สูงสุดของ ESP32 (12-bit)

// --- โหมดจำลองเซนเซอร์: 1 = ใช้ค่าจำลองเมื่อยังไม่ได้ต่อฮาร์ดแวร์จริง ---
// ค่าจำลองอยู่ในช่วงปกติเสมอ และต้องไม่นำไปสรุปว่าฮาร์ดแวร์ทำงานจริง
#define SENSOR_SIMULATION 1

// ============================================================================
// ออบเจกต์และตัวแปรส่วนกลาง
// ============================================================================

static WiFiClient   wifiClient;
static PubSubClient mqttClient(wifiClient);
static SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);
static TinyGPSPlus gps;
static MPU6050 mpu;

#if defined(USE_MLX90614)
static Adafruit_MLX90614 mlx90614;
#elif defined(USE_DS18B20)
static OneWire dsOneWire(DS18B20_DATA_PIN);
static DallasTemperature dsSensors(&dsOneWire);
#endif

#if defined(USE_MAX30102)
static MAX30102 max30102;
#endif

static char topicVitals[96];
static char topicLocation[96];
static char topicEmergency[96];
static char topicStatus[96];

static bool   gpsLocationValid = false;
static double lastGpsLat = DEFAULT_LAT;
static double lastGpsLon = DEFAULT_LON;

static unsigned long lastVitalsMillis   = 0;
static unsigned long lastLocationMillis = 0;

struct EmergencyState {
    const char *eventType;
    bool sent;
    unsigned long lastSentMs;
};

static EmergencyState emergencyStates[] = {
    { "SOS_BUTTON",    false, 0 },
    { "FALL_DETECTED", false, 0 },
    { "HIGH_TEMP",     false, 0 },
    { "ABNORMAL_HR",   false, 0 },
    { "LOW_SPO2",      false, 0 },
};
static const int EMERGENCY_COUNT = (int)(sizeof(emergencyStates) / sizeof(emergencyStates[0]));

// ============================================================================
// ฟังก์ชันเชื่อมต่อ
// ============================================================================

static const char *activeWifiSsid() {
#if WIFI_PROFILE == 1
    return WIFI_SSID_1;
#else
    return WIFI_SSID_2;
#endif
}

static const char *activeWifiPassword() {
#if WIFI_PROFILE == 1
    return WIFI_PASSWORD_1;
#else
    return WIFI_PASSWORD_2;
#endif
}

void publishStatus(const char *status);

bool ensureWiFi() {
    if (WiFi.status() == WL_CONNECTED) {
        return true;
    }
    WiFi.mode(WIFI_STA);
    WiFi.begin(activeWifiSsid(), activeWifiPassword());
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
        delay(500);
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.print("[ESP32] Wi-Fi connected: ");
        Serial.println(WiFi.localIP());
    }
    return WiFi.status() == WL_CONNECTED;
}

bool ensureMqtt() {
    if (mqttClient.connected()) {
        return true;
    }
    if (mqttClient.connect(DEVICE_ID)) {
        Serial.println("[ESP32] MQTT connected - sending status online");
        publishStatus("online");
        return true;
    }
    return false;
}

// ============================================================================
// ฟังก์ชันอ่านค่าเซนเซอร์
// ============================================================================

int readHeartRate() {
    int hr = 0;
#if defined(USE_MAX30102)
    hr = (int)max30102.getBPM();
#endif
#if SENSOR_SIMULATION
    if (hr <= 0) {
        hr = random(62, 90);
    }
#endif
    return hr > 0 ? constrain(hr, 1, 200) : -1;
}

int readSpo2() {
    int spo2 = 0;
#if defined(USE_MAX30102)
    spo2 = (int)max30102.getSpO2();
#endif
#if SENSOR_SIMULATION
    if (spo2 <= 0) {
        spo2 = random(95, 99);
    }
#endif
    return spo2 > 0 ? constrain(spo2, 1, 100) : -1;
}

float readTemperature() {
    float temperature = -1.0f;
#if defined(USE_MLX90614)
    temperature = mlx90614.readObjectTempC();
#elif defined(USE_DS18B20)
    dsSensors.requestTemperatures();
    temperature = dsSensors.getTempCByIndex(0);
#endif
#if SENSOR_SIMULATION
    if (!isfinite(temperature) || temperature <= 0.0f) {
        temperature = (float)random(3560, 3720) / 100.0f;
    }
#endif
    return temperature;
}

int readBatteryLevel() {
    int raw = analogRead(BATTERY_ADC_PIN);
    float volts = ((float)raw / (float)BATTERY_FULL_ADC) * (float)BATTERY_FULL_MV;
    if (volts >= (float)BATTERY_FULL_MV) return 100;
    if (volts <= (float)BATTERY_EMPTY_MV) return 0;
    int level = (int)(((volts - (float)BATTERY_EMPTY_MV) /
                       ((float)BATTERY_FULL_MV - (float)BATTERY_EMPTY_MV)) * 100.0f);
    return constrain(level, 0, 100);  // validator กำหนดให้ battery_level อยู่ในช่วง 0-100
}

void readGps() {
    while (gpsSerial.available() > 0) {
        if (gps.encode(gpsSerial.read()) && gps.location.isUpdated()) {
            lastGpsLat = gps.location.lat();
            lastGpsLon = gps.location.lng();
            gpsLocationValid = true;
        }
    }
}

bool detectFall() {
    static unsigned long highAccelStart = 0;
    static bool fallingPossible = false;

    mpu.update();
    float ax = mpu.getAccX();
    float ay = mpu.getAccY();
    float az = mpu.getAccZ();

    if (fabs(ax) > FALL_DETECT_THRESHOLD || fabs(ay) > FALL_DETECT_THRESHOLD) {
        highAccelStart = millis();
        fallingPossible = true;
    } else if (az > FALL_CONFIRM_G && fallingPossible &&
               (millis() - highAccelStart) > FALL_WINDOW_MS) {
        fallingPossible = false;
        return true;
    }
    if (millis() - highAccelStart > FALL_RESET_MS) {
        fallingPossible = false;
    }
    return false;
}

// ============================================================================
// ฟังก์ชันส่งข้อมูลผ่าน MQTT (ตรงกับ backend/mqtt/validators.js ทุก field)
// ============================================================================

void publishVitals(int heartRate, float temperature, int spo2, int batteryLevel) {
    StaticJsonDocument<256> doc;
    doc["device_id"]     = DEVICE_ID;
    if (heartRate > 0) {
        doc["heart_rate"] = heartRate;
    }
    if (isfinite(temperature) && temperature > 0.0f) {
        doc["temperature"] = temperature;
    }
    if (spo2 > 0) {
        doc["spo2"] = spo2;
    }
    doc["battery_level"] = batteryLevel;

    char buffer[256];
    size_t length = serializeJson(doc, buffer, sizeof(buffer));
    mqttClient.publish(topicVitals, buffer, length);
}

void publishLocation() {
    StaticJsonDocument<160> doc;
    doc["device_id"]  = DEVICE_ID;
    doc["latitude"]   = gpsLocationValid ? lastGpsLat : DEFAULT_LAT;
    doc["longitude"]  = gpsLocationValid ? lastGpsLon : DEFAULT_LON;

    char buffer[160];
    size_t length = serializeJson(doc, buffer, sizeof(buffer));
    mqttClient.publish(topicLocation, buffer, length);
}

bool publishEmergency(const char *eventType, const char *description) {
    unsigned long now = millis();
    EmergencyState *state = nullptr;
    for (int i = 0; i < EMERGENCY_COUNT; i++) {
        if (strcmp(emergencyStates[i].eventType, eventType) == 0) {
            state = &emergencyStates[i];
            break;
        }
    }
    if (state == nullptr) {
        return false;
    }
    if (state->sent && (now - state->lastSentMs) < EMERGENCY_COOLDOWN_MS) {
        return false;
    }
    if (!mqttClient.connected()) {
        return false;
    }

    state->sent = true;
    state->lastSentMs = now;

    StaticJsonDocument<320> doc;
    doc["device_id"]   = DEVICE_ID;
    doc["event_type"]  = eventType;
    doc["description"] = description;
    doc["latitude"]    = gpsLocationValid ? lastGpsLat : DEFAULT_LAT;
    doc["longitude"]   = gpsLocationValid ? lastGpsLon : DEFAULT_LON;

    char buffer[320];
    size_t length = serializeJson(doc, buffer, sizeof(buffer));
    mqttClient.publish(topicEmergency, buffer, length);
    Serial.print("[ESP32] Emergency sent: ");
    Serial.println(eventType);
    return true;
}

void publishStatus(const char *status) {
    StaticJsonDocument<128> doc;
    doc["device_id"] = DEVICE_ID;
    doc["status"]    = status;  // online / offline / emergency

    char buffer[128];
    size_t length = serializeJson(doc, buffer, sizeof(buffer));
    mqttClient.publish(topicStatus, buffer, length, true);  // retain = true
}

void checkVitalEmergencies(int heartRate, float temperature, int spo2) {
    char description[96];

    if (isfinite(temperature) && temperature > TEMP_MAX_C) {
        snprintf(description, sizeof(description), "temperature=%.1fC threshold=%.1fC",
                 temperature, TEMP_MAX_C);
        publishEmergency("HIGH_TEMP", description);
    }
    if (heartRate > 0 && (heartRate < HR_MIN_BPM || heartRate > HR_MAX_BPM)) {
        snprintf(description, sizeof(description), "heart_rate=%d bpm range=%d-%d",
                 heartRate, HR_MIN_BPM, HR_MAX_BPM);
        publishEmergency("ABNORMAL_HR", description);
    }
    if (spo2 > 0 && spo2 < (int)SPO2_MIN_PCT) {
        snprintf(description, sizeof(description), "spo2=%d%% threshold=%d%%",
                 spo2, (int)SPO2_MIN_PCT);
        publishEmergency("LOW_SPO2", description);
    }
}

// ============================================================================
// Setup / Loop
// ============================================================================

void setup() {
    Serial.begin(115200);
    pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);

    snprintf(topicVitals,    sizeof(topicVitals),    "iot/health/%s/vitals",    DEVICE_ID);
    snprintf(topicLocation,  sizeof(topicLocation),  "iot/health/%s/location",  DEVICE_ID);
    snprintf(topicEmergency, sizeof(topicEmergency), "iot/health/%s/emergency", DEVICE_ID);
    snprintf(topicStatus,    sizeof(topicStatus),    "iot/health/%s/status",    DEVICE_ID);

    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

#if defined(USE_MAX30102)
    max30102.begin();
#endif
#if defined(USE_MLX90614)
    mlx90614.begin();
#elif defined(USE_DS18B20)
    dsSensors.begin();
#endif
    mpu.begin();
    mpu.calcGyroOffsets();

    gpsSerial.begin(9600);

    // LWT: เมื่อตัดการเชื่อมต่อแบบผิดปกติ Backend จะได้รับ status = offline
    char lwtMessage[96];
    snprintf(lwtMessage, sizeof(lwtMessage),
             "{\"device_id\":\"%s\",\"status\":\"offline\"}", DEVICE_ID);
    mqttClient.setBufferSize(512);
    mqttClient.setLastWill(topicStatus, lwtMessage, 1, false);
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);

    randomSeed(millis());
    ensureWiFi();
}

void loop() {
    mqttClient.loop();

    if (!ensureWiFi()) {
        delay(500);
        return;
    }
    bool connected = ensureMqtt();
    if (!connected) {
        delay(5000);
        return;
    }

    readGps();

    // ปุ่ม SOS: ตรวจจับขอบสัญญาณ LOW พร้อม debounce
    static int lastButtonState = HIGH;
    static unsigned long lastButtonChangeMs = 0;
    int buttonState = digitalRead(SOS_BUTTON_PIN);
    unsigned long nowButton = millis();
    if (buttonState != lastButtonState &&
        (nowButton - lastButtonChangeMs) > BUTTON_DEBOUNCE_MS) {
        lastButtonChangeMs = nowButton;
        if (buttonState == LOW) {
            publishEmergency("SOS_BUTTON", "SOS button pressed");
        }
        lastButtonState = buttonState;
    }

    // เซนเซอร์ MPU6050: ตรวจจับการล้ม
    if (detectFall()) {
        publishEmergency("FALL_DETECTED", "MPU6050 fall detected");
    }

    unsigned long now = millis();
    if (now - lastVitalsMillis >= SEND_INTERVAL_MS) {
        lastVitalsMillis = now;
        int heartRate = readHeartRate();
        float temperature = readTemperature();
        int spo2 = readSpo2();
        int batteryLevel = readBatteryLevel();

        publishVitals(heartRate, temperature, spo2, batteryLevel);
        checkVitalEmergencies(heartRate, temperature, spo2);
    }

    if (now - lastLocationMillis >= SEND_INTERVAL_MS) {
        lastLocationMillis = now;
        publishLocation();
    }
}
