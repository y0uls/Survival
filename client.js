var fs = require('fs');
var path = require('path');
const colors = require('colors');
var localIpV4Address = require("local-ipv4-address");

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

fs.readFile('./config.json', 'utf8', function(err, contents) {
    if (err) {
		return console.log(err.red);
    } else {
		const data = JSON.parse(contents);
		var keyPass = data.keyPass;
		var serverAddress = data.serverAddress;
		var filePath = data.filePath;
		var io = require('socket.io-client');
		var socket = io.connect('http://'+serverAddress+':8085');
		console.log("------------------------------------------\nSending connection to "+serverAddress+"...\n------------------------------------------");
		localIpV4Address().then(function(ipAddress){
			socket.on('client', function () {
				socket.emit('validity', { keyPass: keyPass, ipAddress: ipAddress });
				socket.on('approved', function (approved) {
					if(approved=="true"){
						console.log('Connection with '.green+serverAddress.green+' successfully established !'.green);
						
						fs.readdir(filePath, function (err, files) {
							if (err) {
								return console.log('Unable to scan directory: ' + err);
							} 
							files.forEach(function (fileNameInit) {
								fileData = fs.readFileSync(path.join(filePath, fileNameInit));
								socket.emit('data', { data: fileData, name: fileNameInit});
							});
							
							console.log("Initial sending successfully".green+' on '.green+date().green+' at '.green+heure().green+'.'.green);
							fs.watch(filePath, {recursive:true}, function (eventType, fileModify) {
								if (eventType === 'change'){
									file = fs.readFileSync(path.join(filePath, fileModify));
									fileName = path.basename(fileModify);
									console.log(fileModify.yellow+" has modify".yellow+' on '.yellow+date().yellow+' at '.yellow+heure().yellow+'.'.yellow);
									socket.emit('data', { data: file, name: fileName});
								}
							});
						});
					}else{
						console.log('Connection with '.red+serverAddress.red+' failed !'.red);
						socket.disconnect();
					}
				});
			});
		});
    }
});