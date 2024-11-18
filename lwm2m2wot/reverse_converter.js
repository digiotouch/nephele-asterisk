/*
* This software is licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

/*
* Copyright - Digiotouch SARL
* Author - Soumya Kanti Datta (contact@digiotouch.com)
*/

const express = require('express');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');

const app = express();
app.use(bodyParser.text({ type: 'application/xml' }));

/**
 * Map LwM2M data types to WoT TD types.
 */
function mapLwM2MToWoTType(lwm2mType) {
    switch (lwm2mType) {
        case 'Boolean':
            return 'boolean';
        case 'Integer':
        case 'Unsigned Integer':
            return 'integer';
        case 'Float':
            return 'number';
        case 'String':
            return 'string';
        case 'Opaque':
        case 'Objlnk':
            return 'object'; // Opaque and Object Link treated as objects
        case 'none':
            return null; // No data type for executable resources
        default:
            return 'string'; // Default to string if unknown
    }
}

/**
 * Convert LwM2M XML to WoT Thing Description.
 */
function convertLwM2MToTD(lwm2mXML, callback) {
    xml2js.parseString(lwm2mXML, { explicitArray: false }, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        const lwm2mObject = result.LWM2M.Object;
        const objectID = lwm2mObject.ObjectID;
        const instanceID = 0;  // Default instance ID for now, typically 0 for single-instance objects
        const dummyHost = `coap://lwm2m-server.example.com`;

        const wotTD = {
            '@context': [
                'https://www.w3.org/2022/wot/td/v1.1',
                { 'cov': 'http://www.example.org/coap-binding#' }
            ],
            id: `urn:uuid:${lwm2mObject.ObjectURN}`,
            title: lwm2mObject.Name,
            description: lwm2mObject.Description1 || '',
            securityDefinitions: {
                psk_sc: {
                    scheme: 'psk'
                }
            },
            security: ['psk_sc'],
            properties: {},
            actions: {},
            events: {}
        };

        // Parse Resources
        const resources = lwm2mObject.Resources.Item;
        if (resources) {
            const resourceArray = Array.isArray(resources) ? resources : [resources];

            resourceArray.forEach((resource) => {
                const resourceID = resource.ID;
                const name = resource.Name.toLowerCase(); // Ensure lowercase names
                const operations = resource.Operations;
                const type = mapLwM2MToWoTType(resource.Type);
                const description = resource.Description || '';
                const units = resource.Units || '';

                // CoAP URL construction
                const coapUrl = `${dummyHost}/${objectID}/${instanceID}/${resourceID}`;
                const forms = [{ href: coapUrl }];

                if (operations.includes('R')) {
                    forms[0].op = 'readproperty';
                    forms[0]['cov:methodName'] = 'GET';
                }
                if (operations.includes('RW')) {
                    forms[0].op = ['readproperty', 'writeproperty'];
                    forms[0]['cov:methodName'] = ['GET', 'PUT'];
                }
                if (operations.includes('E')) {
                    forms[0].op = 'invokeaction';
                    forms[0]['cov:methodName'] = 'POST';
                }

                // Handle Execute resources (actions)
                if (operations.includes('E')) {
                    wotTD.actions[name] = {
                        description: description,
                        forms: forms
                    };
                } else if (operations.includes('R') || operations.includes('RW')) {
                    const property = {
                        type: type,
                        description: description,
                        readOnly: operations === 'R',
                        unit: units || undefined,
                        forms: forms
                    };

                    // Handle multiple instances (arrays)
                    if (resource.MultipleInstances === 'Multiple') {
                        property.type = 'array';
                        property.items = { type: type };
                    }

                    wotTD.properties[name] = property;
                }
            });
        }

        return callback(null, wotTD);
    });
}

// Route to convert LwM2M XML to WoT TD
app.post('/convert', (req, res) => {
    const lwm2mXML = req.body;

    // Perform the conversion
    convertLwM2MToTD(lwm2mXML, (err, wotTD) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        // Return the WoT TD JSON-LD response
        res.json(wotTD);
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
