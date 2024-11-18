// server/server_ehr.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 4000;

app.use(express.json());

class EHRGenerator {
    generateEHR(userInputs) {
        return {
            patient: {
                id: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
                firstName: userInputs.firstName || "John",
                lastName: userInputs.lastName || "Doe",
                dateOfBirth: userInputs.dateOfBirth || "1985-07-15",
                gender: userInputs.gender || "Male",
                contact: {
                    phone: userInputs.phone || "+1234567890",
                    email: userInputs.email || "john.doe@example.com",
                    address: userInputs.address || "123 Main Street, Anytown, USA"
                }
            },
            medicalHistory: userInputs.medicalHistory || [
                {
                    condition: "Hypertension",
                    diagnosisDate: "2015-06-20",
                    notes: "Managed with medication and lifestyle changes"
                }
            ],
            medications: userInputs.medications || [
                { name: "Metformin", dosage: "500 mg", frequency: "Twice daily" }
            ],
            allergies: userInputs.allergies || [
                { substance: "Penicillin", reaction: "Rash", severity: "Moderate" }
            ],
            vitals: {
                height: userInputs.height || "175 cm",
                weight: userInputs.weight || "78 kg",
                bloodPressure: userInputs.bloodPressure || "120/80 mmHg",
                heartRate: userInputs.heartRate || "72 bpm"
            },
            appointments: userInputs.appointments || [
                {
                    date: "2024-11-20",
                    time: "10:30 AM",
                    doctor: "Dr. Smith",
                    purpose: "Follow-up for diabetes"
                }
            ],
            labResults: userInputs.labResults || [
                {
                    test: "HbA1c",
                    result: "6.8%",
                    normalRange: "4.0-5.6%",
                    date: "2024-10-15"
                }
            ]
        };
    }
}

app.post('/generate-ehr', (req, res) => {
    const ehrGenerator = new EHRGenerator();
    const ehr = ehrGenerator.generateEHR(req.body);

    // Generate file name and store in the 'storage' folder
    const storageDir = path.join(__dirname, 'storage');
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir);
    }

    const fileName = `ehr-${ehr.patient.id}.json`;
    const filePath = path.join(storageDir, fileName);

    // Save EHR as a JSON file
    fs.writeFile(filePath, JSON.stringify(ehr, null, 2), (err) => {
        if (err) {
            console.error('Error saving EHR:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json({ message: 'EHR generated and saved', filePath });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
