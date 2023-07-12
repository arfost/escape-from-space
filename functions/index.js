/* eslint-disable promise/no-nesting */
// const admin = require('firebase-admin');
const { initializeApp } = require("firebase-admin/app");
const { onCall } = require("firebase-functions/v2/https");
const { getDatabase, ref, push } = require("firebase-admin/database");
const efsHelper = require('./efsHelper.js');

initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createGame = onCall(async(datas, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const uid = context.auth.uid;
    let gameRef = push(ref(getDatabase(),'games'));

    let user = (await get(ref(getDatabase(),'users/'+uid))).val();

    let game = {
        players : [{
            uid: uid,
            name: user.customName ? user.customName : user.displayName
        }],
        ready: false,
        loaded:true,
    }
    
    set(gameRef,game);


    return gameRef.key;
    
});

exports.joinGame = onCall(async(key, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const uid = context.auth.uid;
    let gameRef = ref(getDatabase(),'games/'+key);

    let user = (await get(ref(getDatabase(),'users/'+uid))).val();
    
    return get(gameRef).then(snap=>{
        let game = snap.val();

        if(game.players.length >=5){
            throw new Error('This game is at maximum capacity'); //TODO trad
        }
        game.players.push({
            uid:uid,
            name:user.customName ? user.customName : user.displayName,
        })
        
        return set(ref(getDatabase(),'games/'+key),game).then(res=>{
            return key;
        });
    });
});

exports.quitGame = onCall((key, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const uid = context.auth.uid;
    let gameRef = ref(getDatabase(),'games/'+key);
    
    return get(gameRef).then(snap=>{
        let game = snap.val();

        game.players = game.players.filter(pl=>pl.uid !== uid);
        if(game.gameInfo.toPlay>=game.players.length){
            game.gameInfo.toPlay = 0;
        }
        
        return set(ref(getDatabase(),'games/'+key),game).then(res=>{
            return key;
        });
    });
});

exports.launchGame = onCall((key, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const uid = context.auth.uid;
    let gameRef = ref(getDatabase(),'games/'+key);
    let cellsRef = ref(getDatabase(),'cells/'+key);
    
    cellsRef.set(efsHelper.newMap());
    
    return get(gameRef).then(snap=>{
        let game = snap.val();

        game.liveChars = efsHelper.getChars();
        game.deadChars = [];

        delete game.exitedChar;
        
        let charsKey = [];
        let roomKey = [];
        for(let i = 0; i<game.liveChars.length; i++){
            charsKey.push(i);
            roomKey.push(i+1);
        }

        charsKey = efsHelper.shuffleArray(charsKey);
        roomKey = efsHelper.shuffleArray(roomKey);
        game.players = efsHelper.shuffleArray(game.players);

        game.players = game.players.map((player)=>{
            player.chars = [charsKey.shift(), charsKey.shift()];
            return  player;
        })

        game.liveChars = game.liveChars.map((char)=>{
            char.pos = roomKey.shift();
            return char;
        })

        game.gameInfo = {
            turn: 1,
            toPlay:0,
            votes:0
        }

        game.ready = true;
        game.finished = false;
        
        return set(ref(getDatabase(),'games/'+key),game).then(res=>{
            return key;
        });
    });
});