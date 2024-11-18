# server/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install express multer
COPY . .
RUN mkdir uploads
EXPOSE 3000
CMD ["node", "server.js"]
