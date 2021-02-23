const express = require('express');
const bodyParser = require("body-parser");
const api = express();
const CryptoJS = require("crypto-js");
const getJson = require('get-json');
const { app, BrowserWindow } = require("electron");
const axios = require('axios');
const fs = require('fs');

let lastSongs = []
let ls = ''
let data = require('./assets/data.json');

let songData = {
   img: "https://wiresdev.ga/images/logo.png",
   details: "We can't connect to your quest",
   state: "Please enter a valid ip on the app",
   songAuthor: "Please enter a valid ip on the app",
   mapDifficulty: "",
   mapAuthor: "ItzWiresDev#6193",
   time1: 0,
   time2: 0,
}

api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());
api.use(bodyParser.raw());

process.on('uncaughtException', err => {
   console.log('There was an uncaught error', err)
})

setInterval(async function(){
   var s = require('net').Socket();
   try{
      s.connect(3501, data.qIP)
      s.on('data', async function(d){
         console.log(d.toString("utf-8", 4, d.readUIntBE(0, 4) + 4))
         let e = JSON.parse(d.toString("utf-8", 4, d.readUIntBE(0, 4) + 4))
         
         if(e.details != "In Menu"){
            if(e.multiplayer != true){
               getJson('https://api.deezer.com/search?q='+e.songAuthor+' - '+e.details).then(data => {
                  if(ls != (e.songAuthor+' - '+e.details)){
                     lastSongs.push(songData)
                  }

                  ls = e.songAuthor+' - '+e.details

                  data = data.data[0]

                  if(e.remaining){
                     songData.time1 = e.time
                     songData.time2 = e.endTime

                     if(songData.time1 < 0){
                        songData.time1 = 0
                     }
                  } else{
                     time1 = 0
                     time2 = 100
                  }

                  songData.img = data.album.cover_big
               })
            }
         } else{
            songData.img = data.img
         }

         if(e.multiplayer === true){
            if(e.details === "Multiplayer - In Lobby"){
               songData.details = e.details
               songData.state = e.state
               songData.mapAuthor = e.mapAuthor
               songData.mapDifficulty = e.players
               songData.songAuthor = e.songAuthor
               songData.mapAuthor = e.mapAuthor
            } else{
               songData.details = e.details
               songData.state = e.state
               songData.mapAuthor = e.mapAuthor
               songData.mapDifficulty = e.mapDifficulty
               songData.songAuthor = e.songAuthor
               songData.mapAuthor = e.mapAuthor
            }
         } else{
            songData.details = e.details
            songData.state = e.state
            songData.mapAuthor = e.mapAuthor
            songData.mapDifficulty = e.mapDifficulty
            songData.songAuthor = e.songAuthor
            songData.mapAuthor = e.mapAuthor
         }
      });
      s.end()
   } catch(e){

   }
}, 1000)

api.get('/api', async function(req, res){
   res.json(songData)
})

api.get('/lastPlayed', async function(req, res){
   res.json(lastSongs)
})

api.get('/obs', async function(req, res){
   res.render(__dirname + '/views/obs.ejs', {
      data: songData,
   })
})

api.get('/obs.time', async function(req, res){
   res.render(__dirname + '/views/time.ejs', {
      data: songData,
   })
})

api.post('/api.post/qip', async function(req, res){
   data.qIP = req.body.ip

   let newData = JSON.stringify(data);

   fs.writeFile("./assets/data.json", newData, (err) => {});

   res.redirect('/main')
})

api.post('/api.post/qip', async function(req, res){
   data.img = req.body.img

   let newData = JSON.stringify(data);

   fs.writeFile("./assets/data.json", newData, (err) => {});

   res.redirect('/main')
})

app.on("ready", async function(){
   let win = new BrowserWindow({
      width: 400,
      height: 500,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: true
      }
   });

   api.get('/login', async function(req, res){
      res.send(`<center><form method="POST" action="/login"><input class="text" name="uname" type="text" placeholder="Enter Username"><br><br><input class="text" name="pass" type="password" placeholder="Enter Password"><br><br><button class="button" type="submit"><span>Login </span></button></form><style>.center {position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);}body{border: 0px;margin: 0px;font-family: sans-serif;}.text{outline: none;border-top: none;border-left: none;border-right: none;font-size: 20px;}.button {border-radius: 4px;background-color: #f4511e;border: none;color: #FFFFFF;text-align: center;font-size: 28px;padding: 20px;width: 200px;transition: all 0.5s;cursor: pointer;margin: 5px;}.button span {cursor: pointer;display: inline-block;position: relative;transition: 0.5s;}.button span:after {position: absolute;opacity: 0;top: 0;right: -20px;transition: 0.5s;}.button:hover span {padding-right: 25px;}.button:hover span:after {opacity: 1;right: 0;}</style></center>`)
   })

   api.get('/api/tab.home', async function(req, res){
      win.loadFile(__dirname + '/views/index.html');
   })

   api.get('/api/tab.widgets', async function(req, res){
      win.loadFile(__dirname + '/views/wid.html');
   })

   api.get('/api/tab.lastPlayed', async function(req, res){
      win.loadFile(__dirname + '/views/lplayed.html');
   })

   api.get('/main', async function(req, res){
      res.render(__dirname + '/views/main.ejs', {
         data: data,
      })
   })

   api.get('/user', async function(req, res){
      const postData = {
         appName: 'Beat Saber Streamer Tools',
         uname: data.username,
         pass: data.password,
      };

      axios.post('https://acc.wiresdev.ga/api/login', postData)
         .then((res1) => {
            res.json(res1.data)
         }).catch((err) => {
            console.log(err);
         });
   })
   
   api.post('/login', async function(req, res){
      var password = CryptoJS.MD5(req.body.pass).toString();

      const postData = {
         appName: 'Beat Saber Streamer Tools',
         uname: req.body.uname,
         pass: password,
      };

      axios.post('https://acc.wiresdev.ga/api/login', postData)
         .then((res) => {
            console.log(res.data)
            if(res.data.error)return win.loadFile(__dirname + '/views/loginError.html');
         }).catch((err) => {
            console.log(err);
         });

      data.password = password
      data.username = req.body.uname

      let newData = JSON.stringify(data);

      fs.writeFile("./assets/data.json", newData, (err) => {});
   
      win.setSize(1000, 600)

      win.loadFile(__dirname + '/views/index.html');
   })

   //win.setFullScreen(true);
   //win.removeMenu()
   win.setIcon('./assets/icon.png');

   win.loadFile(__dirname + '/views/load.html')

   setTimeout(function(){
      if(data.username === "" || data.password === ""){
         win.loadFile(__dirname + '/views/login.html')
      } else{
         const postData = {
            appName: 'Beat Saber Streamer Tools',
            uname: data.username,
            pass: data.password,
         };
   
         axios.post('https://acc.wiresdev.ga/api/login', postData)
            .then((res) => {
               if(res.data.error)return win.loadFile(__dirname + '/views/loginError.html')
            }).catch((err) => {
               console.error(err);
            });

         win.setSize(1000, 600)

         win.loadFile(__dirname + '/views/index.html')
      }
   }, 2000)
})

api.listen(2078)
