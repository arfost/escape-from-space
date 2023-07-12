/* eslint-disable promise/no-nesting */
// const admin = require('firebase-admin');
const { initializeApp } = require("firebase-admin/app");
const { onCall } = require("firebase-functions/v2/https");
const { getDatabase } = require("firebase-admin/database");
const efsHelper = require('./efsHelper.js');

const app = initializeApp({
    apiKey: "AIzaSyDPO-yGJev7gxGLCGkOKDMlDlZsjlZ--i0",
    authDomain: "escape-from-space.firebaseapp.com",
    databaseURL: "https://escape-from-space.firebaseio.com",
    projectId: "escape-from-space",
    storageBucket: "escape-from-space.appspot.com",
    appId: "1:1016708495078:web:7a9b748c8e29383e"
});

const database = getDatabase(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createGame = onCall({cors: true}, async(request)=>{
    
    // // Grab the current value of what was written to the Realtime Database.
    const {uid} = request.auth;
    let gameRef = database.ref('games').push();

    let user = (await database.ref(`users/${uid}`).once('value')).val();

    let game = {
        players : [{
            uid,
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
    const {uid} = context.auth;
    let gameRef = database.ref(`games/${key}`);

    let user = (await database.ref(`users/${uid}`).once('value')).val();    
    return get(gameRef).then(snap=>{
        let game = snap.val();
        if(game.players.length >=5){
            throw new Error('This game is at maximum capacity'); //TODO trad
        }
        game.players.push({
            uid,
            name:user.customName ? user.customName : user.displayName,
        })
        
        return database.ref(`games/${key}`).set(game).then(res=>key);
    });
});

exports.quitGame = onCall((key, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const {uid} = context.auth;
    let gameRef = database.ref(`games/${key}`);    
    return get(gameRef).then(snap=>{
        let game = snap.val();
        game.players = game.players.filter(pl=>pl.uid !== uid);
        if(game.gameInfo.toPlay>=game.players.length){
            game.gameInfo.toPlay = 0;
        }
        
        return database.ref(`games/${key}`).set(game).then(res=>key);
    });
});

exports.launchGame = onCall((key, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const {uid} = context.auth;
    let gameRef = database.ref(`games/${key}`);
    let cellsRef = database.ref(`cells/${key}`);    
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
            return player;
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
        
        return database.ref(`games/${key}`).set(game).then(res=>key);
    });
});