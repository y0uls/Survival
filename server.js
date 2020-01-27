var keyPass = "123456789";
var maxValue = "5";

var versionApp = "1.0.0";
var folder = "./received/";

//DISABLE FOR THE MOMENT
//const MongoClient = require('mongodb').MongoClient;
//const url = 'mongodb://root:admin68@localhost:27017';
//const dbName = 'backup';

const fs = require('fs');
const colors = require('colors');
const path = require('path');
const assert = require('assert');
var mkdirp = require('mkdirp');
var http = require('http');
process.noDeprecation = true;

function date(){
	var now = new Date();
	var annee = now.getFullYear();
	var mois = ('0'+now.getMonth()+2).slice(-2);
	var jour = ('0'+now.getDate()   ).slice(-2);
    var message = jour + '/' + mois + '/' + annee;
    return message;
}

function heure(){
     var date = new Date();
     var heure = date.getHours();
     var minutes = date.getMinutes();
     if(minutes < 10)
          minutes = "0" + minutes;
     return heure + "h" + minutes;
}

var server = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('{"version": "'+versionApp+'","error": false,"message": "Server is running..."}');
});
server.listen(8085);
console.log("---------------------");
console.log("Server is running...");
console.log("---------------------");
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	socket.emit('client');
	socket.on('validity', function (accept) {
		var validity = accept.keyPass;
		var ipAddressClient = accept.ipAddress;
		if(validity==keyPass){
			socket.emit('approved', 'true');
			//OLD METHOD -- NOT WORKING IN DOCKER
			//var ipAddressClient = socket.handshake.address.replace('::ffff:', '');
			console.log('Client connected => '+ipAddressClient);
			socket.on('data', function (value) {
				var data = value.data;
				var fileName = value.name;
				var extensionFile = path.extname(value.name);
				var dateReceived = Date.now();
				var clientFolder = folder+ipAddressClient+'/'+fileName+'/';
				mkdirp(clientFolder, function(err) {
					var savedFile = clientFolder+dateReceived+extensionFile;
					fs.writeFile(savedFile, data, function(err) {
						if(err) {
							return console.log(err);
						}
						
						//DISABLE FOR THE MOMENT
						/*MongoClient.connect(url, function(err, client) {
							assert.equal(null, err);
							//console.log("Connected successfully to server");
							const db = client.db(dbName);
							const collection = db.collection('logs');
							
							var documents = {client:ipAddressClient, fichier:fileName, date:dateReceived};
							collection.insert(documents, {w: 1});
							client.close();
						});*/
						
						fs.readdir(clientFolder, (err, files) => {
							console.log('--> '.green+'New '+fileName.green+' received ('+files.length+'/'+maxValue+') from '+ipAddressClient.green+' on '+date().green+' at '+heure().green);
							if(files.length > maxValue){
								var arr = [];
								var files = fs.readdirSync(clientFolder);
								files.forEach(file => {
								  let fileStat = fs.statSync(clientFolder + '/' + file).isDirectory();
								  if(!fileStat) {
									arr.push(parseInt(file.split('.').slice(0, -1).join('.')));
								  }
								});
								var oldData = Math.min(...arr);
								fs.unlinkSync(clientFolder+oldData+extensionFile);
								console.log("--> ".red+"Remove old "+fileName+" ("+maxValue+"/"+maxValue+") : "+oldData+extensionFile);
							}
						});
					});
				
				});
			
				
			});
			socket.on('disconnect', function() {
				console.log('Client disconnected => '+ipAddressClient);
			});
		}else{
			socket.emit('approved', 'notTrue');
			socket.disconnect();
		}
	});   
});