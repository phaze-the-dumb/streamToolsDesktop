const fetch = require('node-fetch');
const {shell, app, BrowserWindow} = require('electron');
const express = require('express');
const { URL } = require("url");
const fs = require('fs');
const console = require('console');

let plugins = []

const api = express();

fs.readdir(__dirname + '/plugins', function(err, files){
    if(err)return console.error(err)

    files.forEach(file => {
        plugins.push({name: file, plugin: require('./plugins/'+file)})
    })
})

let questIP = ''
let connected = false
let befconnected = false
let ver = '0.2.2'
let updateNeeded = false

let songData = {}

api.get('/api', async function(req, res){
    res.header('Access-Control-Allow-Origin', '*')
 
    res.json(songData)
})

api.get('/api/ver', async function(req, res){
    fetch('https://wiresdev.ga/projects/bs/streamer-tools/vers.json').then(data => data.json()).then(data => {
       res.json({current: data.current, this: ver})
    })
})

api.get('/api/raw', async function(req, res){
    res.header('Access-Control-Allow-Origin', '*')
 
    res.json(songData)
})

api.get('/api/ip', async function(req, res){
    res.json({ip: questIP})
})

api.get('/obs', async function(req, res){
    res.render(__dirname + '/views/obs.ejs', {
       data: songData,
    })
})
 
api.get('/obs.stats', async function(req, res){
    res.render(__dirname + '/views/stats.ejs', {
       data: songData,
    })
})
 
api.get('/obs.time', async function(req, res){
    res.render(__dirname + '/views/time.ejs', {
       data: songData,
    })
})
 
api.get('/obs.energy', async function(req, res){
    res.render(__dirname + '/views/energy.ejs', {
       data: songData,
    })
})
 
api.get('/obs.combo', async function(req, res){
    res.render(__dirname + '/views/combo.ejs', {
       data: songData,
    })
})
 
api.get('/obs.rank', async function(req, res){
    res.render(__dirname + '/views/rank.ejs', {
       data: songData,
    })
})
 
api.get('/obs.score', async function(req, res){
    res.render(__dirname + '/views/score.ejs', {
       data: songData,
    })
})

api.get('/api/overlays', async function(req, res){
    fs.readdir(__dirname + '/overlays', (err, files) => {
        if (err)
            console.log(err);
        else {
            files = files.filter(x => x != "placeholder")
            res.json(files)
        }
    }) 
})

api.get('/open', async function(req, res){
    const url = new URL('https://api.wiresdev.ga'+req.url);
    var id = url.searchParams.get('Url');

    shell.openExternal(id)

    res.send('ok')
})

api.use(function(req, res, next){
    if(req.url.startsWith('/overlay/')){
        let file = req.url.replace('/overlay/', '')
        fs.readdir(__dirname + '/overlays', (err, files) => {
            if (err)
                console.log(err);
            else {
                res.sendFile(__dirname + '/overlays/'+files[file])
            }
        }) 
    } else{
       next();
    }
})

function createWindow () {
    const win = new BrowserWindow({
        width: 400,
        height: 500,
        webPreferences: {
            
        }
    })

    win.removeMenu();
    win.setIcon(__dirname + '/assets/icon.png');

    api.get('/api/tab.home', async function(req, res){
        win.loadFile('views/index.html');
    })
    
    api.get('/api/tab.overlays', async function(req, res){
        win.loadFile('views/overlays.html');
    })
    
    api.get('/api/tab.widgets', async function(req, res){
        win.loadFile('views/wid.html');
    })
    
    api.get('/api/tab.download', async function(req, res){
        win.loadFile('views/dwnload.html');
    })

    fetch('https://wiresdev.ga/projects/bs/streamer-tools/vers.json').then(data => data.json()).then(data => {
        if(data.current != ver){
            updateNeeded = true
        } else{
            setInterval(function(){
                fetch('http://'+questIP).then(data => data.json()).then(data => {
                    connected = true
            
                    if(befconnected != connected){
                        win.setSize(1000, 600)
                        win.loadFile('views/index.html')
                        befconnected = connected
                    }
                    songData = data
                    songData.connected = true
                    fetch('http://'+questIP+'/cover/base64').then(data => data.text()).then(data => {
                        songData.img = data
                        connected = true
                        songData.connected = true
                    }).catch(e => {
                        connected = false 
                        songData.connected = false
                    })
                }).catch(e => {
                    connected = false
                    songData.connected = false
                })
            }, 500)
        }

        if(updateNeeded === false){
            if(connected === false){
                win.loadFile('views/load.html');
            } else{
                win.setSize(1000, 600)
                win.loadFile('views/index.html');
            }
        } else{
            win.loadFile('views/update.html');
        }
    })
}

app.whenReady().then(() => {
    createWindow()
    
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

GetLocalIPs().forEach(ip => {
    SetupMulticast(ip)
})

function SetupMulticast(localIP) {
    var PORT = 53500;
    var HOST = localIP;
    var MCASTIP = '232.0.53.5';
    var dgram = require('dgram');
    var client = dgram.createSocket('udp4');

    client.on('listening', function () {
        var address = client.address();
        client.setBroadcast(true)
        client.setMulticastTTL(128); 
        client.addMembership(MCASTIP, HOST);
        console.log('UDP Client listening on ' + address.address + ":" + address.port);
    });

    client.on('message', function (message, remote) {   
        console.log(message.toString())
        questIP = JSON.parse(message).HTTP
        ipInQueue = remote.address;
    });

    client.bind(PORT, HOST);
}

function GetLocalIPs() {                    // This will get the IPs of all network interfaces
	const  { networkInterfaces }  = require('os')
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
                console.log("adding " + net.address)
            }
        }
    }
    return results
}

api.listen(2078)