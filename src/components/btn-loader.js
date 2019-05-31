import { EfsBase } from '../efs-base.js'
import { html, css, LitElement } from 'lit-element';

export class BtnLoader extends LitElement {

    //we need to init values in constructor
    constructor() {
        super();
        this.textMode = true;
    }

    static get properties() {
        return {
            textMode:Boolean
        }
    }

    get styles() {
        return html`
        <style>
            .btn {
                position:relative;
                display: inline-block;
                font-weight: 400;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                border: 1px solid transparent;
                padding: .375rem .75rem;
                font-size: 1rem;
                line-height: 1.5;
                border-radius: .25rem;
                transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
                color: #6c757d;
                background-color: white;
                background-image: none;
                border-color: #6c757d;
                outline:none;
                
            }
            .btn:hover {
                color: #fff;
                background-color: #6c757d;
                border-color: #6c757d;
            }
            .lds-dual-ring {
                display: inline-block;
                width: 1em;
                height: 1em;
            }
            .lds-dual-ring:after {
                content: " ";
                display: block;
                width: 1em;
                height: 1em;
                margin: 1px;
                border-radius: 50%;
                animation: lds-dual-ring 1.2s linear infinite;
                border: 5px solid #6c757d;
                border-color: #6c757d transparent #6c757d transparent;
            }
            @keyframes lds-dual-ring {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
            .no-show {
                opacity:0;
            }
            .wrapper {
                width:100%;
                height:100%;
                position:absolute;
                top: -0.3em;
                left: -0.3em;
                display:flex;
                justify-content:center;
                align-items:center;
            }
        </style>`
    }

    render() {
        return html`
        ${this.styles}
        <button class="btn">
            <div class="${this.textMode ? '' : 'no-show'}">
                <slot></slot>
            </div>
            <div class="wrapper ${this.textMode ? 'no-show' : ''}">
                <div class="lds-dual-ring"></div>
            </div>
        </button>`
    }
}
customElements.define('btn-loader', BtnLoader); 