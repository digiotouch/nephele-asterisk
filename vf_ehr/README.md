To run the Virtual Function that generates the EHR and sends it to a server

Build and run
Go to the vf_ehr folder
Run docker compose up --build

It will start the http server at port 4000. To change the port number or run it as a https server, navigate to the server folder and modify the server.
The generated EHR is stored into the server/storage folder.
