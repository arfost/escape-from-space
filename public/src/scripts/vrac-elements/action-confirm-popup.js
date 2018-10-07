import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class ActionConfirmPopup extends BaseEfsElement {
    static get is() { return 'action-confirm-popup' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            action: Object,
            selected:Number
        }
    }

    get selfStyle() {
        return `
        :host {
            display: block;
          }
          :host([hidden]) {
            display: none;
            color:fuschia;
          }
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
        .selected{
            color:red
        }
        .norm{
            color:grey
        }
        `
    }

    cancel() {
        this.dispatchEvent(new CustomEvent('closepopup', { detail: { cancel: true } }))
        this.selected = undefined;
    }

    validate() {
        if(this.selected !==undefined || !this.action.options){
            this.dispatchEvent(new CustomEvent('play-action',{ detail: `${this.action.name}${this.action.opt ? `:${this.action.opt[this.selected]}` : ''}` }))
            this.dispatchEvent(new CustomEvent('closepopup',{ detail: { confirm: true } }))
            this.selected = undefined;
        }
        
    }
    select(id){
        this.selected = Number(id);
    }

    drawOptions(action){
        if(action.opt){
            return html`<div>${action.opt.map((option, index)=>html`<div @click="${() => this.select(index)}" class="${this.selected === index ? 'selected' : 'norm'}">${option}</div>`)}</div>`
        }
        return html``
    }

    render() {
        if (!this.action) {
            return html`loading...`
        }
        return html`
        <style>
            ${this.selfStyle}
        </style>
        <div class="backdrop content-box">
            <div >
                <div >${this.action.name}</div>
                ${this.drawOptions(this.action)}
                <div>
                    <button @click="${e => this.cancel(e)}">cancel</button>
                    <button @click="${e => this.validate(e)}" ?disabled="${Boolean(this.selected === undefined && this.action.opt)}">validate</button>
                </div>
            </div>
        </div>`
    }
}