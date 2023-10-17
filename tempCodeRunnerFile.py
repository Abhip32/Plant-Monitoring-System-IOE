import time

def customCallback(client, userdata, message):
    print("Callback came...")
    print("Topic: " + message.topic)
    print("Message: " + message.payload.decode())

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

myMQTTClient = AWSIoTMQTTClient("device1")
myMQTTClient.configureEndpoint("a3tzl10uisiyjh-ats.iot.ap-south-1.amazonaws.com", 8883)

myMQTTClient.configureCredentials("./AmazonRootCA1.pem","./private.key", "./device.crt")

myMQTTClient.connect()
print("Client Connected")

myMQTTClient.subscribe("analytics_topic", 1, customCallback)
print('waiting for the callback. Click to conntinue...')
x = input()

myMQTTClient.unsubscribe("analytics_topic")
print("Client unsubscribed") 


myMQTTClient.disconnect()
print("Client Disconnected")