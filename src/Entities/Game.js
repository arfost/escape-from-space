import {
    FireReference
} from '../../futur-lib/data.js'
import * as firebase from 'firebase/app';
import 'firebase/functions';

export class Game extends FireReference {

    constructor(id) {
        super();
        this.id = id;
        this.initConnection();
    }

    get sources() {
        return {
            game: "games/" + this.id,
            cells: "cells/" + this.id,
        };
    }
    get actions() {
        return {
            launchGame: async (key) => {
                const res = await firebase.functions().httpsCallable('launchGame')(key);
            },
            moveChar: (oldRoomId, roomId, uid) => {
                if (this.data.game.players[this.data.game.gameInfo.toPlay].uid !== uid) {
                    throw new Error('It\'s not your turn');
                }

                //for each char living, change position if the one we move
                this.data.game.liveChars = this.data.game.liveChars.map(char => {
                    if(char.pos == oldRoomId){
                        char.pos = roomId;
                    }
                    return char;
                });

                //if chest is in the room, move it with char
                let oldRoom = this.data.cells.filter(cell => cell.id == oldRoomId);
                if (oldRoom.chest) {
                    oldRoom.chest = false;
                    let newRoom = this.data.cells.filter(cell => cell.id == roomId);
                    newRoom.chest = true;
                }


                this.data.game = this.passTurn(this.data.game);
                this.save();
            },
            killChar: (char, uid) => {
                if (this.data.game.players[this.data.game.gameInfo.toPlay].uid !== uid) {
                    throw new Error('It\'s not your turn');
                }

                this.data.game.liveChars = this.data.game.liveChars.filter(c => c.id !== char.id);


                this.data.game.deadChars = this.data.game.deadChars ? [...this.data.game.deadChars, char] : [char];

                if (this.data.game.liveChars.length === 1) {
                    this.data.game = this.finishGame(this.data.game);
                } else {
                    this.data.game = this.passTurn(this.data.game);
                }
                this.save();
            }
        }
    }

    passTurn(game) {
        game.gameInfo.turn++;
        game.gameInfo.toPlay++;
        if (game.gameInfo.toPlay >= game.players.length) {
            game.gameInfo.toPlay = 0;
        }
    }

    finishGame(game) {
        game.deadChars.push(game.liveChars.shift());

        if (game.score) {
            for (let player in game.score) {
                game.score[player].total += game.score[player].manche;
                game.score[player].manche = 0;
            }
        } else {
            game.score = {}
            for (let player of game.players) {
                game.score[player.name] = {
                    manche: 0,
                    total: 0
                }
            }
        }
        let done = 0;
        let deadCharsCopy = [...game.deadChars]
        while (done < game.players.length) {
            let char = deadCharsCopy.pop();
            for (let player of game.players) {
                if (player.chars.includes(char.id) && game.score[player.name].manche === 0) {
                    game.score[player.name].manche = deadCharsCopy.length;
                    done++;
                }
            }
        }
        game.finished = true;
        return game;
    }

    formatDatas({ game, cells }) {
        let data = {
            deadChars: game.deadChars || [],
            liveChars: game.liveChars || [],
            cells: cells || [],
            players: game.players || [],
            gameInfo: game.gameInfo || {
                turn: 1,
                toPlay: 0,
                votes: 0
            },
            ready: game.ready,
            score: game.score,
            loaded: game.loaded,
            finished: game.finished
        };
        return data;
    }

    presave({
        game,
        cells
    }) {
        let data = {
            game,
            cells
        };
        return data;
    }

    get defaultValues() {
        return {
            game: {
                loaded: false,
            },
            cells: []
        };
    }
}