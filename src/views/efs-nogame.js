import { html, css } from 'lit-element';
import Datavault from '../datavault.js';
import { EfsBase } from '../efs-base.js';

import  '../components/btn-loader.js';
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
        if(this.shadowRoot.getElementById('token').value){
            this.shadowRoot.getElementById('join-game').textMode = false;
            Datavault.refGetter.getUser().actions.joinGame(this.shadowRoot.getElementById('token').value).then(ret=>{
                this.emit('toast-msg', 'Game joined');
                this.shadowRoot.getElementById('join-game').textMode = true;
            }).catch(err=>{
                this.emit('toast-msg', "An issue occured when joining, check the token, reload the page and try again.");
                this.shadowRoot.getElementById('join-game').textMode = true;
            });
        }else{
            this.emit('toast-msg', "Please enter a game token before joining");
        }
        
    }

    createGame() {
        this.shadowRoot.getElementById('create-game').textMode = false;
        Datavault.refGetter.getUser().actions.createGame().then(ret=>{
            this.emit('toast-msg', 'Game created');
            this.shadowRoot.getElementById('create-game').textMode = true;
        }).catch(err=>{
            this.emit('toast-msg', err.message);
            this.shadowRoot.getElementById('create-game').textMode = true;
        });
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
                        <btn-loader id="create-game" @click="${this.createGame}">
                            create
                        </btn-loader>
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
                            <btn-loader id="join-game" @click="${this.joinGame}">
                                join
                            </btn-loader>
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