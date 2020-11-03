import { html, css, LitElement } from 'lit-element';
import Datavault from '../datavault.js'
import './fab-img.js'

export class UserProfil extends LitElement {

    //we need to init values in constructor
    constructor() {
        super();
        this.loginRef = Datavault.refGetter.getUser();
        //this.user = this.loginRef.getDefaultValue();
        this.open = false;
        this.editing = false;
        this.loginRef.on("value", user => {
            if(!user || user.isAnonymous){
                this.open = true;
            }else{
                this.open = false;
            }
            this.user = user;
        })
    }
    
    emit(type, params){
        let event = new CustomEvent(type, {
            detail: params
          });
          this.dispatchEvent(event);
    }

    toggleLogin() {
        this.loginRef.actions.toggleLogin().then(logged=>{
            this.emit('user-msg', 'Logged ' + (logged ? 'in' : 'out'));
        }).catch(err=>{
            this.emit('user-error', err.message);
        });
    }

    static get properties() {
        return {
            user: Object,
            open: Boolean,
            editing: Boolean
        }
    }

    get styles() {
        return html`
        <style>
            .base{
                position: fixed !important;
                left: 1em !important;
                top: 1em !important;
                display: flex !important;
            }
            .menu{
                top: -10px;
                background-color: var(--shade-color);
                color:var(--success-color);
                border-radius: 2px;
                margin: 1rem;
                position: relative;
                width: 300px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
                transition: all 0.3s cubic-bezier(.25,.8,.25,1);
                padding:1em;
            }
            .input-wrap > input {
                height: 32px;
            }
            .input-wrap > input, .input-wrap > textarea {
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                display: block;
                background-color: transparent;
                color: rgba(0, 0, 0, 0.87);
                border: none;
                border-bottom: 1px solid rgba(0, 0, 0, 0.26);
                outline: none;
                width: 100%;
                padding: 0;
                -webkit-box-shadow: none;
                box-shadow: none;
                border-radius: 0px;
                font-size: 16px;
                font-family: inherit;
                line-height: inherit;
                background-image: none;
            }
            .input-wrap > input {
                animation-duration: 0.0001s;
                animation-name: mui-textfield-inserted;
            }
            .input-wrap{
                margin:0.5em;
            }
        </style>`
    }

    updateMenu(){
        return html`
            <div ?hidden="${this.editing}">${this.user.displayName}</div>
            <div ?hidden="${!this.editing}" class="input-wrap"><input type="text" id="name" value="${this.user.displayName}"></div>
            <div><btn-loader ?hidden="${this.editing}" id="edit" @click="${e=>this.editing = true}">Edit profil</btn-loader><btn-loader ?hidden="${!this.editing}" id="saveEdit" @click="${this.updateUser}">save profil</btn-loader><btn-loader id="logout" @click="${this.toggleLogin}">logout</btn-loader></div>
        `
    }
    updateUser(e){
        this.loginRef.actions.updateInfos({
            name:this.shadowRoot.getElementById('name').value !== this.user.displayName ? this.shadowRoot.getElementById('name').value : undefined
        }).then(ret=>{
            this.emit('user-msg', 'updated');
            this.editing = false;
        }).catch(err=>{
            this.emit('user-error', err.message);
        });
    }

    render() {
        if(this.user){
            return html`
            ${this.styles}
            <div class="base">
                <fab-img @click="${e=>this.open = !this.open}" .src="${this.user.photoURL}"></fab-img>
                <div ?hidden="${!this.open}" class="menu">
                    ${!this.user.isAnonymous ? 
                    this.updateMenu() : 
                    html`<btn-loader id="login" @click="${this.toggleLogin}">Login with GMAIL</btn-loader>`}
                </div>
            </div>`
        }else{
            return html`${this.styles}<div class="menu base">Loading</div>`
        }
    }
}
customElements.define('user-profil', UserProfil); 