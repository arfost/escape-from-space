import actions from "./actions-efs.js";

export function getStartingPos(game){
    return '6/6'
}

export function playAction(game, uid, action){

    let [actionType, actionOpt] = action.split(":")

    let actionClass = actions[actionType];

    game = actionClass.play(game, uid, actionOpt);

    //game = moveZomb(game, uid);

    for(let player of game.players){
        game = getPlayableActionsForPlayer(game, player.uid)
    }

    return game;
}

export function initGame(game){
    for(let player of game.players){
        game = getPlayableActionsForPlayer(game, player.uid)
    }
    return game;
}

export function getPlayableActionsForPlayer(game, uid){
    if(!game.actions){
        game.actions = {}
    }
    game.actions[uid] = [];
    for(let ac in actions){
        game = actions[ac].isPlayable(game, uid)
    }
    return game;
}