# server/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install express
COPY . .
EXPOSE 4000
CMD ["node", "server_ehr.js"]
