import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';
import {onFirebaseData} from '../helper-scripts/lit-directiv.js'

export class EfsGameScreen extends BaseEfsElement {
    static get is() { return 'efs-game-screen' }
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

    get loadingScreen() {
        return html`
            <span class="loading">loading...</span>
        `
    }

    get errorScreen() {
        return html`
            <span class="loading">the game is in an unexpected status and will probably never start, if you see this call the creator of this game.</span>
        `
    }

    get waitPlayerScreen() {
        return html`
            <span class="loading">waiting for the game to be full...</span>
        `
    }

    get finishedScreen() {
        return html`
            <span class="loading">the game is finished, congrats to the survivors !</span>
        `
    }

    chooseState(status) {
        if (status === "waiting") {
            return this.waitPlayerScreen;
        }
        if (status === "launched") {
            return html`<efs-playground userid="${this.userid}" gameid="${this.gameid}"></efs-playground>`;
        }
        if (status === "finished") {
            return this.finishedScreen;
        }
        return this.errorScreen;
    }

    render() {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="efs-game-screen">
            <div class="content-box vertical">
                <div>
                    <div class="content-box vertical">
                        ${onFirebaseData(this.firebaseRef(`/games/${this.gameid}/players`), players => (players ? players : []).map(player => html`<div>${onFirebaseData(this.firebaseRef(`/users/${player.uid}/name`), name => name, html`loading...`)}</div>`), html`<div>loading...<div>`)}
                    </div>
                    <div>
                        ${onFirebaseData(this.firebaseRef(`/games/${this.gameid}/status`), this.chooseState.bind(this), html`loading...`)}
                    </div>
                </div>
                <game-chat type="/games/${this.gameid}/chat" userid="${this.userid}"></game-chat>
            </div>
        </div>
        `
    }
}