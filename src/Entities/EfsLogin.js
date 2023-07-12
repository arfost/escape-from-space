
import { LoginReference } from '../../futur-lib/data.js'
import 'firebase/functions';
import { functions } from '../../config/fireInit.development.js';

export class EfsLogin extends LoginReference {

    get actions(){
        let actions = super.actions;
        actions.createGame = async ()=>{
            if(this.data.user.game){
                throw new Error("can't create a game when already in one")
            }
            const res = await functions.httpsCallable('createGame')();
            this.data.user.game = res.data;
            this.save();
            return res;
        }

        actions.joinGame = async key=>{
            if(this.data.user.game){
                throw new Error("can't join a game when already in one")
            }
            const res = await functions.httpsCallable('joinGame')(key);
            this.data.user.game = res.data;
            this.save();
            return res;
        }
        actions.quitGame = async key=>{
            if(!this.data.user.game){
                throw new Error("can't quit a game when not already in one")
            }
            const res = await functions.httpsCallable('quitGame')(key);
            this.data.user.game = false;
            this.save();
            return res;
        }
        return actions;
    }
}