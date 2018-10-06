import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class EfsLobby extends BaseEfsElement {
    static get is() { return 'efs-lobby' }
    //we need to init values in constructor
    constructor() {
        super();
        this.firebaseData('users', data => {
            if (data) {
                this.playerList = Object.values(data);
            }
        }, {
                orderByChild: "game",
                equalTo: false
            })
        this.playerList = [];
    }

    static get properties() {
        return {
            userid: String,
            playerList: Array,
        }
    }

    get selfStyle() {
        return `
            :host{
                padding:5em;
            }
            .lobby{

            }
            .player-list{
                padding:1em;
            }
        `
    }

    playerRow(player) {
        return html`
            <div>
                ${player.name}
            </div>
        `
    }

    render() {
        console.log(this.is, this.userid)
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="lobby content-box horizontal">
            <div>
                <div class="player-list content-box vertical">
                    ${this.playerList.map(player => this.playerRow(player))}
                </div>
                <partie-select userid="${this.userid}"></partie-select>
            </div>
                <game-chat type="/lobby/chat" userid="${this.userid}"></game-chat>
            </div>
        </div>
        `
    }
}