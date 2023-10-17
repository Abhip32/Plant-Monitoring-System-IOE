from flask import Flask, render_template, jsonify
import json
import time
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

app = Flask(__name__)



def customCallback(client, userdata, message):
    print("Callback came...")
    print("Topic: " + message.topic)
    payload = message.payload.decode()
    print("Message: " + payload)
    
    # Save the received data to a JSON file
    save_to_json(payload)

def save_to_json(data):
    try:
        with open('../received_data.json', 'a') as json_file:
            json.dump(data, json_file)
            json_file.write('\n')
        print("Data saved to received_data.json")
    except Exception as e:
        print("Error saving data to JSON file:", str(e))

@app.route('/')
def index():
    data_list = []
    myMQTTClient = AWSIoTMQTTClient("device")
    myMQTTClient.configureEndpoint("a3tzl10uisiyjh-ats.iot.ap-south-1.amazonaws.com", 8883)

    myMQTTClient.configureCredentials("../AmazonRootCA1.pem", "../private.key", "../device.crt")

    myMQTTClient.connect()
    print("Client Connected")

    # Subscribe to the analytics_topic with QoS 1
    myMQTTClient.subscribe("analytics_topic", 1, customCallback)
    print('Waiting for the callback. Press Enter to continue...')



    
    return render_template('index.html')

@app.route('/get_data')
def get_data():
    # Read data from the JSON file
    data_list = []
    with open('../received_data.json', 'r') as json_file:
        for line in json_file:
            data_list.append(json.loads(line))
    send_list = []
    for data in data_list:
        send_list.append(json.loads(data))

    return send_list

    



if __name__ == '__main__':
    app.run(debug=True)
