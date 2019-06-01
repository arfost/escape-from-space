import { html, css } from 'lit-element';
import { EfsBase } from '../efs-base.js';
import Datavault from '../datavault.js';

import '../components/game-popin.js';
import  '../components/btn-loader.js';

const DEFAULTEVENT = {
    name:'default',
}

const CHESTDESC = {
    name:"Energy cell",
    desc:"This cell is used to power the escape pod. Bring them togethers to escape and survive.",
    picture:"https://dummyimage.com/150x150/d10fd1/0011ff.png&text=Cell"
}

const EXITGATE = {
    name:"Escape pod",
    desc:"This is the escape pod, bring the energy cell to it to escape.",
    picture:"https://dummyimage.com/150x150/d10fd1/0011ff.png&text=Escape pod"
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
            grid-template-rows: repeat(17, 1fr);
            width:95vh;
            height:95vh;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            background-color:black;
            background-image:url("/img/game/2k_stars.jpg");
            background-position: center;
            background-repeat: no-repeat;
            background-size: 100% 100%; 
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
            background-color:grey;
            transition: all 0.1s ease-in-out;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 100% 100%; 
            overflow:hidden;
        }
        .selectable {
            box-shadow: 0 6px 14px 0 #666;
            transform: scale(1.05);
        }
        .room:hover {
            border:1px solid black;
        }
        .char {
            width: 6vh;
            height: 6vh;
            background-color: red;
            border-radius: 50%;
            transition: all 0.1s ease-in-out;
            border:1px solid black;
            margin:0.2em;
            overflow:hidden;
        }
        .chest {
            width: 3vh;
            height: 3vh;
            background-color: green;
            border-radius: 50%;
            border:1px solid black;
            margin:0.2em;
            overflow:hidden;
        }
        .exit {
            width: 3vh;
            height: 3vh;
            background-color: blue;
            border-radius: 50%;
            border:1px solid black;
            margin:0.2em;
            overflow:hidden;
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
        }
        .tooltip {
            position:fixed;
            bottom:1vh;
            left:1vh;
            background-position:5% 5%;
            background-repeat:no-repeat;
            min-height:30vh;
            min-width:10vh;
        }
        .tooltip * {
            pointer-events: none;
        }`
    }

    static get properties() {
        return {
            user: Object,
            game: Object,
            selectable: Array,
            mode: Object,
            tooltip:Object
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

    makeChar(char={}, customClass=''){
        return html`<img src="${char.picture}" class="char ${customClass}" @mouseover="${e=>this.configureTooltip(char)}" />` 
    }

    roomClicked(room){
        console.log("hey room", room)

        let turnPlayer = this.game.players[this.game.gameInfo.toPlay];
        if(turnPlayer.uid !== this.user.uid){
            this.emit('toast-msg', `Turn is to ${this.game.players[this.game.gameInfo.toPlay].name}.`)
            return;
        }
        if(this.mode.name === 'MOVETO'){
            if (this.selectable === room.connections.rooms) {
                if (room.chest && room.exit) {
                    this.gameRef.actions.moveChar(this.mode.params, room.id, this.mode.char, this.user.uid);
                }
                this.selectable = [];
                this.mode = DEFAULTEVENT;
            }else if(this.selectable.includes(room.id)){
                this.gameRef.actions.moveChar(this.mode.params, room.id, this.mode.char, this.user.uid);
                this.selectable = [];
                this.mode = DEFAULTEVENT;
                this.emit('toast-msg', `Character moved`);
            }else{
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
                    params: room.id,
                    char:charsInRoom[0].id
                };
                return;
            }
            this.mode = {
                name:'SELECTHERO',
                params:charsInRoom,
                canMove: room.chest,
                room:room.id
            }
        }
    }

    formatScore(){
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
                        style="grid-column:${room.pos.x+1}/span ${room.orientation === 'NS' ? 2 : 4};grid-row:${room.pos.y+1}/span ${room.orientation === 'NS' ? 4 : 2}">
                            ${charsInRoom.map(char => this.makeChar(char))}
                            ${room.chest ? html`<div class="chest" @mouseover="${e=>this.configureTooltip(CHESTDESC)}"></div>` : ``}
                            ${room.exit ? html`<div class="exit ${room.chest && room.exit ? 'selectable' : ''}" @mouseover="${e=>this.configureTooltip(EXITGATE)}"></div>` : ``}
                        </div>` 
    }

    selfChars(){
        let selfPlayer = this.game.players.find(player=>player.uid===this.user.uid);
        if(!selfPlayer.chars){
            return [];
        }
        let selfChars = [...this.game.liveChars.filter(char => selfPlayer.chars.includes(char.id)), ...this.game.deadChars.filter(char => selfPlayer.chars.includes(char.id))];
        if (this.game.exitedChar && selfPlayer.chars.includes(this.game.exitedChar.id)) {
            selfChars.push(this.game.exitedChar);
        }
        return selfChars;
    }

    launchGame(){
        this.shadowRoot.getElementById('relaunch').textMode = false;
        this.shadowRoot.getElementById('launch').textMode = false;
        this.gameRef.actions.launchGame(this.user.game).then(()=>{
            this.emit('toast-msg', 'Game started');
            this.shadowRoot.getElementById('relaunch').textMode = true;
            this.shadowRoot.getElementById('launch').textMode = true;
        }).catch(e=>{
            this.emit('toast-msg', 'Error : the game could not be started');
            this.shadowRoot.getElementById('relaunch').textMode = true;
            this.shadowRoot.getElementById('launch').textMode = true;
        });
    }

    selectHero(hero) {
        if (this.mode.isMove) {
            this.selectable = this.game.cells.find(room=>room.id===this.mode.room).connections.rooms;
            this.mode = {
                name:'MOVETO',
                params: this.mode.room,
                char:hero.id
            };
        } else {
            this.gameRef.actions.killChar(hero, this.user.uid);
            this.selectable = [];
            this.mode = DEFAULTEVENT;
            this.emit('toast-msg', `Character killed`);
        }
        
    }

    copyStringToClipboard () {
        // Create new element
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = this.user.game;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);

        this.emit('toast-msg', `Game token copied to clipboard`);
     }

     displayToken(){
         return html`<p>Token : ${this.user.game}<img class="ml-1" src='img/game/clipboard-text.png' @click="${this.copyStringToClipboard}"></p>`
     }

    cancel(){
        this.mode = DEFAULTEVENT;
    }

    quitGame() {
        this.shadowRoot.getElementById('quit').textMode = false;
        Datavault.refGetter.getUser().actions.quitGame(this.game.key).then(ret=>{
            this.shadowRoot.getElementById('quit').textMode = true;
            this.showToast({
                detail:'Game quitted'
            });
        }).catch(err=>{
            this.shadowRoot.getElementById('quit').textMode = true;
            this.showToast({
                detail:err.message
            });
        });
      
    }
  
    displayTooltip(){
        if(this.tooltip){
            return html`<div class="flex-box f-vertical f-j-space f-a-end tooltip card" style="background-image:url('${this.tooltip.picture}')" @mouseout="${e=>this.configureTooltip(false)}">
                            <h4 @mouseout="${e=>e.stopPropagation()}">${this.tooltip.name}</h4>
                            <p @mouseout="${e=>e.stopPropagation()}">${this.tooltip.desc}</p>
                        </div>`
        }
        return '';
    }

    //useless as is, but in a futur we should check infos format;
    configureTooltip(infos){
        this.tooltip = infos;
    }

    render() {
        return html`
            ${this.styles}
            ${
                this.game.loaded ? 
                html`
                    ${this.displayTooltip()}
                    <div class="flex-box f-horizontal p-0 h-100">
                        <div class="flex-box f-vertical f-j-center w-80 scroll f-a-center">
                            <div class="map">
                                ${this.game.cells.map(this.makeRoom.bind(this))}
                            </div>
                        </div>
                        <div class="flex-box f-vertical w-20 list-deads scroll">
                        ${ this.game.gameInfo ?
                        html`<div class="flex-box f-vertical f-j-center f-a-center">
                                    <h4>Game infos : </h4>
                                    <p>You are ${this.game.players.find(player => player.uid === this.user.uid).name}</p>
                                    <p>Turn ${this.game.gameInfo.turn}</p>
                                    <p>Turn of ${this.game.players[this.game.gameInfo.toPlay].name}</p>
                                </div>
                                <div class="flex-box f-vertical f-j-center f-a-center">
                                    <h4>Dead chars (older to newer -->)</h4>
                                    <div class="flex-box f-horizontal f-js-end f-j-center f-a-center f-wrap">
                                        ${this.game.deadChars.map(char => this.makeChar(char))}
                                    </div>
                                </div>
                                <div class="flex-box f-vertical f-j-center f-a-center" ?hidden=${!this.game.exitedChar}>
                                    <h4>He has escape</h4>
                                    <div class="flex-box f-horizontal f-js-end f-j-center f-a-center f-wrap">
                                        ${this.makeChar(this.game.exitedChar)}
                                    </div>
                                </div>
                                <div class="flex-box f-vertical f-j-center f-a-center">
                                    <h4>Your chars</h4>
                                    <div class="flex-box f-horizontal f-js-end f-j-center f-a-center">
                                        ${this.selfChars().map(char => this.makeChar(char))}
                                    </div>
                                    <p>The more late they die, the more points you win.</p>
                                    <btn-loader id="quit" @click="${this.quitGame}">
                                        quit
                                    </btn-loader>
                                </div>`:
                        `loading`
                    }
                        </div>
                    </div>
                    <game-popin ?hidden=${this.mode.name !== 'SELECTHERO'}>
                        <div class="flex-box f-vertical">
                            <div class="flex-box f-horizontal f-j-center">
                                <p>
                                    Choose wich hero you want to kill${this.mode.canMove ? html`, or move with the escape pod battery` : `.`}
                                </p>
                            </div>
                            <div class="flex-box f-horizontal">
                                ${(this.mode.name === 'SELECTHERO' ? this.mode.params : []).map(char => html`<div @click="${e => this.selectHero(char)}">${this.makeChar(char, 'select-char')}</div>`)}
                            </div>
                            <div class="flex-box f-vertical f-j-end f-a-center">
                                ${this.mode.canMove ?
                                    html`<btn-loader class="mb-1" @click="${e => { this.mode = Object.assign({}, this.mode, {isMove:!this.mode.isMove}); console.log('poeut') }}">
                                        mode : ${this.mode.isMove ? `move` : `kill`}
                                    </btn-loader>`:``}
                                <btn-loader @click="${this.cancel}">
                                    cancel
                                </btn-loader>
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
                                    ${this.displayToken()}
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
                                <btn-loader id="relaunch" @click="${this.launchGame}">
                                    relaunch
                                </btn-loader>
                                <btn-loader id="quit" @click="${this.quitGame}">
                                    quit
                                </btn-loader>
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
                                ${this.displayToken()}
                            </div>
                            <div>
                                <btn-loader id="launch" @click="${this.launchGame}">
                                    launch
                                </btn-loader>
                            </div>
                        </div>
                    </game-popin>`:
                html`<game-popin>loading</game-popin>`
            }
        `;
    }
}

customElements.define('efs-game', EfsGame); //
