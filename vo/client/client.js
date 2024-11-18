// client/client.js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const SERVER_URL = 'http://server:3000/upload';
const IMAGE_PATH = 'image.png';  // Assume image.png exists in the client directory

async function sendImage() {
    const form = new FormData();
    form.append('image', fs.createReadStream(IMAGE_PATH));

    try {
        const response = await axios.post(SERVER_URL, form, {
            headers: form.getHeaders()
        });
        console.log('Server response:', response.data);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

sendImage();


const SERVER_URL_2 = 'http://server:3000/upload-video';
const VIDEO_PATH = 'video.mov';  // Assume video.mov exists in the client directory

async function sendVideo() {
    const form = new FormData();
    form.append('video', fs.createReadStream(VIDEO_PATH));

    try {
        const response = await axios.post(SERVER_URL_2, form, {
            headers: form.getHeaders()
        });
        console.log('Server response:', response.data);
    } catch (error) {
        console.error('Error uploading video:', error);
    }
}

sendVideo();
