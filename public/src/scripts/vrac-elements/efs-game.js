import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class EfsGame extends BaseEfsElement {
    static get is() { return 'efs-game' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            userid: String,
            gameid: String
        }
    }

    get selfStyle() {
        return `
            .efs-game{
                border:0.5em solid blue;
            }
        `
    }

    get errorScreen() {
        return html`
            <span class="error">An error occured joining the game. The game was probably joined by someone just before you</span>
            <button class="button" @click="${(() => this.firebaseSet(`/users/${this.userid}/game`, false))}">Return to lobby</button>
        `
    }

    get waitScreen() {
        return html`
            <span class="error">Your game is being created, please wait you will automatically join it when it's done</span>
        `
    }


    chooseState(gameid, userid) {
        if (!gameid || gameid === "error") {
            return this.errorScreen;
        }
        if (gameid.includes('new')) {
            return this.waitScreen;
        }
        return html`<efs-game-screen userid="${userid}" gameid="${gameid}"></efs-game-screen>`;
    }

    render() {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="efs-game">
            ${this.chooseState(this.gameid, this.userid)}
        </div>
        `
    }
}