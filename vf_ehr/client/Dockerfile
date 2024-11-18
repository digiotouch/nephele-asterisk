# client/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install axios
COPY . .
CMD ["node", "client_ehr.js"]
