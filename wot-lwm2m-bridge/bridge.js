const { Servient } = require("@node-wot/core");
const { HttpClientFactory } = require("@node-wot/binding-http");
const SmartObject = require('@lwmqn/smartobject');
const CoapNode = require('coap-node');

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory());

const so = new SmartObject();

servient.start().then((WoT) => {
    WoT.requestThingDescription("http://wot-thing:8081/wotdemothing").then((td) => {
        WoT.consume(td).then((thing) => {
            // Initialize SmartObject with LwM2M-readable resources for temperature
            so.init('temperature', 0, {
                sensorValue: {
                    read: function (cb) {
                        thing.readProperty("temperature").then((temperatureOutput) => {
                            return temperatureOutput.value();  // Ensure we extract the value
                        }).then((temperature) => {
                            console.info("Temperature:", temperature);
                            cb(null, parseFloat(temperature));
                        }).catch((error) => {
                            console.error("Error reading temperature:", error);
                            cb(error, null);
                        });
                    }
                },
                units: 'C'
            });

            // Initialize SmartObject with LwM2M-readable resources for humidity
            so.init('humidity', 0, {
                sensorValue: {
                    read: function (cb) {
                        thing.readProperty("humidity").then((humidityOutput) => {
                            return humidityOutput.value();  // Extract the actual humidity value
                        }).then((humidity) => {
                            console.info("Humidity:", humidity);
                            cb(null, parseFloat(humidity));
                        }).catch((error) => {
                            console.error("Error reading humidity:", error);
                            cb(error, null);
                        });
                    }
                },
                units: '%'
            });

            // Register the LwM2M client as before
            const cnode = new CoapNode('wot-demo-thing', so);

            cnode.register('leshan-server', 5683, (err, rsp) => {
                if (err) {
                    console.error("LwM2M registration error:", err);
                } else {
                    console.log("LwM2M client registered:", rsp);
                }
            });

        }).catch((err) => {
            console.error("Error consuming Thing:", err);
        });
    }).catch((err) => {
        console.error("Error fetching Thing Description:", err);
    });
}).catch((err) => {
    console.error("Error starting Servient:", err);
});
