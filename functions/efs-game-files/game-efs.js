import actions from "action-efs.js";

export function getStartingPos(game){
    return '6/6'
}

export function playAction(game, uid, action){

    let [actionType, actionOpt] = action.split(":")

    let actionClass = actions[actionType];

    game = actionClass.play(game, uid);

    game = moveZomb(game, uid);

    for(let ac in actions){
        game = ac.isPlayable(game, uid)
    }

    return game;
}