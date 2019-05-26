
import { html, css, LitElement } from 'lit-element';

export class GamePopin extends LitElement {
    //we need to init values in constructor

    static get properties() {
        return {
            src: String
        }
    }

    get styles() {
        return html`
        <style>
            .backdrop{
                z-index:100;
                background-color: rgba(0,0,0,0.6);
                width:100%;
                height:100vh;
                position:fixed;
                top:0;
                left:0;

                justify-content: center;
                display: flex;
                flex-direction: column;
                
            }
            .backdrop > div{
                padding:0 5em;
                z-index:101;
                padding:1em;
                background-color:white;

                justify-content: center;
                align-items: center;
                display: flex;
            }
        </style>`
    }

    render() {
        return html`
        ${this.styles}
        <div class="backdrop">
            <div>
                <slot></slot>
            </div>
        </div>`
    }
}
customElements.define('game-popin', GamePopin); 