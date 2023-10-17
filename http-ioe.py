import time
import json

def customCallback(client, userdata, message):
    print("Callback came...")
    print("Topic: " + message.topic)
    payload = message.payload.decode()
    print("Message: " + payload)
    
    # Save the received data to a JSON file
    save_to_json(payload)

def save_to_json(data):
    try:
        with open('received_data.json', 'a') as json_file:
            json.dump(data, json_file)
            json_file.write('\n')
        print("Data saved to received_data.json")
    except Exception as e:
        print("Error saving data to JSON file:", str(e))

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

myMQTTClient = AWSIoTMQTTClient("device")
myMQTTClient.configureEndpoint("a3tzl10uisiyjh-ats.iot.ap-south-1.amazonaws.com", 8883)

myMQTTClient.configureCredentials("./AmazonRootCA1.pem", "./private.key", "./device.crt")

myMQTTClient.connect()
print("Client Connected")

# Subscribe to the analytics_topic with QoS 1
myMQTTClient.subscribe("analytics_topic", 1, customCallback)
print('Waiting for the callback. Press Enter to continue...')

# Wait for user input before unsubscribing
x = input()

# Unsubscribe from the analytics_topic
myMQTTClient.unsubscribe("analytics_topic")
print("Client unsubscribed")

# Disconnect from AWS IoT Core
myMQTTClient.disconnect()
print("Client Disconnected")
