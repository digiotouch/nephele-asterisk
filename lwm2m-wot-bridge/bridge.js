const WoT = require("@node-wot/core").Servient;
const HttpServer = require("@node-wot/binding-http").HttpServer;
const axios = require('axios');

// Initialize WoT Servient with HTTP binding
const servient = new WoT();
servient.addServer(new HttpServer({ port: 8081 })); // WoT server on port 8081

servient.start().then((WoT) => {
    // Define the LwM2M server API endpoint
    const lwm2mServerUrl = 'http://leshan:8080/api/clients';

    // Function to fetch temperature data from Leshan server
    async function getTemperature(deviceId) {
        try {
            const response = await axios.get(`${lwm2mServerUrl}/${deviceId}/3303/0/5700`); // 3303: Temperature Sensor, 0: Instance, 5700: Current Temperature
            return response.data.content.value;
        } catch (error) {
            console.error('Error fetching temperature:', error);
            throw error;
        }
    }

    // Define WoT Thing
    WoT.produce({
        title: "TemperatureSensor",
        description: "A temperature sensor bridged from LwM2M",
        properties: {
            temperature: {
                type: "number",
                description: "Current temperature",
                observable: true
            }
        }
    }).then((thing) => {
        // Implement the property handler
        thing.setPropertyReadHandler("temperature", async () => {
            // Assuming device ID is known, e.g., "demo-client"
            const temp = await getTemperature("demo-client");
            return temp;
        });

        // Expose the Thing
        return thing.expose().then(() => {
            console.log(`WoT Thing '${thing.getThingDescription().title}' exposed`);
        });
    }).catch((err) => {
        console.error('Error in WoT bridge:', err);
    });
});
