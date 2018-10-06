import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class ConfAccountPopup extends BaseEfsElement {
    static get is() { return 'conf-account-popup' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            title: String
        }
    }

    get selfStyle() {
        return `
            .backdrop{
                z-index:100;
                position:absolute;
                background-color: rgba(0,0,0,0.6);
                justify-content:center;
                width:100%;
                height:100vh;
                position:fixed;
                top:0;
                left:0;
            }
            .backdrop > div{
                z-index:101;
                padding:1em;
                background-color:white;
                border: 0.1em solid red;
            }

            .backdrop > div{
                margin:0.5em;
            }
        `
    }

    cancel() {
        this.dispatchEvent(new CustomEvent('validate', { detail: { cancel: true } }))
    }

    validate() {

        this.dispatchEvent(new CustomEvent('validate', {
            detail:
            {
                name: this.shadowRoot.getElementById('name').value
            }
        }))
    }

    render() {
        return html`
        <style>
            ${this.appTheme}
            ${this.sharedStyles}
            ${this.selfStyle}
        </style>
        <div class="backdrop content-box">
            <div >
                <div >${this.title}</div>
                <div>
                    <div>
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="user_name">
                    </div>
                </div>
                <div>
                    <button @click="${e => this.cancel(e)}">cancel</button>
                    <button @click="${e => this.validate(e)}">validate</button>
                </div>
            </div>
        </div>
        `
    }
}