const console = require('console');
const RPC = require('discord-rpc');
const fetch = require('node-fetch');

let client = new RPC.Client({ transport: 'ipc' });
let type = ['Easy', 'Normal', 'Hard', 'Expert', 'Expert +']

let slide = 0

client.on('ready', () => {
    setInterval(function(){
        fetch('http://localhost:2078/api')
        .then(data => data.json())
        .then(res => {
            if(res.connected === false)return;
            let details = ''
            let state = ''

            if(res.location != 0){
                if(res.location === 5){
                    state = 'In Multiplayer Lobby'
                    details = res.players + ' out of ' + res.maxPlayers
                } else{
                    if(res.location === 2){
                        state =  res.levelName + ' (' + type[res.difficulty] + ') Multiplayer'
                        if(res.mapAuthor === ""){
                            details.innerHTML =  res.songAuthor
                        } else{
                            details =  res.songAuthor + ' [' + res.levelAuthor + ']'
                        }
                    } else {
                        if(res.location === 4){
                            state =  res.levelName + ' (' + type[res.difficulty] + ') Campaign'
                            if(res.mapAuthor === ""){
                                details =  res.songAuthor
                            } else{
                                details =  res.songAuthor + ' [' + res.levelAuthor + ']'
                            }
                        } else{
                            if(res.location === 4){
                                state =  res.levelName + ' (' + type[res.difficulty] + ') Tutorial'
                                if(res.mapAuthor === ""){
                                    details =  res.songAuthor
                                } else{
                                    details =  res.songAuthor + ' [' + res.levelAuthor + ']'
                                }
                            } else{
                                state =  res.levelName + ' (' + type[res.difficulty] + ')'
                                if(res.mapAuthor === ""){
                                    details =  res.songAuthor
                                } else{
                                    details =  res.songAuthor + ' [' + res.levelAuthor + ']'
                                }
                            }
                        }
                    }
                }
            } else{
                if(res.paused){
                    state =  res.levelName + ' (' + type[res.difficulty] + ')'
                    if(res.mapAuthor === ""){
                        details =  res.songAuthor
                    } else{
                        details =  res.songAuthor + ' [' + res.levelAuthor + ']'
                    }
                } else{
                    state =  "In Menu"
                    details =  ''
                }
            }

            client.setActivity({
                details: details,
                state: state,
                largeImageKey: 'bsquare',
                smallImageKey: 'bsquare',
                largeImageText: 'StreamerTools Quest',
                smallImageText: 'Made by ItzWiresDev#6193',
                startTimestamp: new Date(),
                buttons: [
                    { label: 'Get BeatSaber Streamer Tools', url: 'https://github.com/wiresboy-exe/streamToolsDesktop' }
                ]
            })
    
            slide++
        })
    }, 5000)  
})

client.login({ clientId: '840608937627746344' })