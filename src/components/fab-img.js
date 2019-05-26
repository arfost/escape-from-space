import { EfsBase } from '../efs-base.js'
import { html, css, LitElement } from 'lit-element';

export class FabImg extends LitElement {

    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            src: String
        }
    }

    get styles() {
        return html`
        <style>
            .fab {
                width: 70px;
                height: 70px;
                background-color: red;
                border-radius: 50%;
                box-shadow: 0 6px 10px 0 #666;
                transition: all 0.1s ease-in-out;
            
                font-size: 50px;
                color: white;
                text-align: center;
                line-height: 70px;
            
                position: fixed;
                left: 1em;
                top: 1em;
            }
            
            .fab:hover {
                box-shadow: 0 6px 14px 0 #666;
                transform: scale(1.05);
            }
        </style>`
    }

    render() {
        return html`
        ${this.styles}
        <img src="${this.src}" class="fab">`
    }
}
customElements.define('fab-img', FabImg); 