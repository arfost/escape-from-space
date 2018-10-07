
import {onFirebaseArray, onFirebaseData} from '../helper-scripts/lit-directiv.js'
import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class EfsPlayground extends BaseEfsElement {
    static get is() { return 'efs-playground' }
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
            .map{
                border:0.5em solid violet;
            }
            .case{
                height:3em;
                width:3em;
            }
        `
    }

    showConfirm(actionName) {
        let popup = this.shadowRoot.getElementById(`confirm-popup-${actionName}`);
        if (popup) {
            popup.hidden = false
        }
    }

    hideConfirm(actionName) {
        
        let popup = this.shadowRoot.getElementById(`confirm-popup-${actionName}`);
        if (popup) {
            popup.hidden = true
        }
    }

    playAction(action){
        console.log("action played ", action)
        this.firebaseSet(`users/${this.userid}/action`, action);
    }

    render() {
        if (!this.userid || !this.gameid) {
            return html`loading...`
        }
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="map">
            ${onFirebaseArray(this.firebaseRef(`/games/${this.gameid}/players`, {
                orderByChild: "uid",
                equalTo: this.userid
            }), players => {
                if (players && players.length === 1) {
                    let [player] = players;
                    if (player.uid !== this.userid) {
                        return html`Error getting the player, try to reload.`
                    }
                    //here we draw the map from the player pos and sigth
                    let [x, y] = player.pos.split('/');
                    let minX = Number(x) - Number(player.sight);
                    let maxX = Number(x) + Number(player.sight);
                    let minY = Number(y) - Number(player.sight);
                    let maxY = Number(y) + Number(player.sight);
                    console.log("coord", minX, maxX, minY, maxY, x, y, player.sight);
                    let cells = [];
                    for (let i = minY; i <= maxY; i++) {
                        for (let j = minX; j <= maxX; j++) {
                            cells.push({
                                x: j,
                                y: i
                            })
                        }
                    }
                    return html`<div style="display:grid;grid-template-columns:repeat(${(Number(player.sight) * 2) + 1}, 1fr)">
                        ${cells.map(cell => html`<game-cell class="case" userid="${this.userid}" gameid="${this.gameid}" pos="${cell.x}/${cell.y}"></game-cell>`)}
                    </div>`
                }
                return html`<div>loading...</div>`
            }, html`<div>loading...<div>`)}
        </div>
        <div class="action">
            ${onFirebaseData(this.firebaseRef(`/games/${this.gameid}/actions/${this.userid}`), actions => (actions ? actions : []).map(action => html`<div class="action" @click="${() => this.showConfirm(action.name)}">
                                                                                                                                                ${action.name}</div>
                                                                                                                                                <action-confirm-popup .action="${action}" @closepopup="${() => this.hideConfirm(action.name)}" @play-action="${(e) => this.playAction(e.detail)}" id="confirm-popup-${action.name}" hidden></action-confirm-popup>
                                                                                                                                            `), html`<div>loading...<div>`)}
        </div>
        `
    }
}