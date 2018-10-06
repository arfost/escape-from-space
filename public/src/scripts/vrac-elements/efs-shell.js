import {BaseEfsElement} from '../abstract-elements/efs-base-element.js'
import { html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

export class EfsShell extends BaseEfsElement {
    static get is() { return 'efs-shell' }
    //we need to init values in constructor
    constructor() {
        super();
    }

    static get properties() {
        return {
            user: Object
        }
    }

    get selfStyle() {
        return `
            .efs-shell{
                border:1em solid red;
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
        <div class="efs-shell">
            ${(this.user ?
                (this.user.game ?
                    html`<efs-game userid='${this.user.uid}' gameid="${this.user.game}"></efs-game>` :
                    html`<efs-lobby userid="${this.user.uid}"></efs-lobby>`) :
                html`loading`
            )
            }
        </div>
        `
    }
}
