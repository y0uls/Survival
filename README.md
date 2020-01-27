<h1><pre>
  _________                  .__              .__   
 /   _____/__ ____________  _|__|__  _______  |  |  
 \_____  \|  |  \_  __ \  \/ /  \  \/ /\__  \ |  |  
 /        \  |  /|  | \/\   /|  |\   /  / __ \|  |__
/_______  /____/ |__|    \_/ |__| \_/  (____  /____/
        \/                                  \/      
</pre></h1>
Survival allows you to save a file in real time if it is modified on a remote server.

Survival uses socket.io to transfer data.


- Docker-compose example :

<pre>
version: "2.4"
services:
  server:
    image: y0uls/survival
    container_name: survival_server
    restart: always
    ports:
      - 8085:8085
    volumes:
      - ./received:/usr/src/app/received
    command: ["node", "server.js"]

  client:
    image: y0uls/survival
    container_name: survival_client
    restart: always
    ports:
      - 8085:8085
    volumes:
      - ./config.json:/usr/src/app/config.json
      - ./send:/usr/src/app/send
    command: ["node", "client.js"]
</pre>

- Config.json example :

<pre>
{
"keyPass":"123456789",
"serverAddress":"192.168.0.1",
"filePath":"./send"
}
</pre>

<i>It is possible to modify the "keyPass" server directly in server.js as well as the "maxValue" value which corresponds to the number of retained files.</i>
