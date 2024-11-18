# Dockerfile.java
FROM openjdk:11-jre-slim

# Install wget
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get clean

# Set up the working directory
WORKDIR /usr/src/app

# Download Leshan demo server JAR file
RUN wget https://repo1.maven.org/maven2/org/eclipse/leshan/leshan-demo-server/2.0.0-M16/leshan-demo-server-2.0.0-M16-jar-with-dependencies.jar

# Expose ports for Leshan server
EXPOSE 5683/udp 8080

# Start the Leshan server
CMD java -jar leshan-demo-server-2.0.0-M16-jar-with-dependencies.jar
