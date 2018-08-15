const functions = require('firebase-functions');

exports.manageUserGame = functions.database.ref('/users/{id}/game')
    .onUpdate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.

        const original = snapshot.after.val();
        const uid = context.params.id;

        const writerUid = context.auth.uid;

        if (uid !== writerUid) {
            return functions.database.ref('/strangeActs/').push().set({
                writerUid: writerUid,
                uid, uid,
                value, original
            })
        }
        if(original === false){
            return
        }
        if(original.includes('new')){
            return functions.database.ref('gameRef').once("value").then(snap => {
                let value = snap.val();
                let ref = functions.database.ref('games').push();
                value.key = ref.key;
                value.creatorId = uid;
                return ref.set(value).then(()=>{
                    return snapshot.ref.set(value.key)
                })
            })
        }else{
            return functions.database.ref().once('value',snap=>functions.database.ref('games/'+original+'/nbPlayers').set((snap.val()+1)));
        }
    });
