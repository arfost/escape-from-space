import { BaseEfsElement } from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class EfsLoadPopup extends BaseEfsElement {
    static get is() { return 'efs-load-popup' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            show: Boolean
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
        `
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
                game is currently updating, please wait.
            </div>
        </div>`
    }
}