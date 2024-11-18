// client/client_ehr.js
const axios = require('axios');

const SERVER_URL = 'http://server:4000/generate-ehr';

async function requestEHR() {
    const userInputs = {
        firstName: "Jane",
        lastName: "Smith",
        dateOfBirth: "1990-03-12",
        gender: "Female",
        phone: "+342398732642",
        address: "1 Barcelona street, 98302 Barcelona",
        medicalHistory: [
            {
                condition: "Fever",
                diagnosisDate: "2010-09-15",
                notes: "Prescribed Doliprane 1000mg, 2 times a day"
            }
        ],
        isVIP: true
    };

    try {
        const response = await axios.post(SERVER_URL, userInputs);
        console.log('Generated EHR:', response.data);
    } catch (error) {
        console.error('Error generating EHR:', error);
    }
}

requestEHR();
