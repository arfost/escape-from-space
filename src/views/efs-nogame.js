import { html, css } from 'lit-element';
import Datavault from '../datavault.js';
import { EfsBase } from '../efs-base.js';

import '../components/fab-img.js'

class EfsNogame extends EfsBase {

    constructor() {
        super();
        this.newsRef = Datavault.refGetter.getNews();
        this.news = this.newsRef.getDefaultValue();
        this.newsRef.on("value", news => {
            this.news = news;
        })
    }

    get selfStyles() {
        return css``
    }

    static get properties() {
        return {
            user: Object,
            token: String,
            news: Array
        }
    }

    joinGame(e){
        this.emit('join-game', this.shadowRoot.getElementById('token').value);
    }

    displayNews(news){
        return html`<div class="card">
        <h4>${news.title}</h4>
        <p>
            ${news.body}
        </p>
    </div>`
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
                <div class="flex-box f-vertical f-j-start">
                    ${this.news.map(this.displayNews)}
                </div>
            </div>
        `;
    }
}

customElements.define('efs-nogame', EfsNogame); //