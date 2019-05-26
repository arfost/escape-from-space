import { html, css } from 'lit-element';
import { EfsBase } from '../efs-base.js';
import Datavault from '../datavault.js';

import '../components/game-popin.js';

const DEFAULTEVENT = {
    name:'default',
}
class EfsGame extends EfsBase {

    constructor(){
        super();
        this.game = {
            loaded:false
        }
        this.selectable = [];
        this.mode = DEFAULTEVENT;
    }

    get selfStyles() {
        return css`
        .map {
            display:grid;
            grid-template-columns: repeat(17, 1fr);
            grid-template-rows: repeat(15, 1fr);
            width:1200px;
            height:900px;
        }
        .list-deads {
            background-color: var(--shade-color);
            color:var(--success-color);
            border-radius: 2px;
            position: relative;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            transition: all 0.3s cubic-bezier(.25,.8,.25,1);
            padding:1em;
        }
        .list-deads:hover {
            box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
        }
        .self {
            color:red
        }
        .room {
            background-color:blue;
            transition: all 0.1s ease-in-out;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 100% 100%; 
        }
        .selectable {
            box-shadow: 0 6px 14px 0 #666;
            transform: scale(1.05);
        }
        .room:hover {
            border:1px solid black;
        }
        .char {
            width: 70px;
            height: 70px;
            background-color: red;
            border-radius: 50%;
            transition: all 0.1s ease-in-out;
            border:1px solid black;
            margin:0.2em;
        }
        .select-char:hover {
            box-shadow: 0 6px 14px 0 #666;
            transform: scale(1.05);
        }
        .NS {
            background-image: url("/img/game/fond_salle_ns.png"); 
        }
        .EO {
            background-image: url("/img/game/fond_salle_eo.png"); 
        }`
    }

    static get properties() {
        return {
            user: Object,
            game: Object,
            selectable: Array,
            mode: Object
        }
    }

    updated(){
        if(this.user && !this.gameRef){
            this.gameRef = Datavault.refGetter.getGame(this.user.game);
            this.game = this.gameRef.getDefaultValue();
            this.gameRef.on("value", game => {
                this.game = game;
            });
        }
    }

    makeChar(char, customClass=''){
        return html`<img src="${char.picture}" class="char ${customClass}" />` 
    }

    roomClicked(room){
        let turnPlayer = this.game.players[this.game.gameInfo.toPlay];
        if(turnPlayer.uid !== this.user.uid){
            this.emit('toast-msg', `Turn is to ${this.game.players[this.game.gameInfo.toPlay].name}.`)
            return;
        }
        if(this.mode.name === 'MOVETO'){
            if(this.selectable === room.connections.rooms){
                this.selectable = [];
                this.mode = DEFAULTEVENT;
            }else if(this.selectable.includes(room.id)){
                this.gameRef.actions.moveChar(this.mode.params, room.id, this.user.uid);
                this.selectable = [];
                this.mode = DEFAULTEVENT;
                this.emit('toast-msg', `Character moved`);
            }else{
                console.log('pouet');
                this.emit('toast-msg', `Characters can only move in adjacent rooms`);
            }
        }else{
            let charsInRoom = this.game.liveChars.filter(char=>char.pos===room.id);
            if(charsInRoom.length === 0){
                this.emit('toast-msg', `This room is empty, you can't do anything with it.`);
                return;
            }
            if(charsInRoom.length === 1){
                this.selectable = room.connections.rooms;
                this.mode = {
                    name:'MOVETO',
                    params:room.id
                };
                return;
            }
            this.mode = {
                name:'SELECTHERO',
                params:charsInRoom,
                canMove:false
            }
            console.log('hey hey', this.mode);
        }
    }

    formatScore(){
        console.log(this.game)
        let fscore = [];
        for(let player in this.game.score){
            fscore.push({
                name: player,
                manche: this.game.score[player].manche,
                total: this.game.score[player].total
            })
        }
        return fscore;
    }

    makeRoom(room){
        let charsInRoom = this.game.liveChars.filter(char=>char.pos===room.id);
        return html`<div 
                        @click="${e=>this.roomClicked(room)}"
                        class="room ${room.orientation} flex-box f-j-center f-a-center scroll ${room.orientation === 'NS' ? 'f-vertical' : 'f-horizontal'} ${(this.selectable && this.selectable.includes(room.id)) ? 'selectable' : ''}" 
                        style="grid-column:${room.pos.x}/span ${room.orientation === 'NS' ? 2 : 4};grid-row:${room.pos.y}/span ${room.orientation === 'NS' ? 4 : 2}">
                            ${charsInRoom.map(char=>this.makeChar(char))}
                        </div>` 
    }

    selfChars(){
        let selfPlayer = this.game.players.find(player=>player.uid===this.user.uid);
        if(!selfPlayer.chars){
            return [];
        }
        return [...this.game.liveChars.filter(char=>selfPlayer.chars.includes(char.id)), ...this.game.deadChars.filter(char=>selfPlayer.chars.includes(char.id))]
    }

