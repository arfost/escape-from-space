/* eslint-disable promise/no-nesting */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const efsHelper = require('./efsHelper.js');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createGame = functions.https.onCall((datas, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const uid = context.auth.uid;
    let gameRef = admin.database().ref('games').push();

    let game = {
        players : [{
            uid:uid,
            name:'roger 1'
        }],
        ready: false,
        loaded:true,
    }

    gameRef.set(game);


    return gameRef.key;
    
});

exports.joinGame = functions.https.onCall((key, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const uid = context.auth.uid;
    let gameRef = admin.database().ref('games/'+key);
    
    return gameRef.once('value').then(snap=>{
        let game = snap.val();

        if(game.players.length >=5){
            throw new Error('This game is at maximum capacity'); //TODO trad
        }
        game.players.push({
            uid:uid,
            name:'roger '+(game.players.length+1)
        })
        
        return admin.database().ref('games/'+key).set(game).then(res=>{
            return key;
        });
    });
});

exports.quitGame = functions.https.onCall((key, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const uid = context.auth.uid;
    let gameRef = admin.database().ref('games/'+key);
    
    return gameRef.once('value').then(snap=>{
        let game = snap.val();

        game.players = game.players.filter(pl=>pl.uid !== uid);
        if(game.gameInfo.toPlay>=game.players.length){
            game.gameInfo.toPlay = 0;
        }
        
        return admin.database().ref('games/'+key).set(game).then(res=>{
            return key;
        });
    });
});

exports.launchGame = functions.https.onCall((key, context)=>{
    // Grab the current value of what was written to the Realtime Database.
    const uid = context.auth.uid;
    let gameRef = admin.database().ref('games/'+key);
    let cellsRef = admin.database().ref('cells/'+key);
    
    cellsRef.set(efsHelper.newMap());
    
    return gameRef.once('value').then(snap=>{
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
        
        return admin.database().ref('games/'+key).set(game).then(res=>{
            return key;
        });
    });
});