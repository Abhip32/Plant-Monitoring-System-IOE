#include <dht.h>        // Include library
#include <SoftwareSerial.h>
#define outPin 9       // Defines pin number to which  the DHT sensor is connected
dht DHT;                // Creates a DHT object

int relayPin = 8;
//Soil Sensor pins
#define sensorPower 7
#define sensorPin A0
SoftwareSerial espSerial(5, 6);
String str;

int lightval;
int lightpin=A1;
int tm=1000;
void setup() {
  Serial.begin(115200);
  espSerial.begin(115200);
  pinMode(lightpin,INPUT);
  pinMode(sensorPower, OUTPUT);
  pinMode(relayPin, OUTPUT);
	// Initially soil keep the sensor OFF
	digitalWrite(sensorPower, LOW);
}

void loop() {
  lightval=analogRead(lightpin);
  Serial.println(lightval);
  bool lightState=false;
  Serial.print("Light State :");
  if(lightval > 400)
  {
    lightState=true;
    Serial.println(lightState);
  }
  else
  {
     lightState=false;
     Serial.println(lightState);
  }

  int readData = DHT.read11(outPin);

	float t = DHT.temperature;        // Read temperature
	float h = DHT.humidity;           // Read humidity

	Serial.print("Temperature = ");
	Serial.print(t);
	Serial.print("°C | ");
	Serial.print((t*9.0)/5.0+32.0);        // Convert celsius to fahrenheit
	Serial.println("°F ");
	Serial.print("Humidity = ");
	Serial.print(h);
	Serial.println("% ");
	Serial.println("");
  //int moisture = readSensor();
  float moisture_percentage;
  int sensor_analog;
  sensor_analog = analogRead(sensorPin);
  moisture_percentage = ( 100 - ( (sensor_analog/1023.00) * 100 ) );
  Serial.print("Moisture Percentage = ");
  Serial.print(moisture_percentage);
   // Determine status of our soil
  if (moisture_percentage >= 50) {
    Serial.println("Status: Soil is perfect");
    digitalWrite(relayPin, LOW); 
  }  else {
         digitalWrite(relayPin, HIGH); 
         	delay(5000);	
          digitalWrite(relayPin, LOW); 			
           Serial.println("Water Pumped");
    Serial.println("Status: Soil is dry - time to water!");
  } 
  Serial.println("Data sent to ESP");
  str = String("Temperature:" + String(t, 2) + " " + "Humidity:" + String(h, 2) + " " + "lightState:" + String(lightState) + " " + "moisture:" + String(moisture_percentage, 1));

  espSerial.println(str);

 
  delay(tm);

}

//  This function returns the analog soil moisture measurement
int readSensor() {
	digitalWrite(sensorPower, HIGH);	// Turn the sensor ON
	delay(10);							// Allow power to settle
	int val = analogRead(sensorPin);	// Read the analog value form sensor
	digitalWrite(sensorPower, LOW);		// Turn the sensor OFF
	return val;							// Return analog moisture value
}

