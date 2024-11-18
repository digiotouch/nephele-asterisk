To run the Virtual Object that uploads an image and a video to an application server

Build and run
Go to the vo folder - cd vo
Run - docker compose up --build

It will start the http server at port 3000. To change the port number or run it as a https server, navigate to the server folder and modify the server.
The generated EHR is stored into the server/uploads folder.
