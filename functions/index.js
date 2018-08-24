const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.manageUserGame = functions.database.ref('/users/{id}/game')
    .onUpdate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.

        const original = snapshot.after.val();
        const uid = context.params.id;

        console.log(context.auth, uid)
        if (context.auth !== undefined && uid !== context.auth.uid) {
            return admin.database().ref('/strangeActs/').push().set({
                writerUid: context.auth.uid,
                uid: uid,
                value: original,
            })
        }
        if(original === false){
            return
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
                return ref.set(value).then(()=>{
                    return snapshot.after.ref.set(value.key)
                })
            })
        }else{
            return admin.database().ref('games/'+original).once('value',snap=>{
                let game = snap.val();
                let actual = Number(game.playersNb.split('/')[0]);
                let max = Number(game.playersNb.split('/')[1]);
                if(actual < max){
                    actual++;
                    let player = {
                        position:'6/6',
                        uid: uid,
                        sight:5
                    }
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
                    }
                    return admin.database().ref('games/'+original).set(game)
                }else{
                    return snapshot.after.ref.set("error")
                }
            });
        }
    });
