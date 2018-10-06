import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';
import {onFirebaseData} from '../helper-scripts/lit-directiv.js'

export class PartieSelect extends BaseEfsElement {
    static get is() { return 'partie-select' }
    //we need to init values in constructor
    constructor() {
        super();
        this.games = [];
        this.firebaseData(`/games`, data => {
            if (data) {
                this.games = Object.values(data);
            }
        }, {
                orderByChild: "status",
                equalTo: "waiting"
            });
    }

    static get properties() {
        return {
            games: String,
            userid: Array
        }
    }

    get selfStyle() {
        return `
            :host{
            }
            .game-list{

            }
            .game{
                padding:0.2em;
            }
            .crea-box{
                color:green;
            }
        `
    }

    game(game) {
        return html`
            <div class="content-box vertical">
                <div>
                    <span>${game.name} (${onFirebaseData(this.firebaseRef(`/users/${game.creatorId}/name`), name => html`${name}`, html`loading...`)})</span>
                    <button class="button" @click="${(() => this.joinGame(game.key))}">join</button>
                </div>
                <div>${game.playersNb}</div>
            </div>
        `
    }

    creaGame() {
        let gameName = this.shadowRoot.getElementById('game-name').value;
        if (gameName) {
            this.firebaseSet(`/users/${this.userid}/game`, `new:${gameName}`);
        }
    }

    joinGame(gameKey) {
        if (gameKey) {
            this.firebaseSet(`/users/${this.userid}/game`, gameKey);
        }
    }

    render() {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="content-box vertical">
            <div>
                <div class="player-list content-box vertical">
                    ${this.games.map(game => this.game(game, this.userid))}
                </div>
            </div>
            <div class="content-box horizontal">
                <label for="game-name">New game:</label>
                <input type="text" id="game-name" name="game-name" style="width:70%">
                <button class="button" @click="${e => this.creaGame(e)}">create</button>
            </div>
        </div>
        `
    }
}