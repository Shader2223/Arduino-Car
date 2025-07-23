#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

#include "esp_camera.h"
#include "esp_http_server.h"
#define CAMERA_MODEL_AI_THINKER
// ==== WiFi cấu hình ====
const char* ssid = "Thanh Vu";
const char* password = "00000000";

// ==== Motor Pins ====
#define IN1 13  // Motor A PWM
#define IN2 15  // Motor A DIR
#define IN3 14  // Motor B PWM
#define IN4 2   // Motor B DIR

// ==== LED Pin ====
#define LED_PIN 4

// ==== Biến điều khiển ====
int speed = 0;        // PWM (0–255)
String control = "";  // Lệnh điều hướng (f/b/l/r/s)
unsigned long lastControlCheck = 0;
const unsigned long controlInterval = 10;  // 10ms

// ==== Camera pinout cho ESP32-CAM (AI Thinker) ====

#if defined(CAMERA_MODEL_WROVER_KIT)
#define PWDN_GPIO_NUM -1
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 21
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27

#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 19
#define Y4_GPIO_NUM 18
#define Y3_GPIO_NUM 5
#define Y2_GPIO_NUM 4
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22


#elif defined(CAMERA_MODEL_AI_THINKER)
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27

#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

#else
#error "Camera model not selected"
#endif
// ==== Stream handler ====
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=123456789000000000000987654321";
static const char* _STREAM_BOUNDARY = "\r\n--123456789000000000000987654321\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

static esp_err_t stream_handler(httpd_req_t* req) {
  camera_fb_t* fb = NULL;
  esp_err_t res = ESP_OK;

  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      res = ESP_FAIL;
      break;
    }

    res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
    if (res != ESP_OK) break;

    char part_buf[64];
    size_t hlen = snprintf(part_buf, 64, _STREAM_PART, fb->len);
    res = httpd_resp_send_chunk(req, part_buf, hlen);
    if (res != ESP_OK) break;

    res = httpd_resp_send_chunk(req, (const char*)fb->buf, fb->len);
    if (res != ESP_OK) break;

    esp_camera_fb_return(fb);
  }

  return res;
}

void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 81;

  httpd_uri_t stream_uri = {
    .uri = "/stream",
    .method = HTTP_GET,
    .handler = stream_handler,
    .user_ctx = NULL
  };

  httpd_handle_t stream_httpd = NULL;

  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &stream_uri);
    Serial.println("Đã khởi động stream tại /stream");
  } else {
    Serial.println("Không thể khởi động stream server");
  }
}

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);
    while (true) delay(1000);
  }

  // Giảm frame size ban đầu để tăng tốc độ khởi động
  sensor_t* s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_CIF);

  Serial.println("Camera init thành công");
}



// ==== WebServer ====
WebServer server(80);

void setup() {
  Serial.begin(115200);

  // Khởi tạo motor pins
  pinMode(IN2, OUTPUT);
  pinMode(IN4, OUTPUT);
  // PWM channels (giữ nguyên như bạn)s
  ledcAttachChannel(IN1, 1000, 8, 0);
  ledcAttachChannel(IN3, 1000, 8, 2);

  // Khởi tạo LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Đã kết nối! IP: " + WiFi.localIP().toString());

  setupCamera();
  startCameraServer();
  // Endpoint điều khiển tốc độ
 // CORS cho POST /led
server.on("/led", HTTP_OPTIONS, []() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
});

// CORS cho POST /speed
server.on("/speed", HTTP_OPTIONS, []() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
});

// CORS cho POST /control
server.on("/control", HTTP_OPTIONS, []() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
});
// Đăng ký các handler cho POST
server.on("/led", HTTP_POST, handleLedPost);
server.on("/speed", HTTP_POST, handleSpeedPost);
server.on("/control", HTTP_POST, handleControlPost);

  server.begin();
  Serial.println("Sẵn sàng! Gửi JSON tới /speed, /control và /led");
}

void loop() {
  server.handleClient();

  unsigned long now = millis();
  if (now - lastControlCheck >= controlInterval) {
    lastControlCheck = now;
    processDrive();
  }
}

// ==== Xử lý di chuyển ====
void processDrive() {
  char cmd = control.charAt(0);
  switch (cmd) {
    case 'f':  // forward
      Serial.println("Tiến tới");
      digitalWrite(IN2, LOW);
      digitalWrite(IN4, LOW);
      ledcWrite(IN1, speed);
      ledcWrite(IN3, speed);
      break;
    case 'b':  // backward
      Serial.println("Lùi lại");
      digitalWrite(IN2, HIGH);
      digitalWrite(IN4, HIGH);
      ledcWrite(IN1, 255 - speed);
      ledcWrite(IN3, 255 - speed);
      break;
    case 'r':  // right
      Serial.println("Rẽ phải");
      digitalWrite(IN2, LOW);
      digitalWrite(IN4, HIGH);
      ledcWrite(IN1, speed);
      ledcWrite(IN3, 255 - speed);
      break;
    case 'l':  // left
      Serial.println("Rẽ trái");
      digitalWrite(IN2, HIGH);
      digitalWrite(IN4, LOW);
      ledcWrite(IN1, 255 - speed);
      ledcWrite(IN3, speed);
      break;
    case 's':  // stop
      Serial.println("Dừng lại");
      digitalWrite(IN2, HIGH);
      digitalWrite(IN4, HIGH);
      ledcWrite(IN1, 255);
      ledcWrite(IN3, 255);
      break;
    default:
      // không làm gì
      break;
  }
}

// ==== Xử lý POST /speed ====
void handleSpeedPost() {
  if (!server.hasArg("plain")) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "text/plain", "Không có dữ liệu JSON");
    return;
  }

  StaticJsonDocument<128> doc;
  auto err = deserializeJson(doc, server.arg("plain"));
  if (err) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "application/json", "{\"error\":\"JSON không hợp lệ\"}");
    return;
  }

  speed = constrain(doc["speed"] | 0, 0, 255);
  Serial.printf("Đã nhận speed = %d\n", speed);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json",
              "{\"status\":\"OK\",\"speed\":" + String(speed) + "}");
}


// ==== Xử lý POST /control ====
void handleControlPost() {
  if (!server.hasArg("plain")) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "text/plain", "Không có dữ liệu JSON");
    return;
  }

  StaticJsonDocument<128> doc;
  auto err = deserializeJson(doc, server.arg("plain"));
  if (err) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "application/json", "{\"error\":\"JSON không hợp lệ\"}");
    return;
  }

  control = doc["control"] | "";
  control.trim();
  Serial.println("Đã nhận control = " + control);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json",
              "{\"status\":\"OK\",\"control\":\"" + control + "\"}");
}


// ==== Xử lý POST /led ====
void handleLedPost() {
  if (!server.hasArg("plain")) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "text/plain", "Không có dữ liệu JSON");
    return;
  }

  StaticJsonDocument<128> doc;
  auto err = deserializeJson(doc, server.arg("plain"));
  if (err) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "application/json", "{\"error\":\"JSON không hợp lệ\"}");
    return;
  }

  int ledVal = doc["led"] | -1;
  if (ledVal == 1) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("LED ON");
  } else if (ledVal == 0) {
    digitalWrite(LED_PIN, LOW);
    Serial.println("LED OFF");
  } else {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "application/json", "{\"error\":\"led phải là 0 hoặc 1\"}");
    return;
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json",
              "{\"status\":\"OK\",\"led\":" + String(ledVal) + "}");
}

