const WoT = require("@node-wot/core").Servient;
const HttpServer = require("@node-wot/binding-http").HttpServer;

// Initialize WoT Servient with HTTP binding
const servient = new WoT();
servient.addServer(new HttpServer({ port: 8081 })); // WoT server on port 8081

servient.start().then((WoT) => {

    async function getTemperature() {
        return parseFloat(((Math.random() * (30 - 25 + 1) ) + 25).toFixed(1));
    }

    async function getHumidity() {
        return parseFloat(((Math.random() * (55 - 50 + 1) ) + 50).toFixed(1));
    }

    // Define WoT Thing
    WoT.produce({
        title: "WoTDemoThing",
        description: "A WoT sensor device bridged to LwM2M",
        properties: {
            temperature: {
                type: "number",
                description: "Current temperature",
                observable: true
            },
            humidity: {
                type: "number",
                description: "Current humidity",
                observable: true
            }
        }
    }).then((thing) => {
        thing.setPropertyReadHandler("temperature", async () => {
            const temperature = await getTemperature();
            return temperature;
        });

        thing.setPropertyReadHandler("humidity", async () => {
            const humidity = await getHumidity();
            return humidity;
        });

        // Expose the Thing
        return thing.expose().then(() => {
            console.log(`WoT Thing '${thing.getThingDescription().title}' exposed`);
        });
    }).catch((err) => {
        console.error('Error in WoT device:', err);
    });
});
