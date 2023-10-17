console.log("Chart JS")
const dataTable = document.getElementById('data-table').getElementsByTagName('tbody')[0];

// Create line charts for Temperature, Moisture, and Humidity
const ctxTemperature = document.getElementById('temperature-chart').getContext('2d');
const ctxMoisture = document.getElementById('moisture-chart').getContext('2d');
const ctxHumidity = document.getElementById('humidity-chart').getContext('2d');
const ctxLightState = document.getElementById('lightstate-chart').getContext('2d');

ctxLightState.height = 200;


const lightStateChart = new Chart(ctxLightState, {
    type: 'pie',
    data: {
        labels: [
            'true', 'false'
        ], // Labels for different light states
        datasets: [
            {
                label: 'Light State',
                data: [], // Count true and false occurrences in your data array
                backgroundColor: [
                    'rgba(0, 128, 0, 0.6)', // Green for true
                    'rgba(255, 0, 0, 0.6)', // Red for false
                ],
                borderWidth: 1
            }
        ]
    }
});


// Create chart objects
const temperatureChart = new Chart(ctxTemperature, {
    type: 'line',
    data: {
        labels: [], // Add labels for x-axis if needed
        datasets: [
            {
                label: 'Temperature',
                data: [],
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1,
                fill: false
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const moistureChart = new Chart(ctxMoisture, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Moisture',
                data: [],
                borderColor: 'rgba(0, 0, 255, 1)',
                borderWidth: 1,
                fill: false
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const humidityChart = new Chart(ctxHumidity, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Humidity',
                data: [],
                borderColor: 'rgba(0, 128, 0, 1)',
                borderWidth: 1,
                fill: false
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

let storedData = [];


function fetchDataAndUpdateTable() {
    $.get('/get_data', function (data) {
        if (data.length !== storedData.length) {
            storedData = data;
            let trueValues = 0;
            let falseValues = 0;
            let totalTemperature = 0;
            let moistureFailed = 0;
            let totalMoisture = 0;
            let totalHumidity = 0;
            let totalCount = 0;


            // Clear existing chart data
            temperatureChart.data.labels = [];
            temperatureChart.data.datasets[0].data = [];
            moistureChart.data.labels = [];
            moistureChart.data.datasets[0].data = [];
            humidityChart.data.labels = [];
            humidityChart.data.datasets[0].data = [];
            lightStateChart.data.datasets[0].data = [];

            data.forEach((item) => { // Update the table
                const row = dataTable.insertRow();
                const temperatureCell = row.insertCell(0);
                const humidityCell = row.insertCell(1);
                const lightStateCell = row.insertCell(2);
                const moistureCell = row.insertCell(3);

                temperatureCell.textContent = item.Temperature;
                humidityCell.textContent = item.Humidity;
                lightStateCell.textContent = item.lightState;
                moistureCell.textContent = item.moisture;
                

                // Calculate averages
                totalTemperature += item.Temperature;
                totalMoisture += item.moisture;
                totalHumidity += item.Humidity;
                totalCount++;
                if(item.moisture === 0)
                {
                    moistureFailed=moistureFailed+1;
                }

                item.lightState ? trueValues++ : falseValues++;

                // Update the charts
                temperatureChart.data.labels.push(item.Temperature);
                temperatureChart.data.datasets[0].data.push(item.Temperature);
                moistureChart.data.labels.push(item.moisture);
                moistureChart.data.datasets[0].data.push(item.moisture);
                humidityChart.data.labels.push(item.Humidity);
                humidityChart.data.datasets[0].data.push(item.Humidity);
            });

            // Calculate averages
            const avgTemperature = totalTemperature / totalCount;
            const avgMoisture = totalMoisture / totalCount;
            const avgHumidity = totalHumidity / totalCount;

            // Update HTML elements with average values
            document.getElementById('avg-temperature').innerText = avgTemperature.toFixed(2); // Update with the correct element ID
            document.getElementById('avg-moisture').innerText = avgMoisture.toFixed(2); // Update with the correct element ID
            document.getElementById('avg-humidity').innerText = avgHumidity.toFixed(2);
            // Update with the correct element ID

            // Temperature inference
            const tempInferenceElement = document.getElementById("temp-inference");
            let tempInferenceMessage = "";
            if (avgTemperature < 33 && avgTemperature > 15) {
                tempInferenceElement.textContent = "Temperature is moderate.";
                tempInferenceMessage = "Temperature is moderate.";
            } else if (avgTemperature < 15) {
                tempInferenceElement.textContent = "Temperature is low.";
                tempInferenceMessage = "Temperature is low.\n Action:  Consider placing plants in a warmer location.";
            } else {
                tempInferenceElement.textContent = "Temperature is high.";
                tempInferenceMessage = "Temperature is high.\n Action:  Consider placing plants in a cooler location.";
            }

            // Average Moisture inference
            const avgInferenceElement = document.getElementById("avg-inference");
            let avgInferenceMessage = "";
            if (avgMoisture >= 50) {
                avgInferenceElement.textContent = "Moisture is high";

                avgInferenceMessage = "Moisture level is high.\n Action:  Soil moisture is good";
            } else {
                avgInferenceElement.textContent = "Moisture is low";
                avgInferenceMessage = "Moisture level is low.\n Action:  Consider chainging soil";
            }

            // Humidity inference
            const humidityInferenceElement = document.getElementById("humidity-inference");
            let humidityInferenceMessage = "";
            if (avgHumidity > 80) {
                humidityInferenceElement.textContent="Humidity is high";
                humidityInferenceMessage = "Humidity is high.\n Action: Consider placing plants in a less humid place.";
            } else if (avgHumidity < 40) {
                humidityInferenceElement.textContent="Humidity is low";
                humidityInferenceMessage = "Humidity is low.\n Action:  Consider placing plants in humid location.";
            } else {
                humidityInferenceElement.textContent="Humidity is moderate";
                humidityInferenceMessage = "Humidity is moderate.";
            }
            
            if(moistureFailed>=3)
            {
                const notificationMessage = `
                Temperature Inference: ${tempInferenceMessage}
                Average Moisture Inference: ${avgInferenceMessage}
                Humidity Inference: ${humidityInferenceMessage}
                Moisture Sensor Status State : "Failed"`

            }
            else
            {
            // Combine all inference messages into one notification message
                const notificationMessage = `
                Temperature Inference: ${tempInferenceMessage}
                Average Moisture Inference: ${avgInferenceMessage}
                Humidity Inference: ${humidityInferenceMessage}
            }
`;

            // Send a browser notification
            if (Notification.permission === "granted") {
                new Notification("Weather Inferences", {
                    body: notificationMessage,
                    icon: "your-icon-url.png" // Replace with the URL of your notification icon
                });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(function (permission) {
                    if (permission === "granted") {
                        new Notification("Weather Inferences", {
                            body: notificationMessage,
                            icon: "your-icon-url.png" // Replace with the URL of your notification icon
                        });
                    }
                });
            }

            lightStateChart.data.datasets[0].data.push(trueValues);
            lightStateChart.data.datasets[0].data.push(falseValues);

            // Update the charts
            temperatureChart.update();
            moistureChart.update();
            humidityChart.update();
            lightStateChart.update();
        }
    });
}

// Fetch data initially and then refresh it every 5 seconds
fetchDataAndUpdateTable();
setInterval(fetchDataAndUpdateTable, 5000);


// Fetch data initially and then refresh it every 5 seconds
fetchDataAndUpdateTable();
setInterval(fetchDataAndUpdateTable, 5000);
