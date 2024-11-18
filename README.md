# Asterisk

## WoT Thing Description ↔ LwM2M Object Definition conversion

Two endpoints:
- WoT to LwM2M: send a JSON-LD WoT Thing Description in the request body, get a LwM2M XML Object Definition as response
- LwM2M to WoT: send a LwM2M XML Object Definition in the request body, get a JSON-LD WoT Thing Description as response

### Build and run

`cd lwm2m2wot; docker compose up` or `cd wot2lwm2m; docker compose up`

A Postman collection is provided for reference.

## LwM2M Object ↔ WoT Thing data translation Proof of Concept

### Build and run

```
cd lwm2m-wot-bridge
docker compose up
```

This will:
1. Start a Leshan demo server on http://localhost:8080 and coap://localhost:5683
2. Connect an LwM2M demo-client to the Leshan demo server
3. Expose a WoT Thing bridged from LwM2M temperature sensor on http://localhost:8181

```
# Get Thing Description
wget http://localhost:8081/temperaturesensor

# Get device properties
wget http://localhost:8081/temperaturesensor/properties/
```

## WoT Thing ↔ LwM2M Object data translation Proof of Concept

### Build and run

```
cd wot-lwm2m-bridge
docker compose up
```

This will:
1. Expose a demo WoT Thing on http://localhost:8081/wotdemothing
2. Start a Leshan demo server on http://localhost:8080 and coap://localhost:5683
3. Connect an LwM2M device with Temperature and Humidity objects bridged from the WoT Thing
