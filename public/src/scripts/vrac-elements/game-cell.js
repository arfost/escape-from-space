
import { onFirebaseArray, onFirebaseData } from '../helper-scripts/lit-directiv.js'
import { BaseEfsElement } from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class GameCell extends BaseEfsElement {
    static get is() { return 'game-cell' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            pos: String,
            userid: String,
            gameid: String
        }
    }

    get selfStyle() {
        return `
            :host{
                position:relative
            }
            .construct{
                z-index:10;
                position:absolute;
            }
            .construct img{
                width:100%;
                height:100%;
            }
            .objects{
                z-index:11;
            }
            .chars{
                z-index:12;
                border-radius:50%;
                opacity:0.5;
                background-color:black;
                color:white;
                height: 50%;
                width: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0.2em;
                position:absolute;
            }
            .chars #chars-popup{
                top: 50%;
                left: 50%;
                z-index:20;
                background-color:black;
                border:black solid 2px;
                color:white;
                position:absolute;
                align-items: center;
                justify-content: center;
                margin: 0.2em;
            }
            .monsters{
                z-index:13;
            }
        `
    }

    drawPlayer(player) {
        return html`<div>
    ${onFirebaseData(this.firebaseRef(`/users/${player.uid}/name`), name => name, html`loading...`)}
</div>`
    }

    showPlayers() {
        let popup = this.shadowRoot.getElementById('chars-popup');
        if (popup) {
            popup.hidden = false;
        }
    }

    hidePlayers() {
        let popup = this.shadowRoot.getElementById('chars-popup');
        if (popup) {
            popup.hidden = true;
        }
    }

    render() {
        if (!this.userid || !this.pos || !this.gameid) {
            return html`loading...`
        }
        return html`
        <style>
            ${this.selfStyle}
        </style>
        <div class="construct">
            ${onFirebaseArray(this.firebaseRef(`/games/${this.gameid}/cells`, {
                orderByChild: "pos",
                equalTo: this.pos
            }), cells => {
                let [cell] = cells;
                return html`<img alt="${this.pos}" src="src/img/game/tiles/${cell.img}">`

            }, html`<div>loading...<div>`,
            html`<img alt="${this.pos}" src="src/img/game/tiles/empty.png">`)}
        </div>
            ${onFirebaseArray(this.firebaseRef(`/games/${this.gameid}/players`, {
                orderByChild: "pos",
                equalTo: this.pos
            }), players => html`<div class="chars" @mouseenter="${e => this.showPlayers(e.detail)}" @mouseleave="${e => this.hidePlayers(e.detail)}">
                                    ${players.length}
                                    <div id="chars-popup" hidden>
                                        ${players.map(player => this.drawPlayer(player))}
                                    </div>
                                </div>`
                , html`<div class="chars">...</div>`, html``)}
        `
    }
}