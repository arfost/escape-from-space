const functions = require('firebase-functions');
const admin = require('firebase-admin');

const efs = require('./glwrapper.js')

admin.initializeApp();

exports.manageUserGame = functions.database.ref('/users/{id}/game')
    .onUpdate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.

        const original = snapshot.after.val();
        const uid = context.params.id;

        if (context.auth !== undefined && uid !== context.auth.uid) {
            return admin.database().ref('/strangeActs/').push().set({
                writerUid: context.auth.uid,
                uid: uid,
                value: original,
            })
        }
        if(original === false){
            return 0
        }
        if(original.includes('new')){
            return admin.database().ref('gameRef').once("value").then(snap => {
                let value = snap.val();
                let ref = admin.database().ref('games').push();
                value.key = ref.key;
                value.creatorId = uid;
                value.name = original.split(":")[1];
                value.status = "waiting";
                value.playersNb = '0/2';
                value.players = [];
                return ref.set(value).then(()=>snapshot.after.ref.set(value.key))
            })
        }else{
            return admin.database().ref('games/'+original).once('value',snap=>{
                let game = snap.val();
                let actual = Number(game.playersNb.split('/')[0]);
                let max = Number(game.playersNb.split('/')[1]);
                if(actual < max){
                    actual++;
                    let player = efs.player.createChar({})
                    player.pos = efs.game.getStartingPos(game)
                    player.uid = uid;
                    game.playersNb = actual+'/'+max;
                    if(Array.isArray(game.players)){
                        game.players.push(player);
                    }else if(actual === 1){
                        game.players = [player]
                    }else{
                        console.log("oups : ", game.players)
                    }
                    if(actual === max){
                        game.status = "launched"
                        console.log(game.players)
                        game = efs.game.initGame(game);
                    }
                    return admin.database().ref('games/'+original).set(game)
                }else{
                    return snapshot.after.ref.set("error")
                }
            });
        }
    });

exports.playAction = functions.database.ref('users/{id}/action')
    .onWrite((snapshot, context)=>{
        // Grab the current value of what was written to the Realtime Database.

        const original = snapshot.after.val();
        const uid = context.params.id;

        if (context.auth !== undefined && uid !== context.auth.uid) {
            return admin.database().ref('/strangeActs/').push().set({
                writerUid: context.auth.uid,
                uid: uid,
                value: original,
            })
        }
        
        console.log("player is playing action ", original)
        return snapshot.after.ref.parent.once('value', snap=>{
            let user = snap.val();
            return admin.database().ref('games/'+user.game).once('value', snap=>{
                let game = snap.val()
                return admin.database().ref('games/'+user.game).set(efs.game.playAction(game, uid, original));
            })
        });
    });
