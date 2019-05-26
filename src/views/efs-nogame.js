import { html, css } from 'lit-element';
import { EfsBase } from '../efs-base.js'

import '../components/fab-img.js'

class EfsNogame extends EfsBase {

    get selfStyles() {
        return css`
        .card {
            background-color: var(--shade-color);
            color:var(--success-color);
            border-radius: 2px;
            display: inline-block;
            margin: 1rem;
            position: relative;
            width: 300px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            transition: all 0.3s cubic-bezier(.25,.8,.25,1);
            padding:1em;
        }
        .card:hover {
            box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
        }`
    }

    static get properties() {
        return {
            user: Object,
            token: String
        }
    }

    joinGame(e){
        this.emit('join-game', this.shadowRoot.getElementById('token').value);
    }

    render() {
        return html`
            ${this.styles}
            <div class="flex-box f-horizontal h-100">
                <div class="flex-box f-vertical f-j-center">
                    <div class="card" ?hidden="${this.user.isAnonymous}">
                        <h4>New game</h4>
                        <p>
                            Create a new game, you'll have a token for your friends to join.
                        </p>   
                        <button class="btn btn-outline-secondary" @click="${e=>this.emit('create-game', e.details)}">
                            create
                        </button>
                    </div>
                    <div class="card" ?hidden="${this.user.isAnonymous}">
                        <h4>Join game</h4>
                        <p>
                            Enter the token given by the creator below.
                        </p>
                        <div class="flex-box f-horizontal">
                            <div class="efs-textfield mr-1">
                                <input type="text" id="token">
                            </div>
                            <button class="btn btn-outline-secondary" @click="${this.joinGame}">
                                join
                            </button>
                        </div>
                    </div>
                    <div class="card" ?hidden="${!this.user.isAnonymous}">
                        <h4>Welcome</h4>
                        <p>
                            To log in the game, please click on the black A
                        </p>
                    </div>
                </div>
                <div class="flex-box f-vertical">
                    <div class="card">
                        <h4>First version</h4>
                        <p>
                            This is a first version of this game.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('efs-nogame', EfsNogame); //