import {onFirebaseArray, onFirebaseData} from '../helper-scripts/lit-directiv.js'
import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class GameChat extends BaseEfsElement {
    static get is() { return 'game-chat' }
    //we need to init values in constructor
    constructor() {
        super();
        this.messages = [];
    }

    static get properties() {
        return {
            userid: String,
            messages: Array,
            type: String
        }
    }

    get selfStyle() {
        return `
            :host{
                padding:5em;
            }
            .messages{
                padding:0.1em;
            }
            .new-mess{
                padding:0.2em;
            }
            .green{
                color:green;
            }
            .grey{
                color:grey;
            }
        `
    }

    message(message, userid) {
        return html`
            <div class="content-box horizontal messages">
                <span class="${message.posterId === userid ? 'green' : 'grey'}">${onFirebaseData(this.firebaseRef(`/users/${message.posterId}/name`), (name => html`${name}`), html`loading...`)}</span>
                :
                <span>${message.text}</span>
            </div>
        `
    }

    send() {
        let message = this.shadowRoot.getElementById('message').value;
        if (message) {
            this.firebasePush(`${this.type}`, {
                posterId: this.userid,
                text: message,
                date: Date.now()
            })
            this.shadowRoot.getElementById('message').value = "";
        }
    }

    render() {
        if(this.type && this.userid){
            return html`
                <style>
                    ${this.appTheme}
                    ${this.sharedStyles}
                    ${this.selfStyle}
                </style>
                <div class="content-box vertical">
                    <div>
                        <div class="player-list content-box vertical">
                            ${onFirebaseArray(this.firebaseRef(this.type),messages=>messages.map(message=>this.message(message, this.userid)), html`loading messages...`, html`no messages yet`)}
                        </div>
                    </div>
                    <div class="content-box horizontal">
                        <label for="message">Message:</label>
                        <input type="text" id="message" name="message" style="width:70%">
                        <button class="button" @click="${e => this.send(e)}">send</button>
                    </div>
                </div>
                `
        }else{
            return html``
        }
    }
}