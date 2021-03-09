const express = require('express');
const bodyParser = require("body-parser");
const api = express();
const CryptoJS = require("crypto-js");
const getJson = require('get-json');
const fetch = require('node-fetch');
const { app, BrowserWindow } = require("electron");
const axios = require('axios');
const https = require('https')
const fs = require('fs');
const tmi = require('tmi.js');

let lastSongs = []
let ls = ''
let data = require('./assets/data.json');

let key = data.key

let songData = {
   img: data.img,
   details: "We can't connect to your quest",
   state: "Please enter a valid ip on the app",
   songAuthor: "Please enter a valid ip on the app",
   mapDifficulty: "",
   mapAuthor: "ItzWiresDev#6193",
   time1: 0,
   time2: 0,
   score: 0,
   combo: 0,
   health: [0, 0]
}

api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());
api.use(bodyParser.raw());

process.on('uncaughtException', err => {
   console.log('oof')
})

const opts = {
    identity: {
       username: 'BSStreamerTools',
       password: 'oauth:wpjhnr67ae3x5kdpasv8dfqx6kmkzg'
    },
    channels: [
       data.twitch
    ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler (target, context, msg, self) {
   if (self) { return; }

   if(data.username === "SkipLogin")return;
   if(data.password === "SkipLogin")return;

    let commandName = msg.trim();

    console.log(commandName)

    commandName = commandName.split(' ')

    if(commandName[0] === "!bsr"){
        const options = {
            hostname: 'beatsaver.com',
            port: 443,
            path: '/api/maps/detail/'+encodeURIComponent(commandName[1]),
            headers: {
               'User-Agent': 'Quest-Streamer-Tools/0.1',
               'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'GET'
        }
    
        https.get(options, function (res) {
            var json = '';
        
            res.on('data', function (chunk) {
                json += chunk;
            });
        
            res.on('end', function () {
                if (res.statusCode === 200) {
                    try {
                        var data1 = JSON.parse(json);
    
                        fetch('https://bs.wiresdev.ga/api/song.add?hash='+data1.hash+'&name='+data.username)

                        client.say(target, 'You requested '+data1.metadata.songName+' by '+data1.metadata.songAuthorName)
                    } catch (e) {
                        console.log('Error parsing JSON!');
                    };
                } else {
                    console.log('Status:', res.statusCode);
                };
            }).on('error', function (err) {
                console.log('Error:', err);
            });
        });
    }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}


try{
   const client = new tmi.client(opts);

   client.on('message', async function(target, context, msg, self){
      if (self) { return; }

      console.log(msg)
   });

   client.on('connected', onConnectedHandler);

   function onConnectedHandler (addr, port) {
      console.log(`* Connected to ${addr}:${port}`);
   } 
} catch(e){
   console.log(e)
}

setInterval(async function(){
   //console.log(key)

   var s = require('net').Socket();
   try{
      s.connect(3501, data.qIP)
      s.on('data', async function(d){
         //console.log(d.toString("utf-8", 4, d.readUIntBE(0, 4) + 4))
         let e = JSON.parse(d.toString("utf-8", 4, d.readUIntBE(0, 4) + 4))
         
         if(e.details != "In Menu"){
            if(e.multiplayer != true){
               if(ls != (e.songAuthor+' - '+e.details)){
                  lastSongs.push(songData)
               }
      
               ls = e.songAuthor+' - '+e.details

               let hash = e.levelID.split('custom_level_').join('')

               const options = {
                  hostname: 'beatsaver.com',
                  port: 443,
                  path: '/api/maps/by-hash/'+hash,
                  headers: {
                     'User-Agent': 'Quest-Streamer-Tools/0.1',
                     'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  method: 'GET'
               }

               https.get(options, function (res) {
                  var json = '';
              
                  res.on('data', function (chunk) {
                      json += chunk;
                  });
              
                  res.on('end', function () {
                      if (res.statusCode === 200) {
                          try {
                              var data = JSON.parse(json);
                              if(data === "Not Found"){
                                 getJson('https://api.deezer.com/search?q='+e.songAuthor+' - '+e.details).then(data => {
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
                              } else{
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
         
                                 songData.img = 'https://beatsaver.com'+data.coverURL
                              }
                          } catch (e) {
                              console.log('Error parsing JSON!');
                          }
                      } else {
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

                        //console.log('Status:', res.statusCode);
                      }
                  });
              }).on('error', function (err) {
               console.log('oof')
              });
            }
         } else{
            songData.img = data.img
         }
         
         songData.details = e.details
         songData.state = e.state
         songData.mapAuthor = e.mapAuthor
         songData.mapDifficulty = e.mapDifficulty
         songData.songAuthor = e.songAuthor
         songData.mapAuthor = e.mapAuthor
         
         if(e.multiplayer === true){
            if(e.details === "Multiplayer - In Lobby"){
               songData.img = data.img
               songData.details = e.details
               songData.state = e.state
               songData.mapAuthor = e.mapAuthor
               songData.mapDifficulty = e.players
               songData.songAuthor = e.songAuthor
               songData.mapAuthor = e.mapAuthor
            } else{
               if(ls != (e.songAuthor+' - '+e.details)){
                  lastSongs.push(songData)
               }
      
               ls = e.songAuthor+' - '+e.details

               let hash = e.levelID.split('custom_level_').join('')

               const options = {
                  hostname: 'beatsaver.com',
                  port: 443,
                  path: '/api/maps/by-hash/'+hash,
                  headers: {
                     'User-Agent': 'Quest-Streamer-Tools/0.1',
                     'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  method: 'GET'
               }

               https.get(options, function (res) {
                  var json = '';
              
                  res.on('data', function (chunk) {
                      json += chunk;
                  });
              
                  res.on('end', function () {
                     if (res.statusCode === 200) {
                        try {
                           var data = JSON.parse(json);
                           if(data === "Not Found"){
                              getJson('https://api.deezer.com/search?q='+e.songAuthor+' - '+e.details).then(data => {
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
                           } else{
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
      
                              songData.img = 'https://beatsaver.com'+data.coverURL
                           }
                        } catch (e) {
                           console.log('Error parsing JSON!');
                        }
                     } else {
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

                     //console.log('Status:', res.statusCode);
                     }
                  });
               }).on('error', function (err) {
                  console.log('Error:', err);
               });

               songData.details = e.details
               songData.state = e.state
               songData.mapAuthor = e.mapAuthor
               songData.mapDifficulty = e.mapDifficulty
               songData.songAuthor = e.songAuthor
               songData.mapAuthor = e.mapAuthor
            }
         }

         if(data.username != "SkipLogin"){
            if(data.password != "SkipLogin"){
               axios.post('https://bs.wiresdev.ga/api/update', {
                  key: key,
                  details: songData.details,
                  img: songData.img,
                  mapAuthor: songData.mapAuthor,
                  mapDifficulty: songData.mapDifficulty,
                  songAuthor: songData.songAuthor,
                  state: songData.state,
                  time1: songData.time1,
                  time2: songData.time2
               }).then((res) => {
                  
               }).catch((err) => {
                  console.log(err)
                  console.log('oof')
               });
            }
         }
      });
      s.end()
   } catch(e){

   }
}, 5000)

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

api.get('/obs.combo', async function(req, res){
   res.render(__dirname + '/views/combo.ejs', {
      data: songData,
   })
})

api.get('/obs.health', async function(req, res){
   res.render(__dirname + '/views/health.ejs', {
      data: songData,
   })
})

api.get('/obs.score', async function(req, res){
   res.render(__dirname + '/views/score.ejs', {
      data: songData,
   })
})

api.post('/api.post/qip', async function(req, res){
   data.qIP = req.body.ip

   let newData = JSON.stringify(data);

   fs.writeFile("./assets/data.json", newData, (err) => {});

   res.redirect('/main')
})

api.post('/api.post/twitch', async function(req, res){
   data.twitch = req.body.name

   let newData = JSON.stringify(data);

   fs.writeFile("./assets/data.json", newData, (err) => {});

   res.redirect('/main')
})

api.post('/api.post/img', async function(req, res){
   data.img = req.body.img

   let newData = JSON.stringify(data);

   fs.writeFile("./assets/data.json", newData, (err) => {});

   songData.img = req.body.img

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

   api.get('/srm.clear', async function(req, res){
      axios.post('https://bs.wiresdev.ga/api/srm/clear', {
         key: key,
      }).then((data) => {

      }).catch((err) => {
         console.log('oof')
      });
   })

   api.get('/skipLogin', async function(req, res){
      win.loadFile(__dirname + '/views/index.html');

      data.username = 'SkipLogin'
      data.password = 'SkipLogin'

      let newData = JSON.stringify(data);

      fs.writeFile("./assets/data.json", newData, (err) => {});
   
      res.redirect('/main')

      
   })

   api.get('/api/tab.home', async function(req, res){
      win.loadFile(__dirname + '/views/index.html');
   })

   api.get('/api/tab.widgets', async function(req, res){
      win.loadFile(__dirname + '/views/wid.html');
   })

   api.get('/api/tab.srm', async function(req, res){
      win.loadFile(__dirname + '/views/srm.html');
   })

   api.get('/api/tab.lastPlayed', async function(req, res){
      win.loadFile(__dirname + '/views/lplayed.html');
   })

   api.get('/main', async function(req, res){
      const postData = {
         appName: 'Beat Saber Streamer Tools',
         uname: data.username,
         pass: data.password,
      };

      if(data.username != "SkipLogin"){
         if(data.password != "SkipLogin"){
            axios.post('https://acc.wiresdev.ga/api/login', postData)
               .then((res1) => {
                  if(res1.data.error)return win.loadFile(__dirname + '/views/loginError.html')

                  res.render(__dirname + '/views/main.ejs', {
                     data: data,
                     user: res1.data
                  })
               }).catch((err) => {
                  console.error(err);
               });
         } else {
            res.render(__dirname + '/views/main.ejs', {
               data: data,
               user: {uname: "Guest", discord: {}}
            })
         }
      } else {
         res.render(__dirname + '/views/main.ejs', {
            data: data,
            user: {uname: "Guest", discord: {}}
         })
      }
   })

   api.get('/user', async function(req, res){
      const postData = {
         appName: 'Beat Saber Streamer Tools',
         uname: data.username,
         pass: data.password,
      };

      if(data.username != "SkipLogin"){
         if(data.password != "SkipLogin"){
            axios.post('https://acc.wiresdev.ga/api/login', postData)
               .then((res1) => {
                  res.json(res1.data)
               }).catch((err) => {
                  console.log(err);
               });
         } else {
            res.json({uname: "Guest", discord: {}})
         }
      } else {
         res.json({uname: "Guest", discord: {}})
      }
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
   win.removeMenu()
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
   
         if(data.username != "SkipLogin"){
            if(data.password != "SkipLogin"){
               axios.post('https://acc.wiresdev.ga/api/login', postData)
                  .then((res) => {

                     if(data.key === ""){
                        if(data.username != "SkipLogin"){
                           if(data.password != "SkipLogin"){
                              axios.post('https://bs.wiresdev.ga/api/add', {name: res.data.uname}).then((res1) => {
                                 key = res1.data.key
                                 data.key = key

                                 let newData = JSON.stringify(data);

                                 fs.writeFile("./assets/data.json", newData, (err) => {});
                              }).catch((err) => {
                                 console.log(err);
                              });
                           }
                        }
                     }

                     if(res.data.error)return win.loadFile(__dirname + '/views/loginError.hotml')
                  }).catch((err) => {
                     console.error(err);
                  });
            }
         }

         win.setSize(1000, 600)

         win.loadFile(__dirname + '/views/index.html')
      }
   }, 2000)
})

api.listen(2078)