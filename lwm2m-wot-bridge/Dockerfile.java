# Dockerfile.java
FROM openjdk:11-jre-slim

# Install wget
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get clean

# Set up the working directory
WORKDIR /usr/src/app

# Download Leshan demo server and client JAR files
RUN wget https://repo1.maven.org/maven2/org/eclipse/leshan/leshan-demo-server/2.0.0-M16/leshan-demo-server-2.0.0-M16-jar-with-dependencies.jar && \
    wget https://repo1.maven.org/maven2/org/eclipse/leshan/leshan-demo-client/2.0.0-M16/leshan-demo-client-2.0.0-M16-jar-with-dependencies.jar

# Expose ports for Leshan server
EXPOSE 5683 8080

# Set environment variables for the demo client
ENV CLIENT_NAME demo-client
ENV CLIENT_URI coap://leshan:5683

# Start both the Leshan server and client
CMD java -jar leshan-demo-server-2.0.0-M16-jar-with-dependencies.jar & \
    java -jar leshan-demo-client-2.0.0-M16-jar-with-dependencies.jar -n $CLIENT_NAME -u $CLIENT_URI
