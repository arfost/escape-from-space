
import { LoginReference } from '../../futur-lib/data.js'
import { functions } from '../../config/fireInit.development.js';
import { httpsCallable } from "firebase/functions";

export class EfsLogin extends LoginReference {

    get actions(){
        let actions = super.actions;
        actions.createGame = async ()=>{
            if(this.data.user.game){
                throw new Error("can't create a game when already in one")
            }
            const res = await httpsCallable(functions, 'createGame')();
            this.data.user.game = res.data;
            this.save();
            return res;
        }

        actions.joinGame = async key=>{
            if(this.data.user.game){
                throw new Error("can't join a game when already in one")
            }
            const res = await httpsCallable(functions, 'joinGame')(key);
            this.data.user.game = res.data;
            this.save();
            return res;
        }
        actions.quitGame = async key=>{
            if(!this.data.user.game){
                throw new Error("can't quit a game when not already in one")
            }
            const res = await httpsCallable(functions, 'quitGame')(key);
            this.data.user.game = false;
            this.save();
            return res;
        }
        return actions;
    }
}