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
const { create } = require('xmlbuilder2');

const app = express();
app.use(bodyParser.json());

let currentTestId = 42769; // Starting ID from the test range

/**
 * Map WoT TD type to LwM2M type.
 */
function mapType(wotType) {
    switch (wotType) {
        case 'boolean':
            return 'Boolean';
        case 'integer':
            return 'Integer';
        case 'number':
            return 'Float';
        case 'string':
            return 'String';
        case 'object':
            return 'Opaque'; // Treat object as binary octet sequence
        case 'array':
            return 'Opaque'; // Treat array as Opaque or Objlnk, depending on usage
        case 'null':
            return 'none'; // Executable resource with no specific data type
        default:
            return 'String'; // Default to string if unknown
    }
}

/**
 * Convert a WoT Thing Description to LwM2M XML.
 */
function convertTDToLwM2M(thingDescription) {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('LWM2M', {
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:noNamespaceSchemaLocation': 'http://openmobilealliance.org/tech/profiles/LWM2M.xsd'
        });

    // Assign a test Object ID within the range 42769 - 42800
    const objectID = currentTestId++;
    if (currentTestId > 42800) currentTestId = 42769; // Reset if we exceed the test range

    // Generate the URN using the test range
    const objectURN = `urn:oma:lwm2m:x:${objectID}:1.0`;

    const object = root.ele('Object', { ObjectType: 'MODefinition' });
    object.ele('Name').txt(thingDescription.title || 'Unnamed Thing');
    object.ele('Description1').txt(thingDescription.description || `This LwM2M Object represents ${thingDescription.title}.`);
    object.ele('ObjectID').txt(objectID);
    object.ele('ObjectURN').txt(objectURN);
    object.ele('LWM2MVersion').txt('1.0');
    object.ele('ObjectVersion').txt('1.0');
    object.ele('MultipleInstances').txt('Single');
    object.ele('Mandatory').txt('Optional');

    const resources = object.ele('Resources');
    let resourceId = 1;

    /**
     * Function to add a resource item with handling of range, enumeration, and units.
     */
    const addResourceItem = (name, operations, type, description, range, units, enumeration) => {
        const resource = resources.ele('Item', { ID: resourceId++ });
        resource.ele('Name').txt(name);
        resource.ele('Operations').txt(operations); // R (read), W (write), E (execute)
        resource.ele('MultipleInstances').txt('Single');
        resource.ele('Mandatory').txt('Mandatory');

        // If the resource supports Execute operation (E), omit the Type field (it must be empty)
        if (operations === 'E') {
            resource.ele('Type'); // Empty <Type />
        } else {
            resource.ele('Type').txt(type || 'String'); // Fill with mapped type if not executable
        }

        // Handle RangeEnumeration
        let rangeEnumerationValue = '';
        if (range) {
            rangeEnumerationValue = `${range.minimum}..${range.maximum}`;
        } else if (enumeration) {
            rangeEnumerationValue = enumeration.map(value => `"${value}"`).join(',');
        }

        resource.ele('RangeEnumeration').txt(rangeEnumerationValue);
        resource.ele('Units').txt(units || '');
        resource.ele('Description').txt(description || `The ${name} of the device.`);
    };

    // Handle properties
    if (thingDescription.properties) {
        Object.entries(thingDescription.properties).forEach(([key, property]) => {
            const name = key.charAt(0).toUpperCase() + key.slice(1);
            const operations = property.readOnly ? 'R' : 'RW';
            const type = mapType(property.type || 'string'); // Map WoT TD type to LwM2M type
            const description = property.description || `The ${key} of the device.`;
            const range = (property.minimum !== undefined && property.maximum !== undefined)
                ? { minimum: property.minimum, maximum: property.maximum }
                : null;
            const units = property.unit || '';
            const enumeration = Array.isArray(property.enum) ? property.enum : null;

            addResourceItem(name, operations, type, description, range, units, enumeration);
        });
    }

    // Handle actions
    if (thingDescription.actions) {
        Object.entries(thingDescription.actions).forEach(([key, action]) => {
            const name = key.charAt(0).toUpperCase() + key.slice(1);
            const operations = 'E'; // Actions are executable
            const description = action.description || `Executes the ${key} action.`;
            const enumeration = action.input && action.input.enum ? action.input.enum : null;

            addResourceItem(name, operations, 'none', description, null, '', enumeration); // Type must be empty for executable resources
        });
    }

    // Handle events
    if (thingDescription.events) {
        Object.entries(thingDescription.events).forEach(([key, event]) => {
            const name = key.charAt(0).toUpperCase() + key.slice(1);
            const operations = 'R'; // Observable/readable event
            const type = mapType(event.data && event.data.type ? event.data.type : 'string');
            const description = event.description || `Event triggered when ${key} occurs.`;
            const units = event.data && event.data.unit ? event.data.unit : '';

            addResourceItem(name, operations, type, description, null, units, null);
        });
    }

    object.ele('Description2').txt('');

    return root.end({ prettyPrint: true });
}

// Route to convert WoT TD to LwM2M XML
app.post('/convert', (req, res) => {
    try {
        const wotDescription = req.body;

        // Perform the conversion
        const lwm2mXML = convertTDToLwM2M(wotDescription);

        // Set the content type to XML
        res.header('Content-Type', 'application/xml');

        // Return the XML response
        res.send(lwm2mXML);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
