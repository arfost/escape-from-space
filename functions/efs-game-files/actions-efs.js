class MoveAction {
    constructor(){

    }

    getPlayer(game, uid){
        let [player] = [game.players.filter(player=>{
            return player.uid === uid;
        })];
        return player;
    }

    getCloseCells(game, player){
        let closeCellCoord = [];
        let [xPlayer, yPlayer] = player.pos.split("/")
        for(let i = -1; i<2; i++){
            for(let j = -1; j<2; j++){
                closeCellCoord.push(`${xPlayer-i}/${yPlayer-j}`)
            }
        }
        return game.cells.filter(cell=>{
            return closeCellCoord.includes(cell.pos);
        })
    }

    isPlayable(game, uid){
        let playable;
        let player = this.getPlayer(game, uid);
        
        let closeCells = this.getCloseCells(game, player);
        let isPossible = [];
        closeCells.forEach(cell => {
            if(cell.passable){
                isPossible.push(cell.pos)
            }
        });

        if(isPossible.length){
            return {
                name:this.name,
                opt:isPossible
            }
        }else{
            return false;
        }
    }

    play(game){
        console.log("je suis jouée, et je deplace le monsieur")
    }
}


export default {
    move:new MoveAction()
}