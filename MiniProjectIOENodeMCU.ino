#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include "Secrets.h"
 
 
float h ;
float t;
unsigned long lastMillis = 0;
unsigned long previousMillis = 0;
const long interval = 5000;
 
#define AWS_IOT_PUBLISH_TOPIC   "analytics_topic"
#define AWS_IOT_SUBSCRIBE_TOPIC "analytics_topic"
 
WiFiClientSecure net;
 
  StaticJsonDocument<200> doc;
BearSSL::X509List cert(cacert);
BearSSL::X509List client_crt(client_cert);
BearSSL::PrivateKey key(privkey);
 
PubSubClient client(net);
 
time_t now;
time_t nowish = 1510592825;
 
 
void NTPConnect(void)
{
  Serial.print("Setting time using SNTP");
  configTime(TIME_ZONE * 3600, 0 * 3600, "pool.ntp.org", "time.nist.gov");
  now = time(nullptr);
  while (now < nowish)
  {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("done!");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));
}
 
 
void messageReceived(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}
 
 
void connectAWS()
{
  delay(3000);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println(String("Attempting to connect to SSID: ") +
  String(WIFI_SSID));
  while (WiFi.status() != WL_CONNECTED)
  {
  Serial.print(".");
  delay(1000);
  }
  NTPConnect();
  net.setTrustAnchors(&cert);
  net.setClientRSACert(&client_crt, &key);
  client.setServer(MQTT_HOST, 8883);
  client.setCallback(messageReceived);
  Serial.println("Connecting to AWS IOT");
  while (!client.connect(THINGNAME))
  {
  Serial.print(".");
  delay(1000);
  }
  if (!client.connected()) {
  Serial.println("AWS IoT Timeout!");
  return;
  }
  // Subscribe to a topic
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
  Serial.println("AWS IoT Connected!");
}

 
 
void publishMessage()
{
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer); // print to client
 
  if(jsonBuffer != NULL)
  {
    client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
  }
}
 
 
void setup()
{
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
}
  connectAWS();
}
 
 
void loop()
{
 
 if (Serial.available()) {
    String data = Serial.readStringUntil('\n'); // Read a line of data from serial
    
    // Define variables to store parsed data
    float temperature;
    float humidity;
    bool lightState;
    float moisture;
    
    // Parse the data using sscanf
    int parsedValues = sscanf(data.c_str(), "Temperature:%f Humidity:%f lightState:%d moisture:%f", &temperature, &humidity, &lightState, &moisture);
    
    // Check if sscanf successfully parsed all values
    if (parsedValues == 4) {
      // Add the parsed data to the JSON document
      doc["Temperature"] = temperature;
      doc["Humidity"] = humidity;
      doc["lightState"] = lightState;
      doc["moisture"] = moisture;
      
      // Serialize the JSON document to a string for further use
      String jsonStr;
      serializeJson(doc, jsonStr);
      
      // You can now use the JSON string or the JSON document as needed
      Serial.println(jsonStr);
    } else {
      Serial.println("Parsing failed");
    }
  }
  

  if (!client.connected())
  {
    connectAWS();
  }
  else
  {
    client.loop();
    if (millis() - lastMillis > 5000)
    {
      lastMillis = millis();
      publishMessage();
    }
  }
}