    launchGame(){
        this.gameRef.actions.launchGame(this.user.game).then(()=>{
            this.emit('toast-msg', 'Game started');
        }).catch(e=>{
            this.emit('toast-msg', 'Error : the game could not be started')
        });
    }

    selectHero(hero){
        console.log(hero);
        this.mode = DEFAULTEVENT;
        this.gameRef.actions.killChar(hero, this.user.uid);
        this.selectable = [];
        this.mode = DEFAULTEVENT;
        this.emit('toast-msg', `Character killed`);
    }

    cancel(){
        this.mode = DEFAULTEVENT;
    }

    render() {
        return html`
            ${this.styles}
            ${
                this.game.loaded ? 
                html`<div class="flex-box f-horizontal p-0 h-100">
                        <div class="flex-box f-vertical f-j-center w-80 scroll">
                            <div class="map">
                                ${this.game.cells.map(this.makeRoom.bind(this))}
                            </div>
                        </div>
                        <div class="flex-box f-vertical w-20 list-deads scroll">
                        ${ this.game.gameInfo ?
                            html`<div class="flex-box f-vertical f-j-center f-a-center">
                                    <h4>Game infos : </h4>
                                    <p>You are ${this.game.players.find(player=>player.uid===this.user.uid).name}</p>
                                    <p>Turn ${this.game.gameInfo.turn}</p>
                                    <p>Turn of ${this.game.players[this.game.gameInfo.toPlay].name}</p>
                                </div>
                                <div class="flex-box f-vertical f-j-center f-a-center">
                                    <h4>Dead chars</h4>
                                    <div class="flex-box f-horizontal f-js-end f-j-center f-a-center f-wrap">
                                        ${this.game.deadChars.map(char=>this.makeChar(char))}
                                    </div>
                                </div>
                                <div class="flex-box f-vertical f-j-center f-a-center">
                                    <h4>Your chars</h4>
                                    <div class="flex-box f-horizontal f-js-end f-j-center f-a-center">
                                        ${this.selfChars().map(char=>this.makeChar(char))}
                                    </div>
                                    <p>The more late they die, the more points you win.</p>
                                </div>`:
                            `loading`
                        }
                        </div>
                    </div>
                    <game-popin ?hidden=${this.mode.name !== 'SELECTHERO'}>
                        <div class="flex-box f-vertical">
                            <div class="flex-box f-horizontal f-j-center">
                                <p>
                                    Choose wich hero you want to kill.
                                </p>
                            </div>
                            <div class="flex-box f-horizontal">
                                ${(this.mode.name === 'SELECTHERO' ? this.mode.params : []).map(char=>html`<div @click="${e=>this.selectHero(char)}">${this.makeChar(char, 'select-char')}</div>`)}
                            </div>
                            <div class="flex-box f-vertical f-j-end">
                                <button class="btn btn-outline-secondary" @click="${this.cancel}">
                                    cancel
                                </button>
                            </div>
                        </div>
                    </game-popin>
                    <game-popin ?hidden=${!this.game.finished}>
                        <div class="flex-box f-vertical">
                            <h4>The game is finished.</h4>
                            <div class="flex-box f-horizontal f-j-center">
                            <div class="flex-box f-vertical f-j-center ">
                                    <h5>Death order</h5>
                                    <div class="flex-box f-horizontal f-wrap">
                                        ${this.game.deadChars.map(char=>html`${this.makeChar(char)}`)}
                                    </div>
                                </div>
                                <div class="flex-box f-vertical f-j-center ">
                                    <h5>Score : </h5>
                                    <div class="flex-box f-horizontal f-wrap">
                                        <ul>
                                            ${this.formatScore().map(line=>html`<li>${line.name} : ${line.manche} (total ${line.total})</li>`)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-box f-horizontal">
                                <button class="btn btn-outline-secondary" @click="${this.launchGame}">
                                    relaunch
                                </button>
                                <button class="btn btn-outline-secondary" @click="${e=>this.emit('quit-game')}">
                                    quit
                                </button>
                            </div>
                        </div>
                    </game-popin>
                    <game-popin ?hidden=${this.game.ready}>
                        <div class="flex-box f-horizontal">
                            <div class="flex-box f-vertical f-j-start">
                                <div>Players : </div>
                                <ul>
                                    ${this.game.players.map(player=>html`<li class="${player.uid === this.user.uid ? 'self': ''}">${player.name}</li>`)}
                                </ul>
                            </div>
                            <div class="flex-box f-vertical">
                                <h3>Preparing</h3>
                                <p>You can invite people to this game by giving this token above. There is no chat for now, so use any other messaging system you'd like for that.</p>
                                <p>When ready, click the button on the right.</p>
                                <p>By the way, everybody is roger for now but you are the red one, futur version should change that.</p>
                                <p>Token : ${this.user.game}</p>
                            </div>
                            <div>
                                <button class="btn btn-outline-secondary" @click="${this.launchGame}">
                                    launch
                                </button>
                            </div>
                        </div>
                    </game-popin>`:
                html`<game-popin>loading</game-popin>`
            }
        `;
    }
}

customElements.define('efs-game', EfsGame); //