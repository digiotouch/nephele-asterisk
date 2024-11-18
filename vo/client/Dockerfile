# client/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install axios form-data
COPY . .
CMD ["node", "client.js"]
